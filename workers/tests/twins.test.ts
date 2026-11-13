import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { GeminiUnavailable, generate, parseJson } from "../lib/gemini.ts";
import { type Candidate, type GapReport, type Sheet, TwinsConfig, brief, calibrate, cleanSheet, gapReport, measures, outlierScore, rankCandidates, searchFor, styleModel, truthOf } from "../lib/twins.ts";

const cfg = TwinsConfig.parse(JSON.parse(readFileSync(path.join(import.meta.dirname, "..", "..", "config", "twins.json"), "utf8")));

/** A fast winner: a figure in frame 0, a cut every 1.5 s, characters and text throughout. */
function winner(over: Partial<Sheet> = {}): unknown {
  const shots = Array.from({ length: 20 }, (_, i) => ({
    start: i * 1.5, end: (i + 1) * 1.5, picture: `shot ${i}`, kind: "character", characters: 1, camera: i % 2 ? "push in" : "static",
    transition: "cut", onScreenText: i < 10 ? "$300M" : "", figureOnScreen: i < 10, motion: 2,
  }));
  return {
    durationSec: 30, artStyle: "flat vector animation", language: "English", narrator: { kind: "AI voice", pace: "fast" },
    captions: { style: "word-by-word", position: "middle" }, music: { present: true, energy: "high" }, sfxPerMinute: 20,
    hook: { firstFrame: "MrBeast next to a pile of cash", firstLine: "MrBeast made 300 million dollars this year", question: false, subjectNamedAtSec: 0, figureShownAtSec: 0, figureSpokenAtSec: 1.2 },
    shots,
    lines: [
      { start: 0, end: 3, words: 9, job: "hook", gist: "names the figure" },
      { start: 3, end: 20, words: 50, job: "context", gist: "how" },
      { start: 20, end: 28, words: 25, job: "payoff", gist: "the surprise" },
    ],
    ending: { loops: true, cta: "", lastFrame: "cash pile" },
    whyItWorks: ["The figure is on screen in the first frame"],
    ...over,
  };
}

/** A slow one, like ours on a bad day: one picture every 6 s, the figure at 5 s. */
function slow(): unknown {
  const shots = Array.from({ length: 6 }, (_, i) => ({
    start: i * 6, end: (i + 1) * 6, picture: i === 0 ? "a drawn building labelled GYM" : `board ${i}`, kind: "object", characters: 0, camera: "static",
    transition: "cut", onScreenText: i ? "label" : "", figureOnScreen: i > 0, motion: 1,
  }));
  return { ...(winner() as object), shots, hook: { firstFrame: "a building", firstLine: "Your savings", question: true, subjectNamedAtSec: 6, figureShownAtSec: 5, figureSpokenAtSec: 5 }, ending: { loops: false, cta: "", lastFrame: "" } };
}

test("cleanSheet repairs times, order and unknown labels instead of failing", () => {
  const raw = winner() as { shots: Record<string, unknown>[]; durationSec: number };
  raw.shots.reverse();
  raw.shots[0] = { ...raw.shots[0], end: 99, camera: "dolly zoom", kind: "hologram" };
  const s = cleanSheet({ ...raw, durationSec: 0 });
  assert.equal(s.durationSec, 99);   // the longest end wins when the length is missing
  assert.equal(s.shots[0]!.start, 0);
  assert.equal(s.shots.at(-1)!.camera, "static");
  assert.equal(s.shots.at(-1)!.kind, "mixed");
});

test("measures are computed from the sheet", () => {
  const m = measures(cleanSheet(winner()));
  assert.equal(m.shots, 20);
  assert.equal(m.secPerShot, 1.5);
  assert.equal(m.cutsFirst3s, 1);
  assert.equal(m.firstFigureSec, 0);
  assert.equal(m.figureShare, 0.5);
  assert.equal(m.characterShare, 1);
  assert.equal(m.movingShare, 0.5);
  assert.equal(m.motion, 2);
  assert.equal(m.wordsPerMin, Math.round((84 / 28) * 60));
  assert.equal(m.payoffAt, 0.67);
  assert.equal(m.loops, true);
});

test("a topic's search phrase drops figures and keeps the words people type", () => {
  assert.equal(searchFor({ title: "How IPL teams make money before a ball is bowled" }), "How IPL teams make money before a ball is bowled");
  assert.equal(searchFor({ title: "Spotify paid out $11 billion last year. So why do artists say they get pennies?" }), "Spotify paid out last year");
  assert.equal(searchFor({ title: "anything", search: "how spotify pays artists" }), "how spotify pays artists");
});

test("candidates that beat their own channel come first; long, small and our own are dropped", () => {
  const c = (id: string, views: number, median: number | null, sec = 40, channelId = "x"): Candidate =>
    ({ youtubeId: id, title: id, channel: "c", channelId, views, durationSec: sec, publishedAt: "", channelMedian: median, outlier: outlierScore(views, median) });
  const ranked = rankCandidates([
    c("big-channel", 5_000_000, 4_000_000), c("outlier", 400_000, 10_000), c("long", 900_000, 1_000, 300),
    c("tiny", 20_000, 100), c("ours", 900_000, 1_000, 30, "mine"),
  ], cfg.search, new Set(["mine"]));
  assert.deepEqual(ranked.map((x) => x.youtubeId), ["outlier", "big-channel"]);
});

