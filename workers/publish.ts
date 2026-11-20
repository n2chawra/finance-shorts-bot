/**
 * Publisher: fills today's upload slots (Shorts every settings.shortEveryDays days: 2 in the 48-hour
 * test of November 2026), the owner's pick first, then the queue order. One video per slot, each uploaded private with publishAt so
 * YouTube makes it public at that time. Shorts use settings.uploadTimes (07:07, 12:37 and 19:07 by
 * default), every day, plus settings.trendUploadTimes (16:07 and 22:07): extra slots, one opening
 * for each breaking or trending video of the day (it takes that video, or the next one if the trend
 * already took a regular slot), left empty on quiet days. Long videos use
 * settings.longUploadTimes on settings.longUploadDays (20:07 IST on Wednesday and Friday by default). Each format is filled from its own queue, so a
 * missing long video never costs a Short its slot.
 *
 * Runs a few times a day; the first run uploads for every free slot still ahead today, later runs
 * find the slots taken and stop. Never more uploads in a day than there are slots, except by hand.
 * GitHub starts cron runs hours late (9 Nov 2026: the 07:07 and 19:07 Shorts were lost), so a slot is
 * filled until MIN_LEAD_MINUTES before it, and one that passed in the last CATCH_UP_HOURS without an
 * upload is caught up: its video goes public ~15 minutes after the run. A video clicked "Upload now"
 * in the dashboard is uploaded on the next run, public ~15 minutes later; `UPLOAD_NOW=<n>` (the
 * workflow's manual input) uploads the next n queued Shorts the same way. A failed upload stops the
 * run and is retried on the next one; after 3 attempts the video is marked failed.
 */
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { PrismaClient, type Prisma } from "@prisma/client";

import { downloadReleaseAsset, repoSlug } from "./lib/github.ts";
import {
  MIN_LEAD_MINUTES, UPLOAD_LOOKAHEAD_HOURS, dueSoon, isQuotaMiss, isUrgent, istDay, istSlot, istTime, missedSlots, nextSlot, quotaError, slotKey, soonSlot, youtubeMeta,
} from "./lib/publishing.ts";
import { loadSettings, type Settings } from "./lib/settings.ts";
import { refreshPublished, youtubeClientConfigured } from "./lib/uploads.ts";
import { TOKEN_FIX, notify, resolve } from "./lib/notify.ts";
import { TokenError, UPLOAD_CATEGORY, accessToken, categoryOf, setThumbnail, uploadVideo } from "./lib/youtube.ts";
import { coverFile } from "./lib/cover.ts";
import { channelPack, cpath, layout } from "./lib/channels.ts";
import { activeChannels, channelSettings, tokenOf, type ChannelToken } from "./lib/channel-auth.ts";
import { COST, QuotaKeeper } from "./lib/quota.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const MAX_ATTEMPTS = 3;
type Format = "short" | "long";

/** One channel's run: its id, its settings and the shared quota. Channel #1's notification keys keep their old names. */
type Run = { channelId: string; settings: Settings; quota: QuotaKeeper; key: (k: string) => string; label: string; category: string };

/** Our designed cover instead of the frame YouTube picks (owner, 2026-11-03: "the thumbnail is wrong").
 * The video is already uploaded, so a refused cover is reported, never a failed upload. */
async function applyCover(prisma: PrismaClient, run: Run, token: string, videoId: string, youtubeId: string, style: unknown): Promise<void> {
  const dir = path.join(cpath(ROOT, "videos"), videoId);
  const file = coverFile(dir, style);   // the owner's pick, else Studio's (long videos have three; lib/cover.ts)
  if (!file) return void console.log(`${videoId}: no cover in the repo; YouTube picks a frame`);
  if (!run.quota.take("thumbnail", COST.thumbnail)) return void console.log(`${videoId}: no quota left for the cover today; YouTube picks a frame`);
  try {
    await setThumbnail(token, youtubeId, file);
    console.log(`${videoId}: cover set from ${path.basename(file)}`);
    await resolve(prisma, run.key("cover-refused"));
  } catch (e) {
    const why = e instanceof Error ? e.message : String(e);
    console.log(`${videoId}: ${why}`);
    await notify(prisma, { key: run.key("cover-refused"), channelId: run.channelId, source: "publish", severity: "warning", title: "YouTube didn't take our cover",
      detail: `${videoId} (${youtubeId}) went up with YouTube's own frame as its cover: ${why}`,
      fix: "If it says the account can't set custom thumbnails: verify the channel (youtube.com/verify, a phone number) and features such as custom thumbnails turn on. Then set this cover by hand in YouTube Studio, or ask Claude to re-apply it." });
  }
}

