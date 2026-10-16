"""Contact sheet of key frames, for QA without encoding a video."""
from collections.abc import Sequence

from PIL import Image, ImageDraw

from .canvas import font


def contact_sheet(frames: Sequence[tuple[float, Image.Image]], cols: int = 4, tile_w: int = 360) -> Image.Image:
    """Grid of (time, frame) tiles, each labelled with its timestamp."""
    if not frames:
        raise ValueError("no frames to lay out")
    fw, fh = frames[0][1].size
    tile_h = tile_w*fh//fw
    gap, label_h = 12, 44
    rows = -(-len(frames)//cols)
    sheet = Image.new("RGB", (cols*(tile_w + gap) + gap, rows*(tile_h + label_h + gap) + gap), (30, 30, 30))
    d = ImageDraw.Draw(sheet)
    for i, (t, im) in enumerate(frames):
        x = gap + (i % cols)*(tile_w + gap)
        y = gap + (i//cols)*(tile_h + label_h + gap)
        d.text((x + tile_w/2, y + label_h/2), f"{t:.1f}s", font=font(28, "Medium"), fill=(230, 230, 230), anchor="mm")
        sheet.paste(im.resize((tile_w, tile_h), Image.Resampling.LANCZOS), (x, y + label_h))
    return sheet
