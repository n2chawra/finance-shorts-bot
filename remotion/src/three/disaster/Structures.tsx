// Structures: parametric bridges, dams, buildings and fairground rides, painted through the look.
// Each exposes `wrap` hooks on the part that fails (a span, a walkway, the ride's arm) so a
// Failure3D can go around exactly that part.
import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import type { V3 } from "../core";
import { useDLook, type Paint } from "./look";

type Group = ThreeElements["group"];
const sh = { castShadow: true, receiveShadow: true } as const;

/** A straight member (beam, strut, chord, hanger) from a to b with a square section. */
export const Member: React.FC<{ a: V3; b: V3; t?: number; material: THREE.Material }> = ({ a, b, t = 0.06, material }) => {
  const { pos, quat, len } = useMemo(() => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
    const d = vb.clone().sub(va);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), d.clone().normalize());
    return { pos: va.add(vb).multiplyScalar(0.5), quat: q, len: d.length() };
  }, [a[0], a[1], a[2], b[0], b[1], b[2]]);
  return (
    <mesh position={pos} quaternion={quat} material={material} {...sh}>
      <boxGeometry args={[len, t, t]} />
    </mesh>
  );
};

const Pier: React.FC<{ x: number; h: number; w: number; paint: Paint; kind: "wall" | "columns" }> = ({ x, h, w, paint, kind }) => (
  <group position={[x, 0, 0]}>
    <mesh position={[0, 0.08, 0]} material={paint("concrete")} {...sh}><boxGeometry args={[0.9, 0.16, w * 1.25]} /></mesh>
    {kind === "wall" ? (
      <mesh position={[0, h / 2, 0]} material={paint("concrete")} {...sh}><boxGeometry args={[0.42, h, w * 0.9]} /></mesh>
    ) : (
      [-1, 1].map((s) => (
        <mesh key={s} position={[0, h / 2, s * w * 0.32]} material={paint("concrete")} {...sh}><cylinderGeometry args={[0.16, 0.2, h, 16]} /></mesh>
      ))
    )}
    <mesh position={[0, h - 0.08, 0]} material={paint("concrete")} {...sh}><boxGeometry args={[0.55, 0.16, w * 1.05]} /></mesh>
  </group>
);

export type BridgeProps = Group & {
  spans?: number;
  spanLength?: number;
  /** deck height above the ground / water */
  height?: number;
  width?: number;
  piers?: "wall" | "columns";
  /** wrap span i (e.g. in a Failure3D): the span's origin is its left end at deck level */
  wrapSpan?: Partial<Record<number, (el: React.ReactNode) => React.ReactNode>>;
};

/** GirderBridge: a deck on steel or concrete girders over piers. Spans run along x, centred. */
export const GirderBridge: React.FC<BridgeProps & { girders?: number }> = ({ spans = 3, spanLength = 4, height = 2.2, width = 1.6, piers = "wall", girders = 3, wrapSpan, ...g }) => {
  const { paint } = useDLook();
  const total = spans * spanLength;
  const x0 = -total / 2;
  return (
    <group {...g}>
      {Array.from({ length: spans + 1 }, (_, i) => (
        <Pier key={i} x={x0 + i * spanLength} h={height - 0.34} w={width} paint={paint} kind={i === 0 || i === spans ? "wall" : piers} />
      ))}
      {Array.from({ length: spans }, (_, i) => {
        const el = (
          <group>
            <mesh position={[spanLength / 2, 0, 0]} material={paint("concrete")} {...sh}><boxGeometry args={[spanLength - 0.04, 0.12, width]} /></mesh>
            {/* lane line and parapets */}
            <mesh position={[spanLength / 2, 0.061, 0]} material={paint("accent", "#f2d14b")}><boxGeometry args={[spanLength - 0.1, 0.003, 0.04]} /></mesh>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[spanLength / 2, 0.14, s * (width / 2 - 0.04)]} material={paint("steel")} {...sh}><boxGeometry args={[spanLength - 0.04, 0.16, 0.05]} /></mesh>
            ))}
            {Array.from({ length: girders }, (_, k) => {
              const z = (k - (girders - 1) / 2) * (width * 0.7 / Math.max(1, girders - 1));
              return (
                <group key={k} position={[spanLength / 2, -0.2, z]}>
                  <mesh material={paint("steel")} {...sh}><boxGeometry args={[spanLength - 0.06, 0.24, 0.04]} /></mesh>
                  <mesh position={[0, -0.12, 0]} material={paint("steel")} {...sh}><boxGeometry args={[spanLength - 0.06, 0.03, 0.16]} /></mesh>
                </group>
              );
            })}
          </group>
        );
        return (
          <group key={i} position={[x0 + i * spanLength, height, 0]}>
            {wrapSpan?.[i] ? wrapSpan[i]!(el) : el}
          </group>
        );
      })}
    </group>
  );
};

