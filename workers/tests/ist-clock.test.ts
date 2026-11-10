import assert from "node:assert/strict";
import { test } from "node:test";

import { istHour, istWeekday } from "../lib/ist-clock.ts";

// the reference: what a clock in India shows (IST = UTC+5:30, no daylight saving)
const india = (d: Date) => {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", hourCycle: "h23", weekday: "short" }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return { hour: Number(get("hour")), weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")) };
};

test("the IST hour and weekday match India's clock, every 7 minutes for a week", () => {
  // the formulas watchdog.ts used inline before wrk-q01, pinned here so the refactor keeps them
  const oldHour = (now: Date) => (now.getUTCHours() + 5 + Math.floor((now.getUTCMinutes() + 30) / 60)) % 24;
  const oldWeekday = (now: Date) => new Date(now.getTime() + 330 * 60_000).getUTCDay();
  for (let t = Date.parse("2026-11-08T00:00:00Z"); t < Date.parse("2026-11-15T00:00:00Z"); t += 7 * 60_000) {
    const d = new Date(t);
    const want = india(d);
    assert.equal(oldHour(d), want.hour, d.toISOString());
    assert.equal(oldWeekday(d), want.weekday, d.toISOString());
    assert.equal(istHour(d), want.hour, d.toISOString());
    assert.equal(istWeekday(d), want.weekday, d.toISOString());
  }
});

test("18:29Z is 23:59 IST the same day; 18:30Z is midnight and the next weekday", () => {
  assert.deepEqual([istHour(new Date("2026-11-10T18:29:59Z")), istWeekday(new Date("2026-11-10T18:29:59Z"))], [23, 2]);
  assert.deepEqual([istHour(new Date("2026-11-10T18:30:00Z")), istWeekday(new Date("2026-11-10T18:30:00Z"))], [0, 3]);
});
