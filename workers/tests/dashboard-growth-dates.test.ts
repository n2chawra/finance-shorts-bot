import assert from "node:assert/strict";
import test from "node:test";

import { fmtDayKey } from "../../apps/dashboard/src/lib/format.ts";
import { shownConfidence, testDayLabel, verdictDueDay } from "../../apps/dashboard/src/lib/growth.ts";
import { feedbackToShow } from "../../apps/dashboard/src/lib/recent.ts";

test("fmtDayKey reads a day key, a full timestamp as its IST day, and never throws", () => {
  assert.equal(fmtDayKey("2026-11-13"), "13 Nov");
  // agents write writtenAt as a full timestamp; this threw RangeError and blanked the Growth page
  assert.equal(fmtDayKey("2026-11-08T17:45:00Z"), "8 Nov");
  assert.equal(fmtDayKey("2026-11-08T19:00:00Z"), "9 Nov"); // 00:30 IST the next day
  assert.equal(fmtDayKey("soon"), "soon");
});

test("the verdict is due on the start day plus maxDays, in IST", () => {
  // the page showed 19 Nov for a test starting 13 Nov with 7 days (IST midnight read as a UTC day)
  assert.equal(verdictDueDay("2026-11-13", 7), "2026-11-20");
  assert.equal(verdictDueDay("2026-11-28T00:00:00+05:30", 7), "2026-12-05");
  assert.equal(verdictDueDay(null, 7), null);
  assert.equal(verdictDueDay("not a day", 7), null);
});

test("a test that starts tomorrow says when, not 'today'", () => {
  assert.equal(testDayLabel(-1, 7, "13 Nov"), "Starts 13 Nov");
  assert.equal(testDayLabel(null, 7, "13 Nov"), "Starts today");
  assert.equal(testDayLabel(3, 7, "13 Nov"), "Day 3 of 7");
  assert.equal(testDayLabel(9, 7, "13 Nov"), "Day 7 of 7");
});

test("no confidence is shown before both sides have counted Shorts", () => {
  assert.equal(shownConfidence({ points: null, pOnBetter: 0.5, counted: { on: 0, off: 0 } }), null);
  assert.equal(shownConfidence({ points: 4, pOnBetter: 0.7, counted: { on: 3, off: 0 } }), null);
  assert.equal(shownConfidence({ points: 4, pOnBetter: 0.7, counted: { on: 3, off: 2 } }), 0.7);
});

test("the Feedback page keeps every open note and only recent answered ones", () => {
  const now = Date.parse("2026-11-12T16:00:00Z");
  const notes = [
    { id: "old-open", status: "open", createdAt: "2026-11-05T10:00:00Z", addressedAt: null },
    { id: "reopened", status: "open", createdAt: "2026-11-01T10:00:00Z", addressedAt: null },
    { id: "old-answered", status: "addressed", createdAt: "2026-11-01T10:00:00Z", addressedAt: "2026-11-02T10:00:00Z" },
    { id: "new-answered", status: "addressed", createdAt: "2026-11-01T10:00:00Z", addressedAt: "2026-11-12T10:00:00Z" },
  ];
  assert.deepEqual(feedbackToShow(notes, now).map((n) => n.id), ["old-open", "reopened", "new-answered"]);
});
