/**
 * Bridge between the self-improving agents (which only see the repo) and the database (which only
 * the workers and dashboard see). Run by ingest:
 *
 *   repo → DB   improvement/activity/*.json      → AgentActivity (the dashboard's Agents page)
 *               improvement/notifications/*.json → Notification (things only the owner can fix)
 *               experiments, proposals, merge log → RepoDoc snapshots
 *               improvement/template-decisions.json → Template weight / enabled (applied once each)
 *   DB → repo   metrics/videos.json, metrics/runs.json (what the agents judge changes by)
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { Prisma, type PrismaClient } from "@prisma/client";
import { z } from "zod";

import { notify, resolveOthers } from "./notify.ts";
import { istDay, isUrgent } from "./publishing.ts";

const DAY_MS = 86_400_000;
const AGENTS = ["research", "improver", "dashboard", "auditor", "scout", "studio", "monthly", "reviewer"] as const;

const readJson = (file: string): unknown => JSON.parse(readFileSync(file, "utf8"));

// Agents write these files by hand, so small slips are accepted rather than losing the whole night's
// report: an optional field written as null, `id` for `key`, low/medium/high for the severities.
const optional = z.string().nullish().transform((v) => v ?? undefined);

export const Activity = z.object({
  agent: z.enum(AGENTS),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startedAt: z.iso.datetime().nullish().transform((v) => v ?? undefined),
  finishedAt: z.iso.datetime().nullish().transform((v) => v ?? undefined),
  summary: z.string().min(1),
  decision: z.enum(["acted", "waited", "blocked", "nothing"]),
  why: z.string(),
  findings: z.array(z.object({ title: z.string(), detail: optional, link: optional })).default([]),
  changes: z.array(z.object({ title: z.string(), detail: optional, branch: optional, experiment: optional })).default([]),
  nextCheck: z.string().nullish(),
  links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
});

const SEVERITY_ALIASES = { low: "info", medium: "warning", high: "critical" } as const;
export const AgentNotice = z.object({
  key: z.string().min(1).optional(), id: z.string().min(1).optional(),
  severity: z.union([z.enum(["info", "warning", "critical"]), z.enum(["low", "medium", "high"]).transform((s) => SEVERITY_ALIASES[s])]),
  title: z.string().min(1), detail: z.string().default(""), fix: z.string().default(""),
  proposal: z.object({ setting: z.string().min(1), value: z.unknown(), current: z.unknown().optional() }).optional(),
}).refine((n) => n.key ?? n.id, "needs a key").transform(({ id, ...n }) => ({ ...n, key: (n.key ?? id)! }));
const AgentNotices = z.object({ notifications: z.array(z.unknown()) });

const TemplateDecisions = z.object({
  decisions: z.array(z.object({
    id: z.string().min(1), template: z.string(), action: z.enum(["reweight", "retire", "enable"]),
    weight: z.number().min(0).max(3).optional(), why: z.string(), at: z.string(),
  })),
});

export async function importActivity(prisma: PrismaClient, root: string): Promise<number> {
  const dir = path.join(root, "improvement", "activity");
  if (!existsSync(dir)) return 0;
  let n = 0;
  // the folder is the source of truth: drop rows whose file was removed
  const ids = new Set(readdirSync(dir).filter((x) => x.endsWith(".json")).map((x) => x.replace(/\.json$/, "")));
  await prisma.agentActivity.deleteMany({ where: { id: { notIn: [...ids] } } });
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".json")).sort().slice(-120)) {
    const parsed = Activity.safeParse(readJson(path.join(dir, f)));
    if (!parsed.success) { console.error(`::warning::${f}: ${parsed.error.issues[0]?.message}`); continue; }
    const a = parsed.data;
    const data = { agent: a.agent, day: a.day, summary: a.summary, decision: a.decision, why: a.why, findings: a.findings, changes: a.changes, nextCheck: a.nextCheck ?? null, links: a.links,
      startedAt: a.startedAt ? new Date(a.startedAt) : null, finishedAt: a.finishedAt ? new Date(a.finishedAt) : null };
    await prisma.agentActivity.upsert({ where: { id: `${a.day}-${a.agent}` }, update: data, create: { id: `${a.day}-${a.agent}`, ...data } });
    n++;
  }
  return n;
}

export async function importAgentNotifications(prisma: PrismaClient, root: string): Promise<void> {
  for (const agent of AGENTS) {
    const file = path.join(root, "improvement", "notifications", `${agent}.json`);
    const keep = new Set<string>();
    if (existsSync(file)) {
      const parsed = AgentNotices.safeParse(readJson(file));
      if (!parsed.success) {
        console.error(`::warning::notifications/${agent}.json is invalid: ${parsed.error.issues[0]?.message}`);
        continue;   // don't resolve anything on a bad file
      }
      let skipped = false;
      for (const [i, raw] of parsed.data.notifications.entries()) {
        const item = AgentNotice.safeParse(raw);
        if (!item.success) {   // one bad item: raise the others, but resolve nothing (its key is unknown)
          console.error(`::warning::notifications/${agent}.json item ${i} is invalid: ${item.error.issues[0]?.message}`);
          skipped = true;
          continue;
        }
        const n = item.data;
        const key = `agent:${agent}:${n.key}`;
        keep.add(key);
        await notify(prisma, { key, source: agent, severity: n.severity, title: n.title, detail: n.detail, fix: n.fix,
          ...(n.proposal ? { proposal: n.proposal } : {}) });
      }
      if (skipped) continue;
    }
    await resolveOthers(prisma, `agent:${agent}:`, keep);   // the agent dropped it: fixed
  }
}

const DOCS: Record<string, string> = {
  experiments: "config/experiments.json",
  experimentLedger: "improvement/experiments.json",
  proposals: "improvement/research/proposals.json",
  mergeLog: "improvement/merge-log.json",
  dashboardBacklog: "improvement/dashboard/backlog.json",
  templateDecisions: "improvement/template-decisions.json",
  auditorBacklog: "improvement/auditor/backlog.json",
  dataAudit: "metrics/data-audit.json",
  topicFeed: "improvement/research/topics.json",
  longTopicFeed: "improvement/longform/topics.json",
  longBacklog: "improvement/longform/backlog.json",
  // the auditor's AI analysis of the numbers (2026-11-03), shown on the Analytics page
  aiChannel: "improvement/analysis/channel.json",
  aiVideos: "improvement/analysis/videos.json",
  // the variant system (improvement/arms.py): options, defaults, dropped ones and every verdict
  armsConfig: "config/arms.json",
  armsState: "improvement/arms-state.json",
  armsLog: "improvement/arms-log.json",
  // what each landed change did to the Shorts (generator/impact.py, owner 2026-11-10): the Impact page
  impact: "improvement/weekly/impact.json",
  // the weekly loop (owner, 2026-11-12): the Growth loop page
  cycleBacklog: "improvement/cycle/backlog.json",
  cycleStatus: "improvement/cycle/status.json",
  cycleRecipe: "improvement/cycle/recipe.json",
  pictures: "improvement/analysis/pictures.json",
};

export type Lesson = { n: number; title: string; date: string | null; source: string | null; seen: string; fix: string };

/** The reviewer's lessons (generator/prompts/lessons.md) as data: "## 1. Title (date, source)", "Seen in: …", "Fix: …". */
export function parseLessons(md: string): Lesson[] {
  const out: Lesson[] = [];
  const parts = md.split(/^## /m).slice(1);
  for (const part of parts) {
    const [head = "", ...rest] = part.split("\n");
    const m = /^(\d+)\.\s+(.+?)(?:\s+\(([^)]*)\))?\s*$/.exec(head.trim());
    if (!m) continue;
    const meta = (m[3] ?? "").split(",").map((x) => x.trim()).filter(Boolean);
    const date = meta.find((x) => /^\d{4}-\d{2}-\d{2}$/.test(x)) ?? null;
    const source = meta.filter((x) => x !== date).join(", ") || null;
    const body = rest.join("\n").trim();
    const fixAt = body.search(/^Fix:/m);
    const seen = (fixAt >= 0 ? body.slice(0, fixAt) : body).replace(/^Seen in:\s*/, "").replace(/\s+/g, " ").trim();
    const fix = fixAt >= 0 ? body.slice(fixAt).replace(/^Fix:\s*/, "").replace(/\s+/g, " ").trim() : "";
    out.push({ n: Number(m[1]), title: m[2]!.trim(), date, source, seen, fix });
  }
  return out;
}

