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
const AGENTS = ["research", "improver", "dashboard", "auditor"] as const;

const readJson = (file: string): unknown => JSON.parse(readFileSync(file, "utf8"));

const Activity = z.object({
  agent: z.enum(AGENTS),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startedAt: z.iso.datetime().optional(),
  finishedAt: z.iso.datetime().optional(),
  summary: z.string().min(1),
  decision: z.enum(["acted", "waited", "blocked", "nothing"]),
  why: z.string(),
  findings: z.array(z.object({ title: z.string(), detail: z.string().optional(), link: z.string().optional() })).default([]),
  changes: z.array(z.object({ title: z.string(), detail: z.string().optional(), branch: z.string().optional(), experiment: z.string().optional() })).default([]),
  nextCheck: z.string().nullish(),
  links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
});

const AgentNotices = z.object({
  notifications: z.array(z.object({
    key: z.string().min(1), severity: z.enum(["info", "warning", "critical"]), title: z.string().min(1), detail: z.string(), fix: z.string(),
  })),
});

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
      if (parsed.success) {
        for (const n of parsed.data.notifications) {
          const key = `agent:${agent}:${n.key}`;
          keep.add(key);
          await notify(prisma, { key, source: agent, severity: n.severity, title: n.title, detail: n.detail, fix: n.fix });
        }
      } else {
        console.error(`::warning::notifications/${agent}.json is invalid: ${parsed.error.issues[0]?.message}`);
        continue;   // don't resolve anything on a bad file
      }
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

type Style = { palette?: string; genre?: string; bpm?: number; voice?: string | null; experiments?: Record<string, string> };

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
    const totalViews = u.stats.reduce((a, s) => a + s.views, 0);
    const avgViewPct = totalViews > 0 ? Math.round(u.stats.reduce((a, s) => a + s.avgViewPct * s.views, 0) / totalViews * 10) / 10 : null;
    return {
      id: v.id, template: v.templateId, category: v.topic.category, hookStyle: v.hookStyle, title: v.title,
      palette: style.palette ?? null, genre: style.genre ?? null, bpm: style.bpm ?? null, voice: style.voice ?? null, durationSec: v.durationSec,
      experiments: style.experiments ?? {}, publishAt: u.publishAt.toISOString(), manual: !u.attempts,
      views48h, avgViewPct, views: Math.max(totalViews, u.liveViews ?? 0), likes: Math.max(u.stats.reduce((a, s) => a + s.likes, 0), u.liveLikes ?? 0),
      subsGained: u.stats.reduce((a, s) => a + s.subsGained, 0),
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
  return changed;
}
