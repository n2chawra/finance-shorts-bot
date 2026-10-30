import { NextResponse } from "next/server";

import { VideoActionBodySchema, VideoActionSchema } from "@/lib/schemas";
import { videoAction } from "@/lib/store";

export async function POST(req: Request, ctx: { params: Promise<{ id: string; action: string }> }) {
  const { id, action } = await ctx.params;
  const parsed = VideoActionSchema.safeParse(action);
  if (!parsed.success) return NextResponse.json({ error: "Unknown action" }, { status: 404 });
  // pick and stale carry a reason ("why this one" / "why not"); the other actions have no body
  const body = VideoActionBodySchema.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: body.error.issues[0]?.message ?? "Invalid body" }, { status: 400 });
  const result = await videoAction(id, parsed.data, body.data.reason);
  return result.ok ? NextResponse.json(result) : NextResponse.json({ error: result.error }, { status: 409 });
}
