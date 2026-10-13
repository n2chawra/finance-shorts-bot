"""Synthesized music beds in five genres. `make_bed` is the entry point.

Everything is built from oscillators and filtered noise. The key, tempo, genre and the RNG fully
determine the result.
"""
from collections.abc import Callable, Sequence
from functools import lru_cache

import numpy as np

from .audio import SR, hp, lp, tarr

KEYS: tuple[str, ...] = ("C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B")
GENRES: tuple[str, ...] = ("lofi", "pop", "cinematic", "synthwave", "acoustic")
BPM_RANGE: dict[str, tuple[int, int]] = {"lofi": (80, 96), "pop": (104, 120), "cinematic": (80, 100),
                                         "synthwave": (96, 116), "acoustic": (88, 110)}
BED_RMS = 0.135   # loudness every bed is normalised to (the lo-fi bed's natural level)

LOFI_CHORDS: list[list[int]] = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]]  # Am7 Fmaj7 Cmaj7 G7

MAJ, MIN = (0, 4, 7), (0, 3, 7)
# chord progressions as (semitones above the key note, quality); one is picked per video
PROGRESSIONS: dict[str, list[list[tuple[int, tuple[int, int, int]]]]] = {
    "pop": [[(0, MAJ), (7, MAJ), (9, MIN), (5, MAJ)], [(0, MAJ), (5, MAJ), (9, MIN), (7, MAJ)],
            [(9, MIN), (5, MAJ), (0, MAJ), (7, MAJ)]],
    "cinematic": [[(0, MIN), (8, MAJ), (3, MAJ), (10, MAJ)], [(0, MIN), (5, MIN), (8, MAJ), (7, MAJ)]],
    "synthwave": [[(0, MIN), (8, MAJ), (3, MAJ), (10, MAJ)], [(0, MIN), (10, MAJ), (8, MAJ), (10, MAJ)]],
    "acoustic": [[(0, MAJ), (5, MAJ), (9, MIN), (7, MAJ)], [(0, MAJ), (9, MIN), (5, MAJ), (7, MAJ)]],
}
ARPS: list[tuple[int, ...]] = [(0, 1, 2, 1, 0, 2, 1, 2), (0, 2, 1, 2, 0, 2, 1, 2), (2, 1, 0, 1, 2, 1, 0, 1)]
CUTOFF: dict[str, dict[str, float]] = {
    "pop": {"pad": 2500, "bass": 900, "lead": 6000, "drums": 9000},
    "cinematic": {"pad": 1800, "bass": 500, "lead": 4000, "drums": 2500},
    "synthwave": {"pad": 2200, "bass": 700, "lead": 3500, "drums": 9000},
    "acoustic": {"pad": 3000, "bass": 1200, "lead": 7000, "drums": 9000},
}


def note(m: float) -> float:
    """MIDI note number → Hz."""
    return 440*2**((m - 69)/12)


# ---------------- lo-fi (the original prototype bed) ----------------

def lofi_bed(rng: np.random.Generator, dur: float, bpm: float = 96,
             chords: Sequence[Sequence[int]] = LOFI_CHORDS) -> np.ndarray:
    """Mono lo-fi loop: pad chords (two bars each), bass on every beat, kick, soft snare, hats."""
    n = int(SR*dur)
    beat = 60/bpm
    bar = beat*4
    music = np.zeros(n)
    t_all = np.arange(n)/SR

    def add(sig: np.ndarray, at: float, g: float) -> None:
        i = int(at*SR)
        j = min(n, i + len(sig))
        if i < n:
            music[i:j] += sig[:j-i]*g

    for ci in range(int(dur/(bar*2)) + 1):
        ch = chords[ci % len(chords)]
        st = ci*bar*2
        ln = bar*2
        i0 = int(st*SR)
        i1 = min(n, int((st + ln)*SR))
        if i0 >= n:
            break
        tt = t_all[i0:i1] - st
        env = np.minimum(1, tt/0.4)*np.minimum(1, (ln - tt)/0.3)
        pad = sum(np.sin(2*np.pi*note(m)*tt) + 0.5*np.sin(2*np.pi*note(m)*1.003*tt) for m in ch)
        music[i0:i1] += pad*env*0.05
        for b in range(8):
            bs = st + b*beat
            j0 = int(bs*SR)
            j1 = min(n, int((bs + beat)*SR))
            if j0 >= n:
                break
            tb = t_all[j0:j1] - bs
            music[j0:j1] += np.sin(2*np.pi*note(ch[0] - 12)*tb)*np.exp(-tb*3)*0.22

    kick = _kick()
    hat = _hat(rng)
    for b in range(int(dur/beat) + 1):
        bs = b*beat
        if b % 2 == 0:
            add(kick, bs, 0.55)
        if b % 4 == 2:
            add(lp(rng.standard_normal(4000), 2500)*np.exp(-np.arange(4000)/SR*30), bs, 0.25)  # soft snare
        add(hat, bs + beat/2, 0.12)
    return lp(music, 4200)


