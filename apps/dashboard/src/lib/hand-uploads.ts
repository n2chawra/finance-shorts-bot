import { z } from "zod";

import { VideoSchema } from "./schemas";

/**
 * "Upload by hand" (owner, 2026-11-19: "which video I need to upload by hand as quota got end"):
 * ready videos, on every channel, whose upload slot the publisher couldn't fill. The publisher leaves
 * such a video's Upload `pending`, with the slot it was meant for as publishAt and, when the day's
 * YouTube API quota ran out, an error starting with QUOTA_ERROR (workers/lib/publishing.ts, the same prefix).
 */
export const QUOTA_ERROR = "quota:";

/** An "Upload now" click waits for the next publish run (minutes); a pending upload older than this missed its slot. */
export const MISSED_AFTER_MINUTES = 30;

export type MissReason = "quota" | "missed";

/** Why a video belongs in the list, or null when it doesn't: a quota miss always (its slot may still be
 * ahead, but nothing can upload it before the quota resets), any other pending upload once its time is well past. */
export function missReason(u: { state: string; error: string | null; publishAt: Date }, now = new Date()): MissReason | null {
  if (u.state !== "pending") return null;
  if (u.error?.startsWith(QUOTA_ERROR)) return "quota";
  return now.getTime() - u.publishAt.getTime() >= MISSED_AFTER_MINUTES * 60_000 ? "missed" : null;
}

export const HandUploadSchema = z.object({
  channelId: z.string(),
  channelName: z.string(),
  /** the slot it was meant for (ISO) */
  slotAt: z.string(),
  reason: z.enum(["quota", "missed"]),
  error: z.string().nullable(),
  video: VideoSchema,
});
export type HandUpload = z.infer<typeof HandUploadSchema>;
