"""The editor: rate every ready video against the others and name the best (owner, 2026-10-30: "the best
video should go out, not anything that day gives; rate those videos and point out the best and why").

`python -m generator.run rank` gives each ready Short a predicted score out of 10 with its parts, from
what our own data says works. The editor step of the video routine (generator/prompts/editor.md)
starts from it, looks at the top candidates' pictures and hooks, and writes
`improvement/editor/ranking.json`, which the ingest workflow turns into the dashboard's queue order
(the owner's pick and his own order still come first).

The parts (each shown, so the editor can disagree with a reason):
  tier      big-money formats first (generator/formats.py): every 1K+ Short so far was one
  ours      how its story, shape and hook style did for us (improvement/evaluate.py, 48 h views)
  taste     the owner's picks and stales of the same story or shape (generator/feedback.py)
  quality   motion score, craft problems and how many retries the checks needed
  length    inside the settings' range
  fresh     trending topics before they expire; older videos lose a little
"""
from __future__ import annotations

import json
import math
from datetime import datetime, timezone
from pathlib import Path

from . import feedback, formats, history
from .settings import ROOT, load as load_settings

BASE = 5.0


def _read(path: Path) -> dict | list | None:
    try:
        return json.loads(path.read_text(encoding="utf-8")) if path.is_file() else None
    except (OSError, ValueError):
        return None


def ready_ids(root: Path = ROOT, fmt: str = "short") -> list[str]:
    """The ready videos of a format: the dashboard's queue (config/settings.json `queue`) plus any
    shipped since the last ingest."""
    settings = load_settings(root)
    queue = [q["id"] for q in settings.get("queue") or [] if q.get("format", "short") == fmt]
    since = settings.get("ingestedAt")
    cutoff = datetime.fromisoformat(since) if since else None
    fresh = [e["id"] for e in history.of_format(history.load(root), fmt)
             if cutoff and datetime.fromisoformat(e["created_at"]) > cutoff and e["id"] not in queue]
    return [*queue, *fresh]


def _attribute_scores(root: Path, fmt: str) -> dict[str, float]:
    """{"story:<id>": log2 relative 48 h views, ...} from improvement/evaluate.py's attribute ranking."""
    try:
        from improvement import evaluate
        rows = evaluate.report(root)["attributes"].get(fmt, [])
    except Exception:   # the editor still ranks without our numbers
        return {}
    by = {"story": "story", "shape": "shape", "hook style": "hookStyle"}
    out = {}
    for r in rows:
        if r.get("by") in by and r.get("n", 0) >= 2 and r.get("relative"):
            out[f"{by[r['by']]}:{r['value']}"] = max(-1.0, min(1.0, math.log2(r["relative"])))
    return out


def score(vid: str, root: Path = ROOT, attrs: dict | None = None, taste: dict | None = None, now: datetime | None = None) -> dict:
    """A ready video's predicted score out of 10 and the parts it is made of."""
    d = root / "videos" / vid
    plan = _read(d / "plan.json") or {}
    script = _read(d / "script.json") or {}
    render = _read(d / "render.json") or {}
    steps = _read(d / "run.json") or []
    manifest = _read(d / "manifest.json") or {}
    fmt = script.get("format", "short")
    story = plan.get("story") or script.get("story")
    shape = script.get("shape") if isinstance(script.get("shape"), str) else (plan.get("shape") or {}).get("id") if isinstance(plan.get("shape"), dict) else plan.get("shape")
    hook_style = plan.get("hook_style")
    attrs = _attribute_scores(root, fmt) if attrs is None else attrs
    taste = feedback.taste_of(root) if taste is None else taste
    parts: dict[str, float] = {}
    tier = formats.tiers(root, fmt).get(story or "")
    parts["tier"] = {"core": 1.5, "low": -1.5}.get(tier or "", 0.0)
    parts["ours"] = round(sum(attrs.get(k, 0.0) for k in (f"story:{story}", f"shape:{shape}", f"hookStyle:{hook_style}")) * 0.6, 2)
    parts["taste"] = round(max(-1.5, min(1.5, 0.5 * sum(taste.get(k, 0.0) for k in (f"story:{story}", f"shape:{shape}")))), 2)
    lively = (render.get("liveliness") or {}).get("median")
    craft = len(render.get("craft_problems") or []) + len(render.get("layout_problems") or [])
    retries = sum(1 for s in steps if isinstance(s, dict) and s.get("status") == "failed")
    parts["quality"] = round((0.5 if lively and lively >= 5 else 0.0) - min(1.5, 0.5 * craft) - min(1.0, 0.1 * retries), 2)
    settings = load_settings(root)
    lo, hi = (settings.get("lengthMinSec", 45), settings.get("lengthMaxSec", 70)) if fmt == "short" else (settings.get("longLengthMinSec", 400), settings.get("longLengthMaxSec", 600))
    sec = render.get("duration_sec")
    parts["length"] = 0.0 if sec is None or lo <= sec <= hi else -1.0
    now = now or datetime.now(timezone.utc)
    created = manifest.get("createdAt")
    age = (now - datetime.fromisoformat(created)).days if created else 0
    urgent = (manifest.get("priority") or {}).get("until")
    parts["fresh"] = round((1.0 if urgent and urgent >= now.date().isoformat() else 0.0) - min(1.0, 0.1 * max(0, age - 3)), 2)
    total = round(max(0.0, min(10.0, BASE + sum(parts.values()))), 1)
    hook = ((script.get("beats") or [{}])[0] or {}).get("say", "")
    return {"id": vid, "score": total, "parts": parts, "title": plan.get("title") or manifest.get("title"), "story": story,
            "shape": shape, "hook": hook, "seconds": sec, "preview": f"videos/{vid}/preview.png", "thumbnail": f"videos/{vid}/thumbnail.png"}


def rank(root: Path = ROOT, fmt: str = "short", ids: list[str] | None = None) -> list[dict]:
    """Every ready video of a format, best first, with its score and parts."""
    ids = ready_ids(root, fmt) if ids is None else ids
    fmt_ = "long" if fmt == "long" else "short"
    attrs, taste = _attribute_scores(root, fmt_), feedback.taste_of(root)
    rows = [score(i, root, attrs, taste) for i in ids if (root / "videos" / i).is_dir()]
    return sorted(rows, key=lambda r: -r["score"])