/** Every active channel in turn, each with its own token and settings; one failing channel doesn't stop the others. */
async function main(): Promise<void> {
  if (!youtubeClientConfigured()) return;
  const prisma = new PrismaClient();
  const failures: string[] = [];
  try {
    const base = await loadSettings(prisma);
    const quota = await QuotaKeeper.load(prisma);
    const channels = await activeChannels(prisma);
    if (!channels.length) console.log("No active channel. Nothing to do.");
    for (const ch of channels) {
      const first = ch.id === layout().default;
      const run: Run = { channelId: ch.id, settings: channelSettings(base, ch.settings), quota,
        key: (k) => (first ? k : `${k}:${ch.id}`), label: first ? "" : `${ch.name}: `,
        // the channel's own upload category (its pack); channel #1 keeps categoryOf's single category
        category: first ? UPLOAD_CATEGORY : channelPack(ch.id).uploadCategory };
      console.log(`== ${ch.name} (${ch.id})`);
      try {
        await publishChannel(prisma, run, tokenOf(ch));
      } catch (e) {
        console.error(`::error::${ch.id}: ${e instanceof Error ? e.message : e}`);
        failures.push(ch.id);
      } finally {
        await quota.save();
      }
    }
    if (quota.shouldWarn()) {
      await quota.save();
      await notify(prisma, { key: `quota-high:${quota.snapshot().day}`, channelId: null, source: "publish", severity: "warning", title: "YouTube API quota is over 80% today",
        detail: `Used today: ${quota.summary()} (${JSON.stringify(quota.snapshot().byKind)}). Uploads still go first; stats and live counters wait for tomorrow's quota.`,
        fix: "Nothing to do today. If this happens often, apply for a quota increase (YouTube API Services audit form) or lower a channel's videos a day." });
    }
  } finally {
    await prisma.$disconnect();
  }
  if (failures.length) throw new Error(`publishing failed for ${failures.join(", ")}`);
}

