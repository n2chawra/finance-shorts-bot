"""Each video's own sound set (owner, 2026-11-17, on v-20261117-01: "Our background music and effects
sound is same in every video ... just like director making scene different for different video this
should also be different for different video"; CLAUDE.md variety rules: rotate the SFX set per video).

The script names effects by what they do (`pop`, `whoosh`, `boom`, `ding`, `kaching`...). A set decides
how they sound: their pitch and tone, the length of a whoosh or a riser, what a hit is (a deep boom or
a felted thud), what a bell is (a bright ding, a mallet, a struck glass) and which note it rings on,
tuned to the video's own music key. The set is picked from the seed among those that suit the genre
(`style.sfx` pins one); `classic` is the sound every Short had until 2026-11-18.
"""
from dataclasses import dataclass

import numpy as np

from .audio import (SR, lp, sfx_beep, sfx_boom, sfx_chime, sfx_clink, sfx_ding, sfx_fail, sfx_glass, sfx_pin,
                    sfx_pop, sfx_riser, sfx_thud, sfx_tick, sfx_whoosh, tarr)
from .music_constants import KEYS


@dataclass(frozen=True)
class SfxSet:
    name: str
    pitch: float = 1.0          # pops, clinks, the fail jingle
    tone: float | None = None   # low-pass on every effect (Hz): None is open and bright
    whoosh: float = 0.45        # seconds
    riser: float = 1.6          # seconds
    hit: str = "boom"           # "boom" | "thud" (a felted drum, no tail) | "deep" (a lower, longer boom)
    bell: str = "ding"          # "ding" | "mallet" | "glass"
    octave: int = 6             # the bell rings on the music key's tonic in this octave
    pop: str = "drop"           # "drop" (a falling sine pop) | "blip" (a short square blip on the key)
    tick: str = "noise"         # "noise" (a hi-hat tick) | "wood" (a small wooden tock)
    gain: float = 1.0


SETS: dict[str, SfxSet] = {s.name: s for s in (
    SfxSet("classic"),
    SfxSet("glass", pitch=1.2, whoosh=0.32, riser=1.3, bell="glass", octave=6, gain=0.95),
    SfxSet("arcade", pitch=1.1, tone=7000, whoosh=0.36, riser=1.2, bell="ding", octave=6, pop="blip"),
    SfxSet("deep", pitch=0.85, whoosh=0.7, riser=2.0, hit="deep", bell="ding", octave=5, gain=1.05),
    SfxSet("wood", pitch=0.85, tone=4500, whoosh=0.5, riser=1.4, hit="thud", bell="mallet", octave=5, tick="wood"),
    SfxSet("felt", pitch=0.75, tone=2600, whoosh=0.6, riser=1.8, hit="thud", bell="mallet", octave=5, tick="wood",
           gain=1.15),
)}

# the sets that suit each bed (music_constants.GENRES); a channel's own beds use the channel's own effects
GENRE_SETS: dict[str, tuple[str, ...]] = {
    "pop": ("glass", "arcade", "classic"), "synthwave": ("arcade", "glass", "deep"),
    "cinematic": ("deep", "glass", "classic"), "lofi": ("felt", "wood", "classic"),
    "acoustic": ("wood", "felt", "glass"),
}


def key_hz(key: str, octave: int) -> float:
    """The tonic of `key` in `octave` (A4 = 440 Hz)."""
    return 440.0*2**((KEYS.index(key) - 9)/12 + (octave - 4))


def _repitch(x: np.ndarray, p: float) -> np.ndarray:
    """Play `x` at `p` times its speed (pitch and length together), by linear interpolation."""
    if abs(p - 1.0) < 1e-6:
        return x
    return np.interp(np.arange(0, len(x) - 1, p), np.arange(len(x)), x)


def _blip(f: float, dur: float = 0.09) -> np.ndarray:
    t = tarr(dur)
    sq = np.sign(np.sin(2*np.pi*f*t*(1 + 0.6*np.exp(-t*60))))
    return lp(sq, 3500)*np.exp(-t*38)*0.3


def _bell(s: SfxSet, f: float, dur: float = 1.4) -> np.ndarray:
    if s.bell == "glass":
        return sfx_glass(f)
    if s.bell == "mallet":
        return sfx_chime(f)*1.3
    return sfx_ding(f, dur)


def render(kind: str, rng: np.random.Generator, name: str, key: str, classic) -> np.ndarray:
    """The effect `kind` in set `name`, tuned to `key`. `classic(kind, rng)` draws the original sound."""
    s = SETS[name]
    if s.name == "classic" or key not in KEYS:
        return classic(kind, rng)
    tonic = key_hz(key, s.octave)
    if kind in ("pop", "pop-high"):
        up = 1.35 if kind == "pop-high" else 1.0
        x = _blip(key_hz(key, 5)*up*s.pitch) if s.pop == "blip" else sfx_pop(s.pitch*up)
    elif kind == "whoosh":
        x = sfx_whoosh(rng, s.whoosh)
    elif kind == "riser":
        x = sfx_riser(rng, s.riser)
    elif kind == "boom":
        x = sfx_thud(rng)*1.25 if s.hit == "thud" else _repitch(sfx_boom(rng), 0.8) if s.hit == "deep" else sfx_boom(rng)
    elif kind == "ding":
        x = _bell(s, tonic)
    elif kind == "kaching":     # the coin, then the bell a fifth above the tonic
        x = np.concatenate([sfx_clink(s.pitch)[:3000]*1.5, _bell(s, tonic*1.5, 1.2)])
    elif kind == "clink":
        x = sfx_clink(s.pitch)
    elif kind == "tick":
        x = sfx_pin(1.6*s.pitch)[:int(0.08*SR)]*0.8 if s.tick == "wood" else sfx_tick(rng)
    elif kind == "fail":
        x = _repitch(sfx_fail(), s.pitch)
    elif kind == "beep":
        x = sfx_beep(tonic/2)
    else:                        # a channel's own kinds sound as they always do
        return classic(kind, rng)
    if s.tone:
        x = lp(x, s.tone)
    return x*s.gain


def pick(genre: str, seed: int) -> str:
    """The seed's set among those that suit `genre` (any set for a genre without a list)."""
    import random
    options = GENRE_SETS.get(genre, tuple(sorted(SETS)))
    return random.Random(f"sfx:{seed}").choice(options)
