import copy

import pytest

from generator import numbers
from generator.numbers import check_claims, number_check

from .conftest import TEMPLATES, example, make_plan


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


@pytest.mark.parametrize("name", TEMPLATES)
def test_every_example_passes_the_number_check(name: str) -> None:
    passed, notes = number_check(example(name))
    assert passed, notes


@pytest.mark.parametrize("name", TEMPLATES)
def test_closed_form_matches_template_for_other_inputs(name: str) -> None:
    script = example(name)
    for key, scale in (("monthly", 3), ("amount", 7), ("cost", 2)):
        if key in script:
            script[key] *= scale
    for key in ("annual_return_pct",):
        if key in script:
            script[key] = 9.5
    passed, notes = number_check(script)
    assert passed, notes


def test_typed_number_in_script_fails() -> None:
    script = example("quiz_countdown")
    script["text"]["reveal_note"] = "You get 1 crore"
    passed, notes = number_check(script)
    assert not passed and "typed number" in notes[0]


def test_hard_coded_result_field_fails() -> None:
    script = example("quiz_countdown")
    script["answer"] = 9990000
    passed, notes = number_check(script)
    assert not passed and "does not match schema" in notes[0]


def test_disagreement_with_formula_is_reported(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setitem(numbers.EXPECTED, "quiz_countdown", lambda s: {"answer": "₹1.00 Cr"})
    passed, notes = number_check(example("quiz_countdown"))
    assert not passed and "independent formula gives '₹1.00 Cr'" in notes[0]


def test_plan_must_match_script_and_claims_must_be_backed() -> None:
    script = example("quiz_countdown")
    plan = make_plan(seed=script["seed"], style=script.get("style"))
    script_with_style = copy.deepcopy(script)
    script_with_style["style"] = {"palette": "forest", "genre": "acoustic", "key": "C", "bpm": 100}
    good = make_plan(seed=script["seed"])
    assert number_check(script_with_style, good) == (True, number_check(script_with_style, good)[1])

    drift = make_plan(seed=999)
    passed, notes = number_check(script_with_style, drift)
    assert not passed and any("script.seed does not match the plan" in n for n in notes)

    lying = make_plan(seed=script["seed"], title="Quiz: turn ₹10,000 a month into ₹5 Cr?")
    passed, notes = number_check(script_with_style, lying)
    assert not passed and any("'₹5 Cr'" in n for n in notes)
    assert plan is not None


def test_claims_accept_inputs_and_figures_in_any_usual_spelling() -> None:
    script = example("quiz_countdown")
    figures = {"answer": "₹99.9 L", "answer_long": "₹99.9 Lakh", "ratio": "4.2×", "years": "20", "rate": "12%"}
    ok = {"title": "₹10,000 a month for 20 years at 12% becomes ₹99.9 Lakh, 4.2x your money", "hashtags": "#Shorts #SIP"}
    assert check_claims(ok, script, figures) == []
    bad = {"title": "Become a crorepati: ₹1 Cr in 10 years, 15% returns"}
    assert len(check_claims(bad, script, figures)) == 3
