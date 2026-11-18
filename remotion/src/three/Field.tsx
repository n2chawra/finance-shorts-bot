// Scale tools. InstancedField: thousands of identical things (transistors, memory cells, servers seen
// from far) in one draw call, revealed from a point and swept by a glowing wave. ScaleCompare: a
// thing beside a familiar object at true relative size (a coin, a card, a hair, a grain of rice, a
// person, a red blood cell), with a "not to scale" escape when one would vanish.
import type { ThreeElements } from "@react-three/fiber";
import React, { useLayoutEffect, useMemo } from "react";
import { Easing, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { clamp01, cue, rnd, TECH } from "./core";
import { Label3D } from "./Label3D";
import { mat } from "./Proc";

type Group = ThreeElements["group"];

export type FieldShape = "transistor" | "cell" | "box";

export type InstancedFieldProps = Group & {
  /** cells along x and z */
  cols: number;
  rows: number;
  spacing?: number;
  shape?: FieldShape;
  /** frame the field starts appearing from the centre (or `from`), and how long until all are in */
  start?: number;
  reveal?: number;
  /** a glowing wave sweeping across: speed in cells per second (0 = none) and its colour */
  wave?: number;
  waveColor?: string;
  /** cells that glow on their own (indices) */
  pick?: number[];
  pickColor?: string;
  seed?: string;
  color?: string;
};

/** A field of `cols × rows` instances. Base geometry + a glow layer (the transistor's gate, the
 * cell's top) whose colour each frame comes from the reveal, the wave and the picks. */
export const InstancedField: React.FC<InstancedFieldProps> = ({
  cols, rows, spacing = 0.3, shape = "transistor", start = 0, reveal = 30, wave = 12, waveColor = TECH.cyan,
  pick = [], pickColor = TECH.amber, seed = "field", color = "#4a5785", ...g
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = cols * rows;
  const { base, top } = useMemo(() => {
    const s = spacing;
    const geoBase = shape === "transistor" ? new THREE.BoxGeometry(s * 0.22, s * 0.5, s * 0.8)
      : shape === "cell" ? new THREE.BoxGeometry(s * 0.8, s * 0.12, s * 0.8) : new THREE.BoxGeometry(s * 0.7, s * 0.7, s * 0.7);
    const geoTop = shape === "transistor" ? new THREE.BoxGeometry(s * 0.6, s * 0.56, s * 0.18)
      : shape === "cell" ? new THREE.BoxGeometry(s * 0.5, s * 0.04, s * 0.5) : new THREE.BoxGeometry(s * 0.72, s * 0.04, s * 0.72);
    const b = new THREE.InstancedMesh(geoBase, mat("fin", color), n);
    const t = new THREE.InstancedMesh(geoTop, new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false }), n);
    b.castShadow = true; b.receiveShadow = true;
    return { base: b, top: t };
  }, [n, spacing, shape, color]);
  const dim = useMemo(() => new THREE.Color("#5a3a6a").multiplyScalar(0.45), []);
  const hot = useMemo(() => new THREE.Color(waveColor).multiplyScalar(2.6), [waveColor]);
  const pk = useMemo(() => new THREE.Color(pickColor).multiplyScalar(3), [pickColor]);
  const picked = useMemo(() => new Set(pick), [pick.join(",")]);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const c = useMemo(() => new THREE.Color(), []);
  useLayoutEffect(() => {
    const maxR = Math.hypot(cols / 2, rows / 2);
    const rr = cue(frame, start, reveal, Easing.out(Easing.cubic)) * (maxR + 2);
    const sec = (frame - start) / fps;
    for (let i = 0; i < n; i++) {
      const ix = i % cols, iz = Math.floor(i / cols);
      const x = (ix - (cols - 1) / 2) * spacing, z = (iz - (rows - 1) / 2) * spacing;
      const d = Math.hypot(ix - (cols - 1) / 2, iz - (rows - 1) / 2);
      const grow = clamp01((rr - d) / 2);
      const h = shape === "transistor" ? 1 : 0.9 + rnd(seed, i) * 0.2;
      const yBase = shape === "transistor" ? spacing * 0.25 : shape === "cell" ? spacing * 0.06 : spacing * 0.35;
      m.compose(new THREE.Vector3(x, yBase * grow, z), q, new THREE.Vector3(grow || 1e-4, (grow || 1e-4) * h, grow || 1e-4));
      base.setMatrixAt(i, m);
      const yTop = shape === "transistor" ? spacing * 0.28 : shape === "cell" ? spacing * 0.14 : spacing * 0.72;
      m.compose(new THREE.Vector3(x, yTop * grow, z), q, new THREE.Vector3(grow || 1e-4, grow || 1e-4, grow || 1e-4));
      top.setMatrixAt(i, m);
      // the wave: a diagonal band moving across, plus each cell's own seeded flicker
      const band = wave > 0 ? Math.max(0, 1 - Math.abs(((ix + iz) - sec * wave) % (cols + rows + 10)) / 2.5) : 0;
      const flick = rnd(`${seed}-f${i}`, Math.floor(frame / 4)) > 0.985 ? 0.8 : 0;
      if (picked.has(i)) c.copy(pk);
      else c.copy(dim).lerp(hot, Math.min(1, band + flick));
      top.setColorAt(i, c);
    }
    base.instanceMatrix.needsUpdate = true;
    top.instanceMatrix.needsUpdate = true;
    if (top.instanceColor) top.instanceColor.needsUpdate = true;
    base.computeBoundingSphere(); top.computeBoundingSphere();
  });
  return (
    <group {...g}>
      <primitive object={base} />
      <primitive object={top} />
    </group>
  );
};

