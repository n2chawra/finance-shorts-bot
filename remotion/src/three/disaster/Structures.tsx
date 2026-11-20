// Structures: parametric bridges, dams, buildings and fairground rides, painted through the look.
// Each exposes `wrap` hooks on the part that fails (a span, a walkway, the ride's arm) so a
// Failure3D can go around exactly that part.
import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { rnd, type V3 } from "../core";
import { canvasTexture } from "../textures";
import { Smoke } from "./Atmos3D";
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
  seed?: string;
};

const vnoise = (seed: string, x: number, z: number) => {
  const xi = Math.floor(x), zi = Math.floor(z), fx = x - xi, fz = z - zi;
  const h = (i: number, k: number) => rnd(seed, (i + 1000) * 7919 + (k + 1000));
  const sx = fx * fx * (3 - 2 * fx), sz = fz * fz * (3 - 2 * fz);
  return (h(xi, zi) * (1 - sx) + h(xi + 1, zi) * sx) * (1 - sz) + (h(xi, zi + 1) * (1 - sx) + h(xi + 1, zi + 1) * sx) * sz;
};

/** Falling water: soft vertical streaks and foam on a translucent sheet, tiled and scrolled. */
function waterStreakTexture(): THREE.Texture {
  return canvasTexture("dam-streaks", 128, 512, (g) => {
    g.fillStyle = "rgba(220,236,248,0.55)";
    g.fillRect(0, 0, 128, 512);
    for (let i = 0; i < 70; i++) {
      const x = rnd("streak", i) * 128, w = 1 + rnd("streak", i + 100) * 4, y = rnd("streak", i + 200) * 512, l = 60 + rnd("streak", i + 300) * 260;
      const a = 0.25 + rnd("streak", i + 400) * 0.6;
      for (const dy of [0, -512]) {
        const gr = g.createLinearGradient(0, y + dy, 0, y + dy + l);
        gr.addColorStop(0, "rgba(255,255,255,0)");
        gr.addColorStop(0.5, `rgba(255,255,255,${a})`);
        gr.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = gr;
        g.fillRect(x, y + dy, w, l);
      }
    }
    for (let i = 0; i < 26; i++) {
      const x = rnd("foam", i) * 128, y = rnd("foam", i + 50) * 512, r = 6 + rnd("foam", i + 90) * 16;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, "rgba(255,255,255,0.7)");
      gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
  });
}

