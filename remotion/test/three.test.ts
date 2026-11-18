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

import { direct } from "../src/three/Director";

describe("direct (word-timed camera)", () => {
  const ev = { chip: 30, dive: 60, a: 100, b: 110, c: 120 };
  const keys = direct(ev, [
    { at: 0, move: "hold", pos: [0, 2, 9], look: [0, 0, 0] },
    { at: "chip", move: "push", look: [0, 0, 0], dir: [0, 0, 1], to: 4, dur: 20 },
    { at: "dive", move: "dive", look: [0, 0, 0], dir: [0, 0, 1], to: 0.5, dur: 27 },
    { at: ["a", "b", "c"], move: "cuts", poses: [{ pos: [1, 1, 1], look: [0, 0, 0] }, { pos: [2, 2, 2], look: [0, 0, 0] }, { pos: [3, 3, 3], look: [0, 0, 0] }] },
  ]);
  it("holds until the word, then moves", () => {
    expect(cameraPose(keys, 29).pos).toEqual([0, 2, 9]);
    expect(cameraPose(keys, 50).pos[2]).toBeCloseTo(4);
    expect(cameraPose(keys, 87).pos[2]).toBeCloseTo(0.5);
  });
  it("cuts exactly on each listed word", () => {
    expect(cameraPose(keys, 109).pos).toEqual([1, 1, 1]);
    expect(cameraPose(keys, 110).pos).toEqual([2, 2, 2]);
    expect(cameraPose(keys, 120).pos).toEqual([3, 3, 3]);
  });
  it("names a missing word", () => {
    expect(() => direct(ev, [{ at: "nope", move: "cut", pos: [0, 0, 0], look: [0, 0, 1] }])).toThrow(/nope/);
  });
});
