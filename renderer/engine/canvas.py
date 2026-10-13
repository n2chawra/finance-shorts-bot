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


@dataclass(frozen=True)
class Palette:
    bg: RGB          # top of the background gradient; also the fade-out colour
    bg_bottom: RGB   # bottom of the background gradient
    text: RGB
    muted: RGB
    accent: RGB
    danger: RGB
    panel: RGB       # card fill
    grid: RGB        # chart grid lines


NIGHT = Palette(bg=(14, 17, 34), bg_bottom=(24, 23, 56), text=(245, 246, 250), muted=(150, 156, 180),
                accent=(255, 209, 102), danger=(255, 90, 95), panel=(32, 37, 68), grid=(50, 56, 92))


@lru_cache(maxsize=None)
def font(size: float, weight: str = "Bold") -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_DIR / f"Poppins-{weight}.ttf"), max(4, int(size)))


def mix(c: RGB, a: float, base: RGB) -> RGB:
    """Colour `c` at opacity `a` over `base`."""
    a = clamp(a)
    return tuple(int(base[i] + (c[i] - base[i])*a) for i in range(3))


class Canvas:
    """One frame being drawn. `d` is the raw ImageDraw for shapes the helpers don't cover."""

    def __init__(self, im: Image.Image, palette: Palette) -> None:
        self.im = im
        self.d = ImageDraw.Draw(im)
        self.pal = palette

    def mix(self, c: RGB, a: float, base: RGB | None = None) -> RGB:
        return mix(c, a, self.pal.bg if base is None else base)

    def text(self, s: str, cx: float, cy: float, size: float, color: RGB, a: float = 1.0,
             w: str = "Bold", anchor: str = "mm", stroke: int = 0) -> None:
        if a <= 0.01:
            return
        self.d.text((cx, cy), s, font=font(size, w), fill=self.mix(color, a), anchor=anchor,
                    stroke_width=stroke, stroke_fill=self.mix((0, 0, 0), a) if stroke else None)

    def pill(self, cx: float, cy: float, s: str, size: float, fg: RGB, bg: RGB, a: float = 1.0,
             pad: float = 28) -> None:
        if a <= 0.01:
            return
        f = font(size)
        l, t, r, b = self.d.textbbox((0, 0), s, font=f)
        w, h = r - l + pad*2, b - t + pad
        self.d.rounded_rectangle([cx - w/2, cy - h/2, cx + w/2, cy + h/2], radius=h/2, fill=self.mix(bg, a))
        self.d.text((cx, cy), s, font=f, fill=self.mix(fg, a), anchor="mm")

    def caption(self, s: str, t0: float, t: float, y: float, size: float, color: RGB, A: float) -> None:
        """Centred line that pops in at t0."""
        a = ramp(t, t0, 0.2)*A
        k = back(ramp(t, t0, 0.35))
        self.text(s, W/2, y, size*(0.6 + 0.4*k), color, a)
