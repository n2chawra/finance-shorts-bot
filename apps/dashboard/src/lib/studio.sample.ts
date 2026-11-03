/**
 * Sample Studio analytics for running the dashboard without a database. Shapes and proportions follow the
 * channel's real October numbers (≈36% engaged views, India / US / Philippines first, phones ≈ 85%),
 * generated deterministically from the sample store's published videos.
 */
import { listVideos } from "./store.sample";
import {
  BREAKDOWNS, sliceLabel,
  type AiVideo, type BreakdownKind, type ContentRow, type Day, type Fmt, type Range, type Slice, type Studio, type VideoStudio,
} from "./studio-schema";
import { averageCurve, fillDays, median, quickVerdict, sumByDay, totalsOf, whatWorks, type Curve } from "./studio-calc";

const DAY_MS = 86_400_000;
const istDay = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
const addDays = (day: string, n: number) => new Date(Date.parse(`${day}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);

function rng(seed: string): () => number {
  let a = [...seed].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type SV = { id: string; thumb: string; preview: string; title: string; format: "short" | "long"; publishAt: Date; durationSec: number; quality: number; story: string; voice: string; hook: string; genre: string; category: string };

function videos(): SV[] {
  const today = Date.now();
  return listVideos({ status: "published" }).map((v, i) => {
    const r = rng(v.id);
    const publishAt = v.upload?.publishAt ? new Date(v.upload.publishAt) : new Date(today - (i + 1) * 0.6 * DAY_MS);
    return {
      id: v.id, thumb: v.thumbnailUrl, preview: v.previewUrl, title: v.title, format: v.format, publishAt, durationSec: v.durationSec || 62,
      quality: 0.35 + r() * 1.6, story: ["how they make money", "rich vs poor", "trap", "salary breakdown", "what the rich know"][Math.floor(r() * 5)]!,
      voice: v.style.voice ?? ["af_heart", "am_puck", "bf_emma", "hf_alpha"][Math.floor(r() * 4)]!, hook: ["question", "shock number", "myth", "secret"][Math.floor(r() * 4)]!,
      genre: v.style.genre, category: v.topic.category,
    };
  });
}

function daysOf(v: SV, through: string): Day[] {
  const r = rng(`${v.id}d`);
  const start = istDay(v.publishAt);
  const out: Day[] = [];
  for (let d = start, k = 0; d <= through; d = addDays(d, 1), k++) {
    const views = Math.round(v.quality * (k === 0 ? 120 : k === 1 ? 260 : 220 * Math.exp(-0.35 * (k - 1))) * (0.7 + r() * 0.6));
    const pct = Math.min(95, 38 + v.quality * 14 + r() * 6);
    out.push({
      day: d, views, engagedViews: Math.round(views * (0.28 + v.quality * 0.06)), watchMinutes: (views * v.durationSec * pct) / 100 / 60,
      avgViewPct: pct, avgViewSec: (v.durationSec * pct) / 100, likes: Math.round(views * 0.009 * v.quality), comments: r() < 0.08 ? 1 : 0,
      shares: r() < 0.25 ? 1 : 0, subsGained: Math.round(views * 0.0012 * v.quality + (r() < 0.3 ? 1 : 0)), subsLost: r() < 0.06 ? 1 : 0,
    });
  }
  return out;
}

function curveOf(v: SV): Curve {
  const r = rng(`${v.id}c`);
  const cliffs = [0.12 + r() * 0.1, 0.45 + r() * 0.2];
  let y = 1.1 + v.quality * 0.08;
  return Array.from({ length: 100 }, (_, i) => {
    const x = (i + 1) / 100;
    y -= 0.004 + (cliffs.some((c) => Math.abs(c - x) < 0.025) ? 0.03 / v.quality : 0) + (x < 0.05 ? 0.025 : 0);
    return [x, Math.round(Math.max(0.15, y) * 1000) / 1000] as [number, number];
  });
}

const BASE: Record<BreakdownKind, [string, number, number?][]> = {
  traffic: [["SHORTS", 8100], ["YT_SEARCH", 286], ["YT_CHANNEL", 274], ["YT_OTHER_PAGE", 89], ["EXT_URL", 33], ["SUBSCRIBER", 18], ["RELATED_VIDEO", 3]],
  search: [["money savings", 5], ["how billionaires avoid tax", 4], ["buying gold", 2], ["mcdonalds real estate", 2], ["buy borrow die", 2], ["salary breakdown", 1]],
  suggested: [["AiWTR_G5Qkk", 3], ["7jcAqx7huGU", 1], ["crYTZWm0WaE", 1]],
  external: [["WhatsApp", 16], ["instagram.com", 13], ["Google Search", 3], ["Chrome", 1]],
  country: [["IN", 2077, 45.9], ["US", 742, 46.8], ["PH", 729, 50.7], ["ID", 515, 48.2], ["GB", 376, 51.3], ["NL", 304, 44.1], ["DE", 288, 36.9], ["CA", 221, 52.4], ["PK", 190, 41.2], ["NG", 160, 55.0], ["AE", 140, 47.7], ["AU", 120, 53.1]],
  ageGender: [["age13-17|male", 10.1], ["age18-24|male", 15.1], ["age18-24|female", 4.2], ["age25-34|female", 5.5], ["age25-34|male", 31.8], ["age35-44|female", 10.5], ["age35-44|male", 15.6], ["age45-54|male", 7.2]],
  device: [["MOBILE", 9260], ["TABLET", 1234], ["DESKTOP", 354], ["TV", 208]],
  os: [["ANDROID", 8690], ["IOS", 1876], ["WINDOWS", 302], ["SMART_TV", 62]],
  subscribed: [["UNSUBSCRIBED", 11034, 52.8], ["SUBSCRIBED", 64, 30.0]],
  sharing: [["WHATS_APP", 3], ["COPY_PASTE", 2], ["OTHER", 1]],
};

function breakdowns(scale: number): Record<BreakdownKind, Slice[]> {
  return Object.fromEntries(BREAKDOWNS.map((k) => {
    const rows = BASE[k];
    const total = rows.reduce((a, r) => a + r[1], 0);
    return [k, rows.map(([key, v, pct]) => ({
      key, label: sliceLabel(k, key), views: k === "ageGender" ? v : Math.max(1, Math.round(v * scale)), share: k === "ageGender" ? v / 100 : v / total,
      watchMinutes: Math.round(v * scale * 0.13), avgViewPct: pct ?? null,
    }))];
  })) as Record<BreakdownKind, Slice[]>;
}

const AI_VIDEOS = (vs: SV[]): AiVideo[] => vs.slice(0, 6).map((v, i) => ({
  videoId: v.id, verdict: v.quality > 1.3 ? "hit" : v.quality < 0.7 ? "miss" : "okay",
  headline: v.quality > 1.3 ? "The Shorts feed kept pushing it: 1 in 2 viewers stayed past the hook" : v.quality < 0.7 ? "Lost a third of viewers in the first 3 seconds" : "Held well, but the turn at 0:24 lost viewers",
  why: [
    { text: `${Math.round(40 + v.quality * 15)}% viewed against a 47% median for Shorts`, metric: "avgViewPct", tab: "engagement" },
    { text: `Biggest drop at 0:0${3 + i}: "${["So how does it work?", "Picture one restaurant", "But here's the catch", "Clue two: every sale"][i % 4]}"`, metric: "retention", tab: "engagement" },
    { text: `${Math.round(70 + v.quality * 8)}% of views came from the Shorts feed`, metric: "traffic", tab: "reach" },
  ],
  viewersSaid: i % 2 ? ["Asked for a part 2 on the same company", "One viewer doubted the 15% figure"] : [],
  next: v.quality > 1.3 ? "Keep the one-person story and the number in the first line." : "Open on the answer's surprise, not a question about it; cut the warm-up beat.",
  writtenAt: new Date(Date.now() - 20 * 3_600_000).toISOString(),
}));

