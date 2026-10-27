import assert from "node:assert/strict";
import { test } from "node:test";

import { nextLiveCount } from "../../apps/dashboard/src/lib/live-counter.ts";

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
