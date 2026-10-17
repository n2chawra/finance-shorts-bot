import assert from "node:assert/strict";
import { test } from "node:test";

import { MarketConfig, durationSec, rankMarket } from "../lib/market.ts";

test("ISO durations become seconds", () => {
  assert.equal(durationSec("PT45S"), 45);
  assert.equal(durationSec("PT1M3S"), 63);
  assert.equal(durationSec("PT1H2M"), 3720);
  assert.equal(durationSec("P0D"), 0);
  assert.equal(durationSec("nonsense"), 0);
});

test("videos split into Shorts and long, ranked by views per hour", () => {
  const cfg = MarketConfig.parse({ regionCode: "IN", relevanceLanguage: "en", queries: ["sip"] });
  const now = new Date("2026-10-17T12:00:00Z");
  const v = (id: string, duration: string, views: number, hoursAgo: number) => ({
    id, snippet: { title: id, channelTitle: "c", publishedAt: new Date(now.getTime() - hoursAgo * 3_600_000).toISOString() },
    contentDetails: { duration }, statistics: { viewCount: String(views) },
  });
  const r = rankMarket([v("old-big", "PT40S", 10_000, 100), v("new-fast", "PT30S", 5_000, 10), v("long", "PT9M", 900, 3), v("live", "P0D", 1, 1)],
    new Map([["new-fast", "sip"]]), cfg, now);
  assert.deepEqual(r.shorts.map((x) => x.id), ["new-fast", "old-big"]);
  assert.equal(r.shorts[0]!.viewsPerHour, 500);
  assert.equal(r.shorts[0]!.query, "sip");
  assert.deepEqual(r.long.map((x) => x.url), ["https://youtube.com/watch?v=long"]);
});
