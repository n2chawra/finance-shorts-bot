/**
 * Twins: the most-watched animated Shorts on the same topic as ours, watched by Gemini, measured in
 * code and compared with ours (owner, 2026-11-13: "understand what type of animation and script
 * people like, without my intervention"). Pure functions only; the I/O lives in workers/twins.ts.
 *
 * A shot sheet is what a viewer sees and hears, second by second, written down as structure: no
 * transcript, no frames, quotes under 15 words. Every number we judge by (seconds per shot, when
 * the figure lands, words a minute…) is computed here from the sheet, never typed by a model.
 */
import { z } from "zod";

// ---------------- settings ----------------

export const TwinsConfig = z.object({
  note: z.string().optional(),
  models: z.array(z.string()).min(1),
  fps: z.number().positive().default(1),
  search: z.object({
    maxResults: z.number().int().default(25),
    maxSec: z.number().default(75),
    minViews: z.number().default(50_000),
    years: z.number().default(3),
    relevanceLanguage: z.string().default("en"),
    regionCode: z.string().default("US"),
  }),
  perTopic: z.number().int().default(3),
  stillsFor: z.number().int().default(8),
  nightly: z.object({ topics: z.number().int().default(4), ours: z.number().int().default(3), decodes: z.number().int().default(16) }),
  calibration: z.object({
    videos: z.number().int().default(5),
    beatRecall: z.number().default(0.75), toleranceSec: z.number().default(1),
    durationErrSec: z.number().default(2), firstLineOverlap: z.number().default(0.7), figureErrSec: z.number().default(1.5),
  }),
  model: z.object({ windowDays: z.number().default(30), minReports: z.number().int().default(8), agree: z.number().default(0.75) }),
});
export type TwinsConfig = z.infer<typeof TwinsConfig>;

// ---------------- the shot sheet ----------------

export const ART_STYLES = ["flat vector animation", "hand-drawn doodle", "3D animation", "kinetic text / motion graphics", "stick figures", "cut-out photos", "live action", "talking head", "stock footage", "mixed"] as const;
export const SHOT_KINDS = ["character", "object", "chart", "text card", "photo", "footage", "map", "person on camera", "mixed"] as const;
export const CAMERAS = ["static", "push in", "pull out", "pan", "zoom punch", "shake", "follow"] as const;
export const TRANSITIONS = ["cut", "whip", "zoom", "morph", "wipe", "fade", "match cut", "none"] as const;
export const JOBS = ["hook", "promise", "context", "stakes", "reveal", "turn", "payoff", "loop", "cta", "other"] as const;
const ANIMATED = new Set<string>(["flat vector animation", "hand-drawn doodle", "3D animation", "kinetic text / motion graphics", "stick figures", "cut-out photos", "mixed"]);

const sec = z.coerce.number().min(0);
export const Shot = z.object({
  start: sec, end: sec,
  picture: z.string().max(240),
  kind: z.enum(SHOT_KINDS).catch("mixed"),
  characters: z.coerce.number().int().min(0).catch(0),
  camera: z.enum(CAMERAS).catch("static"),
  transition: z.enum(TRANSITIONS).catch("cut"),
  onScreenText: z.string().max(120).nullish(),
  figureOnScreen: z.boolean().catch(false),
  motion: z.coerce.number().int().min(0).max(3).catch(1),
});
export const Line = z.object({ start: sec, end: sec, words: z.coerce.number().int().min(0), job: z.enum(JOBS).catch("other"), gist: z.string().max(160) });
export const Sheet = z.object({
  durationSec: sec,
  artStyle: z.enum(ART_STYLES).catch("mixed"),
  language: z.string().max(40).catch("unknown"),
  narrator: z.object({ kind: z.enum(["AI voice", "human voice", "none"]).catch("human voice"), pace: z.enum(["slow", "normal", "fast"]).catch("normal") }),
  captions: z.object({ style: z.enum(["word-by-word", "phrase", "sentence", "none"]).catch("none"), position: z.enum(["top", "middle", "bottom", "none"]).catch("none") }),
  music: z.object({ present: z.boolean().catch(false), energy: z.enum(["low", "medium", "high"]).catch("medium") }),
  sfxPerMinute: z.coerce.number().min(0).catch(0),
  hook: z.object({
    firstFrame: z.string().max(240),
    firstLine: z.string().max(140),
    question: z.boolean().catch(false),
    subjectNamedAtSec: sec.nullable().catch(null),
    figureShownAtSec: sec.nullable().catch(null),
    figureSpokenAtSec: sec.nullable().catch(null),
  }),
  shots: z.array(Shot).min(1),
  lines: z.array(Line).default([]),
  ending: z.object({ loops: z.boolean().catch(false), cta: z.string().max(120).nullish(), lastFrame: z.string().max(200).catch("") }),
  whyItWorks: z.array(z.string().max(200)).max(4).default([]),
});
export type Sheet = z.infer<typeof Sheet>;

