import assert from "node:assert/strict";
import { test } from "node:test";

import { holdAt, hookHold } from "../lib/retention.ts";

const CURVE: [number, number][] = [[0.01, 1.0], [0.1, 0.6], [0.5, 0.4], [1.0, 0.2]];

test("hold at a moment interpolates the retention curve", () => {
  assert.equal(holdAt(CURVE, 100, 10), 0.6);        // 10 s of 100 s = 0.1
  assert.equal(holdAt(CURVE, 100, 30), 0.5);        // halfway from 0.1 to 0.5
  assert.equal(holdAt(CURVE, 100, 0.5), 1.0);       // before the first point
  assert.equal(holdAt(CURVE, 10, 60), 0.2);         // past the end
  assert.equal(holdAt([], 100, 3), null);
});

test("the hook moment is 3 s for a Short and 30 s for a long video", () => {
  assert.equal(hookHold(CURVE, 30, "short"), 0.6);  // 3 s of 30 s = 0.1
  assert.equal(hookHold(CURVE, 300, "long"), 0.6);  // 30 s of 300 s = 0.1
});
