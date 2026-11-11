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
  (2026-11-11, owner: "every topic's thumbnail should be made using the topic's own videos' thumbnails... give 3
  thumbnails so that I can pick": refs are this topic's own only, plus a live YouTube search; three thumbnails, rated, one picked)
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
# Long thumbnails that get clicked (research long-thumb-one-subject-matches-title, 2026-11-12; owner, 2026-11-11:
# L-20261111-01 got 4 clicks from 100 impressions, its words said "Million? Cute." under a $1 billion title,
# ten small things in the picture and a calm smirk): a face that reacts, one subject, words that match the title.
CALM = {"neutral", "happy", "smirk", "thinking", "proud"}     # faces that don't stop a scroll
THINGS_MAX = 3
SCALES = ("thousand", "million", "billion", "trillion")
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
    if th.get("expression") in CALM:
        out.append(f"the face is calm ({th['expression']!r}): a thumbnail face reacts, shock, worried, angry, confused or laugh "
                   f"(the hits' faces show a strong emotion and take a third of the height or more)")
    things = th.get("things")
    if isinstance(things, list) and not 1 <= len(things) <= THINGS_MAX:
        out.append(f"{len(things)} things in the picture (`things`): one subject filling half the frame, {THINGS_MAX} things at most "
                   f"besides the face and the words, so it reads at 168 px wide")
    t_scales = {w for w in SCALES if re.search(rf"\b{w}s?\b", title, re.I)}
    w_scales = {w for w in SCALES if re.search(rf"\b{w}s?\b", str(th.get("words", "")), re.I)}
    if t_scales and w_scales - t_scales:
        out.append(f"the thumbnail says {', '.join(sorted(w_scales - t_scales))} but the title says {', '.join(sorted(t_scales))}: "
                   f"the two must tell one story (the title's figure, or no scale word at all)")
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


PICKS = {"a": "thumbnail.png", "b": "thumbnail-b.png", "c": "thumbnail-c.png"}


def specs(script: dict) -> list[tuple[str, dict]]:
    """A long video's thumbnails: A (`thumbnail`), then B and C (`thumbnails`)."""
    out = [("a", script["thumbnail"])] if script.get("thumbnail") else []
    return out + [(k, t) for k, t in zip("bc", script.get("thumbnails") or []) if isinstance(t, dict)]


def pick_problems(script: dict) -> list[str]:
    """Three thumbnails, each rated by Studio, one picked (owner, 2026-11-11: "give 3 thumbnails so that I can
    pick the best one, and if I don't, rate them yourself and pick before upload")."""
    ths = specs(script)
    out = []
    if len(ths) != 3:
        out.append(f"{len(ths)} thumbnail(s): a long video has three, `thumbnail` (A) and `thumbnails` (B, C), each on a "
                   f"different pattern among the topic's own hits (owner, 2026-11-11)")
    for k, th in ths:
        sc = th.get("score")
        if not (isinstance(sc, (int, float)) and 1 <= sc <= 10) or len(str(th.get("why", ""))) < 20:
            out.append(f"thumbnail {k.upper()}: rate it, `score` 1-10 and `why` (would a viewer pick it over the hits next to it in "
                       f"python -m renderer.thumbs feed?)")
    pick = script.get("thumbnail_pick")
    if pick not in PICKS or pick not in dict(ths):
        out.append("`thumbnail_pick`: \"a\", \"b\" or \"c\", the one you rate best; it goes up unless the owner picks another")
    elif all(isinstance(t.get("score"), (int, float)) for _, t in ths) and dict(ths)[pick]["score"] < max(t["score"] for _, t in ths):
        out.append(f"`thumbnail_pick` is {pick!r} but another thumbnail has a higher score")
    pats = [str(t.get("pattern", "")).strip().lower() for _, t in ths]
    if len(set(pats)) != len(pats):
        out.append("the three thumbnails share a `pattern`: each copies a different pattern among the topic's hits")
    return out


def manifest_entries(script: dict) -> list[dict]:
    """The manifest's `thumbnails`: each file with its pattern, Studio's score and why, and which one Studio picked.
    The dashboard shows them for the owner to pick; the publisher sets the owner's pick, else Studio's."""
    pick = script.get("thumbnail_pick") or "a"
    return [{"file": PICKS[k], "angle": th.get("angle"), "layout": th.get("layout"), "pattern": th.get("pattern"),
             "score": th.get("score"), "why": th.get("why"), "picked": k == pick} for k, th in specs(script)]


def problems(script: dict, out: Path) -> list[str]:
    """Everything wrong with a long video's thumbnails (specs, code, the pick and the rendered files)."""
    if script.get("format") != "long" or not script.get("thumbnail"):
        return []
    root = out.parents[1] if len(out.parents) > 1 else ROOT
    res: list[str] = []
    for k, th in specs(script):
        tag = "thumbnail" if k == "a" else f"thumbnail {k.upper()}"
        res += [f"{tag}: {p}" for p in spec_problems(th, script.get("title", ""), script.get("story"))]
        res += code_problems(out.name, th, root)
        res += image_problems(out / PICKS[k])
    return res + [f"thumbnails: {p}" for p in pick_problems(script)]


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


def _views(text: str) -> int:
    """'12,324,195 views' / '1.2M views' -> 12324195 / 1200000."""
    t = str(text or "").replace(",", "").lower()
    m = re.search(r"([\d.]+)\s*([kmb])?", t)
    if not m:
        return 0
    return int(float(m.group(1)) * {"k": 1e3, "m": 1e6, "b": 1e9}.get(m.group(2) or "", 1))


def _seconds(text: str) -> int:
    parts = [int(p) for p in re.findall(r"\d+", str(text or ""))]
    out = 0
    for p in parts:
        out = out * 60 + p
    return out


def parse_search(html: str) -> list[dict]:
    """The videos on a YouTube results page (its ytInitialData), as {id, title, channel, views, durationSec}."""
    import json
    m = re.search(r"ytInitialData\s*=\s*(\{.*?\});\s*</script>", html, re.S)
    if not m:
        return []
    try:
        data = json.loads(m.group(1))
    except ValueError:
        return []
    out: list[dict] = []

    def walk(o):
        if isinstance(o, dict):
            v = o.get("videoRenderer")
            if isinstance(v, dict) and re.fullmatch(YT_ID, str(v.get("videoId", ""))):
                runs = lambda k: "".join(r.get("text", "") for r in ((v.get(k) or {}).get("runs") or []))
                out.append({"id": v["videoId"], "title": runs("title"), "channel": runs("ownerText") or runs("longBylineText"),
                            "views": _views((v.get("viewCountText") or {}).get("simpleText", "")),
                            "durationSec": _seconds((v.get("lengthText") or {}).get("simpleText", ""))})
            for x in o.values():
                walk(x)
        elif isinstance(o, list):
            for x in o:
                walk(x)
    walk(data)
    return out


def search_refs(query: str, timeout: int = 20) -> list[dict]:
    """The topic's own hits, searched live on YouTube (most viewed first; long videos only: a Short's
    cover is a different picture). Cached per query outside the repo."""
    import json
    import urllib.parse
    import urllib.request
    key = re.sub(r"[^a-z0-9]+", "-", query.lower()).strip("-")[:80]
    f = _cache() / f"search-{key}.json"
    if f.is_file():
        return json.loads(f.read_text(encoding="utf-8"))
    url = "https://www.youtube.com/results?" + urllib.parse.urlencode({"search_query": query}) + "&sp=EgIQAQ%3D%3D"  # relevance, videos only
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "en-US,en;q=0.9"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            html = r.read().decode("utf-8", "replace")
    except OSError:
        return []
    # YouTube's relevance order keeps them on topic (sorting the search by views pulls in any viral video); top 20, then by views
    refs = [r for r in parse_search(html)[:20] if r["views"] >= REF_VIEWS and r["durationSec"] > 180]
    refs.sort(key=lambda r: -r["views"])
    f.write_text(json.dumps(refs, ensure_ascii=False), encoding="utf-8")
    return refs


def topic_query(vid: str, root: Path = ROOT) -> str:
    """What people type for this video's topic: the long feed topic's `search`, else the plan's topic title."""
    import json
    plan_f = root / "videos" / vid / "plan.json"
    plan = json.loads(plan_f.read_text(encoding="utf-8")) if plan_f.is_file() else {}
    topic = plan.get("topic") or {}
    tid = topic.get("feed_id") or topic.get("id")
    feed_f = root / "improvement" / "longform" / "topics.json"
    if tid and feed_f.is_file():
        for t in json.loads(feed_f.read_text(encoding="utf-8")).get("topics", []):
            if t.get("id") == tid and t.get("search"):
                return str(t["search"])
    return str(topic.get("title") or plan.get("title") or "")


def topic_refs(vid: str, root: Path = ROOT, store: dict | None = None, live: bool = True) -> list[dict]:
    """The reference videos for THIS video's topic, most viewed first (owner, 2026-11-11: "every topic's
    thumbnail should be made using the topic's own videos' thumbnails"): the market job's weekly search
    for the topic, the topic's own `demand` video, and a live YouTube search for the topic. Never the
    channel-wide examples: a thumbnail modelled on other topics' hits isn't close to what gets clicked here."""
    import json
    plan_f = root / "videos" / vid / "plan.json"
    plan = json.loads(plan_f.read_text(encoding="utf-8")) if plan_f.is_file() else {}
    topic = plan.get("topic") or {}
    tid = topic.get("feed_id") or topic.get("id")
    store = market_refs() if store is None else store
    refs = list(((store.get("topics") or {}).get(tid) or {}).get("refs") or [])
    demand = plan.get("demand") or topic.get("demand") or {}     # the planner writes `demand` at the plan's top level
    m = re.search(r"(?:v=|youtu\.be/|shorts/)(" + YT_ID + ")", str(demand.get("url", "")))
    if m and all(r.get("id") != m.group(1) for r in refs):
        refs.append({"id": m.group(1), "title": demand.get("title", ""), "views": int(demand.get("views") or 0), "channel": "", "demand": True})
    if live and (q := topic_query(vid, root)):
        refs += [r for r in search_refs(q) if all(x.get("id") != r["id"] for x in refs)]
    return sorted(refs, key=lambda r: -int(r.get("views") or 0))


def reference_problems(th: dict, refs: list[dict]) -> list[str]:
    """Every reference a thumbnail names must be one of its topic's own hits (topic_refs)."""
    ids = {r.get("id") for r in refs}
    named = [str(r.get("id")) for r in th.get("references") or [] if isinstance(r, dict)]
    off = [i for i in named if i not in ids]
    return [f"references {', '.join(off)} are not among this topic's own videos (python -m renderer.thumbs refs <id>): "
            f"model the thumbnail on what gets clicked on this topic (owner, 2026-11-11)"] if off else []


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
    ours = [(f, f"{k.upper()} · {title}", None) for k, f in zip("abc", files or [d / p for p in PICKS.values()]) if f.is_file()]
    cells = []
    for i, o in enumerate(ours):                      # each of ours on its own row, among three of the topic's hits
        cells += others[i * 3:i * 3 + 3][:1] + [o] + others[i * 3:i * 3 + 3][1:]
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
