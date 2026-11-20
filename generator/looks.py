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

# Out of the rotation for new videos (agents/improver.md section 4: the auditor's weekly picture tally,
# improvement/analysis/pictures.json `worst`, needs no test). Old videos keep theirs, so re-renders still work;
# the palettes themselves stay in renderer/engine/style.py.
RETIRED_PALETTES = {
    "plum": "auditor tally 2026-11-15: 16.4% held after the hook (7 Shorts) against 26.6% for the other palettes (19)",
}


def palette_problems(style: object) -> list[str]:
    """A new plan never takes a retired palette."""
    pal = (style or {}).get("palette") if isinstance(style, dict) else None
    if pal in RETIRED_PALETTES:
        return [f"style.palette {pal!r} is retired ({RETIRED_PALETTES[pal]}): pick another"]
    return []


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
            "retired_palettes": dict(RETIRED_PALETTES),
            "recent": [lk for e in history[-LOOK_WINDOW:] if (lk := look_of(e))],
            **_recipe_state(history)}


def _recipe_state(history: list[dict]) -> dict:
    """A channel with a look rotation: its recipes and the ones the next video may not take."""
    try:
        recipes, n = rotation()
    except Exception:  # noqa: BLE001 - no pack: no rotation
        return {}
    if not recipes:
        return {}
    used = [r for e in history if (r := recipe_of(e))][-n:] if n > 0 else []
    return {"recipes": recipes, "recipe_blocked": used}


# ---- look recipes (disasters channel, 2026-11-20) -------------------------------------------------
# A channel whose channel.json has `look.rotation` ({recipes, avoidLast}) draws every video in one named
# recipe (remotion/src/disaster/looks.ts, three/disaster/look.tsx): the plan sets `style.recipe`, one of
# the channel's recipes and none of the last `avoidLast` videos' (owner, 20 Nov: "no repetition of
# animation style"). Counted per format, so a promo Short cut from a long video may share its look.

def recipe_of(entry: dict) -> str | None:
    r = (entry.get("style") or {}).get("recipe")
    return r if isinstance(r, str) else None


def recipe_problems(style: object, history: list[dict], recipes: list[str] | tuple[str, ...], avoid_last: int) -> list[str]:
    """`style.recipe` is one of `recipes` and not one of the last `avoid_last` videos' recipes."""
    if not recipes:
        return []
    rec = style.get("recipe") if isinstance(style, dict) else None
    if rec not in recipes:
        return [f"style.recipe must be one of {', '.join(recipes)} (this channel's look rotation)"]
    recent = [(e.get("id"), r) for e in history if (r := recipe_of(e))][-max(0, int(avoid_last)):] if avoid_last > 0 else []
    for vid, r in recent:
        if r == rec:
            free = [x for x in recipes if x not in {r2 for _, r2 in recent}]
            return [f"style.recipe {rec!r} was used by {vid}, one of the last {avoid_last} videos: pick one of {', '.join(free) or 'the others'}"]
    return []


def rotation(pack_data: dict | None = None) -> tuple[list[str], int]:
    """The channel's look rotation from its pack: (recipes, avoidLast); ([], 0) when it has none."""
    if pack_data is None:
        from . import pack
        pack_data = pack.load()
    rot = ((pack_data.get("look") or {}).get("rotation") or {}) if isinstance(pack_data, dict) else {}
    recipes = [r for r in rot.get("recipes") or [] if isinstance(r, str)]
    return recipes, int(rot.get("avoidLast") or 0)
