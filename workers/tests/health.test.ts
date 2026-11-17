import assert from "node:assert/strict";
import { test } from "node:test";

import { digest, health, istWeek, type HealthInput, type Week } from "../lib/health.ts";

const w = (week: string, rate: number, views = 1000): Week => ({ week, views, engaged: Math.round(views * rate) });
const base = (o: Partial<HealthInput> = {}): HealthInput => ({
  channel: "c", name: "Chan", status: "active", queuedShorts: 6, shortsPostedPerDay: 3,
  weeks: [w("2026-W44", 0.55), w("2026-W45", 0.55), w("2026-W46", 0.56), w("2026-W47", 0.5)],
  usageMinutes: 30, allUsageMinutes: 120, critical: [], ...o,
});

test("on track is green with the last complete week's stayed to watch", () => {
  const h = health(base());
  assert.equal(h.color, "green");
  assert.match(h.reason, /56% stayed to watch last week/);
  assert.equal(h.bufferDays, 2);
  assert.equal(h.usageShare, 0.25);
  assert.deepEqual(h.notices, []);
});

test("the buffer: under a day is red with a notice, under two is amber", () => {
  const red = health(base({ queuedShorts: 2 }));
  assert.equal(red.color, "red");
  assert.equal(red.notices[0]!.key, "buffer:c");
  assert.equal(health(base({ queuedShorts: 4 })).color, "amber");
  assert.equal(health(base({ status: "paused", queuedShorts: 0 })).color, "amber");   // paused: no buffer alarm
});

test("a 10-point drop turns amber for the auditor's diagnosis", () => {
  const h = health(base({ weeks: [w("W1", 0.6), w("W2", 0.6), w("W3", 0.48), w("W4", 0.5)] }));
  assert.equal(h.color, "amber");
  assert.match(h.reason, /fell to 48% from 60%: diagnosis tonight/);
  assert.deepEqual(h.notices, []);     // the auditor diagnoses it; no notice unless a decision is needed
});

test("the stop rule: 3 weeks under 45% amber, 6 red with a dial-down and one notice", () => {
  const weeks = (n: number) => [...Array.from({ length: n }, (_, i) => w(`W${i}`, 0.4)), w("now", 0.4)];
  const three = health(base({ weeks: [w("W0", 0.5), ...weeks(3)] }));
  assert.equal(three.weeksUnderFloor, 3);
  assert.equal(three.color, "amber");
  assert.match(three.reason, /format change/);
  const six = health(base({ weeks: weeks(6) }));
  assert.equal(six.color, "red");
  assert.equal(six.dialDown, true);
  assert.ok(six.notices.some((n) => n.key === "stop-rule:c"));
});

test("too few views say nothing about stayed to watch", () => {
  const h = health(base({ weeks: [w("W1", 0.2, 50), w("W2", 0.2, 50), w("W3", 0.2, 50), w("W4", 0.2, 50)] }));
  assert.equal(h.stayed, null);
  assert.equal(h.weeksUnderFloor, 0);
  assert.equal(h.color, "green");
});

test("the digest reads like a week's summary; IST weeks", () => {
  const d = digest("Chan", health(base()), { running: "a guess-the-figure hook", lastVerdict: "kept: plain words (+6 points)" }, 21);
  assert.match(d.title, /Chan: the week \(green\)/);
  assert.match(d.detail, /Last test: kept/);
  assert.match(d.detail, /Running: a guess-the-figure hook/);
  assert.equal(istWeek(new Date("2026-11-16T20:00:00Z")), "2026-W47");   // Tue 01:30 IST
  assert.equal(istWeek(new Date("2026-11-16T17:00:00Z")), "2026-W47");   // Mon 22:30 IST
});

test("channel #1: no buffer alarm while generation is paused, and the stop rule's actions stay with its improver", () => {
  const paused = health(base({ queuedShorts: 1, generationPaused: true }));
  assert.equal(paused.color, "amber");
  assert.deepEqual(paused.notices, []);
  const weeks = [...Array.from({ length: 7 }, (_, i) => w(`W${i}`, 0.37)), w("now", 0.37)];
  const pp = health(base({ weeks, stopRuleActions: false }));
  assert.equal(pp.dialDown, false);
  assert.deepEqual(pp.notices, []);
  assert.match(pp.reason, /7 weeks under 45%/);
});
