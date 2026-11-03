import { describe, expect, it } from "vitest";
import { showsSource, sourceBeat } from "../src/studio/source";

// owner, 2026-11-03: "The source should be shown once only throughout the video"
const tl = (beats: { scene: string; from: number; say: string }[], sources: string | null = "Data: Fortune · Dec 2023") =>
  ({ sources, figures: { fact1: "$20B", fact2: "$13.6B", x: "$5" }, beats }) as never;

describe("sourceBeat", () => {
  it("prints the source on the first board beat that says a fact, and on no other", () => {
    const t = tl([{ scene: "hook", from: 0, say: "Google pays $20B" }, { scene: "board", from: 90, say: "It pays $20B a year." },
      { scene: "board", from: 200, say: "And $13.6B more." }, { scene: "board", from: 300, say: "Only $5 here." }]);
    expect(sourceBeat(t)).toBe(90);
    expect(showsSource({ tl: t, beat: { from: 90 } as never })).toBe(true);
    expect(showsSource({ tl: t, beat: { from: 200 } as never })).toBe(false);
  });
  it("falls back to the first beat of any scene when no board beat says a fact", () => {
    expect(sourceBeat(tl([{ scene: "custom", from: 40, say: "$13.6B in tax" }, { scene: "board", from: 120, say: "No figure." }]))).toBe(40);
  });
  it("prints nothing without sources", () => {
    expect(sourceBeat(tl([{ scene: "board", from: 0, say: "$20B" }], null))).toBe(-1);
  });
});
