// Ruler: two optics benches side by side. Left, a standard mirror; right, the far bigger High-NA mirror.
// A cone of light falls from each to a focus spot (the right one wider, its spot tighter), each spot draws
// a line on a white plate, and in front two equal patches of silicon fill with switches. Then one thin
// layer lifts off, under an empty stack of many more. Actions (params.moments[].do): mirrors, name, big,
// cones, wide, angle, rays, spot, spotsmall, lines, measure, figL, figR, flash, ratio, patch, pack,
// twinkle, layer, dim, one, stack.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, FigLabel3D, glow, mat, TECH, type V3 } from "../../three/index";
import { Beam, Cone, DotGrid, EUV, FlatMirror, LAB, q, Shot, useBeat, Words, type Anchor } from "./kit";

const LX = -2.6, RX = 2.6, MY = 4.0, SY = 1.4;
const PLATE: V3 = [0, 0.75, 1.6];
const PATCH_Z = 3.4;

const Ruler: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const big = Math.max(k("big", 16), has("cones") || has("spot") || has("lines") || has("patch") ? 1 : 0);
  const cones = Math.max(k("cones", 14), has("spot") || has("rays") || has("angle") ? 1 : 0);
  const wide = Math.max(k("wide", 16), has("angle") || has("rays") || has("spot") ? 1 : 0);
  const rR = 0.55 + 0.75 * big;
  const spot = Math.max(k("spot", 10), has("spotsmall") || has("lines") ? 1 : 0);
  const small = Math.max(k("spotsmall", 14), has("lines") || has("measure") ? 1 : 0);
  const lines = Math.max(k("lines", 18), has("measure") || has("ratio") || has("figL") ? 1 : 0);
  const patch = Math.max(k("patch", 14), has("pack") || has("layer") || has("stack") ? 1 : 0);
  const pack = Math.max(k("pack", 30), has("layer") || has("twinkle") ? 1 : 0);
  const layer = k("layer", 18);
  const dim = k("dim", 12);
  const stack = k("stack", 30);
  const flash = has("flash") ? Math.max(0, 1 - Math.abs(f - at("flash") - 4) / 6) : 0;
  const leftW = 0.26, rightW = 0.16;
  const anchors: Record<string, Anchor> = {
    all: { look: [0, 2.2, 1.2], dir: [0, 0.3, 1], d: 9.5 },
    left: { look: [LX, 2.8, 0], dir: [0.2, 0.15, 1], d: 5 },
    right: { look: [RX, 2.9, 0], dir: [-0.2, 0.15, 1], d: 5.4 },
    spots: { look: [0, SY + 0.4, 0], dir: [0, 0.25, 1], d: 5 },
    lines: { look: [PLATE[0], PLATE[1] + 0.3, PLATE[2]], dir: [0, 0.45, 1], d: 5.6 },
    patch: { look: [0, 0.5, PATCH_Z], dir: [0, 0.9, 1], d: 5.4 },
    layer: { look: [RX, 1.4, PATCH_Z], dir: [-0.3, 0.4, 1], d: 3.6 },
    stack: { look: [RX, 3.2, PATCH_Z], dir: [-0.3, 0.3, 1], d: 6.4 },
  };
  const pos = (on: string): V3 => on === "left" ? [LX - 0.8, MY + 1.1, 0.4] : on === "right" ? [RX - 0.4, MY + 1.5, 0.4] : on === "lines" ? [-1.4, PLATE[1] + 0.7, PLATE[2]] : [0, 3, 0];
  return (
    <Shot p={p} b={b} anchors={anchors} seed="ruler" backdrop={LAB} floor="reflect" bloom={1.25} dust={{ c: [0, 2, 1], r0: 6, r1: 16, size: 0.55, color: "#b9a2ff" }}>
      <mesh position={[0, 3, -2.6]} material={mat("brushed", "#1b1d27", { roughness: 0.55 })}><planeGeometry args={[30, 12]} /></mesh>
      <DotGrid x0={-14} x1={14} y0={-1} y1={8} z={-2.55} gap={0.32} size={0.14} color="#a9aed2" />
      {/* the two benches and their mirrors */}
      {[LX, RX].map((x, i) => (
        <group key={i}>
          <Block size={[2.6, 0.3, 1.6]} radius={0.05} preset="aluminium" position={[x, 0.15, 0]} />
          <mesh position={[x + (i ? 1.6 : 0.9), MY / 2, -0.4]} material={mat("brushed", "#6d7280")}><cylinderGeometry args={[0.07, 0.09, MY, 10]} /></mesh>
          <FlatMirror position={[x, MY, 0]} rotation-x={Math.PI / 2 - 0.25} r={i ? rR : 0.55} lit={0.3 + 0.4 * cones} />
        </group>
      ))}
      {/* the cones of light and the focus spots */}
      {cones > 0.02 && <>
        <Cone a={[LX, SY, 0]} b={[LX, MY - 0.1, 0]} r={0.5} color={EUV} o={0.28 * cones} />
        <Cone a={[RX, SY, 0]} b={[RX, MY - 0.1, 0]} r={0.5 + (rR - 0.5) * wide} color={EUV} o={0.28 * cones} />
      </>}
      {has("angle") && [LX, RX].map((x, i) => (
        <mesh key={i} position={[x, SY, 0.02]} rotation-z={Math.PI / 2} material={glow(TECH.amber, q(0.8 * k("angle", 12)))}>
          <torusGeometry args={[0.9, 0.02, 6, 32, 2 * Math.atan(((i ? rR : 0.5)) / (MY - SY))]} />
        </mesh>
      ))}
      {has("rays") && Array.from({ length: 9 }, (_, i) => {
        const u = (i / 8 - 0.5) * 2 * rR;
        const t = ((f - at("rays")) / 30 + i * 0.11) % 1;
        return <mesh key={i} position={[RX + u * (1 - t), MY - (MY - SY) * t, 0.05]} material={glow("#ffffff", q(0.8 * k("rays", 8)))}><sphereGeometry args={[0.05, 8, 6]} /></mesh>;
      })}
      {spot > 0.02 && <>
        <mesh position={[LX, SY, 0]} material={glow("#ffffff", q(0.9 * spot))}><sphereGeometry args={[0.2, 14, 10]} /></mesh>
        <mesh position={[RX, SY, 0]} material={glow("#ffffff", q(0.9 * spot))}><sphereGeometry args={[0.2 - 0.09 * small, 14, 10]} /></mesh>
      </>}
      {/* the white plate with the two lines */}
      {lines > 0.02 && <group position={PLATE}>
        <Block size={[4.6, 0.06, 1.4]} radius={0.02} material={mat("clay", "#3a3f55", { roughness: 0.7 })} />
        <mesh position={[-1.1, 0.04, 0.6 - 0.6 * lines]} material={glow("#ff8a4a", 0.9)}><boxGeometry args={[leftW, 0.02, 1.2 * lines]} /></mesh>
        <mesh position={[1.1, 0.04, 0.6 - 0.6 * lines]} material={glow(EUV, q(0.85 + 0.15 * flash))}><boxGeometry args={[rightW, 0.02, 1.2 * lines]} /></mesh>
        {has("measure") && [[-1.1, leftW], [1.1, rightW]].map(([x, w], i) => (
          <group key={i}>
            <Beam a={[x! - w! / 2, 0.12, -0.55]} b={[x! + w! / 2, 0.12, -0.55]} r={0.012} color={TECH.amber} o={q(k("measure", 10))} />
            <mesh position={[x! - w! / 2, 0.12, -0.55]} material={glow(TECH.amber, 0.9)}><boxGeometry args={[0.012, 0.12, 0.012]} /></mesh>
            <mesh position={[x! + w! / 2, 0.12, -0.55]} material={glow(TECH.amber, 0.9)}><boxGeometry args={[0.012, 0.12, 0.012]} /></mesh>
          </group>
        ))}
      </group>}
      {has("figL") && b.fig.std && <FigLabel3D fig={b.fig.std} at={[PLATE[0] - 1.1, PLATE[1] + 0.55, PLATE[2] - 0.3]} start={at("figL")} count={14} px={86} color={TECH.cyan} />}
      {has("figR") && b.fig.hi && <FigLabel3D fig={b.fig.hi} at={[PLATE[0] + 1.1, PLATE[1] + 0.55, PLATE[2] - 0.3]} start={at("figR")} count={14} px={86} />}
      {has("ratio") && b.fig.ratio && <FigLabel3D fig={b.fig.ratio} caption="finer" at={[PLATE[0], PLATE[1] + 0.9, PLATE[2] - 0.4]} start={at("ratio")} count={14} px={100} />}
      {/* the two patches of silicon and their switches */}
      {patch > 0.02 && [LX, RX].map((x, side) => {
        const n = side ? 8 : 5;
        const cell = 1.6 / n;
        return (
          <group key={side} position={[x, 0.08, PATCH_Z]}>
            <Block size={[1.8, 0.1, 1.8]} radius={0.02} preset="silicon" scale={[q(patch), 1, q(patch)]} />
            {Array.from({ length: n * n }, (_, i) => {
              const t = Math.max(0, Math.min(1, pack * n * n * 1.1 - i * 1.05));
              if (t <= 0) return null;
              const tw = has("twinkle") ? 0.4 * Math.max(0, Math.sin(f * 0.3 + i)) : 0;
              return <mesh key={i} position={[-0.8 + cell * (i % n + 0.5), 0.07 + 0.08 * t, -0.8 + cell * (Math.floor(i / n) + 0.5)]} material={mat("gate", undefined, { emissiveIntensity: q(0.3 + tw + 0.4 * (side && layer > 0 ? 1 - dim : 1 - dim)) })}><boxGeometry args={[cell * 0.55, 0.08, cell * 0.55]} /></mesh>;
            })}
          </group>
        );
      })}
      {layer > 0.02 && <group position={[RX, 0.3 + 1.0 * layer, PATCH_Z]}>
        <mesh material={glow(EUV, q(0.6 + 0.3 * k("one", 10)))}><boxGeometry args={[1.8, 0.04, 1.8]} /></mesh>
      </group>}
      {stack > 0.02 && Array.from({ length: 14 }, (_, i) => {
        const t = Math.max(0, Math.min(1, stack * 14 - i));
        if (t <= 0) return null;
        const y = 1.5 + i * 0.28;
        return (
          <group key={i} position={[RX, y, PATCH_Z]}>
            {[[0, 0.9], [0, -0.9]].map(([x, z], j) => <Beam key={j} a={[-0.9, 0, z!]} b={[0.9, 0, z!]} r={0.012} color="#8c84c8" o={q(0.6 * t)} />)}
            {[0.9, -0.9].map((x, j) => <Beam key={`x${j}`} a={[x, 0, -0.9]} b={[x, 0, 0.9]} r={0.012} color="#8c84c8" o={q(0.6 * t)} />)}
          </group>
        );
      })}
      <Words b={b} pos={pos} signAt={() => [0, MY + 2.3, -0.6]} signH={0.45} />
    </Shot>
  );
};
export default Ruler;
