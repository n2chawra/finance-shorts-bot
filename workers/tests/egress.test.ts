import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { exportsNumbers } from "../ingest.ts";
import { trimDoc } from "../lib/agents-sync.ts";

test("the merge log and variant log go to the database trimmed; other docs whole", () => {
  const merges = Array.from({ length: 100 }, (_, i) => ({ n: i }));
  const out = trimDoc("mergeLog", { note: "x", merges }) as { note: string; merges: { n: number }[] };
  assert.equal(out.merges.length, 60);
  assert.equal(out.merges[0]!.n, 40);
  assert.equal(out.note, "x");
  assert.equal((trimDoc("armsLog", { entries: merges }) as { entries: unknown[] }).entries.length, 30);
  const feed = { topics: merges };
  assert.equal(trimDoc("topicFeed", feed), feed);
});

test("ingest re-exports the YouTube numbers on schedule, by hand and after Stats, not on pushes or releases", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "egress-"));
  const event = (name: string) => { const f = path.join(dir, `${name}.json`); writeFileSync(f, JSON.stringify({ workflow_run: { name } })); return f; };
  assert.equal(exportsNumbers({}), true);
  assert.equal(exportsNumbers({ GITHUB_EVENT_NAME: "schedule" }), true);
  assert.equal(exportsNumbers({ GITHUB_EVENT_NAME: "workflow_dispatch" }), true);
  assert.equal(exportsNumbers({ GITHUB_EVENT_NAME: "push" }), false);
  assert.equal(exportsNumbers({ GITHUB_EVENT_NAME: "workflow_run", GITHUB_EVENT_PATH: event("Stats") }), true);
  assert.equal(exportsNumbers({ GITHUB_EVENT_NAME: "workflow_run", GITHUB_EVENT_PATH: event("Release video") }), false);
});

test("agent docs are sent again only when they change", async () => {
  const { snapshotDocs } = await import("../lib/agents-sync.ts");
  const { mkdirSync } = await import("node:fs");
  const root = mkdtempSync(path.join(tmpdir(), "docs-"));
  mkdirSync(path.join(root, "config"), { recursive: true });
  const file = path.join(root, "config", "experiments.json");
  writeFileSync(file, JSON.stringify({ experiments: [{ id: "a" }] }));
  const rows = new Map<string, unknown>();
  const sent: string[] = [];
  const prisma = { repoDoc: {
    findUnique: async ({ where }: { where: { key: string } }) => (rows.has(where.key) ? { value: rows.get(where.key) } : null),
    upsert: async ({ where, update }: { where: { key: string }; update: { value: unknown } }) => { rows.set(where.key, update.value); sent.push(where.key); return { key: where.key }; },
  } };
  assert.equal(await snapshotDocs(prisma as never, root), 1);
  assert.deepEqual(sent, ["experiments", "docHashes"]);
  sent.length = 0;
  assert.equal(await snapshotDocs(prisma as never, root), 0);
  assert.deepEqual(sent, []);
  writeFileSync(file, JSON.stringify({ experiments: [{ id: "b" }] }));
  assert.equal(await snapshotDocs(prisma as never, root), 1);
});

test("each channel's activity file is its own row, tagged with its channel, and unchanged files are not sent again", async () => {
  const { importActivity } = await import("../lib/agents-sync.ts");
  const { mkdirSync } = await import("node:fs");
  const root = mkdtempSync(path.join(tmpdir(), "act-"));
  mkdirSync(path.join(root, "improvement", "activity"), { recursive: true });
  mkdirSync(path.join(root, "channels", "second-one"), { recursive: true });
  mkdirSync(path.join(root, "channels", "first-channel"), { recursive: true });
  const act = { agent: "research", day: "2026-11-23", summary: "s", decision: "acted", why: "w", findings: [], changes: [] };
  writeFileSync(path.join(root, "improvement", "activity", "2026-11-23-research.json"), JSON.stringify(act));
  writeFileSync(path.join(root, "improvement", "activity", "2026-11-23-second-one-research.json"), JSON.stringify({ ...act, summary: "other" }));
  const rows = new Map<string, Record<string, unknown>>();
  const docs = new Map<string, unknown>();
  const prisma = {
    agentActivity: {
      deleteMany: async () => ({ count: 0 }),
      upsert: async ({ where, create }: { where: { id: string }; create: Record<string, unknown> }) => { rows.set(where.id, create); return { id: where.id }; },
    },
    repoDoc: {
      findUnique: async ({ where }: { where: { key: string } }) => (docs.has(where.key) ? { value: docs.get(where.key) } : null),
      upsert: async ({ where, update }: { where: { key: string }; update: { value: unknown } }) => { docs.set(where.key, update.value); return { key: where.key }; },
    },
  };
  assert.equal(await importActivity(prisma as never, root), 2);
  assert.deepEqual([...rows.keys()].sort(), ["2026-11-23-research", "2026-11-23-second-one-research"]);
  assert.equal(rows.get("2026-11-23-second-one-research")!.channelId, "second-one");
  assert.equal(rows.get("2026-11-23-research")!.channelId, undefined);
  assert.equal(await importActivity(prisma as never, root), 0);
});
