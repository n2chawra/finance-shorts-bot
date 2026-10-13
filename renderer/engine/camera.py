"""Whole-frame effects applied after a scene is drawn: zoom, shake, flash, progress bar."""
import math

from PIL import Image, ImageDraw

from .canvas import H, RGB, W


def apply(im: Image.Image, t: float, zoom: float, shake: float) -> Image.Image:
    """Zoom about the centre and offset by a shake of `shake` pixels."""
    if zoom <= 1.0005 and shake <= 0.5:
        return im
    ox, oy = math.sin(t*90)*shake, math.cos(t*77)*shake
    w2, h2 = W/zoom, H/zoom
    x0, y0 = (W - w2)/2 + ox, (H - h2)/2 + oy
    return im.resize((W, H), Image.Resampling.BILINEAR, box=(x0, y0, x0 + w2, y0 + h2))


def flash(im: Image.Image, amount: float) -> Image.Image:
    """Blend towards white; amount 0–1."""
    if amount <= 0.01:
        return im
    return Image.blend(im, Image.new("RGB", (W, H), (255, 255, 255)), amount)


def progress_bar(im: Image.Image, frac: float, color: RGB, height: int = 10) -> None:
    ImageDraw.Draw(im).rectangle([0, H - height, W*frac, H], fill=color)
