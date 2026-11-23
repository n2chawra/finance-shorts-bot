import { cookies } from "next/headers";

import { CHANNEL_COOKIE, channelFromCookie } from "./channels";

export { CREATE_SCOPED, SCOPED_OPS, SCOPES, docWhere, plainKey } from "./channel-scopes";

/*
 * The channels a cookie may point at: every Channel row except one being deleted. Read at most every
 * 30 s per server process (currentChannel runs on every scoped query); without a database (sample
 * data) or when the read fails, any valid slug is accepted as before.
 */
const TTL_MS = 30_000;
let live: { ids: ReadonlySet<string>; at: number } | null = null;

async function liveChannels(): Promise<ReadonlySet<string> | undefined> {
  if (!process.env.DATABASE_URL) return undefined;
  if (live && Date.now() - live.at < TTL_MS) return live.ids;
  try {
    // imported here: lib/prisma.ts imports this file
    const { prismaAll } = await import("./prisma");
    const rows = await prismaAll.channel.findMany({ where: { status: { not: "deleting" } }, select: { id: true } });
    live = { ids: new Set(rows.map((r) => r.id)), at: Date.now() };
    return live.ids;
  } catch {
    return live?.ids;
  }
}

/** Forget the cached channel list (after a channel is added or deleted). */
export const forgetLiveChannels = (): void => { live = null; };

/**
 * The channel the current request is about: the switcher's cookie when it names a live channel, else the
 * default channel (a cookie left on a deleted or unknown channel falls back too). Outside a request
 * (build, scripts) it is CHANNEL when set (the workers' data audit runs this code once per channel), else
 * the default channel.
 */
export async function currentChannel(): Promise<string> {
  let fromCookie: string | undefined;
  try {
    fromCookie = (await cookies()).get(CHANNEL_COOKIE)?.value;
  } catch {
    return channelFromCookie(process.env.CHANNEL);
  }
  return channelFromCookie(fromCookie, await liveChannels());
}
