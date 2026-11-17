/**
 * The full research's numbers (multi-channel plan, step 3b). Claude watches and labels; code measures:
 *   - topic families with direction, crowding and gaps (on top of lib/niche.ts rankFamilies)
 *   - style targets and the picture language from the shot sheets of the reference videos
 *   - the first second of the niche's hits
 *   - how many videos to post, each number with its reason
 * Every figure the advice quotes comes from here or from scan.json.
 */
import { DAY_MS, type FamilyRow, type KindSummary, type ScoredVideo, median, rankFamilies } from "./niche.ts";
import { type Measures, type Sheet, measures } from "./sheets.ts";

const round = (x: number, d = 2) => Math.round(x * 10 ** d) / 10 ** d;

export type FamilyTrend = FamilyRow & {
  /** videos in the family posted in the last 30 days */
  recent30: number;
  /** channels that posted the family in the last 30 days */
  crowding30: number;
  /** median views a day of 0–30-day-old videos ÷ 60–180-day-old ones; null when either side has < 3 */
  direction: number | null;
  /** a core family few channels are posting right now */
  gap: boolean;
};

export function familyTrends(scored: ScoredVideo[], labels: Record<string, string>): FamilyTrend[] {
  return rankFamilies(scored, labels).map((row) => {
    const vs = scored.filter((v) => v.kind === row.kind && labels[v.id] === row.family);
    const fresh = vs.filter((v) => v.ageDays <= 30);
    const old = vs.filter((v) => v.ageDays >= 60 && v.ageDays <= 180);
    const direction = fresh.length >= 3 && old.length >= 3 ? round(median(fresh.map((v) => v.viewsPerDay)) / Math.max(median(old.map((v) => v.viewsPerDay)), 0.01)) : null;
    const crowding30 = new Set(fresh.map((v) => v.channelId)).size;
    return { ...row, recent30: fresh.length, crowding30, direction, gap: row.tier === "core" && crowding30 <= 3 };
  });
}

type Spread = { median: number | null; p25: number | null; p75: number | null; n: number };

function spread(xs: number[]): Spread {
  if (!xs.length) return { median: null, p25: null, p75: null, n: 0 };
  const s = [...xs].sort((a, b) => a - b);
  const q = (p: number) => round(s[Math.min(s.length - 1, Math.floor(p * (s.length - 1) + 0.5))]!);
  return { median: round(median(s)), p25: q(0.25), p75: q(0.75), n: s.length };
}

const NUMERIC: (keyof Measures)[] = ["durationSec", "secPerShot", "cutsFirst3s", "firstFigureSec", "subjectNamedSec", "figureShare", "characterShare", "textShare", "movingShare", "motion", "wordsPerMin", "payoffAt"];

const count = (xs: string[]) => Object.fromEntries([...new Set(xs)].map((x) => [x, xs.filter((y) => y === x).length]).sort((a, b) => (b[1] as number) - (a[1] as number)));

export type StyleTargets = {
  n: number;
  /** each measure's median and middle half across the sheets: the channel's style targets */
  targets: Partial<Record<keyof Measures, Spread>>;
  /** what the hits show on screen */
  pictureLanguage: { artStyle: Record<string, number>; shotKinds: Record<string, number>; captions: Record<string, number> };
  /** cast or no cast: characters on screen for at least 30% of the time in the median sheet */
  cast: boolean;
  /** our kit can't make these: real footage, a person on camera, live action */
  notOurs: string[];
};

export function styleTargets(sheets: Sheet[]): StyleTargets {
  const ms = sheets.map(measures);
  const targets: StyleTargets["targets"] = {};
  for (const k of NUMERIC) targets[k] = spread(ms.map((m) => m[k]).filter((v): v is number => typeof v === "number"));
  const shotKinds = sheets.flatMap((s) => s.shots.map((x) => x.kind));
  const notOurs = [...new Set(sheets.flatMap((s) => [
    ...(["live action", "talking head", "stock footage"].includes(s.artStyle) ? [s.artStyle] : []),
    ...s.shots.filter((x) => x.kind === "footage" || x.kind === "person on camera").map((x) => x.kind),
  ]))];
  return {
    n: sheets.length, targets,
    pictureLanguage: { artStyle: count(sheets.map((s) => s.artStyle)), shotKinds: count(shotKinds), captions: count(sheets.map((s) => s.captions.style)) },
    cast: (targets.characterShare?.median ?? 0) >= 0.3,
    notOurs,
  };
}