/** TrussBridge: a through truss (Warren with verticals) per span: chords, diagonals, cross bracing
 * overhead, the deck between. Spans along x, centred. */
export const TrussBridge: React.FC<BridgeProps & { panels?: number; trussHeight?: number }> = ({
  spans = 2, spanLength = 5, height = 2.4, width = 1.5, piers = "wall", panels = 6, trussHeight = 1.1, wrapSpan, ...g
}) => {
  const { paint } = useDLook();
  const steel = paint("steel", "#8c5a3c");
  const total = spans * spanLength;
  const x0 = -total / 2;
  const span = useMemo(() => {
    const out: { a: V3; b: V3; t: number }[] = [];
    const p = spanLength / panels;
    for (const z of [-width / 2, width / 2]) {
      out.push({ a: [0, 0, z], b: [spanLength, 0, z], t: 0.08 });
      out.push({ a: [p, trussHeight, z], b: [spanLength - p, trussHeight, z], t: 0.08 });
      out.push({ a: [0, 0, z], b: [p, trussHeight, z], t: 0.07 });
      out.push({ a: [spanLength, 0, z], b: [spanLength - p, trussHeight, z], t: 0.07 });
      for (let i = 1; i < panels; i++) {
        out.push({ a: [i * p, 0, z], b: [i * p, trussHeight, z], t: 0.045 });
        if (i < panels - 1) out.push({ a: i % 2 ? [i * p, trussHeight, z] : [i * p, 0, z], b: i % 2 ? [(i + 1) * p, 0, z] : [(i + 1) * p, trussHeight, z], t: 0.05 });
      }
    }
    for (let i = 1; i < panels; i++) {
      out.push({ a: [i * p, trussHeight, -width / 2], b: [i * p, trussHeight, width / 2], t: 0.04 });
      if (i < panels - 1) out.push({ a: [i * p, trussHeight, -width / 2], b: [(i + 1) * p, trussHeight, width / 2], t: 0.03 });
    }
    return out;
  }, [spanLength, panels, width, trussHeight]);
  return (
    <group {...g}>
      {Array.from({ length: spans + 1 }, (_, i) => (
        <Pier key={i} x={x0 + i * spanLength} h={height - 0.1} w={width} paint={paint} kind={i === 0 || i === spans ? "wall" : piers} />
      ))}
      {Array.from({ length: spans }, (_, i) => {
        const el = (
          <group>
            <mesh position={[spanLength / 2, 0.02, 0]} material={paint("concrete")} {...sh}><boxGeometry args={[spanLength - 0.04, 0.08, width - 0.06]} /></mesh>
            {span.map((m, k) => <Member key={k} a={m.a} b={m.b} t={m.t} material={steel} />)}
          </group>
        );
        return <group key={i} position={[x0 + i * spanLength, height, 0]}>{wrapSpan?.[i] ? wrapSpan[i]!(el) : el}</group>;
      })}
    </group>
  );
};

// ---------------------------------------------------------------- Dam

export type DamProps = Group & {
  kind?: "gravity" | "arch";
  /** crest length across the valley (gravity) or chord (arch) */
  length?: number;
  height?: number;
  /** reservoir level as a fraction of the dam height (≥1 overtops) */
  level?: number;
  /** how far upstream the reservoir runs */
  reach?: number;
  /** spillway gates on the crest */
  gates?: number;
  /** the flow over the crest when overtopping, 0..1 (also turns on at level > 1) */
  overflow?: number;
  frame?: number;
};

/** Dam across a valley: dam along z, upstream toward -x, reservoir a water box filled to `level`,
 * valley sides as stepped rock slabs, a river downstream. Origin at the dam's foot centre. */