/** Gemini's JSON schema for the sheet (an OpenAPI subset), so the answer always parses. */
const S = (type: string, extra: Record<string, unknown> = {}) => ({ type, ...extra });
const obj = (properties: Record<string, unknown>, required = Object.keys(properties)) => S("OBJECT", { properties, required });
const num = (description?: string, nullable = false) => S("NUMBER", { ...(description ? { description } : {}), ...(nullable ? { nullable: true } : {}) });
const str = (description?: string) => S("STRING", description ? { description } : {});
const en = (values: readonly string[]) => S("STRING", { enum: [...values] });
export const SHEET_SCHEMA = obj({
  durationSec: num(),
  artStyle: en(ART_STYLES),
  language: str(),
  narrator: obj({ kind: en(["AI voice", "human voice", "none"]), pace: en(["slow", "normal", "fast"]) }),
  captions: obj({ style: en(["word-by-word", "phrase", "sentence", "none"]), position: en(["top", "middle", "bottom", "none"]) }),
  music: obj({ present: S("BOOLEAN"), energy: en(["low", "medium", "high"]) }),
  sfxPerMinute: num(),
  hook: obj({
    firstFrame: str("what is on screen at 0:00, concretely"),
    firstLine: str("the first spoken sentence, at most 15 words"),
    question: S("BOOLEAN"),
    subjectNamedAtSec: num("second the person or business the video is about is first named or shown", true),
    figureShownAtSec: num("second the first money figure appears on screen", true),
    figureSpokenAtSec: num("second the first money figure is spoken", true),
  }),
  shots: S("ARRAY", { items: obj({
    start: num(), end: num(), picture: str("what is on screen, at most 20 words"), kind: en(SHOT_KINDS),
    characters: S("INTEGER"), camera: en(CAMERAS), transition: en(TRANSITIONS),
    onScreenText: str("text on screen, at most 8 words, empty if none"), figureOnScreen: S("BOOLEAN"),
    motion: S("INTEGER", { description: "0 still, 1 small moves, 2 clear motion, 3 constant big motion" }),
  }) }),
  lines: S("ARRAY", { items: obj({ start: num(), end: num(), words: S("INTEGER"), job: en(JOBS), gist: str("what this sentence does, at most 12 words, in your own words") }) }),
  ending: obj({ loops: S("BOOLEAN"), cta: str(), lastFrame: str() }),
  whyItWorks: S("ARRAY", { items: str("a technique, at most 25 words") }),
});

export const SHEET_PROMPT = `You are a video editor studying how a YouTube Short is made. Watch the whole video, picture and sound.
Return the shot sheet as JSON.

- shots: every shot in order. A new shot starts at every cut, scene change, or big camera move. Times in seconds from the start (decimals allowed). Shots cover the whole video without gaps.
- lines: every spoken sentence in order, with its job in the story and a gist in your own words. Never copy the script.
- hook: what the first frame shows and the first spoken sentence (at most 15 words), and the second the subject is first named, the first money figure first appears on screen, and is first spoken (null if never).
- artStyle: the main look. captions: how spoken words appear as text. music and sfxPerMinute: an estimate.
- ending: whether the last moment leads back into the first (a loop), any call to action, and the last frame.
- whyItWorks: up to 4 techniques a creator could learn from (pace, camera, how numbers appear, story order), not the topic.
Be concrete and literal about what is on screen. Use null when unsure of a time.`;

export const STILLS_PROMPT = (ids: string[]) => `Each group of images below is 4 frames from one YouTube Short, in this order: ${ids.join(", ")}.
For each video say whether it is ANIMATED (cartoon, illustration, motion graphics, 3D, doodle, kinetic text; a few photos inside an animation still count) or NOT (a person talking to camera, live footage, a movie or game clip, screen recording, slideshow of photos).
Return JSON: [{"id": "...", "animated": true|false, "style": "a few words"}], one entry per video.`;
export const STILLS_SCHEMA = S("ARRAY", { items: obj({ id: str(), animated: S("BOOLEAN"), style: str() }) });
export const StillsAnswer = z.array(z.object({ id: z.string(), animated: z.boolean(), style: z.string().catch("") }));

