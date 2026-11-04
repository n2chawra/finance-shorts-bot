import assert from "node:assert/strict";
import { test } from "node:test";

import { weekOverWeek } from "../../apps/dashboard/src/lib/totals.ts";

const days = (subs: number[], estimatedTail = 0) =>
  subs.map((s, i) => ({ views: 100, likes: 1, subsGained: s, estimated: i >= subs.length - estimatedTail }));

test("flat subscribers read flat although Analytics hasn't reached the last two days", () => {
  // 16 days of 5 subscribers a day; YouTube Analytics is two days behind, so the last two are 0 and estimated
  const daily = days([...Array(14).fill(5), 0, 0], 2);
  const w = weekOverWeek(daily, "subsGained");
  assert.equal(w.delta, 0);
  assert.equal(w.spark.length, 14);
  assert.ok(w.spark.every((x) => x === 5));
});

test("views keep the estimated days: the live counters filled them", () => {
  const daily = days(Array(14).fill(5), 2);
  assert.equal(weekOverWeek(daily, "views").delta, 0);
  assert.equal(weekOverWeek(daily, "views").spark.length, 14);
});

test("no week before: no change", () => {
  assert.equal(weekOverWeek(days([1, 2, 3]), "subsGained").delta, null);
  assert.deepEqual(weekOverWeek([], "views"), { spark: [], delta: null });
});
