import assert from "node:assert/strict";
import { test } from "node:test";

import { windowStart } from "../../apps/dashboard/src/lib/totals.ts";

const daysFrom = (start: string, end: string) => (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000 + 1;

test("the Overview's 7 days are 7 calendar days, today included (they were 8: today-7 to today)", () => {
  assert.equal(windowStart("2026-10-29", 7), "2026-10-23");
  assert.equal(daysFrom(windowStart("2026-10-29", 7), "2026-10-29"), 7);
});

test("the window crosses month and year ends, and a 1-day window is today", () => {
  assert.equal(windowStart("2026-11-03", 7), "2026-10-28");
  assert.equal(windowStart("2027-01-02", 7), "2026-12-27");
  assert.equal(windowStart("2026-10-29", 1), "2026-10-29");
});
