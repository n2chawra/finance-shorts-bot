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
    "auditor": ["generator/*", "renderer/*", "examples/*", "apps/dashboard/src/*", "apps/dashboard/e2e/*", "workers/*",
                "improvement/auditor/*", "improvement/activity/*-auditor.json", "improvement/notifications/auditor.json"],
    # long-form: scout researches and never touches code; studio pushes its videos straight to main
    # (like the Shorts video run) and uses its branch only for reports.
    "scout": ["improvement/longform/*", "improvement/activity/*-scout.json", "improvement/notifications/scout.json"],
    "studio": ["improvement/longform/*", "improvement/activity/*-studio.json", "improvement/notifications/studio.json"],
}
# protected files an agent may still change (its fixes for data bugs live there)
UNLOCK: dict[str, list[str]] = {
    "auditor": ["workers/*", "apps/dashboard/src/lib/live-stats.ts"],
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
# owner-only even where UNLOCK opens a folder: uploads, YouTube sign-in, settings defaults, and the
# data audit with its tests (the measuring stick never changes with the code it measures)
LOCKED = [
    "workers/publish.ts", "workers/auth.ts", "workers/reset-data.ts", "workers/data-audit.ts", "workers/lib/data-audit.ts",
    "workers/tests/data-audit.test.ts", "workers/lib/uploads.ts", "workers/lib/publishing.ts", "workers/lib/youtube.ts",
    "workers/lib/settings.ts", "workers/prisma/*", "workers/scripts/*", "workers/package.json", "workers/package-lock.json",
]
FORBID += LOCKED
TEST_FILE = re.compile(r"(^|/)(tests?|e2e)/|(^|/)test_[^/]*\.py$|\.(test|spec)\.ts$")
# the upload schedule is the owner's: no agent diff may add or remove a line that sets it
UPLOAD_SETTING = re.compile(r"\b(uploadTimes|uploadsPaused|backlogCap)\b")
MEDIA_EXT = (".mp3", ".wav", ".ogg", ".m4a", ".flac", ".aac", ".mp4", ".mov", ".webm")
MODEL_EXT = (".onnx", ".bin", ".pt", ".pth", ".safetensors", ".ckpt", ".gguf")   # voice/AI model weights
MAX_LINES = {"research": 4000, "improver": 900, "dashboard": 700, "auditor": 600, "scout": 4000, "studio": 4000}   # code lines changed (reports excluded)
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
    rules = show(head, "remotion/src/design/rules.ts") or ""
    if 'DISCLAIMER = "Illustrative only. Not financial advice."' not in rules:
        out.append("remotion/src/design/rules.ts must keep DISCLAIMER = \"Illustrative only. Not financial advice.\"")
    frame = show(head, "remotion/src/design/frame.ts") or ""
    short = re.search(r"SHORT: Frame = \{.*?minText: (\d+).*?bottomSafe: (\d+)", frame)
    if not short or int(short.group(1)) < 44:
        out.append("the Shorts frame's minText must stay at least 44 px")
    if not short or int(short.group(2)) < 120:
        out.append("the Shorts frame's bottomSafe must stay at least 120 px")
    timeline = show(head, "renderer/timeline/build.py") or ""
    if 'DISCLAIMER = "Illustrative only. Not financial advice."' not in timeline or "must be the end card" not in timeline:
        out.append("renderer/timeline/build.py must keep the disclaimer and require every video to end on the end card")
    stage = show(head, "remotion/src/scenes/stage.tsx") or ""
    if "tl.disclaimer" not in stage:
        out.append("remotion/src/scenes/stage.tsx: the end card must still draw the disclaimer")
    gates = show(head, "renderer/gates.py") or ""
    for name, floor in (("LIVELY_MEDIAN", 1.2), ("STILL", 0.5)):
        m = re.search(rf"^{name} = ([\d.]+)", gates, re.M)
        if not m or float(m.group(1)) < floor:
            out.append(f"renderer/gates.py: {name} must stay at least {floor}")
    for name, ceiling in (("LIVELY_STILL_SHARE", 0.15), ("LIVELY_STILL_SEC", 4.0)):
        m = re.search(rf"^{name} = ([\d.]+)", gates, re.M)
        if not m or float(m.group(1)) > ceiling:
            out.append(f"renderer/gates.py: {name} must stay at most {ceiling}")
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
        unlocked = match(path, UNLOCK.get(agent, [])) and not match(path, LOCKED)
        if match(path, FORBID) and not unlocked:
            reasons.append(f"{path}: protected file; no agent may change it")
        elif not match(path, ALLOW[agent]):
            reasons.append(f"{path}: outside what the {agent} agent may change")
        if status == "D" and TEST_FILE.search(path):
            reasons.append(f"{path}: deleting a test file is not allowed (rewrite or move tests instead)")
        if path.lower().endswith(MEDIA_EXT) and status != "D":
            reasons.append(f"{path}: audio/video files are not allowed (all audio is synthesized in code)")
        if path.lower().endswith(MODEL_EXT) and status != "D":
            reasons.append(f"{path}: model weights are never committed (scripts/setup-voice.sh installs them)")
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
        elif line[:1] in "+-" and not line.startswith(("+++", "---")) and UPLOAD_SETTING.search(line):
            reasons.append(f"{current}: changes the upload schedule settings (owner only)")
        if line.startswith("+") and not line.startswith("+++"):
            if SECRET.search(line):
                reasons.append(f"{current}: looks like a secret or credential")
            if current.startswith("renderer/") and (NETWORK.search(line) or DOWNLOAD.search(line)):
                reasons.append(f"{current}: the renderer may not use the network or download anything")
    reasons += invariants(head)
    if merges_today(agent, now) >= MAX_MERGES_PER_DAY:
        reasons.append(f"the {agent} agent already merged {MAX_MERGES_PER_DAY} changes today")
    needs_tests = any(not p.startswith("improvement/") for _, p in files)
    return {"ok": not reasons, "reasons": sorted(set(reasons)), "files": [p for _, p in files], "codeLines": code_lines,
            "needsTests": needs_tests, "areas": areas([p for _, p in files])}


def areas(paths: list[str]) -> list[str]:
    """Which test suites a change needs: python (generator, renderer, evaluator), workers, dashboard."""
    out = set()
    for p in paths:
        if p.startswith("workers/"):
            out.add("workers")
        elif p.startswith("apps/dashboard/"):
            out.add("dashboard")
        elif p.startswith(("generator/", "renderer/", "examples/", "scripts/")) or (p.startswith("improvement/") and p.endswith(".py")):
            out.add("python")
    return sorted(out)


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
