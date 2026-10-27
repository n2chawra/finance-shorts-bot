"""Voiceover: an offline neural voice (Kokoro, Apache-2.0) speaking each beat's line.

Lines follow the on-screen text rules: no typed digits or ₹, numbers only through {placeholders},
which are turned into spoken English here ("₹12.4 L" → "12.4 lakh rupees", "$1.2M" → "1.2 million dollars"). So the voice
can never say a number the code didn't compute. A beat lasts as long as its line
(renderer/timeline/build.py), so lines never have to be squeezed into a window.

The model files are installed by scripts/setup-voice.sh (never committed, never downloaded from
the renderer). KOKORO_DIR points at them; the default is ~/.cache/kokoro.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import numpy as np
from scipy.signal import resample_poly

from .audio import SR

# Owner-picked by ear on 2026-10-16: the Indian female voice (the other Indian
# ones sounded bad) and five American ones.
VOICES = ("hf_alpha", "af_heart", "af_bella", "am_michael", "am_fenrir", "am_puck")
MODEL, VOICE_PACK = "kokoro-v1.0.onnx", "voices-v1.0.bin"
MAX_LINE = 220               # characters per line

_UNITS = {"L": "lakh", "Lakh": "lakh", "Cr": "crore", "Crore": "crore"}
_MONEY = {"$": "dollars", "£": "pounds", "€": "euros"}
_SCALES = {"K": "thousand", "M": "million", "B": "billion", "T": "trillion",
           "thousand": "thousand", "million": "million", "billion": "billion", "trillion": "trillion"}


def spoken(display: str, currency: str = "INR") -> str:
    """An on-screen figure as it should be read aloud, in the script's currency.

    '₹12.4 L' → 'twelve point four lakh rupees', '₹15,00,000' → 'fifteen lakh rupees',
    '$1.2M' → 'one point two million dollars', '£12,500' → 'twelve thousand five hundred pounds',
    '12%' → 'twelve percent', '2.4×' → 'two point four times'. Plain numbers are read the Indian
    way (lakh, crore) only in a rupee story. Numbers are written out in words: the voice model reads
    digit strings badly ("ten zero zero zero zero" for 10,000).
    """
    s = display.strip()
    if s[:1] in "-−" and len(s) > 1:   # '-$19,470' (a value that fell) → 'minus nineteen thousand … dollars'
        return "minus " + spoken(s[1:], currency)
    western = _western(s)
    if western is not None:
        return say_numbers(western, indian=False)
    return say_numbers(_units(s), indian=currency == "INR")


def _western(s: str) -> str | None:
    """'$1.2M' → '1.2 million dollars', '€2.35 billion' → '2.35 billion euros', '$12,500' → '12500 dollars',
    '340M' → '340 million'; None when `s` is not a dollar, pound or euro amount or a K/M/B count."""
    m = re.fullmatch(r"([$£€])\s*([\d.,]+)\s*(K|M|B|T|thousand|million|billion|trillion)?", s)
    if m:
        sym, num, scale = m.groups()
        return f"{_trim(num.replace(',', ''))} {_SCALES[scale] + ' ' if scale else ''}{_MONEY[sym]}"
    m = re.fullmatch(r"([\d.,]+)\s*(K|M|B|T)", s)   # a count such as '340M'
    if m:
        return f"{_trim(m.group(1).replace(',', ''))} {_SCALES[m.group(2)]}"
    return None


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


_INDIAN = ((10_000_000, "crore"), (100_000, "lakh"), (1_000, "thousand"), (100, "hundred"))
_WESTERN = ((1_000_000_000_000, "trillion"), (1_000_000_000, "billion"), (1_000_000, "million"), (1_000, "thousand"), (100, "hundred"))


def number_words(n: int, indian: bool = True) -> str:
    """10000 → 'ten thousand', 123 → 'one hundred twenty three'; 2500000 → 'twenty five lakh' the
    Indian way, 'two million five hundred thousand' the international way."""
    if n < 0:
        return "minus " + number_words(-n, indian)
    if n < 20:
        return _ONES[n]
    if n < 100:
        return _TENS[n//10] + ("" if n % 10 == 0 else " " + _ONES[n % 10])
    for size, name in (_INDIAN if indian else _WESTERN):
        if n >= size:
            head, rest = divmod(n, size)
            return f"{number_words(head, indian)} {name}" + ("" if rest == 0 else " " + number_words(rest, indian))
    raise AssertionError("unreachable")


def say_numbers(text: str, indian: bool = True) -> str:
    """Write every number in `text` out in words: '99.9' → 'ninety nine point nine', '10,000' → 'ten thousand'."""
    def word(m: re.Match) -> str:
        whole, _, frac = m.group(0).replace(",", "").partition(".")
        out = number_words(int(whole), indian)
        return out + (" point " + " ".join(_ONES[int(d)] for d in frac) if frac else "")
    return re.sub(r"\d[\d,]*(?:\.\d+)?", word, text)


def _trim(num: str) -> str:
    """'2.30' → '2.3', '6.0' → '6'."""
    return num.rstrip("0").rstrip(".") if "." in num else num


def fill_lines(lines: dict[str, str], scenes: list[str], figures: dict[str, str], max_line: int = MAX_LINE,
               currency: str = "INR") -> dict[str, str]:
    """Validate the script's voice lines and put spoken figures into their placeholders."""
    if not isinstance(lines, dict) or not lines:
        raise ValueError("voice must be an object of {scene: line}")
    unknown = sorted(set(lines) - set(scenes))
    if unknown:
        raise ValueError(f"voice has lines for unknown scenes {unknown}; scenes are: {', '.join(scenes)}")
    words = {k: spoken(v, currency) for k, v in figures.items()}
    out = {}
    for scene, raw in lines.items():
        if not isinstance(raw, str) or not raw.strip():
            raise ValueError(f"voice.{scene} must be a non-empty line")
        if len(raw) > max_line:
            raise ValueError(f"voice.{scene} is {len(raw)} characters; keep it under {max_line}")
        if re.search(r"[0-9₹$£€]", re.sub(r"\{[a-z][a-z0-9_]*\}", "", raw)):   # names may hold digits
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


