import pytest

from generator import numbers
from generator.numbers import check_claims, number_check
from renderer.engine.formatting import money_for

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


@pytest.mark.parametrize("name", ["long_story", "short_story", "news_story", "short_story_prepay"])
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


@pytest.mark.parametrize("monthly, step, rate, years", [(5000, 10, 12, 20), (1000, 0, 8, 5), (2500, 7.5, 10, 1), (10000, 15, 6, 30)])
def test_sip_stepup_closed_form_matches_the_story_maths(monthly: int, step: float, rate: float, years: int) -> None:
    script = sip_story(maths=[{"name": "sip", "kind": "sip_stepup", "monthly": monthly, "step_pct": step,
                               "rate_pct": rate, "years": years}])
    passed, notes = number_check(script)
    assert passed, notes


@pytest.mark.parametrize("amount, rate, months, prepay, at", [(3000000, 8.5, 240, 300000, 36), (25000, 14, 24, 5000, 6),
                                                              (500000, 9.25, 60, 5000, 58), (60000, 18, 36, 1000, 1)])
def test_loan_prepay_closed_form_matches_the_story_maths(amount: int, rate: float, months: int, prepay: int, at: int) -> None:
    script = sip_story(maths=[{"name": "sip", "kind": "loan_prepay", "amount": amount, "rate_pct": rate, "months": months,
                               "prepay": prepay, "prepay_month": at}])
    script["beats"][0]["params"]["lines"][0]["text"] = "{sip_saved_reduce_tenure}"
    passed, notes = number_check(script)
    assert passed, notes


def test_chapter_timestamps_in_a_long_description_are_not_claims() -> None:
    script = example("long_story")
    plan = {**make_plan(template="long_story", seed=script["seed"], style=script["style"], currency=money_for(script).currency),
            "title": "Why paying the minimum on a card keeps you in debt",
            "description": "Chapters:\n0:00 The bill\n1:14 The trap\n12:05 The way out\nIllustrative only. Not financial advice."}
    passed, notes = number_check(script, plan)
    assert not any("description mentions" in n for n in notes), notes
    plan["description"] += "\n2:30 Save 45% today"                    # a number after a timestamp is still checked
    assert any("'45%'" in n for n in number_check(script, plan)[1])
    short = sip_story()
    short_plan = make_plan(description="0:00 Intro. Illustrative only. Not financial advice.")
    assert any("description mentions '0:00'" in n or "description mentions '0'" in n for n in number_check(short, short_plan)[1])


@pytest.mark.parametrize("amount, rate, inflation, years", [(10000, 4, 3.8, 10), (500000, 7, 6, 15), (2500, 2, 5, 3), (1000, 5, 0, 1)])
def test_real_return_closed_form_matches_the_story_maths(amount: int, rate: float, inflation: float, years: int) -> None:
    script = sip_story(maths=[{"name": "sip", "kind": "real_return", "amount": amount, "rate_pct": rate,
                               "inflation_pct": inflation, "years": years}])
    script["beats"][0]["say"] = "What does {sip_amount} really become?"
    script["beats"][0]["params"]["lines"][0]["text"] = "{sip_real_final}"
    passed, notes = number_check(script)
    assert passed, notes


@pytest.mark.parametrize("monthly, inflation, years", [(150, 6, 5), (12000, 4.5, 10), (99, 0, 3), (2000, 20.4, 1)])
def test_price_rise_closed_form_matches_the_story_maths(monthly: int, inflation: float, years: int) -> None:
    script = sip_story(maths=[{"name": "sip", "kind": "price_rise", "monthly": monthly, "inflation_pct": inflation, "years": years}])
    script["beats"][0]["params"]["lines"][0]["text"] = "{sip_extra_total}"
    passed, notes = number_check(script)
    assert passed, notes


@pytest.mark.parametrize("income, income2, allowance, bands", [
    (48000, 52000, 12570, [[50270, 20], [125140, 40], [None, 45]]),
    (30000, None, 12570, [[50270, 20], [125140, 40], [None, 45]]),
    (130000, 150000, 12570, [[50270, 20], [125140, 40], [None, 45]]),
    (1500000, 1800000, 400000, [[800000, 5], [1200000, 10], [1600000, 15], [2000000, 20], [2400000, 25], [None, 30]]),
])
def test_income_tax_bands_closed_form_matches_the_story_maths(income: int, income2: int | None, allowance: int, bands: list) -> None:
    m = {"name": "sip", "kind": "income_tax_bands", "income": income, "allowance": allowance, "bands": bands}
    if income2:
        m["income2"] = income2
    script = sip_story(maths=[m])
    script["beats"][0]["say"] = "What is the tax on {sip_income}?"
    script["beats"][0]["params"]["lines"][0]["text"] = "{sip_tax}"
    passed, notes = number_check(script)
    assert passed, notes


