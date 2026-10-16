"""Landscape building blocks for long-form explainers (1920×1080).

A long video is a list of sections; each section names a block, and the block draws it. Blocks are
pure drawing functions of `(canvas, local time, scene alpha, content)` so a template stays a pure
function of (script, style, t) → frame, exactly like the Shorts templates.

Layout grid: heading at the top, content between y=250 and y=880, a chapter strip along the
bottom. Nothing is drawn below `LONG.h - LONG.bottom_safe`.
"""
from collections.abc import Sequence

from .canvas import LONG, RGB, Canvas, font
from .characters import person
from .easing import back, clamp, ease, ramp
from .formatting import axis_label, nice_axis
from .props import coin, vbar

HEAD_Y = 140          # heading baseline
SUB_Y = 212           # sub-heading under it
TOP = 290             # top of the content area
BOTTOM = 880          # bottom of the content area
FOOT_Y = 980          # chapter strip
BODY = 46             # body text size
CONTENT_W = 1500      # widest a centred block of text should be


def wrap(s: str, size: float, weight: str, max_w: float) -> list[str]:
    """Greedy word wrap at `size`."""
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
    """The largest size up to `size` at which `s` wraps into at most `max_lines` lines."""
    while size > min_size:
        lines = wrap(s, size, weight, max_w)
        if len(lines) <= max_lines:
            return size, lines
        size -= 2
    return size, wrap(s, size, weight, max_w)


def paragraph(c: Canvas, s: str, cx: float, cy: float, size: float, color: RGB, a: float,
              max_w: float, weight: str = "Medium", max_lines: int = 2, anchor: str = "mm",
              leading: float = 1.22) -> float:
    """Text wrapped over up to `max_lines` lines, centred on `cy`. Returns the height used."""
    size, lines = fit_lines(s, size, weight, max_w, max_lines, c.frame.min_text)
    step = size*leading
    y = cy - step*(len(lines) - 1)/2
    for i, line in enumerate(lines):
        c.text(line, cx, y + i*step, size, color, a, weight, anchor=anchor)
    return step*len(lines)


def heading(c: Canvas, s: str, t: float, A: float, sub: str | None = None, color: RGB | None = None) -> None:
    """Section heading, with an optional line under it. Always the first thing a block draws.
    `rule()` is only for headings without a sub-heading: the two share the same strip."""
    a = ramp(t, 0.05, 0.25)*A
    k = back(ramp(t, 0.05, 0.4))
    c.text(s, c.w/2, HEAD_Y, 72*(0.75 + 0.25*k), color or c.pal.text, a, max_w=CONTENT_W + 200)
    if sub:
        c.text(sub, c.w/2, SUB_Y, BODY, c.pal.muted, ramp(t, 0.35, 0.25)*A, "Regular", max_w=CONTENT_W)


def rule(c: Canvas, y: float, t: float, A: float, t0: float = 0.3, w: float = 420) -> None:
    """Short accent underline that draws itself in."""
    k = ease(ramp(t, t0, 0.5))*A
    if k > 0.01:
        c.d.rounded_rectangle([c.w/2 - w*k/2, y - 4, c.w/2 + w*k/2, y + 4], radius=4, fill=c.mix(c.pal.accent, A))


def bullets(c: Canvas, items: Sequence[str], t: float, A: float, t0: float = 0.6, gap: float = 0.9,
            y0: float | None = None, size: float = 54, max_lines: int = 2) -> None:
    """Points revealed one at a time, each with a coloured dot. Items that wrap are given the room
    they need and the whole block is centred, so a long point can never crowd the next one."""
    if not items:
        return
    width = CONTENT_W - 90
    blocks = [fit_lines(s, size, "SemiBold", width, max_lines, c.frame.min_text) for s in items]
    heights = [sz*1.22*len(ls) + 56 for sz, ls in blocks]
    y = (TOP + BOTTOM)/2 - sum(heights)/2 if y0 is None else y0
    x = c.w/2 - CONTENT_W/2
    for i, ((sz, lines), h) in enumerate(zip(blocks, heights)):
        a = ramp(t, t0 + i*gap, 0.3)*A
        cy = y + h/2
        y += h
        if a <= 0.01:
            continue
        slide = (1 - back(ramp(t, t0 + i*gap, 0.45)))*40
        c.d.ellipse([x - slide, cy - 14, x + 28 - slide, cy + 14], fill=c.mix(c.pal.cast[i % 3], a))
        top = cy - sz*1.22*(len(lines) - 1)/2
        for j, line in enumerate(lines):
            c.text(line, x + 56 - slide, top + j*sz*1.22, sz, c.pal.text, a, "SemiBold", anchor="lm")