# ---------------- instruments ----------------

@lru_cache(maxsize=1024)
def _voice(wave: str, freq: float, dur: float, attack: float, release: float, decay: float = 0.0) -> np.ndarray:
    """Oscillator note with a linear attack/release and optional exponential decay. Do not mutate."""
    t = tarr(dur)
    ph = freq*t
    if wave == "sine":
        s = np.sin(2*np.pi*ph)
    elif wave == "saw":
        s = 2*(ph % 1) - 1
    elif wave == "square":
        s = np.sign(np.sin(2*np.pi*ph))
    else:  # tri
        s = 2*np.abs(2*(ph % 1) - 1) - 1
    s = s*np.minimum(1, t/attack)*np.clip((dur - t)/release, 0, 1)
    return s*np.exp(-t*decay) if decay else s


@lru_cache(maxsize=1024)
def _pluck(freq: float, dur: float) -> np.ndarray:
    """Plucked string: harmonics that die away faster the higher they are. Do not mutate."""
    t = tarr(dur)
    s = sum(np.sin(2*np.pi*freq*h*t)/h*np.exp(-t*(2.5 + 1.2*h)) for h in range(1, 7))
    return s*np.minimum(1, t/0.004)*np.clip((dur - t)/0.02, 0, 1)


def _kick() -> np.ndarray:
    t = tarr(0.35)
    return np.sin(2*np.pi*np.cumsum(50 + 100*np.exp(-t*30))/SR)*np.exp(-t*9)


def _hat(rng: np.random.Generator) -> np.ndarray:
    t = tarr(0.06)
    return hp(rng.standard_normal(len(t)), 7000)*np.exp(-t*70)


def _snare(rng: np.random.Generator, decay: float) -> np.ndarray:
    t = tarr(0.3)
    return lp(rng.standard_normal(len(t)), 4500)*np.exp(-t*decay) + 0.5*np.sin(2*np.pi*190*t)*np.exp(-t*40)


def _tom() -> np.ndarray:
    t = tarr(0.7)
    return np.sin(2*np.pi*np.cumsum(65 + 60*np.exp(-t*20))/SR)*np.exp(-t*5)


def _shaker(rng: np.random.Generator) -> np.ndarray:
    t = tarr(0.08)
    return hp(rng.standard_normal(len(t)), 5000)*np.sin(np.pi*t/0.08)**2


class _Bed:
    """Named layers so each can get its own filter before the final mix."""

    def __init__(self, dur: float, beat: float) -> None:
        self.n = int(SR*dur)
        self.beat = beat
        self.bar = 4*beat
        self.bars = int(dur/self.bar) + 1
        self.layers: dict[str, np.ndarray] = {}

    def add(self, layer: str, sig: np.ndarray, at: float, g: float) -> None:
        buf = self.layers.setdefault(layer, np.zeros(self.n))
        i = int(at*SR)
        if i >= self.n:
            return
        j = min(self.n, i + len(sig))
        buf[i:j] += sig[:j-i]*g


Chords = list[list[int]]


def _pop(bed: _Bed, rng: np.random.Generator, chords: Chords) -> None:
    """Four-on-the-floor, claps on 2 and 4, eighth-note bass and a plucked arpeggio."""
    beat, kick, clap, hat = bed.beat, _kick(), _snare(rng, 45), _hat(rng)
    arp = ARPS[int(rng.integers(len(ARPS)))]
    for b in range(bed.bars):
        st, ch = b*bed.bar, chords[b % 4]
        for m in ch:
            bed.add("pad", _voice("saw", note(m + 12), bed.bar, 0.03, 0.12), st, 0.05)
        for e in range(8):
            at = st + e*beat/2
            bed.add("bass", _voice("tri", note(ch[0]), beat/2, 0.005, 0.04, 5.0), at, 0.2)
            bed.add("lead", _pluck(note(ch[arp[e]] + 24), beat*0.75), at, 0.11)
            bed.add("drums", hat, at, 0.12 if e % 2 else 0.07)
        for q in range(4):
            bed.add("drums", kick, st + q*beat, 0.38)
            if q % 2:
                bed.add("drums", clap, st + q*beat, 0.25)


