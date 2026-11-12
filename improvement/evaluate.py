"""Judge experiments and rank what performs, by fixed rules. The improver agent applies the verdicts;
it does not make them up.

    python -m improvement.evaluate            # readable report
    python -m improvement.evaluate --json     # the same as JSON

Inputs (written by the ingest workflow, agents have no database access):
  metrics/videos.json  published videos: id, format, template, hookStyle, title, palette, genre, bpm,
                       durationSec, category, publishAt, experiments {id: on|off}, views48h, views7d,
                       avgViewPct, views
  history/history.json each video's story
  metrics/runs.json    every attempted video: id, day, template, status shipped|failed, reason
  config/experiments.json  running experiments (see generator/experiments.py)

Each experiment is judged within one format (`format`: short, the default, or long) on one metric:
  views48h     views in the first two days (comparable across ages): hooks, titles, topics, scripts
  avgViewPct   average % viewed: how a video looks, moves and sounds, and every long-video change.
               It depends far less on the algorithm's luck than views do while the channel is small.
  views7d      views in the first seven days, for long videos whose views come slowly
  hookHold     viewers still watching at 3 s (Short) or 30 s (long), from YouTube's retention curve
               (workers/lib/retention.ts): the hook's own score.

The weekly loop (owner, 2026-11-12): every Shorts experiment is one challenger against the champion
recipe, judged on one of two numbers that swing far less than views do:
  stayed         engaged views / views, pooled over each side's Shorts (did not swipe away): the first
                 second, the title, the topic, the story. The default for Shorts.
  heldAfterHook  of the viewers still there at 3 s, the share who reach the end: the look, motion and
                 sound after the hook (areas in RETENTION_AREAS).
A challenger is kept 5 points or more up with 80% bootstrap confidence, reverted 5 points or more down,
judged from LOOP_MIN_PER_ARM Shorts a side, extended once to 14 days, then abandoned.
An experiment may name its `metric`; otherwise its area and format decide. A video counts once
Analytics has its second day. Guard: share of attempts that failed QA/fact review.
"""
from __future__ import annotations

import argparse
import json
import random
import statistics
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from generator import experiments as exps  # noqa: E402
from generator import variety  # noqa: E402

IST = timezone(timedelta(hours=5, minutes=30))

MIN_PER_ARM = 4          # videos per arm with 48 h data before judging (8 until 2026-11-04: weeks per test)
MAX_DAYS = 7             # judge anyway after this long (14 until 2026-11-04)
KEEP_LIFT = 1.10         # on-arm median ≥ 110% of off-arm (views)
REVERT_DROP = 0.90       # on-arm median ≤ 90% of off-arm (views)
# % viewed moves less than views do: five points on fifty is a real change
LIFTS = {"views48h": (KEEP_LIFT, REVERT_DROP), "views7d": (KEEP_LIFT, REVERT_DROP), "avgViewPct": (1.05, 0.95), "hookHold": (1.05, 0.95),
         "stayed": (0.05, -0.05), "heldAfterHook": (0.05, -0.05)}   # the loop's two: a difference in points, not a ratio
LOOP_METRICS = ("stayed", "heldAfterHook")
LOOP_MIN_PER_ARM = 8     # Shorts a side with two days of data (about a week at 3 a day, half on each side)
LOOP_MAX_DAYS = 7
METRICS = tuple(LIFTS)
RETENTION_AREAS = frozenset({"motion", "pacing", "text", "colour", "sound", "music", "voice", "ending", "scene", "template"})
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


def metric_of(exp: dict, videos: list[dict] | None = None) -> str:
    """What an experiment is judged on: its own `metric`; a long video on % viewed; a Short on the weekly
    loop's numbers (held after the hook for look, motion and sound, stayed to watch for everything else)."""
    if exp.get("metric") in METRICS:
        return exp["metric"]
    if exp.get("format", "short") == "long":
        return "avgViewPct"
    return "heldAfterHook" if exp.get("area") in RETENTION_AREAS else "stayed"


