"""Reusable objects: coin, jar."""
from .canvas import RGB, Canvas
from .easing import clamp

COIN_RIM: RGB = (214, 160, 40)
COIN_FACE: RGB = (255, 209, 102)
COIN_INK: RGB = (176, 120, 20)


def coin(c: Canvas, cx: float, cy: float, r: float, a: float = 1.0) -> None:
    c.d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=c.mix(COIN_RIM, a))
    c.d.ellipse([cx - r*0.8, cy - r*0.8, cx + r*0.8, cy + r*0.8], fill=c.mix(COIN_FACE, a))
    c.text("₹", cx, cy + 1, r*1.1, COIN_INK, a)


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
