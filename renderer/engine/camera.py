"""Whole-frame effects applied after a scene is drawn: zoom, shake, flash, progress bar."""
import math

from PIL import Image, ImageDraw

from .canvas import RGB


def apply(im: Image.Image, t: float, zoom: float, shake: float,
          pan: tuple[float, float] = (0.0, 0.0)) -> Image.Image:
    """Zoom about the centre, offset by a shake of `shake` pixels and a steady `pan`."""
    if zoom <= 1.0005 and shake <= 0.5 and abs(pan[0]) < 0.5 and abs(pan[1]) < 0.5:
        return im
    w, h = im.size
    ox, oy = math.sin(t*90)*shake + pan[0], math.cos(t*77)*shake + pan[1]
    w2, h2 = w/zoom, h/zoom
    x0, y0 = (w - w2)/2 + ox, (h - h2)/2 + oy
    return im.resize((w, h), Image.Resampling.BILINEAR, box=(x0, y0, x0 + w2, y0 + h2))


def flash(im: Image.Image, amount: float) -> Image.Image:
    """Blend towards white; amount 0–1."""
    if amount <= 0.01:
        return im
    return Image.blend(im, Image.new("RGB", im.size, (255, 255, 255)), amount)


def progress_bar(im: Image.Image, frac: float, color: RGB, height: int = 10) -> None:
    w, h = im.size
    ImageDraw.Draw(im).rectangle([0, h - height, w*frac, h], fill=color)
