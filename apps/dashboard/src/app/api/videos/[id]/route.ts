import { NextResponse } from "next/server";

import { VideoEditSchema } from "@/lib/schemas";
import { getVideo, updateVideo } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const video = await getVideo((await ctx.params).id);
  return video ? NextResponse.json(video) : NextResponse.json({ error: "Video not found" }, { status: 404 });
}

/** The owner's edits: title, description, tags, and for an uploaded video its YouTube link and publish time. */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const parsed = VideoEditSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid edit" }, { status: 400 });
  const result = await updateVideo(id, parsed.data);
  return result.ok ? NextResponse.json(result) : NextResponse.json({ error: result.error }, { status: 409 });
}
