/**
 * Which rows belong to which channel (pure: the dashboard's request-scoped client in lib/prisma.ts and the
 * workers' per-channel ingest in workers/lib/scoped.ts both use it). Paisa Panchayat is the default channel.
 */
// no imports: the workers load this file in CI, where only the workers' packages are installed
const DEFAULT_CHANNEL = "paisa-panchayat";   // lib/channels.ts DEFAULT_CHANNEL

type Where = Record<string, unknown> | undefined;
const and = (where: Where, extra: Record<string, unknown>): Record<string, unknown> => (where ? { AND: [where, extra] } : extra);

/** Models that belong to one channel, and how a query on each is narrowed to it. */
export const SCOPES: Record<string, (where: Where, channelId: string) => Record<string, unknown>> = {
  video: (w, c) => and(w, { channelId: c }),
  topic: (w, c) => and(w, { channelId: c }),
  channelDay: (w, c) => and(w, { channelId: c }),
  breakdown: (w, c) => and(w, { channelId: c }),
  study: (w, c) => and(w, { channelId: c }),
  upload: (w, c) => and(w, { video: { channelId: c } }),
  videoStat: (w, c) => and(w, { upload: { video: { channelId: c } } }),
  liveSnapshot: (w, c) => and(w, { upload: { video: { channelId: c } } }),
  comment: (w, c) => and(w, { upload: { video: { channelId: c } } }),
  qaCheck: (w, c) => and(w, { video: { channelId: c } }),
  // a run that made a video belongs to that video's channel; runs with no video (idle and template runs)
  // show on every channel. Unscoped, "Made today" on Paisa Panchayat counted the geography channel's Short.
  agentRun: (w, c) => and(w, { OR: [{ video: { channelId: c } }, { videoId: null }] }),
  // platform-wide rows (null) show on every channel
  notification: (w, c) => and(w, { OR: [{ channelId: c }, { channelId: null }] }),
  feedback: (w, c) => and(w, { OR: [{ channelId: c }, { channelId: null }] }),
  agentActivity: (w, c) => and(w, { OR: [{ channelId: c }, { channelId: null }] }),
};

/** Reads that take a `where` and are narrowed; writes and unique lookups by id are left alone. */
export const SCOPED_OPS = new Set(["findMany", "findFirst", "findFirstOrThrow", "count", "aggregate", "groupBy", "updateMany", "deleteMany"]);

/** Models whose new rows take the channel when the caller didn't set one. */
export const CREATE_SCOPED = new Set(["video", "topic", "study", "feedback"]);

/**
 * The agents' repo files mirrored in RepoDoc (experiments, topic feed, weekly loop…) are per channel:
 * Paisa Panchayat keeps the plain keys; another channel's are "<slug>:<key>".
 */
export const docKey = (key: string, channel: string): string => (channel === DEFAULT_CHANNEL ? key : `${channel}:${key}`);
export const plainKey = (key: string, channel: string): string => (channel !== DEFAULT_CHANNEL && key.startsWith(`${channel}:`) ? key.slice(channel.length + 1) : key);

/** A RepoDoc query's where with its keys moved to the channel's. */
export function docWhere(where: Record<string, unknown> | undefined, channel: string): Record<string, unknown> | undefined {
  if (!where || channel === DEFAULT_CHANNEL) return where;
  const k = where.key as unknown;
  if (typeof k === "string") return { ...where, key: docKey(k, channel) };
  if (k && typeof k === "object" && Array.isArray((k as { in?: unknown }).in)) return { ...where, key: { ...(k as object), in: ((k as { in: string[] }).in).map((x) => docKey(x, channel)) } };
  return where;
}