def big_number(c: Canvas, value: str, label: str, t: float, A: float, t0: float = 0.3,
               color: RGB | None = None, note: str | None = None) -> None:
    """One computed figure, as large as it will go, with its label under it."""
    k = back(ramp(t, t0, 0.45))
    a = ramp(t, t0, 0.15)*A
    c.text(value, c.w/2, 520, 200*(0.55 + 0.45*k), color or c.pal.accent, a, max_w=CONTENT_W)
    paragraph(c, label, c.w/2, 682, 56, c.pal.text, ramp(t, t0 + 0.3, 0.3)*A, CONTENT_W, "Medium", max_lines=1)
    if note:
        paragraph(c, note, c.w/2, 772, BODY, c.pal.muted, ramp(t, t0 + 0.7, 0.3)*A, CONTENT_W, "Regular", max_lines=2)


def columns(c: Canvas, left: dict, right: dict, t: float, A: float, t0: float = 0.5) -> None:
    """Two labelled cards side by side: {'title', 'value', 'lines': [...]}"""
    for i, (d, sign) in enumerate(((left, -1), (right, 1))):
        a = ramp(t, t0 + i*0.4, 0.3)*A
        if a <= 0.01:
            continue
        cx = c.w/2 + sign*400
        k = back(ramp(t, t0 + i*0.4, 0.45))
        w, h = 680*(0.9 + 0.1*k), 520
        col = c.pal.cast[i]
        c.d.rounded_rectangle([cx - w/2, TOP + 30, cx + w/2, TOP + 30 + h], radius=36, fill=c.mix(c.pal.panel, a))
        c.text(d["title"], cx, TOP + 110, 52, col, a, max_w=w - 80)
        c.text(d["value"], cx, TOP + 230, 104, c.pal.text, ramp(t, t0 + i*0.4 + 0.3, 0.3)*A, max_w=w - 80)
        for j, line in enumerate(d.get("lines", [])[:3]):
            paragraph(c, line, cx, TOP + 345 + j*68, BODY, c.pal.muted,
                      ramp(t, t0 + i*0.4 + 0.6 + j*0.25, 0.3)*A, w - 80, "Regular", max_lines=1)


def bars(c: Canvas, items: Sequence[tuple[str, float, str]], t: float, A: float, t0: float = 0.6,
         grow: float = 1.1) -> None:
    """Bar chart from (label, value, displayed value). Bars grow left to right."""
    if not items:
        return
    top = max(v for _, v, _ in items) or 1.0
    span = min(1400, 300*len(items))
    x0 = c.w/2 - span/2 + span/len(items)/2
    for i, (label, value, shown) in enumerate(items):
        cnt = ease(ramp(t, t0 + i*0.45, grow))
        a = ramp(t, t0 + i*0.45 - 0.1, 0.25)*A
        if a <= 0.01:
            continue
        x = x0 + i*span/len(items)
        h = (BOTTOM - TOP - 120)*(value/top)*cnt
        vbar(c, x, BOTTOM - 60, min(230, span/len(items) - 60), h, c.pal.cast[i % 3], a)
        c.text(shown, x, BOTTOM - 70 - h - 44, 56, c.pal.text, a, max_w=span/len(items) - 20)
        c.text(label, x, BOTTOM - 10, 44, c.pal.text, a, "Medium", max_w=span/len(items) - 20)


