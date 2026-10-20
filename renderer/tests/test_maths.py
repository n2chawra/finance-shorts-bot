"""The step-up SIP and loan prepayment kinds: what a writer can count on them to show."""
import pytest

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
