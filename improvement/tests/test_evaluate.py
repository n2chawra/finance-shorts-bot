from datetime import datetime, timezone

from generator import experiments as exps
from improvement import evaluate as ev

NOW = datetime(2026, 11, 10, tzinfo=timezone.utc)
EXP = {"id": "fast-hook", "area": "hook", "startedAt": "2026-10-20", "templates": ["all"]}


def videos(on_views: list[int], off_views: list[int]) -> list[dict]:
    """Published videos whose ids land in the right arm of EXP."""
    out, i = [], 0
    pools = {"on": list(on_views), "off": list(off_views)}
    while pools["on"] or pools["off"]:
        vid = f"v-202610{21 + i % 9:02d}-{i:02d}"
        arm = exps.variant("fast-hook", vid)
        if pools[arm]:
            out.append({"id": vid, "template": "quiz_countdown", "publishAt": "2026-10-25T07:07:00Z",
                        "experiments": {"fast-hook": arm}, "views48h": pools[arm].pop(), "avgViewPct": 60.0})
        i += 1
    return out


def test_waits_until_enough_videos_per_arm() -> None:
    r = ev.judge(EXP, videos([100] * 3, [100] * 3), [], datetime(2026, 10, 25, tzinfo=timezone.utc))
    assert r["verdict"] == "wait" and "3 of 8" in r["why"]


def test_keeps_a_clear_winner() -> None:
    r = ev.judge(EXP, videos([300, 320, 280, 310, 290, 305, 315, 295, 300], [100, 110, 90, 105, 95, 100, 102, 98, 101]), [], NOW)
    assert r["verdict"] == "keep" and r["ratio"] > 2


def test_reverts_a_clear_loser() -> None:
    r = ev.judge(EXP, videos([50, 40, 60, 55, 45, 50, 52, 48], [200, 210, 190, 205, 195, 200, 202, 198]), [], NOW)
    assert r["verdict"] == "revert"


def test_extends_then_abandons_when_unclear() -> None:
    v = videos([100, 102, 98, 101, 99, 100, 103, 97], [100, 99, 101, 100, 102, 98, 100, 101])
    assert ev.judge(EXP, v, [], NOW)["verdict"] == "extend"
    assert ev.judge({**EXP, "extended": True}, v, [], NOW)["verdict"] == "abandon"


def test_guard_reverts_when_the_change_makes_videos_fail() -> None:
    attempts = []
    for i in range(40):
        vid = f"v-2026102{i % 9}-{i:02d}"
        arm = exps.variant("fast-hook", vid)
        attempts.append({"id": vid, "day": "2026-10-22", "template": "quiz_countdown", "status": "failed" if arm == "on" else "shipped"})
    r = ev.judge(EXP, videos([100] * 2, [100] * 2), attempts, NOW)
    assert r["verdict"] == "revert" and "failures" in r["why"]


def test_the_metric_follows_the_area_and_the_format() -> None:
    assert ev.metric_of(EXP) == "views48h"
    assert ev.metric_of({**EXP, "area": "motion"}) == "avgViewPct"
    assert ev.metric_of({**EXP, "format": "long"}) == "avgViewPct"
    assert ev.metric_of({**EXP, "area": "motion", "metric": "views48h"}) == "views48h"


def test_a_look_change_is_judged_on_retention_within_its_format() -> None:
    look = {**EXP, "area": "motion"}
    vs = videos([100] * 9, [100] * 9)
    for v in vs:
        v["avgViewPct"] = 66.0 if v["experiments"]["fast-hook"] == "on" else 55.0
    longs = [{**v, "format": "long", "avgViewPct": 10.0} for v in vs]     # other format: ignored
    r = ev.judge(look, vs + longs, [], NOW)
    assert r["metric"] == "avgViewPct" and r["n_on"] == 9 and r["verdict"] == "keep"
    assert ev.judge({**look, "format": "long"}, vs, [], NOW)["n_on"] == 0


def test_upload_hours_are_in_ist() -> None:
    assert ev.ist_hour("2026-10-17T07:07:00.000Z") == "12:00-12:59 IST"
    assert ev.ist_hour(None) is None


def test_template_weights_follow_performance_and_retire_the_worst() -> None:
    vs = []
    for i in range(12):
        vs.append({"template": "good", "views48h": 400 + i, "avgViewPct": 70})
        vs.append({"template": "mid", "views48h": 200 + i, "avgViewPct": 60})
        vs.append({"template": "bad", "views48h": 20 + i, "avgViewPct": 40})
    advice = {a["template"]: a for a in ev.template_advice(vs, {"good": {"weight": 1}, "mid": {"weight": 1}, "bad": {"weight": 1}, "new": {"weight": 1}})}
    assert advice["good"]["action"] == "reweight" and advice["good"]["weight"] == 2.0
    assert advice["bad"]["action"] == "retire"
    assert advice["new"]["action"] == "keep" and "fewer than" in advice["new"]["why"]


def test_recurring_failures_need_two_in_three_days() -> None:
    a = [{"id": "v1", "day": "2026-11-09", "template": "t", "status": "failed", "reason": "QA review failed: caption overlaps chart in scene 5"},
         {"id": "v2", "day": "2026-11-08", "template": "t", "status": "failed", "reason": "QA review failed: caption overlaps chart in scene 3"},
         {"id": "v3", "day": "2026-10-01", "template": "t", "status": "failed", "reason": "QA review failed: caption overlaps chart in scene 3"}]
    out = ev.recurring_failures(a, NOW)
    assert len(out) == 1 and out[0]["videos"] == ["v1", "v2"]


def test_hook_experiments_are_judged_on_the_hook_score_once_videos_have_it() -> None:
    vs = videos([100] * 9, [100] * 9)
    assert ev.metric_of(EXP, vs) == "views48h"
    for v in vs:   # same views, but the change keeps far more viewers past the first 3 s
        v["hookHold"] = 0.8 if v["experiments"]["fast-hook"] == "on" else 0.5
    r = ev.judge(EXP, vs, [], NOW)
    assert r["metric"] == "hookHold" and r["verdict"] == "keep"


def test_thumbnail_angles_count_wins_per_test() -> None:
    vs = [{"thumbAngles": ["number", "question", "reaction"], "thumbWinner": "number"},
          {"thumbAngles": ["number", "versus", "reaction"], "thumbWinner": "number"},
          {"thumbAngles": ["question", "reaction", "warning"], "thumbWinner": None},     # not decided yet
          {"thumbAngles": [], "thumbWinner": None}]
    rows = {r["angle"]: r for r in ev.thumbnail_angles(vs)}
    assert rows["number"] == {"angle": "number", "tests": 2, "wins": 2, "winRate": 1.0, "expected": 0.33}
    assert rows["reaction"]["tests"] == 2 and rows["reaction"]["wins"] == 0
    assert ev.thumbnail_angles(vs)[0]["angle"] == "number"