/** Where cell `i` of a field sits, in the field's own space. */
export function fieldCellAt(i: number, cols: number, rows: number, spacing = 0.3): [number, number, number] {
  const ix = i % cols, iz = Math.floor(i / cols);
  return [(ix - (cols - 1) / 2) * spacing, spacing * 0.5, (iz - (rows - 1) / 2) * spacing];
}

// ---------------------------------------------------------------------- ScaleCompare

export type Familiar = "coin" | "card" | "hair" | "rice" | "person" | "bloodCell";

/** Real sizes (metres) of the familiar objects' measured dimension: a model property, not a figure
 * shown on screen (labels name the objects; any number shown comes from params.fig). */
const FAMILIAR: Record<Familiar, { size: number; name: string; top: number }> = {
  coin: { size: 0.024, name: "a coin", top: 0.08 },
  card: { size: 0.0856, name: "a bank card", top: 0.01 },
  hair: { size: 0.00007, name: "a human hair", top: 1 },
  rice: { size: 0.006, name: "a grain of rice", top: 0.34 },
  person: { size: 1.75, name: "a person", top: 1 },
  bloodCell: { size: 0.0000075, name: "a red blood cell", top: 0.3 },
};

/** A familiar object modelled at unit size along its measured dimension (diameter, width, height). */
const FamiliarModel: React.FC<{ kind: Familiar }> = ({ kind }) => {
  switch (kind) {
    case "coin": return <mesh position={[0, 0.04, 0]} material={mat("gold", "#e9b64c", { metalness: 0.8, roughness: 0.32 })} castShadow><cylinderGeometry args={[0.5, 0.5, 0.08, 64]} /></mesh>;
    case "card": return <mesh position={[0, 0.005, 0]} material={mat("glossy", "#1f3a8a")} castShadow><boxGeometry args={[1, 0.01, 0.63]} /></mesh>;
    case "hair": return <mesh position={[0, 0.5, 0]} rotation-x={Math.PI / 2} material={mat("white", "#3a2a1e", { roughness: 0.5 })} castShadow><cylinderGeometry args={[0.5, 0.5, 40, 24]} /></mesh>;
    case "rice": return <mesh position={[0, 0.17, 0]} scale={[0.5, 0.17, 0.2]} material={mat("clay", "#f3efe4")} castShadow><sphereGeometry args={[1, 24, 16]} /></mesh>;
    case "person": return (
      <group>
        <mesh position={[0, 0.42, 0]} material={mat("clay")} castShadow><capsuleGeometry args={[0.13, 0.5, 6, 16]} /></mesh>
        <mesh position={[0, 0.9, 0]} material={mat("clay")} castShadow><sphereGeometry args={[0.1, 24, 16]} /></mesh>
      </group>
    );
    case "bloodCell": return <mesh position={[0, 0.15, 0]} rotation-x={Math.PI / 2} scale={[1, 1, 0.6]} material={mat("white", "#c0262d", { roughness: 0.4, clearcoat: 0.6 })} castShadow><torusGeometry args={[0.32, 0.18, 24, 48]} /></mesh>;
  }
};

export type ScaleCompareProps = Group & {
  /** your thing, modelled at unit size along its measured dimension */
  thing: React.ReactNode;
  /** its measured dimension in metres (a model input from the script, not a printed figure) */
  thingSize: number;
  thingName: string;
  /** the thing's height as a fraction of its measured size (where its label's line lands) */
  thingTop?: number;
  familiar: Familiar;
  /** the larger of the two is shown this big (world units) */
  fit?: number;
  /** below this fraction of `fit`, the smaller one is enlarged to it (and the shot needs a "NOT TO SCALE" tag: see needsNotToScale) */
  minShown?: number;
  start?: number;
  gap?: number;
  px?: number;
};

/** True when ScaleCompare will have to enlarge the smaller object (show a <Tag kind="notToScale"/>). */
export function needsNotToScale(thingSize: number, familiar: Familiar, minShown = 0.04): boolean {
  const a = thingSize, b = FAMILIAR[familiar].size;
  return Math.min(a, b) / Math.max(a, b) < minShown;
}

export const ScaleCompare: React.FC<ScaleCompareProps> = ({ thing, thingSize, thingName, thingTop = 0.1, familiar, fit = 2, minShown = 0.04, start = 0, gap = 0.4, px = 46, ...g }) => {
  const frame = useCurrentFrame();
  const f = FAMILIAR[familiar];
  const big = Math.max(thingSize, f.size);
  const k = fit / big;
  const sThing = Math.max(thingSize * k, fit * minShown), sFam = Math.max(f.size * k, fit * minShown);
  const inT = cue(frame, start, 14, Easing.out(Easing.back(1.4)));
  const inF = cue(frame, start + 10, 14, Easing.out(Easing.back(1.4)));
  // side by side, the pair centred on the group's origin
  const span = sThing + gap + sFam;
  const xT = -span / 2 + sThing / 2, xF = span / 2 - sFam / 2;
  return (
    <group {...g}>
      <group position={[xT, 0, 0]} scale={sThing * inT || 1e-4}>{thing}</group>
      <group position={[xF, 0, 0]} scale={sFam * inF || 1e-4}><FamiliarModel kind={familiar} /></group>
      <Label3D at={[xT, sThing * thingTop, 0]} offset={[0, Math.max(0.5, sThing * 0.6), 0]} text={thingName} start={start + 16} px={px} align="center" />
      <Label3D at={[xF, sFam * f.top, 0]} offset={[0, Math.max(0.5, sFam * 0.6), 0]} text={f.name} start={start + 26} px={px} align="center" color={TECH.amber} />
    </group>
  );
};
