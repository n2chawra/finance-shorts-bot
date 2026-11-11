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

test("long topics get their reference thumbnails searched once a week, the urgent first", async () => {
  const { dueTopics, keepRefs, pickRefs, LongTopic } = await import("../lib/market.ts");
  const cfg = MarketConfig.parse({ regionCode: "US", relevanceLanguage: "en", queries: ["xx"] }).thumbRefs;
  assert.equal(cfg.perDay, 4);
  const now = new Date("2026-10-29T12:00:00Z");
  const topics = LongTopic.array().parse([
    { id: "a", title: "A", status: "new" }, { id: "b", title: "B", status: "new", priority: "high" },
    { id: "c", title: "C", status: "used" }, { id: "d", title: "D", status: "new", expires: "2026-10-01" },
    { id: "e", title: "E", status: "new" },
  ]);
  const prev = { e: { query: "E", searchedAt: "2026-10-27T12:00:00Z", refs: [] } };
  assert.deepEqual(dueTopics(topics, prev, now, cfg).map((t) => t.id), ["b", "a"]);   // e is fresh, c used, d expired
  assert.deepEqual(Object.keys(keepRefs(prev, new Set(["e"]), now, cfg)), ["e"]);
  assert.deepEqual(Object.keys(keepRefs(prev, new Set(["a"]), now, cfg)), []);
  const v = (id: string, views: number, duration: string) => ({ id, snippet: { title: id, channelTitle: "c", publishedAt: "2025-01-01T00:00:00Z" },
    contentDetails: { duration }, statistics: { viewCount: String(views) } });
  const refs = pickRefs([v("small", 5_000, "PT9M"), v("big", 2_000_000, "PT11M"), v("short", 9_000_000, "PT50S"), v("mid", 400_000, "PT8M")], cfg);
  assert.deepEqual(refs.map((r) => r.id), ["big", "mid"]);
  assert.equal(refs[0]!.thumb, "https://i.ytimg.com/vi/big/hqdefault.jpg");
});

test("an empty or broken previous thumb-refs file means no references yet, never a crash (2026-11-11)", async () => {
  const { parsePrevRefs } = await import("../lib/market.ts");
  assert.deepEqual(parsePrevRefs(""), {});
  assert.deepEqual(parsePrevRefs(null), {});
  assert.deepEqual(parsePrevRefs("{not json"), {});
  assert.deepEqual(parsePrevRefs('{"topics": 3}'), {});
  const ok = parsePrevRefs('{"topics": {"t": {"query": "q", "searchedAt": "2026-11-10T00:00:00Z", "refs": []}}}');
  assert.deepEqual(Object.keys(ok), ["t"]);
});

test("breakouts: views far past the channel's subscribers rank first (owner, 2026-11-11)", async () => {
  const { outlierOf, subscribersOf } = await import("../lib/market.ts");
  const cfg = MarketConfig.parse({ regionCode: "US", relevanceLanguage: "en", queries: ["money"] });
  assert.equal(cfg.breakoutRatio, 3);
  const now = new Date("2026-11-11T12:00:00Z");
  const v = (id: string, channelId: string, views: number) => ({
    id, snippet: { title: id, channelTitle: channelId, channelId, publishedAt: "2026-11-10T12:00:00Z" },
    contentDetails: { duration: "PT40S" }, statistics: { viewCount: String(views) },
  });
  const subs = subscribersOf([
    { id: "giant", statistics: { subscriberCount: "20000000" } },
    { id: "small", statistics: { subscriberCount: "40000" } },
    { id: "hidden", statistics: { hiddenSubscriberCount: true } },
    { id: "tiny", statistics: { subscriberCount: "12" } },
  ]);
  const r = rankMarket([v("big-channel-hit", "giant", 2_000_000), v("small-channel-hit", "small", 900_000), v("hid", "hidden", 500_000), v("new", "tiny", 2_500)], new Map(), cfg, now, subs);
  assert.equal(r.shorts[0]!.id, "big-channel-hit");                                  // views per hour unchanged
  assert.deepEqual(r.breakout.shorts.map((x) => x.id), ["small-channel-hit"]);        // 22.5x its 40K subscribers
  assert.equal(r.breakout.shorts[0]!.outlier, 22.5);
  assert.equal(r.shorts.find((x) => x.id === "big-channel-hit")!.breakout, false);    // 0.1x of 20M
  assert.equal(r.shorts.find((x) => x.id === "new")!.outlier, 2.5);                  // floor of 1,000 subscribers
  assert.deepEqual(outlierOf(10, undefined, 3), {});
});
