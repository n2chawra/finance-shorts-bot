/**
 * Topic saturation (owner, 2026-11-28: "something is very wrong with Craze & Crash and Disaster Desk… the videos are
 * not being pushed"). Their dead Shorts and long videos were the stories every faceless channel told that same week:
 * in the 7 days to 28 Nov YouTube had 33 new videos on FedEx's blackjack night, 26 on Nike's $35 swoosh, 18 on the
 * Tacoma Narrows bridge and 16 on Colgan 3407 (12 of them long), nearly all under 1K views. Our versions got 19, 12,
 * 44 and 0. A topic's `demand` (one big old video on the idea) is exactly what sends every channel to the same story,
 * so the feed now also records how many videos on the same story went up lately, and the planner refuses a crowded
 * one (generator/saturation.py).
 *
 * Pure helpers here; workers/saturation.ts does the searching.
 */
import { z } from "zod";

/** At least this many same-story videos of the topic's format in the window make it crowded. */
export const CROWDED = { days7: 5, days30: 12 } as const;
/** A topic checked this recently isn't searched again. */
export const RECHECK_DAYS = 4;
/** Searches one run may spend (search.list has its own 100-a-day bucket that the market scan shares). */
export const MAX_SEARCHES = 60;
/** A Short is at most this long; anything longer counts against long topics. */
export const SHORT_MAX_SEC = 180;

const DAY_MS = 86_400_000;

const STOP = new Set(("a an and are as at be been but by can could did do does for from had has have he her his how i if in into is it its " +
  "just more most my no not now of off on once one only or our out over own said she so than that the their them then there these they " +
  "this those to too two up was we were what when where which who why will with would you your after before every ever all any again " +
  "really actually here inside whole full story explained history happened happen behind real truth secret").split(" "));

/** Lowercase words without accents, possessives or punctuation; "$4,500" → "4500". */
export function words(s: string): string[] {
  return s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/(\d),(\d)/g, "$1$2").replace(/['’]s\b/g, "").split(/[^a-z0-9]+/).filter(Boolean);
}

type Named = { id?: string; title: string; search?: string | null; subject?: string[] | null };

const content = (s: string) => words(s).filter((w) => !STOP.has(w) && (w.length > 2 || /\d/.test(w)));

/** The subject in a topic id: "2026-11-20-reno-galloping-ghost" -> "reno galloping ghost" (ids name the story; titles
 * often hide it behind the curiosity, "The Racing Plane Modified Past Its Limits"). */
export function slugOf(id: string | undefined): string {
  return (id ?? "").replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/-(short|long)$/, "").replace(/-/g, " ").trim();
}

/** What to search for: the topic's search, else its subject, else its id's words, else its title. */
export function queryOf(t: Named): string {
  const q = t.search?.trim() || t.subject?.join(" ").trim() || (content(slugOf(t.id)).length ? slugOf(t.id) : "") || t.title;
  return q.slice(0, 120);
}

/** The words that name a story: its subject terms when research gave them (all must appear), else the id's and
 * search's content words (two must appear, or the one there is), else the title's. */
export function storyTerms(topic: Named): { terms: string[]; need: number } {
  if (topic.subject?.length) {
    const terms = [...new Set(topic.subject.flatMap(words).filter((w) => !STOP.has(w)))];
    return { terms, need: terms.length };
  }
  let terms = [...new Set(content(`${slugOf(topic.id)} ${topic.search ?? ""}`))];
  if (!terms.length) terms = [...new Set(content(topic.title))];
  return { terms, need: Math.min(2, terms.length) };
}

/** Does a video's title tell the same story? (`need` of the story's terms appear in it) */
export function sameStory(title: string, story: { terms: string[]; need: number }): boolean {
  if (!story.terms.length) return false;
  const have = new Set(words(title));
  return story.terms.filter((t) => have.has(t)).length >= story.need;
}

export type Seen = { title: string; publishedAt: string; durationSec: number; views: number };
export type Verdict = {
  checkedAt: string; format: "short" | "long"; query: string;
  recent7: number; recent30: number; median30: number | null; top30: number | null;
  crowded: boolean; reason: string | null;
};

/** How crowded a story is, from the videos a search returned (only derived counts are kept, never titles or ids). */
export function judge(videos: Seen[], topic: Named & { format?: string | null },
  query: string, now: Date): Verdict {
  const format = topic.format === "long" ? "long" : "short";
  const story = storyTerms(topic);
  const same = videos.filter((v) => sameStory(v.title, story)
    && (format === "short" ? v.durationSec > 0 && v.durationSec <= SHORT_MAX_SEC : v.durationSec > SHORT_MAX_SEC));
  const age = (v: Seen) => (now.getTime() - Date.parse(v.publishedAt)) / DAY_MS;
  const in30 = same.filter((v) => age(v) <= 30);
  const recent7 = same.filter((v) => age(v) <= 7).length;
  const views = in30.map((v) => v.views).sort((a, b) => a - b);
  const median30 = views.length ? views[Math.floor(views.length / 2)]! : null;
  const top30 = views.length ? views[views.length - 1]! : null;
  const kind = format === "short" ? "Shorts" : "long videos";
  const reason = recent7 >= CROWDED.days7 ? `${recent7} other ${kind} told this story in the last 7 days`
    : in30.length >= CROWDED.days30 ? `${in30.length} other ${kind} told this story in the last 30 days` : null;
  return { checkedAt: now.toISOString(), format, query, recent7, recent30: in30.length, median30, top30, crowded: reason !== null, reason };
}

export const FeedTopic = z.object({
  id: z.string(),
  title: z.string(),
  format: z.string().nullish(),
  status: z.string().nullish(),
  expires: z.string().nullish(),
  search: z.string().nullish(),
  subject: z.array(z.string()).nullish(),
  found: z.string().nullish(),
}).passthrough();
export type FeedTopic = z.infer<typeof FeedTopic>;

/** Open topics worth a search now: unused, unexpired, not checked in RECHECK_DAYS; never checked first, newest found first. */
export function dueTopics(topics: FeedTopic[], used: Set<string>, prev: Record<string, Verdict>, now: Date): FeedTopic[] {
  const day = now.toISOString().slice(0, 10);
  const open = topics.filter((t) => (t.status ?? "new") === "new" && (!t.expires || t.expires >= day) && !used.has(t.id));
  const due = open.filter((t) => !prev[t.id] || prev[t.id]!.query !== queryOf(t) || now.getTime() - Date.parse(prev[t.id]!.checkedAt) >= RECHECK_DAYS * DAY_MS);
  return due.sort((a, b) => (prev[a.id] ? 1 : 0) - (prev[b.id] ? 1 : 0) || String(b.found ?? "").localeCompare(String(a.found ?? "")));
}

/** One search per topic, shared fairly: channels take turns until the budget runs out. */
export function roundRobin<T>(lists: T[][], budget: number): T[] {
  const out: T[] = [];
  for (let i = 0; out.length < budget && lists.some((l) => i < l.length); i++) {
    for (const l of lists) if (i < l.length && out.length < budget) out.push(l[i]!);
  }
  return out;
}
