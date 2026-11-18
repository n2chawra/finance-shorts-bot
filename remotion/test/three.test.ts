import { describe, expect, it } from "vitest";
import { cameraPose, moves } from "../src/three/Camera3D";
import { zoomProgress } from "../src/three/ScaleZoom";

describe("cameraPose", () => {
  const keys = [...moves.pushIn(0, 30, [0, 0, 0], [0, 0, 1], 10, 4)];
  it("holds before the first key and after the last", () => {
    expect(cameraPose(keys, -5).pos[2]).toBeCloseTo(10);
    expect(cameraPose(keys, 99).pos[2]).toBeCloseTo(4);
  });
  it("eases between keys and is deterministic", () => {
    const mid = cameraPose(keys, 15).pos[2];
    expect(mid).toBeCloseTo(7);
    expect(cameraPose(keys, 15)).toEqual(cameraPose(keys, 15));
  });
  it("orbits on a circle around the look-at point", () => {
    const o = moves.orbit(0, 60, [1, 0, 1], 5, 2, 0, Math.PI / 2);
    for (const f of [0, 13, 30, 47, 60]) {
      const p = cameraPose(o, f);
      expect(Math.hypot(p.pos[0] - 1, p.pos[2] - 1)).toBeCloseTo(5);
      expect(p.pos[1]).toBeCloseTo(2);
    }
  });
});

describe("zoomProgress", () => {
  it("reaches each level at its frame and holds at the ends", () => {
    const at = [10, 40, 70];
    expect(zoomProgress(at, 0)).toBe(0);
    expect(zoomProgress(at, 40)).toBeCloseTo(1);
    expect(zoomProgress(at, 55)).toBeCloseTo(1.5);
    expect(zoomProgress(at, 200)).toBe(2);
  });
});
