/**
 * Helpers for deleting a channel (workers/delete-channel.ts, .github/workflows/delete-channel.yml): which slugs may
 * be deleted, which videos are its own (never another channel's), which release tags they have, and which RepoDoc,
 * Setting, AgentActivity and Notification rows are its own.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { CHANNEL_ONE } from "./channels.ts";

export const SLUG = /^[a-z0-9][a-z0-9-]{1,40}$/;

/** What the repo says about the channel, for `refusal`. */
export type RepoState = {
  /** the layout's default channel (config/channel-layout.json): never deleted */
  defaultChannel: string;
  /** channels/<slug>/ exists */
  folder: boolean;
  /** its status in config/channels.json, or null when it isn't listed */
  listedStatus: string | null;
};

/** Why a channel may not be deleted now, or null when it may. The dashboard's Delete marks it "deleting" first, so a
 * typo in the workflow's input can never wipe a live channel. With no Channel row left (`status` null), only a re-run
 * of the cleanup is allowed: refused while the channel still has a folder or config/channels.json lists it live. */
export function refusal(slug: string, status: string | null, repo: RepoState): string | null {
  if (!SLUG.test(slug)) return `bad channel slug ${JSON.stringify(slug)}`;
  if (slug === repo.defaultChannel) return `channel ${slug} is the default channel (config/channel-layout.json): it can't be deleted`;
  if (status === null) {
    if (repo.folder) return `channel ${slug} has no Channel row but still has its channels/${slug}/ folder: not a re-run of a deletion, so nothing is deleted`;
    if (repo.listedStatus !== null && repo.listedStatus !== "deleting" && repo.listedStatus !== "deleted") return `channel ${slug} has no Channel row but config/channels.json lists it as ${repo.listedStatus}: nothing is deleted`;
    return null;   // a re-run: only the repo's leftovers remain
  }
  if (status !== "deleting") return `channel ${slug} is ${status}, not deleting: press Delete channel on the dashboard first`;
  return null;
}

/** The repo's view of a channel for `refusal`. */
export function repoState(root: string, slug: string, defaultChannel: string): RepoState {
  let listedStatus: string | null = null;
  try {
    const j = JSON.parse(readFileSync(path.join(root, "config", "channels.json"), "utf8")) as { channels?: Record<string, { status?: string }> };
    const c = j.channels?.[slug];
    if (c) listedStatus = c.status ?? "listed";
  } catch { /* no file */ }
  const dir = path.join(root, "channels", slug);
  return { defaultChannel, folder: existsSync(dir) && statSync(dir).isDirectory(), listedStatus };
}

/** Video ids a channel's folder records: its history.json entries and its videos/ folders. */
export function repoVideoIds(root: string, slug: string): string[] {
  const out: string[] = [];
  const hist = path.join(root, "channels", slug, "history", "history.json");
  try {
    const j = JSON.parse(readFileSync(hist, "utf8")) as unknown;
    if (Array.isArray(j)) for (const e of j) if (e && typeof e === "object" && typeof (e as { id?: unknown }).id === "string") out.push((e as { id: string }).id);
  } catch { /* no history */ }
  const vids = path.join(root, "channels", slug, "videos");
  if (existsSync(vids)) out.push(...readdirSync(vids).filter((n) => statSync(path.join(vids, n)).isDirectory()));
  return out;
}

/** Ids another channel's folder records (its history or videos/): never deleted with this channel. */
export function idsOfOtherChannels(root: string, slug: string): Set<string> {
  const base = path.join(root, "channels");
  const out = new Set<string>();
  if (!existsSync(base)) return out;
  for (const other of readdirSync(base)) {
    if (other === slug || !SLUG.test(other) || !statSync(path.join(base, other)).isDirectory()) continue;
    for (const id of repoVideoIds(root, other)) out.add(id);
  }
  return out;
}

/** The ids whose releases and per-video code go with the channel: its database rows and its own folder's records,
 * minus anything another channel's folder records (a safety net against a mislabelled row). */
export function idsToDelete(dbIds: Iterable<string>, ownRepoIds: Iterable<string>, others: Set<string>): { ids: string[]; kept: string[] } {
  const all = safeIds([...dbIds, ...ownRepoIds]);
  return { ids: all.filter((id) => !others.has(id)), kept: all.filter((id) => others.has(id)) };
}

/** Platform notifications (watchdog's site, agent and schedule checks, workflow failures, quota, the Reporting API)
 * that took channel #1 as the column default before they set channelId null: they move to null, not deleted. */
const PLATFORM_KEYS = new Set(["agents-paused", "site-down", "schedule-overlap", "reporting-api-needed", "reporting-api-off"]);
const PLATFORM_PREFIXES = ["agent-blocked:", "agent-silent:", "workflow:", "quota-high:", "quota-out:"];
export const isPlatformNotice = (dedupeKey: string): boolean =>
  PLATFORM_KEYS.has(dedupeKey) || PLATFORM_PREFIXES.some((p) => dedupeKey.startsWith(p));

/** A video's GitHub release tag (generator/run.py ship). */
export const releaseTag = (id: string): string => `video-${id}`;

/** Video ids that are safe to use in a tag or a path (v-YYYYMMDD-NN, L-YYYYMMDD-NN and the like). */
export const safeIds = (ids: Iterable<string>): string[] =>
  [...new Set([...ids].filter((id) => /^[A-Za-z0-9][A-Za-z0-9._-]{0,80}$/.test(id)))].sort();

/** Channel #1's plain RepoDoc keys that agents-sync's DOCS doesn't list (snapshotDocs writes them separately). */
export const CHANNEL_ONE_PLAIN_DOCS = ["lessons"] as const;

/** The channel's own RepoDoc keys. Every channel's are "<slug>:<key>" (lib/scoped.ts); channel #1's are the plain
 * per-channel doc keys (agents-sync DOCS and its hash record), never the platform's plain keys (activity hashes,
 * applied template decisions). */
export function repoDocKeysOf(slug: string, keys: string[], channelDocKeys: string[]): string[] {
  if (slug === CHANNEL_ONE) {
    const own = new Set([...channelDocKeys, ...CHANNEL_ONE_PLAIN_DOCS]);
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
