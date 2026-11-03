/**
 * Hourly snapshot of every published video's public counters (run by watchdog.yml), our own version of
 * Studio's "realtime" card: views per hour over the last 48 hours, for the channel and each video.
 * Kept 7 days. Reads the counters with the upload sign-in (videos.list, 1 quota unit per 50 videos).
 */
import { PrismaClient } from "@prisma/client";

import { youtubeConfigured } from "./lib/uploads.ts";
import { accessToken, videoInfo } from "./lib/youtube.ts";

const KEEP_MS = 7 * 86_400_000;

/** The start of the hour a moment falls in (UTC). */
export function hourOf(d: Date): Date {
  return new Date(Math.floor(d.getTime() / 3_600_000) * 3_600_000);
}

async function main(): Promise<void> {
  if (!youtubeConfigured()) return;
  const prisma = new PrismaClient();
  try {
    const token = await accessToken();
    const uploads = await prisma.upload.findMany({ where: { youtubeId: { not: null }, state: "published", video: { deletedAt: null } }, select: { id: true, youtubeId: true } });
    const info = await videoInfo(token, uploads.map((u) => u.youtubeId!));
    const hour = hourOf(new Date());
    const data = uploads.flatMap((u) => {
      const s = info.get(u.youtubeId!)?.statistics;
      return s ? [{ uploadId: u.id, hour, views: s.viewCount ?? 0, likes: s.likeCount ?? 0, comments: s.commentCount ?? 0 }] : [];
    });
    await prisma.liveSnapshot.createMany({ data, skipDuplicates: true });
    const { count } = await prisma.liveSnapshot.deleteMany({ where: { hour: { lt: new Date(Date.now() - KEEP_MS) } } });
    console.log(`snapshot ${hour.toISOString()}: ${data.length} videos, ${count} old rows removed`);
  } finally {
    await prisma.$disconnect();
  }
}

// a failed snapshot only leaves a gap in the hourly chart; it never fails the watchdog
try {
  await main();
} catch (e) {
  console.log(`::warning::snapshot skipped: ${e instanceof Error ? e.message : e}`);
}