def _pooled(vs: list[dict]) -> float | None:
    views = sum(v.get("analyticsViews") or 0 for v in vs)
    return sum(v.get("engagedViews") or 0 for v in vs) / views if views else None


def _loop_value(vs: list[dict], metric: str) -> float | None:
    if metric == "stayed":
        return _pooled(vs)
    xs = [v[metric] for v in vs if v.get(metric) is not None]
    return statistics.mean(xs) if xs else None


def _loop_prob(on: list[dict], off: list[dict], metric: str, n: int = 2000, seed: int = 7) -> float:
    """Bootstrap P(on's value > off's), resampling whole Shorts on each side."""
    if not on or not off:
        return 0.5
    r = random.Random(seed)
    wins = 0
    for _ in range(n):
        a, b = _loop_value(r.choices(on, k=len(on)), metric), _loop_value(r.choices(off, k=len(off)), metric)
        if a is None or b is None:
            continue
        wins += a > b or (a == b and r.random() < 0.5)
    return wins/n


def _counts(v: dict, metric: str) -> bool:
    if v.get("views48h") is None:          # Analytics has its second day
        return False
    return (v.get("analyticsViews") or 0) > 0 if metric == "stayed" else v.get(metric) is not None


def judge_loop(exp: dict, videos: list[dict], days: int, guard: tuple[bool, float, float], out: dict) -> dict:
    """A Short challenger against the champion, on a difference in points (the weekly loop)."""
    eid, metric = exp["id"], out["metric"]
    arms: dict[str, list[dict]] = {"on": [], "off": []}
    for v in videos:
        if v.get("publishAt", "") < exp.get("startedAt", "1970-01-01") or v.get("format", "short") != "short" or not _counts(v, metric):
            continue
        side = (v.get("experiments") or {}).get(eid)
        if side in arms:
            arms[side].append(v)
    on_v, off_v = _loop_value(arms["on"], metric), _loop_value(arms["off"], metric)
    diff = on_v - off_v if on_v is not None and off_v is not None else None
    p_up = _loop_prob(arms["on"], arms["off"], metric)
    n = min(len(arms["on"]), len(arms["off"]))
    need, max_days = int(exp.get("minPerArm", LOOP_MIN_PER_ARM)), int(exp.get("maxDays", LOOP_MAX_DAYS))
    out = {**out, "n_on": len(arms["on"]), "n_off": len(arms["off"]),
           "value_on": round(on_v, 3) if on_v is not None else None, "value_off": round(off_v, 3) if off_v is not None else None,
           "points": round(diff * 100, 1) if diff is not None else None, "p_on_better": round(p_up, 3)}
    label = {"stayed": "stayed to watch", "heldAfterHook": "held after the hook"}[metric]
    guard_bad, fail_on, fail_off = guard
    if guard_bad:
        return {**out, "verdict": "revert", "why": f"QA/fact failures {fail_on:.0%} with the change vs {fail_off:.0%} without"}
    keep, drop = LIFTS[metric]
    if n >= need and diff is not None:
        if diff >= keep and p_up >= CONFIDENCE:
            return {**out, "verdict": "keep", "why": f"{diff * 100:+.1f} points {label} ({on_v:.0%} vs {off_v:.0%}), {p_up:.0%} confidence"}
        if diff <= drop and 1 - p_up >= CONFIDENCE:
            return {**out, "verdict": "revert", "why": f"{diff * 100:+.1f} points {label} ({on_v:.0%} vs {off_v:.0%}), {1 - p_up:.0%} confidence it is worse"}
    if days < max_days and (n < need or exp.get("extended")):
        return {**out, "verdict": "wait", "why": f"{n} of {need} Shorts a side have two days of data; day {days} of {max_days}"}
    if exp.get("extended"):
        return {**out, "verdict": "abandon", "why": f"no clear difference in {label} after the extension; remove it and start the next challenger"}
    return {**out, "verdict": "extend", "why": f"no clear difference in {label} yet; extend once (extended: true, maxDays 14)"}


