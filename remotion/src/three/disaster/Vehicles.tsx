// Vehicles: parametric low-poly heroes that read as the real type (silhouette, engine layout, tail,
// windows, livery): Jet, Train, Ship. All made in code; painted through the look (look.tsx).
// Every hero exposes `wrap` per named part, so a Failure3D can be put around exactly the part that
// fails (the tailplane, a carriage, the bow visor) without touching the rest.
import type { ThreeElements } from "@react-three/fiber";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { rnd, type V3 } from "../core";
import { useDLook } from "./look";

type Group = ThreeElements["group"];
type Wrap<P extends string> = Partial<Record<P, (el: React.ReactNode) => React.ReactNode>>;
const W = <P extends string>(wrap: Wrap<P> | undefined, part: P, el: React.ReactNode) => (wrap?.[part] ? wrap[part]!(el) : el);
const sh = { castShadow: true, receiveShadow: true } as const;

// ---------------------------------------------------------------- shared geometry helpers

/** A flat swept surface (wing, stabiliser) from its plan: root chord, tip chord, span, sweep (deg, at
 * the leading edge), thickness at the root. Built in the xz plane, root at z=0 running to z=span,
 * leading edge toward +x. The section is an airfoil-ish wedge (thickest a third back, a thin trailing
 * edge) and thins toward the tip, so it reads as a wing, not a plank. */
function surfaceGeometry(root: number, tip: number, span: number, sweepDeg: number, thick: number): THREE.BufferGeometry {
  const g = planform(root, tip, span, sweepDeg, thick);
  g.rotateX(Math.PI / 2); // shape y → world z, extrusion → -y
  g.computeVertexNormals();
  return g;
}

/** The same plan standing up (a fin): span along +y, thickness along z. */
function finGeometry(root: number, tip: number, span: number, sweepDeg: number, thick: number): THREE.BufferGeometry {
  const g = planform(root, tip, span, sweepDeg, thick);
  g.computeVertexNormals();
  return g;
}

function planform(root: number, tip: number, span: number, sweepDeg: number, thick: number): THREE.BufferGeometry {
  const off = Math.tan(THREE.MathUtils.degToRad(sweepDeg)) * span;
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(-off, span);
  s.lineTo(-off - tip, span);
  s.lineTo(-root, 0);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: true, bevelThickness: thick * 0.35, bevelSize: Math.min(thick * 0.5, tip * 0.08), bevelSegments: 3, steps: 1 });
  g.translate(0, 0, -thick / 2);
  // shape the section: thickness by chord position and span position (shape coords: x chord, y span, z thickness)
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const v = Math.min(1, Math.max(0, y / span));
    const le = -off * v, chord = root + (tip - root) * v;
    const u = Math.min(1, Math.max(0, (le - x) / chord));
    const sec = u < 0.3 ? 0.62 + (u / 0.3) * 0.38 : 1 - ((u - 0.3) / 0.7) * 0.82;
    p.setZ(i, z * sec * (1 - 0.45 * v));
  }
  return g;
}

/** A lathe along +x from a radius profile [[x, r]…]. */
function latheX(profile: [number, number][], seg = 28): THREE.BufferGeometry {
  const g = new THREE.LatheGeometry(profile.map(([x, r]) => new THREE.Vector2(Math.max(0.0001, r), x)), seg);
  g.rotateZ(-Math.PI / 2);
  g.computeVertexNormals();
  return g;
}

/** Linear interpolation in a sorted-by-x-descending profile. */
function profileAt(profile: [number, number][], x: number): number {
  if (x >= profile[0]![0]) return profile[0]![1];
  for (let i = 1; i < profile.length; i++) {
    const [x1, r1] = profile[i]!, [x0, r0] = profile[i - 1]!;
    if (x >= x1) return r0 + ((r1 - r0) * (x - x0)) / (x1 - x0);
  }
  return profile[profile.length - 1]![1];
}

/** A thin pane lying on a surface at `pos` facing `n`, its long side along x as far as it can. */
function paneQuat(n: THREE.Vector3): THREE.Quaternion {
  const ax = new THREE.Vector3(1, 0, 0).addScaledVector(n, -n.x).normalize();
  const ay = new THREE.Vector3().crossVectors(n, ax);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(ax, ay, n));
}

// ---------------------------------------------------------------- Jet

export type JetLivery = { body?: string; belly?: string; tail?: string; stripe?: string; engine?: string; window?: string };
export type JetPart = "fuselage" | "wingL" | "wingR" | "tailplane" | "fin" | "engines";
export type JetProps = Group & {
  /** fuselage length (world units); the rest scales with it */
  length?: number;
  /** wing leading-edge sweep (deg): 0 straight (turboprop), 25 (narrowbody), 35 (widebody) */
  sweep?: number;
  /** "underWing" (A320/737/747), "rear" (MD-80, DC-9, CRJ, bizjets), "tri" (DC-10/MD-11: two under, one in the fin) */
  engines?: "underWing" | "rear" | "tri";
  /** engines per wing when under the wing (1 or 2) */
  perWing?: 1 | 2;
  tail?: "conventional" | "T";
  windows?: number;
  /** fuselage diameter ÷ length (narrowbody ~0.095, widebody ~0.11, bizjet ~0.12) */
  girth?: number;
  /** half wing span ÷ length (default 0.37 rear-engined, 0.45 otherwise) */
  span?: number;
  livery?: JetLivery;
  /** landing gear down */
  gear?: boolean;
  wrap?: Wrap<JetPart>;
};

type JetDims = ReturnType<typeof jetDims>;

