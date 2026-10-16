"""Landscape scenes for long-form explainers (1920×1080).

These are **actions**, not layouts. Each scene puts the actor on a stage and something happens over
its whole length: coins fall out of a pocket, a stack grows past the actor's head, a plant sprouts,
a chart is built in front of the viewer. That last one matters — the edX study of 6.9 M viewing
sessions found hand-constructed visuals beat finished slides, and that is the whole difference
between this and the block library it replaced.

Four rules the scenes follow:

1. **Nothing is ever frozen.** Every scene has continuous motion — idle breathing, drifting clouds,
   a counter ticking, a coin falling. A still frame reads as the video having ended.
2. **Text arrives, then holds perfectly still.** Text cannot be read while it moves, so headlines
   settle within ~0.35 s and then never move again. Motion belongs to the objects.
3. **The actor is big.** Roughly half the frame height. A character small enough to be a diagram
   label is not a character.
4. **Something survives each cut.** The stage persists across scenes, so the video reads as one
   continuous world rather than a deck of cards.
"""
import math
import random
from collections.abc import Sequence

from .canvas import RGB, Canvas, font
from .easing import clamp, ease, ramp
from .motion import EMPHASIZED, ENTER, arc, bezier, breathe, loop, pulse, spring, stagger, sway
from .props import coin

GROUND = 930.0          # the line the actor stands on
HEAD_Y = 150.0          # headline baseline
SUB_Y = 232.0
FLOOR_TEXT = 1000.0     # labels on the floor strip, clear of the bottom safe margin
CONTENT_W = 1560.0
ACTOR_S = 1.35          # ≈ 515 px tall: about half the frame
SKY = (300.0, 560.0)    # band the clouds drift through, clear of the headline


# ---------------- text that behaves ----------------

def wrap(s: str, size: float, weight: str, max_w: float) -> list[str]:
    f = font(size, weight)
    out: list[str] = []
    line = ""
    for word in s.split():
        trial = f"{line} {word}".strip()
        if f.getlength(trial) <= max_w or not line:
            line = trial
        else:
            out.append(line)
            line = word
    if line:
        out.append(line)
    return out


def fit_lines(s: str, size: float, weight: str, max_w: float, max_lines: int,
              min_size: float) -> tuple[float, list[str]]:
    while size > min_size:
        lines = wrap(s, size, weight, max_w)
        if len(lines) <= max_lines:
            return size, lines
        size -= 2
    return size, wrap(s, size, weight, max_w)


def still_text(c: Canvas, s: str, cx: float, cy: float, size: float, color: RGB, t: float,
               t0: float = 0.0, weight: str = "Bold", max_w: float | None = None,
               max_lines: int = 2, anchor: str = "mm", A: float = 1.0) -> None:
    """Text that eases in over ~0.35 s and is then perfectly still — it never drifts, because
    moving text cannot be read. Motion is the objects' job, not the type's."""
    p = bezier(ramp(t, t0, 0.35), ENTER)
    if p <= 0.01:
        return
    size, lines = fit_lines(s, size, weight, max_w or CONTENT_W, max_lines, c.frame.min_text)
    step = size*1.2
    y = cy - step*(len(lines) - 1)/2
    for i, line in enumerate(lines):
        c.text(line, cx, y + i*step, size, color, p*A, weight, anchor=anchor)


def headline(c: Canvas, s: str, t: float, A: float = 1.0, sub: str | None = None,
             t0: float = 0.0, color: RGB | None = None) -> None:
    """The scene's one line, at the top, still from 0.35 s onward."""
    still_text(c, s, c.w/2, HEAD_Y, 70, color or c.pal.text, t, t0, "Bold", CONTENT_W + 140, 1, A=A)
    if sub:
        still_text(c, sub, c.w/2, SUB_Y, 42, c.pal.muted, t, t0 + 0.25, "Regular", CONTENT_W, 1, A=A)


def label_under(c: Canvas, s: str, x: float, t: float, t0: float = 0.2, A: float = 1.0,
                size: float = 44) -> None:
    """A caption on the floor strip, under whatever it names — a label belongs beside its object."""
    still_text(c, s, x, FLOOR_TEXT, size, c.pal.text, t, t0, "Medium", 620, 1, A=A)


def counter(c: Canvas, value: str, x: float, y: float, A: float = 1.0, size: float = 104,
            color: RGB | None = None, label: str | None = None, t: float = 0.0,
            burst: bool = False) -> None:
    """A figure that is already counting when it appears. The label sits *above* it so the number
    stays clear of whatever it is sitting on, and the burst goes behind, never over the digits."""
    if A <= 0.01:
        return
    if burst:
        shine(c, x, y, size*1.25, t, A*0.8)
    if label:
        c.text(label, x, y - size*0.72, 40, c.pal.muted, A, "Medium", max_w=620)
    c.text(value, x, y, size, color or c.pal.accent, A, "Bold", max_w=700)


