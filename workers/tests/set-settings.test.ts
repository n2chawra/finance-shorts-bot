import assert from "node:assert/strict";
import { test } from "node:test";

import { applyPatch } from "../set-settings.ts";

const STORED = { uploadTimes: ["12:37", "19:07"], agents: { paused: false, research: true, improver: true, dashboard: true, maxActiveExperiments: 3 } };

test("patches only the given keys, merging objects one level deep", () => {
  const { next, changed } = applyPatch(STORED, { uploadTimes: ["05:37", "12:37", "19:07", "23:37"], agents: { maxActiveExperiments: 5 } });
  assert.deepEqual(next.uploadTimes, ["05:37", "12:37", "19:07", "23:37"]);
  assert.equal(next.agents.maxActiveExperiments, 5);
  assert.equal(next.agents.research, true);
  assert.deepEqual(changed, ["uploadTimes", "agents"]);
});

test("rejects unknown keys and invalid values", () => {
  assert.throws(() => applyPatch(STORED, { nope: 1 } as never), /unknown setting/);
  assert.throws(() => applyPatch(STORED, { uploadTimes: ["25:00"] }));
  assert.throws(() => applyPatch(STORED, { uploadTimes: ["01:00", "02:00", "03:00", "04:00", "05:00"] }));
});
