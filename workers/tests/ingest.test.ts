import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { manifestPaths, queueSlot, readmeSummary, templateIds } from "../ingest.ts";
import { Manifest, VIDEO_ID, type ShippedManifest } from "../lib/manifest.ts";

test("every manifest in the repo parses", () => {
  for (const p of manifestPaths()) {
    const m = Manifest.parse(JSON.parse(readFileSync(p, "utf8")));
    assert.match(m.id, VIDEO_ID);
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
  assert.deepEqual(templateIds(), ["long_story", "short_story"]);
  assert.equal(readmeSummary("# Title\n\nFirst para\nwraps here.\n\nSecond."), "First para wraps here.");
  assert.equal(readmeSummary("# Only a heading"), "");
});

test("long-form ids and urgent priorities parse", () => {
  assert.equal(Manifest.parse({ ...SHIPPED, id: "L-20261017-01", format: "long" }).id, "L-20261017-01");
  const m = Manifest.parse({ ...SHIPPED, priority: { level: "trending", until: "2026-10-19" } });
  assert.equal(m.status === "qa_passed" && m.priority?.level, "trending");
  assert.throws(() => Manifest.parse({ ...SHIPPED, priority: { level: "urgent", until: "2026-10-19" } }));
  assert.throws(() => Manifest.parse({ ...SHIPPED, id: "x-20261017-01" }));
});

/** A stand-in for the transaction: only the two aggregates queueSlot asks for. */
function fakeTx(min: number | null, max: number | null) {
  return { video: { aggregate: async (q: { _min?: unknown }) => (q._min ? { _min: { queuePosition: min } } : { _max: { queuePosition: max } }) } } as never;
}

test("a trending video jumps to the front of the queue until its trend expires", async () => {
  const base = Manifest.parse(SHIPPED) as ShippedManifest;
  const now = new Date("2026-10-17T06:00:00Z");                    // 11:30 IST on the 17th
  assert.equal(await queueSlot(fakeTx(3, 9), base, now), 10);           // ordinary: at the back
  const hot = { ...base, priority: { level: "trending" as const, until: "2026-10-18" } };
  assert.equal(await queueSlot(fakeTx(3, 9), hot, now), 2);             // in front of position 3
  assert.equal(await queueSlot(fakeTx(null, null), hot, now), 0);       // empty queue
  const stale = { ...hot, priority: { level: "trending" as const, until: "2026-10-16" } };
  assert.equal(await queueSlot(fakeTx(3, 9), stale, now), 10);          // expired: back of the queue
});