/** Every proportion of a Jet in one place (the model and jetTailplaneAt read the same numbers). */
function jetDims(p: Pick<JetProps, "length" | "sweep" | "tail" | "girth" | "engines" | "span">) {
  const L = p.length ?? 6, sweep = p.sweep ?? 25, girth = p.girth ?? 0.095, T = (p.tail ?? "conventional") === "T";
  const engines = p.engines ?? "underWing";
  const r = (L * girth) / 2;
  const nose = L * 0.42, tailEnd = -L * 0.58, cylFront = nose - 0.13 * L, cylEnd = tailEnd + 0.27 * L;
  const profile: [number, number][] = [
    [nose, 0], [nose - 0.006 * L, r * 0.3], [nose - 0.02 * L, r * 0.58], [nose - 0.045 * L, r * 0.8], [nose - 0.08 * L, r * 0.94], [cylFront, r],
    [cylEnd, r], [cylEnd - 0.09 * L, r * 0.78], [tailEnd + 0.07 * L, r * 0.45], [tailEnd + 0.015 * L, r * 0.2], [tailEnd, r * 0.12],
  ];
  const radius = (x: number) => profileAt(profile, x);
  // the tail cone sweeps up (its top stays near the cabin roof), the nose droops a touch
  const centre = (x: number) => (x < cylEnd ? (r - radius(x)) * 0.86 : x > cylFront ? -(r - radius(x)) * 0.3 : 0);
  const finSweep = Math.min(52, sweep + (T ? 18 : 14));
  const finRoot = L * (T ? 0.15 : 0.17), finTip = L * (T ? 0.1 : 0.06), finH = L * (T ? 0.13 : 0.15);
  const finRootY = r * 0.78;
  const finTE = tailEnd + 0.012 * L;
  const finLE = finTE + finRoot;
  const finOff = Math.tan(THREE.MathUtils.degToRad(finSweep)) * finH;
  const stabRoot = T ? finTip * 1.05 : L * 0.1, stabTip = stabRoot * 0.42, stabSpan = L * (T ? 0.125 : 0.15);
  const stabAt: V3 = T
    ? [finLE - finOff + stabRoot * 0.02, finRootY + finH + r * 0.04, 0]
    : [finLE - finRoot * 0.08, centre(finLE - finRoot * 0.5) + r * 0.05, 0];
  const halfSpan = L * (p.span ?? (engines === "rear" ? 0.37 : 0.45));
  const wingRoot = L * 0.17, wingTip = L * 0.045, wingX = L * 0.075, wingY = -r * 0.5;
  return { L, sweep, T, r, nose, tailEnd, cylFront, cylEnd, profile, radius, centre, finSweep, finRoot, finTip, finH, finRootY, finLE, finOff, stabRoot, stabTip, stabSpan, stabAt, halfSpan, wingRoot, wingTip, wingX, wingY };
}

/** A point on the fuselage skin at x, `theta` from the top (+ toward +z), lifted `lift` off it, and the skin's normal there. */
function skinAt(d: JetDims, x: number, theta: number, lift = 0): { pos: V3; n: THREE.Vector3 } {
  const rr = d.radius(x), cy = d.centre(x), e = d.L * 0.004;
  const slope = (d.radius(x + e) - d.radius(x - e)) / (2 * e);
  const dcy = (d.centre(x + e) - d.centre(x - e)) / (2 * e);
  const n = new THREE.Vector3(-(slope + dcy * Math.cos(theta)), Math.cos(theta), Math.sin(theta)).normalize();
  return { pos: [x + n.x * lift, cy + rr * Math.cos(theta) + n.y * lift, rr * Math.sin(theta) + n.z * lift], n };
}

const jetMats = new Map<string, THREE.Material>();
function jetSkinMat(): THREE.Material {
  let m = jetMats.get("skin");
  if (!m) {
    m = new THREE.MeshPhysicalMaterial({ color: "#ffffff", vertexColors: true, roughness: 0.38, metalness: 0.08, clearcoat: 0.6, clearcoatRoughness: 0.25 });
    jetMats.set("skin", m);
  }
  return m;
}

/** Jet: an airliner or business jet by type. Nose toward +x, wings along ±z, origin at the wing
 * root (centre of gravity). The tailplane group's origin is its hinge (the jackscrew pivot). */
