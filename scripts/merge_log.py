"""Append one agent-merge result to improvement/merge-log.json (run by agent-merge.yml).

    python scripts/merge_log.py --agent improver --branch agent/improver/2026-10-16 --result merged \
        --guard guard.json --commit <sha> --run-url <url> [--note "tests failed"]
"""
import argparse
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILE = ROOT / "improvement" / "merge-log.json"
KEEP = 300


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--agent", required=True)
    ap.add_argument("--branch", required=True)
    ap.add_argument("--result", choices=["merged", "blocked"], required=True)
    ap.add_argument("--guard")
    ap.add_argument("--commit", default="")
    ap.add_argument("--run-url", default="")
    ap.add_argument("--note", default="")
    a = ap.parse_args()
    guard = {}
    if a.guard and Path(a.guard).is_file():
        try:
            guard = json.loads(Path(a.guard).read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            guard = {}
    reasons = list(guard.get("reasons", []))
    if a.result == "blocked" and not reasons:
        reasons = [a.note or "tests or checks failed; see the workflow run"]
    now = datetime.now(timezone.utc)
    entry = {"at": now.isoformat(timespec="seconds"), "dayIst": (now + timedelta(hours=5, minutes=30)).date().isoformat(),
             "agent": a.agent, "branch": a.branch, "result": a.result, "reasons": reasons, "files": guard.get("files", []),
             "commit": a.commit, "runUrl": a.run_url}
    log = json.loads(FILE.read_text(encoding="utf-8")) if FILE.is_file() else {"merges": []}
    log["merges"] = (log.get("merges", []) + [entry])[-KEEP:]
    FILE.parent.mkdir(parents=True, exist_ok=True)
    FILE.write_text(json.dumps(log, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(entry))


if __name__ == "__main__":
    main()