@dataclass(frozen=True)
class Timed:
    """One synthesized line with its timing, for the Remotion renderer: every phoneme and every
    word has a start and end in seconds from the start of `samples`. Phonemes drive lip-sync,
    words drive captions and the moments a scene reacts to ("the number lands on this word")."""
    text: str
    voice: str
    speed: float
    samples: np.ndarray                          # mono, at audio.SR, leading/trailing silence trimmed
    phonemes: list[tuple[str, float, float]]
    words: list[tuple[str, float, float]]

    @property
    def seconds(self) -> float:
        return len(self.samples)/SR


_PUNCT = set(",.!?;:—–-…\"'()")


def words_from_phonemes(text: str, phonemes: list[tuple[str, float, float]]) -> list[tuple[str, float, float]]:
    """Group a phoneme stream into the text's words. Kokoro separates words with " " phonemes, so
    the groups line up with `text.split()`; if a word was phonemized as two (or two as one), the
    words are spread over the groups proportionally instead, which is close enough for captions."""
    groups: list[tuple[float, float]] = []
    start = end = None
    for p, a, b in phonemes:
        if p == " ":
            if start is not None:
                groups.append((start, end))
            start = end = None
        elif p in _PUNCT or p in "ˈˌː":
            if start is not None:
                end = b if p in "ˈˌː" else end
        else:
            start = a if start is None else start
            end = b
    if start is not None:
        groups.append((start, end))
    words = text.split()
    if not words or not groups:
        return []
    if len(groups) == len(words):
        return [(w, s, e) for w, (s, e) in zip(words, groups)]
    span0, span1 = groups[0][0], groups[-1][1]
    n = len(words)
    return [(w, span0 + (span1 - span0)*i/n, span0 + (span1 - span0)*(i + 1)/n) for i, w in enumerate(words)]


def speak_timed(text: str, voice: str, speed: float) -> Timed:
    """Synthesize one line with phoneme and word timings (kokoro-onnx >= 0.6 with a model that
    exposes durations; scripts/setup-voice.sh installs it). The model is deterministic, so each
    line is cached by (model, voice, speed, text): rebuilding a timeline after a picture-only
    change re-speaks nothing."""
    key = hashlib.sha256(f"{MODEL}|{voice}|{speed:.4f}|{text}".encode()).hexdigest()[:24]
    cached = model_dir()/"lines"/f"{key}.npz"
    if cached.is_file():
        z = np.load(cached)
        phon = [(p, float(a), float(e)) for p, a, e in json.loads(str(z["phonemes"]))]
        return Timed(text, voice, speed, z["samples"].astype(np.float64), phon, words_from_phonemes(text, phon))
    t = _speak_timed(text, voice, speed)
    cached.parent.mkdir(parents=True, exist_ok=True)
    tmp = cached.with_suffix(".tmp.npz")
    np.savez(tmp, samples=t.samples.astype(np.float32), phonemes=json.dumps(t.phonemes))
    tmp.replace(cached)
    return t


def _speak_timed(text: str, voice: str, speed: float) -> Timed:
    engine = _engine()
    if not getattr(engine, "has_timings", False):
        raise RuntimeError("this voice model has no timing output; run: bash scripts/setup-voice.sh")
    samples, sr, timings = engine.create_timed(text, voice=voice, speed=speed, lang="en-us")
    x = np.asarray(samples, dtype=np.float64)
    loud = np.flatnonzero(np.abs(x) > 0.01)
    lead = max(0, loud[0] - int(0.02*sr)) if loud.size else 0
    tail = loud[-1] + int(0.05*sr) if loud.size else len(x)
    x = x[lead:tail]
    shift = lead/sr
    phon = [(t.phoneme, max(0.0, t.start - shift), max(0.0, t.end - shift)) for t in timings]
    y = resample_poly(x, SR, sr) if sr != SR else x
    return Timed(text, voice, speed, y, phon, words_from_phonemes(text, phon))
