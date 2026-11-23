import assert from "node:assert/strict";
import { test } from "node:test";

import { formatOfId } from "../lib/manifest.ts";
import { snapshotUploadsWhere } from "../lib/snapshot-scope.ts";

type Row = { youtubeId: string | null; state: string; publishAt: Date; deletedAt: Date | null; channelId: string };

/** Evaluates the where clause the way Postgres would, for the fields it uses. */
function matches(where: ReturnType<typeof snapshotUploadsWhere>, r: Row): boolean {
  const video = where.video as { deletedAt: null; channelId: string };
  if (r.youtubeId === null || r.deletedAt !== video.deletedAt || r.channelId !== video.channelId) return false;
  return (where.OR ?? []).some((o) => {
    const at = (o.publishAt as { lte?: Date } | undefined)?.lte;
    return o.state === r.state && (!at || r.publishAt.getTime() <= at.getTime());
  });
}

const NOW = new Date("2026-11-21T13:40:00Z");
const base: Row = { youtubeId: "abc", state: "published", publishAt: new Date("2026-11-21T01:37:00Z"), deletedAt: null, channelId: "pp" };

test("published uploads are snapshotted, as before", () => {
  assert.equal(matches(snapshotUploadsWhere("pp", NOW), base), true);
});

test("a scheduled Short past its publish time is snapshotted before stats marks it published", () => {
  // 19:07 IST slot = 13:37 UTC; three minutes later the watchdog's snapshot already counts it
  assert.equal(matches(snapshotUploadsWhere("pp", NOW), { ...base, state: "scheduled", publishAt: new Date("2026-11-21T13:37:00Z") }), true);
});

test("a scheduled Short still waiting for its slot, another channel's, an unuploaded or a deleted one is not", () => {
  const w = snapshotUploadsWhere("pp", NOW);
  assert.equal(matches(w, { ...base, state: "scheduled", publishAt: new Date("2026-11-22T01:37:00Z") }), false);
  assert.equal(matches(w, { ...base, channelId: "geo" }), false);
  assert.equal(matches(w, { ...base, youtubeId: null }), false);
  assert.equal(matches(w, { ...base, deletedAt: new Date() }), false);
  assert.equal(matches(w, { ...base, state: "failed" }), false);
});

test("a failed manifest's format comes from its id (it has no format field)", () => {
  assert.equal(formatOfId("L-20261019-01"), "long");
  assert.equal(formatOfId("v-20261121-02"), "short");
});
