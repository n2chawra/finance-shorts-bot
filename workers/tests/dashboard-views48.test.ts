import assert from "node:assert/strict";
import { test } from "node:test";

import { views48Of } from "../../apps/dashboard/src/lib/studio-calc.ts";

// The Analytics page's 48-hour views (auditor 2026-11-09): Analytics lags 2-3 days, so a video two days
// old often has only its publish day. That partial sum was shown as its 48-hour views and benchmarked as a miss.
test("48-hour views wait for the second day", () => {
  assert.equal(views48Of([{ day: "2026-11-05", views: 30 }], "2026-11-05"), null);
  assert.equal(views48Of([], "2026-11-05"), null);
});

test("48-hour views sum the publish day and the next", () => {
  const days = [{ day: "2026-11-05", views: 30 }, { day: "2026-11-06", views: 12 }, { day: "2026-11-07", views: 99 }];
  assert.equal(views48Of(days, "2026-11-05"), 42);
  // a publish day with no row (zero views) still counts once the second day is in
  assert.equal(views48Of([{ day: "2026-11-06", views: 7 }], "2026-11-05"), 7);
  // across a month end
  assert.equal(views48Of([{ day: "2026-10-31", views: 5 }, { day: "2026-11-01", views: 6 }], "2026-10-31"), 11);
});
