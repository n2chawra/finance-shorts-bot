/**
 * Lifetime totals of one video, from its daily Analytics rows and YouTube's live counters. Pure (no
 * Prisma), so workers/tests can test it.
 */

export type StatRow = { views: number; likes: number; comments: number; subsGained: number; avgViewPct: number };
export type LiveRow = { liveViews: number | null; liveLikes: number | null; liveComments: number | null; liveAt: Date | null };
export type Totals = { views: number; likes: number; comments: number; subsGained: number; avgViewPct: number; liveAt: string | null };

/**
 * Views, likes and comments are YouTube's live public counters whenever the video has them, the
 * number the owner sees on YouTube (owner, 2026-11-13: taking the larger of Analytics and the live
 * counter made the dashboard disagree with YouTube and move both ways as Analytics was revised).
 * The daily Analytics rows, a day or two behind, stand in only for a video without live counters
 * (private, or not refreshed yet). Subscribers and watch % only exist in Analytics. Watch % is
 * weighted by each day's views, as in the agents' metrics (workers/lib/agents-sync.ts).
 */
export function totals(stats: StatRow[], live?: LiveRow | null): Totals | null {
  const hasLive = live?.liveAt != null && live.liveViews != null;
  if (!stats.length && !hasLive) return null;
  const sum = (k: "views" | "likes" | "comments" | "subsGained") => stats.reduce((a, s) => a + s[k], 0);
  const best = (k: "views" | "likes" | "comments", l: number | null | undefined) => (hasLive ? l ?? 0 : sum(k));
  const viewed = sum("views");
  return {
    views: best("views", live?.liveViews), likes: best("likes", live?.liveLikes), comments: best("comments", live?.liveComments),
    subsGained: sum("subsGained"), avgViewPct: viewed > 0 ? Math.round(stats.reduce((a, s) => a + s.avgViewPct * s.views, 0) / viewed * 10) / 10 : 0,
    liveAt: hasLive ? live!.liveAt!.toISOString() : null,
  };
}

/**
 * The first IST day of the `days`-day window that ends today ("YYYY-MM-DD"), today included: the
 * window the Overview's 7-day totals and its week-over-week chart (the last 7 daily rows) share.
 */
export function windowStart(today: string, days: number): string {
  return new Date(Date.parse(`${today}T00:00:00Z`) - (days - 1) * 86_400_000).toISOString().slice(0, 10);
}

export type DayRow = { views: number; likes: number; comments: number; subsGained: number; estimated: boolean };
export type GapVideo = { publishDay: string; stats: (StatRow & { day: string })[]; live?: LiveRow | null };

/**
 * YouTube Analytics' daily numbers run days behind, so the last days of a per-day graph are empty
 * while the live counters already have the views and likes (2026-10-24: the graph showed 3 likes,
 * YouTube 33). For each video, what the live counters have beyond its Analytics rows is spread
 * evenly over the days Analytics hasn't covered yet (from the later of its publish day and the day
 * after its last Analytics day, to the last day in `byDay`); those days are marked estimated.
 * `byDay` is keyed YYYY-MM-DD in order and changed in place.
 */
export function fillFromLive(byDay: Map<string, DayRow>, videos: GapVideo[]): void {
  const days = [...byDay.keys()];
  if (!days.length) return;
  const next = (d: string) => new Date(Date.parse(`${d}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
  for (const v of videos) {
    const t = totals(v.stats, v.live);
    if (!t) continue;
    const last = v.stats.reduce((m, s) => (s.day > m ? s.day : m), "");
    const start = [v.publishDay, last ? next(last) : ""].sort().at(-1)!;
    const span = days.filter((d) => d >= start);
    const target = span.length ? span : [days.at(-1)!];
    for (const k of ["views", "likes", "comments"] as const) {
      const rest = t[k] - v.stats.reduce((a, s) => a + s[k], 0);
      if (rest <= 0) continue;
      // whole numbers, the remainder on the latest days
      const each = Math.floor(rest / target.length);
      let extra = rest - each * target.length;
      for (let i = target.length - 1; i >= 0; i--) {
        const d = byDay.get(target[i]!)!;
        const add = each + (extra > 0 ? 1 : 0);
        if (extra > 0) extra--;
        if (add > 0) { d[k] += add; d.estimated = true; }
      }
    }
  }
}

/**
 * The channel's average % viewed across videos. Only videos with Analytics rows count: a video
 * that so far has only live counters has no watch % yet, not 0%.
 */
export function meanViewPct(videos: { stats: StatRow[]; totals: Totals }[]): number {
  const measured = videos.filter((x) => x.stats.length > 0);
  return measured.length ? Math.round(measured.reduce((a, x) => a + x.totals.avgViewPct, 0) / measured.length * 10) / 10 : 0;
}

export type WeekDay = { views: number; likes: number; subsGained: number; estimated: boolean };

/**
 * The last 7 days against the 7 before, from the daily rows, and the last 14 days for a sparkline.
 * Analytics runs a day or two behind. Views and likes fill those days from the live counters
 * (`fillFromLive`, marked estimated); subscribers have no live counter, so their trailing estimated
 * days are left out instead of counted as 0 (flat growth read about -20%).
 */
export function weekOverWeek(daily: WeekDay[], key: "views" | "subsGained" | "likes"): { spark: number[]; delta: number | null } {
  let end = daily.length;
  if (key === "subsGained") while (end > 0 && daily[end - 1]!.estimated) end--;
  const days = daily.slice(0, end).map((d) => d[key]);
  const last = days.slice(-7).reduce((x, y) => x + y, 0);
  const prev = days.slice(-14, -7).reduce((x, y) => x + y, 0);
  return { spark: days.slice(-14), delta: prev > 0 ? ((last - prev) / prev) * 100 : null };
}
