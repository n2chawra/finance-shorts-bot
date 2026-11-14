"""Checks on a finished video.

Layout: stills rendered with the layout probe (remotion/src/fx/probe.tsx) list every visible text
box as the viewer sees it. Text must be at least the format's minimum size, stay clear of the
bottom zone (the Shorts UI covers it) and inside the frame. The numbers mirror
remotion/src/design/frame.ts.

Liveliness: the picture must keep moving. Measured on the encoded mp4: ffmpeg streams the video
at 10 fps and 640×360, and each sample is the mean pixel change between two frames 0.3 s apart,
every 2 s. Calibrated on the first engine's Shorts (medians 1.5–2.3) against its first long video,
which scored 0.02 and was frozen for 82% of its runtime: that is what "a PPT with a voiceover"
means as a number. The first Remotion long video scored 1.36, its first Short 2.81.
"""
from __future__ import annotations

import subprocess
from pathlib import Path

import numpy as np

from renderer.engine.mux import find_ffmpeg

STILL = 0.5                 # mean pixel change below this is, to the eye, a frozen frame
LIVELY_MEDIAN = 1.2
LIVELY_STILL_SHARE = 0.15
LIVELY_STILL_SEC = 4.0

SAMPLE_FPS, W, H = 10, 640, 360


def liveliness(mp4: Path, gap: float = 0.3, every: float = 2.0) -> dict[str, float]:
    """{median, still_share, longest_still_sec} for an mp4."""
    step, lag = round(every*SAMPLE_FPS), round(gap*SAMPLE_FPS)
    cmd = [find_ffmpeg(), "-loglevel", "error", "-i", str(mp4), "-an",
           "-vf", f"fps={SAMPLE_FPS},scale={W}:{H}:flags=area", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    size = W*H*3
    scores: list[float] = []
    held: np.ndarray | None = None
    with subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE) as p:
        assert p.stdout is not None
        n = 0
        while True:
            buf = p.stdout.read(size)
            if len(buf) < size:
                break
            if n % step == 0:
                held = np.frombuffer(buf, dtype=np.uint8).astype(np.int16)
            elif n % step == lag and held is not None:
                scores.append(float(np.abs(held - np.frombuffer(buf, dtype=np.uint8).astype(np.int16)).mean()))
                held = None
            n += 1
        err = p.stderr.read().decode(errors="replace") if p.stderr else ""
    if p.returncode != 0:
        raise RuntimeError("ffmpeg failed: " + err.strip())
    if not scores:
        return {"median": 0.0, "still_share": 1.0, "longest_still_sec": n/SAMPLE_FPS}
    run = best = 0
    for s in scores:
        run = run + 1 if s < STILL else 0
        best = max(best, run)
    return {"median": round(float(np.median(scores)), 3),
            "still_share": round(sum(s < STILL for s in scores)/len(scores), 3),
            "longest_still_sec": round(best*every, 1)}


def liveliness_problems(score: dict[str, float]) -> list[str]:
    """Why a video reads as a slideshow, in words a script writer can act on."""
    out = []
    if score["median"] < LIVELY_MEDIAN:
        out.append(f"median frame change {score['median']:.2f} is below {LIVELY_MEDIAN} — "
                   f"scenes finish animating and then hold a still picture")
    if score["still_share"] > LIVELY_STILL_SHARE:
        out.append(f"{score['still_share']*100:.0f}% of samples have no visible movement "
                   f"(limit {LIVELY_STILL_SHARE*100:.0f}%)")
    if score["longest_still_sec"] > LIVELY_STILL_SEC:
        out.append(f"{score['longest_still_sec']:g} s with nothing moving "
                   f"(limit {LIVELY_STILL_SEC:g} s)")
    return out


def check_liveliness(mp4: Path) -> tuple[dict[str, float], list[str]]:
    score = liveliness(mp4)
    return score, liveliness_problems(score)


# minimum text size and bottom zone per format (remotion/src/design/frame.ts)
LAYOUT = {"short": {"min_text": 44, "bottom_safe": 120}, "long": {"min_text": 30, "bottom_safe": 36}}


def layout_problems(probes: list[dict], fmt: str, width: int, height: int, fps: int = 30) -> list[str]:
    """Problems from probe logs [{frame, items: [{t, x, y, w, h, fs}]}], one line per text and rule."""
    rules, seen, out = LAYOUT[fmt], set(), []
    for p in probes:
        at = f"{p['frame']/fps:.1f} s"
        for it in p["items"]:
            # wholly off the frame (a thing the camera left behind): nobody can see it, nothing to fix
            if it["x"] + it["w"] <= 0 or it["x"] >= width or it["y"] + it["h"] <= 0 or it["y"] >= height:
                continue
            problems = []
            if it["fs"] + 0.5 < rules["min_text"]:
                problems.append(f"is {it['fs']:g} px, below the {rules['min_text']} px minimum")
            if it["y"] + it["h"] > height - rules["bottom_safe"] + 2:
                problems.append(f"reaches {it['y'] + it['h']} px, inside the bottom {rules['bottom_safe']} px")
            if it["x"] < -2 or it["x"] + it["w"] > width + 2 or it["y"] < -2:
                problems.append("runs outside the frame")
            for why in problems:
                key = (it["t"], why.split(",")[0].split(" ")[0])
                if key not in seen:
                    seen.add(key)
                    out.append(f"text {it['t']!r} at {at} {why}")
    return out

