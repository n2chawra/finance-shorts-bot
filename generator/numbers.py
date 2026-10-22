"""Number check: every figure a video shows, and every number in its title or description, must
come from the script's inputs through code.

The formulas here are closed-form and written independently of the renderer's month-by-month
simulation, so a mistake in either one shows up as a mismatch.
"""
import math
import re
from collections.abc import Callable, Mapping

from renderer.timeline.build import check_script
from renderer.engine.formatting import fact_value, group_indian, group_western, money_for, times

from . import topics

# ---------------- formulas ----------------


def sip_fv(monthly: float, annual_pct: float, months: int) -> float:
    """Future value of a monthly SIP paid at the start of each month, compounded monthly."""
    r = annual_pct/100/12
    return monthly*((1 + r)**months - 1)/r*(1 + r)


def lumpsum_fv(amount: float, annual_pct: float, years: float, compounds_per_year: int = 1) -> float:
    """Future value of a one-time amount."""
    return amount*(1 + annual_pct/100/compounds_per_year)**(years*compounds_per_year)


def real_value(amount: float, inflation_pct: float, years: float) -> float:
    """What `amount` will buy after `years` of inflation, in today's rupees."""
    return amount/(1 + inflation_pct/100)**years


def emi(principal: float, annual_pct: float, years: float) -> float:
    """Equated monthly instalment on a reducing-balance loan."""
    r, n = annual_pct/100/12, round(years*12)
    if r == 0:                                          # a "no-cost EMI"
        return principal/n
    return principal*r*(1 + r)**n/((1 + r)**n - 1)


def emi_total_interest(principal: float, annual_pct: float, years: float) -> float:
    return emi(principal, annual_pct, years)*round(years*12) - principal


def cagr(start: float, end: float, years: float) -> float:
    """Compound annual growth rate, in percent."""
    return ((end/start)**(1/years) - 1)*100


def fd_maturity(principal: float, annual_pct: float, years: float) -> float:
    """Fixed deposit maturity value with quarterly compounding (the usual bank convention)."""
    return lumpsum_fv(principal, annual_pct, years, 4)


# ---------------- expected figures ----------------


def card_min_due(amount: float, rate_pct_month: float, min_due_pct: float, floor: float) -> dict[str, float]:
    """Paying only the minimum due on a card, in closed form (renderer/models/maths.py simulates it
    month by month). Two regimes: while pct x balance >= floor the balance shrinks geometrically
    by q = (1 - pct)(1 + r) a month; after that a fixed `floor` is paid, and B_k - B* = (B_0 - B*)(1 + r)^k
    with B* = floor(1 + r)/r, until the last payment clears what is left."""
    r, pct = rate_pct_month/100, min_due_pct/100
    q = (1 - pct)*(1 + r)
    if q >= 1 and amount*pct >= floor:
        raise ValueError("the minimum due never pays this balance off")
    k1 = 0 if amount*pct < floor else math.floor(math.log(floor/(amount*pct))/math.log(q)) + 1
    while k1 > 0 and amount*q**(k1 - 1)*pct < floor:        # guard the log against rounding at the edge
        k1 -= 1
    while amount*q**k1*pct >= floor:
        k1 += 1
    paid1, b = pct*amount*(1 - q**k1)/(1 - q), amount*q**k1
    star = floor*(1 + r)/r
    if b >= star:
        raise ValueError("the minimum due never pays this balance off")
    k2 = 0 if b <= floor else math.ceil(math.log((floor - star)/(b - star))/math.log(1 + r))
    while k2 > 0 and star + (b - star)*(1 + r)**(k2 - 1) <= floor:
        k2 -= 1
    last = star + (b - star)*(1 + r)**k2
    months, total = k1 + k2 + 1, paid1 + k2*floor + last

    def at(m: int) -> tuple[float, float]:              # (paid so far, still owed) after m months
        if m <= k1:
            return pct*amount*(1 - q**m)/(1 - q), amount*q**m
        if m >= months:
            return total, 0.0
        return paid1 + (m - k1)*floor, star + (b - star)*(1 + r)**(m - k1)

    paid12, owed12 = at(12)
    return {"months": months, "total_paid": total, "interest": total - amount, "paid_year1": paid12,
            "owed_year1": owed12, "interest_year1": paid12 + owed12 - amount}


