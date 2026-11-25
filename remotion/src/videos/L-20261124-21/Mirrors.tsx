// Mirrors: a dark vacuum tunnel. On the left a glass lens on a stand (the violet light dies in it); then a
// zigzag chain of multilayer mirrors the beam bounces along, losing a little at each; above the first
// mirror a magnified cut through its stack of thin layers. Actions (params.moments[].do): beam, lens,
// camera, bend, euvin, swallow, nolens, mirror, bounce, bright, cut, layers, split, two, restack, incoming,
// reflect, align, strong, lossbar, dim, bars, faint, boost, polish, mirrorface, blank, question, up.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, glow, mat, TECH, type V3 } from "../../three/index";
import { Ask, Beam, DotGrid, EUV, FlatMirror, LAB, lerpV, Lines, q, Shot, useBeat, Words, type Anchor } from "./kit";

const LENS: V3 = [-5.2, 1.7, 0];
const START: V3 = [-9.5, 1.7, 0];
const CHAIN: V3[] = [[-1.2, 0.7, 0], [1.4, 3.1, 0], [4, 0.7, 0], [6.6, 3.1, 0], [9.2, 0.7, 0]];
const EXIT: V3 = [9.2, 7, 0];
const STACK: V3 = [-1.2, 3.4, 1.6];
const AMB = "#ffb36b";

