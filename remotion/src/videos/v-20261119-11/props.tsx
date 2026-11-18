// Props for the "every billionaire's money shared out" Short: a rocket on its pad, a gold coin mountain,
// a crowd seen from above, a ballroom scoreboard, a globe with a satellite counter, an envelope, a cheque,
// a mailbox and a dream bubble.
import React from "react";
import { Ball, Block, Coin, Glow, INK, Limb, STROKE, Txt, rng, shade } from "../../flat/kit";

/** A rocket on its launch tower; `label` painted down the side, `fire` 0..1 a flicker at the base. */
export const Rocket: React.FC<{ x: number; y: number; h: number; label: string; t: number; fire?: number }> = ({ x, y, h, label, t, fire = 0 }) => {
  const w = h * 0.2;
  return (
    <g>
      {/* the launch tower */}
      <Block x={x + w * 0.9} y={y - h * 0.95} w={w * 0.35} h={h * 0.95} fill="#c0392b" shadow="right" />
      {Array.from({ length: 7 }).map((_, i) => (
        <Limb key={i} a={[x + w * 0.9, y - h * 0.1 - i * h * 0.12]} b={[x + w * 1.25, y - h * 0.16 - i * h * 0.12]} w={6} color="#8e2a20" sw={0} />
      ))}
      <Limb a={[x + w * 0.9, y - h * 0.6]} b={[x + w * 0.5, y - h * 0.6]} w={14} color="#8e2a20" />
      {/* the body */}
      <path d={`M ${x} ${y - h * 0.82} Q ${x + w / 2} ${y - h * 1.08} ${x + w} ${y - h * 0.82} L ${x + w} ${y - h * 0.12} L ${x} ${y - h * 0.12} Z`} fill="#eef1f6" stroke={INK} strokeWidth={STROKE} />
      <rect x={x + w * 0.62} y={y - h * 0.8} width={w * 0.38} height={h * 0.68} fill="#c9cfdb" />
      <path d={`M ${x} ${y - h * 0.82} Q ${x + w / 2} ${y - h * 1.08} ${x + w} ${y - h * 0.82} L ${x + w} ${y - h * 0.12} L ${x} ${y - h * 0.12} Z`} fill="none" stroke={INK} strokeWidth={STROKE} />
      <Ball x={x + w / 2} y={y - h * 0.72} r={w * 0.2} fill="#2b6cd8" />
      <path d={`M ${x} ${y - h * 0.3} L ${x - w * 0.45} ${y - h * 0.04} L ${x} ${y - h * 0.12} Z`} fill="#2a2f3d" stroke={INK} strokeWidth={STROKE} />
      <path d={`M ${x + w} ${y - h * 0.3} L ${x + w * 1.45} ${y - h * 0.04} L ${x + w} ${y - h * 0.12} Z`} fill="#2a2f3d" stroke={INK} strokeWidth={STROKE} />
      <Txt x={x + w / 2} y={y - h * 0.42} size={w * 0.36} fill={INK} rotate={-90}>{label}</Txt>
      {/* the pad */}
      <Block x={x - w * 0.9} y={y - h * 0.12} w={w * 2.8} h={h * 0.12} fill="#6c7385" />
      {fire > 0 ? <Glow x={x + w / 2} y={y - h * 0.1} r={w * (0.9 + 0.2 * Math.sin(t / 2))} color="#ffb03a" o={0.6 * fire} /> : null}
    </g>
  );
};

