/**
 * Publisher: fills today's upload slots (settings.uploadTimes IST, 12:37 and 19:07 by default), one
 * video per slot, each uploaded private with publishAt so YouTube makes it public at that time.
 *
 * Runs a few times a day; the first run uploads for every free slot still ahead today, later runs
 * find the slots taken and stop. Never more uploads in a day than there are slots. A video clicked
 * "Upload now" in the dashboard goes before the queue. A failed upload stops the run and is retried
 * on the next one; after 3 attempts the video is marked failed.
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { PrismaClient } from "@prisma/client";

import { downloadReleaseAsset, repoSlug } from "./lib/github.ts";
import { istDay, nextSlot, slotKey, youtubeMeta } from "./lib/publishing.ts";
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
    const existing = await prisma.upload.findMany({ where: { state: { in: ["scheduled", "uploaded", "published"] } }, select: { publishAt: true } });
    const taken = new Set(existing.map((u) => slotKey(u.publishAt)));
    const perDay = new Map<string, number>();
    for (const u of existing) perDay.set(istDay(u.publishAt), (perDay.get(istDay(u.publishAt)) ?? 0) + 1);

    let uploaded = 0;
    for (let n = 0; n < settings.uploadTimes.length; n++) {
      const slot = nextSlot(now, settings.uploadTimes, taken, perDay);
      if (istDay(slot) !== istDay(now)) {
        console.log(uploaded ? `Today's slots are filled. Next free slot is ${slot.toISOString()}.` : `No free slot left today; next is ${slot.toISOString()}. Nothing uploaded.`);
        break;
      }
      if (!(await uploadOne(prisma, token, settings.disclaimer, slot))) break;
      taken.add(slotKey(slot));
      perDay.set(istDay(slot), (perDay.get(istDay(slot)) ?? 0) + 1);
      uploaded++;
    }
  } finally {
    await prisma.$disconnect();
  }
}

/** Upload the next video for `slot`. False when there is nothing to upload; throws on failure. */
async function uploadOne(prisma: PrismaClient, token: string, disclaimer: string, slot: Date): Promise<boolean> {
  // a video sent with "Upload now", or a retry of a failed attempt, goes first; then the queue
  const pending = await prisma.upload.findFirst({ where: { state: "pending", video: { deletedAt: null, status: { in: ["queued", "scheduled"] } } }, orderBy: { publishAt: "asc" }, include: { video: true } });
  const video = pending?.video ?? await prisma.video.findFirst({ where: { status: "queued", deletedAt: null }, orderBy: [{ queuePosition: "asc" }, { createdAt: "asc" }] });
  if (!video) { console.log("::warning::The queue is empty. Nothing to upload."); return false; }

  const attempts = (pending?.attempts ?? 0) + 1;
  const dir = mkdtempSync(path.join(tmpdir(), "publish-"));
  try {
    const file = path.join(dir, "video.mp4");
    await downloadReleaseAsset(repoSlug(ROOT), `video-${video.id}`, "video.mp4", file);
    const meta = youtubeMeta(video, disclaimer);
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
    return true;
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
