import { NextResponse } from "next/server";

import { sealToken, verifyState } from "@/lib/channel-token";
import { connectChannel } from "@/lib/store";
import { CALLBACK_PATH, exchangeCode, myChannel, origin, webClient } from "@/lib/youtube-oauth";

export const dynamic = "force-dynamic";

/**
 * Google sends the owner back here after "Connect YouTube". The token is checked to belong to a
 * YouTube channel no other channel of ours holds, sealed, and stored; it is never shown or logged.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const done = (q: string) => NextResponse.redirect(`${origin(req)}/channels?${q}`);
  const fail = (msg: string) => done(`error=${encodeURIComponent(msg)}`);
  if (url.searchParams.get("error")) return fail(`Google sign-in was cancelled (${url.searchParams.get("error")})`);
  const channelId = verifyState(url.searchParams.get("state"));
  if (!channelId) return fail("The sign-in link expired or was changed. Click Connect YouTube again.");
  const code = url.searchParams.get("code"), client = webClient();
  if (!code || !client) return fail("Google didn't send a sign-in code");
  try {
    const tokens = await exchangeCode(code, origin(req) + CALLBACK_PATH, client);
    if (!tokens.refresh_token) return fail("Google didn't give a long-lived token. Remove the app's access at myaccount.google.com/permissions and connect again.");
    const yt = await myChannel(tokens.access_token);
    if (!yt) return fail("That Google account has no YouTube channel. Pick the channel's own account (or brand account) on Google's screen.");
    const r = await connectChannel(channelId, yt.id, sealToken(tokens.refresh_token, "web"));
    return "error" in r ? fail(r.error) : done(`connected=${encodeURIComponent(channelId)}&yt=${encodeURIComponent(yt.title)}`);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Connect YouTube failed");
  }
}
