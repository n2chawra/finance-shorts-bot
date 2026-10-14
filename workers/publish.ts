/**
 * Publisher: uploads one video to YouTube for today's slot (settings.uploadTime IST, 19:07 by
 * default), private with publishAt, so YouTube makes it public at that time.
 *
 * Runs a few times a day; only the first successful run uploads, the others find today's slot
 * taken and stop. A video clicked "Upload now" in the dashboard goes before the queue. A failed
 * upload is retried on the next run, and after 3 attempts the video is marked failed.
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { PrismaClient } from "@prisma/client";

import { downloadReleaseAsset, repoSlug } from "./lib/github.ts";
import { istDay, nextSlot, youtubeMeta } from "./lib/publishing.ts";
import { loadSettings } from "./lib/settings.ts";
import { refreshPublished, youtubeConfigured } from "./lib/uploads.ts";
import { TokenError, accessToken, uploadVideo } from "./lib/youtube.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const MAX_ATTEMPTS = 3;

async function main(): Promise<void> {
  if (!youtubeConfigured()) return;
  const prisma = new PrismaClient();
  try {
    const token = await accessToken();
    const refreshed = await refreshPublished(prisma, token);
    if (refreshed.published.length || refreshed.stillPrivate.length || refreshed.missing.length) console.log("status check:", refreshed);

    const settings = await loadSettings(prisma);
    if (settings.uploadsPaused) return void console.log("Uploads are paused in settings. Nothing uploaded.");

    const now = new Date();
    const taken = new Set((await prisma.upload.findMany({ where: { state: { in: ["scheduled", "uploaded", "published"] } }, select: { publishAt: true } })).map((u) => istDay(u.publishAt)));
    const slot = nextSlot(now, settings.uploadTime, taken);
    if (istDay(slot) !== istDay(now)) return void console.log(`Today's slot is taken or too close; next free slot is ${slot.toISOString()}. Nothing uploaded.`);

    // a video sent with "Upload now", or a retry of a failed attempt, goes first; then the queue
    const pending = await prisma.upload.findFirst({ where: { state: "pending", video: { deletedAt: null, status: { in: ["queued", "scheduled"] } } }, orderBy: { publishAt: "asc" }, include: { video: true } });
    const video = pending?.video ?? await prisma.video.findFirst({ where: { status: "queued", deletedAt: null }, orderBy: [{ queuePosition: "asc" }, { createdAt: "asc" }] });
    if (!video) return void console.log("::warning::The queue is empty. Nothing to upload.");

    const attempts = (pending?.attempts ?? 0) + 1;
    const dir = mkdtempSync(path.join(tmpdir(), "publish-"));
    try {
      const file = path.join(dir, "video.mp4");
      await downloadReleaseAsset(repoSlug(ROOT), `video-${video.id}`, "video.mp4", file);
      const meta = youtubeMeta(video, settings.disclaimer);
      const youtubeId = await uploadVideo(token, file, { ...meta, publishAt: slot });
      await prisma.$transaction([
        prisma.upload.upsert({
          where: { videoId: video.id },
          update: { youtubeId, publishAt: slot, state: "scheduled", attempts, error: null },
          create: { videoId: video.id, youtubeId, publishAt: slot, state: "scheduled", attempts },
        }),
        prisma.video.update({ where: { id: video.id }, data: { status: "scheduled", queuePosition: null } }),
      ]);
      await renumberQueue(prisma);
      console.log(JSON.stringify({ uploaded: video.id, youtubeId, publishAt: slot.toISOString(), attempts }, null, 2));
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      const gaveUp = attempts >= MAX_ATTEMPTS && !(e instanceof TokenError);
      await prisma.upload.upsert({
        where: { videoId: video.id },
        update: { state: gaveUp ? "failed" : "pending", attempts, error },
        create: { videoId: video.id, publishAt: slot, state: gaveUp ? "failed" : "pending", attempts, error },
      });
      if (gaveUp) {
        await prisma.video.update({ where: { id: video.id }, data: { status: "failed", failReason: `Upload failed ${attempts} times: ${error}`, queuePosition: null } });
        await renumberQueue(prisma);
      }
      throw new Error(`${video.id}: attempt ${attempts} of ${MAX_ATTEMPTS} failed${gaveUp ? ", giving up" : ""}: ${error}`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function renumberQueue(prisma: PrismaClient): Promise<void> {
  const queued = await prisma.video.findMany({ where: { status: "queued", deletedAt: null }, orderBy: [{ queuePosition: "asc" }, { createdAt: "asc" }], select: { id: true } });
  await prisma.$transaction(queued.map((v, i) => prisma.video.update({ where: { id: v.id }, data: { queuePosition: i + 1 } })));
}

try {
  await main();
} catch (e) {
  console.error(`::error::${e instanceof Error ? e.message : e}`);
  process.exitCode = 1;
}
