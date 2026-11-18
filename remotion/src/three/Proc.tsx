// Proc: procedural low-poly building blocks with clean, stylised PBR materials. Everything is made
// in code (no downloaded models): rounded boxes, a circuit board with traces, a chip package with
// pins, a silicon die with cores, transistor fins, wires, glass, a phone and its insides.
import { RoundedBox } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { rnd, TECH, type V3 } from "./core";

type Group = ThreeElements["group"];

/** Material presets. Shared instances: Cutaway and fades clone per mesh before changing them. */
type Preset = "pcb" | "pcbDark" | "copper" | "gold" | "silicon" | "siliconLit" | "aluminium" | "blackPlastic"
  | "ceramic" | "glass" | "screen" | "battery" | "gate" | "fin" | "oxide" | "rubber" | "white";

const SPECS: Record<Preset, THREE.MeshPhysicalMaterialParameters> = {
  pcb: { color: "#1f6b4a", roughness: 0.55, metalness: 0.05, clearcoat: 0.4, clearcoatRoughness: 0.3 },
  pcbDark: { color: "#13202e", roughness: 0.6, metalness: 0.05, clearcoat: 0.3 },
  copper: { color: "#e08a4b", roughness: 0.3, metalness: 1 },
  gold: { color: "#f2c45a", roughness: 0.22, metalness: 1 },
  silicon: { color: "#2b2f55", roughness: 0.18, metalness: 0.6, iridescence: 0.6, iridescenceIOR: 1.6 },
  siliconLit: { color: "#3a3f7a", roughness: 0.2, metalness: 0.4, emissive: TECH.violet, emissiveIntensity: 0.25 },
  aluminium: { color: "#c7ccd6", roughness: 0.32, metalness: 1 },
  blackPlastic: { color: "#1b1d24", roughness: 0.45, metalness: 0 },
  ceramic: { color: "#2a2d36", roughness: 0.35, metalness: 0.1, clearcoat: 0.6 },
  glass: { color: "#bfe8ff", roughness: 0.05, metalness: 0, transparent: true, opacity: 0.28, clearcoat: 1, depthWrite: false },
  screen: { color: "#05070f", roughness: 0.08, metalness: 0.2, emissive: "#2a6bff", emissiveIntensity: 0.55, clearcoat: 1 },
  battery: { color: "#30343f", roughness: 0.5, metalness: 0.3 },
  gate: { color: "#ff5d8f", roughness: 0.35, metalness: 0.2, emissive: "#ff2d6f", emissiveIntensity: 0.15 },
  fin: { color: "#7d8cff", roughness: 0.25, metalness: 0.3, emissive: TECH.violet, emissiveIntensity: 0.12 },
  oxide: { color: "#ffd36b", roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0.75 },
  rubber: { color: "#2b2b30", roughness: 0.9, metalness: 0 },
  white: { color: "#eef1f8", roughness: 0.4, metalness: 0 },
};

const cache = new Map<string, THREE.Material>();
/** A preset material, optionally recoloured: `mat("pcb")`, `mat("gold")`, `mat("white", "#ff0")`. */
export function mat(preset: Preset, color?: string, extra?: THREE.MeshPhysicalMaterialParameters): THREE.Material {
  const key = `${preset}|${color ?? ""}|${extra ? JSON.stringify(extra) : ""}`;
  let m = cache.get(key);
  if (!m) {
    m = new THREE.MeshPhysicalMaterial({ ...SPECS[preset], ...(color ? { color } : {}), ...extra });
    cache.set(key, m);
  }
  return m;
}

/** An unlit glowing material (tone mapping off so it stays bright). */
export function glow(color: string, opacity = 1): THREE.Material {
  return mat("white", color, { emissive: color, emissiveIntensity: 2.2, roughness: 1, metalness: 0, transparent: opacity < 1, opacity });
}

const shadowProps = { castShadow: true, receiveShadow: true } as const;

export type BlockProps = Group & { size: V3; radius?: number; material?: THREE.Material; preset?: Preset; color?: string };
/** A rounded box: the basic block of every model. */
export const Block: React.FC<BlockProps> = ({ size, radius = 0.04, material, preset = "white", color, ...g }) => (
  <group {...g}>
    <RoundedBox args={size} radius={Math.min(radius, Math.min(...size) / 2 - 1e-4)} smoothness={3} {...shadowProps}
      material={material ?? mat(preset, color)} />
  </group>
);

