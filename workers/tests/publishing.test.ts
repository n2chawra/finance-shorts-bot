import assert from "node:assert/strict";
import { test } from "node:test";

import { istDay, istSlot, nextSlot, youtubeMeta } from "../lib/publishing.ts";

const at = (iso: string) => new Date(iso);

test("IST days and slots", () => {
  assert.equal(istDay(at("2026-10-14T18:29:00Z")), "2026-10-14");
  assert.equal(istDay(at("2026-10-14T18:31:00Z")), "2026-10-15"); // 00:01 IST next day
  assert.equal(istSlot("2026-10-14", "19:07").toISOString(), "2026-10-14T13:37:00.000Z");
});

test("today's slot when free and far enough away", () => {
  assert.equal(nextSlot(at("2026-10-14T04:37:00Z"), "19:07", new Set()).toISOString(), "2026-10-14T13:37:00.000Z");
});

test("tomorrow when today's slot is taken, too close or past", () => {
  assert.equal(nextSlot(at("2026-10-14T04:37:00Z"), "19:07", new Set(["2026-10-14"])).toISOString(), "2026-10-15T13:37:00.000Z");
  assert.equal(nextSlot(at("2026-10-14T13:20:00Z"), "19:07", new Set()).toISOString(), "2026-10-15T13:37:00.000Z"); // 17 min before
  assert.equal(nextSlot(at("2026-10-14T15:00:00Z"), "19:07", new Set()).toISOString(), "2026-10-15T13:37:00.000Z");
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
