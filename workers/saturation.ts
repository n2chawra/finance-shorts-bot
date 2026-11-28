/**
 * Saturation: how many other channels told each open topic's story lately (workers/lib/saturation.ts says why).
 * For every active channel's open Short and long topics, one search.list call (last 30 days, the topic's search or
 * title) and one videos.list call (1 unit), then writes channels/<slug>/research/saturation.json: per topic only
 * derived counts (same-story videos in 7 and 30 days, their median and top views), never titles or ids. The
 * planner refuses a crowded topic (generator/saturation.py, through topics.blocked_reason and check-plan), and
 * research and Scout read the file before adding topics.
 *
 * Quota: at most MAX_SEARCHES searches a run from the separate 100-a-day search bucket, checked against the quota
 * keeper (the market scan runs earlier on Mondays and Thursdays and goes first).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { PrismaClient } from "@prisma/client";

import { QuotaKeeper } from "./lib/quota.ts";
import { SearchList, VideoDetails, durationSec } from "./lib/market.ts";
import { FeedTopic, MAX_SEARCHES, type Verdict, dueTopics, judge, promoTopics, queryOf, roundRobin } from "./lib/saturation.ts";
import { youtubeClientConfigured } from "./lib/uploads.ts";
import { tokenOf } from "./lib/channel-auth.ts";
import { accessToken } from "./lib/youtube.ts";
import { allChannels, crel, layout } from "./lib/channels.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const API = "https://www.googleapis.com/youtube/v3";
const DAY_MS = 86_400_000;
const FEEDS = ["improvement/research/topics.json", "improvement/longform/topics.json"];
const OUT = "improvement/research/saturation.json";

let searches = 0, units = 0;

async function get<T>(token: string, url: string, schema: { parse: (x: unknown) => T }): Promise<T> {
  if (url.includes("/search?")) searches += 1; else units += 1;
  const res = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`${res.status} ${url.split("?")[0]}: ${(await res.text()).slice(0, 200)}`);
  return schema.parse(await res.json());
}

const readJson = (rel: string) => {
  const f = path.join(ROOT, rel);
  return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) as Record<string, unknown> : null;
};

function activeChannels(): string[] {
  const entries = (readJson("config/channels.json")?.channels ?? {}) as Record<string, { status?: string }>;
  return allChannels(ROOT).filter((s) => entries[s]?.status === "active");
}

/** A channel's open topics from both feeds (ids are unique across them), and the feed ids its videos used. */
function feedOf(slug: string): { topics: FeedTopic[]; used: Set<string> } {
  const seen = new Map<string, FeedTopic>();
  for (const rel of FEEDS) {
    for (const t of ((readJson(crel(rel, ROOT, slug))?.topics ?? []) as unknown[])) {
      const r = FeedTopic.safeParse(t);
      if (r.success && !seen.has(r.data.id)) seen.set(r.data.id, r.data);
    }
  }
  const history = (readJson(crel("history/history.json", ROOT, slug)) ?? []) as unknown;
  const used = new Set<string>();
  for (const e of Array.isArray(history) ? history : []) {
    const id = (e as { topic?: { feed_id?: unknown } })?.topic?.feed_id;
    if (typeof id === "string") used.add(id);
  }
  const pack = readJson(`channels/${slug}/channel.json`) as { cadence?: { promoOnly?: boolean } } | null;
  const promos = pack?.cadence?.promoOnly === true ? promoTopics(history, seen, new Date()) : [];
  return { topics: [...seen.values(), ...promos], used };
}

async function readToken(): Promise<string | null> {
  if (process.env.DATABASE_URL && process.env.SESSION_SECRET) {
    const prisma = new PrismaClient();
    try {
      const ch = await prisma.channel.findUnique({ where: { id: layout().default } });
      const t = ch && (ch.status === "active" || ch.status === "paused") ? tokenOf(ch) : null;
      if (t) return accessToken(t.refreshToken, t.client);
    } finally {
      await prisma.$disconnect();
    }
  }
  return process.env.YT_REFRESH_TOKEN ? accessToken() : null;
}