def line_chart(c: Canvas, series: Sequence[tuple[str, Sequence[float], RGB]], t: float, A: float,
               x_label: str = "", t0: float = 0.5, draw: float = 4.0) -> None:
    """One or more growing lines over a shared x axis, with a value axis and a moving end dot.
    Each series is (name, values, colour); values start at x=0."""
    if not series or not series[0][1]:
        return
    a = ramp(t, t0 - 0.2, 0.3)*A
    if a <= 0.01:
        return
    x0, x1 = c.w/2 - 660, c.w/2 + 540
    y0, y1 = TOP + 40, BOTTOM - 40
    ticks = nice_axis(max(max(v) for _, v, _ in series) or 1.0)
    top = ticks[-1]
    n = max(len(v) for _, v, _ in series) - 1
    px = ease(ramp(t, t0, draw))            # how much of the line is drawn
    c.d.line([x0, y1, x1, y1], fill=c.mix(c.pal.grid, a), width=3)
    for v in ticks[1:]:
        y = y1 - (y1 - y0)*v/top
        c.d.line([x0, y, x1, y], fill=c.mix(c.pal.grid, a*0.45), width=2)
        c.text(axis_label(v), x0 - 26, y, 34, c.pal.muted, a*0.9, "Regular", anchor="rm")
    for name, values, col in series:
        shown = 1 + (len(values) - 1)*px
        pts = []
        for i, v in enumerate(values):
            if i > shown:
                break
            pts.append((x0 + (x1 - x0)*i/n, y1 - (y1 - y0)*v/top))
        if len(pts) > 1:
            c.d.line(pts, fill=c.mix(col, a), width=7, joint="curve")
            ex, ey = pts[-1]
            c.d.ellipse([ex - 12, ey - 12, ex + 12, ey + 12], fill=c.mix(col, a))
            c.text(name, ex + 26, ey, 42, col, a, "SemiBold", anchor="lm", max_w=300)
    if x_label:
        c.text(x_label, (x0 + x1)/2, y1 + 52, 40, c.pal.muted, a, "Regular", max_w=600)


def steps(c: Canvas, items: Sequence[str], t: float, A: float, t0: float = 0.6, gap: float = 1.0) -> None:
    """Numbered steps in a row, each in a circle, joined by a line."""
    if not items:
        return
    span = min(c.w - 200, 560*len(items))
    cell = span/len(items)
    x0 = c.w/2 - span/2 + cell/2
    for i, s in enumerate(items):
        a = ramp(t, t0 + i*gap, 0.3)*A
        if a <= 0.01:
            continue
        x = x0 + i*cell
        k = back(ramp(t, t0 + i*gap, 0.45))
        r = 66*(0.6 + 0.4*k)
        col = c.pal.cast[i % 3]
        if i:
            c.d.line([x - cell + 90, 440, x - 90, 440], fill=c.mix(c.pal.grid, a), width=4)
        c.d.ellipse([x - r, 440 - r, x + r, 440 + r], fill=c.mix(col, a))
        c.text(str(i + 1), x, 440, 68*(0.6 + 0.4*k), c.pal.bg, a)
        paragraph(c, s, x, 620, 48, c.pal.text, a, cell - 70, "Medium", max_lines=3)


def takeaways(c: Canvas, items: Sequence[str], t: float, A: float, t0: float = 0.5) -> None:
    """Recap cards stacked down the middle, each as tall as its text needs."""
    items = list(items)[:4]
    if not items:
        return
    size = 48
    blocks = [fit_lines(s, size, "Medium", CONTENT_W - 160, 2, c.frame.min_text) for s in items]
    heights = [max(108.0, sz*1.25*len(ls) + 52) for sz, ls in blocks]
    gaps = 26
    y = (TOP + BOTTOM)/2 - (sum(heights) + gaps*(len(items) - 1))/2
    for i, ((sz, lines), h) in enumerate(zip(blocks, heights)):
        a = ramp(t, t0 + i*0.7, 0.3)*A
        cy = y + h/2
        y += h + gaps
        if a <= 0.01:
            continue
        k = back(ramp(t, t0 + i*0.7, 0.4))
        w = CONTENT_W*(0.92 + 0.08*k)
        left = c.w/2 - w/2
        c.d.rounded_rectangle([left, cy - h/2, c.w/2 + w/2, cy + h/2], radius=28, fill=c.mix(c.pal.panel, a))
        c.d.ellipse([left + 38, cy - 16, left + 70, cy + 16], fill=c.mix(c.pal.cast[i % 3], a))
        top = cy - sz*1.25*(len(lines) - 1)/2
        for j, line in enumerate(lines):
            c.text(line, left + 104, top + j*sz*1.25, sz, c.pal.text, a, "Medium", anchor="lm")


