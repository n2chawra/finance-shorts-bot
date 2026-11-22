"""How close a sample video is to its channel's references (multi-channel plan, step 3d).

The plan's check: a sample's shot length, cuts and words a minute are within 25% of the references'
(research/style.json, measured from the shot sheets of the reference videos). Our side is read from the
built timeline: every camera framing of a directed beat is a shot (a reference sheet starts a new shot
at every cut or big camera move), and the voice's word timings give the pace and the first figure.

    python -m generator.likeness <video id> [--channel <slug>]   → videos/<id>/likeness.json
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

from . import channels
from .channels import cpath
from .settings import ROOT

TOLERANCE = 0.25
# (our measure, the style target it is held to, how to say it)
COMPARED = [("secPerShot", "secPerShot", "seconds per shot"), ("cutsFirst3s", "cutsFirst3s", "shots in the first 3 s"),
            ("wordsPerMin", "wordsPerMin", "spoken words a minute"), ("firstFigureSec", "firstFigureSec", "seconds to the first figure"),
            ("durationSec", "durationSec", "length (s)")]
FIGURE = re.compile(r"[$€£₹]|\d")


def ours(timeline: dict) -> dict:
    fps = timeline.get("fps") or 30
    beats = timeline.get("beats") or []
    duration = (timeline.get("durationInFrames") or sum(b.get("frames", 0) for b in beats)) / fps
    shot_starts: list[float] = []
    words, first_figure = 0, None
    for b in beats:
        start = b.get("from", 0) / fps
        events = b.get("events") or {}
        cam = (b.get("params") or {}).get("camera")
        framings = cam if isinstance(cam, list) and cam else [{"sec": 0}]
        for c in framings:
            at = c.get("sec") if c.get("sec") is not None else (events.get(c.get("at")) or 0) / fps
            shot_starts.append(round(start + float(at), 2))
        voice = b.get("voice") or {}
        ws = voice.get("words") or []
        words += len(ws)
        # numbers are spoken as words, so the figure is found in the written line and placed in time by
        # where it sits in the sentence
        say = str(b.get("say") or "")
        m = FIGURE.search(say)
        if first_figure is None and m and ws:
            spoken = float(ws[-1].get("e", 0))
            first_figure = round(start + voice.get("start", 0) / fps + spoken * m.start() / max(len(say), 1), 1)
    shots = len(set(shot_starts)) or 1
    return {
        "durationSec": round(duration, 1),
        "secPerShot": round(duration / shots, 2),
        "cutsFirst3s": sum(1 for s in set(shot_starts) if 0.05 < s < 3),
        "wordsPerMin": round(words / duration * 60) if duration else None,
        "firstFigureSec": first_figure,
    }


def compare(our: dict, targets: dict) -> list[dict]:
    rows = []
    for key, target_key, label in COMPARED:
        t = (targets.get(target_key) or {}).get("median")
        o = our.get(key)
        if t is None or o is None:
            rows.append({"measure": label, "ours": o, "theirs": t, "within": None})
            continue
        # counts near zero (cuts in the first 3 s) are held to ±1, not to a percentage
        within = abs(o - t) <= 1 if key == "cutsFirst3s" else (abs(o - t) <= TOLERANCE * abs(t) if t else o == 0)
        rows.append({"measure": label, "ours": o, "theirs": t, "within": within})
    return rows


def likeness(vid: str, root: Path = ROOT) -> dict:
    d = cpath(root, "videos") / vid
    timeline = json.loads((d / "timeline.json").read_text(encoding="utf-8"))
    fmt = timeline.get("format") or "short"
    style_file = channels.channel_root(root=root) / "research" / "style.json"
    style = json.loads(style_file.read_text(encoding="utf-8")) if style_file.is_file() else {}
    block = style.get("shorts" if fmt == "short" else "long") or {}
    our = ours(timeline)
    targets = dict(block.get("targets") or {})
    # the owner's own pace wins over the references' (channel.json likeness: {"wordsPerMin": {"short": 210}};
    # business docs, 2026-11-19: "the pace is slow, I saw it at 1.5x and it was great")
    from . import pack
    for key, per in ((pack.load(root=root) or {}).get("likeness") or {}).items():
        if isinstance(per, dict) and isinstance(per.get(fmt), (int, float)):
            targets[key] = {**(targets.get(key) or {}), "median": per[fmt]}
    # an owner pace note (pack.OWNER_PACE) is the pace we aim at, so it is the pace we are measured on
    if (note := pack.OWNER_PACE.get(channels.current(), {}).get(fmt)) and (own := pack.voice_speed(fmt, root=root)) == note:
        from .story import WORDS_PER_SPEED
        targets["wordsPerMin"] = {**(targets.get("wordsPerMin") or {}), "median": round(WORDS_PER_SPEED * own)}
    rows = compare(our, targets)
    judged = [r for r in rows if r["within"] is not None]
    out = {"video": vid, "format": fmt, "references": block.get("n", 0), "ours": our, "rows": rows,
           "within": sum(1 for r in judged if r["within"]), "of": len(judged),
           "pass": bool(judged) and all(r["within"] for r in judged if r["measure"] in ("seconds per shot", "spoken words a minute"))}
    (d / "likeness.json").write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    return out


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="generator.likeness")
    ap.add_argument("id")
    ap.add_argument("--channel")
    a = ap.parse_args(argv)
    channels.use(a.channel)
    r = likeness(a.id)
    for row in r["rows"]:
        mark = "–" if row["within"] is None else ("ok" if row["within"] else "OFF")
        print(f"{mark:>3}  {row['measure']}: ours {row['ours']} vs references {row['theirs']}")
    print(f"{r['within']} of {r['of']} within 25% (shot length and pace {'pass' if r['pass'] else 'do not pass'})")
    return 0 if r["pass"] else 1


if __name__ == "__main__":
    sys.exit(main())
