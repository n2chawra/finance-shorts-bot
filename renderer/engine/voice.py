"""Voiceover: an offline neural voice (Kokoro, Apache-2.0) speaking one line per scene.

A script may carry `voice`: {scene name: line}. Scene names are a template's scene functions
without the underscore ("hook", "question", "reveal", ...). Lines follow the on-screen text rules:
no typed digits or ₹, numbers only through the template's {placeholders}, which are turned into
spoken Indian English here ("₹12.4 L" → "12.4 lakh rupees"). So the voice can never say a number
the code didn't compute.

Each line must fit its scene's window (`Video.voice_windows`). It is spoken at the video's base
speed and sped up as far as MAX_SPEED to fit; a line that still overruns is an error, and the
writer shortens it.

The model files are installed by scripts/setup-voice.sh (never committed, never downloaded from
the renderer). KOKORO_DIR points at them; the default is ~/.cache/kokoro.
"""
from __future__ import annotations

import os
import random
import re
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import numpy as np
from scipy.signal import resample_poly

from .audio import SR

# rotated per video. Owner-picked by ear on 2026-10-16: the Indian female voice (the other Indian
# ones sounded bad) and five American ones.
VOICES = ("hf_alpha", "af_heart", "af_bella", "am_michael", "am_fenrir", "am_puck")
BASE_SPEED = (1.12, 1.22)    # per-video base speed range (Kokoro speed, 1.0 ≈ 150 words a minute); brisk, to match TEMPO
MAX_SPEED = 1.38
MODEL, VOICE_PACK = "kokoro-v1.0.onnx", "voices-v1.0.bin"
MAX_LINE = 220               # characters per scene line
LEAD, TAIL = 0.25, 0.35      # default window: from 0.25 s into a scene to 0.35 s before its end


@dataclass(frozen=True)
class Spoken:
    scene: str
    text: str
    start: float
    window: float
    speed: float
    samples: np.ndarray       # mono, at audio.SR

    @property
    def seconds(self) -> float:
        return len(self.samples)/SR

    @property
    def fill(self) -> float:
        """How much of the scene's speaking window the line uses, 0-1. A long section left mostly
        silent is a thin script, not a stylistic choice."""
        return self.seconds/self.window if self.window else 0.0


def pick(seed: int, speed_range: tuple[float, float] = BASE_SPEED) -> tuple[str, float]:
    """The voice and base speed for a video, from its seed (independent of the style draw).
    Shorts are read briskly; a long explainer is read at a more measured pace."""
    r = random.Random(f"voice:{seed}")
    return r.choice(VOICES), round(r.uniform(*speed_range), 2)


_UNITS = {"L": "lakh", "Lakh": "lakh", "Cr": "crore", "Crore": "crore"}


def spoken(display: str) -> str:
    """An on-screen figure as it should be read aloud.

    '₹12.4 L' → 'twelve point four lakh rupees', '₹15,00,000' → 'fifteen lakh rupees',
    '₹5,000' → 'five thousand rupees', '12%' → 'twelve percent', '2.4×' → 'two point four times'.
    Numbers are written out in words: the voice model reads digit strings badly ("ten zero zero
    zero zero" for 10,000).
    """
    return say_numbers(_units(display.strip()))


def _units(s: str) -> str:
    m = re.fullmatch(r"₹\s*([\d.,]+)\s*(L|Lakh|Cr|Crore)?", s)
    if m:
        num, unit = m.group(1), m.group(2)
        if unit:
            return f"{_trim(num)} {_UNITS[unit]} rupees"
        value = int(num.replace(",", ""))
        if value >= 10_000_000 and value % 100_000 == 0:
            return f"{_trim(f'{value/1e7:.2f}')} crore rupees"
        if value >= 100_000 and value % 1_000 == 0:
            return f"{_trim(f'{value/1e5:.2f}')} lakh rupees"
        return f"{value:,} rupees"
    m = re.fullmatch(r"([\d.,]+)\s*(L|Cr)", s)   # a count such as '9.87 Cr' (crore SIP accounts)
    if m:
        return f"{_trim(m.group(1))} {_UNITS[m.group(2)]}"
    s = re.sub(r"(\d)\s*%", r"\1 percent", s)
    s = re.sub(r"(\d)\s*×", r"\1 times", s)
    return s.replace("₹", "rupees ")


_ONES = ("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen "
         "sixteen seventeen eighteen nineteen").split()
_TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def number_words(n: int) -> str:
    """Indian English: 10000 → 'ten thousand', 2500000 → 'twenty five lakh', 123 → 'one hundred twenty three'."""
    if n < 0:
        return "minus " + number_words(-n)
    if n < 20:
        return _ONES[n]
    if n < 100:
        return _TENS[n//10] + ("" if n % 10 == 0 else " " + _ONES[n % 10])
    for size, name in ((10_000_000, "crore"), (100_000, "lakh"), (1_000, "thousand"), (100, "hundred")):
        if n >= size:
            head, rest = divmod(n, size)
            return f"{number_words(head)} {name}" + ("" if rest == 0 else " " + number_words(rest))
    raise AssertionError("unreachable")


def say_numbers(text: str) -> str:
    """Write every number in `text` out in words: '99.9' → 'ninety nine point nine', '10,000' → 'ten thousand'."""
    def word(m: re.Match) -> str:
        whole, _, frac = m.group(0).replace(",", "").partition(".")
        out = number_words(int(whole))
        return out + (" point " + " ".join(_ONES[int(d)] for d in frac) if frac else "")
    return re.sub(r"\d[\d,]*(?:\.\d+)?", word, text)


def _trim(num: str) -> str:
    """'2.30' → '2.3', '6.0' → '6'."""
    return num.rstrip("0").rstrip(".") if "." in num else num


def fill_lines(lines: dict[str, str], scenes: list[str], figures: dict[str, str], max_line: int = MAX_LINE) -> dict[str, str]:
    """Validate the script's voice lines and put spoken figures into their placeholders."""
    if not isinstance(lines, dict) or not lines:
        raise ValueError("voice must be an object of {scene: line}")
    unknown = sorted(set(lines) - set(scenes))
    if unknown:
        raise ValueError(f"voice has lines for unknown scenes {unknown}; scenes are: {', '.join(scenes)}")
    words = {k: spoken(v) for k, v in figures.items()}
    out = {}
    for scene, raw in lines.items():
        if not isinstance(raw, str) or not raw.strip():
            raise ValueError(f"voice.{scene} must be a non-empty line")
        if len(raw) > max_line:
            raise ValueError(f"voice.{scene} is {len(raw)} characters; keep it under {max_line}")
        if re.search(r"[0-9₹]", raw):
            raise ValueError(f"voice.{scene} contains a typed number; use a placeholder: {raw!r}")
        try:
            out[scene] = raw.format_map(words)
        except (KeyError, ValueError, IndexError) as e:
            raise ValueError(f"voice.{scene} has a bad placeholder ({e}). Allowed: {', '.join(figures)}") from e
    return out


def model_dir() -> Path:
    return Path(os.environ.get("KOKORO_DIR") or Path.home()/".cache"/"kokoro")


@lru_cache(maxsize=1)
def _engine():
    d = model_dir()
    if not (d/MODEL).is_file() or not (d/VOICE_PACK).is_file():
        raise RuntimeError(f"voice model not found in {d}; run: bash scripts/setup-voice.sh")
    try:
        from kokoro_onnx import Kokoro
    except ImportError as e:
        raise RuntimeError("kokoro-onnx is not installed; run: bash scripts/setup-voice.sh") from e
    return Kokoro(str(d/MODEL), str(d/VOICE_PACK))


def _synth(text: str, voice: str, speed: float) -> np.ndarray:
    samples, sr = _engine().create(text, voice=voice, speed=speed, lang="en-us")
    x = np.asarray(samples, dtype=np.float64)
    # trim leading/trailing silence so windows measure speech, not padding
    loud = np.flatnonzero(np.abs(x) > 0.01)
    if loud.size:
        x = x[max(0, loud[0] - int(0.02*sr)):loud[-1] + int(0.05*sr)]
    return resample_poly(x, SR, sr) if sr != SR else x


def speak(lines: dict[str, str], windows: dict[str, tuple[float, float]], voice: str, base_speed: float) -> list[Spoken]:
    """Synthesize every line inside its window, speeding up to MAX_SPEED if needed."""
    out = []
    for scene, text in lines.items():
        start, end = windows[scene]
        room = end - start
        if room < 1.0:
            raise ValueError(f"voice.{scene}: the scene leaves only {room:.1f} s to speak; drop this line")
        speed = base_speed
        x = _synth(text, voice, speed)
        if len(x)/SR > room:
            speed = min(MAX_SPEED, base_speed*(len(x)/SR)/room*1.03)
            x = _synth(text, voice, speed)
        if len(x)/SR > room:
            raise ValueError(f"voice.{scene} takes {len(x)/SR:.1f} s even at {speed:.2f}× speed but the scene allows "
                             f"{room:.1f} s; shorten it to about {int(len(text)*room/(len(x)/SR))} characters")
        out.append(Spoken(scene, text, start, room, round(speed, 2), x))
    return out


def activity(n: int, parts: list[Spoken]) -> np.ndarray:
    """0..1 envelope of where the voice is speaking, smoothed, for ducking music and effects."""
    on = np.zeros(n)
    for p in parts:
        i = int(p.start*SR)
        on[i:i + len(p.samples)] = 1.0
    k = int(0.15*SR)
    c = np.concatenate([[0.0], np.cumsum(on)])
    idx = np.arange(n)
    lo, hi = np.clip(idx - k, 0, n), np.clip(idx + k + 1, 0, n)
    return (c[hi] - c[lo])/(hi - lo)
