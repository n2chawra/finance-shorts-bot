"""Money maths used by templates. Plain functions of the script inputs."""


def sip_series(monthly: float, annual_pct: float, months: int, start: int = 0, stop: int | None = None) -> list[float]:
    """Value at each month 0..months. One contribution at the start of every month in
    [start, stop), monthly compounding. After `stop` the money stays invested."""
    r = annual_pct/100/12
    stop = months if stop is None else stop
    out, v = [], 0.0
    for m in range(months + 1):
        out.append(v)
        v = (v + monthly)*(1 + r) if start <= m < stop else v*(1 + r)
    return out


def lumpsum_series(amount: float, annual_pct: float, years: int) -> list[float]:
    """Value at each year 0..years of a one-time amount, compounded yearly."""
    r = annual_pct/100
    return [amount*(1 + r)**y for y in range(years + 1)]


def lumpsum_at(amount: float, annual_pct: float, years: float) -> float:
    """Same as lumpsum_series but for a fractional number of years (smooth animation)."""
    return amount*(1 + annual_pct/100)**years
