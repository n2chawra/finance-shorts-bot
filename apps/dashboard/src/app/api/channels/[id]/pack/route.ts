import { NextResponse } from "next/server";

import { channelPack } from "@/lib/channel-pack";
import { SLUG } from "@/lib/channels";

export const dynamic = "force-dynamic";

/** What the video page needs from the channel's pack: the YouTube category its videos are uploaded in. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!SLUG.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(await channelPack(id), { headers: { "cache-control": "private, max-age=300" } });
}
