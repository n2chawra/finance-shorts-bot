"""Judge experiments and rank what performs, by fixed rules. The improver agent applies the verdicts;
it does not make them up.

    python -m improvement.evaluate            # readable report
    python -m improvement.evaluate --json     # the same as JSON

Inputs (written by the ingest workflow, agents have no database access):
  metrics/videos.json  published videos: id, template, hookStyle, palette, genre, bpm, durationSec,
                       category, publishAt, experiments {id: on|off}, views48h, avgViewPct, views
  metrics/runs.json    every attempted video: id, day, template, status shipped|failed, reason
  config/experiments.json  running experiments (see generator/experiments.py)

Primary metric: views in the first two days (comparable across ages). Secondary: average % viewed.
Guard: share of attempts that failed QA/fact review.
"""
from __future__ import annotations

import argparse
import json
import random
import statistics
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from generator import experiments as exps  # noqa: E402

MIN_PER_ARM = 8          # videos per arm with 48 h data before judging
MAX_DAYS = 14            # judge anyway after this long
KEEP_LIFT = 1.10         # on-arm median ≥ 110% of off-arm
REVERT_DROP = 0.90       # on-arm median ≤ 90% of off-arm
CONFIDENCE = 0.80        # bootstrap probability required
GUARD_PP = 0.15          # extra failure share in the on-arm that forces a revert
MIN_TEMPLATE_N = 6       # videos before a template's weight follows performance
RETIRE_N = 10
WEIGHT_RANGE = (0.4, 2.0)


def _read(path: Path, default):
    return json.loads(path.read_text(encoding="utf-8")) if path.is_file() else default


def _median(xs: list[float]) -> float:
    return statistics.median(xs) if xs else 0.0


def prob_greater(a: list[float], b: list[float], n: int = 2000, seed: int = 7) -> float:
    """Bootstrap P(median(a) > median(b)). Deterministic for a given input."""
    if not a or not b:
        return 0.5
    r = random.Random(seed)
    wins = 0
    for _ in range(n):
        ma = statistics.median(r.choices(a, k=len(a)))
        mb = statistics.median(r.choices(b, k=len(b)))
        wins += ma > mb or (ma == mb and r.random() < 0.5)
    return wins/n


