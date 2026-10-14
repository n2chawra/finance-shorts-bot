import type { PrismaClient } from "@prisma/client";

import { videoStatuses } from "./youtube.ts";

/** YouTube credentials present? Workflows run before the channel is connected, and should then do nothing. */
export function youtubeConfigured(): boolean {
  const missing = ["YT_CLIENT_ID", "YT_CLIENT_SECRET", "YT_REFRESH_TOKEN"].filter((k) => !process.env[k]);
  if (missing.length) console.log(`::notice::YouTube is not connected yet (missing ${missing.join(", ")}). Nothing to do.`);
  return missing.length === 0;
}

/**
 * Scheduled uploads whose publish time has passed: mark them published once YouTube shows them as
 * public. Until the API audit is approved YouTube keeps API uploads private, so they stay scheduled.
 */
export async function refreshPublished(prisma: PrismaClient, token: string, now = new Date()): Promise<{ published: string[]; stillPrivate: string[]; missing: string[] }> {
  const due = await prisma.upload.findMany({ where: { state: "scheduled", publishAt: { lte: now }, youtubeId: { not: null } } });
  const result = { published: [] as string[], stillPrivate: [] as string[], missing: [] as string[] };
  if (!due.length) return result;
  const statuses = await videoStatuses(token, due.map((u) => u.youtubeId!));
  for (const u of due) {
    const s = statuses.get(u.youtubeId!);
    if (!s) {
      await prisma.upload.update({ where: { id: u.id }, data: { state: "failed", error: "The video is no longer on YouTube (deleted or removed)." } });
      result.missing.push(u.videoId);
    } else if (s.privacyStatus === "public") {
      await prisma.$transaction([
        prisma.upload.update({ where: { id: u.id }, data: { state: "published", error: null } }),
        prisma.video.update({ where: { id: u.videoId }, data: { status: "published" } }),
      ]);
      result.published.push(u.videoId);
    } else {
      const why = s.rejectionReason ?? s.failureReason;
      await prisma.upload.update({ where: { id: u.id }, data: { error: why ? `YouTube: ${why}` : "Still private after its publish time (API audit pending?)" } });
      result.stillPrivate.push(u.videoId);
    }
  }
  return result;
}
