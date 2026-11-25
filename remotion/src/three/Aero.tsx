// Aero: wings and the air around them (2026-11-26, for v-20261126-21; added by the video run, section 3c).
// - `Airfoil`: a wing section (NACA 4-digit camber line + thickness) extruded along z, flow toward +x,
//   leading edge at x = -chord/2. `aoa` (radians) tilts it nose-up about its centre.
// - `foilSurface`: a point on its upper or lower surface after the tilt (to pin labels and puffs on it).
// - `streamlines`: flow lines around the section for a given tilt: they follow its surfaces, rise a little
//   ahead of it and bend down behind it in proportion to the tilt (the downwash that lift comes from).
//   Never cross the section. A drawing of the idea, not a flow solution: tag it "illustration".
// - `alongLine`: a point a fraction of the way along a line (a parcel of air riding it).
// - `GlowLine`: a polyline that draws on (`k` 0..1), optionally dashed and flowing (`flow` = dash offset).
// - `PaperPlane`: a folded paper dart (flat wings, a keel), nose toward +x.
// Pure functions of their props; no clocks, no randomness.
import { Line } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import type { V3 } from "./core";
import { mat } from "./Proc";

type Group = ThreeElements["group"];
export type V2 = [number, number];

export type FoilShape = { chord?: number; camber?: number; camberAt?: number; thick?: number };

/** A NACA 4-digit section: u 0..1 from leading to trailing edge; returns [x, y] unrotated, centred on x. */
export function foilPoint(u: number, upper: boolean, s: FoilShape = {}): V2 {
  const c = s.chord ?? 2, m = s.camber ?? 0.04, p = s.camberAt ?? 0.4, t = s.thick ?? 0.12;
  const x = Math.min(1, Math.max(0, u));
  const yt = 5 * t * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1036 * x ** 4);
  const yc = x < p ? (m / (p * p)) * (2 * p * x - x * x) : (m / ((1 - p) ** 2)) * (1 - 2 * p + 2 * p * x - x * x);
  const dyc = x < p ? ((2 * m) / (p * p)) * (p - x) : ((2 * m) / ((1 - p) ** 2)) * (p - x);
  const th = Math.atan(dyc);
  const sgn = upper ? 1 : -1;
  return [(x - sgn * yt * Math.sin(th) - 0.5) * c, (yc + sgn * yt * Math.cos(th)) * c];
}

const rot = (pt: V2, a: number): V2 => {
  // nose-up tilt by `a`: the leading edge (at -x) rises
  const ca = Math.cos(-a), sa = Math.sin(-a);
  return [pt[0] * ca - pt[1] * sa, pt[0] * sa + pt[1] * ca];
};

/** A point on the tilted section's surface (u 0..1 from the leading edge). */
export function foilSurface(u: number, upper: boolean, aoa = 0, s: FoilShape = {}): V2 {
  return rot(foilPoint(u, upper, s), aoa);
}

export const Airfoil: React.FC<Group & FoilShape & { span?: number; aoa?: number; material?: THREE.Material; color?: string }> = ({
  chord = 2, camber = 0.04, camberAt = 0.4, thick = 0.12, span = 1.2, aoa = 0, material, color = "#dfe6ef", ...g
}) => {
  const geo = useMemo(() => {
    const s = { chord, camber, camberAt, thick };
    const shape = new THREE.Shape();
    const N = 48;
    const u = (i: number) => 0.5 - 0.5 * Math.cos((Math.PI * i) / N); // packed at both edges
    const p0 = foilPoint(0, true, s);
    shape.moveTo(p0[0], p0[1]);
    for (let i = 1; i <= N; i++) { const q = foilPoint(u(i), true, s); shape.lineTo(q[0], q[1]); }
    for (let i = N; i >= 0; i--) { const q = foilPoint(u(i), false, s); shape.lineTo(q[0], q[1]); }
    const gm = new THREE.ExtrudeGeometry(shape, { depth: span, bevelEnabled: false, curveSegments: 1 });
    gm.translate(0, 0, -span / 2);
    gm.computeVertexNormals();
    return gm;
  }, [chord, camber, camberAt, thick, span]);
  return (
    <group {...g}>
      <mesh geometry={geo} rotation-z={-aoa} material={material ?? mat("glossy", color)} castShadow receiveShadow />
    </group>
  );
};

export type StreamOpts = FoilShape & { aoa?: number; from?: number; to?: number; n?: number; lift?: number };

