import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { Activity, AgentNotice } from "../lib/agents-sync.ts";

const ROOT = path.resolve(import.meta.dirname, "..", "..");

test("an activity report with null optional fields is kept (Scout, 2026-10-18)", () => {
  const a = Activity.parse({
    agent: "scout", day: "2026-10-18", summary: "s", decision: "acted", why: "w", startedAt: null,
    findings: [{ title: "f", detail: null, link: null }], changes: [{ title: "c", branch: "agent/scout/2026-10-18", experiment: null }],
  });
  assert.equal(a.changes[0]!.experiment, undefined);
  assert.equal(a.findings[0]!.link, undefined);
  assert.equal(a.startedAt, undefined);
});

test("every activity file in the repo parses", () => {
  const dir = path.join(ROOT, "improvement", "activity");
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    const r = Activity.safeParse(JSON.parse(readFileSync(path.join(dir, f), "utf8")));
    assert.ok(r.success, `${f}: ${r.success ? "" : r.error.issues[0]?.message}`);
  }
});

test("a notification may say id for key and low/medium/high for severity", () => {
  const n = AgentNotice.parse({ id: "env-pillow", severity: "low", title: "t", detail: "d", fix: "f", found: "2026-10-18" });
  assert.deepEqual([n.key, n.severity], ["env-pillow", "info"]);
  assert.equal(AgentNotice.parse({ key: "k", severity: "high", title: "t" }).severity, "critical");
  assert.equal(AgentNotice.safeParse({ severity: "info", title: "no key" }).success, false);
});

test("every agent notifications file in the repo parses", () => {
  const dir = path.join(ROOT, "improvement", "notifications");
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    const items = (JSON.parse(readFileSync(path.join(dir, f), "utf8")) as { notifications?: unknown[] }).notifications ?? [];
    for (const [i, raw] of items.entries()) {
      const r = AgentNotice.safeParse(raw);
      assert.ok(r.success, `${f} item ${i}: ${r.success ? "" : r.error.issues[0]?.message}`);
    }
  }
});

// ---------------- the editor's ranking and the owner's feedback (2026-10-30) ----------------

function fakeVideos(rows: { id: string; format: string; queuePosition: number; orderLocked: boolean; style?: unknown }[]) {
  const data = new Map(rows.map((r) => [r.id, { ...r, createdAt: new Date("2026-11-01"), editorRank: null as number | null }]));
  const prisma = {
    video: {
      findMany: async () => [...data.values()],
      update: async ({ where, data: d }: { where: { id: string }; data: Record<string, unknown> }) => Object.assign(data.get(where.id)!, d),
    },
    $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
  };
  return { prisma, data };
}

