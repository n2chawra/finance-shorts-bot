"""CI guard for agent branches. Decides whether an agent's change may merge into main.

    python scripts/guard.py --agent improver --base origin/main --head HEAD [--json]

Exit 0 = allowed, 1 = blocked (reasons printed). The rules live here, not in the agents' prompts,
so no prompt can talk its way past them. This file, the workflows and agents/policy.md are
themselves off-limits to every agent.
"""
from __future__ import annotations

import argparse
import fnmatch
import json
import re
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

ALLOW: dict[str, list[str]] = {
    "research": ["improvement/research/*", "improvement/activity/*-research.json", "improvement/notifications/research.json"],
    "improver": ["generator/*", "renderer/*", "examples/*", "config/experiments.json", "improvement/experiments.json",
                 "improvement/journal.md", "improvement/weekly/*", "improvement/template-decisions.json",
                 "improvement/research/proposals.json", "improvement/activity/*-improver.json", "improvement/notifications/improver.json"],
    "dashboard": ["apps/dashboard/src/*", "apps/dashboard/e2e/*", "apps/dashboard/package.json", "apps/dashboard/package-lock.json",
                  "apps/dashboard/playwright.config.ts", "improvement/dashboard/*", "improvement/activity/*-dashboard.json",
                  "improvement/notifications/dashboard.json"],
}
# never, for any agent (checked before the allow-lists)
FORBID = [
    ".github/*", "workers/*", "scripts/*", "agents/*", "CLAUDE.md", "PLAN.md", "netlify.toml", "config/settings.json",
    "history/*", "videos/*", "metrics/*", "improvement/evaluate.py", "improvement/tests/*", "improvement/merge-log.json",
    "generator/settings.py", "generator/variety.py", "generator/prompts/routine.md", "generator/tests/test_variety.py",
    "apps/dashboard/prisma/*", "apps/dashboard/src/lib/auth.ts", "apps/dashboard/src/middleware.ts",
    "apps/dashboard/src/app/api/login/*", "apps/dashboard/src/lib/prisma.ts", "apps/dashboard/src/lib/live-stats.ts",
    "assets/*", "reference/*",
]
MEDIA_EXT = (".mp3", ".wav", ".ogg", ".m4a", ".flac", ".aac", ".mp4", ".mov", ".webm")
MAX_LINES = {"research": 4000, "improver": 900, "dashboard": 700}   # code lines changed (reports excluded)
MAX_MERGES_PER_DAY = 2
SECRET = re.compile(r"(ghp_[A-Za-z0-9]{20,}|github_pat_|sk-[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{30,}|postgres(ql)?://\S+:\S+@|BEGIN (RSA|OPENSSH) PRIVATE KEY)")
NETWORK = re.compile(r"^\+\s*(import|from)\s+(requests|urllib|http\.client|socket|aiohttp|httpx)\b")
DOWNLOAD = re.compile(r"^\+.*(urlopen|requests\.get|curl |wget )")


def git(*args: str) -> str:
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True, check=True).stdout


def match(path: str, patterns: list[str]) -> bool:
    return any(fnmatch.fnmatch(path, p) for p in patterns)


def show(head: str, path: str) -> str | None:
    try:
        return git("show", f"{head}:{path}")
    except subprocess.CalledProcessError:
        return None


