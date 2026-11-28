"""Crowded topics: a story many other channels told lately (owner, 2026-11-28).

Craze & Crash and Disaster Desk picked the stories every faceless channel was telling that same week (33 new
videos on FedEx's blackjack night in 7 days, 26 on Nike's $35 swoosh, 16 on Colgan 3407), and theirs died with
0-75 views. `workers/saturation.ts` (the Saturation workflow, nightly) counts each open topic's same-story videos
from the last 7 and 30 days into `channels/<slug>/research/saturation.json`; a topic it found crowded is blocked
(`topics.blocked_reason`, so `state` marks it unusable and `check-plan` refuses it) while the check is fresh.
"""
import json
from datetime import date, datetime
from pathlib import Path

from .settings import ROOT
from .channels import cpath

FILE = Path("improvement") / "research" / "saturation.json"
FRESH_DAYS = 10   # an older check no longer blocks (the workflow re-checks every 4 days)
HOT_MEDIAN = 10_000   # crowded, but the copies still get this many views: viewers still want it (workers HOT_MEDIAN)


def load(root: Path = ROOT) -> dict[str, dict]:
    path = cpath(root, FILE)
    if not path.is_file():
        return {}
    try:
        topics = json.loads(path.read_text(encoding="utf-8")).get("topics") or {}
    except (OSError, ValueError):
        return {}
    return {k: v for k, v in topics.items() if isinstance(v, dict)}


def of(topic_id: str, root: Path = ROOT) -> dict | None:
    return load(root).get(topic_id)


def _age(checked: object, today: str) -> int | None:
    try:
        return (date.fromisoformat(today) - datetime.fromisoformat(str(checked).replace("Z", "+00:00")).date()).days
    except ValueError:
        return None


def crowded(topic: dict, today: str, root: Path = ROOT) -> str | None:
    """Why the topic's story is too crowded to tell now, or None (never checked, check too old, or not crowded)."""
    v = of(topic.get("id") or "", root)
    if not v or not v.get("crowded"):
        return None
    if isinstance(v.get("median30"), (int, float)) and v["median30"] >= HOT_MEDIAN:
        return None
    age = _age(v.get("checkedAt"), today)
    if age is None or age > FRESH_DAYS:
        return None
    return (f"crowded: {v.get('reason') or 'many other channels told this story lately'} "
            f"(median {v.get('median30')} views; checked {str(v.get('checkedAt'))[:10]}). Tell a story they haven't")
