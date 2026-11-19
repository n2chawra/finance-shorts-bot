/**
 * Sample data for the All channels page with no database (the API's sample mode): the four live
 * channels with realistic numbers, so the page can be designed and tested. Seeded, so it is stable.
 */
import { median, type Portfolio, type PortfolioChannel, type PortfolioVideo, type Today, todaySlots, verdictOf } from "./portfolio";

const DAY = 86_400_000;
const key = (ms: number) => new Date(ms).toISOString().slice(0, 10);

function rng(seed: number) {
  let x = seed;
  return () => { x = (x * 1_103_515_245 + 12_345) % 2_147_483_648; return x / 2_147_483_648; };
}

type Spec = {
  id: string; name: string; base: number; trend: number; subs: number; subs7: number; subsPrev7: number; perDay: number;
  stayed: number; pctS: number; pctL: number; longHours: number; uploadTimes: string[]; longUploadTimes: string[]; longUploadDays: number[];
  firstDaysAgo: number; titles: string[]; health: PortfolioChannel["health"]; loop: PortfolioChannel["loop"]; backlog: { short: number; long: number };
  /** today's passed slots (by index) whose upload failed */
  missed?: number[];
};

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

const SPECS: Spec[] = [
  { id: "paisa-panchayat", name: "Paisa Panchayat", base: 820, trend: 1.25, subs: 61, subs7: 9, subsPrev7: 4, perDay: 3, stayed: 0.43, pctS: 71, pctL: 34, longHours: 46,
    uploadTimes: ["07:07", "12:37", "19:07"], longUploadTimes: ["20:07"], longUploadDays: [3, 5], firstDaysAgo: 37,
    titles: ["What Costco really makes on a $1.50 hot dog", "Why a Starbucks latte costs $6 to make", "Taylor Swift's Eras Tour: what one ticket paid for",
      "What an IKEA Billy shelf earns IKEA", "How much a Netflix password is worth to Netflix", "Why the iPhone's charger left the box"],
    health: { color: "amber", reason: "stayed to watch 43%, 2 points under the target", at: hoursAgo(5) },
    loop: { running: "hook-object-first", description: "Open on the thing in your hand, the price on it", cycle: 2, lastVerdict: { id: "title-question", verdict: "kept", test: "title asks, figure waits" } },
    backlog: { short: 6, long: 1 } },
  { id: "geography-maps-geopolitical-mysteries", name: "The Why Atlas", base: 1450, trend: 1.6, subs: 38, subs7: 14, subsPrev7: 6, perDay: 2, stayed: 0.52, pctS: 78, pctL: 41, longHours: 21,
    uploadTimes: ["08:37", "18:37"], longUploadTimes: ["19:37"], longUploadDays: [2, 6], firstDaysAgo: 19,
    titles: ["Why Egypt earns $9B a year from one canal", "Why Russia's border has a 2-mile gap", "Why Bolivia still has a navy",
      "Why Canada's map has a hole in it", "Why Panama raised its tolls to $4M a ship"],
    health: { color: "green", reason: "every slot filled, stayed to watch 52%", at: hoursAgo(4) },
    loop: { running: "map-zoom-open", description: "Open on a satellite zoom into the place", cycle: 1, lastVerdict: null },
    backlog: { short: 9, long: 2 } },
  { id: "how-tech-and-ai-actually-work-chips-ai-p", name: "A Billion Switches", base: 260, trend: 0.8, subs: 12, subs7: 2, subsPrev7: 5, perDay: 2, stayed: 0.36, pctS: 63, pctL: 29, longHours: 9,
    uploadTimes: ["09:07", "21:07"], longUploadTimes: ["20:37"], longUploadDays: [1, 4], firstDaysAgo: 16,
    titles: ["What's inside a $30,000 AI chip", "How your phone knows where you are without GPS", "Why ChatGPT costs $700K a day to run",
      "How a QR code still works when torn", "Why a USB plug never goes in first time"],
    health: { color: "red", reason: "the 09:07 upload failed: token refresh error", at: hoursAgo(2) },
    loop: null, backlog: { short: 2, long: 0 }, missed: [0] },
  { id: "business-documentaries-rise-and-fall-of", name: "Craze & Crash", base: 90, trend: 1.1, subs: 4, subs7: 3, subsPrev7: 1, perDay: 1, stayed: 0.4, pctS: 66, pctL: 38, longHours: 3,
    uploadTimes: ["17:37"], longUploadTimes: ["20:37"], longUploadDays: [0, 3], firstDaysAgo: 6,
    titles: ["How Beanie Babies went from $5 to $5,000 to $0", "How Blockbuster said no to Netflix for $50M", "The fidget spinner's 6-month fortune"],
    health: { color: "green", reason: "first week: uploads on time", at: hoursAgo(6) },
    loop: null, backlog: { short: 4, long: 1 } },
];