export type FirstSecond = {
  n: number;
  /** share of hits that name their subject within 2 s */
  subjectBy2s: number | null;
  /** share that show or say a figure within 3 s */
  figureBy3s: number | null;
  question: number | null;
  loops: number | null;
  /** what the first frames show, in the sheets' words (our own descriptions, never their script) */
  firstFrames: string[];
};

export function firstSecond(sheets: Sheet[]): FirstSecond {
  const n = sheets.length;
  const share = (fn: (s: Sheet) => boolean) => (n ? round(sheets.filter(fn).length / n) : null);
  return {
    n,
    subjectBy2s: share((s) => s.hook.subjectNamedAtSec != null && s.hook.subjectNamedAtSec <= 2),
    figureBy3s: share((s) => { const t = [s.hook.figureShownAtSec, s.hook.figureSpokenAtSec].filter((x): x is number => x != null); return t.length > 0 && Math.min(...t) <= 3; }),
    question: share((s) => s.hook.question),
    loops: share((s) => s.ending.loops),
    firstFrames: sheets.map((s) => s.hook.firstFrame).slice(0, 20),
  };
}

export type CountAdvice = {
  shortsPerDay: number; longPerWeek: number;
  reasons: string[];
  /** quota units a day this channel's uploads would use */
  unitsPerDay: number;
};

export const UPLOAD_UNITS = 1_650;   // videos.insert + thumbnails.set

/**
 * How many to post: what the niche's channels with hits post, what the weekly loop needs (about 2.3
 * Shorts a day for a one-week cycle), and the quota left across channels. Long videos only where the
 * niche's long hits show demand.
 */
export function recommendCounts(shorts: KindSummary, long: KindSummary, freeUnitsPerDay: number): CountAdvice {
  const reasons: string[] = [];
  const niche = shorts.hitChannelsPostsPerWeek / 7;
  let perDay = Math.max(1, Math.min(3, Math.round(niche)));
  reasons.push(`Channels with a Shorts hit post about ${round(niche, 1)} a day (median).`);
  if (perDay < 3 && niche >= 1.5) { perDay = Math.min(3, perDay + 1); reasons.push("One more a day so the weekly loop gets 8 Shorts a side in about a week (it needs ~2.3 a day)."); }
  if (perDay < 2) reasons.push("At 1 a day each loop cycle takes about 16 days instead of 7.");
  const longDemand = long.videos >= 20 && long.smallChannelsWithHit >= 2 && (long.hitRate ?? 0) >= 0.1;
  let perWeek = longDemand ? Math.max(1, Math.min(2, Math.round(long.hitChannelsPostsPerWeek))) : 0;
  reasons.push(longDemand
    ? `Long videos: ${long.smallChannelsWithHit} small channels had a long hit (hit rate ${Math.round((long.hitRate ?? 0) * 100)}%), so ${perWeek} a week.`
    : `No long videos at first: ${long.smallChannelsWithHit} small channels had a long hit${long.hitRate != null ? `, hit rate ${Math.round(long.hitRate * 100)}%` : ""}; Shorts only until one of ours wins.`);
  const units = () => Math.round((perDay + perWeek / 7) * UPLOAD_UNITS);
  while (units() > freeUnitsPerDay && (perDay > 1 || perWeek > 0)) {
    if (perWeek > 0) perWeek--; else perDay--;
  }
  if (units() > freeUnitsPerDay) reasons.push(`Even 1 a day (${UPLOAD_UNITS} units) is over the ${freeUnitsPerDay} quota units free a day: apply for the quota increase before launch.`);
  else if (units() < Math.round((Math.max(1, Math.min(3, Math.round(niche))) + (longDemand ? 1 : 0) / 7) * UPLOAD_UNITS)) reasons.push(`Lowered to fit the ${freeUnitsPerDay} quota units free a day across channels.`);
  return { shortsPerDay: perDay, longPerWeek: perWeek, reasons, unitsPerDay: units() };
}

/** Comments under the hits, for the topic list in the audience's own words: the most-liked first. */
export function topComments(byVideo: Record<string, { text: string; likes: number }[]>, n = 60): string[] {
  return Object.values(byVideo).flat().sort((a, b) => b.likes - a.likes).slice(0, n).map((c) => c.text.replace(/\s+/g, " ").slice(0, 280));
}

export const ageDays = (iso: string, now = new Date()) => Math.max(1, (now.getTime() - Date.parse(iso)) / DAY_MS);