test("calibration checks Gemini against one of our real timelines", () => {
  const tl = JSON.parse(readFileSync(path.join(import.meta.dirname, "..", "..", "videos", "v-20261112-02", "timeline.json"), "utf8"));
  const t = truthOf(tl);
  assert.equal(t.beatStarts[0], 0);
  assert.match(t.firstLine, /Jeff Bezos takes \$81,840/);
  assert.equal(t.firstFigureSec, 0);
  const good = cleanSheet({
    ...(winner() as object), durationSec: t.durationSec,
    hook: { firstFrame: "Bezos", firstLine: "Jeff Bezos takes $81,840 a year from Amazon", question: false, subjectNamedAtSec: 0, figureShownAtSec: 0.3, figureSpokenAtSec: 1 },
    shots: t.beatStarts.map((s, i) => ({ start: s + 0.4, end: t.beatStarts[i + 1] ?? t.durationSec, picture: "x", kind: "object", characters: 0, camera: "static", transition: "cut", onScreenText: "", figureOnScreen: false, motion: 1 })),
  });
  assert.equal(calibrate(good, t, cfg.calibration).passed, true);
  const bad = cleanSheet({ ...(winner() as object), durationSec: t.durationSec + 9, hook: { ...(winner() as { hook: object }).hook, firstLine: "Elon Musk" } });
  const score = calibrate(bad, t, cfg.calibration);
  assert.equal(score.passed, false);
  assert.ok(score.why.some((w) => w.startsWith("length off")));
  assert.ok(score.why.some((w) => w.includes("first line")));
});

test("the gap report says what the winners do that we don't, and what we showed when viewers left", () => {
  const twins = [1, 2, 3].map((i) => ({ id: `t${i}`, sheet: cleanSheet(winner()) }));
  const r = gapReport("v-1", "yt1", cleanSheet(slow()), twins, [{ at: 6, drop: 0.24 }, { at: 20, drop: 0.05 }], new Date("2026-11-13T00:00:00Z"));
  const keys = r.gaps.map((g) => g.key);
  assert.ok(keys.includes("secPerShot"));
  assert.ok(keys.includes("firstFigureSec"));
  assert.ok(keys.includes("characterShare"));
  assert.equal(r.gaps.find((g) => g.key === "secPerShot")!.ours, "6 s");
  assert.equal(r.gaps.find((g) => g.key === "secPerShot")!.twins, "1.5 s");
  assert.equal(r.atDrops.length, 1);            // the 5% dip is not a drop
  assert.match(r.atDrops[0]!.ours, /board 1/);
  assert.match(r.summary, /24% at 6 s/);
});

test("the style model flags a gap only when most reports agree", () => {
  const now = new Date("2026-11-13T00:00:00Z");
  const twins = [1, 2, 3].map((i) => ({ id: `t${i}`, sheet: cleanSheet(winner()) }));
  const reports: GapReport[] = Array.from({ length: 9 }, (_, i) => gapReport(`v-${i}`, `y${i}`, cleanSheet(slow()), twins, [], now));
  const m = styleModel(reports, cfg.model, now);
  assert.ok(m.consistent.some((g) => g.key === "secPerShot" && g.direction === "less" && g.reports === 9));
  const few = styleModel(reports.slice(0, 3), cfg.model, now);
  assert.equal(few.consistent.length, 0);
  assert.ok(few.leaning.length > 0);
});

test("a brief for the writer carries the winners' pattern and hooks, not their words", () => {
  const b = brief("topic", "spotify artists", [{ id: "t1", sheet: cleanSheet(winner()) }], new Date());
  assert.equal(b.twins[0], "t1");
  assert.ok(b.pattern.some((p) => p.label === "seconds per picture" && p.value === "1.5 s"));
  assert.equal(b.hooks[0]!.firstFigureSec, 0);
  assert.match(b.note, /never the words/);
});

test("gemini falls through a busy model and one without free quota", async () => {
  const calls: string[] = [];
  const replies = [new Response("busy", { status: 503 }), new Response("no quota", { status: 429 }), Response.json({ candidates: [{ content: { parts: [{ text: '```json\n{"ok":1}\n```' }] } }], usageMetadata: { totalTokenCount: 42 } })];
  const r = await generate([{ text: "hi" }], {
    key: "k", models: ["a", "b", "c"], busyTries: 1, sleep: async () => {},
    fetchImpl: (async (url: string) => { calls.push(String(url)); return replies.shift()!; }) as typeof fetch,
  });
  assert.equal(r.model, "c");
  assert.equal(r.tokens, 42);
  assert.deepEqual(parseJson(r.text), { ok: 1 });
  assert.equal(calls.length, 3);
});

test("when every model is out of free quota, the night stops instead of paying", async () => {
  await assert.rejects(
    generate([{ text: "hi" }], { key: "k", models: ["a", "b"], sleep: async () => {}, fetchImpl: (async () => new Response("quota", { status: 429 })) as typeof fetch }),
    (e: unknown) => e instanceof GeminiUnavailable && e.quota,
  );
});
