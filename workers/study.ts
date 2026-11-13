/**
 * Study (owner, 2026-11-13): YouTube videos the owner links on the dashboard's Study page. For each
 * waiting one, Gemini (free tier) watches it and the closest of our videos into shot sheets, code
 * measures both, and what works is applied automatically:
 *   - its techniques go to generator/prompts/studied.md, which the writer follows in every script;
 *   - the biggest look difference (pace, motion, cast or figures on screen) joins the weekly loop as
 *     a challenger in improvement/cycle/backlog.json, so it is kept only if viewers stay longer.
 * Runs from .github/workflows/study.yml: started by the dashboard when a link is added, and every
 * two hours in case that start was missed. `npm run study`
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { type Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";

import { GeminiUnavailable, generate, parseJson } from "./lib/gemini.ts";
import { COMPARED, type Sheet, SHEET_PROMPT, SHEET_SCHEMA, cleanSheet, gapReport, measures } from "./lib/sheets.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "improvement", "study");
const STUDIED = path.join(ROOT, "generator", "prompts", "studied.md");
const BACKLOG = path.join(ROOT, "improvement", "cycle", "backlog.json");
/** Tried in order; from the 13 Nov 2026 tests: 3.6 Flash answered every request, the newer ones were busy or had no free quota. */
const MODELS = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.7-flash", "gemini-3.8-flash"];
const PER_RUN = 4;

const readJson = <T>(file: string, fallback: T): T => (existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as T) : fallback);
const writeJson = (file: string, data: unknown) => { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, JSON.stringify(data, null, 2) + "\n"); };

/** Measures that are about the look; the rest (first figure, subject, words a minute, payoff) are about the script. */
export const LOOK_KEYS = ["secPerShot", "cutsFirst3s", "motion", "movingShare", "characterShare", "figureShare", "textShare"] as const;

export type Applied = { writer: string[]; challenger: { id: string; kind: "look"; area: string; metric: string; from: string; test: string; why: string } | null };

/** What goes to the writer and to the weekly loop from one study. Pure, so it is tested. */
export function whatToApply(study: { id: string; title: string | null; channel: string | null }, theirs: Sheet, gaps: { key: string; label: string; ours: string; twins: string }[],
  backlog: { challengers?: { id: string }[]; history?: { id: string }[] }, day: string): Applied {
  const writer = theirs.whyItWorks.map((t) => t.trim()).filter(Boolean).slice(0, 4);
  for (const g of gaps.filter((x) => !(LOOK_KEYS as readonly string[]).includes(x.key)).slice(0, 2)) writer.push(`${g.label[0]!.toUpperCase()}${g.label.slice(1)}: theirs ${g.twins}, ours ${g.ours}.`);
  const look = gaps.find((g) => (LOOK_KEYS as readonly string[]).includes(g.key));
  const name = study.title ? `"${study.title}"${study.channel ? ` (${study.channel})` : ""}` : "a studied video";
  const id = look ? `study-${look.key}` : "";
  const taken = new Set([...(backlog.challengers ?? []), ...(backlog.history ?? [])].map((c) => c.id));
  const challenger = look && !taken.has(id) ? {
    id, kind: "look" as const, area: look.key === "secPerShot" || look.key === "cutsFirst3s" ? "pacing" : look.key === "characterShare" ? "cast" : look.key === "figureShare" || look.key === "textShare" ? "scene" : "motion",
    metric: "heldAfterHook", from: `study ${day}`,
    test: `${look.label[0]!.toUpperCase()}${look.label.slice(1)}: ${look.twins} as in ${name}, against our ${look.ours}`,
    why: `The owner picked ${name} to learn from (${study.id}); measured from both videos' shot sheets.`,
  } : null;
  return { writer, challenger };
}

/** The writer's file: the techniques of the newest studies, rebuilt from improvement/study/ every run. */
export function studiedMarkdown(reports: { writtenAt: string; title: string | null; channel: string | null; writer: string[] }[]): string {
  const rows = [...reports].sort((a, b) => b.writtenAt.localeCompare(a.writtenAt)).filter((r) => r.writer.length).slice(0, 12);
  return [
    "# Studied: what works in videos the owner picked",
    "",
    "Written by `workers/study.ts` from the dashboard's Study page (owner, 2026-11-13); never edit by hand.",
    "Each entry is a technique Gemini saw in a video the owner chose, measured against ours. Use the",
    "technique in your own words, cast and pictures: never their words, characters, art or story beat",
    "for beat. A lesson in `lessons.md` or a hard rule wins over anything here.",
    "",
    ...rows.flatMap((r) => [`## ${r.writtenAt.slice(0, 10)} · ${r.title ?? "a studied video"}${r.channel ? ` (${r.channel})` : ""}`, ...r.writer.map((w) => `- ${w}`), ""]),
  ].join("\n").trimEnd() + "\n";
}

const SheetFile = z.object({ sheet: z.unknown() });

