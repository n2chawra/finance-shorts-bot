import json
from datetime import datetime, timezone
from pathlib import Path

from improvement import arms

CFG = {
    "maxChanged": 2, "exploreShare": 0.4, "minN": 4, "fastN": 3, "dropRatio": 0.5, "promoteRatio": 1.5, "fastRatio": 2.0, "confidence": 0.8,
    "dimensions": {
        "length": {"options": ["20-27", "28-35"], "default": "28-35", "since": "2026-10-01"},
        "title": {"options": ["figure_or_name", "plain"], "default": "figure_or_name", "since": "2026-10-01"},
        "category": {"options": ["22", "27"], "default": "22", "since": "2026-10-01"},
    },
}


def root_with(tmp: Path, videos: list[dict], plans: dict[str, dict] | None = None) -> Path:
    (tmp / "config").mkdir()
    (tmp / "metrics").mkdir()
    (tmp / "improvement").mkdir()
    (tmp / "config" / "arms.json").write_text(json.dumps(CFG))
    (tmp / "metrics" / "videos.json").write_text(json.dumps({"videos": videos}))
    for vid, plan in (plans or {}).items():
        (tmp / "videos" / vid).mkdir(parents=True)
        (tmp / "videos" / vid / "plan.json").write_text(json.dumps(plan))
    return tmp


def short(i: int, sec: float, views: int, title: str = "Why Google pays Apple $20B", manual: bool = True, live: int | None = None) -> dict:
    return {"id": f"v-{i:03d}", "format": "short", "durationSec": sec, "views48h": views, "views48hLive": live, "title": title,
            "manual": manual, "publishAt": "2026-10-25T07:07:00Z"}


def test_options_are_read_from_what_older_videos_were(tmp_path):
    root = root_with(tmp_path, [])
    a = arms.infer(short(1, 24, 100, title="How the casino wins on your lucky night", manual=False), root)
    assert a["length"] == "20-27" and a["title"] == "plain" and a["category"] == "27"
    assert arms.infer(short(2, 50, 100), root)["length"] is None          # outside every option: not counted


def test_a_plan_s_arms_win_over_inference(tmp_path):
    root = root_with(tmp_path, [], {"v-001": {"arms": {"category": "22", "length": "28-35"}}})
    a = arms.infer(short(1, 24, 100, manual=False), root)
    assert a["category"] == "22" and a["length"] == "28-35"


def test_live_48_hour_views_are_preferred():
    assert arms.metric({"views48h": 10, "views48hLive": 30}) == 30
    assert arms.metric({"views48h": 10, "views48hLive": None}) == 10
    assert arms.metric({}) is None


def test_a_clear_loser_is_dropped_and_a_clear_winner_promoted(tmp_path):
    vids = [short(i, 30, 1000 + i) for i in range(5)]                       # 28-35 (default): ~1000
    vids += [short(10 + i, 24, 3000 + i) for i in range(4)]                 # 20-27: 3x → promoted
    vids += [short(20 + i, 30, 100 + i, manual=False) for i in range(4)]    # category 27: 0.1x → dropped
    root = root_with(tmp_path, vids)
    v = arms.judge(root, datetime(2026, 11, 4, tzinfo=timezone.utc))
    kinds = {(x["dimension"], x["option"], x["verdict"]) for x in v}
    assert ("length", "20-27", "promote") in kinds
    assert ("category", "27", "drop") in kinds
    s = arms.state(root)
    assert s["length"]["default"] == "20-27" and "27" in s["category"]["dropped"]
    assert json.loads((root / "improvement" / "arms-log.json").read_text())["entries"]


def test_too_few_videos_decide_nothing(tmp_path):
    root = root_with(tmp_path, [short(1, 30, 1000), short(2, 24, 5000)])
    assert arms.judge(root, write=False) == []


def test_assignments_change_at_most_two_dimensions_and_skip_dropped_options(tmp_path):
    root = root_with(tmp_path, [short(i, 30, 500) for i in range(6)])
    (root / "improvement" / "arms-state.json").write_text(json.dumps({"dimensions": {"category": {"default": "22", "dropped": ["27"]}}}))
    seen_default = 0
    for i in range(200):
        a = arms.assign(f"v-new-{i}", root)
        st = arms.state(root)
        changed = [d for d in a if a[d] != st[d]["default"]]
        assert len(changed) <= 2 and a["category"] == "22"
        seen_default += not changed
    assert 90 <= seen_default <= 150     # about 60% of videos are the current best recipe
    assert arms.assign("v-same", root) == arms.assign("v-same", root)


def test_a_plan_must_carry_a_valid_assignment(tmp_path):
    root = root_with(tmp_path, [])
    assert arms.plan_problems({}, root)
    assert arms.plan_problems({"arms": {"length": "28-35", "title": "figure_or_name", "category": "22"}}, root) == []
    bad = arms.plan_problems({"arms": {"length": "20-27", "title": "plain", "category": "27"}}, root)
    assert any("at most 2" in p for p in bad)
