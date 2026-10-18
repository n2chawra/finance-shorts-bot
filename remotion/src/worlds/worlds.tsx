/**
 * Worlds: the places money stories happen, so a scene is never a figure on an empty background.
 * A street with a bank, a kitchen, an office with a window on the city, a shop, and city skylines
 * that say which country a story is about (a generic downtown, New York-style towers, London with a
 * clock tower, Mumbai with a gateway arch). Original flat drawings in layers: the far layer drifts
 * slower than the near one, so the camera feels like it moves through a place.
 *
 * Each world fills (0..w, 0..h) with its floor at `ground`. `night` darkens the sky for drama.
 */
import React from "react";
import { random } from "remotion";

export interface WorldArgs { w: number; h: number; ground: number; t: number; night?: boolean; seed: string }

const sky = (night?: boolean) => night ? ["#1b2347", "#3b3f74"] : ["#8fd0f5", "#d8f0fc"];

const Clouds: React.FC<WorldArgs> = ({ w, h, t, night, seed }) => (
  <g opacity={night ? 0.25 : 0.95}>
    {Array.from({ length: 4 }, (_, i) => {
      const x = ((random(`${seed}c${i}`) * w + t * (10 + i * 4)) % (w + 400)) - 200, y = h * (0.08 + random(`${seed}cy${i}`) * 0.18);
      return <g key={i} transform={`translate(${x},${y}) scale(${0.8 + random(`${seed}cs${i}`) * 0.7})`}>
        <ellipse rx={90} ry={34} fill="#ffffff" /><ellipse cx={-50} cy={8} rx={60} ry={26} fill="#ffffff" /><ellipse cx={55} cy={10} rx={64} ry={24} fill="#ffffff" />
      </g>;
    })}
  </g>
);

/** Far city blocks: plain towers with lit windows, drifting with the camera. */
const Blocks: React.FC<WorldArgs & { base: number; tint: string; count?: number; tall?: number }> = ({ w, t, seed, base, tint, count = 12, tall = 1, night }) => (
  <g transform={`translate(${-((t * 6) % 120)},0)`}>
    {Array.from({ length: count }, (_, i) => {
      const bw = w / count * (0.7 + random(`${seed}bw${i}`) * 0.5), bx = i * (w / count) - 40;
      const bh = (140 + random(`${seed}bh${i}`) * 320) * tall;
      return <g key={i}>
        <rect x={bx} y={base - bh} width={bw} height={bh + 4} fill={tint} />
        {Array.from({ length: Math.floor(bh / 46) }, (_, r) => Array.from({ length: Math.floor(bw / 34) }, (_, c) =>
          <rect key={`${r}-${c}`} x={bx + 10 + c * 34} y={base - bh + 14 + r * 46} width={16} height={22} rx={2}
            fill={night ? (random(`${seed}${i}${r}${c}`) > 0.55 ? "#ffd977" : "#2c3466") : "#ffffff"} opacity={night ? 0.9 : 0.35} />))}
      </g>;
    })}
  </g>
);

const Ground: React.FC<WorldArgs & { color: string; edge: string }> = ({ w, h, ground, color, edge }) => (
  <g><rect x={0} y={ground} width={w} height={h - ground} fill={color} /><rect x={0} y={ground - 6} width={w} height={12} fill={edge} /></g>
);

export const StreetWorld: React.FC<WorldArgs> = (a) => {
  const { w, h, ground, night } = a;
  const [top, bot] = sky(night);
  const bx = w * 0.5, bw = Math.min(w * 0.62, 900), bh = Math.min(h * 0.32, 520);
  return (
    <svg width={w} height={h} style={{ position: "absolute" }}>
      <defs><linearGradient id="st-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient></defs>
      <rect width={w} height={h} fill="url(#st-sky)" />
      <Clouds {...a} />
      <Blocks {...a} base={ground - 40} tint={night ? "#2a3260" : "#b9d4ea"} />
      {/* the bank: steps, columns, pediment */}
      <g transform={`translate(${bx - bw / 2},${ground - bh})`}>
        <path d={`M-20,${bh * 0.22} L${bw / 2},0 L${bw + 20},${bh * 0.22}Z`} fill="#efe3c8" stroke="#cdbf9f" strokeWidth={5} />
        <rect x={0} y={bh * 0.22} width={bw} height={bh * 0.12} fill="#e2d4b4" />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={bw * 0.06 + i * bw * 0.17} y={bh * 0.34} width={bw * 0.08} height={bh * 0.52} fill="#f6efdd" stroke="#d4c6a6" strokeWidth={4} />)}
        <rect x={-30} y={bh * 0.86} width={bw + 60} height={bh * 0.07} fill="#d9cbab" /><rect x={-60} y={bh * 0.93} width={bw + 120} height={bh * 0.07} fill="#cdbf9f" />
        <rect x={bw * 0.38} y={bh * 0.12} width={bw * 0.24} height={bh * 0.08} rx={6} fill="#8a7a54" />
      </g>
      <Ground {...a} color={night ? "#3a3f55" : "#9aa5b5"} edge={night ? "#4c526a" : "#c5ced9"} />
      {[0.08, 0.92].map((fx, i) => <g key={i} transform={`translate(${w * fx},${ground})`}><rect x={-6} y={-220} width={12} height={220} fill="#4b5563" /><circle cy={-226} r={22} fill={night ? "#ffe8a3" : "#e5e7eb"} /></g>)}
    </svg>
  );
};

