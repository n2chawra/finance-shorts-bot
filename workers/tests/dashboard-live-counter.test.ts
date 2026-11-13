import assert from "node:assert/strict";
import { test } from "node:test";

import { nextLiveCount, nextLiveViews } from "../../apps/dashboard/src/lib/live-counter.ts";

test("first refresh and increases take YouTube's number", () => {
  assert.equal(nextLiveCount(null, 12), 12);
  assert.equal(nextLiveCount(12, 40), 40);
  assert.equal(nextLiveCount(0, 0), 0);
});

test("nothing from YouTube (private or deleted) keeps the stored counter", () => {
  assert.equal(nextLiveCount(75, null), 75);
  assert.equal(nextLiveCount(null, null), null);
});

test("a small dip from a cached counter keeps the larger number", () => {
  assert.equal(nextLiveCount(75, 74), 75);
  assert.equal(nextLiveCount(75, 73), 75);
  assert.equal(nextLiveCount(1000, 980), 1000);
});

test("a real drop (YouTube removed invalid views) follows YouTube down", () => {
  // v-20261026-03, audit of 27 Oct: the dashboard kept 75 while YouTube showed 57
  assert.equal(nextLiveCount(75, 57), 57);
  assert.equal(nextLiveCount(1000, 979), 979);
  assert.equal(nextLiveCount(3, 0), 0);
});

test("views: one low reading is a YouTube cache wobble and is ignored, so the number never jumps down and back", () => {
  // stored 300, YouTube briefly says 280, then 301: the dashboard shows 300 then 301, never 280
  const a = nextLiveViews(300, null, 280);
  assert.deepEqual(a, { value: 300, pendingLow: 280 });
  assert.deepEqual(nextLiveViews(a.value, a.pendingLow, 301), { value: 301, pendingLow: null });
});

test("views: a real drop shows on two refreshes in a row and is followed", () => {
  const a = nextLiveViews(75, null, 57);
  assert.deepEqual(a, { value: 75, pendingLow: 57 });
  assert.deepEqual(nextLiveViews(a.value, a.pendingLow, 57), { value: 57, pendingLow: null });
});

test("views: small dips keep the larger number; rises and first readings are taken; no answer keeps everything", () => {
  assert.deepEqual(nextLiveViews(1000, null, 985), { value: 1000, pendingLow: null });
  assert.deepEqual(nextLiveViews(100, 60, 140), { value: 140, pendingLow: null });
  assert.deepEqual(nextLiveViews(null, null, 12), { value: 12, pendingLow: null });
  assert.deepEqual(nextLiveViews(75, 57, null), { value: 75, pendingLow: 57 });
});
