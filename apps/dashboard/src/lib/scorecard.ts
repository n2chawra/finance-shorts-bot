/**
 * The daily scorecard (owner, 2026-11-16): per Short, the four numbers that decide whether YouTube shows
 * it past its first test audience, plus the signals around them. Built from VideoStat, the Upload's
 * retention curves and live counters (lib/scorecard.db.ts); shown on /scorecard and the Overview.
 */
import { z } from "zod";

const n = z.number().nullable();

export const ScoreShortSchema = z.object({
  id: z.string(), title: z.string(), thumbnailUrl: z.string(), publishAt: z.string(), durationSec: z.number(),
  /** lifetime views, YouTube's live counter when known */
  views: z.number(),
  /** views in the first 48 hours; null until the Short is two days old */
  views48: n,
  /** engaged views ÷ views: the API's stand-in for Studio's stayed to watch */
  stayed: n,
  /** share of the starting viewers lost between 4 and 7 s */
  lostAt5: n,
  /** share still watching at the last second */
  endHold: n,
  /** mean of YouTube's retention vs similar-length Shorts, 0..1 (0.5 typical) */
  relative: n,
  likes: z.number(), shares: z.number(), subs: z.number(),
});
export type ScoreShort = z.infer<typeof ScoreShortSchema>;

export const ScorecardSchema = z.object({
  source: z.enum(["sample", "database"]),
  generatedAt: z.string(),
  /** the content reset's day: "before" and "after" split on it */
  resetDay: z.string(),
  /** published Shorts, newest first */
  shorts: z.array(ScoreShortSchema),
});
export type Scorecard = z.infer<typeof ScorecardSchema>;

export * from "./scorecard-logic";