export const Jet: React.FC<JetProps> = ({
  length: L = 6, sweep = 25, engines = "underWing", perWing = 1, tail = "conventional", windows = 30, girth = 0.095, span,
  livery = {}, gear = false, wrap, ...g
}) => {
  const look = useDLook();
  const { paint } = look;
  const d = useMemo(() => jetDims({ length: L, sweep, tail, girth, engines, span }), [L, sweep, tail, girth, engines, span]);
  const { r } = d;
  const lv = { body: "#eef2f6", belly: "#b9c2cc", tail: "#1f4e9c", stripe: "#1f4e9c", engine: "#d5dbe2", window: "#1b2433", ...livery };
  const painted = !look.clay && look.name !== "blueprint";
  const geo = useMemo(() => {
    const fus = latheX(d.profile, 40);
    // the upswept tail and drooped nose, then a painted livery (belly, cheat line) as vertex colours
    const p = fus.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(p.count * 3);
    const cBody = new THREE.Color(lv.body), cBelly = new THREE.Color(lv.belly), cStripe = new THREE.Color(lv.stripe);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i) + d.centre(x);
      p.setY(i, y);
      const rel = (y - d.centre(x)) / Math.max(1e-4, d.radius(x));
      const side = Math.abs(p.getZ(i)) / Math.max(1e-4, d.radius(x));
      const inCabin = x < d.nose - 0.05 * L && x > d.cylEnd - 0.08 * L;
      const c = rel < -0.55 ? cBelly : inCabin && side > 0.45 && rel > -0.3 && rel < -0.14 ? cStripe : cBody;
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    fus.setAttribute("color", new THREE.BufferAttribute(col, 3));
    fus.computeVertexNormals();
    const wing = surfaceGeometry(d.wingRoot, d.wingTip, d.halfSpan, sweep, r * 0.3);
    const winglet = finGeometry(d.wingTip * 0.85, d.wingTip * 0.38, L * 0.035, sweep + 12, r * 0.06);
    const stab = surfaceGeometry(d.stabRoot, d.stabTip, d.stabSpan, sweep + 6, r * 0.13);
    const fin = finGeometry(d.finRoot, d.finTip, d.finH + (d.T ? r * 0.04 : 0), d.finSweep, r * 0.16);
    const rear = engines === "rear";
    const nacR = r * (rear ? 0.4 : 0.5), nacL = L * (rear ? 0.15 : 0.12);
    const nacelle = latheX([[nacL / 2, nacR * 0.9], [nacL * 0.44, nacR * 0.99], [nacL * 0.2, nacR], [-nacL * 0.25, nacR * 0.9], [-nacL / 2, nacR * 0.62]], 32);
    return { fus, wing, winglet, stab, fin, nacR, nacL, nacelle };
  }, [d, L, r, sweep, engines, lv.body, lv.belly, lv.stripe]);

  const dihedral = 0.07;
  const wingAt = (u: number): V3 => {
    const z = d.halfSpan * u;
    return [d.wingX - Math.tan(THREE.MathUtils.degToRad(sweep)) * z, d.wingY, z];
  };
  const { nacR, nacL } = geo;

  const Nacelle: React.FC<{ at: V3 }> = ({ at }) => (
    <group position={at}>
      <mesh geometry={geo.nacelle} material={paint("body", lv.engine)} {...sh} />
      {/* intake lip, the fan behind it with a spinner, the exhaust cone */}
      <mesh position={[nacL / 2, 0, 0]} rotation-y={Math.PI / 2} material={paint("metal", "#c9ced6")} {...sh}><torusGeometry args={[nacR * 0.82, nacR * 0.085, 10, 32]} /></mesh>
      <mesh position={[nacL / 2 - nacL * 0.07, 0, 0]} rotation-y={Math.PI / 2} material={paint("dark", "#1a1d23")}><circleGeometry args={[nacR * 0.84, 28]} /></mesh>
      <mesh position={[nacL / 2 - nacL * 0.03, 0, 0]} rotation-z={-Math.PI / 2} material={paint("metal", "#aeb5bf")}><coneGeometry args={[nacR * 0.24, nacL * 0.09, 16]} /></mesh>
      <mesh position={[-nacL / 2 - nacL * 0.05, 0, 0]} rotation-z={Math.PI / 2} material={paint("dark", "#2a2d33")} {...sh}><coneGeometry args={[nacR * 0.42, nacL * 0.16, 18]} /></mesh>
    </group>
  );

  const nacelles: React.ReactNode[] = [];
  if (engines === "underWing" || engines === "tri") {
    const us = perWing === 2 ? [0.34, 0.64] : [0.36];
    for (const side of [1, -1]) for (const u of us) {
      const [x, y, z] = wingAt(u);
      const ny = y + Math.sin(dihedral) * z - nacR * 1.3;
      nacelles.push(
        <group key={`n${side}${u}`}>
          <Nacelle at={[x + nacL * 0.42, ny, z * side]} />
          {/* pylon: a thin swept blade from the nacelle's top into the wing */}
          <mesh position={[x + nacL * 0.12, ny + nacR * 0.85, z * side]} rotation-z={0.12} material={paint("body", lv.engine)} {...sh}>
            <boxGeometry args={[nacL * 0.78, nacR * 0.75, nacR * 0.16]} />
          </mesh>
        </group>,
      );
    }
  }
  if (engines === "rear") {
    const x = d.finLE - d.finRoot * 0.15;
    const rr = d.radius(x), cy = d.centre(x);
    for (const side of [1, -1]) {
      nacelles.push(
        <group key={`r${side}`}>
          <Nacelle at={[x, cy + r * 0.2, side * (rr + nacR * 1.35)]} />
          <mesh position={[x - nacL * 0.05, cy + r * 0.2, side * (rr + nacR * 0.35)]} material={paint("body", lv.engine)} {...sh}>
            <boxGeometry args={[nacL * 0.5, nacR * 0.28, nacR * 1.5]} />
          </mesh>
        </group>,
      );
    }
  }
  if (engines === "tri") {
    const x = d.finLE - d.finRoot * 0.3;
    nacelles.push(<Nacelle key="c" at={[x, d.centre(x) + d.radius(x) + nacR * 0.75, 0]} />);
  }

  // windows: a row of panes each side on the skin; cockpit glazing wrapped round the nose
  const panes = useMemo(() => {
    const out: { pos: V3; q: THREE.Quaternion; w: number; h: number; dark?: boolean }[] = [];
    const x0 = d.nose - L * 0.15, x1 = d.cylEnd - L * 0.04;
    const th = Math.PI / 2 - 0.42;
    for (let i = 0; i < windows; i++) {
      const x = x0 + ((x1 - x0) * i) / Math.max(1, windows - 1);
      for (const s of [1, -1]) {
        const k = skinAt(d, x, s * th, r * 0.012);
        out.push({ pos: k.pos, q: paneQuat(k.n), w: r * 0.1, h: r * 0.15 });
      }
    }
    // doors (front and rear, both sides): a slightly darker outline
    for (const x of [d.nose - L * 0.125, x1 + L * 0.03]) for (const s of [1, -1]) {
      const k = skinAt(d, x, s * (Math.PI / 2 - 0.12), r * 0.008);
      out.push({ pos: k.pos, q: paneQuat(k.n), w: r * 0.24, h: r * 0.62, dark: true });
    }
    // cockpit: windscreen pair, then two side panes per side, stepping back and down
    const ck: [number, number, number, number][] = [[0.052, 0.36, 0.26, 0.2], [0.058, 0.82, 0.24, 0.18], [0.066, 1.12, 0.2, 0.15]];
    for (const [dx, theta, w, h] of ck) for (const s of [1, -1]) {
      const k = skinAt(d, d.nose - L * dx, s * theta, r * 0.012);
      out.push({ pos: k.pos, q: paneQuat(k.n), w: r * w, h: r * h });
    }
    return out;
  }, [d, windows, L, r]);

  const fuselage = (
    <group>
      <mesh geometry={geo.fus} material={painted ? jetSkinMat() : paint("body", lv.body)} {...sh} />
      {/* belly fairing under the wing box, and the wing-root fairings that blend wing into body */}
      <mesh position={[d.wingX - d.wingRoot * 0.45, -r * 0.62, 0]} scale={[d.wingRoot * 0.75, r * 0.42, r * 0.8]} material={paint("trim", lv.belly)} {...sh}>
        <sphereGeometry args={[1, 32, 16]} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[d.wingX - d.wingRoot * 0.42, d.wingY + r * 0.06, s * r * 0.72]} scale={[d.wingRoot * 0.66, r * 0.3, r * 0.36]} material={paint("body", lv.body)} {...sh}>
          <sphereGeometry args={[1, 28, 14]} />
        </mesh>
      ))}
      {panes.map((p, i) => (
        <mesh key={i} position={p.pos} quaternion={p.q} material={p.dark ? paint("trim", "#9aa4b0") : paint("glass", lv.window)}>
          <boxGeometry args={[p.w, p.h, r * (p.dark ? 0.01 : 0.03)]} />
        </mesh>
      ))}
    </group>
  );

  const wingGroup = (
    <>
      <mesh geometry={geo.wing} position={[d.wingX, d.wingY, 0]} material={paint("body", lv.body)} {...sh} />
      {engines !== "rear" && (
        <mesh geometry={geo.winglet} position={[wingAt(1)[0] - d.wingTip * 0.05, d.wingY, d.halfSpan - r * 0.03]} material={paint("accent", lv.tail)} {...sh} />
      )}
    </>
  );
  const wingL = <group rotation-x={-dihedral}>{wingGroup}</group>;
  const wingR = <group scale={[1, 1, -1]} rotation-x={dihedral}>{wingGroup}</group>;
  // tailplane: origin at the hinge (its root leading edge), halves either side; a bullet fairing on a T-tail
  const tailplane = (
    <group>
      <mesh geometry={geo.stab} material={paint("body", lv.body)} {...sh} />
      <mesh geometry={geo.stab} scale={[1, 1, -1]} material={paint("body", lv.body)} {...sh} />
      {d.T && (
        <mesh position={[-d.stabRoot * 0.3, 0, 0]} scale={[d.stabRoot * 0.42, r * 0.09, r * 0.09]} material={paint("accent", lv.tail)} {...sh}>
          <sphereGeometry args={[1, 24, 12]} />
        </mesh>
      )}
    </group>
  );
  // fin: on the top centreline of the tail cone, the rudder hinge line both sides
  const finTipLE = d.finLE - d.finOff, rudderU = 0.7;
  const rA = new THREE.Vector3(d.finLE - d.finRoot * rudderU, d.finRootY + r * 0.15, 0);
  const rB = new THREE.Vector3(finTipLE - d.finTip * rudderU, d.finRootY + d.finH * 0.97, 0);
  const rLen = rA.distanceTo(rB), rMid = rA.clone().add(rB).multiplyScalar(0.5);
  const rAng = Math.atan2(rB.y - rA.y, rB.x - rA.x);
  const fin = (
    <group>
      <mesh geometry={geo.fin} position={[d.finLE, d.finRootY, 0]} material={paint("accent", lv.tail)} {...sh} />
      {[1, -1].map((s) => (
        <mesh key={s} position={[rMid.x, rMid.y, s * r * 0.075]} rotation-z={rAng} material={paint("dark", "#0e1420")}>
          <boxGeometry args={[rLen, r * 0.018, r * 0.01]} />
        </mesh>
      ))}
    </group>
  );

  return (
    <group {...g}>
      {W(wrap, "fuselage", fuselage)}
      {W(wrap, "wingL", wingL)}
      {W(wrap, "wingR", wingR)}
      {W(wrap, "fin", fin)}
      <group position={d.stabAt}>
        {W(wrap, "tailplane", tailplane)}
      </group>
      {W(wrap, "engines", <group>{nacelles}</group>)}
      {gear && [[d.nose - L * 0.1, 0], [d.wingX - L * 0.08, r * 1.2], [d.wingX - L * 0.08, -r * 1.2]].map(([x, z], i) => (
        <group key={i} position={[x!, -r * 1.2, z!]}>
          <mesh position={[0, r * 0.45, 0]} material={paint("metal")}><cylinderGeometry args={[r * 0.05, r * 0.05, r * 0.9]} /></mesh>
          <mesh rotation-x={Math.PI / 2} material={paint("rubber")} {...sh}><cylinderGeometry args={[r * 0.2, r * 0.2, r * 0.18, 16]} /></mesh>
        </group>
      ))}
    </group>
  );
};

