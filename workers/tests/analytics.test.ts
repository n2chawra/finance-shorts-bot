import assert from "node:assert/strict";
import { test } from "node:test";

import { KINDS, breakdownRows, channelDays, parseCsv, queryOf, rangeStart, reachRows } from "../lib/analytics.ts";
import { dropPoints, endHold, spokenBeats } from "../lib/retention.ts";
import { dayStat, rowsOf } from "../lib/youtube.ts";

const kind = (k: string) => KINDS.find((x) => x.kind === k)!;

test("analytics rows become objects and our day fields", () => {
  const rows = rowsOf({ columnHeaders: [{ name: "day" }, { name: "views" }, { name: "engagedViews" }, { name: "subscribersLost" }, { name: "estimatedMinutesWatched" }], rows: [["2026-11-01", 100, 36, 1, 12.5]] });
  const d = dayStat(rows[0]!);
  assert.equal(d.day, "2026-11-01");
  assert.equal(d.engagedViews, 36);
  assert.equal(d.subsLost, 1);
  assert.equal(d.watchMinutes, 12.5);
  assert.equal(d.shares, 0);   // missing metrics read as zero
});

test("breakdown queries carry the video, the format and the kind's filter", () => {
  const q = queryOf(kind("search"), { startDate: "2026-10-01", endDate: "2026-11-01", video: "abc", format: "short" });
  assert.equal(q.filters, "video==abc;creatorContentType==shorts;insightTrafficSourceType==YT_SEARCH");
  assert.equal(q.sort, "-views");
  assert.equal(queryOf(kind("device"), { startDate: "a", endDate: "b" }).filters, undefined);
});

test("breakdown rows get shares of the total, sorted, zero rows dropped", () => {
  const rows = breakdownRows(kind("country"), [
    { country: "US", views: 30, estimatedMinutesWatched: 5, averageViewPercentage: 70 },
    { country: "IN", views: 70, estimatedMinutesWatched: 9, averageViewPercentage: 50 },
    { country: "XX", views: 0, estimatedMinutesWatched: 0, averageViewPercentage: 0 },
  ]);
  assert.deepEqual(rows.map((r) => [r.key, r.share]), [["IN", 0.7], ["US", 0.3]]);
  assert.deepEqual(rows[0]!.extra, { avgViewPct: 50 });
  const age = breakdownRows(kind("ageGender"), [{ ageGroup: "age25-34", gender: "male", viewerPercentage: 31.8 }]);
  assert.equal(age[0]!.key, "age25-34|male");
  assert.equal(age[0]!.share, 0.318);
});

test("channel days keep all formats and map content types", () => {
  const out = channelDays([{ day: "2026-11-01", views: 10 }], [{ day: "2026-11-01", creatorContentType: "shorts", views: 8 }, { day: "2026-11-01", creatorContentType: "videoOnDemand", views: 2 }, { day: "2026-11-01", creatorContentType: "liveStream", views: 0 }]);
  assert.deepEqual(out.map((d) => [d.format, d.views]), [["all", 10], ["short", 8], ["long", 2]]);
  assert.equal(rangeStart("2026-11-02", 7), "2026-10-27");
});

test("reach CSVs give impressions and a views-weighted CTR per video and day", () => {
  const csv = "date,channel_id,video_id,traffic_source_type,video_thumbnail_impressions,video_thumbnail_impressions_ctr\n20261101,c,v1,1,100,0.05\n20261101,c,v1,2,300,0.01\n20261102,c,v2,1,50,0.1\n";
  const r = reachRows(parseCsv(csv));
  const v1 = r.find((x) => x.youtubeId === "v1")!;
  assert.equal(v1.day, "2026-11-01");
  assert.equal(v1.impressions, 400);
  assert.ok(Math.abs(v1.ctr - 0.02) < 1e-9);
  assert.deepEqual(reachRows(parseCsv("a,b\n1,2")), []);
});

test("drop points name the beat and the words being said", () => {
  // a 30 s video, 100 points: flat at 0.9, then a cliff at 40% (12 s)
  const curve: [number, number][] = Array.from({ length: 100 }, (_, i) => [(i + 1) / 100, i < 40 ? 0.9 : 0.5]);
  const beats = spokenBeats({ beats: [
    { id: "hook", scene: "hook", from: 0, frames: 300, voice: { start: 0, captions: [{ t: "You", s: 0 }, { t: "think", s: 0.3 }] } },
    { id: "turn", scene: "board", from: 300, frames: 600, voice: { start: 0, captions: [{ t: "But", s: 1.5 }, { t: "here's", s: 1.8 }, { t: "the", s: 2.0 }, { t: "catch", s: 2.2 }] } },
  ] });
  const d = dropPoints(curve, 30, beats);
  assert.equal(d.length, 1);
  assert.equal(d[0]!.beat, "turn");
  assert.ok(d[0]!.drop >= 0.39);
  assert.ok(d[0]!.at > 11 && d[0]!.at < 13);
  assert.match(d[0]!.near, /catch/);
  assert.equal(endHold(curve), 0.5);
  assert.deepEqual(dropPoints([], 30, beats), []);
});
