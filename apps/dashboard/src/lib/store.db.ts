/**
 * Data access backed by Postgres (Prisma). Same functions and return shapes as store.sample.ts.
 * Videos get here through workers/ingest.ts; the dashboard only reads them and changes queue
 * order, template switches and settings.
 */
import type { Prisma } from "@prisma/client";

import { liveCounters } from "./live-stats";
import { prisma } from "./prisma";
import { SettingsSchema, mostLoved } from "./schemas";
import { runEndMs } from "./run-span";
import { fillFromLive, meanViewPct, totals, type DayRow } from "./totals";
import { manualState, relinked } from "./youtube-link";
import type { Analytics, ManualUpload, Overview, Run, Settings, Template, Video, VideoAction, VideoDetail, VideoEdit } from "./schemas";

const DAY_MS = 86_400_000;
const IST_OFFSET = "+05:30";

export const DEFAULT_SETTINGS: Settings = {
  uploadTimes: ["07:07", "12:37", "19:07"], trendUploadTimes: ["16:07", "22:07"], backlogCap: 30, lengthMinSec: 30, lengthMaxSec: 45,
  longUploadTimes: ["20:07"], longUploadDays: [2, 4, 6], longLengthMinSec: 300, longLengthMaxSec: 900,
  longPerWeek: 2, longBacklogCap: 4,
  disclaimer: "Illustrative only. Not financial advice.", uploadsPaused: false,
  generationPaused: false, templateWork: { maxPerDay: 1, maxTemplates: 10 },
  alerts: { failedRun: true, failedUpload: true, tokenErrors: true, lowBacklog: true, lowBacklogThreshold: 5 },
  agents: { paused: false, research: true, improver: true, dashboard: true, auditor: true, scout: true, studio: true, monthly: true, maxActiveExperiments: 5 },
};

