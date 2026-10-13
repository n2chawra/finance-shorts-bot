"""Indian number formatting for on-screen figures."""


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
