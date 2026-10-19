import assert from "node:assert/strict";
import { test } from "node:test";

import { dueSoon, istDay, istSlot, nextSlot, slotKey, youtubeMeta } from "../lib/publishing.ts";

const at = (iso: string) => new Date(iso);

test("IST days and slots", () => {
  assert.equal(istDay(at("2026-10-14T18:29:00Z")), "2026-10-14");
  assert.equal(istDay(at("2026-10-14T18:31:00Z")), "2026-10-15"); // 00:01 IST next day
  assert.equal(istSlot("2026-10-14", "19:07").toISOString(), "2026-10-14T13:37:00.000Z");
});

const TIMES = ["19:07", "12:37"];
const none = () => [new Set<string>(), new Map<string, number>()] as const;

test("the earliest free slot today, in time order", () => {
  assert.equal(nextSlot(at("2026-10-14T04:37:00Z"), TIMES, ...none()).toISOString(), "2026-10-14T07:07:00.000Z"); // 12:37 IST
});

test("the second slot once the first is taken, past or too close", () => {
  const taken = new Set([slotKey(at("2026-10-14T07:07:00Z"))]);
  assert.equal(nextSlot(at("2026-10-14T04:37:00Z"), TIMES, taken, new Map([["2026-10-14", 1]])).toISOString(), "2026-10-14T13:37:00.000Z");
  assert.equal(nextSlot(at("2026-10-14T06:50:00Z"), TIMES, ...none()).toISOString(), "2026-10-14T13:37:00.000Z"); // 17 min before 12:37
  assert.equal(nextSlot(at("2026-10-14T09:00:00Z"), TIMES, ...none()).toISOString(), "2026-10-14T13:37:00.000Z");
});

test("tomorrow once today's slots are used or past", () => {
  assert.equal(nextSlot(at("2026-10-14T15:00:00Z"), TIMES, ...none()).toISOString(), "2026-10-15T07:07:00.000Z");
  const taken = new Set([slotKey(at("2026-10-14T07:07:00Z")), slotKey(at("2026-10-14T13:37:00Z"))]);
  assert.equal(nextSlot(at("2026-10-14T04:37:00Z"), TIMES, taken, new Map([["2026-10-14", 2]])).toISOString(), "2026-10-15T07:07:00.000Z");
});

test("never more uploads a day than slots, even after manual uploads at other times", () => {
  // two videos already went out today by hand at odd times: today is full
  assert.equal(nextSlot(at("2026-10-14T04:37:00Z"), TIMES, new Set(), new Map([["2026-10-14", 2]])).toISOString(), "2026-10-15T07:07:00.000Z");
});

test("a single upload time still works", () => {
  assert.equal(nextSlot(at("2026-10-14T04:37:00Z"), ["19:07"], ...none()).toISOString(), "2026-10-14T13:37:00.000Z");
});

test("metadata stays inside YouTube's limits and keeps the disclaimer", () => {
  const m = youtubeMeta({ title: "x".repeat(150), description: "A <b>video</b>.", tags: ["#SIP", "Personal Finance", "sip"] });
  assert.ok(m.title.length <= 100);
  assert.ok(!/[<>]/.test(m.description));
  assert.match(m.description, /Illustrative only\. Not financial advice\./);
  assert.match(m.description, /#Shorts #SIP #PersonalFinance/);
  assert.equal(m.tags.join(",").length <= 500, true);
  assert.deepEqual(m.tags.slice(0, 3), ["Shorts", "SIP", "PersonalFinance"]);
});

test("the disclaimer is not added twice", () => {
  const m = youtubeMeta({ title: "t", description: "Hello. Illustrative only. Not financial advice.", tags: [] });
  assert.equal(m.description.match(/Illustrative only/g)?.length, 1);
});

test("many long tags are cut to 500 characters", () => {
  const m = youtubeMeta({ title: "t", description: "d", tags: Array.from({ length: 60 }, (_, i) => `longtagnumber${i}`) });
  assert.ok(m.tags.reduce((a, t) => a + t.length + 1, 0) <= 501);
});

// ---------------- long-form slots ----------------

test("long videos only go out on their own days", () => {
  const days = [2, 4, 6];   // Tue, Thu, Sat
  // Wednesday 2026-10-14 09:00 IST: the next long slot is Thursday 20:07
  const slot = nextSlot(at("2026-10-14T03:30:00Z"), ["20:07"], ...none(), 30, days);
  assert.equal(slot.toISOString(), "2026-10-15T14:37:00.000Z");   // 20:07 IST Thu
  assert.equal(istDay(slot), "2026-10-15");
  // on a Thursday before the slot, it is today
  assert.equal(istDay(nextSlot(at("2026-10-15T04:00:00Z"), ["20:07"], ...none(), 30, days)), "2026-10-15");
  // once Thursday's slot is taken, the next is Saturday
  const taken = new Set([slotKey(at("2026-10-15T14:37:00Z"))]);
  const used = new Map([["2026-10-15", 1]]);
  assert.equal(istDay(nextSlot(at("2026-10-15T04:00:00Z"), ["20:07"], taken, used, 30, days)), "2026-10-17");
});

test("without a day filter every day is a candidate, as before", () => {
  assert.equal(istDay(nextSlot(at("2026-10-14T03:30:00Z"), ["20:07"], ...none())), "2026-10-14");
});

test("only Shorts are tagged #Shorts", () => {
  const v = { title: "What a SIP really returns", description: "A look at the numbers.", tags: ["SIP"] };
  assert.ok(youtubeMeta(v, undefined, "short").tags.includes("Shorts"));
  assert.ok(youtubeMeta(v).tags.includes("Shorts"));                        // defaults to short
  assert.ok(!youtubeMeta(v, undefined, "long").tags.includes("Shorts"));
  assert.ok(!youtubeMeta(v, undefined, "long").description.includes("#Shorts"));
  assert.ok(youtubeMeta(v, undefined, "long").description.includes("Illustrative only"));
});

test("a slot is filled only within the lookahead, so a midday trend can still take the evening slot", () => {
  const evening = new Date("2026-10-17T13:37:00Z");                     // 19:07 IST
  assert.equal(dueSoon(new Date("2026-10-17T04:37:00Z"), evening), false); // 10:07 IST run: 9 h ahead
  assert.equal(dueSoon(new Date("2026-10-17T07:37:00Z"), evening), false); // 13:07 IST run: 6 h ahead
  assert.equal(dueSoon(new Date("2026-10-17T10:37:00Z"), evening), true);  // 16:07 IST run: 3 h ahead
  assert.equal(dueSoon(new Date("2026-10-17T04:37:00Z"), new Date("2026-10-17T07:07:00Z")), true); // 12:37 at 10:07
  assert.equal(dueSoon(new Date("2026-10-17T10:37:00Z"), new Date("2026-10-17T14:37:00Z")), true); // long 20:07 at 16:07
});

test("trend slots: IST time of day and the urgent marker", async () => {
  const { istTime, isUrgent } = await import("../lib/publishing.ts");
  assert.equal(istTime(at("2026-10-19T10:37:00Z")), "16:07");
  assert.equal(isUrgent({ source: { urgent: { level: "trending", until: "2026-10-19" } } }, "2026-10-19"), true);
  assert.equal(isUrgent({ source: { urgent: { level: "breaking", until: "2026-10-18" } } }, "2026-10-19"), false);
  assert.equal(isUrgent({ source: { urgent: null } }, "2026-10-19"), false);
  assert.equal(isUrgent(null, "2026-10-19"), false);
});