def _cinematic(bed: _Bed, rng: np.random.Generator, chords: Chords) -> None:
    """Slow string swells (two bars a chord), a low drone, a plucked ostinato and deep drums."""
    beat, tom = bed.beat, _tom()
    arp = ARPS[int(rng.integers(len(ARPS)))]
    for b in range(bed.bars):
        st, ch = b*bed.bar, chords[(b//2) % 4]
        if b % 2 == 0:
            for m in ch:
                for det in (1.0, 1.004):
                    bed.add("pad", _voice("saw", note(m + 12)*det, 2*bed.bar, 0.8, 0.6), st, 0.035)
                bed.add("pad", _voice("saw", note(m + 24), 2*bed.bar, 1.2, 0.6), st, 0.016)
            bed.add("bass", _voice("tri", note(ch[0]), 2*bed.bar, 0.3, 0.5), st, 0.11)
        for e in range(8):
            bed.add("lead", _pluck(note(ch[arp[e]] + 24), beat), st + e*beat/2, 0.1)
        bed.add("drums", tom, st, 0.4)
        bed.add("drums", tom, st + 2.5*beat, 0.25)
        if b % 4 == 3:
            bed.add("drums", tom, st + 3*beat, 0.28)
            bed.add("drums", tom, st + 3.5*beat, 0.34)


def _synthwave(bed: _Bed, rng: np.random.Generator, chords: Chords) -> None:
    """Octave-jumping saw bass, sixteenth-note square arpeggio, big snare on 2 and 4."""
    beat, kick, snare, hat = bed.beat, _kick(), _snare(rng, 14), _hat(rng)
    up = bool(rng.integers(2))
    for b in range(bed.bars):
        st, ch = b*bed.bar, chords[b % 4]
        tones = [*ch, ch[0] + 12] if up else [ch[0] + 12, *reversed(ch)]
        for m in ch:
            for det in (1.0, 1.006):
                bed.add("pad", _voice("saw", note(m + 12)*det, bed.bar, 0.05, 0.15), st, 0.03)
        for e in range(8):
            at = st + e*beat/2
            bed.add("bass", _voice("saw", note(ch[0] + (12 if e % 2 else 0)), beat/2, 0.004, 0.03, 7.0), at, 0.11)
            if e % 2:
                bed.add("drums", hat, at, 0.1)
        for s in range(16):
            bed.add("lead", _voice("square", note(tones[s % 4] + 24), beat/4, 0.003, 0.03, 10.0), st + s*beat/4, 0.05)
        for q in range(4):
            bed.add("drums", kick, st + q*beat, 0.38)
            if q % 2:
                bed.add("drums", snare, st + q*beat, 0.28)


def _acoustic(bed: _Bed, rng: np.random.Generator, chords: Chords) -> None:
    """Strummed plucked chords, plucked bass, shaker and a soft kick."""
    beat, kick, rim, shaker = bed.beat, _kick(), _snare(rng, 60), _shaker(rng)
    strum = [(0, 1, 1.5, 2.5, 3, 3.5), (0, 1.5, 2, 2.5, 3.5)][int(rng.integers(2))]
    for b in range(bed.bars):
        st, ch = b*bed.bar, chords[b % 4]
        tones = [ch[0], ch[2], ch[0] + 12, ch[1] + 12, ch[2] + 12]
        for si, sb in enumerate(strum):
            for k, m in enumerate(tones if si % 2 == 0 else tones[::-1]):   # down-strum, up-strum
                bed.add("lead", _pluck(note(m + 12), beat*1.5), st + sb*beat + k*0.012, 0.05 if si else 0.065)
        for q in range(4):
            if q % 2 == 0:
                bed.add("bass", _pluck(note(ch[0]), 2*beat), st + q*beat, 0.22)
                bed.add("drums", kick, st + q*beat, 0.3)
            else:
                bed.add("drums", rim, st + q*beat, 0.1)
        for e in range(8):
            bed.add("drums", shaker, st + e*beat/2, 0.09 if e % 2 else 0.05)


_BUILDERS: dict[str, Callable[[_Bed, np.random.Generator, Chords], None]] = {
    "pop": _pop, "cinematic": _cinematic, "synthwave": _synthwave, "acoustic": _acoustic}


def make_bed(rng: np.random.Generator, dur: float, genre: str, key: str, bpm: float) -> np.ndarray:
    """Mono music bed of `dur` seconds, normalised to BED_RMS."""
    k = KEYS.index(key)
    if genre == "lofi":
        shift = (k - 9 + 6) % 12 - 6          # the lo-fi chords are written in A minor
        out = lofi_bed(rng, dur, bpm, [[m + shift for m in ch] for ch in LOFI_CHORDS])
    else:
        root = 43 + (k - 7) % 12              # G2 … F#3
        options = PROGRESSIONS[genre]
        prog = options[int(rng.integers(len(options)))]
        chords = [[root + (off - 12 if off > 6 else off) + q for q in qual] for off, qual in prog]
        bed = _Bed(dur, 60/bpm)
        _BUILDERS[genre](bed, rng, chords)
        out = sum(lp(buf, CUTOFF[genre][name]) for name, buf in bed.layers.items())
    return out*(BED_RMS/np.sqrt(np.mean(out**2)))


def gain_curve(dur: float, base: float, segments: Sequence[tuple[float, float, float]] = (),
               smooth: int = 2000) -> np.ndarray:
    """Per-sample music gain: `base`, overridden by (start_s, end_s, gain) segments, then smoothed
    so ducks and drops don't click."""
    gain = np.ones(int(SR*dur))*base
    for a, b, g in segments:
        gain[int(a*SR):int(b*SR)] = g
    return np.convolve(gain, np.ones(smooth)/smooth, mode="same")
