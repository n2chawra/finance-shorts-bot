// Shared things for the Las Vegas Strip Short (v-20261114-03): the Strip at night, the giant slot machine,
// casino chips and a clock face.
import React from "react";
import { Ball, Block, Glow, INK, Limb, STROKE, Txt, rng, shade } from "../../flat/kit";

export const NEON = ["#ff3fa4", "#3fd5ff", "#ffd23f", "#9d6bff", "#4dff9a"];

/** The Strip at night: casino towers with neon crowns, windows that switch on as `lit` goes 0..1. Ground at `base`. */
export const NightStrip: React.FC<{ base: number; lit?: number; flash?: number; seed?: string }> = ({ base, lit = 1, flash = 0, seed = "strip" }) => {
  const r = rng(seed);
  const towers = [[-260, 520, 230], [-40, 760, 200], [150, 600, 180], [330, 880, 220], [560, 640, 190], [760, 820, 210], [970, 560, 230], [1180, 700, 200]] as const;
  return (
    <g>
      {[0, 1, 2].map((i) => <Glow key={i} x={200 + i * 340} y={base - 300} r={420} color={NEON[i]!} o={0.18 + 0.1 * flash} />)}
      {towers.map(([x, h, w], i) => {
        const c = NEON[i % 5]!;
        const on = i / towers.length < lit;
        return (
          <g key={i}>
            <Block x={x} y={base - h} w={w} h={h} fill={i % 2 ? "#2a2456" : "#342c6a"} />
            {Array.from({ length: Math.floor(h / 60) }).map((_, row) => [0, 1, 2].map((c2) => (
              <rect key={`${row}-${c2}`} x={x + 22 + c2 * (w - 44) / 3} y={base - h + 50 + row * 60} width={(w - 44) / 3 - 14} height={22}
                fill={on && r() > 0.3 ? (r() > 0.5 ? "#ffd27a" : "#9fdcff") : "#1a1838"} />
            )))}
            <rect x={x - 10} y={base - h - 50} width={w + 20} height={50} rx={10} fill={on ? c : "#2a2456"} stroke={INK} strokeWidth={STROKE} />
            {on ? <Glow x={x + w / 2} y={base - h - 25} r={w * 0.8} color={c} o={0.45 + 0.4 * flash} /> : null}
          </g>
        );
      })}
    </g>
  );
};

/** A casino chip. */
export const Chip: React.FC<{ x: number; y: number; r?: number; color?: string; flat?: boolean }> = ({ x, y, r = 40, color = "#e8432f", flat }) => (
  flat ? (
    <g>
      <rect x={x - r} y={y - r * 0.18} width={r * 2} height={r * 0.36} rx={r * 0.12} fill={shade(color, -0.2)} stroke={INK} strokeWidth={4} />
      {[-0.6, 0, 0.6].map((f) => <rect key={f} x={x + f * r - r * 0.12} y={y - r * 0.18} width={r * 0.24} height={r * 0.36} fill="#ffffff" />)}
    </g>
  ) : (
    <g>
      <Ball x={x} y={y} r={r} fill={color} sw={4} shadow={false} />
      {[0, 60, 120, 180, 240, 300].map((a) => <rect key={a} x={x - r * 0.1} y={y - r} width={r * 0.2} height={r * 0.3} fill="#ffffff" transform={`rotate(${a} ${x} ${y})`} />)}
      <circle cx={x} cy={y} r={r * 0.55} fill="none" stroke="#ffffff" strokeWidth={4} strokeDasharray="6 6" />
    </g>
  )
);

/** A round clock with a sweeping second hand (`sec` in seconds). */
export const Clock: React.FC<{ x: number; y: number; r: number; sec: number }> = ({ x, y, r, sec }) => (
  <g>
    <Ball x={x} y={y} r={r} fill="#f4f1e8" />
    {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={x} y1={y - r * 0.82} x2={x} y2={y - r * 0.68} stroke={INK} strokeWidth={6} transform={`rotate(${i * 30} ${x} ${y})`} />)}
    <line x1={x} y1={y} x2={x} y2={y - r * 0.5} stroke={INK} strokeWidth={10} strokeLinecap="round" transform={`rotate(300 ${x} ${y})`} />
    <line x1={x} y1={y + r * 0.15} x2={x} y2={y - r * 0.8} stroke="#e8432f" strokeWidth={6} strokeLinecap="round" transform={`rotate(${sec * 6} ${x} ${y})`} />
    <Ball x={x} y={y} r={r * 0.07} fill={INK} sw={0} shadow={false} />
  </g>
);

const SYMBOLS = ["7", "BAR", "★", "◆"];

/** The giant slot machine: cabinet with a jackpot screen (`value`), three reels (`spin` 0..1 = spinning), a lever. */
export const GiantSlot: React.FC<{ x: number; y: number; w: number; value: string; spin: number; t: number; lever?: number; label?: string }> = ({
  x, y, w, value, spin, t, lever = 0, label = "JACKPOT",
}) => {
  const h = w * 1.5;
  return (
    <g>
      <Glow x={x + w / 2} y={y + h * 0.3} r={w * 0.9} color="#ff3fa4" o={0.35} />
      <Block x={x} y={y} w={w} h={h} r={30} fill="#c62a6b" />
      <Block x={x + w * 0.08} y={y - w * 0.12} w={w * 0.84} h={w * 0.2} r={20} fill="#ffd23f" />
      <Txt x={x + w / 2} y={y - w * 0.02} size={Math.max(44, w * 0.09)} fill={INK} deco>{label}</Txt>
      <rect x={x + w * 0.08} y={y + w * 0.14} width={w * 0.84} height={w * 0.34} rx={14} fill="#0b0f14" stroke={INK} strokeWidth={STROKE} />
      <Txt x={x + w / 2} y={y + w * 0.31} size={w * 0.19} fill="#ffd23f" glow="#ffd23f">{value}</Txt>
      {[0, 1, 2].map((i) => {
        const rx = x + w * 0.1 + i * w * 0.275, ry = y + w * 0.58, rw = w * 0.25, rh = w * 0.36;
        const sym = SYMBOLS[spin > 0.02 ? Math.floor(t / 2 + i * 3) % 4 : 0]!;
        return (
          <g key={i}>
            <rect x={rx} y={ry} width={rw} height={rh} rx={10} fill="#f4f1e8" stroke={INK} strokeWidth={5} />
            <Txt x={rx + rw / 2} y={ry + rh / 2 + (spin > 0.02 ? ((t * 9 + i * 20) % 40) - 20 : 0)} size={rw * 0.42} fill={i === 1 ? "#e8432f" : "#3d6fd1"} deco>{sym}</Txt>
          </g>
        );
      })}
      <rect x={x + w * 0.3} y={y + h * 0.78} width={w * 0.4} height={w * 0.06} rx={8} fill={INK} />
      <Limb a={[x + w + 10, y + h * 0.55]} b={[x + w + 70, y + h * 0.55 - (1 - lever) * w * 0.4 + lever * w * 0.1]} w={18} color="#c9ccd6" sw={4} />
      <Ball x={x + w + 70} y={y + h * 0.55 - (1 - lever) * w * 0.4 + lever * w * 0.1} r={w * 0.06} fill="#e8432f" />
    </g>
  );
};

export const frac = (s: string | undefined): number => {
  const v = parseFloat((s ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(v) ? Math.max(0, Math.min(1, v / 100)) : 0;
};

const props = { NightStrip, Chip, Clock, GiantSlot };
export default props;
