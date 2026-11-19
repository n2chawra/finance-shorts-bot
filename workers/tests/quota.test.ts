import { test } from "node:test";
import assert from "node:assert/strict";
import type { PrismaClient } from "@prisma/client";
import { COST, QuotaKeeper, quotaDay } from "../lib/quota.ts";

/** A one-row Setting table, enough for QuotaKeeper.load and save. */
function fakePrisma(): { prisma: PrismaClient; row: () => unknown } {
  let value: unknown = undefined;
  const setting = {
    findUnique: async () => (value === undefined ? null : { key: "quotaUsage", value: structuredClone(value) }),
    upsert: async (a: { update: { value: unknown } }) => { value = structuredClone(a.update.value); },
  };
  return { prisma: { setting } as unknown as PrismaClient, row: () => value };
}

test("two workers saving the quota at once both count (no lost update)", async () => {
  const now = new Date("2026-11-19T16:00:00Z");
  const { prisma, row } = fakePrisma();
  // publish and the data audit load the same (empty) row, spend, then save one after the other
  const publish = await QuotaKeeper.load(prisma, 1, now);
  const audit = await QuotaKeeper.load(prisma, 0, now);
  assert.ok(publish.take("upload", COST.upload) && publish.take("thumbnail", COST.thumbnail));
  assert.ok(audit.take("stats", 3));
  await publish.save();
  await audit.save();
  const u = row() as { day: string; units: number; uploads: number; byKind: Record<string, number> };
  assert.equal(u.day, quotaDay(now));
  assert.equal(u.uploads, 1);
  assert.equal(u.units, COST.thumbnail + 3);
  assert.deepEqual(u.byKind, { upload: 1, thumbnail: COST.thumbnail, stats: 3 });
  // saving twice in one run (publish saves per channel) adds nothing the second time
  await publish.save();
  assert.equal((row() as { units: number }).units, COST.thumbnail + 3);
  // a later spend in the same run adds only the new part, on top of the audit's
  assert.ok(publish.take("stats", 2));
  await publish.save();
  assert.equal((row() as { units: number }).units, COST.thumbnail + 5);
  assert.equal(publish.used, COST.thumbnail + 5);
});

test("a run from yesterday's quota day never overwrites today's row", async () => {
  const { prisma, row } = fakePrisma();
  const old = await QuotaKeeper.load(prisma, 0, new Date("2026-11-19T07:00:00Z"));   // 18 Nov, Pacific
  const today = await QuotaKeeper.load(prisma, 0, new Date("2026-11-19T09:00:00Z"));   // 19 Nov
  assert.ok(today.take("stats", 4) && old.take("stats", 9));
  await today.save();
  await old.save();
  assert.deepEqual(row(), { day: "2026-11-19", units: 4, uploads: 0, searches: 0, byKind: { stats: 4 }, warned: false });
});