export const KitchenWorld: React.FC<WorldArgs> = (a) => {
  const { w, h, ground, t, night } = a;
  return (
    <svg width={w} height={h} style={{ position: "absolute" }}>
      <rect width={w} height={h} fill="#f3d9c4" />
      {Array.from({ length: Math.ceil(w / 90) }, (_, c) => Array.from({ length: 5 }, (_, r) =>
        <rect key={`${c}-${r}`} x={c * 90 + (r % 2) * 45} y={ground - 360 + r * 60} width={86} height={56} fill="#f7e6d6" stroke="#e7c9b0" strokeWidth={3} />))}
      <g transform={`translate(${w * 0.08},${h * 0.1})`}>
        <rect width={w * 0.34} height={h * 0.26} rx={10} fill="#ffffff" />
        <rect x={14} y={14} width={w * 0.34 - 28} height={h * 0.26 - 28} fill={night ? "#28305e" : "#bfe6fb"} />
        <circle cx={w * 0.25} cy={h * 0.07 + Math.sin(t * 0.4) * 3} r={30} fill={night ? "#f8f1c8" : "#fff3b0"} />
        <rect x={w * 0.17 - 5} y={14} width={10} height={h * 0.26 - 28} fill="#ffffff" />
      </g>
      <rect x={w * 0.55} y={h * 0.12} width={w * 0.4} height={h * 0.16} rx={12} fill="#b5835a" />
      {[0, 1].map((i) => <rect key={i} x={w * 0.56 + i * w * 0.2} y={h * 0.13} width={w * 0.18} height={h * 0.14} rx={8} fill="#c99a6e" stroke="#9e7048" strokeWidth={4} />)}
      <rect x={0} y={ground - 40} width={w} height={44} fill="#e9eef3" />
      <rect x={0} y={ground} width={w} height={h - ground} fill="#b5835a" />
      {Array.from({ length: Math.ceil(w / 220) }, (_, i) => <rect key={i} x={i * 220 + 20} y={ground + 30} width={180} height={h - ground - 60} rx={10} fill="#c99a6e" stroke="#9e7048" strokeWidth={4} />)}
      <g transform={`translate(${w * 0.82},${ground - 40})`}><path d="M-34,0 L-26,-70 L26,-70 L34,0Z" fill="#e8f4ff" stroke="#9fb4c8" strokeWidth={4} /><rect x={-30} y={-90} width={60} height={22} rx={6} fill="#5b8def" /></g>
    </svg>
  );
};

export const OfficeWorld: React.FC<WorldArgs & { city?: SkylineName }> = (a) => {
  const { w, h, ground, night } = a;
  const win = { x: w * 0.06, y: h * 0.06, w: w * 0.88, h: Math.min(h * 0.46, ground - h * 0.12) };
  const [top, bot] = sky(night);
  return (
    <svg width={w} height={h} style={{ position: "absolute" }}>
      <defs><linearGradient id="of-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient>
        <clipPath id="of-win"><rect x={win.x} y={win.y} width={win.w} height={win.h} /></clipPath></defs>
      <rect width={w} height={h} fill={night ? "#2b3150" : "#e7edf5"} />
      <g clipPath="url(#of-win)">
        <rect x={win.x} y={win.y} width={win.w} height={win.h} fill="url(#of-sky)" />
        <Clouds {...a} />
        <Skyline {...a} name={a.city ?? "downtown"} base={win.y + win.h} />
      </g>
      {Array.from({ length: 5 }, (_, i) => <rect key={i} x={win.x + (win.w / 4) * i - 6} y={win.y} width={12} height={win.h} fill={night ? "#3c4468" : "#ffffff"} />)}
      <rect x={win.x - 8} y={win.y + win.h - 6} width={win.w + 16} height={18} fill={night ? "#3c4468" : "#ffffff"} />
      <rect x={0} y={ground} width={w} height={h - ground} fill={night ? "#3d3a52" : "#8c7a6b"} />
      <rect x={w * 0.1} y={ground - 30} width={w * 0.8} height={30} rx={8} fill={night ? "#5a536f" : "#b39579"} />
      <g transform={`translate(${w * 0.86},${ground - 30})`}><path d="M-30,0 L-24,-60 L24,-60 L30,0Z" fill="#c2563a" />
        {[-0.5, 0, 0.5].map((r, i) => <ellipse key={i} cx={r * 40} cy={-100} rx={18} ry={46} fill="#3f9b5b" transform={`rotate(${r * 40} ${r * 40} -100)`} />)}</g>
    </svg>
  );
};

