"""Long-video thumbnails that get clicked.

2026-10-26: our long thumbnails sold one small detail (a receipt with $45,424), so five fixed types
replaced them (remotion/src/compositions/LongThumbs.tsx). 2026-10-29, owner: "only 1 is enough. For
each video, its references are searched, see what type of thumbnail actually works and make
something like that... right now the thumbnails are outdated types and get no clicks." So every long
video now gets **one** thumbnail, coded for it (`remotion/src/videos/<id>/Thumb.tsx`), modelled on
the thumbnails of the most-viewed videos on its own topic:

  1. the market job searches each open long topic on YouTube once a week and keeps its top videos
     (`thumb-refs.json` on the market-data branch, workers/market.ts);
  2. `python -m renderer.thumbs refs <video id>` puts their thumbnails on one sheet, with views;
  3. Studio names what the hits share (`pattern`: the picture, the face, the words, the colours) and
     codes Thumb.tsx in that pattern with the video's own cast and props, listing the hits it follows
     (`references`: at least three, 100K+ views);
  4. `python -m renderer.thumbs feed <video id>` shows ours in a mock YouTube grid among those hits.

Rules (spec_problems): layout `custom`, at least three references with 100K+ views and what each
does, the pattern in words, 0-4 words that add to the title (at most one shared), and at phone
size (168x94) it keeps its contrast and doesn't turn to noise or to nothing (PHONE).

    python -m renderer.thumbs refs <video id>    the topic's reference thumbnails on one sheet
    python -m renderer.thumbs feed <video id>    ours among them in a mock YouTube grid
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
# the 2026-10-26 types: building blocks a Thumb.tsx may import from LongThumbs.tsx, no longer layouts
LONG_TYPES = ("grid", "ladder", "extremes", "face", "scene")
REF_MIN, REF_VIEWS = 3, 100_000       # at least three hits on the topic, each 100K+ views
YT_ID = r"[A-Za-z0-9_-]{11}"
STOP = set("the a an of to and or in on at for is are you your how why what which one ever every it its this that".split())
# at 168x94: luminance spread and edge share of the 2026 hits (measured: see test_thumbs) with margin
PHONE = {"contrast_min": 45.0, "edges": (0.15, 0.5)}   # the hits: contrast 53-88, edges 0.23-0.46
REFS = ROOT / "improvement" / "research" / "thumbnails.json"


def _words(text: str) -> list[str]:
    return re.findall(r"[a-z']+", text.replace("*", "").lower())


def spec_problems(th: dict, title: str, story: str | None = None) -> list[str]:
    """A long thumbnail's own rules, from its spec."""
    out = []
    if th.get("layout") != "custom":
        return [f"a long video's thumbnail is `custom`: its own Thumb.tsx modelled on the topic's best thumbnails "
                f"(python -m renderer.thumbs refs <id>), not a fixed type (got {th.get('layout')!r}; owner, 2026-10-29)"]
    refs = [r for r in th.get("references") or [] if isinstance(r, dict)]
    good = [r for r in refs if re.fullmatch(YT_ID, str(r.get("id", ""))) and int(r.get("views") or 0) >= REF_VIEWS and len(str(r.get("what", ""))) >= 8]
    if len(good) < REF_MIN:
        out.append(f"`references` needs {REF_MIN}+ hits on this topic, each {{id, views (100K+), what: what its thumbnail does}} "
                   f"(has {len(good)}): python -m renderer.thumbs refs <id> shows the topic's top videos")
    if len(str(th.get("pattern", ""))) < 20:
        out.append("`pattern`: say in a sentence what the hits' thumbnails share (the picture, the face, the words, the colours), "
                   "the thing Thumb.tsx copies")
    words = _words(th.get("words", ""))
    if len(words) > 4:
        out.append(f"{len(words)} words on the thumbnail; 4 at most, read at a glance")
    shared = ({w for w in words if w not in STOP} & {w.rstrip("s") for w in _words(title)} | {w for w in words if w not in STOP} & set(_words(title)))
    if len(shared) > 1:
        out.append(f"the thumbnail repeats the title ({', '.join(sorted(shared))}): its words add to the title (the emotion or the stakes)")
    return out


def code_problems(vid: str, th: dict, root: Path = ROOT) -> list[str]:
    """A custom thumbnail needs its component file."""
    if th.get("layout") != "custom":
        return []
    f = root / "remotion" / "src" / "videos" / vid / f"{th.get('component') or 'Thumb'}.tsx"
    return [] if f.is_file() else [f"thumbnail: {f.relative_to(root).as_posix()} is missing (the video's own thumbnail, "
                                   f"remotion/src/videos/README.md)"]


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
    """Everything wrong with a long video's thumbnail (spec, code and the rendered file)."""
    if script.get("format") != "long" or not script.get("thumbnail"):
        return []
    th = script["thumbnail"]
    res = [f"thumbnail: {p}" for p in spec_problems(th, script.get("title", ""), script.get("story"))]
    res += code_problems(out.name, th, out.parents[1] if len(out.parents) > 1 else ROOT)
    return res + image_problems(out / "thumbnail.png")


# ---------------- the topic's references ----------------

def _cache() -> Path:
    c = Path("E:/cache/thumb-refs") if Path("E:/cache").is_dir() else ROOT / ".cache" / "thumb-refs"
    c.mkdir(parents=True, exist_ok=True)
    return c


