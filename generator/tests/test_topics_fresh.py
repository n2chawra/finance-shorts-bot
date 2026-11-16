"""Feed rules added 2026-11-05 after the morning run: stale facts, long topics tied to a winning Short."""
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


def test_a_long_topic_must_expand_a_winning_short(tmp_path):
    (tmp_path / "metrics").mkdir()
    (tmp_path / "metrics" / "videos.json").write_text(json.dumps({"videos": [{"id": "v-1", "views": 1190}, {"id": "v-2", "views": 40}]}))
    assert "from_short" in topics.winning_short({}, tmp_path)
    assert topics.winning_short({"from_short": "v-1"}, tmp_path) is None
    assert "under" in topics.winning_short({"from_short": "v-2"}, tmp_path)
    assert topics.blocked_reason({"from_short": "v-1"}, "2026-11-05", "long", tmp_path) is None
    assert topics.blocked_reason({}, "2026-11-05", "short", tmp_path) is None     # Shorts need no winning Short


def test_a_long_topic_expands_a_recent_short_in_the_top_third_by_stayed(tmp_path):
    # owner, 2026-11-12 (agents/scout.md 1a): Shorts of the last 30 days with 100+ views, ranked by stayed
    # to watch then views; one in the top third. The 1,000-view rule blocked Costco (627), debt (442), gym (920).
    (tmp_path / "metrics").mkdir()
    vids = [{"id": f"v-{i}", "format": "short", "views": 300 + i, "stayed": s, "publishAt": "2026-11-10T07:00:00Z"}
            for i, s in enumerate([0.70, 0.65, 0.60, 0.55, 0.50, 0.45])]
    vids += [{"id": "v-old", "format": "short", "views": 5000, "stayed": 0.9, "publishAt": "2026-10-10T07:00:00Z"},
             {"id": "v-few", "format": "short", "views": 60, "stayed": 0.95, "publishAt": "2026-11-10T07:00:00Z"},
             {"id": "L-x", "format": "long", "views": 900, "stayed": 0.99, "publishAt": "2026-11-10T07:00:00Z"}]
    (tmp_path / "metrics" / "videos.json").write_text(json.dumps({"videos": vids}))
    ok = lambda sid: topics.winning_short({"from_short": sid}, tmp_path, "2026-11-16")
    assert ok("v-0") is None and ok("v-1") is None                 # top third of 6 recent Shorts
    assert "top third" in ok("v-2") and "top third" in ok("v-5")
    assert "30 days" in ok("v-old")                                 # 37 days old, however many views
    assert "under 100" in ok("v-few")
    assert topics.blocked_reason({"from_short": "v-0"}, "2026-11-16", "long", tmp_path) is None
    assert "top third" in topics.blocked_reason({"from_short": "v-4"}, "2026-11-16", "long", tmp_path)


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
