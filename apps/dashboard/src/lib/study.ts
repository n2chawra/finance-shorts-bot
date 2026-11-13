import { z } from "zod";

/*
 * The Study page (owner, 2026-11-13): YouTube videos the owner links. Gemini watches each and the
 * closest of ours (workers/study.ts); the techniques go to the writer, the biggest look difference
 * becomes a weekly-loop test.
 */

const measureMap = z.record(z.string(), z.union([z.number(), z.string(), z.boolean(), z.null()])).catch({});
const GapSchema = z.looseObject({ key: z.string(), label: z.string(), ours: z.string(), twins: z.string(), direction: z.enum(["more", "less"]) });

export const StudyReportSchema = z.looseObject({
  theirs: z.looseObject({
    artStyle: z.string().catch(""), durationSec: z.number().catch(0), measures: measureMap,
    hook: z.looseObject({ firstFrame: z.string().catch(""), firstLine: z.string().catch("") }).catch({ firstFrame: "", firstLine: "" }),
    techniques: z.array(z.string()).catch([]),
    shots: z.array(z.looseObject({ start: z.number(), end: z.number(), picture: z.string() })).catch([]),
  }),
  ours: z.looseObject({ videoId: z.string(), title: z.string().catch(""), measures: measureMap }).nullable().catch(null),
  gaps: z.array(GapSchema).catch([]),
  applied: z.looseObject({
    writer: z.array(z.string()).catch([]),
    challenger: z.looseObject({ id: z.string(), test: z.string(), why: z.string().catch("") }).nullable().catch(null),
  }).catch({ writer: [], challenger: null }),
});
export type StudyReport = z.infer<typeof StudyReportSchema>;

export const StudySchema = z.object({
  id: z.string(),
  url: z.string(),
  youtubeId: z.string(),
  title: z.string().nullable(),
  channel: z.string().nullable(),
  note: z.string().nullable(),
  videoId: z.string().nullable(),
  videoTitle: z.string().nullable(),
  matchedBy: z.string().nullable(),
  status: z.enum(["queued", "watching", "done", "failed"]),
  error: z.string().nullable(),
  report: StudyReportSchema.nullable(),
  createdAt: z.string(),
  doneAt: z.string().nullable(),
});
export type Study = z.infer<typeof StudySchema>;

export const StudyCreateSchema = z.object({
  url: z.string().trim().min(5, "Paste a YouTube link").max(300),
  /** one of our videos to compare with; empty = the closest title */
  videoId: z.string().trim().max(60).optional().transform((v) => v || undefined),
  note: z.string().trim().max(500).optional().transform((v) => v || undefined),
});
export type StudyCreate = z.infer<typeof StudyCreateSchema>;

const STOP = new Set(("a an the of for in on at to and or but so is are was were be it its this that your you my our their his her " +
  "from with by as how why what when who which do does did can just only even than then into out up about over vs").split(" "));

export const wordsOf = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));

/** Our video whose title (and topic) shares the most words with theirs; null when none shares two. */
export function bestMatch(theirTitle: string, ours: { id: string; title: string; topic?: string | null }[]): string | null {
  const want = new Set(wordsOf(theirTitle));
  if (!want.size) return null;
  let best: { id: string; score: number } | null = null;
  for (const v of ours) {
    const have = new Set([...wordsOf(v.title), ...wordsOf(v.topic ?? "")]);
    const score = [...want].filter((w) => have.has(w) || have.has(w.replace(/s$/, "")) || have.has(`${w}s`)).length;
    if (score >= 2 && (!best || score > best.score)) best = { id: v.id, score };
  }
  return best?.id ?? null;
}
