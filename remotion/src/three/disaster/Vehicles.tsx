// Vehicles: parametric low-poly heroes that read as the real type (silhouette, engine layout, tail,
// windows, livery): Jet, Train, Ship. All made in code; painted through the look (look.tsx).
// Every hero exposes `wrap` per named part, so a Failure3D can be put around exactly the part that
// fails (the tailplane, a carriage, the bow visor) without touching the rest.
import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { rnd, type V3 } from "../core";
import { useDLook } from "./look";

type Group = ThreeElements["group"];
type Wrap<P extends string> = Partial<Record<P, (el: React.ReactNode) => React.ReactNode>>;
const W = <P extends string>(wrap: Wrap<P> | undefined, part: P, el: React.ReactNode) => (wrap?.[part] ? wrap[part]!(el) : el);
const sh = { castShadow: true, receiveShadow: true } as const;

// ---------------------------------------------------------------- shared geometry helpers

/** A flat swept surface (wing, stabiliser, fin) from its plan: root chord, tip chord, span, sweep
 * (deg, at the leading edge), thickness. Built in the xz plane, root at z=0 running to z=span,
 * leading edge toward +x. */
function surfaceGeometry(root: number, tip: number, span: number, sweepDeg: number, thick: number): THREE.BufferGeometry {
  const off = Math.tan(THREE.MathUtils.degToRad(sweepDeg)) * span;
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(-off, span);
  s.lineTo(-off - tip, span);
  s.lineTo(-root, 0);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: true, bevelThickness: thick * 0.4, bevelSize: thick * 0.45, bevelSegments: 2, steps: 1 });
  g.translate(0, 0, -thick / 2);
  g.rotateX(Math.PI / 2); // shape y → world z, extrusion → -y
  g.computeVertexNormals();
  return g;
}

/** A lathe along +x from a radius profile [[x, r]…]. */
function latheX(profile: [number, number][], seg = 28): THREE.BufferGeometry {
  const g = new THREE.LatheGeometry(profile.map(([x, r]) => new THREE.Vector2(Math.max(0.0001, r), x)), seg);
  g.rotateZ(-Math.PI / 2);
  g.computeVertexNormals();
  return g;
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
  livery?: JetLivery;
  /** landing gear down */
  gear?: boolean;
  wrap?: Wrap<JetPart>;
};

/** Jet: an airliner or business jet by type. Nose toward +x, wings along ±z, origin at the wing
 * root (centre of gravity). The tailplane group's origin is its hinge (the jackscrew pivot). */