def judge(exp: dict, videos: list[dict], attempts: list[dict], now: datetime) -> dict:
    """Verdict for one experiment: wait | keep | revert | extend | abandon."""
    eid = exp["id"]
    started = exp.get("startedAt", "1970-01-01")
    share = float(exp.get("share", 0.5))
    fmt, metric = exp.get("format", "short"), metric_of(exp, videos)
    keep_lift, revert_drop = LIFTS[metric]
    arms: dict[str, list[dict]] = {"on": [], "off": []}
    for v in videos:
        if v.get("publishAt", "") < started or v.get("format", "short") != fmt or v.get("views48h") is None or v.get(metric) is None:
            continue
        variant = (v.get("experiments") or {}).get(eid)
        if variant in arms:
            arms[variant].append(v)
    smooth = 0 if metric in ("avgViewPct", "hookHold") else 1     # +1 so zero-view arms still compare
    on = [v[metric] + smooth for v in arms["on"]]
    off = [v[metric] + smooth for v in arms["off"]]
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
        "id": eid, "area": exp.get("area"), "format": fmt, "metric": metric, "days": days, "n_on": len(on), "n_off": len(off),
        "median_on": _median(on) - smooth if on else None, "median_off": _median(off) - smooth if off else None,
        "ratio": round(ratio, 3) if ratio else None, "p_on_better": round(p_up, 3),
        "avgPct_on": round(statistics.mean(pct_on), 1) if pct_on else None,
        "avgPct_off": round(statistics.mean(pct_off), 1) if pct_off else None,
        "fail_on": round(fail_on, 2), "fail_off": round(fail_off, 2), "attempts_on": tried["on"][0], "attempts_off": tried["off"][0],
    }
    if metric in LOOP_METRICS:
        return judge_loop(exp, videos, days, (guard_bad, fail_on, fail_off), out)
    # an extension gives the test until its new maxDays before an unclear result is abandoned (owner-approved
    # 2026-11-03: hook-voice-matches-frame was extended one night and abandoned the next with no new data)
    if exp.get("extended") and days < max_days and not guard_bad:
        return {**out, "verdict": "wait", "why": f"extended to {max_days} days; day {days}"}
    if guard_bad:
        return {**out, "verdict": "revert", "why": f"QA/fact failures {fail_on:.0%} with the change vs {fail_off:.0%} without"}
    label = {"views48h": "views in 48 h", "views7d": "views in 7 days", "avgViewPct": "average % viewed", "hookHold": "viewers kept past the hook"}[metric]
    # a big effect (2x either way) decides from 3 videos per arm (owner, 2026-11-04: "48 hrs is enough")
    big = ratio is not None and n >= 3 and (ratio >= 2 or ratio <= 0.5) and max(p_up, 1 - p_up) >= CONFIDENCE
    if n < min_per_arm and days < max_days and not big:
        need = min_per_arm - n
        pace = "about one more long video per arm a week" if fmt == "long" else f"about {need} more days at 3 uploads a day"
        return {**out, "verdict": "wait", "why": f"{n} of {min_per_arm} {fmt} videos per arm have data; {pace}"}
    if ratio is not None and ratio >= keep_lift and p_up >= CONFIDENCE:
        return {**out, "verdict": "keep", "why": f"{(ratio - 1):+.0%} {label}, {p_up:.0%} confidence"}
    if ratio is not None and ratio <= revert_drop and 1 - p_up >= CONFIDENCE:
        return {**out, "verdict": "revert", "why": f"{(ratio - 1):+.0%} {label}, {1 - p_up:.0%} confidence it is worse"}
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
        holds = [v["hookHold"] for v in vs if v.get("hookHold") is not None]
        rest = [v["views48h"] + 1 for v in scored if str(key(v)) != k]
        rows.append({"by": label, "value": k, "n": len(vs), "median48h": _median(views), "relative": round(_median(views)/overall, 2),
                     "avgPct": round(statistics.mean(pcts), 1) if pcts else None,
                     "hookHold": round(statistics.mean(holds), 3) if holds else None,
                     "p_better_than_rest": round(prob_greater([x + 1 for x in views], rest), 2) if rest else None})
    return sorted(rows, key=lambda r: -r["relative"])


