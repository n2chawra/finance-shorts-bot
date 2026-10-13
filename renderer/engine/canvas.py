"""Drawing surface: frame size, palette, fonts and text helpers.

There is no alpha channel. "Opacity" is a mix towards the palette background, which is why every
helper needs the palette.
"""
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from .easing import back, clamp, ramp

W, H, FPS = 1080, 1920, 30
RGB = tuple[int, int, int]
FONT_DIR = Path(__file__).resolve().parents[2] / "assets" / "fonts"

MIN_TEXT = 44          # smallest readable text, px
BOTTOM_SAFE = 120      # Shorts UI covers this much of the bottom edge
SAFE_W = W - 100       # widest a centred line may be
DISCLAIMER = "Illustrative only. Not financial advice."


@dataclass(frozen=True)
class Palette:
    name: str
    bg: RGB          # top of the background gradient; also the fade-out colour
    bg_bottom: RGB   # bottom of the background gradient
    text: RGB
    muted: RGB
    accent: RGB
    danger: RGB
    panel: RGB       # card fill
    grid: RGB        # chart grid lines
    haze: RGB        # colour that background stars fade towards
    cast: tuple[RGB, RGB, RGB]   # character / series colours


NIGHT = Palette("night", bg=(14, 17, 34), bg_bottom=(24, 23, 56), text=(245, 246, 250), muted=(150, 156, 180),
                accent=(255, 209, 102), danger=(255, 90, 95), panel=(32, 37, 68), grid=(50, 56, 92),
                haze=(20, 22, 45), cast=((61, 220, 151), (255, 159, 67), (120, 160, 255)))


@dataclass(frozen=True)
class Drawn:
    """One piece of text as it landed on the frame (recorded for layout checks)."""
    s: str
    size: float
    box: tuple[float, float, float, float]   # left, top, right, bottom


@lru_cache(maxsize=None)
def font(size: float, weight: str = "Bold") -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_DIR / f"Poppins-{weight}.ttf"), max(4, int(size)))


def mix(c: RGB, a: float, base: RGB) -> RGB:
    """Colour `c` at opacity `a` over `base`."""
    a = clamp(a)
    return tuple(int(base[i] + (c[i] - base[i])*a) for i in range(3))


def fit(s: str, size: float, weight: str, max_w: float) -> float:
    """Font size no larger than `size` at which `s` is at most `max_w` wide."""
    tw = font(size, weight).getlength(s)
    return size if tw <= max_w else size*max_w/tw


class Canvas:
    """One frame being drawn. `d` is the raw ImageDraw for shapes the helpers don't cover.
    If `log` is given, every fully opaque piece of text is recorded in it."""

    def __init__(self, im: Image.Image, palette: Palette, log: list[Drawn] | None = None) -> None:
        self.im = im
        self.d = ImageDraw.Draw(im)
        self.pal = palette
        self.log = log

    def mix(self, c: RGB, a: float, base: RGB | None = None) -> RGB:
        return mix(c, a, self.pal.bg if base is None else base)

    def text(self, s: str, cx: float, cy: float, size: float, color: RGB, a: float = 1.0,
             w: str = "Bold", anchor: str = "mm", stroke: int = 0, max_w: float | None = None,
             deco: bool = False) -> None:
        """`deco` marks decorative glyphs (e.g. the ₹ on a coin) that layout checks should skip."""
        if a <= 0.01:
            return
        if max_w is not None:
            size = fit(s, size, w, max_w)
        f = font(size, w)
        self.d.text((cx, cy), s, font=f, fill=self.mix(color, a), anchor=anchor,
                    stroke_width=stroke, stroke_fill=self.mix((0, 0, 0), a) if stroke else None)
        if self.log is not None and a >= 0.99 and not deco:
            self.log.append(Drawn(s, size, self.d.textbbox((cx, cy), s, font=f, anchor=anchor)))

    def pill(self, cx: float, cy: float, s: str, size: float, fg: RGB, bg: RGB, a: float = 1.0,
             pad: float = 28, max_w: float = SAFE_W) -> None:
        if a <= 0.01:
            return
        size = fit(s, size, "Bold", max_w - pad*2)
        f = font(size)
        l, t, r, b = self.d.textbbox((0, 0), s, font=f)
        w, h = r - l + pad*2, b - t + pad
        box = (cx - w/2, cy - h/2, cx + w/2, cy + h/2)
        self.d.rounded_rectangle(box, radius=h/2, fill=self.mix(bg, a))
        self.d.text((cx, cy), s, font=f, fill=self.mix(fg, a), anchor="mm")
        if self.log is not None and a >= 0.99:
            self.log.append(Drawn(s, size, box))

    def caption(self, s: str, t0: float, t: float, y: float, size: float, color: RGB, A: float) -> None:
        """Centred line that pops in at t0, shrunk if needed to stay inside the safe width."""
        a = ramp(t, t0, 0.2)*A
        k = back(ramp(t, t0, 0.35))
        self.text(s, W/2, y, size*(0.6 + 0.4*k), color, a, max_w=SAFE_W)
