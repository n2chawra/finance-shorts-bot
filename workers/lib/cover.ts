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
