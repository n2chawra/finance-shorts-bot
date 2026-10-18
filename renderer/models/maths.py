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


KINDS = {"sip": sip, "lumpsum": lumpsum, "emi": emi, "card_min_due": card_min_due}

# the inputs each kind needs, for messages a writer can act on
INPUTS = {
    "sip": ("monthly", "rate_pct", "years"),
    "lumpsum": ("amount", "rate_pct", "years"),
    "emi": ("amount", "rate_pct", "years"),
    "card_min_due": ("amount", "rate_pct_month", "min_due_pct", "min_due_floor"),
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