def judge(exp: dict, videos: list[dict], attempts: list[dict], now: datetime) -> dict:
    """Verdict for one experiment: wait | keep | revert | extend | abandon."""
    eid = exp["id"]
    started = exp.get("startedAt", "1970-01-01")
    share = float(exp.get("share", 0.5))
    arms: dict[str, list[dict]] = {"on": [], "off": []}
    for v in videos:
        if v.get("publishAt", "") < started or v.get("views48h") is None:
            continue
        variant = (v.get("experiments") or {}).get(eid)
        if variant in arms:
            arms[variant].append(v)
    on = [v["views48h"] + 1 for v in arms["on"]]     # +1 so zero-view arms still compare
    off = [v["views48h"] + 1 for v in arms["off"]]
    pct_on = [v["avgViewPct"] for v in arms["on"] if v.get("avgViewPct") is not None]
    pct_off = [v["avgViewPct"] for v in arms["off"] if v.get("avgViewPct") is not None]

    # guard: failures among attempts since the start, by the variant the attempt would have had
    tried = {"on": [0, 0], "off": [0, 0]}
    for a in attempts:
        if a.get("day", "") < started[:10] or not exps.applies(exp, a.get("template")):
            continue
        arm = exps.variant(eid, a["id"], share)
        tried[arm][0] += 1
        tried[arm][1] += a.get("status") == "failed"
    fail_on = tried["on"][1]/tried["on"][0] if tried["on"][0] else 0.0
    fail_off = tried["off"][1]/tried["off"][0] if tried["off"][0] else 0.0
    guard_bad = tried["on"][0] >= 4 and fail_on - fail_off >= GUARD_PP

    days = (now - datetime.fromisoformat(started.replace("Z", "+00:00")).astimezone(timezone.utc)).days if "T" in started \
        else (now.date() - datetime.fromisoformat(started).date()).days
    n = min(len(on), len(off))
    min_per_arm = int(exp.get("minPerArm", MIN_PER_ARM))
    max_days = int(exp.get("maxDays", MAX_DAYS))
    ratio = _median(on)/_median(off) if off else None
    p_up = prob_greater(on, off)
    out = {
        "id": eid, "area": exp.get("area"), "days": days, "n_on": len(on), "n_off": len(off),
        "median48h_on": _median(on) - 1 if on else None, "median48h_off": _median(off) - 1 if off else None,
        "ratio": round(ratio, 3) if ratio else None, "p_on_better": round(p_up, 3),
        "avgPct_on": round(statistics.mean(pct_on), 1) if pct_on else None,
        "avgPct_off": round(statistics.mean(pct_off), 1) if pct_off else None,
        "fail_on": round(fail_on, 2), "fail_off": round(fail_off, 2), "attempts_on": tried["on"][0], "attempts_off": tried["off"][0],
    }
    if guard_bad:
        return {**out, "verdict": "revert", "why": f"QA/fact failures {fail_on:.0%} with the change vs {fail_off:.0%} without"}
    if n < min_per_arm and days < max_days:
        need = min_per_arm - n
        return {**out, "verdict": "wait", "why": f"{n} of {min_per_arm} videos per arm have 48 h data; about {need} more days at 2 uploads a day"}
    if ratio is not None and ratio >= KEEP_LIFT and p_up >= CONFIDENCE:
        return {**out, "verdict": "keep", "why": f"{(ratio - 1):+.0%} views in 48 h, {p_up:.0%} confidence"}
    if ratio is not None and ratio <= REVERT_DROP and 1 - p_up >= CONFIDENCE:
        return {**out, "verdict": "revert", "why": f"{(ratio - 1):+.0%} views in 48 h, {1 - p_up:.0%} confidence it is worse"}
    if exp.get("extended"):
        return {**out, "verdict": "abandon", "why": "no clear effect after the extension; remove the flag"}
    return {**out, "verdict": "extend", "why": "no clear effect yet; extend once (set extended: true, add maxDays 14)"}


def rank(videos: list[dict], key, label: str) -> list[dict]:
    """Median 48 h views and mean % viewed per group, relative to all videos."""
    scored = [v for v in videos if v.get("views48h") is not None]
    if not scored:
        return []
    overall = _median([v["views48h"] for v in scored]) or 1
    groups: dict[str, list[dict]] = {}
    for v in scored:
        k = key(v)
        if k is not None:
            groups.setdefault(str(k), []).append(v)
    rows = []
    for k, vs in groups.items():
        views = [v["views48h"] for v in vs]
        pcts = [v["avgViewPct"] for v in vs if v.get("avgViewPct") is not None]
        rest = [v["views48h"] + 1 for v in scored if str(key(v)) != k]
        rows.append({"by": label, "value": k, "n": len(vs), "median48h": _median(views), "relative": round(_median(views)/overall, 2),
                     "avgPct": round(statistics.mean(pcts), 1) if pcts else None,
                     "p_better_than_rest": round(prob_greater([x + 1 for x in views], rest), 2) if rest else None})
    return sorted(rows, key=lambda r: -r["relative"])


def template_advice(videos: list[dict], enabled: dict[str, dict]) -> list[dict]:
    """Weight (performance-proportional, clamped) and retire candidates, by fixed rules."""
    rows = {r["value"]: r for r in rank(videos, lambda v: v.get("template"), "template")}
    advice = []
    for t, cfg in enabled.items():
        r = rows.get(t)
        current = float(cfg.get("weight", 1.0))
        if not r or r["n"] < MIN_TEMPLATE_N:
            advice.append({"template": t, "n": r["n"] if r else 0, "action": "keep", "weight": current, "why": f"fewer than {MIN_TEMPLATE_N} videos with data"})
            continue
        lo, hi = WEIGHT_RANGE
        weight = round(min(hi, max(lo, r["relative"])), 1)
        worse = r["p_better_than_rest"] is not None and 1 - r["p_better_than_rest"] >= CONFIDENCE
        if r["n"] >= RETIRE_N and worse and r["relative"] < 0.75:
            advice.append({"template": t, "n": r["n"], "action": "retire", "weight": 0, "why": f"{r['relative']:.2f}× the median with {1 - r['p_better_than_rest']:.0%} confidence it is worse"})
        elif abs(weight - current) >= 0.1:
            advice.append({"template": t, "n": r["n"], "action": "reweight", "weight": weight, "why": f"{r['relative']:.2f}× the median 48 h views"})
        else:
            advice.append({"template": t, "n": r["n"], "action": "keep", "weight": current, "why": "weight already matches performance"})
    return advice


