"""Stereo mixer and synthesized sound effects. Nothing is loaded from disk.

SFX that use noise take the mixer's `rng`, so one seed fixes the whole soundtrack. The order of
calls matters for determinism: same calls in the same order → same samples.
"""
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, lfilter

SR = 44100


def tarr(sec: float) -> np.ndarray:
    return np.arange(int(sec*SR))/SR


def lp(x: np.ndarray, fc: float, order: int = 2) -> np.ndarray:
    b, a = butter(order, fc/(SR/2), "low")
    return lfilter(b, a, x)


def hp(x: np.ndarray, fc: float, order: int = 2) -> np.ndarray:
    b, a = butter(order, fc/(SR/2), "high")
    return lfilter(b, a, x)


class Mixer:
    """`dur` is the output length in seconds. Templates place sounds in story time (their own
    timeline); `tscale` (the video's tempo) turns story seconds into output seconds."""

    def __init__(self, dur: float, seed: int, tscale: float = 1.0) -> None:
        self.n = int(SR*dur)
        self.left = np.zeros(self.n)
        self.right = np.zeros(self.n)
        self.rng = np.random.default_rng(seed)
        self.tscale = tscale

    def place(self, sig: np.ndarray, at: float, gain: float = 1.0, pan: float = 0.0) -> None:
        """Add a mono signal at story time `at`. pan: −1 left … +1 right."""
        self.place_out(sig, at/self.tscale, gain, pan)

    def place_out(self, sig: np.ndarray, at: float, gain: float = 1.0, pan: float = 0.0) -> None:
        """Add a mono signal at output time `at` (seconds into the finished video)."""
        i = int(at*SR)
        j = min(self.n, i + len(sig))
        if i >= self.n or j <= i:
            return
        s = sig[:j-i]*gain
        self.left[i:j] += s*(1 - max(0, pan))
        self.right[i:j] += s*(1 + min(0, pan))

    def add_bed(self, mono: np.ndarray, gain: np.ndarray | float = 1.0) -> None:
        """Add a full-length mono track (music) with a per-sample or constant gain."""
        self.left += mono*gain
        self.right += mono*gain

    def master(self, fade_out: float = 0.6, peak: float = 0.89) -> np.ndarray:
        """Fade the tail, soft-clip and normalise. peak 0.89 ≈ −1 dB."""
        st = np.stack([self.left, self.right], 1)
        k = int(fade_out*SR)
        st[-k:] *= np.linspace(1, 0, k)[:, None]
        st = np.tanh(st*1.1)
        return st/np.max(np.abs(st))*peak

    def write_wav(self, path: str | Path) -> None:
        st = self.master()
        with wave.open(str(path), "wb") as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes((st*32767).astype(np.int16).tobytes())

    def levels(self) -> tuple[float, float]:
        """(peak dB, mean dB) of the mastered mix; targets are about -1 and -18."""
        st = self.master()
        return float(20*np.log10(np.max(np.abs(st)))), float(20*np.log10(np.sqrt(np.mean(st**2))))


# ---------------- sound effects ----------------

def sfx_pop(pitch: float = 1.0) -> np.ndarray:
    t = tarr(0.12)
    f = 900*pitch*np.exp(-t*25) + 250*pitch
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*30)


def sfx_whoosh(rng: np.random.Generator, dur: float = 0.45) -> np.ndarray:
    t = tarr(dur)
    n = rng.standard_normal(len(t))
    env = np.sin(np.pi*t/dur)**2
    out = np.zeros_like(n)
    seg = len(n)//8
    for k in range(8):  # sweep filter upward
        fc = 300 + 3500*(k/7)**2
        out[k*seg:(k+1)*seg] = lp(n, fc)[k*seg:(k+1)*seg]
    return out*env*0.9


def sfx_clink(pitch: float = 1.0) -> np.ndarray:
    t = tarr(0.35)
    s = sum(a*np.sin(2*np.pi*f*pitch*t) for f, a in ((2350, 1), (3720, .6), (5310, .35)))
    return s*np.exp(-t*18)*0.35


def sfx_ding(f0: float = 1318.5, dur: float = 1.4) -> np.ndarray:
    t = tarr(dur)
    return (np.sin(2*np.pi*f0*t) + .4*np.sin(2*np.pi*f0*2*t) + .2*np.sin(2*np.pi*f0*3.01*t))*np.exp(-t*3.2)*0.45


def sfx_boom(rng: np.random.Generator) -> np.ndarray:
    t = tarr(1.2)
    f = 40 + 110*np.exp(-t*7)
    body = np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*3.5)
    nz = lp(rng.standard_normal(len(t)), 900)*np.exp(-t*9)*0.8
    return np.tanh((body + nz)*1.6)*0.9


def sfx_fail() -> np.ndarray:
    out = []
    for f, d in ((392, .16), (370, .16), (349, .16), (330, .45)):
        t = tarr(d)
        sq = np.sign(np.sin(2*np.pi*f*t*(1 - 0.02*t/d)))
        out.append(lp(sq, 1800)*np.minimum(1, (d - t)*30)*0.28)
    return np.concatenate(out)


def sfx_tick(rng: np.random.Generator) -> np.ndarray:
    t = tarr(0.03)
    return hp(rng.standard_normal(len(t)), 3000)*np.exp(-t*250)*0.5


def sfx_beep(f: float) -> np.ndarray:
    t = tarr(0.22)
    return np.sin(2*np.pi*f*t)*np.minimum(1, (0.22 - t)*40)*np.minimum(1, t*400)*0.4


def sfx_riser(rng: np.random.Generator, dur: float) -> np.ndarray:
    t = tarr(dur)
    f = 200 + 900*(t/dur)**2
    tone = np.sin(2*np.pi*np.cumsum(f)/SR)*0.25
    nz = hp(rng.standard_normal(len(t)), 2000)*0.15
    return (tone + nz)*(t/dur)**1.5


def sfx_kaching() -> np.ndarray:
    return np.concatenate([sfx_clink(1.0)[:3000]*1.5, sfx_ding(1760, 1.2)])
