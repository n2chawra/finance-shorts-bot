import { describe, expect, it } from "vitest";
import { shownIn } from "../src/studio/figures";

describe("shownIn (QA L-20261104-01: a figure slammed in behind the sum that already shows it)", () => {
  it("finds a figure written inside a longer text", () => {
    expect(shownIn("8%", ["$45,000 at 8%, assumed"])).toBe(true);
    expect(shownIn("$127,544", ["$127,544"])).toBe(true);
    expect(shownIn("$3,000", ["Rent + food = $3,000 a month"])).toBe(true);
  });
  it("does not match part of a bigger figure", () => {
    expect(shownIn("$1", ["$100 a month"])).toBe(false);
    expect(shownIn("8%", ["18% a year"])).toBe(false);
    expect(shownIn("$1.5", ["$1.50"])).toBe(false);
    expect(shownIn("$45", ["$45,000"])).toBe(false);
    expect(shownIn("", ["anything"])).toBe(false);
  });
});
