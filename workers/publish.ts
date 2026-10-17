/**
 * Publisher: fills today's upload slots, one video per slot, each uploaded private with publishAt so
 * YouTube makes it public at that time. Shorts use settings.uploadTimes (12:37 and 19:07 by
 * default), every day; long videos use settings.longUploadTimes on settings.longUploadDays
 * (20:07 IST on Tue, Thu and Sat by default). Each format is filled from its own queue, so a
 * missing long video never costs a Short its slot.
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
import { UPLOAD_LOOKAHEAD_HOURS, dueSoon, istDay, nextSlot, slotKey, youtubeMeta } from "./lib/publishing.ts";
import { loadSettings } from "./lib/settings.ts";
import { refreshPublished, youtubeConfigured } from "./lib/uploads.ts";
import { TOKEN_FIX, notify, resolve } from "./lib/notify.ts";
import { TokenError, accessToken, uploadVideo } from "./lib/youtube.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const MAX_ATTEMPTS = 3;
type Format = "short" | "long";

async function main(): Promise<void> {
  if (!youtubeConfigured()) return;
  const prisma = new PrismaClient();
  try {
    let token: string;
    try {
      token = await accessToken();
      await resolve(prisma, "youtube-token");
    } catch (e) {
      if (e instanceof TokenError) {
        await notify(prisma, { key: "youtube-token", source: "publish", severity: "critical", title: "YouTube sign-in stopped working",
          detail: `The publish job could not sign in to YouTube: ${e.message}. Nothing can be uploaded and stats stop updating until this is fixed.`, fix: TOKEN_FIX });
      }
      throw e;
    }
    const refreshed = await refreshPublished(prisma, token);
    if (refreshed.published.length || refreshed.stillPrivate.length || refreshed.missing.length) console.log("status check:", refreshed);

    const settings = await loadSettings(prisma);
    if (settings.uploadsPaused) return void console.log("Uploads are paused in settings. Nothing uploaded.");

    const now = new Date();
    const existing = await prisma.upload.findMany({
      where: { state: { in: ["scheduled", "uploaded", "published"] } },
      select: { publishAt: true, video: { select: { format: true } } },
    });
    const taken = new Set(existing.map((u) => slotKey(u.publishAt)));
    // one slot count per format: a long video on Tuesday must not use up a Short's slot that day
    const perDay: Record<Format, Map<string, number>> = { short: new Map(), long: new Map() };
    for (const u of existing) {
      const f: Format = u.video.format === "long" ? "long" : "short";
      const day = istDay(u.publishAt);
      perDay[f].set(day, (perDay[f].get(day) ?? 0) + 1);
    }

    for (const format of ["short", "long"] as const) {
      const times = format === "long" ? settings.longUploadTimes : settings.uploadTimes;
      const days = format === "long" ? settings.longUploadDays : undefined;
      if (!times.length || (format === "long" && !days?.length)) continue;
      let uploaded = 0;
      for (let n = 0; n < times.length; n++) {
        const slot = nextSlot(now, times, taken, perDay[format], 30, days);
        if (istDay(slot) !== istDay(now)) {
          console.log(uploaded ? `${format}: today's slots are filled. Next is ${slot.toISOString()}.`
            : `${format}: no free slot left today; next is ${slot.toISOString()}.`);
          break;
        }
        if (!dueSoon(now, slot)) {
          console.log(`${format}: the next slot, ${slot.toISOString()}, is more than ${UPLOAD_LOOKAHEAD_HOURS} h away; a later run fills it.`);
          break;
        }
        if (!(await uploadOne(prisma, token, settings.disclaimer, slot, format))) break;
        taken.add(slotKey(slot));
        perDay[format].set(istDay(slot), (perDay[format].get(istDay(slot)) ?? 0) + 1);
        uploaded++;
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

/** Upload the next `format` video for `slot`. False when there is nothing to upload; throws on failure. */
async function uploadOne(prisma: PrismaClient, token: string, disclaimer: string, slot: Date, format: Format): Promise<boolean> {
  // a video sent with "Upload now", or a retry of a failed attempt, goes first; then the queue
  const pending = await prisma.upload.findFirst({ where: { state: "pending", video: { deletedAt: null, format, status: { in: ["queued", "scheduled"] } } }, orderBy: { publishAt: "asc" }, include: { video: true } });
  const video = pending?.video ?? await prisma.video.findFirst({ where: { status: "queued", deletedAt: null, format }, orderBy: [{ queuePosition: "asc" }, { createdAt: "asc" }] });
  if (!video) { console.log(`::warning::No ${format} video is queued. Nothing to upload for ${slot.toISOString()}.`); return false; }

  const attempts = (pending?.attempts ?? 0) + 1;
  const dir = mkdtempSync(path.join(tmpdir(), "publish-"));
  try {
    const file = path.join(dir, "video.mp4");
    await downloadReleaseAsset(repoSlug(ROOT), `video-${video.id}`, "video.mp4", file);
    const meta = youtubeMeta(video, disclaimer, format);
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
      await notify(prisma, { key: `upload-failed:${video.id}`, source: "publish", severity: "warning", title: `Upload of ${video.id} failed 3 times`,
        detail: `"${video.title}" could not be uploaded to YouTube and was marked failed. Last error: ${error}`,
        fix: "1. Open the video in the dashboard and check the error.\n2. If it's a quota or YouTube outage, nothing to do: the next video takes the slot.\n3. If it keeps happening, open Actions → Publish in GitHub and read the log." });
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
