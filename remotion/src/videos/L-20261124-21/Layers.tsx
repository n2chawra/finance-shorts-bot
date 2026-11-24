// Layers: a slice through the wafer's surface. In the process shots, resist stripes on silicon are exposed,
// washed away into a stencil, the gaps etched and filled with copper, the resist stripped and a fresh layer
// coated. In the structure shots, rows of transistors sit at the bottom and layer after layer of copper
// wiring stacks above them, the finest layers violet (EUV), the coarser ones amber (older machines).
// Actions (params.moments[].do): block, exposed, slide, rinse, develop, stencil, gaps, etch, trench, fill,
// metal, strip, coat, recoat, transistors, glowlow, fins, gate, on, off, question, wires, stack, signals,
// tower, fine, coarse, older, longwave, settle, dense, trip, flash, glint, align.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, FinFET, glow, mat, TECH, type V3 } from "../../three/index";
import { Ask, Beam, DotGrid, EUV, LAB, q, Shot, useBeat, Wave, Words, type Anchor } from "./kit";

const W = 6, SUB = 0.9, RES = 0.18, NS = 7;
const AMBER = "#ffb347";

const Layers: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const process = has("block") || has("stencil") || has("metal") || has("exposed");
  // ---- process
  const slide = has("slide") ? (has("strip") || has("coat") ? 1.6 * (1 - k("slide", 20)) : 1.6 * k("slide", 20)) : 0;
  const exposed = Math.max(k("exposed", 12), has("rinse") || has("develop") ? 1 : 0) * (has("strip") && has("exposed") && f < at("exposed") ? 0 : 1);
  const develop = Math.max(k("develop", 18), has("stencil") || has("etch") || has("gaps") ? 1 : 0) * (has("strip") ? 0 : 1);
  const etch = Math.max(k("etch", 20), k("trench", 20), has("fill") || has("metal") ? 1 : 0);
  const deep = 0.25 + 0.25 * k("trench", 20);
  const fill = Math.max(k("fill", 20), has("metal") && !has("fill") ? 1 : 0);
  const strip = k("strip", 18);
  const coat = k("coat", 18);
  const recoat = k("recoat", 18);
  const stripeW = W / (NS * 2);
  // in the strip beat the new exposed stripes light only on "exposed"
  const newExp = has("strip") ? k("exposed", 12) : 0;
  const top = SUB + RES;
  // ---- structure
  const tran = Math.max(k("transistors", 10), has("wires") || has("tower") || has("settle") ? 1 : 0);
  const levels = has("tower") || has("settle") ? 9 : has("wires") ? Math.round(1 + 8 * Math.max(k("stack", 40), 0.12 * k("wires", 10))) * (k("wires", 10) > 0.05 ? 1 : 0) : 0;
  const fine = Math.max(k("fine", 14), has("settle") ? 1 : 0);
  const coarse = Math.max(k("coarse", 14), has("settle") ? 1 : 0);
  const gate = has("on") && f >= at("on") && !(has("off") && f >= at("off")) ? 1 : k("gate", 10) * 0.5;
  const current = has("on") && f >= at("on") && !(has("off") && f >= at("off")) ? 1 : 0;
  const flash = has("flash") ? Math.max(0, 1 - Math.abs(f - at("flash") - 3) / 6) : 0;
  const anchors: Record<string, Anchor> = {
    block: { look: [slide, SUB * 0.6 + 0.4, 0], dir: [0.35, 0.35, 1], d: 5.6 },
    top: { look: [slide, top, 0], dir: [0.25, 0.3, 1], d: 3.6 },
    bottom: { look: [0, 0.7, 0], dir: [0.4, 0.35, 1], d: 4.4 },
    wires: { look: [0, 2.4, 0], dir: [0.4, 0.25, 1], d: 6.4 },
    all: { look: [0, 2.2, 0], dir: [0.45, 0.3, 1], d: 10 },
  };
  const pos = (on: string): V3 => on === "top" ? [slide - 1.6, top + 0.6, 0.8] : on === "bottom" ? [-2.6, 1.6, 0.8] : on === "wires" ? [-3.2, 3.6, 0.8] : [-2.4, 3, 0.8];
  return (
    <Shot p={p} b={b} anchors={anchors} seed="layers" backdrop={LAB} floor="reflect" bloom={1.2} dust={{ c: [0, 2, 0], r0: 6, r1: 16, size: 0.55, color: "#b9a2ff" }}>
      <mesh position={[0, 3, -3]} material={mat("brushed", "#1b1d27", { roughness: 0.55 })}><planeGeometry args={[30, 12]} /></mesh>
      <DotGrid x0={-14} x1={14} y0={-1} y1={8} z={-2.95} gap={0.32} size={0.14} color="#a9aed2" />
      {process && <group position={[slide, 0, 0]}>
        {/* the silicon, with its trenches */}
        <Block size={[W, SUB, 2]} radius={0.03} preset="silicon" position={[0, SUB / 2, 0]} />
        {Array.from({ length: 8 }, (_, i) => <mesh key={`c${i}`} position={[0, 0.08 + i * 0.1, 1.005]} material={mat("clay", "#4a4f8a")}><boxGeometry args={[W * 0.98, 0.012, 0.01]} /></mesh>)}
        {Array.from({ length: NS }, (_, i) => {
          const x = -W / 2 + stripeW * (2 * i + 1.5);
          return (
            <group key={i}>
              {etch > 0.02 && <mesh position={[x, SUB - (deep * etch) / 2 + 0.005, 0]} material={mat("clay", "#07080e")}><boxGeometry args={[stripeW * 0.98, deep * etch, 2.01]} /></mesh>}
              {fill > 0.02 && <mesh position={[x, SUB - deep + (deep * fill) / 2, 0]} material={mat("copper", undefined, { emissive: "#ff8a3a", emissiveIntensity: 0.15 })}><boxGeometry args={[stripeW * 0.96, deep * fill, 2.02]} /></mesh>}
            </group>
          );
        })}
        {/* the resist stripes: the exposed ones wash away */}
        {Array.from({ length: NS * 2 }, (_, i) => {
          const x = -W / 2 + stripeW * (i + 0.5);
          const isExp = i % 2 === 1;
          if (isExp && develop > 0.98) return null;
          const lifted = !isExp ? strip : 0;
          const o = !isExp && strip > 0.98 ? 0 : 1;
          if (o === 0 && !has("recoat")) return null;
          return (
            <Block key={i} size={[stripeW * 0.99, RES * (isExp ? 1 - develop : 1), 2]} radius={0.005}
              material={isExp && exposed > 0.3 ? glow(AMBER, q(0.55 + 0.3 * exposed)) : mat("oxide", "#d58a3a", { opacity: 0.7 })}
              position={[x, SUB + (RES * (isExp ? 1 - develop : 1)) / 2 + 0.8 * lifted, 0]} />
          );
        })}
        {coat > 0.02 && <Block size={[W, 0.2 * coat, 2]} radius={0.01} material={mat("glass", "#d6e4ff", { opacity: 0.55 })} position={[0, SUB + 0.1 * coat, 0]} />}
        {recoat > 0.02 && Array.from({ length: NS * 2 }, (_, i) => (
          <Block key={`r${i}`} size={[stripeW * 0.99, RES, 2]} radius={0.005} position={[-W / 2 + stripeW * (i + 0.5), SUB + 0.2 + RES / 2 + 1.2 * (1 - recoat), 0]}
            material={i % 2 && newExp > 0.3 ? glow(AMBER, 0.8) : mat("oxide", "#d58a3a", { opacity: 0.7 })} />
        ))}
        {has("align") && <group position={[0, top + 0.05 + 0.6 * (1 - k("align", 14)), 0.4]}>
          <mesh rotation-x={-Math.PI / 2} material={glow(TECH.amber, q(0.9 * k("align", 10)))}><ringGeometry args={[0.3, 0.34, 32]} /></mesh>
          <Beam a={[-0.6, 0, 0]} b={[0.6, 0, 0]} r={0.015} color={TECH.amber} o={0.9} />
          <Beam a={[0, 0, -0.6]} b={[0, 0, 0.6]} r={0.015} color={TECH.amber} o={0.9} />
        </group>}
        {has("rinse") && k("rinse", 30) < 1 && <mesh position={[-W / 2 + W * k("rinse", 30), top + 0.3, 0]} material={glow("#9fd8ff", 0.5)}><sphereGeometry args={[0.35, 14, 10]} /></mesh>}
        {has("gaps") && Array.from({ length: NS }, (_, i) => (
          <mesh key={`g${i}`} position={[-W / 2 + stripeW * (2 * i + 1.5), top + 0.02, 0]} rotation-x={-Math.PI / 2} material={glow(TECH.cyan, q(0.6 * k("gaps", 10)))}><planeGeometry args={[stripeW * 0.9, 1.9]} /></mesh>
        ))}
        {(has("exposed") || has("slide")) && <mesh position={[0, top + 2.4, 0]} material={glow(EUV, q(0.12 + 0.2 * Math.max(exposed, newExp) * (1 - 0.8 * (slide / 1.6))))}><boxGeometry args={[W, 4.4, 0.05]} /></mesh>}
      </group>}
      {!process && <group>
        {/* the silicon and the transistors */}
        <Block size={[W + 1, 0.4, 3]} radius={0.03} preset="silicon" position={[0, 0.2, 0]} />
        {tran > 0.02 && Array.from({ length: 4 }, (_, i) => (
          <group key={i} position={[-2.4 + i * 1.6, 0.4, 0]} scale={0.38 * (0.6 + 0.4 * q(Math.max(tran, k("fins", 12))))}>
            <FinFET n={3} length={2.4} gateOn={i === 1 ? gate : 0.1 + 0.4 * k("glowlow", 12)} />
          </group>
        ))}
        {current > 0 && [0, 1, 2].map((i) => <mesh key={i} position={[-0.8, 0.62, -0.5 + (((f / 20) + i / 3) % 1)]} material={glow(TECH.cyan, 0.9)}><sphereGeometry args={[0.05, 8, 6]} /></mesh>)}
        {/* the wiring layers */}
        {Array.from({ length: levels }, (_, li) => {
          const y = 1.1 + li * 0.42;
          const n = li < 3 ? 12 : li < 6 ? 7 : 4;
          const color = li < 3 && fine > 0.3 ? EUV : li >= 3 && coarse > 0.3 ? AMBER : "#e08a4b";
          const dense = li < 3 ? 1 + 0.3 * k("dense", 12) : 1;
          return (
            <group key={li} position={[0, y, 0]}>
              <Block size={[W + 0.6, 0.06, 2.6]} radius={0.01} material={mat("glass", "#d6e4ff", { opacity: 0.12 })} />
              {Array.from({ length: n }, (_, j) => {
                const span = (W - 0.4) / n;
                return li % 2
                  ? <mesh key={j} position={[0, 0.08, -1.1 + (2.2 / n) * (j + 0.5)]} material={color === "#e08a4b" ? mat("copper") : glow(color, 0.75)}><boxGeometry args={[W - 0.4, 0.07, (2.2 / n) * 0.4 / dense]} /></mesh>
                  : <mesh key={j} position={[-W / 2 + 0.2 + span * (j + 0.5), 0.08, 0]} material={color === "#e08a4b" ? mat("copper") : glow(color, 0.75)}><boxGeometry args={[span * 0.4 / dense, 0.07, 2.2]} /></mesh>;
              })}
            </group>
          );
        })}
        {has("signals") && levels > 1 && Array.from({ length: 6 }, (_, i) => {
          const t = ((f - at("signals")) / 30 + i / 6) % 1, li = i % Math.max(1, levels);
          return <mesh key={i} position={[-W / 2 + W * t, 1.2 + li * 0.42, i % 2 ? 0.5 : -0.5]} material={glow("#ffffff", 0.95)}><sphereGeometry args={[0.07, 8, 6]} /></mesh>;
        })}
        {has("older") && <mesh position={[0, 6.5, 0]} material={glow(AMBER, q(0.18 * k("older", 14)))}><boxGeometry args={[W, 4, 0.4]} /></mesh>}
        {has("longwave") && <Wave position={[0, 0, 0.4]} rotation-z={Math.PI / 2} x0={4.6} x1={8.4} lambda={0.9} amp={0.35} k={k("longwave", 18)} color={AMBER} phase={f * 0.15} />}
        {has("trip") && <Beam a={[0, 8, 0.2]} b={[0, 8 - (8 - 1.2) * k("trip", 16), 0.2]} r={0.07} color={EUV} o={0.9} />}
        {flash > 0.02 && <mesh position={[0, 8, 0.2]} material={glow("#ffffff", q(flash))}><sphereGeometry args={[0.3 + 0.4 * flash, 12, 8]} /></mesh>}
        {has("glint") && [0, 1, 2].map((i) => <mesh key={i} position={[0, 7.2 - i * 1.8, 0.25]} material={glow("#e6dcff", q(0.8 * k("glint", 10) * Math.abs(Math.sin(f * 0.2 + i))))}><boxGeometry args={[0.6, 0.04, 0.04]} /></mesh>)}
      </group>}
      <Ask b={b} at={[1.6, 1.9, 0.8]} />
      <Words b={b} pos={pos} signAt={() => [-W / 2 + 0.6, SUB + 2.6, 0.4]} signH={0.42} />
    </Shot>
  );
};
export default Layers;