/** Repairs a parsed sheet: times inside the video, shots in order, ends after starts. */
export function cleanSheet(raw: unknown): Sheet {
  const s = Sheet.parse(raw);
  const dur = Math.max(s.durationSec, ...s.shots.map((x) => x.end), ...s.lines.map((x) => x.end), 1);
  const fix = <T extends { start: number; end: number }>(xs: T[]) =>
    xs.map((x) => ({ ...x, start: Math.min(x.start, dur), end: Math.min(Math.max(x.end, x.start), dur) })).sort((a, b) => a.start - b.start);
  return { ...s, durationSec: dur, shots: fix(s.shots), lines: fix(s.lines) };
}

export const isAnimated = (s: Pick<Sheet, "artStyle">) => ANIMATED.has(s.artStyle);

// ---------------- measures ----------------

export type Measures = {
  durationSec: number;
  shots: number;
  secPerShot: number;            // average seconds a picture stays
  cutsFirst3s: number;           // shots that start in the first 3 seconds (after 0)
  firstFigureSec: number | null; // the first money figure, shown or spoken, whichever is first
  subjectNamedSec: number | null;
  figureShare: number;           // share of the video with a money figure on screen
  characterShare: number;        // share with at least one character on screen
  textShare: number;             // share with text on screen
  movingShare: number;           // share of shots with a camera move
  motion: number;                // time-weighted motion 0–3
  wordsPerMin: number | null;
  payoffAt: number | null;       // where the first payoff/reveal line starts, as a share of the video
  hookQuestion: boolean;
  loops: boolean;
  captions: string;
  artStyle: string;
};

const round = (x: number, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
const share = (s: Sheet, pick: (x: Sheet["shots"][number]) => boolean) =>
  round(s.shots.filter(pick).reduce((a, x) => a + (x.end - x.start), 0) / s.durationSec);

export function measures(s: Sheet): Measures {
  const first = (...xs: (number | null)[]) => { const ok = xs.filter((x): x is number => x != null); return ok.length ? round(Math.min(...ok), 1) : null; };
  const speech = s.lines.length ? Math.max(1, s.lines[s.lines.length - 1]!.end - s.lines[0]!.start) : 0;
  const words = s.lines.reduce((a, l) => a + l.words, 0);
  const payoff = s.lines.find((l) => l.job === "payoff" || l.job === "reveal");
  const weighted = s.shots.reduce((a, x) => a + x.motion * (x.end - x.start), 0) / s.durationSec;
  return {
    durationSec: round(s.durationSec, 1),
    shots: s.shots.length,
    secPerShot: round(s.durationSec / s.shots.length, 2),
    cutsFirst3s: s.shots.filter((x) => x.start > 0.05 && x.start < 3).length,
    firstFigureSec: first(s.hook.figureShownAtSec, s.hook.figureSpokenAtSec),
    subjectNamedSec: s.hook.subjectNamedAtSec == null ? null : round(s.hook.subjectNamedAtSec, 1),
    figureShare: share(s, (x) => x.figureOnScreen),
    characterShare: share(s, (x) => x.characters > 0),
    textShare: share(s, (x) => !!x.onScreenText?.trim()),
    movingShare: round(s.shots.filter((x) => x.camera !== "static").length / s.shots.length),
    motion: round(weighted, 2),
    wordsPerMin: speech && words ? Math.round((words / speech) * 60) : null,
    payoffAt: payoff ? round(payoff.start / s.durationSec) : null,
    hookQuestion: s.hook.question,
    loops: s.ending.loops,
    captions: s.captions.style,
    artStyle: s.artStyle,
  };
}

/** The measures we compare, how to say them, and which direction a twin "leads" (for the gap text). */
export const COMPARED: { key: keyof Measures; label: string; unit: "s" | "%" | "" | "wpm"; minGap: number }[] = [
  { key: "secPerShot", label: "seconds per picture", unit: "s", minGap: 0.6 },
  { key: "cutsFirst3s", label: "picture changes in the first 3 s", unit: "", minGap: 1 },
  { key: "firstFigureSec", label: "seconds until the first money figure", unit: "s", minGap: 1 },
  { key: "subjectNamedSec", label: "seconds until the subject is named", unit: "s", minGap: 1 },
  { key: "figureShare", label: "time with a figure on screen", unit: "%", minGap: 0.15 },
  { key: "characterShare", label: "time with a character on screen", unit: "%", minGap: 0.2 },
  { key: "textShare", label: "time with text on screen", unit: "%", minGap: 0.2 },
  { key: "movingShare", label: "shots with a camera move", unit: "%", minGap: 0.2 },
  { key: "motion", label: "motion (0 still – 3 constant)", unit: "", minGap: 0.5 },
  { key: "wordsPerMin", label: "spoken words a minute", unit: "wpm", minGap: 20 },
  { key: "payoffAt", label: "where the payoff lands", unit: "%", minGap: 0.15 },
  { key: "durationSec", label: "length", unit: "s", minGap: 6 },
];

export const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b), m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
};

