import { NextResponse } from "next/server";

import { FeedbackCreateSchema, FeedbackPatchSchema } from "@/lib/schemas";
import { addFeedback, listFeedback, setFeedbackStatus } from "@/lib/store";

/** The owner's feedback: all of it, or one video's (?videoId=). */
export async function GET(req: Request) {
  const videoId = new URL(req.url).searchParams.get("videoId") ?? undefined;
  return NextResponse.json(await listFeedback(videoId));
}

export async function POST(req: Request) {
  const parsed = FeedbackCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid feedback" }, { status: 400 });
  const row = await addFeedback(parsed.data);
  return row ? NextResponse.json(row, { status: 201 }) : NextResponse.json({ error: "Video not found" }, { status: 404 });
}

/** Reopen or close a note by hand (the improver closes them with its answer). */
export async function PATCH(req: Request) {
  const parsed = FeedbackPatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  const row = await setFeedbackStatus(parsed.data.id, parsed.data.status);
  return row ? NextResponse.json(row) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
