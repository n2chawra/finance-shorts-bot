import { NextResponse } from "next/server";

import { getOverview } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getOverview());
}