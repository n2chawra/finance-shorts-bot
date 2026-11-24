// Wafer: the wafer stage. A polished silicon disc on a black chuck rides on rails under a thin slit of
// violet light; chip-sized squares fill with the pattern one after another; the mask glides overhead in
// step; close in, one square's finest lines. Actions (params.moments[].do): wafer, shine, lift, resist,
// expose, exposeglow, slit, stage, scan, fields, rowsfill, done, mask, sync, line, lock, whole, dim,
// slitglow, sweep, scanner, page, rows, twinkle, match, dive, lines, measure, linewidth, cut, chip.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, FigLabel3D, glow, mat, TECH, type V3 } from "../../three/index";
import { Beam, DotGrid, EUV, LAB, PulseRing, q, Shot, useBeat, Words, type Anchor } from "./kit";

const R = 2.4, Y = 0.42, G = 0.5;
const FIELDS: [number, number][] = [];
for (let j = -4; j <= 4; j++) for (let i = -4; i <= 4; i++) {
  const x = (i + 0.5) * G - G / 2, z = (j + 0.5) * G - G / 2;
  if (Math.hypot(Math.abs(x) + G / 2, Math.abs(z) + G / 2) < R - 0.05) FIELDS.push([x, z]);
}
const HERO = FIELDS.reduce((a, c) => (Math.hypot(c[0] - 0.25, c[1] - 0.25) < Math.hypot(a[0] - 0.25, a[1] - 0.25) ? c : a), FIELDS[0]!);

