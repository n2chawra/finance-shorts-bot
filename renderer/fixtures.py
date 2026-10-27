"""Fixtures that keep the TypeScript formatters (remotion/src/fmt/inr.ts) identical to Python's.

    python -m renderer.fixtures      # writes remotion/test/fixtures/formatting.json

Python owns every figure on screen; the TypeScript copies only draw the frames of a count-up, and
the parity test checks they produce exactly these strings.
"""
import json
import random
from pathlib import Path

from renderer.engine.formatting import Money, axis_label, inr, inr_long, rupees, times

OUT = Path(__file__).resolve().parents[1] / "remotion" / "test" / "fixtures" / "formatting.json"


def values() -> list[float]:
    r = random.Random("formatting-fixtures")
    edges = [0, 0.5, 1.5, 2.5, 999.5, 1000, 12345.5, 99999.4, 99999.5, 99999.6, 100000, 100049, 100050, 100051,
             999949, 999950, 9_994_999, 9_995_000, 9_995_001, 9_999_999, 10_000_000, 10_005_000, 12_345_678,
             123_456_789.5, 2.4166e7, 31781, 5000, 6e5, 1.5e6, 2.3e7, 9.49e6, 9.5e6,
             -0.4, -0.5, -1.5, -19_470, -99_999.5, -1.5e6, -2.3e7, -2.3456e9]   # a value that fell: sign first
    rnd = [round(10 ** r.uniform(0, 9), r.choice([0, 0, 1, 2])) for _ in range(1600)]
    halves = [r.randint(1, 10**8) + 0.5 for _ in range(200)]
    hundreds = [r.randint(1, 10**4) * 50 for _ in range(200)]   # lakh and crore boundaries land on these
    return edges + rnd + halves + hundreds


def main() -> None:
    rows = [{"x": x, "inr": inr(x), "inrLong": inr_long(x), "rupees": rupees(x)} for x in values()]
    # international amounts: dollars stand for every non-rupee currency (only the symbol differs)
    usd, edges = Money("USD"), [999_949, 999_950, 999_999.5, 1_000_000, 999_949_999, 999_950_000, 999_999_999, 1e9, 2.3456e9]
    western = [{"x": x, "short": usd.short(x), "long": usd.long(x), "full": usd.full(x)} for x in edges + values()]
    ticks = [0, 25, 1000, 25000, 50000, 1e5, 2.5e5, 5e5, 1e6, 2e6, 2.5e6, 5e6, 1e7, 1.5e7, 2e7, 2.5e7, 5e7, 1e8]
    ratios = [0.95, 1.04, 1.05, 1.25, 2.4166, 2.45, 2.55, 3.0, 10.25]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"amounts": rows, "usd": western, "ticks": [{"v": v, "label": axis_label(v)} for v in ticks],
                               "ratios": [{"r": v, "times": times(v)} for v in ratios]}, ensure_ascii=False, indent=0) + "\n",
                   encoding="utf-8", newline="\n")
    print(f"wrote {len(rows)} amounts to {OUT}")


if __name__ == "__main__":
    main()
