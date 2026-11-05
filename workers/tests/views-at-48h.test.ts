import assert from "node:assert/strict";
import { test } from "node:test";

import { viewsAt48h } from "../lib/agents-sync.ts";

const H = 3_600_000;
const pub = new Date("2026-11-03T07:07:00Z");
const at = (h: number, views: number) => ({ hour: new Date(pub.getTime() + h * H), views });

test("a snapshot 48-51 h after publishing is the 48-hour count, as before", () => {
  assert.equal(viewsAt48h([at(45, 10), at(49, 30), at(50, 31)], pub), 30);
  assert.equal(viewsAt48h([], pub), null);
  assert.equal(viewsAt48h([at(40, 10)], pub), null);   // not 48 h old yet
});

test("the 'hourly' watchdog runs every 5-9 h on GitHub: interpolate across a gap that skips the window", () => {
  // real runs on 4-5 Nov: 22:36, 03:28, 12:14 UTC; no snapshot fell inside 48-51 h
  assert.equal(viewsAt48h([at(44, 100), at(54, 200)], pub), 140);
  assert.equal(viewsAt48h([at(47, 100), at(52, 101)], pub), 100);
});

test("no guess across a gap longer than 12 h, or without a snapshot on both sides", () => {
  assert.equal(viewsAt48h([at(40, 100), at(53, 200)], pub), null);
  assert.equal(viewsAt48h([at(55, 200)], pub), null);
});
