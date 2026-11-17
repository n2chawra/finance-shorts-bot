import assert from "node:assert/strict";
import { test } from "node:test";

import { cronOf, fitCheck, planRoutines, promptFor, uploadClashes, type PlanChannel } from "../../apps/dashboard/src/lib/routine-plan.ts";

const ch = (i: number, o: Partial<PlanChannel> = {}): PlanChannel =>
  ({ id: `c${i}`, name: `Channel ${i}`, shortsPerDay: 3, longPerWeek: 0, uploadTimes: [`0${7 + i}:07`], ...o });

test("cron lines are UTC: 04:07 IST is 22:37 the day before", () => {
  assert.equal(cronOf("04:07", "daily"), "37 22 * * *");
  assert.equal(cronOf("23:47", "daily"), "17 18 * * *");
  assert.equal(cronOf("08:05", "Mon,Wed"), "35 2 * * 1,3");
  assert.equal(cronOf("04:07", "Mon"), "37 22 * * 0");      // Monday 04:07 IST is Sunday 22:37 UTC
});

test("channel #1 alone keeps today's times", () => {
  const p = planRoutines([ch(0, { longPerWeek: 2 })]);
  const at = (r: string) => p.slots.find((s) => s.routine === r)!.ist;
  assert.equal(at("research"), "23:47");
  assert.equal(at("video"), "04:07");
  assert.equal(at("improver"), "06:17");
  assert.equal(at("spare"), "09:07");
  assert.equal(at("studio"), "08:05");
  assert.equal(at("reviewer"), "21:07");
  assert.deepEqual(p.problems, []);
});

test("channels are staggered; a fifth video run moves to window C and the spare run after it", () => {
  const p = planRoutines([0, 1, 2, 3, 4].map((i) => ch(i, { uploadTimes: [`${String(6 + i * 2).padStart(2, "0")}:07`] })));
  const videos = p.slots.filter((s) => s.routine === "video").map((s) => `${s.ist}${s.window}`);
  assert.deepEqual(videos, ["04:07B", "04:47B", "05:27B", "06:07B", "09:07C"]);
  assert.equal(p.slots.find((s) => s.routine === "improver")!.ist, "06:47");
  assert.equal(p.slots.find((s) => s.routine === "spare")!.ist, "09:47");
  assert.deepEqual(p.slots.filter((s) => s.routine === "research").map((s) => s.ist), ["23:47", "00:12", "00:37", "01:02", "01:27"]);
  assert.deepEqual(p.problems, []);
});

test("too many channels don't fit, and the fit check names only the new channel's problems", () => {
  const live = [0, 1, 2, 3, 4, 5, 6].map((i) => ch(i, { uploadTimes: [`${String(i * 3).padStart(2, "0")}:00`] }));
  const extra = ch(7, { uploadTimes: ["23:30"] });
  const f = fitCheck(live, extra);
  assert.equal(f.fits, false);
  assert.ok(f.problems.some((x) => x.includes("research would start")), f.problems.join(" | "));
  assert.ok(f.slots.every((s) => s.channel === "c7"));
});

test("upload slots of different channels stay 20 minutes apart", () => {
  assert.equal(uploadClashes([ch(0, { uploadTimes: ["07:07"] }), ch(1, { uploadTimes: ["07:20"] })]).length, 1);
  assert.equal(uploadClashes([ch(0, { uploadTimes: ["07:07"] }), ch(1, { uploadTimes: ["07:37"] })]).length, 0);
  assert.equal(uploadClashes([ch(0, { uploadTimes: ["07:07", "07:10"] })]).length, 0);   // one channel's own slots
});

test("a channel's prompt names it and keeps it to its folder", () => {
  const p = planRoutines([ch(0), ch(1)]);
  const v = p.slots.find((s) => s.routine === "video" && s.channel === "c1")!;
  assert.match(promptFor(v), /CHANNEL=c1/);
  assert.match(promptFor(v), /--channel c1/);
  assert.match(promptFor(p.slots.find((s) => s.routine === "auditor")!), /for every channel/);
});

test("reviewers: three a night before the 23:00 auditor, then the next days", () => {
  const p = planRoutines([0, 1, 2, 3, 4].map((i) => ch(i, { uploadTimes: [`${String(6 + i * 2).padStart(2, "0")}:07`] })));
  assert.deepEqual(p.slots.filter((s) => s.routine === "reviewer").map((s) => `${s.ist} ${s.days}`),
    ["21:07 Tue,Fri", "21:37 Tue,Fri", "22:07 Tue,Fri", "21:07 Wed,Sat", "21:37 Wed,Sat"]);
});

test("a fifth channel says which shared routines move", () => {
  const live = [0, 1, 2, 3].map((i) => ch(i, { uploadTimes: [`${String(6 + i * 2).padStart(2, "0")}:07`] }));
  const f = fitCheck(live, ch(4, { uploadTimes: ["16:07"] }));
  assert.equal(f.fits, true);
  assert.deepEqual(f.moved.map((m) => `${m.routine} ${m.from}→${m.to}`), ["spare 09:07→09:47"]);
  assert.equal(f.slots.find((s) => s.routine === "video")!.ist, "09:07");
});
