import { NextResponse } from "next/server";

import { getStudio } from "@/lib/store";
import { FORMATS, RANGES, type Fmt, type Range } from "@/lib/studio-schema";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const range = (RANGES as readonly string[]).includes(q.get("range") ?? "") ? (q.get("range") as Range) : "28";
  const format = (FORMATS as readonly string[]).includes(q.get("format") ?? "") ? (q.get("format") as Fmt) : "all";
  return NextResponse.json(await getStudio(range, format));
}
