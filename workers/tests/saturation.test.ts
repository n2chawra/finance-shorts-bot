import assert from "node:assert/strict";
import { test } from "node:test";

import { CROWDED, dueTopics, judge, roundRobin, sameStory, storyTerms, words, type Verdict } from "../lib/saturation.ts";

const now = new Date("2026-11-28T12:00:00Z");
const ago = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();

test("words fold accents, possessives and grouped numbers", () => {
  assert.deepEqual(words("Nike's $4,500 Lac-Mégantic"), ["nike", "4500", "lac", "megantic"]);
});

test("same story: two of the title's content words, or every subject term", () => {
  const fedex = storyTerms({ title: "FedEx Had $5,000 Left. Its Founder Took It to a Blackjack Table" });
  assert.ok(sameStory("He Bet FedEx's Last $5,000 at Blackjack. #shorts", fedex));
  assert.ok(sameStory("FedEx Was Saved by a Blackjack Table", fedex));
  assert.ok(!sameStory("FedEx earnings beat estimates", fedex));
  const subject = storyTerms({ title: "Why Airline Pilots Now Need 1,500 Hours", subject: ["Colgan", "3407"] });
  assert.ok(sameStory("Colgan Air 3407: The Crash That Changed Who Can Fly Your Plane", subject));
  assert.ok(!sameStory("Why Do Pilots Need 1,500 Hours?", subject));
});

test("a story six Shorts told this week is crowded; long videos only count against long topics", () => {
  const short = (title: string, days: number, views = 50) => ({ title, publishedAt: ago(days), durationSec: 45, views });
  const nike = { title: "Nike Paid $35 for the Swoosh" };
  const week = Array.from({ length: CROWDED.days7 }, (_, i) => short(`Nike's logo cost $35 #${i}`, i));
  const v = judge([...week, { title: "The $35 Logo That Built Nike", publishedAt: ago(2), durationSec: 600, views: 25 }], nike, "nike swoosh", now);
  assert.equal(v.recent7, CROWDED.days7);
  assert.ok(v.crowded);
  assert.match(v.reason!, /last 7 days/);
  const long = judge(week, { ...nike, format: "long" }, "nike swoosh", now);
  assert.equal(long.recent30, 0);
  assert.ok(!long.crowded);
  const quiet = judge([short("Darien Gap: the road that stops", 3)], { title: "Why does the road from Alaska stop at the Darien Gap?" }, "darien gap", now);
  assert.ok(!quiet.crowded);
  assert.equal(quiet.median30, 50);
});

test("due topics: open, unused, never checked first; a recent check waits", () => {
  const t = (id: string, found: string, extra = {}) => ({ id, title: id, found, ...extra });
  const prev: Record<string, Verdict> = {
    old: { checkedAt: ago(6), format: "short", query: "", recent7: 0, recent30: 0, median30: null, top30: null, crowded: false, reason: null },
    fresh: { checkedAt: ago(1), format: "short", query: "", recent7: 0, recent30: 0, median30: null, top30: null, crowded: false, reason: null },
  };
  const due = dueTopics([t("old", "2026-11-20"), t("fresh", "2026-11-27"), t("new1", "2026-11-21"), t("new2", "2026-11-27"),
    t("used", "2026-11-27"), t("gone", "2026-11-27", { status: "rejected" }), t("expired", "2026-11-27", { expires: "2026-11-01" })],
  new Set(["used"]), prev, now);
  assert.deepEqual(due.map((x) => x.id), ["new2", "new1", "old"]);
});

test("searches are shared between channels in turns", () => {
  assert.deepEqual(roundRobin([["a1", "a2", "a3"], ["b1"], ["c1", "c2"]], 5), ["a1", "b1", "c1", "a2", "c2"]);
});
