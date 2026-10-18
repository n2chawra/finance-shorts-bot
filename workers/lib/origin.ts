/**
 * Where a video came from, for the dashboard's posting plan: the feed topic it was made from (with
 * that topic's kind and priority) and its urgency. Stored in Video.style.source by ingest.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import type { ShippedManifest } from "./manifest.ts";

export type FeedTopic = { id: string; kind?: string; priority?: string; title?: string };
export type Source = {
  feedId: string | null;
  kind: string | null;          // news | trend | seasonal | evergreen (the feed's), null when not from the feed
  feedPriority: string | null;  // breaking | trending | high | normal
  urgent: { level: "breaking" | "trending"; until: string } | null;
};

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
