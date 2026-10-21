/**
 * Lit, layered sets for the shot system (owner, 2026-10-21: "most of the screen empty, every video
 * works like a template"). Every set is a full-bleed place, drawn in code, in three depth layers:
 *
 *   back   walls, windows, the city outside: moves least with the camera, blurs on close shots
 *   (mid)  the shot's actors and money objects go here (studio/shot.tsx)
 *   front  props nearest the lens: moves most, blurs on close shots
 *
 * Each set has a key light (a gradient pool), soft shadows, and something alive in it (a fan, city
 * lights, dust in a light beam), and names the spots where actors and objects stand.
 */
import React from "react";
import { random } from "remotion";

export interface SetArgs { w: number; h: number; t: number; seed: string; mood?: "warm" | "cold" | "gold" }
export interface Spots { ground: number; left: number; center: number; right: number; table: [number, number] }
export interface SetDef {
  spots: (w: number, h: number) => Spots;
  back: React.FC<SetArgs>;
  front?: React.FC<SetArgs>;
  /** how the light falls on the cast (a tint over the mid layer) */
  light: string;
}

const r = (seed: string, k: string | number) => random(`${seed}:${k}`);

/** Soft dust drifting through a light beam: the cheapest way to make a still room feel alive. */
export const Dust: React.FC<SetArgs & { x: number; y: number; rw: number; rh: number; color?: string; n?: number }> =
  ({ t, seed, x, y, rw, rh, color = "#fff6d8", n = 26 }) => (
    <g>{Array.from({ length: n }, (_, i) => {
      const px = x + ((r(seed, `dx${i}`) * rw + t * (6 + r(seed, `dv${i}`) * 14)) % rw);
      const py = y + ((r(seed, `dy${i}`) * rh - t * (4 + r(seed, `du${i}`) * 10) + rh * 10) % rh);
      const s = 1.5 + r(seed, `ds${i}`) * 3.5;
      return <circle key={i} cx={px} cy={py} r={s} fill={color} opacity={0.25 + 0.35 * Math.abs(Math.sin(t * 1.3 + i))} />;
    })}</g>
  );

/** A city seen through a window: towers with lit windows, a few blinking, drifting a little. */
const CityLights: React.FC<SetArgs & { x: number; y: number; ww: number; wh: number; rich?: boolean }> = ({ t, seed, x, y, ww, wh, rich }) => {
  const n = rich ? 14 : 9;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const bw = ww / n * (0.7 + r(seed, `bw${i}`) * 0.6), bx = x + i * (ww / n) - ((t * 3) % (ww / n));
        const bh = wh * (rich ? 0.45 + r(seed, `bh${i}`) * 0.5 : 0.25 + r(seed, `bh${i}`) * 0.35);
        const by = y + wh - bh;
        return (
          <g key={i}>
            <rect x={bx} y={by} width={bw} height={bh} fill={rich ? "#141b3d" : "#1d2340"} />
            {Array.from({ length: Math.floor(bh / 22) }, (_, rr) => Array.from({ length: Math.max(1, Math.floor(bw / 18)) }, (_, c) => {
              const on = r(seed, `${i}-${rr}-${c}`) > (rich ? 0.35 : 0.55);
              const blink = on && r(seed, `k${i}${rr}${c}`) > 0.93 ? (Math.sin(t * 2 + i + rr) > 0 ? 1 : 0.2) : 1;
              return on ? <rect key={`${rr}-${c}`} x={bx + 5 + c * 18} y={by + 6 + rr * 22} width={8} height={11} fill="#ffd98a" opacity={0.85 * blink} /> : null;
            }))}
          </g>
        );
      })}
    </g>
  );
};

// ---------------- a middle-class flat at night ----------------

