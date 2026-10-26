/**
 * Worlds for the build scene (2026-10-26): one or two per video, chosen by the story, instead of
 * six fixed sets rotated by rule. A world is a sky, a ground, a light and a horizon, built from
 * parameters, and its horizon is lined with this video's own props (the hen farm's barns, the
 * billionaire's towers), so even the backdrop belongs to the story.
 */
import React from "react";
import { random } from "remotion";
import { shade, type PropSet } from "./draw";

export type WorldKind = "field" | "street" | "city" | "bank" | "kitchen" | "office" | "night" | "desert" | "space" | "studio";

interface Look { sky: [string, string]; ground: [string, string]; groundAt: number; sun?: string; stars?: boolean; floor?: "grass" | "tiles" | "boards" | "sand" | "plain" }
const LOOKS: Record<WorldKind, Look> = {
  field: { sky: ["#8fd3ff", "#e6f6ff"], ground: ["#7cc463", "#4e9a43"], groundAt: 0.66, sun: "#ffd34d", floor: "grass" },
  street: { sky: ["#ffb98a", "#ffe8c9"], ground: ["#8b8f9c", "#5d6170"], groundAt: 0.7, sun: "#ffefb0", floor: "tiles" },
  city: { sky: ["#6f8ff0", "#cbd8ff"], ground: ["#5c6478", "#3c4252"], groundAt: 0.7, floor: "plain" },
  bank: { sky: ["#e9e2d3", "#f8f4ea"], ground: ["#c9b99a", "#a8946f"], groundAt: 0.72, floor: "tiles" },
  kitchen: { sky: ["#fde7c4", "#fff6e6"], ground: ["#c58b5a", "#9c6a42"], groundAt: 0.72, floor: "boards" },
  office: { sky: ["#dbe7f3", "#f4f8fc"], ground: ["#9aa7b8", "#7a8698"], groundAt: 0.72, floor: "plain" },
  night: { sky: ["#141a3a", "#3a3f7a"], ground: ["#232a45", "#151a30"], groundAt: 0.7, stars: true, floor: "plain" },
  desert: { sky: ["#ffc77a", "#fff0cf"], ground: ["#e8b46c", "#c98e47"], groundAt: 0.68, sun: "#fff3c0", floor: "sand" },
  space: { sky: ["#05060f", "#1b1f45"], ground: ["#2a2f55", "#1a1d3a"], groundAt: 0.78, stars: true, floor: "plain" },
  studio: { sky: ["#2a2f4a", "#4a5280"], ground: ["#3a4066", "#262b48"], groundAt: 0.72, floor: "plain" },
};
export const WORLD_KINDS = Object.keys(LOOKS) as WorldKind[];
// tints by name (script text may not hold digits, so no hex in a script)
const TINTS: Record<string, string> = { red: "#ff3b3b", gold: "#ffb020", blue: "#3d7bf5", green: "#2fb37a", purple: "#8a63d2", dark: "#000010" };

/** Where the ground line is, so items and actors can stand on it. */
export const groundY = (kind: string | undefined, h: number) => h * (LOOKS[(kind ?? "studio") as WorldKind] ?? LOOKS.studio).groundAt;

export const World: React.FC<{
  kind?: string; tint?: string; w: number; h: number; t: number; seed: string;
  horizon?: { prop: string; x: number; size?: number }[]; props: PropSet;
}> = ({ kind, tint, w, h, t, seed, horizon = [], props }) => {
  const L = LOOKS[(kind ?? "studio") as WorldKind] ?? LOOKS.studio;
  const gy = h * L.groundAt;
  const id = `w${seed.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={w} height={h} style={{ position: "absolute" }}>
      <defs>
        <linearGradient id={`${id}s`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={L.sky[0]} /><stop offset="1" stopColor={L.sky[1]} /></linearGradient>
        <linearGradient id={`${id}g`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={L.ground[0]} /><stop offset="1" stopColor={L.ground[1]} /></linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#${id}s)`} />
      {L.stars && Array.from({ length: 70 }, (_, i) => (
        <circle key={i} cx={random(`${seed}x${i}`) * w} cy={random(`${seed}y${i}`) * gy * 0.95} r={1 + random(`${seed}r${i}`) * 2.6}
          fill="#fff" opacity={0.35 + 0.5 * Math.abs(Math.sin(t * (0.6 + random(`${seed}t${i}`)) + i))} />
      ))}
      {L.sun && <circle cx={w * 0.78} cy={gy * 0.34} r={Math.min(w, h) * 0.07} fill={L.sun} opacity={0.9} />}
      {!L.stars && [0, 1, 2].map((i) => {
        const x = ((random(`${seed}c${i}`) * w + t * (14 + i * 6)) % (w + 400)) - 200;
        const y = gy * (0.14 + 0.16 * i);
        return <g key={i} opacity={0.85}><ellipse cx={x} cy={y} rx={110} ry={34} fill="#fff" /><ellipse cx={x + 60} cy={y - 18} rx={70} ry={30} fill="#fff" /></g>;
      })}
      {/* when the script names no horizon, the world still has one: a skyline, hills, shelves */}
      {horizon.length === 0 && <Backdrop kind={(kind ?? "studio") as WorldKind} w={w} gy={gy} seed={seed} t={t} />}
      {/* the horizon: this video's own things, small and hazy, standing on the far ground */}
      {horizon.map((hz, i) => {
        const P = props[hz.prop];
        if (!P) return null;
        const s = h * (hz.size ?? 0.16);
        return <g key={i} transform={`translate(${hz.x * w},${gy + 4})`} opacity={0.55}><P s={s} t={t} seed={`${seed}h${i}`} /></g>;
      })}
      <rect y={gy} width={w} height={h - gy} fill={`url(#${id}g)`} />
      <rect y={gy} width={w} height={6} fill={shade(L.ground[0], 0.25)} opacity={0.7} />
      {L.floor === "grass" && Array.from({ length: 40 }, (_, i) => {
        const x = random(`${seed}gx${i}`) * w, y = gy + 20 + random(`${seed}gy${i}`) * (h - gy - 40);
        return <path key={i} d={`M${x},${y} l6,-16 l6,16`} stroke={shade(L.ground[0], -0.2)} strokeWidth={4} fill="none" strokeLinecap="round" />;
      })}
      {L.floor === "tiles" && Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={w / 2 + (i - 3.5) * 40} y1={gy} x2={w / 2 + (i - 3.5) * 340} y2={h} stroke={shade(L.ground[0], -0.15)} strokeWidth={3} opacity={0.5} />
      ))}
      {L.floor === "boards" && Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1={0} y1={gy + (h - gy) * (i / 6) ** 1.4} x2={w} y2={gy + (h - gy) * (i / 6) ** 1.4} stroke={shade(L.ground[0], -0.2)} strokeWidth={3} opacity={0.5} />
      ))}
      {L.floor === "sand" && Array.from({ length: 5 }, (_, i) => (
        <path key={i} d={`M0,${gy + 40 + i * 70} Q${w / 2},${gy + 10 + i * 70} ${w},${gy + 40 + i * 70}`} stroke={shade(L.ground[0], 0.15)} strokeWidth={4} fill="none" opacity={0.5} />
      ))}
      {tint && <rect width={w} height={h} fill={TINTS[tint] ?? tint} opacity={0.18} style={{ mixBlendMode: "multiply" }} />}
    </svg>
  );
};

