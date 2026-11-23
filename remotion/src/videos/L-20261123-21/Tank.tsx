// Tank: a dark lab bench with a row of antennas seen side-on in front of a dark glass sheet, the ripple
// sheet. Each antenna sends half-circle ripples; with a delay between neighbours the ripples' common front
// tilts by sin(angle) = speed × delay ÷ spacing, and the beam (the arrow) leans toward the later side. The
// geometry is computed, not drawn by hand. params.delay: 0 (all together), 1 (a fixed step), "sweep"
// (the step changes on "change" and swings the beam), "clap" (together until "after", then the step).
// Actions: sign, sheet, fireOne, row, labels, fire, fireStep, rings, timing, bars, step, stepGlow, front,
// frontGlow, frontTilt, arrow, arrowLean, lateSide, sweep, swing, sat, lockRow, hold, nameplate, grid,
// gridFire, gridSwing, gridCircle, clap.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, glow, mat, TECH, type V3 } from "../../three/index";
import { BACK, Beam, Cone, FlatSat, Lines, PulseRing, q, Shot, useBeat, Words, type Anchor } from "./kit";

const N = 8, S = 1.0, Y = 0.45;
const C = 0.11;            // ripple speed, units a frame
const P = 18;              // frames between ripples
const DMAX = 3.2;          // the step, frames
const ax = (i: number) => (i - (N - 1) / 2) * S;

