import { describe, expect, it } from "vitest";
import { AUTO_ENTER_AFTER, AUTO_ENTER_LEAD, autoEnters, ENTER_SEC, entry, entryStart, flowEnd, flowPiece, hopAt, LAND_SEC, squashAt } from "../src/studio/travel";

const W = 1080, H = 1920;

describe("entry (money-travels-not-pops)", () => {
  it("starts off the frame on the nearer side and lands on its spot", () => {
    const home: [number, number] = [250, 1300];
    const start = entryStart(home, W, H);
    expect(start[0]).toBeLessThan(0);
    expect(entryStart([900, 1300], W, H)[0]).toBeGreaterThan(W);
    const done = entry(ENTER_SEC + 0.01, start, home, H, false);
    expect(done.x).toBeCloseTo(home[0], 3); expect(done.y).toBeCloseTo(home[1], 3);
    const mid = entry(ENTER_SEC / 2, start, home, H, false);
    expect(mid.x).toBeGreaterThan(start[0]); expect(mid.x).toBeLessThan(home[0]);
  });
  it("grows out of the thing it comes from instead of appearing on its spot", () => {
    const from: [number, number] = [540, 1200], home: [number, number] = [800, 1300];
    const first = entry(0, from, home, H, true);
    expect(first.x).toBeCloseTo(from[0]); expect(first.show).toBeLessThan(0.5);
    expect(entry(ENTER_SEC, from, home, H, true).show).toBeCloseTo(1);
  });
  it("squashes once on landing and is still before and after", () => {
    expect(squashAt(-0.01)).toBe(0);
    expect(squashAt(LAND_SEC / 2)).toBeGreaterThan(0.5);
    expect(squashAt(LAND_SEC + 0.01)).toBe(0);
    expect(hopAt(0.2)).toBeGreaterThan(0); expect(hopAt(1)).toBe(0);
  });
});

describe("flowPiece", () => {
  it("travels from the source to the destination on an arc above both", () => {
    const src: [number, number] = [200, 1200], dst: [number, number] = [880, 1100];
    const a = flowPiece(0.01, 0, 5, src, dst, H)!, b = flowPiece(0.45, 0, 5, src, dst, H)!, c = flowPiece(0.89, 0, 5, src, dst, H)!;
    expect(a.x).toBeLessThan(b.x); expect(b.x).toBeLessThan(c.x);
    expect(b.y).toBeLessThan(Math.min(src[1], dst[1]));
    expect(flowPiece(0.95, 0, 5, src, dst, H)).toBeNull();
  });
  it("sends the pieces one after another and ends when the last lands", () => {
    expect(flowPiece(0.05, 3, 5, [0, 0], [100, 0], H)).toBeNull();
    expect(flowEnd(5)).toBeGreaterThan(flowEnd(1));
  });
});

describe("autoEnters (owner 2026-11-03: things arrive on their words)", () => {
  it("a thing first acted on late in the beat enters just before its word", () => {
    const out = autoEnters([{ id: "jet" }], [{ do: "glow", target: "jet", start: 2.4 }]);
    expect(out).toEqual([{ do: "enter", target: "jet", start: 2.4 - AUTO_ENTER_LEAD, auto: true }]);
  });
  it("counts a flow or arrow that lands on the thing as its first word", () => {
    const out = autoEnters([{ id: "bank" }, { id: "loan" }], [{ do: "glow", target: "bank", start: 0 }, { do: "flow", target: "bank", to: "loan", start: 1.8 }]);
    expect(out.map((a) => a.target)).toEqual(["loan"]);
  });
  it("leaves alone a thing acted on at the start, never acted on, hidden or entering by itself", () => {
    const items = [{ id: "a" }, { id: "b" }, { id: "c", hidden: true }, { id: "d" }];
    const acts = [{ do: "grow", target: "a", start: AUTO_ENTER_AFTER - 0.1 }, { do: "glow", target: "c", start: 3 },
      { do: "enter", target: "d", start: 2 }, { do: "stamp", target: "d", start: 3 }];
    expect(autoEnters(items, acts)).toEqual([]);
  });
});
