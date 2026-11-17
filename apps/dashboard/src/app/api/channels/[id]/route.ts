import { NextResponse } from "next/server";

import { ChannelPatchSchema, SLUG } from "@/lib/channels";
import { patchChannel } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Pause or resume a channel, rename it, or change its own settings (videos a day, upload times…). */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!SLUG.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = ChannelPatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: `${issue?.path.join(".")}: ${issue?.message}` }, { status: 400 });
  }
  const row = await patchChannel(id, parsed.data);
  return "error" in row ? NextResponse.json(row, { status: 400 }) : NextResponse.json(row);
}
