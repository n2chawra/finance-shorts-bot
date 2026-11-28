"""Promo Shorts (owner, 2026-11-25, Disaster Desk: "shorts only the promo of the long video", two per long)."""
import json
from datetime import timedelta
from pathlib import Path

import pytest

from generator import promo, variety

from .conftest import NOW, entry, make_plan

SLUG = "promo-test-channel"


@pytest.fixture
def chan(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    monkeypatch.setenv("CHANNEL", SLUG)
    d = tmp_path / "channels" / SLUG
    d.mkdir(parents=True)
    (d / "channel.json").write_text(json.dumps({"name": "Promo", "disclaimer": "x", "cadence": {"promoOnly": True, "promoShortPerLong": 2}}))
    return tmp_path


def long_entry(i: int, days_ago: float, feed: str) -> dict:
    e = entry(i, "long_story", "rail", title=f"The rail crash number {i}", days_ago=days_ago)
    return {**e, "id": f"L-2026101{i}-41", "format": "long", "topic": {**e["topic"], "feed_id": feed}}


def promo_entry(i: int, of: str, days_ago: float = 0.5) -> dict:
    return {**entry(i, "short_story", "rail", days_ago=days_ago), "id": f"v-2026101{i}-41", "format": "short", "promo_of": of}


def test_targets_first_promos_first_newest_long_first(chan: Path) -> None:
    a, b = long_entry(1, 3, "feed-a"), long_entry(2, 1, "feed-b")
    hist = [a, b, promo_entry(3, a["id"])]
    got = promo.targets(hist, NOW, chan)
    # b has no promo yet, so it comes before a's second one
    assert [(t["id"], t["promo_number"]) for t in got] == [(b["id"], 1), (a["id"], 2)]
    hist += [promo_entry(4, a["id"]), promo_entry(5, b["id"]), promo_entry(6, b["id"])]
    assert promo.targets(hist, NOW, chan) == []          # two each: nothing left to promote
    old = long_entry(7, promo.WINDOW_DAYS + 1, "feed-old")
    assert promo.targets([old], NOW, chan) == []        # too old for a new promo


def test_check_plan_needs_an_open_long_and_its_topic(chan: Path) -> None:
    a = long_entry(1, 1, "feed-a")
    ok = make_plan(promo_of=a["id"], topic={"title": "x", "category": "rail", "feed_id": "feed-a"})
    assert promo.check_plan(ok, [a], NOW, "short", chan) == []
    assert any("set plan.promo_of" in p for p in promo.check_plan(make_plan(), [a], NOW, "short", chan))
    assert any("not a shipped long video" in p for p in promo.check_plan(make_plan(promo_of="L-20260199-41"), [a], NOW, "short", chan))
    wrong = make_plan(promo_of=a["id"], topic={"title": "x", "category": "rail", "feed_id": "feed-z"})
    assert any("long video's own topic" in p for p in promo.check_plan(wrong, [a], NOW, "short", chan))
    full = [a, promo_entry(2, a["id"]), promo_entry(3, a["id"])]
    assert any("already has 2 promo Shorts" in p for p in promo.check_plan(ok, full, NOW, "short", chan))
    assert promo.check_plan(make_plan(), [a], NOW, "long", chan) == []     # long videos are not promos


def test_off_channel_never_takes_promo_of(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("CHANNEL", "packless-test-channel")
    assert promo.for_state([], NOW, tmp_path) is None
    assert promo.check_plan(make_plan(), [], NOW, "short", tmp_path) == []
    assert promo.check_plan(make_plan(promo_of="L-20261010-41"), [], NOW, "short", tmp_path)


@pytest.mark.usefixtures("packless")
def test_variety_treats_a_promo_and_its_long_as_one_story() -> None:
    a = long_entry(1, 1, "feed-a")
    first = {**promo_entry(2, a["id"]), "topic": {"title": "Why the rail crash at Lac Megantic happened", "category": "rail"}}
    plan = make_plan(topic={"title": "Why the rail crash at Lac Megantic happened at night", "category": "rail"})
    # an ordinary Short: same category in the last 3 and a near-duplicate topic
    plain = variety.check_plan(plan, [first], ["short_story"], NOW)
    assert any("category" in p for p in plain) and any("too close" in p for p in plain)
    # its second promo: neither clash, the other rules still hold
    second = variety.check_plan({**plan, "promo_of": a["id"]}, [first], ["short_story"], NOW)
    assert not any("category" in p or "too close" in p for p in second)
    unrelated = {**first, "promo_of": "L-20261019-41"}
    assert any("too close" in p for p in variety.check_plan({**plan, "promo_of": a["id"]}, [unrelated], ["short_story"], NOW))


def test_old_promos_stay_in_the_window(chan: Path) -> None:
    a = long_entry(1, promo.WINDOW_DAYS - 1, "feed-a")
    assert promo.targets([a], NOW + timedelta(hours=1), chan)[0]["id"] == a["id"]


def test_a_long_on_a_crowded_story_is_promoted_last_and_refused_while_another_is_open(chan: Path) -> None:
    # owner, 2026-11-28: Disaster Desk's promos of Titan and Colgan went up beside dozens of Shorts on the same stories
    a, b = long_entry(1, 1, "feed-crowded"), long_entry(2, 3, "feed-quiet")
    sat = chan / "channels" / SLUG / "research"
    sat.mkdir(parents=True)
    (sat / "saturation.json").write_text(json.dumps({"topics": {
        "promo:feed-crowded": {"checkedAt": NOW.isoformat(), "recent7": 20, "median30": 80, "crowded": True,
                               "reason": "20 other Shorts told this story in the last 7 days"},
        "promo:feed-quiet": {"checkedAt": NOW.isoformat(), "recent7": 1, "median30": 300, "crowded": False}}}))
    got = promo.targets([a, b], NOW, chan)
    assert [t["id"] for t in got] == [b["id"], a["id"]]            # newer, but crowded: last
    assert got[1]["crowded"] and got[0]["crowded"] is None
    crowded = make_plan(promo_of=a["id"], topic={"title": "x", "category": "rail", "feed_id": "feed-crowded"})
    assert any("promote one that isn't" in p for p in promo.check_plan(crowded, [a, b], NOW, "short", chan))
    # only crowded targets left: still allowed (never a gap)
    assert promo.check_plan(crowded, [a], NOW, "short", chan) == []
