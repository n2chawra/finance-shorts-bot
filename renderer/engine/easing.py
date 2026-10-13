"""Timing helpers. Everything takes plain floats and has no state."""
import math
from collections.abc import Iterable


def clamp(x: float, a: float = 0.0, b: float = 1.0) -> float:
    return max(a, min(b, x))


def ease(t: float) -> float:
    """Cubic ease-in-out, 0 → 1."""
    t = clamp(t)
    return 4*t*t*t if t < .5 else 1 - (-2*t + 2)**3/2


def back(t: float) -> float:
    """Ease-out with a small overshoot past 1 (pop-in)."""
    t = clamp(t)
    c1 = 1.70158
    c3 = c1 + 1
    return 1 + c3*(t-1)**3 + c1*(t-1)**2


def ramp(t: float, start: float, dur: float = 0.3) -> float:
    """Linear 0 → 1 starting at `start` and lasting `dur` seconds."""
    return clamp((t - start)/dur)


def env_since(t: float, times: Iterable[float], k: float) -> float:
    """Sum of exponential decays (rate k) since each event time already passed."""
    return sum(math.exp(-(t - ti)*k) for ti in times if t >= ti)
