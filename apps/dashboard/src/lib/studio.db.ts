/**
 * Studio-grade analytics from Postgres: ChannelDay, VideoStat, Breakdown, LiveSnapshot, Comment and the
 * auditor's AI analysis (RepoDoc aiChannel / aiVideos, from improvement/analysis/). Written by
 * workers/stats.ts (every 3 h), workers/stats-deep.ts (daily) and workers/snapshot.ts (hourly).
 */
import { liveCounters } from "./live-stats";
import { prisma } from "./prisma";
import {
  BREAKDOWNS, AiChannelSchema, AiVideoSchema, DropSchema, sliceLabel,
  type AiVideo, type BreakdownKind, type ContentRow, type Day, type Fmt, type Range, type Slice, type Studio, type VideoStudio,
} from "./studio-schema";
import {
  averageCurve, fillDays, hourlyGains, istSlot, istWeekday, lengthBucket, median, quickVerdict, sumByDay, totalsOf, whatWorks, type Curve,
} from "./studio-calc";
import { z } from "zod";

const DAY_MS = 86_400_000;
const istDay = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
const addDays = (day: string, n: number) => new Date(Date.parse(`${day}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);
const dayKey = (d: Date) => d.toISOString().slice(0, 10);
const media = (id: string, f: string) => `/api/media/${id}/${f}`;

type StatRow = { day: Date; views: number; engagedViews: number; watchMinutes: number; avgViewPct: number; avgViewSec: number; likes: number; comments: number; shares: number; subsGained: number; subsLost: number; impressions: number | null; ctr: number | null };
const toDay = (s: StatRow | (Omit<StatRow, "impressions" | "ctr">)): Day => ({
  day: dayKey(s.day), views: s.views, engagedViews: s.engagedViews, watchMinutes: s.watchMinutes, avgViewPct: s.avgViewPct, avgViewSec: s.avgViewSec,
  likes: s.likes, comments: s.comments, shares: s.shares, subsGained: s.subsGained, subsLost: s.subsLost,
});
const reachOf = (rows: { impressions: number | null; ctr: number | null }[]) => rows.reduce((a, r) => (r.impressions ? { impressions: a.impressions + r.impressions, clicks: a.clicks + r.impressions * (r.ctr ?? 0) } : a), { impressions: 0, clicks: 0 });

/** Tables that only exist after the 2026-11-03 migration: an empty answer until then, never a broken page. */
async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

function slices(rows: { kind: string; key: string; views: number; share: number; watchMinutes: number; extra: unknown }[]): Record<BreakdownKind, Slice[]> {
  const out = Object.fromEntries(BREAKDOWNS.map((k) => [k, [] as Slice[]])) as Record<BreakdownKind, Slice[]>;
  for (const r of rows) {
    if (!(BREAKDOWNS as readonly string[]).includes(r.kind)) continue;
    const kind = r.kind as BreakdownKind;
    const avg = (r.extra as { avgViewPct?: number } | null)?.avgViewPct;
    out[kind].push({ key: r.key, label: sliceLabel(kind, r.key), views: r.views, share: r.share, watchMinutes: r.watchMinutes, avgViewPct: typeof avg === "number" ? avg : null });
  }
  for (const k of BREAKDOWNS) out[k].sort((a, b) => b.views - a.views);
  return out;
}

async function setting(key: string): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return typeof row?.value === "string" ? row.value : null;
}

async function aiDocs(): Promise<{ channel: Studio["ai"]["channel"]; videos: AiVideo[] }> {
  const docs = await prisma.repoDoc.findMany({ where: { key: { in: ["aiChannel", "aiVideos"] } } });
  const ch = AiChannelSchema.safeParse(docs.find((d) => d.key === "aiChannel")?.value);
  const vs = z.object({ videos: z.array(z.unknown()) }).safeParse(docs.find((d) => d.key === "aiVideos")?.value);
  return {
    channel: ch.success ? ch.data : null,
    videos: vs.success ? vs.data.videos.flatMap((v) => { const p = AiVideoSchema.safeParse(v); return p.success ? [p.data] : []; }) : [],
  };
}

const published = (format: Fmt) => ({ deletedAt: null, status: "published" as const, ...(format === "all" ? {} : { format }), upload: { youtubeId: { not: null } } });

type Loaded = Awaited<ReturnType<typeof loadVideos>>[number];
async function loadVideos(format: Fmt) {
  return prisma.video.findMany({ where: published(format), include: { topic: true, upload: { include: { stats: { orderBy: { day: "asc" } } } } } });
}

/** One video's row in the content table, from its daily stats and live counters. */
function contentRow(v: Loaded): Omit<ContentRow, "vs48" | "vsPct" | "verdict"> & { pctRaw: number | null } {
  const u = v.upload!;
  const days = u.stats.map(toDay);
  const t = totalsOf(days);
  const views = Math.max(t.views, u.liveViews ?? 0);
  const reach = reachOf(u.stats);
  const publishDay = istDay(u.publishAt);
  const firstDays = days.filter((d) => d.day >= publishDay && d.day <= addDays(publishDay, 6));
  const ageDays = (Date.now() - u.publishAt.getTime()) / DAY_MS;
  const curve = (u.retention as Curve | null) ?? [];
  return {
    videoId: v.id, title: v.title, thumbnailUrl: media(v.id, "thumbnail"), format: v.format === "long" ? "long" : "short", publishAt: u.publishAt.toISOString(), youtubeId: u.youtubeId,
    durationSec: v.durationSec, views, engagedRatio: t.views > 0 ? t.engagedViews / t.views : null, avgViewPct: t.views > 0 ? t.avgViewPct : null, avgViewSec: t.views > 0 ? t.avgViewSec : null,
    hookHold: u.hookHold, endHold: curve.length ? [...curve].sort((a, b) => a[0] - b[0]).at(-1)![1] : null,
    likes: Math.max(t.likes, u.liveLikes ?? 0), comments: Math.max(t.comments, u.liveComments ?? 0), shares: t.shares, subsNet: t.subsGained - t.subsLost,
    impressions: reach.impressions || null, ctr: reach.impressions ? reach.clicks / reach.impressions : null,
    first7: Array.from({ length: 7 }, (_, i) => days.find((d) => d.day === addDays(publishDay, i))?.views ?? 0),
    views48: ageDays >= 2 && days.length ? firstDays.filter((d) => d.day <= addDays(publishDay, 1)).reduce((a, d) => a + d.views, 0) : null,
    pctRaw: t.views > 0 ? t.avgViewPct : null,
  };
}

/** Rows with their benchmark against the median of their format and a verdict. */
function benchmarked(rows: ReturnType<typeof contentRow>[], ai: Map<string, AiVideo>): ContentRow[] {
  const med = (f: string, k: "views48" | "pctRaw") => median(rows.filter((r) => r.format === f && r[k] !== null).map((r) => r[k]!));
  const m = { short: { v: med("short", "views48"), p: med("short", "pctRaw") }, long: { v: med("long", "views48"), p: med("long", "pctRaw") } };
  return rows.map(({ pctRaw, ...r }) => {
    const vs48 = r.views48 !== null && m[r.format].v ? r.views48 / m[r.format].v! : null;
    const vsPct = pctRaw !== null && m[r.format].p ? pctRaw / m[r.format].p! : null;
    return { ...r, vs48, vsPct, verdict: ai.get(r.videoId)?.verdict ?? quickVerdict(vs48, vsPct) };
  });
}

const ATTRS: Record<string, string> = {
  story: "Story format", look: "Board look", voice: "Narrator voice", genre: "Music", hook: "Hook style", category: "Topic",
  length: "Length", slot: "Upload slot", weekday: "Upload day",
};

function attrsOf(v: Loaded): Record<string, string | null> {
  const script = (v.script ?? {}) as { story?: string; style?: { look?: string | { name?: string } } };
  const style = (v.style ?? {}) as { voice?: string; genre?: string };
  const look = script.style?.look;
  return {
    story: script.story ?? null, look: typeof look === "string" ? look : look?.name ?? null, voice: style.voice ?? null, genre: style.genre ?? null,
    hook: v.hookStyle, category: v.topic.category, length: lengthBucket(v.durationSec, v.format), slot: istSlot(v.upload!.publishAt), weekday: istWeekday(v.upload!.publishAt),
  };
}

export async function getStudio(range: Range, format: Fmt): Promise<Studio> {
  await liveCounters().catch(() => undefined);
  const n = Number(range);
  const [videos, ai, dailyAt, deepAt] = await Promise.all([loadVideos(format), safe(aiDocs(), { channel: null, videos: [] }), setting("statsRefreshedAt"), setting("statsDeepAt")]);
  const aiMap = new Map(ai.videos.map((a) => [a.videoId, a]));

  // ---- day totals: the channel's own (ChannelDay) when stats has written them, else summed from videos
  const channelDays = await safe(prisma.channelDay.findMany({ where: { format }, orderBy: { day: "asc" } }), []);
  const videoDays = sumByDay(videos.flatMap((v) => v.upload!.stats.map(toDay)));
  const source = channelDays.length ? channelDays.map(toDay) : videoDays;
  const lastDay = source.at(-1)?.day ?? null;   // null: no YouTube Analytics yet, which the page shows in red, not as "through yesterday"
  const through = lastDay ?? addDays(istDay(new Date()), -1);
  const from = addDays(through, -(n - 1));
  const daily = fillDays(source.filter((d) => d.day >= from && d.day <= through), from, through);
  const prevDays = source.filter((d) => d.day >= addDays(from, -n) && d.day < from);
  const statRows = videos.flatMap((v) => v.upload!.stats);
  const inRange = (s: { day: Date }, a: string, b: string) => dayKey(s.day) >= a && dayKey(s.day) <= b;
  const totals = totalsOf(daily, reachOf(statRows.filter((s) => inRange(s, from, through))));
  const previous = prevDays.length >= n * 0.8 ? totalsOf(prevDays, reachOf(statRows.filter((s) => inRange(s, addDays(from, -n), addDays(from, -1))))) : null;

  // ---- breakdowns: the stored range for this format, else the all-format one
  const scopes = [`channel:${format}:${range}`, `channel:all:${range}`, `channel:${format}:28`, "channel:all:28"];
  let breakdownScope: string | null = null;
  let bRows: Awaited<ReturnType<typeof prisma.breakdown.findMany>> = [];
  for (const scope of scopes) {
    bRows = await safe(prisma.breakdown.findMany({ where: { scope } }), []);
    if (bRows.length) { breakdownScope = scope; break; }
  }

  // ---- realtime from hourly snapshots
  const now = new Date();
  const end = new Date(Math.floor(now.getTime() / 3_600_000) * 3_600_000 + 3_600_000);
  const snaps = await safe(prisma.liveSnapshot.findMany({ where: { hour: { gte: new Date(end.getTime() - 50 * 3_600_000) }, upload: { video: published(format) } }, orderBy: { hour: "asc" } }), []);
  const byUpload = new Map<string, { hour: Date; views: number }[]>();
  for (const s of snaps) byUpload.set(s.uploadId, [...(byUpload.get(s.uploadId) ?? []), s]);
  const perVideo = videos.map((v) => ({ v, hours: hourlyGains(byUpload.get(v.upload!.id) ?? [], end) }));
  const hours = Array.from({ length: 48 }, (_, i) => perVideo.reduce((a, p) => a + p.hours[i]!, 0));

  const rows = benchmarked(videos.map((v) => contentRow(v)), aiMap).sort((a, b) => b.publishAt.localeCompare(a.publishAt));
  const recent = (f: "short" | "long") => videos.filter((v) => v.format === f && v.upload!.retention).sort((a, b) => b.upload!.publishAt.getTime() - a.upload!.publishAt.getTime()).slice(0, 10);

  const missing: string[] = [];
  if (!statRows.some((s) => s.impressions !== null)) missing.push("impressions");
  if (!snaps.length) missing.push("realtime");
  if (!channelDays.length) missing.push("channelDays");
  if (!breakdownScope) missing.push("breakdowns");

  return {
    range, format, totals, previous, daily,
    breakdowns: slices(bRows), breakdownScope,
    realtime: {
      hours: hours.map((views, i) => ({ hour: new Date(end.getTime() - (48 - i) * 3_600_000).toISOString(), views })),
      last48: hours.reduce((a, b) => a + b, 0), last1: hours.at(-1) ?? 0,
      totalNow: videos.reduce((a, v) => a + (v.upload!.liveViews ?? 0), 0),
      top: perVideo.map((p) => ({ videoId: p.v.id, title: p.v.title, thumbnailUrl: media(p.v.id, "thumbnail"), views48: p.hours.reduce((a, b) => a + b, 0), hours: p.hours }))
        .filter((p) => p.views48 > 0).sort((a, b) => b.views48 - a.views48).slice(0, 6),
      snapshotAt: snaps.at(-1)?.hour.toISOString() ?? null,
    },
    content: rows,
    typicalCurve: { short: averageCurve(recent("short").map((v) => v.upload!.retention as Curve)), long: averageCurve(recent("long").map((v) => v.upload!.retention as Curve)) },
    hookTrend: [...rows].reverse().map((r) => ({ videoId: r.videoId, title: r.title, publishAt: r.publishAt, hookHold: r.hookHold, engagedRatio: r.engagedRatio, avgViewPct: r.avgViewPct })),
    whatWorks: whatWorks(videos.map((v) => {
      const r = rows.find((x) => x.videoId === v.id)!;
      return { attrs: attrsOf(v), avgViewPct: r.avgViewPct, views48: r.views48, engagedRatio: r.engagedRatio, hookHold: r.hookHold };
    }), ATTRS),
    ai: { channel: ai.channel, videos: ai.videos.flatMap((a) => { const v = videos.find((x) => x.id === a.videoId); return v ? [{ ...a, title: v.title, thumbnailUrl: media(v.id, "thumbnail") }] : []; }) },
    refreshed: { daily: dailyAt, deep: deepAt, through: lastDay },
    missing,
  };
}

export async function getVideoStudio(id: string): Promise<VideoStudio | null> {
  const v = await prisma.video.findUnique({ where: { id }, include: { topic: true, upload: { include: { stats: { orderBy: { day: "asc" } } } } } });
  if (!v) return null;
  const format = v.format === "long" ? "long" : "short";
  const u = v.upload;
  const days = (u?.stats ?? []).map(toDay);
  const curve = ((u?.retention as Curve | null) ?? []);
  const [bRows, comments, ai, peers] = await Promise.all([
    safe(prisma.breakdown.findMany({ where: { scope: `video:${id}` } }), []),
    u ? safe(prisma.comment.findMany({ where: { uploadId: u.id }, orderBy: [{ likes: "desc" }, { publishedAt: "desc" }], take: 50 }), []) : Promise.resolve([]),
    safe(aiDocs(), { channel: null, videos: [] }),
    loadVideos(format),
  ]);
  // first 48 hours by hour, and the same for the last 10 of its format
  const firstHours = async (uploadId: string, publishAt: Date) => {
    const snaps = await safe(prisma.liveSnapshot.findMany({ where: { uploadId, hour: { gte: new Date(publishAt.getTime() - 3_600_000), lte: new Date(publishAt.getTime() + 49 * 3_600_000) } } }), []);
    return snaps.length ? hourlyGains([{ hour: new Date(publishAt.getTime() - 3_600_000), views: 0 }, ...snaps], new Date(publishAt.getTime() + 48 * 3_600_000)) : [];
  };
  const hourly = u ? await firstHours(u.id, u.publishAt) : [];
  const others = await Promise.all(peers.filter((p) => p.id !== id).sort((a, b) => b.upload!.publishAt.getTime() - a.upload!.publishAt.getTime()).slice(0, 10).map((p) => firstHours(p.upload!.id, p.upload!.publishAt)));
  const withData = others.filter((h) => h.some((x) => x > 0));
  const typicalHourly = withData.length ? Array.from({ length: 48 }, (_, i) => median(withData.map((h) => h[i] ?? 0)) ?? 0) : [];

  const aiMap = new Map(ai.videos.map((a) => [a.videoId, a]));
  const rows = benchmarked(peers.map((p) => contentRow(p)), aiMap);
  const me = rows.find((r) => r.videoId === id);
  const ranked = [...rows].sort((a, b) => b.views - a.views);
  const drops = z.array(DropSchema).safeParse(u?.drops ?? []);
  return {
    videoId: id, format, durationSec: v.durationSec, previewUrl: media(id, "preview"), published: Boolean(u?.youtubeId && v.status === "published"),
    totals: totalsOf(days, reachOf(u?.stats ?? [])), daily: days,
    curve, relative: ((u?.relRetention as Curve | null) ?? []),
    typical: averageCurve(peers.filter((p) => p.id !== id && p.upload!.retention).slice(0, 10).map((p) => p.upload!.retention as Curve)),
    drops: drops.success ? drops.data : [], hookHold: u?.hookHold ?? null, endHold: curve.length ? [...curve].sort((a, b) => a[0] - b[0]).at(-1)![1] : null,
    breakdowns: slices(bRows),
    hourly, typicalHourly,
    bench: {
      views48: me?.views48 ?? null, median48: median(rows.map((r) => r.views48).filter((x): x is number => x !== null)),
      avgViewPct: me?.avgViewPct ?? null, medianPct: median(rows.map((r) => r.avgViewPct).filter((x): x is number => x !== null)),
      rank: me ? ranked.findIndex((r) => r.videoId === id) + 1 : null, of: rows.length,
    },
    comments: comments.map((c) => ({ id: c.id, author: c.author, text: c.text, likes: c.likes, replies: c.replies, publishedAt: c.publishedAt.toISOString() })),
    ai: aiMap.get(id) ?? null,
  };
}