const istDay = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
const addDays = (day: string, n: number) => new Date(Date.parse(`${day}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);
const dayKey = (d: Date) => d.toISOString().slice(0, 10); // VideoStat.day is a DATE (UTC midnight)

const withRelations = { topic: true, upload: { include: { stats: true } } } satisfies Prisma.VideoInclude;
type VideoRow = Prisma.VideoGetPayload<{ include: typeof withRelations }>;

function toVideo(v: VideoRow): Video {
  const style = (v.style ?? {}) as Partial<Video["style"]>;
  return {
    id: v.id, templateId: v.templateId, topic: { title: v.topic.title, category: v.topic.category }, status: v.status,
    format: v.format === "long" ? "long" : "short",
    failReason: v.failReason, title: v.title, description: v.description, tags: v.tags, durationSec: v.durationSec,
    style: { palette: style.palette ?? "—", genre: style.genre ?? "—", key: style.key ?? "—", bpm: style.bpm ?? 0, voice: style.voice ?? null, source: style.source ?? null, thumbs: style.thumbs ?? null, thumbTest: style.thumbTest ?? null },
    thumbnailUrl: `/api/media/${v.id}/thumbnail`, previewUrl: `/api/media/${v.id}/preview`, fileUrl: `/api/media/${v.id}/video`,
    createdAt: v.createdAt.toISOString(), queuePosition: v.queuePosition,
    upload: v.upload && { youtubeId: v.upload.youtubeId, publishAt: v.upload.publishAt.toISOString(), state: v.upload.state, error: v.upload.error, attempts: v.upload.attempts },
    totals: totals(v.upload?.stats ?? [], v.upload),
  };
}

const live = { deletedAt: null } satisfies Prisma.VideoWhereInput;
// a new YouTube link starts from nothing: GREATEST in live-stats would otherwise keep the old video's counts
const noLiveCounters = { liveViews: null, liveLikes: null, liveComments: null, liveAt: null } satisfies Prisma.UploadUpdateInput;

// ---------------- settings ----------------

export async function getSettings(): Promise<Settings> {
  const merged: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const row of await prisma.setting.findMany()) {
    if (row.key in DEFAULT_SETTINGS) merged[row.key] = row.value;
  }
  const parsed = SettingsSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_SETTINGS;
}

export async function patchSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const next: Settings = { ...current, ...patch, alerts: { ...current.alerts, ...patch.alerts }, templateWork: { ...current.templateWork, ...patch.templateWork } };
  const changed = (Object.keys(next) as (keyof Settings)[]).filter((k) => JSON.stringify(next[k]) !== JSON.stringify(current[k]));
  await prisma.$transaction(changed.map((key) => prisma.setting.upsert({ where: { key }, update: { value: next[key] }, create: { key, value: next[key] } })));
  return next;
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
  return rows.sort((a, b) => when(b) - when(a)).map(toVideo);
}

export async function getVideo(id: string): Promise<VideoDetail | null> {
  await liveCounters(); // fresh YouTube counters first, so this response is current
  const v = await prisma.video.findFirst({
    where: { id, ...live },
    include: { ...withRelations, qaChecks: true, agentRuns: { orderBy: [{ startedAt: "asc" }, { id: "asc" }] } },
  });
  if (!v) return null;
  const order = ["number_check", "fact_review", "qa_review"];
  return {
    ...toVideo(v), script: v.script,
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

const queued = () => prisma.video.findMany({ where: { ...live, status: "queued" }, include: withRelations, orderBy: [{ queuePosition: "asc" }, { createdAt: "asc" }] });

export async function listQueue(): Promise<Video[]> {
  return (await queued()).map(toVideo);
}

export async function reorderQueue(ids: string[]): Promise<Video[] | null> {
  const current = (await queued()).map((v) => v.id);
  if (ids.length !== current.length || !current.every((id) => ids.includes(id))) return null;
  await prisma.$transaction(ids.map((id, i) => prisma.video.update({ where: { id }, data: { queuePosition: i + 1 } })));
  return listQueue();
}

export async function videoAction(id: string, action: VideoAction): Promise<{ ok: true } | { ok: false; error: string }> {
  const v = await prisma.video.findFirst({ where: { id, ...live } });
  if (!v) return { ok: false, error: "Video not found" };
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
    await prisma.video.update({ where: { id }, data: { queuePosition: (last._max.queuePosition ?? 0) + 1 } });
    await renumber();
    return { ok: true };
  }
  if ((await getSettings()).uploadsPaused) return { ok: false, error: "Uploads are paused" };
  // the publisher (M5) picks up pending uploads on its next run
  await prisma.$transaction([
    prisma.video.update({ where: { id }, data: { status: "scheduled", queuePosition: null } }),
    prisma.upload.upsert({ where: { videoId: id }, update: { publishAt: new Date(), state: "pending" }, create: { videoId: id, publishAt: new Date(), state: "pending" } }),
  ]);
  await renumber();
  return { ok: true };
}

/**
 * Mark a video as uploaded by hand, whatever state the pipeline had it in. It leaves the queue,
 * the publisher never uploads it, and the stats job tracks the given YouTube video. Can be
 * repeated to add or correct the link; a corrected link drops the old link's numbers, as in updateVideo.
 */
export async function markUploaded(id: string, m: ManualUpload): Promise<{ ok: true } | { ok: false; error: string }> {
  const v = await prisma.video.findFirst({ where: { id, ...live }, include: { upload: true } });
  if (!v) return { ok: false, error: "Video not found" };
  if (m.youtubeId) {
    const taken = await prisma.upload.findFirst({ where: { youtubeId: m.youtubeId, videoId: { not: id } }, select: { videoId: true } });
    if (taken) return { ok: false, error: `That YouTube video is already linked to ${taken.videoId}` };
  }
  const at = new Date(m.publishedAt);
  const youtubeId = m.youtubeId ?? v.upload?.youtubeId ?? null;
  const upload = v.upload;
  const newLink = !!upload && relinked(upload.youtubeId, youtubeId);
  const state = manualState(youtubeId, at);
  await prisma.$transaction([
    prisma.video.update({ where: { id }, data: { status: state, queuePosition: null, failReason: null } }),
    prisma.upload.upsert({
      where: { videoId: id },
      update: { youtubeId, publishAt: at, state, error: null, ...(newLink ? noLiveCounters : {}) },
      create: { videoId: id, youtubeId, publishAt: at, state },
    }),
    ...(upload && newLink ? [prisma.videoStat.deleteMany({ where: { uploadId: upload.id } })] : []),
    prisma.agentRun.create({
      data: { videoId: id, agent: "manual_upload", status: "ok", startedAt: new Date(), finishedAt: new Date(),
        log: [youtubeId ? `Uploaded by hand as YouTube video ${youtubeId}` : "Uploaded by hand (no YouTube link yet)", `Was ${v.status}`] },
    }),
  ]);
  await renumber();
  return { ok: true };
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
  await prisma.$transaction([
    prisma.video.update({ where: { id }, data: { title: e.title, description: e.description, tags: e.tags } }),
    ...(upload && (newLink || e.publishAt) ? [prisma.upload.update({ where: { id: upload.id }, data: {
      publishAt: e.publishAt ? new Date(e.publishAt) : undefined,
      ...(newLink ? { youtubeId: e.youtubeId, ...noLiveCounters } : {}),
    } })] : []),
    ...(upload && newLink ? [prisma.videoStat.deleteMany({ where: { uploadId: upload.id } })] : []),
    prisma.agentRun.create({ data: { videoId: id, agent: "manual_edit", status: "ok", startedAt: new Date(), finishedAt: new Date(),
      log: [`Edited by the owner: ${changed.join(", ")}`, ...(newLink ? [`YouTube link ${upload?.youtubeId ?? "none"} -> ${e.youtubeId ?? "none"}`] : [])] } }),
  ]);
  return { ok: true };
}

/** Log which thumbnail won YouTube's Test & Compare (kept in the video's style, read by the agents). */
export async function setThumbWinner(id: string, winner: string | null): Promise<{ ok: true } | { ok: false; error: string }> {
  const v = await prisma.video.findFirst({ where: { id, ...live }, select: { style: true } });
  if (!v) return { ok: false, error: "Video not found" };
  const style = { ...((v.style ?? {}) as Record<string, unknown>) };
  if (!Array.isArray(style.thumbs) || !(style.thumbs as { file: string }[]).some((t) => t.file === winner || winner === null))
    return { ok: false, error: "This video has no thumbnail test" };
  if (winner) style.thumbTest = { winner, at: new Date().toISOString() }; else delete style.thumbTest;
  await prisma.video.update({ where: { id }, data: { style: style as Prisma.InputJsonValue } });
  return { ok: true };
}

async function renumber(): Promise<void> {
  const ids = (await queued()).map((v) => v.id);
  await prisma.$transaction(ids.map((id, i) => prisma.video.update({ where: { id }, data: { queuePosition: i + 1 } })));
}

// ---------------- overview ----------------

export async function getOverview(): Promise<Overview> {
  await liveCounters(); // fresh YouTube counters first, so this response is current
  const settingsP = getSettings(); // in parallel with the queries below, not before them
  const today = istDay(new Date());
  const since = new Date(`${addDays(today, -7)}T00:00:00Z`);
  const [groups, next, failures, recent, stats, uploads7, templates, templateRunsToday, lastRun] = await Promise.all([
    prisma.video.groupBy({ by: ["status"], where: live, _count: true }),
    prisma.video.findFirst({ where: { ...live, status: "scheduled", upload: { isNot: null } }, include: withRelations, orderBy: { upload: { publishAt: "asc" } } }),
    prisma.video.findMany({ where: { ...live, status: "failed" }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.video.findMany({ where: { ...live, status: "published" }, include: withRelations, orderBy: { upload: { publishAt: "desc" } } }),
    prisma.videoStat.aggregate({ where: { day: { gte: since }, upload: { video: live } }, _sum: { views: true, subsGained: true, likes: true, comments: true } }),
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
  // views Analytics hasn't counted yet (its last day or two) are all recent: add them to the 7 days
  const notYet = (k: "views" | "likes" | "comments") =>
    lifetime.reduce((a, x) => a + Math.max(0, (x.t?.[k] ?? 0) - (x.v.upload?.stats ?? []).reduce((b, s) => b + s[k], 0)), 0);
  const notYetInAnalytics = notYet("views");
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
      views: (stats._sum.views ?? 0) + notYetInAnalytics, subsGained: stats._sum.subsGained ?? 0, uploads: uploads7,
      likes: (stats._sum.likes ?? 0) + notYet("likes"), comments: (stats._sum.comments ?? 0) + notYet("comments"),
    },
    allTime: {
      views: allViews, likes: lifetime.reduce((a, x) => a + (x.t?.likes ?? 0), 0), comments: lifetime.reduce((a, x) => a + (x.t?.comments ?? 0), 0),
      liveAt: liveAts.at(-1) ?? null,
    },
    recent: recent.slice(0, 4).map(toVideo),
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
      .map((v) => Math.max(v.upload!.stats.reduce((a, s) => a + s.views, 0), v.upload!.liveViews ?? 0));
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
  const rows = await prisma.agentRun.findMany({ orderBy: [{ startedAt: "desc" }, { id: "desc" }], take: 600, include: { video: { select: { title: true, status: true, failReason: true } } } });
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
      id: key, kind: isVideo ? "video" : "template_work", videoId: first.videoId, title: isVideo ? first.video?.title ?? key : asNotes(first.log)[0] ?? "Template work",
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
    weekday: names.map((weekday, i) => ({ weekday, avgViews: wd[i].n ? Math.round(wd[i].views / wd[i].n) : 0, uploads: wd[i].n })),
    top: rows.slice(0, 5), bottom: rows.length > 5 ? rows.slice(-5).reverse() : [], loved: mostLoved(rows),
    totals: {
      views: rows.reduce((a, r) => a + r.views, 0), subsGained: ranked.reduce((a, x) => a + x.t!.subsGained, 0), videos: published.length,
      likes: rows.reduce((a, r) => a + r.likes, 0), comments: rows.reduce((a, r) => a + r.comments, 0),
      avgViewPct: meanViewPct(ranked.map(({ v, t }) => ({ stats: v.upload?.stats ?? [], totals: t! }))),
    },
  };
}
