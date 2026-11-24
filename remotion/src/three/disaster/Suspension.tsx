// SuspensionBridge (2026-11-24, for v-20261124-41, the Tacoma Narrows Short): a two-tower suspension
// bridge whose main-span deck can bounce, twist and lose a section, plus the open-truss deck section
// that replaced solid plate girders.
//   - Spans along x, centred on the main span; the water / ground is y = 0, the deck at `deckY`.
//   - The main span is cut into `segments` deck pieces. Each piece sits at its own height and roll:
//       y(s) = deckY + bounce * sin(π·s·waves) and roll(s) = twist * sin(2π·s)  (s = 0..1 along the span),
//     so `twist` draws the one-node torsional mode (the two halves rolling opposite ways, the centre line
//     still) and `bounce` the up-and-down "galloping". `phase` (radians) runs both through a cycle.
//   - `girder`: "plate" (solid steel side plates, the 1940 deck) or "truss" (an open stiffening truss).
//   - `hot` 0..1 paints the deck and hangers along the stress ramp where they roll most (grey → amber → red).
//   - `gap` [s0, s1] removes that stretch of the main-span deck; `fall` 0..1 drops it (it tilts as it goes)
//     and its hangers go; `sway` swings the deck stubs either side of a gap.
//   - `DeckSection`: one deck slice in cross-section scale (plate or truss), for close shots and the
//     replacement bridge.
// Pure functions of their props: no clocks, no Math.random.
import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import type { V3 } from "../core";
import { Member } from "./Structures";
import { rampColor, useDLook } from "./look";

type Group = ThreeElements["group"];
const sh = { castShadow: true, receiveShadow: true } as const;

/** A ramp colour as a hex string, quantised to 8 steps so the material cache stays small. */
const rampHex = (v: number) => `#${rampColor(Math.round(Math.max(0, Math.min(1, v)) * 8) / 8).getHexString()}`;

export type SuspensionBridgeProps = Group & {
  mainSpan?: number;
  sideSpan?: number;
  deckY?: number;
  towerH?: number;
  width?: number;
  segments?: number;
  girder?: "plate" | "truss";
  /** torsion amplitude (radians) of the one-node twist */
  twist?: number;
  /** vertical amplitude of the galloping wave (world units) and its half-waves along the span */
  bounce?: number;
  waves?: number;
  /** radians: runs the twist and the bounce through their cycle */
  phase?: number;
  /** 0..1 stress paint where the deck rolls most */
  hot?: number;
  /** the stretch of the main span (0..1) that breaks out, and how far it has fallen 0..1 */
  gap?: [number, number];
  fall?: number;
  /** extra roll (radians) of the stubs beside a gap */
  sway?: number;
  /** paint colours */
  colors?: { steel?: string; deck?: string; concrete?: string; cable?: string };
  /** cars on the deck: positions along the whole bridge (-1..1 of its length) */
  cars?: number[];
};

/** Deck height and roll at s (0..1) along the main span. */
export function deckPose(s: number, o: { deckY?: number; twist?: number; bounce?: number; waves?: number; phase?: number } = {}) {
  const { deckY = 1.95, twist = 0, bounce = 0, waves = 2, phase = 0 } = o;
  const env = Math.sin(Math.PI * s);
  return {
    y: deckY + bounce * Math.sin(Math.PI * s * waves) * Math.cos(phase),
    roll: twist * Math.sin(2 * Math.PI * s) * Math.sin(phase) * (0.35 + 0.65 * env),
  };
}