/** A horizon for any world: city blocks with lit windows, rolling hills with trees, desert dunes,
 * shelves and a window inside. Seeded, so the same world always looks the same. */
const Backdrop: React.FC<{ kind: WorldKind; w: number; gy: number; seed: string; t: number }> = ({ kind, w, gy, seed, t }) => {
  if (kind === "field") {
    return <g opacity={0.9}>
      <path d={`M0,${gy} Q${w * 0.2},${gy - gy * 0.18} ${w * 0.45},${gy - gy * 0.05} T${w},${gy - gy * 0.12} L${w},${gy} Z`} fill="#8fcf72" />
      <path d={`M0,${gy} Q${w * 0.35},${gy - gy * 0.1} ${w * 0.6},${gy} Z`} fill="#6fb85a" />
      {Array.from({ length: 7 }, (_, i) => { const x = random(`${seed}tr${i}`) * w, s = 40 + random(`${seed}ts${i}`) * 50;
        return <g key={i}><rect x={x - 5} y={gy - s * 0.6} width={10} height={s * 0.6} fill="#7a5530" /><circle cx={x} cy={gy - s * 0.75} r={s * 0.4} fill="#4f9a45" /></g>; })}
    </g>;
  }
  if (kind === "desert") {
    return <path d={`M0,${gy} Q${w * 0.25},${gy - gy * 0.14} ${w * 0.5},${gy - gy * 0.03} T${w},${gy - gy * 0.1} L${w},${gy} Z`} fill="#f0c27e" opacity={0.85} />;
  }
  if (kind === "kitchen" || kind === "office" || kind === "bank") {
    const shelf = kind === "kitchen" ? "#b9805a" : kind === "bank" ? "#cdbb98" : "#b7c3d3";
    return <g opacity={0.85}>
      <rect x={w * 0.62} y={gy * 0.22} width={w * 0.26} height={gy * 0.42} rx={12} fill="#cfe9ff" stroke="#8d9bb0" strokeWidth={8} />
      <line x1={w * 0.75} y1={gy * 0.22} x2={w * 0.75} y2={gy * 0.64} stroke="#8d9bb0" strokeWidth={6} />
      {[0.32, 0.5].map((y, i) => <g key={i}><rect x={w * 0.06} y={gy * y} width={w * 0.3} height={14} fill={shelf} />
        {Array.from({ length: 6 }, (_, j) => <rect key={j} x={w * 0.07 + j * w * 0.045} y={gy * y - 50 - (j % 3) * 10} width={w * 0.03} height={50 + (j % 3) * 10} rx={4}
          fill={["#e5484d", "#3d7bf5", "#ffd23f", "#2fb37a"][(i + j) % 4]} opacity={0.75} />)}</g>)}
    </g>;
  }
  // city, street, night, studio, space: a skyline of blocks with windows that flicker on
  const n = 14;
  return <g opacity={kind === "space" ? 0.4 : 0.85}>
    {Array.from({ length: n }, (_, i) => {
      const bw = w / n * (0.8 + random(`${seed}bw${i}`) * 0.5), bh = gy * (0.18 + random(`${seed}bh${i}`) * 0.35), x = (w / n) * i;
      const dark = kind === "night" || kind === "studio" || kind === "space";
      return <g key={i}>
        <rect x={x} y={gy - bh} width={bw} height={bh} fill={dark ? "#1d2346" : "#8a9bc4"} />
        {Array.from({ length: 6 }, (_, j) => {
          const on = random(`${seed}win${i}-${j}`) > 0.45 || (dark && Math.sin(t * 0.8 + i + j) > 0.6);
          return on ? <rect key={j} x={x + bw * 0.2 + (j % 2) * bw * 0.36} y={gy - bh + 16 + Math.floor(j / 2) * 34} width={bw * 0.2} height={16} fill={dark ? "#ffd86b" : "#e6eeff"} opacity={0.8} /> : null;
        })}
      </g>;
    })}
  </g>;
};
