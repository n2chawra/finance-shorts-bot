import { NextResponse } from "next/server";

import { ThumbWinnerSchema } from "@/lib/schemas";
import { setThumbWinner } from "@/lib/store";

/** Log which of a long video's three thumbnails won YouTube's Test & Compare. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const parsed = ThumbWinnerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Pick one of the three thumbnails" }, { status: 400 });
  const result = await setThumbWinner(id, parsed.data.winner);
  return result.ok ? NextResponse.json(result) : NextResponse.json({ error: result.error }, { status: 409 });
}
