"""Number formatting for on-screen figures, in the script's currency.

Rupees keep Indian grouping and lakh/crore (₹15,00,000, ₹94.9 L, ₹2.30 Cr; a lakh crore and up as grouped
crore, ₹1,00,000 Cr). Dollars, pounds and euros use international grouping and K/M/B/T ($1,500,000 in
full, $1.5M short, $1.5 million long, $1.00T and $1 trillion from a trillion). A
script names its `currency`; scripts from before the channel went global (2026-10-18) have none and
are rupee scripts.
"""
import math
from dataclasses import dataclass
from functools import wraps

CURRENCIES = {"USD": "$", "GBP": "£", "EUR": "€", "INR": "₹"}
LEGACY_CURRENCY = "INR"       # a script without a `currency` field


def _signed(fmt):
    """A negative amount puts its sign before the currency: '-$19,470', not '$-19,470' (an amount that
    rounds to zero shows no sign). The TypeScript mirror does the same (remotion/src/fmt/inr.ts)."""
    @wraps(fmt)
    def signed(x: float, *args):
        return "-" + fmt(-x, *args) if round(x) < 0 else fmt(abs(x) if round(x) == 0 else x, *args)
    return signed


def group_indian(n: int) -> str:
    """12345678 → '1,23,45,678' (last three digits, then pairs)."""
    sign = "-" if n < 0 else ""
    s = str(abs(n))
    if len(s) <= 3:
        return sign + s
    head, tail = s[:-3], s[-3:]
    parts = []
    while len(head) > 2:
        parts.insert(0, head[-2:])
        head = head[:-2]
    parts.insert(0, head)
    return sign + ",".join(parts) + "," + tail


@_signed
def rupees(x: float) -> str:
    """Full amount with Indian grouping: 1500000 → '₹15,00,000'."""
    return "₹" + group_indian(int(round(x)))


@_signed
def inr(x: float) -> str:
    """Short amount: '₹2.30 Cr', '₹94.9 L', '₹5,000', '₹1,00,000 Cr' (a lakh crore). Never shows '100.0 L',
    '₹1,00,000' or '₹100000.00 Cr'."""
    if x >= 1e12 or round(x/1e7, 2) >= 100000:
        return f"₹{group_indian(int(round(x/1e7)))} Cr"
    if x >= 1e7 or round(x/1e5, 1) >= 100:
        return f"₹{x/1e7:.2f} Cr"
    if x >= 1e5 or round(x) >= 100000:
        return f"₹{x/1e5:.1f} L"
    return "₹" + group_indian(int(round(x)))


@_signed
def inr_long(x: float) -> str:
    """Spelled-out units without trailing zeros: '₹6 Lakh', '₹2.3 Crore', '₹5,000', '₹1,00,000 Crore'."""
    if x >= 1e12 or round(x/1e7, 2) >= 100000:
        return f"₹{group_indian(int(round(x/1e7)))} Crore"
    if x >= 1e7 or round(x/1e5, 1) >= 100:
        return f"₹{round(x/1e7, 2):g} Crore"
    if x >= 1e5 or round(x) >= 100000:
        return f"₹{round(x/1e5, 1):g} Lakh"
    return "₹" + group_indian(int(round(x)))


def axis_label(v: float) -> str:
    """Chart tick label: '0', '50 L', '1.5 Cr', '2 L Cr' (lakh crore)."""
    if v == 0:
        return "0"
    if v >= 1e12:
        return f"{v/1e12:g} L Cr"
    if v >= 1e7:
        return f"{v/1e7:g} Cr"
    if v >= 1e5:
        return f"{v/1e5:g} L"
    if v >= 1e3:
        return f"{v/1e3:g}K"
    return f"{v:g}"


def group_western(n: int) -> str:
    """12345678 → '12,345,678'."""
    return f"{n:,}"


@_signed
def _short_western(x: float, sym: str) -> str:
    """'$2.50T', '$2.35B', '$1.5M', '$12,500'. Never shows '1000.00B', '1000.0M' or '$1,000,000'."""
    if x >= 1e12 or round(x/1e9, 2) >= 1000:
        return f"{sym}{x/1e12:.2f}T"
    if x >= 1e9 or round(x/1e6, 1) >= 1000:
        return f"{sym}{x/1e9:.2f}B"
    if x >= 1e6 or round(x) >= 1_000_000:
        return f"{sym}{x/1e6:.1f}M"
    return sym + group_western(int(round(x)))


@_signed
def _long_western(x: float, sym: str) -> str:
    """'$1.5 million', '$2.35 billion', '$2.5 trillion', '$12,500'."""
    if x >= 1e12 or round(x/1e9, 2) >= 1000:
        return f"{sym}{round(x/1e12, 2):g} trillion"
    if x >= 1e9 or round(x/1e6, 1) >= 1000:
        return f"{sym}{round(x/1e9, 2):g} billion"
    if x >= 1e6 or round(x) >= 1_000_000:
        return f"{sym}{round(x/1e6, 1):g} million"
    return sym + group_western(int(round(x)))


@_signed
def _full_western(x: float, sym: str) -> str:
    """'$1,500,000'."""
    return sym + group_western(int(round(x)))


