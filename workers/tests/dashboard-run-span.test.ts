import assert from "node:assert/strict";
import { test } from "node:test";

import { runEndMs } from "../../apps/dashboard/src/lib/run-span.ts";

const at = (iso: string) => new Date(iso);
const step = (agent: string, start: string, end: string | null) => ({ agent, startedAt: at(start), finishedAt: end ? at(end) : null });

test("a run ends at its last step's finish", () => {
  const steps = [step("planner", "2026-10-19T22:37:00Z", "2026-10-19T22:40:00Z"), step("render", "2026-10-19T22:41:00Z", "2026-10-19T22:55:00Z")];
  assert.equal(runEndMs(steps), at("2026-10-19T22:55:00Z").getTime());
});

test("marking a video uploaded days later does not stretch its run", () => {
  const steps = [step("planner", "2026-10-19T22:37:00Z", "2026-10-19T22:40:00Z"), step("manual_upload", "2026-10-21T13:40:00Z", "2026-10-21T13:40:00Z")];
  assert.equal(runEndMs(steps), at("2026-10-19T22:40:00Z").getTime());
});

test("a step without a finish counts from its start; only a manual upload gives a zero-length run", () => {
  assert.equal(runEndMs([step("render", "2026-10-19T22:41:00Z", null)]), at("2026-10-19T22:41:00Z").getTime());
  assert.equal(runEndMs([step("manual_upload", "2026-10-21T13:40:00Z", "2026-10-21T13:41:00Z")]), at("2026-10-21T13:40:00Z").getTime());
});

test("editing or removing a video from the dashboard does not stretch its run either", () => {
  const steps = [step("planner", "2026-10-19T22:37:00Z", "2026-10-19T22:40:00Z"),
    step("manual_edit", "2026-10-22T09:00:00Z", "2026-10-22T09:00:00Z"), step("manual_remove", "2026-10-23T09:00:00Z", null)];
  assert.equal(runEndMs(steps), at("2026-10-19T22:40:00Z").getTime());
});