# ---------------- the stage ----------------

def backdrop(c: Canvas, t: float, A: float = 1.0, seed: int = 0, hills: bool = True) -> None:
    """Ground, a far skyline and slow clouds. The clouds are what stop a quiet scene going dead;
    they drift at different rates by depth, so the stage has parallax."""
    P = c.pal
    r = random.Random(f"stage:{seed}")
    if hills:
        for d, (hh, shade) in enumerate(((365.0, 0.5), (215.0, 0.8))):
            off = sway(t, 0.045 + d*0.02, 26 - d*10, d*1.7)
            col = c.mix(tuple(int(P.bg[i] + (P.panel[i] - P.bg[i])*shade) for i in range(3)), A)
            pts = [(-120 + off, GROUND)]
            for k in range(7):
                x = -120 + off + k*(c.w + 240)/6
                pts.append((x, GROUND - hh*(0.45 + 0.55*abs(math.sin(k*1.7 + d)))))
            pts += [(c.w + 120 + off, GROUND), (c.w + 120, c.h), (-120, c.h)]
            c.d.polygon(pts, fill=col)
    for i in range(5):
        w = 150 + r.random()*150
        x = (r.random()*c.w + t*(16 + i*6)) % (c.w + 420) - 210
        y = SKY[0] + r.random()*(SKY[1] - SKY[0]) + sway(t, 0.3 + i*0.11, 9, i)
        col = c.mix(P.panel, A*0.55)
        for dx, dy, rr in ((0, 0, w*0.30), (w*0.26, -w*0.08, w*0.23), (-w*0.26, -w*0.04, w*0.20)):
            c.d.ellipse([x + dx - rr, y + dy - rr, x + dx + rr, y + dy + rr], fill=col)
    c.d.rectangle([0, GROUND, c.w, c.h], fill=c.mix(P.panel, A*0.9))
    c.d.line([0, GROUND, c.w, GROUND], fill=c.mix(P.grid, A), width=4)
    grass(c, t, A, seed)


def grass(c: Canvas, t: float, A: float = 1.0, seed: int = 0) -> None:
    """Tufts along the ground line, each swaying on its own phase.

    This is the floor of the liveliness check: wherever the actor pauses and a counter has landed,
    the grass is still moving, so no frame is ever a copy of the one before it.
    """
    r = random.Random(f"grass:{seed}")
    col = c.mix(tuple(int(c.pal.panel[i]*1.5 + c.pal.grid[i]*0.4) for i in range(3)), A*0.9)
    for i in range(20):
        bx = (i + r.random()*0.85)*c.w/20
        ph = r.random()*6.3
        for b in range(4):
            h = 26 + r.random()*44
            lean = sway(t, 0.7 + b*0.17, 17, ph + b*1.3)
            x0 = bx + (b - 1.5)*11
            c.d.line([x0, GROUND + 4, x0 + lean*0.3, GROUND - h*0.6, x0 + lean, GROUND - h],
                     fill=col, width=3, joint="curve")


def sun_arc(c: Canvas, p: float, A: float = 1.0, x: float | None = None) -> None:
    """The sun crossing the sky — time passing as one continuous move, not a date card."""
    ang = math.pi*(1 - clamp(p))
    cx = (c.w/2 if x is None else x) + math.cos(ang)*c.w*0.40
    cy = SKY[0] - 60 - math.sin(ang)*180
    for rr, al in ((70, 0.20), (44, 1.0)):
        c.d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=c.mix(c.pal.accent, A*al))


# ---------------- money as objects ----------------

def falling_coins(c: Canvas, x: float, y0: float, t: float, A: float = 1.0, n: int = 5,
                  period: float = 1.5, spread: float = 70.0, fall: float = 460.0,
                  seed: int = 0, r: float = 30.0) -> None:
    """Coins dropping away and fading — money leaving. A continuous loop, so it is never still.
    Falling out of frame reads as loss far better than a red number does."""
    rng = random.Random(f"fall:{seed}")
    for i in range(n):
        dx = (rng.random() - 0.5)*spread
        p = loop(t, period, i/n)
        coin(c, x + dx + math.sin(p*4 + i)*16, y0 + (p**1.7)*fall, r*(1 - p*0.25), A*(1 - p**2.2))


