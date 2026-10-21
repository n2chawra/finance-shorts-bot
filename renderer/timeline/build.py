"""Build a Remotion timeline from a story script: the hand-off between Python and the renderer.

Python owns every number, every moment and every sound; Remotion only draws. So this module:

1. computes the maths (renderer/models/maths.py) and fills every `{placeholder}` in the script's
   text, rejecting any typed digit or currency sign — the only way a number reaches the screen;
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
from renderer.engine.formatting import LEGACY_CURRENCY, Money, fact_value, money_for, month_year
from renderer.engine.style import resolve_style
from renderer.models import maths

FPS = 30
SIZES = {"long": (1920, 1080), "short": (1080, 1920)}
LEAD, TAIL = 0.35, 0.5            # silence before and after a beat's line
GAP_NO_VOICE = 2.4                # a beat with nothing said (a chapter card) lasts this long
# "a new picture every 3-5 s" (Shorts): a beat longer than LONG_BEAT seconds should have a named
# event at least every MAX_EVENT_GAP seconds. A warning for the writer for now, not a failure
LONG_BEAT, MAX_EVENT_GAP = 5.0, 3.0
VOICE_DUCK = 0.72                 # music drops this much under speech (0.6 until 2026-10-21)
# the voice leads the mix (owner, 2026-10-21: "the sound of the speaker is less and the effects are
# more"): sound effects go through a bus at half level, and drop further when they land on speech
SFX_BUS = 0.5
SFX_UNDER_VOICE = 0.6
VOICE_RMS = 0.2                   # every line levelled to the same loudness, peaks kept under 0.95
QUIET_BED, QUIET_LEVEL, QUIET_DUCK = "quiet-bed", 0.32, 0.92   # the experiment's bed level and duck
DISCLAIMER = "Illustrative only. Not financial advice."
TYPED_NUMBER = re.compile(r"[0-9₹$£€]")   # a digit or any currency sign
PLACEHOLDER = re.compile(r"\{[a-z][a-z0-9_]*\}")   # names may hold digits ({card_paid_year1}); text may not
NARRATOR_VOICES = ("am_michael", "af_heart", "af_bella", "am_fenrir")
# each recurring character always speaks with the same voice, so viewers know them by ear
CAST_VOICES = {"rohan": "am_puck", "priya": "hf_alpha", "sharma": "am_fenrir", "sikka": "af_bella"}
SPEEDS = {"long": 1.0, "short": 1.0}
# Pace: the whole video plays this much faster than its story clock, voice, pauses, animations and
# transitions together, like watching at that playback speed. The owner watched the first long
# sample at 1.5x and called it right (2026-10-17). Scripts are written on the story clock: LEAD,
# TAIL, GAP_NO_VOICE, min_sec and {"sec"/"end"} events are story seconds, divided by the tempo here;
# the voice is spoken at speed x tempo; Remotion runs each scene's animations on the story clock.
TEMPOS = {"long": 1.5, "short": 1.4}   # Shorts 1.3 until the reset (2026-10-21): faster, 20–35 s


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


def _one_string(raw, resolved, where: str, fm: Money) -> None:
    """One quantity, one string: a count-up or bar (`value` beside `text`) must land on the string
    Python makes from that same number, so a viewer pausing on two frames never sees two figures for
    one amount. Its value is an "@maths.key" or 0, never a typed number."""
    if isinstance(raw, list):
        for i, (r, v) in enumerate(zip(raw, resolved)):
            _one_string(r, v, f"{where}[{i}]", fm)
        return
    if not isinstance(raw, dict):
        return
    if "value" in raw and "text" in raw:
        ref, v, text = raw["value"], resolved["value"], resolved["text"]
        if isinstance(ref, (int, float)) and not isinstance(ref, bool):
            if ref != 0:
                raise ValueError(f"{where}.value is a typed number ({ref}); use \"@maths.key\" or 0")
        elif isinstance(v, (int, float)) and v != 0:
            shown = {fm.full(v), fm.short(v), fm.long(v), fm.group(round(v)), f"{v:g}"}
            if not any(s in str(text) for s in shown):
                raise ValueError(f"{where}: counts to {fm.short(v)} ({ref}) but lands on {text!r}; one quantity, "
                                 f"one string: use the placeholder that shows the same number")
    for k, r in raw.items():
        if k in resolved:
            _one_string(r, resolved[k], f"{where}.{k}", fm)


def _event_time(spec, words: list[tuple[str, float, float]], speech_start: float, duration: float, where: str,
                tempo: float = 1.0) -> float:
    """Seconds into the beat for an event: a word (by index or by the word itself) or a time
    (story seconds, so divided by the tempo)."""
    if isinstance(spec, (int, float)):
        return float(spec)/tempo
    if "sec" in spec:
        return float(spec["sec"])/tempo
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
        return max(0.0, duration - float(spec["end"])/tempo)
    raise ValueError(f"{where}: an event is {{'word': n}}, {{'word': 'text'}}, {{'sec': x}} or {{'end': x}}")


_PUNCT_ONLY = re.compile(r"^[^\w₹$£€]+$")


def _captions(say: str, figures: dict[str, str], words: list[tuple[str, float, float]], currency: str = LEGACY_CURRENCY) -> list[dict]:
    """Caption tokens as written, timed by the spoken words: a figure shows as on screen
    ("₹60,000") across the words that speak it ("sixty thousand rupees"). Falls back to the spoken
    words if the two ever disagree on length."""
    tokens: list[list] = []                       # [text, first word index, last word index]
    i = 0
    for part in re.split(r"(\{[a-z][a-z0-9_]*\})", say):
        if not part:
            continue
        if PLACEHOLDER.fullmatch(part):
            n = len(tts.spoken(figures[part[1:-1]], currency).split())
            tokens.append([figures[part[1:-1]], i, i + n - 1])
            i += n
            continue
        for tok in part.split():
            if _PUNCT_ONLY.match(tok) and tokens:
                tokens[-1][0] += tok              # "." after a figure joins it
            else:
                tokens.append([tok, i, i])
                i += 1
    if i != len(words):
        return [{"t": w, "s": round(a, 3), "e": round(e, 3)} for w, a, e in words]
    return [{"t": t, "s": round(words[a][1], 3), "e": round(words[b][2], 3)} for t, a, b in tokens]


FACT_KEYS = ("label", "value", "unit", "as_of", "source", "url")


def _facts(script: dict) -> tuple[dict[str, str], str | None]:
    """A news video's sourced facts (copied from the research feed, checked against it by the
    number check): {fact1: "₹31,781 Cr", ...} placeholders and the "Data: AMFI · Jun 2026" line
    every headline scene shows. The one place a published figure reaches the screen."""
    facts = script.get("facts") or []
    figures, sources = {}, []
    for i, f in enumerate(facts, 1):
        missing = [k for k in FACT_KEYS if k not in f]
        if missing:
            raise ValueError(f"facts[{i - 1}] needs {', '.join(missing)}")
        if not str(f["url"]).startswith("http"):
            raise ValueError(f"facts[{i - 1}].url must be the source's address")
        figures[f"fact{i}"] = fact_value(f["value"], f["unit"], f.get("currency") or money_for(script).currency)
        if f["source"] not in sources:
            sources.append(f["source"])
    line = f"Data: {' · '.join(sources)} · {month_year(max(f['as_of'] for f in facts))}" if facts else None
    return figures, line


# what a thumbnail leads with: long videos get three, each a different angle, for YouTube's Test &
# Compare; the winners teach the agents which angle works (improvement/evaluate.py)
THUMB_ANGLES = ("number", "question", "reaction", "versus", "warning")


def _thumbnail_variants(script: dict, figures: dict[str, str], results: dict) -> list[dict]:
    """The extra thumbnails (`thumbnails`, up to two) beside `thumbnail`, each with its own angle."""
    extra = script.get("thumbnails") or []
    if not extra:
        return []
    if not script.get("thumbnail"):
        raise ValueError("thumbnails needs a main thumbnail too")
    if len(extra) > 2:
        raise ValueError("thumbnails: two more at most (three in all, the most Test & Compare takes)")
    variants = [_thumbnail(t, figures, results) for t in extra]
    angles = [t.get("angle") for t in [script["thumbnail"], *extra]]
    if any(a not in THUMB_ANGLES for a in angles):
        raise ValueError(f"every thumbnail needs an angle: one of {', '.join(THUMB_ANGLES)}")
    if len(set(angles)) != len(angles):
        raise ValueError("each thumbnail needs a different angle, so the test compares ideas, not small tweaks")
    return variants


def _thumbnail(spec: dict | None, figures: dict[str, str], results: dict) -> dict | None:
    if not spec:
        return None
    t = _resolve(spec, figures, results, "thumbnail")
    if t.get("figure") not in figures.values():
        raise ValueError(f"thumbnail.figure must be one placeholder, like {{card_total_paid}}; got {spec.get('figure')!r}")
    if len(str(t.get("words", "")).split()) > 4:
        raise ValueError("thumbnail.words: four words at most, it is read at a glance")
    if t.get("small") is not None and t["small"] not in figures.values():
        raise ValueError(f"thumbnail.small must be one placeholder, like {{card_min_due}}; got {spec.get('small')!r}")
    if t.get("layout") == "story" and t.get("hero") not in (None, "card", "phone", "house", "car", "cash", "piggy"):
        raise ValueError("thumbnail.hero must be card, phone, house, car, cash or piggy")
    if t.get("layout") not in (None, "card", "story", "versus", "secret"):
        raise ValueError("thumbnail.layout must be card, story, versus (rich vs poor) or secret (what the rich know)")
    if t.get("layout") == "versus" and not t.get("small"):
        raise ValueError("a versus thumbnail needs `small` (the poor side's figure) beside `figure` (the rich side's)")
    if len(str(t.get("words", "")).replace("*", "").split()) > 4:
        raise ValueError("thumbnail.words: four words at most, it is read at a glance")
    return t


def _estimate(text: str, speed: float) -> tts.Timed:
    """Timing without a voice: about 2.7 words a second at speed 1.0, split evenly."""
    words = text.split()
    each = 1/(2.7*speed)
    timed = [(w, i*each, (i + 0.85)*each) for i, w in enumerate(words)]
    return tts.Timed(text, "estimate", speed, np.zeros(int(len(words)*each*SR)), [], timed)


def _db(x: np.ndarray, where: np.ndarray | None = None) -> float:
    """RMS level of a stem in dB (where it sounds, or where `where` is true), before mastering."""
    v = x[where] if where is not None and where.any() else x[np.abs(x) > 1e-4] if (np.abs(x) > 1e-4).any() else x
    return round(float(20*np.log10(np.sqrt(np.mean(v**2)) + 1e-12)), 1)


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


WHOOSH_TRANSITIONS = ("zoom-through", "whip", "match")

SCENES_TS = Path(__file__).resolve().parents[2]/"remotion"/"src"/"contract"/"scenes.ts"


def scene_names() -> set[str]:
    """The scenes Remotion has (remotion/src/contract/scenes.ts is the one list)."""
    src = SCENES_TS.read_text(encoding="utf-8")
    return set(re.findall(r'"([a-z][a-z-]*)"', src[src.index("SCENE_NAMES"):src.index("] as const")]))


def event_gaps(beats: list[dict], fps: int = FPS) -> list[str]:
    """Warnings for Shorts beats ({"id", "frames", "events"} as in timeline.json) longer than
    LONG_BEAT seconds with more than MAX_EVENT_GAP seconds between changes: the beat start and end
    and every named event (not "speech", which only starts the voice)."""
    out = []
    for b in beats:
        frames = b["frames"]
        if frames/fps <= LONG_BEAT:
            continue
        marks = sorted({0, frames, *(min(frames, max(0, v)) for k, v in b["events"].items() if k != "speech")})
        gap = max(q - p for p, q in zip(marks, marks[1:]))/fps
        if gap > MAX_EVENT_GAP:
            out.append(f"beat {b['id']!r} runs {frames/fps:.1f} s with {gap:.1f} s and no event: add an event "
                       f"(a line, a count-up, a pose, a camera punch) every {MAX_EVENT_GAP:g} s, or split the beat")
    return out


def check_script(script: dict) -> dict:
    """Everything a build would reject, without speaking or mixing anything: maths inputs, typed
    numbers, placeholders, @references, scene names, sound kinds, ids and event words. Returns
    {"figures": {placeholder: shown}, "beats": [{"id", "scene", "speaker", "say", "spoken"}],
    "warnings": [...]} for the number check and the reviewers. Warnings (Shorts pacing, on an
    estimated voice timing) never fail a script."""
    fmt = script.get("format", "long")
    if fmt not in SIZES:
        raise ValueError("format must be long or short")
    fm = money_for(script)   # rejects an unknown currency
    results = maths.compute(script.get("maths", []), fm)
    fact_figures, sources = _facts(script)
    figures = {**maths.placeholders(results), **fact_figures}
    beats = [Beat(**b) for b in script.get("beats", [])]
    if not beats:
        raise ValueError("a story needs beats")
    if script.get("thumbnails"):
        _thumbnail_variants(script, figures, results)
    if sources and not any(b.scene == "headline" for b in beats):
        raise ValueError("a script with sourced facts needs a headline beat, which shows where they come from")
    if len({b.id for b in beats}) != len(beats):
        raise ValueError("beat ids must be unique")
    scenes, out, timed = scene_names(), [], []
    tempo = float(script.get("tempo", TEMPOS[fmt]))
    speed = float(script.get("speed", SPEEDS[fmt]))*tempo
    for b in beats:
        where = f"beat {b.id!r}"
        if b.scene not in scenes:
            raise ValueError(f"{where}: no scene called {b.scene!r}; scenes are {', '.join(sorted(scenes))}")
        _one_string(b.params, _resolve(b.params, figures, results, f"{where}.params"), f"{where}.params", fm)
        text = _fill(b.say, figures, f"{where}.say") if b.say else ""
        spoken = tts.fill_lines({"x": b.say}, ["x"], figures, 2000, fm.currency)["x"] if b.say else ""
        words = {w.lower().strip(".,!?;:\"'") for w in spoken.split()}
        for name, spec in b.events.items():
            w = spec.get("word") if isinstance(spec, dict) else None
            if isinstance(w, str) and w.lower().strip(".,!?") not in words:
                raise ValueError(f"{where}.events.{name}: no word {w!r} in this beat's spoken line")
        for sfx in b.sfx:
            if sfx.get("kind") not in SFX:
                raise ValueError(f"{where}: sfx kind must be one of {', '.join(SFX)}")
        out.append({"id": b.id, "scene": b.scene, "speaker": b.speaker, "say": text, "spoken": spoken})
        if fmt == "short":
            line = _estimate(spoken, speed) if spoken else None
            dur = max(b.min_sec/tempo, LEAD/tempo + line.seconds + TAIL/tempo) if line else max(b.min_sec/tempo, GAP_NO_VOICE/tempo)
            frames = max(1, round(dur*FPS))
            events = {n: round(_event_time(spec, line.words if line else [], LEAD/tempo, frames/FPS, where, tempo)*FPS)
                      for n, spec in b.events.items()}
            timed.append({"id": b.id, "frames": frames, "events": events})
    # a long video ends on the end card; a Short loops back to its hook instead and shows the
    # disclaimer as a small line over its last moments (owner, 2026-10-21)
    if fmt == "long" and beats[-1].scene != "end":
        raise ValueError("the last beat must be the end card (scene \"end\"), which carries the disclaimer")
    _thumbnail(script.get("thumbnail"), figures, results)
    return {"figures": figures, "beats": out, "warnings": event_gaps(timed)}


def build(script: dict, out: Path, voice: str = "kokoro") -> dict:
    """Write out/timeline.json and out/audio.wav; return the timeline."""
    fmt = script.get("format", "long")
    width, height = SIZES[fmt]
    seed = int(script["seed"])
    style = resolve_style(script.get("style", {}), seed)
    fm = money_for(script)
    results = maths.compute(script.get("maths", []), fm)
    fact_figures, sources = _facts(script)
    figures = {**maths.placeholders(results), **fact_figures}
    narrator = script.get("narrator") or random.Random(f"narrator:{seed}").choice(NARRATOR_VOICES)
    tempo = float(script.get("tempo", TEMPOS[fmt]))
    speed = float(script.get("speed", SPEEDS[fmt]))*tempo        # the voice, at the video's pace
    lead, tail, gap = LEAD/tempo, TAIL/tempo, GAP_NO_VOICE/tempo

    beats = [Beat(**b) for b in script["beats"]]
    if len({b.id for b in beats}) != len(beats):
        raise ValueError("beat ids must be unique")

    timeline_beats, lines, cursor = [], [], 0.0
    for b in beats:
        where = f"beat {b.id!r}"
        params = _resolve(b.params, figures, results, f"{where}.params")
        _one_string(b.params, params, f"{where}.params", fm)
        text = _fill(b.say, figures, f"{where}.say") if b.say else ""
        spoken = tts.fill_lines({"x": b.say}, ["x"], figures, 2000, fm.currency)["x"] if b.say else ""
        if spoken:
            who = CAST_VOICES.get(b.speaker, narrator) if b.speaker != "narrator" else narrator
            line = _estimate(spoken, speed) if voice == "estimate" else tts.speak_timed(spoken, who, speed)
            dur = max(b.min_sec/tempo, lead + line.seconds + tail)
        else:
            line, dur = None, max(b.min_sec/tempo, gap)
        frames = max(1, round(dur*FPS))
        dur = frames/FPS
        # captions show figures as they appear on screen ("₹1.7 L"), not as they are spoken
        words = [(w, a, e) for w, a, e in (line.words if line else [])]
        events = {"start": 0, "speech": round(lead*FPS) if line else 0, "end": frames}
        for name, spec in b.events.items():
            events[name] = round(_event_time(spec, words, lead, dur, f"{where}.events.{name}", tempo)*FPS)
        if line is not None:
            lines.append((cursor + lead, line, b.speaker))
        timeline_beats.append({
            "id": b.id, "scene": b.scene, "from": round(cursor*FPS), "frames": frames, "params": params,
            "events": events, "camera": b.camera, "transition": b.transition, "speaker": b.speaker,
            "chapter": b.chapter, "say": text,
            "voice": None if line is None else {
                "start": round(lead*FPS), "speaker": b.speaker,
                "words": [{"w": w, "s": round(a, 3), "e": round(e, 3)} for w, a, e in words],
                "captions": _captions(b.say, figures, words, fm.currency),
                "phonemes": [{"p": p, "s": round(a, 3), "e": round(e, 3)} for p, a, e in line.phonemes],
            },
        })
        b_sfx = [(cursor + events.get(s["at"], 0)/FPS, s) for s in b.sfx]
        # a transition that travels somewhere carries its own sound (motion direction, 2026-10-21)
        if b.transition in WHOOSH_TRANSITIONS and not any(s.get("at", "start") == "start" and s.get("kind") == "whoosh" for s in b.sfx):
            b_sfx.append((max(0.0, cursor - 0.05), {"kind": "whoosh", "at": "start", "gain": 0.55}))
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
    # A/B "quiet-bed" (owner, 2026-10-19, after Casual Finance: voice only, 2.3M views): music about
    # 4 dB lower overall and nearly gone under speech, so it only fills the pauses
    quiet = (script.get("experiments") or {}).get(QUIET_BED) == "on"
    level, duck_by = (QUIET_LEVEL, QUIET_DUCK) if quiet else (0.5, VOICE_DUCK)
    mixer.add_bed(bed, gain_curve(length, level)*(1 - duck_by*duck))
    # three stems, measured apart (timeline audio.stems), then summed into the mix
    voice_m, sfx_m = Mixer(length, seed + 5), Mixer(length, seed + 6)
    for tb in timeline_beats:
        for at, s in tb.pop("_sfx"):
            if s["kind"] not in SFX:
                raise ValueError(f"beat {tb['id']!r}: sfx kind must be one of {', '.join(SFX)}")
            on_voice = speech[min(len(speech) - 1, max(0, int(at*SR)))] > 0
            gain = s.get("gain", 0.6)*SFX_BUS*(SFX_UNDER_VOICE if on_voice else 1.0)
            sfx_m.place_out(SFX[s["kind"]](mixer.rng), at, gain, s.get("pan", 0.0))
    for start, line, _ in lines:
        if line.voice != "estimate":
            x = line.samples
            rms = float(np.sqrt(np.mean(x**2))) or 1.0
            peak = float(np.max(np.abs(x))) or 1.0
            voice_m.place_out(x*min(VOICE_RMS/rms, 0.95/peak), start, 1.0)
    stems = {"music": _db(mixer.left), "sfx": _db(sfx_m.left), "voice": _db(voice_m.left, speech > 0)}
    for m in (voice_m, sfx_m):
        mixer.left += m.left
        mixer.right += m.right
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
        "voices": {"narrator": narrator, **CAST_VOICES}, "speed": speed, "tempo": tempo,
        "music": {"genre": style.genre, "key": style.key, "bpm": style.bpm},
        "style": {"palette": p.name, "genre": style.genre, "key": style.key, "bpm": style.bpm},
        "audio": {"file": "audio.wav", "peak_db": round(peak, 1), "mean_db": round(mean, 1), "stems": stems},
        "disclaimer": DISCLAIMER, "captions": True, "voiceMode": voice, "sources": sources, "currency": fm.currency,
        # A/B variants for this video ({id: "on" | "off"}, generator/experiments.py): scenes read them
        # with flag() in remotion/src/contract/flags.ts, and the render report hands them to the manifest
        "experiments": dict(script.get("experiments") or {}),
        # the thumbnail card: a cast member reacting, one computed figure, at most four words
        "thumbnail": _thumbnail(script.get("thumbnail"), figures, results),
        # extra thumbnails for a Test & Compare on YouTube (long videos): thumbnail-b.png, thumbnail-c.png
        "thumbnailVariants": _thumbnail_variants(script, figures, results),
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
