"""Long-video thumbnails that get clicked (owner, 2026-10-26: "the thumbnail is preventing people
from clicking"). Our long thumbnails sold one small detail (a receipt with $45,424) and often a
different video from the title; the finance explainers with millions of views sell the whole
promise in 1-3 huge words that add to the title, readable at phone size
(remotion/src/compositions/LongThumbs.tsx has the types and the 2026 sample they come from).

Rules for a long video's thumbnails (the main one and its Test & Compare variants):

  type      grid, ladder, extremes, face or scene, and one that suits the video's format (FORMAT_TYPES)
  words     1-4 (scene and extremes may have none), and at most one word shared with the title:
            the thumbnail adds to the title, it doesn't repeat it
  figures   none: no receipts, no tags with small numbers
  contents  grid 6-12 things, ladder 4-7 levels, extremes 2 ends
  variants  every variant a different type (Test & Compare needs different ideas)
  phone     at 168x94 (mobile home) it keeps its contrast and doesn't turn to noise or to nothing
            (bands calibrated on the 2026 sample, see PHONE)

    python -m renderer.thumbs feed <video id>    the thumbnails in a mock YouTube grid among the hits
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
LONG_TYPES = ("grid", "ladder", "extremes", "face", "scene")
FORMAT_TYPES = {
    "list_explained": ("grid", "face"),
    "which_one_are_you": ("ladder", "extremes", "face"),
    "rich_vs_poor": ("extremes", "grid", "face"),
    "how_they_make_money": ("scene", "face", "grid"),
    "secret_of_rich": ("face", "scene", "extremes", "grid"),
    "once_you_understand": ("grid", "face", "scene"),
}
COUNTS = {"grid": ("items", 6, 12), "ladder": ("levels", 4, 7), "extremes": ("ends", 2, 2)}
STOP = set("the a an of to and or in on at for is are you your how why what which one ever every it its this that".split())
# at 168x94: luminance spread and edge share of the 2026 hits (measured: see test_thumbs) with margin
PHONE = {"contrast_min": 45.0, "edges": (0.15, 0.5)}   # the hits: contrast 53-88, edges 0.23-0.46
REFS = ROOT / "improvement" / "research" / "thumbnails.json"


def _words(text: str) -> list[str]:
    return re.findall(r"[a-z']+", text.replace("*", "").lower())


def spec_problems(th: dict, title: str, story: str | None) -> list[str]:
    """A long thumbnail's own rules, from its spec."""
    layout = th.get("layout")
    out = []
    if layout not in LONG_TYPES:
        return [f"a long video's thumbnail is one of {', '.join(LONG_TYPES)} (got {layout!r}): the receipt and card layouts "
                f"sold one small detail and got no clicks"]
    words = _words(th.get("words", ""))
    if not words and layout not in ("scene", "extremes"):
        out.append("the thumbnail needs 1-4 huge words")
    if len(words) > 4:
        out.append(f"{len(words)} words on the thumbnail; 4 at most, read at a glance")
    shared = ({w for w in words if w not in STOP} & {w.rstrip("s") for w in _words(title)} | {w for w in words if w not in STOP} & set(_words(title)))
    if len(shared) > 1:
        out.append(f"the thumbnail repeats the title ({', '.join(sorted(shared))}): its words add to the title (the emotion or the stakes)")
    if th.get("figure"):
        out.append("no figure on a long thumbnail: small numbers turn to noise at phone size; sell the promise")
    if layout in COUNTS:
        key, lo, hi = COUNTS[layout]
        n = len(th.get(key) or [])
        if not lo <= n <= hi:
            out.append(f"a {layout} thumbnail has {lo}-{hi} `{key}` (got {n})")
    if story in FORMAT_TYPES and layout not in FORMAT_TYPES[story]:
        out.append(f"a {story} video's thumbnail is {' or '.join(FORMAT_TYPES[story])} (got {layout})")
    return out


def variant_problems(ths: list[dict]) -> list[str]:
    layouts = [t.get("layout") for t in ths]
    return [] if len(set(layouts)) == len(layouts) else [f"the thumbnails share a type ({', '.join(map(str, layouts))}): "
                                                         f"each Test & Compare variant is a different idea"]


