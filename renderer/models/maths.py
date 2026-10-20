"""Named calculations for story videos. Pure Python, no drawing: every figure a Remotion video
shows is computed here, formatted by renderer/engine/formatting.py, and only then handed to the
renderer as a string. The number check recomputes them independently (generator/numbers.py).

Each kind takes the inputs a writer chooses and returns:
  values   raw numbers (for count-ups and charts)
  figures  the on-screen strings, keyed without the maths name ("total_paid" → {card_total_paid})
  series   year-by-year or month-by-month curves for charts, {name: {"x": [...], "y": [...]}}
"""
from __future__ import annotations

from renderer.engine.finance import lumpsum_series, sip_series
from renderer.engine.formatting import Money, nice_axis, times

Result = dict[str, dict]


def _pct(x: float) -> str:
    return f"{x:g}%"


def sip(m: dict, fm: Money = Money()) -> Result:
    months = m["years"]*12
    curve = sip_series(m["monthly"], m["rate_pct"], months)
    final, invested = curve[-1], m["monthly"]*months
    yearly = [curve[y*12] for y in range(m["years"] + 1)]
    return {
        "values": {"final": final, "invested": invested, "gains": final - invested, "monthly": m["monthly"]},
        "figures": {"amount": fm.full(m["monthly"]), "rate": _pct(m["rate_pct"]), "years": str(m["years"]),
                    "final": fm.short(final), "final_long": fm.long(final), "invested": fm.short(invested),
                    "gains": fm.short(final - invested), "ratio": times(final/invested)},
        "series": {"value": {"x": list(range(m["years"] + 1)), "y": yearly}},
    }


def lumpsum(m: dict, fm: Money = Money()) -> Result:
    curve = lumpsum_series(m["amount"], m["rate_pct"], m["years"])
    final = curve[-1]
    return {
        "values": {"final": final, "invested": m["amount"], "gains": final - m["amount"]},
        "figures": {"amount": fm.full(m["amount"]), "rate": _pct(m["rate_pct"]), "years": str(m["years"]),
                    "final": fm.short(final), "final_long": fm.long(final), "gains": fm.short(final - m["amount"]),
                    "ratio": times(final/m["amount"])},
        "series": {"value": {"x": list(range(m["years"] + 1)), "y": curve}},
    }


def emi(m: dict, fm: Money = Money()) -> Result:
    r, n = m["rate_pct"]/100/12, round(m["years"]*12)
    pay = m["amount"]*r*(1 + r)**n/((1 + r)**n - 1) if r else m["amount"]/n   # 0%: a "no-cost EMI"
    total = pay*n
    return {
        "values": {"emi": pay, "total_paid": total, "interest": total - m["amount"], "months": n},
        "figures": {"amount": fm.full(m["amount"]), "rate": _pct(m["rate_pct"]), "months": str(n),
                    "emi": fm.full(pay), "total_paid": fm.short(total), "interest": fm.short(total - m["amount"])},
        "series": {},
    }


