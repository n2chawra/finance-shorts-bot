import { describe, expect, test } from "vitest";
import fixtures from "./fixtures/formatting.json";
import { axisLabel, countUp, fixed, inr, inrLong, roundEven, rupees, times } from "../src/fmt/inr";

describe("the TypeScript formatters match Python's exactly", () => {
  test.each(fixtures.amounts)("$x", ({ x, inr: a, inrLong: b, rupees: c }) => {
    expect([inr(x), inrLong(x), rupees(x)]).toEqual([a, b, c]);
  });
  test("axis labels and multipliers", () => {
    for (const { v, label } of fixtures.ticks) expect(axisLabel(v)).toBe(label);
    for (const { r, times: t } of fixtures.ratios) expect(times(r)).toBe(t);
  });
});

test("ties round to even, like Python", () => {
  expect([roundEven(0.5), roundEven(1.5), roundEven(2.5), roundEven(-2.5)]).toEqual([0, 2, 2, -2]);
  expect([fixed(0.125, 2), fixed(0.375, 2), fixed(2.675, 2)]).toEqual(["0.12", "0.38", "2.67"]); // 2.675 is just below .675
});

test("a count-up lands exactly on Python's figure", () => {
  expect(countUp(2.3e7, 1, "₹2.30 Cr")).toBe("₹2.30 Cr");
  expect(countUp(2.3e7, 0.5, "₹2.30 Cr")).toBe("₹1.15 Cr");
  expect(countUp(2.3e7, 0, "₹2.30 Cr")).toBe("₹0");
});
