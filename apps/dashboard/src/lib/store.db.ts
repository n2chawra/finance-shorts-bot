/**
 * Data access backed by Postgres (Prisma). Same functions and return shapes as store.sample.ts.
 * Videos get here through workers/ingest.ts; the dashboard only reads them and changes queue
 * order, template switches and settings.
 */
import type { Prisma } from "@prisma/client";

import { liveCounters } from "./live-stats";
import { prisma, prismaAll } from "./prisma";
import { currentChannel } from "./channel-scope";
import { CHANNEL_KEYS } from "./channels";
import { dispatchPublish } from "./dispatch";
import { NO_PICK, canMarkStale, skipToEnd, uploadNow } from "./queue-actions";
import { EditorNoteSchema, SettingsSchema, mostLoved } from "./schemas";
import { picksToClear } from "./queue-order";
import { runEndMs } from "./run-span";
import { feedIndex, originOf, snapshotOf } from "./origin";
import { fillFromLive, meanViewPct, totals, windowCount, windowStart, type DayRow } from "./totals";
import { manualState, relinked } from "./youtube-link";
import { missReason, type HandUpload } from "./hand-uploads";
import type { Analytics, Feedback, FeedbackCreate, ManualUpload, Overview, Run, Settings, Template, Video, VideoAction, VideoDetail, VideoEdit } from "./schemas";

const DAY_MS = 86_400_000;
const IST_OFFSET = "+05:30";

export const DEFAULT_SETTINGS: Settings = {
  uploadTimes: ["07:07", "12:37", "19:07"], trendUploadTimes: [], shortEveryDays: 1, dailyVideoTarget: 3, backlogCap: 30, lengthMinSec: 20, lengthMaxSec: 35,
  longUploadTimes: ["20:07"], longUploadDays: [3, 5], longLengthMinSec: 300, longLengthMaxSec: 400,
  longPerWeek: 2, longBacklogCap: 4,   // the same as workers/lib/settings.ts DEFAULT_SETTINGS (2026-11-03)
  disclaimer: "Illustrative only. Not financial advice.", uploadsPaused: false,
  generationPaused: false, templateWork: { maxPerDay: 1, maxTemplates: 10 },
  alerts: { failedRun: true, failedUpload: true, tokenErrors: true, lowBacklog: true, lowBacklogThreshold: 5 },
  agents: { paused: false, research: true, improver: true, dashboard: true, auditor: true, scout: true, studio: true, monthly: true, reviewer: true, maxActiveExperiments: 5 },
};

