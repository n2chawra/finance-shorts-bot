"""A jointed character who can act.

`characters.person()` is a capsule: it stands, bobs and pulls a face, which is all four Shorts
templates ever needed. A character-led long video needs someone who can *do* things — walk across
the stage, point at a number, carry a bag, slump when the money is gone. So this adds arms, legs, a
walk cycle, facing and a prop hand.

Two pieces make it usable from a scene rather than just drawable:

* `reach()` — two-bone inverse kinematics, so a scene says *where the hand goes* (on the coin
  stack, on the chart's last point) and the elbow works itself out.
* `gait_for()` — the walk cycle is driven by distance travelled, not by the clock, so the feet
  plant on the ground instead of skating along it. That one detail is most of what separates a
  character walking from a sprite sliding.

Same contract as the rest of the engine: a pure function of (position, t), no state, so a frame is
still reproducible from (script, seed, t). `person()` is deliberately left alone.
"""
import math

from .canvas import RGB, Canvas
from .characters import Look
from .easing import clamp

# Proportions at s = 1. Feet on the ground line, total height 380 px.
THIGH, SHIN = 54.0, 50.0
BODY_H, BODY_W = 150.0, 150.0
HEAD_R = 68.0
UPPER_ARM, FOREARM = 62.0, 56.0
STRIDE = 190.0          # ground covered by one full walk cycle at s = 1
WALK_RATE = 1.1         # cycles per second when walking on the spot

POSES = ("stand", "walk", "point", "carry", "cheer", "slump", "think")
MOODS = ("happy", "sad", "wow", "neutral", "worried", "proud")


def gait_for(distance: float, s: float = 1.0) -> float:
    """Walk-cycle phase for having travelled `distance` px. Pass as `gait` so feet don't skate."""
    return distance/(STRIDE*s)


def height(s: float = 1.0) -> float:
    return (THIGH + SHIN + BODY_H)*s + HEAD_R*1.72*s


def head_top(ground: float, s: float) -> float:
    """Top of the head, for placing a label or a bubble clear of the actor."""
    return ground - height(s)


# ---------------- the rig ----------------

def _seg(c: Canvas, pts: list[tuple[float, float]], w: float, col: RGB) -> None:
    """A limb: a thick line with discs at the joints, so a bend never shows a notch."""
    c.d.line(pts, fill=col, width=max(2, int(w)), joint="curve")
    r = w/2
    for x, y in pts:
        c.d.ellipse([x - r, y - r, x + r, y + r], fill=col)


def _chain(x: float, y: float, a1: float, l1: float, a2: float, l2: float
           ) -> list[tuple[float, float]]:
    """Two-bone forward kinematics. Angles are absolute, in screen space (π/2 points down)."""
    jx, jy = x + math.cos(a1)*l1, y + math.sin(a1)*l1
    return [(x, y), (jx, jy), (jx + math.cos(a2)*l2, jy + math.sin(a2)*l2)]


def reach(ox: float, oy: float, l1: float, l2: float, elbow: int = 1) -> tuple[float, float]:
    """Two-bone IK: angles that put the hand at offset (ox, oy) from the shoulder.

    `elbow` picks which of the two solutions to use (which way the joint folds). Out-of-range
    targets are pulled in to arm's length rather than failing, so a scene can aim anywhere.
    """
    d0 = math.hypot(ox, oy)
    if d0 < 1e-6:
        return math.pi/2, -math.pi/2
    d = min(max(d0, abs(l1 - l2)*1.001), (l1 + l2)*0.999)
    if d != d0:                        # out of range: reach as far as the arm goes, same direction
        ox, oy = ox*d/d0, oy*d/d0
    base = math.atan2(oy, ox)
    cos_b = clamp((d*d + l1*l1 - l2*l2)/(2*d*l1), -1.0, 1.0)
    a1 = base - math.acos(cos_b)*elbow
    ex, ey = math.cos(a1)*l1, math.sin(a1)*l1
    return a1, math.atan2(oy - ey, ox - ex)


def _arm(pose: str, t: float, phase: float, gait: float, lead: int, s: float
         ) -> tuple[float, float]:
    """(upper arm, forearm) absolute angles, in the facing-right frame. lead 0 = acting arm."""
    l1, l2 = UPPER_ARM*s, FOREARM*s
    if pose == "walk":
        up = math.pi/2 - 0.5*math.sin(gait*math.tau + lead*math.pi)
        return up, up + 0.35
    if pose == "cheer":
        # Out and up, not straight up: the head sits on the shoulders, so a vertical arm would
        # disappear behind it. Clearing the head sideways is what makes the cheer read.
        k = 1 if lead == 0 else -1
        return reach(k*(88 + math.sin(t*5 + lead)*7)*s, -74*s, l1, l2, -k)
    if pose == "point" and lead == 0:
        return reach(118*s, -34*s + math.sin(t*1.7)*3*s, l1, l2, -1)
    if pose == "carry":
        return reach(92*s, 14*s + math.sin(t*1.5 + lead)*3*s, l1, l2, -1)
    if pose == "think" and lead == 0:
        return reach(-30*s, -26*s, l1, l2, 1)             # knuckles under the chin
    if pose == "slump":
        return math.pi/2 + 0.08, math.pi/2 + 0.25
    idle = math.sin(t*1.3 + phase + lead)*0.05            # never perfectly still
    return math.pi/2 - 0.22 + idle, math.pi/2 - 0.10 + idle