/** The topic feed with each topic's video (from history.json: the video run records topic.feed_id there). */
function withUsage(value: unknown, root: string): unknown {
  const file = path.join(root, "history", "history.json");
  if (!existsSync(file) || !value || typeof value !== "object" || !Array.isArray((value as { topics?: unknown }).topics)) return value;
  const entries = readJson(file) as { id: string; topic?: { feed_id?: string } }[];
  const usedBy = new Map(entries.filter((e) => e.topic?.feed_id).map((e) => [e.topic!.feed_id!, e.id]));
  const topics = (value as { topics: Record<string, unknown>[] }).topics.map((t) => ({ ...t, usedBy: usedBy.get(String(t.id)) ?? null }));
  return { ...(value as object), topics };
}

export async function snapshotDocs(prisma: PrismaClient, root: string): Promise<void> {
  const lessonsFile = path.join(root, "generator", "prompts", "lessons.md");
  if (existsSync(lessonsFile)) {
    const value = { lessons: parseLessons(readFileSync(lessonsFile, "utf8")) } as Prisma.InputJsonValue;
    await prisma.repoDoc.upsert({ where: { key: "lessons" }, update: { value }, create: { key: "lessons", value } });
  }
  for (const [key, rel] of Object.entries(DOCS)) {
    const file = path.join(root, rel);
    if (!existsSync(file)) continue;
    try {
      const raw = readJson(file);
      const value = (key === "topicFeed" ? withUsage(raw, root) : raw) as Prisma.InputJsonValue;
      await prisma.repoDoc.upsert({ where: { key }, update: { value }, create: { key, value } });
    } catch (e) {
      console.error(`::warning::${rel}: ${e instanceof Error ? e.message : e}`);
    }
  }
}

