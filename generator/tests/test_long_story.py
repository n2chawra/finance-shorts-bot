"""long_story (Remotion long-form): the independent number check and the script check."""
import json
from pathlib import Path

import pytest

from generator import numbers
from renderer.models import maths
from renderer.timeline.build import check_script

EXAMPLE = json.loads((Path(__file__).resolve().parents[2] / "examples" / "long_story.json").read_text(encoding="utf-8"))


@pytest.mark.parametrize("amount, rate, pct, floor", [
    (60000, 3.5, 5, 200), (15000, 3.75, 5, 500), (250000, 3.0, 5, 100), (800, 3.5, 5, 200), (100000, 2.5, 10, 1000)])
def test_card_closed_form_matches_the_simulation(amount: float, rate: float, pct: float, floor: float) -> None:
    sim = maths.compute([{"name": "c", "kind": "card_min_due", "amount": amount, "rate_pct_month": rate,
                          "min_due_pct": pct, "min_due_floor": floor}])["c"]["values"]
    closed = numbers.card_min_due(amount, rate, pct, floor)
    assert closed["months"] == sim["months"]
    for k in ("total_paid", "paid_year1", "owed_year1", "interest_year1"):
        assert closed[k] == pytest.approx(sim[k], rel=1e-9, abs=1e-6)


def test_a_balance_that_only_grows_is_rejected() -> None:
    with pytest.raises(ValueError, match="never pays"):
        numbers.card_min_due(250000, 3.0, 2.5, 100)


def test_example_passes_the_number_check() -> None:
    passed, notes = numbers.number_check(EXAMPLE)
    assert passed, notes


def test_a_wrong_simulation_is_caught(monkeypatch: pytest.MonkeyPatch) -> None:
    real = maths.KINDS["card_min_due"]

    def off_by_one_month(m: dict, fm=None) -> dict:
        r = real(m) if fm is None else real(m, fm)
        r["figures"]["months"] = str(int(r["figures"]["months"]) + 1)
        return r

    monkeypatch.setitem(maths.KINDS, "card_min_due", off_by_one_month)
    passed, notes = numbers.number_check(EXAMPLE)
    assert not passed and any("card_months" in n for n in notes)


@pytest.mark.parametrize("change, error", [
    (lambda s: s["beats"][1].update(say="It costs 60,000 rupees."), "typed number"),
    (lambda s: s["beats"][1].update(scene="slideshow"), "no scene called"),
    (lambda s: s["beats"].pop(), "end card"),
    (lambda s: s["beats"][1]["events"].update(x={"word": "banana"}), "no word 'banana'"),
    (lambda s: s.update(thumbnail={**s["thumbnail"], "words": "far too many words here"}), "four words"),
])
def test_script_check_rejects(change, error: str) -> None:
    s = json.loads(json.dumps(EXAMPLE))
    change(s)
    with pytest.raises(ValueError, match=error):
        check_script(s)


def test_claims_in_the_title_must_be_computed() -> None:
    plan = {"template": "long_story", "seed": EXAMPLE["seed"], "style": EXAMPLE["style"], "title": "A ₹60,000 phone that costs ₹2 L",
            "description": "", "hashtags": []}
    passed, notes = numbers.number_check(EXAMPLE, plan)
    assert not passed and any("₹2 L" in n for n in notes)
