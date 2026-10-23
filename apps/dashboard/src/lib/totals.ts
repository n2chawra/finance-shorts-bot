/**
 * Lifetime totals of one video, from its daily Analytics rows and YouTube's live counters. Pure (no
 * Prisma), so workers/tests can test it.
 */

export type StatRow = { views: number; likes: number; comments: number; subsGained: number; avgViewPct: number };
export type LiveRow = { liveViews: number | null; liveLikes: number | null; liveComments: number | null; liveAt: Date | null };
export type Totals = { views: number; likes: number; comments: number; subsGained: number; avgViewPct: number; liveAt: string | null };

/**
 * Views, likes and comments take YouTube's live counters when they are ahead of the daily Analytics
 * rows (which run a day or two behind); subscribers and watch % only exist in Analytics. Watch %
 * is weighted by each day's views, as in the agents' metrics (workers/lib/agents-sync.ts).
 */
export function totals(stats: StatRow[], live?: LiveRow | null): Totals | null {
  const hasLive = live?.liveAt != null && live.liveViews != null;
  if (!stats.length && !hasLive) return null;
  const sum = (k: "views" | "likes" | "comments" | "subsGained") => stats.reduce((a, s) => a + s[k], 0);
  const best = (k: "views" | "likes" | "comments", l: number | null | undefined) => Math.max(sum(k), hasLive ? l ?? 0 : 0);
  const viewed = sum("views");
  return {
    views: best("views", live?.liveViews), likes: best("likes", live?.liveLikes), comments: best("comments", live?.liveComments),
    subsGained: sum("subsGained"), avgViewPct: viewed > 0 ? Math.round(stats.reduce((a, s) => a + s.avgViewPct * s.views, 0) / viewed * 10) / 10 : 0,
    liveAt: hasLive ? live!.liveAt!.toISOString() : null,
  };
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
