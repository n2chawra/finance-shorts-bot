import { NextResponse } from "next/server";

import { getVideoStudio } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const data = await getVideoStudio((await ctx.params).id);
  return data ? NextResponse.json(data) : NextResponse.json({ error: "Video not found" }, { status: 404 });
}
