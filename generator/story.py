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

from renderer.advice import note

PROMISE_BY = 6.0
FIRST_FIGURE_BY = 9.0
LEVELS_MIN = 3
COUNTER_CHANGES = 3
TURN_FROM, TURN_TO = 0.5, 0.85
ROLES = ("hook", "promise", "level", "build", "tease", "turn", "payoff", "loop", "end")
BUILD_MIN = 3            # beats of rising stakes (levels or build steps)
MAX_SWITCHES = 5         # speaker changes in a Short: one explainer, the cast reacting
LEAD_SHARE = 0.6         # the explaining voice says at least this share of the words
BEAT_WORDS = 10          # words per explaining beat on average: sentences, not one-liners (12 until 2026-11-04, for 60–90 s Shorts)
MAX_LOUD_TRANSITIONS = 4  # whip / zoom-through: travelling accents, not every cut (2 until 2026-11-02: too static)
# 2026-11-02 (owner: "story telling needs lots of work … the way of explanation is very weak", the car
# discount Short rated 2/10 for saying "might", "can", "some dealers" in every line): one story told
# with certainty, and a new open question every few beats so the viewer always waits for something
MAX_HEDGES = 2
# a count of what's coming, said right after the hook ("Three clues explain…", "here are the four levels")
ANNOUNCE = re.compile(r"\b(two|three|four|five|six|seven|\d+)\s+(clues|levels|reasons|steps|ways|things|secrets|rules|tricks|stages|moves|questions)\b"
                      r"|\bhere (are|is) (the|how)\b|\blet'?s (break|look|go)\b", re.I)
# "can't" / "can’t" state a fact; only a bare "can" hedges (\b alone matched the "can" in "can't")
HEDGES = re.compile(r"\b(might|may|maybe|could|perhaps|possibly|potentially|sometimes|often|some|quietly|can(?!['’]t))\b", re.I)
OPEN_LOOPS_MIN = 2
OPEN_LOOP = re.compile(r"\?|\b(but|here'?s the (catch|twist|trick|clever part)|that'?s (not|only|just) (the|half|where)|"
                       r"the real|wait (till|until)|watch what|which is why|and that'?s (not|only))\b", re.I)
# the hook leaves a question open: it asks one, or promises the answer is coming
HOOK_GAP = re.compile(r"\?\s*$|\b(here'?s (how|why|what)|watch|let me show|find out|the answer|by the end|wait (till|until)|"
                      r"i'?ll show|this is how|this is why|how\?|why\?)\b", re.I)
# the hook pattern (owner, 2026-10-31 and again 2026-11-09: "the video says what people think, not that it's
# wrong. Like do you think ... you're wrong"): a variant-system Short (script.arms) opens on the belief put to
# the viewer and denied ("You think McDonald's makes its money selling burgers? It doesn't."). On 9 Nov all
# three Shorts ended the belief on a stock "Watch this." instead, so the check now reads the line itself.
BELIEF = re.compile(r"^\W*(so,?\s+)?(do\s+)?you\s+(really\s+|still\s+|probably\s+)?(think|believe|assume|figure|bet)\b[^?]*\?", re.I)
DENIAL = re.compile(r"\b(not|no|nope|never|wrong|nothing|none|nobody|zero|think again)\b|n['’]t\b", re.I)
DENIAL_WORDS = 6        # the denial comes right after the question ("It doesn't." / "Not one of them.")
STOCK_TAG = re.compile(r"(\bwatch( this| how| what)?|\bhere'?s (why|how|what)|\blet me show you|\bfind out)\W*$", re.I)
HOOK_TAIL_WORDS = 4     # a hook may not end like one of the last HOOK_TAIL_SCRIPTS Shorts' hooks
HOOK_TAIL_SCRIPTS = 6
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


PLACEHOLDER = re.compile(r"\{([a-z][a-z0-9_]*)\}")


def _shown(node, out: set) -> None:
    if isinstance(node, str):
        out.update(PLACEHOLDER.findall(node))
    elif isinstance(node, dict):
        for v in node.values():
            _shown(v, out)
    elif isinstance(node, list):
        for v in node:
            _shown(v, out)


