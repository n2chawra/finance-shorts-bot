import { describe, expect, it } from "vitest";
import { frontRing, reachOf, rippleD } from "../src/flat/waterGeo";

// Owner, 2026-11-25 (v-20261125-12): floods must grow like waves, not a flat shape scaling up.
describe("MapWater's moving front", () => {
  it("is a closed wavy ring whose edge moves with time", () => {
    const a = frontRing(500, 500, 300, 0);
    const b = frontRing(500, 500, 300, 30);
    expect(a.length).toBe(120);
    const radii = a.map(([x, y]) => Math.hypot(x - 500, y - 500));
    expect(Math.max(...radii) - Math.min(...radii)).toBeGreaterThan(20);   // not a circle: waves on the edge
    expect(a.some((p, i) => Math.abs(p[0] - b[i]![0]) > 1)).toBe(true);     // the waves roll
  });
  it("is deterministic and empty before the water arrives", () => {
    expect(frontRing(0, 0, 100, 12)).toEqual(frontRing(0, 0, 100, 12));
    expect(frontRing(0, 0, 0, 12)).toEqual([]);
  });
  it("reaches past the farthest corner of the area", () => {
    expect(reachOf(0, 0, [[0, 0], [300, 400]])).toBeGreaterThan(500 * 1.07);
  });
  it("ripples drift across the water", () => {
    expect(rippleD(0, 500, 100, 0, 0)).not.toEqual(rippleD(0, 500, 100, 10, 0));
  });
});