/** Apply each agent template decision once; the applied ids are remembered in RepoDoc. */
export async function applyTemplateDecisions(prisma: PrismaClient, root: string): Promise<string[]> {
  const file = path.join(root, "improvement", "template-decisions.json");
  if (!existsSync(file)) return [];
  const parsed = TemplateDecisions.safeParse(readJson(file));
  if (!parsed.success) { console.error(`::warning::template-decisions.json: ${parsed.error.issues[0]?.message}`); return []; }
  const row = await prisma.repoDoc.findUnique({ where: { key: "appliedTemplateDecisions" } });
  const applied = new Set(Array.isArray(row?.value) ? (row.value as string[]) : []);
  const done: string[] = [];
  for (const d of parsed.data.decisions) {
    if (applied.has(d.id) || !(await prisma.template.findUnique({ where: { id: d.template } }))) continue;
    const data = d.action === "retire" ? { enabled: false }
      : d.action === "enable" ? { enabled: true, ...(d.weight !== undefined ? { weight: d.weight } : {}) }
      : { weight: d.weight ?? 1 };
    await prisma.template.update({ where: { id: d.template }, data });
    applied.add(d.id);
    done.push(`${d.action} ${d.template}${d.weight !== undefined ? ` → ${d.weight}` : ""}`);
  }
  if (done.length) {
    const value = [...applied] as Prisma.InputJsonValue;
    await prisma.repoDoc.upsert({ where: { key: "appliedTemplateDecisions" }, update: { value }, create: { key: "appliedTemplateDecisions", value } });
  }
  return done;
}

type Style = { palette?: string; genre?: string; bpm?: number; voice?: string | null; experiments?: Record<string, string>;
  thumbs?: { file: string; angle: string | null; layout?: string | null }[]; thumbTest?: { winner: string; at: string } };