export const Dam: React.FC<DamProps> = ({ kind = "gravity", length = 8, height = 3, level = 0.6, reach = 9, gates = 4, overflow, frame = 0, ...g }) => {
  const { paint } = useDLook();
  const geo = useMemo(() => {
    if (kind === "gravity") {
      // cross-section: vertical upstream face, sloped downstream face, crest road
      const s = new THREE.Shape();
      const base = height * 0.8, crest = height * 0.12;
      s.moveTo(0, 0); s.lineTo(base, 0); s.lineTo(crest, height); s.lineTo(0, height); s.closePath();
      const geom = new THREE.ExtrudeGeometry(s, { depth: length, bevelEnabled: false });
      geom.translate(-crest / 2, 0, -length / 2);
      geom.computeVertexNormals();
      return geom;
    }
    // arch: a curved wall in plan, thicker at the base (taper by height)
    const R = length * 0.75, ang = 2 * Math.asin(Math.min(0.99, length / 2 / R));
    const s = new THREE.Shape();
    const th = height * 0.18;
    // convex toward the reservoir (upstream, -x): the arc around angle π
    s.absarc(0, 0, R, Math.PI - ang / 2, Math.PI + ang / 2, false);
    s.absarc(0, 0, R - th, Math.PI + ang / 2, Math.PI - ang / 2, true);
    const geom = new THREE.ExtrudeGeometry(s, { depth: height, bevelEnabled: false, curveSegments: 40 });
    geom.rotateX(-Math.PI / 2); // depth → +y
    const p = geom.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      // thinner toward the crest: pull the inner (downstream) face out toward the outer one
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const r = Math.hypot(x, z);
      if (r < R - th * 0.5) {
        const nr = R - th * (1 - 0.55 * (y / height));
        p.setX(i, (x * nr) / r);
        p.setZ(i, (z * nr) / r);
      }
    }
    geom.translate(R - th / 2, 0, 0);
    geom.computeVertexNormals();
    return geom;
  }, [kind, length, height]);
  const bank = useMemo(() => {
    const w = height * 1.6, sh2 = new THREE.Shape();
    sh2.moveTo(0, 0); sh2.lineTo(0, height * 1.12); sh2.lineTo(w * 0.35, height * 1.12); sh2.lineTo(w, 0); sh2.closePath();
    const g2 = new THREE.ExtrudeGeometry(sh2, { depth: reach + 4, bevelEnabled: false });
    // shape x → world +z (outward), shape y → up, extrusion → along +x
    g2.rotateY(-Math.PI / 2);
    g2.translate(reach + 4, 0, 0);
    g2.computeVertexNormals();
    return g2;
  }, [height, reach]);
  const lv = Math.max(0, level);
  const waterH = Math.min(lv, 1.04) * height;
  const over = overflow ?? Math.max(0, Math.min(1, (lv - 1) * 8));
  const flick = 0.85 + 0.15 * Math.sin(frame * 0.7);
  const upFace = kind === "gravity" ? -height * 0.06 : -0.1;
  return (
    <group {...g}>
      <mesh geometry={geo} material={paint("concrete")} {...sh} />
      {/* crest road and gate piers */}
      {kind === "gravity" && (
        <group position={[0, height, 0]}>
          <mesh position={[0, 0.05, 0]} material={paint("concrete")} {...sh}><boxGeometry args={[height * 0.18, 0.1, length]} /></mesh>
          {Array.from({ length: gates + 1 }, (_, i) => (
            <mesh key={i} position={[0, 0.22, -length * 0.25 + (i * length * 0.5) / gates]} material={paint("concrete")} {...sh}><boxGeometry args={[0.32, 0.36, 0.12]} /></mesh>
          ))}
        </group>
      )}
      {/* valley sides: sloped banks rising to the dam's ends (wedges, so a high camera sees over them) */}
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={bank} position={[-reach + 1, 0, s * (length / 2)]} scale={[1, 1, s]} material={paint("ground")} {...sh} />
      ))}
      {/* reservoir: a water block whose top is the level */}
      {waterH > 0.01 && (
        <mesh position={[upFace - reach / 2, waterH / 2, 0]} material={paint("water")} receiveShadow>
          <boxGeometry args={[reach, waterH, length + 1.2]} />
        </mesh>
      )}
      {/* downstream river */}
      <mesh position={[reach * 0.4, 0.02, 0]} rotation-x={-Math.PI / 2} material={paint("water")} receiveShadow>
        <planeGeometry args={[reach * 0.8, length * 0.35]} />
      </mesh>
      {/* overtopping sheet down the face */}
      {over > 0.01 && (
        <mesh position={[height * 0.42, height * 0.5, 0]} rotation-z={kind === "gravity" ? Math.atan2(height * 0.68, height) : 0} material={paint("water")}>
          <boxGeometry args={[0.06 * flick + 0.02, height * 1.15 * over, length * 0.95]} />
        </mesh>
      )}
    </group>
  );
};

