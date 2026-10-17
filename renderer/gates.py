"""Checks on a finished Remotion video, the same bars the Pillow renderer's videos must clear.

Liveliness: the picture must keep moving (renderer/engine/video.py has the thresholds and why).
Here it is measured on the encoded mp4: ffmpeg streams the video at 10 fps and 640×360, and each
sample compares two frames 0.3 s apart, every 2 s, as Video.liveliness does on rendered frames.
"""
from __future__ import annotations

import subprocess
from pathlib import Path

import numpy as np

from renderer.engine.mux import find_ffmpeg
from renderer.engine.video import STILL, liveliness_problems

SAMPLE_FPS, W, H = 10, 640, 360


def liveliness(mp4: Path, gap: float = 0.3, every: float = 2.0) -> dict[str, float]:
    """{median, still_share, longest_still_sec} for an mp4, scored like Video.liveliness."""
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


def check_liveliness(mp4: Path) -> tuple[dict[str, float], list[str]]:
    score = liveliness(mp4)
    return score, liveliness_problems(score)
