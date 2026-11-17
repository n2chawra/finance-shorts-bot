import assert from "node:assert/strict";
import { test } from "node:test";

import { DAY_MS, isoSeconds, kindOf, median, parseChannelRef, rankFamilies, score, summarise, titleFeatures, type ScanChannel, type ScanVideo } from "../lib/niche.ts";

const NOW = new Date("2026-11-17T00:00:00Z");
const ago = (d: number) => new Date(NOW.getTime() - d * DAY_MS).toISOString();
const v = (id: string, channelId: string, views: number, durationSec = 30, days = 10, title = "A video"): ScanVideo =>
  ({ id, channelId, title, publishedAt: ago(days), durationSec, kind: kindOf(durationSec), views, likes: 0, comments: 0 });

test("basics: medians, durations, Shorts vs long, channel links", () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([1, 2, 3, 4]), 2.5);
  assert.equal(isoSeconds("PT1M5S"), 65);
  assert.equal(isoSeconds("PT1H2M"), 3720);
  assert.equal(kindOf(59), "short");
  assert.equal(kindOf(181), "long");
  assert.deepEqual(parseChannelRef("https://www.youtube.com/@MoneyBits"), { handle: "@MoneyBits" });
  assert.deepEqual(parseChannelRef("youtube.com/channel/UCabc123"), { id: "UCabc123" });
  assert.deepEqual(parseChannelRef("@some.channel"), { handle: "@some.channel" });
  assert.equal(parseChannelRef("https://example.com/@x"), null);
});

test("a video is scored against its own channel's median, small channels marked", () => {
  const channels: ScanChannel[] = [{ id: "big", title: "Big", subs: 2_000_000, reference: false, foundBy: [] }, { id: "small", title: "Small", subs: 3_000, reference: false, foundBy: [] }];
  const videos = [v("b1", "big", 100_000), v("b2", "big", 100_000), v("b3", "big", 120_000), v("s1", "small", 1_000), v("s2", "small", 1_000), v("s3", "small", 50_000)];
  const s = score(videos, channels, NOW);
  assert.equal(s.find((x) => x.id === "s3")!.outlier, 50);
  assert.equal(s.find((x) => x.id === "b3")!.outlier, 1.2);
  assert.equal(s.find((x) => x.id === "s3")!.small, true);
  const sum = summarise(s, "short", NOW);
  assert.equal(sum.smallChannelsWithHit, 1);
  assert.equal(sum.topIds[0], "s3");
});

test("title features: a figure, a question, a named subject", () => {
  assert.deepEqual(titleFeatures("Why Costco sells hot dogs for $1.50"), { figure: true, question: true, name: true, words: 7 });
  assert.equal(titleFeatures("this changed everything").figure, false);
  assert.equal(titleFeatures("How much does Messi earn a day?").question, true);
});

test("topic families are tiered by numbers, and a thin family stays unknown", () => {
  const channels: ScanChannel[] = [{ id: "c", title: "C", subs: 50_000, reference: false, foundBy: [] }];
  const videos = [
    ...Array.from({ length: 6 }, (_, i) => v(`bil${i}`, "c", 80_000)),
    ...Array.from({ length: 6 }, (_, i) => v(`news${i}`, "c", 4_000)),
    ...Array.from({ length: 6 }, (_, i) => v(`mid${i}`, "c", 10_000)),
    v("odd1", "c", 9_000), v("odd2", "c", 9_000),
  ];
  const labels = Object.fromEntries(videos.map((x) => [x.id, x.id.startsWith("bil") ? "billionaire stories" : x.id.startsWith("news") ? "news explainers" : x.id.startsWith("odd") ? "oddities" : "budget tips"]));
  const rows = rankFamilies(score(videos, channels, NOW), labels);
  const tier = (f: string) => rows.find((r) => r.family === f)!.tier;
  assert.equal(tier("billionaire stories"), "core");
  assert.equal(tier("news explainers"), "avoid");
  assert.equal(tier("oddities"), "unknown");
  assert.equal(rows[0]!.family, "billionaire stories");
});

test("direction compares fresh videos' views a day with six-month-old ones", () => {
  const channels: ScanChannel[] = [{ id: "c", title: "C", subs: 50_000, reference: false, foundBy: [] }];
  const fresh = Array.from({ length: 5 }, (_, i) => v(`f${i}`, "c", 20_000, 30, 10));
  const old = Array.from({ length: 5 }, (_, i) => v(`o${i}`, "c", 150_000, 30, 150));
  const s = summarise(score([...fresh, ...old], channels, NOW), "short", NOW);
  assert.ok(s.direction! > 1, `direction ${s.direction}`);
});
