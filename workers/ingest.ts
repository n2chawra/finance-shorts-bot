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
import { Manifest, type ShippedManifest } from "./lib/manifest.ts";
import { loadSettings, seedSettings } from "./lib/settings.ts";

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

export function templateIds(root = ROOT): string[] {
  const dir = path.join(root, "renderer", "templates");
  return readdirSync(dir).filter((name) => existsSync(path.join(dir, name, "schema.json"))).sort();
}

export function manifestPaths(root = ROOT): string[] {
  const dir = path.join(root, "videos");
  return readdirSync(dir).map((id) => path.join(dir, id, "manifest.json")).filter((p) => existsSync(p)).sort();
}

async function syncTemplates(prisma: PrismaClient): Promise<void> {
  for (const id of templateIds()) {
    const readme = path.join(ROOT, "renderer", "templates", id, "README.md");
    const description = existsSync(readme) ? readmeSummary(readFileSync(readme, "utf8")) : "";
    await prisma.template.upsert({ where: { id }, update: { description }, create: { id, name: titleCase(id), description } });
  }
}

function runRows(videoId: string, steps: ShippedManifest["agentRuns"]): Prisma.AgentRunCreateManyInput[] {
  return steps.map((s, i) => ({
    id: `${videoId}:${i}`, videoId, agent: s.agent, status: s.status, log: s.notes,
    startedAt: new Date(s.startedAt), finishedAt: new Date(s.finishedAt),
  }));
}

/** Insert one manifest. Returns what happened. */
async function ingestOne(prisma: PrismaClient, file: string, repo: string | null): Promise<"queued" | "failed" | "waiting"> {
  const m = Manifest.parse(readJson(file));
  const dir = path.dirname(file);
  const scriptFile = path.join(dir, "script.json");
  const script = (existsSync(scriptFile) ? readJson(scriptFile) : {}) as Prisma.InputJsonValue;
  const createdAt = new Date(m.createdAt);

  if (m.status === "failed") {
    await prisma.$transaction(async (tx) => {
      const topic = await tx.topic.create({ data: m.topic });
      await tx.video.create({
        data: {
          id: m.id, templateId: m.template, topicId: topic.id, status: "failed", failReason: m.failReason, script, style: {},
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
    const last = await tx.video.aggregate({ _max: { queuePosition: true } });
    const topic = await tx.topic.create({ data: m.topic });
    await tx.video.create({
      data: {
        id: m.id, templateId: m.template, topicId: topic.id, status: "queued", script, style: m.style, fileUrl,
        thumbnailUrl: `videos/${m.id}/thumbnail.png`, durationSec: m.durationSec, title: m.title, description: m.description,
        tags: m.hashtags.map((h) => h.replace(/^#/, "")), hookStyle: m.hookStyle, cta: m.cta,
        queuePosition: (last._max.queuePosition ?? 0) + 1, createdAt,
      },
    });
    await tx.qaCheck.createMany({ data: m.checks.map((c) => ({ videoId: m.id, checker: c.checker, passed: c.passed, notes: c.notes })) });
    await tx.agentRun.createMany({ data: runRows(m.id, m.agentRuns) });
  });
  return "queued";
}

async function syncTemplateWork(prisma: PrismaClient): Promise<void> {
  const file = path.join(ROOT, "history", "template_work.json");
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
    ingestedAt: stamps.sort().at(-1) ?? null,
    backlogCap: s.backlogCap,
    generationPaused: s.generationPaused,
    uploadsPaused: s.uploadsPaused,
    lengthMinSec: s.lengthMinSec,
    lengthMaxSec: s.lengthMaxSec,
    disclaimer: s.disclaimer,
    templateWork: { maxPerDay: s.templateWork.maxPerDay, maxTemplates: s.templateWork.maxTemplates, everyNthRun: current.templateWork?.everyNthRun ?? 5 },
    templates: Object.fromEntries(templates.map((t) => [t.id, { enabled: t.enabled, weight: t.weight }])),
  };
}

async function main(): Promise<void> {
  const checkRelease = !process.argv.includes("--no-release-check");
  const repo = checkRelease ? repoSlug(ROOT) : null;
  const prisma = new PrismaClient();
  try {
    await syncTemplates(prisma);
    const have = new Set((await prisma.video.findMany({ select: { id: true } })).map((v) => v.id));
    const result = { queued: [] as string[], failed: [] as string[], waiting: [] as string[], invalid: [] as string[] };
    for (const file of manifestPaths()) {
      const id = path.basename(path.dirname(file));
      if (have.has(id)) continue;
      try {
        result[await ingestOne(prisma, file, repo)].push(id);
      } catch (e) {
        result.invalid.push(id);
        console.error(`::error::${id}: ${e instanceof Error ? e.message.split("\n")[0] : e}`);
      }
    }
    for (const t of await prisma.video.groupBy({ by: ["templateId"], _max: { createdAt: true } })) {
      await prisma.template.update({ where: { id: t.templateId }, data: { lastUsedAt: t._max.createdAt } });
    }
    await syncTemplateWork(prisma);
    await seedSettings(prisma);

    const file = path.join(ROOT, "config", "settings.json");
    const next = JSON.stringify(await buildRoutineSettings(prisma), null, 2) + "\n";
    const settingsChanged = !existsSync(file) || readFileSync(file, "utf8").replace(/\r\n/g, "\n") !== next;
    if (settingsChanged) writeFileSync(file, next);

    console.log(JSON.stringify({ ...result, settingsChanged, videosInDatabase: await prisma.video.count() }, null, 2));
    if (result.invalid.length) process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  await main();
}
