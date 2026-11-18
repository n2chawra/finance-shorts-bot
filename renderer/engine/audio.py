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

    def master(self, fade_out: float = 0.6, peak: float = 0.89, loudest: float = -16.0) -> np.ndarray:
        """Fade the tail, soft-clip and normalise. peak 0.89 ≈ −1 dB. A dense mix (dialogue from start
        to end, the skits since 2026-10-21) came out at a mean above −15 dB with the fixed drive, so
        the soft clip backs off until the mean is no louder than `loudest`."""
        st = np.stack([self.left, self.right], 1)
        k = int(fade_out*SR)
        st[-k:] *= np.linspace(1, 0, k)[:, None]
        for drive in (1.1, 0.8, 0.6, 0.45, 0.3):
            out = np.tanh(st*drive)
            out = out/np.max(np.abs(out))*peak
            if 20*np.log10(np.sqrt(np.mean(out**2)) or 1e-9) <= loudest:
                break
        return out

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


# ---------------- loudness (ITU-R BS.1770-4) ----------------

# ---------------- map sounds (the geography channel's own effects, 2026-11-18) ----------------

def sfx_scribble(rng: np.random.Generator, dur: float = 0.7) -> np.ndarray:
    """A pencil drawing a line: band-passed grain with quick stroke-by-stroke swells."""
    t = tarr(dur)
    grain = hp(lp(rng.standard_normal(len(t)), 6500), 1800)
    strokes = 0.55 + 0.45*np.abs(np.sin(2*np.pi*7.5*t + rng.uniform(0, 3)))
    return grain*strokes*np.sin(np.pi*t/dur)**0.6*0.35


def sfx_paper(rng: np.random.Generator, dur: float = 0.5) -> np.ndarray:
    """A map sliding or turning: a soft, dry paper swish."""
    t = tarr(dur)
    n = lp(hp(rng.standard_normal(len(t)), 900), 5000)
    return n*np.sin(np.pi*t/dur)**2*(0.6 + 0.4*np.sin(2*np.pi*13*t))*0.32


def sfx_pin(pitch: float = 1.0) -> np.ndarray:
    """A pin or flag landing on the map: a short wooden tock with a little ring."""
    t = tarr(0.25)
    return (np.sin(2*np.pi*620*pitch*t)*np.exp(-t*38) + 0.3*np.sin(2*np.pi*1860*pitch*t)*np.exp(-t*60))*0.5


def sfx_thud(rng: np.random.Generator) -> np.ndarray:
    """A soft low thud for the turn: a felted drum, no boom tail."""
    t = tarr(0.5)
    body = np.sin(2*np.pi*np.cumsum(70 + 40*np.exp(-t*25))/SR)*np.exp(-t*11)
    return (body + 0.15*lp(rng.standard_normal(len(t)), 800)*np.exp(-t*30))*0.7


def sfx_chime(f0: float = 1046.5) -> np.ndarray:
    """A small reveal chime: two mallet notes a fifth apart."""
    t = tarr(1.0)
    a = np.sin(2*np.pi*f0*t)*np.exp(-t*5) + 0.25*np.sin(2*np.pi*f0*3.99*t)*np.exp(-t*20)
    b = np.zeros_like(t)
    k = int(0.09*SR)
    b[k:] = (np.sin(2*np.pi*f0*1.5*t)*np.exp(-t*5))[:len(t) - k]
    return (a + 0.8*b)*0.3


# ---------------- machine sounds (the tech channel's own effects, 2026-11-18) ----------------

def sfx_swell(rng: np.random.Generator, dur: float = 1.4) -> np.ndarray:
    """A sub swell for a scale reveal: a low tone gliding up an octave under rising air, peaking at the
    end (place it so it lands on the reveal) and gone in a tenth of a second."""
    t = tarr(dur)
    rise = (t/dur)**2
    tone = np.sin(2*np.pi*np.cumsum(45 + 45*rise)/SR)
    n = rng.standard_normal(len(t))
    air = (lp(n, 300)*(1 - rise) + lp(n, 1800)*rise)*0.25      # the air opens up as it rises
    return (tone + air)*rise*np.clip((dur - t)/0.1, 0, 1)*0.75


def sfx_glass(f0: float = 1244.5) -> np.ndarray:
    """A glass tone for a figure landing: a struck glass's inharmonic partials, a slow shimmer, a long fade."""
    t = tarr(1.6)
    s = sum(a*np.sin(2*np.pi*f0*r*t)*np.exp(-t*d) for r, a, d in ((1.0, 1.0, 2.6), (2.32, 0.4, 4.5), (4.25, 0.18, 9.0)))
    return s*(1 + 0.12*np.sin(2*np.pi*5.5*t))*np.minimum(1, t/0.003)*0.3


def _k_weight(x: np.ndarray, sr: int) -> np.ndarray:
    """The K-weighting pre-filter (a high shelf, then a high pass) for any sample rate, by the
    analogue-prototype formulas libebur128 uses, so 44.1 kHz needs no resampling."""
    k = np.tan(np.pi*1681.974450955533/sr)
    q = 0.7071752369554196
    vh = 10**(3.999843853973347/20)
    vb = vh**0.4996667741545416
    a0 = 1 + k/q + k*k
    b1 = [(vh + vb*k/q + k*k)/a0, 2*(k*k - vh)/a0, (vh - vb*k/q + k*k)/a0]
    a1 = [1.0, 2*(k*k - 1)/a0, (1 - k/q + k*k)/a0]
    k = np.tan(np.pi*38.13547087602444/sr)
    q = 0.5003270373238773
    a0 = 1 + k/q + k*k
    a2 = [1.0, 2*(k*k - 1)/a0, (1 - k/q + k*k)/a0]
    return lfilter([1.0, -2.0, 1.0], a2, lfilter(b1, a1, x, axis=0), axis=0)


def integrated_lufs(st: np.ndarray, sr: int = SR) -> float:
    """Integrated loudness of a mono (n,) or stereo (n, 2) signal in LUFS: K-weighted, 400 ms blocks
    with 75% overlap, gated at -70 LUFS and then 10 LU under the ungated mean (BS.1770-4). YouTube
    plays Shorts back against about -14 LUFS and turns louder audio down, never quieter audio up."""
    x = np.asarray(st, dtype=float)
    x = x[:, None] if x.ndim == 1 else x
    y = _k_weight(x, sr)
    n, hop = int(0.4*sr), int(0.1*sr)
    if len(y) < n:
        return -70.0
    c = np.concatenate([np.zeros((1, y.shape[1])), np.cumsum(y**2, axis=0)])
    starts = np.arange(0, len(y) - n + 1, hop)
    z = ((c[starts + n] - c[starts])/n).sum(axis=1)      # channel weights are 1 for left and right
    lk = -0.691 + 10*np.log10(z + 1e-20)
    z = z[lk > -70]
    if not len(z):
        return -70.0
    rel = -0.691 + 10*np.log10(z.mean()) - 10
    z = z[-0.691 + 10*np.log10(z) > rel]
    return round(float(-0.691 + 10*np.log10(z.mean())), 1)