/** Where a Jet's tailplane hinge sits (for Failure3D `hot` points, labels and cameras). */
export function jetTailplaneAt(p: Pick<JetProps, "length" | "sweep" | "tail" | "girth" | "engines" | "span"> = {}): V3 {
  return jetDims(p).stabAt;
}


// ---------------------------------------------------------------- Train

export type TrainLivery = { body?: string; stripe?: string; window?: string; roof?: string; nose?: string };
export type CarPose = { dx?: number; dy?: number; dz?: number; yaw?: number; roll?: number; pitch?: number };
export type TrainProps = Group & {
  /** carriages behind the locomotive / power car */
  cars?: number;
  carLength?: number;
  /** "loco" (a boxy diesel/electric locomotive), "highSpeed" (a streamlined power car) */
  nose?: "loco" | "highSpeed" | "cab";
  pantograph?: boolean;
  livery?: TrainLivery;
  /** per-vehicle offsets (0 = the front vehicle) for a derailment: drift, lift, yaw, roll */
  poses?: CarPose[];
  /** wheels turn with this distance travelled (world units) */
  travelled?: number;
  wrap?: Partial<Record<number, (el: React.ReactNode) => React.ReactNode>>;
};

const GAUGE = 0.36, CAR_W = 0.72, CAR_H = 0.78, BOGIE_Y = 0.12;

const Bogie: React.FC<{ x: number; spin: number }> = ({ x, spin }) => {
  const { paint } = useDLook();
  return (
    <group position={[x, BOGIE_Y, 0]}>
      <mesh material={paint("dark")} {...sh}><boxGeometry args={[0.62, 0.1, GAUGE + 0.08]} /></mesh>
      {[-0.2, 0.2].map((dx) => [-1, 1].map((s) => (
        <mesh key={`${dx}${s}`} position={[dx, -0.02, s * (GAUGE / 2 + 0.02)]} rotation-x={Math.PI / 2} rotation-y={spin} material={paint("steel")} {...sh}>
          <cylinderGeometry args={[0.11, 0.11, 0.05, 14]} />
        </mesh>
      )))}
    </group>
  );
};