/** Flow lines for far-field heights `ys` (in chord-scale world units, + above, - below the section). */
export function streamlines(ys: number[], o: StreamOpts = {}): V2[][] {
  const c = o.chord ?? 2, aoa = o.aoa ?? 0, x0 = o.from ?? -2.2 * c, x1 = o.to ?? 2.4 * c, n = o.n ?? 120;
  const lift = o.lift ?? 1;
  const s: FoilShape = { chord: c, camber: o.camber, camberAt: o.camberAt, thick: o.thick };
  // the tilted surfaces, as y(x) tables
  const tab = (upper: boolean) => {
    const pts: V2[] = [];
    for (let i = 0; i <= 60; i++) pts.push(foilSurface(0.5 - 0.5 * Math.cos((Math.PI * i) / 60), upper, aoa, s));
    return pts;
  };
  const up = tab(true), lo = tab(false);
  const xs = [...up.map((q) => q[0]), ...lo.map((q) => q[0])];
  const xa = Math.min(...xs), xb = Math.max(...xs);
  const yAt = (pts: V2[], x: number): number | null => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i]!, [bx, by] = pts[i + 1]!;
      if ((x >= ax && x <= bx) || (x >= bx && x <= ax)) return bx === ax ? ay : ay + ((x - ax) / (bx - ax)) * (by - ay);
    }
    return null;
  };
  return ys.map((y0) => {
    const above = y0 >= 0;
    const ay = Math.abs(y0);
    const pts: V2[] = [];
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      const u = (x + c / 2) / c;
      const bump = u > 0 && u < 1 ? foilPoint(u, above, s)[1] : 0;
      const w = Math.exp(-ay / (0.9 * c));
      let px = x, py = y0 + w * bump;
      // turn with the section near it
      const win = Math.abs(x) < c / 2 ? 1 : Math.exp(-(((Math.abs(x) - c / 2) / (0.6 * c)) ** 2));
      const r = Math.exp(-ay / (1.2 * c)) * win;
      [px, py] = rot([px, py], aoa * r);
      // up ahead, down behind (the downwash), fading with distance from the wing
      const k = lift * Math.exp(-ay / (1.8 * c));
      py += -0.55 * aoa * c * k * Math.tanh(x / (0.55 * c));
      if (x > c / 2) py -= 0.42 * aoa * k * (x - c / 2);
      pts.push([px, py]);
    }
    // light smoothing, then never inside the section
    const sm = pts.map((q, i) => {
      if (i === 0 || i === pts.length - 1) return q;
      const a = pts[i - 1]!, b = pts[i + 1]!;
      return [q[0], (a[1] + 2 * q[1] + b[1]) / 4] as V2;
    });
    const gap = Math.max(0.02 * c, 0.3 * ay);
    return sm.map(([x, y]) => {
      if (x < xa || x > xb) return [x, y] as V2;
      if (above) { const su = yAt(up, x); return [x, su === null ? y : Math.max(y, su + gap)] as V2; }
      const sl = yAt(lo, x); return [x, sl === null ? y : Math.min(y, sl - gap)] as V2;
    });
  });
}

/** A point `u` (0..1) of the way along a line, by index (lines are sampled evenly in x). */
export function alongLine(line: V2[], u: number, z = 0): V3 {
  const f = Math.min(1, Math.max(0, u)) * (line.length - 1);
  const i = Math.min(line.length - 2, Math.floor(f));
  const t = f - i;
  const a = line[i]!, b = line[i + 1]!;
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, z];
}

/** The fraction along a line where it reaches x (for timing a parcel). */
export function lineU(line: V2[], x: number): number {
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i]!, b = line[i + 1]!;
    if (x >= a[0] && x <= b[0]) return (i + (b[0] === a[0] ? 0 : (x - a[0]) / (b[0] - a[0]))) / (line.length - 1);
  }
  return x < line[0]![0] ? 0 : 1;
}

/** A polyline that draws on with `k` (0..1); `dashed` + `flow` make dashes travel along it. */
export const GlowLine: React.FC<{
  points: V3[]; color?: string; width?: number; k?: number; opacity?: number; dashed?: boolean; dash?: number; gap?: number; flow?: number;
}> = ({ points, color = "#38e1ff", width = 3, k = 1, opacity = 1, dashed = false, dash = 0.25, gap = 0.18, flow = 0 }) => {
  const n = Math.max(2, Math.round(points.length * Math.min(1, Math.max(0, k))));
  const pts = points.slice(0, n);
  if (k <= 0.001 || opacity <= 0.001 || pts.length < 2) return null;
  return (
    <Line points={pts} color={color} lineWidth={width} transparent opacity={opacity} toneMapped={false}
      dashed={dashed} dashSize={dash} gapSize={gap} dashOffset={-flow} userData={{ noClip: true }} />
  );
};

/** A paper dart folded from one sheet: two flat wings and a keel, nose toward +x. `fold` 0..1 folds it
 * from a flat sheet (0) to the dart (1). */
export const PaperPlane: React.FC<Group & { length?: number; fold?: number; color?: string }> = ({ length = 1, fold = 1, color = "#f4f1ea", ...g }) => {
  const L = length, W = 0.42 * L, H = 0.16 * L;
  const f = Math.min(1, Math.max(0, fold));
  const geo = useMemo(() => {
    const keelY = -H * f, wingY = 0, tipZ = W * (0.35 + 0.65 * f);
    // nose, tail centre top, tail wing tips, keel bottom
    const v = [
      L / 2, 0, 0, -L / 2, 0, 0, -L / 2, wingY + 0.04 * L * f, tipZ, // right wing
      L / 2, 0, 0, -L / 2, wingY + 0.04 * L * f, -tipZ, -L / 2, 0, 0, // left wing
      L / 2, 0, 0, -L / 2, keelY, 0.01, -L / 2, 0, 0.01, // keel right
      L / 2, 0, 0, -L / 2, 0, -0.01, -L / 2, keelY, -0.01, // keel left
    ];
    const gm = new THREE.BufferGeometry();
    gm.setAttribute("position", new THREE.BufferAttribute(new Float32Array(v), 3));
    gm.computeVertexNormals();
    return gm;
  }, [L, W, H, f]);
  return (
    <group {...g}>
      <mesh geometry={geo} material={mat("clay", color, { side: THREE.DoubleSide })} castShadow />
    </group>
  );
};
