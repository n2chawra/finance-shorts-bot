"""Build a Remotion timeline from a story script: the hand-off between Python and the renderer.

Python owns every number, every moment and every sound; Remotion only draws. So this module:

1. computes the maths (renderer/models/maths.py) and fills every `{placeholder}` in the script's
   text, rejecting any typed digit or ₹ — the only way a number reaches the screen;
2. speaks each beat's line with timings (Kokoro), so a beat lasts as long as its words and the
   picture can react to a word ("the number lands as she says it");
3. lays the music bed, the sound effects on each beat's events, and the voices, ducking the music
   under speech, into one WAV;
4. writes timeline.json: beats in frames with their resolved scene params, events, camera,
   transition, and every word and phoneme time for captions and lip-sync.

`voice="estimate"` skips Kokoro (CI, quick previews): timing comes from the word count and the
audio has no voice. Never used for a video that ships.
"""
from __future__ import annotations

import json
import math
import random
import re
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np

from renderer.engine import voice as tts
from renderer.engine.audio import (SR, Mixer, sfx_beep, sfx_boom, sfx_clink, sfx_ding, sfx_fail, sfx_kaching,
                                   sfx_pop, sfx_riser, sfx_tick, sfx_whoosh)
from renderer.engine.music import gain_curve, make_bed
from renderer.engine.style import resolve_style
from renderer.models import maths

FPS = 30
SIZES = {"long": (1920, 1080), "short": (1080, 1920)}
LEAD, TAIL = 0.35, 0.5            # silence before and after a beat's line
GAP_NO_VOICE = 2.4                # a beat with nothing said (a chapter card) lasts this long
VOICE_DUCK = 0.6                  # music drops this much under speech
DISCLAIMER = "Illustrative only. Not financial advice."
TYPED_NUMBER = re.compile(r"[0-9₹]")
PLACEHOLDER = re.compile(r"\{[a-z][a-z0-9_]*\}")   # names may hold digits ({card_paid_year1}); text may not
NARRATOR_VOICES = ("am_michael", "af_heart", "af_bella", "am_fenrir")
# each recurring character always speaks with the same voice, so viewers know them by ear
CAST_VOICES = {"rohan": "am_puck", "priya": "hf_alpha", "sharma": "am_fenrir", "sikka": "af_bella"}
SPEEDS = {"long": 1.0, "short": 1.15}


@dataclass
class Beat:
    id: str
    scene: str
    say: str = ""                  # with {placeholders}; spoken by `speaker`
    speaker: str = "narrator"
    params: dict = field(default_factory=dict)
    events: dict = field(default_factory=dict)       # name -> {"word": int|str} | {"sec": float}
    camera: str = "drift"
    transition: str = "cut"
    sfx: list = field(default_factory=list)          # [{"kind", "at": event name, "gain"?}]
    min_sec: float = 0.0
    chapter: str | None = None


def _fill(text: str, figures: dict[str, str], where: str) -> str:
    if TYPED_NUMBER.search(PLACEHOLDER.sub("", text)):
        raise ValueError(f"{where} contains a typed number; use a placeholder: {text!r}")
    try:
        return text.format_map(figures)
    except (KeyError, ValueError, IndexError) as e:
        raise ValueError(f"{where} has a bad placeholder ({e}); allowed: {', '.join(sorted(figures))}") from e


def _resolve(value, figures: dict[str, str], results: dict, where: str):
    """Scene params: strings get placeholders filled (no typed numbers); "@name.key" pulls a raw
    value or a series from the maths; numbers, booleans, lists and dicts pass through recursively."""
    if isinstance(value, str):
        if value.startswith("@"):
            name, _, key = value[1:].partition(".")
            r = results.get(name)
            if r is None:
                raise ValueError(f"{where}: no maths named {name!r}")
            if key in r["series"]:
                return r["series"][key]
            if key in r["values"]:
                return r["values"][key]
            raise ValueError(f"{where}: maths {name!r} has no value or series {key!r}")
        return _fill(value, figures, where)
    if isinstance(value, list):
        return [_resolve(v, figures, results, f"{where}[{i}]") for i, v in enumerate(value)]
    if isinstance(value, dict):
        return {k: _resolve(v, figures, results, f"{where}.{k}") for k, v in value.items()}
    return value