def thumbnail_angles(videos: list[dict], key: str = "thumbAngles", winner_key: str = "thumbWinner") -> list[dict]:
    """Which thumbnail angle (or, with key thumbLayouts, type) wins YouTube's Test & Compare: for every
    one, how often it was in a test and how often it won (the owner logs the winner on the dashboard).
    Ranked by win rate."""
    tested: dict[str, int] = {}
    won: dict[str, int] = {}
    for v in videos:
        angles, winner = [a for a in v.get(key) or [] if a], v.get(winner_key)
        if len(angles) < 2 or not winner:
            continue
        for a in angles:
            tested[a] = tested.get(a, 0) + 1
        won[winner] = won.get(winner, 0) + 1
    rows = [{"angle": a, "tests": n, "wins": won.get(a, 0), "winRate": round(won.get(a, 0) / n, 2),
             "expected": round(1 / 3, 2)} for a, n in tested.items()]
    return sorted(rows, key=lambda r: (-r["winRate"], -r["tests"]))


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


def ist_hour(at: str | None) -> str | None:
    """'12:00-12:59 IST' for a publish time, so upload slots can be compared."""
    if not at:
        return None
    t = datetime.fromisoformat(at.replace("Z", "+00:00")).astimezone(IST)
    return f"{t.hour:02d}:00-{t.hour:02d}:59 IST"


