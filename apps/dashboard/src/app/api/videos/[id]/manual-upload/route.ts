import { NextResponse } from "next/server";

import { ManualUploadSchema } from "@/lib/schemas";
import { markUploaded } from "@/lib/store";

/** Mark a video as uploaded to YouTube by hand. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const parsed = ManualUploadSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid YouTube link or date" }, { status: 400 });
  const result = await markUploaded(id, parsed.data);
  return result.ok ? NextResponse.json(result) : NextResponse.json({ error: result.error }, { status: 409 });
}
