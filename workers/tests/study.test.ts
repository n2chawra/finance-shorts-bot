import assert from "node:assert/strict";
import test from "node:test";

import { GeminiUnavailable, generate, parseJson } from "../lib/gemini.ts";
import { cleanSheet, gapReport, measures } from "../lib/sheets.ts";
import { studiedMarkdown, whatToApply } from "../study.ts";

/** A fast one: a figure in frame 0, a new picture every 1.5 s, a character throughout. */
function fast(): unknown {
  const shots = Array.from({ length: 20 }, (_, i) => ({
    start: i * 1.5, end: (i + 1) * 1.5, picture: `shot ${i}`, kind: "character", characters: 1, camera: i % 2 ? "push in" : "static",
    transition: "cut", onScreenText: i < 10 ? "$300M" : "", figureOnScreen: i < 10, motion: 2,
  }));
  return {
    durationSec: 30, artStyle: "flat vector animation", language: "English", narrator: { kind: "AI voice", pace: "fast" },
    captions: { style: "word-by-word", position: "middle" }, music: { present: true, energy: "high" }, sfxPerMinute: 20,
    hook: { firstFrame: "MrBeast next to a pile of cash", firstLine: "MrBeast made 300 million dollars", question: false, subjectNamedAtSec: 0, figureShownAtSec: 0, figureSpokenAtSec: 1.2 },
    shots,
    lines: [{ start: 0, end: 3, words: 9, job: "hook", gist: "names the figure" }, { start: 3, end: 20, words: 50, job: "context", gist: "how" }, { start: 20, end: 28, words: 25, job: "payoff", gist: "the surprise" }],
    ending: { loops: true, cta: "", lastFrame: "cash pile" },
    whyItWorks: ["The figure is on screen in the first frame", "Every sentence gets a new picture"],
  };
}

/** A slow one, like ours on a bad day: one picture every 6 s, no character, the figure at 5 s. */
function slow(): unknown {
  const shots = Array.from({ length: 5 }, (_, i) => ({
    start: i * 6, end: (i + 1) * 6, picture: `board ${i}`, kind: "object", characters: 0, camera: "static", transition: "cut", onScreenText: "label", figureOnScreen: i > 0, motion: 1,
  }));
  return { ...(fast() as object), shots, hook: { firstFrame: "a building", firstLine: "Your savings", question: true, subjectNamedAtSec: 6, figureShownAtSec: 5, figureSpokenAtSec: 5 } };
}

test("measures come from the sheet, not from the model", () => {
  const m = measures(cleanSheet(fast()));
  assert.equal(m.secPerShot, 1.5);
  assert.equal(m.firstFigureSec, 0);
  assert.equal(m.characterShare, 1);
  assert.equal(m.figureShare, 0.5);
});

test("a sheet with unknown labels or times out of order is repaired, not rejected", () => {
  const raw = fast() as { shots: Record<string, unknown>[] };
  raw.shots.reverse();
  raw.shots[0] = { ...raw.shots[0], camera: "dolly zoom", kind: "hologram" };
  const s = cleanSheet(raw);
  assert.equal(s.shots[0]!.start, 0);
  assert.equal(s.shots.at(-1)!.camera, "static");
});

test("a study sends its techniques and script differences to the writer, and its biggest look difference to the weekly loop", () => {
  const theirs = cleanSheet(fast());
  const gaps = gapReport("v-1", "ours", cleanSheet(slow()), [{ id: "theirs", sheet: theirs }], [], new Date()).gaps;
  const a = whatToApply({ id: "s1", title: "MrBeast's money", channel: "Money Doodles" }, theirs, gaps, { challengers: [], history: [] }, "2026-11-13");
  assert.deepEqual(a.writer.slice(0, 2), ["The figure is on screen in the first frame", "Every sentence gets a new picture"]);
  assert.ok(a.writer.some((w) => w.startsWith("Seconds until the first money figure: theirs 0 s, ours 5 s")));
  assert.equal(a.challenger?.id, "study-secPerShot");
  assert.equal(a.challenger?.kind, "look");
  assert.equal(a.challenger?.metric, "heldAfterHook");
  assert.match(a.challenger!.test, /1\.5 s as in "MrBeast's money" \(Money Doodles\), against our 6 s/);
});

test("the same look difference is never queued twice", () => {
  const theirs = cleanSheet(fast());
  const gaps = gapReport("v-1", "ours", cleanSheet(slow()), [{ id: "theirs", sheet: theirs }], [], new Date()).gaps;
  const a = whatToApply({ id: "s2", title: null, channel: null }, theirs, gaps, { challengers: [{ id: "study-secPerShot" }] }, "2026-11-13");
  assert.equal(a.challenger, null);
});

test("with nothing of ours to compare, only the techniques are applied", () => {
  const a = whatToApply({ id: "s3", title: "x", channel: null }, cleanSheet(fast()), [], {}, "2026-11-13");
  assert.equal(a.writer.length, 2);
  assert.equal(a.challenger, null);
});

test("the writer's file lists the newest studies first and tells it to never copy", () => {
  const md = studiedMarkdown([
    { writtenAt: "2026-11-10T00:00:00Z", title: "Old", channel: null, writer: ["old technique"] },
    { writtenAt: "2026-11-13T00:00:00Z", title: "New", channel: "Ch", writer: ["new technique"] },
    { writtenAt: "2026-11-12T00:00:00Z", title: "Empty", channel: null, writer: [] },
  ]);
  assert.ok(md.indexOf("New (Ch)") < md.indexOf("Old"));
  assert.ok(!md.includes("Empty"));
  assert.match(md, /never their words/);
});

test("gemini falls through a busy model and one without free quota", async () => {
  const replies = [new Response("busy", { status: 503 }), new Response("no quota", { status: 429 }), Response.json({ candidates: [{ content: { parts: [{ text: '```json\n{"ok":1}\n```' }] } }], usageMetadata: { totalTokenCount: 42 } })];
  const r = await generate([{ text: "hi" }], { key: "k", models: ["a", "b", "c"], busyTries: 1, sleep: async () => {}, fetchImpl: (async () => replies.shift()!) as typeof fetch });
  assert.equal(r.model, "c");
  assert.deepEqual(parseJson(r.text), { ok: 1 });
});

test("when every model is out of free quota it stops instead of paying", async () => {
  await assert.rejects(generate([{ text: "hi" }], { key: "k", models: ["a", "b"], sleep: async () => {}, fetchImpl: (async () => new Response("quota", { status: 429 })) as typeof fetch }),
    (e: unknown) => e instanceof GeminiUnavailable && e.quota);
});