/** One vehicle of a train: body with a curved roof, a window band, doors, two bogies. */
const Car: React.FC<{ len: number; front?: TrainProps["nose"]; panto?: boolean; lv: Required<TrainLivery>; spin: number; seed: string }> = ({ len, front, panto, lv, spin, seed }) => {
  const { paint } = useDLook();
  const bodyY = BOGIE_Y + 0.1 + CAR_H / 2;
  const noseGeo = useMemo(() => {
    if (!front || front === "loco") return null;
    // side profile of a cab: a slope (cab) or a long streamlined nose (highSpeed), extruded across
    const n = front === "highSpeed" ? len * 0.32 : len * 0.12;
    const s = new THREE.Shape();
    s.moveTo(0, -CAR_H / 2);
    s.lineTo(n * 0.15, -CAR_H / 2);
    s.quadraticCurveTo(n, -CAR_H / 2, n, -CAR_H * 0.2);
    s.quadraticCurveTo(n * 0.55, CAR_H * 0.45, 0, CAR_H / 2);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: CAR_W, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 3, curveSegments: 10 });
    g.translate(0, 0, -CAR_W / 2);
    g.computeVertexNormals();
    return { g, n };
  }, [front, len]);
  const bodyLen = noseGeo ? len - noseGeo.n : len;
  const doors = Math.max(1, Math.round(len / 2.2));
  return (
    <group>
      <mesh position={[noseGeo ? -noseGeo.n / 2 : 0, bodyY, 0]} material={paint("body", lv.body)} {...sh}>
        <boxGeometry args={[bodyLen, CAR_H, CAR_W]} />
      </mesh>
      <mesh position={[noseGeo ? -noseGeo.n / 2 : 0, bodyY + CAR_H / 2, 0]} rotation-z={Math.PI / 2} scale={[0.18, 1, 1]} material={paint("trim", lv.roof)} {...sh}>
        <cylinderGeometry args={[CAR_W / 2, CAR_W / 2, bodyLen, 20, 1, false, 0, Math.PI]} />
      </mesh>
      {noseGeo && (
        <group position={[bodyLen / 2 - noseGeo.n / 2, bodyY, 0]}>
          <mesh geometry={noseGeo.g} material={paint("body", lv.nose)} {...sh} />
          <mesh position={[noseGeo.n * 0.42, CAR_H * 0.17, 0]} rotation-z={-0.75} material={paint("glass", lv.window)}>
            <boxGeometry args={[noseGeo.n * 0.35, 0.02, CAR_W * 0.8]} />
          </mesh>
        </group>
      )}
      {/* window band + stripe, both sides */}
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh position={[noseGeo ? -noseGeo.n / 2 : 0, bodyY + CAR_H * 0.14, s * (CAR_W / 2 + 0.004)]} material={paint("glass", lv.window)}>
            <boxGeometry args={[bodyLen * 0.9, CAR_H * 0.26, 0.01]} />
          </mesh>
          <mesh position={[noseGeo ? -noseGeo.n / 2 : 0, bodyY - CAR_H * 0.22, s * (CAR_W / 2 + 0.005)]} material={paint("accent", lv.stripe)}>
            <boxGeometry args={[bodyLen, CAR_H * 0.09, 0.01]} />
          </mesh>
          {Array.from({ length: doors }, (_, i) => (
            <mesh key={i} position={[(noseGeo ? -noseGeo.n / 2 : 0) + bodyLen * (-0.5 + (i + 0.5) / doors), bodyY - CAR_H * 0.02, s * (CAR_W / 2 + 0.006)]} material={paint("dark")}>
              <boxGeometry args={[0.2, CAR_H * 0.72, 0.008]} />
            </mesh>
          ))}
        </group>
      ))}
      {front === "loco" && (
        <mesh position={[len / 2 + 0.003, bodyY + CAR_H * 0.2, 0]} material={paint("glass", lv.window)}>
          <boxGeometry args={[0.01, CAR_H * 0.26, CAR_W * 0.8]} />
        </mesh>
      )}
      {panto && (
        <group position={[-len * 0.25, bodyY + CAR_H / 2 + 0.06, 0]}>
          <mesh position={[0.1, 0.12, 0]} rotation-z={0.9} material={paint("steel")}><boxGeometry args={[0.34, 0.02, 0.02]} /></mesh>
          <mesh position={[0.1, 0.32, 0]} rotation-z={-0.9} material={paint("steel")}><boxGeometry args={[0.34, 0.02, 0.02]} /></mesh>
          <mesh position={[0, 0.44, 0]} material={paint("steel")}><boxGeometry args={[0.04, 0.02, 0.5]} /></mesh>
        </group>
      )}
      <Bogie x={-len * 0.33} spin={spin} />
      <Bogie x={len * 0.33} spin={spin + rnd(seed, 1)} />
      <mesh position={[len / 2 + 0.06, BOGIE_Y + 0.12, 0]} material={paint("dark")}><boxGeometry args={[0.14, 0.08, 0.1]} /></mesh>
    </group>
  );
};

/** Train: a locomotive / power car (front toward +x, at the origin) and `cars` carriages behind it,
 * on rails at y=0. `poses` derail any vehicle; `wrap[i]` wraps vehicle i (e.g. in a Failure3D). */
export const Train: React.FC<TrainProps> = ({ cars = 4, carLength = 3.2, nose = "highSpeed", pantograph = true, livery = {}, poses = [], travelled = 0, wrap, ...g }) => {
  const lv: Required<TrainLivery> = { body: "#f1f3f5", stripe: "#d62828", window: "#16202c", roof: "#9aa3ad", nose: "#f1f3f5", ...livery };
  const gap = 0.16;
  const spin = travelled / 0.11;
  return (
    <group {...g}>
      {Array.from({ length: cars + 1 }, (_, i) => {
        const p = poses[i] ?? {};
        const x = -i * (carLength + gap);
        const el = (
          <group position={[x + (p.dx ?? 0), p.dy ?? 0, p.dz ?? 0]} rotation={[p.roll ?? 0, p.yaw ?? 0, p.pitch ?? 0]}>
            <Car len={carLength} front={i === 0 ? nose : undefined} panto={pantograph && i === 0} lv={lv} spin={spin} seed={`car${i}`} />
          </group>
        );
        return <React.Fragment key={i}>{wrap?.[i] ? wrap[i]!(el) : el}</React.Fragment>;
      })}
    </group>
  );
};

