import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAnalytics, getOverview, getSettings, listQueue, listRuns, listTemplates, listVideos } from "@/lib/store";

export const dynamic = "force-dynamic";

// true only for the first request this server instance handles (a cold start)
let cold = true;

/**
 * Public, data-free health and timing probe: the server's region, whether this was a cold start,
 * and how long each dashboard API's database work takes. Returns only milliseconds.
 */
export async function GET() {
  const wasCold = cold;
  cold = false;
  const t = async (fn: () => Promise<unknown>) => { const s = performance.now(); await fn(); return Math.round(performance.now() - s); };
  const timings: Record<string, number> = {};
  timings.select1 = await t(() => prisma.$queryRaw`SELECT 1`);
  timings.select1_again = await t(() => prisma.$queryRaw`SELECT 1`);
  for (const [name, fn] of Object.entries({ overview: getOverview, queue: listQueue, videos: () => listVideos({}), runs: listRuns, templates: listTemplates, analytics: getAnalytics, settings: getSettings })) {
    timings[name] = await t(fn);
  }
  return NextResponse.json({ region: process.env.AWS_REGION ?? process.env.NETLIFY_REGION ?? "local", cold: wasCold, timings }, { headers: { "cache-control": "no-store" } });
}
