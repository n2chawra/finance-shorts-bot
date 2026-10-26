import assert from "node:assert/strict";
import { test } from "node:test";

import { manualState, relinked } from "../../apps/dashboard/src/lib/youtube-link.ts";

test("no link asked: not a new link", () => {
  assert.equal(relinked("Y_qa18IDfm0", undefined), false);
  assert.equal(relinked(null, undefined), false);
});

test("the same link again: not a new link", () => {
  assert.equal(relinked("Y_qa18IDfm0", "Y_qa18IDfm0"), false);
  assert.equal(relinked(null, null), false);
  assert.equal(relinked(undefined, null), false);
});

test("a corrected link is a new link, so the old video's numbers are dropped", () => {
  // Mark as uploaded repeated with the right id (2026-10-26: it kept the wrong video's counters)
  assert.equal(relinked("Y_qa18IDfm0", "NxoAcDZWCh4"), true);
  assert.equal(relinked("Y_qa18IDfm0", null), true);
  assert.equal(relinked(null, "NxoAcDZWCh4"), true);
});

test("marked uploaded with a publish time ahead: scheduled until YouTube shows it public", () => {
  // v-20261026-01 (2026-10-27 audit): scheduled in Studio for 07:07 IST, counted as published the night before
  const now = new Date("2026-10-26T15:18:16Z");
  assert.equal(manualState("tlbbGrLxCaw", new Date("2026-10-27T01:37:00Z"), now), "scheduled");
});

test("marked uploaded with a past publish time, or with no link to check: published", () => {
  const now = new Date("2026-10-26T15:18:16Z");
  assert.equal(manualState("tlbbGrLxCaw", new Date("2026-10-26T13:37:00Z"), now), "published");
  assert.equal(manualState("tlbbGrLxCaw", now, now), "published");
  assert.equal(manualState(null, new Date("2026-10-27T01:37:00Z"), now), "published");
});