/** A ribbon along a profile in the xy plane, swept across z: u across, v along the profile (world length). */
function ribbon(profile: [number, number][], width: number, segZ = 24): THREE.BufferGeometry {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  let s = 0;
  profile.forEach(([x, y], i) => {
    if (i > 0) s += Math.hypot(x - profile[i - 1]![0], y - profile[i - 1]![1]);
    for (let k = 0; k <= segZ; k++) {
      const u = k / segZ;
      pos.push(x, y, (u - 0.5) * width);
      uv.push(u * width * 0.5, -s * 0.35);
    }
  });
  const row = segZ + 1;
  for (let i = 0; i < profile.length - 1; i++) for (let k = 0; k < segZ; k++) {
    const a = i * row + k, b = a + 1, c = a + row, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Dam across a valley: dam along z, upstream toward -x, the reservoir filled to `level`, valley
 * walls as a seeded terrain that rises past the dam's ends and falls away downstream (so a 9:16 shot
 * from downstream sees the face, the reservoir and the pour), a river below. Overtopping pours as a
 * streaming sheet over the crest and down the face, with spray at the toe. Origin at the dam's foot
 * centre. */
export const Dam: React.FC<DamProps> = ({ kind = "gravity", length = 8, height = 3, level = 0.6, reach = 9, gates = 4, overflow, frame = 0, seed = "dam", ...g }) => {
  const look = useDLook();
  const { paint } = look;
  const base = height * 0.8, crest = height * 0.12;
  const geo = useMemo(() => {
    if (kind === "gravity") {
      // cross-section: vertical upstream face, sloped downstream face, crest road; keyed into the walls
      const s = new THREE.Shape();
      s.moveTo(0, 0); s.lineTo(base, 0); s.lineTo(crest, height); s.lineTo(0, height); s.closePath();
      const depth = length + height * 0.6;
      const geom = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
      geom.translate(-crest / 2, 0, -depth / 2);
      geom.computeVertexNormals();
      return geom;
    }
    // arch: a curved wall in plan, thicker at the base (taper by height)
    const R = length * 0.75, ang = 2 * Math.asin(Math.min(0.99, length / 2 / R));
    const s = new THREE.Shape();
    const th = height * 0.18;
    s.absarc(0, 0, R, Math.PI - ang / 2, Math.PI + ang / 2, false);
    s.absarc(0, 0, R - th, Math.PI + ang / 2, Math.PI - ang / 2, true);
    const geom = new THREE.ExtrudeGeometry(s, { depth: height, bevelEnabled: false, curveSegments: 40 });
    geom.rotateX(-Math.PI / 2);
    const p = geom.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
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
  }, [kind, length, height, base, crest]);

  // the valley: a V narrowing to the river, its walls meeting the crest at the dam's ends, rolling
  // ground beyond, an upstream rim closing the reservoir; seeded relief on the walls only
  const down = height * 3.2;
  const terrain = useMemo(() => {
    const W = length + height * 9;
    const sizeX = reach + 2 + down;
    const t = new THREE.PlaneGeometry(sizeX, W, 140, 110);
    t.rotateX(-Math.PI / 2);
    t.translate(-(reach + 2) + sizeX / 2, 0, 0);
    const p = t.attributes.position as THREE.BufferAttribute;
    const floorHalf = length * 0.18;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), az = Math.abs(z);
      const u = Math.min(1, Math.max(0, (az - floorHalf) / (length / 2 + 0.12 - floorHalf)));
      let h = height * 1.06 * Math.pow(u, 1.25);
      h += height * 0.22 * Math.min(1, Math.max(0, (az - length / 2) / (height * 1.6)));
      h *= 1 - 0.5 * Math.min(1, Math.max(0, (x - base) / down));
      h += height * 1.2 * Math.min(1, Math.max(0, (-x - (reach - 1.2)) / 2.4));
      h += (vnoise(seed, x * 0.9, z * 0.9) - 0.5) * height * 0.16 * u + (vnoise(`${seed}f`, x * 2.6, z * 2.6) - 0.5) * height * 0.05 * u;
      p.setY(i, x < 0 && u < 0.05 ? h - 0.06 : h);
    }
    t.computeVertexNormals();
    return t;
  }, [length, height, reach, down, base, seed]);

  const lv = Math.max(0, level);
  const waterH = Math.min(lv, 1.04) * height;
  const over = overflow ?? Math.max(0, Math.min(1, (lv - 1) * 8));
  const upFace = kind === "gravity" ? -crest / 2 : -0.1;
  const toe = base - crest / 2;

  // the pour: over the crest, round the lip, down the face, out along the river
  const sheetW = length * 0.9;
  const sheet = useMemo(() => {
    if (kind !== "gravity") return null;
    const fx = toe - crest / 2, fy = -height, fl = Math.hypot(fx, fy);
    const n: [number, number] = [-fy / fl, fx / fl];
    const thk = 0.05;
    const prof: [number, number][] = [[upFace - 0.05, height * 1.04], [crest / 2 - 0.05, height * 1.035], [crest / 2 + 0.03, height + 0.01]];
    for (let i = 1; i <= 12; i++) {
      const u = i / 12;
      prof.push([crest / 2 + fx * u + n[0] * thk * (1 + u), height + fy * u + n[1] * thk * (1 + u)]);
    }
    prof.push([toe + 0.35, 0.09], [toe + 1.0, 0.05], [toe + 2.2, 0.035]);
    return ribbon(prof, sheetW);
  }, [kind, toe, crest, height, upFace, sheetW]);
  const sheetMat = useMemo(() => {
    const tex = waterStreakTexture().clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ color: look.clay ? "#bcdcf4" : "#e4f1fb", map: tex, transparent: true, roughness: 0.25, metalness: 0, side: THREE.DoubleSide, depthWrite: false });
  }, [look.clay]);
  (sheetMat.map as THREE.Texture).offset.set(0, frame * 0.055);
  sheetMat.opacity = Math.min(0.9, over * 1.6);
  const fx = toe - crest / 2;

  return (
    <group {...g}>
      <mesh geometry={geo} material={paint("concrete")} {...sh} />
      {/* block joints down the face: they give the face scale and read through the pour */}
      {kind === "gravity" && Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[crest / 2 + fx / 2 + 0.006, height / 2, (i / 8 - 0.5) * length]} rotation-z={Math.atan2(-height, fx)} material={paint("dark", "#55524c")}>
          <boxGeometry args={[Math.hypot(fx, height), 0.02, 0.025]} />
        </mesh>
      ))}
      {kind === "gravity" && (
        <group position={[0, height, 0]}>
          <mesh position={[0, 0.05, 0]} material={paint("concrete")} {...sh}><boxGeometry args={[crest * 1.1, 0.1, length + height * 0.6]} /></mesh>
          {Array.from({ length: gates + 1 }, (_, i) => (
            <mesh key={i} position={[0, 0.22, -length * 0.25 + (i * length * 0.5) / gates]} material={paint("concrete")} {...sh}><boxGeometry args={[0.32, 0.36, 0.12]} /></mesh>
          ))}
        </group>
      )}
      <mesh geometry={terrain} material={paint("ground")} receiveShadow castShadow />
      {/* reservoir: a water block whose top is the level */}
      {waterH > 0.01 && (
        <mesh position={[upFace - reach / 2 - 0.02, waterH / 2 - 0.05, 0]} material={paint("water")} receiveShadow>
          <boxGeometry args={[reach, waterH + 0.1, length + height * 3]} />
        </mesh>
      )}
      {/* downstream river */}
      <mesh position={[toe + down / 2, 0.02, 0]} rotation-x={-Math.PI / 2} material={paint("water")} receiveShadow>
        <planeGeometry args={[down + 0.4, length * 0.5]} />
      </mesh>
      {sheet && over > 0.01 && <mesh geometry={sheet} material={sheetMat} renderOrder={4} />}
      {over > 0.05 && [-0.33, 0, 0.33].map((u, i) => (
        <Smoke key={i} frame={frame + i * 17} at={[toe + 0.15, 0.05, u * sheetW]} height={height * 0.55} width={height * 0.6} count={12} life={46}
          wind={[1.6, 0, 0]} color="#f2f6fa" opacity={0.55 * Math.min(1, over * 1.4)} seed={`${seed}spray${i}`} />
      ))}
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
