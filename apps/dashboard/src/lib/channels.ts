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
