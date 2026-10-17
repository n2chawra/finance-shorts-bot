import assert from "node:assert/strict";
import { test } from "node:test";

import type { PrismaClient } from "@prisma/client";

import { notify } from "../lib/notify.ts";

type Row = { dedupeKey: string; resolvedAt: Date | null; decidedAt: Date | null; [k: string]: unknown };

/** Just enough of prisma.notification for notify(). */
function fake(rows: Row[]) {
  const writes: string[] = [];
  const notification = {
    findUnique: async ({ where }: { where: { dedupeKey: string } }) => rows.find((r) => r.dedupeKey === where.dedupeKey) ?? null,
    create: async ({ data }: { data: { dedupeKey: string } & Record<string, unknown> }) => { writes.push(`create ${data.dedupeKey}`); rows.push({ ...data, resolvedAt: null, decidedAt: null }); },
    update: async ({ where, data }: { where: { dedupeKey: string }; data: Partial<Row> }) => {
      writes.push(`update ${where.dedupeKey}`);
      Object.assign(rows.find((r) => r.dedupeKey === where.dedupeKey)!, data);
    },
  };
  return { prisma: { notification } as unknown as PrismaClient, writes, rows };
}

const notice = { key: "agent:monthly:2026-11-long-length", source: "monthly", severity: "info" as const, title: "t", detail: "d", fix: "f",
  proposal: { setting: "longLengthMinSec", value: 480, current: 180 } };

test("a proposal is stored with its notification", async () => {
  const f = fake([]);
  await notify(f.prisma, notice);
  assert.deepEqual(f.rows[0]!.proposal, notice.proposal);
});

test("a decided proposal is never raised again, a merely resolved one is", async () => {
  const decided = fake([{ dedupeKey: notice.key, resolvedAt: new Date(), decidedAt: new Date() }]);
  await notify(decided.prisma, notice);
  assert.deepEqual(decided.writes, []);
  const resolved = fake([{ dedupeKey: notice.key, resolvedAt: new Date(), decidedAt: null }]);
  await notify(resolved.prisma, notice);
  assert.equal(resolved.rows[0]!.resolvedAt, null);
});