def sip_stepup_fv(monthly: float, step_pct: float, annual_pct: float, years: int) -> tuple[float, float]:
    """(final value, total invested) of a SIP raised by step_pct each year: one SIP block per year,
    each a 12-month SIP compounded on to the end. Closed form per block, summed."""
    r, s = annual_pct/100/12, step_pct/100
    block = sip_fv(1, annual_pct, 12)
    final = sum(monthly*(1 + s)**y*block*(1 + r)**(12*(years - 1 - y)) for y in range(years))
    invested = monthly*12*(((1 + s)**years - 1)/s if s else years)
    return final, round(invested, 6)


def loan_balance(principal: float, annual_pct: float, pay: float, k: int) -> float:
    """What is still owed after k payments of `pay`."""
    r = annual_pct/100/12
    return principal*(1 + r)**k - pay*((1 + r)**k - 1)/r


def loan_prepay(amount: float, annual_pct: float, months: int, prepay: float, prepay_month: int) -> dict[str, float]:
    """One prepayment after EMI number prepay_month: the lower EMI over the same end date, or the same
    EMI with the end date brought forward (n = -ln(1 - rB/E)/ln(1 + r) on the balance B left)."""
    r, n, p = annual_pct/100/12, months, prepay_month
    pay = emi(amount, annual_pct, n/12)
    left = loan_balance(amount, annual_pct, pay, p) - prepay
    reduced = emi(left, annual_pct, (n - p)/12)
    full = math.floor(-math.log(1 - r*left/pay)/math.log(1 + r) + 1e-9)
    rest = loan_balance(left, annual_pct, pay, full)
    tail = rest*(1 + r) if rest > 0.005 else 0.0
    tenure = p + full + (1 if tail else 0)
    base = pay*n - amount
    by_emi, by_tenure = pay*p + prepay + reduced*(n - p) - amount, pay*(p + full) + prepay + tail - amount
    return {"emi": pay, "emi_reduced": reduced, "interest_base": base, "interest_reduce_emi": by_emi,
            "interest_reduce_tenure": by_tenure, "months_reduce_tenure": tenure}


def price_rise_extra(monthly: float, inflation_pct: float, years: int) -> float:
    """Extra paid over `years` when a monthly cost rises once a year (year 1 already at the raised
    price), against today's price: 12m(Σ(1 + i)^y - n), the sum a geometric series."""
    i = inflation_pct/100
    if i == 0:
        return 0.0
    return round(12*monthly*((1 + i)*((1 + i)**years - 1)/i - years), 6)


def banded_tax(income: float, allowance: float, bands: list) -> tuple[float, float]:
    """(tax, marginal %) as a sum of rate steps: each threshold adds (rate - rate below) on all
    income above it. A different route from the band-by-band sum in renderer/models/maths.py."""
    thresholds = [allowance] + [b[0] for b in bands[:-1]]
    rates = [0.0] + [b[1] for b in bands]
    tax = sum((rates[k + 1] - rates[k])/100*max(0.0, income - t) for k, t in enumerate(thresholds))
    marginal = next((rates[k + 1] for k in reversed(range(len(thresholds))) if income >= thresholds[k]), 0.0)
    return round(tax, 6), marginal


def fee_take_total(amount: float, fee_pct: float, per_year: int, years: int) -> float:
    """A fee taken every period for `years`: amount × fee × periods, in one product."""
    return round(amount*fee_pct*per_year*years/100, 6)


