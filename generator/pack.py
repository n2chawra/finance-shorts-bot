"""A channel's pack (multi-channel plan, step 3c): who the channel is, as the pipeline needs it.

`channels/<slug>/channel.json` declares the channel's language, voices, currency, whether its videos
compute numbers, its disclaimer, whether its stories are true, its look and its upload category. The
pipeline reads these instead of Paisa Panchayat's built-in values; with no file (channel #1 before it
has one, the tests' temporary repos) every value is channel #1's, so nothing changes for it.

    python -m generator.pack check <slug>      what the channel still lacks before samples can be made
    python -m generator.pack scaffold <slug> --name "…" [--language en-us] [--numbers none|simple|finance]
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

from .channels import SLUG, channel_root, current, default
from .settings import ROOT

# Kokoro v1.0's voices by language prefix (a: US English, b: UK English, e: Spanish, f: French,
# h: Hindi, i: Italian, j: Japanese, p: Brazilian Portuguese, z: Mandarin); f/m = female/male
KOKORO_LANG = {"a": "en-us", "b": "en-gb", "e": "es", "f": "fr", "h": "hi", "i": "it", "j": "ja", "p": "pt-br", "z": "zh"}

DEFAULTS: dict = {
    "name": "Paisa Panchayat",
    "language": "en-us",
    "voices": {"shortsNarrator": "am_michael", "longNarrators": ["hf_alpha", "af_heart", "af_bella", "am_fenrir", "am_puck"]},
    "currency": "USD",
    "currencies": ["USD", "GBP", "EUR", "INR"],
    # "finance": money maths, the number check and money formatting; "simple": plain counts and dates
    # only (no money maths); "none": no computed figures on screen at all
    "numbers": "finance",
    "disclaimer": "Illustrative only. Not financial advice.",
    # "true": sourced facts about real people and businesses (CLAUDE.md); "fiction": stories, never presented as true
    "stories": "true",
    "look": {"cast": "studio", "palettes": None},
    "uploadCategory": "22",
}

NUMBERS = ("finance", "simple", "none")


def path(slug: str | None = None, root: Path = ROOT) -> Path:
    return channel_root(slug, root) / "channel.json"


def load(slug: str | None = None, root: Path = ROOT) -> dict:
    """The channel's pack over channel #1's values (one level deep for nested objects)."""
    f = path(slug, root)
    stored = json.loads(f.read_text(encoding="utf-8")) if f.is_file() else {}
    out = {**DEFAULTS, **stored}
    if not f.is_file():
        # no pack (channel #1): the dashboard's disclaimer setting, as before. A pack's own disclaimer is
        # never filled from it, so a new channel can't inherit "Not financial advice" by accident
        from .settings import load as load_settings
        out["disclaimer"] = load_settings(root)["disclaimer"]
    for k in ("voices", "look"):
        out[k] = {**DEFAULTS[k], **(stored.get(k) or {})}
    return out


def logo(slug: str | None = None, root: Path = ROOT) -> str | None:
    """The corner logo a channel's videos carry (owner, 2026-11-18: nothing inherited from another channel).

    "sikka": channel #1's drawn mascot (no pack, or a pack that says `"logo": "sikka"`); otherwise the
    channel's own `branding/avatar.png`, copied to `remotion/public/brand/<slug>/avatar.png` and returned
    as that public path; None (no logo) when the channel has neither."""
    slug = slug or current()
    f = path(slug, root)
    if not f.is_file():
        return "sikka"
    if json.loads(f.read_text(encoding="utf-8")).get("logo") == "sikka":
        return "sikka"
    src = channel_root(slug, root) / "branding" / "avatar.png"
    if not src.is_file():
        return None
    rel = f"brand/{slug}/avatar.png"
    dst = root / "remotion" / "public" / rel
    data = src.read_bytes()
    if not dst.is_file() or dst.read_bytes() != data:
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_bytes(data)
    return rel


def voice_speed(fmt: str, slug: str | None = None, root: Path = ROOT) -> float | None:
    """The channel's own narrator speed for a format (channel.json `voiceSpeed`: {"short": x, "long": y}, the
    total speed the voice is spoken at), or None for the platform's default (Paisa Panchayat's pace). A channel
    never inherits another's pace (owner, 2026-11-18: the tech channel's sample spoke at 229 words a minute,
    channel #1's money-Shorts pace, against its references' 151)."""
    v = (load(slug, root).get("voiceSpeed") or {}).get(fmt)
    return float(v) if isinstance(v, (int, float)) else None


