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
from .hindi_numbers import spoken_hindi

# Owner-picked by ear on 2026-10-16: the Indian female voice (the other Indian
# ones sounded bad) and five American ones.
VOICES = ("hf_alpha", "af_heart", "af_bella", "am_michael", "am_fenrir", "am_puck")
MODEL, VOICE_PACK = "kokoro-v1.0.onnx", "voices-v1.0.bin"
MAX_LINE = 220               # characters per line

_UNITS = {"L": "lakh", "Lakh": "lakh", "Cr": "crore", "Crore": "crore"}
_MONEY = {"$": "dollars", "£": "pounds", "€": "euros",
          "DKK": "Danish kroner", "SEK": "Swedish kronor", "NOK": "Norwegian kroner", "CHF": "Swiss francs"}
_ONE = {"DKK": "Danish krone", "SEK": "Swedish krona", "NOK": "Norwegian krone", "CHF": "Swiss franc"}
_SCALES = {"K": "thousand", "M": "million", "B": "billion", "T": "trillion",
           "thousand": "thousand", "million": "million", "billion": "billion", "trillion": "trillion"}


def spoken(display: str, currency: str = "INR", lang: str = "en-us") -> str:
    """An on-screen figure as it should be read aloud, in the script's currency.

    '₹12.4 L' → 'twelve point four lakh rupees', '₹15,00,000' → 'fifteen lakh rupees',
    '$1.2M' → 'one point two million dollars', '£12,500' → 'twelve thousand five hundred pounds',
    '12%' → 'twelve percent', '2.4×' → 'two point four times'. Plain numbers are read the Indian
    way (lakh, crore) only in a rupee story. Numbers are written out in words: the voice model reads
    digit strings badly ("ten zero zero zero zero" for 10,000). A Hindi channel (`lang` "hi") reads
    them in Hindi words instead (renderer/engine/hindi_numbers.py); every other language is unchanged.
    """
    if lang.split("-")[0] == "hi":
        return spoken_hindi(display)
    s = display.strip()
    if re.fullmatch(r"(1[89]|20)\d\d", s):      # a year fact: "2018" → "twenty eighteen"
        return year_words(int(s))
    if s[:1] in "-−" and len(s) > 1:   # '-$19,470' (a value that fell) → 'minus nineteen thousand … dollars'
        return "minus " + spoken(s[1:], currency)
    # a distance, area, height or depth ('4,300 km', '150 ft'), or a time ('90 s', '5 min'; the dive channel, 2026-11-21)
    m = re.fullmatch(r"([\d.,]+)\s*(km²|km|m³/s|tonnes/s|t/s|m|ft|s|min|tonnes)", s)
    if m:
        num = _trim(m.group(1).replace(",", ""))
        words = {"km²": ("square kilometre", "square kilometres"), "km": ("kilometre", "kilometres"), "m": ("metre", "metres"),
                 "ft": ("foot", "feet"), "s": ("second", "seconds"), "min": ("minute", "minutes"),
                 "tonnes": ("tonne", "tonnes"), "t/s": ("tonne a second", "tonnes a second"), "tonnes/s": ("tonne a second", "tonnes a second"),
                 "m³/s": ("cubic metre a second", "cubic metres a second")}[m.group(2)]
        return say_numbers(f"{num} {words[0] if num == '1' else words[1]}", indian=False)
    western = _western(s)
    if western is not None:
        return say_numbers(western, indian=False)
    return say_numbers(_units(s), indian=currency == "INR")


def _western(s: str) -> str | None:
    """'$1.2M' → '1.2 million dollars', '€2.35 billion' → '2.35 billion euros', '$12,500' → '12500 dollars',
    '340M' → '340 million'; None when `s` is not a dollar, pound or euro amount or a K/M/B count."""
    m = re.fullmatch(r"([$£€]|DKK|SEK|NOK|CHF)\s*([\d.,]+)\s*(K|M|B|T|thousand|million|billion|trillion)?", s)
    if m:
        sym, num, scale = m.groups()
        one = not scale and _trim(num.replace(",", "")) == "1"
        unit = (_ONE.get(sym) or _MONEY[sym][:-1]) if one else _MONEY[sym]   # "one dollar", "one Swiss franc"
        return f"{_trim(num.replace(',', ''))} {_SCALES[scale] + ' ' if scale else ''}{unit}"
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


