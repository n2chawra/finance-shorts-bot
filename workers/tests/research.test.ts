import assert from "node:assert/strict";
import { test } from "node:test";

import { kindOf, score, summarise, DAY_MS, type ScanChannel, type ScanVideo } from "../lib/niche.ts";
import { familyTrends, firstSecond, recommendCounts, styleTargets, topComments } from "../lib/research.ts";
import { cleanSheet } from "../lib/sheets.ts";

const NOW = new Date("2026-11-17T00:00:00Z");
const v = (id: string, channelId: string, views: number, days: number, durationSec = 30): ScanVideo =>
  ({ id, channelId, title: id, publishedAt: new Date(NOW.getTime() - days * DAY_MS).toISOString(), durationSec, kind: kindOf(durationSec), views, likes: 0, comments: 0 });

const sheet = (o: { chars: number; subjectAt: number | null; figureAt: number | null; style?: string; kind?: string }) => cleanSheet({
  durationSec: 30, artStyle: o.style ?? "flat vector animation", language: "en",
  narrator: { kind: "AI voice", pace: "fast" }, captions: { style: "word-by-word", position: "middle" }, music: { present: true, energy: "medium" }, sfxPerMinute: 10,
  hook: { firstFrame: "a price tag", firstLine: "x", question: true, subjectNamedAtSec: o.subjectAt, figureShownAtSec: o.figureAt, figureSpokenAtSec: null },
  shots: [{ start: 0, end: 5, picture: "p", kind: o.kind ?? "character", characters: o.chars, camera: "push in", transition: "cut", onScreenText: "$5", figureOnScreen: true, motion: 2 },
    { start: 5, end: 30, picture: "q", kind: "object", characters: 0, camera: "static", transition: "cut", onScreenText: "", figureOnScreen: false, motion: 1 }],
  lines: [{ start: 0, end: 28, words: 80, job: "hook", gist: "g" }], ending: { loops: true, cta: null, lastFrame: "l" }, whyItWorks: [],
});

test("families carry direction, crowding and gaps", () => {
  const ch: ScanChannel[] = ["a", "b", "c", "d"].map((id) => ({ id, title: id, subs: 50_000, reference: false, foundBy: [] }));
  const vids = [
    // a rising family only one channel posts now: a gap
    ...Array.from({ length: 4 }, (_, i) => v(`hot${i}`, "a", 90_000, 10)), ...Array.from({ length: 4 }, (_, i) => v(`hotold${i}`, "a", 90_000, 120)),
    ...Array.from({ length: 10 }, (_, i) => v(`base${i}`, "a", 5_000, 50)),
    ...["b", "c", "d"].flatMap((c) => Array.from({ length: 4 }, (_, i) => v(`${c}x${i}`, c, 1_000, 20))),
  ];
  const labels = Object.fromEntries(vids.map((x) => [x.id, x.id.startsWith("hot") ? "hot topic" : "everyday"]));
  const rows = familyTrends(score(vids, ch, NOW), labels);
  const hot = rows.find((r) => r.family === "hot topic")!;
  assert.equal(hot.tier, "core");
  assert.equal(hot.crowding30, 1);
  assert.equal(hot.gap, true);
  assert.ok(hot.direction! > 1, `direction ${hot.direction}`);
});

test("style targets and the picture language come from the sheets; no cast when the hits show none", () => {
  const withCast = styleTargets([sheet({ chars: 1, subjectAt: 1, figureAt: 2 }), sheet({ chars: 2, subjectAt: 1, figureAt: 4 })]);
  assert.equal(withCast.cast, false);   // a character on screen only in the first shot (5 of 30 s: 17%)
  assert.equal(withCast.targets.secPerShot?.median, 15);
  assert.equal(withCast.targets.wordsPerMin?.median, 171);
  const photos = styleTargets([sheet({ chars: 0, subjectAt: 5, figureAt: null, style: "stock footage", kind: "footage" })]);
  assert.deepEqual(photos.notOurs.sort(), ["footage", "stock footage"]);
});

test("the first second: subject by 2 s, figure by 3 s, questions, loops", () => {
  const f = firstSecond([sheet({ chars: 0, subjectAt: 1, figureAt: 2 }), sheet({ chars: 0, subjectAt: 4, figureAt: null })]);
  assert.equal(f.subjectBy2s, 0.5);
  assert.equal(f.figureBy3s, 0.5);
  assert.equal(f.loops, 1);
});

test("video counts follow the niche, the loop and the quota", () => {
  const ch: ScanChannel[] = [{ id: "a", title: "a", subs: 5_000, reference: false, foundBy: [] }];
  // a channel posting about 2 a day with a hit
  const vids = [...Array.from({ length: 60 }, (_, i) => v(`s${i}`, "a", 1_000, i * 0.5 + 1)), v("hit", "a", 90_000, 3)];
  const scored = score(vids, ch, NOW);
  const shorts = summarise(scored, "short", NOW), long = summarise(scored, "long", NOW);
  const free = recommendCounts(shorts, long, 95);
  assert.equal(free.longPerWeek, 0);
  assert.ok(free.shortsPerDay >= 2, JSON.stringify(free));
  assert.ok(free.reasons.some((r) => r.includes("No long videos")));
  assert.equal(free.uploadsPerDay, free.shortsPerDay);
  const tight = recommendCounts(shorts, long, 1);
  assert.equal(tight.shortsPerDay, 1);
  assert.equal(tight.uploadsPerDay, 1);
  assert.ok(tight.reasons.some((r) => r.includes("Lowered")));
});

test("top comments: the most-liked first, trimmed", () => {
  assert.deepEqual(topComments({ a: [{ text: "do Costco next", likes: 50 }, { text: "meh", likes: 1 }], b: [{ text: "how  does\nIKEA make money", likes: 90 }] }, 2),
    ["how does IKEA make money", "do Costco next"]);
});