def _values(m: dict, done: dict[str, dict[str, float]]) -> dict[str, float]:
    """The raw results of one maths entry from the closed forms above, keyed as the story maths'
    `values`, for a `compare` to read. Only the money results a story compares are here."""
    kind = m["kind"]
    if kind in ("sip", "lumpsum", "real_return"):
        final = (sip_fv(m["monthly"], m["rate_pct"], m["years"]*12) if kind == "sip"
                 else lumpsum_fv(m["amount"], m["rate_pct"], m["years"]))
        invested = m["monthly"]*m["years"]*12 if kind == "sip" else m["amount"]
        out = {"final": final, "invested": invested, "gains": final - invested}
        if kind == "real_return":
            real, cash = real_value(final, m["inflation_pct"], m["years"]), real_value(m["amount"], m["inflation_pct"], m["years"])
            out = {"final": final, "real_final": real, "real_gains": real - m["amount"], "inflation_cost": final - real,
                   "cash_real": cash, "cash_lost": m["amount"] - cash}
        return out
    if kind == "sip_stepup":
        final, invested = sip_stepup_fv(m["monthly"], m["step_pct"], m["rate_pct"], m["years"])
        flat = sip_fv(m["monthly"], m["rate_pct"], m["years"]*12)
        return {"final": final, "invested": invested, "gains": final - invested, "final_flat": flat,
                "invested_flat": m["monthly"]*m["years"]*12, "extra": final - flat}
    if kind == "emi":
        pay = emi(m["amount"], m["rate_pct"], m["years"])
        return {"emi": pay, "total_paid": pay*round(m["years"]*12), "interest": pay*round(m["years"]*12) - m["amount"]}
    if kind == "card_min_due":
        c = card_min_due(m["amount"], m["rate_pct_month"], m["min_due_pct"], m["min_due_floor"])
        return {k: c[k] for k in ("total_paid", "interest", "paid_year1", "owed_year1", "interest_year1")}
    if kind == "loan_prepay":
        c = loan_prepay(m["amount"], m["rate_pct"], round(m["months"]), m["prepay"], round(m["prepay_month"]))
        return {**{k: c[k] for k in ("emi", "emi_reduced", "interest_base", "interest_reduce_emi", "interest_reduce_tenure")},
                "saved_reduce_emi": c["interest_base"] - c["interest_reduce_emi"],
                "saved_reduce_tenure": c["interest_base"] - c["interest_reduce_tenure"]}
    if kind == "price_rise":
        extra = price_rise_extra(m["monthly"], m["inflation_pct"], m["years"])
        return {"extra_total": extra, "total_cost": 12*m["monthly"]*m["years"] + extra,
                "new_monthly": lumpsum_fv(m["monthly"], m["inflation_pct"], m["years"])}
    if kind == "income_tax_bands":
        tax = banded_tax(m["income"], m["allowance"], m["bands"])[0]
        return {"tax": tax, "take_home": m["income"] - tax}
    if kind == "fee_take":
        total = fee_take_total(m["amount"], m["fee_pct"], round(m["per_year"]), m["years"])
        return {"total": total, "per_year_total": total/m["years"], "per_period": m["amount"]*m["fee_pct"]/100}
    if kind == "compare":
        a, b = (_ref(m[side], done, m["name"]) for side in ("a", "b"))
        return {"a": a, "b": b, "diff": a - b}
    return {}


def _ref(ref: object, done: dict[str, dict[str, float]], name: str) -> float:
    n, _, key = str(ref).lstrip("@").partition(".")
    if key not in done.get(n, {}):
        raise ValueError(f"compare {name!r}: the number check cannot recompute {ref!r}; compare a money result "
                         "(renderer/templates/long_story/README.md lists them)")
    return done[n][key]


