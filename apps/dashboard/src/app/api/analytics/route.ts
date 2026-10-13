import { NextResponse } from "next/server";

import { getAnalytics } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getAnalytics());
}