async function check(token: string, t: FeedTopic, language: string, now: Date): Promise<Verdict> {
  const query = queryOf(t);
  const params = new URLSearchParams({ part: "id", type: "video", order: "relevance", maxResults: "50", q: query,
    publishedAfter: new Date(now.getTime() - 30 * DAY_MS).toISOString(), relevanceLanguage: language });
  if (t.format !== "long") params.set("videoDuration", "short");
  const ids = (await get(token, `${API}/search?${params}`, SearchList)).items.map((i) => i.id.videoId);
  const details = ids.length ? (await get(token, `${API}/videos?part=snippet,contentDetails,statistics&id=${ids.join(",")}`, VideoDetails)).items : [];
  return judge(details.map((d) => ({ title: d.snippet.title, publishedAt: d.snippet.publishedAt,
    durationSec: durationSec(d.contentDetails.duration), views: Number(d.statistics.viewCount ?? 0) })), t, query, now);
}

async function main(): Promise<void> {
  if (!youtubeClientConfigured()) return;
  const now = new Date();
  const token = await readToken();
  if (!token) return void console.log("::notice::No YouTube sign-in to read with. Nothing to do.");
  const prisma = process.env.DATABASE_URL ? new PrismaClient() : null;
  try {
    const keeper = prisma ? await QuotaKeeper.load(prisma) : null;
    const budget = Math.max(0, Math.min(MAX_SEARCHES, keeper ? keeper.searchesLeft : MAX_SEARCHES));
    const channels = activeChannels();
    const state = new Map<string, { prev: Record<string, Verdict>; open: Set<string>; language: string }>();
    const lists: { slug: string; topic: FeedTopic }[][] = [];
    for (const slug of channels) {
      const { topics, used } = feedOf(slug);
      const prev = ((readJson(crel(OUT, ROOT, slug))?.topics ?? {}) as Record<string, Verdict>);
      const language = String(readJson(`channels/${slug}/channel.json`)?.language ?? "en").slice(0, 2);
      const due = dueTopics(topics, used, prev, now);
      state.set(slug, { prev, open: new Set(topics.filter((t) => !used.has(t.id)).map((t) => t.id)), language });
      lists.push(due.map((topic) => ({ slug, topic })));
    }
    const plan = roundRobin(lists, budget);
    const summary: Record<string, { checked: number; crowded: string[] }> = {};
    for (const { slug, topic } of plan) {
      const s = state.get(slug)!;
      try {
        const v = await check(token, topic, s.language, now);
        s.prev[topic.id] = v;
        const row = (summary[slug] ??= { checked: 0, crowded: [] });
        row.checked++;
        if (v.crowded) row.crowded.push(`${topic.id} (${v.reason})`);
      } catch (e) {
        console.log(`::warning::${slug} ${topic.id}: ${String(e).slice(0, 200)}`);
        if (String(e).startsWith("403")) break;   // quota or auth: the rest would fail too
      }
    }
    for (const slug of channels) {
      const s = state.get(slug)!;
      const topics = Object.fromEntries(Object.entries(s.prev).filter(([id]) => s.open.has(id)));
      writeFileSync(path.join(ROOT, crel(OUT, ROOT, slug)), JSON.stringify({
        note: "How many other videos told each open topic's story lately (workers/saturation.ts). Only counts are kept. A crowded topic can't be planned (generator/saturation.py).",
        topics }, null, 2) + "\n");
    }
    console.log(JSON.stringify({ budget, searched: searches, channels: summary }, null, 2));
    if (keeper) {
      keeper.record("search", searches);
      keeper.record("stats", units);
      await keeper.save();
    }
  } finally {
    await prisma?.$disconnect();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  await main();
}
