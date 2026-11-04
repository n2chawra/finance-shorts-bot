import assert from "node:assert/strict";
import { test } from "node:test";

// The agent-merge CI job installs only the workers' packages, so a dashboard file imported here must not
// pull in a package (2026-11-03: studio-calc → studio-schema → zod blocked the auditor's merge).
import { hourlyGains, latest, median, quickVerdict } from "../../apps/dashboard/src/lib/studio-calc.ts";

test("studio-calc works from the workers without dashboard packages", () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(quickVerdict(2, 1.2), "hit");
  const end = new Date("2026-11-04T10:00:00Z");
  const gains = hourlyGains([{ hour: new Date("2026-11-04T07:00:00Z"), views: 10 }, { hour: new Date("2026-11-04T09:00:00Z"), views: 30 }], end, 3);
  assert.deepEqual(gains, [10, 10, 0]);
});

test("latest takes the newest items whatever order the database returned them in", () => {
  const d = (day: number) => ({ id: `v${day}`, at: new Date(Date.UTC(2026, 10, day)) });
  const rows = [d(3), d(12), d(1), d(9), d(7)];
  assert.deepEqual(latest(rows, (r) => r.at, 3).map((r) => r.id), ["v12", "v9", "v7"]);
  assert.deepEqual(latest(rows, (r) => r.at, 10).length, 5);
  assert.deepEqual(latest([], (r: { at: Date }) => r.at, 3), []);
  assert.deepEqual(rows.map((r) => r.id), ["v3", "v12", "v1", "v9", "v7"]);   // the input is left as it was
});
