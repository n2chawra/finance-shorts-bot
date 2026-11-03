/**
 * Studio-grade analytics (owner, 2026-11-03: "everything I can see in Studio, on the dashboard"):
 * which breakdowns we ask YouTube Analytics for, and the pure functions that turn its rows into our
 * tables. Network calls live in stats.ts / stats-deep.ts; everything here is tested directly.
 */
import { dayStat, type DayStat, type Row } from "./youtube.ts";

export type Format = "all" | "short" | "long";

/** One breakdown query: what to group by, what to measure, optional filter and how many rows. */
export type Kind = { kind: string; dimensions: string; metrics: string; filter?: string; top?: number; perVideo?: boolean };

/** Every breakdown the dashboard shows. `perVideo` ones are also fetched for each video (age and
 * gender is channel-only: YouTube hides it per video below a privacy threshold). */
export const KINDS: Kind[] = [
  { kind: "traffic", dimensions: "insightTrafficSourceType", metrics: "views,estimatedMinutesWatched", perVideo: true },
  { kind: "search", dimensions: "insightTrafficSourceDetail", metrics: "views,estimatedMinutesWatched", filter: "insightTrafficSourceType==YT_SEARCH", top: 25, perVideo: true },
  { kind: "suggested", dimensions: "insightTrafficSourceDetail", metrics: "views,estimatedMinutesWatched", filter: "insightTrafficSourceType==RELATED_VIDEO", top: 25, perVideo: true },
  { kind: "external", dimensions: "insightTrafficSourceDetail", metrics: "views,estimatedMinutesWatched", filter: "insightTrafficSourceType==EXT_URL", top: 25, perVideo: true },
  { kind: "country", dimensions: "country", metrics: "views,estimatedMinutesWatched,averageViewPercentage", top: 25, perVideo: true },
  { kind: "ageGender", dimensions: "ageGroup,gender", metrics: "viewerPercentage" },
  { kind: "device", dimensions: "deviceType", metrics: "views,estimatedMinutesWatched", perVideo: true },
  { kind: "os", dimensions: "operatingSystem", metrics: "views", top: 10 },
  { kind: "subscribed", dimensions: "subscribedStatus", metrics: "views,estimatedMinutesWatched,averageViewPercentage", perVideo: true },
  { kind: "sharing", dimensions: "sharingService", metrics: "shares", top: 15, perVideo: true },
];

/** YouTube's creatorContentType values per our format (lowercase is what the filter accepts). */
export const CONTENT_TYPE: Record<Exclude<Format, "all">, string> = { short: "shorts", long: "videoOnDemand" };

/** The query parameters of a breakdown, for the channel (optionally one format) or one video. */
export function queryOf(k: Kind, opts: { startDate: string; endDate: string; video?: string; format?: Format }): Record<string, string> {
  const filters = [opts.video ? `video==${opts.video}` : "", opts.format && opts.format !== "all" ? `creatorContentType==${CONTENT_TYPE[opts.format]}` : "", k.filter ?? ""].filter(Boolean);
  const first = k.metrics.split(",")[0]!;
  return {
    startDate: opts.startDate, endDate: opts.endDate, dimensions: k.dimensions, metrics: k.metrics,
    ...(filters.length ? { filters: filters.join(";") } : {}),
    ...(k.top ? { sort: `-${first}`, maxResults: String(k.top) } : {}),
  };
}

export type BreakdownRow = { key: string; views: number; watchMinutes: number; share: number; extra: Record<string, number> | null };

/** Rows of a breakdown query as our rows: the key (dimensions joined by "|"), its views (or shares,
 * or viewer %), watch minutes and its share of the total (0..1). */
export function breakdownRows(k: Kind, rows: Row[]): BreakdownRow[] {
  const dims = k.dimensions.split(",");
  const first = k.metrics.split(",")[0]!;
  const value = (r: Row) => Number(r[first] ?? 0) || 0;
  const total = rows.reduce((a, r) => a + value(r), 0);
  return rows
    .map((r) => {
      const v = value(r);
      const avg = r.averageViewPercentage;
      return {
        key: dims.map((d) => String(r[d] ?? "")).join("|"),
        views: v, watchMinutes: Number(r.estimatedMinutesWatched ?? 0) || 0,
        share: first === "viewerPercentage" ? v / 100 : total > 0 ? v / total : 0,
        extra: avg !== undefined ? { avgViewPct: Number(avg) || 0 } : null,
      };
    })
    .filter((r) => r.key && r.views > 0)
    .sort((a, b) => b.views - a.views);
}

export type ChannelDayRow = DayStat & { format: Format };

/** Channel day totals: the all-format rows as they are, the per-content-type rows mapped to our formats
 * (live streams and posts are only in "all"). */
export function channelDays(all: Row[], split: Row[]): Omit<ChannelDayRow, never>[] {
  const out: ChannelDayRow[] = all.map((r) => ({ ...dayStat(r), format: "all" }));
  for (const r of split) {
    const t = String(r.creatorContentType ?? "");
    const format = t === "shorts" ? "short" : t === "videoOnDemand" ? "long" : null;
    if (format) out.push({ ...dayStat(r), format });
  }
  return out;
}

/** The date `days` back from `end` (YYYY-MM-DD, inclusive range). */
export function rangeStart(end: string, days: number): string {
  const d = new Date(`${end}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - (days - 1));
  return d.toISOString().slice(0, 10);
}

// ---- the Reporting API's reach report: thumbnail impressions and click-through ----

/** A CSV of the Reporting API (header row, comma-separated, no quoted commas in these reports). */
export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  const head = (lines.shift() ?? "").split(",");
  return lines.filter(Boolean).map((l) => {
    const cells = l.split(",");
    return Object.fromEntries(head.map((h, i) => [h, cells[i] ?? ""]));
  });
}

export type Reach = { youtubeId: string; day: string; impressions: number; ctr: number };

/** Impressions and click-through per video and day from a reach report's rows. Column names are found
 * by what they contain, so a renamed column ("video_thumbnail_impressions", "…_ctr") still reads. */
export function reachRows(rows: Record<string, string>[]): Reach[] {
  if (!rows.length) return [];
  const cols = Object.keys(rows[0]!);
  const imp = cols.find((c) => /impressions$/.test(c));
  const ctr = cols.find((c) => /impressions_ctr$|ctr$/.test(c) && c !== imp);
  if (!imp || !cols.includes("video_id") || !cols.includes("date")) return [];
  const sum = new Map<string, { i: number; clicks: number }>();
  for (const r of rows) {
    const d = r.date!;
    const key = `${r.video_id}|${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
    const i = Number(r[imp]) || 0;
    const c = ctr ? Number(r[ctr]) || 0 : 0;
    const prev = sum.get(key) ?? { i: 0, clicks: 0 };
    sum.set(key, { i: prev.i + i, clicks: prev.clicks + i * c });
  }
  return [...sum].map(([k, v]) => {
    const [youtubeId, day] = k.split("|") as [string, string];
    return { youtubeId, day, impressions: v.i, ctr: v.i > 0 ? v.clicks / v.i : 0 };
  });
}
