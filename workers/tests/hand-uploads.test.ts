import assert from "node:assert/strict";
import { test } from "node:test";

import { MISSED_AFTER_MINUTES, QUOTA_ERROR as DASH_QUOTA, missReason } from "../../apps/dashboard/src/lib/hand-uploads.ts";
import { QUOTA_ERROR, isQuotaMiss, quotaError } from "../lib/publishing.ts";

const now = new Date("2026-11-19T02:00:00Z");
const ago = (min: number) => new Date(now.getTime() - min * 60_000);

test("the publisher and the dashboard agree on the quota error's prefix", () => {
  assert.equal(QUOTA_ERROR, DASH_QUOTA);
  assert.ok(isQuotaMiss(quotaError(9_950)));
  assert.match(quotaError(9_950), /9,950 units/);
  assert.equal(isQuotaMiss("HTTP 500"), false);
  assert.equal(isQuotaMiss(null), false);
});

test("a quota miss is listed at once, even for a slot still ahead", () => {
  assert.equal(missReason({ state: "pending", error: quotaError(9_900), publishAt: new Date(now.getTime() + 3 * 3_600_000) }, now), "quota");
});

test("an Upload now click waits for the next run; a pending upload long past its time missed its slot", () => {
  assert.equal(missReason({ state: "pending", error: null, publishAt: ago(5) }, now), null);
  assert.equal(missReason({ state: "pending", error: "HTTP 503", publishAt: ago(MISSED_AFTER_MINUTES + 1) }, now), "missed");
});

test("uploaded, scheduled and failed uploads are never listed", () => {
  for (const state of ["scheduled", "uploaded", "published", "failed"]) assert.equal(missReason({ state, error: quotaError(1), publishAt: ago(120) }, now), null);
});