/** metrics/videos.json + metrics/runs.json. Returns true when either file changed. */
export async function exportMetrics(prisma: PrismaClient, root: string, now = new Date()): Promise<boolean> {
  const published = await prisma.video.findMany({
    where: { status: "published", deletedAt: null, upload: { isNot: null } },
    include: { topic: true, upload: { include: { stats: true } } },
    orderBy: { createdAt: "asc" },
  });
  // views 48 hours after publishing from the hourly public-counter snapshots: no Analytics lag, so the
  // variant system (improvement/arms.py) can judge a Short two days after it went out
  const snaps = await prisma.liveSnapshot.findMany({ where: { uploadId: { in: published.map((v) => v.upload!.id) } }, select: { uploadId: true, hour: true, views: true } })
    .catch((e: unknown) => { console.log(`::warning::live snapshots unreadable, views48hLive left empty: ${e instanceof Error ? e.message : e}`); return []; });
  const videos = published.map((v) => {
    const u = v.upload!;
    const style = (v.style ?? {}) as Style;
    const day0 = istDay(u.publishAt);
    const day1 = istDay(new Date(u.publishAt.getTime() + DAY_MS));
    const byDay = new Map(u.stats.map((s) => [s.day.toISOString().slice(0, 10), s]));
    // views in the publish day and the next: only once Analytics has the second day
    const views48h = byDay.has(day1) ? (byDay.get(day0)?.views ?? 0) + byDay.get(day1)!.views : null;
    // the first week, for long videos whose views come slowly: only once Analytics has day seven
    const week = Array.from({ length: 7 }, (_, i) => istDay(new Date(u.publishAt.getTime() + i * DAY_MS)));
    const views7d = byDay.has(week[6]!) ? week.reduce((a, d) => a + (byDay.get(d)?.views ?? 0), 0) : null;
    const totalViews = u.stats.reduce((a, s) => a + s.views, 0);
    const avgViewPct = totalViews > 0 ? Math.round(u.stats.reduce((a, s) => a + s.avgViewPct * s.views, 0) / totalViews * 10) / 10 : null;
    return {
      id: v.id, format: v.format, template: v.templateId, category: v.topic.category, hookStyle: v.hookStyle, title: v.title,
      palette: style.palette ?? null, genre: style.genre ?? null, bpm: style.bpm ?? null, voice: style.voice ?? null, durationSec: v.durationSec,
      experiments: style.experiments ?? {}, publishAt: u.publishAt.toISOString(), manual: !u.attempts,
      views48h, views7d, avgViewPct, views: u.liveViews ?? totalViews, likes: u.liveLikes ?? u.stats.reduce((a, s) => a + s.likes, 0),
      subsGained: u.stats.reduce((a, s) => a + s.subsGained, 0),
      views48hLive: viewsAt48h(snaps.filter((s) => s.uploadId === u.id), u.publishAt),
      // viewers still watching at 3 s (Short) or 30 s (long): the hook's own score (workers/lib/retention.ts)
      hookHold: u.hookHold ?? null,
      // the weekly loop (2026-11-12): Analytics views and engaged views (did not swipe away), so improvement/evaluate.py
      // can pool "stayed to watch" across a test's Shorts; and the share of viewers still there at 3 s who reach the end
      // ("held after the hook"), the number that judges the look and the story after the first second
      analyticsViews: totalViews, engagedViews: u.stats.reduce((a, s) => a + s.engagedViews, 0),
      stayed: totalViews > 0 ? Math.round(u.stats.reduce((a, s) => a + s.engagedViews, 0) / totalViews * 1000) / 1000 : null,
      endHold: endHoldOf(u.retention),
      heldAfterHook: heldAfterHook(u.hookHold, endHoldOf(u.retention)),
      // a Test & Compare of three thumbnails: the angle of each, and the one YouTube picked (owner logs it)
      thumbAngles: (style.thumbs ?? []).map((t) => t.angle),
      thumbWinner: style.thumbTest?.winner ? (style.thumbs ?? []).find((t) => t.file === style.thumbTest!.winner)?.angle ?? null : null,
      // the same test by thumbnail type (long videos, 2026-10-26: grid, ladder, extremes, face, scene)
      thumbLayouts: (style.thumbs ?? []).map((t) => t.layout ?? null),
      thumbWinnerLayout: style.thumbTest?.winner ? (style.thumbs ?? []).find((t) => t.file === style.thumbTest!.winner)?.layout ?? null : null,
    };
  });
  const since = new Date(now.getTime() - 60 * DAY_MS);
  const attempted = await prisma.video.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: "asc" }, select: { id: true, templateId: true, createdAt: true, status: true, failReason: true } });
  const runs = attempted.map((v) => ({
    id: v.id, day: istDay(v.createdAt), template: v.templateId, status: v.status === "failed" ? "failed" : "shipped", reason: v.failReason ?? null,
  }));
  const days = [...new Set(runs.map((r) => r.day))].sort().map((day) => {
    const mine = runs.filter((r) => r.day === day);
    return { day, shipped: mine.filter((r) => r.status === "shipped").length, failed: mine.filter((r) => r.status === "failed").length };
  });
  mkdirSync(path.join(root, "metrics"), { recursive: true });
  let changed = false;
  const write = (name: string, body: unknown) => {
    const file = path.join(root, "metrics", name);
    const next = JSON.stringify(body, null, 2) + "\n";
    if (!existsSync(file) || readFileSync(file, "utf8").replace(/\r\n/g, "\n") !== next) { writeFileSync(file, next); changed = true; }
  };
  write("videos.json", { note: "Published videos with YouTube numbers. Written by the ingest workflow; read by improvement.evaluate.", videos });
  write("runs.json", { note: "Every video attempted in the last 60 days. Written by the ingest workflow.", days, videos: runs });
  // the owner's answers to agents' proposed setting changes, so the monthly review learns from them
  const decided = await prisma.notification.findMany({ where: { decidedAt: { not: null } }, orderBy: { decidedAt: "asc" },
    select: { dedupeKey: true, source: true, title: true, proposal: true, decision: true, decidedAt: true } });
  write("decisions.json", { note: "Agent proposals the owner approved or declined on the dashboard. Written by the ingest workflow.",
    decisions: decided.map((d) => ({ key: d.dedupeKey, source: d.source, title: d.title, proposal: d.proposal, decision: d.decision, decidedAt: d.decidedAt!.toISOString() })) });
  // the owner's feedback (2026-10-30): read by the video routine (state) and the agents every night
  write("feedback.json", await feedbackExport(prisma, now));
  // Studio-grade numbers for the auditor's AI analysis (2026-11-03)
  write("analytics.json", await analyticsExport(prisma, now));
  return changed;
}