export const fmtMeasure = (v: number | null, unit: string) =>
  v == null ? "never" : unit === "%" ? `${Math.round(v * 100)}%` : unit === "s" ? `${round(v, 1)} s` : unit === "wpm" ? `${Math.round(v)}` : `${round(v, 1)}`;

// ---------------- finding twins ----------------

export type Candidate = {
  youtubeId: string; title: string; channel: string; channelId: string | null; views: number; durationSec: number;
  publishedAt: string; channelMedian: number | null; outlier: number | null;
};

/** How much a video beat its own channel: views ÷ the channel's median recent views (capped, so one huge hit can't dominate). */
export function outlierScore(views: number, channelMedian: number | null): number | null {
  if (!channelMedian || channelMedian <= 0) return null;
  return round(Math.min(views / channelMedian, 100), 1);
}

/** Order candidates: beat-their-channel first, then reach. Unknown channel medians count as 1×. */
export function rankCandidates(cs: Candidate[], cfg: Pick<TwinsConfig["search"], "maxSec" | "minViews">, exclude: Set<string> = new Set()): Candidate[] {
  return cs
    .filter((c) => c.durationSec > 0 && c.durationSec <= cfg.maxSec && c.views >= cfg.minViews && !exclude.has(c.youtubeId) && !(c.channelId && exclude.has(c.channelId)))
    .map((c) => ({ c, score: Math.min(c.outlier ?? 1, 20) * Math.log10(c.views) }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.c);
}

/** A search phrase for a topic: its own `search` when research wrote one, else the title's first clause without figures. */
export function searchFor(topic: { search?: string | null; title: string }): string {
  if (topic.search?.trim()) return topic.search.trim();
  const clause = topic.title.split(/[.:;?!—–]|,\s/)[0] ?? topic.title;
  return clause.replace(/[$₹£€]?\d[\d,.]*\s*(%|million|billion|trillion|crore|lakh|bn|k|m|b)?\b/gi, " ")
    .replace(/[^\p{L}\p{N}' -]/gu, " ").replace(/\s+/g, " ").trim().split(" ").slice(0, 10).join(" ");
}

// ---------------- calibration (our own Shorts, where the truth is known) ----------------

/** `firstFigure` is the scene where the first money figure or percentage appears: [start, end) in seconds.
 * Our timeline knows when each scene starts, not the moment a figure pops in inside it. */
export type Truth = { durationSec: number; beatStarts: number[]; firstLine: string; firstFigure: [number, number] | null };

const wordsOf = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}$ ]/gu, " ").split(/\s+/).filter(Boolean);

/** The truth from our timeline.json: beat starts, the first line, and the scene where the first figure is shown. */
export function truthOf(tl: { fps: number; durationInFrames: number; beats: { from: number; say?: string; params?: Record<string, unknown> }[] }): Truth {
  const figureRe = /[$₹£€]\s?\d|\d\s?%/;
  const i = tl.beats.findIndex((b) => figureRe.test(JSON.stringify(b.params ?? {})) || figureRe.test(b.say ?? ""));
  const durationSec = tl.durationInFrames / tl.fps;
  return {
    durationSec,
    beatStarts: tl.beats.map((b) => b.from / tl.fps),
    firstLine: tl.beats[0]?.say ?? "",
    firstFigure: i < 0 ? null : [tl.beats[i]!.from / tl.fps, (tl.beats[i + 1]?.from ?? tl.durationInFrames) / tl.fps],
  };
}

export type CalibrationScore = { durationErr: number; beatRecall: number; firstLineOverlap: number; figureErr: number | null; passed: boolean; why: string[] };