def _leg(pose: str, gait: float, lead: int) -> tuple[float, float]:
    """(thigh, shin) absolute angles for one leg."""
    if pose == "walk":
        p = gait + lead*0.5
        th = math.pi/2 + 0.55*math.sin(p*math.tau)
        return th, th + 0.70*max(0.0, math.sin(p*math.tau + 1.3))
    # Minus, not plus: a positive angle leans *left*, so +k on the right hip would cross the legs.
    k = 1 if lead else -1
    if pose == "slump":
        return math.pi/2 - 0.12*k, math.pi/2 - 0.06*k
    if pose == "cheer":
        return math.pi/2 - 0.27*k, math.pi/2 - 0.27*k
    return math.pi/2 - 0.13*k, math.pi/2 - 0.09*k


def _mirror(angles: tuple[float, float], facing: int) -> tuple[float, float]:
    a1, a2 = angles
    return (math.pi - a1, math.pi - a2) if facing < 0 else (a1, a2)


def _shoulder(x: float, ground: float, s: float, lean: float, pose: str, t: float, facing: int,
              lead: int) -> tuple[float, float, float]:
    """(shoulder x, shoulder y, torso top) — one place that knows where the arms hang from."""
    hop = -abs(math.sin((t*WALK_RATE)*math.pi))*7*s if pose == "walk" else 0.0
    hip_y = ground - (THIGH + SHIN)*s + hop
    top = hip_y - BODY_H*s + math.sin(t*1.6)*2.0*s + (14*s if pose == "slump" else 0.0)
    tilt = lean + (0.10 if pose == "slump" else 0.0)
    off = BODY_W*(0.40 if lead == 0 else -0.22)*s*facing
    return x + off + tilt*BODY_H*s, top + 30*s, top


def hand(x: float, ground: float, s: float, pose: str = "stand", t: float = 0.0, facing: int = 1,
         phase: float = 0.0, lean: float = 0.0, gait: float | None = None) -> tuple[float, float]:
    """Where the acting hand is, so a scene can aim a prop or an arrow at it."""
    g = t*WALK_RATE + phase if gait is None else gait
    sx, sy, _ = _shoulder(x, ground, s, lean, pose, t, facing, 0)
    a1, a2 = _mirror(_arm(pose, t, phase, g, 0, s), facing)
    return _chain(sx, sy, a1, UPPER_ARM*s, a2, FOREARM*s)[2]


def _face(c: Canvas, cx: float, cy: float, s: float, r: float, mood: str, t: float, a: float,
          facing: int) -> None:
    ink = c.mix((30, 30, 40), a)
    m = c.mix((120, 50, 50), a)
    lw = max(2, int(5*s))
    gaze = 7*s*facing
    blink = (t*1.3 + cx*0.001) % 3.1 < 0.12
    for ex in (-25*s + gaze, 25*s + gaze):
        if blink:
            c.d.line([cx + ex - 9*s, cy + 10*s, cx + ex + 9*s, cy + 10*s], fill=ink, width=lw)
        elif mood == "wow":
            c.d.ellipse([cx + ex - 12*s, cy - 2*s, cx + ex + 12*s, cy + 22*s], fill=ink)
        elif mood == "worried":
            c.d.ellipse([cx + ex - 8*s, cy + 2*s, cx + ex + 8*s, cy + 18*s], fill=ink)
            c.d.line([cx + ex - 13*s, cy - 15*s, cx + ex + 9*s, cy - 5*s], fill=ink, width=lw)
        elif mood == "proud":
            c.d.arc([cx + ex - 11*s, cy - 2*s, cx + ex + 11*s, cy + 22*s], 185, 355, fill=ink,
                    width=lw + 1)                                   # eyes creased with the smile
            c.d.line([cx + ex - 12*s, cy - 17*s, cx + ex + 12*s, cy - 21*s], fill=ink, width=lw)
        else:
            c.d.ellipse([cx + ex - 9*s, cy + 1*s, cx + ex + 9*s, cy + 19*s], fill=ink)
    if mood == "proud":
        c.d.arc([cx - 30*s, cy + 12*s, cx + 30*s, cy + 56*s], 15, 165, fill=m, width=lw + 2)
    elif mood == "happy":
        c.d.arc([cx - 26*s, cy + 14*s, cx + 26*s, cy + 50*s], 20, 160, fill=m, width=lw + 1)
    elif mood == "sad":
        c.d.arc([cx - 24*s, cy + 36*s, cx + 24*s, cy + 64*s], 200, 340, fill=m, width=lw + 1)
        c.d.ellipse([cx + 30*s, cy + 18*s, cx + 42*s, cy + 36*s], fill=c.mix((120, 190, 255), a))
    elif mood == "wow":
        c.d.ellipse([cx - 14*s, cy + 30*s, cx + 14*s, cy + 58*s], fill=m)
    elif mood == "worried":
        c.d.arc([cx - 20*s, cy + 34*s, cx + 20*s, cy + 56*s], 205, 335, fill=m, width=lw)
    else:
        c.d.line([cx - 19*s, cy + 40*s, cx + 19*s, cy + 40*s], fill=m, width=lw)


