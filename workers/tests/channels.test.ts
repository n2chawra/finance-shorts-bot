import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { channelSettings, decryptToken, encryptToken, refreshTokenOf } from "../lib/channel-auth.ts";
import { CHANNEL_ONE, cpath, crel, layout, mapped } from "../lib/channels.ts";
import { COST, QuotaKeeper, allowed, migrate, quotaDay } from "../lib/quota.ts";
import { DEFAULT_SETTINGS } from "../lib/settings.ts";

const SECRET = "a-test-secret-of-enough-length";

test("legacy paths until the channel has a folder, then the folder", () => {
  const root = mkdtempSync(path.join(tmpdir(), "ch-"));
  assert.equal(crel("videos/v-1/plan.json", root, "first-channel"), "videos/v-1/plan.json");
  mkdirSync(path.join(root, "channels", "first-channel"), { recursive: true });
  assert.equal(crel("videos/v-1/plan.json", root, "first-channel"), "channels/first-channel/videos/v-1/plan.json");
  assert.equal(crel("improvement/research/topics.json", root, "first-channel"), "channels/first-channel/research/topics.json");
  assert.equal(crel("config/settings.json", root, "first-channel"), "config/settings.json");
  assert.equal(mapped("improvement/activity/x.json"), null);
  process.env.CHANNEL = "first-channel";
  assert.equal(cpath(root, "history", "history.json"), path.join(root, "channels", "first-channel", "history", "history.json"));
  delete process.env.CHANNEL;
});

test("tokens round-trip, and a wrong secret can't read them", () => {
  const sealed = encryptToken("1//refresh-token", SECRET);
  assert.ok(sealed.startsWith("v1.") && !sealed.includes("refresh-token"));
  assert.equal(decryptToken(sealed, SECRET), "1//refresh-token");
  assert.throws(() => decryptToken(sealed, "another-secret-of-enough-length"));
});

test("channel #1 falls back to the secret until its token is stored; others need their own", () => {
  const env = { YT_REFRESH_TOKEN: "env-token", SESSION_SECRET: SECRET } as NodeJS.ProcessEnv;
  assert.equal(refreshTokenOf({ id: CHANNEL_ONE, refreshTokenEnc: null }, env), "env-token");
  assert.equal(refreshTokenOf({ id: "second", refreshTokenEnc: null }, env), null);
  assert.equal(refreshTokenOf({ id: "second", refreshTokenEnc: encryptToken("own", SECRET) }, env), "own");
});

test("a channel overrides only its own settings, and bad values are ignored", () => {
  const s = channelSettings(DEFAULT_SETTINGS, { dailyVideoTarget: 1, uploadTimes: ["08:07"], agents: { paused: true } });
  assert.equal(s.dailyVideoTarget, 1);
  assert.deepEqual(s.uploadTimes, ["08:07"]);
  assert.equal(s.agents.paused, DEFAULT_SETTINGS.agents.paused);
  assert.deepEqual(channelSettings(DEFAULT_SETTINGS, { dailyVideoTarget: 99 }), DEFAULT_SETTINGS);
  assert.deepEqual(channelSettings(DEFAULT_SETTINGS, null), DEFAULT_SETTINGS);
});

test("quota: uploads and searches have their own buckets, each with a margin", () => {
  // uploads stop at 95 of 100 calls, whatever the units pool says
  assert.ok(allowed("upload", COST.upload, 94, 0));
  assert.ok(!allowed("upload", COST.upload, 95, 0));
  assert.ok(allowed("search", COST.search, 94, 0));
  assert.ok(!allowed("search", COST.search, 95, 0));
  assert.ok(allowed("upload", COST.upload, 0, 0, { uploads: 200 }) && allowed("upload", 1, 190, 0, { uploads: 200 }));
  // the units pool: covers reserved for the uploads still due, then a 5% margin for stats and counters
  assert.ok(allowed("thumbnail", COST.thumbnail, 9_850, 2));
  assert.ok(!allowed("thumbnail", COST.thumbnail, 9_860, 2));   // 140 free − 100 reserved < 50
  assert.ok(allowed("stats", 100, 9_300, 2));
  assert.ok(!allowed("stats", 100, 9_350, 2));   // 650 free − 100 reserved − 500 margin = 50
  assert.ok(!allowed("counters", 1, 9_500, 0));
});

test("the keeper counts each bucket apart and warns once past 80%", () => {
  const k = new QuotaKeeper(null, { day: quotaDay(), units: 9_800, uploads: 4, searches: 14, byKind: {}, warned: false }, 1);
  // a full units pool never holds back an upload
  assert.ok(!k.take("stats", 100));
  assert.ok(k.take("upload", COST.upload));
  assert.equal(k.uploadsUsed, 5);
  assert.equal(k.used, 9_800);
  assert.equal(k.uploadsLeftToday, 0);
  assert.ok(k.take("thumbnail", COST.thumbnail));
  assert.equal(k.used, 9_850);
  assert.ok(k.take("search", COST.search));
  assert.equal(k.searchesUsed, 15);
  assert.equal(k.searchesLeft, 80);
  assert.equal(k.uploadsLeft, 90);
  assert.ok(k.shouldWarn());
  assert.ok(!k.shouldWarn());
  assert.equal(k.snapshot().byKind.upload, 1);
  assert.match(k.summary(), /uploads 5 of 100, searches 15 of 100, other calls 9,850 of 10,000 units/);
  // 95 uploads: the next one waits for midnight Pacific
  const full = new QuotaKeeper(null, { day: quotaDay(), units: 0, uploads: 95, searches: 0, byKind: {}, warned: false });
  assert.ok(!full.take("upload", COST.upload));
  assert.equal(full.uploadsUsed, 95);
  assert.ok(full.shouldWarn());   // uploads past 80%
});

