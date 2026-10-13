import { NextResponse } from "next/server";

import { getAnalytics } from "@/lib/store";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getAnalytics());
}