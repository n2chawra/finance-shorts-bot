import { NextResponse } from "next/server";

import { SLUG } from "@/lib/channels";
import { launchChannel } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Launch: the approved, connected channel goes live with the video counts the owner accepted. */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!SLUG.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const row = await launchChannel(id);
  return "error" in row ? NextResponse.json(row, { status: 400 }) : NextResponse.json(row);
}