test("quota day resets at midnight Pacific, and an old single-pool row moves to the buckets", () => {
  assert.equal(quotaDay(new Date("2026-11-19T07:59:00Z")), "2026-11-18");   // 23:59 PST
  assert.equal(quotaDay(new Date("2026-11-19T08:00:00Z")), "2026-11-19");   // 00:00 PST
  const m = migrate({ day: "2026-11-19", units: 4 * 1_600 + 4 * 50 + 300, byKind: { upload: 6_400, thumbnail: 200, stats: 300 }, warned: false });
  assert.deepEqual([m.uploads, m.searches, m.units, m.byKind.upload], [4, 0, 500, 4]);
  assert.equal(migrate({ day: "d", units: 10, uploads: 2, searches: 3, byKind: {}, warned: false }).uploads, 2);
});

test("a manifest belongs to the channel folder it sits in", async () => {
  const { channelOfManifest } = await import("../ingest.ts");
  const root = path.join(tmpdir(), "repo");
  assert.equal(channelOfManifest(path.join(root, "videos", "v-1", "manifest.json"), root), layout().default);
  assert.equal(channelOfManifest(path.join(root, "channels", "second-one", "videos", "v-1", "manifest.json"), root), "second-one");
});

test("a token sealed by the dashboard's Connect YouTube opens with its web client", async () => {
  const { openToken, tokenOf } = await import("../lib/channel-auth.ts");
  const sealed = encryptToken(JSON.stringify({ rt: "1//web-token", client: "web" }), SECRET);
  assert.deepEqual(openToken(sealed, SECRET), { refreshToken: "1//web-token", client: "web" });
  assert.deepEqual(openToken(encryptToken("bare", SECRET), SECRET), { refreshToken: "bare", client: "desktop" });
  assert.deepEqual(tokenOf({ id: "second", refreshTokenEnc: sealed }, { SESSION_SECRET: SECRET } as NodeJS.ProcessEnv), { refreshToken: "1//web-token", client: "web" });
});

test("a setup stage from the repo only moves forward, and never past the verdict without the owner's Continue", async () => {
  const { nextStage } = await import("../lib/setup-sync.ts");
  assert.equal(nextStage(undefined, "scanning", false), "scanning");
  assert.equal(nextStage("scanning", "verdict", false), "verdict");
  assert.equal(nextStage("verdict", "research", false), "verdict");
  assert.equal(nextStage("scanning", "build", false), "verdict");
  assert.equal(nextStage("research", "build", true), "build");
  assert.equal(nextStage("build", "research", true), "build");
  assert.equal(nextStage("stopped", "build", true), "stopped");
  assert.equal(nextStage("research", "stopped", true), "stopped");
});

test("the skill's fixed notes are marked done; the review material is read from the channel folder", async () => {
  const { notesDone, reviewMaterial } = await import("../lib/setup-sync.ts");
  const { mkdirSync, writeFileSync } = await import("node:fs");
  const dir = mkdtempSync(path.join(tmpdir(), "review-"));
  mkdirSync(path.join(dir, "research"), { recursive: true });
  mkdirSync(path.join(dir, "videos", "v-20261120-01"), { recursive: true });
  writeFileSync(path.join(dir, "research", "advice.md"), "## Topic kinds\nObjects in space");
  writeFileSync(path.join(dir, "research", "counts.json"), JSON.stringify({ shortsPerDay: 2, longPerWeek: 0, reasons: [] }));
  writeFileSync(path.join(dir, "videos", "v-20261120-01", "likeness.json"), JSON.stringify({ pass: true, within: 4, of: 5, rows: [] }));
  writeFileSync(path.join(dir, "review-notes.json"), JSON.stringify([{ at: "2026-11-20T10:00:00Z", done: true, fix: "slower voice in channel.json" }]));
  const m = reviewMaterial(dir);
  assert.ok(m.advice?.startsWith("## Topic kinds"));
  assert.deepEqual(Object.keys(m.likeness), ["v-20261120-01"]);
  const notes = notesDone([{ at: "2026-11-20T10:00:00Z", text: "slower" }, { at: "2026-11-20T11:00:00Z", text: "brighter" }], dir);
  assert.equal(notes[0]!.done, true);
  assert.equal(notes[0]!.fix, "slower voice in channel.json");
  assert.equal(notes[1]!.done, undefined);
});