def market_refs() -> dict:
    """thumb-refs.json from the market-data branch (fetched quietly; {} when there is none)."""
    import json
    import subprocess
    subprocess.run(["git", "fetch", "-q", "origin", "market-data"], cwd=ROOT, capture_output=True)
    r = subprocess.run(["git", "show", "origin/market-data:thumb-refs.json"], cwd=ROOT, capture_output=True, text=True, encoding="utf-8")
    return json.loads(r.stdout) if r.returncode == 0 and r.stdout.strip() else {}


def topic_refs(vid: str, root: Path = ROOT, store: dict | None = None) -> list[dict]:
    """The reference videos for a video's topic, most viewed first: the market job's search for the
    topic, the topic's own `demand` video, and the channel-wide examples as a last resort."""
    import json
    plan_f = root / "videos" / vid / "plan.json"
    plan = json.loads(plan_f.read_text(encoding="utf-8")) if plan_f.is_file() else {}
    topic = plan.get("topic") or {}
    tid = topic.get("feed_id") or topic.get("id")
    store = market_refs() if store is None else store
    refs = list(((store.get("topics") or {}).get(tid) or {}).get("refs") or [])
    demand = topic.get("demand") or {}
    m = re.search(r"(?:v=|youtu\.be/|shorts/)(" + YT_ID + ")", str(demand.get("url", "")))
    if m and all(r.get("id") != m.group(1) for r in refs):
        refs.append({"id": m.group(1), "title": demand.get("title", ""), "views": int(demand.get("views") or 0), "channel": ""})
    if len(refs) < REF_MIN and REFS.is_file():
        refs += [e for e in json.loads(REFS.read_text(encoding="utf-8")).get("examples", []) if all(r.get("id") != e["id"] for r in refs)]
    return sorted(refs, key=lambda r: -int(r.get("views") or 0))


def fetch_thumb(yt_id: str) -> Path | None:
    """A video's thumbnail from YouTube's image server (maxres, else hq), cached outside the repo."""
    import urllib.request
    f = _cache() / f"{yt_id}.jpg"
    if f.is_file():
        return f
    for size in ("maxresdefault", "hqdefault"):
        try:
            with urllib.request.urlopen(f"https://i.ytimg.com/vi/{yt_id}/{size}.jpg", timeout=15) as r:
                data = r.read()
            if len(data) > 2000:      # YouTube answers a missing maxres with a tiny grey placeholder
                f.write_bytes(data)
                return f
        except OSError:
            continue
    return None


def _font(size: int):
    try:
        return ImageFont.truetype(str(ROOT / "assets" / "fonts" / "Poppins-SemiBold.ttf"), size)
    except OSError:
        return ImageFont.load_default()


def refs_sheet(vid: str, out: Path | None = None, top: int = 9) -> Path:
    """The topic's reference thumbnails on one sheet (3 across, title and views under each), to look at
    before writing Thumb.tsx. Kept outside the repo: they are other channels' pictures."""
    refs = [(r, fetch_thumb(r["id"])) for r in topic_refs(vid)[:top]]
    refs = [(r, f) for r, f in refs if f]
    if not refs:
        raise RuntimeError(f"no reference thumbnails for {vid}: the topic has no market search yet and no demand video")
    W, H, cols = 560, 315, 3
    rows = (len(refs) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (W + 20) + 20, rows * (H + 70) + 20), (15, 15, 15))
    draw, font = ImageDraw.Draw(sheet), _font(17)
    for i, (r, f) in enumerate(refs):
        x, y = 20 + (i % cols) * (W + 20), 20 + (i // cols) * (H + 70)
        sheet.paste(Image.open(f).convert("RGB").resize((W, H), Image.LANCZOS), (x, y))
        t = str(r.get("title", ""))
        draw.text((x, y + H + 8), t[:58] + ("…" if len(t) > 58 else ""), fill=(241, 241, 241), font=font)
        draw.text((x, y + H + 34), f"{r['id']} · {int(r.get('views') or 0) / 1e6:.2f}M views · {r.get('channel', '')}"[:70], fill=(170, 170, 170), font=font)
    out = out or _cache() / f"{vid}-refs.png"
    sheet.save(out)
    return out


# ---------------- the feed preview ----------------

def feed(vid: str, out: Path | None = None, files: list[Path] | None = None, title: str | None = None) -> Path:
    """Our thumbnail on a mock YouTube home grid among its topic's hits, at desktop size."""
    import json
    d = ROOT / "videos" / vid
    others = [(f, r.get("title", ""), int(r.get("views") or 0)) for r in topic_refs(vid)[:9] if (f := fetch_thumb(r["id"]))]
    if title is None:
        title = json.loads((d / "manifest.json").read_text(encoding="utf-8")).get("title", vid) if (d / "manifest.json").is_file() else vid
    ours = [(f, title, None) for f in (files or [d / "thumbnail.png"]) if f.is_file()]
    cells = others[:3] + ours[:1] + others[3:7]      # ours in the first row, among the hits
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
    elif len(sys.argv) >= 3 and sys.argv[1] == "refs":
        for r in topic_refs(sys.argv[2])[:9]:
            print(f"{r['id']}  {int(r.get('views') or 0):>11,}  {r.get('channel', '')[:24]:24}  {r.get('title', '')[:70]}")
        print(refs_sheet(sys.argv[2], Path(sys.argv[3]) if len(sys.argv) > 3 else None))
    else:
        print(__doc__)
