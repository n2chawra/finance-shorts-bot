// Operation3D and GearTrain: show a step of a machine happening, not its result appearing (owner,
// 2026-11-27, on How Tech Works' L-20261127-21: "I have to hear things properly to understand rather than
// seeing"; director.md rule 13). Everything is a pure function of the frame.
import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { clamp01, cue, lerp3, TECH, type V3 } from "./core";
import { glow, mat } from "./Proc";
import { SignalPath } from "./SignalPath";

export type OperationProps = {
  /** the thing that goes in (a token card, a number tile, a photon) */
  input: React.ReactNode;
  /** the thing that comes out, changed (the product, the chosen word, the score column) */
  output: React.ReactNode;
  /** the part that acts; drawn from `act` 0..1 (the press, the spin, the rows lighting) */
  machine: (act: number) => React.ReactNode;
  /** where the input starts, where the machine sits, where the output ends */
  from: V3;
  at: V3;
  to: V3;
  /** frames (local to the beat): the input sets off, the machine acts, the output leaves */
  inAt: number;
  actAt: number;
  outAt: number;
  /** frames the machine's act lasts (default 18) */
  actFor?: number;
  /** the input stays faintly where it came from, so input and output share the frame (default true) */
  ghost?: boolean;
  /** draw the route from → at → to as a glowing track (default true) */
  track?: boolean;
  color?: string;
};

/** Input → the part that acts → output, in one frame. The input travels into the machine and shrinks into it,
 * the machine acts (`act` rises 0→1 and falls back), and the output springs out on the far side and stays. */
