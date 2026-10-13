"""Reusable objects: coin, jar, stamp, speech bubble, bar."""
from .canvas import RGB, Canvas, font
from .easing import clamp

COIN_RIM: RGB = (214, 160, 40)
COIN_FACE: RGB = (255, 209, 102)
COIN_INK: RGB = (176, 120, 20)


def coin(c: Canvas, cx: float, cy: float, r: float, a: float = 1.0) -> None:
    c.d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=c.mix(COIN_RIM, a))
    c.d.ellipse([cx - r*0.8, cy - r*0.8, cx + r*0.8, cy + r*0.8], fill=c.mix(COIN_FACE, a))
    c.text("₹", cx, cy + 1, r*1.1, COIN_INK, a, deco=True)


def jar(c: Canvas, cx: float, bottom: float, w: float, h: float, frac: float, color: RGB,
        a: float = 1.0) -> None:
    """Glass jar filled to `frac` (0–1) with `color`."""
    top = bottom - h
    fh = h*clamp(frac)
    if fh > 60:
        c.d.rounded_rectangle([cx - w/2 + 10, bottom - fh, cx + w/2 - 10, bottom - 8], radius=24,
                              fill=c.mix(color, a*0.85))
    c.d.rounded_rectangle([cx - w/2, top, cx + w/2, bottom], radius=34, outline=c.mix(c.pal.text, a*0.8), width=7)
    c.d.rounded_rectangle([cx - w/2 - 14, top - 26, cx + w/2 + 14, top + 6], radius=12, fill=c.mix(c.pal.muted, a))

def stamp(c: Canvas, cx: float, cy: float, s: str, size: float, color: RGB, a: float = 1.0, k: float = 1.0) -> None:
    """Rubber-stamp word in a double outline. `k` scales it (for a pop-in)."""
    if a <= 0.01:
        return
    size = size*k
    l, t, r, b = c.d.textbbox((cx, cy), s, font=font(size), anchor="mm")
    px, py = size*0.32, size*0.22
    col = c.mix(color, a)
    c.d.rounded_rectangle([l - px, t - py, r + px, b + py], radius=size*0.18, outline=col, width=max(3, int(size*0.07)))
    c.d.rounded_rectangle([l - px + size*0.11, t - py + size*0.11, r + px - size*0.11, b + py - size*0.11],
                          radius=size*0.12, outline=col, width=max(2, int(size*0.025)))
    c.text(s, cx, cy, size, color, a)


def bubble(c: Canvas, cx: float, cy: float, w: float, h: float, a: float = 1.0, tail_x: float | None = None) -> None:
    """Speech bubble in the text colour with a tail pointing down. Draw the words on top in pal.bg."""
    if a <= 0.01:
        return
    col = c.mix(c.pal.text, a)
    c.d.rounded_rectangle([cx - w/2, cy - h/2, cx + w/2, cy + h/2], radius=56, fill=col)
    tx = cx if tail_x is None else tail_x
    c.d.polygon([(tx - 46, cy + h/2 - 4), (tx + 46, cy + h/2 - 4), (tx, cy + h/2 + 70)], fill=col)


def vbar(c: Canvas, cx: float, base: float, w: float, h: float, color: RGB, a: float = 1.0) -> None:
    """Vertical bar standing on `base`."""
    if a <= 0.01 or h < 1:
        return
    c.d.rounded_rectangle([cx - w/2, base - h, cx + w/2, base], radius=min(20, h/2), fill=c.mix(color, a))
