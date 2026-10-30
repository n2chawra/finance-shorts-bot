"""Story shapes: how a video's beats are arranged (owner, 2026-10-30: "we have levels in all videos,
which feels very repetitive... the shapes also should be dynamic, should keep on increasing").

The shapes live in `improvement/research/shapes.json`, not in code, so the library grows without a
code change: research adds the shapes it sees in top videos, a plan may invent a new one (ship
records it as `trial`), and the improver promotes or retires them by results. Every shape keeps the
shared spine that generator/story.py checks; only a shape with `levels: true` shows the level chips.

    plan["shape"] = "reveal"                                     a shape from the library
    plan["shape"] = {"id": "the-heist", "name": "The heist", "beats": "...", "why": "..."}   a new one

Variety works on shares, not a cycle: a shape is not used twice in the last WINDOW Shorts nor more
than SHARE of the last SHARE_OF, and the ones used least lately are offered first.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from .settings import ROOT

FILE = Path("improvement") / "research" / "shapes.json"
WINDOW = 3          # not the same shape in the last 3 videos of a format
SHARE, SHARE_OF = 0.25, 20
LEVELS_SHARE = 1 / 3   # level chips at most 1 in 3 (they read as a template)
ID = re.compile(r"^[a-z][a-z0-9-]{2,30}$")


def load(root: Path = ROOT, usable: bool = True) -> list[dict]:
    path = root / FILE
    if not path.is_file():
        return []
    shapes = [s for s in json.loads(path.read_text(encoding="utf-8")).get("shapes", []) if isinstance(s, dict) and s.get("id")]
    return [s for s in shapes if not usable or s.get("status", "active") in ("active", "trial")]


def get(shape_id: str | None, root: Path = ROOT) -> dict | None:
    return next((s for s in load(root, usable=False) if s["id"] == shape_id), None)


def shape_id(shape: object) -> str | None:
    """A plan's or a script's shape as an id (a new shape is a dict with its own id)."""
    if isinstance(shape, dict):
        return shape.get("id")
    return shape if isinstance(shape, str) else None


def shows_levels(shape: object, root: Path = ROOT) -> bool:
    """Level chips and a climbing counter: the levels shape (and any shape that says so)."""
    sid = shape_id(shape)
    if isinstance(shape, dict):
        return bool(shape.get("levels"))
    s = get(sid, root)
    return bool(s.get("levels")) if s else sid == "levels"


def _recent(entries: list[dict]) -> list[str]:
    return [sid for e in entries if (sid := shape_id(e.get("shape")))]


def check_plan(plan: dict, entries: list[dict], root: Path = ROOT) -> list[str]:
    """The plan names a shape the topic needs, new or from the library, and not one the last videos used."""
    shape = plan.get("shape")
    known = {s["id"]: s for s in load(root, usable=False)}
    usable = [s["id"] for s in load(root)]
    if not known:      # no library in this checkout (tests): nothing to check against
        return []
    if shape is None:
        return [f"plan needs `shape`: how the beats are arranged, one of {', '.join(usable)} ({FILE.as_posix()}), "
                f"or a new one {{id, name, beats, why}} when none fits the topic"]
    out = []
    if isinstance(shape, dict):
        sid = shape.get("id") or ""
        if not ID.match(sid):
            out.append("a new shape's `id` is a short kebab-case name, like \"the-heist\"")
        elif sid in known:
            out.append(f"shape {sid!r} already exists: name it as a string, or give the new one another id")
        if len(str(shape.get("beats", ""))) < 40:
            out.append("a new shape's `beats`: its steps in order, in plain words (hook -> ... -> payoff)")
        if len(str(shape.get("why", ""))) < 15:
            out.append("a new shape's `why`: why this topic needs it and none of the library's shapes fits")
    else:
        sid = str(shape)
        if sid not in known:
            out.append(f"shape {sid!r} is not in the library: one of {', '.join(usable)}, or a new one {{id, name, beats, why}}")
        elif known[sid].get("status") == "retired":
            out.append(f"shape {sid!r} is retired ({known[sid].get('reason', 'it underperformed')}): one of {', '.join(usable)}")
    recent = _recent(entries)
    if sid in recent[-WINDOW:]:
        out.append(f"shape {sid!r} was used in the last {WINDOW} videos: pick another, or invent one the topic needs")
    last = recent[-SHARE_OF:]
    if len(last) >= 8 and (last.count(sid) + 1) / (len(last) + 1) > SHARE:      # a share needs some history
        out.append(f"shape {sid!r} is {last.count(sid)} of the last {len(last)} videos: at most {SHARE:.0%}")
    if shows_levels(shape, root) and last and (sum(shows_levels(x, root) for x in last[-6:]) + 1) / (min(6, len(last)) + 1) > LEVELS_SHARE:
        out.append(f"level chips at most 1 in {round(1 / LEVELS_SHARE)} videos: use them only when the topic is a ladder, "
                   f"and pick another shape this time")
    return out


def for_state(entries: list[dict], root: Path = ROOT) -> list[dict]:
    """The library for the planner: least used lately first, with the shapes it may not pick now."""
    recent = _recent(entries)
    last = recent[-SHARE_OF:]
    rows = []
    for s in load(root):
        ago = next((i for i, x in enumerate(reversed(recent)) if x == s["id"]), None)
        rows.append({k: s.get(k) for k in ("id", "name", "status", "levels", "when", "beats")}
                    | {"used_in_last_20": last.count(s["id"]), "videos_since_last_use": ago,
                       "blocked": s["id"] in recent[-WINDOW:]})
    return sorted(rows, key=lambda r: (r["blocked"], r["used_in_last_20"], -(r["videos_since_last_use"] if r["videos_since_last_use"] is not None else 99)))


def record_new(plan: dict, vid: str, root: Path = ROOT) -> bool:
    """A plan's new shape joins the library as `trial` when its video ships. True if the file changed."""
    shape = plan.get("shape")
    if not isinstance(shape, dict) or not shape.get("id"):
        return False
    path = root / FILE
    data = json.loads(path.read_text(encoding="utf-8")) if path.is_file() else {"shapes": []}
    if any(s.get("id") == shape["id"] for s in data["shapes"]):
        return False
    data["shapes"].append({"id": shape["id"], "name": shape.get("name") or shape["id"], "status": "trial", "levels": bool(shape.get("levels")),
                           "when": shape.get("why", ""), "beats": shape.get("beats", ""), "origin": vid})
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return True
