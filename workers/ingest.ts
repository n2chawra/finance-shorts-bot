/**
 * Ingest: repo → Postgres, and settings → repo.
 *
 *   1. Every renderer template becomes a Template row.
 *   2. Every videos/<id>/manifest.json not yet in the database becomes a Video (status `queued`,
 *      or `failed`), with its checks and run steps. A shipped video is only taken once its
 *      GitHub Release has the mp4, so a video still being released is picked up next time.
 *   3. config/settings.json is rewritten from the Setting and Template tables plus the current
 *      backlog. Routines read that file; they have no database access.
 *
 * Safe to run repeatedly. `--no-release-check` skips step 2's release lookup (local testing).
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { Prisma, PrismaClient } from "@prisma/client";

import { releaseAssetUrl, repoSlug } from "./lib/github.ts";
import { formatOfId, Manifest, type ShippedManifest } from "./lib/manifest.ts";
import { istDay } from "./lib/publishing.ts";
import { applyTemplateDecisions, exportMetrics, importActivity, importAgentNotifications, importEditorRanking, importFeedbackAcks, snapshotDocs } from "./lib/agents-sync.ts";
import { type FeedTopic, loadFeeds, sourceWithTopic } from "./lib/origin.ts";
import { loadSettings, seedSettings } from "./lib/settings.ts";
import { syncThumbs } from "./lib/cover.ts";
import { allChannels, cpath, crel, layout } from "./lib/channels.ts";
import { CHANNEL_KEYS } from "./lib/channel-auth.ts";
import { syncSetups } from "./lib/setup-sync.ts";
import { scopedPrisma } from "./lib/scoped.ts";
import { syncHealth } from "./lib/health-sync.ts";

const ROOT = path.resolve(import.meta.dirname, "..");

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(file, "utf8"));
}

const titleCase = (id: string) => id.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

/** First paragraph of a template README after its heading, as one line. */
export function readmeSummary(readme: string): string {
  const para = readme.split(/\r?\n\r?\n/).map((p) => p.trim()).find((p) => p && !p.startsWith("#"));
  return (para ?? "").replace(/\s+/g, " ").slice(0, 300);
}

/** The live templates: one folder per template with its README (the writer's contract). */
export function templateIds(root = ROOT): string[] {
  const dir = path.join(root, "renderer", "templates");
  return readdirSync(dir).filter((name) => existsSync(path.join(dir, name, "README.md"))).sort();
}

/** Marks a template the repo no longer has. Old videos still point at it, so it stays, disabled. */
export const RETIRED = "Retired: the first engine's template, replaced by the Remotion story templates on 2026-10-17.";

/** Every channel's manifests (channels/<slug>/videos/, or videos/ before the move). */
export function manifestPaths(root = ROOT): string[] {
  return allChannels(root).flatMap((slug) => {
    const dir = path.join(root, crel("videos", root, slug));
    return existsSync(dir) ? readdirSync(dir).map((id) => path.join(dir, id, "manifest.json")).filter((p) => existsSync(p)).sort() : [];
  });
}

/** The channel a manifest belongs to: the channels/<slug>/ folder it sits in, else channel #1. */
export function channelOfManifest(file: string, root = ROOT): string {
  const rel = path.relative(root, file).replace(/\\/g, "/");
  const m = /^channels\/([a-z0-9][a-z0-9-]{1,40})\//.exec(rel);
  return m ? m[1]! : layout(root).default;
}

async function syncTemplates(prisma: PrismaClient): Promise<void> {
  for (const id of templateIds()) {
    const readme = path.join(ROOT, "renderer", "templates", id, "README.md");
    const description = existsSync(readme) ? readmeSummary(readFileSync(readme, "utf8")) : "";
    await prisma.template.upsert({ where: { id }, update: { description }, create: { id, name: titleCase(id), description } });
  }
  await prisma.template.updateMany({ where: { id: { notIn: templateIds() } }, data: { enabled: false, description: RETIRED } });
}

