/**
 * The Impact page (owner, 2026-11-10: "what has my automation done to actually improve the channel"):
 * improvement/weekly/impact.json, rewritten nightly by the improver (`python -m generator.impact`) and
 * copied into RepoDoc "impact" by ingest (workers/lib/agents-sync.ts).
 */
import { z } from "zod";

const num = z.number().nullable().catch(null);

export const ImpactVideoSchema = z.object({
  id: z.string(), title: z.string().catch(""), day: z.string(), views48h: num, avgViewPct: num, stayedToWatch: num,
});
const SummaryShape = { n: z.number().catch(0), medianViews48h: num, avgViewPct: num, stayedToWatch: num, avgViewSec: num };
export const ImpactWeekSchema = z.object({ week: z.string(), ...SummaryShape, videos: z.array(ImpactVideoSchema).catch([]) });
const SummarySchema = z.object(SummaryShape);
export const ImpactChangeSchema = z.object({
  id: z.string(), area: z.string().nullable().catch(null), status: z.string(), day: z.string(), description: z.string().catch(""),
  before: SummarySchema, after: SummarySchema, viewsRatio: num, sameWeek: z.number().catch(0),
  afterVideos: z.array(ImpactVideoSchema).catch([]),
});
export const ImpactSchema = z.object({
  updatedAt: z.string().nullable().catch(null),
  weeks: z.array(ImpactWeekSchema).catch([]),
  changes: z.array(ImpactChangeSchema).catch([]),
});
export type Impact = z.infer<typeof ImpactSchema>;
export type ImpactWeek = z.infer<typeof ImpactWeekSchema>;
export type ImpactChange = z.infer<typeof ImpactChangeSchema>;
export type ImpactVideo = z.infer<typeof ImpactVideoSchema>;

export const EMPTY_IMPACT: Impact = { updatedAt: null, weeks: [], changes: [] };

/** Parse whatever the repo file holds; a broken file shows an empty page, never an error. */
export function parseImpact(value: unknown): Impact {
  const p = ImpactSchema.safeParse(value ?? {});
  return p.success ? p.data : EMPTY_IMPACT;
}

/** Percent change from a to b, or null when either is missing or a is 0. */
export function change(a: number | null, b: number | null): number | null {
  return a === null || b === null || a === 0 ? null : ((b - a) / a) * 100;
}
