import { describe, expect, it } from "vitest";
import { gearPoses } from "../src/three/Operation";

// GearTrain (owner, 2026-11-27: "show things working"): meshing gears turn the other way at the ratio of
// their teeth, and a tooth always sits in the other's gap.
describe("gearPoses", () => {
  const gears = [{ r: 1 }, { r: 0.5, angle: 0 }, { r: 1.5, angle: 90 }];
  it("places each gear touching the one before", () => {
    const p = gearPoses(gears, [0, 0, 0], 0);
    expect(p[1]!.pos[0]).toBeCloseTo(1.5);
    expect(p[2]!.pos[0]).toBeCloseTo(1.5);
    expect(p[2]!.pos[1]).toBeCloseTo(2);
  });
  it("turns the next gear the other way at the teeth ratio", () => {
    const a = gearPoses(gears, [0, 0, 0], 0), b = gearPoses(gears, [0, 0, 0], 0.3);
    const d1 = b[1]!.phi - a[1]!.phi, d2 = b[2]!.phi - a[2]!.phi;
    expect(d1).toBeCloseTo(-0.3 * (a[0]!.n / a[1]!.n));
    expect(d2).toBeCloseTo(-d1 * (a[1]!.n / a[2]!.n));
  });
  it("meets tooth to gap at the contact point", () => {
    for (const phi0 of [0, 0.7, 2.1]) {
      const [g0, g1] = gearPoses(gears, [0, 0, 0], phi0);
      const u = (((0 - g0!.phi) * g0!.n) / (2 * Math.PI)) % 1;            // tooth phase of gear 0 at the contact
      const v = (((Math.PI - g1!.phi) * g1!.n) / (2 * Math.PI)) % 1;      // tooth phase of gear 1 there
      expect((((u + v) % 1) + 1) % 1).toBeCloseTo(0.5);
    }
  });
});
