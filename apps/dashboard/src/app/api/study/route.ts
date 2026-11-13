import { NextResponse } from "next/server";

import { addStudy, listStudies } from "@/lib/store";
import { StudyCreateSchema } from "@/lib/study";

/** Videos the owner linked to study, newest first, with their reports. */
export async function GET() {
  return NextResponse.json(await listStudies());
}

export async function POST(req: Request) {
  const parsed = StudyCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid link" }, { status: 400 });
  const row = await addStudy(parsed.data);
  return "error" in row ? NextResponse.json(row, { status: 400 }) : NextResponse.json(row, { status: 201 });
}