const AI_CHANNEL: Studio["ai"]["channel"] = {
  headline: "Big-money stories about famous companies get 2.4× the views of personal-budget ones, and hold 9 points better.",
  working: [
    { text: "\"How they make money\" Shorts: median 52% viewed (n=6) against 44% for the rest", metric: "whatWorks", tab: "works" },
    { text: "The 19:07 slot: 1.6× the 48-hour views of 12:37 (n=9 each)", metric: "slot", tab: "works" },
  ],
  notWorking: [
    { text: "Shorts lose 24% of viewers in the first 3 seconds; the Shorts feed decides on that moment", metric: "hookHold", tab: "engagement" },
    { text: "Only 36% of views are engaged views: most people swipe before the promise lands", metric: "engagedRatio", tab: "engagement" },
  ],
  audience: [
    { text: "India 19% of views, but the US watches 4 points longer per view", metric: "country", tab: "audience" },
    { text: "Men 25–34 are 32% of viewers; women under 10% in every age group", metric: "ageGender", tab: "audience" },
  ],
  recommendations: [
    { do: "Open every Short on the surprising number, said in the first 2 seconds", because: "hook hold rises from 0.76 to 0.84 on the 5 Shorts that did it" },
    { do: "Put long videos and the 19:07 Short on US-friendly topics", because: "US viewers watch longest and the evening slot reaches them" },
    { do: "Answer the top search term with a Short: \"how billionaires avoid tax\"", because: "it is our #2 search term with no video on it" },
  ],
  writtenAt: new Date(Date.now() - 20 * 3_600_000).toISOString(),
};