async function publishChannel(prisma: PrismaClient, run: Run, refreshToken: ChannelToken | null): Promise<void> {
  const { channelId, settings } = run;
  if (!refreshToken) return void console.log(`::notice::${channelId} is not connected to YouTube yet. Nothing uploaded.`);
  {
    let token: string;
    try {
      token = await accessToken(refreshToken.refreshToken, refreshToken.client);
      await resolve(prisma, run.key("youtube-token"));
    } catch (e) {
      if (e instanceof TokenError) {
        await notify(prisma, { key: run.key("youtube-token"), channelId, source: "publish", severity: "critical", title: `${run.label}YouTube sign-in stopped working`,
          detail: `The publish job could not sign in to YouTube: ${e.message}. Nothing can be uploaded and stats stop updating until this is fixed.`, fix: TOKEN_FIX });
      }
      throw e;
    }
    const refreshed = await refreshPublished(prisma, token, new Date(), channelId);
    if (refreshed.published.length || refreshed.stillPrivate.length || refreshed.missing.length) console.log("status check:", refreshed);

    if (settings.uploadsPaused) return void console.log("Uploads are paused in settings. Nothing uploaded.");

    const now = new Date();
    const existing = await prisma.upload.findMany({
      where: { state: { in: ["scheduled", "uploaded", "published"] }, video: { deletedAt: null, channelId } },
      select: { publishAt: true, video: { select: { format: true } } },
    });
    const taken = new Set(existing.map((u) => slotKey(u.publishAt)));
    const uploadsOf = (f: Format) => existing.filter((u) => (u.video.format === "long" ? "long" : "short") === f).map((u) => u.publishAt);
    let soon = 0;   // videos sent to go public in a few minutes this run, spaced 5 minutes apart
    // `forSlot`: the missed slot a catch-up fills (recorded on a quota miss as the slot the video was meant for)
    const sendSoon = async (format: Format, pendingOnly = false, forSlot?: Date): Promise<boolean> => {
      const at = soonSlot(now, soon);
      if (!(await uploadOne(prisma, run, token, settings.disclaimer, at, format, pendingOnly ? "pending-now" : "queue", forSlot))) return false;
      soon++;
      taken.add(slotKey(at));
      existing.push({ publishAt: at, video: { format } });
      return true;
    };
    // "Upload now" from the dashboard, then the owner's manual count from the workflow input
    for (const format of ["short", "long"] as const) while (await sendSoon(format, true));
    const manual = Math.max(0, Math.min(5, Number(process.env.UPLOAD_NOW) || 0));
    for (let i = 0; i < manual; i++) if (!(await sendSoon("short"))) break;
    // slots that passed (or are too close) without an upload: catch up instead of losing them
    for (const format of ["short", "long"] as const) {
      const times = format === "long" ? settings.longUploadTimes : settings.uploadTimes;
      const days = format === "long" ? settings.longUploadDays : undefined;
      if (days?.length && !days.includes(new Date(`${istDay(now)}T00:00:00Z`).getUTCDay())) continue;
      for (const slot of missedSlots(now, times, uploadsOf(format))) {
        console.log(`${format}: the ${slot.toISOString()} slot was missed; catching up.`);
        if (!(await sendSoon(format, false, slot))) break;
      }
    }
    // one slot count per format: a long video on Tuesday must not use up a Short's slot that day
    const perDay: Record<Format, Map<string, number>> = { short: new Map(), long: new Map() };
    const trendTimes = new Set(settings.trendUploadTimes);
    for (const u of existing) {
      if (u.video.format !== "long" && trendTimes.has(istTime(u.publishAt))) continue;   // trend slots are extra
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
        const slot = nextSlot(now, times, taken, perDay[format], MIN_LEAD_MINUTES, days, format === "short" ? settings.shortEveryDays : 1);
        if (istDay(slot) !== istDay(now)) {
          console.log(uploaded ? `${format}: today's slots are filled. Next is ${slot.toISOString()}.`
            : `${format}: no free slot left today; next is ${slot.toISOString()}.`);
          break;
        }
        if (!dueSoon(now, slot)) {
          console.log(`${format}: the next slot, ${slot.toISOString()}, is more than ${UPLOAD_LOOKAHEAD_HOURS} h away; a later run fills it.`);
          break;
        }
        if (!(await uploadOne(prisma, run, token, settings.disclaimer, slot, format))) break;
        taken.add(slotKey(slot));
        perDay[format].set(istDay(slot), (perDay[format].get(istDay(slot)) ?? 0) + 1);
        uploaded++;
      }
    }

    // trend slots: one extra Short today per breaking or trending video; quiet days leave them empty
    const today = istDay(now);
    for (const time of [...trendTimes].sort()) {
      const slot = istSlot(today, time);
      if (slot.getTime() - now.getTime() < MIN_LEAD_MINUTES * 60_000 || taken.has(slotKey(slot)) || !dueSoon(now, slot)) continue;
      const shortsToday = await prisma.upload.findMany({
        where: { state: { in: ["scheduled", "uploaded", "published"] }, video: { format: "short", channelId } },
        select: { publishAt: true, video: { select: { style: true } } },
      }).then((us) => us.filter((u) => istDay(u.publishAt) === today));
      const urgentToday = shortsToday.filter((u) => isUrgent(u.video.style, today)).length;
      const trendUsed = shortsToday.filter((u) => trendTimes.has(istTime(u.publishAt))).length;
      // the trend video itself if it is still waiting, else (it took a regular slot) the next video
      const sent = await uploadOne(prisma, run, token, settings.disclaimer, slot, "short", "urgent")
        || (urgentToday > trendUsed && await uploadOne(prisma, run, token, settings.disclaimer, slot, "short"));
      if (sent) taken.add(slotKey(slot));
    }
  }
}