/** A mountain of gold coins; `k` 0..1 how tall it has grown, `gap` 0..1 a slab missing from its right side. */
export const GoldPile: React.FC<{ x: number; y: number; w: number; k?: number; t: number; seed?: string; gap?: number }> = ({ x, y, w, k = 1, t, seed = "pile", gap = 0 }) => {
  const h = w * 0.62 * Math.max(0.05, k);
  const r = rng(seed);
  const coins = Array.from({ length: 26 }).map(() => [r(), r(), r()] as const);
  const gx = x + w * 0.66, gw = w * 0.22;
  return (
    <g>
      <Glow x={x + w / 2} y={y - h * 0.4} r={w * 0.7} color="#ffd34a" o={0.28} />
      <path d={`M ${x} ${y} Q ${x + w * 0.22} ${y - h * 0.55} ${x + w * 0.5} ${y - h} Q ${x + w * 0.78} ${y - h * 0.55} ${x + w} ${y} Z`} fill="#e9b232" stroke={INK} strokeWidth={STROKE} />
      <path d={`M ${x + w * 0.5} ${y - h} Q ${x + w * 0.78} ${y - h * 0.55} ${x + w} ${y} L ${x + w * 0.62} ${y} Q ${x + w * 0.6} ${y - h * 0.5} ${x + w * 0.5} ${y - h} Z`} fill="#c98e1e" />
      {coins.map(([a, b, c], i) => {
        const cx = x + w * (0.12 + a * 0.76);
        const top = y - h * (1 - Math.abs(cx - (x + w / 2)) / (w / 2));
        const cy = top + (y - top) * (0.15 + b * 0.75);
        return <Coin key={i} x={cx} y={cy} r={w * 0.035} spin={0.4 + 0.6 * Math.abs(Math.cos(t / 9 + c * 6))} />;
      })}
      {gap > 0 ? (
        <g>
          <defs><clipPath id={`gap-${seed}`}><path d={`M ${x} ${y} Q ${x + w * 0.22} ${y - h * 0.55} ${x + w * 0.5} ${y - h} Q ${x + w * 0.78} ${y - h * 0.55} ${x + w} ${y} Z`} /></clipPath></defs>
          <path clipPath={`url(#gap-${seed})`} d={`M ${gx} ${y} L ${gx} ${y - h * 0.5 * gap} L ${gx + gw} ${y - h * 0.38 * gap} L ${gx + gw} ${y} Z`} fill="#3a2b1a" stroke={INK} strokeWidth={STROKE} />
        </g>
      ) : null}
      <path d={`M ${x} ${y} Q ${x + w * 0.22} ${y - h * 0.55} ${x + w * 0.5} ${y - h} Q ${x + w * 0.78} ${y - h * 0.55} ${x + w} ${y}`} fill="none" stroke={INK} strokeWidth={STROKE} />
    </g>
  );
};

/** A small person seen from above (a head and shoulders), arms up by `up` 0..1. */
export const Topdown: React.FC<{ x: number; y: number; s: number; color: string; up?: number; skin?: string }> = ({ x, y, s, color, up = 0, skin = "#c98d63" }) => (
  <g>
    <ellipse cx={x} cy={y + s * 0.15} rx={s * 0.75} ry={s * 0.45} fill={color} stroke={INK} strokeWidth={3} />
    {up > 0 ? <Limb a={[x - s * 0.55, y + s * 0.05]} b={[x - s * 0.7, y - s * 0.9 * up]} w={s * 0.22} color={skin} sw={3} /> : null}
    {up > 0 ? <Limb a={[x + s * 0.55, y + s * 0.05]} b={[x + s * 0.7, y - s * 0.9 * up]} w={s * 0.22} color={skin} sw={3} /> : null}
    <circle cx={x} cy={y} r={s * 0.38} fill="#2a2030" stroke={INK} strokeWidth={3} />
  </g>
);

