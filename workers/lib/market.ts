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

/** The channel's market: what to search and where (channels/<slug>/market.json; one file per channel). A pack
 * usually names only its `queries`: the region defaults to the US and the language to the channel's own
 * (`channelMarket`), so a new channel's market.json never stops the scan (2026-11-24: channel #1's full file was
 * the only one, and deleting it would have crashed every later run). */
export const MarketConfig = z.object({
  regionCode: z.string().length(2).default("US"),
  // extra regions searched with the same queries (the channel splits Shorts between India and the US)
  regions: z.array(z.string().length(2)).max(2).default([]),
  relevanceLanguage: z.string().min(2).default("en"),
  queries: z.array(z.string().min(2)).min(1).max(8),
  days: z.number().int().min(1).max(30).default(7),
  shortMaxSec: z.number().int().default(180),
  top: z.number().int().min(5).max(50).default(30),
  // a breakout: views at least this many times the channel's subscribers (owner, 2026-11-11, below)
  breakoutRatio: z.number().min(1).default(3),
  // reference thumbnails per open long topic (see ThumbRefsConfig below)
  thumbRefs: ThumbRefsConfig,
});
export type MarketConfig = z.infer<typeof MarketConfig>;

/** Reference thumbnails are searched for every channel's long topics in one pass (owner, 2026-11-23: 10 a run, the
 * schema's most; market runs Mon and Thu, so 20 topics a week; the live search at render covers the rest). */
export const THUMB_REFS: ThumbRefsConfig = ThumbRefsConfig.parse({ perDay: 10, refreshDays: 7, keep: 8, minViews: 100_000 });

/** A channel's market config from its market.json, its search language from its channel.json `language`
 * ("en-gb" searches "en") unless the file names one. Throws when the file is unusable (no queries). */
export function channelMarket(raw: unknown, language?: string | null): MarketConfig {
  const lang = language?.split("-")[0]?.toLowerCase();
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return MarketConfig.parse({ ...(lang && lang.length >= 2 ? { relevanceLanguage: lang } : {}), ...obj });
}

/** Searches one channel's scan costs: every query in every region. */
export function searchCost(cfg: MarketConfig): number {
  return cfg.queries.length * new Set([cfg.regionCode, ...cfg.regions]).size;
}

/** Channels the market scan covers (config/channels.json `channels`): active or paused, and still in the repo. */
export function marketChannels(entries: Record<string, { status?: string }>, inRepo: string[]): string[] {
  const live = new Set(Object.entries(entries).filter(([, c]) => c.status === "active" || c.status === "paused").map(([id]) => id));
  return inRepo.filter((s) => live.has(s));
}

/** Which channels fit in the day's searches left, in order; the rest keep their last scan. `reserve` is held
 * back for the thumbnail-reference searches that follow. A channel too big for what's left is skipped, and a
 * smaller one after it can still go. */
export function planSearches(cfgs: [string, MarketConfig][], left: number, reserve = 0): { scan: string[]; skipped: string[] } {
  let budget = Math.max(0, left - reserve);
  const scan: string[] = [], skipped: string[] = [];
  for (const [slug, cfg] of cfgs) {
    const cost = searchCost(cfg);
    if (cost <= budget) { scan.push(slug); budget -= cost; } else skipped.push(slug);
  }
  return { scan, skipped };
}

export const SearchList = z.object({ items: z.array(z.object({ id: z.object({ videoId: z.string() }) })) });
export const VideoDetails = z.object({
  items: z.array(z.object({
    id: z.string(),
    snippet: z.object({ title: z.string(), channelTitle: z.string(), channelId: z.string().optional(), publishedAt: z.string(), defaultAudioLanguage: z.string().optional() }),
    contentDetails: z.object({ duration: z.string() }),
    statistics: z.object({ viewCount: z.string().optional(), likeCount: z.string().optional(), commentCount: z.string().optional() }),
  })),
});
export const ChannelList = z.object({
  items: z.array(z.object({ id: z.string(), statistics: z.object({ subscriberCount: z.string().optional(), hiddenSubscriberCount: z.boolean().optional() }) })).default([]),
});