export const ShopWorld: React.FC<WorldArgs> = (a) => {
  const { w, h, ground, t } = a;
  const shelfColors = ["#ff8a65", "#4fc3f7", "#ffd54f", "#81c784", "#ba68c8", "#f06292"];
  return (
    <svg width={w} height={h} style={{ position: "absolute" }}>
      <rect width={w} height={h} fill="#fff4e3" />
      {Array.from({ length: Math.ceil(w / 120) }, (_, i) => <rect key={i} x={i * 120} y={0} width={60} height={h * 0.07} fill={i % 2 ? "#ef5350" : "#ffffff"} />)}
      {[0.16, 0.32, 0.48].map((fy, r) => <g key={r}>
        <rect x={w * 0.05} y={h * fy + 110} width={w * 0.9} height={16} rx={6} fill="#a1887f" />
        {Array.from({ length: Math.floor(w * 0.9 / 90) }, (_, c) => {
          const bob = Math.sin(t * 1.5 + c + r) * 2;
          return <rect key={c} x={w * 0.06 + c * 90} y={h * fy + 30 + bob} width={64} height={80} rx={10} fill={shelfColors[(c + r * 2) % 6]} />;
        })}
      </g>)}
      <rect x={0} y={ground - 150} width={w} height={150} fill="#8d6e63" /><rect x={0} y={ground - 160} width={w} height={18} fill="#bcaaa4" />
      <rect x={0} y={ground} width={w} height={h - ground} fill="#d7ccc8" />
    </svg>
  );
};

export type SkylineName = "downtown" | "newyork" | "london" | "mumbai";

/** A city skyline standing on `base`: generic downtown towers, or a country's landmark silhouette. */
export const Skyline: React.FC<WorldArgs & { name: SkylineName; base: number }> = (a) => {
  const { w, base, night, name } = a;
  const tint = night ? "#232a55" : "#7ea6c9", near = night ? "#1a1f44" : "#5e87ad";
  return (
    <g>
      <Blocks {...a} base={base} tint={tint} count={10} tall={0.8} />
      <g transform={`translate(${w * 0.68},${base})`} fill={near}>
        {name === "newyork" && <><rect x={-60} y={-560} width={120} height={560} /><rect x={-34} y={-640} width={68} height={90} /><rect x={-10} y={-720} width={20} height={90} />
          <rect x={-220} y={-420} width={110} height={420} /><rect x={120} y={-480} width={100} height={480} /></>}
        {name === "london" && <><rect x={-42} y={-520} width={84} height={520} /><rect x={-54} y={-420} width={108} height={110} rx={6} />
          <circle cy={-366} r={34} fill={night ? "#ffe8a3" : "#f4f1e6"} /><path d="M-42,-520 L0,-640 L42,-520Z" />
          <rect x={-300} y={-200} width={220} height={200} /><rect x={90} y={-230} width={260} height={230} /></>}
        {name === "mumbai" && <><rect x={-170} y={-300} width={340} height={300} /><path d="M-90,0 L-90,-170 Q0,-260 90,-170 L90,0Z" fill={night ? "#3b3f74" : "#d8f0fc"} />
          {[-140, -60, 60, 140].map((x) => <path key={x} d={`M${x - 26},-300 Q${x},-360 ${x + 26},-300Z`} />)}
          <rect x={-330} y={-420} width={120} height={420} /><rect x={220} y={-380} width={110} height={380} /></>}
        {name === "downtown" && <><rect x={-80} y={-500} width={150} height={500} /><rect x={90} y={-360} width={120} height={360} /><rect x={-260} y={-300} width={140} height={300} /></>}
      </g>
    </g>
  );
};

export const CityWorld: React.FC<WorldArgs & { city?: SkylineName }> = (a) => {
  const [top, bot] = sky(a.night);
  return (
    <svg width={a.w} height={a.h} style={{ position: "absolute" }}>
      <defs><linearGradient id="ct-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient></defs>
      <rect width={a.w} height={a.h} fill="url(#ct-sky)" />
      <Clouds {...a} />
      <Skyline {...a} name={a.city ?? "downtown"} base={a.ground} />
      <Ground {...a} color={a.night ? "#2e3350" : "#8fa3b8"} edge={a.night ? "#454b6b" : "#b8c6d6"} />
    </svg>
  );
};

export type WorldName = "street" | "kitchen" | "office" | "shop" | "city";
export const WORLDS: Record<WorldName, React.FC<WorldArgs & { city?: SkylineName }>> = {
  street: StreetWorld, kitchen: KitchenWorld, office: OfficeWorld, shop: ShopWorld, city: CityWorld,
};
