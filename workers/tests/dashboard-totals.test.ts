import assert from "node:assert/strict";
import { test } from "node:test";

import { totals } from "../../apps/dashboard/src/lib/totals.ts";

const day = (views: number, avgViewPct: number) => ({ views, likes: 0, comments: 0, subsGained: 0, avgViewPct });
const live = (liveViews: number) => ({ liveViews, liveLikes: 3, liveComments: 1, liveAt: new Date("2026-10-19T12:00:00Z") });

test("no Analytics rows and no live counters: no totals", () => {
  assert.equal(totals([], null), null);
});

test("live counters win when they are ahead of Analytics", () => {
  const t = totals([day(100, 50)], live(180))!;
  assert.equal(t.views, 180);
  assert.equal(t.likes, 3);
  assert.equal(t.liveAt, "2026-10-19T12:00:00.000Z");
});

test("live counters never pull the totals below Analytics", () => {
  assert.equal(totals([day(100, 50)], live(40))!.views, 100);
});

test("average % viewed is weighted by each day's views, like the agents' metrics (agents-sync)", () => {
  // 1,000 views at 60% on launch day, then 10 views at 20%: the video was watched ~59.6%, not 40%
  assert.equal(totals([day(1000, 60), day(10, 20)])!.avgViewPct, 59.6);
});

test("days without views don't drag the average down", () => {
  assert.equal(totals([day(500, 70), day(0, 0), day(0, 0)])!.avgViewPct, 70);
});

test("only zero-view days: average 0", () => {
  assert.equal(totals([day(0, 0)])!.avgViewPct, 0);
});
