/** Pure calculations for the Studio-grade analytics (shared by studio.db.ts and studio.sample.ts). */
import type { Attribute, Day, Totals } from "./studio-schema";

export type Curve = [number, number][];

export const median = (xs: number[]): number | null => {
  const s = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
};

/** Range totals from day rows; % viewed and view length are view-weighted. */
export function totalsOf(days: Day[], reach: { impressions: number; clicks: number } | null = null): Totals {
  const sum = (k: keyof Day) => days.reduce((a, d) => a + (d[k] as number), 0);
  const views = sum("views");
  const w = (k: "avgViewPct" | "avgViewSec") => (views > 0 ? days.reduce((a, d) => a + d[k] * d.views, 0) / views : 0);
  return {
    views, engagedViews: sum("engagedViews"), watchHours: sum("watchMinutes") / 60, avgViewPct: w("avgViewPct"), avgViewSec: w("avgViewSec"),
    likes: sum("likes"), comments: sum("comments"), shares: sum("shares"), subsGained: sum("subsGained"), subsLost: sum("subsLost"),
    impressions: reach && reach.impressions > 0 ? reach.impressions : null, ctr: reach && reach.impressions > 0 ? reach.clicks / reach.impressions : null,
  };
}

/** Day rows summed across videos (or formats) by day. */
export function sumByDay(rows: Day[]): Day[] {
  const by = new Map<string, Day & { pctW: number; secW: number }>();
  for (const r of rows) {
    const d = by.get(r.day) ?? { ...zeroDay(r.day), pctW: 0, secW: 0 };
    for (const k of ["views", "engagedViews", "watchMinutes", "likes", "comments", "shares", "subsGained", "subsLost"] as const) d[k] += r[k];
    d.pctW += r.avgViewPct * r.views;
    d.secW += r.avgViewSec * r.views;
    by.set(r.day, d);
  }
  return [...by.values()].sort((a, b) => a.day.localeCompare(b.day)).map(({ pctW, secW, ...d }) => ({ ...d, avgViewPct: d.views ? pctW / d.views : 0, avgViewSec: d.views ? secW / d.views : 0 }));
}

export const zeroDay = (day: string): Day => ({ day, views: 0, engagedViews: 0, watchMinutes: 0, avgViewPct: 0, avgViewSec: 0, likes: 0, comments: 0, shares: 0, subsGained: 0, subsLost: 0 });

/** Every day from `from` to `to` (YYYY-MM-DD), missing ones as zero rows. */
export function fillDays(rows: Day[], from: string, to: string): Day[] {
  const by = new Map(rows.map((r) => [r.day, r]));
  const out: Day[] = [];
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= Date.parse(`${to}T00:00:00Z`); t += 86_400_000) {
    const day = new Date(t).toISOString().slice(0, 10);
    out.push(by.get(day) ?? zeroDay(day));
  }
  return out;
}

/** Curves resampled at 1..100% and averaged (the typical retention of a format). */
export function averageCurve(curves: Curve[]): Curve {
  const use = curves.filter((c) => c.length >= 10);
  if (!use.length) return [];
  return Array.from({ length: 100 }, (_, i) => {
    const x = (i + 1) / 100;
    const ys = use.map((c) => at(c, x));
    return [x, Math.round((ys.reduce((a, b) => a + b, 0) / ys.length) * 1000) / 1000] as [number, number];
  });
}

/** A curve's value at share x, interpolated. */
export function at(c: Curve, x: number): number {
  const pts = [...c].sort((a, b) => a[0] - b[0]);
  if (!pts.length) return 0;
  if (x <= pts[0]![0]) return pts[0]![1];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]!, [x1, y1] = pts[i]!;
    if (x <= x1) return y0 + (y1 - y0) * ((x - x0) / (x1 - x0 || 1));
  }
  return pts.at(-1)![1];
}

export type Snap = { hour: Date; views: number };

/** Views gained per hour from cumulative hourly snapshots: `hours` buckets ending at `end` (exclusive),
 * oldest first. A gap between snapshots is spread evenly over the hours it covers. */
export function hourlyGains(snaps: Snap[], end: Date, hours = 48): number[] {
  const out = new Array<number>(hours).fill(0);
  const start = end.getTime() - hours * 3_600_000;
  const s = [...snaps].sort((a, b) => a.hour.getTime() - b.hour.getTime());
  for (let i = 1; i < s.length; i++) {
    const gain = Math.max(0, s[i]!.views - s[i - 1]!.views);
    const h0 = s[i - 1]!.hour.getTime(), h1 = s[i]!.hour.getTime();
    const span = Math.max(1, Math.round((h1 - h0) / 3_600_000));
    for (let k = 0; k < span; k++) {
      const t = h0 + k * 3_600_000;
      const idx = Math.floor((t - start) / 3_600_000);
      if (idx >= 0 && idx < hours) out[idx]! += gain / span;
    }
  }
  return out.map((v) => Math.round(v));
}

export type Attr = { attrs: Record<string, string | null>; avgViewPct: number | null; views48: number | null; engagedRatio: number | null; hookHold: number | null };

/** "What works": for each attribute, each value's medians, best first by % viewed. */
export function whatWorks(rows: Attr[], labels: Record<string, string>): Attribute[] {
  return Object.entries(labels).map(([attribute, label]) => {
    const groups = new Map<string, Attr[]>();
    for (const r of rows) {
      const v = r.attrs[attribute];
      if (!v) continue;
      groups.set(v, [...(groups.get(v) ?? []), r]);
    }
    const m = (xs: Attr[], k: "avgViewPct" | "views48" | "engagedRatio" | "hookHold") => median(xs.map((x) => x[k]).filter((v): v is number => v !== null));
    return {
      attribute, label,
      groups: [...groups].map(([value, xs]) => ({ value, n: xs.length, avgViewPct: m(xs, "avgViewPct"), views48: m(xs, "views48"), engagedRatio: m(xs, "engagedRatio"), hookHold: m(xs, "hookHold") }))
        .sort((a, b) => (b.n >= 3 ? 1 : 0) - (a.n >= 3 ? 1 : 0) || (b.avgViewPct ?? 0) - (a.avgViewPct ?? 0)),
    };
  }).filter((a) => a.groups.length > 1);
}

export const lengthBucket = (sec: number, format: string) =>
  format === "long" ? (sec < 420 ? "under 7 min" : sec < 540 ? "7–9 min" : "9 min+") : sec < 45 ? "under 45 s" : sec < 60 ? "45–60 s" : sec < 75 ? "60–75 s" : "75 s+";

/** The upload slot in IST ("12:37"), from the publish time. */
export const istSlot = (d: Date) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" }).format(d);
export const istWeekday = (d: Date) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", weekday: "short" }).format(d);

/** A rule-of-thumb verdict when the AI hasn't written one: views and % viewed against the format's median. */
export function quickVerdict(vs48: number | null, vsPct: number | null): "hit" | "okay" | "miss" | null {
  if (vs48 === null && vsPct === null) return null;
  const score = (vs48 ?? 1) * 0.6 + (vsPct ?? 1) * 0.4;
  return score >= 1.35 ? "hit" : score <= 0.7 ? "miss" : "okay";
}

/** % change, null without a base. */
export const pctChange = (now: number, before: number | null | undefined) => (before && before > 0 ? ((now - before) / before) * 100 : null);