def recurring_failures(attempts: list[dict], now: datetime, days: int = 3) -> list[dict]:
    """Failure reasons seen at least twice in the last `days` days (by template + first words)."""
    since = (now.date().toordinal() - days)
    seen: dict[str, list[str]] = {}
    for a in attempts:
        if a.get("status") != "failed" or not a.get("reason"):
            continue
        try:
            if datetime.fromisoformat(a["day"]).date().toordinal() < since:
                continue
        except ValueError:
            continue
        key = f"{a.get('template')}: {' '.join(a['reason'].split()[:6])}"
        seen.setdefault(key, []).append(a["id"])
    return [{"pattern": k, "videos": v} for k, v in seen.items() if len(v) >= 2]


def report(root: Path = ROOT, now: datetime | None = None) -> dict:
    now = now or datetime.now(timezone.utc)
    videos = _read(root / "metrics" / "videos.json", {"videos": []})["videos"]
    attempts = _read(root / "metrics" / "runs.json", {"videos": []})["videos"]
    settings = _read(root / "config" / "settings.json", {})
    enabled = {t: c for t, c in settings.get("templates", {}).items() if c.get("enabled", True)}
    band = lambda b: None if b is None else f"{int(b)//10*10}-{int(b)//10*10 + 9} BPM"  # noqa: E731
    length = lambda d: None if d is None else f"{int(d)//5*5}-{int(d)//5*5 + 4} s"  # noqa: E731
    return {
        "generatedAt": now.isoformat(), "videosWithData": sum(v.get("views48h") is not None for v in videos),
        "experiments": [judge(e, videos, attempts, now) for e in exps.load(root)],
        "templates": template_advice(videos, enabled),
        "attributes": [*rank(videos, lambda v: v.get("hookStyle"), "hook style"), *rank(videos, lambda v: v.get("palette"), "palette"),
                       *rank(videos, lambda v: v.get("genre"), "music genre"), *rank(videos, lambda v: band(v.get("bpm")), "tempo"),
                       *rank(videos, lambda v: length(v.get("durationSec")), "length"), *rank(videos, lambda v: v.get("category"), "topic")],
        "recurringFailures": recurring_failures(attempts, now),
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--json", action="store_true")
    r = report()
    if ap.parse_args().json:
        print(json.dumps(r, indent=2, ensure_ascii=False))
        return 0
    print(f"Videos with 48 h data: {r['videosWithData']}")
    print("\nExperiments:" if r["experiments"] else "\nExperiments: none running")
    for e in r["experiments"]:
        print(f"  {e['id']} [{e['area']}] {e['verdict'].upper()}: {e['why']} (on {e['n_on']}, off {e['n_off']})")
    print("\nTemplates:")
    for t in r["templates"]:
        print(f"  {t['template']}: {t['action']} → weight {t['weight']} ({t['why']})")
    print("\nWhat performs (relative to the median, n ≥ 3):")
    for a in r["attributes"]:
        if a["n"] >= 3:
            print(f"  {a['by']:>11} {a['value']:<22} {a['relative']:.2f}×  n={a['n']}  avg viewed {a['avgPct']}%")
    if r["recurringFailures"]:
        print("\nRecurring failures (fix these):")
        for f in r["recurringFailures"]:
            print(f"  {f['pattern']} ({len(f['videos'])}×)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