def year_words(y: int) -> str:
    """2007 → 'two thousand seven', 2018 → 'twenty eighteen', 1999 → 'nineteen ninety nine', 1900 → 'nineteen hundred'."""
    head, tail = divmod(y, 100)
    if 2000 <= y <= 2009:
        return "two thousand" + ("" if y == 2000 else " " + _ONES[y - 2000])
    if tail == 0:
        return f"{number_words(head)} hundred"
    return f"{number_words(head)} {'oh ' + _ONES[tail] if tail < 10 else number_words(tail)}"


def _trim(num: str) -> str:
    """'2.30' → '2.3', '6.0' → '6'."""
    return num.rstrip("0").rstrip(".") if "." in num else num


def fill_lines(lines: dict[str, str], scenes: list[str], figures: dict[str, str], max_line: int = MAX_LINE,
               currency: str = "INR", lang: str = "en-us") -> dict[str, str]:
    """Validate the script's voice lines and put spoken figures into their placeholders."""
    if not isinstance(lines, dict) or not lines:
        raise ValueError("voice must be an object of {scene: line}")
    unknown = sorted(set(lines) - set(scenes))
    if unknown:
        raise ValueError(f"voice has lines for unknown scenes {unknown}; scenes are: {', '.join(scenes)}")
    words = {k: spoken(v, currency, lang) for k, v in figures.items()}
    out = {}
    for scene, raw in lines.items():
        if not isinstance(raw, str) or not raw.strip():
            raise ValueError(f"voice.{scene} must be a non-empty line")
        if len(raw) > max_line:
            raise ValueError(f"voice.{scene} is {len(raw)} characters; keep it under {max_line}")
        if re.search(r"[0-9०-९₹$£€]", re.sub(r"\{[a-z][a-z0-9_]*\}", "", raw)):   # names may hold digits
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


_STOPS = set("?!.।")


def _word_groups(phonemes: list[tuple[str, float, float]], split_on_stops: bool) -> list[tuple[float, float]]:
    groups: list[tuple[float, float]] = []
    start = end = None
    for p, a, b in phonemes:
        if p == " ":
            if start is not None:
                groups.append((start, end))
            start = end = None
        elif p in _PUNCT or p in "ˈˌː" or (split_on_stops and p in _STOPS):
            if start is not None:
                end = b if p in "ˈˌː" else end
            if split_on_stops and p in _STOPS and start is not None:   # a sentence ends the word, space or not
                groups.append((start, end))
                start = end = None
        else:
            start = a if start is None else start
            end = b
    if start is not None:
        groups.append((start, end))
    return groups


def words_from_phonemes(text: str, phonemes: list[tuple[str, float, float]], lang: str = "en-us") -> list[tuple[str, float, float]]:
    """Group a phoneme stream into the text's words. Kokoro separates words with " " phonemes, so
    the groups line up with `text.split()`; if a word was phonemized as two (or two as one), the
    words are spread over the groups proportionally instead, which is close enough for captions.

    Hindi (India Maps, 2026-11-24): Kokoro speaks a long line in batches, and where one batch ends on
    "?" or "!" the next word follows with no " " phoneme ("hɛː?sˈaːl" for "है? साल"), so two words
    became one group and the whole line fell back to even spreading. For "hi", a sentence stop also
    ends a word. English keeps its grouping exactly."""
    groups = _word_groups(phonemes, False)
    words = text.split()
    if lang.split("-")[0] == "hi" and len(groups) != len(words):
        groups = _word_groups(phonemes, True)
    if not words or not groups:
        return []
    if len(groups) == len(words):
        return [(w, s, e) for w, (s, e) in zip(words, groups)]
    span0, span1 = groups[0][0], groups[-1][1]
    n = len(words)
    return [(w, span0 + (span1 - span0)*i/n, span0 + (span1 - span0)*(i + 1)/n) for i, w in enumerate(words)]


