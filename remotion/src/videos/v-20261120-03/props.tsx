// Props for the Michael Jordan team Short: a night arena with a hanging scoreboard, a basketball, an auction hall with
// a price board and gavel, a whiteboard of losses, a broadcast truck, team mailboxes, a giant screen, a hydraulic jack.
import React from "react";
import { Ball, Block, Glow, INK, Limb, Txt, type Motion } from "../../flat/kit";

export const TEAL = "#1d8a99";
export const PURPLE = "#3b2a7a";
export const GOLD = "#ffc43d";

/** A basketball. */
export const Hoopball: React.FC<{ x: number; y: number; r?: number; spin?: number }> = ({ x, y, r = 50, spin = 0 }) => (
  <g transform={`rotate(${spin} ${x} ${y})`}>
    <Ball x={x} y={y} r={r} fill="#e8762c" />
    <path d={`M ${x - r} ${y} L ${x + r} ${y} M ${x} ${y - r} L ${x} ${y + r}`} stroke={INK} strokeWidth={4} />
    <path d={`M ${x - r * 0.7} ${y - r * 0.7} Q ${x - r * 0.2} ${y} ${x - r * 0.7} ${y + r * 0.7} M ${x + r * 0.7} ${y - r * 0.7} Q ${x + r * 0.2} ${y} ${x + r * 0.7} ${y + r * 0.7}`} fill="none" stroke={INK} strokeWidth={4} />
  </g>
);

/** A hanging scoreboard; `text` is what it shows (a big L, or blank). */
export const Scoreboard: React.FC<{ x: number; y: number; w: number; text: string; color?: string; m: Motion }> = ({ x, y, w, text, color = "#ff4b4b", m }) => {
  const h = w * 0.5;
  return (
    <g>
      <Limb a={[x + w * 0.2, y - 300]} b={[x + w * 0.2, y]} w={8} color="#2a2a34" sw={2} />
      <Limb a={[x + w * 0.8, y - 300]} b={[x + w * 0.8, y]} w={8} color="#2a2a34" sw={2} />
      <Block x={x} y={y} w={w} h={h} r={16} fill="#14161f" />
      <Glow x={x + w / 2} y={y + h / 2} r={w * 0.6} color={color} o={text ? 0.3 + 0.05 * m.wave(12, 1) : 0.05} />
      {text ? <Txt x={x + w / 2} y={y + h / 2} size={h * 0.7} fill={color} glow={color}>{text}</Txt> : null}
    </g>
  );
};

/** The arena at night: dark stands of empty seats, the court in perspective. */
export const Arena: React.FC<{ m: Motion; lights: number }> = ({ m, lights }) => (
  <g>
    <rect x={-500} y={-600} width={2080} height={3200} fill="#10132a" />
    {Array.from({ length: 9 }).map((_, r) => (
      <rect key={r} x={-500} y={360 + r * 70} width={2080} height={46} fill={r % 2 ? PURPLE : "#2b2160"} opacity={0.5 + 0.5 * lights} />
    ))}
    <path d="M -300 1020 L 1380 1020 L 1700 1900 L -620 1900 Z" fill="#c98a4a" stroke={INK} strokeWidth={6} />
    <ellipse cx={540} cy={1300} rx={260} ry={90} fill="none" stroke="#ffffff" strokeWidth={8} opacity={0.8} />
    <path d="M 540 1020 L 540 1900" stroke="#ffffff" strokeWidth={8} opacity={0.8} />
    <rect x={-500} y={-600} width={2080} height={3200} fill="#000" opacity={0.45 * (1 - lights)} />
  </g>
);

/** A wooden gavel; `lift` 0..1 raises it. */
export const Gavel: React.FC<{ x: number; y: number; lift: number }> = ({ x, y, lift }) => (
  <g transform={`rotate(${-50 * lift} ${x + 140} ${y + 20})`}>
    <Limb a={[x, y]} b={[x + 140, y + 20]} w={18} color="#8a5a2c" />
    <Block x={x - 50} y={y - 45} w={100} h={90} r={14} fill="#6b4422" />
  </g>
);

/** The auction hall's price board: an LED panel showing `text`. */
export const PriceBoard: React.FC<{ x: number; y: number; w: number; h: number; text: string; label: string; m: Motion }> = ({ x, y, w, h, text, label, m }) => (
  <g>
    <Glow x={x + w / 2} y={y + h / 2} r={w * 0.7} color={GOLD} o={0.25 + 0.05 * m.wave(15, 1)} />
    <Block x={x} y={y} w={w} h={h} r={18} fill="#0b0f14" />
    <Txt x={x + w / 2} y={y + h * 0.22} size={46} fill={GOLD} glow={GOLD}>{label}</Txt>
    <Txt x={x + w / 2} y={y + h * 0.62} size={Math.min(130, h * 0.45)} fill={GOLD} glow={GOLD}>{text}</Txt>
  </g>
);

/** A team jersey on a stand. */
export const Jersey: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Limb a={[0, 0]} b={[0, 260]} w={12} color="#2a2a34" />
    <path d="M -110 -200 L -50 -230 Q 0 -190 50 -230 L 110 -200 L 140 -110 L 90 -90 L 90 40 L -90 40 L -90 -90 L -140 -110 Z" fill={TEAL} stroke={INK} strokeWidth={6} />
    <path d="M -50 -230 Q 0 -170 50 -230" fill="none" stroke={PURPLE} strokeWidth={10} />
    <Ball x={0} y={-70} r={42} fill={PURPLE} sw={4} />
  </g>
);

export default Arena;