/** A straight length of track (rails, sleepers, ballast) along x, centred on the origin. */
export const Track: React.FC<Group & { length?: number; sleepers?: number }> = ({ length = 24, sleepers, ...g }) => {
  const { paint } = useDLook();
  const n = sleepers ?? Math.round(length / 0.32);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const ref = React.useRef<THREE.InstancedMesh>(null);
  React.useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    for (let i = 0; i < n; i++) {
      tmp.position.set(-length / 2 + (length * (i + 0.5)) / n, 0.02, 0);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [n, length, tmp]);
  return (
    <group {...g}>
      <mesh position={[0, -0.02, 0]} material={paint("ground", "#6b6560")} receiveShadow><boxGeometry args={[length, 0.06, 1.1]} /></mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, n]} material={paint("dark", "#3b3631")} receiveShadow castShadow>
        <boxGeometry args={[0.12, 0.04, 0.62]} />
      </instancedMesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0.06, s * GAUGE / 2 + s * 0.02]} material={paint("metal")} castShadow><boxGeometry args={[length, 0.04, 0.03]} /></mesh>
      ))}
    </group>
  );
};

// ---------------------------------------------------------------- Ship

export type ShipLivery = { hull?: string; bottom?: string; boot?: string; deck?: string; super?: string; funnel?: string; band?: string; window?: string };
export type ShipPart = "hull" | "superstructure" | "bowDoors" | "funnel" | "cargo";
export type ShipProps = Group & {
  /** "ferry" (ro-ro: bluff bow, bow doors, tall decks), "cargo" (container ship: bridge aft, boxes),
   * "liner" (sleek sheer, tiers of decks, lifeboats, funnels) */
  hull?: "ferry" | "cargo" | "liner";
  length?: number;
  /** decks of superstructure */
  decks?: number;
  funnels?: number;
  /** 0 closed → 1 fully open */
  bowDoors?: number;
  /** "clamshell" (Herald of Free Enterprise: two doors swing out) or "visor" (Estonia: the bow lifts) */
  doorType?: "clamshell" | "visor";
  livery?: ShipLivery;
  seed?: string;
  wrap?: Wrap<ShipPart>;
};

const SHIP_SHAPE = {
  ferry: { beam: 0.17, depth: 0.14, draft: 0.05, bow: 0.13, rake: 0.3, sheer: 0.014, flare: 0.5, bluff: 0.3 },
  cargo: { beam: 0.14, depth: 0.12, draft: 0.06, bow: 0.17, rake: 0.4, sheer: 0.01, flare: 0.45, bluff: 0.08 },
  liner: { beam: 0.11, depth: 0.12, draft: 0.05, bow: 0.22, rake: 0.8, sheer: 0.018, flare: 0.55, bluff: 0.06 },
} as const;

/** The hull: plan shape extruded up, narrowed toward the keel, the bow raked and flared (a fine entry
 * low, full at the deck), the deck edge rising fore and aft (the sheer line), painted by height
 * (antifouling red under the waterline, a dark boot top, a livery band, the hull colour above, the
 * deck on top). Waterline at y=0. */
function hullGeometry(kind: NonNullable<ShipProps["hull"]>, L: number, colors: { hull: string; bottom: string; boot: string; band: string; deck: string }): { g: THREE.BufferGeometry; beam: number; top: number; bottom: number; bowX: number; sheer: (x: number) => number } {
  const S = SHIP_SHAPE[kind];
  const B = L * S.beam, top = L * (S.depth - S.draft), bottom = -L * S.draft, H = top - bottom;
  const bowLen = L * S.bow;
  const sh = new THREE.Shape();
  const x0 = -L / 2, x1 = L / 2 - bowLen;
  sh.moveTo(x0, -B / 2);
  sh.lineTo(x1, -B / 2);
  // the bow: curving in to a short flat face (a ro-ro's door face; a sliver on finer hulls)
  sh.bezierCurveTo(x1 + bowLen * 0.6, -B / 2, L / 2, -B * (S.bluff + 0.12), L / 2, -B * S.bluff);
  sh.lineTo(L / 2, B * S.bluff);
  sh.bezierCurveTo(L / 2, B * (S.bluff + 0.12), x1 + bowLen * 0.6, B / 2, x1, B / 2);
  sh.lineTo(x0, B / 2);
  sh.quadraticCurveTo(x0 - B * 0.06, 0, x0, -B / 2);
  const g = new THREE.ExtrudeGeometry(sh, { depth: H, bevelEnabled: true, bevelSize: B * 0.025, bevelThickness: B * 0.025, bevelSegments: 2, curveSegments: 24, steps: 10 });
  g.rotateX(-Math.PI / 2); // extrude up: shape y → -z, depth → +y
  g.translate(0, bottom, 0);
  const sheer = (x: number) => {
    const u = (2 * x) / L;
    return L * S.sheer * (u > 0 ? u * u * 1.25 : u * u * 0.6);
  };
  const pos = g.attributes.position as THREE.BufferAttribute;
  const nrm = g.attributes.normal as THREE.BufferAttribute;
  const col = new Float32Array(pos.count * 3);
  const cH = new THREE.Color(colors.hull), cB = new THREE.Color(colors.bottom), cT = new THREE.Color(colors.boot), cBand = new THREE.Color(colors.band), cD = new THREE.Color(colors.deck);
  const bandLo = top - H * 0.3, bandHi = top - H * 0.22;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const deck = nrm.getY(i) > 0.95 && y > top - H * 0.05;
    const t = Math.min(1, Math.max(0, (y - bottom) / H));
    const bowU = Math.max(0, (x - x1) / bowLen);
    // keel narrowing everywhere, a much finer entry low at the bow (the flare)
    const keel = Math.pow(t, 0.5);
    pos.setZ(i, z * (0.5 + 0.5 * keel) * (1 - S.flare * bowU * (1 - t) * (1 - t)));
    // the stem rakes back below the car deck; above it the bow face stands upright
    const low = Math.max(0, (0.5 - t) / 0.5);
    pos.setX(i, x - low * low * bowU * bowLen * S.rake * 2.2);
    pos.setY(i, y + sheer(x) * t);
    const c = deck ? cD : y < -0.002 * L ? cB : y < 0.012 * L ? cT : y > bandLo && y < bandHi ? cBand : cH;
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return { g, beam: B, top, bottom, bowX: L / 2, sheer };
}

