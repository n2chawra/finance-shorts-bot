"""The research topic feed: priority, expiry, use-once, breaking topics, and sourced facts."""
import json
from pathlib import Path

from generator import topics
from generator.numbers import number_check

from .conftest import TEMPLATES, entry, example, make_plan

TODAY = "2026-10-16"
FACT = {"label": "SIP money in one month", "value": 31781, "unit": "rupees_crore", "as_of": "2026-06-30",
        "source": "AMFI", "url": "https://www.oquilia.com/news/amfi-june-2026-sip-record-31781-crore"}


def topic(id_: str, priority: str = "normal", **over) -> dict:
    return {"id": id_, "title": f"Topic {id_}", "category": "sip", "kind": "news", "priority": priority,
            "templates": ["any"], "facts": [FACT], "found": "2026-10-15", "expires": "2026-10-30", "status": "new", **over}


def feed(root: Path, *items: dict) -> None:
    (root / "improvement" / "research").mkdir(parents=True, exist_ok=True)
    (root / "improvement" / "research" / "topics.json").write_text(json.dumps({"topics": list(items)}), encoding="utf-8")


def used(feed_id: str) -> dict:
    e = entry(9, category="tax")
    e["topic"]["feed_id"] = feed_id
    return e


def test_open_topics_best_first(root: Path) -> None:
    feed(root, topic("a", "normal", found="2026-10-16"), topic("b", "high"), topic("c", "high", found="2026-10-16"),
         topic("old", expires="2026-10-01"), topic("done", status="rejected"), topic("taken"))
    s = topics.for_state([used("taken")], TODAY, [], TEMPLATES, root)
    assert [t["id"] for t in s["topics"]] == ["c", "b", "a"]
    assert s["required"] is None


def test_breaking_topic_is_offered_first_when_usable(root: Path) -> None:
    feed(root, topic("calm", "high"), topic("big", "breaking"))
    s = topics.for_state([], TODAY, [], TEMPLATES, root)
    assert s["urgent"] == "big" and s["required"] is None and s["topics"][0]["id"] == "big"
    # not usable: category blocked, or no template enabled for the format
    assert topics.for_state([], TODAY, ["sip"], TEMPLATES, root)["urgent"] is None
    assert topics.for_state([], TODAY, [], [], root)["urgent"] is None


def test_no_feed_topic_is_forced_on_a_plan(root: Path) -> None:
    """Since the reset (2026-10-21) the planner picks what has demand; news never forces a video."""
    feed(root, topic("big", "breaking"))
    assert topics.check_plan(make_plan(), [], TODAY, [], TEMPLATES, root) == []
    plan = make_plan(topic={"title": "x", "category": "sip", "feed_id": "big"})
    assert topics.check_plan(plan, [], TODAY, [], TEMPLATES, root) == []


def test_feed_topic_must_be_open(root: Path) -> None:
    feed(root, topic("gone", expires="2026-10-01"), topic("taken"))
    for fid, why in (("gone", "expired"), ("taken", "already used"), ("nope", "not in")):
        plan = make_plan(topic={"title": "x", "category": "sip", "feed_id": fid})
        assert any(why in p for p in topics.check_plan(plan, [used("taken")], TODAY, [], TEMPLATES, root)), fid


def test_number_check_traces_news_facts_to_the_feed() -> None:
    script = example("news_story")
    plan = make_plan(template="short_story", seed=script["seed"], style=script.get("style"),
                     topic={"title": "x", "category": "sip", "feed_id": script["feed_id"]},
                     title="Indians just set a monthly SIP record", description="What it means for you. Illustrative only. Not financial advice.")
    ok, notes = number_check(script, plan, topic(script["feed_id"]))
    assert ok, notes
    changed = {**script, "facts": [{**FACT, "value": 32000}]}
    ok, notes = number_check(changed, plan, topic(script["feed_id"]))
    assert not ok and any("not one of the feed topic's facts" in n for n in notes)
    ok, notes = number_check(script, plan, None)
    assert not ok and any("can't be traced to a source" in n for n in notes)


# ---------------- trending topics ----------------

def test_trending_topic_is_urgent_after_breaking(root: Path) -> None:
    feed(root, topic("calm", "high"), topic("hot", "trending"))
    assert topics.for_state([], TODAY, [], TEMPLATES, root)["urgent"] == "hot"
    feed(root, topic("hot", "trending"), topic("big", "breaking"))
    assert topics.for_state([], TODAY, [], TEMPLATES, root)["urgent"] == "big"


def trend(**over) -> dict:
    return {"id": f"trend-{TODAY}-gold-rush", "why_now": "Gold at a record before Dhanteras",
            "sources": ["https://example.com/gold"], "found": TODAY, "expires": "2026-10-18", **over}


def test_a_trend_found_by_a_video_run_must_show_its_sources(root: Path) -> None:
    ok = make_plan(topic={"title": "x", "category": "gold", "trend": trend()})
    assert topics.check_plan(ok, [], TODAY, [], TEMPLATES, root) == []
    for bad, why in ((trend(sources=[]), "sources"), (trend(why_now=""), "why_now"),
                     (trend(expires="2026-10-25"), "expires"), (trend(id="gold"), "id")):
        plan = make_plan(topic={"title": "x", "category": "gold", "trend": bad})
        assert any(why in p for p in topics.check_plan(plan, [], TODAY, [], TEMPLATES, root)), why


def test_urgent_videos_carry_a_queue_priority(root: Path) -> None:
    feed(root, topic("hot", "trending", expires="2026-10-19"), topic("calm", "high"))
    assert topics.urgency(make_plan(topic={"title": "x", "category": "sip", "feed_id": "hot"}), root) == \
        {"level": "trending", "until": "2026-10-19"}
    assert topics.urgency(make_plan(topic={"title": "x", "category": "sip", "feed_id": "calm"}), root) is None
    assert topics.urgency(make_plan(topic={"title": "x", "category": "gold", "trend": trend()}), root) == \
        {"level": "trending", "until": "2026-10-18"}
    assert topics.urgency(make_plan(), root) is None


def test_usable_topics_are_never_hidden_behind_blocked_ones(root: Path) -> None:
    # more blocked high topics than the planner is shown must not push the usable one off the list
    blocked = [topic(f"sip{i}", "high", found="2026-10-16") for i in range(topics.SHOWN)]
    feed(root, *blocked, topic("car", "normal", category="car"))
    s = topics.for_state([], TODAY, ["sip"], TEMPLATES, root)
    assert len(s["topics"]) == topics.SHOWN
    assert s["topics"][0] == {**s["topics"][0], "id": "car", "usable_now": True}


def test_null_dates_in_the_feed_read_as_missing(root: Path) -> None:
    feed(root, topic("a", expires=None), topic("b", found=None), topic("c", expires="2026-10-01"))
    s = topics.for_state([], TODAY, [], TEMPLATES, root)
    assert [t["id"] for t in s["topics"]] == ["a", "b"]