export const Jet: React.FC<JetProps> = ({
  length: L = 6, sweep = 25, engines = "underWing", perWing = 1, tail = "conventional", windows = 30, girth = 0.095,
  livery = {}, gear = false, wrap, ...g
}) => {
  const { paint } = useDLook();
  const r = (L * girth) / 2;
  const lv = { body: "#eef2f6", belly: "#c9d0d8", tail: "#1f4e9c", stripe: "#1f4e9c", engine: "#d5dbe2", window: "#1b2433", ...livery };
  const geo = useMemo(() => {
    const nose = L * 0.42, tailEnd = -L * 0.58;
    const fus = latheX([
      [nose, 0], [nose - 0.02 * L, r * 0.45], [nose - 0.06 * L, r * 0.82], [nose - 0.12 * L, r],
      [tailEnd + 0.24 * L, r], [tailEnd + 0.08 * L, r * 0.62], [tailEnd + 0.01 * L, r * 0.22], [tailEnd, r * 0.12],
    ], 32);
    const span = L * 0.48;
    const wing = surfaceGeometry(L * 0.2, L * 0.06, span, sweep, r * 0.18);
    const stab = surfaceGeometry(L * 0.09, L * 0.04, L * 0.17, sweep + 8, r * 0.1);
    const finH = L * (tail === "T" ? 0.17 : 0.16);
    const fin = surfaceGeometry(L * 0.16, L * (tail === "T" ? 0.1 : 0.06), finH, sweep + 15, r * 0.12);
    fin.rotateX(-Math.PI / 2); // span up (+y)
    const nacR = r * (engines === "rear" ? 0.42 : 0.5), nacL = L * (engines === "rear" ? 0.14 : 0.13);
    const nacelle = latheX([[nacL / 2, nacR * 0.9], [nacL * 0.35, nacR], [-nacL * 0.3, nacR * 0.92], [-nacL / 2, nacR * 0.55]], 24);
    return { nose, tailEnd, fus, wing, stab, fin, finH, span, nacR, nacL, nacelle };
  }, [L, r, sweep, tail, engines]);

  const wingX = L * 0.06, wingY = -r * 0.45;
  const dihedral = 0.07;
  const finX = geo.tailEnd + L * 0.2;
  const finRootY = r * 0.75;
  const wingAt = (u: number): V3 => {
    const z = geo.span * u;
    return [wingX - Math.tan(THREE.MathUtils.degToRad(sweep)) * z, wingY + Math.sin(dihedral) * z, z];
  };

  const Nacelle: React.FC<{ at: V3 }> = ({ at }) => (
    <group position={at}>
      <mesh geometry={geo.nacelle} material={paint("body", lv.engine)} {...sh} />
      <mesh position={[geo.nacL / 2 - 0.005, 0, 0]} rotation-z={-Math.PI / 2} material={paint("dark", "#15181e")}>
        <circleGeometry args={[geo.nacR * 0.82, 20]} />
      </mesh>
    </group>
  );

  const nacelles: React.ReactNode[] = [];
  if (engines === "underWing" || engines === "tri") {
    const us = perWing === 2 ? [0.32, 0.62] : [0.34];
    for (const side of [1, -1]) for (const u of us) {
      const [x, y, z] = wingAt(u);
      nacelles.push(
        <group key={`n${side}${u}`}>
          <Nacelle at={[x + geo.nacL * 0.45, y - geo.nacR * 1.25, z * side]} />
          <mesh position={[x + geo.nacL * 0.2, y - geo.nacR * 0.55, z * side]} material={paint("body", lv.engine)} {...sh}>
            <boxGeometry args={[geo.nacL * 0.6, geo.nacR * 0.9, geo.nacR * 0.25]} />
          </mesh>
        </group>,
      );
    }
  }
  if (engines === "rear") {
    for (const side of [1, -1]) {
      nacelles.push(
        <group key={`r${side}`}>
          <Nacelle at={[geo.tailEnd + L * 0.2, r * 0.35, side * (r + geo.nacR * 1.35)]} />
          <mesh position={[geo.tailEnd + L * 0.2, r * 0.35, side * (r + geo.nacR * 0.4)]} material={paint("body", lv.engine)} {...sh}>
            <boxGeometry args={[geo.nacL * 0.5, geo.nacR * 0.35, geo.nacR * 1.6]} />
          </mesh>
        </group>,
      );
    }
  }
  if (engines === "tri") nacelles.push(<Nacelle key="c" at={[finX - L * 0.02, finRootY + geo.nacR * 0.9, 0]} />);

  // windows: one dark band of little panes per side, cockpit glazing at the nose
  const panes = useMemo(() => {
    const out: V3[] = [];
    const x0 = geo.nose - L * 0.17, x1 = geo.tailEnd + L * 0.26;
    for (let i = 0; i < windows; i++) {
      const x = x0 + ((x1 - x0) * i) / Math.max(1, windows - 1);
      out.push([x, r * 0.28, r * 0.985], [x, r * 0.28, -r * 0.985]);
    }
    return out;
  }, [windows, geo.nose, geo.tailEnd, L, r]);

  const fuselage = (
    <group>
      <mesh geometry={geo.fus} material={paint("body", lv.body)} {...sh} />
      {/* belly fairing and a cheat-line stripe */}
      <mesh position={[wingX - L * 0.07, -r * 0.55, 0]} scale={[L * 0.17, r * 0.5, r * 0.85]} material={paint("trim", lv.belly)} {...sh}>
        <sphereGeometry args={[1, 24, 12]} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[-L * 0.02, -r * 0.08, s * r * 0.975]} rotation-x={s * 0.08} material={paint("trim", lv.stripe)}>
          <boxGeometry args={[L * 0.62, r * 0.1, r * 0.06]} />
        </mesh>
      ))}
      {panes.map((p, i) => (
        <mesh key={i} position={p} material={paint("glass", lv.window)}>
          <boxGeometry args={[r * 0.12, r * 0.16, r * 0.04]} />
        </mesh>
      ))}
      {[1, -1].map((s) => (
        <mesh key={s} position={[geo.nose - L * 0.045, r * 0.38, s * r * 0.5]} rotation-y={s * 0.6} material={paint("glass", lv.window)}>
          <boxGeometry args={[r * 0.5, r * 0.22, r * 0.05]} />
        </mesh>
      ))}
    </group>
  );

  const wingL = <group rotation-x={-dihedral}><mesh geometry={geo.wing} position={[wingX, wingY, 0]} material={paint("body", lv.body)} {...sh} /></group>;
  const wingR = <group scale={[1, 1, -1]} rotation-x={dihedral}><mesh geometry={geo.wing} position={[wingX, wingY, 0]} material={paint("body", lv.body)} {...sh} /></group>;
  // tailplane: origin at the hinge (its root leading edge), halves either side
  const tailplane = (
    <group>
      <mesh geometry={geo.stab} material={paint("body", lv.body)} {...sh} />
      <mesh geometry={geo.stab} scale={[1, 1, -1]} material={paint("body", lv.body)} {...sh} />
    </group>
  );
  const fin = <mesh geometry={geo.fin} position={[finX + L * 0.06, finRootY, 0]} material={paint("accent", lv.tail)} {...sh} />;

  return (
    <group {...g}>
      {W(wrap, "fuselage", fuselage)}
      {W(wrap, "wingL", wingL)}
      {W(wrap, "wingR", wingR)}
      {W(wrap, "fin", fin)}
      <group position={jetTailplaneAt({ length: L, sweep, tail, girth })}>
        {W(wrap, "tailplane", tailplane)}
      </group>
      {W(wrap, "engines", <group>{nacelles}</group>)}
      {gear && [[geo.nose - L * 0.1, 0], [wingX - L * 0.08, r * 1.2], [wingX - L * 0.08, -r * 1.2]].map(([x, z], i) => (
        <group key={i} position={[x!, -r * 1.2, z!]}>
          <mesh position={[0, r * 0.45, 0]} material={paint("metal")}><cylinderGeometry args={[r * 0.05, r * 0.05, r * 0.9]} /></mesh>
          <mesh rotation-x={Math.PI / 2} material={paint("rubber")} {...sh}><cylinderGeometry args={[r * 0.2, r * 0.2, r * 0.18, 16]} /></mesh>
        </group>
      ))}
    </group>
  );
};

