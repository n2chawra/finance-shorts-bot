/**
 * Indian number formatting, ported from renderer/engine/formatting.py.
 *
 * Python owns every figure: the final value on screen is always the string Python computed. These
 * are only for the frames in between, while a number counts up to that figure, so the count lands
 * on exactly the same text. test/fmt.test.ts checks them against ~2,000 values formatted by Python.
 *
 * The one trap is rounding. Python rounds an exact half to even (round(2.5) == 2, f"{0.125:.2f}" ==
 * "0.12") and JavaScript rounds it up. Both work on the exact binary value of the double, so a tie
 * only happens when that exact value ends in 5 — which `toFixed(100)` shows exactly.
 */

/** x rounded to `digits` decimals, half to even, as Python's format() and round() do. */
export function fixed(x: number, digits: number): string {
  const exact = Math.abs(x).toFixed(100);
  const dot = exact.indexOf(".");
  const rest = exact.slice(dot + 1 + digits);
  const tie = rest[0] === "5" && /^0*$/.test(rest.slice(1));
  if (!tie) return normaliseZero(x.toFixed(digits));
  // exact tie: keep the truncated digits if the last kept one is even, else round away from zero
  const kept = exact.slice(0, dot + 1 + digits).replace(/\.$/, "");
  const last = Number(kept[kept.length - 1]);
  const truncated = Number(kept);
  const step = 10 ** -digits;
  const magnitude = last % 2 === 0 ? truncated : truncated + step;
  return normaliseZero((Math.sign(x) * magnitude).toFixed(digits));
}

function normaliseZero(s: string): string {
  return /^-0(\.0+)?$/.test(s) ? s.slice(1) : s;
}

/** Python's round(x): nearest integer, half to even. */
export function roundEven(x: number): number {
  return Number(fixed(x, 0));
}

/** Python's round(x, d) as a number. */
export function roundTo(x: number, digits: number): number {
  return Number(fixed(x, digits));
}

/** A negative amount puts its sign before the currency: "-$19,470", not "$-19,470" (as Python's _signed). */
function signed<A extends unknown[]>(fmt: (x: number, ...a: A) => string): (x: number, ...a: A) => string {
  return (x, ...a) => {
    const r = roundEven(x);
    return r < 0 ? `-${fmt(-x, ...a)}` : fmt(r === 0 ? Math.abs(x) : x, ...a);
  };
}

/** 12345678 → "1,23,45,678" (last three digits, then pairs). */
export function groupIndian(n: number): string {
  const sign = n < 0 ? "-" : "";
  const s = String(Math.abs(Math.trunc(n)));
  if (s.length <= 3) return sign + s;
  let head = s.slice(0, -3);
  const parts: string[] = [];
  while (head.length > 2) {
    parts.unshift(head.slice(-2));
    head = head.slice(0, -2);
  }
  parts.unshift(head);
  return `${sign}${parts.join(",")},${s.slice(-3)}`;
}

/** Full amount: 1500000 → "₹15,00,000". */
export const rupees = signed((x: number): string => `₹${groupIndian(roundEven(x))}`);

/** Short amount: "₹2.30 Cr", "₹94.9 L", "₹5,000". Never "100.0 L" or "₹1,00,000". */
export const inr = signed((x: number): string => {
  if (x >= 1e7 || roundTo(x / 1e5, 1) >= 100) return `₹${fixed(x / 1e7, 2)} Cr`;
  if (x >= 1e5 || roundEven(x) >= 100000) return `₹${fixed(x / 1e5, 1)} L`;
  return `₹${groupIndian(roundEven(x))}`;
});

/** Python's "%g": up to 6 significant digits, trailing zeros dropped. */
export function g(x: number): string {
  if (x === 0) return "0";
  const exp = Math.floor(Math.log10(Math.abs(x)));
  if (exp < -4 || exp >= 6) throw new Error(`g(): ${x} would use exponent notation, which no caller expects`);
  const s = fixed(x, Math.max(0, 5 - exp));
  return s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s;
}

/** Spelled-out units without trailing zeros: "₹6 Lakh", "₹2.3 Crore", "₹5,000". */
export const inrLong = signed((x: number): string => {
  if (x >= 1e7 || roundTo(x / 1e5, 1) >= 100) return `₹${g(roundTo(x / 1e7, 2))} Crore`;
  if (x >= 1e5 || roundEven(x) >= 100000) return `₹${g(roundTo(x / 1e5, 1))} Lakh`;
  return `₹${groupIndian(roundEven(x))}`;
});

/** Chart tick label: "0", "50 L", "1.5 Cr", "25K". */
export function axisLabel(v: number): string {
  if (v === 0) return "0";
  if (v >= 1e7) return `${g(v / 1e7)} Cr`;
  if (v >= 1e5) return `${g(v / 1e5)} L`;
  if (v >= 1e3) return `${g(v / 1e3)}K`;
  return g(v);
}

/** Multiplier: 2.4166 → "2.4×". */
export function times(ratio: number): string {
  return `${fixed(ratio, 1)}×`;
}

// ---------------- dollars, pounds, euros (international grouping, K/M/B) ----------------

export const CURRENCY_SYMBOL = { USD: "$", GBP: "£", EUR: "€", INR: "₹" } as const;
export type Currency = keyof typeof CURRENCY_SYMBOL;

/** 12345678 → "12,345,678". */
export function groupWestern(n: number): string {
  const sign = n < 0 ? "-" : "";
  return sign + String(Math.abs(Math.trunc(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Full amount: "$1,500,000" (rupees: "₹15,00,000"). */
export const money = signed((x: number, cur: Currency): string =>
  cur === "INR" ? rupees(x) : `${CURRENCY_SYMBOL[cur]}${groupWestern(roundEven(x))}`);

/** Short amount: "$2.35B", "$1.5M", "$12,500" (rupees: "₹2.30 Cr", "₹94.9 L"). Never "1000.0M". */
export const moneyShort = signed((x: number, cur: Currency): string => {
  if (cur === "INR") return inr(x);
  const s = CURRENCY_SYMBOL[cur];
  if (x >= 1e9 || roundTo(x / 1e6, 1) >= 1000) return `${s}${fixed(x / 1e9, 2)}B`;
  if (x >= 1e6 || roundEven(x) >= 1_000_000) return `${s}${fixed(x / 1e6, 1)}M`;
  return `${s}${groupWestern(roundEven(x))}`;
});

/** Spelled out: "$1.5 million", "$2.35 billion" (rupees: "₹6 Lakh", "₹2.3 Crore"). */
export const moneyLong = signed((x: number, cur: Currency): string => {
  if (cur === "INR") return inrLong(x);
  const s = CURRENCY_SYMBOL[cur];
  if (x >= 1e9 || roundTo(x / 1e6, 1) >= 1000) return `${s}${g(roundTo(x / 1e9, 2))} billion`;
  if (x >= 1e6 || roundEven(x) >= 1_000_000) return `${s}${g(roundTo(x / 1e6, 1))} million`;
  return `${s}${groupWestern(roundEven(x))}`;
});

/** The text of a count-up at progress p (0..1) towards `value`, landing exactly on `final`. */
export function countUp(value: number, p: number, final: string, kind: "inr" | "rupees" | "inrLong" = "inr", cur: Currency = "INR"): string {
  if (p >= 1) return final;
  const v = value * Math.max(0, p);
  return kind === "rupees" ? money(v, cur) : kind === "inrLong" ? moneyLong(v, cur) : moneyShort(v, cur);
}
