// Props for the Disneyland pay Short: a generic costumed bear (our own mascot, not any Disney character),
// a park ticket, a fairy-tale castle with a clock, and the Disneyland Resort logo (public domain, Commons).
import React from "react";
import { Ball, Block, INK, Limb, STROKE, Txt } from "../../flat/kit";

const FUR = "#a8703a", MUZ = "#f1d3a8";

/** A costumed bear performer, feet at (x, y), `s` px per unit (about 3 units tall). `wave` 0..1 raises the right
 * arm; `headOff` 0..1 lifts the costume head off to show the performer underneath. */
export const Bear: React.FC<{ x: number; y: number; s: number; wave?: number; headOff?: number; sit?: boolean; tired?: boolean; armL?: number }> = ({
  x, y, s, wave = 0, headOff = 0, sit, tired, armL = 0,
}) => {
  const hip = sit ? y - s * 0.7 : y - s * 1.05;
  const neck = hip - s * 1.05;
  const hx = x, hy = neck - s * 0.5 - headOff * s * 0.9;
  const ra = (-30 - 150 * wave) * (Math.PI / 180);
  const la = (30 + 120 * armL) * (Math.PI / 180);
  return (
    <g>
      {/* legs */}
      {sit ? (
        <>
          <Limb a={[x - s * 0.22, hip]} b={[x - s * 0.5, y - s * 0.05]} w={s * 0.32} color={FUR} />
          <Limb a={[x + s * 0.22, hip]} b={[x + s * 0.5, y - s * 0.05]} w={s * 0.32} color={FUR} />
        </>
      ) : (
        <>
          <Limb a={[x - s * 0.22, hip]} b={[x - s * 0.26, y - s * 0.1]} w={s * 0.32} color={FUR} />
          <Limb a={[x + s * 0.22, hip]} b={[x + s * 0.26, y - s * 0.1]} w={s * 0.32} color={FUR} />
        </>
      )}
      <Ball x={x - s * 0.3} y={y - s * 0.06} r={s * 0.2} ry={s * 0.12} fill="#5a3a1a" sw={4} />
      <Ball x={x + s * 0.3} y={y - s * 0.06} r={s * 0.2} ry={s * 0.12} fill="#5a3a1a" sw={4} />
      {/* arms */}
      <Limb a={[x - s * 0.42, neck + s * 0.2]} b={[x - s * 0.42 - Math.sin(la) * s * 0.7, neck + s * 0.2 + Math.cos(la) * s * 0.7]} w={s * 0.26} color={FUR} />
      <Limb a={[x + s * 0.42, neck + s * 0.2]} b={[x + s * 0.42 + Math.sin(-ra) * s * 0.7 * -1 + s * 0.0, neck + s * 0.2 + Math.cos(ra) * s * 0.7]} w={s * 0.26} color={FUR} />
      {/* body with a red vest */}
      <Ball x={x} y={(neck + hip) / 2 + s * 0.05} r={s * 0.5} ry={s * 0.62} fill={FUR} />
      <path d={`M ${x - s * 0.42} ${neck + s * 0.15} L ${x - s * 0.1} ${hip - s * 0.1} L ${x + s * 0.1} ${hip - s * 0.1} L ${x + s * 0.42} ${neck + s * 0.15} Z`} fill="#d7262b" stroke={INK} strokeWidth={4} />
      {/* the performer under the head */}
      {headOff > 0.05 ? (
        <g>
          <Ball x={x} y={neck - s * 0.28} r={s * 0.24} fill="#d8a07a" />
          <path d={`M ${x - s * 0.24} ${neck - s * 0.32} Q ${x} ${neck - s * 0.62} ${x + s * 0.24} ${neck - s * 0.32}`} fill="#3a2a2a" stroke={INK} strokeWidth={4} />
          <circle cx={x - s * 0.08} cy={neck - s * 0.26} r={s * 0.025} fill={INK} />
          <circle cx={x + s * 0.08} cy={neck - s * 0.26} r={s * 0.025} fill={INK} />
          <path d={`M ${x - s * 0.07} ${neck - s * 0.15} Q ${x} ${neck - s * 0.19} ${x + s * 0.07} ${neck - s * 0.15}`} stroke={INK} strokeWidth={4} fill="none" />
          {/* sweat */}
          <path d={`M ${x + s * 0.2} ${neck - s * 0.4} q ${s * 0.04} ${s * 0.08} 0 ${s * 0.1} q ${-s * 0.04} ${-s * 0.02} 0 ${-s * 0.1}`} fill="#7fd0ff" stroke={INK} strokeWidth={2} />
        </g>
      ) : null}
      {/* the costume head */}
      <g transform={`rotate(${headOff * -12} ${hx} ${hy})`}>
        <Ball x={hx - s * 0.42} y={hy - s * 0.42} r={s * 0.2} fill={FUR} />
        <Ball x={hx + s * 0.42} y={hy - s * 0.42} r={s * 0.2} fill={FUR} />
        <circle cx={hx - s * 0.42} cy={hy - s * 0.42} r={s * 0.1} fill={MUZ} />
        <circle cx={hx + s * 0.42} cy={hy - s * 0.42} r={s * 0.1} fill={MUZ} />
        <Ball x={hx} y={hy} r={s * 0.55} fill={FUR} />
        <Ball x={hx} y={hy + s * 0.18} r={s * 0.28} ry={s * 0.2} fill={MUZ} sw={4} shadow={false} />
        <ellipse cx={hx} cy={hy + s * 0.08} rx={s * 0.09} ry={s * 0.06} fill={INK} />
        {tired ? (
          <>
            <path d={`M ${hx - s * 0.28} ${hy - s * 0.1} q ${s * 0.08} ${s * 0.06} ${s * 0.16} 0`} stroke={INK} strokeWidth={6} fill="none" />
            <path d={`M ${hx + s * 0.12} ${hy - s * 0.1} q ${s * 0.08} ${s * 0.06} ${s * 0.16} 0`} stroke={INK} strokeWidth={6} fill="none" />
          </>
        ) : (
          <>
            <circle cx={hx - s * 0.2} cy={hy - s * 0.12} r={s * 0.07} fill={INK} />
            <circle cx={hx + s * 0.2} cy={hy - s * 0.12} r={s * 0.07} fill={INK} />
            <circle cx={hx - s * 0.18} cy={hy - s * 0.14} r={s * 0.02} fill="#fff" />
            <circle cx={hx + s * 0.22} cy={hy - s * 0.14} r={s * 0.02} fill="#fff" />
          </>
        )}
        <path d={`M ${hx - s * 0.12} ${hy + s * 0.22} Q ${hx} ${hy + (tired ? s * 0.2 : s * 0.32)} ${hx + s * 0.12} ${hy + s * 0.22}`} stroke={INK} strokeWidth={5} fill="none" />
      </g>
    </g>
  );
};

