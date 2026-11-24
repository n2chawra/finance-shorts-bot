import assert from "node:assert/strict";
import { test } from "node:test";

import { totals, windowCount } from "../../apps/dashboard/src/lib/totals.ts";

const row = (day: string, views: number) => ({ day, views, likes: 1, comments: 0, subsGained: 0, avgViewPct: 50 });
const live = (liveViews: number) => ({ liveViews, liveLikes: 2, liveComments: 0, liveAt: new Date("2026-11-23T12:00:00Z") });
const since = "2026-11-17";

test("YouTube removed invalid views: the 7 days never exceed the video's all-time views (audit 2026-11-23)", () => {
  const stats = [row("2026-11-20", 100), row("2026-11-21", 18)];   // Analytics counted 118
  const t = totals(stats, live(114));                              // YouTube now shows 114
  assert.equal(windowCount(stats, t, since, "views"), 114);
});

test("live views Analytics hasn't counted yet are added to the 7 days", () => {
  const stats = [row("2026-11-20", 100)];
  assert.equal(windowCount(stats, totals(stats, live(130)), since, "views"), 130);
});

test("rows before the window stay out; only the uncounted rest is added", () => {
  const stats = [row("2026-11-10", 500), row("2026-11-18", 40)];
  assert.equal(windowCount(stats, totals(stats, live(560)), since, "views"), 60);
  assert.equal(windowCount(stats, totals(stats, null), since, "views"), 40);
  assert.equal(windowCount(stats, totals(stats, live(560)), since, "likes"), 1);   // live 2 likes, both counted by Analytics, one in the window
});

test("a video with no rows and no live counters adds nothing", () => {
  assert.equal(windowCount([], totals([], null), since, "views"), 0);
});
