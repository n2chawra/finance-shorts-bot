// Mask: the mask stage at the top of the machine. A square plate hangs face down in its frame, the chip's
// pattern of dark lines and bright gaps on its face; the light comes up at an angle, bounces off it carrying
// the pattern, and two more mirrors shrink it onto the wafer below. Actions (params.moments[].do): plate,
// turn, stencil, grid, stencilcut, incoming, mirrorface, reflect, nothrough, dark, bright, shape, shapebeam,
// projmirrors, shrink, aim, wafer, compare, question, dive, speck, specklands, speckprint, repeatprint, rack, swap.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, glow, mat, TECH, type V3 } from "../../three/index";
import { Ask, Beam, DotGrid, EUV, FlatMirror, LAB, lerpV, q, Shot, useBeat, Words, type Anchor } from "./kit";

const M: V3 = [0, 4.3, 0];
const IN: V3 = [-4.2, 1.0, 0];
const P1: V3 = [3.0, 2.4, 0];
const P2: V3 = [5.0, 1.4, 0];
const W: V3 = [3.4, 0.25, 0];
const S = 2.4;

/** the chip's pattern on the mask: a few blocks of lines, bright gaps between dark absorber lines */
const Pattern: React.FC<{ k: number; dark: number; bright: number; s?: number }> = ({ k, dark, bright, s = 1 }) => (
  <group scale={s}>
    {Array.from({ length: 4 }, (_, blk) => Array.from({ length: 6 }, (_, i) => {
      const bx = (blk % 2 ? 0.55 : -0.55), bz = blk < 2 ? -0.55 : 0.55;
      const horiz = blk % 3 === 0;
      const show = Math.max(0, Math.min(1, k * 24 - (blk * 6 + i)));
      if (show <= 0) return null;
      return (
        <mesh key={`${blk}-${i}`} position={[bx + (horiz ? 0 : (i - 2.5) * 0.14), 0, bz + (horiz ? (i - 2.5) * 0.14 : 0)]}
          material={glow(bright > 0.3 ? "#e6dcff" : TECH.cyan, q(0.35 + 0.6 * Math.max(show * 0.6, bright)))}>
          <boxGeometry args={horiz ? [0.85, 0.012, 0.06] : [0.06, 0.012, 0.85]} />
        </mesh>
      );
    }))}
    {dark > 0.02 && <mesh position={[0, -0.004, 0]} material={mat("clay", "#05060a", { transparent: true, opacity: 0.6 * q(dark) })}><boxGeometry args={[S * 0.92, 0.006, S * 0.92]} /></mesh>}
  </group>
);

