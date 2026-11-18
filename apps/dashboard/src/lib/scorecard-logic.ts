/**
 * The daily scorecard's pure helpers (owner, 2026-11-16: "analytics I can watch every day to see if the
 * videos are working"). No imports, so the Node workers tests can load them too.
 *
 * YouTube shows a Short to a small test audience first and widens it only when that audience stays. The
 * content research of 2026-11-16 found every Short stopping at 150-1,190 views on four numbers: too many
 * swiped away (stayed to watch ~37%; Shorts that break out hold 70-90%), the most left at 4-7 s on the
 * second line, few were still there at the end (no loop), and retention sat below similar-length Shorts.
 */

export type Curve = [number, number][];   // [elapsed share 0..1, watch ratio], YouTube's retention curve

/** The day the content reset went live: "before" and "after" are measured from it. */
export const RESET_DAY = "2026-11-16";
/** Every Short so far stopped at or under this many views. */
export const CEILING = 1_200;
export const LADDER = [2_000, 5_000, 10_000] as const;

export type MetricKey = "stayed" | "lostAt5" | "endHold" | "relative";
export type Band = "good" | "close" | "off";

export type MetricDef = {
  key: MetricKey; label: string; short: string;
  /** what it is, in one line */
  what: string;
  /** what to fix when it is red */
  fix: string;
  higherIsBetter: boolean;
  /** good at or past `good`, close at or past `close` (in the metric's own direction) */
  good: number; close: number;
  /** the gauge's range */
  max: number;
  /** a line the best Shorts reach, drawn on the gauge */
  stretch?: { at: number; label: string };
  format: (v: number) => string;
  target: string;
};

const pctF = (v: number) => `${Math.round(v * 100)}%`;

export const METRICS: MetricDef[] = [
  {
    key: "stayed", label: "Stayed to watch", short: "Stayed",
    what: "Of the people shown the Short, the share who didn't swipe away (engaged views ÷ views)",
    fix: "The first frame and the opening question: name the subject, ask what a stranger wants answered",
    higherIsBetter: true, good: 0.5, close: 0.4, max: 1, stretch: { at: 0.7, label: "breakouts 70%+" },
    format: pctF, target: "50%, then 60%",
  },
  {
    key: "lostAt5", label: "Lost on the second line", short: "Lost 4–7 s",
    what: "Share of the starting viewers who leave between 4 and 7 s, while the line after the hook plays",
    fix: "The second line: a bigger surprise, never what the title already said, in plain words",
    higherIsBetter: false, good: 0.15, close: 0.25, max: 0.5,
    format: pctF, target: "under 15%",
  },
  {
    key: "endHold", label: "Still watching at the end", short: "At the end",
    what: "Share of the starting viewers still there at the last second; past 100% means people loop it",
    fix: "The ending: land the payoff late and make the last line run straight back into the first frame",
    higherIsBetter: true, good: 0.5, close: 0.3, max: 1.2, stretch: { at: 1, label: "loops" },
    format: pctF, target: "50% or more",
  },
  {
    key: "relative", label: "vs similar Shorts", short: "vs similar",
    what: "YouTube's retention against Shorts of the same length: 50 is typical, above 50 beats them",
    fix: "The middle: something new on screen every 2 s, one open question every 2-3 beats",
    higherIsBetter: true, good: 0.55, close: 0.45, max: 1,
    format: (v) => `${Math.round(v * 100)}`, target: "above 55",
  },
];

export const METRIC: Record<MetricKey, MetricDef> = Object.fromEntries(METRICS.map((m) => [m.key, m])) as Record<MetricKey, MetricDef>;

export function bandOf(m: MetricDef, v: number | null | undefined): Band | null {
  if (v == null || !Number.isFinite(v)) return null;
  if (m.higherIsBetter) return v >= m.good ? "good" : v >= m.close ? "close" : "off";
  return v <= m.good ? "good" : v <= m.close ? "close" : "off";
}

export function median(xs: (number | null | undefined)[]): number | null {
  const s = xs.filter((x): x is number => x != null && Number.isFinite(x)).sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}

/** The watch ratio `seconds` into a `durationSec` video, interpolated; null without a curve. */
export function holdAt(curve: Curve, durationSec: number, seconds: number): number | null {
  if (curve.length < 2 || durationSec <= 0) return null;
  const pts = [...curve].sort((a, b) => a[0] - b[0]);
  const x = Math.min(1, seconds / durationSec);
  if (x <= pts[0]![0]) return pts[0]![1];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]!, [x1, y1] = pts[i]!;
    if (x <= x1) return y0 + (y1 - y0) * ((x - x0) / (x1 - x0 || 1));
  }
  return pts[pts.length - 1]![1];
}