def voice_ok(name: str) -> bool:
    return len(name) > 3 and name[0] in KOKORO_LANG and name[1] in "fm" and name[2] == "_"


def pack_problems(p: dict) -> list[str]:
    out = []
    if p.get("numbers") not in NUMBERS:
        out.append(f"numbers must be one of {', '.join(NUMBERS)}")
    if p.get("stories") not in ("true", "fiction"):
        out.append("stories must be true or fiction")
    if not str(p.get("disclaimer") or "").strip():
        out.append("disclaimer is empty: every channel carries one (a fiction channel says the story is made up)")
    voices = p.get("voices") or {}
    for v in [voices.get("shortsNarrator"), *(voices.get("longNarrators") or [])]:
        if not v or not voice_ok(str(v)):
            out.append(f"voice {v!r} is not a Kokoro voice (like am_michael, bf_emma, hf_alpha)")
    lang = str(p.get("language") or "")
    narrator = str(voices.get("shortsNarrator") or "")
    if narrator and voice_ok(narrator) and KOKORO_LANG[narrator[0]].split("-")[0] != lang.split("-")[0]:
        out.append(f"the Shorts narrator {narrator!r} speaks {KOKORO_LANG[narrator[0]]}, the channel is {lang!r}")
    if p.get("currency") not in (p.get("currencies") or []):
        out.append("currency must be one of currencies")
    snd = p.get("sound")
    if snd is not None:   # a channel's own sound: its beds and effects, never channel #1's money sounds
        from renderer.engine.music_constants import ALL_BPM
        if not snd.get("genres") or any(g not in ALL_BPM for g in snd["genres"]):
            out.append(f"sound.genres must be beds the music engine makes ({', '.join(ALL_BPM)})")
        if not snd.get("sfx"):
            out.append("sound.sfx lists the effects the channel may use")
        for key, hi in (("bedLevel", 2.0), ("duck", 1.0)):   # a number, or {"short": x, "long": y} per format
            v = snd.get(key)
            vals = v.items() if isinstance(v, dict) else [] if v is None else [("", v)]
            if isinstance(v, dict) and not v or any(
                    (k and k not in ("short", "long")) or isinstance(x, bool) or not isinstance(x, (int, float)) or not 0 <= x <= hi
                    for k, x in vals if not str(k).startswith("_")):
                out.append(f'sound.{key} is a number from 0 to {hi:g}, or {{"short": x, "long": y}}')
        per = snd.get("sfxPerMinute")   # {"short": n, "long": n}: enforced by the timeline builder
        if per is not None and (not isinstance(per, dict) or not per or any(
                k not in ("short", "long") or not isinstance(v, (int, float)) or v <= 0 for k, v in per.items())):
            out.append('sound.sfxPerMinute is {"short": n, "long": n}, effects a minute per format (n > 0)')
        drop = snd.get("preRevealDrop")  # {"db": -20, "sec": 2.0, "shortSec": 0.4}: the bed's dip before a reveal
        if drop is not None and (not isinstance(drop, dict) or not isinstance(drop.get("db"), (int, float)) or drop["db"] >= 0
                                 or any(not isinstance(drop.get(k, 1), (int, float)) or drop.get(k, 1) <= 0 for k in ("sec", "shortSec"))
                                 or "sec" not in drop):
            out.append("sound.preRevealDrop is {db (< 0), sec, shortSec (seconds, > 0)}")
    vs = p.get("voiceSpeed")   # {"short": x, "long": y}: the narrator's total speed, the channel's own
    if vs is not None and (not isinstance(vs, dict) or any(
            not k.startswith("_") and (k not in ("short", "long") or not isinstance(v, (int, float)) or not 0.6 <= v <= 1.6)
            for k, v in vs.items())):
        out.append('voiceSpeed is {"short": x, "long": y}, the narrator’s speed between 0.6 and 1.6')
    length = p.get("length")   # {"short": [min, max], "long": [min, max]} seconds: the channel's own, never another's
    if length is not None and (not isinstance(length, dict) or any(
            k not in ("short", "long") or not isinstance(v, list) or len(v) != 2
            or not all(isinstance(x, (int, float)) for x in v) or not 0 < v[0] < v[1] for k, v in length.items() if not k.startswith("_"))):
        out.append('length is {"short": [min, max], "long": [min, max]} in seconds, min < max')
    if not str(p.get("uploadCategory") or "").isdigit():
        out.append("uploadCategory must be a YouTube category id (22 People & Blogs, 27 Education, 28 Science & Technology…)")
    return out