def phone_metrics(img: Image.Image) -> dict[str, float]:
    small = np.asarray(img.convert("L").resize((168, 94), Image.LANCZOS), dtype=np.float32)
    gx, gy = np.abs(np.diff(small, axis=1)), np.abs(np.diff(small, axis=0))
    edges = float(((gx[:-1, :] > 28) | (gy[:, :-1] > 28)).mean())
    return {"contrast": round(float(small.std()), 1), "edges": round(edges, 3)}


def image_problems(path: Path) -> list[str]:
    if not path.is_file():
        return []
    m = phone_metrics(Image.open(path))
    out = []
    if m["contrast"] < PHONE["contrast_min"]:
        out.append(f"{path.name} is flat at phone size (contrast {m['contrast']}, at least {PHONE['contrast_min']}): bolder colours, darker outlines")
    lo, hi = PHONE["edges"]
    if not lo <= m["edges"] <= hi:
        out.append(f"{path.name} {'turns to noise' if m['edges'] > hi else 'is empty'} at phone size (edges {m['edges']}, {lo}-{hi}): "
                   f"{'fewer, bigger things' if m['edges'] > hi else 'fill it with the story'}")
    return out


def problems(script: dict, out: Path) -> list[str]:
    """Everything wrong with a long video's thumbnails (spec and rendered files)."""
    if script.get("format") != "long" or not script.get("thumbnail"):
        return []
    ths = [script["thumbnail"], *(script.get("thumbnails") or [])]
    res = []
    for i, th in enumerate(ths):
        res += [f"thumbnail {'abc'[i]}: {p}" for p in spec_problems(th, script.get("title", ""), script.get("story"))]
    res += variant_problems(ths)
    for f in ("thumbnail.png", "thumbnail-b.png", "thumbnail-c.png")[:len(ths)]:
        res += image_problems(out / f)
    return res


# ---------------- the feed preview ----------------

def feed(vid: str, out: Path | None = None, files: list[Path] | None = None, title: str | None = None) -> Path:
    """Our thumbnails on a mock YouTube home grid among the format's hits, at desktop size."""
    import json
    d = ROOT / "videos" / vid
    refs = json.loads(REFS.read_text(encoding="utf-8")) if REFS.is_file() else {"examples": []}
    cache = Path("E:/cache/thumb-refs") if Path("E:/cache").is_dir() else ROOT / ".cache" / "thumb-refs"
    others = [(cache / f"{e['id']}.jpg", e["title"], e["views"]) for e in refs.get("examples", []) if (cache / f"{e['id']}.jpg").is_file()]
    if title is None:
        title = json.loads((d / "manifest.json").read_text(encoding="utf-8")).get("title", vid) if (d / "manifest.json").is_file() else vid
    ours = [(f, title, None) for f in (files or [d / n for n in ("thumbnail.png", "thumbnail-b.png", "thumbnail-c.png")]) if f.is_file()]
    cells = []
    for i, o in enumerate(ours):
        cells += others[i * 3:(i + 1) * 3] + [o]
    W, H, cols = 320, 180, 4
    rows = (len(cells) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (W + 16) + 16, rows * (H + 74) + 16), (15, 15, 15))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype(str(ROOT / "assets" / "fonts" / "Poppins-SemiBold.ttf"), 13)
    except OSError:
        font = ImageFont.load_default()
    for i, (path, t, views) in enumerate(cells):
        x, y = 16 + (i % cols) * (W + 16), 16 + (i // cols) * (H + 74)
        im = Image.open(path).convert("RGB").resize((W, H), Image.LANCZOS)
        sheet.paste(im, (x, y))
        if views is None:
            draw.rectangle([x - 3, y - 3, x + W + 2, y + H + 2], outline=(255, 210, 63), width=3)
        draw.text((x, y + H + 8), t[:46] + ("…" if len(t) > 46 else ""), fill=(241, 241, 241), font=font)
        draw.text((x, y + H + 28), "Paisa Panchayat · ours" if views is None else f"{views / 1e6:.1f}M views", fill=(170, 170, 170), font=font)
    out = out or d / "feed-preview.png"
    sheet.save(out)
    return out


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "feed":
        print(feed(sys.argv[2], Path(sys.argv[3]) if len(sys.argv) > 3 else None))
