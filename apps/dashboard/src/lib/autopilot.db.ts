/** Notifications and the self-improving agents' activity, from Postgres. */
import type { Notification as Row } from "@prisma/client";

import { prisma } from "./prisma";
import { clusterVideoRuns } from "./run-times";
import { AgentsSchema, ActivitySchema } from "./schemas";
import type { Agents, Notification, Notifications } from "./schemas";

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 } as const;

function toNotification(r: Row): Notification {
  return {
    id: r.id, source: r.source, severity: r.severity, title: r.title, detail: r.detail, fix: r.fix,
    createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString(),
    seenAt: r.seenAt?.toISOString() ?? null, resolvedAt: r.resolvedAt?.toISOString() ?? null,
    proposal: (r.proposal as Notification["proposal"]) ?? null, decision: r.decision === "approved" || r.decision === "declined" ? r.decision : null,
  };
}

export async function getNotification(id: string): Promise<Notification | null> {
  const r = await prisma.notification.findUnique({ where: { id } });
  return r ? toNotification(r) : null;
}

/** The owner's answer to a proposal: closed for good (ingest never reopens a decided notification). */
export async function decideNotification(id: string, decision: "approved" | "declined"): Promise<void> {
  const now = new Date();
  await prisma.notification.update({ where: { id }, data: { decision, decidedAt: now, resolvedAt: now, seenAt: now } });
}

export async function listNotifications(): Promise<Notifications> {
  const [open, resolved] = await Promise.all([
    prisma.notification.findMany({ where: { resolvedAt: null }, orderBy: { updatedAt: "desc" } }),
    prisma.notification.findMany({ where: { resolvedAt: { not: null } }, orderBy: { resolvedAt: "desc" }, take: 30 }),
  ]);
  open.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  return { open: open.map(toNotification), resolved: resolved.map(toNotification), unread: open.filter((n) => !n.seenAt).length };
}

export async function notificationAction(ids: string[], action: "seen" | "resolve" | "reopen"): Promise<void> {
  const now = new Date();
  const data = action === "seen" ? { seenAt: now } : action === "resolve" ? { resolvedAt: now, seenAt: now } : { resolvedAt: null };
  await prisma.notification.updateMany({ where: { id: { in: ids } }, data });
}

const listOf = (v: unknown, key: string): unknown[] => (v && typeof v === "object" && Array.isArray((v as Record<string, unknown>)[key]) ? (v as Record<string, unknown[]>)[key] : []);

export async function getAgents(): Promise<Agents> {
  const [rows, docs, steps] = await Promise.all([
    prisma.agentActivity.findMany({ orderBy: [{ day: "desc" }, { agent: "asc" }], take: 120 }),
    prisma.repoDoc.findMany({ where: { key: { in: ["experimentLedger", "experiments", "proposals", "mergeLog", "dashboardBacklog", "auditorBacklog", "dataAudit", "topicFeed"] } } }),
    prisma.agentRun.findMany({ where: { videoId: { not: null }, startedAt: { gte: new Date(Date.now() - 16 * 86_400_000) } }, select: { videoId: true, startedAt: true, finishedAt: true } }),
  ]);
  const doc = Object.fromEntries(docs.map((d) => [d.key, d.value]));
  // the ledger has the detail; the live config has the status the renderer actually uses
  const live = new Map(listOf(doc.experiments, "experiments").map((e) => [(e as { id: string }).id, e as Record<string, unknown>]));
  const experiments = listOf(doc.experimentLedger, "experiments").map((e) => ({ ...(e as object), ...(live.get((e as { id: string }).id) ?? {}) }));
  for (const [id, e] of live) if (!experiments.some((x) => (x as { id: string }).id === id)) experiments.push(e);
  const activity = rows.map((r) => ActivitySchema.safeParse({ ...r, nextCheck: r.nextCheck ?? null, startedAt: r.startedAt?.toISOString() ?? null, finishedAt: r.finishedAt?.toISOString() ?? null })).filter((p) => p.success).map((p) => p.data!);
  const parsed = AgentsSchema.safeParse({
    activity,
    videoRuns: clusterVideoRuns(steps.map((x) => ({ videoId: x.videoId!, start: x.startedAt, end: x.finishedAt ?? x.startedAt }))),
    experiments,
    proposals: listOf(doc.proposals, "proposals"),
    merges: listOf(doc.mergeLog, "merges").slice(-60).reverse(),
    backlog: [
      ...listOf(doc.auditorBacklog, "items").map((i) => ({ ...(i as object), agent: "auditor" })),
      ...listOf(doc.dashboardBacklog, "items").map((i) => ({ ...(i as object), agent: "dashboard" })),
    ],
    dataAudit: doc.dataAudit ?? null,
    topics: listOf(doc.topicFeed, "topics").reverse(),   // newest first
  });
  return parsed.success ? parsed.data : { activity, videoRuns: [], experiments: [], proposals: [], merges: [], backlog: [], dataAudit: null, topics: [] };
}

/** Raise or update an owner notification from the dashboard server (e.g. a key it relies on failed). */
export async function notifyOwner(n: { key: string; severity: "info" | "warning" | "critical"; title: string; detail: string; fix: string }): Promise<void> {
  try {
    await prisma.notification.upsert({
      where: { dedupeKey: n.key },
      update: { severity: n.severity, title: n.title, detail: n.detail, fix: n.fix, resolvedAt: null },
      create: { dedupeKey: n.key, source: "dashboard", severity: n.severity, title: n.title, detail: n.detail, fix: n.fix },
    });
  } catch (e) {
    console.error("notifyOwner:", e instanceof Error ? e.message : e);
  }
}

export async function resolveOwner(key: string): Promise<void> {
  try {
    await prisma.notification.updateMany({ where: { dedupeKey: key, resolvedAt: null }, data: { resolvedAt: new Date() } });
  } catch { /* best effort */ }
}
