import { cookies } from "next/headers";

import { CHANNEL_COOKIE, channelFromCookie } from "./channels";

export { CREATE_SCOPED, SCOPED_OPS, SCOPES, docWhere, plainKey } from "./channel-scopes";

/**
 * The channel the current request is about: the switcher's cookie, else Paisa Panchayat. Outside a
 * request (build, scripts) it is CHANNEL when set (the workers' data audit runs this code once per
 * channel), else the default channel.
 */
export async function currentChannel(): Promise<string> {
  try {
    return channelFromCookie((await cookies()).get(CHANNEL_COOKIE)?.value);
  } catch {
    return channelFromCookie(process.env.CHANNEL);
  }
}
