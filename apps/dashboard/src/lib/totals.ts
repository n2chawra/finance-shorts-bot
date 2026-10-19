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
