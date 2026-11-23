/**
 * Where a channel's own files live (the TypeScript twin of generator/channels.py).
 *
 * `config/channel-layout.json` maps each legacy repo path to its place in `channels/<slug>/`. A
 * channel without a folder yet keeps the legacy paths, so ingest, publish and stats behave the same
 * before and after the move. The channel is `CHANNEL`, else the layout's default.
 *
 * A channel the owner deleted on the dashboard (Channel.status "deleting", until delete-channel.yml has
 * removed it) is skipped by every worker: `allChannels` leaves it out, and the database loops only take
 * active and paused channels (lib/channel-auth.ts `activeChannels`).
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

const REPO = path.resolve(import.meta.dirname, "..", "..");
/** Channel #1 (deleted 2026-11-23), by id: a few rules keyed on "channel #1's old rows" (its env token, covers set
 * before the cover mark) must not move to whichever channel is the layout's default now. */
export const CHANNEL_ONE = "paisa-panchayat";
const SLUG = /^[a-z0-9][a-z0-9-]{1,40}$/;

const LayoutSchema = z.object({ default: z.string().regex(SLUG), map: z.record(z.string(), z.string()) });
export type Layout = z.infer<typeof LayoutSchema>;

let cached: Layout | null = null;
export function layout(root: string = REPO): Layout {
  if (root === REPO && cached) return cached;
  const file = path.join(root, "config", "channel-layout.json");
  const fallback = path.join(REPO, "config", "channel-layout.json");
  const parsed = LayoutSchema.parse(JSON.parse(readFileSync(existsSync(file) ? file : fallback, "utf8")));
  if (root === REPO) cached = parsed;
  return parsed;
}

export function currentChannel(root: string = REPO): string {
  const slug = process.env.CHANNEL || layout(root).default;
  if (!SLUG.test(slug)) throw new Error(`bad channel slug ${JSON.stringify(slug)}`);
  return slug;
}

export function channelRoot(root: string = REPO, slug: string = currentChannel(root)): string {
  return path.join(root, "channels", slug);
}

/** The legacy repo-relative path `rel` mapped into the channel folder, or null for a shared path. */
export function mapped(rel: string, lay: Layout = layout()): string | null {
  const r = rel.replace(/\\/g, "/").replace(/^\.\//, "");
  let best: [string, string] | null = null;
  for (const [key, value] of Object.entries(lay.map)) {
    let hit: string;
    if (key.endsWith("/") && r.startsWith(key)) hit = value + r.slice(key.length);
    else if (r === key.replace(/\/$/, "")) hit = value.replace(/\/$/, "");
    else continue;
    if (!best || key.length > best[0].length) best = [key, hit];
  }
  return best ? best[1] : null;
}

/** Repo-relative POSIX path of a per-channel file (for the GitHub contents API and links). */
export function crel(rel: string, root: string = REPO, slug?: string): string {
  const s = slug ?? currentChannel(root);
  const m = mapped(rel, layout(root));
  const dir = channelRoot(root, s);
  if (m !== null && existsSync(dir) && statSync(dir).isDirectory()) return `channels/${s}/${m}`;
  return rel.replace(/\\/g, "/");
}

/** Absolute path of a per-channel file given by its legacy path segments, e.g. cpath(ROOT, "videos", id). */
export function cpath(root: string, ...segments: string[]): string {
  return path.join(root, crel(segments.join("/"), root));
}

/** Absolute path of a file in one channel's video folder, e.g. its timeline.json. Workers that loop over
 * every channel (stats, publish) don't set `CHANNEL`, so they must name the channel: `cpath` alone
 * would look in the default channel's folder for every channel's video. */
export function videoFile(root: string, slug: string, videoId: string, name: string): string {
  return path.join(root, crel(`videos/${videoId}/${name}`, root, slug));
}

/** Channels the database says are being deleted, learnt by a worker before config/channels.json catches up. */
const deletingFromDb = new Set<string>();
export function markDeleting(slugs: Iterable<string>): void {
  for (const s of slugs) deletingFromDb.add(s);
}

/** Channels being deleted: config/channels.json's status "deleting" (or "deleted"), plus any `markDeleting` named. */
export function deletingChannels(root: string = REPO): Set<string> {
  const out = new Set(deletingFromDb);
  try {
    const j = JSON.parse(readFileSync(path.join(root, "config", "channels.json"), "utf8")) as { channels?: Record<string, { status?: string }> };
    for (const [slug, c] of Object.entries(j.channels ?? {})) if (c?.status === "deleting" || c?.status === "deleted") out.add(slug);
  } catch { /* no file yet */ }
  return out;
}

/** Every channel with a folder (minus channels being deleted), else just the default (before the move). */
export function allChannels(root: string = REPO): string[] {
  const base = path.join(root, "channels");
  const gone = deletingChannels(root);
  const found = existsSync(base)
    ? readdirSync(base).filter((n) => SLUG.test(n) && !gone.has(n) && statSync(path.join(base, n)).isDirectory()).sort()
    : [];
  return found.length ? found : [layout(root).default];
}

/** A channel's pack values the workers need (channels/<slug>/channel.json, generator/pack.py); channel #1's without one. */
export function channelPack(slug: string, root: string = REPO): { name: string | null; uploadCategory: string } {
  const file = path.join(root, "channels", slug, "channel.json");
  try {
    const j = JSON.parse(readFileSync(file, "utf8")) as { name?: string; uploadCategory?: string };
    return { name: j.name ?? null, uploadCategory: /^\d+$/.test(j.uploadCategory ?? "") ? j.uploadCategory! : "22" };
  } catch {
    return { name: null, uploadCategory: "22" };
  }
}