/** A circuit board: a slab, copper traces and pads laid out from a seed (same seed, same board). */
export const Board: React.FC<Group & { size?: [number, number]; thick?: number; seed?: string; traces?: number; dark?: boolean }> = ({
  size = [3, 2], thick = 0.08, seed = "board", traces = 26, dark = false, ...g
}) => {
  const [w, d] = size;
  const items = useMemo(() => Array.from({ length: traces }, (_, i) => {
    const horiz = rnd(seed, i * 5) > 0.5;
    const len = 0.25 + rnd(seed, i * 5 + 1) * (horiz ? w : d) * 0.45;
    const x = (rnd(seed, i * 5 + 2) - 0.5) * (w - len * (horiz ? 1 : 0) - 0.2);
    const z = (rnd(seed, i * 5 + 3) - 0.5) * (d - len * (horiz ? 0 : 1) - 0.2);
    return { horiz, len, x, z, pad: rnd(seed, i * 5 + 4) > 0.55 };
  }), [seed, traces, w, d]);
  return (
    <group {...g}>
      <Block size={[w, thick, d]} radius={0.02} preset={dark ? "pcbDark" : "pcb"} />
      {items.map((t, i) => (
        <group key={i} position={[t.x, thick / 2 + 0.004, t.z]}>
          <mesh material={mat("copper")} receiveShadow>
            <boxGeometry args={t.horiz ? [t.len, 0.008, 0.025] : [0.025, 0.008, t.len]} />
          </mesh>
          {t.pad && (
            <mesh material={mat("gold")} position={t.horiz ? [t.len / 2, 0.002, 0] : [0, 0.002, t.len / 2]}>
              <cylinderGeometry args={[0.035, 0.035, 0.01, 12]} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

/** A row (or ring) of pins/balls, instanced: `n` per side around a square of half-size `half`. */
export const Pins: React.FC<Group & { n?: number; half?: number; pin?: V3; ring?: boolean; preset?: Preset }> = ({
  n = 10, half = 0.5, pin = [0.04, 0.03, 0.12], ring = true, preset = "gold", ...g
}) => {
  const mesh = useMemo(() => {
    const geo = new THREE.BoxGeometry(...pin);
    const count = ring ? n * 4 : n;
    const im = new THREE.InstancedMesh(geo, mat(preset), count);
    const m = new THREE.Matrix4();
    let k = 0;
    const sides = ring ? 4 : 1;
    for (let s = 0; s < sides; s++) {
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) / n * 2 - 1;
        const off = half + pin[2] / 2;
        const p = [[u * half * 0.9, 0, off], [u * half * 0.9, 0, -off], [off, 0, u * half * 0.9], [-off, 0, u * half * 0.9]][s]!;
        const rot = s >= 2 ? new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2) : new THREE.Quaternion();
        m.compose(new THREE.Vector3(p[0]!, p[1]!, p[2]!), rot, new THREE.Vector3(1, 1, 1));
        im.setMatrixAt(k++, m);
      }
    }
    im.castShadow = true;
    im.receiveShadow = true;
    return im;
  }, [n, half, pin, ring, preset]);
  return <group {...g}><primitive object={mesh} /></group>;
};

/** A silicon die: a dark iridescent slab with a grid of cores (some lit) and a cache band. */
export const Die: React.FC<Group & { size?: number; cores?: [number, number]; lit?: number; seed?: string; thick?: number }> = ({
  size = 1, cores = [2, 4], lit = 0.6, seed = "die", thick = 0.06, ...g
}) => {
  const [cx, cz] = cores;
  const cell = (size * 0.8) / Math.max(cx, cz * 0.75);
  return (
    <group {...g}>
      <Block size={[size, thick, size]} radius={0.01} preset="silicon" />
      {Array.from({ length: cx * cz }, (_, i) => {
        const ix = i % cx, iz = Math.floor(i / cx);
        const x = (ix - (cx - 1) / 2) * cell * 1.05;
        const z = (iz - (cz - 1) / 2) * cell * 0.62 - size * 0.08;
        const on = rnd(seed, i) < lit;
        return (
          <mesh key={i} position={[x, thick / 2 + 0.006, z]} material={on ? mat("siliconLit") : mat("silicon", "#3a3e66")} castShadow>
            <boxGeometry args={[cell * 0.92, 0.012, cell * 0.55]} />
          </mesh>
        );
      })}
      <mesh position={[0, thick / 2 + 0.006, size * 0.33]} material={mat("gold", "#c9a64a", { roughness: 0.45 })}>
        <boxGeometry args={[size * 0.82, 0.01, size * 0.16]} />
      </mesh>
    </group>
  );
};

/** A chip package: substrate, pins, the silicon die, and an optional metal lid (heat spreader). */
export const ChipPackage: React.FC<Group & { size?: number; lid?: boolean; seed?: string }> = ({ size = 1, lid = true, seed = "chip", ...g }) => (
  <group {...g}>
    <Block size={[size, 0.06, size]} radius={0.015} preset="pcbDark" position={[0, 0.03, 0]} />
    <Pins n={12} half={size / 2 - 0.03} pin={[size * 0.025, 0.02, size * 0.08]} position={[0, 0.02, 0]} />
    <Die size={size * 0.55} seed={seed} position={[0, 0.09, 0]} thick={0.04} />
    {lid && <Block size={[size * 0.82, 0.07, size * 0.82]} radius={0.02} preset="aluminium" position={[0, 0.15, 0]} />}
  </group>
);

/** Transistor fins (FinFET): a substrate, `n` fins, a gate wrapping over them, source/drain blocks. */
export const FinFET: React.FC<Group & { n?: number; length?: number; gateOn?: number }> = ({ n = 3, length = 2.4, gateOn = 0, ...g }) => {
  const gap = 0.42;
  const w = (n - 1) * gap + 0.8;
  return (
    <group {...g}>
      <Block size={[w + 0.4, 0.25, length + 0.4]} radius={0.03} preset="silicon" position={[0, 0.125, 0]} />
      <Block size={[w + 0.3, 0.05, length + 0.3]} radius={0.01} preset="oxide" position={[0, 0.27, 0]} />
      {Array.from({ length: n }, (_, i) => (
        <Block key={i} size={[0.16, 0.55, length]} radius={0.04} preset="fin" position={[(i - (n - 1) / 2) * gap, 0.55, 0]} />
      ))}
      <Block size={[w, 0.75, 0.42]} radius={0.06} material={mat("gate", undefined, { emissiveIntensity: 0.15 + Math.round(gateOn * 20) / 20 * 1.2 })} position={[0, 0.66, 0]} />
      <Block size={[w * 0.95, 0.35, 0.4]} radius={0.05} preset="aluminium" position={[0, 0.65, length / 2 - 0.25]} />
      <Block size={[w * 0.95, 0.35, 0.4]} radius={0.05} preset="aluminium" position={[0, 0.65, -length / 2 + 0.25]} />
    </group>
  );
};

/** A wire: a smooth tube through points. */
export const Wire: React.FC<Group & { points: V3[]; radius?: number; preset?: Preset; color?: string }> = ({ points, radius = 0.03, preset = "copper", color, ...g }) => {
  const geo = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), 64, radius, 10, false), [points, radius]);
  return <group {...g}><mesh geometry={geo} material={mat(preset, color)} castShadow /></group>;
};

/** A glass pane (or a glass box when `depth` > 0.02). */
export const Glass: React.FC<Group & { size: [number, number]; depth?: number; tint?: string }> = ({ size, depth = 0.01, tint, ...g }) => (
  <group {...g}>
    <RoundedBox args={[size[0], depth, size[1]]} radius={Math.min(0.05, depth / 2 - 1e-4)} smoothness={3} material={mat("glass", tint)} />
  </group>
);

let uiTex: THREE.Texture | null = null;
/** A home screen drawn in code: a gradient wallpaper and a grid of rounded app tiles (no words). */
export function phoneScreenTexture(): THREE.Texture {
  if (uiTex) return uiTex;
  const W = 512, H = 1060;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#3b2bd8"); bg.addColorStop(0.55, "#1b8fe0"); bg.addColorStop(1, "#22d3c5");
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const glowG = g.createRadialGradient(W * 0.7, H * 0.25, 10, W * 0.7, H * 0.25, W * 0.8);
  glowG.addColorStop(0, "rgba(255,255,255,0.35)"); glowG.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = glowG; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(255,255,255,0.9)";
  g.beginPath(); g.roundRect(W * 0.3, 150, W * 0.4, 70, 16); g.fill(); // a clock-shaped bar, no digits
  const cols = ["#ff5d8f", "#ffb340", "#9dff5c", "#38e1ff", "#ffffff", "#8b5cff", "#ff7a45", "#2ee6a6"];
  for (let r = 0; r < 5; r++) for (let k = 0; k < 4; k++) {
    g.fillStyle = cols[(r * 4 + k * 3) % cols.length]!;
    g.beginPath(); g.roundRect(46 + k * 112, 330 + r * 120, 84, 84, 22); g.fill();
  }
  g.fillStyle = "rgba(255,255,255,0.28)";
  g.beginPath(); g.roundRect(30, H - 150, W - 60, 110, 34); g.fill();
  uiTex = new THREE.CanvasTexture(c);
  uiTex.colorSpace = THREE.SRGBColorSpace;
  return uiTex;
}

/** Phone parts, laid out on the y axis (flat on its back, screen up). Explode them by key. */
export const PHONE = { w: 1.5, d: 3.1 } as const;
export type PhonePart = "screen" | "frame" | "board" | "battery" | "back";

export const PhonePartModel: React.FC<Group & { part: PhonePart; glowScreen?: number }> = ({ part, glowScreen = 1, ...g }) => {
  const { w, d } = PHONE;
  switch (part) {
    case "screen":
      return (
        <group {...g}>
          <Block size={[w, 0.03, d]} radius={0.012} material={mat("screen", undefined, { emissiveIntensity: 0.15 + 0.55 * Math.round(glowScreen * 20) / 20 })} />
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.0165, 0]}>
            <planeGeometry args={[w * 0.93, d * 0.95]} />
            <meshStandardMaterial color="#000" emissive="#fff" emissiveMap={phoneScreenTexture()} emissiveIntensity={0.25 + 0.75 * Math.round(glowScreen * 20) / 20} roughness={0.2} />
          </mesh>
          <Glass size={[w * 0.995, d * 0.995]} depth={0.012} position={[0, 0.022, 0]} />
          <mesh position={[0, 0.03, -d * 0.44]} material={mat("blackPlastic")}><boxGeometry args={[0.32, 0.006, 0.09]} /></mesh>
        </group>
      );
    case "frame":
      return (
        <group {...g}>
          {([[0, d / 2 - 0.025, w, 0.05], [0, -d / 2 + 0.025, w, 0.05]] as const).map(([x, z, sx, sz], i) => (
            <Block key={`h${i}`} size={[sx, 0.14, sz]} radius={0.02} preset="aluminium" position={[x, 0, z]} />
          ))}
          {([[w / 2 - 0.025], [-w / 2 + 0.025]] as const).map(([x], i) => (
            <Block key={`v${i}`} size={[0.05, 0.14, d]} radius={0.02} preset="aluminium" position={[x, 0, 0]} />
          ))}
        </group>
      );
    case "board":
      return (
        <group {...g}>
          <Board size={[w * 0.82, d * 0.36]} seed="phone-board" traces={22} dark position={[0, 0, -d * 0.27]} />
          <ChipPackage lid={false} scale={0.42} position={[0.12, 0.03, -d * 0.27]} seed="soc" />
          <Block size={[0.26, 0.05, 0.3]} radius={0.01} preset="aluminium" position={[-0.38, 0.06, -d * 0.2]} />
          <Block size={[0.22, 0.04, 0.22]} radius={0.01} preset="ceramic" position={[-0.4, 0.05, -d * 0.36]} />
        </group>
      );
    case "battery":
      return (
        <group {...g}>
          <Block size={[w * 0.78, 0.09, d * 0.5]} radius={0.03} preset="battery" />
          <mesh position={[0, 0.047, 0]} material={mat("white", TECH.lime, { emissive: TECH.lime, emissiveIntensity: 0.4 })}>
            <boxGeometry args={[w * 0.5, 0.004, 0.06]} />
          </mesh>
        </group>
      );
    case "back":
      return (
        <group {...g}>
          <Block size={[w, 0.04, d]} radius={0.015} preset="ceramic" color="#2c3a5c" />
          <Block size={[0.5, 0.06, 0.5]} radius={0.08} preset="ceramic" color="#22263a" position={[-0.38, -0.04, -d * 0.36]} />
          {[[-0.5, -1.25], [-0.27, -1.25], [-0.5, -1.02]].map(([x, z], i) => (
            <mesh key={i} position={[x!, -0.075, z!]} rotation-x={Math.PI} material={mat("glass", "#0a0d18", { opacity: 0.9 })}>
              <cylinderGeometry args={[0.085, 0.085, 0.02, 24]} />
            </mesh>
          ))}
        </group>
      );
  }
};

/** The parts' resting heights in an assembled phone (back at the bottom, screen on top). */
export const PHONE_STACK: Record<PhonePart, number> = { back: 0.02, battery: 0.1, board: 0.09, frame: 0.1, screen: 0.18 };

/** A whole phone, assembled, screen up. */
export const Phone: React.FC<Group & { glowScreen?: number }> = ({ glowScreen = 1, ...g }) => (
  <group {...g}>
    {(Object.keys(PHONE_STACK) as PhonePart[]).map((p) => (
      <PhonePartModel key={p} part={p} glowScreen={glowScreen}
        position={[0, PHONE_STACK[p], p === "battery" ? PHONE.d * 0.18 : 0]} />
    ))}
  </group>
);
