"""Formats with proven demand: what people already watch in the millions (owner reset, 2026-10-21).

`improvement/research/formats.json` lists them per format (written by research, seeded by hand):
each has an `id` (a plan's `story`), a hook pattern, a beat outline and reference videos with their
views. Every plan tells one of its format's stories and names the video that shows the demand:

    plan["story"]  = "rich_vs_poor"
    plan["demand"] = {"title": "rich vs poor parents buying you a car", "views": 8800000, "url": "https://..."}

News stopped deciding what we make: before the reset the feed was news first, and 17 videos got
1-60 views each while viewers watched 20-35% of every Short.
"""
import json
from pathlib import Path

from .settings import ROOT

FILE = Path("improvement") / "research" / "formats.json"
MIN_VIEWS = 100_000      # a reference video below this doesn't show demand


def load(root: Path = ROOT, fmt: str = "short", plannable: bool = True) -> list[dict]:
    """The format's live entries; `plannable` leaves out one with no reference video at MIN_VIEWS,
    since check_plan would reject any plan in it (it comes back once research adds one)."""
    path = root / FILE
    if not path.is_file():
        return []
    return [f for f in json.loads(path.read_text(encoding="utf-8")).get("formats", [])
            if isinstance(f, dict) and f.get("id") and f.get("format") == fmt and not f.get("retired")
            and (not plannable or best_views(f) >= MIN_VIEWS)]


def best_views(f: dict) -> int:
    return max([e.get("views", 0) for e in f.get("examples") or [] if isinstance(e, dict) and isinstance(e.get("views"), int)] or [0])


def ids(root: Path = ROOT, fmt: str = "short") -> list[str]:
    return [f["id"] for f in load(root, fmt)]


CORE_MIN = (2, 3)        # at least 2 of every 3 Shorts are big-money stories (owner, 2026-10-30)


def tiers(root: Path = ROOT, fmt: str = "short") -> dict[str, str]:
    """`core` (big money: what got every 1K+ Short and every subscriber) or `low` (personal budgeting)."""
    return {f["id"]: f["tier"] for f in load(root, fmt, plannable=False) if f.get("tier")}


def core_ids(root: Path = ROOT, fmt: str = "short") -> list[str]:
    return [i for i, t in tiers(root, fmt).items() if t == "core"]


def core_needed(entries: list[dict], root: Path = ROOT, fmt: str = "short") -> bool:
    """Must the next Short be a core format? (the last ones already used the window's other slots)"""
    if fmt != "short":
        return False
    core = set(core_ids(root, fmt))
    if not core:
        return False
    need, window = CORE_MIN
    last = [e.get("story") for e in entries[-(window - 1):]]
    return sum(1 for s in last if s not in core) >= window - need


def mix_problems(plan: dict, entries: list[dict], root: Path = ROOT, fmt: str = "short") -> list[str]:
    if core_needed(entries, root, fmt) and plan.get("story") not in core_ids(root, fmt):
        need, window = CORE_MIN
        return [f"at least {need} of every {window} Shorts tell a big-money story ({', '.join(core_ids(root, fmt))}): the last "
                f"ones already used the other slot, so this one must be big money (billionaires, money at scale, how a famous "
                f"business makes money)"]
    return []


def for_state(root: Path = ROOT, fmt: str = "short") -> list[dict]:
    """What `state` shows the planner: each format with its hook, beats, title patterns and best example."""
    out = []
    for f in load(root, fmt):
        best = max(f.get("examples") or [{}], key=lambda e: e.get("views", 0))
        out.append({k: f.get(k) for k in ("id", "name", "tier", "emotion", "hook", "beats", "titles", "markets")} | {"best_example": best})
    return out


def check_plan(plan: dict, root: Path = ROOT, fmt: str = "short") -> list[str]:
    """A plan tells a format with proven demand and names the video that proves it."""
    known = ids(root, fmt)
    if not known:
        return []
    out = []
    below = {f["id"]: best_views(f) for f in load(root, fmt, plannable=False) if f["id"] not in known}
    if plan.get("story") in below:
        out.append(f"story {plan['story']} has no reference video with {MIN_VIEWS:,}+ views yet (best {below[plan['story']]:,}): "
                   f"pick one of {', '.join(known)}")
    elif plan.get("story") not in known:
        out.append(f"story must be a {fmt} format with proven demand: one of {', '.join(known)} ({FILE.as_posix()})")
    demand = plan.get("demand")
    if not isinstance(demand, dict) or not demand.get("title") or not isinstance(demand.get("views"), int):
        out.append("plan needs `demand`: {title, views, url} of a video in this format that people watch")
    elif demand["views"] < MIN_VIEWS:
        out.append(f"demand.views {demand['views']:,} is under {MIN_VIEWS:,}: pick a reference video that shows real demand")
    return out