// ---------------------------------------------------------------- Building

export type BuildingProps = Group & {
  floors?: number;
  floorHeight?: number;
  /** bays along x and z */
  bays?: [number, number];
  bay?: number;
  /** "frame" (exposed columns and slabs), "glass" (curtain wall, translucent), "atrium" (open middle) */
  skin?: "frame" | "glass" | "atrium";
  /** suspended walkways across the atrium on these floors (Hyatt Regency 1981: 2 and 4, one hung under the other) */
  walkways?: number[];
  wrapWalkway?: Partial<Record<number, (el: React.ReactNode) => React.ReactNode>>;
  /** wrap one column (index into the grid, row-major) */
  wrapColumn?: Partial<Record<number, (el: React.ReactNode) => React.ReactNode>>;
};

/** Building: a column grid with floor slabs, standing on y=0, centred. */
export const Building: React.FC<BuildingProps> = ({ floors = 6, floorHeight = 0.7, bays = [4, 3], bay = 1.2, skin = "frame", walkways = [], wrapWalkway, wrapColumn, ...g }) => {
  const { paint } = useDLook();
  const W = bays[0] * bay, D = bays[1] * bay, H = floors * floorHeight;
  const cols: V3[] = [];
  for (let i = 0; i <= bays[0]; i++) for (let k = 0; k <= bays[1]; k++) cols.push([-W / 2 + i * bay, 0, -D / 2 + k * bay]);
  const atrium = skin === "atrium";
  return (
    <group {...g}>
      {cols.map((c, i) => {
        const el = <mesh position={[c[0], H / 2, c[2]]} material={paint("concrete")} {...sh}><boxGeometry args={[0.12, H, 0.12]} /></mesh>;
        return <React.Fragment key={i}>{wrapColumn?.[i] ? wrapColumn[i]!(el) : el}</React.Fragment>;
      })}
      {Array.from({ length: floors }, (_, f) => {
        const y = (f + 1) * floorHeight;
        return atrium && f < floors - 1 ? (
          // a ring of slab around an open atrium
          <group key={f} position={[0, y, 0]}>
            {[-1, 1].map((s) => (
              <mesh key={`x${s}`} position={[0, 0, s * (D / 2 - bay / 2)]} material={paint("concrete")} {...sh}><boxGeometry args={[W + 0.2, 0.1, bay + 0.2]} /></mesh>
            ))}
            {[-1, 1].map((s) => (
              <mesh key={`z${s}`} position={[s * (W / 2 - bay / 2), 0, 0]} material={paint("concrete")} {...sh}><boxGeometry args={[bay + 0.2, 0.1, D - bay * 2]} /></mesh>
            ))}
          </group>
        ) : (
          <mesh key={f} position={[0, y, 0]} material={paint("concrete")} {...sh}><boxGeometry args={[W + 0.2, 0.1, D + 0.2]} /></mesh>
        );
      })}
      {skin === "glass" && (
        <mesh position={[0, H / 2, 0]} material={paint("glass", "#7fb2d9")}>
          <boxGeometry args={[W + 0.24, H, D + 0.24]} />
        </mesh>
      )}
      {walkways.map((f, i) => {
        const y = f * floorHeight;
        const top = H;
        const el = (
          <group>
            <mesh position={[0, y, 0]} material={paint("body")} {...sh}><boxGeometry args={[W - bay * 2 + 0.2, 0.08, 0.5]} /></mesh>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[0, y + 0.16, s * 0.24]} material={paint("steel")} {...sh}><boxGeometry args={[W - bay * 2 + 0.2, 0.22, 0.02]} /></mesh>
            ))}
            {/* hanger rods from the roof */}
            {[-0.5, -0.17, 0.17, 0.5].map((u) => [-1, 1].map((s) => (
              <mesh key={`${u}${s}`} position={[u * (W - bay * 2), (y + top) / 2, s * 0.27]} material={paint("metal")}>
                <cylinderGeometry args={[0.012, 0.012, top - y, 6]} />
              </mesh>
            )))}
          </group>
        );
        return <React.Fragment key={i}>{wrapWalkway?.[f] ? wrapWalkway[f]!(el) : el}</React.Fragment>;
      })}
    </group>
  );
};

