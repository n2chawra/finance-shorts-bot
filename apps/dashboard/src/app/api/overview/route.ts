import { NextResponse } from "next/server";

import { getOverview } from "@/lib/store";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getOverview());
}