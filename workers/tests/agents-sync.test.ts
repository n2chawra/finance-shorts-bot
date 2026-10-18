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
