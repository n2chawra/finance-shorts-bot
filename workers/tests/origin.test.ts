import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";

import { loadFeeds, sourceOf } from "../lib/origin.ts";

test("a feed video carries its topic's kind, priority and urgency", () => {
  const feeds = new Map([["2026-10-18-upi-mdr-above-2000", { id: "2026-10-18-upi-mdr-above-2000", kind: "trend", priority: "trending" }]]);
  const s = sourceOf({ topic: { title: "t", category: "payments", feed_id: "2026-10-18-upi-mdr-above-2000" }, priority: { level: "trending", until: "2026-10-21" } }, feeds);
  assert.deepEqual(s, { feedId: "2026-10-18-upi-mdr-above-2000", kind: "trend", feedPriority: "trending", urgent: { level: "trending", until: "2026-10-21" } });
});

test("an evergreen pick has no feed source", () => {
  assert.deepEqual(sourceOf({ topic: { title: "t", category: "sip" } }, new Map()), { feedId: null, kind: null, feedPriority: null, urgent: null });
});

test("the repo's feeds load", () => {
  assert.ok(loadFeeds(path.resolve(import.meta.dirname, "..", "..")).size > 0);
});

test("ingest saves the feed topic with the video, so its reason outlives the feed (owner, 2026-11-11)", async () => {
  const { sourceWithTopic } = await import("../lib/origin.ts");
  const feeds = new Map([["t1", { id: "t1", kind: "evergreen", priority: "normal", title: "Ronaldo's year", why_now: "four Ronaldo Shorts in the top 30",
    demand: { title: "Ronaldo Networth", views: 4695655, url: "https://www.youtube.com/watch?v=ZjoxNI05QpQ" }, maths: "not kept",
    facts: [{ label: "x", value: 300, source: "Forbes", url: "https://forbes.example" }] }]]);
  const s = sourceWithTopic({ topic: { title: "t", category: "wealth", feed_id: "t1" } }, feeds);
  assert.equal(s.topic?.why_now, "four Ronaldo Shorts in the top 30");
  assert.deepEqual(s.topic?.demand, { title: "Ronaldo Networth", views: 4695655, url: "https://www.youtube.com/watch?v=ZjoxNI05QpQ" });
  assert.equal(s.topic?.maths, undefined);
  assert.deepEqual(s.topic?.facts, [{ source: "Forbes", url: "https://forbes.example" }]);
  assert.equal(sourceWithTopic({ topic: { title: "t", category: "sip" } }, new Map()).topic, undefined);
});
