"""Channel artwork for "Money in 60": profile picture, banner and video watermark.

    python docs/channel/make_art.py      → docs/channel/profile.png, banner.png, watermark.png

Same palette and font as the videos (night palette, Poppins), so the channel and its Shorts match.
"""
import math
import random
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from renderer.engine.canvas import NIGHT, font  # noqa: E402

OUT = Path(__file__).resolve().parent
P = NIGHT
GOLD, GOLD_RIM, GOLD_INK = P.accent, (214, 160, 40), (150, 100, 14)
GREEN, BLUE = P.cast[0], P.cast[2]


def gradient(w: int, h: int) -> Image.Image:
    """The video background: vertical night gradient with a soft brand glow."""
    im = Image.new("RGB", (w, h), P.bg)
    d = ImageDraw.Draw(im)
    for y in range(h):
        k = y/h
        d.line([(0, y), (w, y)], fill=tuple(int(P.bg[i] + (P.bg_bottom[i] - P.bg[i])*k) for i in range(3)))
    glow = Image.new("RGB", (w, h), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    r = int(min(w, h)*0.55)
    gd.ellipse([w//2 - r, h//2 - r, w//2 + r, h//2 + r], fill=(60, 50, 140))
    glow = glow.filter(ImageFilter.GaussianBlur(r//2))
    return Image.blend(im, Image.composite(glow, im, glow.convert("L")), 0.35)


def stars(im: Image.Image, n: int, seed: int) -> None:
    d = ImageDraw.Draw(im)
    rng = random.Random(seed)
    for _ in range(n):
        x, y, b = rng.randint(0, im.width), rng.randint(0, im.height), rng.random()
        r = 1.5 + b*2.5
        c = tuple(int(P.haze[i] + (P.text[i] - P.haze[i])*(0.25 + 0.35*b)) for i in range(3))
        d.ellipse([x - r, y - r, x + r, y + r], fill=c)


def coin_timer(size: int, transparent: bool = False) -> Image.Image:
    """The mark: a gold ₹ coin inside a stopwatch ring that is 60 s... most of the way round."""
    s = 4  # draw large, downscale for smooth edges
    W = size*s
    im = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    c, ring, width = W/2, W*0.46, int(W*0.07)
    d.ellipse([c - ring, c - ring, c + ring, c + ring], outline=(*P.grid, 255), width=width)
    d.arc([c - ring, c - ring, c + ring, c + ring], -90, -90 + 300, fill=(*GREEN, 255), width=width)
    tip = math.radians(-90 + 300)
    d.ellipse([c + math.cos(tip)*(ring - width/2) - width*0.75, c + math.sin(tip)*(ring - width/2) - width*0.75,
               c + math.cos(tip)*(ring - width/2) + width*0.75, c + math.sin(tip)*(ring - width/2) + width*0.75], fill=(*GREEN, 255))
    d.rounded_rectangle([c - W*0.05, c - ring - W*0.085, c + W*0.05, c - ring - W*0.02], radius=W*0.015, fill=(*P.text, 255))  # stopwatch button
    coin = W*0.3
    d.ellipse([c - coin, c - coin, c + coin, c + coin], fill=(*GOLD_RIM, 255))
    d.ellipse([c - coin*0.84, c - coin*0.84, c + coin*0.84, c + coin*0.84], fill=(*GOLD, 255))
    d.text((c, c + W*0.01), "₹", font=font(coin*1.15, "Bold"), fill=(*GOLD_INK, 255), anchor="mm")
    im = im.resize((size, size), Image.Resampling.LANCZOS)
    if transparent:
        return im
    bg = gradient(size, size).convert("RGBA")
    bg.alpha_composite(im)
    return bg


def profile() -> Image.Image:
    """800×800. YouTube shows it as a circle, so the mark sits well inside it."""
    im = gradient(800, 800)
    stars(im, 30, 1)
    mark = coin_timer(560, transparent=True)
    im = im.convert("RGBA")
    im.alpha_composite(mark, (120, 120))
    return im.convert("RGB")


def banner() -> Image.Image:
    """2560×1440. Everything important sits in the 1546×423 centre that shows on every device."""
    W, H = 2560, 1440
    im = gradient(W, H)
    stars(im, 160, 2)
    d = ImageDraw.Draw(im)
    # rising bars and a growth line out at the sides (seen on desktop and TV only)
    base = H*0.82
    for i, x in enumerate(range(110, 520, 72)):   # ends well left of the mark
        h = 70 + i*i*14
        d.rounded_rectangle([x, base - h, x + 48, base], radius=10, fill=tuple(int(v*0.55 + P.bg[k]*0.45) for k, v in enumerate(GREEN)))
    pts = [(1820 + i*90, base - 60 - (i**1.8)*16) for i in range(8)]
    d.line(pts, fill=tuple(int(v*0.6 + P.bg[k]*0.4) for k, v in enumerate(GOLD)), width=10, joint="curve")
    for x, y in pts[::2]:
        d.ellipse([x - 12, y - 12, x + 12, y + 12], fill=tuple(int(v*0.6 + P.bg[k]*0.4) for k, v in enumerate(GOLD)))

    # safe area: mark, name, tagline, schedule
    cy = H//2
    mark = coin_timer(300, transparent=True)
    title_f, tag_f, small_f = font(150, "Bold"), font(46, "Medium"), font(40, "Medium")
    title = "Money in 60"
    tw = d.textlength(title, font=title_f)
    total = 300 + 50 + tw
    x0 = (W - total)/2
    im = im.convert("RGBA")
    im.alpha_composite(mark, (int(x0), cy - 150 - 30))
    d = ImageDraw.Draw(im)
    tx = x0 + 300 + 50
    d.text((tx, cy - 70), "Money in ", font=title_f, fill=(*P.text, 255), anchor="ls")
    d.text((tx + d.textlength("Money in ", font=title_f), cy - 70), "60", font=title_f, fill=(*GOLD, 255), anchor="ls")
    d.text((tx + 4, cy + 10), "Personal finance for India, in under a minute", font=tag_f, fill=(*P.muted, 255), anchor="ls")
    d.text((tx + 4, cy + 80), "New Short every day · 7:07 PM IST", font=small_f, fill=(*GREEN, 255), anchor="ls")
    return im.convert("RGB")


if __name__ == "__main__":
    profile().save(OUT/"profile.png")
    banner().save(OUT/"banner.png", optimize=True)
    coin_timer(150, transparent=True).save(OUT/"watermark.png")
    for f in ("profile.png", "banner.png", "watermark.png"):
        im = Image.open(OUT/f)
        print(f, im.size, f"{(OUT/f).stat().st_size//1024} KB")
