import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { cpath, videoFile } from "../lib/channels.ts";
import { dropPoints, spokenBeats } from "../lib/retention.ts";

const ROOT = path.resolve(import.meta.dirname, "..", "..");
const GEO = "geography-maps-geopolitical-mysteries";
const ID = "v-20261119-02";   // Greenland: its drops had no line or beat on 21 Nov

test("a video's file is looked up in its own channel's folder, not the default channel's", () => {
  const file = videoFile(ROOT, GEO, ID, "timeline.json");
  assert.equal(path.relative(ROOT, file), path.join("channels", GEO, "videos", ID, "timeline.json"));
  assert.ok(existsSync(file));
  // what stats.ts did before: CHANNEL is unset there, so cpath looked in Paisa Panchayat's folder
  if (!process.env.CHANNEL) assert.equal(existsSync(cpath(ROOT, "videos", ID, "timeline.json")), false);
});

test("another channel's drop is matched to its beat and spoken line", () => {
  const beats = spokenBeats(JSON.parse(readFileSync(videoFile(ROOT, GEO, ID, "timeline.json"), "utf8")));
  assert.ok(beats.length > 0);
  const curve: [number, number][] = Array.from({ length: 100 }, (_, i) => [(i + 1) / 100, i < 10 ? 1.6 : 1.2]);
  const [d] = dropPoints(curve, 62, beats);
  assert.ok(d && d.beat !== "" && d.line !== "");
});