test("the editor's ranking orders the queue, but the owner's own order stays first", async () => {
  const { mkdtempSync, mkdirSync, writeFileSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { importEditorRanking } = await import("../lib/agents-sync.ts");
  const root = mkdtempSync(path.join(tmpdir(), "rank-"));
  mkdirSync(path.join(root, "improvement", "editor"), { recursive: true });
  writeFileSync(path.join(root, "improvement", "editor", "ranking.json"), JSON.stringify({ rankedAt: "2026-11-02T01:00:00Z", videos: [
    { id: "c", rank: 1, score: 8.6, why: "best hook" }, { id: "a", rank: 2, score: 7, why: "ok" }, { id: "b", rank: 3, score: 6, why: "weaker" }] }));
  const { prisma, data } = fakeVideos([
    { id: "a", format: "short", queuePosition: 1, orderLocked: false }, { id: "b", format: "short", queuePosition: 2, orderLocked: false },
    { id: "c", format: "short", queuePosition: 3, orderLocked: false }, { id: "d", format: "short", queuePosition: 4, orderLocked: true }]);
  const ranked = await importEditorRanking(prisma as never, root);
  assert.deepEqual(ranked.sort(), ["a", "b", "c"]);
  const order = [...data.values()].sort((x, y) => x.queuePosition - y.queuePosition).map((v) => v.id);
  assert.deepEqual(order, ["d", "c", "a", "b"]);     // the owner's placed video, then the editor's order
  assert.equal(data.get("c")!.editorRank, 1);
});

test("an empty ranking leaves the queue alone", async () => {
  const { mkdtempSync, mkdirSync, writeFileSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { importEditorRanking } = await import("../lib/agents-sync.ts");
  const root = mkdtempSync(path.join(tmpdir(), "rank-"));
  mkdirSync(path.join(root, "improvement", "editor"), { recursive: true });
  writeFileSync(path.join(root, "improvement", "editor", "ranking.json"), JSON.stringify({ rankedAt: "2026-11-02T01:00:00Z", videos: [] }));
  const { prisma, data } = fakeVideos([{ id: "a", format: "short", queuePosition: 2, orderLocked: false }]);
  assert.deepEqual(await importEditorRanking(prisma as never, root), []);
  assert.equal(data.get("a")!.queuePosition, 2);
});

test("the improver's answers mark the owner's notes addressed", async () => {
  const { mkdtempSync, mkdirSync, writeFileSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { importFeedbackAcks } = await import("../lib/agents-sync.ts");
  const root = mkdtempSync(path.join(tmpdir(), "acks-"));
  mkdirSync(path.join(root, "improvement"), { recursive: true });
  writeFileSync(path.join(root, "improvement", "feedback-acks.json"), JSON.stringify({ acks: [{ id: "f1", action: "fixed", note: "hooks end on the question now", commit: "abc1234" }] }));
  const notes = new Map([["f1", { id: "f1", status: "open", response: null as string | null, addressedAt: null as Date | null }]]);
  const prisma = { feedback: {
    findUnique: async ({ where }: { where: { id: string } }) => notes.get(where.id) ?? null,
    update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => Object.assign(notes.get(where.id)!, data),
  } };
  assert.equal(await importFeedbackAcks(prisma as never, root), 1);
  assert.equal(notes.get("f1")!.status, "addressed");
  assert.match(notes.get("f1")!.response!, /fixed: hooks end on the question now/);
  assert.equal(await importFeedbackAcks(prisma as never, root), 0);   // once
});

test("a note handed to another agent stays open until that agent answers", async () => {
  const { mkdtempSync, mkdirSync, writeFileSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { importFeedbackAcks } = await import("../lib/agents-sync.ts");
  const root = mkdtempSync(path.join(tmpdir(), "acks-"));
  mkdirSync(path.join(root, "improvement", "feedback-acks"), { recursive: true });
  const put = (agent: string, acks: unknown[]) => writeFileSync(path.join(root, "improvement", "feedback-acks", `${agent}.json`), JSON.stringify({ acks }));
  put("improver", [{ id: "f1", action: "partly", to: "dashboard", note: "the data file is ready", commit: "abc" }]);
  const notes = new Map([
    ["f1", { id: "f1", status: "open", response: null as string | null, addressedAt: null as Date | null }],
    ["f2", { id: "f2", status: "addressed", response: "closed by the owner" as string | null, addressedAt: new Date() as Date | null }],
  ]);
  const prisma = { feedback: {
    findUnique: async ({ where }: { where: { id: string } }) => notes.get(where.id) ?? null,
    update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => Object.assign(notes.get(where.id)!, data),
  } };
  await importFeedbackAcks(prisma as never, root);
  assert.equal(notes.get("f1")!.status, "open");
  assert.match(notes.get("f1")!.response!, /improver partly → dashboard: the data file is ready \(abc\) · waiting for dashboard/);
  put("dashboard", [{ id: "f1", action: "fixed", note: "Impact page built" }, { id: "f2", action: "handed", to: "research", note: "topics are research's" }]);
  await importFeedbackAcks(prisma as never, root);
  assert.equal(notes.get("f1")!.status, "addressed");
  assert.match(notes.get("f1")!.response!, /dashboard fixed: Impact page built/);
  assert.equal(notes.get("f2")!.status, "addressed");   // the owner closed it: a handoff never reopens it
});

test("an agent that does its part of a handed note and passes the rest on counts as answered", async () => {
  const { ackState } = await import("../lib/agents-sync.ts");
  const chain = [
    { id: "f1", action: "partly", to: "improver", note: "data fixed", agent: "auditor" },
    { id: "f1", action: "partly", to: "studio", note: "Shorts fixed", agent: "improver" },
  ];
  assert.match(ackState(chain).response, /waiting for studio$/);
  const done = ackState([...chain, { id: "f1", action: "fixed", note: "thumbnail redone", agent: "studio" }]);
  assert.equal(done.addressed, true);
  assert.doesNotMatch(done.response, /waiting/);
  // handed straight back to the agent that handed it: that one still owes an answer
  const back = ackState([
    { id: "f2", action: "handed", to: "improver", note: "a look", agent: "auditor" },
    { id: "f2", action: "handed", to: "auditor", note: "a crash", agent: "improver" },
  ]);
  assert.match(back.response, /waiting for/);
  assert.equal(back.addressed, false);
});

test("a trend Short ingest put first keeps its place when the morning ranking doesn't list it", async () => {
  const { mkdtempSync, mkdirSync, writeFileSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { importEditorRanking } = await import("../lib/agents-sync.ts");
  const root = mkdtempSync(path.join(tmpdir(), "rank-"));
  mkdirSync(path.join(root, "improvement", "editor"), { recursive: true });
  writeFileSync(path.join(root, "improvement", "editor", "ranking.json"), JSON.stringify({ rankedAt: "2026-11-12T02:37:00Z", videos: [
    { id: "a", rank: 1, score: 8, why: "best" }, { id: "b", rank: 2, score: 7, why: "ok" }] }));
  const { prisma, data } = fakeVideos([
    { id: "trend", format: "short", queuePosition: 0, orderLocked: false, style: { source: { urgent: { until: "2026-11-12" } } } },
    { id: "a", format: "short", queuePosition: 1, orderLocked: false }, { id: "b", format: "short", queuePosition: 2, orderLocked: false },
    { id: "stale-trend", format: "short", queuePosition: 3, orderLocked: false, style: { source: { urgent: { until: "2026-11-10" } } } }]);
  await importEditorRanking(prisma as never, root, new Date("2026-11-12T06:30:00Z"));
  const order = [...data.values()].sort((x, y) => x.queuePosition - y.queuePosition).map((v) => v.id);
  assert.deepEqual(order, ["trend", "a", "b", "stale-trend"]);
});
