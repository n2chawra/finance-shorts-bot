// The Hyatt Regency (Kansas City, 1981) as one 3D world shared by every 3D beat of this video: the atrium
// (terrazzo floor with a parquet dance floor, round tables and chairs, planters, a bandstand, the tower wall
// with its floor slabs and lit windows, the function-block terraces, steel roof trusses and a glass roof with
// mullions), the three walkways (concrete decks on steel stringers, glass panels between posts, a handrail,
// three box beams each hung on two rods), the hotel from outside (tower, atrium, function block) and the box
// beam joint in cutaway. Materials are textured in code (terrazzo, concrete, brushed and painted steel,
// parquet, linen) so nothing reads as a grey box (lessons.md 5). No people are drawn.
// Scale: one unit is about three metres; the walkways run along x.
import React from "react";
import { Easing } from "remotion";
import { canvasTexture, Failure3D, glow, mat, rnd, type V3 } from "../../three/index";

type Mat = ReturnType<typeof mat>;

export const FH = 1.3;
export const UPPER_Y = 4 * FH, LOWER_Y = 2 * FH, THIRD_Y = 3 * FH;
export const ROOF_Y = 7.6;
export const SPAN = 12;
export const HANGERS = [-4, 0, 4];
export const ROD_Z = 0.55;
export const THIRD_Z = -3.4;
export const WARM = "#ffb46a";
export const sh = { castShadow: true, receiveShadow: true } as const;

// ------------------------------------------------------------------ textures and materials (cached)

const tex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat: [number, number], srgb = true) => {
  const t = canvasTexture(`hy42-${key}`, w, h, draw, srgb);
  t.wrapS = t.wrapT = 1000;   // RepeatWrapping
  t.repeat.set(repeat[0], repeat[1]);
  return t;
};

const speckle = (g: CanvasRenderingContext2D, w: number, h: number, base: string, dots: string[], n: number, seed: string, r = 1.4) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) {
    g.fillStyle = dots[i % dots.length]!;
    g.globalAlpha = 0.25 + 0.6 * rnd(seed, i * 3);
    g.beginPath(); g.arc(rnd(seed, i * 3 + 1) * w, rnd(seed, i * 3 + 2) * h, r * (0.4 + rnd(seed, i * 7) * 1.4), 0, 6.283); g.fill();
  }
  g.globalAlpha = 1;
};

const MATS = new Map<string, Mat>();
const once = (key: string, make: () => Mat) => {
  let m = MATS.get(key);
  if (!m) { m = make(); MATS.set(key, m); }
  return m;
};