const hullMats = new Map<string, THREE.Material>();
function hullMat(clay: boolean): THREE.Material {
  const k = clay ? "clay" : "paint";
  let m = hullMats.get(k);
  if (!m) {
    m = clay ? new THREE.MeshPhysicalMaterial({ color: "#efe9df", roughness: 0.9, sheen: 0.3 })
      : new THREE.MeshPhysicalMaterial({ color: "#ffffff", vertexColors: true, roughness: 0.5, metalness: 0.05, clearcoat: 0.4 });
    hullMats.set(k, m);
  }
  return m;
}

/** A deck house in plan: a box with its front corners rounded (radius `round` × width), extruded up `h`. */
function tierGeometry(len: number, w: number, h: number, round: number): THREE.BufferGeometry {
  const rr = Math.min(w / 2, len / 2) * round;
  const s = new THREE.Shape();
  s.moveTo(-len / 2, -w / 2);
  s.lineTo(len / 2 - rr, -w / 2);
  s.quadraticCurveTo(len / 2, -w / 2, len / 2, -w / 2 + rr);
  s.lineTo(len / 2, w / 2 - rr);
  s.quadraticCurveTo(len / 2, w / 2, len / 2 - rr, w / 2);
  s.lineTo(-len / 2, w / 2);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: true, bevelSize: h * 0.04, bevelThickness: h * 0.04, bevelSegments: 1, curveSegments: 10 });
  g.rotateX(-Math.PI / 2);
  g.computeVertexNormals();
  return g;
}

/** Ship: bow toward +x, waterline at y=0, origin amidships. `bowDoors` opens the bow (clamshell or
 * visor). List it by rotating the group about x; float it with oceanHeight (Atmos3D). */
