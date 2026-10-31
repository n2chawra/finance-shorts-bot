/**
 * Live YouTube counters. YouTube Analytics (the daily stats job) runs a day or two behind, but the
 * public view, like and comment counters on a video update within minutes. Pages that show views
 * await liveCounters() before reading; it asks YouTube at most every 30 s and stores the counters on
 * the Upload row, so every dashboard request reads current numbers from the database.
 *
 * YouTube's public counter can briefly return a lower, cached value, so a small dip keeps the larger
 * number, but a real drop (YouTube removed invalid views) is followed down: nextLiveCount() in
 * live-counter.ts. Two dashboard requests that finish out of order can at worst write a value a
 * minute old, which the next refresh corrects.
 *
 *   YT_API_KEY  a Google Cloud API key restricted to the YouTube Data API v3 (set in Netlify).
 *               Read-only, public data only: private videos have no public counters.
 *
 * Cost: 1 quota unit per 50 videos per refresh, so at most ~1,450 units a day with the dashboard
 * open all day, inside the 10,000 daily quota next to three Short uploads and a long one (4 × 1,600).
 */
import { z } from "zod";

import { notifyOwner } from "./autopilot.db";
import { nextLiveCount } from "./live-counter";
import { prisma } from "./prisma";

const FRESH_MS = 60_000;   // every other 30 s poll: keeps a dashboard left open all day under ~1,500 units
// Longest a page waits for YouTube before showing the stored numbers. A refresh is one YouTube call
// and one UPDATE, well under a second; the old 2.5 s cut-off (with one UPDATE per video) often fired
// first, and on Netlify the unfinished refresh then froze with the function and only landed on the
// next request, so a page showed old counts until you opened another one.
const WAIT_MS = 6_000;

const VideosResponse = z.object({
  items: z.array(z.object({
    id: z.string(),
    statistics: z.object({ viewCount: z.coerce.number().optional(), likeCount: z.coerce.number().optional(), commentCount: z.coerce.number().optional() }).optional(),
  })).default([]),
});

let inFlight: Promise<void> | null = null;

/** Refresh, waiting at most WAIT_MS, so the numbers a page reads next are current. */
export async function liveCounters(): Promise<void> {
  await publishDue().catch((e) => console.error("publish due:", e instanceof Error ? e.message : e));
  let timer: ReturnType<typeof setTimeout> | undefined;
  await Promise.race([refreshLiveStats(), new Promise<void>((ok) => { timer = setTimeout(ok, WAIT_MS); })]);
  clearTimeout(timer);
}

/**
 * A scheduled video is published the moment its time passes (owner, 2026-10-31: it showed
 * "scheduled" for hours, until the publish job's next run noticed). YouTube makes a scheduled
 * upload public at exactly that time, and a hand-posted one was posted then, so the dashboard flips
 * it itself on every read: two cheap updates, no YouTube call.
 */
export async function publishDue(now = new Date()): Promise<void> {
  const due = { state: "scheduled" as const, publishAt: { lte: now }, youtubeId: { not: null } };
  if (!(await prisma.upload.count({ where: due }))) return;
  await prisma.$transaction([
    prisma.upload.updateMany({ where: due, data: { state: "published", error: null } }),
    prisma.video.updateMany({ where: { status: "scheduled", deletedAt: null, upload: { is: { state: "published" } } }, data: { status: "published" } }),
  ]);
}

/** Refresh stale counters. Never throws: a YouTube hiccup must not break the page. */
export function refreshLiveStats(): Promise<void> {
  if (!process.env.YT_API_KEY) return Promise.resolve();
  inFlight ??= run().catch((e) => console.error("live stats:", e instanceof Error ? e.message : e)).finally(() => { inFlight = null; });
  return inFlight;
}

async function run(): Promise<void> {
  const stale = await prisma.upload.findMany({
    where: { youtubeId: { not: null }, state: { in: ["scheduled", "published"] }, video: { deletedAt: null }, OR: [{ liveAt: null }, { liveAt: { lt: new Date(Date.now() - FRESH_MS) } }] },
    select: { id: true, youtubeId: true, liveViews: true, liveLikes: true, liveComments: true },
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
    // private or deleted videos come back empty: null keeps their last counters and they are just
    // marked checked. One statement for the whole batch.
    const next = (u: (typeof batch)[number], k: "viewCount" | "likeCount" | "commentCount", stored: number | null) => {
      const s = found.get(u.youtubeId!);
      return nextLiveCount(stored, s ? s[k] ?? 0 : null);
    };
    await prisma.$executeRaw`UPDATE "Upload" AS u SET
      "liveViews" = d.views,
      "liveLikes" = d.likes,
      "liveComments" = d.comments,
      "liveAt" = ${new Date()}
      FROM unnest(${batch.map((u) => u.id)}::text[], ${batch.map((u) => next(u, "viewCount", u.liveViews))}::int[],
                  ${batch.map((u) => next(u, "likeCount", u.liveLikes))}::int[], ${batch.map((u) => next(u, "commentCount", u.liveComments))}::int[])
        AS d(id, views, likes, comments)
      WHERE u."id" = d.id`;
  }
}
