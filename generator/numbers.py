"""Number check: every figure a video shows, and every number in its title or description, must
come from the script's inputs through code.

The formulas here are closed-form and written independently of the renderer's month-by-month
simulation, so a mistake in either one shows up as a mismatch.
"""
import re
from collections.abc import Callable, Mapping

from renderer.cli import build
from renderer.engine.formatting import group_indian, inr, inr_long, rupees, times

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


EXPECTED: dict[str, Callable[[dict], dict[str, str]]] = {
    "two_friends_race": _two_friends_race, "myth_vs_fact": _myth_vs_fact,
    "money_leak_meter": _money_leak_meter, "quiz_countdown": _quiz_countdown,
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
        return [n for k, v in value.items() if k not in ("seed", "style", "text", "distractors") for n in _numbers_in(v)]
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


def number_check(script: dict, plan: dict | None = None) -> tuple[bool, list[str]]:
    """(passed, notes). Fails if the script is invalid, hard-codes a number, disagrees with the
    independent formulas, drifts from the plan, or the plan's text claims an unsupported number."""
    try:
        video = build(script)
    except ValueError as e:
        return False, [str(e)]
    notes = []
    for key, want in EXPECTED[script["template"]](script).items():
        got = video.figures.get(key)
        if got != want:
            notes.append(f"{key}: template shows {got!r} but the independent formula gives {want!r}")
    if plan:
        for field in ("template", "seed", "style"):
            if script.get(field) != plan.get(field):
                notes.append(f"script.{field} does not match the plan")
        texts = {"title": plan["title"], "description": plan["description"], "hashtags": " ".join(plan.get("hashtags", []))}
        notes += check_claims(texts, script, video.figures)
    if notes:
        return False, notes
    return True, [f"{len(video.figures)} figures computed from inputs; {len(EXPECTED[script['template']](script))} cross-checked against closed-form formulas."]
