import { NextResponse } from "next/server";

import { VideoActionSchema } from "@/lib/schemas";
import { videoAction } from "@/lib/store";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string; action: string }> }) {
  const { id, action } = await ctx.params;
  const parsed = VideoActionSchema.safeParse(action);
  if (!parsed.success) return NextResponse.json({ error: "Unknown action" }, { status: 404 });
  const result = videoAction(id, parsed.data);
  return result.ok ? NextResponse.json(result) : NextResponse.json({ error: result.error }, { status: 409 });
}
