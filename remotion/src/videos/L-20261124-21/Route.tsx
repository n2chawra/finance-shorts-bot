// Route: the machine cut open, its light path laid out from the tin source (left) through the mirrors, up
// to the mask at the top and down to the wafer stage (right). Actions (params.moments[].do): cutaway,
// path, tin, drip, mirrors, mask, pattern, wafer, pulse, lens, blocked, finer, switch, recap.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, glow, mat, TECH, type V3 } from "../../three/index";
import { Beam, DotGrid, EUV, FlatMirror, LAB, lerpV, PlasmaBall, q, Shot, TinDrop, useBeat, Words, type Anchor } from "./kit";

const SRC: V3 = [-5.2, 1.2, 0];
const PTS: V3[] = [SRC, [-3, 1.0, 0], [-1, 2.4, 0], [1.2, 4.6, 0], [2.8, 3.2, 0], [3.6, 2.0, 0], [4.6, 0.75, 0]];
const MASK = PTS[3]!, WAF = PTS[6]!;
const MIRS = [PTS[1]!, PTS[2]!, PTS[4]!, PTS[5]!];

const Route: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const recap = k("recap", 14);
  const all = Math.max(recap, k("pulse", 10) * 0.6);
  const tin = Math.max(k("tin", 10), all, has("drip") ? 0.6 : 0);
  const mir = Math.max(k("mirrors", 14), all);
  const mask = Math.max(k("mask", 12), all);
  const waf = Math.max(k("wafer", 12), all);
  const path = Math.max(k("path", 30), recap);
  const glass = Math.max(k("cutaway", 20), has("path") || has("tin") ? 1 : 0);
  const blocked = k("blocked", 10);
  // the light path drawn segment by segment (only up to the lens when blocked)
  const segs = PTS.length - 1;
  const lensK = k("lens", 12);
  const reach = has("blocked") || (has("lens") && !has("mirrors") && has("tin")) ? 1.1 : path * segs;
  const pulseT = has("pulse") && f >= at("pulse") ? ((f - at("pulse")) / 40) % 1.2 : -1;
  const pulseP = pulseT >= 0 && pulseT <= 1 ? (() => { const s = pulseT * segs, i = Math.min(segs - 1, Math.floor(s)); return lerpV(PTS[i]!, PTS[i + 1]!, s - i); })() : null;
  const finer = k("finer", 16);
  const sw = k("switch", 14);
  const drip = has("drip") && f >= at("drip") ? Math.min(1, (f - at("drip")) / 10) : 0;
  const lensPos = lerpV(PTS[0]!, PTS[1]!, 0.7);
  const anchors: Record<string, Anchor> = {
    all: { look: [0, 2.4, 0], dir: [0.25, 0.3, 1], d: 9 },
    source: { look: [SRC[0] + 1.6, SRC[1] + 0.4, 0], dir: [0.3, 0.25, 1], d: 7 },
    mirrors: { look: [-2, 1.7, 0], dir: [0.2, 0.3, 1], d: 4.4 },
    mask: { look: [MASK[0], MASK[1] - 0.3, 0], dir: [0.15, -0.1, 1], d: 3.8 },
    wafer: { look: [WAF[0], WAF[1] + 0.2, 0], dir: [-0.15, 0.35, 1], d: 3.6 },
  };
  const pos = (on: string): V3 => on === "source" ? [SRC[0], SRC[1] + 1.2, 0.6] : on === "mirrors" ? [-2, 3.0, 0.6] : on === "mask" ? [MASK[0] - 1.4, MASK[1] + 0.6, 0.6] : on === "wafer" ? [WAF[0] - 0.8, WAF[1] + 1.4, 0.6] : [0, 4.6, 0.6];
  return (
    <Shot p={p} b={b} anchors={anchors} seed="route" backdrop={LAB} floor="reflect" bloom={1.3} dust={{ c: [0, 2.5, 0], r0: 7, r1: 18, size: 0.6, color: "#b9a2ff" }}>
      {/* the back wall: a measuring grid */}
      <mesh position={[0, 3, -3.2]} material={mat("clay", "#14121f")}><planeGeometry args={[30, 12]} /></mesh>
      <DotGrid x0={-12} x1={12} y0={-2} y1={8.5} z={-3.15} gap={0.32} size={0.14} color="#a9aed2" />
      {/* the machine's shell, turned to glass */}
      <Block size={[11.6, 5.6, 3.2]} radius={0.15} material={mat("glass", "#cfd8ff", { opacity: 0.06 + 0.1 * (1 - glass) })} position={[0, 2.85, 0]} />
      {[[-5.8, 0.05], [5.8, 0.05], [-5.8, 5.65], [5.8, 5.65]].map(([x, y], i) => (
        <mesh key={i} position={[x!, y!, 1.6]} rotation-z={i < 2 ? 0 : 0} material={glow("#8c84c8", q(0.25 + 0.3 * glass))}><boxGeometry args={i % 2 ? [0.04, 0.04, 0.04] : [0.04, 0.04, 0.04]} /></mesh>
      ))}
      <Beam a={[-5.8, 0.05, 1.6]} b={[5.8, 0.05, 1.6]} r={0.02} color="#8c84c8" o={0.35 + 0.3 * glass} />
      <Beam a={[-5.8, 5.65, 1.6]} b={[5.8, 5.65, 1.6]} r={0.02} color="#8c84c8" o={0.35 + 0.3 * glass} />
      <Beam a={[-5.8, 0.05, 1.6]} b={[-5.8, 5.65, 1.6]} r={0.02} color="#8c84c8" o={0.35 + 0.3 * glass} />
      <Beam a={[5.8, 0.05, 1.6]} b={[5.8, 5.65, 1.6]} r={0.02} color="#8c84c8" o={0.35 + 0.3 * glass} />
      {/* the source vessel */}
      <mesh position={SRC} material={mat("brushed", "#6a6f84", { transparent: true, opacity: 0.25 })}><sphereGeometry args={[0.9, 24, 16]} /></mesh>
      <PlasmaBall position={SRC} k={0.35 + 0.5 * tin + 0.4 * (has("drip") ? Math.max(0, 1 - Math.abs(f - at("drip") - 10) / 6) : 0)} f={f} />
      {has("drip") && <TinDrop position={[SRC[0], SRC[1] + 0.7 - 0.7 * drip, 0]} r={0.08} />}
      {/* mirrors along the path */}
      {MIRS.map((m, i) => <FlatMirror key={i} position={m} r={0.42} lit={mir * (0.6 + 0.4 * Math.sin(f * 0.2 + i))} rotation-z={i % 2 ? 0.6 : -0.7} rotation-x={0.25} />)}
      {/* the mask at the top and the wafer stage at the bottom */}
      <group position={[MASK[0], MASK[1] + 0.25, 0]}>
        <Block size={[1.6, 0.12, 1.6]} radius={0.03} material={mat("silicon", "#333866", { emissive: EUV, emissiveIntensity: 0.05 + 0.7 * q(mask) })} />
        {has("pattern") && Array.from({ length: 6 }, (_, i) => <mesh key={i} position={[-0.6 + i * 0.24, -0.07, 0]} material={glow(TECH.white, q(0.8 * k("pattern", 12)))}><boxGeometry args={[0.07, 0.01, 1.3]} /></mesh>)}
      </group>
      <group position={WAF}>
        <Block size={[2.2, 0.35, 1.8]} radius={0.05} preset="blackPlastic" position={[0, -0.4, 0]} />
        <mesh material={mat("silicon", "#3a3f7a", { iridescence: 1, emissive: EUV, emissiveIntensity: 0.05 + 0.5 * q(waf) })}><cylinderGeometry args={[0.8, 0.8, 0.04, 40]} /></mesh>
        {(has("finer") || has("switch") || has("wafer")) && Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} position={[-0.5 + i * (1 / 6), 0.03, 0]} material={glow(EUV, q(0.3 + 0.6 * waf))}><boxGeometry args={[0.06 - 0.035 * finer, 0.01, 1.0]} /></mesh>
        ))}
        {sw > 0.02 && <group position={[0, 0.03 + 0.5 * sw, 0.3]} scale={0.6 * sw}>
          <Block size={[0.8, 0.12, 0.6]} radius={0.02} preset="silicon" />
          <Block size={[0.2, 0.4, 0.62]} radius={0.04} material={mat("gate", undefined, { emissiveIntensity: 0.2 + q(Math.abs(Math.sin(f * 0.3))) })} position={[0, 0.25, 0]} />
        </group>}
      </group>
      {/* the light path */}
      {Array.from({ length: segs }, (_, i) => {
        const t = Math.max(0, Math.min(1, reach - i));
        if (t <= 0) return null;
        const a = PTS[i]!, e = i === 0 && has("blocked") ? lerpV(a, PTS[1]!, 0.7 * Math.min(1, t * 1.5)) : lerpV(a, PTS[i + 1]!, t);
        return <Beam key={i} a={a} b={e} r={0.05} color={EUV} o={(0.45 + 0.5 * Math.max(path, all)) * (i === 0 && has("blocked") ? 1 - 0.5 * blocked : 1)} />;
      })}
      {pulseP && <mesh position={pulseP} material={glow("#ffffff", 1)}><sphereGeometry args={[0.16, 12, 8]} /></mesh>}
      {/* a glass lens on the path, crossed out */}
      {has("lens") && <group position={lensPos}>
        <mesh rotation-z={Math.PI / 2} scale={[1, 0.25, 1]} material={mat("glass", "#bfe8ff", { opacity: 0.45 })}><sphereGeometry args={[0.6 * q(lensK), 24, 16]} /></mesh>
        {has("blocked") && <mesh material={glow("#ff7a2a", q(0.5 * blocked))}><sphereGeometry args={[0.25, 12, 8]} /></mesh>}
        {has("mirrors") && <><Beam a={[-0.6, -0.6, 0.4]} b={[-0.6 + 1.2 * k("mirrors", 10), -0.6 + 1.2 * k("mirrors", 10), 0.4]} r={0.05} color={TECH.pink} />
          <Beam a={[0.6, -0.6, 0.4]} b={[0.6 - 1.2 * k("mirrors", 10), -0.6 + 1.2 * k("mirrors", 10), 0.4]} r={0.05} color={TECH.pink} /></>}
      </group>}
      <Words b={b} pos={pos} px={46} />
    </Shot>
  );
};
export default Route;
