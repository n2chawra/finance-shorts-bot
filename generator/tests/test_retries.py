"""Fixes at the source for the checks that failed most (2026-10-29)."""
import json
from datetime import datetime, timezone

from generator import failures
from generator.numbers import check_claims, fill_text
from renderer.models import maths
from renderer.timeline.build import _resolve

SCRIPT = {"maths": [{"name": "w", "kind": "lumpsum", "amount": 1000, "rate_pct": 10, "years": 5}], "currency": "USD"}
FIGS = {"w_final": "$1,611"}


def test_titles_take_placeholders_and_years() -> None:
    assert fill_text("Why {w_final} matters", FIGS) == ("Why $1,611 matters", [])
    assert check_claims({"title": "{w_final} by October 28, 2027", "description": "the 2026-27 rule"}, SCRIPT, FIGS) == []


def test_typed_figures_and_unknown_placeholders_say_how_to_fix() -> None:
    [typed] = check_claims({"title": "It became $500K"}, SCRIPT, FIGS)
    assert "{w_final}" in typed
    [unknown] = check_claims({"title": "{nope}"}, SCRIPT, FIGS)
    assert "w_final" in unknown


def test_ids_may_hold_digits_but_shown_text_may_not() -> None:
    out = _resolve({"at": "y1", "target": "c6-worth", "label": "{w_final}"}, FIGS, {}, "beat")
    assert out == {"at": "y1", "target": "c6-worth", "label": "$1,611"}
    try:
        _resolve({"label": "Year 1"}, FIGS, {}, "beat")
        raise AssertionError("a typed number in a label must fail")
    except ValueError:
        pass


def test_a_maths_entry_s_inputs_are_readable() -> None:
    r = maths.compute([{"name": "home", "kind": "emi", "amount": 300000, "rate_pct": 7, "years": 30}])
    assert r["home"]["values"]["amount"] == 300000 and r["home"]["values"]["emi"] > 0


def test_a_wrong_key_lists_the_right_ones() -> None:
    results = maths.compute(SCRIPT["maths"])
    try:
        _resolve("@w.nope", FIGS, results, "beat")
    except ValueError as e:
        assert "final" in str(e) and "amount" in str(e)


def test_failures_are_grouped_with_their_fix(tmp_path) -> None:
    now = datetime(2026, 10, 29, tzinfo=timezone.utc)
    for vid, note in (("v-1", "text 'Loan' at 3.0 s runs outside the frame"), ("v-2", "text 'Pay' at 9.0 s runs outside the frame"),
                      ("v-3", "title mentions '$5', which is neither a script input nor a computed figure")):
        (tmp_path / "videos" / vid).mkdir(parents=True)
        agent = "render" if "outside" in note else "number_check"
        (tmp_path / "videos" / vid / "run.json").write_text(json.dumps(
            [{"agent": agent, "status": "failed", "startedAt": "2026-10-28T04:00:00+00:00", "notes": [note]}]), encoding="utf-8")
    rows = failures.recent(tmp_path, 14, now=now)
    assert rows[0]["videos"] == ["v-1", "v-2"] and "off the frame" in rows[0]["kind"]
    assert any("placeholders" in r["kind"] for r in rows)
    assert failures.recent(tmp_path, 0, now=now) == []