def _long_story(s: dict) -> dict[str, str]:
    """The figures of a story script (long or short): its `maths` from the closed forms above, and
    its sourced facts exactly as the feed published them."""
    fm = money_for(s)
    out: dict[str, str] = {f"fact{i}": fact_value(f["value"], f["unit"], f.get("currency") or fm.currency)
                           for i, f in enumerate(s.get("facts") or [], 1)}
    done: dict[str, dict[str, float]] = {}
    for m in s.get("maths", []):
        n, kind = m["name"], m["kind"]
        done[n] = _values(m, done)
        if kind == "compare":
            a, b = done[n]["a"], done[n]["b"]
            out |= {f"{n}_a": fm.short(a), f"{n}_b": fm.short(b), f"{n}_diff": fm.short(a - b),
                    f"{n}_ratio": times(a/b), f"{n}_pct": f"{(a - b)/b*100:.0f}%"}
        elif kind == "fee_take":
            total = done[n]["total"]
            out |= {f"{n}_per_period": fm.full(m["amount"]*m["fee_pct"]/100), f"{n}_per_year_total": fm.full(total/m["years"]),
                    f"{n}_total": fm.short(total)}
        elif kind == "card_min_due":
            c = card_min_due(m["amount"], m["rate_pct_month"], m["min_due_pct"], m["min_due_floor"])
            out |= {f"{n}_months": str(c["months"]), f"{n}_years": str(round(c["months"]/12)),
                    f"{n}_total_paid": fm.short(c["total_paid"]), f"{n}_interest": fm.short(c["interest"]),
                    f"{n}_ratio": times(c["total_paid"]/m["amount"]), f"{n}_paid_year1": fm.short(c["paid_year1"]),
                    f"{n}_owed_year1": fm.short(c["owed_year1"]), f"{n}_interest_year1": fm.short(c["interest_year1"]),
                    f"{n}_min_due": fm.full(m["amount"]*m["min_due_pct"]/100)}
        elif kind == "emi":
            pay = emi(m["amount"], m["rate_pct"], m["years"])
            months = round(m["years"]*12)
            out |= {f"{n}_emi": fm.full(pay), f"{n}_total_paid": fm.short(pay*months), f"{n}_interest": fm.short(pay*months - m["amount"])}
        elif kind == "sip":
            final, invested = sip_fv(m["monthly"], m["rate_pct"], m["years"]*12), m["monthly"]*m["years"]*12
            out |= {f"{n}_final": fm.short(final), f"{n}_final_long": fm.long(final), f"{n}_invested": fm.short(invested),
                    f"{n}_gains": fm.short(final - invested), f"{n}_ratio": times(final/invested)}
        elif kind == "sip_stepup":
            final, invested = sip_stepup_fv(m["monthly"], m["step_pct"], m["rate_pct"], m["years"])
            flat = sip_fv(m["monthly"], m["rate_pct"], m["years"]*12)
            out |= {f"{n}_final": fm.short(final), f"{n}_final_long": fm.long(final), f"{n}_invested": fm.short(invested),
                    f"{n}_gains": fm.short(final - invested), f"{n}_final_flat": fm.short(flat),
                    f"{n}_invested_flat": fm.short(m["monthly"]*m["years"]*12), f"{n}_extra": fm.short(final - flat),
                    f"{n}_last_monthly": fm.full(round(m["monthly"]*(1 + m["step_pct"]/100)**(m["years"] - 1), 6)),
                    f"{n}_ratio": times(final/flat)}
        elif kind == "loan_prepay":
            c = loan_prepay(m["amount"], m["rate_pct"], round(m["months"]), m["prepay"], round(m["prepay_month"]))
            months = round(m["months"])
            out |= {f"{n}_emi": fm.full(c["emi"]), f"{n}_emi_reduced": fm.full(c["emi_reduced"]),
                    f"{n}_emi_cut": fm.full(c["emi"] - c["emi_reduced"]), f"{n}_interest_base": fm.short(c["interest_base"]),
                    f"{n}_interest_reduce_emi": fm.short(c["interest_reduce_emi"]),
                    f"{n}_interest_reduce_tenure": fm.short(c["interest_reduce_tenure"]),
                    f"{n}_months_reduce_tenure": str(c["months_reduce_tenure"]),
                    f"{n}_months_saved": str(months - c["months_reduce_tenure"]),
                    f"{n}_saved_reduce_emi": fm.short(c["interest_base"] - c["interest_reduce_emi"]),
                    f"{n}_saved_reduce_tenure": fm.short(c["interest_base"] - c["interest_reduce_tenure"])}
        elif kind == "real_return":
            final = lumpsum_fv(m["amount"], m["rate_pct"], m["years"])
            real, cash = real_value(final, m["inflation_pct"], m["years"]), real_value(m["amount"], m["inflation_pct"], m["years"])
            out |= {f"{n}_final": fm.short(final), f"{n}_real_final": fm.short(real), f"{n}_real_gains": fm.short(real - m["amount"]),
                    f"{n}_inflation_cost": fm.short(final - real), f"{n}_cash_real": fm.short(cash),
                    f"{n}_cash_lost": fm.short(m["amount"] - cash),
                    f"{n}_real_rate": f"{(cagr(m['amount'], real, m['years']) if m['years'] else 0.0):.1f}%"}
        elif kind == "price_rise":
            new = lumpsum_fv(m["monthly"], m["inflation_pct"], m["years"])
            extra = price_rise_extra(m["monthly"], m["inflation_pct"], m["years"])
            out |= {f"{n}_new_monthly": fm.full(new), f"{n}_extra_month": fm.full(new - m["monthly"]),
                    f"{n}_extra_year": fm.full(12*(new - m["monthly"])), f"{n}_extra_total": fm.short(extra),
                    f"{n}_total_cost": fm.short(12*m["monthly"]*m["years"] + extra), f"{n}_ratio": times(new/m["monthly"])}
        elif kind == "income_tax_bands":
            for sfx, income in (("", m["income"]), ("2", m.get("income2"))):
                if income is None:
                    continue
                tax, marginal = banded_tax(income, m["allowance"], m["bands"])
                out |= {f"{n}_tax{sfx}": fm.full(tax), f"{n}_take_home{sfx}": fm.full(income - tax),
                        f"{n}_take_home_month{sfx}": fm.full((income - tax)/12), f"{n}_marginal{sfx}": f"{marginal:g}%",
                        f"{n}_effective{sfx}": f"{tax/income*100:.1f}%"}
            if "income2" in m:
                (t1, _), (t2, _) = banded_tax(m["income"], m["allowance"], m["bands"]), banded_tax(m["income2"], m["allowance"], m["bands"])
                rise = m["income2"] - m["income"]
                out |= {f"{n}_extra_tax": fm.full(t2 - t1), f"{n}_kept": fm.full(rise - (t2 - t1)),
                        f"{n}_kept_pct": f"{(rise - (t2 - t1))/rise*100:.0f}%"}
        elif kind == "lumpsum":
            final = lumpsum_fv(m["amount"], m["rate_pct"], m["years"])
            out |= {f"{n}_final": fm.short(final), f"{n}_final_long": fm.long(final), f"{n}_gains": fm.short(final - m["amount"]),
                    f"{n}_ratio": times(final/m["amount"])}
    return out