type Curve = [number, number][];

/** The last point of a retention curve: the share of viewers still there at the end (above 1 when people rewatch). */
export function endHoldOf(retention: unknown): number | null {
  return Array.isArray(retention) && retention.length ? (retention as Curve).at(-1)![1] : null;
}

/** Of the viewers still watching after the hook, the share who reach the end: the end hold over the hook hold,
 * capped at 1.5 (loops). Null until YouTube draws a curve (it needs a few dozen views). */
export function heldAfterHook(hookHold: number | null | undefined, endHold: number | null): number | null {
  if (hookHold == null || endHold == null || hookHold <= 0) return null;
  return Math.round(Math.min(1.5, endHold / hookHold) * 1000) / 1000;
}

/** The public view count 48 hours after publishing: the first snapshot 48–51 h after it, else a straight line
 * between the snapshots either side of 48 h when they are at most 12 h apart (null until then). The "hourly"
 * watchdog runs every 5–9 h on GitHub's schedule, so most Shorts get no snapshot inside the 3-hour window. */
export function viewsAt48h(snaps: { hour: Date; views: number }[], publishAt: Date): number | null {
  const at = publishAt.getTime() + 48 * 3_600_000;
  const sorted = [...snaps].sort((a, b) => a.hour.getTime() - b.hour.getTime());
  const after = sorted.find((s) => s.hour.getTime() >= at);
  if (!after) return null;
  const t1 = after.hour.getTime();
  if (t1 <= at + 3 * 3_600_000) return after.views;
  const before = sorted.filter((s) => s.hour.getTime() < at).at(-1);
  if (!before || t1 - before.hour.getTime() > 12 * 3_600_000) return null;
  const t0 = before.hour.getTime();
  return Math.round(before.views + (after.views - before.views) * (at - t0) / (t1 - t0));
}