def spoken_figure_problems(script: dict) -> list[str]:
    """A Short's picture may not carry a figure the voice hasn't said (owner, 2026-11-11, on v-20261111-03,
    Ohtani: "animation were showing numbers difference but voice speaking was very little to understand").
    Its picture showed the $700 million deal, the deferred sum and the sponsor money; the voice said "far
    more" and "a side cheque". Every figure on screen after the hook is said in that beat or before it."""
    unsaid, said = [], set()
    for b in script.get("beats") or []:
        said |= set(PLACEHOLDER.findall(b.get("say") or ""))
        if b.get("role") == "hook" or b.get("scene") == "hook":
            continue
        shown: set = set()
        _shown(b.get("params") or {}, shown)
        unsaid += [f"{b.get('id')} {{{m}}}" for m in sorted(shown - said)]
    if not unsaid:
        return []
    return [f"the picture shows figures the voice never says ({', '.join(unsaid)}): say each one where it appears, "
            f"with what it means (\"he gets {{x}} now, and {{y}} waits ten years\"), or take it off the picture; "
            f"viewers can't follow numbers nobody explains"]


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
    # a variant-system Short's hook is checked by hook_problems (the belief, denied); the denial is its gap
    if hook and not script.get("arms") and not HOOK_GAP.search((hook.get("say") or "").strip()):
        out.append(note("the hook gives no reason to stay: end it on the open question or a promise (\"Casinos make money even "
                   "when you win. Here's how.\"), never on the answer"))
    spoken = [b for b in beats if (b.get("say") or "").strip() and b.get("scene") != "end"]
    body = [b for b in spoken if b.get("role") not in ("hook", "loop", "end")]
    # 2026-11-11 (owner review): the one-explaining-voice rules are gone (a lead voice with 60% of the words,
    # at most five speaker changes, 10+ words a beat, the camera off the cast). The Shorts that worked were
    # skits the cast acted (narrator under 25% of the words: 4.3x the median), and these rules forbade them.
    loud = [b.get("id") for b in beats if b.get("transition") in ("whip", "zoom-through")]
    if len(loud) > MAX_LOUD_TRANSITIONS:
        out.append(note(f"{len(loud)} whip or zoom-through transitions ({', '.join(map(str, loud))}); at most {MAX_LOUD_TRANSITIONS}: "
                   f"cut or match between beats, so the picture doesn't zig-zag"))
    hedges = [m.group(0).lower() for b in spoken for m in HEDGES.finditer(re.sub(r"\{[^}]*\}", "", b.get("say") or ""))]
    if len(hedges) > MAX_HEDGES:
        out.append(note(f"{len(hedges)} hedging words ({', '.join(sorted(set(hedges)))}); at most {MAX_HEDGES}: tell one concrete story "
                   f"with certainty (\"The dealer takes two thousand off.\", not \"some dealers can…\"); the disclaimer covers it"))
    middle = [b for b in body if b.get("role") != "payoff"]
    loops = sum(1 for b in middle if OPEN_LOOP.search(b.get("say") or ""))
    if middle and loops < OPEN_LOOPS_MIN:
        out.append(note(f"{loops} beats between the hook and the payoff open a new question; at least {OPEN_LOOPS_MIN} (\"But that's "
                   f"not where the dealer makes his money.\", \"So why would he give it away?\"): the viewer always waits for something"))
    # announcing the structure right after the hook ("three clues…", "four levels…") lost 24–41% of viewers
    # within 2 s in five Shorts (auditor, 2026-11-03): go straight into the first surprising fact
    for b in body[:2]:
        m = ANNOUNCE.search(re.sub(r"\{[^}]*\}", "", b.get("say") or ""))
        if m:
            out.append(f"beat {b.get('id')!r} announces the structure ({m.group(0)!r}): viewers leave at that line; go "
                       f"straight into the first surprising fact")
    if not _levels(script):
        said = sum(len(re.findall(r"\blevel\b", b.get("say") or "", re.I)) for b in beats)
        if said:
            out.append(note(f"\"level\" is said {said} times in a {script.get('shape')!r} video: the word is for the levels shape"))
    return out


