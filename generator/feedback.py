"""The owner's feedback, for the video routine and the agents (owner, 2026-10-30: "my feedback should be
used in video generation and by the improver, so the system improves as well as the next video").

The dashboard stores it in Postgres; the ingest workflow exports it to `metrics/feedback.json`
(workers/lib/agents-sync.ts `feedbackExport`). Kinds: `choice` (why the owner picked a video to
publish), `stale` (why a video will never go out), `wrong` (something is wrong: a rule until it is
addressed), `improve` (do it better next time), `general` (about the channel). The improver answers
each open note in `improvement/feedback-acks.json`, which ingest brings back to the dashboard.
"""
from __future__ import annotations

import json
from pathlib import Path

from .settings import ROOT

FILE = Path("metrics") / "feedback.json"
SHOWN = 15     # notes handed to the planner and writer: the open ones and the newest


def load(root: Path = ROOT) -> list[dict]:
    path = root / FILE
    if not path.is_file():
        return []
    try:
        return [n for n in json.loads(path.read_text(encoding="utf-8")).get("notes", []) if isinstance(n, dict) and n.get("text")]
    except (OSError, ValueError):
        return []


def for_state(root: Path = ROOT, fmt: str = "short") -> dict:
    """What `state` hands the planner and the writer: the owner's open notes (rules until addressed),
    the latest picks and stales (the owner's taste), newest first."""
    notes = [n for n in load(root) if (n.get("video") or {}).get("format", fmt) == fmt or not n.get("video")]
    open_ = [n for n in notes if n.get("status") == "open" and n.get("kind") in ("wrong", "improve", "general")]
    taste = [n for n in notes if n.get("kind") in ("choice", "stale")][:8]
    slim = lambda n: {k: v for k, v in {  # noqa: E731
        "kind": n.get("kind"), "area": n.get("area"), "text": n.get("text"), "at": (n.get("at") or "")[:10],
        "video": (n.get("video") or {}).get("title"), "story": (n.get("video") or {}).get("story"),
        "shape": (n.get("video") or {}).get("shape"), "hook": (n.get("video") or {}).get("hook")}.items() if v}
    return {
        "rule": "The owner's notes come right after the hard rules. A `wrong` note is a rule until it is addressed; "
                "`improve` and `general` notes shape this video; `choice` and `stale` show what the owner wants on the channel.",
        "open": [slim(n) for n in open_[:SHOWN]],
        "taste": [slim(n) for n in taste],
    }


def taste_of(root: Path = ROOT) -> dict[str, float]:
    """+1 for each story or shape the owner picked to publish, -1 for each in a video marked stale."""
    out: dict[str, float] = {}
    for n in load(root):
        sign = {"choice": 1.0, "stale": -1.0}.get(n.get("kind") or "")
        v = n.get("video") or {}
        if not sign:
            continue
        for key in (f"story:{v.get('story')}", f"shape:{v.get('shape')}"):
            if not key.endswith(":None"):
                out[key] = out.get(key, 0.0) + sign
    return out


def report(root: Path = ROOT, fmt: str = "short") -> str:
    """The open notes as lines, for the top of `generator.run failures`."""
    s = for_state(root, fmt)
    if not s["open"]:
        return ""
    lines = ["The owner's open notes (they come first; a `wrong` note is a rule until it is addressed):"]
    lines += [f"- [{n['kind']}{'/' + n['area'] if n.get('area') else ''}] {n['text']}" + (f"  (on {n['video']!r})" if n.get("video") else "") for n in s["open"]]
    return "\n".join(lines)
