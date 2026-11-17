import { NextResponse } from "next/server";

import { ReviewActionSchema, SLUG } from "@/lib/channels";
import { channelSamples, reviewChannel } from "@/lib/store";

export const dynamic = "force-dynamic";

/** The channel's sample videos for the Launch review. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!SLUG.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(await channelSamples(id));
}

/** I like it (with the video counts accepted), a note, or Stop. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!SLUG.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = ReviewActionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid review" }, { status: 400 });
  const row = await reviewChannel(id, parsed.data);
  return "error" in row ? NextResponse.json(row, { status: 400 }) : NextResponse.json(row);
}