def actor(c: Canvas, x: float, ground: float, s: float, color: RGB, a: float = 1.0, t: float = 0.0,
          pose: str = "stand", mood: str = "happy", facing: int = 1, phase: float = 0.0,
          look: Look = Look(), lean: float = 0.0, holding=None, tag: str | None = None,
          gait: float | None = None) -> None:
    """A jointed character with feet at (x, ground); s = 1 is 380 px tall.

    `pose` drives the limbs and `mood` the face, independently — so the actor can walk away worried
    or point at a number proudly. `gait` overrides the walk phase: pass `gait_for(distance_moved)`
    and the feet keep up with the ground. `holding` is called as holding(c, hand_x, hand_y, s, a).

    Draw order is back-to-front: far leg, near leg, far arm, torso, head, near arm. The near arm
    goes on last so a raised one reads over the head instead of disappearing behind it.
    """
    if a <= 0.01:
        return
    g = t*WALK_RATE + phase if gait is None else gait
    hop = -abs(math.sin((t*WALK_RATE)*math.pi))*7*s if pose == "walk" else 0.0
    hip_y = ground - (THIGH + SHIN)*s + hop
    _, _, body_top = _shoulder(x, ground, s, lean, pose, t, facing, 0)
    tilt = lean + (0.10 if pose == "slump" else 0.0)
    bw, bh = BODY_W*s/2, BODY_H*s
    col = c.mix(color, a)
    dark = c.mix(tuple(int(v*0.55) for v in color), a)
    limb = c.mix(tuple(int(v*0.78) for v in color), a)

    for lead in (1, 0):                       # far side first, so the near limb overlaps it
        a1, a2 = _mirror(_leg(pose, g, lead), facing)
        pts = _chain(x + (18 if lead else -18)*s*facing, hip_y, a1, THIGH*s, a2, SHIN*s)
        _seg(c, pts, 26*s, dark if lead else limb)
        fx, fy = pts[2]
        c.d.ellipse([fx - 22*s, fy - 9*s, fx + 22*s, fy + 11*s], fill=dark)

    sx, sy, _ = _shoulder(x, ground, s, lean, pose, t, facing, 1)
    a1, a2 = _mirror(_arm(pose, t, phase, g, 1, s), facing)
    _seg(c, _chain(sx, sy, a1, UPPER_ARM*s, a2, FOREARM*s), 21*s, dark)

    c.d.polygon([(x - bw + tilt*bh, body_top), (x + bw + tilt*bh, body_top),
                 (x + bw*0.86, hip_y), (x - bw*0.86, hip_y)], fill=col)
    c.d.rounded_rectangle([x - bw + tilt*bh, body_top - 6*s, x + bw + tilt*bh, body_top + 42*s],
                          radius=26*s, fill=col)

    r = HEAD_R*s
    hcx = x + tilt*(bh + r*1.4) + (10*s*facing if pose == "slump" else 0.0)
    hcy = body_top - r*0.72
    if look.hair == "bun":
        c.d.ellipse([hcx - 30*s, hcy - r - 36*s, hcx + 30*s, hcy - r + 16*s], fill=dark)
    c.d.ellipse([hcx - r, hcy - r, hcx + r, hcy + r], fill=c.mix(look.skin, a))
    if look.hair == "flat":
        c.d.rounded_rectangle([hcx - r, hcy - r*1.08, hcx + r, hcy - r*0.3], radius=22*s, fill=dark)
    else:
        c.d.chord([hcx - r, hcy - r, hcx + r, hcy + r*0.6], 180, 360, fill=dark)
    _face(c, hcx, hcy, s, r, mood, t, a, facing)

    sx, sy, _ = _shoulder(x, ground, s, lean, pose, t, facing, 0)
    a1, a2 = _mirror(_arm(pose, t, phase, g, 0, s), facing)
    near = _chain(sx, sy, a1, UPPER_ARM*s, a2, FOREARM*s)
    _seg(c, near, 23*s, limb)

    if holding is not None:
        holding(c, near[2][0], near[2][1], s, a)
    if tag:
        c.pill(x, ground + 56*s, tag, 42*s, c.pal.bg, color, a, pad=22*s)