/** Share of the starting viewers lost between 4 and 7 s: the second line of a Short. */
export function secondLineLoss(curve: Curve, durationSec: number): number | null {
  const a = holdAt(curve, durationSec, 4), b = holdAt(curve, durationSec, 7);
  if (a == null || b == null) return null;
  return Math.round(Math.max(0, a - b) * 1000) / 1000;
}

/** The mean of YouTube's relative-retention curve (0.5 = typical for the length); null when empty. */
export function relativeScore(relative: Curve): number | null {
  if (!relative.length) return null;
  return Math.round((relative.reduce((a, p) => a + p[1], 0) / relative.length) * 1000) / 1000;
}

/** A question title: ends on "?" or opens with how/why/what… (the content reset's title form). */
export function isQuestionTitle(title: string): boolean {
  return /\?\W*$|^\W*(how|why|what|which|who|where|when|is|are|does|do|did|can|could|would|should|will)\b/i.test(title.trim());
}

/** The IST calendar day of an ISO time. */
export function istDayOf(iso: string): string {
  return new Date(Date.parse(iso) + 5.5 * 3_600_000).toISOString().slice(0, 10);
}

/** The fields `summarize` reads (the zod type lives in scorecard.ts, kept out of here for the workers tests). */
export type ShortLike = {
  id: string; publishAt: string; views: number; views48: number | null; likes: number; shares: number; subs: number;
} & Record<MetricKey, number | null>;

export type Side = {
  n: number; medians: Record<MetricKey, number | null>; views48: number | null;
  /** per 1,000 views */
  sharesPer1k: number | null; subsPer1k: number | null; likesPer1k: number | null;
};

function side(xs: ShortLike[]): Side {
  const views = xs.reduce((a, s) => a + s.views, 0);
  const per = (k: "shares" | "subs" | "likes") => (views ? (xs.reduce((a, s) => a + s[k], 0) / views) * 1000 : null);
  return {
    n: xs.length,
    medians: Object.fromEntries(METRICS.map((m) => [m.key, median(xs.map((s) => s[m.key]))])) as Record<MetricKey, number | null>,
    views48: median(xs.map((s) => s.views48)), sharesPer1k: per("shares"), subsPer1k: per("subs"), likesPer1k: per("likes"),
  };
}

/** The scorecard for the Shorts of the last `days` days, and before/after the reset. */
export function summarize<T extends ShortLike>(shorts: T[], resetDay: string, days: number, now = Date.now()) {
  const since = now - days * 86_400_000;
  const recent = shorts.filter((s) => Date.parse(s.publishAt) >= since);
  const resetAt = Date.parse(`${resetDay}T00:00:00+05:30`);
  const after = shorts.filter((s) => Date.parse(s.publishAt) >= resetAt);
  const before = shorts.filter((s) => Date.parse(s.publishAt) < resetAt && Date.parse(s.publishAt) >= resetAt - 14 * 86_400_000);
  const now7 = side(recent);
  const bands = Object.fromEntries(METRICS.map((m) => [m.key, bandOf(m, now7.medians[m.key])])) as Record<MetricKey, Band | null>;
  const measured = recent.filter((s) => METRICS.some((m) => s[m.key] != null)).length;
  const best = Math.max(0, ...shorts.map((s) => s.views));
  return {
    recent, now: now7, bands, measured, verdict: verdict(bands),
    before: side(before), after: side(after),
    /** Shorts in range past each rung of the ladder, by lifetime views */
    ladder: LADDER.map((at) => ({ at, n: recent.filter((s) => s.views >= at).length })),
    pastCeiling: recent.filter((s) => s.views > CEILING).length,
    best,
    /** each metric's values, oldest to newest, for the dot strips */
    trail: Object.fromEntries(METRICS.map((m) => [m.key, [...recent].reverse().map((s) => ({ id: s.id, v: s[m.key] }))])) as Record<MetricKey, { id: string; v: number | null }[]>,
  };
}

/** A one-line reading of the scorecard: which numbers are on target and what to fix first. */
export function verdict(bands: Partial<Record<MetricKey, Band | null>>): { onTarget: number; measured: number; line: string; tone: "good" | "warning" | "critical" | "neutral" } {
  const measured = METRICS.filter((m) => bands[m.key]);
  const onTarget = measured.filter((m) => bands[m.key] === "good").length;
  if (!measured.length) return { onTarget, measured: 0, line: "Waiting for numbers: a Short needs about two days of YouTube Analytics", tone: "neutral" };
  const worst = measured.find((m) => bands[m.key] === "off") ?? measured.find((m) => bands[m.key] === "close");
  if (!worst) return { onTarget, measured: measured.length, line: "Every number is on target: these Shorts should travel past the first test audience", tone: "good" };
  return {
    onTarget, measured: measured.length,
    line: `Fix first: ${worst.label.toLowerCase()}. ${worst.fix}.`,
    tone: onTarget >= Math.ceil(measured.length / 2) ? "warning" : "critical",
  };
}
