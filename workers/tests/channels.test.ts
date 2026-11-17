import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { channelSettings, decryptToken, encryptToken, refreshTokenOf } from "../lib/channel-auth.ts";
import { cpath, crel, mapped } from "../lib/channels.ts";
import { COST, QuotaKeeper, allowed, quotaDay } from "../lib/quota.ts";
import { DEFAULT_SETTINGS } from "../lib/settings.ts";

const SECRET = "a-test-secret-of-enough-length";

test("legacy paths until the channel has a folder, then the folder", () => {
  const root = mkdtempSync(path.join(tmpdir(), "ch-"));
  assert.equal(crel("videos/v-1/plan.json", root, "paisa-panchayat"), "videos/v-1/plan.json");
  mkdirSync(path.join(root, "channels", "paisa-panchayat"), { recursive: true });
  assert.equal(crel("videos/v-1/plan.json", root, "paisa-panchayat"), "channels/paisa-panchayat/videos/v-1/plan.json");
  assert.equal(crel("improvement/research/topics.json", root, "paisa-panchayat"), "channels/paisa-panchayat/research/topics.json");
  assert.equal(crel("config/settings.json", root, "paisa-panchayat"), "config/settings.json");
  assert.equal(mapped("improvement/activity/x.json"), null);
  process.env.CHANNEL = "paisa-panchayat";
  assert.equal(cpath(root, "history", "history.json"), path.join(root, "channels", "paisa-panchayat", "history", "history.json"));
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
  assert.equal(refreshTokenOf({ id: "paisa-panchayat", refreshTokenEnc: null }, env), "env-token");
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

test("quota: uploads first, covers next, stats only from what's left", () => {
  // two uploads still due today reserve 3,300 units
  assert.ok(allowed("upload", COST.upload, 8_000, 2));
  assert.ok(!allowed("upload", COST.upload, 8_500, 2));
  assert.ok(allowed("thumbnail", COST.thumbnail, 6_600, 2));
  assert.ok(!allowed("thumbnail", COST.thumbnail, 6_700, 2));
  assert.ok(allowed("stats", 100, 6_000, 2));
  assert.ok(!allowed("stats", 100, 6_300, 2));   // 5% margin
  assert.ok(!allowed("counters", 1, 9_500, 0));
});

test("the keeper counts what it allows and warns once past 80%", () => {
  const k = new QuotaKeeper(null, { day: quotaDay(), units: 7_000, byKind: {}, warned: false }, 1);
  assert.ok(!k.take("stats", 900));   // 3,000 free − 1,650 reserved − 500 margin = 850
  assert.equal(k.used, 7_000);
  assert.ok(k.take("upload", COST.upload));
  assert.equal(k.uploadsLeftToday, 0);
  assert.equal(k.used, 8_600);
  assert.ok(k.shouldWarn());
  assert.ok(!k.shouldWarn());
  assert.equal(k.snapshot().byKind.upload, COST.upload);
});

test("a manifest belongs to the channel folder it sits in", async () => {
  const { channelOfManifest } = await import("../ingest.ts");
  const root = path.join(tmpdir(), "repo");
  assert.equal(channelOfManifest(path.join(root, "videos", "v-1", "manifest.json"), root), "paisa-panchayat");
  assert.equal(channelOfManifest(path.join(root, "channels", "second-one", "videos", "v-1", "manifest.json"), root), "second-one");
});

test("a token sealed by the dashboard's Connect YouTube opens with its web client", async () => {
  const { openToken, tokenOf } = await import("../lib/channel-auth.ts");
  const sealed = encryptToken(JSON.stringify({ rt: "1//web-token", client: "web" }), SECRET);
  assert.deepEqual(openToken(sealed, SECRET), { refreshToken: "1//web-token", client: "web" });
  assert.deepEqual(openToken(encryptToken("bare", SECRET), SECRET), { refreshToken: "bare", client: "desktop" });
  assert.deepEqual(tokenOf({ id: "second", refreshTokenEnc: sealed }, { SESSION_SECRET: SECRET } as NodeJS.ProcessEnv), { refreshToken: "1//web-token", client: "web" });
});