export const Ship: React.FC<ShipProps> = ({
  hull = "ferry", length: L = 8, decks, funnels, bowDoors = 0, doorType = "clamshell", livery = {}, seed = "ship", wrap, ...g
}) => {
  const look = useDLook();
  const { paint } = look;
  const lv = {
    hull: hull === "ferry" ? "#f2f4f6" : hull === "cargo" ? "#1d3557" : "#14171c", bottom: "#a8322d", boot: "#1a1c20", deck: "#8a9096",
    super: "#f6f7f8", funnel: hull === "ferry" ? "#d62828" : "#e9c46a", band: "#1d3557", window: "#1b2433", ...livery,
  };
  const H = useMemo(() => hullGeometry(hull, L, lv), [hull, L, lv.hull, lv.bottom, lv.boot, lv.band, lv.deck]);
  const nDecks = decks ?? (hull === "ferry" ? 4 : hull === "liner" ? 5 : 4);
  const nFun = funnels ?? (hull === "liner" ? 2 : 1);
  const B = H.beam;
  const deckH = L * 0.022;

  // superstructure: stacked deck houses, rounded at the front, each a touch shorter and set back
  const supStart = hull === "cargo" ? -L * 0.48 : hull === "liner" ? -L * 0.34 : -L * 0.42;
  const supLen = hull === "cargo" ? L * 0.13 : hull === "liner" ? L * 0.6 : L * 0.66;
  const tiers = useMemo(() => Array.from({ length: nDecks }, (_, i) => {
    const shrink = hull === "cargo" ? 0 : i * L * 0.028;
    const top = i === nDecks - 1 && hull !== "cargo";
    const len = supLen - shrink * 1.6 - (top ? supLen * 0.3 : 0);
    const xb = supStart + shrink * 0.4 + (top ? supLen * 0.18 : 0);
    const x = xb + len / 2;
    const y = H.top + deckH * i;
    const w = B * (hull === "cargo" ? 0.92 : top ? 0.62 : 0.94 - i * 0.03);
    return { len, x, y, w, geo: tierGeometry(len, w, deckH * 0.96, hull === "cargo" ? 0.08 : 0.55) };
  }), [nDecks, hull, L, supLen, supStart, H.top, deckH, B]);
  const bridge = tiers[nDecks - 1]!;

  // window panes: rows down both sides of every deck house, and across the bridge front
  const winRef = useRef<THREE.InstancedMesh>(null);
  const wins = useMemo(() => {
    const out: { p: V3; ry: number; w: number }[] = [];
    const step = deckH * 0.5;
    for (const t of tiers) {
      const straight = t.len - t.w * 0.3;
      const n = Math.max(1, Math.floor((straight - step) / step));
      for (let k = 0; k < n; k++) {
        const x = t.x - t.len / 2 + step * 0.8 + k * step;
        for (const s of [1, -1]) out.push({ p: [x, t.y + deckH * 0.5, s * (t.w / 2 + deckH * 0.06)], ry: 0, w: deckH * 0.3 });
      }
    }
    const nb = 7;
    for (let k = 0; k < nb; k++) {
      const z = (k - (nb - 1) / 2) * (bridge.w * 0.6) / (nb - 1);
      out.push({ p: [bridge.x + bridge.len / 2 + deckH * 0.06, bridge.y + deckH * 0.5, z], ry: Math.PI / 2, w: bridge.w * 0.08 });
    }
    return out;
  }, [tiers, bridge, deckH]);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    const m = winRef.current;
    if (!m) return;
    wins.forEach((w, i) => {
      tmp.position.set(...w.p);
      tmp.rotation.set(0, w.ry, 0);
      tmp.scale.set(w.w, deckH * 0.36, 0.006);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  const superstructure = (
    <group>
      {tiers.map((t, i) => (
        <group key={i}>
          <mesh geometry={t.geo} position={[t.x, t.y, 0]} material={paint("body", lv.super)} {...sh} />
          {/* the deck plate on top: a thin overhang that draws a crisp edge line */}
          <mesh position={[t.x - deckH * 0.05, t.y + deckH * 0.97, 0]} material={paint("trim", "#c9ced4")} {...sh}>
            <boxGeometry args={[t.len * 0.98, deckH * 0.06, t.w + deckH * 0.08]} />
          </mesh>
        </group>
      ))}
      <instancedMesh ref={winRef} args={[undefined, undefined, wins.length]} material={paint("glass", lv.window)} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      {/* bridge wings out to the full beam, a mast with a radar bar */}
      <mesh position={[bridge.x + bridge.len * 0.38, bridge.y + deckH * 0.8, 0]} material={paint("body", lv.super)} {...sh}>
        <boxGeometry args={[bridge.len * 0.18, deckH * 0.18, B * 0.98]} />
      </mesh>
      <group position={[bridge.x - bridge.len * 0.05, bridge.y + deckH, 0]}>
        <mesh position={[0, deckH * 0.9, 0]} material={paint("metal")} castShadow><cylinderGeometry args={[deckH * 0.05, deckH * 0.07, deckH * 1.8, 8]} /></mesh>
        <mesh position={[0, deckH * 1.5, 0]} material={paint("dark")} castShadow><boxGeometry args={[deckH * 0.12, deckH * 0.08, deckH * 1.2]} /></mesh>
      </group>
      {(hull === "liner" || hull === "ferry") && Array.from({ length: hull === "liner" ? 8 : 5 }, (_, i) => [1, -1].map((s) => {
        const t = tiers[Math.min(1, nDecks - 1)]!;
        return (
          <mesh key={`${i}${s}`} position={[t.x - t.len * 0.38 + i * t.len * (hull === "liner" ? 0.1 : 0.13), t.y + deckH * 0.45, s * (t.w / 2 + deckH * 0.2)]} rotation-z={Math.PI / 2}
            material={paint("accent", "#ff8c1a")} castShadow>
            <capsuleGeometry args={[deckH * 0.16, deckH * 0.55, 4, 10]} />
          </mesh>
        );
      }))}
    </group>
  );
  const funnelX = hull === "cargo" ? supStart + supLen * 0.2 : bridge.x - bridge.len * 0.7;
  const funnelY = hull === "cargo" ? H.top + deckH * nDecks : tiers[Math.max(0, nDecks - 2)]!.y + deckH;
  const funnel = (
    <group>
      {Array.from({ length: nFun }, (_, i) => (
        <group key={i} position={[funnelX - i * L * 0.12, funnelY + deckH * 1.1, 0]} rotation-z={hull === "liner" ? 0.15 : 0.1}>
          <mesh scale={[1.6, 1, 1]} material={paint("accent", lv.funnel)} {...sh}><cylinderGeometry args={[deckH * 0.62, deckH * 0.78, deckH * 2.2, 24]} /></mesh>
          <mesh position={[0, deckH * 0.55, 0]} scale={[1.6, 1, 1]} material={paint("dark", lv.band)}><cylinderGeometry args={[deckH * 0.66, deckH * 0.68, deckH * 0.32, 24]} /></mesh>
          <mesh position={[0, deckH * 1.1, 0]} scale={[1.6, 1, 1]} material={paint("dark", "#16181c")}><cylinderGeometry args={[deckH * 0.625, deckH * 0.63, deckH * 0.12, 24]} /></mesh>
        </group>
      ))}
    </group>
  );
  // containers for a cargo ship: seeded coloured stacks
  const cargo = useMemo(() => {
    if (hull !== "cargo") return null;
    const out: { p: V3; c: string }[] = [];
    const cols = ["#c0392b", "#2e86de", "#e1b12c", "#16a085", "#8e44ad", "#d35400", "#7f8c8d"];
    const bays = 14, rows = 4;
    for (let b = 0; b < bays; b++) for (let r = 0; r < rows; r++) {
      const h = 1 + Math.floor(rnd(seed, b * 9 + r) * 3);
      for (let k = 0; k < h; k++) {
        out.push({ p: [-L * 0.3 + b * L * 0.046, H.top + L * 0.012 + k * L * 0.021, (r - (rows - 1) / 2) * B * 0.23], c: cols[Math.floor(rnd(seed, 500 + out.length) * cols.length)]! });
      }
    }
    return out;
  }, [hull, L, B, seed, H.top]);

  // bow doors: clamshell = two panels hinged at their outer edge; visor = the bow tip lifting
  const o = Math.min(1, Math.max(0, bowDoors));
  const doorH = H.top * 0.62, doorW = B * 0.17;
  const bowDoorsEl = doorType === "clamshell" ? (
    <group position={[H.bowX + B * 0.026, H.top * 0.64, 0]}>
      {/* the car-deck opening behind the doors */}
      <mesh position={[-0.004, 0, 0]} material={paint("dark", "#0a0c10")}><boxGeometry args={[0.01, doorH * 0.92, doorW * 1.9]} /></mesh>
      {[1, -1].map((s) => (
        <group key={s} position={[0, 0, s * doorW]} rotation-y={-s * o * 1.45}>
          <mesh position={[0.012, 0, -s * doorW / 2]} material={paint("body", lv.hull)} {...sh}><boxGeometry args={[0.02, doorH, doorW]} /></mesh>
        </group>
      ))}
    </group>
  ) : (
    <group position={[H.bowX - L * 0.08, H.top, 0]} rotation-z={o * 0.9}>
      <mesh position={[L * 0.05, -doorH * 0.35, 0]} material={paint("body", lv.hull)} {...sh}><boxGeometry args={[L * 0.1, doorH * 0.7, B * 0.5]} /></mesh>
    </group>
  );

  return (
    <group {...g}>
      {W(wrap, "hull", (
        <group>
          <mesh geometry={H.g} material={look.clay ? paint("body") : hullMat(false)} {...sh} />
        </group>
      ))}
      {W(wrap, "superstructure", superstructure)}
      {W(wrap, "funnel", funnel)}
      {cargo && W(wrap, "cargo", (
        <group>
          {cargo.map((c, i) => (
            <mesh key={i} position={c.p} material={paint("accent", c.c)} castShadow receiveShadow>
              <boxGeometry args={[L * 0.043, L * 0.02, B * 0.22]} />
            </mesh>
          ))}
        </group>
      ))}
      {hull === "ferry" && W(wrap, "bowDoors", bowDoorsEl)}
    </group>
  );
};
