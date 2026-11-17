import { NextResponse } from "next/server";

import { SLUG } from "@/lib/channels";
import { signState } from "@/lib/channel-token";
import { listChannels } from "@/lib/store";
import { CALLBACK_PATH, authUrl, origin, webClient } from "@/lib/youtube-oauth";

export const dynamic = "force-dynamic";

/** "Connect YouTube": off to Google's sign-in, where the owner picks the channel's account. */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const back = (msg: string) => NextResponse.redirect(`${origin(req)}/channels?error=${encodeURIComponent(msg)}`);
  if (!SLUG.test(id) || !(await listChannels()).some((c) => c.id === id)) return back("No such channel");
  const client = webClient();
  if (!client) return back("Connect YouTube isn't set up yet: add YT_WEB_CLIENT_ID and YT_WEB_CLIENT_SECRET in Netlify (see the Channels page)");
  if (!process.env.SESSION_SECRET) return back("SESSION_SECRET is not set on the server");
  return NextResponse.redirect(authUrl(client.id, origin(req) + CALLBACK_PATH, signState(id)));
}
