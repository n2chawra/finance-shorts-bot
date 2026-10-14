import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Public, data-free health check: the server's region and one database round trip in ms. */
export async function GET() {
  const start = performance.now();
  await prisma.$queryRaw`SELECT 1`;
  return NextResponse.json({ region: process.env.AWS_REGION ?? "local", dbMs: Math.round(performance.now() - start) }, { headers: { "cache-control": "no-store" } });
}
