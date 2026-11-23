// Rotorcraft and hill country (2026-11-23, for v-20261123-41, the Calabasas S-76 Short):
//   - Helicopter: a twin-engine medium helicopter in the shape of a Sikorsky S-76 (long rounded nose,
//     tall cabin with big side windows, engine fairing on the roof, four-blade main rotor, a slim tail
//     boom with a swept fin, small stabiliser and a four-blade tail rotor on the left). Nose +x, rotor
//     up +y, origin at the foot of the mast. `rotor` / `tail` are the blade angles (radians; pass a
//     function of the frame), `blur` 0..1 fades the blades into a translucent disc as at flight rpm.
//     `wrap.body` / `wrap.rotor` put a Failure3D or Highlight round a part.
//   - Hills: seeded rolling hill country (a displaced terrain with dry grass and scrub colours, dark
//     chaparral bushes); `hillHeight(x, z, opts)` gives the same surface in JS to stand things on it.
// Pure functions of their props: no clocks, no Math.random.
import type { ThreeElements } from "@react-three/fiber";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { rnd } from "../core";
import { useDLook } from "./look";

type Group = ThreeElements["group"];
type Wrap<P extends string> = Partial<Record<P, (el: React.ReactNode) => React.ReactNode>>;
const W = <P extends string>(wrap: Wrap<P> | undefined, part: P, el: React.ReactNode) => (wrap?.[part] ? wrap[part]!(el) : el);

// ---------------------------------------------------------------- helicopter

export type HeliLivery = { body?: string; band?: string; belly?: string; glass?: string; rotor?: string };
export type HeliPart = "body" | "rotor" | "tail";
export type HelicopterProps = Group & {
  /** nose to tail-rotor length (world units) */
  length?: number;
  /** main rotor angle (radians) */
  rotor?: number;
  /** tail rotor angle (radians) */
  tail?: number;
  /** 0 blades sharp … 1 a spinning disc */
  blur?: number;
  livery?: HeliLivery;
  /** cabin and nav lights on (0..1) */
  lights?: number;
  wrap?: Wrap<HeliPart>;
};

const heliMats = new Map<string, THREE.Material>();
function heliMat(key: string, make: () => THREE.Material): THREE.Material {
  let m = heliMats.get(key);
  if (!m) { m = make(); heliMats.set(key, m); }
  return m;
}

/** a body of revolution along x from (x, radius) pairs, nose first */
function latheAlongX(pts: [number, number][], seg = 36): THREE.BufferGeometry {
  const v = pts.map(([x, r]) => new THREE.Vector2(Math.max(0.0001, r), x));
  v.sort((a, b) => a.y - b.y);
  const g = new THREE.LatheGeometry(v, seg);
  g.rotateZ(-Math.PI / 2);
  return g;
}

