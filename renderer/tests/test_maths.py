"""The newer maths kinds (step-up SIP, loan prepayment, inflation, income tax, fees, comparisons): what a writer can count on them to show."""
import pytest

from renderer.engine.formatting import Money, times
from renderer.models import maths


def test_a_stepped_up_sip_beats_the_flat_one_and_charts_both() -> None:
    r = maths.compute([{"name": "s", "kind": "sip_stepup", "monthly": 5000, "step_pct": 10, "rate_pct": 12, "years": 20}])["s"]
    v = r["values"]
    assert v["final"] > v["final_flat"] and v["invested"] > v["invested_flat"] == 5000*240
    assert r["figures"]["last_monthly"] == "₹30,580"                     # 5,000 raised 10% nineteen times
    assert len(r["series"]["value"]["y"]) == len(r["series"]["flat"]["y"]) == 21
    assert r["series"]["value"]["y"][-1] == pytest.approx(v["final"])


def test_no_step_up_is_the_plain_sip() -> None:
    s = maths.compute([{"name": "a", "kind": "sip_stepup", "monthly": 2000, "step_pct": 0, "rate_pct": 10, "years": 8},
                       {"name": "b", "kind": "sip", "monthly": 2000, "rate_pct": 10, "years": 8}])
    assert s["a"]["values"]["final"] == pytest.approx(s["b"]["values"]["final"])
    assert s["a"]["figures"]["extra"] == "₹0"


def test_keeping_the_emi_saves_more_than_lowering_it() -> None:
    r = maths.compute([{"name": "l", "kind": "loan_prepay", "amount": 3000000, "rate_pct": 8.5, "months": 240,
                        "prepay": 300000, "prepay_month": 36}])["l"]
    v = r["values"]
    assert v["emi_reduced"] < v["emi"] and v["months_reduce_tenure"] < 240
    assert 0 < v["saved_reduce_emi"] < v["saved_reduce_tenure"]
    sooner = r["series"]["balance_prepaid"]
    assert len(sooner["x"]) == len(sooner["y"]) and sooner["x"][-1] == v["months_reduce_tenure"] and sooner["y"][-1] == 0


@pytest.mark.parametrize("prepay, at", [(5000000, 12), (1000, 0), (1000, 240)])
def test_a_prepayment_that_cannot_happen_is_refused(prepay: int, at: int) -> None:
    with pytest.raises(ValueError, match="loan_prepay"):
        maths.compute([{"name": "l", "kind": "loan_prepay", "amount": 3000000, "rate_pct": 8.5, "months": 240,
                        "prepay": prepay, "prepay_month": at}])


def test_real_return_is_the_final_value_in_todays_money() -> None:
    r = maths.compute([{"name": "r", "kind": "real_return", "amount": 10000, "rate_pct": 4, "inflation_pct": 3.8, "years": 10}])["r"]
    v = r["values"]
    assert v["final"] == pytest.approx(10000*1.04**10) and v["real_final"] == pytest.approx(10000*(1.04/1.038)**10)
    assert v["inflation_cost"] == pytest.approx(v["final"] - v["real_final"]) and v["cash_real"] < 10000
    assert r["figures"]["real_rate"] == "0.2%"
    assert len(r["series"]["value"]["y"]) == len(r["series"]["real"]["y"]) == 11


def test_a_return_below_inflation_loses_buying_power() -> None:
    v = maths.compute([{"name": "r", "kind": "real_return", "amount": 1000, "rate_pct": 2, "inflation_pct": 5, "years": 5}])["r"]["values"]
    assert v["real_final"] < 1000 and v["real_rate"] < 0 and v["real_gains"] < 0


def test_price_rise_charges_each_year_the_raised_price() -> None:
    r = maths.compute([{"name": "p", "kind": "price_rise", "monthly": 100, "inflation_pct": 10, "years": 2}])["p"]
    v = r["values"]
    assert v["new_monthly"] == pytest.approx(121)
    assert v["extra_total"] == pytest.approx(12*10 + 12*21) and v["total_cost"] == pytest.approx(2400 + 372)
    flat = maths.compute([{"name": "p", "kind": "price_rise", "monthly": 100, "inflation_pct": 0, "years": 3}])["p"]
    assert flat["values"]["extra_total"] == 0 and flat["values"]["new_monthly"] == 100


def test_income_tax_by_bands_matches_the_uk_rates() -> None:
    bands = [[50270, 20], [125140, 40], [None, 45]]
    t = maths.compute([{"name": "t", "kind": "income_tax_bands", "income": 50000, "income2": 55000, "allowance": 12570,
                        "bands": bands}])["t"]
    v, f = t["values"], t["figures"]
    assert v["tax"] == pytest.approx((50000 - 12570)*0.2)
    assert v["tax2"] == pytest.approx(37700*0.2 + (55000 - 50270)*0.4)
    assert (f["marginal"], f["marginal2"], f["allowance"], f["band1"], f["rate3"]) == ("20%", "40%", "₹12,570", "₹50,270", "45%")
    assert v["kept"] == pytest.approx(5000 - (v["tax2"] - v["tax"]))
    assert maths.compute([{"name": "t", "kind": "income_tax_bands", "income": 10000, "allowance": 12570,
                           "bands": bands}])["t"]["values"]["tax"] == 0