const Mirrors: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const lensUp = has("lens") ? k("lens", 14) * (1 - k("nolens", 16)) : 0;
  const swallow = k("swallow", 12);
  const chainUp = Math.max(k("mirror", 18), has("bounce") || has("layers") || has("incoming") || has("restack") || has("faint") || has("boost") || has("polish") ? 1 : 0);
  const bounce = Math.max(k("bounce", 30), has("faint") || has("boost") || has("bars") || has("dim") || has("blank") ? 1 : 0);
  const dim = Math.max(k("dim", 20), k("bars", 20), k("faint", 14)) * (1 - k("boost", 20));
  const boost = k("boost", 20);
  const strong = k("strong", 12);
  const pts: V3[] = [has("lens") || has("swallow") ? LENS : START, ...CHAIN, EXIT];
  const segs = pts.length - 1;
  const reach = bounce * segs;
  const lit = (i: number) => (has("bright") && f >= at("bright") ? Math.max(0, 1 - Math.abs(((f - at("bright")) / 6) - i) / 1.2) : 0);
  // the stack of layers above the first mirror
  const stackOn = has("layers") || has("cut") || has("restack") || has("incoming") || has("reflect");
  const spread = k("split", 14) * (1 - k("restack", 14));
  const two = Math.max(k("two", 12), has("reflect") || has("incoming") ? 1 : 0);
  const anchors: Record<string, Anchor> = {
    lens: { look: [LENS[0] + 0.4, LENS[1], 0], dir: [0.2, 0.2, 1], d: 6 },
    chain: { look: [4, 1.9, 0], dir: [0.1, 0.28, 1], d: 9 },
    mirror: { look: [CHAIN[0]![0], CHAIN[0]![1] + 0.6, 0], dir: [0.35, 0.35, 1], d: 5.2 },
    layers: { look: STACK, dir: [0.15, 0.05, 1], d: 3.4 },
    up: { look: [9.2, 3.2, 0], dir: [-0.4, 0.15, 1], d: 5 },
  };
  const pos = (on: string): V3 => on === "lens" ? [LENS[0], LENS[1] + 1.3, 0.3] : on === "layers" ? [STACK[0] + 1.6, STACK[1] + 0.8, STACK[2]] : on === "mirror" ? [CHAIN[0]![0] + 0.3, CHAIN[0]![1] + 1.1, 0.3] : [4, 4.2, 0.3];
  const violetO = has("swallow") ? 0.9 : 0.9;
  return (
    <Shot p={p} b={b} anchors={anchors} seed="mirrors" backdrop={LAB} floor="reflect" bloom={1.3} dust={{ c: [1, 2.4, 0], r0: 7, r1: 18, size: 0.6, color: "#b9a2ff" }}>
      {/* the tunnel: ribbed back wall, bolts */}
      <mesh position={[0, 3, -3]} material={mat("brushed", "#1d1f29", { roughness: 0.55 })}><planeGeometry args={[40, 12]} /></mesh>
      <Lines from={-18} to={18} step={1.8} along="x" span={[-2, 9]} z={-2.95} color="#323646" r={0.04} />
      <DotGrid x0={-18} x1={18} y0={-1} y1={8} z={-2.94} gap={0.32} size={0.14} color="#a9aed2" />
      {/* the lens on its stand, the beam dying in it */}
      {lensUp > 0.02 && <group position={LENS}>
        <mesh position={[0, -0.9, 0]} material={mat("brushed", "#6d7280")}><cylinderGeometry args={[0.06, 0.12, 1.6, 10]} /></mesh>
        <mesh rotation-z={Math.PI / 2} scale={[1, 0.28, 1]} material={mat("glass", "#bfe8ff", { opacity: 0.5 })}><sphereGeometry args={[0.9 * q(lensUp), 28, 18]} /></mesh>
        {swallow > 0.02 && <mesh scale={[0.3, 1, 1]} material={glow("#ff7a2a", q(0.45 * swallow * (1 - k("nolens", 10))))}><sphereGeometry args={[0.55, 14, 10]} /></mesh>}
      </group>}
      {has("camera") && <group>
        <group position={[LENS[0] - 1.4, LENS[1] + 1.6, 1.4]} scale={q(k("camera", 12))}>
          <Block size={[0.9, 0.6, 0.4]} radius={0.06} preset="blackPlastic" />
          <mesh position={[0, 0, 0.3]} rotation-x={Math.PI / 2} material={mat("glass", "#bfe8ff", { opacity: 0.6 })}><cylinderGeometry args={[0.22, 0.22, 0.2, 18]} /></mesh>
        </group>
        <group position={[LENS[0] + 1.4, LENS[1] + 1.6, 1.4]} scale={q(k("camera", 12))}>
          <mesh material={mat("brushed", "#cfd4de")}><cylinderGeometry args={[0.12, 0.16, 0.9, 14]} /></mesh>
          <mesh position={[0, -0.5, 0]} material={mat("glass", "#bfe8ff", { opacity: 0.6 })}><sphereGeometry args={[0.13, 12, 8]} /></mesh>
        </group>
      </group>}
      {has("bend") && <>
        <Beam a={[LENS[0] - 3, LENS[1] + 0.35, 0.3]} b={[LENS[0], LENS[1] + 0.35, 0.3]} r={0.03} color={AMB} o={q(k("bend", 10))} />
        <Beam a={[LENS[0], LENS[1] + 0.35, 0.3]} b={[LENS[0] + 2.6 * k("bend", 18), LENS[1] + 0.35 - 0.35 * k("bend", 18), 0.3]} r={0.03} color={AMB} o={0.9} />
      </>}
      {(has("beam") || has("euvin")) && !has("bounce") && (
        <Beam a={START} b={has("euvin") ? lerpV(START, LENS, Math.min(1, 0.6 + 0.4 * k("euvin", 14))) : lerpV(START, [LENS[0] - 0.6, LENS[1], 0], q(k("beam", 16) * 0.95 + 0.05))} r={0.06} color={EUV} o={violetO} />
      )}
      {has("swallow") && !has("bounce") && <Beam a={[LENS[0] + 0.05, LENS[1], 0]} b={[LENS[0] + 2.5, LENS[1], 0]} r={0.06} color={EUV} o={q(0.6 * (1 - swallow))} />}
      {/* the mirror chain */}
      {chainUp > 0.02 && CHAIN.map((m, i) => (
        <group key={i} position={[m[0], m[1] - 2 * (1 - q(Math.min(1, chainUp * 1.4 - i * 0.1))), m[2]]} rotation-z={i % 2 ? Math.PI : 0}>
          <FlatMirror r={i === 0 ? 0.75 : 0.55} lit={Math.max(lit(i), 0.25 * bounce * (1 - dim * i * 0.18), i === 0 ? 0.6 * strong : 0)} />
          {(has("lossbar") || has("bars")) && <Block size={[0.22, 0.2 + 1.2 * (1 - (i * 0.16 + 0.02) * Math.max(k("bars", 18), i === 0 ? k("lossbar", 10) : 0)), 0.22]} radius={0.03}
            material={glow(i < 2 ? TECH.cyan : TECH.amber, 0.8)} position={[0.9, i % 2 ? -0.9 : 0.9, 0.4]} />}
        </group>
      ))}
      {Array.from({ length: segs }, (_, i) => {
        const t = Math.max(0, Math.min(1, reach - i));
        if (t <= 0 || chainUp < 0.5) return null;
        const o = Math.max(0.12, 0.95 - i * 0.16 * dim * 1.2) + 0.2 * boost;
        return <Beam key={i} a={pts[i]!} b={lerpV(pts[i]!, pts[i + 1]!, t)} r={(0.07 + 0.04 * boost) * (1 - 0.1 * i * dim)} color={EUV} o={Math.min(1, o)} />;
      })}
      {/* polish: a sweep of light across the first mirror's face */}
      {has("polish") && <mesh position={[CHAIN[0]![0] - 0.7 + 1.4 * (((f - at("polish")) / 30) % 1), CHAIN[0]![1] + 0.04, 0.1]} rotation-z={0.5} material={glow("#ffffff", 0.7)}><boxGeometry args={[0.05, 0.02, 1.4]} /></mesh>}
      {has("mirrorface") && <mesh position={[CHAIN[0]![0], CHAIN[0]![1] + 0.03, 0]} rotation-x={-Math.PI / 2} material={glow("#e6dcff", q(0.35 * k("mirrorface", 14)))}><circleGeometry args={[0.7, 36]} /></mesh>}
      {/* the magnified stack */}
      {stackOn && <group position={STACK}>
        <mesh position={[0, -0.95, -0.3]} material={glow("#ffffff", 0.25)}><boxGeometry args={[0.03, 1.2, 0.03]} /></mesh>
        {Array.from({ length: 12 }, (_, i) => (
          <Block key={i} size={[2.4, 0.07, 1.2]} radius={0.01} position={[0, i * (0.11 + 0.12 * spread) - 0.6, 0]} scale={[q(k("layers", 16)) * 0.98 + 0.02, 1, 1]}
            material={mat(i % 2 ? "brushed" : "silicon", i % 2 ? "#9aa3c7" : "#3b3f7a", { emissive: two > 0.5 ? (i % 2 ? "#5ad1ff" : EUV) : "#000000", emissiveIntensity: 0.25 * q(two) })} />
        ))}
        {has("incoming") && <Beam a={[-1.6, 2.2, 0.5]} b={lerpV([-1.6, 2.2, 0.5], [0, 0.7, 0.5], k("incoming", 14))} r={0.05} color={EUV} />}
        {has("reflect") && Array.from({ length: 6 }, (_, i) => {
          const y = 0.7 - i * 0.22, sx = 0.3 * i * (1 - k("align", 16));
          return <Beam key={i} a={[sx, y, 0.5]} b={[sx + 1.6 * k("reflect", 12), y + 1.5 * k("reflect", 12), 0.5]} r={0.012} color={EUV} o={q(0.35 + 0.4 * k("align", 14))} />;
        })}
        {strong > 0.02 && <Beam a={[0, 0.7, 0.5]} b={[1.7, 2.3, 0.5]} r={0.07 * strong} color="#e6dcff" />}
      </group>}
      {has("cut") && <Block size={[0.5, 0.06, 0.5]} radius={0.01} preset="silicon" position={[CHAIN[0]![0] + 0.4, CHAIN[0]![1] + 0.15 + 0.8 * k("cut", 14), 0.4]} rotation-z={0.4 * k("cut", 14)} />}
      {has("blank") && <mesh position={[EXIT[0], 4.6, 0]} rotation-x={0} material={glow("#ffffff", q(0.35 + 0.4 * k("blank", 12)))}><circleGeometry args={[0.6, 30]} /></mesh>}
      <Ask b={b} at={[EXIT[0] - 1.2, 5.3, 0.4]} />
      <Words b={b} pos={pos} signAt={() => [LENS[0] - 0.3, LENS[1] + 2.6, 0.3]} signH={0.42} />
    </Shot>
  );
};
export default Mirrors;
