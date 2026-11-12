import assert from "node:assert/strict";
import { test } from "node:test";

import { parseLessons } from "../lib/agents-sync.ts";

test("the reviewer's lessons parse into title, date, source, seen and fix", () => {
  const md = `# Lessons\n\nIntro.\n\n## 1. The first frame names nobody (2026-11-12, owner review)\nSeen in: "A" (v-1), "B" (v-2).\n55% swiped away.\nFix: name the person first.\n\n## 2. No date here\nSeen in: v-3.\nFix: something.\n`;
  const ls = parseLessons(md);
  assert.equal(ls.length, 2);
  assert.deepEqual(ls[0], { n: 1, title: "The first frame names nobody", date: "2026-11-12", source: "owner review",
    seen: '"A" (v-1), "B" (v-2). 55% swiped away.', fix: "name the person first." });
  assert.equal(ls[1]!.date, null);
  assert.equal(ls[1]!.fix, "something.");
});
