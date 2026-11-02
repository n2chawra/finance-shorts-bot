"""Renderer pieces added for the board (2026-11-02): the `rate` calculation, year facts, money said
in the singular, sourced figures matched without trailing zeros, and clause coverage."""
from renderer import craft
from renderer.engine.formatting import Money, fact_value
from renderer.engine.voice import spoken
from renderer.models import maths


def test_rate_is_part_of_whole():
    r = maths.compute([{"name": "tax", "kind": "rate", "part": 13.6e9, "whole": 401e9}], Money("USD"))["tax"]
    assert r["figures"]["pct"] == "3.4%" and abs(r["values"]["pct"] - 3.3915) < 1e-3
    assert maths.compute([{"name": "big", "kind": "rate", "part": 1, "whole": 4}], Money("USD"))["big"]["figures"]["pct"] == "25%"


def test_year_facts_show_and_read_as_years():
    assert fact_value(2007, "year") == "2007"
    assert spoken("2018", "USD") == "twenty eighteen" and spoken("2007", "USD") == "two thousand seven"
    assert spoken("1999", "USD") == "nineteen ninety nine"


def test_one_dollar_is_singular():
    assert spoken("$1", "USD") == "one dollar"
    assert spoken("$2", "USD") == "two dollars"


def _beat(words: list[tuple[str, float, float]], acts: list[dict], events: dict) -> dict:
    return {"id": "b", "scene": "board", "frames": 300, "params": {"header": "x", "actions": acts}, "events": events,
            "voice": {"start": 0, "captions": [{"t": t, "s": s, "e": e} for t, s, e in words], "words": []}}


def test_clause_coverage_counts_clauses_with_a_change_nearby():
    words = [("They", 0.0, 0.2), ("don't", 0.2, 0.4), ("sell.", 0.4, 0.7), ("They", 1.5, 1.7), ("pledge", 1.7, 2.0),
             ("shares,", 2.0, 2.4), ("and", 4.0, 4.1), ("take", 4.1, 4.3), ("a", 4.3, 4.4), ("loan.", 4.4, 4.8)]
    covered = {"sell": 15, "pledge": 55, "loan": 135}       # frames
    acts = [{"at": k, "do": "stamp"} for k in covered]
    tl = {"fps": 30, "figures": {}, "beats": [_beat(words, acts, covered) for _ in range(3)]}
    assert craft.clauses(tl["beats"][0]["voice"]["captions"]) == [(0.0, 0.7), (1.5, 2.4), (4.0, 4.8)]
    assert craft.clause_problems(tl) == []
    bare = {"fps": 30, "figures": {}, "beats": [_beat(words, [{"at": "sell", "do": "stamp"}], {"sell": 15}) for _ in range(3)]}
    assert any("spoken clauses get their own picture" in p for p in craft.clause_problems(bare))