def wallet(c: Canvas, x: float, y: float, s: float, a: float = 1.0, open_: float = 0.0) -> None:
    """A wallet to leak from, drawn in the actor's hand. `open_` lifts the flap."""
    w, h = 110*s, 76*s
    c.d.rounded_rectangle([x - w/2, y - h/2, x + w/2, y + h/2], radius=14*s,
                          fill=c.mix(c.pal.danger, a))
    flap = h*0.42*(1 - clamp(open_)*1.6)
    c.d.rounded_rectangle([x - w/2, y - h/2, x + w/2, y - h/2 + max(flap, 6*s)], radius=10*s,
                          fill=c.mix(tuple(int(v*0.7) for v in c.pal.danger), a))


def coin_stack(c: Canvas, x: float, base: float, count: float, A: float = 1.0, t: float = 0.0,
               per_col: int = 10, r: float = 34.0) -> float:
    """A stack `count` coins high (fractional — the top one is still falling). Returns its top y.

    Countable objects read as money; a solid bar reads as a chart and needs a label to mean
    anything. The newest coin flashes as it lands, so the eye is drawn to the growth, not the pile.
    """
    whole = int(count)
    top = base
    for i in range(whole + 1):
        col_i, row = divmod(i, per_col)
        cx = x + col_i*(r*2.4)
        cy = base - row*(r*0.74)
        if i == whole:
            frac = count - whole
            if frac <= 0.02:
                break
            cy -= (1 - spring(frac, 0.5))*170
            coin(c, cx, cy + breathe(t*2, 1, 2), r, A)
            c.d.ellipse([cx - r*0.5, cy - r*0.5, cx + r*0.5, cy + r*0.5],
                        fill=c.mix(c.pal.accent, A*(1 - frac)*0.8))
        else:
            coin(c, cx, cy, r, A)
        top = min(top, cy - r)
    return top


def foliage(c: Canvas) -> RGB:
    """The greenest colour this palette has. A tree in salmon reads as a cloud, not a tree."""
    return max(c.pal.cast, key=lambda col: col[1] - (col[0] + col[2])/2)


def plant(c: Canvas, x: float, base: float, grow: float, color: RGB, A: float = 1.0,
          t: float = 0.0) -> float:
    """A sprout growing into a small tree, `grow` 0 → 1. Returns the canopy top.

    Money growing as a living thing reads instantly; a rising bar has to be explained. The trunk
    tapers and leaves open along its whole length, so it never looks like a lollipop on a stick.
    """
    g = ease(clamp(grow))
    if g <= 0.01:
        return base
    h = 430*g
    lean = sway(t, 0.8, 0.05)
    trunk = c.mix(tuple(int(v*0.5) for v in color), A)
    leaf = c.mix(color, A)

    def spine(u: float) -> tuple[float, float]:
        return x + math.sin(lean + u*1.3)*38*u, base - h*u

    prev = (x, base)
    for k in range(1, 13):
        p = spine(k/12*0.72)
        c.d.line([prev, p], fill=trunk, width=max(3, int(30*g*(1 - k/12*0.6))), joint="curve")
        prev = p
    for side, u in ((-1, 0.40), (1, 0.52)):               # two branches out of the trunk
        bx, by = spine(u)
        tipx = bx + side*150*g
        tipy = by - 90*g
        c.d.line([(bx, by), ((bx + tipx)/2, by - 60*g), (tipx, tipy)],
                 fill=trunk, width=max(2, int(13*g)), joint="curve")
        lp = clamp((g - 0.35)/0.4)
        if lp > 0:
            rr = 60*spring(lp, 0.6)
            c.d.ellipse([tipx - rr, tipy - rr*0.72, tipx + rr, tipy + rr*0.72], fill=leaf)

    cx, cy = spine(0.78)                                  # the crown: overlapping blobs, not rungs
    top = cy
    for i, (ox, oy, rr) in enumerate(((0, -42, 118), (-96, 6, 90), (96, 2, 94),
                                      (-44, -74, 80), (52, -78, 84), (0, 44, 86))):
        lp = clamp((g - 0.22 - i*0.055)/0.40)
        if lp <= 0:
            continue
        k = spring(lp, 0.55)
        bx = cx + ox*k + sway(t, 0.9 + i*0.13, 5, i)
        by = cy + oy*k + breathe(t, 0.7 + i*0.09, 4)
        r = rr*k
        c.d.ellipse([bx - r, by - r*0.82, bx + r, by + r*0.82], fill=leaf)
        top = min(top, by - r*0.82)
    return top


def shine(c: Canvas, x: float, y: float, r: float, t: float, A: float = 1.0, n: int = 10) -> None:
    """A burst of rays. Draw it *before* whatever it celebrates, never over the top of it."""
    for i in range(n):
        ang = i*math.tau/n + t*0.5
        p = 0.88 + 0.12*math.sin(t*4 + i)
        c.d.line([x + math.cos(ang)*r*0.78, y + math.sin(ang)*r*0.78,
                  x + math.cos(ang)*r*p*1.22, y + math.sin(ang)*r*p*1.22],
                 fill=c.mix(c.pal.accent, A*0.7), width=6)