def axis_label_western(v: float) -> str:
    """Chart tick label: '0', '500K', '1.5M', '2B', '1T'."""
    if v == 0:
        return "0"
    for size, unit in ((1e12, "T"), (1e9, "B"), (1e6, "M"), (1e3, "K")):
        if v >= size:
            return f"{v/size:g}{unit}"
    return f"{v:g}"


def count(n: float, indian: bool = False) -> str:
    """A number of things or years, not money: '1.2T', '8B', '340M', '10,000' ('10,000' or '1,00,000' grouped
    the script's way below a million). The voice reads '8B' as 'eight billion' in any currency."""
    if n >= 1e12 or round(n/1e9, 2) >= 1000:
        return f"{round(n/1e12, 2):g}T"
    if n >= 1e9 or round(n/1e6, 1) >= 1000:
        return f"{round(n/1e9, 2):g}B"
    if n >= 1e6 or round(n) >= 1_000_000:
        return f"{round(n/1e6, 1):g}M"
    return (group_indian if indian else group_western)(int(round(n)))


@dataclass(frozen=True)
class Money:
    """The formatters for one currency: full amounts, short ones, spelled-out ones and chart ticks."""
    currency: str = LEGACY_CURRENCY

    def __post_init__(self) -> None:
        if self.currency not in CURRENCIES:
            raise ValueError(f"currency must be one of {', '.join(CURRENCIES)}, not {self.currency!r}")

    @property
    def symbol(self) -> str:
        return CURRENCIES[self.currency]

    @property
    def indian(self) -> bool:
        return self.currency == "INR"

    def full(self, x: float) -> str:
        return rupees(x) if self.indian else _full_western(x, self.symbol)

    def short(self, x: float) -> str:
        return inr(x) if self.indian else _short_western(x, self.symbol)

    def long(self, x: float) -> str:
        return inr_long(x) if self.indian else _long_western(x, self.symbol)

    def axis(self, v: float) -> str:
        return axis_label(v) if self.indian else axis_label_western(v)

    def group(self, n: int) -> str:
        return group_indian(n) if self.indian else group_western(n)


def money_for(script: dict) -> Money:
    """The formatters for a script's currency (rupees for scripts from before it was recorded)."""
    return Money(script.get("currency") or LEGACY_CURRENCY)


def times(ratio: float) -> str:
    """Multiplier: 2.4166 → '2.4×'."""
    return f"{ratio:.1f}×"


def nice_axis(vmax: float, max_ticks: int = 5) -> list[float]:
    """Round chart tick values from 0 to just above vmax."""
    mag = 10**math.floor(math.log10(vmax))
    for m in (0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10):
        step = m*mag
        if vmax/step <= max_ticks:
            return [i*step for i in range(math.ceil(vmax/step) + 1)]
    raise AssertionError("unreachable")


FACT_UNITS = ("rupees", "rupees_lakh", "rupees_crore", "percent", "count", "count_lakh", "count_crore",
              "money", "money_thousand", "money_million", "money_billion", "money_trillion",
              "count_thousand", "count_million", "count_billion")
_SCALE = {"thousand": "K", "million": "M", "billion": "B", "trillion": "T"}


def fact_value(value: float, unit: str, currency: str = LEGACY_CURRENCY) -> str:
    """A sourced figure (from the research feed) as displayed: (31781, 'rupees_crore') → '₹31,781 Cr',
    (6.5, 'percent') → '6.5%', (9.87, 'count_crore') → '9.87 Cr', (4500000, 'count') → '45,00,000',
    (2.1, 'money_trillion', 'USD') → '$2.1T', (340, 'count_million', 'USD') → '340M'. `money*` units are
    in the fact's currency; counts group the Indian way only in a rupee story."""
    m = Money(currency)
    whole, frac = f"{abs(value):.2f}".split(".")         # round first: 9.996 is "10", not "9."
    sign = "-" if value < 0 and f"{abs(value):.2f}" != "0.00" else ""
    grouped = group_indian(int(whole)) if unit.startswith("rupees") or m.indian else group_western(int(whole))
    shown = sign + grouped + ("." + frac.rstrip("0") if frac.rstrip("0") else "")
    if unit == "money":
        return m.symbol + shown
    if unit.startswith("money_") and unit[6:] in _SCALE:
        return f"{m.symbol}{shown}{_SCALE[unit[6:]]}"
    if unit.startswith("count_") and unit[6:] in _SCALE:
        return f"{shown}{_SCALE[unit[6:]]}"
    if unit == "rupees":
        return "₹" + shown
    if unit == "rupees_lakh":
        return f"₹{shown} L"
    if unit == "rupees_crore":
        return f"₹{shown} Cr"
    if unit == "percent":
        return f"{value:g}%"
    if unit == "count":
        return shown
    if unit == "count_lakh":
        return f"{shown} L"
    if unit == "count_crore":
        return f"{shown} Cr"
    raise ValueError(f"unknown fact unit {unit!r}; use one of {', '.join(FACT_UNITS)}")


MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split()


def month_year(iso_day: str) -> str:
    """'2026-06-30' → 'Jun 2026'."""
    y, m = iso_day[:4], int(iso_day[5:7])
    return f"{MONTHS[m - 1]} {y}"
