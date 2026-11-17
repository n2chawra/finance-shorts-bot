/**
 * Niche scan (multi-channel plan, step 3a): the public numbers the quick verdict and the full research
 * stand on. For a channel being set up it reads the reference channels and the channels found by a few
 * niche searches, their last 6 months of uploads, and scores every video against its own channel's
 * median (lib/niche.ts).
 *
 *   npm run niche-scan -- <slug> [rawDir]           scan (YT_API_KEY, or channel #1's stored sign-in via DATABASE_URL)
 *   npm run niche-scan -- families <slug> <labels>  rank Claude's topic labels (video id → family) by the numbers
 *
 * Input:  channels/<slug>/research/scan-request.json { references, queries, region? }, else the
 *         channel's "Add channel" request (references; the niche as the query).
 * Output: channels/<slug>/research/scan.json  aggregates, channel ids, video ids and scores (kept)
 *         <rawDir>/<slug>.json                 titles and per-video numbers (YouTube API data: the
 *                                               workflow keeps it only on the replaced `niche-data` branch)
 *
 * Quota: ~2 searches per query (100 units each; queries capped at 6) plus 1-unit reads: about 1,000–1,500
 * units a scan, booked with the quota keeper as "stats" so it never eats into the day's uploads.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { DAY_MS, FamilyLabels, type ScanChannel, type ScanVideo, isoSeconds, kindOf, parseChannelRef, rankFamilies, score, summarise } from "./lib/niche.ts";
import { QuotaKeeper } from "./lib/quota.ts";
import { layout } from "./lib/channels.ts";
import { tokenOf } from "./lib/channel-auth.ts";
import { accessToken } from "./lib/youtube.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const API = "https://www.googleapis.com/youtube/v3";
const MONTHS = 6;
const MAX_QUERIES = 6;
const MAX_CHANNELS = 45;

export const ScanRequest = z.object({
  niche: z.string().default(""),
  references: z.array(z.string()).default([]),
  queries: z.array(z.string().min(2)).default([]),
  region: z.string().length(2).optional(),
});
type ScanRequest = z.infer<typeof ScanRequest>;

/** The research folder of a channel: channels/<slug>/research/ (created). */
function researchDir(slug: string): string {
  const dir = path.join(ROOT, "channels", slug, "research");
  mkdirSync(dir, { recursive: true });
  return dir;
}

/** Public reads with the Data API key, or with channel #1's sign-in when there is no key (as market.ts does). */
export type Auth = { key: string } | { bearer: string };

