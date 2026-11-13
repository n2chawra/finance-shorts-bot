"""Craft gates: refuse a video that looks templated (owner, 2026-10-21: "numbers in a box, two lines
of text, most of the screen empty, every video works like a template"). Numbers in code, like the
liveliness gate, so routines can't drift back. See .claude/skills/motion-direction.

Frames (the QA stills, one every few seconds):
  empty     share of a still that is flat background: 8x8-pixel tiles of a small copy with almost no
            colour variation. A still over EMPTY_STILL is "empty"; more than EMPTY_SHARE of the
            stills empty fails the video.
  same      consecutive stills that look alike (64-bit difference hash within SAME_BITS bits). More
            than SAME_SHARE of the pairs alike fails: the picture isn't changing.

Shots (the timeline):
  system    at least SHOT_SHARE of the beats are composed shots (`shot` or the custom `hook`), not
            the old fixed layouts
  sizes     at least 3 shot sizes in a Short and 4 in a long video; never the same opening size
            four shots in a row; a close or extreme shot at least every CLOSE_EVERY seconds
  sets      no set in more than SET_RUN consecutive shots, nor in more than SET_SHARE of them
"""
from __future__ import annotations

import json
from pathlib import Path

import re

import numpy as np
from PIL import Image

from .advice import note

EMPTY_TILE_STD = 7.0     # a tile this flat (0-255 levels) is plain background
EMPTY_STILL = 0.55
EMPTY_SHARE = 0.15
SAME_BITS = 5
SAME_SHARE = 0.2
SHOT_SHARE = 0.6
CLOSE_EVERY = 15.0
SET_RUN = 2
SET_SHARE = {"short": 0.45, "long": 0.25}
SIZES_NEEDED = {"short": 3, "long": 4}
SHOT_SCENES = ("shot", "hook", "build", "custom", "framework", "type", "journey", "stats", "case", "board", "directed")
# the board (studio/board.tsx, 2026-11-02) holds a still camera on one stage by design: it counts as a
# composed picture and as a close look (its header and panels fill the frame), never against shot sizes
DOCU = ("framework", "type", "journey", "stats", "case")   # full-frame documentary devices
DOCU_SIZE = {"framework": "wide", "journey": "wide", "stats": "medium", "type": "close", "case": "close", "board": "close"}   # how each frames   # composed beats (build and custom since 2026-10-26)
# covers (owner, 2026-10-24: "the thumbnails look the same with different texts"): measured on the
# real covers, the same layout with new words is 3-11 bits apart, different pictures 19 or more
COVER_SAME_BITS = 12
COVER_WINDOW = 6


