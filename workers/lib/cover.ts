/**
 * Which of a long video's three thumbnails goes up (owner, 2026-11-11: "give 3 thumbnails so that I can pick
 * the best one, and if I don't, rate it yourself and pick it before upload"): the owner's pick on the dashboard
 * (style.thumbPick), else the one Studio rated best (style.thumbs[].picked), else thumbnail.png. The JPEG
 * beside each PNG goes first: PNG covers can pass YouTube's 2 MB limit (2026-11-03).
 */
import { existsSync } from "node:fs";
import path from "node:path";

export type ThumbEntry = { file: string; picked?: boolean | null; score?: number | null; why?: string | null; pattern?: string | null };
const FILE = /^thumbnail(-[bc])?\.png$/;

export function pickedThumb(style: unknown): string {
  const s = (style ?? {}) as { thumbPick?: { file?: unknown } | null; thumbs?: ThumbEntry[] | null };
  const owner = s.thumbPick?.file;
  if (typeof owner === "string" && FILE.test(owner)) return owner;
  const studio = (s.thumbs ?? []).find((t) => t && t.picked && FILE.test(t.file));
  return studio?.file ?? "thumbnail.png";
}

export function coverFile(dir: string, style: unknown, exists: (f: string) => boolean = existsSync): string | null {
  const pick = pickedThumb(style);
  const names = [pick.replace(/\.png$/, ".jpg"), pick, "thumbnail.jpg", "thumbnail.png"];
  return names.map((f) => path.join(dir, f)).find((f) => exists(f)) ?? null;
}

/** A queued video's thumbnails from its manifest, so a redone set (and Studio's new pick) reaches the
 * dashboard and the publisher; the owner's own pick is kept unless its file no longer exists in the set. */
export function syncThumbs(style: Record<string, unknown>, thumbs: ThumbEntry[] | undefined): Record<string, unknown> | null {
  if (!thumbs?.length || JSON.stringify(style.thumbs ?? null) === JSON.stringify(thumbs)) return null;
  const next: Record<string, unknown> = { ...style, thumbs };
  const owner = (style.thumbPick as { file?: string } | undefined)?.file;
  if (owner && !thumbs.some((t) => t.file === owner)) delete next.thumbPick;
  return next;
}

/** Whether an upload of the last COVER_DAYS days still needs our cover on YouTube (owner, 2026-11-22: "it is costing
 * me views"): never set, and tried under COVER_TRIES times. The publisher sets a few a run (COVERS_PER_RUN). The
 * default channel's older uploads carry no mark but did get their cover (the 22 Nov path bug only hit the other
 * channels), so only a marked one is retried there. */
export const COVER_DAYS = 21, COVER_TRIES = 3, COVERS_PER_RUN = 4;
/** A channel YouTube won't let set covers yet (not phone-verified) is asked again every REFUSED_RETRY_H hours, without
 * using up its tries, so the covers go up within hours of the owner verifying it (23 Nov: 3 channels refused). */
export const REFUSED_RETRY_H = 6;
export const isPermissionRefusal = (why: string) => /permission|verif/i.test(why);
export function needsCover(style: unknown, isDefaultChannel: boolean, now: number = Date.now()): boolean {
  const s = (style && typeof style === "object" ? style : {}) as { coverSetAt?: unknown; coverTries?: unknown; coverRefusedAt?: unknown };
  if (s.coverSetAt) return false;
  if (typeof s.coverRefusedAt === "string") return now - Date.parse(s.coverRefusedAt) >= REFUSED_RETRY_H * 3_600_000;
  const tries = Number(s.coverTries ?? 0) || 0;
  if (tries >= COVER_TRIES) return false;
  return !isDefaultChannel || s.coverTries !== undefined;
}
