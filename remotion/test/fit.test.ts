import { describe, expect, it } from "vitest";
import { fitLine, fitWords, minText, safeBox, textWidth } from "../src/design/fit";

describe("text that fits", () => {
  it("keeps a size that already fits and shrinks one that doesn't", () => {
    expect(fitLine("Loan", 56, 900)).toBe(56);
    const s = fitLine("Pay the minimum forever", 140, 900, { upper: true });
    expect(s).toBeLessThan(140);
    expect(textWidth("Pay the minimum forever", s, true)).toBeLessThanOrEqual(900);
  });
  it("never goes under the format's minimum", () => {
    expect(fitLine("A very very long label that cannot fit at all", 56, 200, { min: minText(1080, 1920) })).toBe(44);
    expect(minText(1920, 1080)).toBe(30);
  });
  it("fits wrapping text by its longest word", () => {
    expect(fitWords("Never sell", 150, 1000, { upper: true })).toBe(150);
  });
  it("keeps a Short's labels clear of the bottom zone and the right-hand buttons", () => {
    const b = safeBox(1080, 1920);
    expect(b.y1).toBeLessThanOrEqual(1920 - 120);
    expect(b.x1).toBeLessThan(1080 - 50);
  });
});
