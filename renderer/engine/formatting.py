"""Indian number formatting for on-screen figures."""
import math


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


def rupees(x: float) -> str:
    """Full amount with Indian grouping: 1500000 → '₹15,00,000'."""
    return "₹" + group_indian(int(round(x)))


def inr(x: float) -> str:
    """Short amount: '₹2.30 Cr', '₹94.9 L', '₹5,000'. Never shows '100.0 L' or '₹1,00,000'."""
    if x >= 1e7 or round(x/1e5, 1) >= 100:
        return f"₹{x/1e7:.2f} Cr"
    if x >= 1e5 or round(x) >= 100000:
        return f"₹{x/1e5:.1f} L"
    return "₹" + group_indian(int(round(x)))


def inr_long(x: float) -> str:
    """Spelled-out units without trailing zeros: '₹6 Lakh', '₹2.3 Crore', '₹5,000'."""
    if x >= 1e7 or round(x/1e5, 1) >= 100:
        return f"₹{round(x/1e7, 2):g} Crore"
    if x >= 1e5 or round(x) >= 100000:
        return f"₹{round(x/1e5, 1):g} Lakh"
    return "₹" + group_indian(int(round(x)))


def axis_label(v: float) -> str:
    """Chart tick label: '0', '50 L', '1.5 Cr'."""
    if v == 0:
        return "0"
    if v >= 1e7:
        return f"{v/1e7:g} Cr"
    if v >= 1e5:
        return f"{v/1e5:g} L"
    if v >= 1e3:
        return f"{v/1e3:g}K"
    return f"{v:g}"


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
