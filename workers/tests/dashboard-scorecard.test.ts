import assert from "node:assert/strict";
import test from "node:test";

import {
  METRIC, bandOf, isQuestionTitle, relativeScore, secondLineLoss, summarize, verdict, type Curve, type ShortLike,
} from "../../apps/dashboard/src/lib/scorecard-logic.ts";

// a 30 s Short's curve: 100% at the start, 80% at 4 s, 60% at 7 s, 40% at the end
const curve: Curve = [[0, 1], [4 / 30, 0.8], [7 / 30, 0.6], [1, 0.4]];

test("the second-line loss is the share of starting viewers lost between 4 and 7 s", () => {
  assert.equal(secondLineLoss(curve, 30), 0.2);
  assert.equal(secondLineLoss([], 30), null);
  assert.equal(secondLineLoss(curve, 0), null);
  // a curve that rises (rewatches) never reports a negative loss
  assert.equal(secondLineLoss([[0, 1], [4 / 30, 0.7], [7 / 30, 0.9], [1, 0.5]], 30), 0);
});

test("bands follow each metric's direction", () => {
  assert.equal(bandOf(METRIC.stayed, 0.55), "good");
  assert.equal(bandOf(METRIC.stayed, 0.45), "close");
  assert.equal(bandOf(METRIC.stayed, 0.3), "off");
  assert.equal(bandOf(METRIC.lostAt5, 0.1), "good");      // lower is better
  assert.equal(bandOf(METRIC.lostAt5, 0.2), "close");
  assert.equal(bandOf(METRIC.lostAt5, 0.33), "off");
  assert.equal(bandOf(METRIC.endHold, null), null);
});

test("question titles are told from statements", () => {
  assert.ok(isQuestionTitle("How much does a gas station really make on the gas you buy?"));
  assert.ok(isQuestionTitle("Why billionaires never sell their stock 🤫"));
  assert.ok(!isQuestionTitle("Netflix spent $17.1B on new shows and still kept $11B"));
  assert.equal(relativeScore([[0.5, 0.4], [1, 0.6]]), 0.5);
  assert.equal(relativeScore([]), null);
});

test("summarize splits the last N days and before/after the reset, and names what to fix first", () => {
  const now = Date.parse("2026-11-20T12:00:00Z");
  const s = (id: string, publishAt: string, stayed: number | null, lostAt5: number | null, views: number): ShortLike => ({
    id, publishAt, views, views48: views, likes: 10, shares: 1, subs: 0, stayed, lostAt5, endHold: 0.6, relative: 0.6,
  });
  const shorts = [
    s("a", "2026-11-19T01:37:00Z", 0.55, 0.1, 3000),
    s("b", "2026-11-17T01:37:00Z", 0.5, 0.3, 900),
    s("c", "2026-11-12T01:37:00Z", 0.35, 0.3, 400),    // before the reset, outside 7 days
  ];
  const out = summarize(shorts, "2026-11-16", 7, now);
  assert.deepEqual(out.recent.map((x) => x.id), ["a", "b"]);
  assert.equal(out.after.n, 2);
  assert.equal(out.before.n, 1);
  assert.equal(out.now.medians.stayed, 0.525);
  assert.equal(out.pastCeiling, 1);
  assert.deepEqual(out.ladder.map((l) => l.n), [1, 0, 0]);
  assert.equal(out.bands.lostAt5, "close");              // the median of 0.1 and 0.3 is 0.2
  const v = verdict({ stayed: "good", lostAt5: "off", endHold: "good", relative: "good" });
  assert.equal(v.onTarget, 3);
  assert.match(v.line, /^Fix first: lost on the second line/);
  assert.equal(verdict({}).measured, 0);
});