def arrow(c: Canvas, x0: float, y0: float, x1: float, y1: float, p: float, color: RGB,
          A: float = 1.0, lift: float = 90.0) -> tuple[float, float]:
    """An arrow drawing itself along an arc — real motion curves, it does not travel in a line."""
    p = clamp(p)
    if p <= 0.01:
        return x0, y0
    pts = [arc(u/18*p, x0, y0, x1, y1, lift) for u in range(19)]
    c.d.line(pts, fill=c.mix(color, A), width=9, joint="curve")
    hx, hy = pts[-1]
    px, py = pts[-2]
    ang = math.atan2(hy - py, hx - px)
    c.d.polygon([(hx, hy),
                 (hx - math.cos(ang - 0.45)*34, hy - math.sin(ang - 0.45)*34),
                 (hx - math.cos(ang + 0.45)*34, hy - math.sin(ang + 0.45)*34)], fill=c.mix(color, A))
    return hx, hy


# ---------------- data, built in front of the viewer ----------------

def built_chart(c: Canvas, series: Sequence[tuple[str, Sequence[float], RGB]], p: float,
                A: float = 1.0, t: float = 0.0, x0: float = 560, x1: float = 1540,
                y0: float = 320, y1: float = 850, ticks: Sequence[float] = ()) -> None:
    """A chart drawn in front of the viewer: the axes sweep out, then each line draws with a
    glowing, pulsing head that carries its own label. Built, never faded in."""
    axis = bezier(clamp(p/0.18), ENTER)
    c.d.line([x0, y1, x0 + (x1 - x0)*axis, y1], fill=c.mix(c.pal.grid, A), width=4)
    c.d.line([x0, y1, x0, y1 - (y1 - y0)*axis], fill=c.mix(c.pal.grid, A), width=4)
    top = max((max(v) for _, v, _ in series if len(v)), default=1.0) or 1.0
    for v in ticks:
        if 0 < v <= top:
            gy = y1 - (y1 - y0)*v/top
            c.d.line([x0, gy, x0 + (x1 - x0)*axis, gy], fill=c.mix(c.pal.grid, A*0.4), width=2)
    draw = clamp((p - 0.18)/0.82)
    for name, vals, col in series:
        n = max(1, len(vals) - 1)
        shown = 1 + n*bezier(draw, EMPHASIZED)
        pts = [(x0 + (x1 - x0)*i/n, y1 - (y1 - y0)*v/top) for i, v in enumerate(vals) if i <= shown]
        if len(pts) < 2:
            continue
        c.d.line(pts, fill=c.mix(col, A*0.25), width=26, joint="curve")
        c.d.line(pts, fill=c.mix(col, A), width=10, joint="curve")
        hx, hy = pts[-1]
        rr = 15*pulse(t, 1.6, 0.18)
        c.d.ellipse([hx - rr, hy - rr, hx + rr, hy + rr], fill=c.mix(col, A))
        c.text(name, hx + 30, hy - 4, 42, col, A*clamp(draw*3), "SemiBold", anchor="lm",
               max_w=max(80.0, c.w - c.frame.side_margin - (hx + 30)))


def tower_x(c: Canvas, i: int, n: int) -> float:
    span = min(1400.0, 620.0*n)
    return c.w/2 - span/2 + span/n/2 + i*span/n


def towers(c: Canvas, items: Sequence[tuple[str, float, str, RGB]], p: float, A: float = 1.0,
           t: float = 0.0, top_y: float = 330.0, fmt=None) -> list[float]:
    """Towers rising from the ground on a shared baseline, each labelled under it and topped with
    its figure. A comparison only works in one frame — across a cut the viewer cannot hold the
    first one in mind.

    `fmt(value, progress)` lets the caller count the figure up as the bar rises, so the number is
    being earned rather than announced. Returns each tower's top y, for anything drawn above it.
    """
    if not items:
        return []
    top = max(v for _, v, _, _ in items) or 1.0
    tops = []
    for i, (name, v, shown, col) in enumerate(items):
        g = bezier(stagger(i, p, 0.0, 0.22, 0.78), EMPHASIZED)
        x = tower_x(c, i, len(items))
        h = (GROUND - top_y)*(v/top)*g
        tops.append(GROUND - h)
        if g <= 0.01:
            continue
        c.d.rounded_rectangle([x - 115, GROUND - max(h, 8), x + 115, GROUND - 4], radius=18,
                              fill=c.mix(col, A))
        c.text(shown if g >= 1 or fmt is None else fmt(v, g), x, GROUND - h - 58, 64, c.pal.text,
               A*clamp(g*2.5), max_w=460)
        label_under(c, name, x, t, 0.15 + i*0.2, A)
    return tops
