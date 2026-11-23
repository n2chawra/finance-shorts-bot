/**
 * Pure helpers for deleting a channel (workers/delete-channel.ts, .github/workflows/delete-channel.yml):
 * which slugs may be deleted, which release tags its videos have, and which RepoDoc and Setting rows are its own.
 */
import { CHANNEL_ONE } from "./channels.ts";

export const SLUG = /^[a-z0-9][a-z0-9-]{1,40}$/;

/** Why a channel may not be deleted now, or null when it may (the dashboard's Delete marks it "deleting" first,
 * so a typo in the workflow's input can never wipe a live channel). */
export function refusal(slug: string, status: string | null): string | null {
  if (!SLUG.test(slug)) return `bad channel slug ${JSON.stringify(slug)}`;
  if (status === null) return null;   // no row: only the repo's leftovers remain
  if (status !== "deleting") return `channel ${slug} is ${status}, not deleting: press Delete channel on the dashboard first`;
  return null;
}

/** A video's GitHub release tag (generator/run.py ship). */
export const releaseTag = (id: string): string => `video-${id}`;

/** Video ids that are safe to use in a tag or a path (v-YYYYMMDD-NN, L-YYYYMMDD-NN and the like). */
export const safeIds = (ids: Iterable<string>): string[] =>
  [...new Set([...ids].filter((id) => /^[A-Za-z0-9][A-Za-z0-9._-]{0,80}$/.test(id)))].sort();

/** The channel's own RepoDoc keys. Every channel's are "<slug>:<key>" (lib/scoped.ts); channel #1's are the plain
 * per-channel doc keys (agents-sync DOCS and its hash record), never the platform's plain keys (activity hashes,
 * applied template decisions). */
export function repoDocKeysOf(slug: string, keys: string[], channelDocKeys: string[]): string[] {
  if (slug === CHANNEL_ONE) {
    const own = new Set(channelDocKeys);
    return keys.filter((k) => own.has(k));
  }
  return keys.filter((k) => k.startsWith(`${slug}:`));
}

/** The channel's own Setting keys: "<key>:<slug>" (publish, stats, watchdog) and "<slug>:<key>" (data audit).
 * Channel #1's are plain and shared with the platform's, so they stay. */
export function settingKeysOf(slug: string, keys: string[]): string[] {
  if (slug === CHANNEL_ONE) return [];
  return keys.filter((k) => k.endsWith(`:${slug}`) || k.startsWith(`${slug}:`));
}
