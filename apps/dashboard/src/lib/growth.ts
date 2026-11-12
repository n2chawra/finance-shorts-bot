/**
 * The weekly loop on the dashboard's Growth loop page (owner, 2026-11-12: "a UI so I can see where the
 * automation is going"). View only. Everything comes from repo files the agents keep, copied into
 * RepoDoc by ingest: improvement/cycle/{backlog,status,recipe}.json, improvement/analysis/pictures.json
 * and generator/prompts/lessons.md.
 */
import { z } from "zod";

const n = z.number().nullable().optional();

export const ChallengerSchema = z.looseObject({
  id: z.string(), kind: z.string().optional(), area: z.string().optional(), metric: z.string().optional(),
  from: z.string().optional(), test: z.string().optional(), why: z.string().optional(),
});
export const CycleRowSchema = z.looseObject({
  cycle: z.number(), id: z.string(), kind: z.string().optional(), started: z.string().optional(), verdict: z.string().nullable().optional(),
  test: z.string().optional(),
});
export const StayedRowSchema = z.looseObject({ cycle: z.number(), champion: n, challenger: n, verdict: z.string().nullable().optional() });

export const LoopStatusSchema = z.object({
  generatedAt: z.string(), cycle: z.number().nullable(), running: z.string().nullable(),
  thresholds: z.object({ keepPoints: z.number(), revertPoints: z.number(), confidence: z.number() }),
  channelStayed14d: n,
  experiment: z.looseObject({
    id: z.string(), kind: z.string().nullable().optional(), area: z.string().nullable().optional(), description: z.string().nullable().optional(),
    startedAt: z.string().nullable().optional(), metric: z.string(), minPerArm: z.number(), maxDays: z.number(), extended: z.boolean(),
    published: z.object({ on: z.number(), off: z.number() }), counted: z.object({ on: z.number(), off: z.number() }),
    value: z.object({ on: n, off: n }), points: n, pOnBetter: n, days: n, verdict: z.string().nullable().optional(), why: z.string().nullable().optional(),
  }).nullable(),
});

export const RecipeSchema = z.object({
  updatedAt: z.string().nullable().optional(),
  rules: z.array(z.looseObject({ id: z.string(), text: z.string(), since: z.string().optional(), from: z.string().optional() })),
  changes: z.array(z.looseObject({ cycle: z.number().optional(), date: z.string().optional(), id: z.string().optional(), verdict: z.string().optional(), change: z.string().optional() })).default([]),
});

export const LessonSchema = z.object({ n: z.number(), title: z.string(), date: z.string().nullable(), source: z.string().nullable(), seen: z.string(), fix: z.string() });

export const PicturesSchema = z.looseObject({
  writtenAt: z.string().optional(),
  lossByPicture: z.array(z.looseObject({ kind: z.string(), drops: n, shorts: n, avgDrop: n })).default([]),
  options: z.array(z.looseObject({ by: z.string(), value: z.string(), n: n, heldAfterHook: n })).default([]),
  worst: z.string().nullable().optional(),
  reference: z.array(z.string()).default([]),
});

export const GrowthSchema = z.object({
  source: z.enum(["sample", "database"]),
  status: LoopStatusSchema.nullable(),
  running: z.string().nullable(),
  cycle: z.number(),
  challengers: z.array(ChallengerSchema),
  history: z.array(CycleRowSchema),
  stayedByCycle: z.array(StayedRowSchema),
  recipe: RecipeSchema.nullable(),
  lessons: z.array(LessonSchema),
  pictures: PicturesSchema.nullable(),
  /** the 3 reference Shorts, with what the page needs to show them */
  reference: z.array(z.object({ id: z.string(), title: z.string(), thumbnailUrl: z.string(), views: z.number().nullable() })),
  reviewer: z.object({ lastDay: z.string().nullable(), lastSummary: z.string().nullable(), nextRunAt: z.string() }),
});
export type Growth = z.infer<typeof GrowthSchema>;
export type LoopStatus = z.infer<typeof LoopStatusSchema>;

/** Stayed to watch under this share for ESCALATE_AFTER cycles in a row makes the next test a format change. */
export const ESCALATE_BELOW = 0.45;
export const ESCALATE_AFTER = 3;
export const OWNER_AFTER = 6;

/** Cycles in a row, newest first, whose champion side stayed under ESCALATE_BELOW. */
export function cyclesUnder(rows: { champion?: number | null }[], below = ESCALATE_BELOW): number {
  let k = 0;
  for (const r of [...rows].reverse()) {
    if (r.champion == null || r.champion >= below) break;
    k++;
  }
  return k;
}

/** The kind the next cycle takes: first-second and look alternate; three cycles under 45% force a format test. */
export function nextKind(history: { kind?: string }[], stayed: { champion?: number | null }[]): "first-second" | "look" | "format" {
  if (cyclesUnder(stayed) >= ESCALATE_AFTER) return "format";
  const last = [...history].reverse().find((h) => h.kind === "first-second" || h.kind === "look")?.kind;
  return last === "first-second" ? "look" : "first-second";
}

const IST_MS = 5.5 * 3_600_000;

/** The reviewer's next run: Tuesday and Friday at 21:07 IST (agents/reviewer.md). */
export function nextReviewerRun(now = Date.now()): Date {
  for (let d = 0; d < 8; d++) {
    const ist = new Date(now + IST_MS + d * 86_400_000);
    if (![2, 5].includes(ist.getUTCDay())) continue;
    const at = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), 21, 7) - IST_MS;
    if (at > now) return new Date(at);
  }
  return new Date(now + 7 * 86_400_000);
}

export const KIND_LABEL: Record<string, string> = { "first-second": "First-second test", look: "Look test", format: "Format change" };
export const KIND_METRIC: Record<string, string> = { "first-second": "stayed to watch", look: "held after the hook", format: "stayed to watch" };

/** The IST day a test's verdict is due: its start day plus maxDays. Calendar arithmetic on the day key,
 * so it never slips a day through UTC (IST midnight is 18:30 UTC the evening before). */
export function verdictDueDay(startedAt: string | null | undefined, maxDays: number): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(startedAt ?? "");
  if (!m || !Number.isFinite(maxDays)) return null;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + maxDays)).toISOString().slice(0, 10);
}

/** "Day 3 of 7", "Starts today" or "Starts <day>" (days is negative before the start day). */
export function testDayLabel(days: number | null | undefined, maxDays: number, startsOn: string): string {
  if (days == null) return "Starts today";
  return days >= 0 ? `Day ${Math.min(days, maxDays)} of ${maxDays}` : `Starts ${startsOn}`;
}

/** The confidence worth showing: none until both sides have counted Shorts (the evaluator writes 0.5
 * for "no data", which reads as a real 50%). */
export function shownConfidence(e: { points?: number | null; pOnBetter?: number | null; counted: { on: number; off: number } }): number | null {
  if (e.points == null || e.pOnBetter == null || Math.min(e.counted.on, e.counted.off) === 0) return null;
  return e.pOnBetter;
}
