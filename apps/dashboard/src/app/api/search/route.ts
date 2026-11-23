import { NextRequest, NextResponse } from "next/server";

import { channelBrand } from "@/lib/channel-brand";
import { prismaAll as db } from "@/lib/prisma";
import { matches, type SearchResult, SearchQuerySchema } from "@/lib/search";
import { sampleSearch } from "@/lib/search.sample";

export const dynamic = "force-dynamic";

/** The command palette's search: channels by name and videos by title or id on every channel
 * (unscoped, so the palette can switch channel). Auth is the middleware's, like every /api route. */
export async function GET(req: NextRequest) {
  const parsed = SearchQuerySchema.safeParse({ q: req.nextUrl.searchParams.get("q") ?? "" });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { q } = parsed.data;
  if (!process.env.DATABASE_URL) return NextResponse.json(sampleSearch(q) satisfies SearchResult);

  const [chans, rows] = await Promise.all([
    db.channel.findMany({ where: { status: { not: "deleting" } }, select: { id: true, name: true, status: true } }),
    db.video.findMany({
      where: { deletedAt: null, OR: [{ title: { contains: q, mode: "insensitive" } }, { id: { contains: q, mode: "insensitive" } }] },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true, title: true, status: true, format: true, channelId: true,
        upload: { select: { liveViews: true, stats: { select: { views: true } } } },
      },
    }),
  ]);
  const nameOf = (id: string, stored?: string) => channelBrand(id, stored).name;
  const names = new Map(chans.map((c) => [c.id, nameOf(c.id, c.name)]));
  const result: SearchResult = {
    channels: chans.map((c) => ({ id: c.id, name: nameOf(c.id, c.name), status: c.status })).filter((c) => matches(q, c.name, c.id)),
    videos: rows.filter((v) => names.has(v.channelId)).map((v) => ({
      id: v.id, title: v.title, status: v.status, format: v.format, channelId: v.channelId,
      channelName: names.get(v.channelId) ?? v.channelId,
      // the live public counter where there is one, else Analytics' daily views summed
      views: v.upload ? (v.upload.liveViews ?? v.upload.stats.reduce((a, s) => a + s.views, 0)) : null,
    })),
  };
  return NextResponse.json(result);
}