export const Helicopter: React.FC<HelicopterProps> = ({ length: L = 2, rotor = 0, tail = 0, blur = 0.6, livery = {}, lights = 1, wrap, ...g }) => {
  const look = useDLook();
  const { paint } = look;
  const lv = { body: "#f2f3f4", band: "#1d3f7a", belly: "#2a2f36", glass: "#0f1720", rotor: "#2b2e33", ...livery };
  const painted = !look.clay && look.name !== "blueprint";
  const r = L * 0.085;
  const geo = useMemo(() => {
    // the cabin and nose: drooped nose, tall cabin, a smooth taper into the boom
    const prof: [number, number][] = [
      [0.5 * L, 0.0001], [0.49 * L, r * 0.35], [0.46 * L, r * 0.62], [0.41 * L, r * 0.84], [0.33 * L, r * 0.98],
      [0.2 * L, r], [0.02 * L, r], [-0.1 * L, r * 0.9], [-0.18 * L, r * 0.62], [-0.24 * L, r * 0.4], [-0.28 * L, r * 0.32], [-0.3 * L, r * 0.0001],
    ];
    const fus = latheAlongX(prof, 40);
    fus.scale(1, 1.18, 0.92);
    const p = fus.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(p.count * 3);
    const cB = new THREE.Color(lv.body), cBand = new THREE.Color(lv.band), cBelly = new THREE.Color(lv.belly);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      // the nose droops a little
      if (x > 0.3 * L) p.setY(i, y - (x - 0.3 * L) * 0.18);
      const rel = y / (r * 1.18);
      const c = rel < -0.62 ? cBelly : rel < -0.2 && rel > -0.42 ? cBand : cB;
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    fus.setAttribute("color", new THREE.BufferAttribute(col, 3));
    fus.computeVertexNormals();
    const boom = latheAlongX([[-0.26 * L, r * 0.36], [-0.55 * L, r * 0.24], [-0.62 * L, r * 0.2]], 20);
    // the swept fin: a quad extruded thin
    const fs = new THREE.Shape();
    fs.moveTo(0, 0); fs.lineTo(-0.1 * L, 0.0); fs.lineTo(-0.16 * L, 0.2 * L); fs.lineTo(-0.11 * L, 0.21 * L); fs.lineTo(0.02 * L, 0.02 * L);
    const fin = new THREE.ExtrudeGeometry(fs, { depth: r * 0.08, bevelEnabled: false });
    fin.translate(0, 0, -r * 0.04);
    const glass = new THREE.SphereGeometry(1, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const blade = new THREE.BoxGeometry(1, 1, 1);
    const disc = new THREE.CircleGeometry(1, 48);
    disc.rotateX(-Math.PI / 2);
    return { fus, boom, fin, glass, blade, disc };
  }, [L, r, lv.body, lv.band, lv.belly]);

  const skin = painted
    ? heliMat("skin", () => new THREE.MeshPhysicalMaterial({ color: "#ffffff", vertexColors: true, roughness: 0.34, metalness: 0.1, clearcoat: 0.7, clearcoatRoughness: 0.2 }))
    : paint("body", lv.body);
  const glassM = painted ? heliMat("glass", () => new THREE.MeshPhysicalMaterial({ color: lv.glass, roughness: 0.08, metalness: 0.3, clearcoat: 1, envMapIntensity: 1.4 })) : paint("glass", lv.glass);
  const dark = paint("dark", lv.rotor);
  const metal = paint("metal", "#8d939a");
  const discM = heliMat(`disc${lv.rotor}`, () => new THREE.MeshBasicMaterial({ color: lv.rotor, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }));
  const navR = heliMat("navR", () => new THREE.MeshBasicMaterial({ color: "#ff3b30" }));
  const navG = heliMat("navG", () => new THREE.MeshBasicMaterial({ color: "#3cff7a" }));
  const winM = heliMat("win", () => new THREE.MeshPhysicalMaterial({ color: "#16202b", roughness: 0.1, metalness: 0.2, clearcoat: 1, emissive: "#ffd9a0", emissiveIntensity: 0 }));
  (winM as THREE.MeshPhysicalMaterial).emissiveIntensity = Math.round(lights * 4) / 40;

  const top = r * 1.18;
  const mastY = top + L * 0.06;
  const R = L * 0.62;
  const bladeOpacity = 1 - 0.75 * Math.max(0, Math.min(1, blur));
  const bladeM = heliMat(`blade${Math.round(bladeOpacity * 10)}`, () => new THREE.MeshStandardMaterial({ color: lv.rotor, roughness: 0.6, metalness: 0.3, transparent: bladeOpacity < 1, opacity: bladeOpacity }));
  const body = (
    <group>
      <mesh geometry={geo.fus} material={skin} castShadow receiveShadow />
      <mesh geometry={geo.boom} material={skin} castShadow receiveShadow />
      {/* the cockpit glazing on the nose, and the big cabin windows down each side */}
      <mesh geometry={geo.glass} material={glassM} position={[0.36 * L, top * 0.18, 0]} rotation-z={-1.05} scale={[r * 0.95, r * 0.9, r * 0.86]} />
      {[1, -1].map((s) => (
        <group key={s}>
          {[0.16, 0.03, -0.08].map((x, i) => (
            <mesh key={i} material={winM} position={[x * L, top * 0.18, s * r * 0.93]} rotation-y={s > 0 ? 0 : Math.PI}>
              <boxGeometry args={[L * 0.09, r * 0.62, r * 0.04]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* the engine fairing on the roof, the exhausts, the mast */}
      <mesh material={skin} position={[-0.02 * L, top + L * 0.012, 0]} castShadow>
        <boxGeometry args={[L * 0.3, L * 0.05, r * 0.9]} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={`ex${s}`} material={dark} position={[-0.17 * L, top + L * 0.015, s * r * 0.32]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[r * 0.13, r * 0.15, L * 0.05, 12]} />
        </mesh>
      ))}
      <mesh material={metal} position={[0.02 * L, top + L * 0.045, 0]}><cylinderGeometry args={[r * 0.1, r * 0.14, L * 0.04, 12]} /></mesh>
      {/* the tail: fin, stabiliser, a nav light at each side */}
      <group position={[-0.56 * L, r * 0.12, 0]}>
        <mesh geometry={geo.fin} material={skin} castShadow />
        <mesh material={skin} position={[-0.02 * L, 0, 0]} castShadow><boxGeometry args={[L * 0.07, r * 0.05, L * 0.2]} /></mesh>
      </group>
      <mesh material={navR} position={[0.08 * L, -top * 0.75, r * 0.95]}><sphereGeometry args={[r * 0.07, 8, 6]} /></mesh>
      <mesh material={navG} position={[0.08 * L, -top * 0.75, -r * 0.95]}><sphereGeometry args={[r * 0.07, 8, 6]} /></mesh>
      {lights > 0 ? <mesh material={navR} position={[-0.02 * L, top + L * 0.04, 0]} scale={1 + 0.6 * lights}><sphereGeometry args={[r * 0.06, 8, 6]} /></mesh> : null}
    </group>
  );
  const main = (
    <group position={[0.02 * L, mastY, 0]}>
      <mesh material={metal}><cylinderGeometry args={[r * 0.18, r * 0.18, L * 0.03, 14]} /></mesh>
      <group rotation-y={rotor}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} geometry={geo.blade} material={bladeM} rotation-y={(i * Math.PI) / 2} position={[Math.cos((i * Math.PI) / 2) * R / 2, 0, -Math.sin((i * Math.PI) / 2) * R / 2]}
            scale={[R, L * 0.008, L * 0.035]} castShadow />
        ))}
      </group>
      {blur > 0 ? <mesh geometry={geo.disc} material={discM} scale={R} position={[0, 0.001, 0]} /> : null}
    </group>
  );
  const tr = L * 0.11;
  const tailRotor = (
    <group position={[-0.69 * L, r * 0.12 + L * 0.16, r * 0.14]}>
      <group rotation-z={tail}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} material={bladeM} rotation-z={(i * Math.PI) / 2} position={[Math.cos((i * Math.PI) / 2) * tr / 2, Math.sin((i * Math.PI) / 2) * tr / 2, 0]}>
            <boxGeometry args={[tr, L * 0.016, L * 0.004]} />
          </mesh>
        ))}
      </group>
      {blur > 0 ? <mesh material={discM} scale={tr}><circleGeometry args={[1, 32]} /></mesh> : null}
    </group>
  );
  return (
    <group {...g}>
      {W(wrap, "body", body)}
      {W(wrap, "rotor", main)}
      {W(wrap, "tail", tailRotor)}
    </group>
  );
};