const Mask: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const swap = k("swap", 26);
  const slide = (has("plate") && at("plate") > 2 ? k("plate", 20) : 1) * (swap < 0.5 ? 1 - 2 * swap : 2 * swap - 1);
  const speck = k("speck", 24);
  const turn = has("turn") ? k("turn", 18) : 1;
  const patK = Math.max(k("stencil", 30), k("grid", 10), has("incoming") || has("reflect") || has("shapebeam") || has("aim") || has("dark") ? 1 : 0);
  const inc = Math.max(k("incoming", 14), has("reflect") || has("dark") || has("shapebeam") || has("aim") ? 1 : 0);
  const refl = Math.max(k("reflect", 14), has("shapebeam") || has("aim") ? 1 : 0);
  const proj = Math.max(k("projmirrors", 14), has("aim") || has("shrink") ? 1 : 0);
  const down = Math.max(k("shrink", 20), k("shapebeam", 20) * 0.5, has("aim") ? 1 : 0);
  const shape = Math.max(k("shape", 12), k("shapebeam", 8), has("aim") ? 1 : 0);
  const waf = Math.max(k("wafer", 12), k("aim", 12), k("compare", 10));
  const path: V3[] = [M, P1, P2, W];
  const tr = (t: number): V3 => { const s = t * 3, i = Math.min(2, Math.floor(s)); return lerpV(path[i]!, path[i + 1]!, s - i); };
  const anchors: Record<string, Anchor> = {
    mask: { look: [M[0], M[1] - 0.2, 0], dir: [0.2, -0.35, 1], d: 4.6 },
    beam: { look: [1.6, 2.8, 0], dir: [0.1, 0.1, 1], d: 5.6 },
    down: { look: [W[0], W[1] + 0.4, 0], dir: [-0.2, 0.45, 1], d: 3.8 },
    all: { look: [0.8, 2.4, 0], dir: [0.2, 0.15, 1], d: 9.5 },
  };
  const pos = (on: string): V3 => on === "mask" ? [M[0] - 1.8, M[1] + 0.7, 0.6] : on === "beam" ? [1.5, 3.8, 0.6] : on === "down" ? [W[0] - 1.4, W[1] + 1.2, 0.6] : [0, 5.5, 0];
  return (
    <Shot p={p} b={b} anchors={anchors} seed="mask" backdrop={LAB} floor="reflect" bloom={1.3} dust={{ c: [0, 2.5, 0], r0: 6, r1: 16, size: 0.6, color: "#b9a2ff" }}>
      <mesh position={[0, 3, -3]} material={mat("brushed", "#1b1d27", { roughness: 0.55 })}><planeGeometry args={[30, 12]} /></mesh>
      <DotGrid x0={-14} x1={14} y0={-1} y1={8} z={-2.95} gap={0.32} size={0.14} color="#a9aed2" />
      {/* the stage frame */}
      <group position={M}>
        <Block size={[S + 1.2, 0.3, 0.4]} radius={0.04} preset="aluminium" position={[0, 0.35, S / 2 + 0.3]} />
        <Block size={[S + 1.2, 0.3, 0.4]} radius={0.04} preset="aluminium" position={[0, 0.35, -S / 2 - 0.3]} />
        <Block size={[0.5, 0.6, S + 1.0]} radius={0.04} preset="blackPlastic" position={[-S / 2 - 0.5, 0.45, 0]} />
        <group position={[-6 * (1 - slide), 0, 0]} rotation-x={(1 - turn) * 0.9}>
          <Block size={[S, 0.16, S]} radius={0.03} material={mat("silicon", "#2e3262", { roughness: 0.05, emissive: EUV, emissiveIntensity: 0.04 + 0.3 * q(k("mirrorface", 14)) })} />
          <group position={[0, -0.09, 0]}><Pattern k={patK} dark={k("dark", 12)} bright={k("bright", 12)} /></group>
          {has("nothrough") && <mesh position={[0, 0.1, 0]} material={mat("clay", "#0a0b10")}><boxGeometry args={[S * 0.98, 0.02, S * 0.98]} /></mesh>}
        </group>
      </group>
      {/* a stencil and its paint, ghosted in beside the mask */}
      {has("stencilcut") && <group position={[-4.6, 4.0, 0.8]} scale={q(k("stencilcut", 14))} rotation-x={0.5}>
        <Block size={[1.4, 0.04, 1.4]} radius={0.02} material={mat("clay", "#c9a46a")} />
        {[-0.4, 0, 0.4].map((x, i) => <mesh key={i} position={[x, 0.03, 0]} material={glow(TECH.amber, 0.9)}><boxGeometry args={[0.16, 0.01, 1.0]} /></mesh>)}
      </group>}
      {/* the light: in at an angle, off the mask, down through the projection mirrors */}
      {inc > 0.02 && <Beam a={IN} b={lerpV(IN, [M[0], M[1] - 0.1, 0], inc)} r={0.09} color={EUV} o={0.85} />}
      {refl > 0.02 && <Beam a={[M[0], M[1] - 0.1, 0]} b={lerpV([M[0], M[1] - 0.1, 0], P1, refl)} r={0.09 - 0.02 * shape} color={shape > 0.3 ? "#e6dcff" : EUV} o={0.85} />}
      {proj > 0.02 && [P1, P2].map((m, i) => <FlatMirror key={i} position={m} r={0.55} lit={0.3 + 0.5 * proj} rotation-z={i ? 1.1 : -0.9} />)}
      {down > 0.02 && <Beam a={P1} b={lerpV(P1, P2, Math.min(1, down * 2))} r={0.06} color={EUV} o={0.8} />}
      {down > 0.5 && <Beam a={P2} b={lerpV(P2, W, Math.min(1, down * 2 - 1))} r={0.04} color={EUV} o={0.8} />}
      {/* the pattern travelling down the beam, shrinking */}
      {shape > 0.02 && [0, 1, 2].map((i) => {
        const t = ((f / 40 + i / 3) % 1) * (down > 0.5 ? 1 : 0.33);
        const s = 0.5 * (1 - 0.75 * t * Math.max(k("shrink", 20), has("aim") ? 1 : 0));
        return <group key={i} position={tr(t)} scale={s}><Pattern k={1} dark={0} bright={1} s={0.5} /></group>;
      })}
      {/* the wafer below */}
      <group position={W}>
        <Block size={[2.4, 0.3, 2]} radius={0.05} preset="blackPlastic" position={[0, -0.18, 0]} />
        <mesh position={[0, 0.02, 0]} material={mat("silicon", "#3a3f7a", { iridescence: 1, emissive: EUV, emissiveIntensity: 0.05 + 0.3 * q(waf) })}><cylinderGeometry args={[0.9, 0.9, 0.04, 40]} /></mesh>
        {waf > 0.02 && <group position={[0, 0.05, 0]} scale={0.18}><Pattern k={1} dark={0} bright={1} /></group>}
      </group>
      {has("compare") && <mesh position={[M[0], M[1] - 0.12, 0]} rotation-x={Math.PI / 2} material={glow(TECH.amber, q(0.7 * k("compare", 10)))}><ringGeometry args={[S * 0.72, S * 0.75, 4, 1, Math.PI / 4]} /></mesh>}
      {has("compare") && <mesh position={[W[0], W[1] + 0.07, 0]} rotation-x={-Math.PI / 2} material={glow(TECH.amber, q(0.9 * k("compare", 10)))}><ringGeometry args={[0.3, 0.34, 4, 1, Math.PI / 4]} /></mesh>}
      {/* a speck of dust drifting onto the mask, and its shadow printed again and again */}
      {has("speck") && <mesh position={[M[0] + 0.4 - 1.6 * (1 - speck), M[1] - 0.18 - 1.4 * (1 - speck), 0.3]} material={mat("clay", "#c9b38f")}><dodecahedronGeometry args={[0.07, 0]} /></mesh>}
      {has("specklands") && <mesh position={[M[0] + 0.4, M[1] - 0.17, 0.3]} material={glow(TECH.amber, q(0.6 * k("specklands", 8)))}><torusGeometry args={[0.14, 0.012, 6, 24]} /></mesh>}
      {has("speckprint") && Array.from({ length: has("repeatprint") ? 1 + Math.floor(4 * k("repeatprint", 30)) : 1 }, (_, i) => (
        <group key={i} position={[W[0] - 0.45 + (i % 3) * 0.45, W[1] + 0.06, -0.3 + Math.floor(i / 3) * 0.45]}>
          <mesh rotation-x={-Math.PI / 2} material={glow(EUV, 0.6)}><planeGeometry args={[0.36, 0.36]} /></mesh>
          <mesh position={[0.06, 0.01, 0.05]} material={mat("clay", "#05060a")}><sphereGeometry args={[0.035 * q(k("speckprint", 8)), 8, 6]} /></mesh>
        </group>
      ))}
      {/* a rack of other masks */}
      {has("rack") && <group position={[-4.6, 4.4, -0.6]} scale={q(k("rack", 14))}>
        <Block size={[0.3, 2.4, 2.8]} radius={0.04} preset="aluminium" position={[-0.9, -0.6, 0]} />
        {Array.from({ length: 5 }, (_, i) => (
          <Block key={i} size={[1.6, 0.06, 1.6]} radius={0.02} position={[0, -1.6 + i * 0.45, 0]} material={mat("silicon", "#2e3262", { emissive: i % 2 ? TECH.cyan : EUV, emissiveIntensity: 0.25 })} />
        ))}
      </group>}
      <Ask b={b} at={[W[0] - 1.2, W[1] + 1.2, 0.5]} />
      <Words b={b} pos={pos} signAt={() => [M[0] - 3.6, M[1] + 0.9, 0.4]} signH={0.45} />
    </Shot>
  );
};
export default Mask;
