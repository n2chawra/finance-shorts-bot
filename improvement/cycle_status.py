"""The weekly loop's live scoreboard for the dashboard's Growth loop page (owner, 2026-11-12).

Writes improvement/cycle/status.json: the running challenger (improvement/cycle/backlog.json `running`)
judged exactly as the improver judges it (improvement/evaluate.py), plus how many Shorts each side has
published so far and which ones (`videos`, and `cycleVideos` for every cycle in the history), so the
page can show what is compared with what. Ingest runs it every 6 hours after the numbers are synced; it changes nothing else.

    python -m improvement.cycle_status            # write the file
    python -m improvement.cycle_status --print    # print it instead
"""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

from improvement import evaluate
from generator.channels import cpath

ROOT = Path(__file__).resolve().parents[1]
OUT = Path("improvement") / "cycle" / "status.json"


def _read(path: Path, default):
    return json.loads(path.read_text(encoding="utf-8")) if path.is_file() else default


def _side_videos(shorts: list[dict], eid: str, started: str, metric: str) -> list[dict]:
    """The Shorts on each side of one test, newest first, with the number the test reads from each."""
    rows = []
    for v in shorts:
        side = (v.get("experiments") or {}).get(eid)
        if side not in ("on", "off") or v.get("publishAt", "") < started:
            continue
        views = v.get("analyticsViews") or 0
        value = ((v.get("engagedViews") or 0) / views if views else None) if metric == "stayed" else v.get(metric)
        rows.append({"id": v["id"], "title": v.get("title"), "side": side, "publishAt": v.get("publishAt"),
                     "counted": evaluate._counts(v, metric), "value": round(value, 3) if value is not None else None,
                     "views": v.get("views")})
    return sorted(rows, key=lambda r: r.get("publishAt") or "", reverse=True)


def status(root: Path = ROOT, now: datetime | None = None) -> dict:
    now = now or datetime.now(timezone.utc)
    backlog = _read(cpath(root, "improvement/cycle/backlog.json"), {})
    running = backlog.get("running")
    if isinstance(running, dict):    # 21 Nov: the improver wrote the whole entry here; the id is what everything reads
        running = running.get("id")
    if not isinstance(running, str) or not running:
        running = None
    exps = {e["id"]: e for e in _read(cpath(root, "config/experiments.json"), {"experiments": []})["experiments"]}
    videos = _read(cpath(root, "metrics/videos.json"), {"videos": []})["videos"]
    shorts = [v for v in videos if v.get("format", "short") == "short"]
    # the channel's stayed to watch over the last 14 days, as context for both sides
    since = (now - timedelta(days=14)).isoformat()
    recent = [v for v in shorts if v.get("publishAt", "") >= since and (v.get("analyticsViews") or 0) > 0]
    views = sum(v.get("analyticsViews") or 0 for v in recent)
    base = {
        "generatedAt": now.isoformat(), "cycle": backlog.get("cycle"), "running": running,
        "thresholds": {"keepPoints": round(evaluate.LIFTS["stayed"][0] * 100), "revertPoints": round(evaluate.LIFTS["stayed"][1] * 100),
                       "confidence": evaluate.CONFIDENCE},
        "channelStayed14d": round(sum(v.get("engagedViews") or 0 for v in recent) / views, 3) if views else None,
    }
    metric_of = {"look": "heldAfterHook"}
    base["cycleVideos"] = {c["id"]: _side_videos(shorts, c["id"], c.get("started") or "", metric_of.get(c.get("kind"), "stayed"))
                           for c in backlog.get("history", []) if c.get("id")}
    exp = exps.get(running) if running else None
    if not exp:
        return {**base, "experiment": None}
    entry = next((c for c in backlog.get("history", []) if c.get("id") == running), {})
    report = evaluate.report(root, now)
    judged = next((e for e in report["experiments"] if e["id"] == running), None)
    published = {"on": 0, "off": 0}
    for v in shorts:
        side = (v.get("experiments") or {}).get(running)
        if side in published and v.get("publishAt", "") >= exp.get("startedAt", ""):
            published[side] += 1
    return {**base, "experiment": {
        "id": running, "kind": entry.get("kind"), "area": exp.get("area"), "description": exp.get("description"),
        "on": (exp.get("prompt") or {}).get("on"), "off": (exp.get("prompt") or {}).get("off"),
        "startedAt": exp.get("startedAt"), "metric": (judged or {}).get("metric", exp.get("metric", "stayed")),
        "minPerArm": int(exp.get("minPerArm", evaluate.LOOP_MIN_PER_ARM)), "maxDays": int(exp.get("maxDays", evaluate.LOOP_MAX_DAYS)),
        "extended": bool(exp.get("extended")), "published": published,
        "counted": {"on": (judged or {}).get("n_on", 0), "off": (judged or {}).get("n_off", 0)},
        "value": {"on": (judged or {}).get("value_on"), "off": (judged or {}).get("value_off")},
        "points": (judged or {}).get("points"), "pOnBetter": (judged or {}).get("p_on_better"),
        "days": (judged or {}).get("days"), "verdict": (judged or {}).get("verdict"), "why": (judged or {}).get("why"),
        "videos": _side_videos(shorts, running, exp.get("startedAt", ""), (judged or {}).get("metric", exp.get("metric", "stayed"))),
    }}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--print", action="store_true")
    s = status()
    text = json.dumps(s, indent=2, ensure_ascii=False) + "\n"
    if ap.parse_args().print:
        print(text, end="")
    else:
        (cpath(ROOT, OUT)).write_text(text, encoding="utf-8")
        e = s["experiment"]
        print(f"{OUT}: {e['id']} {e['verdict']}: {e['why']}" if e else f"{OUT}: no challenger running")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