// ---------------------------------------------------------------- hills

export type HillOpts = { seed?: string; height?: number; scale?: number; ridge?: number };

function hash(ix: number, iz: number, seed: string): number {
  return rnd(seed, ((ix * 73856093) ^ (iz * 19349663)) & 0x7fffffff);
}
function vnoise(x: number, z: number, seed: string): number {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz, seed), b = hash(ix + 1, iz, seed), c = hash(ix, iz + 1, seed), d = hash(ix + 1, iz + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/** The hills' height at (x, z): rolling noise plus a main ridge running along x at z = 0 (`ridge` its height). */
export function hillHeight(x: number, z: number, { seed = "hills", height = 3, scale = 0.12, ridge = 1 }: HillOpts = {}): number {
  let h = 0, a = 1, f = scale;
  for (let o = 0; o < 4; o++) { h += a * vnoise(x * f + o * 17.3, z * f - o * 9.1, seed); a *= 0.5; f *= 2.1; }
  const rid = ridge * Math.exp(-(z * z) / 18) * (0.75 + 0.25 * Math.sin(x * 0.35));
  return height * (h / 1.875 - 0.3) + height * rid;
}

export type HillsProps = Group & HillOpts & { size?: number; segments?: number; bushes?: number; colors?: { low?: string; high?: string; scrub?: string } };

/** Rolling hill country: a displaced terrain with dry grass on the tops, darker green in the gullies, and
 * seeded chaparral bushes. Centred on the origin; y = hillHeight(x, z). */
export const Hills: React.FC<HillsProps> = ({ size = 60, segments = 160, bushes = 500, seed = "hills", height = 3, scale = 0.12, ridge = 1, colors = {}, ...g }) => {
  const look = useDLook();
  const cl = { low: "#3a4a2e", high: "#8f8257", scrub: "#2c3a24", ...colors };
  const opts = { seed, height, scale, ridge };
  const geo = useMemo(() => {
    const pg = new THREE.PlaneGeometry(size, size, segments, segments);
    pg.rotateX(-Math.PI / 2);
    const p = pg.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(p.count * 3);
    const lo = new THREE.Color(cl.low), hi = new THREE.Color(cl.high), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const y = hillHeight(x, z, opts);
      p.setY(i, y);
      const k = Math.max(0, Math.min(1, (y / height + 0.2) * 0.8 + 0.25 * (vnoise(x * 0.9, z * 0.9, `${seed}c`) - 0.5)));
      c.copy(lo).lerp(hi, k);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    pg.setAttribute("color", new THREE.BufferAttribute(col, 3));
    pg.computeVertexNormals();
    return pg;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, segments, seed, height, scale, ridge, cl.low, cl.high]);
  const ground = look.clay ? look.paint("ground") : heliMat("hills", () => new THREE.MeshStandardMaterial({ color: "#ffffff", vertexColors: true, roughness: 0.95, metalness: 0 }));
  const scrub = look.clay ? look.paint("ground", cl.scrub) : heliMat(`scrub${cl.scrub}`, () => new THREE.MeshStandardMaterial({ color: cl.scrub, roughness: 1, flatShading: true }));
  const inst = useRef<THREE.InstancedMesh>(null);
  const bgeo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  useLayoutEffect(() => {
    const m = inst.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < bushes; i++) {
      const x = (rnd(`${seed}b`, i * 3) - 0.5) * size * 0.9, z = (rnd(`${seed}b`, i * 3 + 1) - 0.5) * size * 0.9;
      const s = 0.08 + rnd(`${seed}b`, i * 3 + 2) * 0.18;
      o.position.set(x, hillHeight(x, z, opts) + s * 0.3, z);
      o.scale.set(s * 1.3, s * 0.8, s * 1.1);
      o.rotation.set(0, i, 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bushes, seed, size, height, scale, ridge]);
  return (
    <group {...g}>
      <mesh geometry={geo} material={ground} receiveShadow castShadow userData={{ noFail: true }} />
      <instancedMesh ref={inst} args={[bgeo, scrub, bushes]} castShadow receiveShadow />
    </group>
  );
};