/** How well a sheet of one of our own Shorts matches what we know we made. */
export function calibrate(sheet: Sheet, t: Truth, cfg: TwinsConfig["calibration"]): CalibrationScore {
  const starts = sheet.shots.map((x) => x.start);
  const hits = t.beatStarts.filter((b) => starts.some((s) => Math.abs(s - b) <= cfg.toleranceSec)).length;
  const truthWords = new Set(wordsOf(t.firstLine));
  const seen = wordsOf(sheet.hook.firstLine).filter((w) => truthWords.has(w)).length;
  const overlap = truthWords.size ? seen / truthWords.size : 1;
  const shown = sheet.hook.figureShownAtSec ?? sheet.hook.figureSpokenAtSec;
  // inside the scene where the figure first appears counts as right; otherwise the distance to that scene
  const figureErr = t.firstFigure == null || shown == null ? null : Math.max(0, t.firstFigure[0] - shown, shown - t.firstFigure[1]);
  const s = { durationErr: round(Math.abs(sheet.durationSec - t.durationSec), 1), beatRecall: round(hits / Math.max(1, t.beatStarts.length)), firstLineOverlap: round(Math.min(1, overlap)), figureErr: figureErr == null ? null : round(figureErr, 1) };
  const why: string[] = [];
  if (s.durationErr > cfg.durationErrSec) why.push(`length off by ${s.durationErr} s`);
  if (s.beatRecall < cfg.beatRecall) why.push(`found ${Math.round(s.beatRecall * 100)}% of our scene changes`);
  if (s.firstLineOverlap < cfg.firstLineOverlap) why.push(`heard ${Math.round(s.firstLineOverlap * 100)}% of the first line`);
  if (s.figureErr != null && s.figureErr > cfg.figureErrSec) why.push(`first figure off by ${s.figureErr} s`);
  return { ...s, passed: why.length === 0, why };
}

// ---------------- gap report (one of our Shorts against its twins) ----------------

export type Drop = { at: number; drop: number };
export type Gap = { key: keyof Measures; label: string; ours: string; twins: string; agree: number; of: number; direction: "more" | "less" };
export type GapReport = {
  videoId: string; youtubeId: string; writtenAt: string; twins: string[];
  ours: Measures; twinsMedian: Partial<Record<keyof Measures, number | null>>;
  gaps: Gap[]; atDrops: { at: number; drop: number; ours: string; twins: string[] }[]; summary: string;
};

/** The shot on screen at second `t`. */
export const shotAt = (s: Sheet, t: number) => s.shots.find((x) => t >= x.start && t < x.end) ?? s.shots[s.shots.length - 1]!;

export function gapReport(videoId: string, youtubeId: string, ours: Sheet, twins: { id: string; sheet: Sheet }[], drops: Drop[], now: Date): GapReport {
  const om = measures(ours);
  const tm = twins.map((t) => measures(t.sheet));
  const twinsMedian: GapReport["twinsMedian"] = {};
  const gaps: Gap[] = [];
  for (const c of COMPARED) {
    const ov = om[c.key] as number | null;
    const tv = tm.map((m) => m[c.key] as number | null);
    const known = tv.filter((x): x is number => typeof x === "number");
    const med = median(known);
    twinsMedian[c.key] = med == null ? null : round(med, 2);
    // "never" (null) for a figure/subject time counts as later than any time
    const o = ov ?? (c.key === "firstFigureSec" || c.key === "subjectNamedSec" ? om.durationSec : null);
    if (o == null || med == null || !known.length) continue;
    if (Math.abs(med - o) < c.minGap) continue;
    const direction = med > o ? "more" : "less";
    const agree = known.filter((x) => (direction === "more" ? x > o : x < o)).length;
    if (agree / known.length < 0.66) continue;
    gaps.push({ key: c.key, label: c.label, ours: fmtMeasure(ov, c.unit), twins: fmtMeasure(med, c.unit), agree, of: known.length, direction });
  }
  const atDrops = drops.filter((d) => d.drop >= 0.1).sort((a, b) => b.drop - a.drop).slice(0, 3).map((d) => ({
    at: d.at, drop: d.drop,
    ours: describeShot(shotAt(ours, d.at)),
    twins: twins.map((t) => describeShot(shotAt(t.sheet, Math.min(d.at, t.sheet.durationSec - 0.01)))),
  }));
  const top = gaps.slice(0, 4).map((g) => `${g.label}: ours ${g.ours}, winners ${g.twins} (${g.agree} of ${g.of})`);
  const firstDrop = atDrops[0];
  const summary = [
    top.length ? `Where the winners differ: ${top.join("; ")}.` : "No clear difference in the measures.",
    firstDrop ? `Our biggest drop (${Math.round(firstDrop.drop * 100)}% at ${firstDrop.at} s) was on: ${firstDrop.ours}.` : "",
  ].filter(Boolean).join(" ");
  return { videoId, youtubeId, writtenAt: now.toISOString(), twins: twins.map((t) => t.id), ours: om, twinsMedian, gaps, atDrops, summary };
}

