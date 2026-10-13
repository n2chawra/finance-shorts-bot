"""Background, stars and confetti. Random layouts come from a caller-owned random.Random so a
seed fully determines the video."""
import math
import random
from collections.abc import Sequence

from PIL import Image, ImageDraw

from .canvas import H, RGB, W, Canvas, Palette, mix

Star = tuple[int, int, float]
Confetto = tuple[float, float, float, float, RGB, float, float]


def gradient(pal: Palette) -> Image.Image:
    """Vertical gradient from pal.bg to pal.bg_bottom. Build once, copy per frame."""
    im = Image.new("RGB", (W, H), pal.bg)
    d = ImageDraw.Draw(im)
    for y in range(H):
        k = y/H
        d.line([(0, y), (W, y)], fill=tuple(int(pal.bg[i] + (pal.bg_bottom[i] - pal.bg[i])*k) for i in range(3)))
    return im


def make_stars(rng: random.Random, n: int = 60) -> list[Star]:
    return [(rng.randint(0, W), rng.randint(0, H), rng.random()) for _ in range(n)]


def draw_stars(c: Canvas, stars: Sequence[Star], t: float) -> None:
    """Twinkling dots."""
    for x, y, b in stars:
        tw = 0.35 + 0.35*math.sin(t*2 + b*10)
        r = 2 + b*2
        c.d.ellipse([x - r, y - r, x + r, y + r], fill=mix(c.pal.text, tw*0.5, c.pal.haze))


def make_confetti(rng: random.Random, colors: Sequence[RGB], n: int = 140) -> list[Confetto]:
    return [(rng.uniform(0, W), rng.uniform(-300, -20), rng.uniform(-160, 160), rng.uniform(250, 650),
             rng.choice(colors), rng.uniform(0, 6), rng.uniform(10, 22)) for _ in range(n)]


def draw_confetti(c: Canvas, confetti: Sequence[Confetto], ct: float, a: float = 1.0) -> None:
    """Falling, spinning pieces; `ct` is seconds since the burst."""
    if ct <= 0:
        return
    for x, y0, vx, vy, col, sp, sz in confetti:
        x2 = x + vx*ct
        y2 = y0 + vy*ct + 220*ct*ct
        if y2 > H + 40:
            continue
        ang = sp + ct*6
        dx, dy = math.cos(ang)*sz, math.sin(ang)*sz*0.4
        c.d.polygon([(x2 - dx, y2 - dy), (x2 + dy, y2 - dx*0.5), (x2 + dx, y2 + dy), (x2 - dy, y2 + dx*0.5)],
                    fill=c.mix(col, a))
