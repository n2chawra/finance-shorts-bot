"""Motion vocabulary: how things move, as pure functions of time.

`easing.py` holds the four curves the Shorts were built on. This adds the rest of the animator's
toolkit — overshoot, anticipation, bounce, arcs, stagger, squash, and the small idle motions that
keep a frame from ever being completely still.

Everything here is a pure function of floats, so a frame is still reproducible from (script, seed, t).
"""
import math

from .easing import clamp, ease

TAU = math.pi*2

# Material Design's published easing curves. The rule that matters: things entering the frame
# decelerate, things leaving accelerate. Never use the same curve both ways.
ENTER = (0.0, 0.0, 0.0, 1.0)            # decelerate: arrives and brakes
EXIT = (0.3, 0.0, 1.0, 1.0)             # accelerate: leaves and is gone
STANDARD = (0.2, 0.0, 0.0, 1.0)         # starts and ends on screen
EMPHASIZED = (0.05, 0.7, 0.1, 1.0)      # expressive: 40% of the way in the first 17% of the time


def bezier(t: float, curve: tuple[float, float, float, float] = STANDARD) -> float:
    """A cubic-Bézier easing curve, solved for y given x = t.

    Newton first, then bisection. The fallback is not optional: ENTER is (0, 0, 0, 1), so x = u³
    and dx/du vanishes at the start — an unguarded Newton step from there lands far outside [0, 1]
    and the curve comes back non-monotonic, which on screen is text that flashes to full opacity
    and then dips. Bisection always brackets, because x(u) is increasing for any sane curve.
    """
    x1, y1, x2, y2 = curve
    t = clamp(t)
    if t in (0.0, 1.0):
        return t

    def bez(u: float, a: float, b: float) -> float:
        v = 1 - u
        return 3*v*v*u*a + 3*v*u*u*b + u*u*u

    u, lo, hi = t, 0.0, 1.0
    for _ in range(8):
        x = bez(u, x1, x2) - t
        if abs(x) < 1e-6:
            return bez(u, y1, y2)
        if x > 0:
            hi = u
        else:
            lo = u
        d = 3*(1 - u)**2*x1 + 6*(1 - u)*u*(x2 - x1) + 3*u*u*(1 - x2)
        step = u - x/d if abs(d) > 1e-7 else (lo + hi)/2
        u = step if lo < step < hi else (lo + hi)/2
    return bez(u, y1, y2)


# ---------------- settling ----------------

def spring(t: float, zeta: float = 0.7) -> float:
    """0 → 1 settling like a damped spring. `zeta` is the damping ratio and sets the overshoot:
    0.85 ≈ 1% (rigid), 0.7 ≈ 5% (crisp, the default for adult-facing work), 0.5 ≈ 16% (playful),
    0.4 ≈ 25% (cartoon). Tuned so it has settled by t = 1."""
    if t <= 0:
        return 0.0
    if t >= 1:
        return 1.0
    wn = 4.6/zeta                      # settle to 1% by t = 1
    wd = wn*math.sqrt(1 - zeta*zeta)
    return 1 - math.exp(-zeta*wn*t)*(math.cos(wd*t) + (zeta*wn/wd)*math.sin(wd*t))


def bounce(t: float) -> float:
    """0 → 1 landing hard, then two smaller bounces (the standard ease-out-bounce)."""
    t = clamp(t)
    n, d = 7.5625, 2.75
    if t < 1/d:
        return n*t*t
    if t < 2/d:
        t -= 1.5/d
        return n*t*t + 0.75
    if t < 2.5/d:
        t -= 2.25/d
        return n*t*t + 0.9375
    t -= 2.625/d
    return n*t*t + 0.984375


def anticipate(t: float, amount: float = 0.18) -> float:
    """0 → 1, but pulls *back* first. The tell that something is alive rather than switched on."""
    t = clamp(t)
    if t < 0.3:
        return -amount*math.sin(t/0.3*math.pi)
    return ease((t - 0.3)/0.7)


def overshoot(t: float, amount: float = 1.9) -> float:
    """Ease-out that sails past 1 and comes back. Stronger than easing.back."""
    t = clamp(t)
    return 1 + (amount + 1)*(t - 1)**3 + amount*(t - 1)**2


# ---------------- travel ----------------

def arc(t: float, x0: float, y0: float, x1: float, y1: float, lift: float = 140.0,
        curve=ease) -> tuple[float, float]:
    """Move along a curve, not a straight line. `lift` is how high the path bows (negative = sags)."""
    p = curve(clamp(t))
    return x0 + (x1 - x0)*p, y0 + (y1 - y0)*p - lift*math.sin(math.pi*p)


def drop(t: float, top: float, floor: float, seconds: float = 0.8, squash_at_landing: bool = True
         ) -> tuple[float, float]:
    """Gravity fall from `top` to `floor`. Returns (y, squash) where squash is 0 except on impact."""
    p = clamp(t/seconds)
    y = top + (floor - top)*bounce(p)
    s = 0.0
    if squash_at_landing and 0 <= t - seconds*0.62 < 0.22:
        s = math.sin((t - seconds*0.62)/0.22*math.pi)*0.3
    return y, s


def stagger(i: int, t: float, start: float = 0.0, gap: float = 0.12, dur: float = 0.5) -> float:
    """Progress 0 → 1 for item `i` in a staggered group. Entrances should never be simultaneous."""
    return clamp((t - start - i*gap)/dur)


# ---------------- deformation ----------------

def squash(amount: float) -> tuple[float, float]:
    """(x scale, y scale) preserving volume. Positive squashes flat, negative stretches tall."""
    return 1 + amount, 1/(1 + amount) if amount > -0.9 else 1.0


# ---------------- idle life ----------------

def breathe(t: float, rate: float = 1.1, amount: float = 1.0) -> float:
    """Slow rise and fall, −amount … +amount. Nothing in frame should ever be perfectly still."""
    return math.sin(t*rate*TAU/4)*amount


def sway(t: float, rate: float = 0.7, amount: float = 1.0, phase: float = 0.0) -> float:
    """Lazy side-to-side drift. Use a different `phase` per object so they don't move in lockstep."""
    return math.sin(t*rate + phase)*amount


def pulse(t: float, rate: float = 2.0, amount: float = 0.08) -> float:
    """Scale multiplier that throbs around 1.0 — for anything that wants attention."""
    return 1 + math.sin(t*rate*TAU)*amount


def jitter(t: float, rate: float = 40.0, amount: float = 1.5) -> float:
    """Fast nervous shake, for a needle moving or a number still counting."""
    return math.sin(t*rate)*amount


def loop(t: float, period: float, offset: float = 0.0) -> float:
    """Phase 0 → 1, repeating. The basis of every falling-coin and conveyor effect."""
    return ((t/period) + offset) % 1.0
