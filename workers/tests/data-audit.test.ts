import assert from "node:assert/strict";
import { test } from "node:test";

import { audit, persistent, type AuditInput, type DashVideo } from "../lib/data-audit.ts";

const NOW = new Date("2026-10-20T17:00:00Z"); // 22:30 IST

function video(id: string, views: number, extra: Partial<DashVideo> = {}): DashVideo {
  return {
    id, title: id, status: "published",
    upload: { youtubeId: `yt-${id}`, state: "published", publishAt: "2026-10-18T07:07:00Z" },
    totals: { views, likes: 0, comments: 0, liveAt: "2026-10-20T16:55:00Z" },
    ...extra,
  };
}

function input(videos: DashVideo[], over: Partial<AuditInput> = {}): AuditInput {
  const sum = videos.filter((v) => v.status === "published").reduce((a, v) => a + (v.totals?.views ?? 0), 0);
  return {
    now: NOW, videos,
    youtube: new Map(videos.map((v) => [`yt-${v.id}`, { privacy: "public", views: v.totals?.views ?? 0, likes: 0, comments: 0 }])),
    analytics: new Map(videos.map((v) => [v.id, [{ day: "2026-10-18", views: 1 }, { day: "2026-10-19", views: 1 }]])),
    previous: new Map(), overview: { allTimeViews: sum, last7Views: sum }, analyticsTotalViews: sum,
    statsRefreshedAt: new Date("2026-10-20T15:00:00Z"),
    ...over,
  };
}

const kinds = (i: AuditInput) => audit(i).map((x) => x.kind);

test("a consistent channel has no issues", () => {
  assert.deepEqual(audit(input([video("a", 100), video("b", 50)])), []);
});

test("shown views that went down are an error", () => {
  const r = audit(input([video("a", 90)], { previous: new Map([["a", 100]]) }));
  assert.equal(r[0]?.kind, "went_down");
  assert.equal(r[0]?.severity, "error");
});

test("behind YouTube right after a live refresh is a bug; with stale counters it is only info", () => {
  const yt = new Map([["yt-a", { privacy: "public", views: 200, likes: 0, comments: 0 }]]);
  assert.deepEqual(kinds(input([video("a", 100)], { youtube: yt })), ["behind_youtube"]);
  const stale = video("a", 100, { totals: { views: 100, likes: 0, comments: 0, liveAt: "2026-10-20T10:00:00Z" } });
  assert.deepEqual(kinds(input([stale], { youtube: yt })), ["behind_youtube_stale"]);
});

test("small differences are YouTube noise, not mismatches", () => {
  const yt = new Map([["yt-a", { privacy: "public", views: 1003, likes: 0, comments: 0 }]]);
  assert.deepEqual(kinds(input([video("a", 1000)], { youtube: yt })), []);
});

test("more views than YouTube, and Analytics above the public count", () => {
  const yt = new Map([["yt-a", { privacy: "public", views: 50, likes: 0, comments: 0 }]]);
  const analytics = new Map([["a", [{ day: "2026-10-18", views: 70 }, { day: "2026-10-19", views: 30 }]]]);
  assert.deepEqual(kinds(input([video("a", 100)], { youtube: yt, analytics })), ["ahead_of_youtube", "analytics_over_public"]);
});

test("duplicate Analytics days and gaps", () => {
  const dup = new Map([["a", [{ day: "2026-10-18", views: 1 }, { day: "2026-10-18", views: 1 }]]]);
  assert.ok(kinds(input([video("a", 2)], { analytics: dup })).includes("duplicate_stat_day"));
  const old = video("a", 10, { upload: { youtubeId: "yt-a", state: "published", publishAt: "2026-10-10T07:07:00Z" } });
  assert.deepEqual(kinds(input([old], { analytics: new Map([["a", [{ day: "2026-10-10", views: 10 }]]]) })), ["analytics_gap"]);
});

test("publish state out of step with YouTube", () => {
  const scheduled = video("a", 0, { status: "scheduled", upload: { youtubeId: "yt-a", state: "scheduled", publishAt: "2026-10-19T07:07:00Z" } });
  assert.deepEqual(kinds(input([scheduled], { analytics: new Map() })), ["state_lag"]);
  const priv = new Map([["yt-a", { privacy: "private", views: 0, likes: 0, comments: 0 }]]);
  assert.deepEqual(kinds(input([video("a", 0)], { youtube: priv })), ["state_wrong"]);
  assert.deepEqual(kinds(input([video("a", 0)], { youtube: new Map() })), ["missing_on_youtube"]);
});

test("published without a link is for the owner", () => {
  const r = audit(input([video("a", 0, { upload: null, totals: null })]));
  assert.deepEqual(r.map((x) => [x.kind, x.severity]), [["unlinked", "owner"]]);
});

test("page totals must add up", () => {
  const i = input([video("a", 100)]);
  assert.deepEqual(kinds({ ...i, overview: { allTimeViews: 90, last7Views: 200 }, analyticsTotalViews: 95 }), ["aggregate_mismatch", "aggregate_mismatch", "aggregate_mismatch"]);
});

test("without YouTube only the internal checks run", () => {
  assert.deepEqual(kinds(input([video("a", 100)], { youtube: null, statsRefreshedAt: null })), []);
});

test("stale Analytics", () => {
  assert.deepEqual(kinds(input([video("a", 100)], { statsRefreshedAt: new Date("2026-10-17T00:00:00Z") })), ["stats_stale"]);
});

test("errors seen in two audits in a row are persistent", () => {
  const e = { kind: "went_down", severity: "error" as const, videoId: "a", detail: "" };
  assert.equal(persistent([e], [e]).length, 1);
  assert.equal(persistent([e], []).length, 0);
  assert.equal(persistent([{ ...e, severity: "warning" }], [{ ...e, severity: "warning" }]).length, 0);
});
