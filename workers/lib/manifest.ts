import { z } from "zod";

const Topic = z.object({ title: z.string().min(1), category: z.string().min(1) });

const Step = z.object({
  agent: z.string(),
  status: z.enum(["ok", "failed", "skipped"]),
  startedAt: z.string(),
  finishedAt: z.string(),
  notes: z.array(z.string()),
});

/** videos/<id>/manifest.json for a video that passed every check (written by `generator.run ship`). */
export const ShippedManifest = z.object({
  id: z.string().regex(/^v-\d{8}-\d{2,}$/),
  createdAt: z.string(),
  status: z.literal("qa_passed"),
  template: z.string(),
  topic: Topic,
  title: z.string().min(1),
  description: z.string(),
  hashtags: z.array(z.string()),
  hookStyle: z.string(),
  cta: z.string(),
  seed: z.number().int(),
  style: z.object({ palette: z.string(), genre: z.string(), key: z.string(), bpm: z.number(), voice: z.string().nullish() }),
  /** A/B experiment variants this video was rendered with ({id: "on"|"off"}); see generator/experiments.py. */
  experiments: z.record(z.string(), z.enum(["on", "off"])).optional(),
  durationSec: z.number().positive(),
  checks: z.array(z.object({ checker: z.enum(["number_check", "fact_review", "qa_review"]), passed: z.boolean(), notes: z.array(z.string()) })).length(3),
  agentRuns: z.array(Step),
  release: z.object({ tag: z.string(), asset: z.string() }),
});

/** Manifest of a video that was given up on (written by `generator.run fail`). */
export const FailedManifest = z.object({
  id: z.string().regex(/^v-\d{8}-\d{2,}$/),
  createdAt: z.string(),
  status: z.literal("failed"),
  failReason: z.string(),
  template: z.string(),
  topic: Topic,
  title: z.string(),
  agentRuns: z.array(Step),
});

export const Manifest = z.discriminatedUnion("status", [ShippedManifest, FailedManifest]);
export type Manifest = z.infer<typeof Manifest>;
export type ShippedManifest = z.infer<typeof ShippedManifest>;
