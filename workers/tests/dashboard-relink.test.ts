import assert from "node:assert/strict";
import { test } from "node:test";

import { relinked } from "../../apps/dashboard/src/lib/youtube-link.ts";

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
