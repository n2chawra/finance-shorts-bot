import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { VideoStatusSchema } from "@/lib/schemas";
import { listVideos } from "@/lib/store";

export const dynamic = "force-dynamic";

const Query = z.object({
  status: VideoStatusSchema.optional(),
  template: z.string().max(40).optional(),
  category: z.string().max(40).optional(),
  q: z.string().max(80).optional(),
});

export async function GET(req: NextRequest) {
  const parsed = Query.safeParse(Object.fromEntries([...req.nextUrl.searchParams].filter(([, v]) => v !== "")));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  return NextResponse.json(await listVideos(parsed.data));
}