export function describeShot(x: Sheet["shots"][number]): string {
  const bits = [x.picture, x.onScreenText ? `text "${x.onScreenText}"` : "", x.camera !== "static" ? x.camera : "", x.figureOnScreen ? "figure on screen" : ""].filter(Boolean);
  return bits.join(" · ").slice(0, 200);
}

// ---------------- brief (for the writer, per topic) ----------------

export type Brief = {
  topicId: string; writtenAt: string; search: string; twins: string[];
  pattern: { label: string; value: string }[];
  hooks: { firstFrame: string; firstLine: string; firstFigureSec: number | null; question: boolean }[];
  techniques: string[];
  styles: string[];
  note: string;
};

export function brief(topicId: string, search: string, twins: { id: string; sheet: Sheet }[], now: Date): Brief {
  const ms = twins.map((t) => measures(t.sheet));
  const med = (k: keyof Measures) => median(ms.map((m) => m[k]).filter((x): x is number => typeof x === "number"));
  const pattern = COMPARED.map((c) => ({ label: c.label, value: fmtMeasure(med(c.key), c.unit) }));
  pattern.push({ label: "captions", value: mode(ms.map((m) => m.captions)) }, { label: "loops back to the start", value: `${ms.filter((m) => m.loops).length} of ${ms.length}` });
  return {
    topicId, writtenAt: now.toISOString(), search, twins: twins.map((t) => t.id), pattern,
    hooks: twins.map((t) => ({ firstFrame: t.sheet.hook.firstFrame, firstLine: t.sheet.hook.firstLine, firstFigureSec: measures(t.sheet).firstFigureSec, question: t.sheet.hook.question })),
    techniques: [...new Set(twins.flatMap((t) => t.sheet.whyItWorks))].slice(0, 8),
    styles: twins.map((t) => t.sheet.artStyle),
    note: "Learn the technique (pace, order, how figures appear), never the words, characters or art. Our facts, our cast, our script.",
  };
}

const mode = (xs: string[]) => {
  const n = new Map<string, number>();
  for (const x of xs) n.set(x, (n.get(x) ?? 0) + 1);
  return [...n].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
};

// ---------------- the style model (what winners do that we keep not doing) ----------------

export type ModelGap = { key: string; label: string; direction: "more" | "less"; reports: number; of: number; share: number; oursMedian: string; twinsMedian: string };
export type StyleModel = { writtenAt: string; windowDays: number; reports: number; consistent: ModelGap[]; leaning: ModelGap[] };

/** Gaps that recur across our Shorts: a challenger for the weekly loop once `minReports` agree. */
export function styleModel(reports: GapReport[], cfg: TwinsConfig["model"], now: Date): StyleModel {
  const recent = reports.filter((r) => now.getTime() - Date.parse(r.writtenAt) <= cfg.windowDays * 86_400_000);
  const out: ModelGap[] = [];
  for (const c of COMPARED) {
    for (const direction of ["more", "less"] as const) {
      const hit = recent.filter((r) => r.gaps.some((g) => g.key === c.key && g.direction === direction));
      if (!hit.length) continue;
      const comparable = recent.filter((r) => r.twinsMedian[c.key] != null).length;
      out.push({
        key: c.key, label: c.label, direction, reports: hit.length, of: comparable, share: round(hit.length / Math.max(1, comparable)),
        oursMedian: fmtMeasure(median(recent.map((r) => r.ours[c.key]).filter((x): x is number => typeof x === "number")), c.unit),
        twinsMedian: fmtMeasure(median(recent.map((r) => r.twinsMedian[c.key]).filter((x): x is number => typeof x === "number")), c.unit),
      });
    }
  }
  out.sort((a, b) => b.share - a.share || b.reports - a.reports);
  const consistent = out.filter((g) => g.reports >= cfg.minReports && g.share >= cfg.agree);
  return { writtenAt: now.toISOString(), windowDays: cfg.windowDays, reports: recent.length, consistent, leaning: out.filter((g) => !consistent.includes(g)).slice(0, 6) };
}