@pytest.mark.parametrize("over, match", [({"bands": [[None, 20], [125140, 40]]}, "only the last band"),
                                         ({"bands": [[10000, 20], [None, 40]]}, "upper limit"),
                                         ({"income": 200000, "bands": [[50270, 20], [125140, 40]]}, "above the last band"),
                                         ({"income2": 40000}, "income2 must be above")])
def test_income_tax_bands_rejects_a_broken_table(over: dict, match: str) -> None:
    m = {"name": "t", "kind": "income_tax_bands", "income": 50000, "allowance": 12570, "bands": [[50270, 20], [None, 40]], **over}
    with pytest.raises(ValueError, match=match):
        maths.compute([m])


def test_fee_take_adds_up_a_fee_every_period_and_charts_it() -> None:
    r = maths.compute([{"name": "f", "kind": "fee_take", "amount": 30000, "fee_pct": 2, "per_year": 12, "years": 10}])["f"]
    f, v = r["figures"], r["values"]
    assert (f["per_period"], f["per_year_total"], f["total"], f["fee_pct"]) == ("₹600", "₹7,200", "₹72,000", "2%")
    assert r["series"]["take"]["y"][1] == pytest.approx(7200) and r["series"]["take"]["y"][-1] == pytest.approx(v["total"])
    with pytest.raises(ValueError, match="at least 1"):
        maths.compute([{"name": "f", "kind": "fee_take", "amount": 100, "fee_pct": 1, "per_year": 0, "years": 1}])


def test_compare_gives_the_gap_between_two_earlier_results() -> None:
    r = maths.compute([{"name": "late", "kind": "lumpsum", "amount": 1000, "rate_pct": 10, "years": 1},
                       {"name": "early", "kind": "lumpsum", "amount": 1000, "rate_pct": 10, "years": 2},
                       {"name": "gap", "kind": "compare", "a": "early.final", "b": "@late.final"}])["gap"]
    assert r["values"]["diff"] == pytest.approx(110) and r["figures"]["pct"] == "10%" and r["figures"]["ratio"] == times(1.1)


@pytest.mark.parametrize("a, b, match", [("x.final", "early.final", "computed earlier"), ("early.nope", "early.final", "computed earlier"),
                                         ("early.invested", "early.final", "bigger result first")])
def test_compare_rejects_a_missing_or_reversed_result(a: str, b: str, match: str) -> None:
    with pytest.raises(ValueError, match=match):
        maths.compute([{"name": "early", "kind": "lumpsum", "amount": 1000, "rate_pct": 10, "years": 2},
                       {"name": "gap", "kind": "compare", "a": a, "b": b}])


def test_share_splits_a_total_and_counts_the_years_to_reach_it() -> None:
    fm = Money("USD")
    r = maths.compute([{"name": "s", "kind": "share", "total": 200e9, "parts": 8e9, "per_year": 100000}], fm)["s"]
    f, v = r["figures"], r["values"]
    assert (f["total"], f["total_long"], f["parts"], f["per_part"]) == ("$200.00B", "$200 billion", "8B", "$25")
    assert (f["per_year"], f["years"]) == ("$100,000", "2M") and v["years"] == pytest.approx(2e6)
    r = maths.compute([{"name": "s", "kind": "share", "total": 1e9, "parts": 4, "per_year": 100000}], fm)["s"]
    assert (r["figures"]["per_part"], r["figures"]["years"]) == ("$250.0M", "10,000")
    assert "years" not in maths.compute([{"name": "s", "kind": "share", "total": 1e6, "parts": 4}], fm)["s"]["figures"]


@pytest.mark.parametrize("over, match", [({"parts": 0}, "parts at least 1"), ({"parts": 2e9}, "less than one unit"),
                                         ({"per_year": 2e9}, "at most total")])
def test_share_rejects_a_split_it_cannot_show(over: dict, match: str) -> None:
    with pytest.raises(ValueError, match=match):
        maths.compute([{"name": "s", "kind": "share", "total": 1e9, "parts": 8, **over}], Money("USD"))


def test_count_reads_as_a_number_of_things() -> None:
    from renderer.engine import voice
    from renderer.engine.formatting import count
    assert (count(8e9), count(340e6), count(10000), count(250000, indian=True)) == ("8B", "340M", "10,000", "2,50,000")
    assert (voice.spoken("8B", "USD"), voice.spoken("10,000", "USD")) == ("eight billion", "ten thousand")