// ---------------------------------------------------------------- Ride

export type RideProps = Group & {
  /** "arm": a tower with a swinging arm and a gondola ring (pendulum/top-spin type); "coaster": a
   * track segment along a curve with one car */
  kind?: "arm" | "coaster";
  /** arm angle (rad) */
  swing?: number;
  /** gondola spin (rad) */
  spin?: number;
  /** coaster: points of the track, and where the car is (0..1) */
  track?: V3[];
  at?: number;
  wrapArm?: (el: React.ReactNode) => React.ReactNode;
};

/** Ride: a generic fairground ride (no riders shown). */
export const Ride: React.FC<RideProps> = ({ kind = "arm", swing = 0.6, spin = 0, track, at = 0.3, wrapArm, ...g }) => {
  const { paint } = useDLook();
  const curve = useMemo(() => {
    const pts = track ?? [[-5, 0.6, 0], [-3, 3.2, 0], [-1, 4.2, 0.5], [1, 1.4, 1.2], [3, 2.6, 0.4], [5, 0.8, -0.4]];
    return new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  }, [track]);
  const rails = useMemo(() => kind === "coaster" ? [-0.18, 0.18].map((o) => {
    const pts = curve.getSpacedPoints(160).map((p, i, arr) => {
      const n = arr[Math.min(arr.length - 1, i + 1)]!.clone().sub(arr[Math.max(0, i - 1)]!).normalize();
      const side = new THREE.Vector3().crossVectors(n, new THREE.Vector3(0, 1, 0)).normalize();
      return p.clone().addScaledVector(side, o);
    });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 200, 0.035, 6);
  }) : [], [kind, curve]);
  if (kind === "coaster") {
    const p = curve.getPointAt(at), t = curve.getTangentAt(at);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), t);
    return (
      <group {...g}>
        {rails.map((r, i) => <mesh key={i} geometry={r} material={paint("accent", "#d62828")} castShadow />)}
        {curve.getSpacedPoints(24).map((s, i) => (
          <mesh key={i} position={[s.x, s.y / 2, s.z]} material={paint("steel")} castShadow><cylinderGeometry args={[0.05, 0.07, s.y, 8]} /></mesh>
        ))}
        <group position={p} quaternion={q}>
          <mesh position={[0, 0.16, 0]} material={paint("trim", "#1f4e9c")} {...sh}><boxGeometry args={[0.7, 0.24, 0.5]} /></mesh>
        </group>
      </group>
    );
  }
  const towerH = 3.2, armL = 2.6;
  const arm = (
    <group rotation-z={swing}>
      <mesh position={[0, -armL / 2, 0]} material={paint("accent", "#e63946")} {...sh}><boxGeometry args={[0.18, armL, 0.18]} /></mesh>
      <group position={[0, -armL, 0]} rotation-y={spin}>
        <mesh material={paint("trim", "#f4a261")} {...sh}><cylinderGeometry args={[0.9, 0.9, 0.14, 24]} /></mesh>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.78, 0.18, Math.sin(a) * 0.78]} rotation-y={-a} material={paint("dark")} {...sh}>
              <boxGeometry args={[0.16, 0.24, 0.2]} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
  return (
    <group {...g}>
      <mesh position={[0, 0.1, 0]} material={paint("concrete")} {...sh}><cylinderGeometry args={[1.6, 1.8, 0.2, 32]} /></mesh>
      {[-1, 1].map((s) => (
        <Member key={s} a={[s * 1.1, 0.2, 0.5]} b={[0, towerH, 0.3]} t={0.16} material={paint("steel")} />
      ))}
      {[-1, 1].map((s) => (
        <Member key={`b${s}`} a={[s * 1.1, 0.2, -0.5]} b={[0, towerH, -0.3]} t={0.16} material={paint("steel")} />
      ))}
      <mesh position={[0, towerH, 0]} rotation-x={Math.PI / 2} material={paint("metal")} {...sh}><cylinderGeometry args={[0.16, 0.16, 0.9, 16]} /></mesh>
      <group position={[0, towerH, 0]}>{wrapArm ? wrapArm(arm) : arm}</group>
    </group>
  );
};
