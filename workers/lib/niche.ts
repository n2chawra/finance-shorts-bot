/**
 * The niche scan's arithmetic (docs/plans/multi-channel.md, "Research that knows what works before the
 * first upload"): outlier scores per channel, small channels' hits, Shorts vs long, the winning
 * lengths, title patterns, direction and crowding. Pure functions; workers/niche-scan.ts does the I/O.
 */
import { z } from "zod";

export const DAY_MS = 86_400_000;
/** YouTube counts a vertical video up to 3 minutes as a Short. Without the aspect ratio, ≤180 s is the cut. */
export const SHORT_MAX_SEC = 180;
/** A channel under this many subscribers is "small": its hits show what the feed gives strangers. */
export const SMALL_SUBS = 10_000;
/** An outlier: at least this many times its own channel's median. */
export const HIT = 5;

export type Kind = "short" | "long";

export type ScanVideo = {
  id: string; channelId: string; title: string; publishedAt: string; durationSec: number; kind: Kind;
  views: number; likes: number; comments: number;
};
export type ScanChannel = { id: string; title: string; subs: number | null; reference: boolean; foundBy: string[] };

export type ScoredVideo = ScanVideo & {
  ageDays: number; viewsPerDay: number;
  /** views ÷ the median views of the same channel's same-kind videos (null when it has under 3) */
  outlier: number | null;
  small: boolean;
};

export const median = (xs: number[]): number => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
};

export const kindOf = (durationSec: number): Kind => (durationSec > 0 && durationSec <= SHORT_MAX_SEC ? "short" : "long");

/** Outlier scores: each video against its own channel's median for the same kind. */
export function score(videos: ScanVideo[], channels: ScanChannel[], now: Date): ScoredVideo[] {
  const subs = new Map(channels.map((c) => [c.id, c.subs]));
  const medians = new Map<string, number>();
  const groups = new Map<string, number[]>();
  for (const v of videos) {
    const k = `${v.channelId}|${v.kind}`;
    groups.set(k, [...(groups.get(k) ?? []), v.views]);
  }
  for (const [k, xs] of groups) if (xs.length >= 3) medians.set(k, median(xs));
  return videos.map((v) => {
    const ageDays = Math.max(1, (now.getTime() - Date.parse(v.publishedAt)) / DAY_MS);
    const med = medians.get(`${v.channelId}|${v.kind}`);
    const s = subs.get(v.channelId);
    return { ...v, ageDays, viewsPerDay: v.views / ageDays, outlier: med ? v.views / Math.max(med, 1) : null, small: s != null && s < SMALL_SUBS };
  });
}

/** Length bands for each kind, in seconds. */
export const BANDS: Record<Kind, [number, number][]> = {
  short: [[0, 20], [20, 35], [35, 50], [50, 70], [70, 180]],
  long: [[180, 360], [360, 600], [600, 900], [900, 1500], [1500, 1e9]],
};

const bandLabel = ([a, b]: [number, number]) => (b >= 1e9 ? `${a}s+` : `${a}–${b}s`);

