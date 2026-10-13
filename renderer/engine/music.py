"""Synthesized music beds."""
from collections.abc import Sequence

import numpy as np

from .audio import SR, hp, lp, tarr

LOFI_CHORDS: list[list[int]] = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]]  # Am7 Fmaj7 Cmaj7 G7


def note(m: float) -> float:
    """MIDI note number → Hz."""
    return 440*2**((m - 69)/12)


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

    kick_t = tarr(0.35)
    kick = np.sin(2*np.pi*np.cumsum(50 + 100*np.exp(-kick_t*30))/SR)*np.exp(-kick_t*9)
    hat_t = tarr(0.06)
    hat = hp(rng.standard_normal(len(hat_t)), 7000)*np.exp(-hat_t*70)
    for b in range(int(dur/beat) + 1):
        bs = b*beat
        if b % 2 == 0:
            add(kick, bs, 0.55)
        if b % 4 == 2:
            add(lp(rng.standard_normal(4000), 2500)*np.exp(-np.arange(4000)/SR*30), bs, 0.25)  # soft snare
        add(hat, bs + beat/2, 0.12)
    return lp(music, 4200)


def gain_curve(dur: float, base: float, segments: Sequence[tuple[float, float, float]] = (),
               smooth: int = 2000) -> np.ndarray:
    """Per-sample music gain: `base`, overridden by (start_s, end_s, gain) segments, then smoothed
    so ducks and drops don't click."""
    gain = np.ones(int(SR*dur))*base
    for a, b, g in segments:
        gain[int(a*SR):int(b*SR)] = g
    return np.convolve(gain, np.ones(smooth)/smooth, mode="same")
