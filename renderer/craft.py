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
SHOT_SCENES = ("shot", "hook")


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
        keys = (b["params"].get("camera") or []) if b["scene"] == "shot" else [{"size": "medium"}]
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
