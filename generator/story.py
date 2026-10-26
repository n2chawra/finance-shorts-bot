"""Story depth for Shorts (owner, 2026-10-26: "the script is good for 30 seconds but it lacks depth";
most viewers left right after the hook, average about 50% viewed).

What the references do (The Curious Plot's 1.1M egg-selling Short, the 4-levels lemonade stand,
Infinite Wealth Lab's bank scene) and what these checks hold every Short to:

  hook      the first beat, 3 s or less (the hooks already work: unchanged)
  promise   by PROMISE_BY seconds: the structure the viewer will wait for ("3 levels", "4 friends")
  figure    a computed figure on screen by FIRST_FIGURE_BY seconds
  levels    `structure.levels` (LEVELS_MIN or more), each level a beat (params.hud.level)
  counter   a climbing number (params.hud.counter) that changes COUNTER_CHANGES times or more
  turn      the catch / surprise between TURN_FROM and TURN_TO of the length
  payoff    after the turn: the answer to the hook

plus no stock lines the channel kept repeating, and no line opening from the last 10 scripts.
Each beat names its part in `role`. Only Shorts on the story template are held to this.
"""
from __future__ import annotations

import re

PROMISE_BY = 6.0
FIRST_FIGURE_BY = 9.0
LEVELS_MIN = 3
COUNTER_CHANGES = 3
TURN_FROM, TURN_TO = 0.5, 0.85
ROLES = ("hook", "promise", "level", "tease", "turn", "payoff", "loop", "end")
# long videos (owner, 2026-10-26: "do the same upgrade for long videos"): the levels are the
# chapters, the promise comes within 30 s, every chapter but the last ends on a `tease` beat (the
# open loop into the next), and the hook may run longer
SPINE = {
    "short": {"promise_by": PROMISE_BY, "figure_by": FIRST_FIGURE_BY, "levels_min": LEVELS_MIN, "hook_max": 3.6, "teases": False},
    "long": {"promise_by": 30.0, "figure_by": 45.0, "levels_min": 4, "hook_max": 15.0, "teases": True},
}
# lines our Shorts said again and again (2026-10-21..26): viewers hear the template
BANNED = (
    (re.compile(r"\bwait,?\s+what\b", re.I), "\"Wait, what?\""),
    (re.compile(r"^\s*wait[.,!]?\s+so\b", re.I), "\"Wait. So…\""),
    (re.compile(r"^\s*same [\w$₹{}]+[.,]\s+same\b", re.I), "\"Same X. Same Y.\""),
    (re.compile(r"didn'?t (even )?lift a finger", re.I), "\"didn't lift a finger\""),
    (re.compile(r"\bfor doing nothing\b", re.I), "\"for doing nothing\""),
)
OPENING_WORDS = 3


def applies(script: dict) -> bool:
    fmt = script.get("format", "short")
    return (fmt, script.get("template") or f"{fmt}_story") in (("short", "short_story"), ("long", "long_story"))


def _spine(script: dict) -> dict:
    return SPINE["long" if script.get("format") == "long" else "short"]


def _opening(line: str) -> str:
    words = re.findall(r"[a-z']+", re.sub(r"\{[^}]*\}", "", line.lower()))
    return " ".join(words[:OPENING_WORDS]) if len(words) >= OPENING_WORDS else ""