/** A globe from orbit, spinning by `t`; `gold` 0..1 tints it, `lights` 0..1 city lights on. */
export const Globe: React.FC<{ x: number; y: number; r: number; t: number; gold?: number; lights?: number }> = ({ x, y, r, t, gold = 0, lights = 0 }) => {
  const rr = rng("lights");
  const spots = Array.from({ length: 40 }).map(() => [rr() * 2 - 1, rr() * 2 - 1, rr()] as const);
  const shift = ((t * 2) % (r * 2));
  const id = "globe-clip";
  return (
    <g>
      <Glow x={x} y={y} r={r * 1.35} color={gold > 0 ? "#ffd34a" : "#5ab4ff"} o={0.35 + 0.3 * gold} />
      <defs><clipPath id={id}><circle cx={x} cy={y} r={r} /></clipPath></defs>
      <circle cx={x} cy={y} r={r} fill="#2a6fd0" />
      <g clipPath={`url(#${id})`}>
        {[0, 1].map((k) => (
          <g key={k} transform={`translate(${shift - k * r * 2} 0)`}>
            <path d={`M ${x - r * 0.7} ${y - r * 0.5} q ${r * 0.3} ${-r * 0.3} ${r * 0.6} ${-r * 0.1} q ${r * 0.2} ${r * 0.4} ${-r * 0.1} ${r * 0.7} q ${-r * 0.4} ${r * 0.1} ${-r * 0.5} ${-r * 0.6} Z`} fill="#4fb36a" stroke={INK} strokeWidth={4} />
            <path d={`M ${x + r * 0.1} ${y - r * 0.2} q ${r * 0.5} ${-r * 0.2} ${r * 0.7} ${r * 0.2} q ${-r * 0.1} ${r * 0.6} ${-r * 0.4} ${r * 0.8} q ${-r * 0.3} ${-r * 0.3} ${-r * 0.3} ${-r * 1.0} Z`} fill="#4fb36a" stroke={INK} strokeWidth={4} />
            <path d={`M ${x - r * 0.9} ${y + r * 0.3} q ${r * 0.3} ${-r * 0.1} ${r * 0.4} ${r * 0.3} q ${-r * 0.2} ${r * 0.3} ${-r * 0.4} ${r * 0.1} Z`} fill="#4fb36a" stroke={INK} strokeWidth={4} />
          </g>
        ))}
        {spots.map(([a, b, c], i) => (c < lights ? <circle key={i} cx={x + a * r * 0.85} cy={y + b * r * 0.85} r={6} fill="#ffe08a" opacity={0.9} /> : null))}
        <circle cx={x} cy={y} r={r} fill="#ffc43d" opacity={0.45 * gold} />
        <circle cx={x + r * 0.35} cy={y + r * 0.1} r={r} fill="#0a1030" opacity={0.25} />
      </g>
      <circle cx={x} cy={y} r={r} fill="none" stroke={INK} strokeWidth={STROKE} />
    </g>
  );
};

/** A paper envelope; `open` 0..1 lifts the flap. */
export const Envelope: React.FC<{ x: number; y: number; w: number; open?: number; label?: string }> = ({ x, y, w, open = 0, label }) => {
  const h = w * 0.62;
  return (
    <g>
      <Block x={x} y={y} w={w} h={h} r={8} fill="#f4ead2" />
      <path d={`M ${x} ${y} L ${x + w / 2} ${y + h * (0.55 - 1.1 * open)} L ${x + w} ${y}`} fill="#e8d9b4" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      {label ? <Txt x={x + w / 2} y={y + h * 0.75} size={w * 0.13} fill="#c0392b">{label}</Txt> : null}
    </g>
  );
};

/** A cheque with a payee line and an amount box. */
export const Cheque: React.FC<{ x: number; y: number; w: number; amount: string; k?: number; rot?: number }> = ({ x, y, w, amount, k = 1, rot = 0 }) => {
  const h = w * 0.45;
  return (
    <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
      <Block x={x} y={y} w={w} h={h} r={10} fill="#e6f4ea" />
      <rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} rx={6} fill="none" stroke="#8fc7a0" strokeWidth={3} />
      <Txt x={x + 40} y={y + h * 0.22} size={w * 0.05} fill="#3b6b4a" anchor="start" deco>PAY TO: EVERY PERSON ALIVE</Txt>
      <Limb a={[x + 40, y + h * 0.82]} b={[x + w * 0.5, y + h * 0.82]} w={3} color="#3b6b4a" sw={0} />
      {k > 0 ? <Txt x={x + w / 2} y={y + h * 0.53} size={w * 0.17} fill={INK}>{amount}</Txt> : null}
    </g>
  );
};

