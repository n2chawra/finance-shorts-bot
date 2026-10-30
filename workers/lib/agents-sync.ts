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
import { istDay } from "./publishing.ts";

const DAY_MS = 86_400_000;
const AGENTS = ["research", "improver", "dashboard", "auditor", "scout", "studio", "monthly"] as const;

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
};

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
      views48h, views7d, avgViewPct, views: Math.max(totalViews, u.liveViews ?? 0), likes: Math.max(u.stats.reduce((a, s) => a + s.likes, 0), u.liveLikes ?? 0),
      subsGained: u.stats.reduce((a, s) => a + s.subsGained, 0),
      // viewers still watching at 3 s (Short) or 30 s (long): the hook's own score (workers/lib/retention.ts)
      hookHold: u.hookHold ?? null,
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
  return changed;
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
    note: "The owner's feedback from the dashboard (choices, stale videos, notes on a video or the channel). Written by the ingest workflow. Read by generator.run state (owner_feedback), the editor, the improver and research. Answer a note in improvement/feedback-acks.json.",
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
 * (orderLocked), which keep their place at the front. Returns the ids ranked. */
export async function importEditorRanking(prisma: PrismaClient, root: string): Promise<string[]> {
  const file = path.join(root, "improvement", "editor", "ranking.json");
  if (!existsSync(file)) return [];
  const parsed = EditorRanking.safeParse(readJson(file));
  if (!parsed.success) { console.error(`::warning::editor/ranking.json: ${parsed.error.issues[0]?.message}`); return []; }
  const { rankedAt, videos } = parsed.data;
  if (!videos.length) return [];
  const queued = await prisma.video.findMany({ where: { status: "queued", deletedAt: null }, select: { id: true, format: true, queuePosition: true, orderLocked: true, createdAt: true } });
  const byId = new Map(videos.map((v) => [v.id, v]));
  const ranked = queued.filter((q) => byId.has(q.id));
  await prisma.$transaction(ranked.map((q) => {
    const r = byId.get(q.id)!;
    return prisma.video.update({ where: { id: q.id }, data: { editorRank: r.rank, editorScore: r.score,
      editorNote: { why: r.why, strengths: r.strengths, risks: r.risks, rankedAt } as Prisma.InputJsonValue } });
  }));
  // per format: the owner's own order first, then the editor's ranking, then the unranked by age
  const updates = [];
  for (const format of ["short", "long"]) {
    const mine = queued.filter((q) => q.format === format);
    const locked = mine.filter((q) => q.orderLocked).sort((a, b) => (a.queuePosition ?? 0) - (b.queuePosition ?? 0));
    const free = mine.filter((q) => !q.orderLocked).sort((a, b) =>
      (byId.get(a.id)?.rank ?? 1e6) - (byId.get(b.id)?.rank ?? 1e6) || (a.queuePosition ?? 1e6) - (b.queuePosition ?? 1e6));
    updates.push(...[...locked, ...free].map((q, i) => ({ id: q.id, queuePosition: i + 1 })));
  }
  await prisma.$transaction(updates.map((u) => prisma.video.update({ where: { id: u.id }, data: { queuePosition: u.queuePosition } })));
  return ranked.map((q) => q.id);
}

const FeedbackAcks = z.object({ acks: z.array(z.object({ id: z.string(), action: z.string(), note: z.string().default(""), commit: z.string().optional() })) });

/** improvement/feedback-acks.json (the improver's answers to the owner's notes) into the dashboard. */
export async function importFeedbackAcks(prisma: PrismaClient, root: string): Promise<number> {
  const file = path.join(root, "improvement", "feedback-acks.json");
  if (!existsSync(file)) return 0;
  const parsed = FeedbackAcks.safeParse(readJson(file));
  if (!parsed.success) { console.error(`::warning::feedback-acks.json: ${parsed.error.issues[0]?.message}`); return 0; }
  let n = 0;
  for (const a of parsed.data.acks) {
    const row = await prisma.feedback.findUnique({ where: { id: a.id } });
    const response = [a.action, a.note, a.commit ? `(${a.commit})` : ""].filter(Boolean).join(": ").trim();
    if (!row || (row.status === "addressed" && row.response === response)) continue;
    await prisma.feedback.update({ where: { id: a.id }, data: { status: "addressed", response, addressedAt: row.addressedAt ?? new Date() } });
    n++;
  }
  return n;
}
