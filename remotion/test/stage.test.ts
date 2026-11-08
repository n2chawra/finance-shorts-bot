import { describe, expect, it } from "vitest";
import { capGrow, fitOnStage, grownScale, MIN_GROW, roomScale } from "../src/studio/stage";

const W = 1080, H = 1920;

describe("a thing stays whole at its biggest", () => {
  it("takes the biggest grow of its own, not another thing's", () => {
    const acts = [{ target: "pile", do: "grow", scale: 1.35 }, { target: "pile", do: "shrink", scale: 0.6 }, { target: "bag", do: "grow", scale: 2 }];
    expect(grownScale(acts, "pile")).toBe(1.35);
    expect(grownScale(acts, "jet")).toBe(1);
    expect(grownScale([{ target: "pile", do: "grow" }], "pile")).toBe(1.6);
  });
  it("moves the megapile at x 0.74, size 0.27, grow 1.35 inside the right edge (QA, v-20261105-07)", () => {
    const half = H * 0.27 * 1.35 * 0.6;
    const x = fitOnStage(0.74 * W, half, W);
    expect(x + half).toBeLessThanOrEqual(W * 0.97 + 1e-6);
    expect(x).toBeLessThan(0.74 * W);
  });
  it("leaves a thing that fits where the script put it, and centres one wider than the frame", () => {
    expect(fitOnStage(0.5 * W, 200, W)).toBe(0.5 * W);
    expect(fitOnStage(0.3 * W, 200, W)).toBe(0.3 * W);
    expect(fitOnStage(0.1 * W, 900, W)).toBe(W / 2);
    expect(fitOnStage(0.05 * W, 100, W)).toBeCloseTo(W * 0.03 + 100);
  });
});

describe("a grow is capped at the room the thing has", () => {
  it("lets a thing in the middle grow as written", () => {
    expect(capGrow(1.35, 0.5 * W, H * 0.22, W)).toBe(1.35);
  });
  it("caps a thing by the edge so most of it stays where the writer put it", () => {
    const size = H * 0.22, x = 0.74 * W;
    const k = capGrow(1.35, x, size, W);
    expect(k).toBeLessThan(1.35);
    expect(k).toBeGreaterThanOrEqual(MIN_GROW);
    expect(k).toBeCloseTo(Math.max(MIN_GROW, roomScale(x, size, W)));
    // what is left over is a short slide inward, not a trip across the stage
    expect(x - fitOnStage(x, size * k * 0.6, W)).toBeLessThan(0.06 * W);
  });
  it("never touches a shrink", () => {
    expect(capGrow(0.55, 0.9 * W, H * 0.3, W)).toBe(0.55);
  });
});
