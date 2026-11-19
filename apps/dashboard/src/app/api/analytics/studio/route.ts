import { NextResponse } from "next/server";

import { getStudio } from "@/lib/store";
import { FORMATS, RANGES, type Fmt, type Range } from "@/lib/studio-schema";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const range = (RANGES as readonly string[]).includes(q.get("range") ?? "") ? (q.get("range") as Range) : "28";
  const format = (FORMATS as readonly string[]).includes(q.get("format") ?? "") ? (q.get("format") as Fmt) : "all";
  // a minute fresh, then served stale while it refreshes: switching ranges and coming back is instant
  return NextResponse.json(await getStudio(range, format), { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=300" } });
}