/** Subscribers per channel id (null when the channel hides them). */
export function subscribersOf(list: z.infer<typeof ChannelList>["items"]): Map<string, number | null> {
  return new Map(list.map((c) => [c.id, c.statistics.hiddenSubscriberCount || c.statistics.subscriberCount === undefined ? null : Number(c.statistics.subscriberCount)]));
}

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
  /** the channel's subscribers, and views per subscriber: a video far past its channel's audience shows
   * demand for the topic itself, not for a big channel's fans (owner, 2026-11-11: "someone with millions
   * of subscribers, any video will work because they have the audience... the channel with huge views and
   * little subscribers is the right pick") */
  channelSubs?: number | null; outlier?: number | null; breakout?: boolean;
};

const SUBS_FLOOR = 1_000;   // a brand-new channel's 12 subscribers don't make every video a 1,000x outlier

/** Split into Shorts and long videos and rank each by views per hour since publishing. */
export function rankMarket(details: z.infer<typeof VideoDetails>["items"], queryOf: Map<string, string>, cfg: MarketConfig, now: Date,
  subsOf: Map<string, number | null> = new Map()) {
  const rows: MarketVideo[] = details.map((v) => {
    const views = Number(v.statistics.viewCount ?? 0);
    const hours = Math.max(1, (now.getTime() - Date.parse(v.snippet.publishedAt)) / 3_600_000);
    const sec = durationSec(v.contentDetails.duration);
    return {
      id: v.id, url: sec <= cfg.shortMaxSec ? `https://youtube.com/shorts/${v.id}` : `https://youtube.com/watch?v=${v.id}`,
      title: v.snippet.title, channel: v.snippet.channelTitle, publishedAt: v.snippet.publishedAt, durationSec: sec,
      views, likes: Number(v.statistics.likeCount ?? 0), comments: Number(v.statistics.commentCount ?? 0),
      viewsPerHour: Math.round(views / hours), query: queryOf.get(v.id) ?? "",
      ...outlierOf(views, v.snippet.channelId ? subsOf.get(v.snippet.channelId) : undefined, cfg.breakoutRatio),
    };
  }).filter((r) => r.durationSec > 0);
  const top = (xs: MarketVideo[]) => xs.sort((a, b) => b.viewsPerHour - a.viewsPerHour).slice(0, cfg.top);
  // breakouts first by views per subscriber: the topics people want whoever makes them
  const outliers = (xs: MarketVideo[]) => xs.filter((r) => r.breakout).sort((a, b) => (b.outlier ?? 0) - (a.outlier ?? 0) || b.viewsPerHour - a.viewsPerHour).slice(0, cfg.top);
  const isShort = (r: MarketVideo) => r.durationSec <= cfg.shortMaxSec;
  return {
    shorts: top(rows.filter(isShort)), long: top(rows.filter((r) => !isShort(r))),
    breakout: { ratio: cfg.breakoutRatio, shorts: outliers(rows.filter(isShort)), long: outliers(rows.filter((r) => !isShort(r))) },
  };
}

/** Views per subscriber and whether that makes a breakout; nothing when the subscribers are unknown. */
export function outlierOf(views: number, subs: number | null | undefined, ratio: number): Pick<MarketVideo, "channelSubs" | "outlier" | "breakout"> {
  if (subs === undefined) return {};
  if (subs === null) return { channelSubs: null, outlier: null, breakout: false };
  const outlier = Math.round((views / Math.max(subs, SUBS_FLOOR)) * 10) / 10;
  return { channelSubs: subs, outlier, breakout: outlier >= ratio };
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

/** Last run's references. An empty or broken file (the workflow's `git show > file` leaves an empty one when
 * the branch has none) means "nothing yet", never a crash: until 2026-11-11 that crash meant thumb-refs.json was
 * never written, so every long thumbnail fell back to generic examples instead of its own topic's hits. */
export function parsePrevRefs(text: string | null | undefined): Record<string, TopicRefs> {
  if (!text || !text.trim()) return {};
  try {
    const r = ThumbRefsFile.safeParse(JSON.parse(text));
    return r.success ? (r.data.topics as Record<string, TopicRefs>) : {};
  } catch {
    return {};
  }
}

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