# ---- The Curious Plot study (owner, 2026-11-02: "find out what more needs to be done") ----
# Measured on their "$0 salary" (43K) and "egg selling" (1.3M) Shorts against ours: a question in
# the viewer's voice every ~9 s (ours every ~20), every figure built from units with the sum on screen,
# a named term per step, a board header stating each sentence's point, and an ending that asks the
# viewer something ("Which son are you?"). Sentence length and the number of actions were the same.
QUESTION_EVERY = {"short": 20.0, "long": 30.0}   # seconds of speech per question, at least (Shorts 12 s until 2026-11-04: they are 20–35 s now)
WPM = {"short": 175.0, "long": 180.0}   # long 215 until tempo 1.5 -> 1.25 (owner, 2026-11-04)
WORDS_PER_SPEED = 229 / 1.4   # Kokoro words a minute per unit of voice speed (measured on v-20261118-02: 229 at 1.4)


def wpm(fmt: str) -> float:
    """Spoken words a minute: the channel's own voice speed when it has one (channel.json voiceSpeed)."""
    from . import pack
    own = pack.voice_speed(fmt)
    return WORDS_PER_SPEED * own if own else WPM[fmt]
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
    seconds = words / wpm(fmt) * 60
    asked = sum(_questions(b["say"]) for b in spoken)
    need = int(seconds // QUESTION_EVERY[fmt])
    if asked < need:
        out.append(note(f"{asked} questions in about {seconds:.0f} s of speech; at least {need} (one every {QUESTION_EVERY[fmt]:.0f} s): "
                   f"say the viewer's next question out loud (\"Then how do they pay for anything?\") and answer it"))
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
    # a Short whose last line loops back to the hook needs no closing question: the loop is the ending
    looped = fmt == "short" and any(b.get("role") == "loop" for b in beats)
    if not looped and "?" not in " ".join(b["say"] for b in spoken[-2:]):
        out.append(note("the ending asks the viewer nothing: close on the lesson and a question to them (\"Which one are you?\")"))
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
        sec = words / wpm(fmt) * 60
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


def _hook_line(script: dict) -> str:
    beats = script.get("beats") or []
    hook = next((b for b in beats if b.get("role") == "hook" or b.get("scene") == "hook"), None)
    return ((hook or {}).get("say") or "").strip()


def _tail(line: str) -> str:
    words = re.findall(r"[a-z']+", re.sub(r"\{[^}]*\}", "", line.lower().replace("’", "'")))
    return " ".join(words[-HOOK_TAIL_WORDS:]) if len(words) >= HOOK_TAIL_WORDS else ""


# Owner, 2026-11-12, after watching our best Shorts frame by frame: "On an illustrative billionaire",
# "Say only 300 members walk through the door": a story the video admits it made up is not one anyone
# shares. Every Short tells something true, from sourced facts; the maths may build on them.
INVENTED = re.compile(r"\b(illustrative|hypothetical(ly)?|imagine|suppose|let'?s say|say (only|just)?\s*\w+ (people|members|customers|users|of them)|"
                      r"a made[- ]up|for example,? say|picture (a|an|this))\b", re.I)


def invented_problems(script: dict) -> list[str]:
    """A Short tells a true story: it carries sourced `facts`, and no line admits an invented example."""
    if script.get("format", "short") != "short":
        return []
    out = []
    if not script.get("facts"):
        out.append("no sourced `facts`: every Short tells something true about a real, named person or business, with its "
                   "figures from the topic feed (owner, 2026-11-12); a made-up example is not a story anyone shares")
    for b in script.get("beats") or []:
        m = INVENTED.search(re.sub(r"\{[^}]*\}", "", b.get("say") or ""))
        if m:
            out.append(f"beat {b.get('id')!r} invents an example ({m.group(0)!r}): tell what really happened, from the facts")
    return out


CAST = {"rohan", "priya", "sharma", "sikka"}


def reaction_problems(script: dict) -> list[str]:
    """A close-up of a cast member that shows nothing new ("EASY.", "WHAT?") wastes a second the viewer is
    deciding in. A note: the face is fine when it carries the information."""
    out = []
    for b in script.get("beats") or []:
        cams = (b.get("params") or {}).get("camera") or []
        close = [k for k in cams if isinstance(k, dict) and k.get("on") in CAST and k.get("size") in ("close", "extreme")]
        p = b.get("params") or {}
        shows = p.get("figure") or p.get("items") or p.get("actions") or p.get("things")
        if close and not shows and b.get("role") not in ("turn",):
            out.append(note(f"beat {b.get('id')!r} is a close-up of {close[0].get('on')} with nothing new on screen: show the "
                            f"thing or the figure the line is about, not a reaction face"))
    return out


def payoff_problems(script: dict) -> list[str]:
    """The payoff lands on the most surprising figure: the one worth sharing. A note."""
    beats = script.get("beats") or []
    pay = next((b for b in beats if b.get("role") == "payoff"), None)
    if pay and not re.search(r"\{[a-z0-9_]+\}", pay.get("say") or ""):
        return [note(f"the payoff {pay.get('id')!r} says no figure: end on the most surprising number in the story, "
                     f"the one a viewer would send to a friend")]
    return []


# Owner, 2026-11-14, on v-20261114-03 ("The Las Vegas Strip keeps $16,772 every minute"): "the script is not
# actually making people engaged knowing how casino earns or make them curious about something they dont know".
# Its beats sliced one total into a minute, an hour, a day and a year: arithmetic, with nothing the viewer didn't
# know. A Short is about HOW the money is made (who pays, for what, the part people miss), not one figure rescaled.
# "a year later", "one night in 1998", "a week before the deal" say when something happened, not a rate
TIME_RATE = re.compile(r"\b(?:every|each|per|an?|one|whole|all of)\s+(second|minute|hour|day|night|week|month|year)\b"
                       r"(?!\s+(?:later|ago|earlier|after|before|on\b|when\b|in\s+\d{4}))", re.I)
TIME_RATE_MAX = 2


def curiosity_problems(script: dict) -> list[str]:
    """A Short that restates one figure per minute, hour, day and year is a unit ladder, not a story."""
    if script.get("format", "short") != "short":
        return []
    units: dict[str, str] = {}
    for b in script.get("beats") or []:
        say = b.get("say") or ""
        if not re.search(r"\{[a-z0-9_]+\}", say):
            continue
        for m in TIME_RATE.finditer(say):
            units.setdefault(m.group(1).lower(), str(b.get("id")))
    if len(units) > TIME_RATE_MAX:
        ladder = ", ".join(f"{u} ({bid})" for u, bid in units.items())
        return [f"the Short slices its figures into {len(units)} time units ({ladder}): that is a unit ladder, arithmetic "
                f"the viewer can do, not something they didn't know (owner, 2026-11-14, on the Las Vegas Short). Keep one "
                f"rate at most and spend the beats on HOW the money is made: who pays, for what, and the part people miss"]
    return []


# Auditor, 2026-11-16 (channel review): in 20 of the 26 Shorts of the last 3 weeks the steepest fall came at
# 4.5-7 s, on the second line: a wider total ("Forbes' top creators made {top_whole} in all", MrBeast, -41
# points at 5.3 s), the same figure rescaled ("How big does that get? Every hour, about…", Las Vegas), the
# expected baseline ("Last year, Delta took in {x} in revenue") or a setup ("Say your cart rings up…").
# Owner, 2026-11-16 (content research): Apple lost 27% at 5.1 s on "services" and 18% at 9.2 s on its revenue
# line; the US-debt Short said "Treasury bills and bonds". At 5 s a stranger who hears jargon swipes.
JARGON = re.compile(r"\b(revenue|operating (income|profit)|profit before tax|pre-?tax|treasur(y|ies)|bonds|net worth|"
                    r"margins?|fiscal|quarterly|ebitda|cost to provide|trust funds?|shareholders?|dividends?)\b", re.I)
# The Shorts that kept them went on with the hook's own story: "And it still kept {pro_total}." (Netflix),
# "And she sold out every one of her {n} shows." (Eras Tour, 994 views at 48 h). Lessons 3 and 4 (lessons.md, 2026-11-16).
SECOND_LINE_BAD = (
    (re.compile(r"\b(put together|all of them|between them)\b|"
                r"\b(top|richest|biggest) \w+ (made|earned|took|brought|have|own)\b|\bthe (whole|entire) (industry|list|market|world)\b", re.I),
     "a wider total than the hook's own subject"),
    (re.compile(r"\bhow big does (that|it|this) get\b|\bin other words\b|\bthat'?s (about )?\{[a-z0-9_]+\} (every|a|an|per)\b", re.I),
     "the hook's figure rescaled"),
    (re.compile(r"\b(here'?s how|here is how|how it works|let'?s (break|look|see)|to understand|it (all )?starts with|"
                r"step one|the answer is|it'?s simple|say your)\b|^\W*first,", re.I),
     "a setup or an explanation"),
    (re.compile(r"\b(took|brought|made|earned) in (about |almost |over )?\{[a-z0-9_]+\} in (revenue|sales)\b", re.I),
     "the expected baseline (its revenue)"),
    # owner, 2026-11-16 (content research): Apple lost 27% at 5.1 s on "services" and 18% at 9.2 s on its revenue line;
    # the US-debt Short said "Treasury bills and bonds". At 5 s a stranger hears jargon and swipes
    (JARGON, "a finance word (say it plainly: keeps, takes home, pays, owes, owns)"),
)
SECOND_LINE_SENTENCES = 2   # the sentences after the hook's first one that play at about 3-7 s


def _sentences(text: str) -> list[str]:
    return [s for s in re.split(r"(?<=[.!?])\s+", text.strip()) if s]


def second_line_problems(script: dict) -> list[str]:
    """The line after the hook carries on the hook's own story with a bigger surprise; never a wider total,
    the same figure rescaled, the expected baseline or a setup (auditor 2026-11-16: 20 of 26 Shorts lost
    the most viewers at 4.5-7 s, on that line)."""
    if script.get("format", "short") != "short":
        return []
    spoken = [b for b in script.get("beats") or [] if (b.get("say") or "").strip()]
    seq = [(b.get("id"), s) for b in spoken[:3] for s in _sentences(b["say"])]
    out = []
    for bid, line in seq[1:1 + SECOND_LINE_SENTENCES]:
        for rx, what in SECOND_LINE_BAD:
            m = rx.search(line)
            if m:
                out.append(f"beat {bid!r}: the line right after the hook is {what} ({m.group(0).strip()!r} in {line!r}); "
                           f"20 of 26 Shorts lost the most viewers here, at 4.5-7 s. Go on with the hook's own story: the "
                           f"next, bigger surprise about the same person or business (\"And it still kept {{pro_total}}.\")")
                break
        if ANNOUNCE.search(line):
            out.append(f"beat {bid!r}: the line right after the hook announces a structure ({ANNOUNCE.search(line).group(0)!r}): "
                       f"give the next surprise instead; viewers leave on a count of what is coming")
    return out


def hook_problems(script: dict, earlier: list[dict] | None = None) -> list[str]:
    """A Short's hook names the person or business, or the price the viewer pays, and opens the question a
    stranger wants answered; the answer waits for the payoff (owner, 2026-11-16: content research; see
    `reveal_problems`). From 2026-11-11 the hook stated the surprising fact itself, which killed the "You
    think X? It isn't." pattern but gave the payoff away: most Shorts then lost their biggest share at 5-6 s,
    on a line that only confirmed it. No belief to knock down, no stock tag, an ending of its own."""
    from . import formats
    line = _hook_line(script)
    if not line:
        return []
    out = []
    example = "\"Costco sells you a hot dog for {price}. So how does it make any money?\""
    if BELIEF.search(line):
        out.append(f"the hook opens on \"You think …?\" (got {line!r}): name the subject and ask the real question, as in "
                   f"{example}; the viewer decides in the first second, and a question about what they think gives them nothing yet")
    first = re.split(r"(?<=[.!?])\s+", line)[0]
    names = [w for w in formats.NAME_IN_TITLE.findall(first) if w.lower() not in formats.COMMON_WORDS]
    opener = (first.split() or [""])[0]
    named = bool(names) or (opener[:1].isupper() and opener.lower().strip(".,!?'’s") not in formats.COMMON_STARTS)
    if not (formats.MONEY_IN_TITLE.search(first) or named):
        out.append(f"the hook's first sentence names no famous person or company and no figure (got {first!r}): the subject, "
                   f"or the price the viewer pays, is said first, as in {example}")
    if STOCK_TAG.search(line):
        out.append(f"the hook ends on a stock tag ({STOCK_TAG.search(line).group(0).strip()!r}): end it on the fact; "
                   f"the surprise is the reason to stay")
    tail = _tail(line)
    recent = [_tail(_hook_line(s)) for s in (earlier or [])[-HOOK_TAIL_SCRIPTS:] if s.get("format", "short") == "short"]
    if tail and tail in recent:
        out.append(note(f"the hook ends like one of the last {HOOK_TAIL_SCRIPTS} Shorts' hooks ({tail!r}): new words"))
    return out


# Owner, 2026-11-16, after the content research (plan "Why our Shorts stop at ~1K views"): the payoff waits for
# the payoff. "Netflix spent $17.1B on new shows and still kept $11B" put lines 1 and 2 in the title, and the
# biggest drop (33% at 5.9 s) came on line 2; Costco said its 64% payoff at 2.4 s. Of 20 money Shorts at
# 160K-9.6M views, none stated the answer in its title; 13 asked the question.
EARLY_ROLES = ("hook", "promise")
QUESTION_TITLE = re.compile(r"\?\W*$|^\W*(how|why|what|which|who|where|when|is|are|does|do|did|can|could|would|should|will)\b", re.I)
TITLE_FIGURE = re.compile(r"\{[a-z][a-z0-9_]*\}|[$£€₹]\s?\d[\d,.]*\s?[kmbt]?\b|\b\d[\d,.]*\s?(%|percent|billion|million|trillion|crore|lakh)", re.I)


def _payoff_figures(script: dict) -> set[str]:
    pay = next((b for b in script.get("beats") or [] if b.get("role") == "payoff"), None)
    return set(PLACEHOLDER.findall((pay or {}).get("say") or ""))


def reveal_problems(script: dict) -> list[str]:
    """The figure the payoff lands on is not said in the hook or the promise: the opening asks, the payoff answers."""
    if script.get("format", "short") != "short":
        return []
    pay = _payoff_figures(script)
    out = []
    for b in script.get("beats") or []:
        if b.get("role") not in EARLY_ROLES:
            continue
        early = pay & set(PLACEHOLDER.findall(b.get("say") or ""))
        if early:
            out.append(f"beat {b.get('id')!r} ({b.get('role')}) already says the payoff's figure "
                       f"{', '.join('{' + f + '}' for f in sorted(early))}: hold it back for the payoff. The opening names the "
                       f"subject and asks the question; once the answer is out, viewers leave at 5-6 s")
    return out


def title_reveal_problems(script: dict, title: str | None) -> list[str]:
    """A Short's title names the subject and asks; it never states the payoff's figure, and at most one figure."""
    t = (title or "").strip()
    if not t or script.get("format", "short") != "short":
        return []
    out = []
    shown = set(PLACEHOLDER.findall(t)) & _payoff_figures(script)
    if shown:
        out.append(f"the title {t!r} states the payoff's figure {', '.join('{' + f + '}' for f in sorted(shown))}: the "
                   f"title asks the question and the payoff answers it (\"How does Costco make money on a {{price}} hot dog?\")")
    figures = TITLE_FIGURE.findall(t)
    if len(figures) > 1:
        out.append(f"the title {t!r} states {len(figures)} figures and so tells the whole story: keep one, the price or "
                   f"amount the viewer can picture, and ask about it")
    if not QUESTION_TITLE.search(t):
        out.append(note(f"the title {t!r} is a statement: 13 of 20 money Shorts at 160K+ views asked a question "
                        f"(\"How much does…\", \"Why is … so cheap?\"); ours with a question had a median of 637 views, "
                        f"name-and-figure statements 456"))
    return out


_ITEM = re.compile(r"^[A-Za-z][A-Za-z'-]*(?: [A-Za-z][A-Za-z'-]*)?$")


def listed_items(say: str) -> list[list[str]]:
    """The short lists a line names ("phones, clothes, cars and oil"): runs of three or more items of
    one or two words each, separated by commas, the last joined by "and"/"or". Placeholders are skipped."""
    out = []
    for sentence in re.split(r"[.!?:;]", re.sub(r"\{[^}]*\}", "X", say)):
        parts = [x.strip() for x in sentence.split(",")]
        run: list[str] = []
        for part in parts:
            tail = re.split(r"\s+(?:and|or)\s+", part)
            if len(tail) == 2 and all(_ITEM.match(t.strip()) for t in tail) and run:
                out.append([*run, tail[0].strip(), tail[1].strip()] if len(run) + 2 >= 3 else [])
                run = []
            elif _ITEM.match(part):
                run.append(part)
            else:
                run = []
    return [x for x in out if len(x) >= 3]


def list_problems(beats: list[dict]) -> list[str]:
    """Every item a line lists is shown on screen on its word (owner, 2026-11-18: "small words spoken can
    be animation or shown, like the oil, cloth… keep animating things on screen"). A directed beat that
    says "phones, clothes, cars and oil" needs an event and a moment for each."""
    out = []
    for b in beats:
        if b.get("scene") not in ("directed", "doc"):   # a doc beat (the documentary channel) declares its moments too
            continue
        moments = {str(m.get("at", "")).lower() for m in ((b.get("params") or {}).get("moments") or []) if isinstance(m, dict)}
        words = {k.lower(): str((v or {}).get("word", k)).lower().strip(",.?!:;") for k, v in (b.get("events") or {}).items() if isinstance(v, dict)}
        for items in listed_items(b.get("say") or ""):
            missing = []
            for it in items:
                head = it.split()[-1].lower().removesuffix("'s")
                keys = [k for k, w in words.items() if w.removesuffix("'s") == head or k == head]
                if not any(k in moments for k in keys):
                    missing.append(it)
            if missing:
                out.append(f"beat {b.get('id')!r} lists {', '.join(items)}: show each on its word (an event and a moment for "
                           f"{', '.join(missing)}): a listed word is a picture, not just a caption")
    return out


def script_problems(script: dict, earlier: list[dict] | None = None) -> list[str]:
    """What the script says: structure, roles, counter, banned and repeated lines."""
    if not applies(script):
        return []
    beats = script.get("beats") or []
    out = list_problems(beats)
    # the variant system's style (improvement/arms.py): shot/build beats with the cast, or board cards
    style = (script.get("arms") or {}).get("style")
    n_board = sum(1 for b in beats if b.get("scene") == "board")
    if style == "shot" and n_board:
        out.append(f"{n_board} board beats, but this Short's style (arms.style) is \"shot\": tell it in shot/build beats with the cast")
    if style == "board" and n_board * 2 < len(beats):
        out.append(f"this Short's style (arms.style) is \"board\": most beats are board cards ({n_board} of {len(beats)} now)")
    sp = _spine(script)
    levels = ((script.get("structure") or {}).get("levels")) or []
    laddered = _levels(script)
    if not laddered and levels:
        out.append(f"`structure.levels` (the level chips) belongs to the levels shape; a {script.get('shape')!r} video "
                   f"builds its stakes in `build` beats without chips")
    if not laddered:
        builds = sum(1 for b in beats if b.get("role") in ("build", "level"))
        if builds < BUILD_MIN:
            out.append(note(f"{builds} `build` beats; at least {BUILD_MIN}: the stakes rise step by step before the turn"))
    if script.get("shape") is not None and script.get("format", "short") == "short":
        out += voice_problems(script)
    if script.get("arms") and script.get("format", "short") == "short":
        out += hook_problems(script, earlier) + reveal_problems(script)
        out += invented_problems(script) + reaction_problems(script) + payoff_problems(script)
        out += curiosity_problems(script)
        out += second_line_problems(script)
        out += spoken_figure_problems(script)
    if script.get("shape") is not None or script.get("format") == "long" or any(b.get("scene") == "board" for b in beats):
        out += chain_problems(script)
    if sp["teases"] and len(levels) >= sp["levels_min"]:
        teases = sum(1 for b in beats if b.get("role") == "tease")
        if teases < len(levels) - 1:
            out.append(note(f"{teases} `tease` beats for {len(levels)} chapters: every chapter but the last ends on a tease "
                       f"(the open loop into the next), or viewers leave between chapters"))
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
                out.append(note(f"beat {b.get('id')!r}: {name} is a line the channel has used too often; say it a new way"))
    seen = {_opening(b.get("say") or "") for s in (earlier or []) for b in (s.get("beats") or [])} - {""}
    for b in beats:
        op = _opening(b.get("say") or "")
        if op and op in seen:
            out.append(note(f"beat {b.get('id')!r} opens like a line in one of the last scripts ({op!r}): new words"))
    return out


def timeline_problems(script: dict, tl: dict, earlier: list[dict] | None = None) -> list[str]:
    """The script checks plus timing, measured on the built timeline."""
    if not applies(script) or not tl.get("beats"):
        return []
    out = script_problems(script, earlier)
    fps = tl["fps"]
    # the variant system's length (improvement/arms.py): the Short lands in its assigned band
    band = (script.get("arms") or {}).get("length")
    if script.get("format", "short") == "short" and isinstance(band, str) and "-" in band:
        lo, hi = (float(x) for x in band.split("-"))
        secs = tl["durationInFrames"] / fps
        if not lo - 0.5 <= secs <= hi + 0.5:
            out.append(f"the Short runs {secs:.1f} s but its assigned length (arms.length) is {band} s: cut or add a beat")
    sp = _spine(script)
    starts = {b["id"]: b["from"] / fps for b in tl["beats"]}
    total = tl["durationInFrames"] / fps
    role = {b.get("id"): b.get("role") for b in script.get("beats") or []}
    promise = [starts[i] for i, r in role.items() if r == "promise" and i in starts]
    if promise and min(promise) > sp["promise_by"]:
        out.append(note(f"the promise starts at {min(promise):.1f} s; by {sp['promise_by']:.0f} s, or viewers leave before they know why to stay"))
    figures = set(tl.get("figures", {}).values())
    first = None
    for b in tl["beats"]:
        text = str(b.get("params"))
        if (b.get("params") or {}).get("hud", {}).get("counter") or any(f and f in text for f in figures):
            first = b["from"] / fps
            break
    if first is None or first > sp["figure_by"]:
        out.append(note(f"the first figure appears at {'never' if first is None else f'{first:.1f} s'}; one by {sp['figure_by']:.0f} s"))
    turns = [starts[i] for i, r in role.items() if r == "turn" and i in starts]
    if turns and not TURN_FROM <= turns[0] / total <= TURN_TO:
        out.append(note(f"the turn starts at {turns[0] / total:.0%} of the video; between {TURN_FROM:.0%} and {TURN_TO:.0%}"))
    hook = tl["beats"][0]
    if hook["frames"] / fps > sp["hook_max"]:
        out.append(f"the hook runs {hook['frames'] / fps:.1f} s; keep it to {sp['hook_max']:.0f} s or less")
    return out
