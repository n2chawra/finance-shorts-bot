// Props for the gas-station Short: a fuel pump, a car, the station shop, a coffee cup, a bag of chips,
// a card reader and a moneybag.
import React from "react";
import { Ball, Block, Glow, INK, Limb, STROKE, Txt } from "../../flat/kit";

/** A fuel pump on its island: body, a screen with a flowing fuel bar, a hose to `nozzle`. */
export const Pump: React.FC<{ x: number; y: number; w: number; flow?: number; t?: number; nozzle?: [number, number] }> = ({ x, y, w, flow = 0, t = 0, nozzle }) => {
  const h = w * 2.0;
  const bars = 8, lit = Math.floor(((t * 0.4) % (bars + 1)) * flow);
  return (
    <g>
      <Block x={x - 30} y={y + h} w={w + 60} h={50} fill="#9aa3b5" />
      <Block x={x} y={y} w={w} h={h} r={16} fill="#e9473b" />
      <Block x={x + w * 0.1} y={y + w * 0.12} w={w * 0.8} h={w * 0.55} r={10} fill="#162033" shadow={false} />
      {Array.from({ length: bars }).map((_, i) => (
        <rect key={i} x={x + w * 0.16 + i * (w * 0.68 / bars)} y={y + w * 0.42} width={w * 0.68 / bars - 6} height={w * 0.16} rx={4} fill={i < lit ? "#4dff9a" : "#2a3a52"} />
      ))}
      <Txt x={x + w / 2} y={y + w * 0.3} size={Math.max(26, w * 0.12)} fill="#4dff9a" deco>FUEL</Txt>
      <Block x={x + w * 0.2} y={y + w * 0.85} w={w * 0.6} h={w * 0.35} r={8} fill="#f4f1e8" shadow={false} />
      <Block x={x + w * 0.25} y={y + w * 1.35} w={w * 0.5} h={w * 0.12} r={6} fill="#2a2f3d" shadow={false} />
      {nozzle ? <path d={`M ${x + w} ${y + w * 1.0} Q ${x + w + 80} ${(y + h + nozzle[1]) / 2 + 120} ${nozzle[0]} ${nozzle[1]}`} fill="none" stroke={INK} strokeWidth={16} strokeLinecap="round" /> : null}
      {nozzle ? <Block x={nozzle[0] - 20} y={nozzle[1] - 26} w={70} h={40} r={10} fill="#2a2f3d" /> : null}
    </g>
  );
};

/** A small car seen from the side, facing left. */
export const Car: React.FC<{ x: number; y: number; w: number; color?: string }> = ({ x, y, w, color = "#2f7bd8" }) => {
  const h = w * 0.3;
  return (
    <g>
      <path d={`M ${x + w * 0.2} ${y - h} L ${x + w * 0.32} ${y - h * 1.75} L ${x + w * 0.72} ${y - h * 1.75} L ${x + w * 0.86} ${y - h} Z`} fill={color} stroke={INK} strokeWidth={STROKE} />
      <path d={`M ${x + w * 0.27} ${y - h * 1.05} L ${x + w * 0.35} ${y - h * 1.6} L ${x + w * 0.5} ${y - h * 1.6} L ${x + w * 0.5} ${y - h * 1.05} Z`} fill="#bfe3ff" stroke={INK} strokeWidth={4} />
      <path d={`M ${x + w * 0.54} ${y - h * 1.05} L ${x + w * 0.54} ${y - h * 1.6} L ${x + w * 0.69} ${y - h * 1.6} L ${x + w * 0.8} ${y - h * 1.05} Z`} fill="#bfe3ff" stroke={INK} strokeWidth={4} />
      <Block x={x} y={y - h} w={w} h={h * 0.8} r={22} fill={color} />
      <Ball x={x + w * 0.04} y={y - h * 0.65} r={w * 0.035} fill="#ffe28a" sw={3} shadow={false} />
      <Ball x={x + w * 0.22} y={y - h * 0.1} r={w * 0.1} fill="#2a2f3d" />
      <Ball x={x + w * 0.22} y={y - h * 0.1} r={w * 0.04} fill="#b8bfcc" sw={3} shadow={false} />
      <Ball x={x + w * 0.78} y={y - h * 0.1} r={w * 0.1} fill="#2a2f3d" />
      <Ball x={x + w * 0.78} y={y - h * 0.1} r={w * 0.04} fill="#b8bfcc" sw={3} shadow={false} />
    </g>
  );
};

