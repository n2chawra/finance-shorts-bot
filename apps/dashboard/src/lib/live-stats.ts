/**
 * Live YouTube counters. YouTube Analytics (the daily stats job) runs a day or two behind, but the
 * public view, like and comment counters on a video update within minutes. Pages that show views
 * call refreshLiveStats() first; it asks YouTube at most once a minute and stores the counters on
 * the Upload row, so every dashboard request reads current numbers from the database.
 *
 *   YT_API_KEY  a Google Cloud API key restricted to the YouTube Data API v3 (set in Netlify).
 *               Read-only, public data only: private videos have no public counters.
 *
 * Cost: 1 quota unit per 50 videos per refresh, so at most ~1,500 units a day with the dashboard
 * open all day, well inside the 10,000 daily quota next to one 1,600-unit upload.
 */
import { z } from "zod";

import { prisma } from "./prisma";

const FRESH_MS = 60_000;

const VideosResponse = z.object({
  items: z.array(z.object({
    id: z.string(),
    statistics: z.object({ viewCount: z.coerce.number().optional(), likeCount: z.coerce.number().optional(), commentCount: z.coerce.number().optional() }).optional(),
  })).default([]),
});

let inFlight: Promise<void> | null = null;

/** Refresh stale counters. Never throws: a YouTube hiccup must not break the page. */
export function refreshLiveStats(): Promise<void> {
  if (!process.env.YT_API_KEY) return Promise.resolve();
  inFlight ??= run().catch((e) => console.error("live stats:", e instanceof Error ? e.message : e)).finally(() => { inFlight = null; });
  return inFlight;
}

async function run(): Promise<void> {
  const stale = await prisma.upload.findMany({
    where: { youtubeId: { not: null }, state: { in: ["scheduled", "published"] }, OR: [{ liveAt: null }, { liveAt: { lt: new Date(Date.now() - FRESH_MS) } }] },
    select: { id: true, youtubeId: true },
  });
  for (let i = 0; i < stale.length; i += 50) {
    const batch = stale.slice(i, i + 50);
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "statistics");
    url.searchParams.set("id", batch.map((u) => u.youtubeId).join(","));
    url.searchParams.set("key", process.env.YT_API_KEY!);
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(`YouTube ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const found = new Map(VideosResponse.parse(await res.json()).items.map((it) => [it.id, it.statistics]));
    const now = new Date();
    await prisma.$transaction(batch.map((u) => {
      const s = found.get(u.youtubeId!);
      // private or deleted videos come back empty: keep the last counters, just mark them checked
      return prisma.upload.update({
        where: { id: u.id },
        data: s ? { liveViews: s.viewCount ?? 0, liveLikes: s.likeCount ?? 0, liveComments: s.commentCount ?? 0, liveAt: now } : { liveAt: now },
      });
    }));
  }
}
