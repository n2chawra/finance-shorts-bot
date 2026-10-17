/**
 * What's working in the niche right now, for the research and Scout agents (who can't call YouTube
 * themselves: routines never hold credentials). Pure helpers; workers/market.ts does the fetching.
 */
import { z } from "zod";

/** The channel's market: what to search and where (config/market.json; one file per channel). */
export const MarketConfig = z.object({
  regionCode: z.string().length(2),
  relevanceLanguage: z.string().min(2),
  queries: z.array(z.string().min(2)).min(1).max(8),
  days: z.number().int().min(1).max(30).default(7),
  shortMaxSec: z.number().int().default(180),
  top: z.number().int().min(5).max(50).default(30),
});
export type MarketConfig = z.infer<typeof MarketConfig>;

export const SearchList = z.object({ items: z.array(z.object({ id: z.object({ videoId: z.string() }) })) });
export const VideoDetails = z.object({
  items: z.array(z.object({
    id: z.string(),
    snippet: z.object({ title: z.string(), channelTitle: z.string(), publishedAt: z.string(), defaultAudioLanguage: z.string().optional() }),
    contentDetails: z.object({ duration: z.string() }),
    statistics: z.object({ viewCount: z.string().optional(), likeCount: z.string().optional(), commentCount: z.string().optional() }),
  })),
});
export const CommentThreads = z.object({
  items: z.array(z.object({
    snippet: z.object({ topLevelComment: z.object({ snippet: z.object({ textOriginal: z.string(), likeCount: z.number(), publishedAt: z.string() }) }) }),
  })),
});

/** ISO 8601 duration ("PT1M3S", "PT1H2M") in seconds; 0 for live or unknown. */
export function durationSec(iso: string): number {
  const m = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!m) return 0;
  const [, d, h, min, s] = m.map((x) => Number(x ?? 0));
  return d! * 86_400 + h! * 3_600 + min! * 60 + s!;
}

export type MarketVideo = {
  id: string; url: string; title: string; channel: string; publishedAt: string; durationSec: number;
  views: number; likes: number; comments: number; viewsPerHour: number; query: string;
};

/** Split into Shorts and long videos and rank each by views per hour since publishing. */
export function rankMarket(details: z.infer<typeof VideoDetails>["items"], queryOf: Map<string, string>, cfg: MarketConfig, now: Date) {
  const rows: MarketVideo[] = details.map((v) => {
    const views = Number(v.statistics.viewCount ?? 0);
    const hours = Math.max(1, (now.getTime() - Date.parse(v.snippet.publishedAt)) / 3_600_000);
    const sec = durationSec(v.contentDetails.duration);
    return {
      id: v.id, url: sec <= cfg.shortMaxSec ? `https://youtube.com/shorts/${v.id}` : `https://youtube.com/watch?v=${v.id}`,
      title: v.snippet.title, channel: v.snippet.channelTitle, publishedAt: v.snippet.publishedAt, durationSec: sec,
      views, likes: Number(v.statistics.likeCount ?? 0), comments: Number(v.statistics.commentCount ?? 0),
      viewsPerHour: Math.round(views / hours), query: queryOf.get(v.id) ?? "",
    };
  }).filter((r) => r.durationSec > 0);
  const top = (xs: MarketVideo[]) => xs.sort((a, b) => b.viewsPerHour - a.viewsPerHour).slice(0, cfg.top);
  return { shorts: top(rows.filter((r) => r.durationSec <= cfg.shortMaxSec)), long: top(rows.filter((r) => r.durationSec > cfg.shortMaxSec)) };
}
