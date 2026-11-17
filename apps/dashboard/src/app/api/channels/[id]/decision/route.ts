import { NextResponse } from "next/server";

import { DecisionSchema, SLUG } from "@/lib/channels";
import { decideChannel } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Continue or Stop on a new channel's quick verdict. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!SLUG.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = DecisionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose continue or stop" }, { status: 400 });
  const row = await decideChannel(id, parsed.data.choice, parsed.data.note);
  return "error" in row ? NextResponse.json(row, { status: 400 }) : NextResponse.json(row);
}
