/**
 * Every channel's numbers in one pass, unscoped (prismaAll: server-side only). Five queries for all
 * channels together: the channels, their day totals (ChannelDay, 12 months), the videos published in the
 * last 90 days with their summed stats, the per-channel counts, and the agents' weekly-loop docs.
 */
import { docKey } from "./channel-scopes";
import { istToday, median, runningId, type Portfolio, type PortfolioChannel, type PortfolioVideo, type Today, todaySlots, verdictOf } from "./portfolio";
import { prismaAll as db } from "./prisma";
import { upcomingSlots } from "./slots";

const DAY = 86_400_000;
const key = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (day: string, k: number) => key(new Date(Date.parse(`${day}T00:00:00Z`) + k * DAY));
const ratio = (a: number, b: number) => (b > 0 ? a / b : null);

type Day = { channelId: string; day: Date; format: string; views: number; engagedViews: number; avgViewPct: number; watchMinutes: number; subsGained: number; subsLost: number };
type VidRow = { id: string; channelId: string; title: string; format: string; publishAt: Date; youtubeId: string | null; liveViews: number | null; views: number; engaged: number };

export async function getPortfolio(): Promise<Portfolio> {
  const now = Date.now();
  const since365 = new Date(now - 366 * DAY);
  const since90 = new Date(now - 90 * DAY);
  // today in IST, padded an hour each side so an upload just off a slot still matches it
  const dayStart = Date.parse(`${istToday(now).day}T00:00:00+05:30`);
  const todayFrom = new Date(dayStart - 3_600_000), todayTo = new Date(dayStart + DAY + 3_600_000);
  const [channels, days, vids, counts, firsts, upcoming, platform, docs, todays, last24] = await Promise.all([
    db.channel.findMany({ where: { status: { not: "deleting" } }, orderBy: { createdAt: "asc" }, select: { id: true, name: true, status: true, settings: true } }),
    db.channelDay.findMany({ where: { day: { gte: since365 } }, orderBy: { day: "asc" },
      select: { channelId: true, day: true, format: true, views: true, engagedViews: true, avgViewPct: true, watchMinutes: true, subsGained: true, subsLost: true } }) as Promise<Day[]>,
    db.$queryRaw<VidRow[]>`
      SELECT v.id, v."channelId", v.title, v.format, u."publishAt", u."youtubeId", u."liveViews",
        COALESCE(SUM(s.views), 0)::float8 AS views, COALESCE(SUM(s."engagedViews"), 0)::float8 AS engaged
      FROM "Video" v JOIN "Upload" u ON u."videoId" = v.id LEFT JOIN "VideoStat" s ON s."uploadId" = u.id
      WHERE v."deletedAt" IS NULL AND v.status = 'published' AND u."youtubeId" IS NOT NULL AND u."publishAt" >= ${since90}
      GROUP BY v.id, u.id`,
    db.video.groupBy({ by: ["channelId", "status", "format"], where: { deletedAt: null, status: { in: ["queued", "published"] } }, _count: true }),
    db.$queryRaw<{ channelId: string; first: Date }[]>`
      SELECT v."channelId", MIN(u."publishAt") AS first FROM "Video" v JOIN "Upload" u ON u."videoId" = v.id
      WHERE v."deletedAt" IS NULL AND v.status = 'published' AND u."youtubeId" IS NOT NULL GROUP BY 1`,
    db.$queryRaw<{ channelId: string; publishAt: Date; title: string; format: string }[]>`
      SELECT DISTINCT ON (v."channelId") v."channelId", u."publishAt", v.title, v.format FROM "Video" v JOIN "Upload" u ON u."videoId" = v.id
      WHERE v."deletedAt" IS NULL AND u.state IN ('pending', 'uploaded', 'scheduled') AND u."publishAt" > now()
      ORDER BY v."channelId", u."publishAt"`,
    db.setting.findMany({ where: { key: { in: ["uploadTimes", "longUploadTimes", "longUploadDays", "uploadsPaused"] } } }),
    db.repoDoc.findMany({ where: { key: { contains: "cycle" } }, select: { key: true, value: true } }),
    db.$queryRaw<{ channelId: string; publishAt: Date; state: string; youtubeId: string | null; title: string; format: string; views: number | null }[]>`
      SELECT v."channelId", u."publishAt", u.state::text AS state, u."youtubeId", v.title, v.format, u."liveViews" AS views
      FROM "Video" v JOIN "Upload" u ON u."videoId" = v.id
      WHERE v."deletedAt" IS NULL AND u."publishAt" >= ${todayFrom} AND u."publishAt" < ${todayTo}`,
    // views in the last 24 h: each video's latest hourly snapshot minus its last one 24 h or more ago (a
    // video published since then counts in full; one with no snapshot that old counts nothing)
    db.$queryRaw<{ channelId: string; views: number }[]>`
      SELECT v."channelId", SUM(GREATEST(cur.views - COALESCE(prev.views, CASE WHEN u."publishAt" >= now() - interval '24 hours' THEN 0 ELSE cur.views END), 0))::float8 AS views
      FROM "Video" v JOIN "Upload" u ON u."videoId" = v.id
      JOIN LATERAL (SELECT views FROM "LiveSnapshot" WHERE "uploadId" = u.id AND hour >= now() - interval '24 hours' ORDER BY hour DESC LIMIT 1) cur ON true
      LEFT JOIN LATERAL (SELECT views FROM "LiveSnapshot" WHERE "uploadId" = u.id AND hour <= now() - interval '24 hours' ORDER BY hour DESC LIMIT 1) prev ON true
      WHERE v."deletedAt" IS NULL GROUP BY 1`,
  ]);
  const plat = Object.fromEntries(platform.map((s) => [s.key, s.value])) as Record<string, unknown>;
  const doc = new Map(docs.map((d) => [d.key, d.value as Record<string, unknown> | null]));

  // the comparison chart: 28 days ending at the latest day any channel's Analytics reached
  const allDays = days.filter((d) => d.format === "all");
  const lastDay = allDays.length ? key(allDays[allDays.length - 1].day) : null;
  const chartDays = lastDay ? Array.from({ length: 28 }, (_, i) => addDays(lastDay, i - 27)) : [];
  const daily: Record<string, (number | null)[]> = {};

  const today: Today[] = [];
  const out: PortfolioChannel[] = channels.map((ch) => {
    const own = (ch.settings ?? {}) as Record<string, unknown>;
    const setup = own.setup as { stage?: string } | undefined;
    const healthRaw = own.health as PortfolioChannel["health"] | undefined;
    const health = healthRaw && ["green", "amber", "red"].includes(healthRaw.color) ? { color: healthRaw.color, reason: String(healthRaw.reason ?? ""), at: healthRaw.at } : null;
    const live = ch.status === "active" || ch.status === "paused";

    const mine = days.filter((d) => d.channelId === ch.id);
    const byFmt = (f: string) => new Map(mine.filter((d) => d.format === f).map((d) => [key(d.day), d]));
    const all = byFmt("all"), short = byFmt("short"), long = byFmt("long");
    const through = all.size ? [...all.keys()].sort().at(-1)! : null;
    const firstDay = all.size ? [...all.keys()].sort()[0] : null;
    const span = (m: Map<string, Day>, from: number, to: number, f: (d: Day) => number) => {
      if (!through) return null;
      let s = 0;
      for (let i = from; i <= to; i++) { const d = m.get(addDays(through, -i)); if (d) s += f(d); }
      return s;
    };
    const views = (d: Day) => d.views, net = (d: Day) => d.subsGained - d.subsLost;
    const views28 = span(all, 0, 27, views), subs28 = span(all, 0, 27, net);
    const shortViews28 = span(short, 0, 27, views) ?? 0;
    const weighted = (m: Map<string, Day>) => { const v = span(m, 0, 27, views) ?? 0; return v > 0 ? (span(m, 0, 27, (d) => d.avgViewPct * d.views) ?? 0) / v : null; };

    daily[ch.id] = chartDays.map((day) => (!through || !firstDay || day > through || day < firstDay ? null : all.get(day)?.views ?? 0));

    const videos: PortfolioVideo[] = vids.filter((v) => v.channelId === ch.id).map((v) => {
      const statViews = Number(v.views);
      return { id: v.id, title: v.title, format: v.format, publishAt: v.publishAt.toISOString(), youtubeId: v.youtubeId,
        views: v.liveViews ?? statViews, stayed: v.format === "short" && statViews > 0 ? Math.round((Number(v.engaged) / statViews) * 1000) / 1000 : null };
    });
    const age = (v: PortfolioVideo) => (now - Date.parse(v.publishAt)) / DAY;
    const shortsIn = (lo: number, hi: number) => videos.filter((v) => v.format === "short" && age(v) >= lo && age(v) < hi);
    const recent = shortsIn(2, 14), base = shortsIn(15, 42), last28 = shortsIn(0, 28);
    const byViews = (a: PortfolioVideo, b: PortfolioVideo) => b.views - a.views;
    const week = videos.filter((v) => age(v) < 7);
    const count = (status: string, format: string) => counts.find((c) => c.channelId === ch.id && c.status === status && c.format === format)?._count ?? 0;
    const publishedTotal = count("published", "short") + count("published", "long");
    const first = firsts.find((f) => f.channelId === ch.id)?.first ?? null;
    const daysLive = first ? Math.floor((now - first.getTime()) / DAY) : null;

    const pick = <T,>(k: string, d: T): T => (own[k] ?? plat[k] ?? d) as T;
    const uploadsPaused = Boolean(pick("uploadsPaused", false));
    const backlog = { short: count("queued", "short"), long: count("queued", "long") };
    const up = upcoming.find((u) => u.channelId === ch.id);
    let nextUpload: PortfolioChannel["nextUpload"] = up ? { at: up.publishAt.toISOString(), kind: "scheduled", title: up.title, format: up.format } : null;
    if (!nextUpload && live && !uploadsPaused && backlog.short > 0) {
      const at = upcomingSlots(now, pick<string[]>("uploadTimes", []), 1)[0];
      if (at) nextUpload = { at: new Date(at).toISOString(), kind: "slot", title: null, format: "short" };
    }

    const st = doc.get(docKey("cycleStatus", ch.id)) as { experiment?: { id?: string; description?: string | null } | null; cycle?: number | null } | null | undefined;
    const bl = doc.get(docKey("cycleBacklog", ch.id)) as { running?: unknown; cycle?: number; history?: { id?: unknown; verdict?: unknown; test?: unknown }[] } | null | undefined;
    const text = (x: unknown) => (typeof x === "string" ? x : null);
    const lastDone = [...(Array.isArray(bl?.history) ? bl!.history! : [])].reverse().find((h) => text(h?.verdict) && text(h?.id));
    const blRunning = bl?.running && typeof bl.running === "object" ? (bl.running as { test?: unknown }) : null;
    const loop = st || bl ? {
      running: text(st?.experiment?.id) ?? runningId(bl?.running),
      description: text(st?.experiment?.description) ?? text(blRunning?.test),
      cycle: typeof st?.cycle === "number" ? st.cycle : typeof bl?.cycle === "number" ? bl.cycle : null,
      lastVerdict: lastDone ? { id: text(lastDone.id)!, verdict: text(lastDone.verdict)!, test: text(lastDone.test) } : null,
    } : null;

    if (live) {
      const ups = todays.filter((u) => u.channelId === ch.id).map((u) => ({ publishAt: u.publishAt.getTime(), state: u.state, youtubeId: u.youtubeId, title: u.title, format: u.format, views: u.views }));
      const slots = todaySlots(now, { uploadTimes: pick<string[]>("uploadTimes", []), longUploadTimes: pick<string[]>("longUploadTimes", []), longUploadDays: pick<number[]>("longUploadDays", []), uploadsPaused, live }, ups);
      const v24 = last24.find((r) => r.channelId === ch.id);
      today.push({ channelId: ch.id, views24h: v24 ? Number(v24.views) : null, slots });
    }

    const c = {
      views7: span(all, 0, 6, views), viewsPrev7: span(all, 7, 13, views), subs7: span(all, 0, 6, net), subsPrev7: span(all, 7, 13, net),
      medianShort14: median(recent.map((v) => v.views)), medianShortBase: median(base.map((v) => v.views)),
    };
    return {
      id: ch.id, name: ch.name, status: ch.status, stage: live ? null : setup?.stage ?? ch.status, health, statsThrough: through,
      subs: all.size ? [...all.values()].reduce((a, d) => a + net(d), 0) : null, subs28, views28, ...c,
      spark: through ? Array.from({ length: 28 }, (_, i) => all.get(addDays(through, i - 27))?.views ?? 0) : [],
      published7: week.length, publishedTotal, firstPublishAt: first?.toISOString() ?? null, shorts14: recent.length,
      stayed28: shortViews28 > 0 ? (span(short, 0, 27, (d) => d.engagedViews) ?? 0) / shortViews28 : null,
      pctShort28: weighted(short), pctLong28: weighted(long),
      viewsPerShort: last28.length ? last28.reduce((a, v) => a + v.views, 0) / last28.length : null,
      subsPer1k: views28 && subs28 !== null ? (ratio(subs28, views28) ?? 0) * 1000 : null,
      best7: [...week].sort(byViews)[0] ?? null,
      top14: videos.filter((v) => age(v) < 14).sort(byViews).slice(0, 3),
      backlog, nextUpload, uploadsPaused, loop,
      ypp: {
        subs: all.size ? [...all.values()].reduce((a, d) => a + net(d), 0) : null,
        watchHoursLong365: long.size ? [...long.values()].reduce((a, d) => a + d.watchMinutes, 0) / 60 : null,
        shortsViews90: through ? span(short, 0, 89, views) : null,
      },
      verdict: live ? verdictOf({ ...c, publishedTotal, daysLive }) : { call: "Setting up", why: `In setup: ${setup?.stage ?? ch.status}` },
    };
  });
  return { source: "database", generatedAt: new Date(now).toISOString(), days: chartDays, daily, channels: out, today };
}