/** One slice of deck (length `len` along x, origin at its centre, roadway top at y = 0). */
export const DeckSection: React.FC<Group & { len: number; width: number; girder: "plate" | "truss"; steel: THREE.Material; deck: THREE.Material; depth?: number; car?: boolean }> = ({
  len, width, girder, steel, deck, depth, car, ...g
}) => {
  const d = depth ?? (girder === "plate" ? width * 0.2 : width * 0.62);
  const L = len * 1.002;
  return (
    <group {...g}>
      <mesh position={[0, -0.012, 0]} material={deck} {...sh}><boxGeometry args={[L, 0.024, width]} /></mesh>
      {[-1, 1].map((s) => (
        <mesh key={`r${s}`} position={[0, 0.02, s * (width / 2 - 0.006)]} material={steel} {...sh}><boxGeometry args={[L, 0.016, 0.008]} /></mesh>
      ))}
      {girder === "plate" ? (
        [-1, 1].map((s) => (
          <group key={s} position={[0, -d / 2, s * width / 2]}>
            <mesh material={steel} {...sh}><boxGeometry args={[L, d, 0.012]} /></mesh>
            <mesh position={[0, -d / 2, 0]} material={steel} {...sh}><boxGeometry args={[L, 0.012, 0.05]} /></mesh>
            <mesh position={[0, d / 2 - 0.006, 0]} material={steel} {...sh}><boxGeometry args={[L, 0.012, 0.05]} /></mesh>
          </group>
        ))
      ) : (
        <>
          {[-1, 1].map((s) => (
            <group key={s} position={[0, 0, s * width / 2]}>
              <Member a={[-len / 2, -0.02, 0]} b={[len / 2, -0.02, 0]} t={0.022} material={steel} />
              <Member a={[-len / 2, -d, 0]} b={[len / 2, -d, 0]} t={0.022} material={steel} />
              <Member a={[-len / 2, -0.02, 0]} b={[len / 2, -d, 0]} t={0.014} material={steel} />
              <Member a={[len / 2, -0.02, 0]} b={[len / 2, -d, 0]} t={0.012} material={steel} />
            </group>
          ))}
          <Member a={[0, -d, -width / 2]} b={[0, -d, width / 2]} t={0.012} material={steel} />
          <Member a={[-len / 2, -d, -width / 2]} b={[len / 2, -d, width / 2]} t={0.01} material={steel} />
        </>
      )}
      {car ? (
        <group position={[0, 0.03, -width * 0.2]}>
          <mesh material={steel} {...sh}><boxGeometry args={[0.16, 0.05, 0.07]} /></mesh>
          <mesh position={[-0.01, 0.04, 0]} material={steel} {...sh}><boxGeometry args={[0.09, 0.04, 0.065]} /></mesh>
        </group>
      ) : null}
    </group>
  );
};

const Tower: React.FC<{ x: number; h: number; w: number; mat: THREE.Material; base: THREE.Material }> = ({ x, h, w, mat, base }) => (
  <group position={[x, 0, 0]}>
    <mesh position={[0, 0.25, 0]} material={base} {...sh}><boxGeometry args={[0.5, 0.5, w * 1.9]} /></mesh>
    {[-1, 1].map((s) => (
      <group key={s} position={[0, 0, s * w * 0.62]}>
        <mesh position={[0, h / 2, 0]} material={mat} {...sh}><boxGeometry args={[0.16, h, 0.13]} /></mesh>
        <mesh position={[0, h * 0.25, 0]} material={mat} {...sh}><boxGeometry args={[0.2, h * 0.5, 0.16]} /></mesh>
        <mesh position={[0, h + 0.03, 0]} material={mat} {...sh}><boxGeometry args={[0.26, 0.08, 0.2]} /></mesh>
      </group>
    ))}
    {[0.98, 0.72, 0.45].map((k) => (
      <mesh key={k} position={[0, h * k, 0]} material={mat} {...sh}><boxGeometry args={[0.12, 0.14, w * 1.24]} /></mesh>
    ))}
    {[0.72, 0.45].map((k) => (
      <group key={`x${k}`}>
        <Member a={[0, h * k, -w * 0.6]} b={[0, h * (k + 0.26), w * 0.6]} t={0.05} material={mat} />
        <Member a={[0, h * k, w * 0.6]} b={[0, h * (k + 0.26), -w * 0.6]} t={0.05} material={mat} />
      </group>
    ))}
  </group>
);

