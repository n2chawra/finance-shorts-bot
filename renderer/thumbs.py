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
    python -m renderer.thumbs render <video id> [a|b|c]   re-render the thumbnails alone (after editing Thumb*.tsx
                                                 or the script's thumbnail specs), with the phone checks

A 3D thumbnail (2026-11-20, the tech channel, `"engine": "3d"`): the spec stays `custom`, and the video's own
`Thumb3D.tsx` (or `component`) is a 3D scene that compositions/LongThumb3D.tsx mounts in one Stage3D with the
thumb look; the words (StackWords: Anton, stacked left, one *starred* yellow word), `arrow`, `ring`, `badge` and
`loupe` are drawn over it from the spec. It renders through the same `thumbnail` step with a WebGL backend.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from generator.channels import cpath
from generator import pack as channel_pack

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
REFS_REL = "improvement/research/thumbnails.json"   # per channel: cpath(ROOT, REFS_REL)


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
    unique = len(str(th.get("unique") or "")) >= 20   # owner, 2026-11-23: a topic nobody has covered has no hits to study
    if len(good) < REF_MIN and not unique:
        out.append(f"`references` needs {REF_MIN}+ hits on this topic, each {{id, views (100K+), what: what its thumbnail does}}, "
                   f"or, when the topic has fewer (a new or unique topic), `unique`: what you searched and found "
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
    out += event_subject_problems(th, title)
    t_scales = {w for w in SCALES if re.search(rf"\b{w}s?\b", title, re.I)}
    w_scales = {w for w in SCALES if re.search(rf"\b{w}s?\b", str(th.get("words", "")), re.I)}
    if t_scales and w_scales - t_scales:
        out.append(f"the thumbnail says {', '.join(sorted(w_scales - t_scales))} but the title says {', '.join(sorted(t_scales))}: "
                   f"the two must tell one story (the title's figure, or no scale word at all)")
    return out


def channel_problems(spec_list: list[tuple[str, dict]], rules: dict | None, pick: str | None = None) -> list[str]:
    """A channel's own thumbnail rules (`channel.json` `thumbs`, from its style-study thumbnail playbook,
    2026-11-20: Craze & Crash and A Billion Switches). Each of A, B and C names one of the channel's proven
    patterns (`pattern_id`), the three use different patterns, words stay within the channel's maximum, a
    channel with no cast puts no face `expression` in a spec, and a rated set ships only at the score bar."""
    if not rules:
        return []
    out: list[str] = []
    allowed = {str(p) for p in rules.get("patterns") or {}}
    seen: dict[str, str] = {}
    for k, th in spec_list:
        pid = str(th.get("pattern_id", ""))
        if allowed and pid not in allowed:
            out.append(f"{k.upper()}: `pattern_id` is one of this channel's proven patterns ({', '.join(sorted(allowed))}; "
                       f"{rules.get('playbook', 'the style-study thumbnail playbook')}), got {pid or 'none'!r}")
        elif pid in seen:
            out.append(f"{k.upper()} uses pattern {pid} like {seen[pid].upper()}: A, B and C each use a different pattern")
        else:
            seen[pid] = k
        cap = int(rules.get("maxWords", 4))
        if len(_words(th.get("words", ""))) > cap:
            out.append(f"{k.upper()}: {len(_words(th.get('words', '')))} words; this channel's thumbnails carry {cap} at most")
        if rules.get("noFace") and th.get("expression"):
            out.append(f"{k.upper()}: no cast face on this channel's thumbnails (drop `expression`); the subject or a real "
                       f"person's photo carries the emotion")
        score = th.get("score")
        if isinstance(score, (int, float)) and score < int(rules.get("minScore", 8)) and k == pick:
            out.append(f"{k.upper()} is picked at {score}/10; ship only at {rules.get('minScore', 8)}+ "
                       f"(fix the weakest point and re-score once)")
    return out


def component(th: dict) -> str:
    """The thumbnail's own file: `component`, else Thumb3D for a 3D thumbnail, else Thumb."""
    return str(th.get("component") or ("Thumb3D" if th.get("engine") == "3d" else "Thumb"))


def code_problems(vid: str, th: dict, root: Path = ROOT) -> list[str]:
    """A custom thumbnail needs its component file (and a 3D one its loupe's scene, when it has one)."""
    if th.get("layout") != "custom":
        return []
    names = [component(th)] + ([str(th["loupe"]["component"])] if isinstance(th.get("loupe"), dict) and th["loupe"].get("component") else [])
    out = []
    for name in names:
        f = root / "remotion" / "src" / "videos" / vid / f"{name}.tsx"
        if not f.is_file():
            out.append(f"thumbnail: {f.relative_to(root).as_posix()} is missing (the video's own thumbnail, "
                       f"remotion/src/videos/README.md{'; a 3D one: compositions/LongThumb3D.tsx' if th.get('engine') == '3d' else ''})")
    return out


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


SHORT_REF_VIEWS = 10_000


def short_cover_problems(th: dict | None, demand: dict | None = None) -> list[str]:
    """Notes, never failures: a Short's cover is modelled on this topic's own hits when they exist (owner, 2026-11-23:
    "thumbnails are made for every video by studying the same topic's other videos' thumbnails", every channel), but
    "not every video might have a reference; some might be unique" (the same day): a cover that says `unique` (what
    was searched and that nothing comparable came up) is designed freely. Otherwise `references` name at least one
    video on this topic (the plan's `demand` counts) with what its cover does, and `pattern` what ours takes."""
    if not th or len(str(th.get("unique") or "")) >= 20:
        return []
    out = []
    refs = [r for r in th.get("references") or [] if isinstance(r, dict) and re.fullmatch(YT_ID, str(r.get("id", "")))
            and int(r.get("views") or 0) >= SHORT_REF_VIEWS and len(str(r.get("what", ""))) >= 8]
    if not refs:
        m = re.search(r"(?:v=|youtu\.be/|shorts/)(" + YT_ID + ")", str((demand or {}).get("url", "")))
        hint = f' (the plan\'s demand video {m.group(1)} is one: {{"id": "{m.group(1)}", "views": {int((demand or {}).get("views") or 0)}, "what": "<what its cover shows>"}})' if m else ""
        out.append("the cover's `references`: at least one video on this topic with 10K+ views, {id, views, what: what its "
                   f"cover shows}}, studied before the cover is chosen{hint}, or `unique` when nothing comparable exists; python -m renderer.thumbs refs <id> lists the topic's hits")
    if len(str(th.get("pattern", ""))) < 20:
        out.append("the cover's `pattern`: say in a sentence what those covers share (the picture, the words, the colours) "
                   "and what ours takes from it")
    return out


def problems(script: dict, out: Path) -> list[str]:
    """Everything wrong with a long video's thumbnails (specs, code, the pick and the rendered files)."""
    if script.get("format") != "long" or not script.get("thumbnail"):
        return []
    # the repo root above the video folder (channels/<slug>/videos/<id> since the multi-channel layout, 2026-11-17)
    root = next((q for q in out.parents if (q / "remotion").is_dir()), ROOT)
    res: list[str] = []
    for k, th in specs(script):
        tag = "thumbnail" if k == "a" else f"thumbnail {k.upper()}"
        res += [f"{tag}: {p}" for p in spec_problems(th, script.get("title", ""), script.get("story"))]
        res += code_problems(out.name, th, root)
        res += image_problems(out / PICKS[k])
    return res + [f"thumbnails: {p}" for p in pick_problems(script)]


def render(vid: str, letters: str = "abc", root: Path = ROOT) -> list[str]:
    """Re-render a long video's thumbnails alone from its timeline.json (the specs re-read from script.json, so an
    edited spec needs no rebuild), through the same `thumbnail` step as the full render (a 3D one through
    LongThumb3D with WebGL), then the phone checks. Returns the problems."""
    import json
    from renderer import remotion as rr
    from renderer.timeline.build import _thumbnail
    d = cpath(root, "videos") / vid
    tl = json.loads((d / "timeline.json").read_text(encoding="utf-8"))
    script_f = d / "script.json"
    if script_f.is_file():
        script = json.loads(script_f.read_text(encoding="utf-8"))
        blocks = [_thumbnail(t, tl["figures"], {}) for t in [script.get("thumbnail")] + list(script.get("thumbnails") or [])]
    else:
        blocks = [tl.get("thumbnail")] + list(tl.get("thumbnailVariants") or [])
    rr._use_gl(vid)
    b = rr.bundle()
    work = rr.WORK_ROOT / "thumbs" / vid
    work.mkdir(parents=True, exist_ok=True)
    out: list[str] = []
    for k, th in zip("abc", blocks):
        if not th or k not in letters:
            continue
        alt = work / f"timeline-thumb-{k}.json"
        alt.write_text(json.dumps({**tl, "thumbnail": th}, ensure_ascii=False), encoding="utf-8")
        f = d / PICKS[k]
        rr._node(["thumbnail", "--timeline", str(alt), "--out", str(f), "--bundle", str(b)])
        rr.check_thumbnail(f, tl["format"])
        rr.cover_jpeg(f)
        out += code_problems(vid, th, root) + image_problems(f)
        print(f"{f}  {phone_metrics(Image.open(f))}")
    return out


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
    plan_f = cpath(root, "videos") / vid / "plan.json"
    plan = json.loads(plan_f.read_text(encoding="utf-8")) if plan_f.is_file() else {}
    topic = plan.get("topic") or {}
    tid = topic.get("feed_id") or topic.get("id")
    feed_f = cpath(root, "improvement/longform/topics.json")
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
    plan_f = cpath(root, "videos") / vid / "plan.json"
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
    # a search hit that names nothing of the topic is another subject's hit (Scout, 2026-11-16: the savings
    # topic got "Five Kids Rich Vs Broke", the $1 billion one MrBeast's "$1 vs $100,000,000 House!")
    subject = subject_words(" ".join([str(topic.get("title") or ""), topic_query(vid, root)]))
    if subject:
        refs = [r for r in refs if r.get("demand") or subject & subject_words(str(r.get("title") or ""))]
    return sorted(refs, key=lambda r: -int(r.get("views") or 0))


# words any money video's title uses: sharing only these says nothing about the subject
GENERIC = set("""how what why who does did do really actually make makes made making money rich poor richest people
person look looks like much many they their them your you with from this that the and for are is was were can will
would cost costs pay pays paid earn earns year years secret secrets truth explained inside real every most more never
always all get gets got into about its it's than then vs versus top best worst things thing world know need want
there here one two three ten one's new old way ways day days most just still very""".split())


def subject_words(text: str) -> set[str]:
    """The words of a title that name its subject (a brand, a person, a thing), lower case, plural 's' off."""
    words = re.findall(r"[a-z0-9]+", text.lower().replace("'", "").replace("\u2019", ""))
    return {w[:-1] if len(w) > 4 and w.endswith("s") else w for w in words if len(w) >= 3 and w not in GENERIC and not w.isdigit()}


# Owner, 2026-11-23 (Disaster Desk, L-20261122-42, "The Gauge Said Normal. The Tower Was Nearly Full."): long titles
# and thumbnails were too technical for someone who never heard of the event. A long video is found by people who
# type the event's common name ("bp texas city refinery explosion"), so its title says that name, then the
# curiosity ("Inside the Texas City Refinery Explosion", "The Texas City Refinery Explosion: Why the Gauge Lied"),
# and an event story's thumbnail shows the event itself, never an instrument, a screen or a part.
EVENT_NOUNS = ("explosion", "collapse", "crash", "disaster", "sinking", "fire", "meltdown", "derailment", "blowout",
               "spill", "leak", "flood", "tragedy")
INSTRUMENTS = re.compile(r"\b(gauge|dial|meter|screen|display|readout|panel|sensor|valve|switch|chart|graph|diagram|"
                         r"schematic|reading|indicator|alarm|monitor|bolt|weld|rivet|part)s?\b", re.I)


# words of a search that only ask ("what happened to toys r us"): the title needn't repeat them
SEARCH_FILLER = {"happened", "happen", "happens", "step", "explain", "works", "use", "used", "inside"}


def _stem_in(word: str, words: set[str]) -> bool:
    """`word` or a form of it ("explosion"/"exploded", "work"/"works", "bp"/"bps") is among `words`."""
    stem = word[:5] if len(word) >= 6 else word
    return any(w.startswith(stem) or word.startswith(w) and len(w) >= 3 for w in words)


def event_noun(text: str) -> str | None:
    """The event the words name (explosion, collapse, crash...), if any."""
    low = text.lower()
    return next((n for n in EVENT_NOUNS if re.search(rf"\b{n}(s|es)?\b", low)), None)


def topic_search(vid: str, root: Path = ROOT) -> str:
    """What someone who never heard of this story types to find it: the plan's `search`, else its feed topic's."""
    import json
    d = cpath(root, "videos") / vid
    plan = json.loads((d / "plan.json").read_text(encoding="utf-8")) if (d / "plan.json").is_file() else {}
    if plan.get("search"):
        return str(plan["search"])
    tid = (plan.get("topic") or {}).get("feed_id") or (plan.get("topic") or {}).get("id")
    for name in ("improvement/longform/topics.json", "improvement/research/topics.json"):
        f = cpath(root, name)
        if tid and f.is_file():
            data = json.loads(f.read_text(encoding="utf-8"))
            for t in (data.get("topics", []) if isinstance(data, dict) else data):
                if isinstance(t, dict) and t.get("id") == tid and t.get("search"):
                    return str(t["search"])
    return ""


def long_title_problems(title: str, search: str) -> list[str]:
    """A long title says the event's common name, as people search it, before any curiosity (owner, 2026-11-23)."""
    if not search.strip():
        return ["plan needs `search`: what someone who never heard of this story types to find it, the event's or "
                "subject's common name (\"bp texas city refinery explosion\", \"how does face id work\"); the title "
                "says that name (owner, 2026-11-23)"]
    words = {w: w for w in re.findall(r"[a-z0-9]+", search.lower().replace("'", ""))}
    want = sorted(w for w in subject_words(search) if w not in SEARCH_FILLER)
    shown = {w: next((k for k in words if k.startswith(w)), w) for w in want}
    have = subject_words(title) | {w.rstrip("s") for w in re.findall(r"[a-z0-9]+", title.lower())}
    missing = [w for w in want if not _stem_in(w, have)]
    out = []
    noun = event_noun(search)
    if noun and not _stem_in(noun, have):
        out.append(f"the title {title!r} never says {noun!r}: people who don't know the story search the event by its "
                   f"name ({search!r}), so the title names it, then the curiosity (\"Inside the Texas City Refinery "
                   f"Explosion\", \"The Texas City Refinery Explosion: Why the Gauge Lied\"; owner, 2026-11-23)")
    allowed = max(1, len(want) // 3) if len(want) >= 2 else 0   # one word may go ("question" said as "answer")
    if len(missing) > allowed and not (noun and missing == [noun]):
        out.append(f"the title {title!r} leaves out {', '.join(shown[w] for w in missing)} of what people search ({search!r}): say the "
                   f"story's common name a stranger would recognise, not a technical detail of it (owner, 2026-11-23)")
    return out


def event_subject_problems(th: dict, title: str) -> list[str]:
    """An event story's thumbnail shows the event (the explosion, the collapse, the crowd), not an instrument."""
    things = th.get("things")
    if not event_noun(title) or not isinstance(things, list) or not things:
        return []
    subject = str(things[0])
    if INSTRUMENTS.search(subject):
        return [f"the subject {subject!r} is a detail only someone who knows the story understands: an event's thumbnail "
                f"shows the event itself at its biggest moment (the fireball over the refinery, the walkway falling on "
                f"the crowd, the ship on its side), so a stranger sees what happened at a glance; a gauge, screen or part "
                f"can sit small beside it (owner, 2026-11-23)"]
    return []


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
    d = cpath(ROOT, "videos") / vid
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
        draw.text((x, y + H + 28), f"{channel_pack.load()['name']} · ours" if views is None else f"{views / 1e6:.1f}M views", fill=(170, 170, 170), font=font)
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
    elif len(sys.argv) >= 3 and sys.argv[1] == "render":
        probs = render(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "abc")
        for p in probs or ["thumbnails ok"]:
            print(p)
        sys.exit(1 if probs else 0)
    else:
        print(__doc__)