EXPECTED: dict[str, Callable[[dict], dict[str, str]]] = {"long_story": _long_story, "short_story": _long_story}

# ---------------- claims in free text ----------------

_NUMBER = re.compile(r"[₹$£€]?\s?\d[\d,]*(?:\.\d+)?\s?(?:crore|cr|lakh|l|trillion|billion|million|thousand|bn|t|b|m|k|%|×|x)?(?![a-z])", re.IGNORECASE)


def _norm(token: str) -> str:
    t = token.lower().replace(" ", "").replace(",", "").replace("crore", "cr").replace("lakh", "l").replace("x", "×")
    for word, short in (("trillion", "t"), ("billion", "b"), ("bn", "b"), ("million", "m"), ("thousand", "k")):
        t = t.replace(word, short)
    return t.rstrip(".")


def _numbers_in(value: object) -> list[float]:
    if isinstance(value, bool):
        return []
    if isinstance(value, (int, float)):
        return [value]
    if isinstance(value, Mapping):
        return [n for k, v in value.items() if k not in ("seed", "style", "text", "distractors", "seconds") for n in _numbers_in(v)]
    if isinstance(value, list):
        return [n for v in value for n in _numbers_in(v)]
    return []


def allowed_numbers(script: dict, figures: Mapping[str, str]) -> set[str]:
    """Every way a legitimate number may be written: computed figures as displayed, and the
    script's inputs in plain, grouped, money, short and percent forms (in the script's currency)."""
    fm = money_for(script)
    out = {_norm(v) for v in figures.values()}
    for n in _numbers_in(script):
        out |= {_norm(f"{n:g}"), _norm(f"{n:g}%"), _norm(group_indian(round(n))), _norm(group_western(round(n))),
                _norm(fm.full(n)), _norm(fm.short(n)), _norm(fm.long(n))}
    return out | {t.lstrip("₹$£€") for t in out}


