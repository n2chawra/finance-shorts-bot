import assert from "node:assert/strict";
import { test } from "node:test";

import { canMarkStale, skipToEnd, uploadNow } from "../../apps/dashboard/src/lib/queue-actions.ts";

test("skip to end puts the video after the last one", () => {
  assert.equal(skipToEnd(7).queuePosition, 8);
  assert.equal(skipToEnd(null).queuePosition, 1);   // the only queued video
  assert.equal(skipToEnd(undefined).queuePosition, 1);
});

test("skipping the owner's pick drops the pick, or the pick-first order keeps it at the front", () => {
  const d = skipToEnd(3);
  assert.equal(d.pickedAt, null);
  assert.equal(d.pickReason, null);
});

test("upload now leaves the queue and uses up the pick, as the publisher does", () => {
  assert.deepEqual(uploadNow(), { status: "scheduled", queuePosition: null, pickedAt: null, pickReason: null });
});

test("a video waiting to be published can be marked stale, a scheduled or published one can't", () => {
  for (const s of ["queued", "qa_passed", "rendered"]) assert.equal(canMarkStale(s), true, s);
  for (const s of ["scheduled", "published", "failed", "rejected"]) assert.equal(canMarkStale(s), false, s);
});
