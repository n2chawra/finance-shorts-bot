"""Character drawing."""
import math
from dataclasses import dataclass

from .canvas import RGB, Canvas

SKINS: tuple[RGB, ...] = ((255, 214, 186), (241, 194, 155), (224, 172, 125), (198, 140, 98))
HAIRS: tuple[str, ...] = ("cap", "flat", "bun")


@dataclass(frozen=True)
class Look:
    skin: RGB = SKINS[0]
    hair: str = "cap"


def person(c: Canvas, cx: float, cy: float, s: float, color: RGB, a: float = 1.0, t: float = 0.0,
           mood: str = "happy", tag: str | None = None, jump: float = 0.0, look: Look = Look()) -> None:
    """Capsule person standing with feet at (cx, cy). mood: happy | sad | wow | neutral."""
    if a <= 0.01:
        return
    d = c.d
    bob = math.sin(t*4)*6*s - jump
    body_h, body_w, head_r = 230*s, 170*s, 78*s
    top = cy - body_h + bob
    dark = c.mix(tuple(int(v*0.55) for v in color), a)
    d.rounded_rectangle([cx - body_w/2, top, cx + body_w/2, cy + bob], radius=60*s, fill=c.mix(color, a))
    hy = top - head_r*0.85
    if look.hair == "bun":
        d.ellipse([cx - 30*s, hy - head_r - 36*s, cx + 30*s, hy - head_r + 16*s], fill=dark)
    d.ellipse([cx - head_r, hy - head_r, cx + head_r, hy + head_r], fill=c.mix(look.skin, a))
    if look.hair == "flat":
        d.rounded_rectangle([cx - head_r, hy - head_r*1.08, cx + head_r, hy - head_r*0.3], radius=22*s, fill=dark)
    else:
        d.chord([cx - head_r, hy - head_r, cx + head_r, hy + head_r*0.6], 180, 360, fill=dark)
    blink = (t*1.3) % 3 < 0.12
    ink = c.mix((30, 30, 40), a)
    for ex in (-26*s, 26*s):
        if blink:
            d.line([cx + ex - 9*s, hy + 12*s, cx + ex + 9*s, hy + 12*s], fill=ink, width=max(2, int(5*s)))
        elif mood == "wow":
            d.ellipse([cx + ex - 12*s, hy, cx + ex + 12*s, hy + 24*s], fill=ink)
        else:
            d.ellipse([cx + ex - 9*s, hy + 3*s, cx + ex + 9*s, hy + 21*s], fill=ink)
    m = c.mix((120, 50, 50), a)
    lw = max(2, int(6*s))
    if mood == "happy":
        d.arc([cx - 26*s, hy + 18*s, cx + 26*s, hy + 52*s], 20, 160, fill=m, width=lw)
    elif mood == "sad":
        d.arc([cx - 24*s, hy + 38*s, cx + 24*s, hy + 66*s], 200, 340, fill=m, width=lw)
        d.ellipse([cx + 30*s, hy + 20*s, cx + 42*s, hy + 38*s], fill=c.mix((120, 190, 255), a))  # tear
    elif mood == "wow":
        d.ellipse([cx - 14*s, hy + 32*s, cx + 14*s, hy + 60*s], fill=m)
    else:
        d.line([cx - 20*s, hy + 42*s, cx + 20*s, hy + 42*s], fill=m, width=lw)
    if tag:
        c.pill(cx, cy + 60*s, tag, 44*s, c.pal.bg, color, a, pad=24*s)
