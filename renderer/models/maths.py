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


def real_return(m: dict, fm: Money = Money()) -> Result:
    """A one-time amount growing at rate_pct while prices rise at inflation_pct: the final value in
    future money, the same in today's money ((1 + r)/(1 + i))^n, and what the amount buys if left as cash."""
    years, r, i = m["years"], m["rate_pct"]/100, m["inflation_pct"]/100
    nominal = [m["amount"]*(1 + r)**y for y in range(years + 1)]
    real = [v/(1 + i)**y for y, v in enumerate(nominal)]
    final, real_final, cash = nominal[-1], real[-1], m["amount"]/(1 + i)**years
    real_rate = ((1 + r)/(1 + i) - 1)*100
    return {
        "values": {"final": final, "real_final": real_final, "real_gains": real_final - m["amount"],
                   "inflation_cost": final - real_final, "real_rate": real_rate, "cash_real": cash, "cash_lost": m["amount"] - cash},
        "figures": {"amount": fm.full(m["amount"]), "rate": _pct(m["rate_pct"]), "inflation": _pct(m["inflation_pct"]),
                    "years": str(years), "final": fm.short(final), "real_final": fm.short(real_final),
                    "real_gains": fm.short(real_final - m["amount"]), "inflation_cost": fm.short(final - real_final),
                    "real_rate": f"{real_rate:.1f}%", "cash_real": fm.short(cash), "cash_lost": fm.short(m["amount"] - cash)},
        "series": {"value": {"x": list(range(years + 1)), "y": nominal}, "real": {"x": list(range(years + 1)), "y": real},
                   **_ticks(final, years*12, fm)},
    }


def price_rise(m: dict, fm: Money = Money()) -> Result:
    """A monthly cost rising by inflation_pct once a year, at the start of each year (so year 1 already
    costs the raised price), against paying today's price for the same years."""
    years, i, monthly = m["years"], m["inflation_pct"]/100, m["monthly"]
    cost = [monthly*(1 + i)**y for y in range(years + 1)]
    new = cost[-1]
    extra_total = round(sum(12*(c - monthly) for c in cost[1:]), 6)
    return {
        "values": {"new_monthly": new, "extra_month": new - monthly, "extra_year": 12*(new - monthly),
                   "extra_total": extra_total, "total_cost": 12*monthly*years + extra_total},
        "figures": {"amount": fm.full(monthly), "inflation": _pct(m["inflation_pct"]), "years": str(years),
                    "new_monthly": fm.full(new), "extra_month": fm.full(new - monthly), "extra_year": fm.full(12*(new - monthly)),
                    "extra_total": fm.short(extra_total), "total_cost": fm.short(12*monthly*years + extra_total),
                    "ratio": times(new/monthly)},
        "series": {"cost": {"x": list(range(years + 1)), "y": cost}},
    }


def _bands(m: dict) -> list[tuple[float, float, float | None]]:
    """[(lower, rate, upper)] from the allowance up; upper None means no limit."""
    out, lower = [], float(m["allowance"])
    for k, band in enumerate(m["bands"]):
        upper, rate = band
        last = k == len(m["bands"]) - 1
        if upper is None and not last:
            raise ValueError("income_tax_bands: only the last band may have no upper limit (null)")
        if upper is not None and upper <= lower:
            raise ValueError("income_tax_bands: each band's upper limit must be above the allowance and the band before it")
        if not 0 <= rate <= 100:
            raise ValueError("income_tax_bands: a band's rate_pct must be between 0 and 100")
        out.append((lower, rate/100, upper))
        lower = upper if upper is not None else lower
    return out


def _tax(income: float, bands: list[tuple[float, float, float | None]]) -> tuple[float, float]:
    """(tax, marginal rate in %) on `income`, band by band."""
    if bands[-1][2] is not None and income >= bands[-1][2]:
        raise ValueError("income_tax_bands: an income lies above the last band; end the bands with [null, rate_pct]")
    tax, marginal = 0.0, 0.0
    for lower, rate, upper in bands:
        if income > lower:
            tax += ((income if upper is None else min(income, upper)) - lower)*rate
        if lower <= income and (upper is None or income < upper):
            marginal = rate*100
    return round(tax, 6), marginal


