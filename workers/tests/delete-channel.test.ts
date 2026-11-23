import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { allChannels, deletingChannels } from "../lib/channels.ts";
import { tokenOf } from "../lib/channel-auth.ts";
import { refusal, releaseTag, repoDocKeysOf, safeIds, settingKeysOf } from "../lib/delete-channel.ts";

test("only a channel marked deleting (or already gone from the database) may be deleted", () => {
  assert.equal(refusal("some-channel", "deleting"), null);
  assert.equal(refusal("some-channel", null), null);
  assert.match(refusal("some-channel", "active")!, /not deleting/);
  assert.match(refusal("some-channel", "paused")!, /not deleting/);
  assert.match(refusal("../etc", "deleting")!, /bad channel slug/);
  assert.match(refusal("", "deleting")!, /bad channel slug/);
});

test("release tags and safe ids", () => {
  assert.equal(releaseTag("v-20261121-21"), "video-v-20261121-21");
  assert.deepEqual(safeIds(["v-2", "L-1", "v-2", "bad id", "$(rm)", ""]), ["L-1", "v-2"]);
});

test("a channel's own RepoDoc and Setting keys, never another channel's or the platform's", () => {
  const docs = ["topicFeed", "docHashes", "activityHashes", "appliedTemplateDecisions", "space:topicFeed", "space-two:topicFeed", "other:topicFeed"];
  assert.deepEqual(repoDocKeysOf("space", docs, ["topicFeed", "docHashes"]), ["space:topicFeed"]);
  // channel #1's docs are the plain per-channel keys; the platform's plain keys stay
  assert.deepEqual(repoDocKeysOf("paisa-panchayat", docs, ["topicFeed", "docHashes"]), ["topicFeed", "docHashes"]);
  const settings = ["statsDeepAt", "statsDeepAt:space", "statsDeepAt:space-two", "space:statsRefreshedAt", "quotaUsage"];
  assert.deepEqual(settingKeysOf("space", settings), ["statsDeepAt:space", "space:statsRefreshedAt"]);
  assert.deepEqual(settingKeysOf("paisa-panchayat", settings), []);
});

test("workers skip a channel being deleted", () => {
  const root = mkdtempSync(path.join(tmpdir(), "del-"));
  for (const s of ["alive", "going"]) mkdirSync(path.join(root, "channels", s), { recursive: true });
  mkdirSync(path.join(root, "config"));
  writeFileSync(path.join(root, "config", "channels.json"), JSON.stringify({ channels: { alive: { status: "active" }, going: { status: "deleting" } } }));
  assert.deepEqual([...deletingChannels(root)], ["going"]);
  assert.deepEqual(allChannels(root), ["alive"]);
});

test("the YT_REFRESH_TOKEN secret never signs in a channel other than channel #1", () => {
  const env = { YT_REFRESH_TOKEN: "env-token" } as NodeJS.ProcessEnv;
  assert.equal(tokenOf({ id: "geography-maps-geopolitical-mysteries", refreshTokenEnc: null }, env), null);
});
