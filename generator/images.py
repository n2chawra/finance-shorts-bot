"""Real photos and logos for the videos (owner, 2026-11-11: "I approve using real images").

Only free licences: public domain, CC0, CC BY and CC BY-SA from Wikimedia Commons, each credited in
the video's description. Never a search-engine image, a stock photo, a still from another channel's
video, or anything marked NC (non-commercial: the channel is monetised) or ND. The renderer stays
offline: this runs in the video routine before the render, saves the file to
remotion/public/real/<name>.<ext> and its credit to remotion/public/real/credits.json.

    python -m generator.images search "Cristiano Ronaldo"         # candidates with their licences
    python -m generator.images fetch ronaldo "File:Cristiano Ronaldo 2018.jpg"
    python -m generator.images credits <id>                        # the lines ship adds to the description

A script shows one as the prop `photo:<name>` (build, board, docu beats; `into` on a swap) or with
<Photo name=... /> in a video's own code (remotion/src/studio/photo.tsx).
"""
from __future__ import annotations

import argparse
import html
import io
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REAL = ROOT / "remotion" / "public" / "real"
CREDITS = REAL / "credits.json"
API = "https://commons.wikimedia.org/w/api.php"
AGENT = "commons-image-fetch/1.0"
PREFIX = "photo:"
WIDTH = 1080                      # px: big enough for a full-height Short, small enough for the repo
NAME = re.compile(r"^[a-z0-9][a-z0-9-]{1,40}$")
FREE = re.compile(r"^(attribution$|public domain|pd\b|pd-|cc0|cc[ -]by(-sa)?[ -]?\d|cc[ -]by(-sa)?$)", re.I)
NOT_FREE = re.compile(r"\b(nc|nd|non-?commercial|no ?deriv|fair use|all rights reserved)\b", re.I)


def _open(url: str, timeout: int = 30):
    """GET with Wikimedia's etiquette: a User-Agent, and waiting out a 429 (Retry-After) a few times."""
    import time
    import urllib.error
    for attempt in range(6):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": AGENT}), timeout=timeout)
        except urllib.error.HTTPError as e:
            if e.code not in (429, 503) or attempt == 5:
                raise
            time.sleep(max(float(e.headers.get("Retry-After") or 0), 2 ** attempt))
    raise RuntimeError("unreachable")


def _get(params: dict) -> dict:
    with _open(API + "?" + urllib.parse.urlencode({**params, "format": "json"})) as r:
        return json.load(r)


def _text(v: str | None) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", v or ""))).strip()


def licence_ok(lic: str) -> bool:
    """Free for a monetised channel with credit: public domain, CC0, CC BY, CC BY-SA."""
    lic = lic.strip()
    return bool(lic) and not NOT_FREE.search(lic) and bool(FREE.search(lic))


def _entry(page: dict) -> dict:
    ii = page["imageinfo"][0]
    md = ii.get("extmetadata") or {}
    val = lambda k: _text((md.get(k) or {}).get("value"))
    return {"title": page["title"], "page": ii.get("descriptionurl"), "url": ii.get("thumburl") or ii["url"],
            "mime": ii.get("mime", ""), "width": ii.get("thumbwidth") or ii.get("width"), "height": ii.get("thumbheight") or ii.get("height"),
            "license": val("LicenseShortName"), "licenseUrl": val("LicenseUrl"), "author": val("Artist") or val("Credit") or "Unknown author",
            "restrictions": val("Restrictions")}


IIPROP = {"prop": "imageinfo", "iiprop": "url|size|mime|extmetadata", "iiurlwidth": WIDTH}


def info(title: str) -> dict:
    """A Commons file's licence, author, size and a scaled download URL."""
    title = title if title.startswith("File:") else f"File:{title}"
    page = next(iter(_get({"action": "query", "titles": title, **IIPROP})["query"]["pages"].values()))
    if "imageinfo" not in page:
        raise ValueError(f"{title}: not a file on Wikimedia Commons")
    return _entry(page)


def search(query: str, limit: int = 10) -> list[dict]:
    """Files on Commons matching the words, with licences (one request)."""
    q = _get({"action": "query", "generator": "search", "gsrsearch": f"{query} filetype:bitmap|drawing", "gsrnamespace": 6,
              "gsrlimit": limit, **IIPROP})
    pages = sorted((q.get("query") or {}).get("pages", {}).values(), key=lambda p: p.get("index", 0))
    return [{**e, "ok": licence_ok(e["license"])} for e in (_entry(p) for p in pages if "imageinfo" in p)]