const Tank: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const mode = b.prm.delay ?? 0;
  const fireAt = Math.min(at("fire"), at("fireStep"), at("rings"), at("frontTilt") <= 2 ? 0 : Infinity, at("clap"));
  // the step between neighbours (frames) at frame t
  const stepAt = (t: number) => {
    if (mode === "sweep") {
      const c0 = at("sweep", Infinity);
      return t < c0 ? DMAX : DMAX * Math.cos(Math.min(1, (t - c0) / 30) * Math.PI * 0.5 + Math.max(0, t - c0 - 30) * 0.05) * (t > c0 + 30 ? 1 : 1);
    }
    if (mode === "clap") return t >= at("fireStep", Infinity) ? DMAX : 0;
    if (mode === 1) return has("step") ? DMAX * k("step", 20) : DMAX;
    return 0;
  };
  const d = stepAt(f);
  const th = Math.asin(Math.max(-0.9, Math.min(0.9, (C * d) / S)));
  const dir: V3 = [Math.sin(th), Math.cos(th), 0];
  const oneOnly = has("fireOne") && !has("fire") && !has("fireStep") && !has("rings") && !has("clap");
  const rowIn = has("row") ? k("row", 20) : 1;
  // ripples: each antenna's last few
  const rings: { x: number; r: number; o: number }[] = [];
  const t0 = oneOnly ? at("fireOne") : fireAt;
  if (f >= t0) {
    for (let i = 0; i < N; i++) {
      if (oneOnly && i !== Math.floor(N / 2)) continue;
      for (let n = 0; n < 6; n++) {
        const base = t0 + Math.floor((f - t0) / P) * P - n * P;
        const ti = base + i * stepAt(base);
        const r = C * (f - ti);
        if (r > 0.05 && r < 7.5 && base >= t0) rings.push({ x: ax(i) * rowIn, r, o: 1 - r / 7.5 });
      }
    }
  }
  // the fronts: one per emission, through the ring tangents
  const fronts: { a: V3; b: V3; o: number }[] = [];
  const frontO = Math.max(k("front", 12), k("frontTilt", 12)) * (0.6 + 0.4 * k("frontGlow", 10));
  if (frontO > 0 && f >= t0) {
    for (let n = 0; n < 5; n++) {
      const base = t0 + Math.floor((f - t0) / P) * P - n * P;
      if (base < t0) continue;
      const r0 = C * (f - base);                       // antenna 0's ripple
      const c0: V3 = [ax(0) + dir[0] * r0, Y + dir[1] * r0, 0];
      const along: V3 = [dir[1], -dir[0], 0];             // the front runs perpendicular to the beam
      const L = (N - 1) * S / Math.cos(th);
      if (r0 > 0.3 && r0 < 7) fronts.push({ a: c0, b: [c0[0] + along[0] * L, c0[1] + along[1] * L, 0], o: frontO * (1 - r0 / 7) });
    }
  }
  const arrow = Math.max(k("arrow", 14), k("swing", 10), has("sweep") ? 1 : 0, k("arrowLean", 10));
  const tip: V3 = [dir[0] * 6, Y + 1.4 + dir[1] * 6, 0];
  const late = has("lateSide") ? Math.max(0, 1 - Math.abs(f - at("lateSide") - 4) / 6) : 0;
  // the grid version (the "name" beat)
  const grid = k("grid", 24);
  const gTh = has("gridSwing") ? -0.45 * Math.sin(Math.PI * k("gridSwing", 40)) : 0;
  const gAz = has("gridCircle") && f >= at("gridCircle") ? (f - at("gridCircle")) * 0.06 : 0;
  const gTilt = has("gridCircle") ? 0.4 * k("gridCircle", 12) : Math.abs(gTh);
  const gDir: V3 = has("gridCircle") ? [Math.sin(gTilt) * Math.cos(gAz), Math.cos(gTilt), Math.sin(gTilt) * Math.sin(gAz)] : [Math.sin(gTh), Math.cos(gTh), 0];
  const anchors: Record<string, Anchor> = {
    row: { look: [0, 2.2, 0], dir: [0, 0.18, 1], d: 6.2 },
    left: { look: [ax(0), 0.7, 0], dir: [0.3, 0.25, 1], d: 2.8 },
    front: { look: [1.2, 4, 0], dir: [0.1, 0.1, 1], d: 7.5 },
    bars: { look: [0, 1.5, 0.2], dir: [0, 0.12, 1], d: 5 },
    sat: { look: [2.5, 6.5, 0], dir: [0, -0.25, 1], d: 9 },
    grid: { look: [0, 0.8, -2.6], dir: [0.1, 0.9, 1], d: 9 },
  };
  const pos = (on: string): V3 => on === "bars" ? [ax(N - 1), 2.2, 0.3] : on === "plate" ? [-2.5, 0.5, 1.6] : on === "front" ? [2, 4.5, 0] : on === "sat" ? tip : anchors[on]?.look ?? [0, 1, 0];
  return (
    <Shot p={p} b={b} anchors={anchors} dust={{ c: [0, 3, 0], r0: 9, r1: 30, size: 0.91 }} seed="tank" backdrop={BACK} floor="reflect" bloom={1.15} fov={38}>
      {/* the bench, the glass sheet, the panel */}
      <Block size={[11, 0.2, 3]} radius={0.03} material={mat("clay", "#2e333e")} position={[0, -0.1, 0.4]} />
      <mesh position={[0, 4, -0.25]} material={glow("#0f1a33", q(0.2 + 0.25 * Math.max(k("sheet", 20), has("row") || has("fire") ? 0.6 : 0.3)))}><planeGeometry args={[14, 8.5]} /></mesh>
      <Lines from={-7} to={7} step={0.7} along="x" span={[-0.25, 8.25]} z={-0.24} color="#2a4a80" r={0.012} />
      <Lines from={0} to={8} step={0.7} along="y" span={[-7, 7]} z={-0.24} color="#2a4a80" r={0.012} />
      <Block size={[5.5, 1.2, 0.1]} radius={0.04} material={mat("glossy", "#101826")} position={[0, 8.6, -0.2]} />
      {/* the antennas */}
      {grid < 0.98 && Array.from({ length: N }, (_, i) => {
        const x = ax(i) * rowIn;
        const lit = Math.max(late * (i === N - 1 ? 1 : 0), k("labels", 10) * 0.5, has("lockRow") ? 0.3 * k("lockRow", 10) : 0);
        const hands = has("clap") ? (() => { const ti = (Math.floor(Math.max(0, f - t0) / P) * P) + t0 + i * stepAt(f); const ph = Math.max(0, 1 - Math.abs(f - ti) / 4); return ph; })() : 0;
        return (
          <group key={i} position={[x, 0, 0]} scale={1 - grid}>
            <mesh position={[0, 0.2, 0]} material={mat("aluminium", "#8a919e")}><cylinderGeometry args={[0.06, 0.08, 0.4, 10]} /></mesh>
            <Block size={[0.5, 0.06, 0.5]} radius={0.02} material={lit > 0.05 ? glow(i === N - 1 && late > 0 ? TECH.amber : TECH.cyan, q(0.3 + 0.7 * lit)) : mat("copper")} position={[0, Y, 0]} />
            {has("clap") && f >= at("clap") && (
              <group position={[0, Y + 0.6, 0.3]}>
                <mesh position={[-0.12 + 0.08 * hands, 0, 0]} material={mat("clay", "#e8c9a8")}><boxGeometry args={[0.1, 0.28, 0.06]} /></mesh>
                <mesh position={[0.12 - 0.08 * hands, 0, 0]} material={mat("clay", "#e8c9a8")}><boxGeometry args={[0.1, 0.28, 0.06]} /></mesh>
              </group>
            )}
            {(has("bars") || has("timing") || has("step") || has("sweep")) && (
              <mesh position={[0, 1.2 + (i * stepAt(f) * 0.04) / 2, 0.3]} material={glow(k("stepGlow", 12) > 0.5 ? TECH.amber : TECH.violet, q(0.35 + 0.6 * Math.max(k("bars", 12), k("timing", 12), k("step", 12), has("sweep") ? 1 : 0)))}>
                <boxGeometry args={[0.3, 0.08 + i * stepAt(f) * 0.04, 0.05]} />
              </mesh>
            )}
          </group>
        );
      })}
      {/* ripples and fronts */}
      {grid < 0.5 && rings.map((r, i) => (
        <mesh key={i} position={[r.x, Y, -0.15]} material={glow(TECH.cyan, q(0.55 * r.o * (1 - 2 * grid)))}><torusGeometry args={[r.r, 0.018, 4, 40, Math.PI]} /></mesh>
      ))}
      {grid < 0.5 && fronts.map((fr, i) => <Beam key={i} a={fr.a} b={fr.b} r={0.045} o={fr.o} color={TECH.white} />)}
      {arrow > 0 && grid < 0.5 && (
        <group>
          <Beam a={[0, Y + 1.4, 0.1]} b={tip} r={0.07} o={arrow} color={TECH.amber} />
          <Cone a={[tip[0] + dir[0] * 0.6, tip[1] + dir[1] * 0.6, 0.1]} b={tip} r={0.25} o={arrow} color={TECH.amber} />
        </group>
      )}
      {/* the model satellite on its wire */}
      {has("sat") && (
        <group>
          <Beam a={[-8, 8.6 - 0.9, 0.2]} b={[8, 8.6 - 0.9, 0.2]} r={0.01} o={0.4} color="#9aa3b8" />
          <group position={[(Y + 7.2) * Math.tan(th) * 0.95, 7.4, 0.2]} scale={0.7 * k("sat", 12)}><FlatSat arrays={0.6} /></group>
        </group>
      )}
      {has("lockRow") && <PulseRing f={f} start={at("lockRow")} at={[0, Y + 0.05, 0]} r={4} />}
      {/* the full grid of antennas */}
      {grid > 0 && (
        <group position={[0, 0, -2.6]}>
          {Array.from({ length: 64 }, (_, n) => {
            const i = n % 8, j = Math.floor(n / 8);
            const wv = has("gridFire") && f >= at("gridFire") ? Math.max(0, 1 - Math.abs(((f - at("gridFire")) / 24) % 1 - (i + j) / 14) * 6) : 0;
            return <Block key={n} size={[0.42, 0.06, 0.42]} radius={0.02} material={glow(wv > 0.1 ? TECH.white : TECH.cyan, q(0.2 + 0.5 * grid + 0.3 * wv))} position={[(i - 3.5) * 0.7 * grid, Y, (j - 3.5) * 0.7 * grid]} />;
          })}
          <Cone a={[0, Y + 0.1, 0]} b={[gDir[0] * 6, Y + gDir[1] * 6, gDir[2] * 6]} r={1.4} o={0.28 * grid} />
          <Beam a={[0, Y + 0.1, 0]} b={[gDir[0] * 7, Y + gDir[1] * 7, gDir[2] * 7]} r={0.06} o={0.8 * grid} color={TECH.amber} />
        </group>
      )}
      <Words b={b} pos={pos} signAt={() => [0, 8.6, -0.12]} signH={0.6} />
    </Shot>
  );
};
export default Tank;
