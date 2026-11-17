import { cookies } from "next/headers";

import { CHANNEL_COOKIE, channelFromCookie } from "./channels";

/**
 * The channel the current request is about: the switcher's cookie, else Paisa Panchayat. Outside a
 * request (build, scripts) it is the default channel.
 */
export async function currentChannel(): Promise<string> {
  try {
    return channelFromCookie((await cookies()).get(CHANNEL_COOKIE)?.value);
  } catch {
    return channelFromCookie(null);
  }
}

/** Models that belong to one channel, and how a query on each is narrowed to it. */
type Where = Record<string, unknown> | undefined;
const and = (where: Where, extra: Record<string, unknown>): Record<string, unknown> => (where ? { AND: [where, extra] } : extra);

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
  // platform-wide rows (null) show on every channel
  notification: (w, c) => and(w, { OR: [{ channelId: c }, { channelId: null }] }),
  feedback: (w, c) => and(w, { OR: [{ channelId: c }, { channelId: null }] }),
  agentActivity: (w, c) => and(w, { OR: [{ channelId: c }, { channelId: null }] }),
};

/** Reads that take a `where` and are narrowed; writes and unique lookups by id are left alone. */
export const SCOPED_OPS = new Set(["findMany", "findFirst", "findFirstOrThrow", "count", "aggregate", "groupBy", "updateMany", "deleteMany"]);

/** Models whose new rows take the current channel when the caller didn't set one. */
export const CREATE_SCOPED = new Set(["video", "topic", "study", "feedback"]);