export const SuspensionBridge: React.FC<SuspensionBridgeProps> = ({
  mainSpan = 28, sideSpan = 11, deckY = 1.95, towerH = 4.25, width = 0.4, segments = 48, girder = "plate",
  twist = 0, bounce = 0, waves = 2, phase = 0, hot = 0, gap, fall = 0, sway = 0, colors = {}, cars = [], ...g
}) => {
  const { paint } = useDLook();
  const cl = { steel: "#5d7466", deck: "#3c4043", concrete: "#9c978c", cable: "#4c5a52", ...colors };
  const steel = paint("steel", cl.steel), deck = paint("concrete", cl.deck), concrete = paint("concrete", cl.concrete), cable = paint("steel", cl.cable);
  const half = mainSpan / 2, seg = mainSpan / segments;
  const sag = towerH - deckY - 0.12;
  const zc = width * 0.62;
  const cableY = (x: number) => {
    if (Math.abs(x) <= half) return towerH - sag * (1 - (x / half) ** 2);
    const u = (Math.abs(x) - half) / sideSpan;
    return towerH - (towerH - deckY - 0.6) * u - 0.35 * Math.sin(Math.PI * u);
  };
  const pose = (s: number) => deckPose(s, { deckY, twist, bounce, waves, phase });
  const inGap = (s: number) => !!gap && s >= gap[0] && s <= gap[1];
  const nearGap = (s: number) => (gap ? Math.max(0, 1 - Math.min(Math.abs(s - gap[0]), Math.abs(s - gap[1])) * 6) : 0);
  const cablePts = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i <= 64; i++) pts.push(-half - sideSpan + (i / 64) * (mainSpan + 2 * sideSpan));
    return pts;
  }, [half, sideSpan, mainSpan]);
  const carSet = new Set(cars.map((c) => Math.round(((c + 1) / 2) * (segments - 1))));
  const fallen = (i: number, s: number) => {
    const p = pose(s);
    const k = fall * fall;
    return { y: p.y - k * (deckY + 0.6), roll: p.roll + k * 0.9 * (s - 0.5 > 0 ? 1 : -1), pitch: k * 0.25 * Math.sin(i) };
  };
  return (
    <group {...g}>
      {/* anchorages and side-span piers */}
      {[-1, 1].map((s) => (
        <group key={`a${s}`}>
          <mesh position={[s * (half + sideSpan + 0.6), deckY / 2, 0]} material={concrete} {...sh}><boxGeometry args={[1.6, deckY + 0.3, width * 2.4]} /></mesh>
          <mesh position={[s * (half + sideSpan * 0.5), deckY / 2, 0]} material={concrete} {...sh}><boxGeometry args={[0.18, deckY, width * 0.9]} /></mesh>
        </group>
      ))}
      <Tower x={-half} h={towerH} w={width} mat={steel} base={concrete} />
      <Tower x={half} h={towerH} w={width} mat={steel} base={concrete} />
      {/* main cables, both sides */}
      {[-1, 1].map((side) =>
        cablePts.slice(0, -1).map((x, i) => {
          const x2 = cablePts[i + 1]!;
          return <Member key={`c${side}${i}`} a={[x, cableY(x), side * zc]} b={[x2, cableY(x2), side * zc]} t={0.05} material={cable} />;
        }),
      )}
      {/* side-span decks (steady) */}
      {[-1, 1].map((s) => (
        <DeckSection key={`sd${s}`} position={[s * (half + sideSpan / 2), deckY, 0]} len={sideSpan} width={width} girder={girder} steel={steel} deck={deck} />
      ))}
      {/* the main span, segment by segment */}
      {Array.from({ length: segments }, (_, i) => {
        const s = (i + 0.5) / segments;
        const x = -half + (i + 0.5) * seg;
        const p = pose(s);
        const roll = p.roll + sway * nearGap(s) * Math.sin(phase * 1.3);
        const heat = hot * Math.abs(Math.sin(2 * Math.PI * s)) * (0.4 + 0.6 * Math.sin(Math.PI * s));
        const sMat = heat > 0.06 ? paint("steel", rampHex(heat)) : steel;
        const gone = inGap(s);
        if (gone && fall >= 1) return null;
        const f = gone ? fallen(i, s) : null;
        const hangers = gone && fall > 0 ? null : [-1, 1].map((side) => {
          const ez = side * (width / 2) * Math.cos(roll), ey = side * (width / 2) * Math.sin(roll);
          const top: V3 = [x, cableY(x), side * zc];
          return <Member key={`h${side}`} a={[x, p.y + ey + 0.02, ez]} b={top} t={0.012} material={heat > 0.4 ? sMat : cable} />;
        });
        return (
          <group key={i}>
            {hangers}
            <group position={[x, f ? f.y : p.y, 0]} rotation={[f ? f.roll : roll, 0, f ? f.pitch : 0]}>
              <DeckSection len={seg} width={width} girder={girder} steel={sMat} deck={deck} car={carSet.has(i)} />
            </group>
          </group>
        );
      })}
    </group>
  );
};
