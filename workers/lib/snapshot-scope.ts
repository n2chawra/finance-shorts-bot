import type { Prisma } from "@prisma/client";

/**
 * Which uploads the hourly snapshot reads for a channel: every published one, and a scheduled one
 * whose publish time has passed. A Short goes public at `publishAt`, but its upload only turns
 * `published` when stats.ts (every 3 h) sees it, so without the second rule its first 1-3 hours had
 * no snapshot and the first-48-hours chart spread those views evenly from publish time.
 */
export function snapshotUploadsWhere(channelId: string, now: Date): Prisma.UploadWhereInput {
  return {
    youtubeId: { not: null },
    video: { deletedAt: null, channelId },
    OR: [{ state: "published" }, { state: "scheduled", publishAt: { lte: now } }],
  };
}
