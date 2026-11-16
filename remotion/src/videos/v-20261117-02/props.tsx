// Props for the AMC popcorn Short: a cinema ticket, a popcorn tub, a popcorn machine, a drink cup, the AMC logo
// (public domain, Commons) and a cash bag.
import React from "react";
import { Ball, Block, Glow, INK, STROKE, Txt, rng } from "../../flat/kit";

/** A cinema ticket: cream stub, red band, a perforation, a price box. */
export const Ticket: React.FC<{ x: number; y: number; w: number; price?: string; rot?: number; label?: boolean }> = ({ x, y, w, price = "", rot = 0, label = true }) => {
  const h = w * 0.45;
  return (
    <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x + 10} y={y + 12} width={w} height={h} rx={14} fill="#000" opacity={0.25} />
      <rect x={x} y={y} width={w} height={h} rx={14} fill="#fbf1d6" stroke={INK} strokeWidth={STROKE} />
      <rect x={x} y={y} width={w * 0.2} height={h} rx={14} fill="#d7262b" stroke={INK} strokeWidth={STROKE} />
      <line x1={x + w * 0.24} y1={y + 8} x2={x + w * 0.24} y2={y + h - 8} stroke={INK} strokeWidth={4} strokeDasharray="10 10" />
      {label ? <Txt x={x + w * 0.62} y={y + h * 0.27} size={Math.max(30, w * 0.06)} fill="#6b6880" weight={700} deco>ADMIT ONE</Txt> : null}
      {price ? <Txt x={x + w * 0.62} y={y + h * 0.63} size={Math.max(56, w * 0.14)} fill={INK}>{price}</Txt> : null}
    </g>
  );
};

/** A popcorn tub, red and white stripes, kernels heaped on top. `see` 0..1 makes it see-through, `fill` 0..1 a fill line. */
export const Tub: React.FC<{ x: number; y: number; w: number; see?: number; fill?: number; seed?: string }> = ({ x, y, w, see = 0, fill = 1, seed = "tub" }) => {
  const h = w * 1.25, r = rng(seed);
  const top = w * 1.1, bot = w * 0.78;
  const path = `M ${x - top / 2} ${y - h} L ${x + top / 2} ${y - h} L ${x + bot / 2} ${y} L ${x - bot / 2} ${y} Z`;
  return (
    <g>
      {Array.from({ length: 16 }).map((_, i) => <Ball key={i} x={x - top * 0.42 + r() * top * 0.84} y={y - h - 10 - r() * w * 0.28} r={w * 0.09} fill="#fff4cc" sw={3} shadow={false} />)}
      <g opacity={1 - 0.65 * see}>
        <path d={path} fill="#ffffff" stroke={INK} strokeWidth={STROKE} />
        {[0, 1, 2].map((i) => {
          const a = -0.36 + i * 0.36;
          return <path key={i} d={`M ${x + a * top - top * 0.09} ${y - h} L ${x + a * top + top * 0.09} ${y - h} L ${x + a * bot + bot * 0.09} ${y} L ${x + a * bot - bot * 0.09} ${y} Z`} fill="#e0352b" />;
        })}
        <path d={path} fill="none" stroke={INK} strokeWidth={STROKE} />
      </g>
      {see > 0 ? (
        <g>
          <defs><clipPath id={`tubc-${seed}`}><path d={path} /></clipPath></defs>
          <rect x={x - top / 2} y={y - h * fill} width={top} height={h * fill} fill="#ffd34a" opacity={0.9 * see} clipPath={`url(#tubc-${seed})`} />
        </g>
      ) : null}
    </g>
  );
};

/** A glass popcorn machine on a red cart, kernels bursting when `burst` > 0. */
export const PopMachine: React.FC<{ x: number; y: number; w: number; burst?: number; t?: number }> = ({ x, y, w, burst = 0, t = 0 }) => {
  const h = w * 1.1, r = rng("pop-machine");
  return (
    <g>
      <Glow x={x + w / 2} y={y + h / 2} r={w * (0.8 + 0.4 * burst)} color="#ffd34a" o={0.35 + 0.4 * burst} />
      <Block x={x} y={y + h} w={w} h={w * 0.5} fill="#d7262b" />
      <rect x={x} y={y} width={w} height={h} rx={10} fill="#fff6d0" opacity={0.85} stroke={INK} strokeWidth={STROKE} />
      <Block x={x - 10} y={y - 60} w={w + 20} h={70} r={10} fill="#d7262b" />
      <Txt x={x + w / 2} y={y - 24} size={48} fill="#ffe28a">POPCORN</Txt>
      {Array.from({ length: 30 }).map((_, i) => {
        const bx = x + 20 + r() * (w - 40), by0 = y + h - 20 - r() * h * 0.45;
        const jump = burst * ((t * 7 + i * 13) % 40);
        return <Ball key={i} x={bx} y={by0 - jump} r={14} fill="#fffaf0" sw={2} shadow={false} />;
      })}
    </g>
  );
};

/** A soda cup with a straw. */
export const Cup: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -50 -150 L 50 -150 L 38 0 L -38 0 Z" fill="#3a7bd5" stroke={INK} strokeWidth={5} />
    <rect x={-56} y={-168} width={112} height={22} rx={8} fill="#ffffff" stroke={INK} strokeWidth={4} />
    <line x1={10} y1={-168} x2={30} y2={-240} stroke="#e0352b" strokeWidth={12} strokeLinecap="round" />
  </g>
);

/** A cash bag. */
export const CashBag: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -60 0 Q -80 -70 -30 -100 L 30 -100 Q 80 -70 60 0 Z" fill="#c9a36a" stroke={INK} strokeWidth={5} />
    <rect x={-34} y={-118} width={68} height={22} rx={8} fill="#8a6a3a" stroke={INK} strokeWidth={4} />
    <Ball x={0} y={-50} r={22} fill="#3a9d5d" sw={3} shadow={false} />
  </g>
);

export default Ticket;