/** metrics/analytics.json: what the auditor's AI analysis reads (the routines have no database). Per video
 * the wider numbers, where viewers left (matched to the script), traffic, countries, searches and, for the
 * last 14 days, comment texts (no names); per channel the 28-day breakdowns by format. Replaced daily. */
export async function analyticsExport(prisma: PrismaClient, now = new Date()) {
  const published = await prisma.video.findMany({
    where: { status: "published", deletedAt: null, upload: { youtubeId: { not: null } } },
    include: { upload: { include: { stats: true, comments: { orderBy: { likes: "desc" }, take: 20 } } } },
    orderBy: { createdAt: "asc" },
  });
  const breakdowns = await prisma.breakdown.findMany({ where: { OR: [{ scope: { startsWith: "video:" } }, { scope: { in: ["channel:all:28", "channel:short:28", "channel:long:28", "channel:all:90"] } }] } });
  const top = (scope: string, kind: string, n: number) => breakdowns.filter((b) => b.scope === scope && b.kind === kind).sort((a, b) => b.views - a.views).slice(0, n)
    .map((b) => ({ key: b.key, views: Math.round(b.views * 10) / 10, share: Math.round(b.share * 1000) / 1000, ...(b.extra && typeof b.extra === "object" ? b.extra as object : {}) }));
  const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
  const videos = published.map((v) => {
    const u = v.upload!;
    const views = sum(u.stats.map((s) => s.views));
    const imp = sum(u.stats.map((s) => s.impressions ?? 0));
    const scope = `video:${v.id}`;
    const recent = now.getTime() - u.publishAt.getTime() < 14 * DAY_MS;
    return {
      id: v.id, format: v.format, title: v.title, publishAt: u.publishAt.toISOString(), durationSec: v.durationSec,
      views, engagedRatio: views ? Math.round((sum(u.stats.map((s) => s.engagedViews)) / views) * 1000) / 1000 : null,
      watchHours: Math.round((sum(u.stats.map((s) => s.watchMinutes)) / 60) * 10) / 10, shares: sum(u.stats.map((s) => s.shares)),
      subsGained: sum(u.stats.map((s) => s.subsGained)), subsLost: sum(u.stats.map((s) => s.subsLost)),
      impressions: imp || null, ctr: imp ? Math.round((sum(u.stats.map((s) => (s.impressions ?? 0) * (s.ctr ?? 0))) / imp) * 10000) / 10000 : null,
      hookHold: u.hookHold, endHold: endHoldOf(u.retention),
      vsSimilarLength: Array.isArray(u.relRetention) && u.relRetention.length ? Math.round(((u.relRetention as Curve).reduce((a, p) => a + p[1], 0) / u.relRetention.length) * 100) / 100 : null,
      drops: u.drops ?? [],
      traffic: top(scope, "traffic", 6), countries: top(scope, "country", 5), searches: top(scope, "search", 8), devices: top(scope, "device", 3), subscribed: top(scope, "subscribed", 2),
      comments: recent ? u.comments.map((c) => ({ text: c.text.slice(0, 300), likes: c.likes })) : [],
    };
  });
  const channel = Object.fromEntries(["all:28", "short:28", "long:28", "all:90"].map((k) => [k, Object.fromEntries(
    ["traffic", "search", "suggested", "external", "country", "ageGender", "device", "subscribed", "sharing"].map((kind) => [kind, top(`channel:${k}`, kind, 12)]))]));
  const days = await prisma.channelDay.findMany({ where: { day: { gte: new Date(now.getTime() - 56 * DAY_MS) } }, orderBy: { day: "asc" } });
  return {
    note: "Studio-grade YouTube numbers for the auditor's AI analysis (agents/auditor.md step 3b). Written by the ingest workflow; replaced daily.",
    channel, channelDays: days.map((d) => ({ day: d.day.toISOString().slice(0, 10), format: d.format, views: d.views, engagedViews: d.engagedViews, watchMinutes: Math.round(d.watchMinutes), avgViewPct: d.avgViewPct, subsGained: d.subsGained, subsLost: d.subsLost, shares: d.shares })),
    videos,
  };
}