/** The station's little shop: brick front, awning, glowing window, a SHOP sign. `lit` 0..1. */
export const Shop: React.FC<{ x: number; y: number; w: number; lit?: number; small?: boolean }> = ({ x, y, w, lit = 1, small = false }) => {
  const h = w * 0.62;
  return (
    <g>
      <Glow x={x + w / 2} y={y + h * 0.6} r={w * 0.7} color="#ffd37a" o={0.25 + 0.3 * lit} />
      <Block x={x} y={y} w={w} h={h} fill="#b5553a" />
      <Block x={x - 20} y={y - 70} w={w + 40} h={80} r={10} fill="#1f8f6a" />
      <Txt x={x + w / 2} y={y - 18} size={small ? 40 : 52} fill="#ffffff" deco={small}>SHOP</Txt>
      {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={x + i * (w / 6)} y={y + 10} width={w / 12} height={36} fill="#ffffff" opacity={0.85} />)}
      <Block x={x + w * 0.08} y={y + h * 0.3} w={w * 0.5} h={h * 0.55} r={6} fill={lit > 0.5 ? "#ffe9a8" : "#6b6040"} shadow={false} />
      <Block x={x + w * 0.66} y={y + h * 0.3} w={w * 0.26} h={h * 0.7} r={6} fill="#bfe3ff" shadow={false} />
    </g>
  );
};

/** A takeaway coffee cup with a lid and steam. */
export const Coffee: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1].map((i) => <path key={i} d={`M ${-14 + i * 28} -150 q ${12 * Math.sin(t / 8 + i)} -30 0 -60`} fill="none" stroke="#ffffff" strokeWidth={6} opacity={0.6} strokeLinecap="round" />)}
    <path d="M -46 -120 L 46 -120 L 36 0 L -36 0 Z" fill="#f4efe6" stroke={INK} strokeWidth={5} />
    <rect x={-44} y={-80} width={88} height={34} fill="#7a4a2a" />
    <rect x={-54} y={-140} width={108} height={24} rx={8} fill="#5a3a2a" stroke={INK} strokeWidth={4} />
  </g>
);

/** A bag of chips. */
export const Chips: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -50 -130 L 50 -130 L 56 0 L -56 0 Z" fill="#f2b52a" stroke={INK} strokeWidth={5} />
    <path d="M -50 -130 l 10 -10 l 10 10 l 10 -10 l 10 10 l 10 -10 l 10 10 l 10 -10 l 10 10 l 10 -10 l 10 10" fill="none" stroke={INK} strokeWidth={4} />
    <Ball x={0} y={-65} r={28} fill="#e0352b" sw={3} shadow={false} />
  </g>
);

/** A bank card. */
export const BankCard: React.FC<{ x: number; y: number; w: number; rot?: number }> = ({ x, y, w, rot = 0 }) => {
  const h = w * 0.63;
  return (
    <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x} y={y} width={w} height={h} rx={w * 0.06} fill="#3d5af1" stroke={INK} strokeWidth={STROKE} />
      <rect x={x} y={y + h * 0.18} width={w} height={h * 0.14} fill="#1d1a2b" opacity={0.6} />
      <rect x={x + w * 0.1} y={y + h * 0.45} width={w * 0.16} height={h * 0.2} rx={6} fill="#ffd34a" stroke={INK} strokeWidth={3} />
      <Ball x={x + w * 0.76} y={y + h * 0.74} r={w * 0.07} fill="#ff6a3d" sw={3} shadow={false} />
      <Ball x={x + w * 0.86} y={y + h * 0.74} r={w * 0.07} fill="#ffc23d" sw={3} shadow={false} />
    </g>
  );
};

/** A moneybag; `fill` 0..1 deflates it. */
export const MoneyBag: React.FC<{ x: number; y: number; s?: number; fill?: number }> = ({ x, y, s = 1, fill = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s * (0.6 + 0.4 * fill)} ${s * (0.35 + 0.65 * fill)})`}>
    <path d="M -110 0 Q -150 -130 -50 -190 L 50 -190 Q 150 -130 110 0 Z" fill="#c9a36a" stroke={INK} strokeWidth={6} />
    <rect x={-60} y={-222} width={120} height={36} rx={10} fill="#8a6a3a" stroke={INK} strokeWidth={5} />
    <Ball x={0} y={-90} r={40} fill="#3a9d5d" sw={4} shadow={false} />
  </g>
);

/** A canopy over the pumps, with a lit GAS sign. `sign` 0..1. */
export const Canopy: React.FC<{ y: number; sign?: number; small?: boolean }> = ({ y, sign = 1, small = false }) => (
  <g>
    <Limb a={[140, y + 80]} b={[140, y + 940]} w={40} color="#d9dde6" />
    <Limb a={[940, y + 80]} b={[940, y + 940]} w={40} color="#d9dde6" />
    <Block x={-300} y={y} w={1680} h={90} fill="#f4f1e8" />
    <rect x={-300} y={y + 60} width={1680} height={30} fill="#e9473b" />
    <Glow x={540} y={y + 140} r={520} ry={160} color="#fff3c4" o={0.35} />
    <Block x={380} y={y - 90} w={320} h={100} r={14} fill="#162033" />
    <Glow x={540} y={y - 40} r={260} color="#ff5a3a" o={0.6 * sign} />
    <Txt x={540} y={y - 22} size={small ? 40 : 64} fill={sign > 0.5 ? "#ffd34a" : "#6b6040"} glow={sign > 0.5 ? "#ff5a3a" : undefined} deco={small}>GAS</Txt>
  </g>
);

export default Pump;
