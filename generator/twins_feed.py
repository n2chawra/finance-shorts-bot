"""The Short topics the planner is most likely to take next, for the twins job (workers/twins.ts).

The job studies the most-watched animated Shorts on each of these topics the night before, so the
writer reads how the winners told it (improvement/twins/briefs/<topic id>.json). Light imports only:
it runs in GitHub Actions without the renderer's packages.

    python -m generator.twins_feed [--n 16]
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from . import history, topics
from .settings import ROOT


def upcoming(n: int = topics.SHOWN, root: Path = ROOT) -> list[dict]:
    """Open Short topics, ranked the way `state` ranks them for the planner (urgent first, then score)."""
    entries = history.of_format(history.load(root), "short")
    today = history.ist_day(history.now().isoformat())
    everything = topics._all_entries(root)
    open_ = [t for t in topics.of_format(topics.load(root, "short"), "short")
             if topics.why_unavailable(t, entries, today) is None and topics.too_close(t, everything, today) is None]
    ctx = topics.context(entries, root)
    open_.sort(key=lambda t: topics.score(t, today, ctx), reverse=True)
    open_.sort(key=lambda t: 0 if t.get("priority") in topics.URGENT else 1)
    return [{"id": t["id"], "title": t.get("title", ""), "search": t.get("search")} for t in open_[:n]]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=topics.SHOWN)
    print(json.dumps(upcoming(ap.parse_args().n), ensure_ascii=False))


if __name__ == "__main__":
    main()