/** metrics/feedback.json: every note of the last 90 days with the video it is about, the open ones first. */
export async function feedbackExport(prisma: PrismaClient, now = new Date()) {
  const since = new Date(now.getTime() - 90 * DAY_MS);
  const rows = await prisma.feedback.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: "desc" },
    include: { video: { select: { id: true, title: true, format: true, hookStyle: true, status: true, script: true } } } });
  const about = (v: (typeof rows)[number]["video"]) => {
    if (!v) return null;
    const sc = (v.script ?? {}) as { story?: string; shape?: unknown; beats?: { say?: string }[] };
    const shape = typeof sc.shape === "string" ? sc.shape : (sc.shape as { id?: string } | undefined)?.id ?? null;
    return { id: v.id, title: v.title, format: v.format, status: v.status, story: sc.story ?? null, shape, hookStyle: v.hookStyle, hook: sc.beats?.[0]?.say ?? null };
  };
  const notes = rows.map((f) => ({ id: f.id, kind: f.kind, area: f.area, text: f.text, status: f.status, response: f.response,
    at: f.createdAt.toISOString(), video: about(f.video) }));
  return {
    note: "The owner's feedback from the dashboard (choices, stale videos, notes on a video or the channel). Written by the ingest workflow. Read by generator.run state (owner_feedback), the editor, the improver and research. Every agent answers the notes in its lane in improvement/feedback-acks/<agent>.json (agents/policy.md).",
    open: notes.filter((n) => n.status === "open").length,
    notes: [...notes.filter((n) => n.status === "open"), ...notes.filter((n) => n.status !== "open")],
  };
}

const EditorRanking = z.object({
  rankedAt: z.string(),
  videos: z.array(z.object({ id: z.string(), rank: z.number().int().min(1), score: z.number().min(0).max(10),
    why: z.string(), strengths: z.array(z.string()).default([]), risks: z.array(z.string()).default([]) })),
});

/** improvement/editor/ranking.json (the editor step of the video routine) into the queue: each queued
 * video's rank, score and why; the queue is reordered by it, except videos the owner placed himself
 * (orderLocked), which keep their place at the front, and breaking or trending videos, which ingest put next
 * (the 11:30 trend run makes no new ranking, so a trend Short is never in it). Returns the ids ranked. */
export async function importEditorRanking(prisma: PrismaClient, root: string, now = new Date()): Promise<string[]> {
  const file = path.join(root, "improvement", "editor", "ranking.json");
  if (!existsSync(file)) return [];
  const parsed = EditorRanking.safeParse(readJson(file));
  if (!parsed.success) { console.error(`::warning::editor/ranking.json: ${parsed.error.issues[0]?.message}`); return []; }
  const { rankedAt, videos } = parsed.data;
  if (!videos.length) return [];
  const queued = await prisma.video.findMany({ where: { status: "queued", deletedAt: null }, select: { id: true, format: true, queuePosition: true, orderLocked: true, createdAt: true, style: true } });
  const byId = new Map(videos.map((v) => [v.id, v]));
  const ranked = queued.filter((q) => byId.has(q.id));
  await prisma.$transaction(ranked.map((q) => {
    const r = byId.get(q.id)!;
    return prisma.video.update({ where: { id: q.id }, data: { editorRank: r.rank, editorScore: r.score,
      editorNote: { why: r.why, strengths: r.strengths, risks: r.risks, rankedAt } as Prisma.InputJsonValue } });
  }));
  // per format: the owner's own order first, then urgent (trend) videos, then the editor's ranking, then the unranked by age
  const today = istDay(now);
  const urgent = (q: (typeof queued)[number]) => (isUrgent(q.style, today) ? 0 : 1);
  const updates = [];
  for (const format of ["short", "long"]) {
    const mine = queued.filter((q) => q.format === format);
    const locked = mine.filter((q) => q.orderLocked).sort((a, b) => (a.queuePosition ?? 0) - (b.queuePosition ?? 0));
    const free = mine.filter((q) => !q.orderLocked).sort((a, b) => urgent(a) - urgent(b) ||
      (byId.get(a.id)?.rank ?? 1e6) - (byId.get(b.id)?.rank ?? 1e6) || (a.queuePosition ?? 1e6) - (b.queuePosition ?? 1e6));
    updates.push(...[...locked, ...free].map((q, i) => ({ id: q.id, queuePosition: i + 1 })));
  }
  await prisma.$transaction(updates.map((u) => prisma.video.update({ where: { id: u.id }, data: { queuePosition: u.queuePosition } })));
  return ranked.map((q) => q.id);
}