const Wafer: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const printedAll = has("done") || has("rows") || has("match") || has("cut") || has("chip") || has("twinkle");
  const fill = printedAll ? 1 : Math.max(0.12 * k("fields", 8), 0.5 * k("fields", 60), 0.5 + 0.5 * k("rowsfill", 60) * (has("rowsfill") ? 1 : 0), k("done", 20)) * (has("fields") || has("rowsfill") || has("done") ? 1 : 0);
  const scanning = has("scan") && f >= at("scan");
  const sx = scanning ? 0.9 * Math.sin((f - at("scan")) * 0.09) * Math.min(1, (f - at("scan")) / 10) : 0;
  const lift = k("lift", 18) * (1 - (has("cut") ? k("cut", 10) : 0));
  const resist = Math.max(k("resist", 20), has("expose") ? 1 : 0);
  const expose = k("expose", 14);
  const slitO = Math.max(k("slit", 10), k("slitglow", 10), has("scan") || has("sync") || has("sweep") ? 1 : 0) * (1 - 0.6 * k("dim", 8) * (1 - k("slitglow", 8)));
  const sweep = has("sweep") ? k("sweep", 30) : -1;
  const maskOn = Math.max(k("mask", 12), has("sync") ? 1 : 0);
  const whole = has("whole") ? Math.max(0, 1 - Math.abs(f - at("whole") - 6) / 8) : 0;
  const zoomLines = Math.max(k("lines", 14), k("measure", 10), has("linewidth") || has("line") ? 1 : 0);
  const cut = k("cut", 24);
  const chip = k("chip", 18);
  const shine = has("shine") ? ((f - at("shine")) / 40) % 1 : -1;
  const tw = (i: number) => (has("twinkle") && f >= at("twinkle") ? 0.4 * Math.max(0, Math.sin(f * 0.3 + i * 1.7)) : 0);
  const rowsLit = (i: number) => (has("rows") ? Math.max(0, Math.min(1, k("rows", 40) * FIELDS.length - i)) : 0);
  const matchLit = (x: number, z: number) => (has("match") && (Math.abs(x - HERO[0]) < 0.01 || Math.abs(x - HERO[0] + G) < 0.01) && Math.abs(z - HERO[1]) < 0.01 ? k("match", 10) : 0);
  const ox = sx;
  const hero: V3 = [HERO[0] + ox, Y + 0.03, HERO[1]];
  const anchors: Record<string, Anchor> = {
    all: { look: [0, 1.4, 0], dir: [0.3, 0.7, 1], d: 9 },
    wafer: { look: [0, Y, 0], dir: [0.25, 0.85, 1], d: 5.6 },
    slit: { look: [0, Y + 0.6, 0], dir: [0.6, 0.35, 1], d: 4 },
    field: { look: hero, dir: [0.2, 1.2, 1], d: 2.0 },
    line: { look: hero, dir: [0.05, 1.2, 1], d: 2.4 },
    mask: { look: [0, 3.2, 0], dir: [0.4, 0.2, 1], d: 7 },
    scanner: { look: [5.4, 0.9, 1.2], dir: [-0.2, 0.6, 1], d: 3.6 },
    chip: { look: [HERO[0], Y + 1.2, HERO[1]], dir: [0.2, 0.4, 1], d: 2.6 },
  };
  const pos = (on: string): V3 => on === "wafer" ? [-R + 0.2, Y + 0.9, R - 0.4] : on === "mask" ? [-2.4, 4.6, 0.6] : on === "scanner" ? [5.4, 1.8, 1.2] : on === "field" || on === "line" ? [hero[0] - 0.3, hero[1] + 0.25, hero[2]] : [0, 2, 0];
  return (
    <Shot p={p} b={b} anchors={anchors} seed="wafer" backdrop={LAB} floor="reflect" bloom={1.25} dust={{ c: [0, 1.5, 0], r0: 6, r1: 16, size: 0.55, color: "#b9a2ff" }}>
      <mesh position={[0, 3, -5]} material={mat("brushed", "#1b1d27", { roughness: 0.55 })}><planeGeometry args={[30, 14]} /></mesh>
      <DotGrid x0={-14} x1={14} y0={-1} y1={9} z={-4.95} gap={0.32} size={0.14} color="#a9aed2" />
      {/* the rails and the stage */}
      {[-1.8, 1.8].map((z, i) => <Block key={i} size={[9, 0.12, 0.25]} radius={0.03} material={mat("brushed", "#8a90a0", { emissive: TECH.cyan, emissiveIntensity: 0.6 * q(k("stage", 12)) })} position={[0, 0.06, z]} />)}
      <group position={[ox, 0.25 * lift, 0]} rotation-x={-0.12 * lift}>
        <Block size={[5.6, 0.25, 5.6]} radius={0.08} preset="blackPlastic" position={[0, 0.17, 0]} />
        <mesh position={[0, Y - 0.06, 0]} material={mat("silicon", "#353a74", { iridescence: 1, roughness: 0.06 })}><cylinderGeometry args={[R, R, 0.05, 64]} /></mesh>
        {Array.from({ length: 19 }, (_, i) => (
          <group key={`g${i}`}>
            <mesh position={[(i - 9) * G / 2 - G / 4, Y - 0.03, 0]} material={mat("clay", "#5a5f9a")}><boxGeometry args={[0.012, 0.006, 2 * R * Math.sqrt(Math.max(0, 1 - (((i - 9) * G / 2) / R) ** 2))]} /></mesh>
            <mesh position={[0, Y - 0.03, (i - 9) * G / 2 - G / 4]} material={mat("clay", "#5a5f9a")}><boxGeometry args={[2 * R * Math.sqrt(Math.max(0, 1 - (((i - 9) * G / 2) / R) ** 2)), 0.006, 0.012]} /></mesh>
          </group>
        ))}
        {resist > 0.02 && <mesh position={[0, Y - 0.025, 0]} material={mat("oxide", "#ffb347", { opacity: 0.45 * q(resist) })}><cylinderGeometry args={[R * Math.min(1, resist * 1.3), R * Math.min(1, resist * 1.3), 0.012, 64]} /></mesh>}
        {shine >= 0 && <mesh position={[-R + 2 * R * shine, Y + 0.0, 0]} rotation-y={0.6} material={glow("#ffffff", 0.45)}><boxGeometry args={[0.08, 0.01, 2 * R * 0.9]} /></mesh>}
        {/* the chip squares */}
        {FIELDS.map(([x, z], i) => {
          const done = fill * FIELDS.length - i;
          const o = Math.max(0, Math.min(1, done)) * 0.55 + rowsLit(i) * 0.35 + tw(i) + matchLit(x, z) * 0.5 + 0.4 * whole * (x === HERO[0] && z === HERO[1] ? 1 : 0);
          const sweepO = sweep >= 0 && x === HERO[0] && z === HERO[1] ? 0.6 * sweep : 0;
          const isHeroExp = has("expose") && x === HERO[0] && z === HERO[1] ? expose : 0;
          const tot = Math.max(o, sweepO, isHeroExp * 0.7);
          if (tot <= 0.02 && !has("cut")) return null;
          const lifted = has("chip") && x === HERO[0] && z === HERO[1] ? chip : 0;
          return (
            <group key={i} position={[x, Y + 0.002 + 0.9 * lifted, z]}>
              {tot > 0.02 && <mesh rotation-x={-Math.PI / 2} material={glow(isHeroExp > 0.3 ? TECH.amber : EUV, q(Math.min(1, tot)))}><planeGeometry args={[G * 0.9, G * 0.9]} /></mesh>}
              {tot > 0.3 && [0, 1, 2].map((r) => <mesh key={r} position={[0, 0.003, -0.12 + r * 0.12]} material={glow("#ffffff", q(0.5 * Math.min(1, tot)))}><boxGeometry args={[G * 0.7, 0.004, 0.02]} /></mesh>)}
              {lifted > 0.02 && <Block size={[G * 0.9, 0.05, G * 0.9]} radius={0.01} preset="siliconLit" position={[0, -0.03, 0]} />}
            </group>
          );
        })}
        {has("exposeglow") && <PulseRing f={f} start={at("exposeglow")} at={[HERO[0], Y + 0.02, HERO[1]]} r={0.4} />}
        {/* saw lines */}
        {cut > 0.02 && Array.from({ length: 9 }, (_, i) => (
          <group key={i}>
            <mesh position={[(i - 4) * G - G / 2 + G / 2, Y + 0.01, 0]} material={glow(TECH.cyan, 0.7)}><boxGeometry args={[0.015, 0.01, 2 * R * Math.min(1, cut * 1.5)]} /></mesh>
            <mesh position={[0, Y + 0.01, (i - 4) * G]} material={glow(TECH.cyan, 0.7)}><boxGeometry args={[2 * R * Math.max(0, Math.min(1, cut * 1.5 - 0.4)), 0.01, 0.015]} /></mesh>
          </group>
        ))}
        {/* one square's finest lines, close in */}
        {zoomLines > 0.02 && <group position={[HERO[0], Y + 0.012, HERO[1]]}>
          {Array.from({ length: 15 }, (_, i) => <mesh key={i} position={[-0.21 + i * 0.03, 0, 0]} material={glow(EUV, q(0.75 * zoomLines))}><boxGeometry args={[0.011, 0.004, 0.42]} /></mesh>)}
          {has("measure") && <Beam a={[-0.21 - 0.006, 0.02, 0.05]} b={[-0.21 + 0.006, 0.02, 0.05]} r={0.0025} color={TECH.amber} o={q(k("measure", 8))} />}
          {has("measure") && <mesh position={[-0.21, 0.02, 0.05]} material={glow(TECH.amber, q(k("measure", 8)))}><boxGeometry args={[0.03, 0.003, 0.003]} /></mesh>}
          {has("lock") && <mesh position={[0, 0.02, 0]} rotation-x={-Math.PI / 2} material={glow(TECH.amber, q(k("lock", 8)))}><ringGeometry args={[0.09 + 0.1 * (1 - k("lock", 10)), 0.1 + 0.1 * (1 - k("lock", 10)), 32]} /></mesh>}
        </group>}
        {has("linewidth") && b.fig.w && <FigLabel3D fig={b.fig.w} at={[HERO[0] - 0.12, Y + 0.12, HERO[1] - 0.12]} start={at("linewidth")} count={14} px={90} />}
      </group>
      {/* the slit of light */}
      {slitO > 0.02 && <group position={[sweep >= 0 ? HERO[0] - G / 2 + G * sweep : 0, 0, sweep >= 0 ? HERO[1] : 0]}>
        <mesh position={[0, Y + 1.6, 0]} material={glow(EUV, q(0.14 * slitO))}><boxGeometry args={[0.025, 3.2, sweep >= 0 ? G : 2 * R]} /></mesh>
        <mesh position={[0, Y + 0.02, 0]} material={glow("#e6dcff", q(0.9 * slitO))}><boxGeometry args={[0.06, 0.01, sweep >= 0 ? G : 2 * R]} /></mesh>
      </group>}
      {whole > 0.02 && <mesh position={[HERO[0], Y + 0.6, HERO[1]]} material={glow(EUV, q(0.3 * whole))}><boxGeometry args={[G, 1.2, G]} /></mesh>}
      {/* the mask overhead, gliding the other way in step */}
      {maskOn > 0.02 && <group position={[-ox * 4, 4.4, 0]}>
        <Block size={[2.6, 0.14, 2.6]} radius={0.03} material={mat("silicon", "#2e3262", { emissive: EUV, emissiveIntensity: 0.1 + 0.4 * q(maskOn) })} />
        {Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[-0.9 + i * 0.3, -0.08, 0]} material={glow(TECH.cyan, 0.7)}><boxGeometry args={[0.06, 0.01, 2.2]} /></mesh>)}
      </group>}
      {has("sync") && [-1, 1].map((z, i) => <Beam key={i} a={[-ox * 4, 4.3, z]} b={[ox, Y + 0.3, z]} r={0.015} color={TECH.amber} o={q(0.7 * k("sync", 12))} />)}
      {/* a page scanner, for comparison */}
      {has("scanner") && <group position={[5.4, 0.3, 1.2]} scale={q(k("scanner", 12))}>
        <Block size={[2.2, 0.35, 1.6]} radius={0.06} preset="white" />
        <mesh position={[0, 0.19, 0]} material={mat("glass", "#bfe8ff", { opacity: 0.5 })}><boxGeometry args={[1.9, 0.02, 1.3]} /></mesh>
        <mesh position={[-0.9 + 1.8 * (((f - at("scanner")) / 45) % 1), 0.21, 0]} material={glow("#e6f4ff", 0.9)}><boxGeometry args={[0.05, 0.02, 1.3]} /></mesh>
        {has("page") && <mesh position={[0, 0.22, 0]} rotation-x={-Math.PI / 2} material={mat("white", "#fbfbf6", { transparent: true, opacity: q(k("page", 10)) })}><planeGeometry args={[1.2, 1.0]} /></mesh>}
      </group>}
      <Words b={b} pos={pos} signAt={() => [-R - 0.6, Y + 1.7, 0.8]} signH={0.42} />
    </Shot>
  );
};
export default Wafer;
