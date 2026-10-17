"""Number check: every figure a video shows, and every number in its title or description, must
come from the script's inputs through code.

The formulas here are closed-form and written independently of the renderer's month-by-month
simulation, so a mistake in either one shows up as a mismatch.
"""
import math
import re
from collections.abc import Callable, Mapping

from renderer.cli import build
from renderer.timeline.build import check_script
from renderer.engine.formatting import fact_value, group_indian, inr, inr_long, rupees, times

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
    return principal*r*(1 + r)**n/((1 + r)**n - 1)


def emi_total_interest(principal: float, annual_pct: float, years: float) -> float:
    return emi(principal, annual_pct, years)*round(years*12) - principal


def cagr(start: float, end: float, years: float) -> float:
    """Compound annual growth rate, in percent."""
    return ((end/start)**(1/years) - 1)*100


def fd_maturity(principal: float, annual_pct: float, years: float) -> float:
    """Fixed deposit maturity value with quarterly compounding (the usual bank convention)."""
    return lumpsum_fv(principal, annual_pct, years, 4)


# ---------------- expected figures per template ----------------

def _two_friends_race(s: dict) -> dict[str, str]:
    m, rate, end = s["monthly"], s["annual_return_pct"], s["end_age"]
    invested, final = [], []
    for p in s["people"]:
        paid = (p["stop_age"] - p["start_age"])*12
        invested.append(m*paid)
        final.append(sip_fv(m, rate, paid)*(1 + rate/100/12)**((end - p["stop_age"])*12))
    return {"a_invested": inr(invested[0]), "b_invested": inr(invested[1]), "a_final": inr(final[0]), "b_final": inr(final[1]),
            "invested_ratio": times(invested[1]/invested[0]), "final_ratio": times(final[0]/final[1]), "monthly": rupees(m)}


def _myth_vs_fact(s: dict) -> dict[str, str]:
    amount, years = s["amount"], s["years"]
    a, b = (lumpsum_fv(amount, t["rate_pct"], years) for t in s["tracks"])
    real = real_value(amount*(1 + s["tracks"][0]["rate_pct"]/100)**years, s["tracks"][1]["rate_pct"], years)
    return {"a_final": inr(a), "b_final": inr(b), "gap": inr(b - a), "real_value": inr(real),
            "lost_pct": f"{(1 - real/amount)*100:.0f}%", "amount": inr(amount)}


def _money_leak_meter(s: dict) -> dict[str, str]:
    monthly = s["cost"]*s["times_per_month"]
    spent = monthly*12*s["years"]
    fv = sip_fv(monthly, s["annual_return_pct"], s["years"]*12)
    return {"monthly": inr(monthly), "yearly": inr(monthly*12), "spent": inr(spent), "fv": inr(fv),
            "gains": inr(fv - spent), "ratio": times(fv/spent), "cost": rupees(s["cost"])}


def _quiz_countdown(s: dict) -> dict[str, str]:
    if s["kind"] == "sip":
        answer, invested = sip_fv(s["amount"], s["annual_return_pct"], s["years"]*12), s["amount"]*12*s["years"]
    else:
        answer, invested = lumpsum_fv(s["amount"], s["annual_return_pct"], s["years"]), s["amount"]
    return {"answer": inr(answer), "invested": inr(invested), "gains": inr(answer - invested), "ratio": times(answer/invested)}


def _money_news(s: dict) -> dict[str, str]:
    ex = s["example"]
    if ex["kind"] == "sip":
        base, result = ex["amount"]*12*ex["years"], sip_fv(ex["amount"], ex["rate_pct"], ex["years"]*12)
    elif ex["kind"] == "lumpsum":
        base, result = ex["amount"], lumpsum_fv(ex["amount"], ex["rate_pct"], ex["years"])
    else:
        base, result = ex["amount"], real_value(ex["amount"], ex["rate_pct"], ex["years"])
    out = {"result": inr(result), **{f"fact_{k}": fact_value(f["value"], f["unit"]) for k, f in zip("abc", s["facts"])}}
    if ex["kind"] != "inflation":
        out |= {"invested": inr(base), "gains": inr(result - base), "ratio": times(result/base)}
    else:
        out["lost_pct"] = f"{(1 - result/base)*100:.0f}%"
    return out


def _long_explainer(s: dict) -> dict[str, str]:
    """Every figure the long-form template shows, recomputed from the script's `maths` inputs."""
    out: dict[str, str] = {}
    for m in s["maths"]:
        n, kind, rate, years = m["name"], m["kind"], m["rate_pct"], m["years"]
        if kind == "sip":
            invested, final = m["monthly"]*12*years, sip_fv(m["monthly"], rate, years*12)
        elif kind == "lumpsum":
            invested, final = m["amount"], lumpsum_fv(m["amount"], rate, years)
        elif kind == "fd":
            invested, final = m["amount"], fd_maturity(m["amount"], rate, years)
        elif kind == "inflation":
            invested, final = m["amount"], real_value(m["amount"], rate, years)
        else:   # emi: "final" is everything the loan costs over its life
            invested = m["amount"]
            pay = emi(m["amount"], rate, years)
            final = pay*round(years*12)
            out[f"{n}_emi"], out[f"{n}_total_paid"] = inr(pay), inr(final)
        gains = invested - final if kind == "inflation" else final - invested
        out |= {f"{n}_final": inr(final), f"{n}_final_long": inr_long(final), f"{n}_invested": inr(invested),
                f"{n}_gains": inr(gains), f"{n}_ratio": times(final/invested)}
        if kind == "inflation":
            out[f"{n}_lost_pct"] = f"{(1 - final/invested)*100:.0f}%"
    return out


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


