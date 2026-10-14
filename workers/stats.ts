/**
 * Stats: daily YouTube Analytics numbers for every uploaded video, up to yesterday (Analytics
 * lags by about a day), stored in VideoStat. Re-running overwrites the same days, so late
 * corrections from YouTube are picked up. Also marks videos published once they are public.
 */
import { PrismaClient } from "@prisma/client";

import { istDay } from "./lib/publishing.ts";
import { refreshPublished, youtubeConfigured } from "./lib/uploads.ts";
import { accessToken, dailyStats } from "./lib/youtube.ts";

const DAY_MS = 86_400_000;
const WINDOW_DAYS = 28;

async function main(): Promise<void> {
  if (!youtubeConfigured()) return;
  const prisma = new PrismaClient();
  try {
    const token = await accessToken();
    const refreshed = await refreshPublished(prisma, token);
    const yesterday = istDay(new Date(Date.now() - DAY_MS));
    const earliest = istDay(new Date(Date.now() - WINDOW_DAYS * DAY_MS));
    const uploads = await prisma.upload.findMany({ where: { youtubeId: { not: null }, state: { in: ["scheduled", "published"] } } });
    let rows = 0;
    const errors: string[] = [];
    for (const u of uploads) {
      const start = [istDay(u.publishAt), earliest].sort().at(-1)!;
      if (start > yesterday) continue;
      try {
        for (const s of await dailyStats(token, u.youtubeId!, start, yesterday)) {
          const day = new Date(`${s.day}T00:00:00Z`);
          const data = { views: s.views, likes: s.likes, comments: s.comments, subsGained: s.subsGained, avgViewPct: s.avgViewPct };
          await prisma.videoStat.upsert({ where: { uploadId_day: { uploadId: u.id, day } }, update: data, create: { uploadId: u.id, day, ...data } });
          rows++;
        }
      } catch (e) {
        errors.push(`${u.videoId}: ${e instanceof Error ? e.message : e}`);
      }
    }
    console.log(JSON.stringify({ uploads: uploads.length, statRows: rows, through: yesterday, ...refreshed, errors }, null, 2));
    if (errors.length) process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

try {
  await main();
} catch (e) {
  console.error(`::error::${e instanceof Error ? e.message : e}`);
  process.exitCode = 1;
}