def _event_time(spec, words: list[tuple[str, float, float]], speech_start: float, duration: float, where: str) -> float:
    """Seconds into the beat for an event: a word (by index or by the word itself) or a time."""
    if isinstance(spec, (int, float)):
        return float(spec)
    if "sec" in spec:
        return float(spec["sec"])
    w = spec.get("word")
    if isinstance(w, int):
        if not words:
            return speech_start
        i = max(0, min(len(words) - 1, w))
        return speech_start + words[i][1]
    if isinstance(w, str):
        target = w.lower().strip(".,!?")
        for text, a, _ in words:
            if text.lower().strip(".,!?;:\"'") == target:
                return speech_start + a
        raise ValueError(f"{where}: no word {w!r} in this beat's line")
    if spec.get("end"):
        return max(0.0, duration - float(spec["end"]))
    raise ValueError(f"{where}: an event is {{'word': n}}, {{'word': 'text'}}, {{'sec': x}} or {{'end': x}}")


def _thumbnail(spec: dict | None, figures: dict[str, str], results: dict) -> dict | None:
    if not spec:
        return None
    t = _resolve(spec, figures, results, "thumbnail")
    if t.get("figure") not in figures.values():
        raise ValueError(f"thumbnail.figure must be one placeholder, like {{card_total_paid}}; got {spec.get('figure')!r}")
    if len(str(t.get("words", "")).split()) > 4:
        raise ValueError("thumbnail.words: four words at most, it is read at a glance")
    return t


def _estimate(text: str, speed: float) -> tts.Timed:
    """Timing without a voice: about 2.7 words a second at speed 1.0, split evenly."""
    words = text.split()
    each = 1/(2.7*speed)
    timed = [(w, i*each, (i + 0.85)*each) for i, w in enumerate(words)]
    return tts.Timed(text, "estimate", speed, np.zeros(int(len(words)*each*SR)), [], timed)


def _smooth(x: np.ndarray, k: int) -> np.ndarray:
    """Centred moving average over 2k+1 samples (edges padded), by cumulative sum: a long video
    has millions of samples, far too many for np.convolve with a kernel this wide."""
    c = np.concatenate(([0.0], np.cumsum(np.pad(x, k, mode="edge"))))
    return (c[2*k + 1:] - c[:-(2*k + 1)])/(2*k + 1)


SFX = {
    "pop": lambda r: sfx_pop(1.0), "pop-high": lambda r: sfx_pop(1.35), "whoosh": lambda r: sfx_whoosh(r, 0.45),
    "clink": lambda r: sfx_clink(1.0), "ding": lambda r: sfx_ding(), "boom": lambda r: sfx_boom(r), "fail": lambda r: sfx_fail(),
    "tick": lambda r: sfx_tick(r), "beep": lambda r: sfx_beep(880), "riser": lambda r: sfx_riser(r, 1.6),
    "kaching": lambda r: sfx_kaching(),
}


