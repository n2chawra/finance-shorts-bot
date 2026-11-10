"""Is the channel getting better? (owner, 2026-11-10: "keep an eye on whether we are improving the channel ... swipe
rate, average view duration ... just improving with no results means wasted money").

Two answers, written to `improvement/weekly/impact.json` for the dashboard and read by the improver every night:
- `weeks`: Shorts by IST publish week: median views in 48 h, average % viewed, stayed to watch (YouTube's engaged
  views ÷ views: the share who didn't swipe away) and average view duration in seconds. These are the numbers
  YouTube uses to decide whether to show a Short to more people.
- `changes`: every change the improver landed (adopted, kept or reverted in `improvement/experiments.json`),
  with the Shorts published in the 14 days before it and the 14 days after. Several changes land the same
  week, so this is a before/after, not proof; A/B experiments and the variant system give the causal answer.

    python -m generator.impact            # print the weeks and the changes, write the JSON
"""
from __future__ import annotations

import json
import statistics
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = Path("improvement/weekly/impact.json")
IST = timezone(timedelta(hours=5, minutes=30))
WINDOW = 14
LANDED = ("adopted", "kept", "reverted")


def _read(path: Path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return default


def shorts(root: Path = ROOT) -> list[dict]:
    """Published Shorts with 48 h data, joined with Studio numbers (stayed to watch, duration)."""
    studio = {v["id"]: v for v in _read(root / "metrics" / "analytics.json", {}).get("videos", []) if v.get("id")}
    out = []
    for v in _read(root / "metrics" / "videos.json", {"videos": []}).get("videos", []):
        if v.get("format", "short") != "short" or v.get("views48h") is None or not v.get("publishAt"):
            continue
        s = studio.get(v["id"], {})
        dur = v.get("durationSec") or s.get("durationSec")
        pct = v.get("avgViewPct")
        day = datetime.fromisoformat(v["publishAt"].replace("Z", "+00:00")).astimezone(IST).date()
        out.append({"id": v["id"], "day": day, "views48h": v["views48h"], "avgViewPct": pct,
                    "stayed": s.get("engagedRatio") if s.get("views") else None,
                    "avgViewSec": round(dur * pct / 100, 1) if dur and pct is not None else None})
    return sorted(out, key=lambda v: v["day"])


def summary(videos: list[dict]) -> dict:
    def mean(k: str):
        xs = [v[k] for v in videos if v.get(k) is not None]
        return round(statistics.mean(xs), 3 if k == "stayed" else 1) if xs else None
    views = [v["views48h"] for v in videos]
    return {"n": len(videos), "medianViews48h": statistics.median(views) if views else None,
            "avgViewPct": mean("avgViewPct"), "stayedToWatch": mean("stayed"), "avgViewSec": mean("avgViewSec")}


def weeks(videos: list[dict]) -> list[dict]:
    by: dict[date, list[dict]] = {}
    for v in videos:
        by.setdefault(v["day"] - timedelta(days=v["day"].weekday()), []).append(v)
    return [{"week": monday.isoformat(), **summary(vs)} for monday, vs in sorted(by.items())]


def changes(videos: list[dict], root: Path = ROOT) -> list[dict]:
    exps = _read(root / "improvement" / "experiments.json", {"experiments": []})
    exps = exps if isinstance(exps, list) else exps.get("experiments", [])
    out = []
    for e in exps:
        if e.get("status") not in LANDED or e.get("format", "short") != "short" or not e.get("startedAt"):
            continue
        on = date.fromisoformat(str(e.get("closedAt") or e["startedAt"])[:10])
        before = [v for v in videos if on - timedelta(days=WINDOW) <= v["day"] < on]
        after = [v for v in videos if on <= v["day"] < on + timedelta(days=WINDOW)]
        b, a = summary(before), summary(after)
        ratio = round(a["medianViews48h"] / b["medianViews48h"], 2) if a["n"] and b["n"] and b["medianViews48h"] else None
        out.append({"id": e["id"], "area": e.get("area"), "status": e["status"], "day": on.isoformat(),
                    "description": e.get("description") or e.get("hypothesis") or "", "before": b, "after": a,
                    "viewsRatio": ratio, "sameWeek": sum(1 for x in exps if x is not e and x.get("status") in LANDED
                                                          and abs((date.fromisoformat(str(x.get("closedAt") or x.get("startedAt") or "1970-01-01")[:10]) - on).days) <= 3)})
    return sorted(out, key=lambda c: c["day"], reverse=True)


def report(root: Path = ROOT) -> dict:
    videos = shorts(root)
    return {"note": "Written by python -m generator.impact (improver, nightly). weeks: Shorts by IST publish week; "
                    "stayedToWatch = engaged views / views (did not swipe away); changes: Shorts 14 days before vs after "
                    "each landed change (sameWeek = other changes within 3 days, so effects mix).",
            "updatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "weeks": weeks(videos), "changes": changes(videos, root)}


def main() -> int:
    r = report()
    (ROOT / OUT).parent.mkdir(parents=True, exist_ok=True)
    (ROOT / OUT).write_text(json.dumps(r, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print("Shorts by week (median 48 h views | % viewed | stayed to watch | avg view s):")
    for w in r["weeks"]:
        print(f"  {w['week']}  n={w['n']:<2} {w['medianViews48h']!s:>6} | {w['avgViewPct']!s:>5}% | {w['stayedToWatch']!s:>5} | {w['avgViewSec']!s:>5}")
    print("Landed changes, 14 days before -> after (median 48 h views):")
    for c in r["changes"][:12]:
        print(f"  {c['day']} {c['id']}: {c['before']['medianViews48h']} (n {c['before']['n']}) -> {c['after']['medianViews48h']} "
              f"(n {c['after']['n']}), {c['sameWeek']} other changes that week")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