def invariants(head: str) -> list[str]:
    """The hard rules from CLAUDE.md that code can check, on the proposed tree."""
    out = []
    canvas = show(head, "renderer/engine/canvas.py") or ""
    if 'DISCLAIMER = "Illustrative only. Not financial advice."' not in canvas:
        out.append("renderer/engine/canvas.py must keep DISCLAIMER = \"Illustrative only. Not financial advice.\"")
    m = re.search(r"^MIN_TEXT\s*=\s*(\d+)", canvas, re.M)
    if not m or int(m.group(1)) < 44:
        out.append("MIN_TEXT must stay at least 44 px")
    m = re.search(r"^BOTTOM_SAFE\s*=\s*(\d+)", canvas, re.M)
    if not m or int(m.group(1)) < 120:
        out.append("BOTTOM_SAFE must stay at least 120 px")
    video = show(head, "renderer/engine/video.py") or ""
    if "DISCLAIMER" not in video:
        out.append("renderer/engine/video.py must still draw the disclaimer in the end scene")
    run = show(head, "generator/run.py") or ""
    if 'CHECKERS = ("number_check", "fact_review", "qa_review")' not in run or "has not passed" not in run:
        out.append("generator/run.py must keep shipping blocked until number check, fact review and QA review pass")
    numbers = show(head, "generator/numbers.py") or ""
    if "def number_check(" not in numbers:
        out.append("generator/numbers.py must keep number_check()")
    return out


def merges_today(agent: str, now: datetime) -> int:
    path = ROOT / "improvement" / "merge-log.json"
    if not path.is_file():
        return 0
    day = (now + timedelta(hours=5, minutes=30)).date().isoformat()   # IST day
    log = json.loads(path.read_text(encoding="utf-8"))
    return sum(1 for e in log.get("merges", []) if e.get("agent") == agent and e.get("result") == "merged" and e.get("dayIst") == day)


def check(agent: str, base: str, head: str, now: datetime | None = None) -> dict:
    now = now or datetime.now(timezone.utc)
    reasons: list[str] = []
    if agent not in ALLOW:
        return {"ok": False, "reasons": [f"unknown agent {agent!r}"], "files": [], "needsTests": False}
    files = []
    for line in git("diff", "--name-status", "--no-renames", f"{base}...{head}").splitlines():
        status, path = line.split("\t", 1)
        files.append((status, path))
    if not files:
        return {"ok": False, "reasons": ["the branch changes nothing"], "files": [], "needsTests": False}
    for status, path in files:
        if match(path, FORBID):
            reasons.append(f"{path}: protected file; no agent may change it")
        elif not match(path, ALLOW[agent]):
            reasons.append(f"{path}: outside what the {agent} agent may change")
        if path.lower().endswith(MEDIA_EXT) and status != "D":
            reasons.append(f"{path}: audio/video files are not allowed (all audio is synthesized in code)")
    code_lines = 0
    for line in git("diff", "--numstat", "--no-renames", f"{base}...{head}").splitlines():
        added, removed, path = line.split("\t", 2)
        if not path.startswith("improvement/") and added != "-":
            code_lines += int(added) + int(removed)
    if code_lines > MAX_LINES[agent]:
        reasons.append(f"{code_lines} changed lines of code; the {agent} agent may change at most {MAX_LINES[agent]} per merge")
    diff = git("diff", "--unified=0", "--no-renames", f"{base}...{head}")
    current = ""
    for line in diff.splitlines():
        if line.startswith("+++ b/"):
            current = line[6:]
        elif line.startswith("+") and not line.startswith("+++"):
            if SECRET.search(line):
                reasons.append(f"{current}: looks like a secret or credential")
            if current.startswith("renderer/") and (NETWORK.search(line) or DOWNLOAD.search(line)):
                reasons.append(f"{current}: the renderer may not use the network or download anything")
    reasons += invariants(head)
    if merges_today(agent, now) >= MAX_MERGES_PER_DAY:
        reasons.append(f"the {agent} agent already merged {MAX_MERGES_PER_DAY} changes today")
    needs_tests = any(not p.startswith("improvement/") for _, p in files)
    return {"ok": not reasons, "reasons": sorted(set(reasons)), "files": [p for _, p in files], "codeLines": code_lines, "needsTests": needs_tests}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--agent", required=True)
    ap.add_argument("--base", default="origin/main")
    ap.add_argument("--head", default="HEAD")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    r = check(a.agent, a.base, a.head)
    if a.json:
        print(json.dumps(r))
    else:
        print("ALLOWED" if r["ok"] else "BLOCKED")
        for x in r["reasons"]:
            print(f"  - {x}")
    return 0 if r["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