const Ack = z.object({ id: z.string(), action: z.string(), note: z.string().default(""), commit: z.string().optional(),
  agent: z.string().optional(), to: z.string().optional() });
const FeedbackAcks = z.object({ acks: z.array(Ack) });
type AckRow = z.infer<typeof Ack> & { agent: string };
/** an agent's answer that leaves the note open for another agent (owner, 2026-11-10: every agent that can fix a note gets it) */
const HANDOFF = new Set(["handed", "partly"]);

/** Every agent's answers: improvement/feedback-acks/<agent>.json, plus the improver's older improvement/feedback-acks.json. */
export function readFeedbackAcks(root: string): AckRow[] {
  const files: [string, string][] = [["improver", path.join(root, "improvement", "feedback-acks.json")]];
  const dir = path.join(root, "improvement", "feedback-acks");
  if (existsSync(dir)) for (const f of readdirSync(dir).sort()) if (f.endsWith(".json")) files.push([f.slice(0, -5), path.join(dir, f)]);
  const out: AckRow[] = [];
  for (const [agent, file] of files) {
    if (!existsSync(file)) continue;
    const parsed = FeedbackAcks.safeParse(readJson(file));
    if (!parsed.success) { console.error(`::warning::${path.relative(root, file)}: ${parsed.error.issues[0]?.message}`); continue; }
    out.push(...parsed.data.acks.map((a) => ({ ...a, agent: a.agent ?? agent })));
  }
  return out;
}

/** Whether `agent` has answered a note: it closed it, or handed it on to someone other than an agent that
 * handed it to `agent` (a handoff back to the hander is an earlier answer). Mirrors generator/feedback.py `has_answered`. */
export function hasAnswered(agent: string, acks: AckRow[]): boolean {
  const handers = new Set(acks.filter((a) => HANDOFF.has(a.action) && a.to === agent).map((a) => a.agent));
  return acks.some((a) => a.agent === agent && (!HANDOFF.has(a.action) || !a.to || !handers.has(a.to)));
}

/** A note is addressed once some agent closed it and every agent it was handed to has answered too. */
export function ackState(acks: AckRow[]): { addressed: boolean; response: string } {
  const closedBy = new Set(acks.filter((a) => !HANDOFF.has(a.action)).map((a) => a.agent));
  const waiting = acks.filter((a) => HANDOFF.has(a.action) && a.to && !hasAnswered(a.to, acks)).map((a) => a.to!);
  const response = acks.map((a) => `${a.agent} ${a.action}${a.to ? ` → ${a.to}` : ""}: ${a.note}${a.commit ? ` (${a.commit})` : ""}`.trim()).join(" · ");
  return { addressed: closedBy.size > 0 && waiting.length === 0, response: waiting.length ? `${response} · waiting for ${[...new Set(waiting)].join(", ")}` : response };
}

/** The agents' answers to the owner's notes into the dashboard (open notes stay open while handed to another agent). */
export async function importFeedbackAcks(prisma: PrismaClient, root: string): Promise<number> {
  const byNote = new Map<string, AckRow[]>();
  for (const a of readFeedbackAcks(root)) byNote.set(a.id, [...(byNote.get(a.id) ?? []), a]);
  let n = 0;
  for (const [id, acks] of byNote) {
    const row = await prisma.feedback.findUnique({ where: { id } });
    if (!row) continue;
    const { addressed, response } = ackState(acks);
    // the owner may close a note himself on the dashboard: an agent's handoff never reopens it
    const status = addressed || row.status === "addressed" ? "addressed" : "open";
    if (row.status === status && row.response === response) continue;
    await prisma.feedback.update({ where: { id }, data: { status, response, addressedAt: status === "addressed" ? row.addressedAt ?? new Date() : null } });
    n++;
  }
  return n;
}
