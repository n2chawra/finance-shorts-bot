import { NextResponse } from "next/server";

import type { Portfolio } from "@/lib/portfolio";
import { getPortfolio } from "@/lib/portfolio.db";

export const dynamic = "force-dynamic";

/** Every channel at a glance (the All channels page), unscoped. Kept 5 minutes per server instance:
 * the stats behind it change every 3 hours at most. */
const TTL = 5 * 60_000;
const g = globalThis as unknown as { __portfolio?: { at: number; data: Promise<Portfolio> } };

export async function GET(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ source: "sample", generatedAt: new Date().toISOString(), days: [], daily: {}, channels: [] } satisfies Portfolio);
  }
  const fresh = new URL(req.url).searchParams.has("fresh");
  if (fresh || !g.__portfolio || Date.now() - g.__portfolio.at > TTL) {
    const data = getPortfolio();
    g.__portfolio = { at: Date.now(), data };
    data.catch(() => { if (g.__portfolio?.data === data) g.__portfolio = undefined; });
  }
  return NextResponse.json(await g.__portfolio.data, { headers: { "cache-control": "private, max-age=300" } });
}