/** A park ticket: blue band with a star, a price in the middle. */
export const ParkTicket: React.FC<{ x: number; y: number; w: number; price?: string; rot?: number; color?: string; label?: string }> = ({ x, y, w, price = "", rot = 0, color = "#3a6ad5", label = "ONE DAY" }) => {
  const h = w * 0.5;
  return (
    <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x + 10} y={y + 12} width={w} height={h} rx={16} fill="#000" opacity={0.25} />
      <rect x={x} y={y} width={w} height={h} rx={16} fill="#fffaf0" stroke={INK} strokeWidth={STROKE} />
      <rect x={x} y={y} width={w} height={h * 0.26} rx={16} fill={color} stroke={INK} strokeWidth={STROKE} />
      <Txt x={x + w / 2} y={y + h * 0.13} size={Math.max(30, w * 0.07)} fill="#ffffff" deco>{label}</Txt>
      {price ? <Txt x={x + w / 2} y={y + h * 0.62} size={Math.max(56, w * 0.17)} fill={INK}>{price}</Txt> : null}
    </g>
  );
};

/** A fairy-tale castle: towers with cone roofs, a gate, a clock on the middle tower. `night` dims the walls. */
export const Castle: React.FC<{ x: number; y: number; s: number; night?: boolean; clock?: number; clockText?: string }> = ({ x, y, s, night, clock = 0, clockText }) => {
  const wall = night ? "#9a8ac8" : "#f2e6f6", roof = night ? "#3a4aa8" : "#4a7ad8";
  const tower = (tx: number, tw: number, th: number) => (
    <g key={tx}>
      <Block x={x + tx * s - tw * s / 2} y={y - th * s} w={tw * s} h={th * s} fill={wall} />
      <path d={`M ${x + tx * s - tw * s * 0.65} ${y - th * s} L ${x + tx * s} ${y - th * s - tw * s * 1.4} L ${x + tx * s + tw * s * 0.65} ${y - th * s} Z`} fill={roof} stroke={INK} strokeWidth={5} />
    </g>
  );
  return (
    <g>
      {tower(-1.2, 0.5, 1.6)}
      {tower(1.2, 0.5, 1.6)}
      {tower(-0.6, 0.6, 2.2)}
      {tower(0.6, 0.6, 2.2)}
      {tower(0, 0.9, 2.8)}
      <Block x={x - 1.3 * s} y={y - 1.0 * s} w={2.6 * s} h={1.0 * s} fill={wall} />
      <path d={`M ${x - 0.3 * s} ${y} L ${x - 0.3 * s} ${y - 0.5 * s} Q ${x} ${y - 0.8 * s} ${x + 0.3 * s} ${y - 0.5 * s} L ${x + 0.3 * s} ${y} Z`} fill="#4a3a6a" stroke={INK} strokeWidth={5} />
      {/* the clock */}
      <circle cx={x} cy={y - 2.25 * s} r={0.32 * s} fill="#fffaf0" stroke={INK} strokeWidth={5} />
      <line x1={x} y1={y - 2.25 * s} x2={x + Math.sin(clock * 2 * Math.PI) * 0.24 * s} y2={y - 2.25 * s - Math.cos(clock * 2 * Math.PI) * 0.24 * s} stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <line x1={x} y1={y - 2.25 * s} x2={x + Math.sin(clock * Math.PI / 6) * 0.16 * s} y2={y - 2.25 * s - Math.cos(clock * Math.PI / 6) * 0.16 * s} stroke={INK} strokeWidth={8} strokeLinecap="round" />
      {clockText ? <Txt x={x} y={y - 2.25 * s} size={Math.max(56, 0.28 * s)} fill="#d7262b">{clockText}</Txt> : null}
    </g>
  );
};

export default Bear;
