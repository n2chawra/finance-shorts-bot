"""Crowded topics are blocked (owner, 2026-11-28: Craze & Crash and Disaster Desk told the week's most-told stories)."""
import json

from generator import saturation, topics


def _write(tmp_path, verdicts):
    d = tmp_path / "improvement" / "research"
    d.mkdir(parents=True, exist_ok=True)
    (d / "saturation.json").write_text(json.dumps({"topics": verdicts}))


def test_a_crowded_topic_is_blocked_while_the_check_is_fresh(tmp_path):
    _write(tmp_path, {
        "fedex": {"checkedAt": "2026-11-27T21:00:00Z", "recent7": 33, "recent30": 40, "median30": 41, "crowded": True,
                  "reason": "33 other Shorts told this story in the last 7 days"},
        "darien": {"checkedAt": "2026-11-27T21:00:00Z", "recent7": 1, "recent30": 3, "median30": 290, "crowded": False},
        "hot": {"checkedAt": "2026-11-27T21:00:00Z", "recent7": 3, "recent30": 21, "median30": 26182, "crowded": True, "reason": "x"},
        "old": {"checkedAt": "2026-11-01T21:00:00Z", "recent7": 9, "crowded": True, "reason": "x"},
    })
    reason = topics.blocked_reason({"id": "fedex"}, "2026-11-28", "short", tmp_path)
    assert reason and "crowded" in reason and "33 other Shorts" in reason
    assert topics.blocked_reason({"id": "darien"}, "2026-11-28", "short", tmp_path) is None
    assert topics.blocked_reason({"id": "hot"}, "2026-11-28", "short", tmp_path) is None     # copies still get views
    assert topics.blocked_reason({"id": "old"}, "2026-11-28", "long", tmp_path) is None      # check too old to block
    assert topics.blocked_reason({"id": "never-checked"}, "2026-11-28", "short", tmp_path) is None


def test_check_plan_refuses_a_crowded_feed_topic(tmp_path):
    _write(tmp_path, {"t1": {"checkedAt": "2026-11-28T01:00:00Z", "crowded": True, "reason": "6 other Shorts told this story in the last 7 days"}})
    feed = tmp_path / "improvement" / "research" / "topics.json"
    feed.write_text(json.dumps({"topics": [{"id": "t1", "title": "Nike Paid $35 for the Swoosh", "format": "short", "found": "2026-11-27"}]}))
    problems = topics.check_plan({"topic": {"feed_id": "t1"}}, [], "2026-11-28", [], ["short_story"], tmp_path, "short")
    assert any("crowded" in p for p in problems), problems


def test_no_file_means_nothing_is_crowded(tmp_path):
    assert saturation.load(tmp_path) == {}
    assert saturation.crowded({"id": "x"}, "2026-11-28", tmp_path) is None