export const Operation3D: React.FC<OperationProps> = ({
  input, output, machine, from, at, to, inAt, actAt, outAt, actFor = 18, ghost = true, track = true, color = TECH.cyan,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const travel = cue(frame, inAt, Math.max(1, actAt - inAt));
  const swallow = 1 - cue(frame, actAt - 6, 8);
  const act = frame < actAt ? 0 : Math.sin(Math.PI * clamp01((frame - actAt) / actFor));
  const out = spring({ frame: frame - outAt, fps, config: { damping: 15, stiffness: 110 } });
  const leave = cue(frame, outAt, 22);
  const inPos = lerp3(from, at, travel);
  return (
    <group>
      {track && <SignalPath points={[from, at, to]} straight color={color} start={inAt - 8} draw={14} pulses={0} radius={0.018} />}
      {ghost && frame >= inAt && <group position={from} scale={0.75}>{input}</group>}
      {swallow > 0.01 && <group position={inPos} scale={Math.max(0.01, swallow)}>{input}</group>}
      <group position={at}>{machine(act)}</group>
      {frame >= outAt && <group position={lerp3(at, to, leave)} scale={Math.max(0.01, out)}>{output}</group>}
    </group>
  );
};

/** A press: a block that comes down on the act and glows as it lands. A ready-made `machine`. */
export const Press3D: React.FC<{ act: number; w?: number; color?: string }> = ({ act, w = 1, color = TECH.amber }) => (
  <group>
    <mesh position={[0, 0.9 - 0.45 * act, 0]} material={mat("brushed")} castShadow>
      <boxGeometry args={[w, 0.25, w]} />
    </mesh>
    <mesh position={[0, 0.9 - 0.45 * act - 0.14, 0]} material={act > 0.6 ? glow(color) : mat("brushed")}>
      <boxGeometry args={[w * 0.9, 0.03, w * 0.9]} />
    </mesh>
    <mesh position={[0, -0.06, 0]} material={mat("brushed")} receiveShadow>
      <boxGeometry args={[w * 1.2, 0.12, w * 1.2]} />
    </mesh>
  </group>
);

export type Gear = {
  /** pitch radius (world units) */
  r: number;
  /** direction from the gear before it, degrees (0 = +x, 90 = up); ignored for the first */
  angle?: number;
  color?: string;
  /** glow this gear (the one the line names) */
  hot?: boolean;
};

export type GearTrainProps = {
  gears: Gear[];
  /** where the first gear's centre sits; the others mesh outward from it */
  at?: V3;
  /** turns a second of the first gear once up to speed */
  speed?: number;
  /** frame the first gear starts turning, and the frames it takes to reach speed */
  start?: number;
  ramp?: number;
  /** teeth per unit of radius (the same on every gear, so they mesh) */
  density?: number;
  thickness?: number;
};

const shapeCache = new Map<string, THREE.ExtrudeGeometry>();
function gearGeometry(r: number, n: number, thick: number): THREE.ExtrudeGeometry {
  const key = `${r.toFixed(3)}|${n}|${thick}`;
  const hit = shapeCache.get(key);
  if (hit) return hit;
  const p = (2 * Math.PI) / n, h = Math.min(0.6 * r * p, r * 0.25), root = r - h / 2, tip = r + h / 2;
  const pt = (rad: number, a: number) => new THREE.Vector2(rad * Math.cos(a), rad * Math.sin(a));
  const pts: THREE.Vector2[] = [];
  for (let k = 0; k < n; k++) {
    const a = k * p;
    pts.push(pt(root, a - 0.5 * p), pt(root, a - 0.28 * p), pt(tip, a - 0.14 * p), pt(tip, a + 0.14 * p), pt(root, a + 0.28 * p));
  }
  const shape = new THREE.Shape(pts);
  const hole = new THREE.Path();
  hole.absarc(0, 0, Math.max(0.05, r * 0.18), 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(shape, { depth: thick, bevelEnabled: true, bevelSize: thick * 0.15, bevelThickness: thick * 0.15, bevelSegments: 1, curveSegments: 6 });
  g.translate(0, 0, -thick / 2);
  shapeCache.set(key, g);
  return g;
}

/** Teeth and turn angle of each gear at a given first-gear angle: meshing gears turn the other way at the
 * ratio of their teeth, phased so a tooth always sits in the other's gap. Exported for tests. */
export function gearPoses(gears: Gear[], at: V3, phi0: number, density = 14): { pos: V3; n: number; phi: number }[] {
  const out: { pos: V3; n: number; phi: number }[] = [];
  gears.forEach((g, i) => {
    const n = Math.max(6, Math.round(g.r * density));
    if (i === 0) {
      out.push({ pos: at, n, phi: phi0 });
      return;
    }
    const prev = out[i - 1]!, pr = gears[i - 1]!.r;
    const th = ((g.angle ?? 0) * Math.PI) / 180;
    const pos: V3 = [prev.pos[0] + (pr + g.r) * Math.cos(th), prev.pos[1] + (pr + g.r) * Math.sin(th), prev.pos[2]];
    const phi = th + Math.PI - Math.PI / n + (prev.n / n) * (th - prev.phi);
    out.push({ pos, n, phi });
  });
  return out;
}

/** Gears that push each other in order: the first turns, each next one turns the other way at the ratio of
 * the teeth. Faces the camera along z. */
export const GearTrain: React.FC<GearTrainProps> = ({ gears, at = [0, 0, 0], speed = 0.25, start = 0, ramp = 20, density = 14, thickness = 0.2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = Math.max(0, frame - start);
  const eff = ramp > 0 && t < ramp ? (t * t) / (2 * ramp) : t - ramp / 2;   // a smooth spin-up
  const phi0 = (2 * Math.PI * speed * eff) / fps;
  return (
    <group>
      {gearPoses(gears, at, phi0, density).map((g, i) => (
        <mesh key={i} position={g.pos} rotation-z={g.phi} geometry={gearGeometry(gears[i]!.r, g.n, thickness)}
          material={gears[i]!.hot ? glow(gears[i]!.color ?? TECH.amber) : mat("brushed", gears[i]!.color)} castShadow receiveShadow />
      ))}
    </group>
  );
};
