import { NextResponse } from "next/server";

import { getVideo } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const video = getVideo((await ctx.params).id);
  return video ? NextResponse.json(video) : NextResponse.json({ error: "Video not found" }, { status: 404 });
}
