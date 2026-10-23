import assert from "node:assert/strict";
import test from "node:test";

import { fillFromLive, type DayRow } from "../../apps/dashboard/src/lib/totals.ts";

const empty = (days: string[]) => new Map<string, DayRow>(days.map((d) => [d, { views: 0, likes: 0, comments: 0, subsGained: 0, estimated: false }]));
const live = (views: number, likes: number) => ({ liveViews: views, liveLikes: likes, liveComments: 0, liveAt: new Date("2026-10-24T00:00:00Z") });
const row = (day: string, views: number, likes: number) => ({ day, views, likes, comments: 0, subsGained: 0, avgViewPct: 40 });

test("live counts beyond Analytics fill the days Analytics hasn't reached", () => {
  const byDay = empty(["2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23"]);
  for (const s of [row("2026-10-19", 10, 1), row("2026-10-20", 10, 0)]) { byDay.get(s.day)!.views += s.views; byDay.get(s.day)!.likes += s.likes; }
  // an old video: 20 views in Analytics to the 20th, 50 live
  fillFromLive(byDay, [{ publishDay: "2026-10-19", stats: [row("2026-10-19", 10, 1), row("2026-10-20", 10, 0)], live: live(50, 4) },
    // a new video with no Analytics yet: all on its days
    { publishDay: "2026-10-22", stats: [], live: live(1000, 13) }]);
  const v = [...byDay.values()];
  assert.equal(v.reduce((a, d) => a + d.views, 0), 1050);
  assert.equal(v.reduce((a, d) => a + d.likes, 0), 17);
  assert.deepEqual(v.map((d) => d.estimated), [false, false, true, true, true]);
  assert.equal(byDay.get("2026-10-21")!.views, 10);
  assert.equal(byDay.get("2026-10-22")!.views + byDay.get("2026-10-23")!.views, 1020);
});

test("nothing to add when Analytics is up to date", () => {
  const byDay = empty(["2026-10-20"]);
  fillFromLive(byDay, [{ publishDay: "2026-10-20", stats: [row("2026-10-20", 5, 1)], live: live(5, 1) }]);
  assert.equal(byDay.get("2026-10-20")!.estimated, false);
});