async function sheetOf(key: string, youtubeId: string, long: boolean): Promise<Sheet> {
  const file = path.join(DIR, "sheets", `${youtubeId}.json`);
  if (existsSync(file)) return cleanSheet(SheetFile.parse(readJson(file, null)).sheet);
  const log = (l: string) => console.error(`${new Date().toISOString().slice(11, 19)} ${youtubeId}: ${l}`);
  const r = await generate([{ file_data: { file_uri: `https://www.youtube.com/watch?v=${youtubeId}` } }, { text: SHEET_PROMPT }],
    { key, models: MODELS, json: true, schema: SHEET_SCHEMA, timeoutMs: long ? 420_000 : 180_000, maxTimeouts: 2, log });
  const sheet = cleanSheet(parseJson(r.text));
  writeJson(file, { youtubeId, model: r.model, decodedAt: new Date().toISOString(), sheet });
  return sheet;
}

async function main() {
  const key = process.env.GEMINI_API_KEY ?? "";
  if (!key || !process.env.DATABASE_URL) { console.log("GEMINI_API_KEY or DATABASE_URL is not set: nothing to do"); return; }
  const prisma = new PrismaClient();
  try {
    const stuck = new Date(Date.now() - 45 * 60_000);
    const todo = await prisma.study.findMany({
      where: { OR: [{ status: "queued" }, { status: "watching", createdAt: { lt: stuck } }] },
      include: { video: { select: { id: true, title: true, format: true, upload: { select: { youtubeId: true } } } } },
      orderBy: { createdAt: "asc" }, take: PER_RUN,
    });
    console.log(`${todo.length} studies waiting`);
    for (const s of todo) {
      await prisma.study.update({ where: { id: s.id }, data: { status: "watching", error: null } });
      try {
        const theirs = await sheetOf(key, s.youtubeId, false);
        const oursId = s.video?.upload?.youtubeId ?? null;
        const ours = oursId ? await sheetOf(key, oursId, s.video?.format === "long") : null;
        const gaps = ours ? gapReport(s.video!.id, oursId!, ours, [{ id: s.youtubeId, sheet: theirs }], [], new Date()).gaps : [];
        const backlog = readJson<{ challengers?: Record<string, unknown>[]; history?: { id: string }[] }>(BACKLOG, {});
        const day = new Date().toISOString().slice(0, 10);
        const applied = whatToApply(s, theirs, gaps, backlog as { challengers?: { id: string }[]; history?: { id: string }[] }, day);
        if (applied.challenger && existsSync(BACKLOG)) {
          backlog.challengers = [...(backlog.challengers ?? []), applied.challenger];
          writeJson(BACKLOG, backlog);
        }
        const report = {
          writtenAt: new Date().toISOString(), studyId: s.id, youtubeId: s.youtubeId, title: s.title, channel: s.channel, note: s.note,
          theirs: { artStyle: theirs.artStyle, durationSec: theirs.durationSec, measures: measures(theirs), hook: theirs.hook, techniques: theirs.whyItWorks,
            shots: theirs.shots.slice(0, 12).map((x) => ({ start: x.start, end: x.end, picture: x.picture })) },
          ours: ours ? { videoId: s.video!.id, title: s.video!.title, measures: measures(ours) } : null,
          gaps: gaps.map((g) => ({ key: g.key, label: g.label, ours: g.ours, twins: g.twins, direction: g.direction })),
          applied, writer: applied.writer,
        };
        writeJson(path.join(DIR, `${s.id}.json`), report);
        await prisma.study.update({ where: { id: s.id }, data: { status: "done", doneAt: new Date(), report: JSON.parse(JSON.stringify(report)) as Prisma.InputJsonValue } });
        console.log(`${s.id}: learned (${applied.writer.length} for the writer${applied.challenger ? `, test ${applied.challenger.id}` : ""})`);
      } catch (e) {
        const quota = e instanceof GeminiUnavailable && e.quota;
        const why = quota ? "Gemini's free daily quota is used up; it tries again at the next run" : `Gemini couldn't watch it: ${String(e).split("\n").slice(0, 2).join(" ").slice(0, 300)}`;
        // out of quota: back in the queue for the next run; anything else: failed, with the reason on the page
        await prisma.study.update({ where: { id: s.id }, data: { status: quota ? "queued" : "failed", error: why } });
        console.error(`${s.id}: ${why}`);
        if (quota) break;
      }
    }
    const reports = existsSync(DIR) ? readdirSync(DIR).filter((f) => f.endsWith(".json")).map((f) => readJson<{ writtenAt: string; title: string | null; channel: string | null; writer?: string[] }>(path.join(DIR, f), { writtenAt: "", title: null, channel: null })) : [];
    if (reports.length) writeFileSync(STUDIED, studiedMarkdown(reports.map((r) => ({ ...r, writer: r.writer ?? [] }))));
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  await main();
}