def end_card(c: Canvas, t: float, A: float, lines: Sequence[str], cta: str, channel: str,
             assumption: str, disclaimer: str, look=None) -> None:
    """Closing: the takeaway, the call to action, a character off to one side, then the small print."""
    P = c.pal
    for i, s in enumerate(list(lines)[:2]):
        paragraph(c, s, c.w/2, 250 + i*98, 76, P.text, ramp(t, 0.2 + i*0.4, 0.3)*A, CONTENT_W, "Bold", max_lines=1)
    k = back(ramp(t, 1.2, 0.45))
    if k > 0.01:
        c.text(cta, c.w/2, 500, 88*(0.6 + 0.4*k), P.accent, ramp(t, 1.2, 0.2)*A, max_w=1200)
    if look is not None:   # off to the right, clear of the centred text column
        person(c, c.w/2 + 680, 880, 0.8, P.cast[0], ramp(t, 1.8, 0.4)*A, t, "happy", look=look)
    c.text(channel, c.w/2, 700, 48, P.text, ramp(t, 2.4, 0.4)*A, "Medium", max_w=1200)
    small = ramp(t, 0.6, 0.4)*A
    paragraph(c, assumption, c.w/2, 948, LONG.min_text, P.muted, small, CONTENT_W + 200, "Regular", max_lines=1)
    c.text(disclaimer, c.w/2, 1000, LONG.min_text, P.muted, small, "Regular", max_w=CONTENT_W)


def coins_row(c: Canvas, n: int, t: float, A: float, y: float = 760, t0: float = 0.4) -> None:
    """A row of coins dropping in, for 'money adds up' moments."""
    span = min(1200, 120*n)
    x0 = c.w/2 - span/2 + span/max(n, 1)/2
    for i in range(n):
        p = ramp(t, t0 + i*0.12, 0.35)
        if p <= 0.01:
            continue
        coin(c, x0 + i*span/max(n, 1), y - (1 - ease(p))*180, 44, clamp(p)*A)


def chapter_strip(c: Canvas, title: str, index: int, total: int, a: float = 1.0) -> None:
    """Bottom strip: which chapter this is, for a long video the viewer is scrubbing."""
    if a <= 0.01 or not title:
        return
    f = font(34, "Medium")
    label = f"{index}/{total}  ·  {title}"
    w = f.getlength(label) + 56
    c.d.rounded_rectangle([c.w/2 - w/2, FOOT_Y - 28, c.w/2 + w/2, FOOT_Y + 28], radius=28,
                          fill=c.mix(c.pal.panel, a*0.9))
    c.text(label, c.w/2, FOOT_Y, 34, c.mix(c.pal.text, 0.85), a, "Medium")


def thumbnail(c: Canvas, line1: str, line2: str, big: str, look=None) -> None:
    """A designed thumbnail, not a frame of the video: a few huge words and one number, readable
    when YouTube shrinks it to the width of a thumb."""
    P = c.pal
    c.d.rounded_rectangle([-40, -40, c.w*0.62, c.h + 40], radius=60, fill=c.mix(P.panel, 0.55))
    y = 250
    for line, size, col in ((line1, 118, P.text), (line2, 118, P.text)):
        if not line:
            continue
        sz, lines = fit_lines(line, size, "Bold", c.w*0.56, 2, 60)
        for part in lines:
            c.text(part, 80, y, sz, col, 1.0, "Bold", anchor="lm")
            y += sz*1.1
        y += 14
    if big:
        sz = fit_lines(big, 190, "Bold", c.w*0.56, 1, 90)[0]
        c.text(big, 80, min(y + sz*0.6, c.h - 180), sz, P.accent, 1.0, "Bold", anchor="lm")
    if look is not None:
        person(c, c.w*0.80, c.h - 60, 1.9, P.cast[0], 1.0, 0.0, "wow", look=look)