def income_tax_bands(m: dict, fm: Money = Money()) -> Result:
    """Income tax by bands on gross income: nothing up to the allowance, then each band's rate on the
    part of income inside it. `bands` is [[upper, rate_pct], ...], the last [null, rate_pct]. A
    second income (`income2`, e.g. after a pay rise under frozen bands) is optional. Generic on
    purpose: allowances that shrink with income (UK above £100,000) or filing status are not
    modelled, so the script keeps to incomes where its bands are the whole rule and says so."""
    bands = _bands(m)

    def one(income: float, sfx: str) -> tuple[dict, dict, float, float]:
        tax, marginal = _tax(income, bands)
        values = {f"tax{sfx}": tax, f"take_home{sfx}": income - tax, f"marginal{sfx}": marginal, f"effective{sfx}": tax/income*100}
        figures = {f"income{sfx}": fm.full(income), f"tax{sfx}": fm.full(tax), f"take_home{sfx}": fm.full(income - tax),
                   f"take_home_month{sfx}": fm.full((income - tax)/12), f"marginal{sfx}": _pct(marginal),
                   f"effective{sfx}": f"{tax/income*100:.1f}%"}
        return values, figures, tax, income - tax

    values, figures, tax, home = one(m["income"], "")
    figures |= {"allowance": fm.full(m["allowance"])}
    for k, (_, rate, upper) in enumerate(bands, 1):
        figures[f"rate{k}"] = _pct(round(rate*100, 6))
        if upper is not None:
            figures[f"band{k}"] = fm.full(upper)
    if "income2" in m:
        v2, f2, tax2, home2 = one(m["income2"], "2")
        rise = m["income2"] - m["income"]
        if rise <= 0:
            raise ValueError("income_tax_bands: income2 must be above income")
        values |= v2 | {"rise": rise, "extra_tax": tax2 - tax, "kept": home2 - home}
        figures |= f2 | {"rise": fm.full(rise), "extra_tax": fm.full(tax2 - tax), "kept": fm.full(home2 - home),
                         "kept_pct": f"{(home2 - home)/rise*100:.0f}%"}
    return {"values": values, "figures": figures, "series": {}}


def fee_take(m: dict, fm: Money = Money()) -> Result:
    """A fee of fee_pct taken from `amount` every period (per_year periods a year, 12 for monthly):
    what it takes per period, per year and over `years`, added up period by period."""
    per_year, years = round(m["per_year"]), m["years"]
    if per_year < 1 or years < 1:
        raise ValueError("fee_take: per_year and years must be at least 1")
    one = m["amount"]*m["fee_pct"]/100
    total, cumulative = 0.0, [0.0]
    for period in range(per_year*years):
        total += one
        if period % per_year == per_year - 1:
            cumulative.append(total)
    total, year = round(total, 6), round(one*per_year, 6)
    return {
        "values": {"per_period": one, "per_year_total": year, "total": total},
        "figures": {"amount": fm.full(m["amount"]), "fee_pct": _pct(m["fee_pct"]), "years": str(years),
                    "per_period": fm.full(one), "per_year_total": fm.full(year), "total": fm.short(total)},
        "series": {"take": {"x": list(range(years + 1)), "y": cumulative}, **_ticks(total, years*12, fm)},
    }


def compare(m: dict, fm: Money, results: dict[str, Result]) -> Result:
    """The gap between two results computed earlier in the same list: `a` and `b` are
    "name.value_key" (as in @references), the bigger one first. Gives the difference, how many
    times bigger a is, and by how many percent."""
    def get(ref: object, side: str) -> float:
        name, _, key = str(ref).lstrip("@").partition(".")
        if name not in results or key not in results[name]["values"]:
            raise ValueError(f"compare {m['name']!r}: {side} {ref!r} must be 'name.value_key' of a result computed earlier in maths")
        return float(results[name]["values"][key])
    a, b = get(m["a"], "a"), get(m["b"], "b")
    if not 0 < b <= a:
        raise ValueError(f"compare {m['name']!r}: b must be above zero and a at least b (put the bigger result first)")
    return {
        "values": {"a": a, "b": b, "diff": a - b, "ratio": a/b, "pct": (a/b - 1)*100},
        "figures": {"a": fm.short(a), "b": fm.short(b), "diff": fm.short(a - b), "ratio": times(a/b),
                    "pct": f"{(a/b - 1)*100:.0f}%"},
        "series": {},
    }


KINDS = {"sip": sip, "lumpsum": lumpsum, "emi": emi, "card_min_due": card_min_due, "sip_stepup": sip_stepup,
         "loan_prepay": loan_prepay, "real_return": real_return, "price_rise": price_rise, "income_tax_bands": income_tax_bands, "fee_take": fee_take,
         "compare": compare}

# the inputs each kind needs, for messages a writer can act on
INPUTS = {
    "sip": ("monthly", "rate_pct", "years"),
    "lumpsum": ("amount", "rate_pct", "years"),
    "emi": ("amount", "rate_pct", "years"),
    "card_min_due": ("amount", "rate_pct_month", "min_due_pct", "min_due_floor"),
    "sip_stepup": ("monthly", "step_pct", "rate_pct", "years"),
    "loan_prepay": ("amount", "rate_pct", "months", "prepay", "prepay_month"),
    "real_return": ("amount", "rate_pct", "inflation_pct", "years"),
    "price_rise": ("monthly", "inflation_pct", "years"),
    "income_tax_bands": ("income", "allowance", "bands"),
    "fee_take": ("amount", "fee_pct", "per_year", "years"),
    "compare": ("a", "b"),
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
        out[m["name"]] = compare(m, fm, out) if kind == "compare" else KINDS[kind](m, fm)
    return out


def placeholders(results: dict[str, Result]) -> dict[str, str]:
    """{name_key: display string} for every figure, the only way a number reaches the screen."""
    return {f"{name}_{k}": v for name, r in results.items() for k, v in r["figures"].items()}
