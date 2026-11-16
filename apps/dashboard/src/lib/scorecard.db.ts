/**
 * The daily scorecard from Postgres: every published Short with its stayed to watch (VideoStat engaged ÷
 * views), the second-line loss and end hold (the Upload's retention curve), the score against similar
 * Shorts (relRetention), 48-hour views and the engagement counters. Written by workers/stats.ts every 3 h.
 */
import { prisma } from "./prisma";
import { RESET_DAY, type Curve, type Scorecard, type ScoreShort, istDayOf, relativeScore, secondLineLoss } from "./scorecard";
import { views48Of } from "./studio-calc";

const DAY_MS = 86_400_000;
const LIMIT = 90;   // the newest Shorts; ranges go up to 28 days at 3 a day

export async function getScorecard(): Promise<Scorecard> {
  const rows = await prisma.video.findMany({
    where: { deletedAt: null, status: "published", format: "short", upload: { youtubeId: { not: null } } },
    include: { upload: { include: { stats: { orderBy: { day: "asc" } } } } },
    orderBy: { upload: { publishAt: "desc" } },
    take: LIMIT,
  });
  const shorts: ScoreShort[] = rows.map((v) => {
    const u = v.upload!;
    const days = u.stats.map((s) => ({ day: s.day.toISOString().slice(0, 10), views: s.views, engaged: s.engagedViews, likes: s.likes, shares: s.shares, subs: s.subsGained - s.subsLost }));
    const sum = (k: "views" | "engaged" | "likes" | "shares" | "subs") => days.reduce((a, d) => a + d[k], 0);
    const statViews = sum("views");
    const curve = ((u.retention as Curve | null) ?? []);
    const sorted = [...curve].sort((a, b) => a[0] - b[0]);
    const publishDay = istDayOf(u.publishAt.toISOString());
    const old = Date.now() - u.publishAt.getTime() >= 2 * DAY_MS;
    return {
      id: v.id, title: v.title, thumbnailUrl: `/api/media/${v.id}/thumbnail`, publishAt: u.publishAt.toISOString(), durationSec: v.durationSec,
      views: u.liveViews ?? statViews,
      views48: old ? views48Of(days.filter((d) => d.day >= publishDay), publishDay) : null,
      stayed: statViews > 0 ? Math.round((sum("engaged") / statViews) * 1000) / 1000 : null,
      lostAt5: secondLineLoss(curve, v.durationSec),
      endHold: sorted.length ? sorted.at(-1)![1] : null,
      relative: relativeScore((u.relRetention as Curve | null) ?? []),
      likes: Math.max(sum("likes"), u.liveLikes ?? 0), shares: sum("shares"), subs: sum("subs"),
    };
  });
  return { source: "database", generatedAt: new Date().toISOString(), resetDay: RESET_DAY, shorts };
}
