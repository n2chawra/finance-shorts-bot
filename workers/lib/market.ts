/**
 * What's working in the niche right now, for the research and Scout agents (who can't call YouTube
 * themselves: routines never hold credentials). Pure helpers; workers/market.ts does the fetching.
 */
import { z } from "zod";

/** Reference thumbnails per open long topic (thumbRefs in config/market.json; see dueTopics below). */
export const ThumbRefsConfig = z.object({
  perDay: z.number().int().min(0).max(10).default(4),
  refreshDays: z.number().int().min(1).max(30).default(7),
  keep: z.number().int().min(3).max(12).default(8),
  minViews: z.number().int().min(0).default(100_000),
}).default({ perDay: 4, refreshDays: 7, keep: 8, minViews: 100_000 });
export type ThumbRefsConfig = z.infer<typeof ThumbRefsConfig>;

/** The channel's market: what to search and where (config/market.json; one file per channel). */
export const MarketConfig = z.object({
  regionCode: z.string().length(2),
  // extra regions searched with the same queries (the channel splits Shorts between India and the US)
  regions: z.array(z.string().length(2)).max(2).default([]),
  relevanceLanguage: z.string().min(2),
  queries: z.array(z.string().min(2)).min(1).max(8),
  days: z.number().int().min(1).max(30).default(7),
  shortMaxSec: z.number().int().default(180),
  top: z.number().int().min(5).max(50).default(30),
  // reference thumbnails per open long topic (see ThumbRefsConfig below)
  thumbRefs: ThumbRefsConfig,
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

/**
 * Thumbnail references per long topic (owner, 2026-10-29: "for each video, its references are searched,
 * see what type of thumbnail actually works and make something like that"). Each open long topic is
 * searched once every `refreshDays` (at most `perDay` a day, 100 units each); results carry over
 * between days on the market-data branch as thumb-refs.json. Studio turns them into the video's own
 * thumbnail (renderer/thumbs.py).
 */

export const LongTopic = z.object({
  id: z.string(), title: z.string(), status: z.string().default("new"), search: z.string().optional(),
  priority: z.string().optional(), expires: z.string().optional(),
}).passthrough();
export type ThumbRef = { id: string; title: string; channel: string; views: number; durationSec: number; thumb: string };
export type TopicRefs = { query: string; searchedAt: string; refs: ThumbRef[] };
export const ThumbRefsFile = z.object({ topics: z.record(z.string(), z.object({ query: z.string(), searchedAt: z.string(), refs: z.array(z.any()) })).default({}) });

const PRIORITY: Record<string, number> = { breaking: 0, high: 1, normal: 2, low: 3 };

/** Open topics that need a (re)search today, the most urgent and the least recently searched first. */
export function dueTopics(topics: z.infer<typeof LongTopic>[], prev: Record<string, TopicRefs>, now: Date, cfg: ThumbRefsConfig) {
  const day = now.toISOString().slice(0, 10);
  const open = topics.filter((t) => t.status === "new" && (!t.expires || t.expires >= day));
  const age = (t: { id: string }) => {
    const p = prev[t.id];
    return p ? (now.getTime() - Date.parse(p.searchedAt)) / 86_400_000 : Infinity;
  };
  return open.filter((t) => age(t) >= cfg.refreshDays)
    .sort((a, b) => (PRIORITY[a.priority ?? "normal"] ?? 2) - (PRIORITY[b.priority ?? "normal"] ?? 2) || age(b) - age(a))
    .slice(0, cfg.perDay);
}

/** The topic's references: its most viewed videos above `minViews`, with their thumbnail address. */
export function pickRefs(details: z.infer<typeof VideoDetails>["items"], cfg: ThumbRefsConfig): ThumbRef[] {
  return details.map((v) => ({
    id: v.id, title: v.snippet.title, channel: v.snippet.channelTitle, views: Number(v.statistics.viewCount ?? 0),
    durationSec: durationSec(v.contentDetails.duration), thumb: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
  })).filter((r) => r.views >= cfg.minViews && r.durationSec > 180).sort((a, b) => b.views - a.views).slice(0, cfg.keep);
}

/** What carries over: refs of topics still open, searched within the refresh window. */
export function keepRefs(prev: Record<string, TopicRefs>, openIds: Set<string>, now: Date, cfg: ThumbRefsConfig) {
  return Object.fromEntries(Object.entries(prev).filter(([id, r]) => openIds.has(id) && (now.getTime() - Date.parse(r.searchedAt)) / 86_400_000 < cfg.refreshDays * 2));
}
