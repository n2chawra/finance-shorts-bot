"""
The variant system: learn what works in days, not weeks (owner, 2026-11-04: "48 hrs is enough to know if
a video works or not. The automation should be very fast on making changes to figure out what works").

Every new Short gets one option per dimension in `config/arms.json` (length, topic, hook, title, style,
upload category). Most videos get the current best option of each dimension; Thompson sampling sends
some to the others, at most `maxChanged` dimensions away from the defaults per video so each video's
result can be read. Results are views 48 hours after publishing (the public counter, no Analytics lag;
`metrics/videos.json` `views48hLive`, else Analytics' `views48h`). Several times a day `judge` drops an
option that clearly loses (median ≤ 0.5× the best at 80% confidence, 3–4 videos) and promotes one that
clearly wins (≥ 1.5×, or ≥ 2× from 3 videos) to the default.

Older videos count too, their options read from what they were (length from the duration, style from
the script, topic from the format's tier…), from each dimension's `since` date.

    python -m improvement.arms assign --video v-20261105-01   # the options for a new Short (JSON)
    python -m improvement.arms judge                          # drop / promote, write the state and log
    python -m improvement.arms status                         # a table of every option's numbers
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import random
import statistics as st
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = Path("config/arms.json")
STATE = Path("improvement/arms-state.json")
LOG = Path("improvement/arms-log.json")
VIDEOS = Path("metrics/videos.json")


def _read(path: Path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return default


def config(root: Path = ROOT) -> dict:
    return _read(root / CONFIG, {"dimensions": {}})


def frozen(root: Path = ROOT, today: str | None = None) -> dict | None:
    """The config's `frozen` block while it is in force (owner, 2026-11-11: one recipe for 14 days, no
    default changes in between; at 2-3 Shorts a day the 48-hour verdicts were noise and flipped their own
    defaults within days). `until` is the last day it holds; after it the variant system resumes."""
    f = config(root).get("frozen")
    if not isinstance(f, dict):
        return None
    today = today or datetime.now(timezone.utc).date().isoformat()
    return f if today <= str(f.get("until", "9999-12-31")) else None


def state(root: Path = ROOT) -> dict:
    """Defaults and dropped options as judged so far, over the config's. While frozen: the config's own
    defaults, nothing dropped, and the `free` dimensions left to the planner."""
    cfg, saved = config(root), _read(root / STATE, {}).get("dimensions", {})
    fz = frozen(root)
    if fz:
        return {dim: {"default": d["default"], "dropped": [], "options": d["options"], "since": d.get("since", "2000-01-01")}
                for dim, d in cfg["dimensions"].items() if dim not in fz.get("free", [])}
    out = {}
    for dim, d in cfg["dimensions"].items():
        s = saved.get(dim, {})
        default = s.get("default") if s.get("default") in d["options"] else d["default"]
        dropped = [o for o in s.get("dropped", []) if o in d["options"] and o != default]
        out[dim] = {"default": default, "dropped": dropped, "options": d["options"], "since": d.get("since", "2000-01-01")}
    return out


# ---- what each video was ----

def _length(sec: float | None) -> str | None:
    if sec is None:
        return None
    return "20-27" if sec <= 27.5 else "28-35" if sec <= 35.5 else None


# the publisher's category for a video without arms (workers/lib/youtube.ts UPLOAD_CATEGORY) is 22 since
# 2026-11-04; the API uploads before it used 27, every manual upload 22
API_CATEGORY_22_SINCE = "2026-11-04"


def _category(video: dict) -> str:
    if video.get("manual") or (video.get("publishAt") or "")[:10] >= API_CATEGORY_22_SINCE:
        return "22"
    return "27"


def infer(video: dict, root: Path = ROOT) -> dict:
    """A video's options: from its plan's `arms` when it has one, else read from what it was."""
    from generator import formats

    plan = _read(root / "videos" / video["id"] / "plan.json", {})
    script = _read(root / "videos" / video["id"] / "script.json", {})
    out = {
        "length": _length(video.get("durationSec")),
        "topic": "big_money" if (plan.get("story") or video.get("story")) in set(formats.core_ids(root)) else "budget",
        "hook": (video.get("hookStyle") or plan.get("hook_style") or "").lower().replace(" ", "_") or None,
        "title": "figure_or_name" if not formats.title_problems(video.get("title") or "") else "plain",
        "style": "board" if any(b.get("scene") == "board" for b in script.get("beats") or []) else "shot",
        "category": _category(video),
    }
    if not (plan.get("story") or video.get("story")):
        out["topic"] = None
    out.update({k: v for k, v in (plan.get("arms") or {}).items() if k in out})
    return out


def metric(video: dict) -> float | None:
    v = video.get("views48hLive")
    if v is None:
        v = video.get("views48h")
    return float(v) if isinstance(v, (int, float)) else None


def observations(root: Path = ROOT) -> dict[str, dict[str, list[float]]]:
    """For each dimension, each option's 48-hour views (Shorts published since the dimension's `since`)."""
    st_ = state(root)
    videos = [v for v in _read(root / VIDEOS, {}).get("videos", []) if v.get("format", "short") == "short"]
    obs: dict[str, dict[str, list[float]]] = {d: {o: [] for o in s["options"]} for d, s in st_.items()}
    for v in videos:
        y = metric(v)
        if y is None:
            continue
        arms = infer(v, root)
        for dim, s in st_.items():
            o = arms.get(dim)
            if o in obs[dim] and (v.get("publishAt") or "")[:10] >= s["since"]:
                obs[dim][o].append(y)
    return obs


# ---- deciding ----

def _bootstrap_better(a: list[float], b: list[float], rng: random.Random, n: int = 2000) -> float:
    """P(median of a > median of b) by resampling."""
    if not a or not b:
        return 0.5
    wins = 0
    for _ in range(n):
        ma = st.median(rng.choices(a, k=len(a)))
        mb = st.median(rng.choices(b, k=len(b)))
        wins += ma > mb
    return wins / n


def judge(root: Path = ROOT, now: datetime | None = None, write: bool = True) -> list[dict]:
    """Drop options that clearly lose, promote one that clearly wins; returns the verdicts made now."""
    if frozen(root):
        return []          # no drops or promotions while the recipe is frozen; the saved state is left as it was
    cfg, st_, obs = config(root), state(root), observations(root)
    rng = random.Random(7)
    verdicts = []
    for dim, s in st_.items():
        o = obs[dim]
        default = s["default"]
        live = [x for x in s["options"] if x not in s["dropped"]]
        # promote: an option that beats the default clearly
        for x in live:
            if x == default or not o[x] or not o[default]:
                continue
            ratio = st.median(o[x]) / max(st.median(o[default]), 1.0)
            n_needed = cfg.get("fastN", 3) if ratio >= cfg.get("fastRatio", 2.0) else cfg.get("minN", 4)
            if len(o[x]) >= n_needed and len(o[default]) >= n_needed and ratio >= cfg.get("promoteRatio", 1.5):
                p = _bootstrap_better(o[x], o[default], rng)
                if p >= cfg.get("confidence", 0.8):
                    verdicts.append({"dimension": dim, "option": x, "verdict": "promote", "over": default, "ratio": round(ratio, 2),
                                     "n": len(o[x]), "confidence": round(p, 2)})
                    default = x
        # drop: an option clearly worse than the (possibly new) default
        for x in live:
            if x == default or not o[x] or not o[default]:
                continue
            ratio = st.median(o[x]) / max(st.median(o[default]), 1.0)
            n_needed = cfg.get("fastN", 3) if ratio <= 1 / cfg.get("fastRatio", 2.0) else cfg.get("minN", 4)
            if len(o[x]) >= n_needed and len(o[default]) >= n_needed and ratio <= cfg.get("dropRatio", 0.5):
                p = _bootstrap_better(o[default], o[x], rng)
                if p >= cfg.get("confidence", 0.8):
                    verdicts.append({"dimension": dim, "option": x, "verdict": "drop", "against": default, "ratio": round(ratio, 2),
                                     "n": len(o[x]), "confidence": round(p, 2)})
    if write:
        _save(root, st_, verdicts, obs, now or datetime.now(timezone.utc))
    return verdicts


def _save(root: Path, st_: dict, verdicts: list[dict], obs: dict, now: datetime) -> None:
    dims = {d: {"default": s["default"], "dropped": list(s["dropped"])} for d, s in st_.items()}
    for v in verdicts:
        d = dims[v["dimension"]]
        if v["verdict"] == "promote":
            d["dropped"] = [x for x in d["dropped"] if x != v["option"]]
            d["default"] = v["option"]
        elif v["option"] not in d["dropped"]:
            d["dropped"].append(v["option"])
    table = {d: {o: {"n": len(ys), "median": round(st.median(ys)) if ys else None} for o, ys in obs[d].items()} for d in obs}
    (root / STATE).write_text(json.dumps({"note": "Written by python -m improvement.arms judge (ingest, every 6 h). Defaults and dropped options per dimension; config/arms.json holds the options.",
                                          "updatedAt": now.isoformat(timespec="seconds"), "dimensions": dims, "numbers": table}, indent=2) + "\n", encoding="utf-8")
    if verdicts:
        log = _read(root / LOG, {"entries": []})
        log.setdefault("entries", []).extend({**v, "at": now.isoformat(timespec="seconds")} for v in verdicts)
        log["note"] = "Every drop and promotion the variant system made (improvement/arms.py)."
        (root / LOG).write_text(json.dumps(log, indent=2) + "\n", encoding="utf-8")


def assign(video_id: str, root: Path = ROOT) -> dict:
    """The options for a new Short: Thompson sampling on log-views per dimension, at most `maxChanged`
    dimensions away from the defaults. Deterministic for a video id and the same data."""
    if frozen(root):
        return {d: s["default"] for d, s in state(root).items()}
    cfg, st_, obs = config(root), state(root), observations(root)
    rng = random.Random(int(hashlib.sha256(video_id.encode()).hexdigest()[:12], 16))
    all_logs = [math.log1p(y) for d in obs.values() for ys in d.values() for y in ys]
    prior = st.mean(all_logs) if all_logs else 5.0
    spread = st.pstdev(all_logs) if len(all_logs) > 1 else 1.5
    picks, gains = {}, {}
    for dim, s in st_.items():
        live = [x for x in s["options"] if x not in s["dropped"]]
        draws = {}
        for x in live:
            logs = [math.log1p(y) for y in obs[dim][x]]
            n = len(logs)
            mean = (prior + sum(logs)) / (n + 1)
            draws[x] = rng.gauss(mean, spread / math.sqrt(n + 1))
        best = max(draws, key=lambda x: draws[x])
        picks[dim] = best
        gains[dim] = draws[best] - draws.get(s["default"], draws[best])
    # most videos are the current best recipe; the rest explore (fast learning without risking every video)
    if rng.random() >= cfg.get("exploreShare", 0.4):
        return {d: s["default"] for d, s in st_.items()}
    changed = sorted((d for d in picks if picks[d] != st_[d]["default"]), key=lambda d: gains[d], reverse=True)
    if not changed:   # an exploring video always tries something: the least-tested live option
        d = min((d for d, s in st_.items() if len([x for x in s["options"] if x not in s["dropped"]]) > 1),
                key=lambda d: min(len(obs[d][x]) for x in st_[d]["options"] if x not in st_[d]["dropped"]), default=None)
        if d:
            picks[d] = min((x for x in st_[d]["options"] if x not in st_[d]["dropped"] and x != st_[d]["default"]), key=lambda x: len(obs[d][x]))
            changed = [d]
    for d in changed[cfg.get("maxChanged", 2):]:
        picks[d] = st_[d]["default"]
    return picks


def plan_problems(plan: dict, root: Path = ROOT) -> list[str]:
    """A Short's plan carries a valid assignment (`python -m improvement.arms assign --video <id>`)."""
    arms, st_ = plan.get("arms"), state(root)
    if not st_:
        return []
    if not isinstance(arms, dict):
        return ["plan needs `arms`: run `python -m improvement.arms assign --video <id>` and copy its JSON into the plan"]
    out = []
    for dim, s in st_.items():
        x = arms.get(dim)
        if x not in s["options"]:
            out.append(f"arms.{dim} must be one of {', '.join(s['options'])} (from `improvement.arms assign`)")
        elif x in s["dropped"]:
            out.append(f"arms.{dim} {x!r} was dropped by the variant system: run `improvement.arms assign` again")
    changed = [d for d, s in st_.items() if arms.get(d) not in (None, s["default"])]
    if len(changed) > config(root).get("maxChanged", 2):
        out.append(f"arms change {len(changed)} dimensions from the defaults ({', '.join(changed)}); at most "
                   f"{config(root).get('maxChanged', 2)}: use `improvement.arms assign`")
    hook = arms.get("hook")
    if hook and (plan.get("hook_style") or "").lower().replace(" ", "_") != hook:
        out.append(f"hook_style must follow arms.hook ({hook!r})")
    return out


def status(root: Path = ROOT) -> str:
    st_, obs = state(root), observations(root)
    fz = frozen(root)
    lines = [f"FROZEN until {fz.get('until')}: every Short gets the defaults; no drops or promotions"] if fz else []
    for dim, s in st_.items():
        cells = []
        for x in s["options"]:
            ys = obs[dim][x]
            tag = " (default)" if x == s["default"] else " (dropped)" if x in s["dropped"] else ""
            cells.append(f"{x}{tag}: n={len(ys)} median={round(st.median(ys)) if ys else '-'}")
        lines.append(f"{dim:9} " + " | ".join(cells))
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="python -m improvement.arms")
    sub = p.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("assign")
    a.add_argument("--video", required=True)
    sub.add_parser("judge")
    sub.add_parser("status")
    args = p.parse_args(argv)
    if args.cmd == "assign":
        print(json.dumps(assign(args.video)))
    elif args.cmd == "judge":
        v = judge()
        print(json.dumps({"verdicts": v}, indent=2))
        print(status())
    else:
        print(status())
    return 0


if __name__ == "__main__":
    sys.exit(main())