def script_problems(script: dict, earlier: list[dict] | None = None) -> list[str]:
    """What the script says: structure, roles, counter, banned and repeated lines."""
    if not applies(script):
        return []
    beats = script.get("beats") or []
    out = []
    sp = _spine(script)
    levels = ((script.get("structure") or {}).get("levels")) or []
    if sp["teases"] and len(levels) >= sp["levels_min"]:
        teases = sum(1 for b in beats if b.get("role") == "tease")
        if teases < len(levels) - 1:
            out.append(f"{teases} `tease` beats for {len(levels)} chapters: every chapter but the last ends on a tease "
                       f"(the open loop into the next), or viewers leave between chapters")
    if len(levels) < sp["levels_min"]:
        out.append(f"`structure.levels` needs {sp['levels_min']} or more steps the viewer waits for (\"Sell\", \"Borrow\", \"Never sell\"): "
                   f"the promise of a structure is what keeps people past the hook")
    roles = [b.get("role") for b in beats]
    bad = sorted({str(b.get("role")) for b in beats if b.get("role") not in ROLES and b.get("scene") not in ("chapter", "end")})
    if bad:
        out.append(f"beat roles must be one of {', '.join(ROLES)} (got {', '.join(map(str, bad))})")
    if beats and not (roles[0] == "hook" or beats[0].get("scene") == "hook"):
        out.append("the first beat is the hook (`role: hook`)")
    for need in ("promise", "turn", "payoff"):
        if need not in roles:
            out.append(f"no `{need}` beat: every video has a promise early, a turn about two thirds in, and a payoff that answers the hook")
    if "turn" in roles and "payoff" in roles and roles.index("payoff") < roles.index("turn"):
        out.append("the payoff comes after the turn")
    huds = [(b.get("params") or {}).get("hud") or {} for b in beats]
    used = {h["level"] for h in huds if isinstance(h.get("level"), int)}
    if levels and not set(range(1, len(levels) + 1)) <= used:
        out.append(f"every level needs a beat (params.hud.level 1..{len(levels)}); missing {sorted(set(range(1, len(levels) + 1)) - used)}")
    counters = [h["counter"].get("text") for h in huds if isinstance(h.get("counter"), dict)]
    if len(set(counters)) < COUNTER_CHANGES:
        out.append(f"the climbing number (params.hud.counter) changes {len(set(counters))} times; at least {COUNTER_CHANGES}: "
                   f"a number that climbs level by level is a reason to keep watching")
    for b in beats:
        say = b.get("say") or ""
        for rx, name in BANNED:
            if rx.search(say):
                out.append(f"beat {b.get('id')!r}: {name} is a line the channel has used too often; say it a new way")
    seen = {_opening(b.get("say") or "") for s in (earlier or []) for b in (s.get("beats") or [])} - {""}
    for b in beats:
        op = _opening(b.get("say") or "")
        if op and op in seen:
            out.append(f"beat {b.get('id')!r} opens like a line in one of the last scripts ({op!r}): new words")
    return out


def timeline_problems(script: dict, tl: dict, earlier: list[dict] | None = None) -> list[str]:
    """The script checks plus timing, measured on the built timeline."""
    if not applies(script) or not tl.get("beats"):
        return []
    out = script_problems(script, earlier)
    fps = tl["fps"]
    sp = _spine(script)
    starts = {b["id"]: b["from"] / fps for b in tl["beats"]}
    total = tl["durationInFrames"] / fps
    role = {b.get("id"): b.get("role") for b in script.get("beats") or []}
    promise = [starts[i] for i, r in role.items() if r == "promise" and i in starts]
    if promise and min(promise) > sp["promise_by"]:
        out.append(f"the promise starts at {min(promise):.1f} s; by {sp['promise_by']:.0f} s, or viewers leave before they know why to stay")
    figures = set(tl.get("figures", {}).values())
    first = None
    for b in tl["beats"]:
        text = str(b.get("params"))
        if (b.get("params") or {}).get("hud", {}).get("counter") or any(f and f in text for f in figures):
            first = b["from"] / fps
            break
    if first is None or first > sp["figure_by"]:
        out.append(f"the first figure appears at {'never' if first is None else f'{first:.1f} s'}; one by {sp['figure_by']:.0f} s")
    turns = [starts[i] for i, r in role.items() if r == "turn" and i in starts]
    if turns and not TURN_FROM <= turns[0] / total <= TURN_TO:
        out.append(f"the turn starts at {turns[0] / total:.0%} of the video; between {TURN_FROM:.0%} and {TURN_TO:.0%}")
    hook = tl["beats"][0]
    if hook["frames"] / fps > sp["hook_max"]:
        out.append(f"the hook runs {hook['frames'] / fps:.1f} s; keep it to {sp['hook_max']:.0f} s or less")
    return out