def speak_timed(text: str, voice: str, speed: float, lang: str = "en-us") -> Timed:
    """Synthesize one line with phoneme and word timings (kokoro-onnx >= 0.6 with a model that
    exposes durations; scripts/setup-voice.sh installs it). The model is deterministic, so each
    line is cached by (model, voice, speed, text): rebuilding a timeline after a picture-only
    change re-speaks nothing. `lang` is the channel's language (generator/pack.py), not the voice's: channel
    #1's Indian voice speaks English. The cache key only grows a language for a non-English channel."""
    lang_key = "" if lang == "en-us" else f"|{lang}" + ("|runs2" if lang.split("-")[0] == "hi" else "")   # Hindi: spoken in runs
    key = hashlib.sha256(f"{MODEL}|{voice}|{speed:.4f}{lang_key}|{text}".encode()).hexdigest()[:24]
    cached = model_dir()/"lines"/f"{key}.npz"
    if cached.is_file():
        z = np.load(cached)
        phon = [(p, float(a), float(e)) for p, a, e in json.loads(str(z["phonemes"]))]
        return Timed(text, voice, speed, z["samples"].astype(np.float64), phon, words_from_phonemes(text, phon, lang))
    t = _speak_timed(text, voice, speed, lang)
    cached.parent.mkdir(parents=True, exist_ok=True)
    tmp = cached.with_suffix(".tmp.npz")
    np.savez(tmp, samples=t.samples.astype(np.float32), phonemes=json.dumps(t.phonemes))
    tmp.replace(cached)
    return t


HINDI_CHUNK = 160      # characters of Devanagari Kokoro speaks in one go (well under its 510-phoneme batch)


@dataclass(frozen=True)
class _Mark:
    phoneme: str
    start: float
    end: float


def hindi_chunks(text: str, limit: int = HINDI_CHUNK) -> list[str]:
    """A Hindi line split after its sentence stops (। ? !) into runs of at most `limit` characters."""
    sentences = [x for x in re.split(r"(?<=[।?!])\s+", text.strip()) if x]
    out: list[str] = []
    for x in sentences:
        if out and len(out[-1]) + 1 + len(x) <= limit:
            out[-1] += " " + x
        else:
            out.append(x)
    return out


def _create_timed_hindi(engine, text: str, voice: str, speed: float):
    """Hindi (India Maps, 2026-11-24): Devanagari phonemizes long, so a long line fills Kokoro's
    510-phoneme batch to the brim, and in such a full batch the speech is rushed, the timings run late
    and the last words collapse to zero length past the audio's end. Each run of sentences is spoken
    on its own instead, with a word break between runs. The phonemizer drops the danda, so a "।" is
    read as a full stop (the model then pauses after it, as after "?")."""
    parts, marks, offset, sr = [], [], 0.0, 24000
    for i, chunk in enumerate(hindi_chunks(text)):
        samples, sr, timings = engine.create_timed(chunk.replace("।", "."), voice=voice, speed=speed, lang="hi")
        if i:
            marks.append(_Mark(" ", offset, offset))
        marks += [_Mark(t.phoneme, t.start + offset, t.end + offset) for t in timings]
        parts.append(np.asarray(samples, dtype=np.float32))
        offset += len(samples)/sr
    return np.concatenate(parts), sr, marks


def _speak_timed(text: str, voice: str, speed: float, lang: str = "en-us") -> Timed:
    engine = _engine()
    if not getattr(engine, "has_timings", False):
        raise RuntimeError("this voice model has no timing output; run: bash scripts/setup-voice.sh")
    if lang.split("-")[0] == "hi":
        samples, sr, timings = _create_timed_hindi(engine, text, voice, speed)
    else:
        samples, sr, timings = engine.create_timed(text, voice=voice, speed=speed, lang=lang)
    x = np.asarray(samples, dtype=np.float64)
    loud = np.flatnonzero(np.abs(x) > 0.01)
    lead = max(0, loud[0] - int(0.02*sr)) if loud.size else 0
    tail = loud[-1] + int(0.05*sr) if loud.size else len(x)
    x = x[lead:tail]
    shift = lead/sr
    phon = [(t.phoneme, max(0.0, t.start - shift), max(0.0, t.end - shift)) for t in timings]
    y = resample_poly(x, SR, sr) if sr != SR else x
    return Timed(text, voice, speed, y, phon, words_from_phonemes(text, phon, lang))