/** Where a Jet's tailplane hinge sits (for Failure3D `hot` points, labels and cameras). */
export function jetTailplaneAt(p: Pick<JetProps, "length" | "sweep" | "tail" | "girth"> = {}): V3 {
  const L = p.length ?? 6, sweep = p.sweep ?? 25, girth = p.girth ?? 0.095, T = (p.tail ?? "conventional") === "T";
  const r = (L * girth) / 2, tailEnd = -L * 0.58, finH = L * (T ? 0.17 : 0.16);
  // a T-tail sits on the fin's top leading edge; a conventional one low on the tail cone
  return T ? [tailEnd + 0.26 * L - Math.tan(THREE.MathUtils.degToRad(sweep + 15)) * finH * 0.97, r * 0.75 + finH * 0.97, 0] : [tailEnd + 0.2 * L, r * 0.15, 0];
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
  ferry: { beam: 0.17, depth: 0.14, draft: 0.05, bow: 0.12, rake: 0.6 },
  cargo: { beam: 0.14, depth: 0.12, draft: 0.06, bow: 0.16, rake: 0.4 },
  liner: { beam: 0.11, depth: 0.12, draft: 0.05, bow: 0.2, rake: 0.8 },
} as const;

/** The hull: plan shape extruded down, narrowed toward the keel, the bow raked, painted by height
 * (bottom red under the waterline, a dark boot top, the hull colour above). Waterline at y=0. */