const FlatBack: React.FC<SetArgs> = (a) => {
  const { w, h, t, seed } = a;
  const g = h * 0.74;                       // where the wall meets the floor
  const win = { x: w * 0.56, y: h * 0.2, ww: w * 0.36, wh: h * 0.26 };
  const fan = (t * 520) % 360;
  return (
    <svg width={w} height={h} style={{ position: "absolute" }}>
      <defs>
        <linearGradient id={`${seed}fw`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9b99a" /><stop offset="1" stopColor="#a8957a" /></linearGradient>
        <radialGradient id={`${seed}tl`} cx="0.28" cy="0.12" r="0.75"><stop offset="0" stopColor="#fffbe8" stopOpacity="0.55" /><stop offset="1" stopColor="#fffbe8" stopOpacity="0" /></radialGradient>
        <linearGradient id={`${seed}ff`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8c7a63" /><stop offset="1" stopColor="#5e4f3f" /></linearGradient>
      </defs>
      <rect width={w} height={g} fill={`url(#${seed}fw)`} />
      {/* damp patches and a crack: an old rented flat */}
      {Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx={r(seed, `p${i}`) * w} cy={g * (0.3 + r(seed, `q${i}`) * 0.6)} rx={60 + r(seed, `s${i}`) * 120} ry={30 + r(seed, `z${i}`) * 60} fill="#8f7f66" opacity={0.12} />)}
      <path d={`M${w * 0.12},${g * 0.18} l18,40 l-12,30 l22,46`} stroke="#7d6c55" strokeWidth={3} fill="none" opacity={0.5} />
      {/* the window on the city at night */}
      <rect x={win.x - 14} y={win.y - 14} width={win.ww + 28} height={win.wh + 28} fill="#6e5d48" />
      <rect x={win.x} y={win.y} width={win.ww} height={win.wh} fill="#0d1230" />
      <CityLights {...a} x={win.x} y={win.y} ww={win.ww} wh={win.wh} />
      {[0.33, 0.66].map((f) => <rect key={f} x={win.x + win.ww * f - 4} y={win.y} width={8} height={win.wh} fill="#6e5d48" />)}
      {Array.from({ length: 7 }, (_, i) => <rect key={i} x={win.x} y={win.y + (i + 1) * win.wh / 8} width={win.ww} height={4} fill="#4d4033" opacity={0.6} />)}
      {/* a wall calendar and a switchboard */}
      <rect x={w * 0.16} y={h * 0.25} width={w * 0.16} height={h * 0.12} fill="#f4efe2" stroke="#b9ab8f" strokeWidth={4} />
      <rect x={w * 0.16} y={h * 0.25} width={w * 0.16} height={h * 0.035} fill="#d9534f" />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={w * 0.17 + (i % 4) * w * 0.036} y={h * 0.295 + Math.floor(i / 4) * h * 0.022} width={w * 0.026} height={h * 0.014} fill="#cfc4ad" />)}
      <rect x={w * 0.4} y={h * 0.42} width={w * 0.07} height={h * 0.05} rx={6} fill="#efe8d8" stroke="#bfb196" strokeWidth={3} />
      {/* the tubelight and its pool of light */}
      <rect x={w * 0.14} y={h * 0.08} width={w * 0.3} height={18} rx={9} fill="#fffef4" />
      <rect width={w} height={g} fill={`url(#${seed}tl)`} />
      {/* the ceiling fan, turning */}
      <g transform={`translate(${w * 0.5},${h * 0.035})`}>
        <rect x={-6} y={-80} width={12} height={90} fill="#6b6b6b" />
        <g transform={`rotate(${fan}) scale(1,0.22)`}>
          {[0, 120, 240].map((d) => <rect key={d} x={0} y={-22} width={w * 0.26} height={44} rx={22} fill="#7d7d7d" transform={`rotate(${d})`} opacity={0.9} />)}
        </g>
        <ellipse rx={34} ry={16} fill="#5a5a5a" />
      </g>
      {/* the floor: tiles in perspective */}
      <rect y={g} width={w} height={h - g} fill={`url(#${seed}ff)`} />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={w * 0.5 + (i - 4) * w * 0.08} y1={g} x2={w * 0.5 + (i - 4) * w * 0.32} y2={h} stroke="#4e4134" strokeWidth={3} opacity={0.5} />)}
      {Array.from({ length: 4 }, (_, i) => <line key={i} x1={0} y1={g + (h - g) * (0.18 + i * i * 0.07)} x2={w} y2={g + (h - g) * (0.18 + i * i * 0.07)} stroke="#4e4134" strokeWidth={3} opacity={0.4} />)}
      <rect y={g - 10} width={w} height={14} fill="#6f5f4b" />
      {/* an old sofa against the wall */}
      <g transform={`translate(${w * 0.04},${g - h * 0.1})`}>
        <rect width={w * 0.42} height={h * 0.11} rx={26} fill="#7b4a3a" />
        <rect y={-h * 0.05} width={w * 0.42} height={h * 0.07} rx={26} fill="#8d5644" />
        <rect x={w * 0.06} y={-h * 0.03} width={w * 0.12} height={h * 0.05} rx={14} fill="#c9a24a" opacity={0.9} />
      </g>
    </svg>
  );
};

