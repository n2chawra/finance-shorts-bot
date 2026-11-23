/**
 * Ingest's health pass for every live channel (lib/health.ts): gathers the numbers, stores
 * Channel.settings.health for the Channels page, raises or resolves the channel's notices, applies the
 * stop rule's 1 a day (logged in channels/<slug>/changes.json), and sends the Monday digest.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { Prisma, PrismaClient } from "@prisma/client";

import { CHANNEL_ONE, layout, liveInRepo } from "./channels.ts";
import { type Week, digest, health, istWeek } from "./health.ts";
import { notify, resolve } from "./notify.ts";
import { loadSettings } from "./settings.ts";

const DAY = 86_400_000;
const readJson = (f: string): Record<string, unknown> | null => { try { return JSON.parse(readFileSync(f, "utf8")); } catch { return null; } };

/** Every default change per channel, with its date and reason (one change at a time is the rule). */
export function logChange(root: string, slug: string, change: { what: string; from: unknown; to: unknown; why: string; by: string }, now = new Date()): void {
  const dir = path.join(root, "channels", slug);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "changes.json");
  const log = (readJson(file) as { changes?: unknown[] } | null)?.changes ?? [];
  writeFileSync(file, JSON.stringify({ note: "Every default change for this channel, newest last (multi-channel plan: one change at a time).", changes: [...log, { at: now.toISOString(), ...change }] }, null, 2) + "\n");
}

export async function syncHealth(prisma: PrismaClient, root: string, now = new Date()): Promise<string[]> {
  const platform = await loadSettings(prisma);
  // a channel whose folder is gone from the repo (removed before the owner pressed Delete) gets no health or notices
  const channels = liveInRepo(await prisma.channel.findMany({ where: { status: { in: ["active", "paused"] } }, orderBy: { createdAt: "asc" } }), root);
  const since = new Date(now.getTime() - 8 * 7 * DAY);
  // minutes of routine runs in the last week: video runs (AgentRun, by the video's channel) and agent nights
  const runs = await prisma.agentRun.findMany({ where: { startedAt: { gte: new Date(now.getTime() - 7 * DAY) }, finishedAt: { not: null } },
    select: { startedAt: true, finishedAt: true, video: { select: { channelId: true } } } });
  const nights = await prisma.agentActivity.findMany({ where: { startedAt: { gte: new Date(now.getTime() - 7 * DAY) }, finishedAt: { not: null } },
    select: { startedAt: true, finishedAt: true, channelId: true } });
  const minutes = new Map<string, number>();
  let all = 0;
  for (const r of [...runs.map((x) => ({ ...x, channelId: x.video?.channelId ?? null })), ...nights]) {
    const m = Math.max(0, (r.finishedAt!.getTime() - r.startedAt!.getTime()) / 60_000);
    all += m;
    if (r.channelId) minutes.set(r.channelId, (minutes.get(r.channelId) ?? 0) + m);
  }
  const out: string[] = [];
  for (const ch of channels) {
    const own = (ch.settings ?? {}) as Record<string, unknown>;
    const uploadTimes = (own.uploadTimes as string[] | undefined) ?? platform.uploadTimes;
    const every = (own.shortEveryDays as number | undefined) ?? platform.shortEveryDays;
    const stats = await prisma.videoStat.findMany({ where: { day: { gte: since }, upload: { video: { channelId: ch.id, format: "short" } } }, select: { day: true, views: true, engagedViews: true } });
    const byWeek = new Map<string, Week>();
    for (const s of stats) {
      const k = istWeek(s.day);
      const w = byWeek.get(k) ?? { week: k, views: 0, engaged: 0 };
      w.views += s.views; w.engaged += s.engagedViews;
      byWeek.set(k, w);
    }
    const thisWeek = istWeek(now);
    if (!byWeek.has(thisWeek)) byWeek.set(thisWeek, { week: thisWeek, views: 0, engaged: 0 });
    const critical = (await prisma.notification.findMany({ where: { channelId: ch.id, severity: "critical", resolvedAt: null }, select: { title: true } })).map((n) => n.title);
    const h = health({
      channel: ch.id, name: ch.name, status: ch.status,
      queuedShorts: await prisma.video.count({ where: { channelId: ch.id, status: "queued", format: "short", deletedAt: null } }),
      shortsPostedPerDay: uploadTimes.length / Math.max(1, every),
      weeks: [...byWeek.values()].sort((a, b) => a.week.localeCompare(b.week)),
      usageMinutes: minutes.get(ch.id) ?? 0, allUsageMinutes: all, critical,
      generationPaused: Boolean((own.generationPaused as boolean | undefined) ?? platform.generationPaused),
      stopRuleActions: ch.id !== CHANNEL_ONE,
    });
    // the channel's notices: raised while the condition holds, resolved when it clears
    for (const n of h.notices) await notify(prisma, { ...n, source: "health", channelId: ch.id });
    if (!h.notices.some((n) => n.key === `buffer:${ch.id}`)) await resolve(prisma, `buffer:${ch.id}`);
    // the stop rule: 1 Short a day until the owner answers (logged; never twice)
    let settings: Record<string, unknown> = { ...own };
    if (h.dialDown && own.dailyVideoTarget !== 1 && !own.stopRuleAnsweredAt) {
      logChange(root, ch.id, { what: "dailyVideoTarget", from: own.dailyVideoTarget ?? platform.dailyVideoTarget, to: 1, why: "stop rule: six weeks under 45% stayed to watch", by: "health" }, now);
      settings = { ...settings, dailyVideoTarget: 1 };
      out.push(`${ch.id}: stop rule, now 1 Short a day`);
    }
    // the Monday digest, once a week per channel
    const istDay = new Date(now.getTime() + 330 * 60_000).getUTCDay();
    if (istDay === 1 && ch.status === "active") {
      const status = readJson(path.join(root, ch.id === layout().default && !existsSync(path.join(root, "channels", ch.id)) ? "improvement/cycle/status.json" : `channels/${ch.id}/cycle/status.json`)) ?? {};
      const uploads = await prisma.upload.count({ where: { publishAt: { gte: new Date(now.getTime() - 7 * DAY), lte: now }, video: { channelId: ch.id, format: "short" } } });
      const d = digest(ch.name, h, { running: (status.running as string | null) ?? null, lastVerdict: ((status.experiment as { verdict?: string } | undefined)?.verdict) ?? null }, uploads);
      await notify(prisma, { key: `digest:${ch.id}:${istWeek(now)}`, source: "health", severity: "info", title: d.title, detail: d.detail, fix: "Nothing to do: this is the weekly summary.", channelId: ch.id });
    }
    await prisma.channel.update({ where: { id: ch.id }, data: { settings: { ...settings, health: {
      color: h.color, reason: h.reason, bufferDays: h.bufferDays, stayed: h.stayed, stayedBefore: h.stayedBefore,
      weeksUnderFloor: h.weeksUnderFloor, usageShare: h.usageShare, at: now.toISOString(),
    } } as Prisma.InputJsonValue } });
    out.push(`${ch.id}: ${h.color} (${h.reason})`);
  }
  return out;
}