def empty_share(img: Image.Image) -> float:
    """How much of a still is flat background (0..1)."""
    small = np.asarray(img.convert("RGB").resize((96, 170) if img.height > img.width else (170, 96)), dtype=np.float32)
    h, w = small.shape[0] // 8 * 8, small.shape[1] // 8 * 8
    tiles = small[:h, :w].reshape(h // 8, 8, w // 8, 8, 3).transpose(0, 2, 1, 3, 4).reshape(-1, 64, 3)
    return float((tiles.std(axis=1).max(axis=1) < EMPTY_TILE_STD).mean())


def dhash(img: Image.Image) -> int:
    g = np.asarray(img.convert("L").resize((9, 8)), dtype=np.int16)
    bits = (g[:, 1:] > g[:, :-1]).flatten()
    return int("".join("1" if b else "0" for b in bits), 2)


def frame_problems(stills: list[Path], fps: int = 30) -> list[str]:
    """Empty and repeated pictures among the QA stills (named f<frame>.jpg)."""
    if len(stills) < 3:
        return []
    imgs = [Image.open(p) for p in stills]
    sec = [int(p.stem[1:]) / fps if p.stem[1:].isdigit() else i for i, p in enumerate(stills)]
    out = []
    empty = [s for s, im in zip(sec, imgs) if empty_share(im) > EMPTY_STILL]
    if len(empty) / len(imgs) > EMPTY_SHARE:
        out.append(f"{len(empty)} of {len(imgs)} stills are mostly empty background (at {', '.join(f'{s:.0f} s' for s in empty[:6])}): "
                   f"fill the frame (a set, the cast big, money as a thing)")
    hashes = [dhash(im) for im in imgs]
    alike = [sec[i + 1] for i in range(len(hashes) - 1) if bin(hashes[i] ^ hashes[i + 1]).count("1") <= SAME_BITS]
    if len(alike) / (len(hashes) - 1) > SAME_SHARE:
        out.append(f"{len(alike)} of {len(hashes) - 1} consecutive stills look the same (at {', '.join(f'{s:.0f} s' for s in alike[:6])}): "
                   f"change the set, the shot size or what is on screen")
    return out


def shot_problems(tl: dict) -> list[str]:
    """Shot-system rules on a timeline."""
    fmt, fps, beats = tl["format"], tl["fps"], tl["beats"]
    shots = [b for b in beats if b["scene"] in SHOT_SCENES]
    counted = [b for b in beats if b["scene"] not in ("chapter", "end")]
    out = []
    if counted and len(shots) / len(counted) < SHOT_SHARE:
        out.append(f"only {len(shots)} of {len(counted)} beats are composed shots (`shot`/`hook`); at least "
                   f"{SHOT_SHARE:.0%} must be: the old fixed layouts look like a template")
    if not shots:
        return out
    sizes_seen: set[str] = set()
    opening: list[str] = []
    closes: list[float] = [0.0]
    sized = [b for b in shots if b["scene"] != "board"]
    if len(sized) < 4 and len(sized) < len(shots):      # a board-led video: the camera rules don't apply
        return out
    for b in shots:
        if b["scene"] == "board":
            closes.append(b["from"] / fps)
            continue
        keys = ((b["params"].get("camera") or []) + [{"size": a.get("size", "close")} for a in b["params"].get("actions") or [] if isinstance(a, dict) and a.get("do") == "focus"]
                if b["scene"] in ("shot", "build") else (b["params"].get("camera") or [{"size": DOCU_SIZE.get(b["scene"], "medium")}]))   # a custom beat may declare its sizes
        if b["scene"] == "build" and not keys:
            keys = [{"size": "wide"}]
        sizes = [k.get("size", "medium") for k in keys] or ["medium"]
        sizes_seen.update(sizes)
        opening.append(sizes[0])
        if any(s in ("close", "extreme") for s in sizes):
            closes.append(b["from"] / fps)
    closes.append(tl["durationInFrames"] / fps)
    if len(sizes_seen) < SIZES_NEEDED[fmt]:
        out.append(note(f"only {len(sizes_seen)} shot sizes ({', '.join(sorted(sizes_seen))}); a {fmt} video needs at least "
                   f"{SIZES_NEEDED[fmt]} of wide, medium, close, extreme"))
    for i in range(len(opening) - 3):
        if len(set(opening[i:i + 4])) == 1:
            out.append(note(f"four shots in a row open {opening[i]} (from {shots[i]['id']!r}): vary the shot size"))
            break
    gap = max(b - a for a, b in zip(closes, closes[1:]))
    if gap > CLOSE_EVERY:
        out.append(note(f"{gap:.0f} s without a close or extreme shot (at most {CLOSE_EVERY:.0f} s): emotion lives in close-ups"))
    # a build world stays and fills up phrase by phrase (The Curious Plot's way): only shots rotate sets;
    # a directed beat's set is the place its line happens in (one per place when it cuts between them)
    sets = [x for b in shots for x in (places(b) if b["scene"] == "directed" else [b["params"].get("set", "flat")] if b["scene"] == "shot" else [])]
    run = 1
    for a, b in zip(sets, sets[1:]):
        run = run + 1 if a == b else 1
        if run > SET_RUN:
            out.append(note(f"set {a!r} in {run} shots in a row: move the story somewhere else"))
            break
    if len(sets) >= 6:
        top = max(set(sets), key=sets.count)
        if sets.count(top) / len(sets) > SET_SHARE[fmt]:
            out.append(note(f"set {top!r} in {sets.count(top)} of {len(sets)} shots (at most {SET_SHARE[fmt]:.0%})"))
    return out


REFERENCES = ("v-directed-netflix",)   # approved directed videos kept as teaching examples (videos/<id>/script.json)


def reference_scripts(skip: str = "") -> list[tuple[str, dict]]:
    """The reference videos' scripts, so a new video can't copy their places."""
    out = []
    for vid in REFERENCES:
        f = Path(__file__).resolve().parent.parent / "videos" / vid / "script.json"
        if vid != skip and f.is_file():
            out.append((vid, json.loads(f.read_text(encoding="utf-8"))))
    return out


def places(b: dict) -> list[str]:
    """Where a directed beat happens (params.place: one place, or a list when it cuts between places)."""
    p = (b.get("params") or {}).get("place")
    return [x.strip().lower() for x in ([p] if isinstance(p, str) else p if isinstance(p, list) else []) if isinstance(x, str) and x.strip()]


def cover_problems(cover: Path, earlier: list[tuple[str, Path]]) -> list[str]:
    """A cover that looks like one of the last COVER_WINDOW covers of its format (`earlier`: id, path)."""
    if not cover.is_file():
        return []
    mine = dhash(Image.open(cover))
    for vid, path in earlier[-COVER_WINDOW:]:
        if path.is_file() and bin(mine ^ dhash(Image.open(path))).count("1") <= COVER_SAME_BITS:
            return [f"the cover looks like {vid}'s: pick another frame (`thumbnail.at`) or layout, so the channel page "
                    f"doesn't show the same picture twice"]
    return []


# ---------------- the picture follows the words (owner, 2026-10-26) ----------------
# "animation should be dynamic to the script, not hardcoded props". Measured on the references:
# Zack D. Films shows every phrase literally, The Curious Plot adds or changes a thing on every
# phrase; our Shorts changed the picture by rule, not with the words.
VISUAL_GAP = 2.5          # seconds: something new on screen at least this often (shot and build beats)
LITERAL_SHARE = 0.7       # of a build beat's actions name a thing said around that moment
LITERAL_WINDOW = 1.2      # seconds either side of the action
OWN_PROPS_MIN = 8         # distinct props of its own a video's build beats use
PROP_OVERLAP_MAX = 0.3    # share of its props any of the last PROP_WINDOW videos also used
PROP_WINDOW = 10
PLACE_WINDOW = 5          # a directed video's places, against this many recent videos
PLACE_OVERLAP_MAX = 0.5
SHARED_PROPS = {"note", "coin", "cash", "box"}
FREE_VERBS = {"focus", "glow", "shake", "header", "equation", "term", "bars", "ring", "grid", "calendar", "buttons",
              "click", "person", "bubble", "step", "stamp", "cross", "tick", "strike"}   # emphasis and the board's own words
COMPOSED = ("shot", "hook", "build", "custom", "directed")


def _all_ats(node, ev: dict, fps: int, out: list[float]) -> None:
    """Every `at` event anywhere in a beat's params (lines, cards, stops, items...)."""
    if isinstance(node, dict):
        a = node.get("at")
        if isinstance(a, str) and a in ev:
            out.append(ev[a] / fps)
        for v in node.values():
            _all_ats(v, ev, fps, out)
    elif isinstance(node, list):
        for v in node:
            _all_ats(v, ev, fps, out)


def _visual_times(b: dict, fps: int, figures: set[str] | None = None) -> list[float]:
    """Seconds into a beat at which something new appears: its start, camera keys, build actions,
    a shot's objects, actions and acting keys, its word, and (build and shot) each spoken figure,
    which the scene animates by itself (studio/figures.ts, 2026-10-30)."""
    p, ev = b.get("params") or {}, b.get("events") or {}
    t = lambda k: (ev[k["at"]] / fps) if isinstance(k.get("at"), str) and k["at"] in ev else (k["sec"] if isinstance(k.get("sec"), (int, float)) else None)  # noqa: E731
    out = [0.0]
    for k in [*(p.get("camera") or []), *(p.get("actions") or []), *(p.get("objects") or []), *(p.get("moments") or [])]:
        if isinstance(k, dict) and (x := t(k)) is not None:
            out.append(x)
    for a in p.get("actors") or []:
        for k in a.get("acting") or []:
            if isinstance(k, dict) and (x := t(k)) is not None:
                out.append(x)
    if isinstance(p.get("word"), dict) and (x := t(p["word"])) is not None:
        out.append(x)
    if b.get("scene") in (*DOCU, "board"):
        _all_ats(p, ev, fps, out)
    v = b.get("voice") or {}
    if figures and b.get("scene") in ("build", "shot"):
        out += [v.get("start", 0) / fps + c["s"] for c in v.get("captions") or [] if c.get("t", "").rstrip(".,!?;:") in figures]
    return sorted(out)


def picture_problems(tl: dict) -> list[str]:
    """Visual gaps and build actions that don't show what is being said."""
    fps, out = tl["fps"], []
    worst = (0.0, "")
    for b in tl["beats"]:
        if b["scene"] not in ("shot", "build", "board", "directed", *DOCU):
            continue          # custom beats are animated by hand; old fixed scenes keep their own rules
            # (a directed beat is too, but it declares its moments, so the gap is measured on them)
        times = [*_visual_times(b, fps, set((tl.get("figures") or {}).values())), b["frames"] / fps]
        gap = max((y - x for x, y in zip(times, times[1:])), default=0.0)
        if gap > worst[0]:
            worst = (gap, b["id"])
    if worst[0] > VISUAL_GAP:
        out.append(f"{worst[0]:.1f} s with nothing new on screen in beat {worst[1]!r} (at most {VISUAL_GAP} s): "
                   f"add an action on the phrase being said there")
    for b in tl["beats"]:
        if b["scene"] not in ("build", "board") or not b.get("voice"):
            continue
        p, ev = b["params"], b["events"]
        items = {i["id"]: i for i in p.get("items") or [] if isinstance(i, dict) and i.get("id")}
        start = b["voice"]["start"] / fps
        words = [(w["w"].lower().strip(".,!?;:\"'"), start + w["s"]) for w in b["voice"]["words"]]
        acts = [a for a in p.get("actions") or [] if isinstance(a, dict) and a.get("do") not in FREE_VERBS]
        if not acts:
            continue
        hit = 0
        for a in acts:
            when = ev[a["at"]] / fps if isinstance(a.get("at"), str) and a["at"] in ev else float(a.get("sec") or 0)
            item = items.get(a.get("target"), {})
            names = {a.get("target", ""), item.get("prop", ""), a.get("into", "") or "", *str(item.get("label", "")).split()}
            if a.get("do") == "flow" and isinstance(a.get("to"), str):   # money travelling lands on the word that names where it goes
                dest = items.get(a["to"], {})
                names |= {a["to"], dest.get("prop", ""), *str(dest.get("label", "")).split()}
            stems = {_stem(x) for n in names for x in re.split(r"[^a-zA-Z]+|(?<=[a-z])(?=[A-Z])", n) if len(x) >= 3}
            near = {_stem(w) for w, s in words if abs(s - when) <= LITERAL_WINDOW and len(w) >= 3}
            hit += any(a_.startswith(b_) or b_.startswith(a_) for a_ in stems for b_ in near if min(len(a_), len(b_)) >= 3)
        if hit / len(acts) < LITERAL_SHARE:
            out.append(note(f"beat {b['id']!r}: only {hit} of {len(acts)} actions show a thing said at that moment "
                       f"(at least {LITERAL_SHARE:.0%}): the picture must follow the words"))
    return out


def _stem(word: str) -> str:
    w = word.lower()
    for suf in ("ings", "ing", "ies", "es", "s", "ed"):
        if w.endswith(suf) and len(w) - len(suf) >= 3:
            return w[: -len(suf)][:6]
    return w[:6]


def build_props(tl: dict) -> set[str]:
    """The props a timeline's build beats use (shared money things not counted)."""
    out = set()
    for b in tl.get("beats") or []:
        p = b.get("params") or {}
        if b.get("scene") in DOCU:   # framework items, the journey's traveller, a case's picture
            out |= {i["prop"] for i in p.get("items") or [] if isinstance(i, dict) and i.get("prop")}
            out |= {x for x in (p.get("traveller"), p.get("prop")) if isinstance(x, str)}
            continue
        if b.get("scene") == "directed":   # the things a directed shot draws (params.things)
            out |= {str(x).strip().lower() for x in p.get("things") or [] if isinstance(x, str) and x.strip()}
            continue
        if b.get("scene") not in ("build", "board"):
            continue
        out |= {i["prop"] for i in p.get("items") or [] if isinstance(i, dict) and i.get("prop")}
        for a in p.get("actions") or []:     # a board's grid units, button icons and person pictures are the video's own too
            if isinstance(a, dict):
                out |= {x for x in [a.get("prop"), *[i.get("prop") for i in a.get("items") or [] if isinstance(i, dict)]] if isinstance(x, str)}
        out |= {a["into"] for a in p.get("actions") or [] if isinstance(a, dict) and a.get("into")}
        out |= {hz["prop"] for hz in (p.get("world") or {}).get("horizon") or [] if isinstance(hz, dict) and hz.get("prop")}
    return out - SHARED_PROPS


def prop_problems(tl: dict, earlier: list[tuple[str, dict]]) -> list[str]:
    """A video's own things: enough of them, and not the last videos' things again (`earlier`: (id, timeline))."""
    mine = build_props(tl)
    if not any(b["scene"] in ("build", "board", "directed", *DOCU) for b in tl["beats"]):
        return []
    out = []
    # a directed video's places: not the same rooms as a recent video (the old kit stood every video in
    # front of one skyline)
    # Every video must be unique (CLAUDE.md): this one fails, it is not a note. The approved reference
    # (v-directed-netflix) teaches how to direct; its places are never copied either.
    here = {x for b in tl["beats"] if b["scene"] == "directed" for x in places(b)}
    for vid, other in [*earlier[-PLACE_WINDOW:], *reference_scripts(skip=str(tl.get("id") or ""))]:
        theirs = {x for b in other.get("beats") or [] if b.get("scene") == "directed" for x in places(b)}
        if len(here) >= 3 and theirs and len(here & theirs) / len(here) > PLACE_OVERLAP_MAX:
            out.append(f"{len(here & theirs)} of its {len(here)} places were in {vid} too ({', '.join(sorted(here & theirs))}): "
                       f"every video gets its own places; put each line where it happens in this story")
            break
    if len(mine) < OWN_PROPS_MIN:
        out.append(note(f"only {len(mine)} props of its own ({', '.join(sorted(mine)) or 'none'}); at least {OWN_PROPS_MIN}: "
                   f"draw the things this story is about in videos/<id>/props.tsx"))
    for vid, other in earlier[-PROP_WINDOW:]:
        theirs = build_props(other)
        if mine and theirs and len(mine & theirs) / len(mine) > PROP_OVERLAP_MAX:
            out.append(note(f"{len(mine & theirs)} of its {len(mine)} props were in {vid} too ({', '.join(sorted(mine & theirs))}): "
                       f"at most {PROP_OVERLAP_MAX:.0%}; the story's own things, not the last video's"))
            break
    return out


# ---------------- no repetition inside a video (owner, 2026-10-26: "dynamic with the script, no repetition") ----------------
DEVICES_MIN = {"short": 2, "long": 5}   # different composed scenes a video uses
DEVICE_SHARE = 0.4                      # no one scene in more than this share of a long video's composed beats
DEVICE_RUN = 3                          # nor more than this many beats in a row


def device_problems(tl: dict) -> list[str]:
    fmt = tl.get("format", "short")
    beats = [b for b in tl["beats"] if b["scene"] in SHOT_SCENES]
    if fmt != "long" or len(beats) < 6:
        return []
    out = []
    kinds = [b["scene"] for b in beats]
    if len(set(kinds)) < DEVICES_MIN[fmt]:
        out.append(note(f"only {len(set(kinds))} kinds of scene ({', '.join(sorted(set(kinds)))}); a long video mixes {DEVICES_MIN[fmt]}+ "
                   f"(build, framework, type, journey, stats, case, custom...) so it never settles into one look"))
    top = max(set(kinds), key=kinds.count)
    if kinds.count(top) / len(kinds) > DEVICE_SHARE:
        out.append(note(f"{top} is {kinds.count(top)} of {len(kinds)} composed beats (at most {DEVICE_SHARE:.0%}): vary how each idea is shown"))
    run = 1
    for a, b in zip(kinds, kinds[1:]):
        run = run + 1 if a == b and a != "build" else 1   # build worlds change every phrase; the others repeat a look
        if run > DEVICE_RUN:
            out.append(note(f"{a} {run} times in a row: change the device"))
            break
    return out


# ---------------- every clause gets its own picture (owner, 2026-11-02) ----------------
# "literally everything which is said is being animated in a nice way; ours only the important things,
# you have to listen to know". Measured on The Curious Plot: every clause had its own visual change
# within about half a second of its key word. Board beats are held to it (other scenes keep their rules).
CLAUSE_WINDOW = 0.8       # seconds either side of a clause
CLAUSE_SHARE = 0.9        # of a board video's clauses that must have a visual change
CLAUSE_WORDS = 7          # a clause longer than this counts as two
_JOINS = {"and", "but", "so", "because", "then", "while", "which", "or"}


def clauses(words: list[dict]) -> list[tuple[float, float]]:
    """(start, end) of each clause in a line's captions or words: split at punctuation, at joining
    words and every CLAUSE_WORDS words."""
    out, cur = [], []
    for w in words:
        text = str(w.get("t", w.get("w", ""))).strip()
        if cur and (text.lower().strip(".,!?;:") in _JOINS or len(cur) >= CLAUSE_WORDS):
            out.append((cur[0]["s"], cur[-1]["e"]))
            cur = []
        cur.append(w)
        if re.search(r"[.,!?;:]$", text):
            out.append((cur[0]["s"], cur[-1]["e"]))
            cur = []
    if cur:
        out.append((cur[0]["s"], cur[-1]["e"]))
    return out


def clause_problems(tl: dict) -> list[str]:
    """Board beats: the share of spoken clauses that get a visual change near them."""
    fps = tl["fps"]
    boards = [b for b in tl["beats"] if b["scene"] == "board" and b.get("voice")]
    if len(boards) < 3:
        return []
    total = covered = 0
    bare: list[str] = []
    figures = set((tl.get("figures") or {}).values())
    for b in boards:
        v = b["voice"]
        start = v["start"] / fps
        times = _visual_times({**b, "scene": "build"}, fps, figures)
        _all_ats(b.get("params") or {}, b.get("events") or {}, fps, times)
        for s, e in clauses(v.get("captions") or v.get("words") or []):
            total += 1
            if any(start + s - CLAUSE_WINDOW <= x <= start + e + CLAUSE_WINDOW for x in times[1:]):
                covered += 1
            elif len(bare) < 4:
                bare.append(b["id"])
    if total and covered / total < CLAUSE_SHARE:
        return [note(f"only {covered} of {total} spoken clauses get their own picture ({covered / total:.0%}, at least {CLAUSE_SHARE:.0%}; "
                f"bare clauses in {', '.join(dict.fromkeys(bare))}): put an action on each clause's key word")]
    return []


# Marks only point at what is already there; changes put something new on screen (owner, 2026-11-03, on
# v-20261103-03: "could have added more animation/props so that it became more engaging. Right now it's
# like same stuff coming": 71% of its board actions were glows, stamps and bubbles; the Short he called
# better animated, v-20261103-02, had 64%).
MARKS = {"glow", "shake", "stamp", "cross", "tick", "strike", "bubble", "step", "focus", "label", "tag", "header", "chip", "click"}
MARK_SHARE_MAX = 0.65     # of a board video's actions that may be marks


def mark_problems(tl: dict) -> list[str]:
    """Board videos: too many of the actions only mark things already on screen."""
    boards = [b for b in tl["beats"] if b["scene"] == "board"]
    if len(boards) < 3:
        return []
    acts = [a.get("do") for b in boards for a in (b.get("params") or {}).get("actions") or [] if isinstance(a, dict)]
    if not acts:
        return []
    marks = sum(1 for d in acts if d in MARKS)
    if marks / len(acts) > MARK_SHARE_MAX:
        return [note(f"{marks} of {len(acts)} board actions only mark a thing already there ({marks / len(acts):.0%}, at most {MARK_SHARE_MAX:.0%}: "
                f"glow, stamp, bubble, cross...): give clauses a change instead, a thing that enters, swaps into another, "
                f"flows, multiplies or grows, or a panel (doc, bars, ring, grid, calendar, person, equation)")]
    return []



# One big hero thing, at most three, and no halo (owner, 2026-11-11, on v-20261111-01, Ronaldo: "The glowing
# thing is very poor. Don't do that... pile growth and he plays or not were animated poorly... everything is in
# the middle kinda. Make screen bigger"). Its build beats had 3-4 things at 0.12-0.24 of the height, every one
# opened on a glow, and its pile grew 1.1x. The short_story README already asked for one hero at 0.24-0.34 and
# three things at most; this makes it a check.
HERO_MIN = 0.28           # share of the frame's height the biggest thing in a Short's build beat reaches
STAGE_MAX_ITEMS = 3
GROW_MIN = 1.3            # a grow smaller than this barely shows on a phone
DEFAULT_ITEM_SIZE = 0.22  # remotion/src/studio/build.tsx sizeOf


def stage_problems(tl: dict) -> list[str]:
    """Build and board beats: no glow action (any format); in a Short's build beats one big hero, three
    things at most, and grows that show."""
    out: list[str] = []
    short = tl.get("format", "short") == "short"
    glows: list[str] = []
    for b in tl["beats"]:
        if b.get("scene") not in ("build", "board"):
            continue
        p = b.get("params") or {}
        acts = [a for a in p.get("actions") or [] if isinstance(a, dict)]
        if any(a.get("do") == "glow" for a in acts):
            glows.append(b["id"])
        if not short or b["scene"] != "build":
            continue
        items = [i for i in p.get("items") or [] if isinstance(i, dict)]
        if len(items) > STAGE_MAX_ITEMS:
            out.append(note(f"{b['id']}: {len(items)} things on the stage (at most {STAGE_MAX_ITEMS}): keep the one the line is about "
                       f"and the one it turns into, move the rest to another beat"))
        if items and max(float(i.get("size") or DEFAULT_ITEM_SIZE) for i in items) < HERO_MIN:
            out.append(note(f"{b['id']}: no thing is big (largest size {max(float(i.get('size') or DEFAULT_ITEM_SIZE) for i in items):.2f}, "
                       f"the hero needs {HERO_MIN}+): make the thing the line is about the hero, size {HERO_MIN}-0.40, near the middle"))
        small = [a.get("target") for a in acts if a.get("do") == "grow" and a.get("scale") is not None and float(a["scale"]) < GROW_MIN]
        if small:
            out.append(note(f"{b['id']}: grow on {', '.join(map(str, small))} under {GROW_MIN}x barely shows: grow {GROW_MIN}-1.8x, "
                       f"or multiply/stack/fill it so the change is visible"))
    if glows:
        out.append(f"glow in {', '.join(glows)}: the owner asked for no glow (2026-11-11); show the change instead "
                   f"(enter, swap, flow, grow, multiply, fill) or let the camera push in on the thing")
    return out