/** Title features that channel #1 learned the hard way: a figure, a question, a named subject. */
export function titleFeatures(title: string): { figure: boolean; question: boolean; name: boolean; words: number } {
  const t = title.replace(/#\w+/g, "").trim();
  return {
    figure: /[$€£₹]\s?\d|\d[\d,.]*\s?(k|m|b|bn|million|billion|crore|lakh|%)\b|\b\d{2,}\b/i.test(t),
    question: /\?|^(why|how|what|who|which|when|where|is|are|do|does|can|would)\b/i.test(t),
    // a capitalised word that isn't the first word: a person, a company, a place
    name: /\s[A-Z][a-z]+/.test(t.split(/\s+/).slice(1).join(" ") ? ` ${t.split(/\s+/).slice(1).join(" ")}` : ""),
    words: t.split(/\s+/).filter(Boolean).length,
  };
}

type Group = { n: number; medianOutlier: number | null; hitRate: number | null; medianViews: number };

function group(vs: ScoredVideo[]): Group {
  const scored = vs.filter((v) => v.outlier != null);
  return {
    n: vs.length,
    medianOutlier: scored.length ? round(median(scored.map((v) => v.outlier!))) : null,
    hitRate: scored.length ? round(scored.filter((v) => v.outlier! >= HIT).length / scored.length) : null,
    medianViews: Math.round(median(vs.map((v) => v.views))),
  };
}

const round = (x: number, d = 2) => Math.round(x * 10 ** d) / 10 ** d;

export type KindSummary = {
  videos: number; channels: number;
  medianViews90d: number;
  /** channels under 10K subscribers with a video at 5× their median or more */
  smallChannelsWithHit: number; smallChannels: number;
  hitRate: number | null;
  lengths: (Group & { band: string })[];
  titles: { figure: Group; noFigure: Group; question: Group; noQuestion: Group; name: Group; noName: Group };
  /** IST hour the hits went out: hour → hits */
  hitHoursIst: Record<string, number>;
  /** median posts a week of the channels that had a hit */
  hitChannelsPostsPerWeek: number;
  /** views a day of videos 0–30 days old vs 120–180 days old (median); > 1 rising, < 1 fading */
  direction: number | null;
  /** channels that posted in the last 30 days */
  activeChannels30d: number;
  topIds: string[];
};

export function summarise(scored: ScoredVideo[], kind: Kind, now: Date): KindSummary {
  const vs = scored.filter((v) => v.kind === kind);
  const recent = vs.filter((v) => v.ageDays <= 90);
  const byChannel = new Map<string, ScoredVideo[]>();
  for (const v of vs) byChannel.set(v.channelId, [...(byChannel.get(v.channelId) ?? []), v]);
  const small = [...byChannel.entries()].filter(([, xs]) => xs[0]!.small);
  const hitChannels = [...byChannel.entries()].filter(([, xs]) => xs.some((v) => (v.outlier ?? 0) >= HIT));
  const postsPerWeek = (xs: ScoredVideo[]) => {
    const span = Math.max(7, Math.max(...xs.map((v) => v.ageDays)));
    return (xs.length / span) * 7;
  };
  const feats = vs.map((v) => ({ v, f: titleFeatures(v.title) }));
  const pick = (fn: (f: ReturnType<typeof titleFeatures>) => boolean, want: boolean) => group(feats.filter((x) => fn(x.f) === want).map((x) => x.v));
  const hours: Record<string, number> = {};
  for (const v of vs.filter((x) => (x.outlier ?? 0) >= HIT)) {
    const h = String((new Date(v.publishedAt).getUTCHours() + 5 + (new Date(v.publishedAt).getUTCMinutes() >= 30 ? 1 : 0)) % 24).padStart(2, "0");
    hours[h] = (hours[h] ?? 0) + 1;
  }
  const fresh = vs.filter((v) => v.ageDays <= 30).map((v) => v.viewsPerDay);
  const old = vs.filter((v) => v.ageDays >= 120 && v.ageDays <= 180).map((v) => v.viewsPerDay);
  void now;
  return {
    videos: vs.length, channels: byChannel.size,
    medianViews90d: Math.round(median(recent.map((v) => v.views))),
    smallChannelsWithHit: small.filter(([, xs]) => xs.some((v) => (v.outlier ?? 0) >= HIT)).length,
    smallChannels: small.length,
    hitRate: group(vs).hitRate,
    lengths: BANDS[kind].map((b) => ({ band: bandLabel(b), ...group(vs.filter((v) => v.durationSec > b[0] && v.durationSec <= b[1])) })),
    titles: {
      figure: pick((f) => f.figure, true), noFigure: pick((f) => f.figure, false),
      question: pick((f) => f.question, true), noQuestion: pick((f) => f.question, false),
      name: pick((f) => f.name, true), noName: pick((f) => f.name, false),
    },
    hitHoursIst: hours,
    hitChannelsPostsPerWeek: round(median(hitChannels.map(([, xs]) => postsPerWeek(xs))), 1),
    direction: fresh.length >= 5 && old.length >= 5 ? round(median(fresh) / Math.max(median(old), 0.01)) : null,
    activeChannels30d: [...byChannel.values()].filter((xs) => xs.some((v) => v.ageDays <= 30)).length,
    // hits first, small channels' hits weighted up (they show what the feed gives strangers)
    topIds: [...vs].filter((v) => v.outlier != null).sort((a, b) => weight(b) - weight(a)).slice(0, 30).map((v) => v.id),
  };
}

const weight = (v: ScoredVideo) => (v.outlier ?? 0) * (v.small ? 2 : 1);

/**
 * Topic families: Claude labels the scan's videos (video id → family) and code ranks the families by
 * hit rate and median outlier, small channels weighted double, so the tiers rest on numbers, not on
 * the model's taste. A family needs 5 scored videos to be ranked.
 */
export const FamilyLabels = z.record(z.string(), z.string().min(2).max(80));

export type FamilyRow = { family: string; kind: Kind; n: number; medianOutlier: number | null; hitRate: number | null; medianViews: number; tier: "core" | "low" | "avoid" | "unknown"; examples: string[] };

export function rankFamilies(scored: ScoredVideo[], labels: Record<string, string>): FamilyRow[] {
  const rows: FamilyRow[] = [];
  for (const kind of ["short", "long"] as const) {
    const fams = new Map<string, ScoredVideo[]>();
    for (const v of scored.filter((x) => x.kind === kind)) {
      const f = labels[v.id];
      if (f) fams.set(f, [...(fams.get(f) ?? []), v]);
    }
    for (const [family, vs] of fams) {
      const weighted = vs.flatMap((v) => (v.small ? [v, v] : [v]));
      const g = group(weighted);
      const scoredN = vs.filter((v) => v.outlier != null).length;
      const tier: FamilyRow["tier"] = scoredN < 5 || g.medianOutlier == null ? "unknown"
        : g.medianOutlier >= 1.5 || (g.hitRate ?? 0) >= 0.2 ? "core"
        : g.medianOutlier < 0.7 ? "avoid" : "low";
      rows.push({ family, kind, n: vs.length, medianOutlier: g.medianOutlier, hitRate: g.hitRate, medianViews: g.medianViews, tier,
        examples: [...vs].sort((a, b) => weight(b) - weight(a)).slice(0, 3).map((v) => v.id) });
    }
  }
  const order = { core: 0, low: 1, unknown: 2, avoid: 3 };
  return rows.sort((a, b) => order[a.tier] - order[b.tier] || (b.medianOutlier ?? 0) - (a.medianOutlier ?? 0));
}

/** "https://www.youtube.com/@handle", "/channel/UC…", "/c/name", "/user/name" or a bare "@handle". */
export function parseChannelRef(ref: string): { handle?: string; id?: string; username?: string } | null {
  const s = ref.trim();
  if (/^@[\w.-]{3,}$/.test(s)) return { handle: s };
  let u: URL;
  try { u = new URL(s.startsWith("http") ? s : `https://${s}`); } catch { return null; }
  if (!/(^|\.)youtube\.com$/.test(u.hostname)) return null;
  const [a, b] = u.pathname.split("/").filter(Boolean);
  if (a?.startsWith("@")) return { handle: a };
  if (a === "channel" && b?.startsWith("UC")) return { id: b };
  if ((a === "c" || a === "user") && b) return { username: b };
  return null;
}

/** ISO 8601 duration ("PT1M5S") to seconds. */
export function isoSeconds(iso: string): number {
  const m = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 86400 + Number(m[2] ?? 0) * 3600 + Number(m[3] ?? 0) * 60 + Number(m[4] ?? 0);
}