function hullGeometry(kind: NonNullable<ShipProps["hull"]>, L: number, colors: { hull: string; bottom: string; boot: string }): { g: THREE.BufferGeometry; beam: number; top: number; bottom: number; bowX: number } {
  const S = SHIP_SHAPE[kind];
  const B = L * S.beam, top = L * (S.depth - S.draft), bottom = -L * S.draft, H = top - bottom;
  const bowLen = L * S.bow;
  const sh = new THREE.Shape();
  const x0 = -L / 2, x1 = L / 2 - bowLen;
  sh.moveTo(x0, -B / 2);
  sh.lineTo(x1, -B / 2);
  sh.bezierCurveTo(x1 + bowLen * 0.6, -B / 2, L / 2, -B * (kind === "ferry" ? 0.22 : 0.08), L / 2, 0);
  sh.bezierCurveTo(L / 2, B * (kind === "ferry" ? 0.22 : 0.08), x1 + bowLen * 0.6, B / 2, x1, B / 2);
  sh.lineTo(x0, B / 2);
  sh.quadraticCurveTo(x0 - B * 0.08, 0, x0, -B / 2);
  const g = new THREE.ExtrudeGeometry(sh, { depth: H, bevelEnabled: true, bevelSize: B * 0.03, bevelThickness: B * 0.03, bevelSegments: 2, curveSegments: 16, steps: 6 });
  g.rotateX(-Math.PI / 2); // extrude up: shape y → -z, depth → +y
  g.translate(0, bottom, 0);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const col = new Float32Array(pos.count * 3);
  const cH = new THREE.Color(colors.hull), cB = new THREE.Color(colors.bottom), cT = new THREE.Color(colors.boot);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const t = Math.min(1, Math.max(0, (y - bottom) / H));
    const keel = Math.pow(t, 0.55);
    pos.setZ(i, z * (0.55 + 0.45 * keel));
    const bowU = Math.max(0, (x - x1) / bowLen);
    pos.setX(i, x - (1 - t) * bowU * bowLen * S.rake);
    const c = y < -0.002 * L ? cB : y < 0.012 * L ? cT : cH;
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return { g, beam: B, top, bottom, bowX: L / 2 };
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

/** Ship: bow toward +x, waterline at y=0, origin amidships. `bowDoors` opens the bow (clamshell or
 * visor). List it by rotating the group about x; float it with oceanHeight (Atmos3D). */
export const Ship: React.FC<ShipProps> = ({
  hull = "ferry", length: L = 8, decks, funnels, bowDoors = 0, doorType = "clamshell", livery = {}, seed = "ship", wrap, ...g
}) => {
  const look = useDLook();
  const { paint } = look;
  const lv = {
    hull: hull === "ferry" ? "#f2f4f6" : hull === "cargo" ? "#1d3557" : "#14171c", bottom: "#a8322d", boot: "#1a1c20", deck: "#7c8a7a",
    super: "#f6f7f8", funnel: hull === "ferry" ? "#d62828" : "#e9c46a", band: "#1d3557", window: "#1b2433", ...livery,
  };
  const H = useMemo(() => hullGeometry(hull, L, lv), [hull, L, lv.hull, lv.bottom, lv.boot]);
  const nDecks = decks ?? (hull === "ferry" ? 4 : hull === "liner" ? 5 : 4);
  const nFun = funnels ?? (hull === "liner" ? 2 : 1);
  const B = H.beam;
  const deckH = L * 0.022;

  // superstructure: stacked decks with window bands
  const supStart = hull === "cargo" ? -L * 0.48 : hull === "liner" ? -L * 0.34 : -L * 0.42;
  const supLen = hull === "cargo" ? L * 0.13 : hull === "liner" ? L * 0.6 : L * 0.68;
  const tiers = Array.from({ length: nDecks }, (_, i) => {
    const shrink = hull === "cargo" ? 0 : i * L * 0.025;
    const len = supLen - shrink * 2 - (i === nDecks - 1 && hull !== "cargo" ? supLen * 0.25 : 0);
    const x = supStart + supLen / 2 + (hull === "liner" ? shrink * 0.2 : 0);
    const y = H.top + deckH * (i + 0.5);
    const w = B * (hull === "cargo" ? 0.92 : i === nDecks - 1 ? 0.7 : 0.94 - i * 0.02);
    return { len, x, y, w };
  });
  const superstructure = (
    <group>
      {tiers.map((t, i) => (
        <group key={i}>
          <mesh position={[t.x, t.y, 0]} material={paint("body", lv.super)} {...sh}><boxGeometry args={[t.len, deckH * 0.98, t.w]} /></mesh>
          {[1, -1].map((s) => (
            <mesh key={s} position={[t.x, t.y + deckH * 0.08, s * (t.w / 2 + 0.003)]} material={paint("glass", lv.window)}>
              <boxGeometry args={[t.len * 0.94, deckH * 0.32, 0.006]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* bridge windows facing forward */}
      <mesh position={[tiers[nDecks - 1]!.x + tiers[nDecks - 1]!.len / 2 + 0.004, tiers[nDecks - 1]!.y, 0]} material={paint("glass", lv.window)}>
        <boxGeometry args={[0.008, deckH * 0.4, tiers[nDecks - 1]!.w * 0.85]} />
      </mesh>
      {hull === "liner" && Array.from({ length: 8 }, (_, i) => [1, -1].map((s) => (
        <mesh key={`${i}${s}`} position={[supStart + supLen * (0.12 + i * 0.1), H.top + deckH * 1.6, s * (B * 0.5)]} material={paint("accent", "#ff8c1a")} castShadow>
          <capsuleGeometry args={[deckH * 0.22, deckH * 0.9, 4, 8]} />
        </mesh>
      )))}
    </group>
  );
  const funnelX = hull === "cargo" ? supStart + supLen * 0.2 : supStart + supLen * 0.45;
  const funnel = (
    <group>
      {Array.from({ length: nFun }, (_, i) => (
        <group key={i} position={[funnelX - i * L * 0.12, H.top + deckH * nDecks + deckH * 0.9, 0]} rotation-z={hull === "liner" ? 0.15 : 0.06}>
          <mesh scale={[1.5, 1, 1]} material={paint("accent", lv.funnel)} {...sh}><cylinderGeometry args={[deckH * 0.7, deckH * 0.8, deckH * 2, 18]} /></mesh>
          <mesh position={[0, deckH * 0.75, 0]} scale={[1.5, 1, 1]} material={paint("dark", lv.band)}><cylinderGeometry args={[deckH * 0.71, deckH * 0.71, deckH * 0.4, 18]} /></mesh>
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
  const doorH = (H.top - 0.004 * L) * 0.9, doorW = B * 0.28;
  const bowDoorsEl = doorType === "clamshell" ? (
    <group position={[H.bowX - L * 0.005, doorH / 2 + 0.004 * L, 0]}>
      {/* the car-deck opening behind the doors */}
      <mesh position={[-0.004, 0, 0]} material={paint("dark", "#0a0c10")}><boxGeometry args={[0.01, doorH * 0.92, doorW * 1.9]} /></mesh>
      {[1, -1].map((s) => (
        <group key={s} position={[0, 0, s * doorW]} rotation-y={s * o * 1.45}>
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
          <mesh position={[0, H.top + 0.001, 0]} rotation-x={-Math.PI / 2} material={paint("concrete", lv.deck)} receiveShadow>
            <planeGeometry args={[L * 0.92, B * 0.86]} />
          </mesh>
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
