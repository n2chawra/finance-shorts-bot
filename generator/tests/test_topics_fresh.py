"""Feed rules added 2026-11-05 after the morning run: stale facts; long topics need no Short of ours (2026-11-22)."""
import json

from generator import formats, topics, variety


def test_a_fact_over_a_year_old_needs_a_recent_check():
    t = {"facts": [{"label": "Costco membership fees", "value": 5323, "as_of": "2025-08-31"}]}
    assert topics.stale_facts(t, "2026-11-05")
    t["facts"][0].update({"latest": True, "checked": "2026-11-01"})
    assert topics.stale_facts(t, "2026-11-05") == []
    t["facts"][0]["checked"] = "2026-09-01"                      # checked too long ago
    assert topics.stale_facts(t, "2026-11-05")
    assert topics.stale_facts({"facts": [{"value": 1, "as_of": "2026-06-30"}]}, "2026-11-05") == []


def test_a_long_topic_never_needs_one_of_our_shorts(tmp_path):
    # owner, 2026-11-22: the from_short rule (1,000+ views on 4 Nov, 100+ on 12 Nov) blocked every long topic on
    # the new channels (Shorts with 0-25 views) and Studio runs stopped. No views gate, on any channel.
    (tmp_path / "metrics").mkdir()
    vids = [{"id": "v-0", "format": "short", "views": 0, "stayed": 0.1, "publishAt": "2026-11-21T07:00:00Z"},
            {"id": "v-old", "format": "short", "views": 3, "publishAt": "2026-09-01T07:00:00Z"}]
    (tmp_path / "metrics" / "videos.json").write_text(json.dumps({"videos": vids}))
    for t in ({}, {"from_short": "v-0"}, {"from_short": "v-old"}, {"from_short": "v-missing"}):
        assert topics.blocked_reason(t, "2026-11-22", "long", tmp_path) is None, t
    assert not hasattr(topics, "winning_short")
    # stale facts still block, in both formats
    old = {"facts": [{"label": "fees", "value": 1, "as_of": "2024-01-01"}]}
    assert topics.blocked_reason(old, "2026-11-22", "long", tmp_path)
    assert topics.blocked_reason(old, "2026-11-22", "short", tmp_path)


def test_the_variant_system_s_hook_wins_over_rotation():
    from .conftest import NOW, TEMPLATES, entry, make_plan
    prev = entry(1, "myth_vs_fact", "gold", palette="forest", genre="acoustic", key="C", bpm=100)
    prev["hook_style"] = "question"
    plan = make_plan()
    assert any("hook style" in p for p in variety.check_plan(plan, [prev], TEMPLATES, NOW))
    plan["arms"] = {"hook": "question"}       # assigned: the default may follow itself
    assert not any("hook style" in p for p in variety.check_plan(plan, [prev], TEMPLATES, NOW))


def test_a_placeholder_figure_counts_in_a_title():
    assert formats.title_problems("Your {bonus} bonus: what the rich do with it") == []