def build(script: dict, out: Path, voice: str = "kokoro") -> dict:
    """Write out/timeline.json and out/audio.wav; return the timeline."""
    fmt = script.get("format", "long")
    width, height = SIZES[fmt]
    seed = int(script["seed"])
    style = resolve_style(script.get("style", {}), seed)
    results = maths.compute(script.get("maths", []))
    figures = maths.placeholders(results)
    narrator = script.get("narrator") or random.Random(f"narrator:{seed}").choice(NARRATOR_VOICES)
    speed = float(script.get("speed", SPEEDS[fmt]))

    beats = [Beat(**b) for b in script["beats"]]
    if len({b.id for b in beats}) != len(beats):
        raise ValueError("beat ids must be unique")

    timeline_beats, lines, cursor = [], [], 0.0
    for b in beats:
        where = f"beat {b.id!r}"
        params = _resolve(b.params, figures, results, f"{where}.params")
        text = _fill(b.say, figures, f"{where}.say") if b.say else ""
        spoken = tts.fill_lines({"x": b.say}, ["x"], figures, 2000)["x"] if b.say else ""
        if spoken:
            who = CAST_VOICES.get(b.speaker, narrator) if b.speaker != "narrator" else narrator
            line = _estimate(spoken, speed) if voice == "estimate" else tts.speak_timed(spoken, who, speed)
            dur = max(b.min_sec, LEAD + line.seconds + TAIL)
        else:
            line, dur = None, max(b.min_sec, GAP_NO_VOICE)
        frames = max(1, round(dur*FPS))
        dur = frames/FPS
        # captions show figures as they appear on screen ("₹1.7 L"), not as they are spoken
        words = [(w, a, e) for w, a, e in (line.words if line else [])]
        events = {"start": 0, "speech": round(LEAD*FPS) if line else 0, "end": frames}
        for name, spec in b.events.items():
            events[name] = round(_event_time(spec, words, LEAD, dur, f"{where}.events.{name}")*FPS)
        if line is not None:
            lines.append((cursor + LEAD, line, b.speaker))
        timeline_beats.append({
            "id": b.id, "scene": b.scene, "from": round(cursor*FPS), "frames": frames, "params": params,
            "events": events, "camera": b.camera, "transition": b.transition, "speaker": b.speaker,
            "chapter": b.chapter, "say": text,
            "voice": None if line is None else {
                "start": round(LEAD*FPS), "speaker": b.speaker,
                "words": [{"w": w, "s": round(a, 3), "e": round(e, 3)} for w, a, e in words],
                "phonemes": [{"p": p, "s": round(a, 3), "e": round(e, 3)} for p, a, e in line.phonemes],
            },
        })
        b_sfx = [(cursor + events.get(s["at"], 0)/FPS, s) for s in b.sfx]
        timeline_beats[-1]["_sfx"] = b_sfx
        cursor += dur

    length = cursor + 0.6
    total_frames = round(length*FPS)
    mixer = Mixer(length, seed + 4)
    bed = make_bed(mixer.rng, length, style.genre, style.key, style.bpm)
    speech = np.zeros(mixer.n)
    for start, line, _ in lines:
        i = int(start*SR)
        speech[i:i + len(line.samples)] = 1.0
    duck = _smooth(speech, int(0.2*SR))
    mixer.add_bed(bed, gain_curve(length, 0.5)*(1 - VOICE_DUCK*duck))
    for tb in timeline_beats:
        for at, s in tb.pop("_sfx"):
            if s["kind"] not in SFX:
                raise ValueError(f"beat {tb['id']!r}: sfx kind must be one of {', '.join(SFX)}")
            mixer.place_out(SFX[s["kind"]](mixer.rng), at, s.get("gain", 0.6), s.get("pan", 0.0))
    for start, line, _ in lines:
        if line.voice != "estimate":
            peak = float(np.max(np.abs(line.samples))) or 1.0
            mixer.place_out(line.samples/peak*0.9, start, 1.0)
    out.mkdir(parents=True, exist_ok=True)
    mixer.write_wav(out/"audio.wav")
    peak, mean = mixer.levels()

    p = style.palette
    hexc = lambda c: "#%02x%02x%02x" % c   # noqa: E731
    timeline = {
        "version": 1, "id": script.get("id", "sample"), "format": fmt, "fps": FPS, "width": width, "height": height,
        "durationInFrames": total_frames, "seed": seed, "template": script.get("template"),
        "palette": {"bg": hexc(p.bg), "bgBottom": hexc(p.bg_bottom), "text": hexc(p.text), "muted": hexc(p.muted),
                    "accent": hexc(p.accent), "danger": hexc(p.danger), "panel": hexc(p.panel), "grid": hexc(p.grid),
                    "cast": [hexc(c) for c in p.cast]},
        "figures": figures, "beats": timeline_beats,
        "voices": {"narrator": narrator, **CAST_VOICES}, "speed": speed,
        "music": {"genre": style.genre, "key": style.key, "bpm": style.bpm},
        "audio": {"file": "audio.wav", "peak_db": round(peak, 1), "mean_db": round(mean, 1)},
        "disclaimer": DISCLAIMER, "voiceMode": voice,
        # the thumbnail card: a cast member reacting, one computed figure, at most four words
        "thumbnail": _thumbnail(script.get("thumbnail"), figures, results),
    }
    (out/"timeline.json").write_text(json.dumps(timeline, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")
    return timeline


def main() -> None:
    import argparse
    ap = argparse.ArgumentParser(description="script.json -> timeline.json + audio.wav")
    ap.add_argument("script", type=Path)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--voice", choices=("kokoro", "estimate"), default="kokoro")
    a = ap.parse_args()
    t = build(json.loads(a.script.read_text(encoding="utf-8")), a.out, a.voice)
    secs = t["durationInFrames"]/FPS
    print(f"{len(t['beats'])} beats, {secs:.1f} s ({math.floor(secs/60)}:{secs % 60:04.1f}), audio peak {t['audio']['peak_db']} dB mean {t['audio']['mean_db']} dB")


if __name__ == "__main__":
    main()