def attributes(videos: list[dict], stories: dict[str, str | None], shapes: dict[str, str | None] | None = None) -> list[dict]:
    """What performs, by every choice a video run makes, ranked within one format."""
    band = lambda b: None if b is None else f"{int(b)//10*10}-{int(b)//10*10 + 9} BPM"  # noqa: E731
    length = lambda d: None if d is None else f"{int(d)//5*5}-{int(d)//5*5 + 4} s"  # noqa: E731
    keys = [(lambda v: stories.get(v["id"]), "story"), (lambda v: (shapes or {}).get(v["id"]), "shape"),
            (lambda v: v.get("hookStyle"), "hook style"),
            (lambda v: variety.title_shape(v["title"]) if v.get("title") else None, "title shape"),
            (lambda v: v.get("category"), "topic"), (lambda v: ist_hour(v.get("publishAt")), "upload hour"),
            (lambda v: v.get("palette"), "palette"), (lambda v: v.get("genre"), "music genre"),
            (lambda v: band(v.get("bpm")), "tempo"), (lambda v: v.get("voice") or "none", "voice"),
            (lambda v: length(v.get("durationSec")), "length"),
            # what viewers hear (research evaluate-voice-heard, 2026-11-03): the first line's voice and the
            # narrator's share of the words, and how far the music sits under the voice
            (lambda v: v.get("hookVoice"), "hook voice"),
            (lambda v: None if v.get("narratorShare") is None else ["0-24%", "25-49%", "50-74%", "75-100%"][min(3, int(v["narratorShare"]) // 25)] + " of words", "narrator"),
            (lambda v: None if v.get("musicUnderVoiceDb") is None else "music under 15 dB" if v["musicUnderVoiceDb"] < 15 else "music 15-20 dB under" if v["musicUnderVoiceDb"] < 20 else "music 20+ dB under", "music under voice")]
    return [row for key, label in keys for row in rank(videos, key, label)]


def _heard(root: Path, videos: list[dict]) -> list[dict]:
    """Each row with what viewers heard, from the video's manifest, or worked out from its script."""
    from renderer.timeline.build import CAST_VOICES
    out = []
    for v in videos:
        d = root / "videos" / str(v.get("id"))
        man = _read(d / "manifest.json", {})
        extra = dict(man.get("heard") or {})
        if "narratorShare" not in extra and (d / "script.json").is_file():
            script = _read(d / "script.json", {})
            lines = [(b.get("speaker") or "narrator", len((b.get("say") or "").split())) for b in script.get("beats") or [] if (b.get("say") or "").strip()]
            if lines:
                total = sum(n for _, n in lines)
                narrator = (man.get("voice") or {}).get("name") if isinstance(man.get("voice"), dict) else (man.get("style") or {}).get("voice")
                extra = {"hookVoice": CAST_VOICES.get(lines[0][0], narrator),
                         "narratorShare": round(100 * sum(n for who, n in lines if who not in CAST_VOICES) / total)}
        audio = man.get("audio") or {}
        if audio.get("music_under_voice_db") is not None:
            extra["musicUnderVoiceDb"] = audio["music_under_voice_db"]
        out.append({**extra, **v})
    return out




def report(root: Path = ROOT, now: datetime | None = None) -> dict:
    now = now or datetime.now(timezone.utc)
    videos = _heard(root, _read(root / "metrics" / "videos.json", {"videos": []})["videos"])
    # views exactly 48 h after publishing from the public counter (no Analytics lag) when we have them
    for v in videos:
        if v.get("views48hLive") is not None:
            v["views48h"] = v["views48hLive"]
    attempts = _read(root / "metrics" / "runs.json", {"videos": []})["videos"]
    stories = {e["id"]: variety.story_of(e) for e in _read(root / "history" / "history.json", [])}
    shapes = {e["id"]: e.get("shape") for e in _read(root / "history" / "history.json", [])}
    by_format = {f: [v for v in videos if v.get("format", "short") == f] for f in ("short", "long")}
    return {
        "generatedAt": now.isoformat(), "videosWithData": sum(v.get("views48h") is not None for v in videos),
        "experiments": [judge(e, videos, attempts, now) for e in exps.load(root)],
        "attributes": {f: attributes(vs, stories, shapes) for f, vs in by_format.items()},
        "thumbnailAngles": thumbnail_angles(videos),
        # long-video thumbnail types (renderer/thumbs.py): which kind of picture gets the click
        "thumbnailTypes": thumbnail_angles(videos, "thumbLayouts", "thumbWinnerLayout"),
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
        print(f"  {e['id']} [{e['area']}, {e['format']}, {e['metric']}] {e['verdict'].upper()}: {e['why']} (on {e['n_on']}, off {e['n_off']})")
    for fmt, rows in r["attributes"].items():
        print(f"\nWhat performs in {fmt} videos (48 h views relative to the median, n ≥ 3):")
        for a in rows:
            if a["n"] >= 3:
                hook = f"  kept past the hook {a['hookHold']:.0%}" if a.get("hookHold") is not None else ""
                print(f"  {a['by']:>11} {a['value']:<26} {a['relative']:.2f}×  n={a['n']}  avg viewed {a['avgPct']}%{hook}")
    if r["thumbnailAngles"]:
        print("\nThumbnail angles in Test & Compare (a third is chance with three thumbnails):")
        for t in r["thumbnailAngles"]:
            print(f"  {t['angle']:<10} won {t['wins']} of {t['tests']} tests ({t['winRate']:.0%})")
    if r["thumbnailTypes"]:
        print("\nThumbnail types in Test & Compare (long videos):")
        for t in r["thumbnailTypes"]:
            print(f"  {t['angle']:<10} won {t['wins']} of {t['tests']} tests ({t['winRate']:.0%})")
    if r["recurringFailures"]:
        print("\nRecurring failures (fix these):")
        for f in r["recurringFailures"]:
            print(f"  {f['pattern']} ({len(f['videos'])}×)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