def _json(f: Path, default=None):
    try:
        return json.loads(f.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return default


def check(slug: str, root: Path = ROOT) -> list[str]:
    """What a channel still lacks before its sample videos can be made (the build phase's done-ness)."""
    d = channel_root(slug, root)
    if not d.is_dir():
        return [f"channels/{slug}/ does not exist: run scaffold"]
    out = [f"channel.json: {x}" for x in pack_problems(load(slug, root))]
    if not (d / "channel.json").is_file():
        out.append("channel.json is missing")
    if not ((_json(d / "channel.json", {}) or {}).get("length") or {}).get("short"):
        out.append('channel.json: length {"short": [min, max]} (and "long" when it makes long videos): the channel’s own, from its research')
    profile = (d / "profile.md").read_text(encoding="utf-8") if (d / "profile.md").is_file() else ""
    if len(profile.split()) < 150 or "TODO" in profile:
        out.append("profile.md: who the channel is for, what it covers, where facts come from (150+ words, no TODO)")
    formats = (_json(d / "research" / "formats.json", {}) or {}).get("formats") or []
    shorts = [f for f in formats if f.get("format") == "short" and not f.get("retired")]
    if len(shorts) < 3 or not any(f.get("tier") == "core" for f in shorts):
        out.append("research/formats.json: at least 3 Short formats from the research, one of them tier core")
    # the planner only offers a format with a reference video at MIN_VIEWS (`examples`, generator/formats.py)
    from . import formats as _formats
    before = os.environ.get("CHANNEL")
    os.environ["CHANNEL"] = slug          # formats.load reads the channel the environment names
    try:
        plannable = _formats.load(root, "short")
    finally:
        if before is None:
            os.environ.pop("CHANNEL", None)
        else:
            os.environ["CHANNEL"] = before
    if formats and not any(f.get("tier") == "core" for f in plannable):
        out.append(f"research/formats.json: no core Short format the planner can use: each needs `examples` with a video of {_formats.MIN_VIEWS:,}+ views")
    for f in formats:
        missing = [k for k in ("id", "format", "name", "hook", "beats", "tier") if not f.get(k)]
        if missing:
            out.append(f"research/formats.json {f.get('id', '?')}: missing {', '.join(missing)}")
    if not ((_json(d / "research" / "shapes.json", {}) or {}).get("shapes")):
        out.append("research/shapes.json: the story shapes (start from the shared library)")
    topics = (_json(d / "research" / "topics.json", {}) or {}).get("topics") or []
    pack = load(slug, root)
    if len(topics) < 15:
        out.append(f"research/topics.json: 15–20 first topics (has {len(topics)})")
    if pack["stories"] == "true":
        unsourced = [t.get("id", "?") for t in topics if not t.get("facts")]
        if unsourced:
            out.append(f"research/topics.json: true stories need sourced facts; none on {', '.join(unsourced[:5])}")
    if not (d / "prompts" / "recipe.md").is_file():
        out.append("prompts/recipe.md: the champion recipe (length, topic kinds, opening rules, look) for the writer")
    if not (d / "prompts" / "lessons.md").is_file():
        out.append("prompts/lessons.md: start from the general lessons")
    if pack["look"].get("engine") == "doc" and not (d / "prompts" / "director.md").is_file():
        out.append("prompts/director.md: how the director turns each beat into a doc beat (look.engine doc; appended to "
                   "generator/prompts/director.md by python -m generator.run prompt director)")
    backlog = _json(d / "cycle" / "backlog.json", {}) or {}
    if not backlog.get("candidates"):
        out.append("cycle/backlog.json: the weekly loop's first challengers from the research")
    if not (d / "market.json").is_file():
        out.append("market.json: the niche's searches for the daily market scan")
    for f in ("advice.md", "families.json"):
        if not (d / "research" / f).is_file():
            out.append(f"research/{f}: from the full research")
    return out


GENERAL_LESSONS = """# Lessons from our own videos

Each lesson is a mistake that cost viewers, written by the reviewer (agents/reviewer.md) from where viewers
left. The writer follows them and QA enforces them. A new channel starts with channel #1's general ones.

## 1. The first frame names the subject (general)
Seen in: channel #1's first month, 55–76% swiped away when the title and first second held the subject back.
Fix: the title and the first spoken sentence name who or what the video is about.

## 2. Only what is true (general)
Seen in: channel #1, invented examples lost to real, named stories.
Fix: a true channel tells sourced facts about real, named people or things; a fiction channel says so.

## 3. No reaction shots (general)
Seen in: channel #1, shots of a character reacting were where viewers left.
Fix: every picture shows the thing being said.

## 4. The payoff is the most surprising fact (general)
Fix: hold the most surprising figure or fact for the payoff, and make the last line loop into the first.
"""


def scaffold(slug: str, name: str, root: Path = ROOT, language: str = "en-us", numbers: str = "none") -> list[str]:
    """The folders and starting files of a new channel. Never overwrites a file that exists."""
    if not SLUG.match(slug) or slug == default():
        raise ValueError(f"bad slug {slug!r} (and channel #1 is never scaffolded)")
    d = channel_root(slug, root)
    narrator = {"en-us": "am_michael", "en-gb": "bm_george", "hi": "hm_omega", "es": "em_alex", "fr": "ff_siwis",
                "it": "im_nicola", "pt-br": "pm_alex", "ja": "jm_kumo", "zh": "zm_yunxi"}.get(language, "am_michael")
    files: dict[str, object] = {
        "channel.json": {**DEFAULTS, "name": name, "language": language, "numbers": numbers,
                         "voices": {"shortsNarrator": narrator, "longNarrators": [narrator]},
                         "disclaimer": "", "look": {"cast": "none", "palettes": None},
                         "note": "Written by the /new-channel build phase from research/advice.md. generator/pack.py reads it."},
        "profile.md": f"# {name}\n\nTODO: who it is for, what it covers, where facts come from, the rules of its field.\n",
        "research/formats.json": {"note": "The niche's formats, tiers from research/families.json.", "seen": [], "formats": []},
        "research/topics.json": {"note": "First topics from the research, with sourced facts.", "topics": []},
        "research/thumbnails.json": {"refs": []},
        "history/history.json": [],
        "metrics/videos.json": {"videos": []},
        "experiments.json": {"experiments": []},
        "cycle/backlog.json": {"note": "The weekly loop's challengers, from the research.", "candidates": []},
        "prompts/lessons.md": GENERAL_LESSONS,
        "market.json": {"note": "The niche's searches for market.yml.", "queries": []},
        "setup.json": {"stage": "build", "note": "Building the channel pack"},
    }
    shared_shapes = channel_root(default(), root) / "research" / "shapes.json"
    if shared_shapes.is_file():
        # the shape library is shared knowledge about story order; the channel keeps the ones its niche uses
        files["research/shapes.json"] = json.loads(shared_shapes.read_text(encoding="utf-8"))
    made = []
    for rel, body in files.items():
        f = d / rel
        if f.exists():
            continue
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(body if isinstance(body, str) else json.dumps(body, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        made.append(f"channels/{slug}/{rel}")
    (d / "videos").mkdir(exist_ok=True)
    return made


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="generator.pack")
    sub = ap.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("check")
    c.add_argument("slug", nargs="?")
    s = sub.add_parser("scaffold")
    s.add_argument("slug")
    s.add_argument("--name", required=True)
    s.add_argument("--language", default="en-us")
    s.add_argument("--numbers", choices=NUMBERS, default="none")
    sub.add_parser("show").add_argument("slug", nargs="?")
    a = ap.parse_args(argv)
    if a.cmd == "check":
        problems = check(a.slug or current())
        print("\n".join(f"FAIL: {p}" for p in problems) or "OK: the pack is complete")
        return 1 if problems else 0
    if a.cmd == "scaffold":
        made = scaffold(a.slug, a.name, language=a.language, numbers=a.numbers)
        print("\n".join(made) or "nothing to make: every file exists")
        return 0
    print(json.dumps(load(a.slug or current()), indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
