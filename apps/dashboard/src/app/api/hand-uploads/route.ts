import { NextResponse } from "next/server";

import { listHandUploads } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Every channel's ready videos whose upload slot was missed (mostly: the day's YouTube quota ran out). */
export async function GET() {
  return NextResponse.json(await listHandUploads());
}
