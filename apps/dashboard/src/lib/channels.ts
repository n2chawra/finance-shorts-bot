import { z } from "zod";

/*
 * Many channels on one platform (docs/plans/multi-channel.md). The dashboard shows one channel at a
 * time, picked in the sidebar's switcher and kept in the `channel` cookie; every page's data is
 * scoped to it (lib/channel-scope.ts). Paisa Panchayat is the first channel.
 */

export const DEFAULT_CHANNEL = "paisa-panchayat";
export const CHANNEL_COOKIE = "channel";
export const SLUG = /^[a-z0-9][a-z0-9-]{1,40}$/;

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM (IST)");

/** What a channel may set for itself; everything else is a platform setting. */
export const ChannelSettingsSchema = z.object({
  dailyVideoTarget: z.number().int().min(0).max(5),
  uploadTimes: z.array(time).min(1).max(4),
  longPerWeek: z.number().int().min(0).max(7),
  uploadsPaused: z.boolean(),
  generationPaused: z.boolean(),
}).partial();
export type ChannelSettings = z.infer<typeof ChannelSettingsSchema>;

export const ChannelStatusSchema = z.enum(["setup", "review", "active", "paused"]);
export type ChannelStatus = z.infer<typeof ChannelStatusSchema>;

/*
 * A new channel's setup (multi-channel plan, step 3): scanning → verdict (the owner's Continue/Stop) →
 * research → build → samples → review → launched, or stopped. The stage and the verdict come from the
 * repo (channels/<slug>/setup.json and research/verdict.json, written by the scan and the /new-channel
 * skill, copied in by ingest); the owner's decision is made here.
 */
export const SETUP_STAGES = ["scanning", "verdict", "research", "build", "samples", "review", "launched", "stopped"] as const;
export type SetupStage = (typeof SETUP_STAGES)[number];

const Range = z.object({ low: z.number(), likely: z.number(), high: z.number() });
export const VerdictSchema = z.looseObject({
  call: z.enum(["go", "go-with-conditions", "dont"]),
  reason: z.string(),
  conditions: z.array(z.string()).default([]),
  for: z.array(z.string()).default([]),
  against: z.array(z.string()).default([]),
  /** rough earnings in USD a month: estimates, with their assumptions */
  earnings: z.object({ m6: Range, m12: Range, assumptions: z.string() }).nullable().default(null),
  /** the scan's headline numbers the verdict rests on */
  demand: z.record(z.string(), z.union([z.number(), z.string(), z.null()])).default({}),
  doable: z.object({ look: z.string(), voice: z.string(), policy: z.string() }).partial().default({}),
  writtenAt: z.string().optional(),
});
export type Verdict = z.infer<typeof VerdictSchema>;

/** The Launch review (step 3d): the research's advice and counts, each sample's likeness, and the owner's answers. */
const LikenessRow = z.object({ measure: z.string(), ours: z.number().nullable(), theirs: z.number().nullable(), within: z.boolean().nullable() });
export const ReviewSchema = z.object({
  advice: z.string().nullable().default(null),
  counts: z.looseObject({ shortsPerDay: z.number(), longPerWeek: z.number(), reasons: z.array(z.string()).default([]) }).nullable().catch(null).default(null),
  likeness: z.record(z.string(), z.looseObject({ format: z.string().optional(), references: z.number().default(0), rows: z.array(LikenessRow).default([]),
    within: z.number().default(0), of: z.number().default(0), pass: z.boolean().default(false) })).catch({}).default({}),
  approved: z.object({ at: z.string(), shortsPerDay: z.number(), longPerWeek: z.number() }).nullable().default(null),
  notes: z.array(z.object({ at: z.string(), text: z.string(), videoId: z.string().optional(), done: z.boolean().default(false) })).default([]),
});
export type Review = z.infer<typeof ReviewSchema>;

export const ReviewActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve"), shortsPerDay: z.number().int().min(0).max(5), longPerWeek: z.number().int().min(0).max(7) }),
  z.object({ action: z.literal("note"), text: z.string().trim().min(3).max(1500), videoId: z.string().max(40).optional() }),
  z.object({ action: z.literal("stop") }),
]);
export type ReviewAction = z.infer<typeof ReviewActionSchema>;

export const SetupSchema = z.object({
  stage: z.enum(SETUP_STAGES),
  review: ReviewSchema.nullable().catch(null).default(null),
  verdict: VerdictSchema.nullable().default(null),
  decision: z.object({ choice: z.enum(["continue", "stop"]), at: z.string(), note: z.string().optional() }).nullable().default(null),
  /** what the setup is doing now, in a line (from setup.json) */
  note: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Setup = z.infer<typeof SetupSchema>;

export const DecisionSchema = z.object({ choice: z.enum(["continue", "stop"]), note: z.string().trim().max(500).optional() });

export const ChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: ChannelStatusSchema,
  connected: z.boolean(),
  youtubeChannelId: z.string().nullable(),
  connectedAt: z.string().nullable(),
  settings: ChannelSettingsSchema,
  /** the request the owner made on "Add channel": niche, description, reference channels */
  request: z.object({ niche: z.string(), description: z.string(), references: z.array(z.string()) }).nullable(),
  counts: z.object({ queued: z.number(), published: z.number(), views7d: z.number() }),
  setup: SetupSchema.nullable(),
  /** after launch: green, amber or red with its one-line reason (ingest, workers/lib/health-sync.ts) */
  health: z.object({ color: z.enum(["green", "amber", "red"]), reason: z.string(), bufferDays: z.number().nullable().optional(),
    stayed: z.number().nullable().optional(), usageShare: z.number().nullable().optional(), at: z.string().optional() }).nullable().default(null),
  createdAt: z.string(),
});
export type Channel = z.infer<typeof ChannelSchema>;

export const ChannelPatchSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  status: z.enum(["active", "paused"]).optional(),
  settings: ChannelSettingsSchema.optional(),
});
export type ChannelPatch = z.infer<typeof ChannelPatchSchema>;

export const ChannelCreateSchema = z.object({
  niche: z.string().trim().min(3, "Say the niche in a few words").max(120),
  description: z.string().trim().min(10, "A few lines about the channel").max(1500),
  references: z.array(z.string().trim().url("Each reference must be a link").max(300)).min(1, "At least one reference channel").max(3),
  name: z.string().trim().max(60).optional().transform((v) => v || undefined),
});
export type ChannelCreate = z.infer<typeof ChannelCreateSchema>;

/** A folder-safe slug from a name or niche: "Space Facts Daily" → "space-facts-daily". */
export function slugify(s: string): string {
  const slug = s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 40).replace(/-$/, "");
  return SLUG.test(slug) ? slug : `channel-${Date.now().toString(36)}`;
}

/** The cookie value if it's a valid slug, else the default channel. */
export const channelFromCookie = (v: string | undefined | null): string => (v && SLUG.test(v) ? v : DEFAULT_CHANNEL);