export function samplePortfolio(): Portfolio {
  const now = Date.now();
  const throughMs = Date.parse(`${key(now - 2 * DAY)}T00:00:00Z`);
  const through = key(throughMs);
  const days = Array.from({ length: 28 }, (_, i) => key(throughMs + (i - 27) * DAY));
  const daily: Record<string, (number | null)[]> = {};
  const today: Today[] = [];

  const channels = SPECS.map((s, idx): PortfolioChannel => {
    const r = rng(idx * 97 + 13);
    const firstDay = key(now - s.firstDaysAgo * DAY);
    // daily views growing toward `base` at the week-on-week `trend`, with noise and the odd spike
    const spark = days.map((d, i) => (d < firstDay ? 0 : Math.round(s.base * Math.pow(s.trend, (i - 27) / 7) * (0.7 + r() * 0.6) * (r() > 0.92 ? 2.4 : 1))));
    daily[s.id] = days.map((d, i) => (d < firstDay ? null : spark[i]));
    const sum = (a: number, b: number) => spark.slice(27 - b, 28 - a).reduce((x, y) => x + y, 0);
    const views7 = sum(0, 6), viewsPrev7 = sum(7, 13), views28 = sum(0, 27);

    const videos: PortfolioVideo[] = Array.from({ length: Math.min(s.firstDaysAgo, 42) * s.perDay }, (_, i) => {
      const age = i / s.perDay + 0.3;
      const format = i % 9 === 4 ? "long" : "short";
      const views = Math.round((s.base / s.perDay) * (0.3 + r() * 1.8) * (r() > 0.9 ? 4 : 1) * Math.min(1, age / 2));
      return { id: `${s.id}-v${i}`, title: s.titles[i % s.titles.length], format, publishAt: new Date(now - age * DAY).toISOString(),
        youtubeId: null, views, stayed: format === "short" ? Math.round((s.stayed + (r() - 0.5) * 0.14) * 1000) / 1000 : null };
    });
    const ageOf = (v: PortfolioVideo) => (now - Date.parse(v.publishAt)) / DAY;
    const shortsIn = (lo: number, hi: number) => videos.filter((v) => v.format === "short" && ageOf(v) >= lo && ageOf(v) < hi);
    const recent = shortsIn(2, 14), last28 = shortsIn(0, 28);
    const week = videos.filter((v) => ageOf(v) < 7);
    const byViews = (a: PortfolioVideo, b: PortfolioVideo) => b.views - a.views;
    const c = { views7, viewsPrev7, subs7: s.subs7, subsPrev7: s.subsPrev7, medianShort14: median(recent.map((v) => v.views)), medianShortBase: median(shortsIn(15, 42).map((v) => v.views)) };

    // today: a live upload on every slot already passed (bar the failed ones), the rest still to come
    const slots = todaySlots(now, { ...s, uploadsPaused: false, live: true }, []);
    const titles = [...s.titles].reverse();
    today.push({ channelId: s.id, views24h: Math.round(spark[27] * (1.05 + r() * 0.3)), slots: slots.map((sl, i) => {
      const title = titles[i % titles.length];
      if (sl.state !== "missed") return { ...sl, title: sl.state === "next" ? title : null };
      if (s.missed?.includes(i)) return { ...sl, title };
      const hours = (now - Date.parse(sl.at)) / 3_600_000;
      return { ...sl, state: "posted" as const, title, views: Math.round((s.base / s.perDay) * Math.min(1, hours / 20) * (0.4 + r())) };
    }) });

    return {
      id: s.id, name: s.name, status: "active", stage: null, health: s.health, statsThrough: through,
      subs: s.subs, subs7: s.subs7, subsPrev7: s.subsPrev7, subs28: Math.round(s.subs * 0.7), views7, viewsPrev7, views28, spark,
      published7: week.length, publishedTotal: videos.length, firstPublishAt: new Date(now - s.firstDaysAgo * DAY).toISOString(), shorts14: recent.length,
      medianShort14: c.medianShort14, medianShortBase: c.medianShortBase,
      stayed28: s.stayed, pctShort28: s.pctS, pctLong28: s.pctL,
      viewsPerShort: last28.length ? last28.reduce((a, v) => a + v.views, 0) / last28.length : null,
      subsPer1k: views28 ? ((s.subs * 0.7) / views28) * 1000 : null,
      best7: [...week].sort(byViews)[0] ?? null, top14: videos.filter((v) => ageOf(v) < 14).sort(byViews).slice(0, 3),
      backlog: s.backlog, nextUpload: null, uploadsPaused: false, loop: s.loop,
      ypp: { subs: s.subs, watchHoursLong365: s.longHours, shortsViews90: Math.round(views28 * 1.3) },
      verdict: verdictOf({ ...c, publishedTotal: videos.length, daysLive: s.firstDaysAgo }),
    };
  });
  for (const c of channels) {
    const next = today.find((t) => t.channelId === c.id)?.slots.find((sl) => sl.state === "next");
    if (next) c.nextUpload = { at: next.at, kind: "scheduled", title: next.title, format: next.format };
  }
  return { source: "sample", generatedAt: new Date(now).toISOString(), days, daily, channels, today };
}