def load() -> dict:
    return json.loads(CREDITS.read_text(encoding="utf-8")) if CREDITS.is_file() else {}


def fetch(name: str, title: str, logo: bool = False) -> dict:
    """Download a freely licensed Commons file as `photo:<name>`, cut it out, and record its credit."""
    from PIL import Image
    if not NAME.match(name):
        raise ValueError(f"name {name!r}: lowercase letters, digits and hyphens (e.g. 'ronaldo', 'apple-logo')")
    i = info(title)
    if not licence_ok(i["license"]):
        raise ValueError(f"{i['title']}: licence {i['license'] or 'unknown'!r} is not free for a monetised channel "
                         f"(public domain, CC0, CC BY or CC BY-SA only)")
    with _open(i["url"], timeout=60) as r:
        raw = r.read()
    img = Image.open(io.BytesIO(raw))
    img.thumbnail((WIDTH, WIDTH))
    keep_alpha = logo or img.mode in ("RGBA", "LA", "P")
    REAL.mkdir(parents=True, exist_ok=True)
    for old in REAL.glob(f"{name}*.*"):
        if re.fullmatch(rf"{re.escape(name)}(-cut|-head)?\.(jpg|png)", old.name):
            old.unlink()
    out = REAL / f"{name}.{'png' if keep_alpha else 'jpg'}"
    if keep_alpha:
        img.convert("RGBA").save(out, optimize=True)
    else:
        img.convert("RGB").save(out, quality=85, optimize=True)
    entry = {"file": out.name, "aspect": round(img.width / img.height, 3), "logo": logo, "title": i["title"],
             "author": i["author"], "license": i["license"], "licenseUrl": i["licenseUrl"], "source": i["page"]}
    if i["restrictions"]:
        entry["restrictions"] = i["restrictions"]
    credits = load()
    credits[name] = entry
    _save(credits)
    return cut(name)