/** Upload the next `format` video for `slot` (only a breaking or trending one for "urgent"; only an
 * "Upload now" click or a due retry for "pending-now").
 * False when there is nothing to upload; throws on failure. */
type Pick = "queue" | "urgent" | "pending-now";

async function uploadOne(prisma: PrismaClient, run: Run, token: string, disclaimer: string, slot: Date, format: Format, pick: Pick = "queue", forSlot?: Date): Promise<boolean> {
  // the owner's pick first (owner, 2026-10-30: "the best video goes, not whatever is next"), then the
  // queue order: the editor's ranking, or the owner's own order where they dragged it
  const order = [{ pickedAt: { sort: "asc" as const, nulls: "last" as const } }, { queuePosition: "asc" as const }, { createdAt: "asc" as const }];
  const channelId = run.channelId;
  // no `script` (13-17 KB a video, never read here): this runs every 20 min per channel and format (Supabase egress, 2026-11-20)
  let pending = null, video = null;
  if (pick === "pending-now") {
    // only "Upload now" clicks and retries whose time has come; a retry for a slot still ahead waits for it
    pending = await prisma.upload.findFirst({ where: { state: "pending", publishAt: { lte: new Date(Date.now() + MIN_LEAD_MINUTES * 60_000) }, video: { deletedAt: null, channelId, format, status: { in: ["queued", "scheduled"] } } }, orderBy: { publishAt: "asc" }, include: { video: { omit: { script: true } } } });
    if (!pending) return false;
    video = pending.video;
  } else if (pick === "urgent") {
    const queued = await prisma.video.findMany({ where: { status: "queued", deletedAt: null, channelId, format }, orderBy: order, omit: { script: true } });
    video = queued.find((v) => isUrgent(v.style, istDay(slot))) ?? null;
    if (!video) { console.log(`No breaking or trending ${format} is waiting: the trend slot ${slot.toISOString()} stays empty.`); return false; }
  } else {
    // a video sent with "Upload now", or a retry of a failed attempt, goes first; then the queue
    pending = await prisma.upload.findFirst({ where: { state: "pending", video: { deletedAt: null, channelId, format, status: { in: ["queued", "scheduled"] } } }, orderBy: { publishAt: "asc" }, include: { video: { omit: { script: true } } } });
    video = pending?.video ?? await prisma.video.findFirst({ where: { status: "queued", deletedAt: null, channelId, format }, orderBy: order, omit: { script: true } });
    if (!video) { console.log(`::warning::No ${format} video is queued. Nothing to upload for ${slot.toISOString()}.`); return false; }
  }

  const attempts = (pending?.attempts ?? 0) + 1;
  if (!run.quota.take("upload", COST.upload)) {
    const missed = await recordQuotaMiss(prisma, run, video.id, pending, forSlot ?? slot, format, pick, order);
    await notify(prisma, { key: `quota-out:${run.quota.snapshot().day}`, channelId: null, source: "publish", severity: "critical", title: "YouTube API quota ran out today",
      detail: `${run.label}${missed ?? video.id} could not be uploaded for ${(forSlot ?? slot).toISOString()}: already used today: ${run.quota.summary()}. Every video that misses its slot this way is listed under Queue → Upload by hand (all channels), with its file, title, description and tags: upload it yourself and press Mark as uploaded. One you leave goes up after the quota resets (midnight Pacific, 13:30 IST).`,
      fix: "Upload the listed videos by hand from Queue → Upload by hand. For good: apply for a quota increase (YouTube API Services audit form), or lower a channel's videos a day on the Channels page." });
    console.log(`::warning::No quota left for ${video.id} today.`);
    return false;
  }
  const dir = mkdtempSync(path.join(tmpdir(), "publish-"));
  try {
    const file = path.join(dir, "video.mp4");
    await downloadReleaseAsset(repoSlug(ROOT), `video-${video.id}`, "video.mp4", file);
    const meta = youtubeMeta(video, disclaimer, format);
    const youtubeId = await uploadVideo(token, file, { ...meta, publishAt: slot, categoryId: run.channelId === layout().default ? categoryOf(video.style) : run.category });
    await prisma.$transaction([
      prisma.upload.upsert({
        where: { videoId: video.id },
        update: { youtubeId, publishAt: slot, state: "scheduled", attempts, error: null },
        create: { videoId: video.id, youtubeId, publishAt: slot, state: "scheduled", attempts },
      }),
      prisma.video.update({ where: { id: video.id }, data: { status: "scheduled", queuePosition: null, pickedAt: null } }),
    ]);
    await renumberQueue(prisma, channelId);
    console.log(JSON.stringify({ uploaded: video.id, youtubeId, publishAt: slot.toISOString(), attempts }, null, 2));
    await applyCover(prisma, run, token, video.id, youtubeId, video.style);
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
      await renumberQueue(prisma, channelId);
      await notify(prisma, { key: `upload-failed:${video.id}`, channelId, source: "publish", severity: "warning", title: `Upload of ${video.id} failed 3 times`,
        detail: `"${video.title}" could not be uploaded to YouTube and was marked failed. Last error: ${error}`,
        fix: "1. Open the video in the dashboard and check the error.\n2. If it's a quota or YouTube outage, nothing to do: the next video takes the slot.\n3. If it keeps happening, open Actions → Publish in GitHub and read the log." });
    }
    throw new Error(`${video.id}: attempt ${attempts} of ${MAX_ATTEMPTS} failed${gaveUp ? ", giving up" : ""}: ${error}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * A slot the quota couldn't fill: its video's Upload stays `pending` with the quota error and the slot
 * it was meant for, so the dashboard lists it under "Upload by hand" (owner, 2026-11-19). The video
 * stays queued; the attempt doesn't count against MAX_ATTEMPTS. When the picked video already holds an
 * earlier missed slot, this slot goes to the next queued video with no upload yet, so every missed
 * slot has its own video. Returns the video recorded (null when none was).
 */
async function recordQuotaMiss(prisma: PrismaClient, run: Run, videoId: string, pending: { publishAt: Date; attempts: number; error: string | null } | null,
                               intended: Date, format: Format, pick: Pick, order: Prisma.VideoOrderByWithRelationInput[]): Promise<string | null> {
  const error = quotaError(run.quota.summary());
  const record = (id: string, at: Date, attempts: number) => prisma.upload.upsert({
    where: { videoId: id }, update: { state: "pending", publishAt: at, error }, create: { videoId: id, publishAt: at, state: "pending", attempts, error },
  });
  // an "Upload now" click or a retry keeps its own time; a video already waiting for this slot is recorded again
  if (!pending || pick === "pending-now" || slotKey(pending.publishAt) === slotKey(intended) || !isQuotaMiss(pending.error)) {
    await record(videoId, pending && (pick === "pending-now" || isQuotaMiss(pending.error)) ? pending.publishAt : intended, pending?.attempts ?? 0);
    return videoId;
  }
  const holder = await prisma.upload.findFirst({ where: { state: "pending", publishAt: intended, video: { channelId: run.channelId, format } }, select: { videoId: true } });
  if (holder) return holder.videoId;
  const next = await prisma.video.findFirst({ where: { status: "queued", deletedAt: null, channelId: run.channelId, format, upload: { is: null } }, orderBy: order, select: { id: true } });
  if (!next) return null;
  await record(next.id, intended, 0);
  return next.id;
}

async function renumberQueue(prisma: PrismaClient, channelId: string): Promise<void> {
  const queued = await prisma.video.findMany({ where: { status: "queued", deletedAt: null, channelId }, orderBy: [{ pickedAt: { sort: "asc", nulls: "last" } }, { queuePosition: "asc" }, { createdAt: "asc" }], select: { id: true } });
  await prisma.$transaction(queued.map((v, i) => prisma.video.update({ where: { id: v.id }, data: { queuePosition: i + 1 } })));
}

try {
  await main();
} catch (e) {
  console.error(`::error::${e instanceof Error ? e.message : e}`);
  process.exitCode = 1;
}
