import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

/**
 * Titles and channel names for other people's YouTube videos (the Analytics "Suggested next to"
 * list stores only their ids). One Data API call (1 quota unit per 50 ids) with YT_API_KEY, cached in
 * memory for a day per id; without the key it returns nothing and the page shows the bare ids.
 */
const DAY_MS = 86_400_000;
const cache = new Map<string, { at: number; title: string | null; channel: string | null }>();

const Ids = z.array(z.string().regex(/^[A-Za-z0-9_-]{11}$/)).max(50);
const Response = z.object({
  items: z.array(z.object({ id: z.string(), snippet: z.object({ title: z.string(), channelTitle: z.string().optional() }).optional() })).default([]),
});

export type YtTitle = { id: string; title: string | null; channel: string | null };

export async function GET(req: NextRequest) {
  const parsed = Ids.safeParse((req.nextUrl.searchParams.get("ids") ?? "").split(",").filter(Boolean));
  if (!parsed.success) return NextResponse.json({ error: "ids: up to 50 YouTube video ids, comma-separated" }, { status: 400 });
  const ids = [...new Set(parsed.data)];
  const now = Date.now();
  const missing = ids.filter((id) => { const c = cache.get(id); return !c || now - c.at > DAY_MS; });
  const key = process.env.YT_API_KEY;
  if (missing.length && key) {
    try {
      const url = new URL("https://www.googleapis.com/youtube/v3/videos");
      url.searchParams.set("part", "snippet");
      url.searchParams.set("id", missing.join(","));
      url.searchParams.set("key", key);
      const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const found = new Map(Response.parse(await res.json()).items.map((it) => [it.id, it.snippet]));
        for (const id of missing) {
          const s = found.get(id);
          cache.set(id, { at: now, title: s?.title ?? null, channel: s?.channelTitle ?? null });
        }
      }
    } catch (e) {
      console.error("yt titles:", e instanceof Error ? e.message : e);
    }
  }
  const items: YtTitle[] = ids.map((id) => ({ id, title: cache.get(id)?.title ?? null, channel: cache.get(id)?.channel ?? null }));
  return NextResponse.json({ items }, { headers: { "Cache-Control": "private, max-age=3600" } });
}
