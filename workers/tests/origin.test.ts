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