def _long_story(s: dict) -> dict[str, str]:
    """The computed figures of a long_story script's `maths`, from the closed forms above."""
    out: dict[str, str] = {}
    for m in s.get("maths", []):
        n, kind = m["name"], m["kind"]
        if kind == "card_min_due":
            c = card_min_due(m["amount"], m["rate_pct_month"], m["min_due_pct"], m["min_due_floor"])
            out |= {f"{n}_months": str(c["months"]), f"{n}_years": str(round(c["months"]/12)),
                    f"{n}_total_paid": inr(c["total_paid"]), f"{n}_interest": inr(c["interest"]),
                    f"{n}_ratio": times(c["total_paid"]/m["amount"]), f"{n}_paid_year1": inr(c["paid_year1"]),
                    f"{n}_owed_year1": inr(c["owed_year1"]), f"{n}_interest_year1": inr(c["interest_year1"]),
                    f"{n}_min_due": rupees(m["amount"]*m["min_due_pct"]/100)}
        elif kind == "emi":
            pay = emi(m["amount"], m["rate_pct"], m["years"])
            months = round(m["years"]*12)
            out |= {f"{n}_emi": rupees(pay), f"{n}_total_paid": inr(pay*months), f"{n}_interest": inr(pay*months - m["amount"])}
        elif kind == "sip":
            final, invested = sip_fv(m["monthly"], m["rate_pct"], m["years"]*12), m["monthly"]*m["years"]*12
            out |= {f"{n}_final": inr(final), f"{n}_final_long": inr_long(final), f"{n}_invested": inr(invested),
                    f"{n}_gains": inr(final - invested), f"{n}_ratio": times(final/invested)}
        elif kind == "lumpsum":
            final = lumpsum_fv(m["amount"], m["rate_pct"], m["years"])
            out |= {f"{n}_final": inr(final), f"{n}_final_long": inr_long(final), f"{n}_gains": inr(final - m["amount"]),
                    f"{n}_ratio": times(final/m["amount"])}
    return out


EXPECTED: dict[str, Callable[[dict], dict[str, str]]] = {
    "two_friends_race": _two_friends_race, "myth_vs_fact": _myth_vs_fact,
    "money_leak_meter": _money_leak_meter, "quiz_countdown": _quiz_countdown, "money_news": _money_news,
    "long_explainer": _long_explainer, "long_story": _long_story,
}

# ---------------- claims in free text ----------------

_NUMBER = re.compile(r"₹?\s?\d[\d,]*(?:\.\d+)?\s?(?:crore|cr|lakh|l|k|%|×|x)?(?![a-z])", re.IGNORECASE)


def _norm(token: str) -> str:
    t = token.lower().replace(" ", "").replace(",", "").replace("crore", "cr").replace("lakh", "l").replace("x", "×")
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
    script's inputs in plain, grouped, rupee, short and percent forms."""
    out = {_norm(v) for v in figures.values()}
    for n in _numbers_in(script):
        out |= {_norm(f"{n:g}"), _norm(f"{n:g}%"), _norm(group_indian(round(n))), _norm(rupees(n)), _norm(inr(n)), _norm(inr_long(n))}
    return out | {t.lstrip("₹") for t in out}


def check_claims(texts: Mapping[str, str], script: dict, figures: Mapping[str, str]) -> list[str]:
    """Numbers in free text (title, description, hashtags) that no input or computed figure backs."""
    ok = allowed_numbers(script, figures)
    out = []
    for field, text in texts.items():
        for m in _NUMBER.finditer(text):
            token = _norm(m.group())
            if token not in ok and token.lstrip("₹") not in ok:
                out.append(f"{field} mentions {m.group().strip()!r}, which is neither a script input nor a computed figure")
    return out


def number_check(script: dict, plan: dict | None = None, feed_topic: dict | None = None) -> tuple[bool, list[str]]:
    """(passed, notes). Fails if the script is invalid, hard-codes a number, disagrees with the
    independent formulas, drifts from the plan, the plan's text claims an unsupported number, or a
    news script's sourced facts differ from its research feed topic."""
    try:
        if script.get("template") == "long_story":
            shown = check_script(script)["figures"]
        else:
            shown = build(script).figures
    except ValueError as e:
        return False, [str(e)]
    notes = []
    for key, want in EXPECTED[script["template"]](script).items():
        got = shown.get(key)
        if got != want:
            notes.append(f"{key}: template shows {got!r} but the independent formula gives {want!r}")
    if plan:
        for field in ("template", "seed", "style"):
            if script.get(field) != plan.get(field):
                notes.append(f"script.{field} does not match the plan")
        texts = {"title": plan["title"], "description": plan["description"], "hashtags": " ".join(plan.get("hashtags", []))}
        notes += check_claims(texts, script, shown)
        topic = plan.get("topic") or {}
        feed_id = topic.get("feed_id") or (topic.get("trend") or {}).get("id")
        if "feed_id" in script and script["feed_id"] != feed_id:
            notes.append(f"script.feed_id {script['feed_id']!r} does not match the plan's topic.feed_id (or topic.trend.id) {feed_id!r}")
    if "facts" in script:
        notes += topics.check_facts(script, feed_topic)
    if notes:
        return False, notes
    return True, [f"{len(shown)} figures computed from inputs; {len(EXPECTED[script['template']](script))} cross-checked against closed-form formulas."]
