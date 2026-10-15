/**
 * Live YouTube counters. YouTube Analytics (the daily stats job) runs a day or two behind, but the
 * public view, like and comment counters on a video update within minutes. Pages that show views
 * await liveCounters() before reading; it asks YouTube at most every 30 s and stores the counters on
 * the Upload row, so every dashboard request reads current numbers from the database.
 *
 * Counters only ever go up here: YouTube's public counter can briefly return a lower, cached value,
 * and two dashboard requests can finish out of order, so each write keeps the larger number (SQL
 * GREATEST, safe across concurrent serverless instances).
 *
 *   YT_API_KEY  a Google Cloud API key restricted to the YouTube Data API v3 (set in Netlify).
 *               Read-only, public data only: private videos have no public counters.
 *
 * Cost: 1 quota unit per 50 videos per refresh, so at most ~2,900 units a day with the dashboard
 * open all day, inside the 10,000 daily quota next to two 1,600-unit uploads.
 */
import { z } from "zod";

import { notifyOwner } from "./autopilot.db";
import { prisma } from "./prisma";

const FRESH_MS = 30_000;   // matches the dashboard's 30 s polling
const WAIT_MS = 2_500;     // longest a page waits for YouTube before showing the stored numbers

const VideosResponse = z.object({
  items: z.array(z.object({
    id: z.string(),
    statistics: z.object({ viewCount: z.coerce.number().optional(), likeCount: z.coerce.number().optional(), commentCount: z.coerce.number().optional() }).optional(),
  })).default([]),
});

let inFlight: Promise<void> | null = null;

/** Refresh, waiting at most WAIT_MS, so the numbers a page reads next are current. */
export async function liveCounters(): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  await Promise.race([refreshLiveStats(), new Promise<void>((ok) => { timer = setTimeout(ok, WAIT_MS); })]);
  clearTimeout(timer);
}

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
    if (!res.ok) {
      const body = (await res.text()).slice(0, 200);
      if (res.status === 400 || res.status === 403) {
        await notifyOwner({ key: "dashboard-yt-api-key", severity: "warning", title: "Live view counts stopped updating",
          detail: `YouTube rejected the dashboard's API key (HTTP ${res.status}): ${body}`,
          fix: "1. Google Cloud console → APIs & Services → Credentials: check the key exists and is restricted to YouTube Data API v3 (or create a new one).\n2. If the daily quota ran out, it resets at midnight Pacific time; nothing to do.\n3. Otherwise put the key in Netlify → Environment variables → YT_API_KEY and trigger a deploy. Then mark this resolved." });
      }
      throw new Error(`YouTube ${res.status}: ${body}`);
    }
    const found = new Map(VideosResponse.parse(await res.json()).items.map((it) => [it.id, it.statistics]));
    const now = new Date();
    await prisma.$transaction(batch.map((u) => {
      const s = found.get(u.youtubeId!);
      // private or deleted videos come back empty: keep the last counters, just mark them checked
      if (!s) return prisma.upload.update({ where: { id: u.id }, data: { liveAt: now } });
      return prisma.$executeRaw`UPDATE "Upload" SET
        "liveViews" = GREATEST(COALESCE("liveViews", 0), ${s.viewCount ?? 0}),
        "liveLikes" = GREATEST(COALESCE("liveLikes", 0), ${s.likeCount ?? 0}),
        "liveComments" = GREATEST(COALESCE("liveComments", 0), ${s.commentCount ?? 0}),
        "liveAt" = ${now}
        WHERE "id" = ${u.id}`;
    }));
  }
}