function rows(vs: SV[], through: string): (ContentRow & { _days: Day[] })[] {
  const raw = vs.map((v) => {
    const days = daysOf(v, through);
    const t = totalsOf(days);
    const curve = curveOf(v);
    const r = rng(`${v.id}r`);
    const imp = Math.round(t.views * (2.2 + r()));
    const pub = istDay(v.publishAt);
    return {
      videoId: v.id, title: v.title, thumbnailUrl: v.thumb, format: v.format, publishAt: v.publishAt.toISOString(), youtubeId: null,
      durationSec: v.durationSec, views: t.views, engagedRatio: t.views ? t.engagedViews / t.views : null, avgViewPct: t.views ? t.avgViewPct : null, avgViewSec: t.views ? t.avgViewSec : null,
      hookHold: Math.round((0.62 + v.quality * 0.14) * 1000) / 1000, endHold: curve.at(-1)![1], likes: t.likes, comments: t.comments, shares: t.shares, subsNet: t.subsGained - t.subsLost,
      impressions: imp, ctr: 0.03 + r() * 0.05, first7: Array.from({ length: 7 }, (_, i) => days.find((d) => d.day === addDays(pub, i))?.views ?? 0),
      views48: days.length >= 2 ? days[0]!.views + days[1]!.views : null, _days: days,
    };
  });
  const med = (f: string, k: "views48" | "avgViewPct") => median(raw.filter((x) => x.format === f && x[k] !== null).map((x) => x[k]!));
  return raw.map((x) => {
    const vs48 = x.views48 !== null ? x.views48 / (med(x.format, "views48") || 1) : null;
    const vsPct = x.avgViewPct !== null ? x.avgViewPct / (med(x.format, "avgViewPct") || 1) : null;
    return { ...x, vs48, vsPct, verdict: quickVerdict(vs48, vsPct) };
  });
}

export function getStudio(range: Range, format: Fmt): Studio {
  const all = videos();
  const vs = all.filter((v) => format === "all" || v.format === format);
  const through = addDays(istDay(new Date()), -1);
  const n = Number(range);
  const content = rows(vs, through);
  const days = sumByDay(content.flatMap((c) => c._days));
  const from = addDays(through, -(n - 1));
  const daily = fillDays(days.filter((d) => d.day >= from), from, through);
  const prev = fillDays(days.filter((d) => d.day >= addDays(from, -n) && d.day < from), addDays(from, -n), addDays(from, -1));
  const reachFor = (ds: Day[]) => ({ impressions: Math.round(ds.reduce((a, d) => a + d.views, 0) * 2.6), clicks: Math.round(ds.reduce((a, d) => a + d.views, 0) * 2.6 * 0.052) });
  const end = new Date(Math.floor(Date.now() / 3_600_000) * 3_600_000 + 3_600_000);
  const top = content.slice(0, 6).map((c, i) => {
    const r = rng(`${c.videoId}h`);
    const hours = Array.from({ length: 48 }, (_, h) => Math.round((i === 0 ? 30 : 12 / (i + 1)) * Math.exp(-(47 - h) / (i === 0 ? 14 : 30)) * (0.6 + r() * 0.8) + (r() < 0.3 ? 1 : 0)));
    return { videoId: c.videoId, title: c.title, thumbnailUrl: c.thumbnailUrl, views48: hours.reduce((a, b) => a + b, 0), hours };
  }).sort((a, b) => b.views48 - a.views48);
  const hours = Array.from({ length: 48 }, (_, i) => top.reduce((a, t) => a + t.hours[i]!, 0));
  const total = daily.reduce((a, d) => a + d.views, 0);
  const ai = AI_VIDEOS(vs);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const cleaned = content.map(({ _days, ...c }) => ({ ...c, verdict: ai.find((a) => a.videoId === c.videoId)?.verdict ?? c.verdict }));
  return {
    range, format, totals: totalsOf(daily, reachFor(daily)), previous: prev.some((x) => x.views) ? totalsOf(prev, reachFor(prev)) : null, daily,
    breakdowns: breakdowns(total / 11105), breakdownScope: `channel:${format}:${range}`,
    realtime: {
      hours: hours.map((views, i) => ({ hour: new Date(end.getTime() - (48 - i) * 3_600_000).toISOString(), views })),
      last48: hours.reduce((a, b) => a + b, 0), last1: hours.at(-1) ?? 0, totalNow: content.reduce((a, c) => a + c.views, 0), top,
      snapshotAt: new Date(end.getTime() - 3_600_000).toISOString(),
    },
    content: cleaned.sort((a, b) => b.publishAt.localeCompare(a.publishAt)),
    typicalCurve: { short: averageCurve(vs.filter((v) => v.format === "short").slice(0, 10).map(curveOf)), long: averageCurve(vs.filter((v) => v.format === "long").slice(0, 10).map(curveOf)) },
    hookTrend: [...cleaned].sort((a, b) => a.publishAt.localeCompare(b.publishAt)).map((c) => ({ videoId: c.videoId, title: c.title, publishAt: c.publishAt, hookHold: c.hookHold, engagedRatio: c.engagedRatio, avgViewPct: c.avgViewPct })),
    whatWorks: whatWorks(vs.map((v) => {
      const c = cleaned.find((x) => x.videoId === v.id)!;
      return { attrs: { story: v.story, voice: v.voice, genre: v.genre, hook: v.hook, category: v.category, slot: v.publishAt.getUTCHours() < 10 ? "12:37" : "19:07" },
        avgViewPct: c.avgViewPct, views48: c.views48, engagedRatio: c.engagedRatio, hookHold: c.hookHold };
    }), { story: "Story format", hook: "Hook style", voice: "Narrator voice", genre: "Music", category: "Topic", slot: "Upload slot" }),
    ai: { channel: AI_CHANNEL, videos: ai.map((a) => ({ ...a, title: vs.find((v) => v.id === a.videoId)!.title, thumbnailUrl: vs.find((v) => v.id === a.videoId)!.thumb })) },
    refreshed: { daily: new Date(Date.now() - 2 * 3_600_000).toISOString(), deep: new Date(Date.now() - 6 * 3_600_000).toISOString(), through },
    missing: [],
  };
}

