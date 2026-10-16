import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { manifestPaths, readmeSummary, templateIds } from "../ingest.ts";
import { Manifest } from "../lib/manifest.ts";

test("every manifest in the repo parses", () => {
  for (const p of manifestPaths()) {
    const m = Manifest.parse(JSON.parse(readFileSync(p, "utf8")));
    assert.match(m.id, /^v-\d{8}-\d{2}$/);
    if (m.status === "qa_passed") {
      assert.equal(m.release.tag, `video-${m.id}`);
      assert.deepEqual(m.checks.map((c) => c.checker), ["number_check", "fact_review", "qa_review"]);
    }
  }
});

const SHIPPED = {
  id: "v-20261013-01", createdAt: "2026-10-13T10:00:00+00:00", status: "qa_passed", template: "quiz_countdown",
  topic: { title: "t", category: "sip" }, title: "A title", description: "d", hashtags: ["#Shorts"], hookStyle: "question",
  cta: "c", seed: 1, style: { palette: "night", genre: "pop", key: "C", bpm: 110 }, durationSec: 48,
  checks: [{ checker: "number_check", passed: true, notes: [] }, { checker: "fact_review", passed: true, notes: [] }, { checker: "qa_review", passed: true, notes: [] }],
  agentRuns: [], release: { tag: "video-v-20261013-01", asset: "video.mp4", uploaded: false },
};

test("a shipped manifest parses; a missing check, an unknown status or a bad id is rejected", () => {
  assert.equal(Manifest.parse(SHIPPED).status, "qa_passed");
  assert.throws(() => Manifest.parse({ ...SHIPPED, checks: SHIPPED.checks.slice(0, 2) }));
  assert.throws(() => Manifest.parse({ ...SHIPPED, status: "published" }));
  assert.throws(() => Manifest.parse({ ...SHIPPED, id: "../etc" }));
});

test("a failed manifest parses without release or checks", () => {
  const m = Manifest.parse({
    id: "v-20261013-09", createdAt: "2026-10-13T10:00:00+00:00", status: "failed", failReason: "QA rejected it twice.",
    template: "quiz_countdown", topic: { title: "t", category: "sip" }, title: "A title", agentRuns: [],
  });
  assert.equal(m.status, "failed");
});

test("templates are found and summarised from their READMEs", () => {
  assert.deepEqual(templateIds(), ["money_leak_meter", "money_news", "myth_vs_fact", "quiz_countdown", "two_friends_race"]);
  assert.equal(readmeSummary("# Title\n\nFirst para\nwraps here.\n\nSecond."), "First para wraps here.");
  assert.equal(readmeSummary("# Only a heading"), "");
});