const FlatFront: React.FC<SetArgs> = ({ w, h, t, seed }) => (
  <svg width={w} height={h} style={{ position: "absolute" }}>
    {/* a plastic chair and a pile of bills on the table, closest to the lens */}
    <g transform={`translate(${w * 0.84},${h * 0.95})`}>
      <rect x={-w * 0.13} y={-h * 0.12} width={w * 0.26} height={22} rx={10} fill="#3d6fb5" />
      <rect x={-w * 0.12} y={-h * 0.12} width={14} height={h * 0.12} fill="#335f9c" /><rect x={w * 0.105} y={-h * 0.12} width={14} height={h * 0.12} fill="#335f9c" />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-w * 0.09 + i * 6} y={-h * 0.12 - 14 - i * 9} width={w * 0.16} height={10} fill={i % 2 ? "#f4f1ea" : "#e9e3d4"} transform={`rotate(${(r(seed, `b${i}`) - 0.5) * 10})`} />)}
    </g>
    <Dust w={w} h={h} t={t} seed={seed} x={0} y={h * 0.08} rw={w * 0.6} rh={h * 0.6} />
  </svg>
);

// ---------------- a penthouse: what money looks like ----------------

const PentBack: React.FC<SetArgs> = (a) => {
  const { w, h, t, seed } = a;
  const g = h * 0.72;
  return (
    <svg width={w} height={h} style={{ position: "absolute" }}>
      <defs>
        <linearGradient id={`${seed}ps`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a0f2c" /><stop offset="0.7" stopColor="#24295a" /><stop offset="1" stopColor="#5a3d6e" /></linearGradient>
        <radialGradient id={`${seed}pl`} cx="0.82" cy="0.62" r="0.6"><stop offset="0" stopColor="#ffcf7a" stopOpacity="0.55" /><stop offset="1" stopColor="#ffcf7a" stopOpacity="0" /></radialGradient>
        <linearGradient id={`${seed}pm`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9e2d6" /><stop offset="1" stopColor="#bdb3a3" /></linearGradient>
      </defs>
      {/* floor-to-ceiling glass on the night city */}
      <rect width={w} height={g} fill={`url(#${seed}ps)`} />
      <CityLights {...a} x={-40} y={g * 0.25} ww={w + 80} wh={g * 0.75} rich />
      {Array.from({ length: 18 }, (_, i) => {   // bokeh: city lights out of focus
        const bx = r(seed, `bx${i}`) * w, by = g * (0.3 + r(seed, `by${i}`) * 0.6), br = 10 + r(seed, `br${i}`) * 34;
        return <circle key={i} cx={bx} cy={by} r={br} fill={["#ffd98a", "#ff9e7a", "#9ec5ff"][i % 3]} opacity={0.12 + 0.1 * Math.sin(t * 0.8 + i)} />;
      })}
      {[0.25, 0.5, 0.75].map((f) => <rect key={f} x={w * f - 6} y={0} width={12} height={g} fill="#1b1f3a" />)}
      <rect width={w} height={g} fill={`url(#${seed}pl)`} />
      {/* marble floor with the lamp reflected */}
      <rect y={g} width={w} height={h - g} fill={`url(#${seed}pm)`} />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${r(seed, `v${i}`) * w},${g} q${80 - r(seed, `vq${i}`) * 160},${(h - g) * 0.5} ${40 - r(seed, `vw${i}`) * 80},${h - g}`} stroke="#a89c88" strokeWidth={2} fill="none" opacity={0.45} />)}
      <ellipse cx={w * 0.82} cy={g + (h - g) * 0.35} rx={w * 0.18} ry={(h - g) * 0.2} fill="#ffcf7a" opacity={0.22} />
      {/* a floor lamp, an artwork, a gold bar stack on a plinth */}
      <g transform={`translate(${w * 0.86},${g})`}>
        <rect x={-5} y={-h * 0.34} width={10} height={h * 0.34} fill="#c9a24a" />
        <path d={`M-70,${-h * 0.34} L70,${-h * 0.34} L45,${-h * 0.41} L-45,${-h * 0.41}Z`} fill="#fff1cc" />
        <ellipse cy={-h * 0.33} rx={130} ry={60} fill="#ffe2a0" opacity={0.25} />
      </g>
      <g transform={`translate(${w * 0.1},${g})`}>
        <rect x={0} y={-h * 0.12} width={w * 0.16} height={h * 0.12} fill="#f3efe7" />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={w * 0.02 + (i % 3) * w * 0.042} y={-h * 0.12 - 30 - Math.floor(i / 3) * 30} width={w * 0.04} height={28} rx={4} fill="#f2c14e" stroke="#b88a1e" strokeWidth={3} />)}
      </g>
    </svg>
  );
};

const PentFront: React.FC<SetArgs> = ({ w, h, t, seed }) => (
  <svg width={w} height={h} style={{ position: "absolute" }}>
    {/* a big plant leaning into the lens */}
    <g transform={`translate(${-w * 0.08},${h * 1.02})`}>
      {Array.from({ length: 6 }, (_, i) => {
        const a = -70 + i * 14 + Math.sin(t * 0.9 + i) * 2.5;
        return <ellipse key={i} cx={0} cy={-h * 0.11} rx={w * 0.035} ry={h * 0.11} fill={i % 2 ? "#2f7d4a" : "#3c9a5c"} transform={`rotate(${a + 90} 0 0)`} />;
      })}
      <rect x={-w * 0.06} y={-h * 0.06} width={w * 0.2} height={h * 0.06} rx={10} fill="#2b2b33" />
    </g>
    <Dust w={w} h={h} t={t} seed={seed} x={w * 0.5} y={h * 0.25} rw={w * 0.5} rh={h * 0.5} color="#ffe6a8" n={18} />
  </svg>
);

// ---------------- a vault of gold: the hook world ----------------

const VaultBack: React.FC<SetArgs> = (a) => {
  const { w, h, t, seed } = a;
  const g = h * 0.78;
  return (
    <svg width={w} height={h} style={{ position: "absolute" }}>
      <defs>
        <radialGradient id={`${seed}vs`} cx="0.5" cy="0.35" r="0.8"><stop offset="0" stopColor="#5a4210" /><stop offset="0.6" stopColor="#1e1606" /><stop offset="1" stopColor="#080603" /></radialGradient>
        <linearGradient id={`${seed}vb`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe08a" stopOpacity="0.5" /><stop offset="1" stopColor="#ffe08a" stopOpacity="0" /></linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#${seed}vs)`} />
      {/* shelves of gold bars and bundled notes, to the ceiling */}
      {Array.from({ length: 7 }, (_, row) => (
        <g key={row}>
          <rect x={0} y={h * 0.08 + row * h * 0.1} width={w} height={10} fill="#3a2b0c" />
          {Array.from({ length: 12 }, (_, i) => {
            const gold = r(seed, `g${row}${i}`) > 0.4;
            const x = i * w / 11 - 20 + (row % 2) * 30;
            return gold
              ? <path key={i} d={`M${x},${h * 0.08 + row * h * 0.1} l12,-34 h${w / 13} l12,34Z`} fill="#e8b93a" stroke="#a37a16" strokeWidth={3} />
              : <rect key={i} x={x} y={h * 0.08 + row * h * 0.1 - 30} width={w / 12} height={30} rx={4} fill="#3fa36b" stroke="#22704a" strokeWidth={3} />;
          })}
        </g>
      ))}
      {/* the spotlight cone from above */}
      <path d={`M${w * 0.42},0 L${w * 0.58},0 L${w * 0.85},${g} L${w * 0.15},${g}Z`} fill={`url(#${seed}vb)`} />
      <rect y={g} width={w} height={h - g} fill="#1a1305" />
      <ellipse cx={w * 0.5} cy={g + 20} rx={w * 0.36} ry={40} fill="#ffe08a" opacity={0.18} />
      <Dust {...a} x={w * 0.2} y={0} rw={w * 0.6} rh={g} color="#ffe9a8" n={40} />
    </svg>
  );
};

export const SETS: Record<string, SetDef> = {
  flat: { back: FlatBack, front: FlatFront, light: "rgba(255,240,200,0.06)",
    spots: (w, h) => ({ ground: h * 0.9, left: w * 0.3, center: w * 0.5, right: w * 0.7, table: [w * 0.82, h * 0.82] }) },
  penthouse: { back: PentBack, front: PentFront, light: "rgba(255,207,122,0.08)",
    spots: (w, h) => ({ ground: h * 0.88, left: w * 0.32, center: w * 0.52, right: w * 0.7, table: [w * 0.18, h * 0.6] }) },
  vault: { back: VaultBack, light: "rgba(255,210,110,0.1)",
    spots: (w, h) => ({ ground: h * 0.86, left: w * 0.3, center: w * 0.5, right: w * 0.7, table: [w * 0.5, h * 0.7] }) },
};
export const SET_NAMES = Object.keys(SETS);