export function getVideoStudio(id: string): VideoStudio | null {
  const all = videos();
  const v = all.find((x) => x.id === id);
  if (!v) return null;
  const through = addDays(istDay(new Date()), -1);
  const content = rows(all.filter((x) => x.format === v.format), through);
  const me = content.find((c) => c.videoId === id)!;
  const curve = curveOf(v);
  const r = rng(`${id}v`);
  const hourly = Array.from({ length: 48 }, (_, h) => Math.round(v.quality * 18 * Math.exp(-((h - 6) ** 2) / 120) * (0.7 + r() * 0.6)));
  const typicalHourly = Array.from({ length: 48 }, (_, h) => Math.round(14 * Math.exp(-((h - 6) ** 2) / 140)));
  const drops = [0.15, 0.52].map((x, i) => {
    const at = x * v.durationSec;
    return { at, drop: 0.06 + i * 0.03, from: 0.9 - i * 0.3, to: 0.84 - i * 0.33, beat: i ? "turn" : "promise", scene: "board",
      line: i ? "But here's the catch: the owner pays rent on the ground every month." : "Picture one restaurant selling four million dollars of food a year.",
      near: i ? "But here's the catch: the owner" : "Picture one restaurant selling" };
  });
  const ai = AI_VIDEOS(all).find((a) => a.videoId === id) ?? null;
  return {
    videoId: id, format: v.format, durationSec: v.durationSec, previewUrl: v.preview, published: true,
    totals: totalsOf(me._days, { impressions: me.impressions ?? 0, clicks: (me.impressions ?? 0) * (me.ctr ?? 0) }), daily: me._days,
    curve, relative: curve.map(([x, y]) => [x, Math.min(1, Math.max(0, 0.3 + y * 0.3))] as [number, number]),
    typical: averageCurve(all.filter((x) => x.id !== id).slice(0, 10).map(curveOf)), drops, hookHold: me.hookHold, endHold: me.endHold,
    breakdowns: breakdowns(me.views / 11105 * 1.4), hourly, typicalHourly,
    bench: {
      views48: me.views48, median48: median(content.map((c) => c.views48).filter((x): x is number => x !== null)), avgViewPct: me.avgViewPct,
      medianPct: median(content.map((c) => c.avgViewPct).filter((x): x is number => x !== null)), rank: [...content].sort((a, b) => b.views - a.views).findIndex((c) => c.videoId === id) + 1, of: content.length,
    },
    comments: r() < 2 ? [
      { id: "c1", author: "@moneywise", text: "Never thought McDonald's was a landlord. Do Starbucks next!", likes: 12, replies: 1, publishedAt: new Date(Date.now() - 30 * 3_600_000).toISOString() },
      { id: "c2", author: "@ravi.k", text: "Is the 15% figure right? Seems high for India.", likes: 3, replies: 0, publishedAt: new Date(Date.now() - 20 * 3_600_000).toISOString() },
    ] : [],
    ai,
  };
}
