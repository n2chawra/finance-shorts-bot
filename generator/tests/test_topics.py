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


def test_breaking_topic_is_required_when_usable(root: Path) -> None:
    feed(root, topic("calm", "high"), topic("big", "breaking"))
    assert topics.for_state([], TODAY, [], TEMPLATES, root)["required"] == "big"
    # not usable: category blocked, or no allowed template fits
    assert topics.for_state([], TODAY, ["sip"], TEMPLATES, root)["required"] is None
    feed(root, topic("big", "breaking", templates=["money_news"]))
    assert topics.for_state([], TODAY, [], ["quiz_countdown"], root)["required"] is None


def test_plan_must_take_the_breaking_topic(root: Path) -> None:
    feed(root, topic("big", "breaking"))
    problems = topics.check_plan(make_plan(), [], TODAY, [], TEMPLATES, root)
    assert any("breaking feed topic 'big'" in p for p in problems)
    plan = make_plan(topic={"title": "x", "category": "sip", "feed_id": "big"})
    assert topics.check_plan(plan, [], TODAY, [], TEMPLATES, root) == []


def test_feed_topic_must_be_open(root: Path) -> None:
    feed(root, topic("gone", expires="2026-10-01"), topic("taken"))
    for fid, why in (("gone", "expired"), ("taken", "already used"), ("nope", "not in")):
        plan = make_plan(topic={"title": "x", "category": "sip", "feed_id": fid})
        assert any(why in p for p in topics.check_plan(plan, [used("taken")], TODAY, [], TEMPLATES, root)), fid


def test_money_news_needs_a_feed_topic_with_facts(root: Path) -> None:
    feed(root, topic("plain", facts=[]))
    assert any("only for research feed topics" in p for p in topics.check_plan(make_plan(template="money_news"), [], TODAY, [], TEMPLATES, root))
    plan = make_plan(template="money_news", topic={"title": "x", "category": "sip", "feed_id": "plain"})
    assert any("needs a feed topic with sourced facts" in p for p in topics.check_plan(plan, [], TODAY, [], TEMPLATES, root))


def test_number_check_traces_news_facts_to_the_feed() -> None:
    script = example("money_news")
    plan = make_plan(template="money_news", seed=script["seed"], style=script.get("style"),
                     topic={"title": "x", "category": "sip", "feed_id": script["feed_id"]},
                     title="Indians just set a monthly SIP record", description="What it means for you. Illustrative only. Not financial advice.")
    ok, notes = number_check(script, plan, topic(script["feed_id"]))
    assert ok, notes
    changed = {**script, "facts": [{**FACT, "value": 32000}]}
    ok, notes = number_check(changed, plan, topic(script["feed_id"]))
    assert not ok and any("not one of the feed topic's facts" in n for n in notes)
    ok, notes = number_check(script, plan, None)
    assert not ok and any("can't be traced to a source" in n for n in notes)
