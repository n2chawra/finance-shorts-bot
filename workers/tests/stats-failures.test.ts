import assert from "node:assert/strict";
import { test } from "node:test";

import { failKey, seriousFailure } from "../lib/stats-failures.ts";
import { report, transient } from "../lib/youtube.ts";

test("one passing failure is not serious; the same one twice, or many at once, is", () => {
  const k = failKey("v-20261023-02: analytics report failed (day): Internal error encountered.");
  assert.equal(k, "v-20261023-02");
  assert.equal(seriousFailure([k], [], 40), false);
  assert.equal(seriousFailure([k], [k], 40), true);
  assert.equal(seriousFailure(Array.from({ length: 9 }, (_, i) => `v${i}`), [], 40), true);
  assert.equal(seriousFailure([], ["x"], 40), false);
});

test("YouTube's passing errors are retried, others are not", () => {
  assert.equal(transient(500, "Internal error encountered."), true);
  assert.equal(transient(400, "Internal error encountered."), true);
  assert.equal(transient(429, "rate"), true);
  assert.equal(transient(400, "The query is not supported."), false);
});

test("report retries a passing error and then succeeds", async () => {
  let calls = 0;
  const real = globalThis.fetch;
  globalThis.fetch = (async () => {
    calls++;
    if (calls === 1) return new Response(JSON.stringify({ error: { message: "Internal error encountered." } }), { status: 500 });
    return new Response(JSON.stringify({ columnHeaders: [{ name: "views" }], rows: [[5]] }), { status: 200 });
  }) as typeof fetch;
  try {
    const rows = await report("t", { startDate: "a", endDate: "b", metrics: "views" }, [0, 0]);
    assert.deepEqual(rows, [{ views: 5 }]);
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = real;
  }
});