export const M = {
  terrazzo: () => once("terrazzo", () => mat("white", undefined, {
    map: tex("terrazzo", 512, 512, (g) => {
      speckle(g, 512, 512, "#cfc6b6", ["#8d8475", "#f3eee4", "#6f6a62", "#b9a98e"], 2600, "tz", 1.6);
      g.strokeStyle = "rgba(90,82,70,0.55)"; g.lineWidth = 3; g.strokeRect(0, 0, 512, 512);
    }, [10, 8]),
    roughness: 0.32, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.25,
  })),
  parquet: () => once("parquet", () => mat("white", undefined, {
    map: tex("parquet", 512, 512, (g) => {
      for (let i = 0; i < 8; i++) for (let k = 0; k < 8; k++) {
        const v = 0.75 + 0.25 * rnd("pq", i * 9 + k);
        g.fillStyle = `rgb(${Math.round(150 * v)},${Math.round(98 * v)},${Math.round(58 * v)})`;
        g.fillRect(i * 64, k * 64, 64, 64);
        g.strokeStyle = "rgba(40,22,10,0.35)";
        for (let s = 0; s < 4; s++) {
          g.beginPath();
          if ((i + k) % 2) { g.moveTo(i * 64, k * 64 + s * 16); g.lineTo(i * 64 + 64, k * 64 + s * 16); } else { g.moveTo(i * 64 + s * 16, k * 64); g.lineTo(i * 64 + s * 16, k * 64 + 64); }
          g.stroke();
        }
      }
    }, [3, 2]),
    roughness: 0.28, metalness: 0, clearcoat: 0.8, clearcoatRoughness: 0.15,
  })),
  concrete: () => once("concrete", () => mat("white", undefined, {
    map: tex("concrete", 256, 256, (g) => speckle(g, 256, 256, "#b9b3a8", ["#8f897f", "#d5d0c6", "#a29b8f"], 1800, "cc", 1.1), [4, 4]),
    roughness: 0.92, metalness: 0,
  })),
  wall: () => once("wall", () => mat("white", undefined, {
    map: tex("wall", 256, 256, (g) => speckle(g, 256, 256, "#b7ab98", ["#9f9482", "#cbc1b1"], 900, "wl", 1.2), [6, 3]),
    roughness: 0.85, metalness: 0,
  })),
  /** painted structural steel: off-white enamel with a little wear */
  painted: () => once("painted", () => mat("white", undefined, {
    map: tex("painted", 256, 64, (g) => speckle(g, 256, 64, "#e4e1da", ["#b8b2a6", "#f7f5f0", "#8e8a82"], 220, "pt", 0.9), [4, 1]),
    roughness: 0.42, metalness: 0.25, clearcoat: 0.4, clearcoatRoughness: 0.3,
  })),
  /** bare brushed steel (rods, nuts, the cut faces) */
  steel: () => once("steel", () => mat("white", undefined, {
    map: tex("brushed", 256, 256, (g) => {
      g.fillStyle = "#9aa1a9"; g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 600; i++) {
        g.strokeStyle = `rgba(${rnd("bs", i) > 0.5 ? "230,235,240" : "60,64,70"},${0.08 + 0.12 * rnd("bs", i + 9)})`;
        const y = rnd("bs", i + 3) * 256; g.beginPath(); g.moveTo(0, y); g.lineTo(256, y + (rnd("bs", i + 5) - 0.5) * 4); g.stroke();
      }
    }, [1, 2]),
    roughness: 0.3, metalness: 0.95,
  })),
  darkSteel: () => once("darkSteel", () => mat("white", undefined, { color: "#3a3f46", roughness: 0.38, metalness: 0.9 })),
  /** the box beam channels: mill-scale steel, blue-grey with rust flecks */
  millscale: () => once("millscale", () => mat("white", undefined, {
    map: tex("mill2", 512, 256, (g) => {
      g.fillStyle = "#56606a"; g.fillRect(0, 0, 512, 256);
      for (let i = 0; i < 900; i++) {
        g.strokeStyle = `rgba(${rnd("ms", i) > 0.5 ? "150,160,170" : "30,34,40"},${0.05 + 0.08 * rnd("ms", i + 7)})`;
        const y = rnd("ms", i + 3) * 256; g.lineWidth = 1 + rnd("ms", i + 11) * 2;
        g.beginPath(); g.moveTo(rnd("ms", i + 5) * 200, y); g.lineTo(200 + rnd("ms", i + 9) * 312, y + (rnd("ms", i + 13) - 0.5) * 3); g.stroke();
      }
      for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(120,70,40,${0.12 + 0.1 * rnd("rs", i)})`; g.beginPath(); g.ellipse(rnd("rs", i + 1) * 512, rnd("rs", i + 2) * 256, 6 + rnd("rs", i + 3) * 14, 2 + rnd("rs", i + 4) * 4, 0, 0, 6.283); g.fill(); }
    }, [1, 1]),
    roughness: 0.42, metalness: 0.85, clearcoat: 0.15,
  })),
  ghost: () => once("ghost", () => mat("white", undefined, { color: "#9fc3e0", roughness: 0.1, metalness: 0, transparent: true, opacity: 0.07, depthWrite: false })),
  glass: () => once("glass", () => mat("white", undefined, { color: "#a9c7d8", roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.22, clearcoat: 1, depthWrite: false })),
  roofGlass: () => once("roofGlass", () => mat("white", undefined, { color: "#6f8fa8", roughness: 0.06, metalness: 0.2, transparent: true, opacity: 0.35, clearcoat: 1, depthWrite: false, side: 2 })),
  brass: () => once("brass", () => mat("white", undefined, { color: "#c9a25a", roughness: 0.25, metalness: 1 })),
  machine: () => once("machine", () => mat("white", undefined, { color: "#2f5d8c", roughness: 0.4, metalness: 0.5, clearcoat: 0.4 })),
  linen: () => once("linen", () => mat("white", undefined, { color: "#f2ede3", roughness: 0.85, metalness: 0, sheen: 0.6, sheenColor: "#ffffff" })),
  chair: () => once("chair", () => mat("white", undefined, { color: "#7b2f2a", roughness: 0.5, metalness: 0.1, clearcoat: 0.3 })),
  wood: () => once("wood", () => mat("white", undefined, { color: "#5a3a22", roughness: 0.45, metalness: 0, clearcoat: 0.5 })),
  leaf: () => once("leaf", () => mat("white", undefined, { color: "#2f5a35", roughness: 0.7, metalness: 0 })),
  pot: () => once("pot", () => mat("white", undefined, { color: "#6b5a48", roughness: 0.8 })),
  carpet: () => once("carpet", () => mat("white", undefined, {
    map: tex("carpet", 256, 256, (g) => speckle(g, 256, 256, "#3b2a2e", ["#5a3c42", "#2a1d20", "#7a5a3a"], 3000, "cp", 0.8), [3, 3]),
    roughness: 1, metalness: 0,
  })),
  windows: () => once("windows", () => mat("white", undefined, {
    map: tex("windows", 512, 1024, (g) => {
      g.fillStyle = "#1d2630"; g.fillRect(0, 0, 512, 1024);
      for (let r = 0; r < 40; r++) for (let c = 0; c < 12; c++) {
        const on = rnd("tw", r * 12 + c);
        g.fillStyle = on > 0.55 ? `rgba(255,${190 + Math.round(40 * on)},${120 + Math.round(60 * on)},${0.5 + on * 0.5})` : "rgba(70,95,120,0.9)";
        g.fillRect(c * 42 + 6, r * 25.6 + 4, 30, 17);
      }
    }, [1, 1]),
    emissive: "#ffffff", emissiveIntensity: 0.35, roughness: 0.3, metalness: 0.4,
  })),
  windowsDay: () => once("windowsDay", () => mat("white", undefined, {
    map: tex("windowsDay", 512, 1024, (g) => {
      g.fillStyle = "#c9c3b5"; g.fillRect(0, 0, 512, 1024);
      for (let r = 0; r < 40; r++) for (let c = 0; c < 12; c++) {
        const v = 0.6 + 0.3 * rnd("twd", r * 12 + c);
        g.fillStyle = `rgb(${Math.round(70 * v)},${Math.round(100 * v)},${Math.round(130 * v)})`;
        g.fillRect(c * 42 + 6, r * 25.6 + 4, 30, 17);
      }
    }, [1, 1]),
    roughness: 0.35, metalness: 0.2, clearcoat: 0.5,
  })),
};

// ------------------------------------------------------------------ the atrium

export type Light = "night" | "evening" | "day" | "dusk";

const Table: React.FC<{ x: number; z: number; lit: number }> = ({ x, z, lit }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 0.25, 0]} material={M.linen()} {...sh}><cylinderGeometry args={[0.3, 0.33, 0.04, 20]} /></mesh>
    <mesh position={[0, 0.14, 0]} material={M.linen()} castShadow><cylinderGeometry args={[0.31, 0.34, 0.22, 20, 1, true]} /></mesh>
    {lit > 0 && <mesh position={[0, 0.3, 0]} material={glow("#ffd9a0", 0.9 * lit)}><sphereGeometry args={[0.03, 8, 8]} /></mesh>}
    {[0, 1, 2, 3].map((i) => {
      const a = i * Math.PI / 2 + 0.4;
      return (
        <group key={i} position={[Math.cos(a) * 0.42, 0, Math.sin(a) * 0.42]} rotation-y={-a + Math.PI / 2}>
          <mesh position={[0, 0.14, 0]} material={M.chair()} castShadow><boxGeometry args={[0.16, 0.03, 0.16]} /></mesh>
          <mesh position={[0, 0.25, -0.075]} material={M.chair()} castShadow><boxGeometry args={[0.16, 0.2, 0.025]} /></mesh>
          {[-1, 1].map((s) => <mesh key={s} position={[s * 0.065, 0.065, 0]} material={M.darkSteel()}><cylinderGeometry args={[0.008, 0.008, 0.13, 4]} /></mesh>)}
        </group>
      );
    })}
  </group>
);

/** Table positions round the dance floor (seeded, kept clear of the floor and the walkways' landings). */
const TABLES: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (let i = 0; i < 70; i++) {
    const x = -8 + rnd("tbx", i) * 16, z = -5.6 + rnd("tbz", i) * 8.8;
    if (Math.abs(x) < 3.4 && z > -2.2 && z < 2.4) continue;          // dance floor
    if (out.some(([a, b]) => Math.hypot(a - x, b - z) < 1.15)) continue;
    out.push([x, z]);
  }
  return out;
})();

const Planter: React.FC<{ p: V3; s?: number }> = ({ p, s = 1 }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.18, 0]} material={M.pot()} castShadow><cylinderGeometry args={[0.22, 0.17, 0.36, 14]} /></mesh>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <mesh key={i} position={[Math.cos(i) * 0.12, 0.5 + rnd("pl", i) * 0.25, Math.sin(i) * 0.12]} material={M.leaf()} castShadow>
        <icosahedronGeometry args={[0.2 + rnd("pls", i) * 0.08, 0]} />
      </mesh>
    ))}
  </group>
);

/** The bandstand on the lobby floor's far side: a platform, music stands, speaker stacks, stage lights. */
export const Bandstand: React.FC<{ frame: number; on: number }> = ({ frame, on }) => (
  <group position={[0, 0, -4.9]}>
    <mesh position={[0, 0.12, 0]} material={M.carpet()} {...sh}><boxGeometry args={[4.4, 0.24, 1.4]} /></mesh>
    <mesh position={[0, 0.245, 0.7]} material={M.brass()}><boxGeometry args={[4.4, 0.02, 0.03]} /></mesh>
    {[-1.6, -0.8, 0, 0.8, 1.6].map((x, i) => (
      <group key={x} position={[x, 0.24, -0.1 + (i % 2) * 0.25]}>
        <mesh position={[0, 0.25, 0]} material={M.darkSteel()}><cylinderGeometry args={[0.01, 0.01, 0.5, 4]} /></mesh>
        <mesh position={[0, 0.5, 0.02]} rotation-x={-0.5} material={M.darkSteel()}><boxGeometry args={[0.22, 0.16, 0.01]} /></mesh>
      </group>
    ))}
    {[-2.4, 2.4].map((x) => <mesh key={x} position={[x, 0.55, 0]} material={M.darkSteel()} castShadow><boxGeometry args={[0.4, 1.1, 0.4]} /></mesh>)}
    {[-1.5, -0.5, 0.5, 1.5].map((x, i) => {
      const fl = on * (0.6 + 0.4 * Math.max(0, Math.sin(frame / 6 + i * 1.7)));
      const col = ["#ff9a5a", "#ffd84a", "#7fd0ff", "#ff6a8a"][i]!;
      return (
        <group key={x} position={[x, 1.6, 0.4]}>
          <mesh material={M.darkSteel()}><cylinderGeometry args={[0.07, 0.09, 0.16, 10]} /></mesh>
          {on > 0 && <mesh position={[0, -0.09, 0]} material={glow(col, Math.round(fl * 10) / 10)}><circleGeometry args={[0.07, 12]} /></mesh>}
          {on > 0 && <spotLight position={[0, 0, 0]} target-position={[x * 0.6, -1.6, 2.5]} angle={0.45} penumbra={0.8} intensity={14 * fl} distance={7} color={col} />}
        </group>
      );
    })}
  </group>
);

/** A news camera on a tripod on the second-floor terrace, panning with `pan`. */
export const NewsCamera: React.FC<{ p: V3; pan: number; rec: boolean; frame: number }> = ({ p, pan, rec, frame }) => (
  <group position={p}>
    {[0, 1, 2].map((i) => {
      const a = i * 2.094;
      return <mesh key={i} position={[Math.cos(a) * 0.12, 0.3, Math.sin(a) * 0.12]} rotation={[Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35]} material={M.darkSteel()}><cylinderGeometry args={[0.012, 0.012, 0.64, 5]} /></mesh>;
    })}
    <group position={[0, 0.64, 0]} rotation-y={pan}>
      <mesh material={M.darkSteel()} castShadow><boxGeometry args={[0.18, 0.2, 0.48]} /></mesh>
      <mesh position={[0, 0.02, 0.32]} rotation-x={Math.PI / 2} material={M.darkSteel()}><cylinderGeometry args={[0.06, 0.075, 0.2, 14]} /></mesh>
      <mesh position={[0, 0.02, 0.425]} rotation-x={Math.PI / 2} material={glow("#335a7a", 0.9)}><circleGeometry args={[0.055, 14]} /></mesh>
      <mesh position={[0, 0.14, -0.05]} material={M.darkSteel()}><boxGeometry args={[0.05, 0.08, 0.2]} /></mesh>
      {rec && Math.floor(frame / 15) % 2 === 0 && <mesh position={[0.095, 0.06, 0.18]} material={glow("#ff3b30")}><sphereGeometry args={[0.015, 8, 8]} /></mesh>}
    </group>
  </group>
);

/** The atrium interior. `light` sets the time of day; `dance` 0..1 the dance-floor lights; `tables` the
 * tables and chairs; `dim` fades the warm lights (after the collapse); `sun` 0..1 sweeps daylight across. */
export const Atrium: React.FC<{ frame: number; light: Light; dance?: number; dim?: number; sun?: number; band?: number; lamps?: number }> = ({
  frame, light, dance = 0, dim = 0, sun = 0.5, band = 0, lamps,
}) => {
  const day = light === "day";
  const warm = (lamps ?? (light === "night" ? 1 : light === "evening" ? 0.85 : light === "dusk" ? 0.6 : 0.25)) * (1 - dim);
  const tiles: React.ReactNode[] = [];
  if (dance > 0) {
    for (let i = 0; i < 6; i++) for (let k = 0; k < 4; k++) {
      const on = 0.3 + 0.7 * Math.max(0, Math.sin(frame / 8 + rnd("tile", i * 7 + k) * 6.28));
      const col = ["#ffb46a", "#ff7a59", "#ffd84a", "#7fd0ff"][(i + k) % 4]!;
      tiles.push(
        <mesh key={`${i}-${k}`} position={[-2.5 + i, 0.013, -1.5 + k]} rotation-x={-Math.PI / 2} material={glow(col, Math.round(dance * on * (1 - dim) * 10) / 10 * 0.32)}>
          <planeGeometry args={[0.96, 0.96]} />
        </mesh>,
      );
    }
  }
  const sunX = -8 + 16 * sun;
  return (
    <group>
      {/* floors: terrazzo with a parquet dance floor */}
      <mesh rotation-x={-Math.PI / 2} material={M.terrazzo()} receiveShadow><planeGeometry args={[44, 34]} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, 0]} material={M.parquet()} receiveShadow><planeGeometry args={[6.2, 4.2]} /></mesh>
      {tiles}
      {TABLES.map(([x, z], i) => <Table key={i} x={x} z={z} lit={warm} />)}
      {[[-8.6, 0, 3.2], [8.6, 0, 3.2], [-8.6, 0, -5.4], [8.6, 0, -5.4]].map((p, i) => <Planter key={i} p={p as V3} s={1.3} />)}
      <Bandstand frame={frame} on={band} />
      {/* light */}
      {warm > 0 && (
        <>
          <pointLight position={[-6, 2.4, 1]} intensity={6 * warm} distance={12} color={WARM} />
          <pointLight position={[6, 2.4, 1]} intensity={6 * warm} distance={12} color={WARM} />
          <pointLight position={[0, 1.4, -3]} intensity={4 * warm} distance={10} color={WARM} />
          <pointLight position={[0, 6.4, 1]} intensity={3 * warm} distance={16} color="#ffe2b8" />
        </>
      )}
      {dance > 0 && <pointLight position={[0, 0.8, 0]} intensity={5 * dance * (1 - dim)} distance={8} color="#ff9a6a" />}
      {day && <directionalLight position={[sunX, 18, 6]} intensity={2.0} color="#fff3dc" castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-bias={-0.0004} />}
      {day && <hemisphereLight args={["#cfe4ff", "#5a4a3a", 0.4]} />}
      {light === "dusk" && <hemisphereLight args={["#ff9f6a", "#2a2230", 0.6]} />}
      {/* the tower wall: floor slabs, spandrels, lit window bands, balcony rails */}
      <mesh position={[0, ROOF_Y / 2, -6.6]} material={M.wall()} {...sh}><boxGeometry args={[22, ROOF_Y + 0.4, 0.3]} /></mesh>
      {[1, 2, 3, 4, 5].map((f) => (
        <group key={f}>
          <mesh position={[0, f * FH, -6.15]} material={M.concrete()} {...sh}><boxGeometry args={[20, 0.16, 0.7]} /></mesh>
          <mesh position={[0, f * FH + 0.4, -5.82]} material={M.painted()}><boxGeometry args={[20, 0.04, 0.04]} /></mesh>
          {Array.from({ length: 13 }, (_, i) => (
            <mesh key={i} position={[-8.4 + i * 1.4, f * FH + 0.62, -6.44]} material={glow(WARM, Math.round((0.25 + 0.5 * rnd("win", f * 20 + i)) * (day ? 0.25 : 1) * (1 - dim * 0.7) * 10) / 10)}>
              <planeGeometry args={[0.8, 0.55]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* side terraces where the walkways land (the tower to the left, the function block to the right) */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 9.8, ROOF_Y / 2, -1.2]} material={M.wall()} {...sh}><boxGeometry args={[0.3, ROOF_Y + 0.4, 11]} /></mesh>
          {[2, 3, 4].map((f) => (
            <group key={f}>
              <mesh position={[s * 7.9, f * FH - 0.08, -1.2]} material={M.concrete()} {...sh}><boxGeometry args={[3.6, 0.18, 11]} /></mesh>
              <mesh position={[s * 6.12, f * FH + 0.28, -1.2]} material={M.glass()}><boxGeometry args={[0.02, 0.5, 11]} /></mesh>
              <mesh position={[s * 6.12, f * FH + 0.54, -1.2]} material={M.brass()}><boxGeometry args={[0.04, 0.03, 11]} /></mesh>
              {warm > 0 && <mesh position={[s * 6.13, f * FH - 0.18, -1.2]} material={glow(WARM, Math.round(0.7 * warm * 10) / 10)}><boxGeometry args={[0.02, 0.03, 11]} /></mesh>}
            </group>
          ))}
        </group>
      ))}
      {/* roof: trusses across the atrium with chords, verticals and diagonals; glass panes with mullions */}
      {[-7.5, -5, -2.5, 0, 2.5, 5, 7.5].map((x) => (
        <group key={x} position={[x, ROOF_Y, -1.2]}>
          <mesh material={M.painted()} {...sh}><boxGeometry args={[0.16, 0.14, 11.4]} /></mesh>
          <mesh position={[0, 0.7, 0]} material={M.painted()} castShadow><boxGeometry args={[0.12, 0.1, 11.4]} /></mesh>
          {Array.from({ length: 12 }, (_, i) => {
            const z = -5.2 + i * 0.95;
            return (
              <group key={i}>
                <mesh position={[0, 0.35, z]} material={M.painted()}><boxGeometry args={[0.05, 0.7, 0.05]} /></mesh>
                {i < 11 && <mesh position={[0, 0.35, z + 0.475]} rotation-x={0.94 * (i % 2 ? 1 : -1)} material={M.painted()}><boxGeometry args={[0.04, 0.86, 0.04]} /></mesh>}
              </group>
            );
          })}
        </group>
      ))}
      <mesh position={[0, ROOF_Y + 0.75, -1.2]} rotation-x={-Math.PI / 2} material={M.roofGlass()}><planeGeometry args={[19.4, 11.4]} /></mesh>
      {Array.from({ length: 16 }, (_, i) => (
        <mesh key={`mx${i}`} position={[-9.7 + i * 1.29, ROOF_Y + 0.76, -1.2]} material={M.darkSteel()}><boxGeometry args={[0.03, 0.03, 11.4]} /></mesh>
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={`mz${i}`} position={[0, ROOF_Y + 0.76, -6.9 + i * 1.27]} material={M.darkSteel()}><boxGeometry args={[19.4, 0.03, 0.03]} /></mesh>
      ))}
      {/* pendant lamps under the roof */}
      {[-6, -2, 2, 6].map((x, i) => (
        <group key={x} position={[x, ROOF_Y - 1.1, 1.8 - (i % 2) * 5]}>
          <mesh position={[0, 0.55, 0]} material={M.darkSteel()}><cylinderGeometry args={[0.006, 0.006, 1.1, 4]} /></mesh>
          <mesh material={M.brass()}><sphereGeometry args={[0.16, 14, 10, 0, 6.283, 0, 1.6]} /></mesh>
          {warm > 0 && <mesh position={[0, -0.02, 0]} material={glow("#ffe0b0", Math.round(warm * 10) / 10)}><sphereGeometry args={[0.07, 10, 8]} /></mesh>}
        </group>
      ))}
    </group>
  );
};

// ------------------------------------------------------------------ the walkways

/** A hanger rod from y0 down to y1 at (x, z), swinging `swing` radians about its top. */
export const Rod: React.FC<{ x: number; z: number; y0: number; y1: number; swing?: number; hot?: number }> = ({ x, z, y0, y1, swing = 0, hot = 0 }) => {
  const h = y0 - y1;
  return (
    <group position={[x, y0, z]} rotation-z={swing} rotation-x={swing * 0.4}>
      <mesh position={[0, -h / 2, 0]} material={hot > 0 ? glow("#ffd84a", Math.round(hot * 10) / 10) : M.steel()} castShadow><cylinderGeometry args={[0.018, 0.018, h, 8]} /></mesh>
      <mesh position={[0, -0.04, 0]} material={M.darkSteel()}><cylinderGeometry args={[0.05, 0.05, 0.08, 6]} /></mesh>
    </group>
  );
};

/** One walkway: concrete deck on two painted stringers, posts with glass panels and a brass rail, three
 * box beams under it with nuts at the rod ends. `hot` heats the middle beam's east (z+) connection;
 * `glowEdge` lights the edges (a label cue); `cutAt` 0..1 per beam releases its connection (cascade). */
export const Walkway: React.FC<{ y: number; z?: number; lit?: number; hot?: { stress: number; frame: number }; glowEdge?: number; tint?: string }> = ({ y, z = 0, lit = 0, hot, glowEdge = 0, tint }) => {
  const beams = HANGERS.map((x) => {
    const el = (
      <group key={x} position={[x, -0.16, 0]}>
        <mesh material={M.millscale()} {...sh}><boxGeometry args={[0.22, 0.2, 1.3]} /></mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, -0.13, s * ROD_Z]} material={M.darkSteel()} castShadow><cylinderGeometry args={[0.05, 0.05, 0.06, 6]} /></mesh>
        ))}
      </group>
    );
    return x === 0 && hot ? (
      <Failure3D key={x} stress={hot.stress} frame={hot.frame} hot={[0, -0.16, ROD_Z]} hotRadius={0.55} glowAt={2.2}>{el}</Failure3D>
    ) : el;
  });
  return (
    <group position={[0, y, z]}>
      <mesh material={M.concrete()} {...sh}><boxGeometry args={[SPAN, 0.1, 0.95]} /></mesh>
      <mesh position={[0, 0.052, 0]} material={M.carpet()} receiveShadow><boxGeometry args={[SPAN, 0.006, 0.8]} /></mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[0, -0.04, s * 0.49]} material={M.painted()} {...sh}><boxGeometry args={[SPAN, 0.2, 0.06]} /></mesh>
          <mesh position={[0, 0.3, s * 0.45]} material={M.glass()}><boxGeometry args={[SPAN, 0.42, 0.015]} /></mesh>
          <mesh position={[0, 0.53, s * 0.45]} material={M.brass()} castShadow><boxGeometry args={[SPAN, 0.035, 0.05]} /></mesh>
          {Array.from({ length: 13 }, (_, i) => (
            <mesh key={i} position={[-SPAN / 2 + i, 0.27, s * 0.45]} material={M.painted()}><boxGeometry args={[0.03, 0.5, 0.03]} /></mesh>
          ))}
          {lit > 0 && <mesh position={[0, 0.07, s * 0.43]} material={glow("#ffd89a", Math.round(0.8 * lit * 10) / 10)}><boxGeometry args={[SPAN, 0.02, 0.02]} /></mesh>}
          {glowEdge > 0 && <mesh position={[0, -0.04, s * 0.53]} material={glow(tint ?? "#ffd84a", Math.round(glowEdge * 10) / 10)}><boxGeometry args={[SPAN, 0.03, 0.02]} /></mesh>}
        </group>
      ))}
      {beams}
    </group>
  );
};

/** The three walkways and their rods. `fall` 0→1: the upper walkway drops onto the lower (to 0.45), then
 * both fall to the floor; `sag` 0..1 drops the upper walkway's middle (the cascade); the roof rods stay. */
export const Walkways: React.FC<{ frame: number; fall?: number; sag?: number; stress?: number; lit?: number; edges?: [number, number, number]; tint?: string; thirdLit?: number }> = ({
  frame, fall = 0, sag = 0, stress = 0, lit = 0, edges = [0, 0, 0], tint, thirdLit = 0,
}) => {
  const g = (x: number) => Easing.in(Easing.quad)(Math.min(1, Math.max(0, x)));
  const a = g(fall / 0.45), b = g((fall - 0.45) / 0.55);
  const upperY = UPPER_Y - a * (UPPER_Y - LOWER_Y - 0.36) - b * (LOWER_Y - 0.02) - sag * 0.18;
  const lowerY = LOWER_Y - b * (LOWER_Y - 0.12 - 0.06);
  const tilt = b * 0.03 + sag * 0.02;
  const gone = fall > 0.02 || sag > 0.3;
  const swing = gone ? Math.sin(frame / 7) * 0.05 * Math.exp(-Math.max(0, fall) * 0.8) : 0;
  return (
    <group>
      <Walkway y={THIRD_Y} z={THIRD_Z} lit={lit} glowEdge={Math.max(edges[1], thirdLit)} tint={thirdLit > 0 ? "#3ddc84" : tint} />
      {HANGERS.map((x) => [-1, 1].map((s) => <Rod key={`t${x}${s}`} x={x} z={THIRD_Z + s * ROD_Z} y0={ROOF_Y} y1={THIRD_Y - 0.3} hot={thirdLit * 0.7} />))}
      {HANGERS.map((x) => [-1, 1].map((s) => (
        <Rod key={`u${x}${s}`} x={x - 0.06} z={s * ROD_Z} y0={ROOF_Y} y1={gone ? UPPER_Y - 0.3 : upperY - 0.3} swing={swing * s} />
      )))}
      <group position={[0, upperY - UPPER_Y, 0]} rotation-z={tilt}>
        <Walkway y={UPPER_Y} lit={lit} hot={{ stress, frame }} glowEdge={edges[2]} tint={tint} />
      </group>
      {HANGERS.map((x) => [-1, 1].map((s) => (
        <Rod key={`l${x}${s}`} x={x + 0.06} z={s * ROD_Z} y0={upperY - 0.16} y1={lowerY - 0.3} />
      )))}
      <group position={[0, lowerY - LOWER_Y, 0]} rotation-z={-tilt * 0.6}>
        <Walkway y={LOWER_Y} lit={lit} glowEdge={edges[0]} tint={tint} />
      </group>
    </group>
  );
};

/** Dust over the lobby after the collapse: soft sprites rising and spreading (`k` 0..1 settles). */
export const Dust: React.FC<{ frame: number; k: number; at?: V3 }> = ({ frame, k, at = [0, 0, 0] }) => (
  <group position={at}>
    {Array.from({ length: 26 }, (_, i) => {
      const a = rnd("dust", i) * 6.283, r = 1 + rnd("dustr", i) * 5.5 * (0.4 + 0.6 * k);
      const y = 0.2 + rnd("dusty", i) * 1.4 * k + Math.sin(frame / 40 + i) * 0.05;
      const s = 0.35 + rnd("dusts", i) * 0.6;
      return (
        <mesh key={i} position={[Math.cos(a) * r * 0.9, y, Math.sin(a) * r * 0.35]} material={glow("#b9ab95", Math.round(0.06 * (1 - 0.4 * k) * 50) / 50)}>
          <sphereGeometry args={[s, 10, 8]} />
        </mesh>
      );
    })}
  </group>
);

// ------------------------------------------------------------------ the hotel from outside

/** The hotel from the street: the tower (floors counted by `floors`), the glass atrium, the function block,
 * the entrance canopy with its sign (`sign` is the text; the year sits on a plaque by `year`). */
export const Exterior: React.FC<{ frame: number; floorsLit?: number; atriumGlow?: number }> = ({ floorsLit = 1, atriumGlow = 0.4 }) => (
  <group>
    <mesh rotation-x={-Math.PI / 2} material={M.concrete()} receiveShadow><planeGeometry args={[120, 120]} /></mesh>
    {/* road and kerb */}
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 12]} material={M.darkSteel()} receiveShadow><planeGeometry args={[120, 7]} /></mesh>
    {Array.from({ length: 12 }, (_, i) => <mesh key={i} rotation-x={-Math.PI / 2} position={[-44 + i * 8, 0.02, 12]} material={glow("#e8e2c8", 0.6)}><planeGeometry args={[3, 0.18]} /></mesh>)}
    {/* tower */}
    <group position={[-14, 0, -6]}>
      <mesh position={[0, 21, 0]} material={M.windowsDay()} {...sh}><boxGeometry args={[11, 42, 9]} /></mesh>
      {Array.from({ length: 41 }, (_, i) => (
        <mesh key={i} position={[0, i * 1.03 + 0.1, 0]} material={M.painted()} castShadow><boxGeometry args={[11.2, 0.14, 9.2]} /></mesh>
      ))}
      <mesh position={[0, 42.4, 0]} material={M.concrete()} castShadow><boxGeometry args={[10, 0.9, 8]} /></mesh>
      {/* the floor counter strip on the corner, lit up to floorsLit */}
      <mesh position={[5.62, 21 * floorsLit, 4.62]} material={glow("#ffd84a", 0.9)}><boxGeometry args={[0.18, 42 * floorsLit, 0.18]} /></mesh>
    </group>
    {/* glass atrium: sloped glass box with mullions, warm glow inside */}
    <group position={[2, 0, -4]}>
      <mesh position={[0, 7.5, 0]} material={M.roofGlass()}><boxGeometry args={[16, 15, 12]} /></mesh>
      {Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[-8 + i * 2, 7.5, 6.02]} material={M.painted()} castShadow><boxGeometry args={[0.12, 15, 0.12]} /></mesh>)}
      {Array.from({ length: 6 }, (_, i) => <mesh key={`h${i}`} position={[0, 1 + i * 2.8, 6.02]} material={M.painted()}><boxGeometry args={[16, 0.1, 0.1]} /></mesh>)}
      <mesh position={[0, 15.1, 0]} material={M.painted()} castShadow><boxGeometry args={[16.4, 0.4, 12.4]} /></mesh>
      <pointLight position={[0, 6, 0]} intensity={20 * atriumGlow} distance={22} color={WARM} />
      <mesh position={[0, 5, -2]} material={glow("#ffcf8a", Math.round(atriumGlow * 0.5 * 10) / 10)}><boxGeometry args={[14, 8, 0.2]} /></mesh>
    </group>
    {/* function block */}
    <group position={[17, 0, -5]}>
      <mesh position={[0, 5, 0]} material={M.wall()} {...sh}><boxGeometry args={[14, 10, 14]} /></mesh>
      {Array.from({ length: 3 }, (_, r) => (
        <mesh key={r} position={[0, 2 + r * 3, 7.02]} material={M.windowsDay()}><planeGeometry args={[12, 1.4]} /></mesh>
      ))}
    </group>
    {/* entrance canopy */}
    <mesh position={[2, 3, 3.6]} material={M.painted()} castShadow><boxGeometry args={[9, 0.3, 3.2]} /></mesh>
    {[-2, 6].map((x) => <mesh key={x} position={[x, 1.5, 5]} material={M.darkSteel()} castShadow><cylinderGeometry args={[0.12, 0.12, 3, 10]} /></mesh>)}
    {/* street lamps along the kerb */}
    {Array.from({ length: 8 }, (_, i) => (
      <group key={i} position={[-26 + i * 8, 0, 8.6]}>
        <mesh position={[0, 2.5, 0]} material={M.darkSteel()}><cylinderGeometry args={[0.07, 0.1, 5, 8]} /></mesh>
        <mesh position={[0, 5, 0.4]} material={M.darkSteel()}><boxGeometry args={[0.2, 0.12, 1]} /></mesh>
        <mesh position={[0, 4.92, 0.8]} material={glow("#ffd9a0", 0.9)}><boxGeometry args={[0.16, 0.04, 0.3]} /></mesh>
      </group>
    ))}
  </group>
);

// ------------------------------------------------------------------ the joint, cut away

export const HW = 0.3, HH = 0.4, PT = 0.035, LEN = 3;
export const UZ = -0.12, LZ = 0.12;
export const NUT: V3 = [0, -HH - 0.07, UZ];

export const JRod: React.FC<{ z: number; y0: number; y1: number; hot?: number }> = ({ z, y0, y1, hot = 0 }) => (
  <group position={[0, (y0 + y1) / 2, z]}>
    <mesh material={hot > 0 ? glow("#ffd84a", Math.round(hot * 10) / 10) : M.steel()} castShadow><cylinderGeometry args={[0.032, 0.032, y0 - y1, 16]} /></mesh>
    {/* thread rings near the ends */}
    {Array.from({ length: 10 }, (_, i) => (
      <mesh key={i} position={[0, -(y0 - y1) / 2 + 0.04 + i * 0.025, 0]} material={M.darkSteel()}><torusGeometry args={[0.032, 0.004, 4, 16]} /></mesh>
    ))}
  </group>
);

/** A heavy hex nut with its washer, at (0, y, z); `up` flips it to sit on top of a flange. */
export const NutWasher: React.FC<{ y: number; z: number; up?: boolean; spin?: number }> = ({ y, z, up, spin = 0 }) => (
  <group position={[0, y, z]} scale={[1, up ? -1 : 1, 1]}>
    <mesh position={[0, 0.01, 0]} material={M.steel()} castShadow><cylinderGeometry args={[0.1, 0.1, 0.02, 32]} /></mesh>
    <mesh position={[0, -0.045, 0]} rotation-y={spin} material={M.darkSteel()} castShadow><cylinderGeometry args={[0.07, 0.07, 0.07, 6]} /></mesh>
    <mesh position={[0, -0.081, 0]} rotation-x={Math.PI / 2} material={M.steel()}><torusGeometry args={[0.032, 0.008, 6, 16]} /></mesh>
  </group>
);

/** One channel of the box beam: web outside, flanges in, the bottom flange's middle stretch hinged so it can
 * fold down about the web edge (`fold`), the weld bead along the seam. `ghost` draws it as glass. */
export const Channel: React.FC<{ side: -1 | 1; fold: number; ghost?: boolean; length?: number }> = ({ side, fold, ghost, length = LEN }) => {
  const m = ghost ? M.ghost() : M.millscale();
  const x = side * HW, fx = side * HW / 2;
  const mid: [number, number] = [-0.5, 0.35];
  const midLen = mid[1] - mid[0], midZ = (mid[0] + mid[1]) / 2;
  const restA = [-length / 2, mid[0]], restB = [mid[1], length / 2];
  return (
    <group>
      <mesh position={[x, 0, 0]} material={m} castShadow receiveShadow><boxGeometry args={[PT, HH * 2, length]} /></mesh>
      <mesh position={[fx, HH - PT / 2, 0]} material={m} castShadow receiveShadow><boxGeometry args={[HW, PT, length]} /></mesh>
      {[restA, restB].map(([a, b], i) => (
        <mesh key={i} position={[fx, -HH + PT / 2, (a! + b!) / 2]} material={m} castShadow receiveShadow><boxGeometry args={[HW, PT, b! - a!]} /></mesh>
      ))}
      <group position={[x, -HH + PT / 2, midZ]} rotation-z={side * -fold}>
        <mesh position={[-side * HW / 2, 0, 0]} material={m} castShadow receiveShadow><boxGeometry args={[HW, PT, midLen]} /></mesh>
      </group>
    </group>
  );
};

/** The weld beads along the seams, top and bottom (glowing when `hot`). */
export const Welds: React.FC<{ hot: number; open: number; length?: number }> = ({ hot, open, length = LEN }) => (
  <group>
    {[HH, -HH].map((y) => (
      <mesh key={y} position={[0, y + (y > 0 ? 0.008 : -0.008), 0]} material={y < 0 && hot > 0.05 ? glow(hot > 0.6 ? "#ff3b30" : "#ffb23e", Math.round(Math.min(1, hot * 1.3) * 10) / 10) : M.darkSteel()}>
        <boxGeometry args={[0.03 + (y < 0 ? open * 0.06 : 0), 0.016, length]} />
      </mesh>
    ))}
  </group>
);

/** The box beam cut away at one hanger. `rods`: "one" (the design: a continuous rod through, one nut under
 * this beam) or "two" (as built: the roof rod ends at a nut under this beam, the lower walkway's rod comes up
 * through it to a nut on top). `stress` heats the nut and flange; `fold` opens the flange at the seam;
 * `drop` slides the beam (and what hangs from it) down past the nut; `debris` 0..1 the falling flecks. */
export const BeamJoint: React.FC<{ t: number; rods: "one" | "two"; stress?: number; fold?: number; drop?: number; debris?: number; ghostNear?: boolean; rodGlow?: number; nutSpin?: number; length?: number }> = ({
  t, rods, stress = 0, fold = 0, drop = 0, debris = 0, ghostNear = true, rodGlow = 0, nutSpin = 0, length = LEN,
}) => (
  <group>
    {rods === "one" ? (
      <>
        <JRod z={0} y0={3} y1={-3} hot={rodGlow} />
        <Failure3D stress={stress} frame={t} glowAt={2.6}><group><NutWasher y={-HH} z={0} spin={nutSpin} /></group></Failure3D>
      </>
    ) : (
      <>
        <JRod z={UZ} y0={3} y1={-HH - 0.14} hot={rodGlow} />
        <Failure3D stress={stress} frame={t} glowAt={2.6}><group><NutWasher y={-HH} z={UZ} spin={nutSpin} /></group></Failure3D>
      </>
    )}
    {stress > 0.4 && <pointLight position={[0.3, -HH - 0.1, rods === "one" ? 0 : UZ]} intensity={3 * stress} distance={1.4} color="#ff5a3c" />}
    <group position={[0, -drop, 0]}>
      <Failure3D stress={stress} frame={t} hot={[0, -HH, rods === "one" ? 0 : UZ]} hotRadius={0.42} glowAt={2.4}>
        <group>
          <Channel side={-1} fold={fold} length={length} />
          <Channel side={1} fold={fold} ghost={ghostNear} length={length} />
        </group>
      </Failure3D>
      <Welds hot={stress} open={fold} length={length} />
      {rods === "two" && (
        <>
          <JRod z={LZ} y0={HH + 0.14} y1={-3} />
          <NutWasher y={HH} z={LZ} up />
        </>
      )}
    </group>
    {debris > 0 && (
      <group>
        {Array.from({ length: 36 }, (_, i) => {
          const tt = Math.max(0, debris * 1.6 - rnd("db", i) * 0.4);
          if (tt <= 0) return null;
          const vx = (rnd("dbx", i) - 0.5) * 0.5, vz = (rnd("dbz", i) - 0.5) * 0.5;
          const y = -HH - 0.08 - 0.3 * tt - 1.4 * tt * tt;
          const hot = i % 3 === 0;
          return (
            <mesh key={i} position={[vx * tt * 2, y, (rods === "one" ? 0 : UZ) + vz * tt * 2]} rotation={[tt * 9 + i, tt * 7, i]} material={hot ? glow("#ffb23e", 0.9) : M.millscale()}>
              <boxGeometry args={hot ? [0.012, 0.012, 0.03] : [0.03, 0.006, 0.02]} />
            </mesh>
          );
        })}
      </group>
    )}
  </group>
);
export default Atrium;