function runRows(videoId: string, steps: ShippedManifest["agentRuns"]): Prisma.AgentRunCreateManyInput[] {
  return steps.map((s, i) => ({
    id: `${videoId}:${i}`, videoId, agent: s.agent, status: s.status, log: s.notes,
    startedAt: new Date(s.startedAt), finishedAt: new Date(s.finishedAt),
  }));
}

/** Insert one manifest. Returns what happened. */
async function ingestOne(prisma: PrismaClient, file: string, repo: string | null, feeds: Map<string, FeedTopic>): Promise<"queued" | "failed" | "waiting"> {
  const m = Manifest.parse(readJson(file));
  const channelId = channelOfManifest(file);
  const dir = path.dirname(file);
  const scriptFile = path.join(dir, "script.json");
  const script = (existsSync(scriptFile) ? readJson(scriptFile) : {}) as Prisma.InputJsonValue;
  const createdAt = new Date(m.createdAt);

  if (m.status === "failed") {
    await prisma.$transaction(async (tx) => {
      const topic = await tx.topic.create({ data: { title: m.topic.title, category: m.topic.category, channelId } });
      await tx.video.create({
        data: {
          id: m.id, channelId, templateId: m.template, topicId: topic.id, status: "failed", format: formatOfId(m.id), failReason: m.failReason, script, style: {},
          durationSec: 0, title: m.title, description: "", tags: [], createdAt,
        },
      });
      await tx.agentRun.createMany({ data: runRows(m.id, m.agentRuns) });
    });
    return "failed";
  }

  const fileUrl = repo ? await releaseAssetUrl(repo, m.release.tag, m.release.asset) : null;
  if (repo && !fileUrl) return "waiting";

  await prisma.$transaction(async (tx) => {
    const queuePosition = await queueSlot(tx, m, new Date(), channelId);
    const topic = await tx.topic.create({ data: { title: m.topic.title, category: m.topic.category, channelId } });
    await tx.video.create({
      data: {
        id: m.id, channelId, templateId: m.template, topicId: topic.id, status: "queued", format: m.format, script, style: { ...m.style, experiments: m.experiments ?? {}, source: sourceWithTopic(m, feeds) as unknown as Prisma.InputJsonObject, ...(m.thumbnails ? { thumbs: m.thumbnails } : {}) }, fileUrl,
        thumbnailUrl: `${path.relative(ROOT, dir).replace(/\\/g, "/")}/thumbnail.png`, durationSec: m.durationSec, title: m.title, description: m.description,
        tags: m.hashtags.map((h) => h.replace(/^#/, "")), hookStyle: m.hookStyle, cta: m.cta,
        queuePosition, createdAt,
      },
    });
    await tx.qaCheck.createMany({ data: m.checks.map((c) => ({ videoId: m.id, checker: c.checker, passed: c.passed, notes: c.notes })) });
    await tx.agentRun.createMany({ data: runRows(m.id, m.agentRuns) });
  });
  return "queued";
}

/** Where a new video joins the upload queue: at the back, or at the front of its format's queue if
 * it is breaking news or a trend that has not expired (news loses half its first-day views in ~7 h). */
export async function queueSlot(tx: Prisma.TransactionClient, m: ShippedManifest, now = new Date(), channelId?: string): Promise<number> {
  const ofChannel = channelId ? { channelId } : {};
  if (m.priority && m.priority.until >= istDay(now)) {
    const first = await tx.video.aggregate({ where: { status: "queued", deletedAt: null, format: m.format, ...ofChannel }, _min: { queuePosition: true } });
    return (first._min.queuePosition ?? 1) - 1;
  }
  const last = await tx.video.aggregate({ where: ofChannel, _max: { queuePosition: true } });
  return (last._max.queuePosition ?? 0) + 1;
}

/** A video's manifest in whichever channel folder holds it. */
function manifestFile(id: string): string | null {
  for (const slug of allChannels(ROOT)) {
    const f = path.join(ROOT, crel(`videos/${id}/manifest.json`, ROOT, slug));
    if (existsSync(f)) return f;
  }
  return null;
}

/** Videos waiting to be posted that were ingested before their source was recorded get it from
 * their manifest, so the posting plan can say where every one came from; and their thumbnails follow the manifest. */
async function backfillSources(prisma: PrismaClient, feeds: Map<string, FeedTopic>): Promise<void> {
  for (const v of await prisma.video.findMany({ where: { status: { in: ["queued", "scheduled", "published"] }, deletedAt: null }, select: { id: true, style: true, status: true, title: true, description: true } })) {
    const style = (v.style ?? {}) as Record<string, unknown>;
    const file = manifestFile(v.id);
    if (!file) continue;
    const m = Manifest.safeParse(readJson(file));
    if (!m.success || m.data.status !== "qa_passed") continue;
    // a new title or description reaches a video that hasn't gone to YouTube yet (owner, 2026-11-23: the Gauge long
    // video was retitled in its manifest, and the publisher uploads the title the database holds)
    if (v.status === "queued" && (m.data.title !== v.title || (m.data.description && m.data.description !== v.description))) {
      await prisma.video.update({ where: { id: v.id }, data: { title: m.data.title, ...(m.data.description ? { description: m.data.description } : {}) } });
      console.log(`${v.id}: title and description from its manifest`);
    }
    // a redone set of thumbnails (and Studio's pick) reaches a video that is still waiting (owner, 2026-11-11)
    const withThumbs = v.status === "published" ? style : syncThumbs(style, m.data.thumbnails) ?? style;
    const src = style.source as { feedId?: string | null; topic?: unknown } | undefined;
    const snap = src?.feedId && !src.topic ? sourceWithTopic(m.data, feeds).topic ?? null : null;   // backfill the feed topic while it is still in the feed
    if (style.source && withThumbs === style && !snap) continue;
    await prisma.video.update({ where: { id: v.id }, data: { style: { ...withThumbs, source: style.source ? { ...(style.source as object), ...(snap ? { topic: snap } : {}) } : sourceWithTopic(m.data, feeds) } as Prisma.InputJsonValue } });
  }
}

async function syncTemplateWork(prisma: PrismaClient): Promise<void> {
  const file = cpath(ROOT, "history", "template_work.json");
  if (!existsSync(file)) return;
  for (const w of readJson(file) as { at: string; template: string; action: string; enabled: boolean }[]) {
    const id = `tw:${w.at}`;
    await prisma.agentRun.upsert({
      where: { id }, update: {},
      create: {
        id, agent: "template_builder", status: w.enabled ? "ok" : "failed", startedAt: new Date(w.at), finishedAt: new Date(w.at),
        log: [`${w.action} ${w.template}${w.enabled ? "" : " (not enabled: test videos did not pass)"}`],
      },
    });
  }
}

/** The latest of some ISO timestamps, compared as instants (manifests may differ in UTC offset). */
export const newestStamp = (stamps: string[]): string | null =>
  stamps.reduce<string | null>((a, b) => (a === null || Date.parse(b) > Date.parse(a) ? b : a), null);

/** config/channels.json for the routines (they have no database): every channel's status, its own
 * settings (over config/settings.json) and its own backlog. A routine for a channel that isn't
 * active exits at once (generator/settings.py). */
export async function buildChannelsFile(prisma: PrismaClient): Promise<Record<string, unknown>> {
  const rows = await prisma.channel.findMany({ orderBy: { createdAt: "asc" } });
  const out: Record<string, unknown> = {};
  for (const ch of rows) {
    const own = Object.fromEntries(Object.entries((ch.settings ?? {}) as Record<string, unknown>).filter(([k]) => (CHANNEL_KEYS as readonly string[]).includes(k)));
    const queued = (format?: string) => prisma.video.count({ where: { channelId: ch.id, status: "queued", deletedAt: null, ...(format ? { format } : {}) } });
    const setup = ((ch.settings ?? {}) as { setup?: { stage?: string; decision?: unknown } }).setup;
    const health = ((ch.settings ?? {}) as { health?: unknown }).health;
    out[ch.id] = { name: ch.name, status: ch.status, settings: own, ...(setup ? { setup: { stage: setup.stage, decision: setup.decision ?? null } } : {}),
      ...(health ? { health } : {}),
      backlog: await queued(), backlogByFormat: { short: await queued("short"), long: await queued("long") } };
  }
  return { note: "Written by ingest from the Channel table. Routines read their channel's entry (generator/settings.py).", channels: out };
}

/** The file routines read. `ingestedAt` is the newest ingested manifest's own timestamp string,
 * so the generator can compare it with history entries exactly. */
export async function buildRoutineSettings(prisma: PrismaClient, root = ROOT): Promise<Record<string, unknown>> {
  const s = await loadSettings(prisma);
  const file = path.join(root, "config", "settings.json");
  const current = (existsSync(file) ? readJson(file) : {}) as { templateWork?: { everyNthRun?: number } };
  const known = new Set((await prisma.video.findMany({ select: { id: true } })).map((v) => v.id));
  const stamps = manifestPaths(root).map((p) => readJson(p) as { id: string; createdAt: string }).filter((m) => known.has(m.id)).map((m) => m.createdAt);
  const templates = await prisma.template.findMany({ orderBy: { id: "asc" } });
  return {
    backlog: await prisma.video.count({ where: { status: "queued", deletedAt: null } }),
    backlogByFormat: Object.fromEntries(await Promise.all((["short", "long"] as const).map(async (f) =>
      [f, await prisma.video.count({ where: { status: "queued", deletedAt: null, format: f } })] as const))),
    ingestedAt: newestStamp(stamps),
    backlogCap: s.backlogCap,
    generationPaused: s.generationPaused,
    uploadsPaused: s.uploadsPaused,
    lengthMinSec: s.lengthMinSec,
    lengthMaxSec: s.lengthMaxSec,
    longLengthMinSec: s.longLengthMinSec,
    longLengthMaxSec: s.longLengthMaxSec,
    longPerWeek: s.longPerWeek,
    longBacklogCap: s.longBacklogCap,
    // how many Shorts the routine makes a day, and how often one is published (the 48-hour test)
    dailyVideoTarget: s.dailyVideoTarget,
    shortEveryDays: s.shortEveryDays,
    // the publish slots: a video run keeps making Shorts until a full day of slots is ready
    uploadTimes: s.uploadTimes,
    // the ready videos in publish order, so the editor step ranks the real queue (owner's pick first)
    queue: (await prisma.video.findMany({ where: { status: "queued", deletedAt: null },
      orderBy: [{ pickedAt: { sort: "asc", nulls: "last" } }, { queuePosition: "asc" }, { createdAt: "asc" }],
      select: { id: true, format: true, queuePosition: true, orderLocked: true, pickedAt: true, editorRank: true } }))
      .map((v) => ({ id: v.id, format: v.format, position: v.queuePosition, locked: v.orderLocked, picked: Boolean(v.pickedAt), editorRank: v.editorRank })),
    disclaimer: s.disclaimer,
    templateWork: { maxPerDay: s.templateWork.maxPerDay, maxTemplates: s.templateWork.maxTemplates, everyNthRun: current.templateWork?.everyNthRun ?? 5 },
    templates: Object.fromEntries(templates.map((t) => [t.id, { enabled: t.enabled, weight: t.weight }])),
    agents: s.agents,
  };
}

async function main(): Promise<void> {
  const checkRelease = !process.argv.includes("--no-release-check");
  const repo = checkRelease ? repoSlug(ROOT) : null;
  const prisma = new PrismaClient();
  try {
    await syncTemplates(prisma);
    const feeds = loadFeeds(ROOT);
    const have = new Set((await prisma.video.findMany({ select: { id: true } })).map((v) => v.id));
    const result = { queued: [] as string[], failed: [] as string[], waiting: [] as string[], invalid: [] as string[] };
    for (const file of manifestPaths()) {
      const id = path.basename(path.dirname(file));
      if (have.has(id)) continue;
      try {
        result[await ingestOne(prisma, file, repo, feeds)].push(id);
      } catch (e) {
        result.invalid.push(id);
        console.error(`::error::${id}: ${e instanceof Error ? e.message.split("\n")[0] : e}`);
      }
    }
    for (const t of await prisma.video.groupBy({ by: ["templateId"], _max: { createdAt: true } })) {
      await prisma.template.update({ where: { id: t.templateId }, data: { lastUsedAt: t._max.createdAt } });
    }
    await backfillSources(prisma, feeds);
    await syncTemplateWork(prisma);
    await seedSettings(prisma);

    // self-improving agents: their reports and decisions in, the metrics they judge by out
    const templateDecisions = await applyTemplateDecisions(prisma, ROOT);
    const activity = await importActivity(prisma, ROOT);
    // new channels' setup: the scan's and the skill's progress and the quick verdict, for the Channels page
    const setups = await syncSetups(prisma, ROOT);
    if (setups.length) console.log(`setup: ${setups.join("; ")}`);
    // per channel, each with its own folder (CHANNEL) and a client narrowed to its rows (lib/scoped.ts):
    // the agents' notifications and docs in, the editor's ranking and the answers to the owner's notes in,
    // and the metrics the weekly loop judges by out. Channel #1's rows and files are exactly as before.
    let ranked: string[] = [], acks = 0, metricsChanged = false;
    const before = process.env.CHANNEL;
    for (const ch of await prisma.channel.findMany({ orderBy: { createdAt: "asc" } })) {
      if (!existsSync(path.join(ROOT, "channels", ch.id)) && ch.id !== layout().default) continue;
      process.env.CHANNEL = ch.id;
      const p = scopedPrisma(prisma, ch.id);
      await importAgentNotifications(p, ROOT);
      await snapshotDocs(p, ROOT);
      ranked = [...ranked, ...(await importEditorRanking(p, ROOT))];
      acks += await importFeedbackAcks(p, ROOT);
      metricsChanged = (await exportMetrics(p, ROOT)) || metricsChanged;
    }
    if (before === undefined) delete process.env.CHANNEL; else process.env.CHANNEL = before;
    // each live channel's health: buffer, stayed to watch, the stop rule, usage, the Monday digest (lib/health-sync.ts)
    const healths = await syncHealth(prisma, ROOT);
    console.log(`health: ${healths.join("; ")}`);

    const file = path.join(ROOT, "config", "settings.json");
    const next = JSON.stringify(await buildRoutineSettings(prisma), null, 2) + "\n";
    const settingsChanged = !existsSync(file) || readFileSync(file, "utf8").replace(/\r\n/g, "\n") !== next;
    if (settingsChanged) writeFileSync(file, next);
    const chFile = path.join(ROOT, "config", "channels.json");
    const chNext = JSON.stringify(await buildChannelsFile(prisma), null, 2) + "\n";
    if (!existsSync(chFile) || readFileSync(chFile, "utf8").replace(/\r\n/g, "\n") !== chNext) writeFileSync(chFile, chNext);

    console.log(JSON.stringify({ ...result, settingsChanged, metricsChanged, activity, templateDecisions, ranked: ranked.length, feedbackAnswered: acks, videosInDatabase: await prisma.video.count() }, null, 2));
    if (result.invalid.length) process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  await main();
}
