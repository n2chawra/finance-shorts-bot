/**
 * Stats: daily YouTube Analytics numbers for every uploaded video, from its publish day up to
 * yesterday (Analytics lags by about a day), stored in VideoStat, plus each video's audience
 * retention curve and its hook score (lib/retention.ts) on the Upload. Also marks videos published.
 *
 * YouTube's developer policies allow stored analytics only if they are refreshed at least every
 * 30 days. So every run replaces each video's full history (up to a year) with fresh numbers, and
 * if YouTube access is lost (token revoked or expired) and nothing has been refreshed for 30 days,
 * the stored stats are deleted.
 */
import { Prisma, PrismaClient } from "@prisma/client";

import { istDay } from "./lib/publishing.ts";
import { refreshPublished, youtubeConfigured } from "./lib/uploads.ts";
import { TOKEN_FIX, notify, resolve } from "./lib/notify.ts";
import { hookHold } from "./lib/retention.ts";
import { TokenError, accessToken, dailyStats, retentionCurve } from "./lib/youtube.ts";

const DAY_MS = 86_400_000;
const KEEP_DAYS = 365;       // history fetched and kept per video
const STALE_DAYS = 30;       // policy limit for unrefreshed API data
const REFRESHED_KEY = "statsRefreshedAt";

async function deleteIfStale(prisma: PrismaClient): Promise<boolean> {
  const row = await prisma.setting.findUnique({ where: { key: REFRESHED_KEY } });
  const last = typeof row?.value === "string" ? Date.parse(row.value) : 0;
  if (Date.now() - last < STALE_DAYS * DAY_MS) return false;
  const { count } = await prisma.videoStat.deleteMany();
  await prisma.upload.updateMany({ data: { retention: Prisma.DbNull, hookHold: null, retentionAt: null } });
  console.log(`::warning::YouTube stats could not be refreshed for ${STALE_DAYS} days, so ${count} stored rows were deleted.`);
  return true;
}

async function main(): Promise<void> {
  if (!youtubeConfigured()) return;
  const prisma = new PrismaClient();
  try {
    let token: string;
    try {
      token = await accessToken();
    } catch (e) {
      if (e instanceof TokenError) {
        await deleteIfStale(prisma);
        await notify(prisma, { key: "youtube-token", source: "stats", severity: "critical", title: "YouTube sign-in stopped working",
          detail: `The stats job could not sign in to YouTube: ${e.message}. Views and analytics stop updating, and uploads fail, until this is fixed.`, fix: TOKEN_FIX });
      }
      throw e;
    }
    const refreshed = await refreshPublished(prisma, token);
    const yesterday = istDay(new Date(Date.now() - DAY_MS));
    const earliest = istDay(new Date(Date.now() - KEEP_DAYS * DAY_MS));
    const uploads = await prisma.upload.findMany({ where: { youtubeId: { not: null }, state: { in: ["scheduled", "published"] } }, include: { video: { select: { format: true, durationSec: true } } } });
    let rows = 0;
    const errors: string[] = [];
    for (const u of uploads) {
      const start = [istDay(u.publishAt), earliest].sort().at(-1)!;
      if (start > yesterday) continue;
      try {
        const days = await dailyStats(token, u.youtubeId!, start, yesterday);
        // replace this video's history in one go: every stored row is fresh after the run
        await prisma.$transaction([
          prisma.videoStat.deleteMany({ where: { uploadId: u.id } }),
          prisma.videoStat.createMany({
            data: days.map((s) => ({ uploadId: u.id, day: new Date(`${s.day}T00:00:00Z`), views: s.views, likes: s.likes, comments: s.comments, subsGained: s.subsGained, avgViewPct: s.avgViewPct })),
          }),
        ]);
        rows += days.length;
        // the retention curve and the hook score from it (empty until YouTube has enough views)
        const curve = await retentionCurve(token, u.youtubeId!, start, yesterday);
        const format = u.video.format === "long" ? "long" : "short";
        await prisma.upload.update({ where: { id: u.id }, data: {
          retention: curve.length ? curve : Prisma.DbNull, hookHold: hookHold(curve, u.video.durationSec, format), retentionAt: new Date(),
        } });
      } catch (e) {
        errors.push(`${u.videoId}: ${e instanceof Error ? e.message : e}`);
      }
    }
    await prisma.videoStat.deleteMany({ where: { day: { lt: new Date(`${earliest}T00:00:00Z`) } } });
    if (!errors.length) {
      const now = new Date().toISOString();
      await prisma.setting.upsert({ where: { key: REFRESHED_KEY }, update: { value: now }, create: { key: REFRESHED_KEY, value: now } });
    }
    console.log(JSON.stringify({ uploads: uploads.length, statRows: rows, through: yesterday, ...refreshed, errors }, null, 2));
    if (errors.length) {
      await notify(prisma, { key: "stats-errors", source: "stats", severity: "warning", title: "Some YouTube stats could not be read",
        detail: errors.slice(0, 5).join("\n"), fix: "Usually temporary. If it lasts more than a day, open Actions → Stats in GitHub and read the log." });
      process.exitCode = 1;
    } else {
      await resolve(prisma, "stats-errors");
      await resolve(prisma, "youtube-token");
    }
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
