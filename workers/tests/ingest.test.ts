import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { manifestPaths, readmeSummary, templateIds } from "../ingest.ts";
import { Manifest } from "../lib/manifest.ts";

test("every manifest in the repo parses", () => {
  const paths = manifestPaths();
  assert.ok(paths.length >= 4);
  for (const p of paths) {
    const m = Manifest.parse(JSON.parse(readFileSync(p, "utf8")));
    assert.match(m.id, /^v-\d{8}-\d{2}$/);
    if (m.status === "qa_passed") {
      assert.equal(m.release.tag, `video-${m.id}`);
      assert.deepEqual(m.checks.map((c) => c.checker), ["number_check", "fact_review", "qa_review"]);
    }
  }
});

test("a manifest with a missing check or a typed status is rejected", () => {
  const good = JSON.parse(readFileSync(manifestPaths()[0]!, "utf8"));
  assert.throws(() => Manifest.parse({ ...good, checks: good.checks.slice(0, 2) }));
  assert.throws(() => Manifest.parse({ ...good, status: "published" }));
  assert.throws(() => Manifest.parse({ ...good, id: "../etc" }));
});

test("a failed manifest parses without release or checks", () => {
  const m = Manifest.parse({
    id: "v-20261013-09", createdAt: "2026-10-13T10:00:00+00:00", status: "failed", failReason: "QA rejected it twice.",
    template: "quiz_countdown", topic: { title: "t", category: "sip" }, title: "A title", agentRuns: [],
  });
  assert.equal(m.status, "failed");
});

test("templates are found and summarised from their READMEs", () => {
  assert.deepEqual(templateIds(), ["money_leak_meter", "myth_vs_fact", "quiz_countdown", "two_friends_race"]);
  assert.equal(readmeSummary("# Title\n\nFirst para\nwraps here.\n\nSecond."), "First para wraps here.");
  assert.equal(readmeSummary("# Only a heading"), "");
});