def card_min_due(m: dict, fm: Money = Money()) -> Result:
    """A credit card balance paid off with only the minimum due each month.

    Each month: pay the minimum due (min_due_pct of the balance, at least min_due_floor, never more
    than the balance), then interest of rate_pct_month on what is left. Simplified on purpose and
    in the card's favour: real cards charge interest from the purchase date, add GST on interest
    and fees, so the true cost is higher. The video says so.
    """
    amount, r = m["amount"], m["rate_pct_month"]/100
    pct, floor = m["min_due_pct"]/100, m["min_due_floor"]
    bal, paid, interest_total, months = float(amount), 0.0, 0.0, 0
    balance, cumulative = [bal], [0.0]
    year1 = None
    while bal > 0.005 and months < 1200:
        pay = min(bal, max(bal*pct, floor))
        bal -= pay
        paid += pay
        interest = bal*r
        bal += interest
        interest_total += interest
        months += 1
        balance.append(bal)
        cumulative.append(paid)
        if months == 12:
            year1 = {"paid": paid, "owed": bal, "interest": interest_total}
    if months >= 1200:
        raise ValueError("the minimum due never pays this balance off; raise min_due_pct or min_due_floor")
    year1 = year1 or {"paid": paid, "owed": 0.0, "interest": interest_total}
    years = months/12
    ticks = nice_axis(max(cumulative[-1], max(balance)))
    step = max(1, round(years/8))*12                   # about eight year marks along the axis
    return {
        "values": {"amount": amount, "first_min_due": amount*pct, "months": months, "years": years,
                   "total_paid": paid, "interest": interest_total, "paid_year1": year1["paid"],
                   "owed_year1": year1["owed"], "interest_year1": year1["interest"]},
        "figures": {
            "amount": fm.full(amount), "min_due": fm.full(amount*pct), "rate_month": _pct(m["rate_pct_month"]),
            "rate_year": _pct(round(m["rate_pct_month"]*12, 2)), "rate_effective": f"{((1 + r)**12 - 1)*100:.0f}%",
            "min_due_pct": _pct(m["min_due_pct"]), "months": str(months), "years": str(round(years)),
            "total_paid": fm.short(paid), "interest": fm.short(interest_total), "ratio": times(paid/amount),
            "paid_year1": fm.short(year1["paid"]), "owed_year1": fm.short(year1["owed"]), "interest_year1": fm.short(year1["interest"]),
        },
        "series": {
            "balance": {"x": list(range(months + 1)), "y": balance},
            "paid": {"x": list(range(months + 1)), "y": cumulative},
            "ticks": {"x": [], "y": ticks, "labels": [fm.axis(v) for v in ticks]},
            "years": {"x": list(range(0, months + 1, step)), "y": [], "labels": [str(m//12) for m in range(0, months + 1, step)]},
        },
    }


def _ticks(top: float, months: int, fm: Money) -> dict[str, dict]:
    """Chart axes: money ticks up to `top`, and about eight year marks along `months`."""
    ticks, step = nice_axis(top), max(1, round(months/12/8))*12
    return {"ticks": {"x": [], "y": ticks, "labels": [fm.axis(v) for v in ticks]},
            "years": {"x": list(range(0, months + 1, step)), "y": [], "labels": [str(k//12) for k in range(0, months + 1, step)]}}


def sip_stepup(m: dict, fm: Money = Money()) -> Result:
    """A SIP raised by step_pct every year (the amount is not rounded), next to the same SIP never raised.

    Paid at the start of each month, compounded monthly, like `sip`."""
    r, s, years = m["rate_pct"]/100/12, m["step_pct"]/100, m["years"]
    v, invested, value = 0.0, 0.0, [0.0]
    for month in range(years*12):
        pay = m["monthly"]*(1 + s)**(month//12)
        v, invested = (v + pay)*(1 + r), invested + pay
        if month % 12 == 11:
            value.append(v)
    flat = sip_series(m["monthly"], m["rate_pct"], years*12)
    flat_yearly = [flat[y*12] for y in range(years + 1)]
    # sums of stepped amounts can land on a half unit; round off float noise so both checks agree
    final, final_flat, last, invested = v, flat[-1], round(m["monthly"]*(1 + s)**(years - 1), 6), round(invested, 6)
    return {
        "values": {"final": final, "invested": invested, "gains": final - invested, "final_flat": final_flat,
                   "invested_flat": m["monthly"]*years*12, "extra": final - final_flat, "last_monthly": last},
        "figures": {"amount": fm.full(m["monthly"]), "step": _pct(m["step_pct"]), "rate": _pct(m["rate_pct"]),
                    "years": str(years), "final": fm.short(final), "final_long": fm.long(final),
                    "invested": fm.short(invested), "gains": fm.short(final - invested),
                    "final_flat": fm.short(final_flat), "invested_flat": fm.short(m["monthly"]*years*12),
                    "extra": fm.short(final - final_flat), "last_monthly": fm.full(last),
                    "ratio": times(final/final_flat)},
        "series": {"value": {"x": list(range(years + 1)), "y": value}, "flat": {"x": list(range(years + 1)), "y": flat_yearly},
                   **_ticks(final, years*12, fm)},
    }


def loan_prepay(m: dict, fm: Money = Money()) -> Result:
    """A loan of `months` EMIs with one extra payment `prepay` right after EMI number `prepay_month`,
    two ways: keep the end date and lower the EMI, or keep the EMI and end the loan sooner."""
    amount, n, p, extra = m["amount"], round(m["months"]), round(m["prepay_month"]), m["prepay"]
    r = m["rate_pct"]/100/12
    if not 0 < p < n:
        raise ValueError("loan_prepay: prepay_month must fall between the first and the last EMI")
    pay = amount*r*(1 + r)**n/((1 + r)**n - 1)
    bal, base = float(amount), [float(amount)]
    for _ in range(n):
        bal = max(0.0, bal*(1 + r) - pay)
        base.append(bal)
    left = base[p] - extra
    if left <= 0:
        raise ValueError("loan_prepay: the prepayment clears the whole loan; make it smaller")
    reduced = left*r*(1 + r)**(n - p)/((1 + r)**(n - p) - 1)
    bal, paid, sooner = left, pay*p + extra, base[:p + 1] + [left]
    while bal > 0.005:
        last = min(pay, bal*(1 + r))
        bal, paid = bal*(1 + r) - last, paid + last
        sooner.append(max(0.0, bal))
    months_tenure = len(sooner) - 2                      # sooner holds month 0, the prepay point twice, then each EMI
    interest_base, interest_emi = pay*n - amount, pay*p + extra + reduced*(n - p) - amount
    interest_tenure = paid - amount
    return {
        "values": {"emi": pay, "emi_reduced": reduced, "interest_base": interest_base,
                   "interest_reduce_emi": interest_emi, "interest_reduce_tenure": interest_tenure,
                   "months_reduce_tenure": months_tenure, "months_saved": n - months_tenure,
                   "saved_reduce_emi": interest_base - interest_emi, "saved_reduce_tenure": interest_base - interest_tenure},
        "figures": {"amount": fm.full(amount), "rate": _pct(m["rate_pct"]), "months": str(n), "prepay": fm.full(extra),
                    "prepay_month": str(p), "emi": fm.full(pay), "emi_reduced": fm.full(reduced), "emi_cut": fm.full(pay - reduced),
                    "interest_base": fm.short(interest_base), "interest_reduce_emi": fm.short(interest_emi),
                    "interest_reduce_tenure": fm.short(interest_tenure), "months_reduce_tenure": str(months_tenure),
                    "months_saved": str(n - months_tenure), "saved_reduce_emi": fm.short(interest_base - interest_emi),
                    "saved_reduce_tenure": fm.short(interest_base - interest_tenure)},
        "series": {"balance": {"x": list(range(n + 1)), "y": base},
                   "balance_prepaid": {"x": list(range(p + 1)) + list(range(p, months_tenure + 1)), "y": sooner},
                   **_ticks(amount, n, fm)},
    }


KINDS = {"sip": sip, "lumpsum": lumpsum, "emi": emi, "card_min_due": card_min_due, "sip_stepup": sip_stepup,
         "loan_prepay": loan_prepay}

# the inputs each kind needs, for messages a writer can act on
INPUTS = {
    "sip": ("monthly", "rate_pct", "years"),
    "lumpsum": ("amount", "rate_pct", "years"),
    "emi": ("amount", "rate_pct", "years"),
    "card_min_due": ("amount", "rate_pct_month", "min_due_pct", "min_due_floor"),
    "sip_stepup": ("monthly", "step_pct", "rate_pct", "years"),
    "loan_prepay": ("amount", "rate_pct", "months", "prepay", "prepay_month"),
}


def compute(maths: list[dict], fm: Money | None = None) -> dict[str, Result]:
    """Every named calculation, checked for its inputs, its figures in `fm`'s currency (rupees by default)."""
    fm = fm or Money()
    out: dict[str, Result] = {}
    for m in maths:
        kind = m.get("kind")
        if kind not in KINDS:
            raise ValueError(f"maths {m.get('name')!r}: kind must be one of {', '.join(KINDS)}")
        missing = [k for k in INPUTS[kind] if k not in m]
        if missing:
            raise ValueError(f"maths {m['name']!r} is a {kind}, so it needs {', '.join(missing)}")
        if m["name"] in out:
            raise ValueError(f"maths name {m['name']!r} is used twice")
        out[m["name"]] = KINDS[kind](m, fm)
    return out


def placeholders(results: dict[str, Result]) -> dict[str, str]:
    """{name_key: display string} for every figure, the only way a number reaches the screen."""
    return {f"{name}_{k}": v for name, r in results.items() for k, v in r["figures"].items()}
