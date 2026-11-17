"""Channels that look alike (multi-channel plan, step 4: YouTube's "inauthentic content" rule).

A plan whose title or topic is too close to another channel's video of the last 30 days fails, with the
same word-overlap measure the variety rules use within a channel (generator/variety.py). With one channel
there is nothing to compare, so channel #1's plans are checked exactly as before.
"""
from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

from .channels import current
from .settings import ROOT
from .variety import DUPLICATE_SIMILARITY, similarity

WINDOW_DAYS = 30


def recent_elsewhere(root: Path = ROOT, slug: str | None = None, now: datetime | None = None) -> list[dict]:
    """Other channels' history entries of the last 30 days, each with its channel."""
    me = slug or current()
    cutoff = (now or datetime.now(timezone.utc)) - timedelta(days=WINDOW_DAYS)
    out = []
    base = root / "channels"
    for d in sorted(base.iterdir()) if base.is_dir() else []:
        f = d / "history" / "history.json"
        if d.name == me or not f.is_file():
            continue
        try:
            entries = json.loads(f.read_text(encoding="utf-8"))
        except ValueError:
            continue
        for e in entries:
            try:
                at = datetime.fromisoformat(str(e.get("created_at", "")).replace("Z", "+00:00"))
            except ValueError:
                continue
            if at.tzinfo is None:
                at = at.replace(tzinfo=timezone.utc)
            if at >= cutoff:
                out.append({**e, "channel": d.name})
    return out


def problems(plan: dict, root: Path = ROOT, slug: str | None = None, now: datetime | None = None) -> list[str]:
    title = str(plan.get("title") or "")
    topic = str((plan.get("topic") or {}).get("title") or "")
    out = []
    for e in recent_elsewhere(root, slug, now):
        theirs = [str(e.get("title") or ""), str((e.get("topic") or {}).get("title") or "")]
        score = max((similarity(a, b) for a in (title, topic) if a for b in theirs if b), default=0.0)
        if score > DUPLICATE_SIMILARITY:
            out.append(f"too close to {e['channel']}'s {e.get('id')} ({theirs[0] or theirs[1]!r}, similarity {score:.2f}): channels must not look "
                       f"alike (YouTube's inauthentic-content rule); pick another topic or angle")
    return out