class Api {
  units = 0;
  constructor(private auth: Auth, private quota: QuotaKeeper | null) {}
  async get<T>(endpoint: string, params: Record<string, string>, schema: z.ZodType<T>, cost = 1): Promise<T> {
    if (this.quota && !this.quota.take("stats", cost)) throw new Error(`quota keeper refused ${endpoint} (${this.quota.used} units used today); try again after midnight Pacific`);
    this.units += cost;
    const q = new URLSearchParams({ ...params, ...("key" in this.auth ? { key: this.auth.key } : {}) });
    const res = await fetch(`${API}/${endpoint}?${q}`, "bearer" in this.auth ? { headers: { authorization: `Bearer ${this.auth.bearer}` } } : undefined);
    if (!res.ok) throw new Error(`${endpoint} ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return schema.parse(await res.json());
  }
}

const ChannelItems = z.object({ items: z.array(z.object({
  id: z.string(),
  // absent when only the id was asked for (resolving a reference's @handle)
  snippet: z.object({ title: z.string() }).loose().optional(),
  statistics: z.object({ subscriberCount: z.string().optional(), hiddenSubscriberCount: z.boolean().optional() }).loose().optional(),
  contentDetails: z.object({ relatedPlaylists: z.object({ uploads: z.string() }).loose() }).loose().optional(),
}).loose()).default([]) });
const SearchItems = z.object({ items: z.array(z.object({ id: z.object({ videoId: z.string().optional() }).loose(), snippet: z.object({ channelId: z.string() }).loose() }).loose()).default([]) });
const PlaylistItems = z.object({ nextPageToken: z.string().optional(), items: z.array(z.object({ contentDetails: z.object({ videoId: z.string(), videoPublishedAt: z.string().optional() }).loose() }).loose()).default([]) });
const VideoItems = z.object({ items: z.array(z.object({
  id: z.string(),
  snippet: z.object({ title: z.string(), channelId: z.string(), publishedAt: z.string() }).loose(),
  contentDetails: z.object({ duration: z.string() }).loose(),
  statistics: z.object({ viewCount: z.string().optional(), likeCount: z.string().optional(), commentCount: z.string().optional() }).loose(),
}).loose()).default([]) });

const CommentItems = z.object({ items: z.array(z.object({ snippet: z.object({ topLevelComment: z.object({ snippet: z.object({
  textDisplay: z.string(), likeCount: z.number().optional() }).loose() }).loose() }).loose() }).loose()).default([]) });

const chunks = <T,>(xs: T[], n: number) => Array.from({ length: Math.ceil(xs.length / n) }, (_, i) => xs.slice(i * n, i * n + n));

async function resolveReferences(api: Api, refs: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const r of refs) {
    const p = parseChannelRef(r);
    if (!p) { console.log(`::warning::not a YouTube channel link: ${r}`); continue; }
    if (p.id) { ids.push(p.id); continue; }
    const params: Record<string, string> = p.handle ? { forHandle: p.handle } : { forUsername: p.username! };
    const got = await api.get("channels", { part: "id", ...params }, ChannelItems);
    if (got.items[0]) ids.push(got.items[0].id);
    else console.log(`::warning::no channel found for ${r}`);
  }
  return [...new Set(ids)];
}

export async function scan(slug: string, req: ScanRequest, auth: Auth, quota: QuotaKeeper | null, now = new Date()) {
  const api = new Api(auth, quota);
  const since = new Date(now.getTime() - MONTHS * 30 * DAY_MS);
  const refIds = await resolveReferences(api, req.references);
  const queries = [...new Set([...(req.queries.length ? req.queries : [req.niche]).filter(Boolean)])].slice(0, MAX_QUERIES);

  // who the niche's searches surface, Shorts and longer videos separately
  const found = new Map<string, Set<string>>();
  for (const q of queries) {
    for (const videoDuration of ["short", "medium"]) {
      const r = await api.get("search", { part: "snippet", type: "video", q, order: "viewCount", maxResults: "50", videoDuration,
        publishedAfter: new Date(now.getTime() - 90 * DAY_MS).toISOString(), ...(req.region ? { regionCode: req.region } : {}) }, SearchItems, 100);
      for (const it of r.items) found.set(it.snippet.channelId, (found.get(it.snippet.channelId) ?? new Set()).add(q));
    }
  }
  const picked = [...refIds, ...[...found.entries()].filter(([id]) => !refIds.includes(id)).sort((a, b) => b[1].size - a[1].size).map(([id]) => id)].slice(0, MAX_CHANNELS);

  const channels: ScanChannel[] = [];
  const uploads = new Map<string, string>();
  for (const batch of chunks(picked, 50)) {
    const r = await api.get("channels", { part: "snippet,statistics,contentDetails", id: batch.join(","), maxResults: "50" }, ChannelItems);
    for (const c of r.items) {
      const subs = c.statistics?.hiddenSubscriberCount ? null : c.statistics?.subscriberCount ? Number(c.statistics.subscriberCount) : null;
      channels.push({ id: c.id, title: c.snippet?.title ?? c.id, subs, reference: refIds.includes(c.id), foundBy: [...(found.get(c.id) ?? [])] });
      if (c.contentDetails?.relatedPlaylists.uploads) uploads.set(c.id, c.contentDetails.relatedPlaylists.uploads);
    }
  }

  // each channel's uploads of the last 6 months (newest first; stop at the first older one)
  const videoIds: string[] = [];
  for (const [, playlistId] of uploads) {
    let page: string | undefined;
    for (let i = 0; i < 4; i++) {
      const r = await api.get("playlistItems", { part: "contentDetails", playlistId, maxResults: "50", ...(page ? { pageToken: page } : {}) }, PlaylistItems);
      const fresh = r.items.filter((it) => !it.contentDetails.videoPublishedAt || Date.parse(it.contentDetails.videoPublishedAt) >= since.getTime());
      videoIds.push(...fresh.map((it) => it.contentDetails.videoId));
      if (fresh.length < r.items.length || !r.nextPageToken) break;
      page = r.nextPageToken;
    }
  }
  const videos: ScanVideo[] = [];
  for (const batch of chunks([...new Set(videoIds)], 50)) {
    const r = await api.get("videos", { part: "snippet,contentDetails,statistics", id: batch.join(","), maxResults: "50" }, VideoItems);
    for (const v of r.items) {
      const durationSec = isoSeconds(v.contentDetails.duration);
      if (!durationSec) continue;   // live streams and premieres without a length
      videos.push({ id: v.id, channelId: v.snippet.channelId, title: v.snippet.title, publishedAt: v.snippet.publishedAt, durationSec, kind: kindOf(durationSec),
        views: Number(v.statistics.viewCount ?? 0), likes: Number(v.statistics.likeCount ?? 0), comments: Number(v.statistics.commentCount ?? 0) });
    }
  }

  const scored = score(videos, channels, now);
  const shortsSum = summarise(scored, "short", now), longSum = summarise(scored, "long", now);

  // what viewers ask for under the hits (the topic list in their own words): 1 unit a video
  const comments: Record<string, { text: string; likes: number }[]> = {};
  for (const id of [...shortsSum.topIds.slice(0, 15), ...longSum.topIds.slice(0, 10)]) {
    try {
      const r = await api.get("commentThreads", { part: "snippet", videoId: id, order: "relevance", maxResults: "30", textFormat: "plainText" }, CommentItems);
      comments[id] = r.items.map((c) => ({ text: c.snippet.topLevelComment.snippet.textDisplay, likes: c.snippet.topLevelComment.snippet.likeCount ?? 0 }));
    } catch (e) {
      // comments off on that video, or quota: the research works without them
      console.log(`no comments for ${id}: ${e instanceof Error ? e.message.slice(0, 80) : e}`);
    }
  }

  const kept = {
    note: "Aggregates and ids from the niche scan (workers/niche-scan.ts). Titles and per-video API numbers live only on the niche-data branch.",
    slug, scannedAt: now.toISOString(), units: api.units, request: req, queries,
    channels: channels.map((c) => ({ id: c.id, subs: c.subs, reference: c.reference, foundBy: c.foundBy, videos: scored.filter((v) => v.channelId === c.id).length })),
    shorts: shortsSum,
    long: longSum,
    scores: Object.fromEntries(scored.filter((v) => v.outlier != null).map((v) => [v.id, [v.kind, Math.round(v.outlier! * 100) / 100, v.small ? 1 : 0]])),
  };
  const raw = { slug, scannedAt: now.toISOString(), channels, videos: scored, comments };
  return { kept, raw };
}

async function requestFor(slug: string): Promise<ScanRequest> {
  const file = path.join(researchDir(slug), "scan-request.json");
  if (existsSync(file)) return ScanRequest.parse(JSON.parse(readFileSync(file, "utf8")));
  if (!process.env.DATABASE_URL) throw new Error(`no ${file} and no DATABASE_URL to read the channel's request from`);
  const prisma = new PrismaClient();
  try {
    const ch = await prisma.channel.findUnique({ where: { id: slug } });
    const r = ((ch?.settings ?? {}) as { request?: { niche?: string; references?: string[] } }).request;
    if (!r) throw new Error(`channel ${slug} has no Add-channel request`);
    return ScanRequest.parse({ niche: r.niche ?? "", references: r.references ?? [], queries: r.niche ? [r.niche] : [] });
  } finally {
    await prisma.$disconnect();
  }
}

/** Rank Claude's topic labels by the scan's numbers: research/families.json. */
function families(slug: string, labelsFile: string, rawFile: string): void {
  const labels = FamilyLabels.parse(JSON.parse(readFileSync(labelsFile, "utf8")));
  const raw = JSON.parse(readFileSync(rawFile, "utf8")) as { videos: Parameters<typeof rankFamilies>[0] };
  const rows = rankFamilies(raw.videos, labels);
  const out = path.join(researchDir(slug), "families.json");
  writeFileSync(out, JSON.stringify({ note: "Topic families ranked by hit rate and median outlier (small channels count double). Tiers: core ≥1.5× or ≥20% hits; avoid <0.7×; unknown under 5 scored videos.", rankedAt: new Date().toISOString(), families: rows }, null, 2) + "\n");
  console.log(JSON.stringify(rows.map((r) => ({ family: r.family, kind: r.kind, n: r.n, x: r.medianOutlier, hits: r.hitRate, tier: r.tier })), null, 1));
}

async function main(): Promise<void> {
  const [a, b, c] = process.argv.slice(2);
  if (a === "families") {
    if (!b || !c) throw new Error("usage: niche-scan families <slug> <labels.json> [raw.json]");
    families(b, c, process.argv[5] ?? path.join(ROOT, ".niche-data", `${b}.json`));
    return;
  }
  const slug = a;
  if (!slug || !/^[a-z0-9][a-z0-9-]{1,40}$/.test(slug)) throw new Error("usage: niche-scan <slug> [rawDir]");
  const req = await requestFor(slug);
  let prisma: PrismaClient | null = null, quota: QuotaKeeper | null = null;
  if (process.env.DATABASE_URL) {
    prisma = new PrismaClient();
    quota = await QuotaKeeper.load(prisma);
  }
  try {
    let auth: Auth;
    if (process.env.YT_API_KEY) auth = { key: process.env.YT_API_KEY };
    else {
      // channel #1's sign-in reads public data too (youtube.readonly), on the same project quota
      const ch = prisma ? await prisma.channel.findUnique({ where: { id: layout().default } }) : null;
      const t = ch ? tokenOf(ch) : null;
      if (!t) throw new Error("no YT_API_KEY and no stored sign-in to read YouTube with");
      auth = { bearer: await accessToken(t.refreshToken, t.client) };
    }
    const { kept, raw } = await scan(slug, req, auth, quota);
    writeFileSync(path.join(researchDir(slug), "scan.json"), JSON.stringify(kept, null, 1) + "\n");
    // a channel being set up: the Channels page says the scan is done and the verdict comes next
    if (slug !== layout().default) {
      const setupFile = path.join(ROOT, "channels", slug, "setup.json");
      const prev = existsSync(setupFile) ? JSON.parse(readFileSync(setupFile, "utf8")) as { stage?: string } : {};
      if (!prev.stage || prev.stage === "scanning") writeFileSync(setupFile, JSON.stringify({ stage: "scanning",
        note: `Scan done: ${kept.channels.length} channels, ${kept.shorts.videos} Shorts and ${kept.long.videos} long videos. The quick verdict is written next on your PC.` }, null, 2) + "\n");
    }
    const rawDir = b ?? path.join(ROOT, ".niche-data");
    mkdirSync(rawDir, { recursive: true });
    writeFileSync(path.join(rawDir, `${slug}.json`), JSON.stringify(raw) + "\n");
    const s = kept.shorts, l = kept.long;
    console.log(JSON.stringify({ slug, units: kept.units, channels: kept.channels.length,
      shorts: { videos: s.videos, medianViews90d: s.medianViews90d, smallWithHit: `${s.smallChannelsWithHit}/${s.smallChannels}`, direction: s.direction },
      long: { videos: l.videos, medianViews90d: l.medianViews90d, smallWithHit: `${l.smallChannelsWithHit}/${l.smallChannels}`, direction: l.direction } }, null, 2));
  } finally {
    await quota?.save();
    await prisma?.$disconnect();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  try {
    await main();
  } catch (e) {
    console.error(`::error::${e instanceof Error ? e.message : e}`);
    process.exitCode = 1;
  }
}
