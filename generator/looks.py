"""The board's look, chosen per video (owner, 2026-11-02: "don't make hardcoded animations, they
should be dynamic to the scripts so that no video looks the same").

The board scene (remotion/src/studio/board.tsx) is a grammar, not a template: its verbs are code,
its things are the video's own props, and how it looks comes from `style.look` in the plan and the
script. Variety rotates the look the way it rotates the palette and the music: the same combination
never within LOOK_WINDOW videos, and neither the stage nor the header style twice in a row.

    "style": {"palette": "mint", "genre": "cinematic", "key": "D", "bpm": 100,
              "look": {"stage": "street", "header": "ribbon", "holder": "receipt", "entrance": "drop"}}

The values are mirrored in remotion/src/studio/board.tsx (LOOKS); a test keeps them in step.
"""
from __future__ import annotations

LOOKS = {
    # where the story stands: one ground line the things arrive on, kept for the whole section
    "stage": ("flat", "street", "city", "field", "kitchen", "office", "night", "desert", "studio", "space"),
    # how the line at the top that states each sentence's point is drawn
    "header": ("ribbon", "sticky", "neon", "strip", "chalk"),
    # what a sum is written on while it builds term by term
    "holder": ("box", "receipt", "phone", "blackboard", "sign"),
    # how things arrive on the words that name them
    "entrance": ("pop", "drop", "slide", "draw", "stamp"),
}
KEYS = tuple(LOOKS)
LOOK_WINDOW = 10


def look_of(entry: dict) -> dict | None:
    look = (entry.get("style") or {}).get("look")
    return look if isinstance(look, dict) else None


def problems(look: object, history: list[dict]) -> list[str]:
    """A plan's look: known values, not the same combination as a recent video, not the same stage or
    header style as the previous one. No look (an old plan) is fine: the board then picks from the seed."""
    if look is None:
        return []
    if not isinstance(look, dict):
        return ["style.look is an object: {stage, header, holder, entrance}"]
    out = [f"style.look.{k} must be one of {', '.join(v)}" for k, v in LOOKS.items() if look.get(k) not in v]
    if out:
        return out
    combo = tuple(look[k] for k in KEYS)
    recent = [(e.get("id"), lk) for e in history[-LOOK_WINDOW:] if (lk := look_of(e))]
    for vid, lk in recent:
        if tuple(lk.get(k) for k in KEYS) == combo:
            out.append(f"style.look is the same as {vid}'s ({', '.join(combo)}): change at least one part")
            break
    if recent:
        vid, last = recent[-1]
        for k in ("stage", "header"):
            if last.get(k) == look[k]:
                out.append(f"style.look.{k} {look[k]!r} was used by the previous video ({vid})")
    return out


def for_state(history: list[dict]) -> dict:
    """What the planner needs: the options and the looks of the last videos."""
    return {"options": {k: list(v) for k, v in LOOKS.items()},
            "recent": [lk for e in history[-LOOK_WINDOW:] if (lk := look_of(e))]}
