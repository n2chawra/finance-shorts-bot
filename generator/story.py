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

2026-10-30 (owner: "levels in all videos feels very repetitive"; "the hook is unable to create
curiosity"; "characters speak one-liners, they should explain like a teacher"): a Short names its
`shape` (generator/shapes.py). Levels, the chips and the climbing counter belong to the levels shape
only; every other shape builds its stakes in `build` beats. A Short with a shape also opens on a
curiosity hook (a question or a promise, never the answer), is carried by one explaining voice in
full sentences, and changes speaker at most MAX_SWITCHES times. Scripts without a shape (before
2026-10-30) and long videos keep the levels rules.
"""
from __future__ import annotations

import re

PROMISE_BY = 6.0
FIRST_FIGURE_BY = 9.0
LEVELS_MIN = 3
COUNTER_CHANGES = 3
TURN_FROM, TURN_TO = 0.5, 0.85
ROLES = ("hook", "promise", "level", "build", "tease", "turn", "payoff", "loop", "end")
BUILD_MIN = 3            # beats of rising stakes (levels or build steps)
MAX_SWITCHES = 5         # speaker changes in a Short: one explainer, the cast reacting
LEAD_SHARE = 0.6         # the explaining voice says at least this share of the words
BEAT_WORDS = 12          # words per explaining beat on average: sentences, not one-liners
MAX_LOUD_TRANSITIONS = 4  # whip / zoom-through: travelling accents, not every cut (2 until 2026-11-02: too static)
# 2026-11-02 (owner: "story telling needs lots of work … the way of explanation is very weak", the car
# discount Short rated 2/10 for saying "might", "can", "some dealers" in every line): one story told
# with certainty, and a new open question every few beats so the viewer always waits for something
MAX_HEDGES = 2
HEDGES = re.compile(r"\b(might|may|maybe|could|perhaps|possibly|potentially|sometimes|often|some|quietly|can)\b", re.I)
OPEN_LOOPS_MIN = 2
OPEN_LOOP = re.compile(r"\?|\b(but|here'?s the (catch|twist|trick|clever part)|that'?s (not|only|just) (the|half|where)|"
                       r"the real|wait (till|until)|watch what|which is why|and that'?s (not|only))\b", re.I)
# the hook leaves a question open: it asks one, or promises the answer is coming
HOOK_GAP = re.compile(r"\?\s*$|\b(here'?s (how|why|what)|watch|let me show|find out|the answer|by the end|wait (till|until)|"
                      r"i'?ll show|this is how|this is why|how\?|why\?)\b", re.I)
# long videos (owner, 2026-10-26: "do the same upgrade for long videos"): the levels are the
# chapters, the promise comes within 30 s, every chapter but the last ends on a `tease` beat (the
# open loop into the next), and the hook may run longer
SPINE = {
    "short": {"promise_by": PROMISE_BY, "figure_by": FIRST_FIGURE_BY, "levels_min": LEVELS_MIN, "hook_max": 4.5, "teases": False},
    "long": {"promise_by": 30.0, "figure_by": 45.0, "levels_min": 4, "hook_max": 15.0, "teases": True},
}
# lines our Shorts said again and again (2026-10-21..26): viewers hear the template
BANNED = (
    (re.compile(r"\bwait,?\s+what\b", re.I), "\"Wait, what?\""),
    (re.compile(r"^\s*wait[.,!]?\s+so\b", re.I), "\"Wait. So…\""),
    (re.compile(r"^\s*same [\w$₹{}]+[.,]\s+same\b", re.I), "\"Same X. Same Y.\""),
    (re.compile(r"didn'?t (even )?lift a finger", re.I), "\"didn't lift a finger\""),
    (re.compile(r"\bfor doing nothing\b", re.I), "\"for doing nothing\""),
    # warm-up openers: start the line on the action instead (owner, 2026-11-02)
    (re.compile(r"^\s*(picture|imagine)\b", re.I), "a \"Picture…\" / \"Imagine…\" warm-up"),
    (re.compile(r"\bhere'?s the game\b|^\s*let'?s\b", re.I), "a \"Here's the game\" / \"Let's…\" warm-up"),
)
OPENING_WORDS = 3


def applies(script: dict) -> bool:
    fmt = script.get("format", "short")
    return (fmt, script.get("template") or f"{fmt}_story") in (("short", "short_story"), ("long", "long_story"))


def _spine(script: dict) -> dict:
    return SPINE["long" if script.get("format") == "long" else "short"]


def _levels(script: dict) -> bool:
    """Level chips and a climbing counter: long videos (chapters), Shorts before shapes, the levels shape."""
    if script.get("format") == "long" or script.get("shape") is None:
        return True
    from . import shapes
    return shapes.shows_levels(script["shape"])


def voice_problems(script: dict) -> list[str]:
    """A Short with a shape: a curiosity hook, one explaining voice, full sentences."""
    beats = script.get("beats") or []
    out = []
    hook = next((b for b in beats if b.get("role") == "hook" or b.get("scene") == "hook"), None)
    if hook and not HOOK_GAP.search((hook.get("say") or "").strip()):
        out.append("the hook gives no reason to stay: end it on the open question or a promise (\"Casinos make money even "
                   "when you win. Here's how.\"), never on the answer")
    spoken = [b for b in beats if (b.get("say") or "").strip() and b.get("scene") != "end"]
    words: dict[str, int] = {}
    for b in spoken:
        who = b.get("speaker") or "narrator"
        words[who] = words.get(who, 0) + len((b.get("say") or "").split())
    total = sum(words.values())
    from . import shapes
    two_voices = bool(((shapes.get(shapes.shape_id(script.get("shape"))) or {}).get("rules") or {}).get("two_voices"))
    # a question chain is two voices by design: the asker's questions are a big share (their "$0 salary": ~40%)
    lead_share = 0.5 if two_voices else LEAD_SHARE
    if total:
        lead, n = max(words.items(), key=lambda kv: kv[1])
        if n / total < lead_share:
            out.append(f"no one explains: {lead} says {n / total:.0%} of the words; one voice (the narrator or one teacher) "
                       f"carries {lead_share:.0%} or more and the others react")
    switches = sum(1 for a, b in zip(spoken, spoken[1:]) if (a.get("speaker") or "narrator") != (b.get("speaker") or "narrator"))
    if switches > MAX_SWITCHES and not two_voices:      # a question chain is two voices by design
        out.append(f"the speaker changes {switches} times; at most {MAX_SWITCHES}: one voice explains, the cast react")
    body = [b for b in spoken if b.get("role") not in ("hook", "loop", "end")]
    # a board video is one sentence per beat (2026-11-02): its beats are short by design
    boards = sum(1 for b in beats if b.get("scene") == "board")
    if body and boards * 2 < len(beats):
        avg = sum(len((b.get("say") or "").split()) for b in body) / len(body)
        if avg < BEAT_WORDS:
            out.append(f"beats average {avg:.0f} words: explain in full sentences ({BEAT_WORDS}+ words a beat, "
                       f"\"because… so… which means…\"), not one-liners")
    # when the narrator explains, the camera frames the thing being explained, not a person (owner,
    # 2026-10-30: "the animation should be the centre of impression, not the characters")
    cast = {"rohan", "priya", "sharma", "sikka"}
    on_people = [b.get("id") for b in beats if (b.get("speaker") or "narrator") == "narrator" and b.get("scene") in ("build", "shot")
                 and b.get("role") not in ("hook", "turn", "loop")
                 and any(isinstance(k, dict) and k.get("on") in cast for k in (b.get("params") or {}).get("camera") or [])]
    if on_people:
        out.append(f"beats {', '.join(map(str, on_people))}: the narrator explains while the camera frames a person; frame the "
                   f"things being explained (an item or \"all\"), characters step back")
    loud = [b.get("id") for b in beats if b.get("transition") in ("whip", "zoom-through")]
    if len(loud) > MAX_LOUD_TRANSITIONS:
        out.append(f"{len(loud)} whip or zoom-through transitions ({', '.join(map(str, loud))}); at most {MAX_LOUD_TRANSITIONS}: "
                   f"cut or match between beats, so the picture doesn't zig-zag")
    hedges = [m.group(0).lower() for b in spoken for m in HEDGES.finditer(re.sub(r"\{[^}]*\}", "", b.get("say") or ""))]
    if len(hedges) > MAX_HEDGES:
        out.append(f"{len(hedges)} hedging words ({', '.join(sorted(set(hedges)))}); at most {MAX_HEDGES}: tell one concrete story "
                   f"with certainty (\"The dealer takes two thousand off.\", not \"some dealers can…\"); the disclaimer covers it")
    middle = [b for b in body if b.get("role") != "payoff"]
    loops = sum(1 for b in middle if OPEN_LOOP.search(b.get("say") or ""))
    if middle and loops < OPEN_LOOPS_MIN:
        out.append(f"{loops} beats between the hook and the payoff open a new question; at least {OPEN_LOOPS_MIN} (\"But that's "
                   f"not where the dealer makes his money.\", \"So why would he give it away?\"): the viewer always waits for something")
    if not _levels(script):
        said = sum(len(re.findall(r"\blevel\b", b.get("say") or "", re.I)) for b in beats)
        if said:
            out.append(f"\"level\" is said {said} times in a {script.get('shape')!r} video: the word is for the levels shape")
    return out


# ---- The Curious Plot study (owner, 2026-11-02: "find out what more needs to be done") ----
# Measured on their "$0 salary" (43K) and "egg selling" (1.3M) Shorts against ours: a question in
# the viewer's voice every ~9 s (ours every ~20), every figure built from units with the sum on screen,
# a named term per step, a board header stating each sentence's point, and an ending that asks the
# viewer something ("Which son are you?"). Sentence length and the number of actions were the same.
QUESTION_EVERY = {"short": 12.0, "long": 30.0}   # seconds of speech per question, at least
WPM = {"short": 175.0, "long": 215.0}
BOARD_VERBS = ("header", "equation", "term", "stamp", "cross", "tick", "strike", "arrow", "bubble", "bars",
               "ring", "grid", "calendar", "buttons", "click", "person", "step")


def _questions(text: str) -> int:
    return len(re.findall(r"\?", re.sub(r"\{[^}]*\}", "", text)))


def chain_problems(script: dict) -> list[str]:
    """Question cadence, board headers, the shape's own rules (sums and terms on a ladder, an asker's
    questions, dated steps), and an ending that asks the viewer something."""
    from . import shapes
    fmt = "long" if script.get("format") == "long" else "short"
    beats = script.get("beats") or []
    spoken = [b for b in beats if (b.get("say") or "").strip() and b.get("scene") != "end"]
    if not spoken:
        return []
    out = []
    words = sum(len(re.sub(r"\{[^}]*\}", "x x x", b["say"]).split()) for b in spoken)   # a figure is said in ~3 words
    seconds = words / WPM[fmt] * 60
    asked = sum(_questions(b["say"]) for b in spoken)
    need = int(seconds // QUESTION_EVERY[fmt])
    if asked < need:
        out.append(f"{asked} questions in about {seconds:.0f} s of speech; at least {need} (one every {QUESTION_EVERY[fmt]:.0f} s): "
                   f"say the viewer's next question out loud (\"Then how do they pay for anything?\") and answer it")
    for b in beats:
        if b.get("scene") != "board":
            continue
        p = b.get("params") or {}
        if not (isinstance(p.get("header"), str) and p["header"].strip()):
            out.append(f"beat {b.get('id')!r}: a board beat opens with `header`, the point of what is said, so it reads without sound")
    out += board_rhythm_problems(script)
    acts = [a for b in beats if b.get("scene") == "board" for a in (b.get("params") or {}).get("actions") or [] if isinstance(a, dict)]
    shape = shapes.get(shapes.shape_id(script.get("shape"))) or {}
    rules = shape.get("rules") or {}
    if rules.get("steps_min"):
        n_eq = sum(1 for a in acts if a.get("do") == "equation")
        n_term = sum(1 for a in acts if a.get("do") == "term")
        if n_eq < rules["steps_min"]:
            out.append(f"{n_eq} sums on screen; a {shape['id']} shows each step's sum building ({rules['steps_min']}+ `equation` actions)")
        if rules.get("terms") and n_term < rules["steps_min"]:
            out.append(f"{n_term} named terms; each step of a {shape['id']} names its term (`term`, {rules['steps_min']}+)")
    if rules.get("asker_questions_min"):
        lead = _lead(spoken)
        asker = sum(_questions(b["say"]) for b in spoken if (b.get("speaker") or "narrator") != lead)
        if asker < rules["asker_questions_min"]:
            out.append(f"the asker asks {asker} questions; a {shape['id']} has {rules['asker_questions_min']}+, each sharper than the last")
    if rules.get("dates_min"):
        years = sum(1 for f in script.get("facts") or [] if f.get("unit") == "year")
        if years < rules["dates_min"]:
            out.append(f"{years} dated steps; a {shape['id']} dates at least {rules['dates_min']} moments (facts with unit \"year\")")
    if "?" not in " ".join(b["say"] for b in spoken[-2:]):
        out.append("the ending asks the viewer nothing: close on the lesson and a question to them (\"Which one are you?\")")
    return out


# Rooms and cards (owner, 2026-11-02, comparing the board demo with The Curious Plot: "our video has the
# same props throughout, his changed every 5 seconds for everything spoken"). Theirs: the question in the
# room with both characters, every answer on its own full-frame card (no characters), a new picture and
# colour every ~5 s, a thing that comes back drawn differently. Ours kept the cast and the same shares,
# house and pay slip on screen for 30 s.
BOARD_BEAT_MAX = {"short": 6.5, "long": 9.0}   # seconds of speech in one board beat: one sentence each
PROP_BEATS_MAX = 4                              # board beats one prop may appear in (a callback, not a set)
SHARED = {"note", "coin", "cash", "box"}


def _picture(b: dict) -> frozenset:
    """What a board beat shows in the middle: its things (with their states) and its panels."""
    p = b.get("params") or {}
    things = {f"{i.get('prop')}:{i.get('state', '')}" for i in p.get("items") or [] if isinstance(i, dict) and i.get("prop")}
    panels = {f"{a.get('do')}:{a.get('prop', '')}" for a in p.get("actions") or [] if isinstance(a, dict)
              and a.get("do") in ("bars", "ring", "grid", "calendar", "buttons", "person", "equation", "term")}
    states = {f"{a.get('target')}:{a.get('state')}" for a in p.get("actions") or [] if isinstance(a, dict) and a.get("do") in ("state", "swap")}
    return frozenset(things | panels | states)


def board_rhythm_problems(script: dict) -> list[str]:
    fmt = "long" if script.get("format") == "long" else "short"
    boards = [b for b in script.get("beats") or [] if b.get("scene") == "board"]
    if len(boards) < 3:
        return []
    out = []
    for b in boards:
        words = len(re.sub(r"\{[^}]*\}", "x x x", b.get("say") or "").split())
        sec = words / WPM[fmt] * 60
        if sec > BOARD_BEAT_MAX[fmt]:
            out.append(f"board beat {b.get('id')!r} speaks for about {sec:.0f} s; at most {BOARD_BEAT_MAX[fmt]:.1f}: one sentence, "
                       f"one picture per beat (split it), so the picture changes every few seconds")
    for a, b in zip(boards, boards[1:]):
        if _picture(a) == _picture(b):
            out.append(f"board beats {a.get('id')!r} and {b.get('id')!r} show the same picture: every beat brings a new one")
        pa, pb = a.get("params") or {}, b.get("params") or {}
        if not pa.get("cast") and not pb.get("cast") and pa.get("bg") == pb.get("bg"):
            out.append(f"cards {a.get('id')!r} and {b.get('id')!r} share the colour {pa.get('bg')!r}: each card its own")
    # a card is a labelled diagram, not one icon (owner, 2026-11-02, frame by frame against theirs: a slip
    # with real data, a calendar and two chips on one card; ours one paycheck with a cross)
    for b in boards:
        p = b.get("params") or {}
        if p.get("cast"):
            continue
        acts = [a for a in p.get("actions") or [] if isinstance(a, dict)]
        words = sum(1 for i in p.get("items") or [] if isinstance(i, dict) and (i.get("label") or i.get("tag")))
        for a in acts:
            words += {"doc": len(a.get("rows") or []), "chip": 1, "term": 1, "equation": 1, "person": 1,
                      "bars": len(a.get("items") or []), "buttons": len(a.get("items") or []), "stamp": 1, "tag": 1,
                      "arrow": 1 if a.get("text") else 0}.get(a.get("do"), 0)
            words += 1 if a.get("do") in ("ring", "grid", "calendar") and (a.get("label") or a.get("callout") or a.get("text")) else 0
        if len(acts) < 3 or words < 2:
            out.append(f"card {b.get('id')!r} has {len(acts)} changes and {words} pieces of text: a card is a labelled diagram "
                       f"(3+ changes, 2+ labels, rows, chips or callouts), not one icon")
    count: dict[str, int] = {}
    for b in boards:
        for x in {i.get("prop") for i in (b.get("params") or {}).get("items") or [] if isinstance(i, dict)} - SHARED - {None}:
            count[x] = count.get(x, 0) + 1
    over = sorted(k for k, n in count.items() if n > PROP_BEATS_MAX)
    if over:
        out.append(f"{', '.join(over)} on screen in more than {PROP_BEATS_MAX} beats: the same things all video long read as one "
                   f"static set; bring new things, or draw a returning one differently (a `state`)")
    from . import shapes
    if ((shapes.get(shapes.shape_id(script.get("shape"))) or {}).get("rules") or {}).get("two_voices"):
        spoken = [b for b in script.get("beats") or [] if (b.get("say") or "").strip()]
        lead = _lead(spoken)
        rooms = [b.get("id") for b in boards if (b.get("speaker") or "narrator") == lead and (b.get("params") or {}).get("cast")]
        if len(rooms) > 1:
            out.append(f"the explainer answers in the room in {', '.join(map(str, rooms))}: questions are asked in the room, "
                       f"answers go on a card (a board beat without `cast`)")
    return out


def _lead(spoken: list[dict]) -> str:
    words: dict[str, int] = {}
    for b in spoken:
        who = b.get("speaker") or "narrator"
        words[who] = words.get(who, 0) + len(b["say"].split())
    return max(words, key=words.get) if words else "narrator"


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
    laddered = _levels(script)
    if not laddered and levels:
        out.append(f"`structure.levels` (the level chips) belongs to the levels shape; a {script.get('shape')!r} video "
                   f"builds its stakes in `build` beats without chips")
    if not laddered:
        builds = sum(1 for b in beats if b.get("role") in ("build", "level"))
        if builds < BUILD_MIN:
            out.append(f"{builds} `build` beats; at least {BUILD_MIN}: the stakes rise step by step before the turn")
    if script.get("shape") is not None and script.get("format", "short") == "short":
        out += voice_problems(script)
    if script.get("shape") is not None or script.get("format") == "long" or any(b.get("scene") == "board" for b in beats):
        out += chain_problems(script)
    if sp["teases"] and len(levels) >= sp["levels_min"]:
        teases = sum(1 for b in beats if b.get("role") == "tease")
        if teases < len(levels) - 1:
            out.append(f"{teases} `tease` beats for {len(levels)} chapters: every chapter but the last ends on a tease "
                       f"(the open loop into the next), or viewers leave between chapters")
    if laddered and len(levels) < sp["levels_min"]:
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
    if laddered and len(set(counters)) < COUNTER_CHANGES:
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