const istDay = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
const addDays = (day: string, n: number) => new Date(Date.parse(`${day}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);
const dayKey = (d: Date) => d.toISOString().slice(0, 10); // VideoStat.day is a DATE (UTC midnight)

// the retention curves (~2.5 KB a video) are read only by the analytics pages' own queries: every list and poll
// left them out to keep Supabase egress inside the free plan (2026-11-23)
const withRelations = { topic: true, upload: { omit: { retention: true, relRetention: true, drops: true }, include: { stats: true } } } satisfies Prisma.VideoInclude;
type VideoRow = Omit<Prisma.VideoGetPayload<{ include: typeof withRelations }>, "script"> & { script?: Prisma.JsonValue }; // script only on the video page (lib/prisma.ts)

/** The Shorts and long-video research feeds, by topic id (for each video's origin). */
async function loadFeeds(): Promise<Map<string, Record<string, unknown>>> {
  const docs = await prisma.repoDoc.findMany({ where: { key: { in: ["topicFeed", "longTopicFeed"] } } });
  return feedIndex(...docs.map((d) => d.value));
}

function toVideo(v: VideoRow, feeds?: Map<string, Record<string, unknown>>): Video {
  const style = (v.style ?? {}) as Partial<Video["style"]>;
  const raw = v.script; // only the video page loads it (lib/prisma.ts)
  const script = (raw && typeof raw === "object" ? raw : {}) as { feed_id?: unknown };
  const feedId = style.source?.feedId ?? (typeof script.feed_id === "string" ? script.feed_id : null);
  return {
    id: v.id, templateId: v.templateId, topic: { title: v.topic.title, category: v.topic.category }, status: v.status,
    format: v.format === "long" ? "long" : "short",
    failReason: v.failReason, title: v.title, description: v.description, tags: v.tags, durationSec: v.durationSec,
    style: { palette: style.palette ?? "—", genre: style.genre ?? "—", key: style.key ?? "—", bpm: style.bpm ?? 0, voice: style.voice ?? null, source: style.source ?? null, thumbs: style.thumbs ?? null, thumbTest: style.thumbTest ?? null, thumbPick: style.thumbPick ?? null },
    thumbnailUrl: `/api/media/${v.id}/thumbnail`, previewUrl: `/api/media/${v.id}/preview`, fileUrl: `/api/media/${v.id}/video`,
    createdAt: v.createdAt.toISOString(), queuePosition: v.queuePosition,
    editorRank: v.editorRank, editorScore: v.editorScore,
    editorNote: v.editorNote ? (EditorNoteSchema.safeParse(v.editorNote).data ?? null) : null,
    pickedAt: v.pickedAt?.toISOString() ?? null, pickReason: v.pickReason, orderLocked: v.orderLocked,
    upload: v.upload && { youtubeId: v.upload.youtubeId, publishAt: v.upload.publishAt.toISOString(), state: v.upload.state, error: v.upload.error, attempts: v.upload.attempts },
    totals: totals(v.upload?.stats ?? [], v.upload),
    // the live feed first, then the topic as it was at ingest (topics leave the feed within weeks)
    origin: feeds ? originOf(feedId, feedId ? feeds.get(feedId) ?? snapshotOf(style.source) : undefined) : null,
  };
}

const live = { deletedAt: null } satisfies Prisma.VideoWhereInput;
// a new YouTube link starts from nothing: live-stats keeps the larger count on a small dip and would otherwise mix in the old video's
const noLiveCounters = { liveViews: null, liveLikes: null, liveComments: null, liveAt: null } satisfies Prisma.UploadUpdateInput;

// ---------------- settings ----------------

/** The platform-wide settings (the Setting table): what every channel starts from. */
async function platformSettings(): Promise<Settings> {
  const merged: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const row of await prisma.setting.findMany()) {
    if (row.key in DEFAULT_SETTINGS) merged[row.key] = row.value;
  }
  const parsed = SettingsSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_SETTINGS;
}

/**
 * The settings of the channel picked in the switcher: the platform's, with the channel's own values
 * (Channel.settings, the CHANNEL_KEYS) over them (2026-11-18: the page was platform-wide, so choosing
 * 2 a day on the geography channel changed the first channel's 3 a day). A channel that isn't live
 * uploads nothing, whatever the platform switch says.
 */
export async function getSettings(): Promise<Settings> {
  const base = await platformSettings();
  const ch = await prismaAll.channel.findUnique({ where: { id: await currentChannel() }, select: { status: true, settings: true } });
  if (!ch) return base;
  const own = (ch.settings ?? {}) as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...base };
  for (const k of CHANNEL_KEYS) if (k in own) merged[k] = own[k];
  if (ch.status !== "active") merged.uploadsPaused = true;
  const parsed = SettingsSchema.safeParse(merged);
  return parsed.success ? parsed.data : base;
}

/** Saves a change: a channel's own keys to that channel only, everything else platform-wide. */
export async function patchSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const next: Settings = { ...current, ...patch, alerts: { ...current.alerts, ...patch.alerts }, templateWork: { ...current.templateWork, ...patch.templateWork } };
  const changed = (Object.keys(next) as (keyof Settings)[]).filter((k) => JSON.stringify(next[k]) !== JSON.stringify(current[k]));
  const mine = changed.filter((k) => (CHANNEL_KEYS as readonly string[]).includes(k));
  const platform = changed.filter((k) => !(CHANNEL_KEYS as readonly string[]).includes(k));
  const id = await currentChannel();
  const ch = mine.length ? await prismaAll.channel.findUnique({ where: { id }, select: { settings: true } }) : null;
  await prisma.$transaction([
    ...platform.map((key) => prisma.setting.upsert({ where: { key }, update: { value: next[key] }, create: { key, value: next[key] } })),
    ...(ch ? [prismaAll.channel.update({ where: { id }, data: { settings: {
      ...((ch.settings ?? {}) as Record<string, unknown>), ...Object.fromEntries(mine.map((k) => [k, next[k]])),
    } as Prisma.InputJsonValue } })] : []),
  ]);
  return getSettings();
}

// ---------------- videos ----------------

export async function listVideos(f: { status?: string; template?: string; category?: string; q?: string }): Promise<Video[]> {
  await liveCounters(); // fresh YouTube counters first, so this response is current
  const q = f.q?.trim();
  const rows = await prisma.video.findMany({
    where: {
      ...live,
      ...(f.status ? { status: f.status as Video["status"] } : {}),
      ...(f.template ? { templateId: f.template } : {}),
      ...(f.category ? { topic: { category: f.category } } : {}),
      ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { id: { contains: q, mode: "insensitive" } }, { topic: { title: { contains: q, mode: "insensitive" } } }] } : {}),
    },
    include: withRelations, orderBy: { createdAt: "desc" }, take: 300,
  });
  const when = (v: VideoRow) => (v.upload?.publishAt ?? v.createdAt).getTime();
  // each video's origin from the topic ingest stored on it (style.source.topic), not the live feeds: those are
  // ~300 KB and were re-read on every poll of this list (Supabase egress, 2026-11-23); the video page still reads them
  const feeds = new Map<string, Record<string, unknown>>();
  return rows.sort((a, b) => when(b) - when(a)).map((v) => toVideo(v, feeds));
}

export async function getVideo(id: string): Promise<VideoDetail | null> {
  await liveCounters(); // fresh YouTube counters first, so this response is current
  const v = await prisma.video.findFirst({
    where: { id, ...live },
    omit: { script: false },
    include: { ...withRelations, qaChecks: true, agentRuns: { orderBy: [{ startedAt: "asc" }, { id: "asc" }] } },
  });
  if (!v) return null;
  const order = ["number_check", "fact_review", "qa_review"];
  return {
    ...toVideo(v, await loadFeeds()), script: v.script,
    qaChecks: v.qaChecks.sort((a, b) => order.indexOf(a.checker) - order.indexOf(b.checker)).map((c) => ({ checker: c.checker, passed: c.passed, notes: asNotes(c.notes) })),
    steps: v.agentRuns.map(toStep),
    stats: (v.upload?.stats ?? []).sort((a, b) => a.day.getTime() - b.day.getTime()).map((s) => ({ day: dayKey(s.day), views: s.views, likes: s.likes, comments: s.comments, subsGained: s.subsGained, avgViewPct: s.avgViewPct })),
  };
}

const asNotes = (log: unknown): string[] => (Array.isArray(log) ? log.map(String) : []);

function toStep(r: { agent: string; status: string; log: unknown; startedAt: Date; finishedAt: Date | null }): Run["steps"][number] {
  const status = r.status === "ok" || r.status === "failed" || r.status === "skipped" ? r.status : "ok";
  return {
    agent: r.agent, status, durationSec: r.finishedAt ? Math.max(0, Math.round((r.finishedAt.getTime() - r.startedAt.getTime()) / 1000)) : 0,
    note: status === "failed" ? asNotes(r.log).join(" ") || null : null,
  };
}

// the owner's pick goes first, then the queue order (the editor's ranking, or the owner's own)
const queued = () => prisma.video.findMany({ where: { ...live, status: "queued" }, include: withRelations,
  orderBy: [{ pickedAt: { sort: "asc", nulls: "last" } }, { queuePosition: "asc" }, { createdAt: "asc" }] });

export async function listQueue(): Promise<Video[]> {
  return (await queued()).map((v) => toVideo(v));
}

export async function reorderQueue(ids: string[]): Promise<Video[] | null> {
  const rows = await queued();
  const current = rows.map((v) => v.id);
  if (ids.length !== current.length || !current.every((id) => ids.includes(id))) return null;
  const byId = new Map(rows.map((v) => [v.id, v]));
  const unpick = new Set(picksToClear(ids.map((id) => ({ id, format: byId.get(id)!.format, picked: Boolean(byId.get(id)!.pickedAt) }))));
  // the owner's own order: kept over the editor's ranking until "Use editor's order"; a pick dragged off the top is dropped
  await prisma.$transaction(ids.map((id, i) => prisma.video.update({ where: { id },
    data: { queuePosition: i + 1, orderLocked: true, ...(unpick.has(id) ? NO_PICK : {}) } })));
  return listQueue();
}

/** Hand the order back to the editor: unlock every queued video and sort them by its ranking. */
export async function applyEditorOrder(): Promise<Video[]> {
  const q = await prisma.video.findMany({ where: { ...live, status: "queued" }, orderBy: [{ editorRank: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }], select: { id: true } });
  await prisma.$transaction(q.map((v, i) => prisma.video.update({ where: { id: v.id }, data: { queuePosition: i + 1, orderLocked: false } })));
  return listQueue();
}

export async function videoAction(id: string, action: VideoAction, reason?: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const v = await prisma.video.findFirst({ where: { id, ...live } });
  if (!v) return { ok: false, error: "Video not found" };
  const why = reason?.trim() || null;
  if (action === "pick" || action === "unpick") {
    if (v.status !== "queued") return { ok: false, error: "Only a queued video can be picked" };
    const format = v.format;
    await prisma.$transaction([
      // one pick per format: picking another replaces it
      prisma.video.updateMany({ where: { status: "queued", format, pickedAt: { not: null } }, data: { pickedAt: null, pickReason: null } }),
      ...(action === "pick" ? [
        prisma.video.update({ where: { id }, data: { pickedAt: new Date(), pickReason: why } }),
        prisma.feedback.create({ data: { videoId: id, kind: "choice", text: why ?? "Picked for the next upload" } }),
      ] : []),
    ]);
    await renumber();
    return { ok: true };
  }
  if (action === "stale") {
    if (!canMarkStale(v.status)) return { ok: false, error: "Only a video waiting to be published can be marked stale" };
    if (!why) return { ok: false, error: "Say why it is stale: the system learns from it" };
    await prisma.$transaction([
      prisma.video.update({ where: { id }, data: { status: "rejected", failReason: `Stale (owner): ${why}`, queuePosition: null, pickedAt: null, pickReason: null } }),
      prisma.feedback.create({ data: { videoId: id, kind: "stale", text: why } }),
    ]);
    await renumber();
    return { ok: true };
  }
  if (action === "unstale") {
    if (v.status !== "rejected") return { ok: false, error: "This video is not marked stale" };
    const last = await prisma.video.aggregate({ where: { ...live, status: "queued" }, _max: { queuePosition: true } });
    await prisma.video.update({ where: { id }, data: { status: "queued", failReason: null, queuePosition: (last._max.queuePosition ?? 0) + 1 } });
    await renumber();
    return { ok: true };
  }
  if (action === "delete") {
    // keep the row so ingest does not add the video again from its manifest; a published or
    // scheduled one is "removed from YouTube": it leaves every list, total and graph, and the
    // publisher, stats and audit jobs skip it (its stats rows stay, uncounted)
    const removed = v.status === "published" || v.status === "scheduled";
    await prisma.$transaction([
      prisma.video.update({ where: { id }, data: { deletedAt: new Date(), queuePosition: null } }),
      prisma.agentRun.create({ data: { videoId: id, agent: "manual_remove", status: "ok", startedAt: new Date(), finishedAt: new Date(),
        log: [removed ? "Removed from YouTube by the owner" : "Deleted by the owner", `Was ${v.status}`] } }),
    ]);
    await renumber();
    return { ok: true };
  }
  if (v.status !== "queued") return { ok: false, error: "Only queued videos can be skipped or uploaded" };
  if (action === "skip") {
    const last = await prisma.video.aggregate({ where: { ...live, status: "queued" }, _max: { queuePosition: true } });
    await prisma.video.update({ where: { id }, data: skipToEnd(last._max.queuePosition) });
    await renumber();
    return { ok: true };
  }
  if ((await getSettings()).uploadsPaused) return { ok: false, error: "Uploads are paused" };
  // the publisher picks up pending uploads on its next run, which the dispatch below starts
  await prisma.$transaction([
    prisma.video.update({ where: { id }, data: uploadNow() }),
    prisma.upload.upsert({ where: { videoId: id }, update: { publishAt: new Date(), state: "pending" }, create: { videoId: id, publishAt: new Date(), state: "pending" } }),
  ]);
  await renumber();
  // start Publish now rather than wait for a scheduled run (GitHub drops those on busy days)
  await dispatchPublish().then((r) => console.log(`upload-now ${id}: ${r.why}`), (e) => console.error(`upload-now ${id}: dispatch failed`, e));
  return { ok: true };
}

/**
 * Mark a video as uploaded by hand, whatever state the pipeline had it in. It leaves the queue,
 * the publisher never uploads it, and the stats job tracks the given YouTube video. Can be
 * repeated to add or correct the link; a corrected link drops the old link's numbers, as in updateVideo.
 */
export async function markUploaded(id: string, m: ManualUpload): Promise<{ ok: true } | { ok: false; error: string }> {
  // any channel's video, not only the switched one: "Upload by hand" lists every channel's
  const v = await prismaAll.video.findFirst({ where: { id, ...live }, include: { upload: true } });
  if (!v) return { ok: false, error: "Video not found" };
  if (m.youtubeId) {
    const taken = await prismaAll.upload.findFirst({ where: { youtubeId: m.youtubeId, videoId: { not: id } }, select: { videoId: true } });
    if (taken) return { ok: false, error: `That YouTube video is already linked to ${taken.videoId}` };
  }
  const at = new Date(m.publishedAt);
  const youtubeId = m.youtubeId ?? v.upload?.youtubeId ?? null;
  const upload = v.upload;
  const newLink = !!upload && relinked(upload.youtubeId, youtubeId);
  const state = manualState(youtubeId, at);
  await prismaAll.$transaction([
    prismaAll.video.update({ where: { id }, data: { status: state, queuePosition: null, failReason: null } }),
    prismaAll.upload.upsert({
      where: { videoId: id },
      update: { youtubeId, publishAt: at, state, error: null, ...(newLink ? noLiveCounters : {}) },
      create: { videoId: id, youtubeId, publishAt: at, state },
    }),
    ...(upload && newLink ? [prismaAll.videoStat.deleteMany({ where: { uploadId: upload.id } })] : []),
    prismaAll.agentRun.create({
      data: { videoId: id, agent: "manual_upload", status: "ok", startedAt: new Date(), finishedAt: new Date(),
        log: [youtubeId ? `Uploaded by hand as YouTube video ${youtubeId}` : "Uploaded by hand (no YouTube link yet)", `Was ${v.status}`] },
    }),
  ]);
  await renumber(v.channelId);
  return { ok: true };
}

/**
 * Every channel's ready videos whose slot the publisher couldn't fill (the day's quota ran out, or a
 * retry still waiting), oldest slot first, for the Queue page's "Upload by hand" list.
 */
export async function listHandUploads(): Promise<HandUpload[]> {
  const rows = await prismaAll.upload.findMany({
    where: { state: "pending", video: { ...live, status: { in: ["queued", "scheduled"] } } },
    include: { video: { include: withRelations } }, orderBy: { publishAt: "asc" },
  });
  const now = new Date();
  const names = new Map((await prismaAll.channel.findMany({ select: { id: true, name: true } })).map((c) => [c.id, c.name]));
  return rows.flatMap((u) => {
    const reason = missReason(u, now);
    return reason ? [{ channelId: u.video.channelId, channelName: names.get(u.video.channelId) ?? u.video.channelId, slotAt: u.publishAt.toISOString(),
      reason, error: u.error, video: toVideo(u.video) }] : [];
  });
}

/**
 * The owner's edits from the video page: title, description and tags (what the publisher uploads,
 * and what the owner copies when posting by hand), and for an uploaded video its YouTube link and
 * publish time. A new link drops the old link's numbers so the stats jobs fetch the right video's.
 */
export async function updateVideo(id: string, e: VideoEdit): Promise<{ ok: true } | { ok: false; error: string }> {
  const v = await prisma.video.findFirst({ where: { id, ...live }, include: { upload: true } });
  if (!v) return { ok: false, error: "Video not found" };
  if ((e.youtubeId !== undefined || e.publishAt) && !v.upload) return { ok: false, error: "This video is not uploaded yet: use Mark as uploaded" };
  const newLink = relinked(v.upload?.youtubeId, e.youtubeId);
  if (newLink && e.youtubeId) {
    const taken = await prisma.upload.findFirst({ where: { youtubeId: e.youtubeId, videoId: { not: id } }, select: { videoId: true } });
    if (taken) return { ok: false, error: `That YouTube video is already linked to ${taken.videoId}` };
  }
  const changed = (Object.keys(e) as (keyof VideoEdit)[]).filter((k) => e[k] !== undefined);
  const upload = v.upload;
  // a corrected link starts over (owner, 2026-10-31: a wrong first link had marked the upload failed,
  // and the stats jobs skip failed uploads, so the real link never got numbers): published if its
  // time has passed, scheduled until then
  const restart = upload && newLink && e.youtubeId ? manualState(e.youtubeId, e.publishAt ? new Date(e.publishAt) : upload.publishAt) : null;
  await prisma.$transaction([
    prisma.video.update({ where: { id }, data: { title: e.title, description: e.description, tags: e.tags,
      ...(restart && v.status !== "published" ? { status: restart } : {}) } }),
    ...(upload && (newLink || e.publishAt) ? [prisma.upload.update({ where: { id: upload.id }, data: {
      publishAt: e.publishAt ? new Date(e.publishAt) : undefined,
      ...(newLink ? { youtubeId: e.youtubeId, ...noLiveCounters } : {}),
      ...(restart ? { state: restart, error: null } : {}),
    } })] : []),
    ...(upload && newLink ? [prisma.videoStat.deleteMany({ where: { uploadId: upload.id } })] : []),
    prisma.agentRun.create({ data: { videoId: id, agent: "manual_edit", status: "ok", startedAt: new Date(), finishedAt: new Date(),
      log: [`Edited by the owner: ${changed.join(", ")}`, ...(newLink ? [`YouTube link ${upload?.youtubeId ?? "none"} -> ${e.youtubeId ?? "none"}`] : [])] } }),
  ]);
  return { ok: true };
}

/** The owner's pick of a long video's three thumbnails (style.thumbPick): the publisher sets it as the cover. */
export async function setThumbWinner(id: string, winner: string | null): Promise<{ ok: true } | { ok: false; error: string }> {
  const v = await prisma.video.findFirst({ where: { id, ...live }, select: { style: true } });
  if (!v) return { ok: false, error: "Video not found" };
  const style = { ...((v.style ?? {}) as Record<string, unknown>) };
  if (!Array.isArray(style.thumbs) || !(style.thumbs as { file: string }[]).some((t) => t.file === winner || winner === null))
    return { ok: false, error: "This video has no thumbnails to pick from" };
  if (winner) style.thumbPick = { file: winner, at: new Date().toISOString() }; else delete style.thumbPick;
  await prisma.video.update({ where: { id }, data: { style: style as Prisma.InputJsonValue } });
  return { ok: true };
}

/** Renumber the queue: the switched channel's, or `channelId`'s (a video marked uploaded from another channel's list). */
async function renumber(channelId?: string): Promise<void> {
  const ids = channelId
    ? (await prismaAll.video.findMany({ where: { ...live, status: "queued", channelId }, select: { id: true },
      orderBy: [{ pickedAt: { sort: "asc", nulls: "last" } }, { queuePosition: "asc" }, { createdAt: "asc" }] })).map((v) => v.id)
    : (await queued()).map((v) => v.id);
  await prismaAll.$transaction(ids.map((id, i) => prismaAll.video.update({ where: { id }, data: { queuePosition: i + 1 } })));
}

// ---------------- the owner's feedback ----------------

const toFeedback = (f: { id: string; videoId: string | null; video: { title: string } | null; kind: string; area: string | null; text: string;
  status: string; response: string | null; addressedAt: Date | null; createdAt: Date }): Feedback => ({
  id: f.id, videoId: f.videoId, videoTitle: f.video?.title ?? null, kind: f.kind as Feedback["kind"], area: (f.area ?? null) as Feedback["area"],
  text: f.text, status: f.status === "addressed" ? "addressed" : "open", response: f.response,
  addressedAt: f.addressedAt?.toISOString() ?? null, createdAt: f.createdAt.toISOString(),
});

export async function listFeedback(videoId?: string): Promise<Feedback[]> {
  const rows = await prisma.feedback.findMany({ where: videoId ? { videoId } : {}, include: { video: { select: { title: true } } }, orderBy: { createdAt: "desc" }, take: 500 });
  return rows.map(toFeedback);
}

export async function addFeedback(f: FeedbackCreate): Promise<Feedback | null> {
  if (f.videoId && !(await prisma.video.findUnique({ where: { id: f.videoId }, select: { id: true } }))) return null;
  const row = await prisma.feedback.create({ data: { videoId: f.videoId, kind: f.kind, area: f.area, text: f.text }, include: { video: { select: { title: true } } } });
  return toFeedback(row);
}

export async function setFeedbackStatus(id: string, status: "open" | "addressed"): Promise<Feedback | null> {
  const row = await prisma.feedback.update({ where: { id }, data: { status, addressedAt: status === "addressed" ? new Date() : null }, include: { video: { select: { title: true } } } }).catch(() => null);
  return row && toFeedback(row);
}

export async function openFeedbackCount(): Promise<number> {
  return prisma.feedback.count({ where: { status: "open" } });
}

// ---------------- overview ----------------

export async function getOverview(): Promise<Overview> {
  await liveCounters(); // fresh YouTube counters first, so this response is current
  const settingsP = getSettings(); // in parallel with the queries below, not before them
  const today = istDay(new Date());
  const sinceDay = windowStart(today, 7); // 7 days, today included
  const since = new Date(`${sinceDay}T00:00:00Z`);
  const [groups, next, failures, recent, stats, uploads7, templates, templateRunsToday, lastRun] = await Promise.all([
    prisma.video.groupBy({ by: ["status"], where: live, _count: true }),
    prisma.video.findFirst({ where: { ...live, status: "scheduled", upload: { isNot: null } }, include: withRelations, orderBy: { upload: { publishAt: "asc" } } }),
    prisma.video.findMany({ where: { ...live, status: "failed" }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.video.findMany({ where: { ...live, status: "published" }, include: withRelations, orderBy: { upload: { publishAt: "desc" } } }),
    prisma.videoStat.aggregate({ where: { day: { gte: since }, upload: { video: live } }, _sum: { subsGained: true } }),
    prisma.upload.count({ where: { state: "published", publishAt: { gte: new Date(Date.now() - 7 * DAY_MS) }, video: live } }),
    prisma.template.count(),
    prisma.agentRun.count({ where: { agent: "template_builder", startedAt: { gte: new Date(`${today}T00:00:00${IST_OFFSET}`) } } }),
    prisma.agentRun.findFirst({ orderBy: { startedAt: "desc" }, select: { startedAt: true } }),
  ]);
  const settings = await settingsP;
  const counts = Object.fromEntries(groups.map((g) => [g.status, g._count]));
  // all-time views: live counters where they are ahead of Analytics, so this only ever goes up
  const lifetime = recent.map((v) => ({ v, t: totals(v.upload?.stats ?? [], v.upload) }));
  const allViews = lifetime.reduce((a, x) => a + (x.t?.views ?? 0), 0);
  // the 7 days per published video, never above its all-time count (views Analytics hasn't counted yet are all recent)
  const days = lifetime.map((x) => ({ t: x.t, stats: (x.v.upload?.stats ?? []).map((s) => ({ ...s, day: s.day.toISOString().slice(0, 10) })) }));
  const last7 = (k: "views" | "likes" | "comments") => days.reduce((a, x) => a + windowCount(x.stats, x.t, sinceDay, k), 0);
  const liveAts = lifetime.map((x) => x.t?.liveAt).filter((d): d is string => !!d).sort();
  const backlog = counts.queued ?? 0;
  const tw = settings.templateWork;
  const full = backlog >= settings.backlogCap;
  const mayBuild = templateRunsToday < tw.maxPerDay;
  const [mode, reason]: [Overview["generation"]["mode"], string] = settings.generationPaused
    ? ["paused", "Generation is paused. Routines do nothing until you resume."]
    : full && mayBuild ? ["template_work", `Backlog has reached the cap of ${settings.backlogCap}, so the next run builds or improves a template.`]
    : full ? ["idle", `Backlog is full and today's template-work limit (${tw.maxPerDay}) is used. The next run does nothing.`]
    : ["video", `Backlog ${backlog} is below the cap of ${settings.backlogCap}, so the next run makes a video.`];
  return {
    source: "database", counts, backlog, backlogCap: settings.backlogCap, uploadsPaused: settings.uploadsPaused,
    generation: { mode, reason, templateRunsToday, maxTemplateRunsPerDay: tw.maxPerDay, templates, maxTemplates: tw.maxTemplates, lastRunAt: lastRun?.startedAt.toISOString() ?? null },
    nextUpload: next?.upload ? { videoId: next.id, title: next.title, publishAt: next.upload.publishAt.toISOString(), thumbnailUrl: `/api/media/${next.id}/thumbnail` } : null,
    recentFailures: failures.map((v) => ({ videoId: v.id, title: v.title, reason: v.failReason ?? "Unknown", at: v.createdAt.toISOString() })),
    last7: {
      views: last7("views"), subsGained: stats._sum.subsGained ?? 0, uploads: uploads7,
      likes: last7("likes"), comments: last7("comments"),
    },
    allTime: {
      views: allViews, likes: lifetime.reduce((a, x) => a + (x.t?.likes ?? 0), 0), comments: lifetime.reduce((a, x) => a + (x.t?.comments ?? 0), 0),
      liveAt: liveAts.at(-1) ?? null,
    },
    recent: recent.slice(0, 4).map((v) => toVideo(v)),
  };
}

// ---------------- templates ----------------

export async function listTemplates(): Promise<Template[]> {
  await liveCounters(); // fresh YouTube counters first, so this response is current
  const [templates, videos] = await Promise.all([
    prisma.template.findMany({ orderBy: { id: "asc" } }),
    prisma.video.findMany({ where: live, select: { id: true, templateId: true, createdAt: true, status: true, upload: { select: { liveViews: true, liveAt: true, stats: { select: { views: true } } } } } }),
  ]);
  return templates.map((t) => {
    const mine = videos.filter((v) => v.templateId === t.id);
    const withViews = mine.filter((v) => v.upload?.stats.length || v.upload?.liveAt)
      .map((v) => v.upload!.liveViews ?? v.upload!.stats.reduce((a, s) => a + s.views, 0));
    const sample = mine.filter((v) => v.status !== "failed").sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    return {
      id: t.id, name: t.name, description: t.description, version: t.version, weight: t.weight, enabled: t.enabled,
      lastUsedAt: t.lastUsedAt?.toISOString() ?? null, videoCount: mine.length, publishedCount: mine.filter((v) => v.status === "published").length,
      avgViews: withViews.length ? Math.round(withViews.reduce((a, b) => a + b, 0) / withViews.length) : null,
      sampleThumbnailUrl: sample ? `/api/media/${sample.id}/thumbnail` : "", sampleVideoUrl: sample ? `/api/media/${sample.id}/video` : "",
    };
  });
}

export async function patchTemplate(id: string, patch: { enabled?: boolean; weight?: number }): Promise<Template | null> {
  if (!(await prisma.template.findUnique({ where: { id } }))) return null;
  await prisma.template.update({ where: { id }, data: { ...(patch.enabled !== undefined ? { enabled: patch.enabled } : {}), ...(patch.weight !== undefined ? { weight: Math.round(patch.weight * 10) / 10 } : {}) } });
  return (await listTemplates()).find((t) => t.id === id) ?? null;
}

// ---------------- runs ----------------

export async function listRuns(): Promise<Run[]> {
  const rows = await prisma.agentRun.findMany({ orderBy: [{ startedAt: "desc" }, { id: "desc" }], take: 600, include: { video: { select: { title: true, status: true, failReason: true, format: true } } } });
  const groups = new Map<string, typeof rows>();
  for (const r of rows) {
    const key = r.videoId ?? r.id; // template-work rows have no video and stand alone
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  return [...groups.entries()].map(([key, steps]): Run => {
    const ordered = [...steps].sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime() || a.id.localeCompare(b.id));
    const first = ordered[0];
    const end = runEndMs(ordered);
    const isVideo = first.videoId !== null;
    const failed = isVideo ? first.video?.status === "failed" : first.status === "failed";
    return {
      id: key, kind: isVideo ? "video" : "template_work", videoId: first.videoId, ...(isVideo && { format: first.video?.format === "long" ? "long" as const : "short" as const }), title: isVideo ? first.video?.title ?? key : asNotes(first.log)[0] ?? "Template work",
      status: failed ? "failed" : "ok", startedAt: first.startedAt.toISOString(), durationSec: Math.round((end - first.startedAt.getTime()) / 1000),
      error: isVideo ? first.video?.failReason ?? null : null, sessionUrl: ordered.find((s) => s.routineSessionUrl)?.routineSessionUrl ?? null,
      steps: ordered.map(toStep),
    };
  }).sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 150);
}

