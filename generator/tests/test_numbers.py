import pytest

from generator import numbers
from generator.numbers import check_claims, number_check

from .conftest import example, make_plan


def test_formulas_against_hand_worked_values() -> None:
    assert numbers.lumpsum_fv(100000, 10, 2) == pytest.approx(121000)
    assert numbers.lumpsum_fv(100000, 8, 1, 4) == pytest.approx(108243.216)
    assert numbers.fd_maturity(100000, 8, 1) == pytest.approx(108243.216)
    assert numbers.real_value(121000, 10, 2) == pytest.approx(100000)
    assert numbers.cagr(100000, 121000, 2) == pytest.approx(10)
    # 2 months at 12% a year: 1000*1.01^2 + 1000*1.01
    assert numbers.sip_fv(1000, 12, 2) == pytest.approx(1000*1.01**2 + 1000*1.01)
    # ₹10 L at 12% for 1 year: standard EMI table value
    assert numbers.emi(1000000, 12, 1) == pytest.approx(88848.79, abs=0.01)
    assert numbers.emi_total_interest(1000000, 12, 1) == pytest.approx(88848.79*12 - 1000000, abs=0.2)


def sip_story(**over) -> dict:
    """A small Short: ₹10,000 a month for 20 years at 12%."""
    script = {
        "template": "short_story", "format": "short", "seed": 20,
        "style": {"palette": "forest", "genre": "acoustic", "key": "C", "bpm": 100},
        "maths": [{"name": "sip", "kind": "sip", "monthly": 10000, "rate_pct": 12, "years": 20}],
        "beats": [
            {"id": "hook", "scene": "bignumber", "say": "What does {sip_amount} a month become?",
             "params": {"lines": [{"text": "{sip_final}", "style": "hero", "at": "start"}]}},
            {"id": "outro", "scene": "end", "say": "Follow for one money idea a day.", "params": {"cta": "Start early."}},
        ],
    }
    return {**script, **over}


@pytest.mark.parametrize("name", ["long_story", "short_story", "news_story"])
def test_every_example_passes_the_number_check(name: str) -> None:
    script = example(name)
    feed_topic = {"facts": script["facts"]} if "facts" in script else None      # news: as research published it
    passed, notes = number_check(script, None, feed_topic)
    assert passed, notes


@pytest.mark.parametrize("monthly, rate, years", [(500, 8, 5), (25000, 14, 30), (10000, 12, 20)])
def test_closed_form_matches_the_story_maths(monthly: int, rate: float, years: int) -> None:
    script = sip_story(maths=[{"name": "sip", "kind": "sip", "monthly": monthly, "rate_pct": rate, "years": years}])
    passed, notes = number_check(script)
    assert passed, notes


def test_typed_number_in_script_fails() -> None:
    script = sip_story()
    script["beats"][0]["say"] = "You get 1 crore"
    passed, notes = number_check(script)
    assert not passed and "typed number" in notes[0]


def test_unknown_template_fails() -> None:
    passed, notes = number_check(sip_story(template="quiz_countdown"))
    assert not passed and "template must be one of" in notes[0]


def test_disagreement_with_formula_is_reported(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setitem(numbers.EXPECTED, "short_story", lambda s: {"sip_final": "₹1.00 Cr"})
    passed, notes = number_check(sip_story())
    assert not passed and "independent formula gives '₹1.00 Cr'" in notes[0]


def test_plan_must_match_script_and_claims_must_be_backed() -> None:
    script = sip_story()
    good = make_plan(seed=20)
    assert number_check(script, good)[0]

    passed, notes = number_check(script, make_plan(seed=999))
    assert not passed and any("script.seed does not match the plan" in n for n in notes)

    passed, notes = number_check(script, make_plan(seed=20, title="Quiz: turn ₹10,000 a month into ₹5 Cr?"))
    assert not passed and any("'₹5 Cr'" in n for n in notes)


def test_claims_accept_inputs_and_figures_in_any_usual_spelling() -> None:
    script = sip_story()
    figures = {"answer": "₹99.9 L", "answer_long": "₹99.9 Lakh", "ratio": "4.2×", "years": "20", "rate": "12%"}
    ok = {"title": "₹10,000 a month for 20 years at 12% becomes ₹99.9 Lakh, 4.2x your money", "hashtags": "#Shorts #SIP"}
    assert check_claims(ok, script, figures) == []
    bad = {"title": "Become a crorepati: ₹1 Cr in 10 years, 15% returns"}
    assert len(check_claims(bad, script, figures)) == 3


def test_emi_at_zero_interest_is_principal_over_months() -> None:
    # "no-cost EMI": 0% is a real offer, not a division by zero
    from renderer.models import maths
    assert numbers.emi(60000, 0, 1) == pytest.approx(5000)
    assert numbers.emi_total_interest(60000, 0, 1) == pytest.approx(0)
    r = maths.emi({"amount": 60000, "rate_pct": 0, "years": 1})
    assert r["figures"]["emi"] == "₹5,000" and r["values"]["interest"] == pytest.approx(0)