/** A street mailbox on a post; `open` 0..1 drops the door. */
export const Mailbox: React.FC<{ x: number; y: number; w: number; open?: number }> = ({ x, y, w, open = 0 }) => (
  <g>
    <Block x={x + w * 0.42} y={y + w * 0.5} w={w * 0.16} h={w * 1.2} fill="#7a5a3a" />
    <path d={`M ${x} ${y + w * 0.6} L ${x} ${y + w * 0.2} Q ${x + w / 2} ${y - w * 0.2} ${x + w} ${y + w * 0.2} L ${x + w} ${y + w * 0.6} Z`} fill="#3a6fd0" stroke={INK} strokeWidth={STROKE} />
    <g transform={`rotate(${-80 * open} ${x} ${y + w * 0.6})`}>
      <path d={`M ${x - 6} ${y + w * 0.6} L ${x - 6} ${y + w * 0.2} Q ${x + w * 0.02} ${y + w * 0.05} ${x + w * 0.04} ${y + w * 0.2} L ${x + w * 0.04} ${y + w * 0.6} Z`} fill={shade("#3a6fd0", -0.2)} stroke={INK} strokeWidth={STROKE} />
    </g>
    <Limb a={[x + w * 0.85, y + w * 0.25]} b={[x + w * 0.85, y - w * 0.15]} w={10} color="#e9473b" />
    <Block x={x + w * 0.85} y={y - w * 0.18} w={w * 0.22} h={w * 0.14} fill="#e9473b" shadow={false} />
  </g>
);

/** A thought bubble with its little trail of circles down to (tx, ty). */
export const Bubble: React.FC<{ x: number; y: number; w: number; h: number; k: number; tx: number; ty: number; children?: React.ReactNode }> = ({ x, y, w, h, k, tx, ty, children }) => {
  if (k <= 0) return null;
  const cx = x + w / 2, cy = y + h / 2;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`}>
      <circle cx={tx} cy={ty - 30} r={14} fill="#ffffff" stroke={INK} strokeWidth={4} />
      <circle cx={(tx * 2 + cx) / 3} cy={(ty + y + h) / 2} r={22} fill="#ffffff" stroke={INK} strokeWidth={4} />
      <rect x={x} y={y} width={w} height={h} rx={h * 0.4} fill="#ffffff" stroke={INK} strokeWidth={STROKE} />
      {children}
    </g>
  );
};

/** A low sports car seen from the side. */
export const SportsCar: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => {
  const h = w * 0.26;
  return (
    <g>
      <path d={`M ${x} ${y} L ${x} ${y - h * 0.5} Q ${x + w * 0.3} ${y - h * 0.6} ${x + w * 0.42} ${y - h} L ${x + w * 0.72} ${y - h} Q ${x + w * 0.85} ${y - h * 0.6} ${x + w} ${y - h * 0.45} L ${x + w} ${y} Z`} fill="#e9473b" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d={`M ${x + w * 0.46} ${y - h * 0.88} L ${x + w * 0.68} ${y - h * 0.88} L ${x + w * 0.76} ${y - h * 0.55} L ${x + w * 0.4} ${y - h * 0.55} Z`} fill="#9fd4ff" stroke={INK} strokeWidth={4} />
      <Ball x={x + w * 0.22} y={y} r={h * 0.32} fill="#2a2f3d" />
      <Ball x={x + w * 0.8} y={y} r={h * 0.32} fill="#2a2f3d" />
    </g>
  );
};

/** A mansion: a wide house with columns and a roof. */
export const Mansion: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => {
  const h = w * 0.5;
  return (
    <g>
      <path d={`M ${x - 20} ${y - h} L ${x + w / 2} ${y - h * 1.5} L ${x + w + 20} ${y - h} Z`} fill="#8e3b2b" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <Block x={x} y={y - h} w={w} h={h} fill="#f4ead2" />
      {[0.1, 0.3, 0.62, 0.82].map((k, i) => <Block key={i} x={x + w * k} y={y - h + 10} w={w * 0.07} h={h - 10} fill="#ffffff" shadow={false} />)}
      <Block x={x + w * 0.43} y={y - h * 0.55} w={w * 0.14} h={h * 0.55} fill="#7a5a3a" shadow={false} />
    </g>
  );
};

export default GoldPile;