// ---------------- analytics ----------------

export async function getAnalytics(): Promise<Analytics> {
  await liveCounters(); // fresh YouTube counters first, so this response is current
  const today = istDay(new Date());
  const from = addDays(today, -28);
  const [stats, published] = await Promise.all([
    // removed videos' rows are kept in the database but not counted
    prisma.videoStat.findMany({ where: { day: { gte: new Date(`${from}T00:00:00Z`) }, upload: { video: live } } }),
    prisma.video.findMany({ where: { ...live, status: "published" }, include: withRelations }),
  ]);
  // the last 28 days, today included (its views are live-counter estimates until Analytics has it)
  const byDay = new Map<string, DayRow>();
  for (let k = 27; k >= 0; k--) byDay.set(addDays(today, -k), { views: 0, subsGained: 0, likes: 0, comments: 0, estimated: false });
  for (const s of stats) {
    const d = byDay.get(dayKey(s.day));
    if (d) { d.views += s.views; d.subsGained += s.subsGained; d.likes += s.likes; d.comments += s.comments; }
  }
  // Analytics runs days behind: what the live counters have beyond it fills those days, marked estimated
  fillFromLive(byDay, published.filter((v) => v.upload).map((v) => ({
    publishDay: istDay(v.upload!.publishAt), live: v.upload,
    stats: v.upload!.stats.map((st) => ({ day: dayKey(st.day), views: st.views, likes: st.likes, comments: st.comments, subsGained: st.subsGained, avgViewPct: st.avgViewPct })),
  })));
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const wd = names.map(() => ({ views: 0, n: 0 }));
  const ranked = published.map((v) => ({ v, t: totals(v.upload?.stats ?? [], v.upload) })).filter((x) => x.t !== null);
  for (const { v, t } of ranked) {
    const i = (new Date(`${istDay(v.upload!.publishAt)}T00:00:00Z`).getUTCDay() + 6) % 7;
    wd[i].views += t!.views;
    wd[i].n += 1;
  }
  const rows = ranked.map(({ v, t }) => ({ videoId: v.id, title: v.title, templateId: v.templateId, views: t!.views, likes: t!.likes, comments: t!.comments, thumbnailUrl: `/api/media/${v.id}/thumbnail` })).sort((a, b) => b.views - a.views);
  return {
    daily: [...byDay].map(([day, d]) => ({ day, ...d })),
    statsThrough: stats.map((x) => dayKey(x.day)).sort().at(-1) ?? null,
    weekday: names.map((weekday, i) => ({ weekday, avgViews: wd[i].n ? Math.round(wd[i].views / wd[i].n) : 0, uploads: wd[i].n })),
    top: rows.slice(0, 5), bottom: rows.length > 5 ? rows.slice(-5).reverse() : [], loved: mostLoved(rows),
    totals: {
      views: rows.reduce((a, r) => a + r.views, 0), subsGained: ranked.reduce((a, x) => a + x.t!.subsGained, 0), videos: published.length,
      likes: rows.reduce((a, r) => a + r.likes, 0), comments: rows.reduce((a, r) => a + r.comments, 0),
      avgViewPct: meanViewPct(ranked.map(({ v, t }) => ({ stats: v.upload?.stats ?? [], totals: t! }))),
    },
  };
}
