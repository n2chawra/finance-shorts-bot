/**
 * Where a video came from, for the dashboard's posting plan: the feed topic it was made from (with
 * that topic's kind and priority) and its urgency. Stored in Video.style.source by ingest.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import type { ShippedManifest } from "./manifest.ts";

export type FeedTopic = { id: string; kind?: string; priority?: string; title?: string; [k: string]: unknown };
export type Source = {
  feedId: string | null;
  kind: string | null;          // news | trend | seasonal | evergreen (the feed's), null when not from the feed
  feedPriority: string | null;  // breaking | trending | high | normal
  urgent: { level: "breaking" | "trending"; until: string } | null;
  /** The feed topic as it was when the video was ingested, so "Why this video" outlives the feed
   * (owner, 2026-11-11: "so that i can know anytime"); topics leave the feed within weeks. */
  topic?: FeedTopic | null;
};

const SNAPSHOT_KEYS = ["id", "title", "why_now", "reason", "angle", "demand", "facts", "sources", "from_short", "from_short_views", "kind", "priority"];

/** The parts of a feed topic the dashboard's "Why this video" card shows. */
export function snapshot(t: FeedTopic | undefined): FeedTopic | null {
  if (!t) return null;
  const out: FeedTopic = { id: t.id };
  for (const k of SNAPSHOT_KEYS) if (t[k] !== undefined) out[k] = t[k];
  if (Array.isArray(out.facts)) out.facts = (out.facts as Record<string, unknown>[]).map((f) => ({ source: f?.source, url: f?.url }));
  return out;
}

/** Every topic in the Shorts and long-video feeds, by id. */
export function loadFeeds(root: string): Map<string, FeedTopic> {
  const out = new Map<string, FeedTopic>();
  for (const rel of ["improvement/research/topics.json", "improvement/longform/topics.json"]) {
    const file = path.join(root, rel);
    if (!existsSync(file)) continue;
    const topics = (JSON.parse(readFileSync(file, "utf8")) as { topics?: FeedTopic[] }).topics ?? [];
    for (const t of topics) if (t?.id) out.set(t.id, t);
  }
  return out;
}

export function sourceOf(m: Pick<ShippedManifest, "topic" | "priority">, feeds: Map<string, FeedTopic>): Source {
  const feedId = m.topic.feed_id ?? null;
  const t = feedId ? feeds.get(feedId) : undefined;
  return { feedId, kind: t?.kind ?? null, feedPriority: t?.priority ?? null, urgent: m.priority ?? null };
}

/** sourceOf plus the feed topic as it is now, saved with the video. */
export function sourceWithTopic(m: Pick<ShippedManifest, "topic" | "priority">, feeds: Map<string, FeedTopic>): Source {
  const s = sourceOf(m, feeds);
  const topic = snapshot(s.feedId ? feeds.get(s.feedId) : undefined);
  return topic ? { ...s, topic } : s;
}