def _save(credits: dict) -> None:
    CREDITS.write_text(json.dumps(dict(sorted(credits.items())), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


# How a real photo sits in a cartoon video (research 2026-11-11, after the owner called a framed photo
# "very bad"): never a rectangle on top of the scene. The subject is cut out of its background (die-cut),
# edged with a thick white sticker outline and our ink line, and dropped into the set like any other thing;
# a person can also be a bobblehead: the real head, a little oversized, on our cartoon body (the format of
# the billionaire-tax Short with 577K likes). One treatment for every photo keeps a video coherent.
OUTLINE = 14      # px of white sticker edge, at the cut-out's own size
INK = (29, 36, 51, 255)
CUT_MAX = 760     # px: a cut-out fills at most ~40% of a Short's height; keeps each file a few hundred KB
MODEL = "u2netp"  # rembg's 4.7 MB model, downloaded once per machine (never into the repo); --model isnet-general-use for hard cases


def _sticker(im, border: int = OUTLINE):
    """A die-cut sticker: the subject, a white edge `border` px wide and a thin ink line around it."""
    from PIL import Image, ImageFilter
    pad = border * 2 + 6
    canvas = Image.new("RGBA", (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
    canvas.paste(im, (pad, pad))
    alpha = canvas.split()[-1].point(lambda v: 255 if v > 40 else 0)
    white = alpha.filter(ImageFilter.MaxFilter(border * 2 + 1)).filter(ImageFilter.GaussianBlur(1.2))
    ink = white.point(lambda v: 255 if v > 20 else 0).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(0.8))
    out = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    out.paste(INK, mask=ink)
    out.paste((255, 255, 255, 255), mask=white)
    out.alpha_composite(canvas)
    return out.crop(out.getbbox())


def _face(rgb) -> tuple[int, int, int, int] | None:
    """The biggest frontal face (x, y, w, h), or None (OpenCV's bundled Haar cascade, no download)."""
    try:
        import cv2
        import numpy as np
    except ImportError:
        return None
    g = cv2.cvtColor(np.asarray(rgb.convert("RGB")), cv2.COLOR_RGB2GRAY)
    cc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    faces = cc.detectMultiScale(g, 1.1, 5, minSize=(max(40, g.shape[1] // 12),) * 2)
    return tuple(int(v) for v in max(faces, key=lambda f: f[2] * f[3])) if len(faces) else None


def _median(im, box) -> str:
    import numpy as np
    a = np.asarray(im.crop(box).convert("RGBA")).reshape(-1, 4)
    a = a[a[:, 3] > 200][:, :3]
    if not len(a):
        return "#2d3a5c"
    r, g, b = (int(v) for v in np.median(a, axis=0))
    return f"#{r:02x}{g:02x}{b:02x}"


def cut(name: str, face: tuple[int, int, int, int] | None = None, model: str = MODEL) -> dict:
    """Cut a library photo out of its background: <name>-cut.png (the subject as a sticker) and, for a
    person, <name>-head.png (the head alone, for a bobblehead) with the skin and top colours for the body."""
    from PIL import Image, ImageDraw, ImageFilter
    credits = load()
    c = credits[name]
    src = Image.open(REAL / c["file"])
    if c.get("logo"):
        im = src.convert("RGBA")
        if im.split()[-1].getextrema()[0] == 255:   # no transparency: drop the white ground connected to the edges
            from PIL import ImageOps
            g = ImageOps.grayscale(im)
            bg = g.point(lambda v: 255 if v > 235 else 0)
            mask = Image.new("L", im.size, 0)
            for seed in ((0, 0), (im.width - 1, 0), (0, im.height - 1), (im.width - 1, im.height - 1)):
                tmp = bg.copy()
                ImageDraw.floodfill(tmp, seed, 128)
                mask = Image.composite(Image.new("L", im.size, 255), mask, tmp.point(lambda v: 255 if v == 128 else 0))
            im.putalpha(mask.point(lambda v: 0 if v else 255))
        subject = im
    else:
        try:
            from rembg import new_session, remove
        except ImportError as e:
            raise ValueError("cutting out a photo needs rembg: python3 -m pip install -r generator/requirements-images.txt") from e
        subject = remove(src.convert("RGB"), session=new_session(model))
    subject = subject.crop(subject.getbbox())
    subject.thumbnail((CUT_MAX, CUT_MAX))
    st = _sticker(subject)
    st.save(REAL / f"{name}-cut.png", optimize=True)
    c["cut"] = f"{name}-cut.png"
    c["cutAspect"] = round(st.width / st.height, 3)
    c.pop("head", None)
    if not c.get("logo"):
        f = face or _face(subject)
        if f:
            x, y, w, h = f
            box = (int(x - 0.55 * w), int(y - 0.7 * h), int(x + 1.55 * w), int(y + 1.22 * h))
            head = subject.crop(box)
            # the neck ends in a soft curve under the chin, so the cartoon body's neck takes over
            m = Image.new("L", head.size, 0)
            ImageDraw.Draw(m).ellipse((0.04 * head.width, -0.75 * head.height, 0.96 * head.width, head.height * 0.995), fill=255)
            a = Image.composite(head.split()[-1], Image.new("L", head.size, 0), m.filter(ImageFilter.GaussianBlur(3)))
            head.putalpha(a)
            hs = _sticker(head.crop(head.getbbox()), border=10)
            hs.save(REAL / f"{name}-head.png", optimize=True)
            c["head"] = f"{name}-head.png"
            c["headAspect"] = round(hs.width / hs.height, 3)
            c["face"] = [x, y, w, h]
            c["skin"] = _median(subject, (x + w // 3, y + h // 2, x + 2 * w // 3, y + 3 * h // 4))
            c["top"] = _median(subject, (x, min(subject.height - 2, y + int(2.2 * h)), x + w, min(subject.height - 1, y + int(2.6 * h))))
    credits[name] = c
    _save(credits)
    return c


def used(node) -> set[str]:
    """Every `photo:<name>` a script or timeline uses, in props, swaps or own code params."""
    out: set[str] = set()
    if isinstance(node, str):
        if node.startswith(PREFIX):
            out.add(node[len(PREFIX):])
    elif isinstance(node, dict):
        for v in node.values():
            out |= used(v)
    elif isinstance(node, list):
        for v in node:
            out |= used(v)
    return out


def own_code_photos(vid: str, root: Path = ROOT) -> set[str]:
    """Photos a video's own components draw with <Photo name="..." />."""
    d = root / "remotion" / "src" / "videos" / vid
    names: set[str] = set()
    for f in d.glob("*.tsx") if d.is_dir() else []:
        names |= set(re.findall(r"""<Photo\b[^>]*\bname=["']([a-z0-9-]+)["']""", f.read_text(encoding="utf-8")))
    return names


def script_problems(script: dict, vid: str | None = None, root: Path = ROOT) -> list[str]:
    credits = json.loads((root / "remotion" / "public" / "real" / "credits.json").read_text(encoding="utf-8")) \
        if (root / "remotion" / "public" / "real" / "credits.json").is_file() else {}
    beats = script.get("beats") or []
    names = used(beats) | (own_code_photos(vid, root) if vid else set())
    out = []
    # a real person acts and reacts but never speaks: no voice is put in a real person's mouth (hard rule)
    talkers = sorted({b.get("speaker") for b in beats if str(b.get("speaker", "")).startswith(PREFIX)})
    if talkers:
        out.append(f"{', '.join(talkers)} speaks: a real person never gets a voice; the narrator or a cast member says the line")
    guests = {str(a.get("who"))[len(PREFIX):] for b in beats for a in ((b.get("params") or {}).get("actors") or [])
              if isinstance(a, dict) and str(a.get("who", "")).startswith(PREFIX)}
    for n in sorted(names):
        c = credits.get(n)
        if not c:
            out.append(f"photo:{n} is not in the library: python -m generator.images search \"<who or what>\", then "
                       f"python -m generator.images fetch {n} \"File:<a free-licence file>\"")
        elif not (root / "remotion" / "public" / "real" / c["file"]).is_file():
            out.append(f"photo:{n}: remotion/public/real/{c['file']} is missing; fetch it again")
        elif not licence_ok(c.get("license", "")):
            out.append(f"photo:{n}: licence {c.get('license')!r} is not free; pick another file")
        elif not c.get("cut"):
            out.append(f"photo:{n} has no cut-out (a photo is never shown as a rectangle): python -m generator.images cut {n}")
        elif n in guests and not c.get("head"):
            out.append(f"photo:{n} is an actor but no face was found for its head: python -m generator.images cut {n} --face x,y,w,h "
                       f"(the face box in remotion/public/real/{c['cut']}), or use it as a thing (`prop`) instead")
    return out


def credit_lines(script: dict, vid: str | None = None, root: Path = ROOT) -> list[str]:
    credits = json.loads((root / "remotion" / "public" / "real" / "credits.json").read_text(encoding="utf-8")) \
        if (root / "remotion" / "public" / "real" / "credits.json").is_file() else {}
    lines = []
    for n in sorted(used(script.get("beats") or []) | (own_code_photos(vid, root) if vid else set())):
        c = credits.get(n)
        if c:
            lines.append(f"{'Logo' if c.get('logo') else 'Photo'}: {c['author']}, {c['license']}, via Wikimedia Commons ({c['source']})")
    return lines


def with_credits(description: str, script: dict, vid: str | None = None, root: Path = ROOT) -> str:
    lines = [ln for ln in credit_lines(script, vid, root) if ln not in description]
    return description.rstrip() + ("\n\n" + "\n".join(lines) if lines else "")


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="generator.images", description=__doc__.split("\n\n")[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("search"); s.add_argument("query"); s.add_argument("--limit", type=int, default=10)
    f = sub.add_parser("fetch"); f.add_argument("name"); f.add_argument("title"); f.add_argument("--logo", action="store_true")
    c = sub.add_parser("credits"); c.add_argument("id")
    k = sub.add_parser("cut"); k.add_argument("name"); k.add_argument("--face", help="x,y,w,h of the face in the cut-out, when detection misses")
    k.add_argument("--model", default=MODEL)
    sub.add_parser("list")
    a = ap.parse_args(argv)
    if a.cmd == "search":
        for r in search(a.query, a.limit):
            print(f"{'OK ' if r['ok'] else 'NO '} {r['title']}  [{r['license'] or '?'}]  {r['width']}x{r['height']}  {r['author'][:50]}"
                  + (f"  ({r['restrictions']})" if r["restrictions"] else ""))
    elif a.cmd == "fetch":
        try:
            print(json.dumps(fetch(a.name, a.title, a.logo), indent=2, ensure_ascii=False))
        except ValueError as e:
            print(e, file=sys.stderr)
            return 1
    elif a.cmd == "cut":
        f = tuple(int(v) for v in a.face.split(",")) if a.face else None
        print(json.dumps(cut(a.name, f, a.model), indent=2, ensure_ascii=False))
    elif a.cmd == "credits":
        d = ROOT / "videos" / a.id
        print("\n".join(credit_lines(json.loads((d / "script.json").read_text(encoding="utf-8")), a.id)) or "(no photos)")
    else:
        for n, c in load().items():
            print(f"photo:{n}  {c['file']}  {c['license']}  {c['author'][:40]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