def test_a_wrong_tax_figure_fails_the_number_check(monkeypatch: pytest.MonkeyPatch) -> None:
    from renderer.models import maths
    script = example("short_story_tax")
    monkeypatch.setattr(maths, "_tax", lambda income, bands: (1.0, 20.0))
    passed, notes = number_check(script)
    assert not passed and any("tax_tax" in n for n in notes)


@pytest.mark.parametrize("amount, fee, per_year, years", [(30000, 2, 12, 10), (125000, 1.5, 1, 25), (999, 0.35, 52, 3)])
def test_fee_take_closed_form_matches_the_story_maths(amount: int, fee: float, per_year: int, years: int) -> None:
    script = sip_story(maths=[{"name": "sip", "kind": "fee_take", "amount": amount, "fee_pct": fee, "per_year": per_year, "years": years}])
    script["beats"][0]["params"]["lines"][0]["text"] = "{sip_total}"
    passed, notes = number_check(script)
    assert passed, notes


@pytest.mark.parametrize("a, b", [("rich.final", "poor.final"), ("rich.gains", "poor.invested"), ("fee.total", "fee.per_year_total")])
def test_compare_closed_form_matches_the_story_maths(a: str, b: str) -> None:
    script = sip_story(maths=[{"name": "sip", "kind": "sip", "monthly": 10000, "rate_pct": 12, "years": 20},
                              {"name": "rich", "kind": "sip", "monthly": 10000, "rate_pct": 12, "years": 30},
                              {"name": "poor", "kind": "sip", "monthly": 10000, "rate_pct": 12, "years": 20},
                              {"name": "fee", "kind": "fee_take", "amount": 30000, "fee_pct": 2, "per_year": 12, "years": 10},
                              {"name": "gap", "kind": "compare", "a": a, "b": b}])
    script["beats"][0]["params"]["lines"][0]["text"] = "{gap_diff}"
    passed, notes = number_check(script)
    assert passed, notes


def test_a_compare_the_number_check_cannot_recompute_fails() -> None:
    script = sip_story(maths=[{"name": "sip", "kind": "sip", "monthly": 10000, "rate_pct": 12, "years": 20},
                              {"name": "gap", "kind": "compare", "a": "sip.final", "b": "sip.monthly"}])
    passed, notes = number_check(script)
    assert not passed and "cannot recompute 'sip.monthly'" in notes[0]


def test_a_wrong_gap_fails_the_number_check(monkeypatch: pytest.MonkeyPatch) -> None:
    from renderer.models import maths
    script = sip_story(maths=[{"name": "sip", "kind": "sip", "monthly": 10000, "rate_pct": 12, "years": 30},
                              {"name": "late", "kind": "sip", "monthly": 10000, "rate_pct": 12, "years": 20},
                              {"name": "gap", "kind": "compare", "a": "sip.final", "b": "late.final"}])
    real = maths.compare
    monkeypatch.setattr(maths, "compare", lambda m, fm, results: {**real(m, fm, results), "figures": {**real(m, fm, results)["figures"], "diff": "₹1"}})
    passed, notes = number_check(script)
    assert not passed and any("gap_diff" in n for n in notes)


@pytest.mark.parametrize("currency, total, parts, per_year", [("USD", 200e9, 8e9, 100000), ("USD", 1e9, 250, None), ("INR", 1e7, 40, 250000)])
def test_share_closed_form_matches_the_story_maths(currency: str, total: float, parts: float, per_year: float | None) -> None:
    m = {"name": "sip", "kind": "share", "total": total, "parts": parts} | ({"per_year": per_year} if per_year else {})
    script = sip_story(currency=currency, maths=[m])
    script["beats"][0]["say"] = "Split {sip_total} among {sip_parts}." + (" Saving {sip_per_year} a year takes {sip_years} years." if per_year else "")
    script["beats"][0]["params"]["lines"][0]["text"] = "{sip_per_part}"
    passed, notes = number_check(script)
    assert passed, notes


def test_a_share_can_be_compared_and_a_wrong_split_fails(monkeypatch: pytest.MonkeyPatch) -> None:
    from renderer.models import maths
    script = sip_story(currency="USD", maths=[{"name": "sip", "kind": "sip", "monthly": 500, "rate_pct": 7, "years": 40},
                                              {"name": "each", "kind": "share", "total": 200e9, "parts": 8e9},
                                              {"name": "gap", "kind": "compare", "a": "sip.final", "b": "each.per_part"}])
    script["beats"][0]["params"]["lines"][0]["text"] = "{gap_ratio}"
    passed, notes = number_check(script)
    assert passed, notes
    real = maths.share
    monkeypatch.setattr(maths, "share", lambda m, fm: {**real(m, fm), "figures": {**real(m, fm)["figures"], "per_part": "$26"}})
    maths.KINDS["share"] = maths.share
    try:
        passed, notes = number_check(script)
    finally:
        maths.KINDS["share"] = real
    assert not passed and any("each_per_part" in n for n in notes)
