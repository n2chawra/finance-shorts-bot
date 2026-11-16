import assert from "node:assert/strict";
import test from "node:test";

import { picksToClear } from "../../apps/dashboard/src/lib/queue-order.ts";

test("a pick dragged down the list is cleared, so the drag sticks", () => {
  assert.deepEqual(picksToClear([
    { id: "a", format: "short", picked: false },
    { id: "p", format: "short", picked: true },
    { id: "L", format: "long", picked: false },
  ]), ["p"]);
});

test("a pick still first of its format is kept; each format has its own first", () => {
  assert.deepEqual(picksToClear([
    { id: "L", format: "long", picked: true },
    { id: "p", format: "short", picked: true },
    { id: "a", format: "short", picked: false },
  ]), []);
  assert.deepEqual(picksToClear([]), []);
});
