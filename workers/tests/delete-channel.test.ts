import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { activityChannel } from "../lib/agents-sync.ts";
import { allChannels, deletingChannels, inRepo, liveInRepo } from "../lib/channels.ts";
import { activeChannels, tokenOf } from "../lib/channel-auth.ts";
import { idsOfOtherChannels, idsToDelete, isPlatformNotice, refusal, releaseTag, repoDocKeysOf, repoState, repoVideoIds, safeIds, settingKeysOf } from "../lib/delete-channel.ts";
import { workflowNotices } from "../lib/notify.ts";

const GONE = { defaultChannel: "home", folder: false, listedStatus: null };

test("only a channel marked deleting (or already gone from the database and the repo) may be deleted", () => {
  assert.equal(refusal("some-channel", "deleting", GONE), null);
  assert.equal(refusal("some-channel", "deleting", { ...GONE, folder: true, listedStatus: "active" }), null);   // the dashboard marked it
  assert.equal(refusal("some-channel", null, GONE), null);   // a re-run of the cleanup
  assert.equal(refusal("some-channel", null, { ...GONE, listedStatus: "deleting" }), null);
  assert.match(refusal("some-channel", "active", GONE)!, /not deleting/);
  assert.match(refusal("some-channel", "paused", GONE)!, /not deleting/);
  assert.match(refusal("../etc", "deleting", GONE)!, /bad channel slug/);
  assert.match(refusal("", "deleting", GONE)!, /bad channel slug/);
});

test("no Channel row is not a licence to delete: a channel with a folder or listed live is refused", () => {
  assert.match(refusal("typo-channel", null, { ...GONE, folder: true })!, /still has its channels\/typo-channel\/ folder/);
  assert.match(refusal("typo-channel", null, { ...GONE, listedStatus: "active" })!, /lists it as active/);
});

test("the default channel is never deleted", () => {
  assert.match(refusal("home", "deleting", GONE)!, /default channel/);
  assert.match(refusal("home", null, GONE)!, /default channel/);
});

test("repoState reads the folder and config/channels.json", () => {
  const root = mkdtempSync(path.join(tmpdir(), "del-state-"));
  mkdirSync(path.join(root, "channels", "here"), { recursive: true });
  mkdirSync(path.join(root, "config"));
  writeFileSync(path.join(root, "config", "channels.json"), JSON.stringify({ channels: { here: { status: "active" } } }));
  assert.deepEqual(repoState(root, "here", "home"), { defaultChannel: "home", folder: true, listedStatus: "active" });
  assert.deepEqual(repoState(root, "gone", "home"), { defaultChannel: "home", folder: false, listedStatus: null });
});

test("the ids to delete never include another channel's videos", () => {
  const root = mkdtempSync(path.join(tmpdir(), "del-ids-"));
  const hist = (slug: string, ids: string[]) => {
    mkdirSync(path.join(root, "channels", slug, "history"), { recursive: true });
    writeFileSync(path.join(root, "channels", slug, "history", "history.json"), JSON.stringify(ids.map((id) => ({ id }))));
  };
  hist("going", ["v-1", "v-2"]);
  mkdirSync(path.join(root, "channels", "going", "videos", "v-3"), { recursive: true });
  hist("other", ["v-9"]);
  mkdirSync(path.join(root, "channels", "other", "videos", "v-2"), { recursive: true });   // a mislabelled one
  assert.deepEqual(repoVideoIds(root, "going").sort(), ["v-1", "v-2", "v-3"]);
  const others = idsOfOtherChannels(root, "going");
  assert.deepEqual([...others].sort(), ["v-2", "v-9"]);
  assert.deepEqual(idsToDelete(["v-4", "v-9", "bad id"], repoVideoIds(root, "going"), others), { ids: ["v-1", "v-3", "v-4"], kept: ["v-2", "v-9"] });
  // a channel whose folder is gone: only its database ids
  assert.deepEqual(idsToDelete(["v-5"], repoVideoIds(root, "gone"), idsOfOtherChannels(root, "gone")), { ids: ["v-5"], kept: [] });
});

test("platform notifications are told apart from channel #1's own", () => {
  for (const k of ["site-down", "agents-paused", "schedule-overlap", "reporting-api-needed", "workflow:Publish", "agent-silent:auditor", "agent-blocked:improver", "quota-high:2026-11-23"]) assert.equal(isPlatformNotice(k), true, k);
  for (const k of ["queue-empty", "youtube-token", "upload-failed:v-1", "stats-errors", "agent:research:x", "data-audit:unlinked"]) assert.equal(isPlatformNotice(k), false, k);
  // and are written platform-wide from now on
  assert.equal(workflowNotices([{ name: "Publish", conclusion: "failure", html_url: "u", created_at: "2026-11-23T00:00:00Z" }])[0]!.raise!.channelId, null);
});

test("shared agents' activity is platform-wide; a deleted channel's reports aren't imported", () => {
  const slugs = ["geo", "geo-two"];
  assert.equal(activityChannel("2026-11-23-geo-two-research", "2026-11-23", "research", slugs), "geo-two");
  assert.equal(activityChannel("2026-11-23-geo-research", "2026-11-23", "research", slugs), "geo");
  assert.equal(activityChannel("2026-11-23-auditor", "2026-11-23", "auditor", slugs), null);
  assert.equal(activityChannel("2026-11-23-improver", "2026-11-23", "improver", slugs), null);
  // channel #1's plain reports: its own while it is in the repo, skipped once it's gone
  assert.equal(activityChannel("2026-11-20-research", "2026-11-20", "research", slugs), undefined);
  assert.equal(activityChannel("2026-11-20-research", "2026-11-20", "research", [...slugs, "paisa-panchayat"]), "paisa-panchayat");
  assert.equal(activityChannel("2026-11-20-going-down-studio", "2026-11-20", "studio", slugs), undefined);
  assert.equal(activityChannel("2026-11-20-going-down-auditor", "2026-11-20", "auditor", slugs), undefined);
});

test("a channel whose folder is gone from the repo is not live while others' folders remain", async () => {
  const root = mkdtempSync(path.join(tmpdir(), "del-live-"));
  assert.equal(inRepo("anything", root), true);   // before the multi-channel move: no folders at all
  mkdirSync(path.join(root, "channels", "alive"), { recursive: true });
  assert.equal(inRepo("alive", root), true);
  assert.equal(inRepo("removed", root), false);
  const rows = [{ id: "removed", status: "active" }, { id: "alive", status: "active" }];
  assert.deepEqual(liveInRepo(rows, root).map((r) => r.id), ["alive"]);
  // publish, stats and watchdog take their channels from activeChannels
  const prisma = { channel: { findMany: async () => rows } } as unknown as Parameters<typeof activeChannels>[0];
  assert.deepEqual((await activeChannels(prisma, true, root)).map((c) => c.id), ["alive"]);
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
  // and its reviewer lessons (snapshotDocs writes them under the plain key "lessons")
  assert.deepEqual(repoDocKeysOf("paisa-panchayat", [...docs, "lessons", "space:lessons"], ["topicFeed"]), ["topicFeed", "lessons"]);
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
