/**
 * A new channel's setup state, repo → database (multi-channel plan, step 3). The scan and the
 * /new-channel skill write channels/<slug>/setup.json ({ stage, note }) and research/verdict.json;
 * ingest copies them into Channel.settings.setup, where the dashboard shows them. The owner's decision
 * (Continue / Stop) is made on the dashboard and is never overwritten from the repo, and a stage only
 * moves forward, except that the owner's decision moves it.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import type { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";

export const STAGES = ["scanning", "verdict", "research", "build", "samples", "review", "launched", "stopped"] as const;
type Stage = (typeof STAGES)[number];

const SetupFile = z.object({ stage: z.enum(STAGES), note: z.string().max(300).optional() });
const Verdict = z.looseObject({ call: z.enum(["go", "go-with-conditions", "dont"]), reason: z.string() });
const Stored = z.looseObject({
  stage: z.enum(STAGES).optional(), verdict: z.unknown().optional(), decision: z.unknown().optional(), note: z.string().optional(),
});

/** The stage the repo may move a channel to: forward only, and never past the owner's decision point unasked. */
export function nextStage(current: Stage | undefined, fromRepo: Stage, decided: boolean): Stage {
  if (!current) return fromRepo;
  if (current === "stopped") return "stopped";
  const at = STAGES.indexOf(current), want = STAGES.indexOf(fromRepo);
  if (fromRepo === "stopped") return "stopped";
  // past the verdict only after the owner's Continue
  if (want > STAGES.indexOf("verdict") && !decided) return current === "scanning" ? "verdict" : current;
  return want > at ? fromRepo : current;
}

export async function syncSetups(prisma: PrismaClient, root: string): Promise<string[]> {
  const changed: string[] = [];
  for (const ch of await prisma.channel.findMany({ where: { status: "setup" } })) {
    const dir = path.join(root, "channels", ch.id);
    const setupFile = path.join(dir, "setup.json"), verdictFile = path.join(dir, "research", "verdict.json");
    const repo = existsSync(setupFile) ? SetupFile.safeParse(JSON.parse(readFileSync(setupFile, "utf8"))) : null;
    const verdict = existsSync(verdictFile) ? Verdict.safeParse(JSON.parse(readFileSync(verdictFile, "utf8"))) : null;
    if (!repo?.success && !verdict?.success) continue;
    const settings = (ch.settings ?? {}) as Record<string, unknown>;
    const stored = Stored.safeParse(settings.setup ?? {}).data ?? {};
    const decided = Boolean(stored.decision && (stored.decision as { choice?: string }).choice === "continue");
    // a verdict on file means the scan's stage is done: at least "verdict"
    const fromRepo: Stage = repo?.success ? repo.data.stage : "verdict";
    const stage = nextStage(stored.stage, verdict?.success && STAGES.indexOf(fromRepo) < 1 ? "verdict" : fromRepo, decided);
    // the Launch review's material, once samples exist: the advice, the recommended counts, each sample's likeness
    const review = ["samples", "review"].includes(stage) ? reviewMaterial(dir) : null;
    const next = { ...stored, stage, ...(verdict?.success ? { verdict: verdict.data } : {}),
      ...(review ? { review: { ...((stored as { review?: object }).review ?? {}), ...review, notes: notesDone((stored as { review?: { notes?: Note[] } }).review?.notes ?? [], dir) } } : {}),
      ...(repo?.success && repo.data.note ? { note: repo.data.note } : {}), updatedAt: new Date().toISOString() };
    const before = JSON.stringify({ ...stored, updatedAt: undefined }), after = JSON.stringify({ ...next, updatedAt: undefined });
    if (before === after) continue;
    await prisma.channel.update({ where: { id: ch.id }, data: { settings: { ...settings, setup: next } as Prisma.InputJsonValue } });
    changed.push(`${ch.id}: ${stored.stage ?? "-"} → ${stage}`);
  }
  return changed;
}

const readJson = (f: string): unknown => { try { return JSON.parse(readFileSync(f, "utf8")); } catch { return null; } };

/** research/advice.md (trimmed), research/counts.json and every sample's likeness.json (videos/<id>/). */
export function reviewMaterial(dir: string): { advice: string | null; counts: unknown; likeness: Record<string, unknown> } {
  const adviceFile = path.join(dir, "research", "advice.md");
  const advice = existsSync(adviceFile) ? readFileSync(adviceFile, "utf8").slice(0, 20_000) : null;
  const likeness: Record<string, unknown> = {};
  const videos = path.join(dir, "videos");
  if (existsSync(videos)) {
    for (const id of readdirSync(videos)) {
      const l = readJson(path.join(videos, id, "likeness.json"));
      if (l) likeness[id] = l;
    }
  }
  return { advice, counts: readJson(path.join(dir, "research", "counts.json")), likeness };
}

type Note = { at: string; text: string; videoId?: string; done?: boolean; fix?: string };

/** The owner's notes on the samples, with the ones the skill fixed marked done (channels/<slug>/review-notes.json). */
export function notesDone(notes: Note[], dir: string): Note[] {
  const fixed = readJson(path.join(dir, "review-notes.json"));
  const byAt = new Map(Array.isArray(fixed) ? (fixed as { at?: string; done?: boolean; fix?: string }[]).filter((f) => f.at && f.done).map((f) => [f.at!, f.fix]) : []);
  return notes.map((n) => (byAt.has(n.at) ? { ...n, done: true, ...(byAt.get(n.at) ? { fix: byAt.get(n.at) } : {}) } : n));
}
