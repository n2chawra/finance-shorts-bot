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

/** The twins study (workers/twins.ts, owner 2026-11-13): winners on our topics, watched by Gemini. */
const measureMap = z.record(z.string(), z.union([z.number(), z.string(), z.boolean(), z.null()])).catch({});
export const TwinInfoSchema = z.looseObject({
  youtubeId: z.string(), title: z.string().optional(), channel: z.string().optional(), views: z.number().optional(), thumb: z.string().optional(),
  outlier: z.number().nullable().optional(), durationSec: z.number().optional(), artStyle: z.string().nullable().optional(), measures: measureMap.nullable().optional(),
});
export const TwinGapSchema = z.looseObject({ key: z.string(), label: z.string(), ours: z.string(), twins: z.string(), agree: z.number(), of: z.number(), direction: z.enum(["more", "less"]) });
export const TwinReportSchema = z.looseObject({
  videoId: z.string(), youtubeId: z.string(), writtenAt: z.string(), title: z.string().catch(""),
  ours: measureMap, twinsMedian: measureMap, gaps: z.array(TwinGapSchema).catch([]),
  atDrops: z.array(z.looseObject({ at: z.number(), drop: z.number(), ours: z.string(), twins: z.array(z.string()) })).catch([]),
  summary: z.string().catch(""), twinInfo: z.array(TwinInfoSchema).catch([]),
});
const ModelGapSchema = z.looseObject({ key: z.string(), label: z.string(), direction: z.enum(["more", "less"]), reports: z.number(), of: z.number(), share: z.number(), oursMedian: z.string(), twinsMedian: z.string() });
export const TwinsSchema = z.looseObject({
  generatedAt: z.string(),
  calibration: z.looseObject({ writtenAt: z.string(), passed: z.boolean(), videos: z.number(), passedVideos: z.number() }).nullable().catch(null),
  model: z.looseObject({ writtenAt: z.string(), reports: z.number(), consistent: z.array(ModelGapSchema).catch([]), leaning: z.array(ModelGapSchema).catch([]) }).nullable().catch(null),
  gaps: z.array(TwinReportSchema).catch([]),
  briefs: z.array(z.looseObject({ topicId: z.string(), title: z.string().catch(""), writtenAt: z.string(), twinInfo: z.array(TwinInfoSchema).catch([]) })).catch([]),
});
export type Twins = z.infer<typeof TwinsSchema>;
export type TwinReport = z.infer<typeof TwinReportSchema>;

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
  twins: TwinsSchema.nullable().default(null),
});
export type Growth = z.infer<typeof GrowthSchema>;
export type LoopStatus = z.infer<typeof LoopStatusSchema>;

// the pure helpers live in growth-logic.ts (no zod), so the workers tests can import them
export * from "./growth-logic";
