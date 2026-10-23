import assert from "node:assert/strict";
import { test } from "node:test";

import { SCHEDULE, clusterRuns, isScheduled, scheduleOverlap, videoRunId, videoSteps, type ObservedRun } from "../lib/schedule.ts";

const z = (s: string) => new Date(s);
// IST = UTC + 5:30. 23:00 IST on 15 Oct = 17:30Z; 04:07 IST on 16 Oct = 22:37Z (15 Oct).
const run = (id: ObservedRun["id"], start: string, finish: string): ObservedRun => ({ id, start: z(start), finish: z(finish) });

test("the schedule lists every routine once, in order of the night", () => {
  assert.deepEqual(SCHEDULE.map((s) => s.ist), ["23:00", "23:47", "04:07", "06:17", "07:37", "09:07"]);
});

test("short runs raise nothing", () => {
  assert.equal(scheduleOverlap([
    run("auditor", "2026-10-15T17:33:00Z", "2026-10-15T17:50:00Z"),
    run("research", "2026-10-15T18:18:00Z", "2026-10-15T18:40:00Z"),
    run("video-main", "2026-10-15T22:38:00Z", "2026-10-16T00:10:00Z"),
    run("improver", "2026-10-16T00:48:00Z", "2026-10-16T01:20:00Z"),
    run("dashboard", "2026-10-16T02:09:00Z", "2026-10-16T02:50:00Z"),
    run("video-spare", "2026-10-16T03:38:00Z", "2026-10-16T03:47:00Z"),
  ]), null);
});

test("an auditor that outlasts 23:47 overlaps research, with numbers and a new time", () => {
  const f = scheduleOverlap([run("auditor", "2026-10-15T17:35:00Z", "2026-10-15T18:33:00Z")]);   // 23:05–00:03 IST
  assert.ok(f);
  assert.match(f.detail, /Auditor ran 23:05–00:03 IST \(58 min\), 16 min past the Research's start at 23:47/);
  assert.match(f.fix, /Move the Research from 23:47 to 00:15 IST/);
});

test("a video main run past 06:17 overlaps the improver but not the spare", () => {
  const f = scheduleOverlap([run("video-main", "2026-10-15T22:40:00Z", "2026-10-16T01:00:00Z")]);   // 04:10–06:30 IST
  assert.ok(f);
  assert.match(f.detail, /13 min past the Improver's start at 06:17/);
  assert.doesNotMatch(f.detail, /spare/);
  assert.match(f.fix, /Shorten the video run/);
});

test("a video main run past 09:07 IST and over 3 h raises both", () => {
  const f = scheduleOverlap([run("video-main", "2026-10-15T22:40:00Z", "2026-10-16T04:00:00Z")]);   // 04:10–09:30 IST
  assert.ok(f);
  assert.match(f.detail, /spare run's start at 09:07/);
  assert.match(f.detail, /over the 3 h limit/);
  assert.match(f.fix, /Move the Video spare run from 09:07 to 09:40 IST/);
});

test("exactly meeting the next start is not an overlap", () => {
  assert.equal(scheduleOverlap([run("improver", "2026-10-16T00:47:00Z", "2026-10-16T02:07:00Z")]), null);   // ends 07:37 IST
});

test("the last run of the cycle compares with the next evening's auditor", () => {
  assert.equal(scheduleOverlap([run("video-spare", "2026-10-16T03:38:00Z", "2026-10-16T05:00:00Z")]), null);
});

test("video runs are told apart by their start time", () => {
  assert.equal(videoRunId(z("2026-10-15T22:41:00Z")), "video-main");
  assert.equal(videoRunId(z("2026-10-16T03:39:00Z")), "video-spare");
});

test("videos made back to back are one run, a gap over an hour starts another", () => {
  const t = (iso: string) => z(iso);
  const runs = clusterRuns([
    { videoId: "a", start: t("2026-10-15T22:38:00Z"), end: t("2026-10-15T22:50:00Z") },
    { videoId: "a", start: t("2026-10-15T22:51:00Z"), end: t("2026-10-15T22:55:00Z") },
    { videoId: "b", start: t("2026-10-15T23:00:00Z"), end: t("2026-10-15T23:20:00Z") },
    { videoId: "c", start: t("2026-10-16T03:38:00Z"), end: t("2026-10-16T03:47:00Z") },
  ]);
  assert.equal(runs.length, 2);
  assert.equal(runs[0]!.videos, 2);
  assert.equal(runs[0]!.finish.toISOString(), "2026-10-15T23:20:00.000Z");
});

test("runs outside the nightly schedule (scout, studio, monthly) are ignored, not a crash", () => {
  // Scout 09:37 IST and Studio 14:37 IST report startedAt/finishedAt too; the watchdog passes them in
  const extra = [
    { id: "scout", start: z("2026-10-18T04:07:00Z"), finish: z("2026-10-18T04:30:00Z") },
    { id: "studio", start: z("2026-10-18T09:07:00Z"), finish: z("2026-10-18T10:00:00Z") },
  ] as unknown as ObservedRun[];
  assert.equal(scheduleOverlap(extra), null);
  const f = scheduleOverlap([...extra, run("auditor", "2026-10-15T17:35:00Z", "2026-10-15T18:33:00Z")]);
  assert.match(f?.detail ?? "", /Auditor ran 23:05–00:03 IST/);
  assert.ok(isScheduled("auditor"));
  assert.ok(!isScheduled("scout"));
});

test("marking a video uploaded hours later is not part of the video run", () => {
  // main run 04:08-04:50 IST; the owner marks a video uploaded at 13:40 IST the same day
  const step = (videoId: string | null, agent: string, start: string, end: string | null) => ({ videoId, agent, startedAt: z(start), finishedAt: end ? z(end) : null });
  const runs = clusterRuns(videoSteps([
    step("a", "planner", "2026-10-15T22:38:00Z", "2026-10-15T22:50:00Z"),
    step("a", "render", "2026-10-15T22:51:00Z", null),
    step("b", "render", "2026-10-15T23:00:00Z", "2026-10-15T23:20:00Z"),
    step("a", "manual_upload", "2026-10-16T08:10:00Z", "2026-10-16T08:10:00Z"),
    step("b", "manual_edit", "2026-10-16T08:12:00Z", "2026-10-16T08:12:00Z"),
    step(null, "template_builder", "2026-10-15T22:30:00Z", "2026-10-15T22:35:00Z"),
  ]));
  assert.equal(runs.length, 1);
  assert.equal(runs[0]!.finish.toISOString(), "2026-10-15T23:20:00.000Z");
  assert.equal(scheduleOverlap(runs.map((r) => ({ id: videoRunId(r.start), start: r.start, finish: r.finish }))), null);
});
