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

from pathlib import Path

import re

import numpy as np
from PIL import Image

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
SHOT_SCENES = ("shot", "hook", "build", "custom")   # composed beats (build and custom since 2026-10-26)
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
    for b in shots:
        keys = ((b["params"].get("camera") or []) + [{"size": a.get("size", "close")} for a in b["params"].get("actions") or [] if isinstance(a, dict) and a.get("do") == "focus"]
                if b["scene"] in ("shot", "build") else (b["params"].get("camera") or [{"size": "medium"}]))   # a custom beat may declare its sizes
        if b["scene"] == "build" and not keys:
            keys = [{"size": "wide"}]
        sizes = [k.get("size", "medium") for k in keys] or ["medium"]
        sizes_seen.update(sizes)
        opening.append(sizes[0])
        if any(s in ("close", "extreme") for s in sizes):
            closes.append(b["from"] / fps)
    closes.append(tl["durationInFrames"] / fps)
    if len(sizes_seen) < SIZES_NEEDED[fmt]:
        out.append(f"only {len(sizes_seen)} shot sizes ({', '.join(sorted(sizes_seen))}); a {fmt} video needs at least "
                   f"{SIZES_NEEDED[fmt]} of wide, medium, close, extreme")
    for i in range(len(opening) - 3):
        if len(set(opening[i:i + 4])) == 1:
            out.append(f"four shots in a row open {opening[i]} (from {shots[i]['id']!r}): vary the shot size")
            break
    gap = max(b - a for a, b in zip(closes, closes[1:]))
    if gap > CLOSE_EVERY:
        out.append(f"{gap:.0f} s without a close or extreme shot (at most {CLOSE_EVERY:.0f} s): emotion lives in close-ups")
    # a build world stays and fills up phrase by phrase (The Curious Plot's way): only shots rotate sets
    sets = [b["params"].get("set", "flat") for b in shots if b["scene"] == "shot"]
    run = 1
    for a, b in zip(sets, sets[1:]):
        run = run + 1 if a == b else 1
        if run > SET_RUN:
            out.append(f"set {a!r} in {run} shots in a row: move the story somewhere else")
            break
    if len(sets) >= 6:
        top = max(set(sets), key=sets.count)
        if sets.count(top) / len(sets) > SET_SHARE[fmt]:
            out.append(f"set {top!r} in {sets.count(top)} of {len(sets)} shots (at most {SET_SHARE[fmt]:.0%})")
    return out


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
SHARED_PROPS = {"note", "coin", "cash", "box"}
FREE_VERBS = {"focus", "glow", "shake"}   # camera and emphasis: they need not name a noun
COMPOSED = ("shot", "hook", "build", "custom")


def _visual_times(b: dict, fps: int) -> list[float]:
    """Seconds into a beat at which something new appears: its start, camera keys, build actions,
    a shot's objects, actions and acting keys, its word."""
    p, ev = b.get("params") or {}, b.get("events") or {}
    t = lambda k: (ev[k["at"]] / fps) if isinstance(k.get("at"), str) and k["at"] in ev else (k["sec"] if isinstance(k.get("sec"), (int, float)) else None)  # noqa: E731
    out = [0.0]
    for k in [*(p.get("camera") or []), *(p.get("actions") or []), *(p.get("objects") or [])]:
        if isinstance(k, dict) and (x := t(k)) is not None:
            out.append(x)
    for a in p.get("actors") or []:
        for k in a.get("acting") or []:
            if isinstance(k, dict) and (x := t(k)) is not None:
                out.append(x)
    if isinstance(p.get("word"), dict) and (x := t(p["word"])) is not None:
        out.append(x)
    return sorted(out)


def picture_problems(tl: dict) -> list[str]:
    """Visual gaps and build actions that don't show what is being said."""
    fps, out = tl["fps"], []
    worst = (0.0, "")
    for b in tl["beats"]:
        if b["scene"] not in ("shot", "build"):
            continue          # custom beats are animated by hand; old fixed scenes keep their own rules
        times = [*_visual_times(b, fps), b["frames"] / fps]
        gap = max((y - x for x, y in zip(times, times[1:])), default=0.0)
        if gap > worst[0]:
            worst = (gap, b["id"])
    if worst[0] > VISUAL_GAP:
        out.append(f"{worst[0]:.1f} s with nothing new on screen in beat {worst[1]!r} (at most {VISUAL_GAP} s): "
                   f"add an action on the phrase being said there")
    for b in tl["beats"]:
        if b["scene"] != "build" or not b.get("voice"):
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
            stems = {_stem(x) for n in names for x in re.split(r"[^a-zA-Z]+|(?<=[a-z])(?=[A-Z])", n) if len(x) >= 3}
            near = {_stem(w) for w, s in words if abs(s - when) <= LITERAL_WINDOW and len(w) >= 3}
            hit += any(a_.startswith(b_) or b_.startswith(a_) for a_ in stems for b_ in near if min(len(a_), len(b_)) >= 3)
        if hit / len(acts) < LITERAL_SHARE:
            out.append(f"beat {b['id']!r}: only {hit} of {len(acts)} actions show a thing said at that moment "
                       f"(at least {LITERAL_SHARE:.0%}): the picture must follow the words")
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
        if b.get("scene") != "build":
            continue
        p = b.get("params") or {}
        out |= {i["prop"] for i in p.get("items") or [] if isinstance(i, dict) and i.get("prop")}
        out |= {a["into"] for a in p.get("actions") or [] if isinstance(a, dict) and a.get("into")}
        out |= {hz["prop"] for hz in (p.get("world") or {}).get("horizon") or [] if isinstance(hz, dict) and hz.get("prop")}
    return out - SHARED_PROPS


def prop_problems(tl: dict, earlier: list[tuple[str, dict]]) -> list[str]:
    """A video's own things: enough of them, and not the last videos' things again (`earlier`: (id, timeline))."""
    mine = build_props(tl)
    if not any(b["scene"] == "build" for b in tl["beats"]):
        return []
    out = []
    if len(mine) < OWN_PROPS_MIN:
        out.append(f"only {len(mine)} props of its own ({', '.join(sorted(mine)) or 'none'}); at least {OWN_PROPS_MIN}: "
                   f"draw the things this story is about in videos/<id>/props.tsx")
    for vid, other in earlier[-PROP_WINDOW:]:
        theirs = build_props(other)
        if mine and theirs and len(mine & theirs) / len(mine) > PROP_OVERLAP_MAX:
            out.append(f"{len(mine & theirs)} of its {len(mine)} props were in {vid} too ({', '.join(sorted(mine & theirs))}): "
                       f"at most {PROP_OVERLAP_MAX:.0%}; the story's own things, not the last video's")
            break
    return out