_CHAPTER = re.compile(r"^\s*(?:\d+:)?\d+:\d\d(?=\s)", re.MULTILINE)


def check_claims(texts: Mapping[str, str], script: dict, figures: Mapping[str, str]) -> list[str]:
    """Numbers in free text (title, description, hashtags) that no input or computed figure backs."""
    ok = allowed_numbers(script, figures)
    out = []
    for field, text in texts.items():
        for m in _NUMBER.finditer(text):
            token = _norm(m.group())
            if token not in ok and token.lstrip("₹$£€") not in ok:
                out.append(f"{field} mentions {m.group().strip()!r}, which is neither a script input nor a computed figure")
    return out


def number_check(script: dict, plan: dict | None = None, feed_topic: dict | None = None) -> tuple[bool, list[str]]:
    """(passed, notes). Fails if the script is invalid, hard-codes a number, disagrees with the
    independent formulas, drifts from the plan, the plan's text claims an unsupported number, or a
    news script's sourced facts differ from its research feed topic."""
    try:
        if script.get("template") not in EXPECTED:
            return False, [f"template must be one of {', '.join(EXPECTED)}"]
        shown = check_script(script)["figures"]
        expected = EXPECTED[script["template"]](script)
    except ValueError as e:
        return False, [str(e)]
    notes = []
    for key, want in expected.items():
        got = shown.get(key)
        if got != want:
            notes.append(f"{key}: template shows {got!r} but the independent formula gives {want!r}")
    if plan:
        if plan.get("currency") and money_for(script).currency != plan["currency"]:
            notes.append(f"script.currency {money_for(script).currency!r} does not match the plan's {plan['currency']!r}")
        for field in ("template", "seed", "style"):
            if script.get(field) != plan.get(field):
                notes.append(f"script.{field} does not match the plan")
        description = plan["description"]
        if script.get("template") == "long_story":     # a long video's chapter list: the timestamps are not claims
            description = _CHAPTER.sub("", description)
        texts = {"title": plan["title"], "description": description, "hashtags": " ".join(plan.get("hashtags", []))}
        notes += check_claims(texts, script, shown)
        topic = plan.get("topic") or {}
        feed_id = topic.get("feed_id") or (topic.get("trend") or {}).get("id")
        if "feed_id" in script and script["feed_id"] != feed_id:
            notes.append(f"script.feed_id {script['feed_id']!r} does not match the plan's topic.feed_id (or topic.trend.id) {feed_id!r}")
    if "facts" in script:
        notes += topics.check_facts(script, feed_topic)
    if notes:
        return False, notes
    return True, [f"{len(shown)} figures computed from inputs; {len(expected)} cross-checked against closed-form formulas."]
