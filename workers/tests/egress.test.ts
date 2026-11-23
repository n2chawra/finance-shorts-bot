import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { exportsNumbers } from "../ingest.ts";
import { trimDoc } from "../lib/agents-sync.ts";

test("the merge log and variant log go to the database trimmed; other docs whole", () => {
  const merges = Array.from({ length: 100 }, (_, i) => ({ n: i }));
  const out = trimDoc("mergeLog", { note: "x", merges }) as { note: string; merges: { n: number }[] };
  assert.equal(out.merges.length, 60);
  assert.equal(out.merges[0]!.n, 40);
  assert.equal(out.note, "x");
  assert.equal((trimDoc("armsLog", { entries: merges }) as { entries: unknown[] }).entries.length, 30);
  const feed = { topics: merges };
  assert.equal(trimDoc("topicFeed", feed), feed);
});

test("ingest re-exports the YouTube numbers on schedule, by hand and after Stats, not on pushes or releases", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "egress-"));
  const event = (name: string) => { const f = path.join(dir, `${name}.json`); writeFileSync(f, JSON.stringify({ workflow_run: { name } })); return f; };
  assert.equal(exportsNumbers({}), true);
  assert.equal(exportsNumbers({ GITHUB_EVENT_NAME: "schedule" }), true);
  assert.equal(exportsNumbers({ GITHUB_EVENT_NAME: "workflow_dispatch" }), true);
  assert.equal(exportsNumbers({ GITHUB_EVENT_NAME: "push" }), false);
  assert.equal(exportsNumbers({ GITHUB_EVENT_NAME: "workflow_run", GITHUB_EVENT_PATH: event("Stats") }), true);
  assert.equal(exportsNumbers({ GITHUB_EVENT_NAME: "workflow_run", GITHUB_EVENT_PATH: event("Release video") }), false);
});
