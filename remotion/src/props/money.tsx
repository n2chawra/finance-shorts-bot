/**
 * Money props that carry numbers: the figure lives on a thing in the world (a cheque, a price tag,
 * an anvil crushing a card) instead of floating on an empty background. All original drawings in
 * the channel's flat style. Each prop is drawn around (0, 0) at nominal width `s`, takes its
 * entrance progress `k` (0..1) and the beat time `t`, and puts its text at the size it is given;
 * scenes pass sizes that keep Shorts text at 44 px or more.
 */
import React from "react";
import { FONT } from "../design/fonts";
import type { PaletteT } from "../contract/timeline";

export interface PropArgs { s: number; k: number; t: number; pal: PaletteT; text?: string; label?: string; fs: number; hit?: number }

const T: React.FC<{ x: number; y: number; fs: number; fill: string; weight?: number; anchor?: "middle" | "start" | "end"; children: React.ReactNode; rotate?: number }> =
  ({ x, y, fs, fill, weight = 800, anchor = "middle", children, rotate = 0 }) => (
    <text x={x} y={y} fontFamily={FONT} fontWeight={weight} fontSize={fs} fill={fill} textAnchor={anchor} dominantBaseline="middle"
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}>{children}</text>
  );

const Bill: React.FC<{ x: number; y: number; w: number; tilt?: number }> = ({ x, y, w, tilt = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${tilt})`}>
    <rect x={-w / 2} y={-w * 0.12} width={w} height={w * 0.24} rx={w * 0.03} fill="#3fae6a" stroke="#2a7d4b" strokeWidth={w * 0.012} />
    <rect x={-w * 0.42} y={-w * 0.085} width={w * 0.84} height={w * 0.17} rx={w * 0.02} fill="none" stroke="#9fe0b4" strokeWidth={w * 0.008} />
    <circle cx={0} cy={0} r={w * 0.06} fill="#9fe0b4" />
    <rect x={-w * 0.07} y={-w * 0.125} width={w * 0.14} height={w * 0.25} fill="#e9dcc0" opacity={0.95} />
  </g>
);

/** A cheque made out for the figure. */
export const Cheque: React.FC<PropArgs> = ({ s, k, text, label, fs, pal }) => (
  <g transform={`rotate(${(1 - k) * -10}) scale(${0.25 + 0.75 * k})`} opacity={Math.min(1, k * 2)}>
    <rect x={-s / 2 + 10} y={-s * 0.22 + 14} width={s} height={s * 0.44} rx={18} fill="rgba(0,0,0,0.22)" />
    <rect x={-s / 2} y={-s * 0.22} width={s} height={s * 0.44} rx={18} fill="#f3f7ec" stroke="#b9ccae" strokeWidth={5} />
    <rect x={-s / 2} y={-s * 0.22} width={s} height={s * 0.07} rx={18} fill={pal.cast[0]} opacity={0.85} />
    {[0.0, 0.11].map((dy, i) => <rect key={i} x={-s * 0.42} y={s * (0.1 + dy)} width={s * (i ? 0.34 : 0.5)} height={8} rx={4} fill="#c7d5bd" />)}
    <path d={`M${s * 0.14},${s * 0.16} q${s * 0.04},-${s * 0.06} ${s * 0.08},0 t${s * 0.08},0 t${s * 0.08},-${s * 0.02}`} stroke="#43507a" strokeWidth={5} fill="none" strokeLinecap="round" />
    {label && <T x={-s * 0.42} y={-s * 0.08} fs={fs * 0.42} fill="#5b6b52" weight={700} anchor="start">{label}</T>}
    {text && <T x={s * 0.08} y={-s * 0.02} fs={fs} fill="#1d2433">{text}</T>}
  </g>
);

/** A stack of notes that grows to `fill` (0..1) of its full height. */
export const CashStack: React.FC<PropArgs & { fill?: number }> = ({ s, k, fill = 1, text, fs, pal }) => {
  // bills sit close (half a stack's old height) and the figure rides just above the top bill, so it stays
  // clear of a kicker above the prop and inside the frame under a camera punch (L-20261019-01)
  const n = Math.max(1, Math.round(14 * fill * k)), step = s * 0.035;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => <Bill key={i} x={Math.sin(i * 2.3) * s * 0.03} y={-i * step} w={s} tilt={Math.sin(i * 1.7) * 2.5} />)}
      {text && <T x={0} y={-(n - 1) * step - s * 0.12 - fs * 0.7} fs={fs} fill={pal.text}>{text}</T>}
    </g>
  );
};

/** A price tag on a string, swinging a little. */
export const PriceTag: React.FC<PropArgs> = ({ s, k, t, text, label, fs, pal }) => {
  const swing = Math.sin(t * 2.2) * 4 * k + (1 - k) * 30;
  return (
    <g transform={`rotate(${swing} 0 ${-s * 0.55})`} opacity={Math.min(1, k * 2)}>
      <path d={`M0,${-s * 0.55} L${-s * 0.18},${-s * 0.3}`} stroke="#8a7a5c" strokeWidth={5} />
      <path d={`M${-s * 0.5},${-s * 0.28} L${s * 0.32},${-s * 0.28} L${s * 0.5},0 L${s * 0.32},${s * 0.28} L${-s * 0.5},${s * 0.28}Z`} fill={pal.accent} stroke="rgba(0,0,0,0.18)" strokeWidth={4} />
      <circle cx={s * 0.3} cy={0} r={s * 0.04} fill="#fff8ec" />
      {label && <T x={-s * 0.1} y={-s * 0.13} fs={fs * 0.45} fill="#1b1b1b" weight={700}>{label}</T>}
      {text && <T x={-s * 0.1} y={label ? s * 0.07 : 0} fs={fs} fill="#1b1b1b">{text}</T>}
    </g>
  );
};

/** A credit card; `crush` (0..1) flattens it. */
export const CreditCard: React.FC<{ s: number; crush?: number; color?: string }> = ({ s, crush = 0, color = "#3b5bdb" }) => (
  <g transform={`scale(${1 + crush * 0.25},${1 - crush * 0.72}) rotate(${crush * 3})`}>
    <rect x={-s / 2} y={-s * 0.31} width={s} height={s * 0.62} rx={s * 0.06} fill={color} />
    <rect x={-s * 0.4} y={-s * 0.14} width={s * 0.17} height={s * 0.13} rx={s * 0.02} fill="#ffd34d" />
    <rect x={-s * 0.4} y={s * 0.12} width={s * 0.6} height={s * 0.05} rx={s * 0.02} fill="#ffffff" opacity={0.6} />
    <circle cx={s * 0.3} cy={s * 0.16} r={s * 0.07} fill="#ff6b6b" opacity={0.9} /><circle cx={s * 0.38} cy={s * 0.16} r={s * 0.07} fill="#ffb84d" opacity={0.9} />
  </g>
);

/** An anvil stamped with the figure, dropping onto a credit card at `hit` seconds. */
export const Anvil: React.FC<PropArgs> = ({ s, t, text, fs, hit = 0.6, pal }) => {
  const d = t - hit;
  const fall = d < 0 ? Math.max(0, 1 - (t / Math.max(0.01, hit)) ** 2) : 0;
  const crush = d < 0 ? 0 : Math.min(1, d / 0.12);
  const bounce = d > 0 ? Math.exp(-d * 9) * Math.sin(d * 30) * 12 : 0;
  return (
    <g>
      <g transform={`translate(0,${s * 0.32})`}><CreditCard s={s * 0.9} crush={crush} /></g>
      {d > 0 && d < 0.6 && Array.from({ length: 8 }, (_, i) => {
        const a = Math.PI + (i / 7) * Math.PI, r = s * (0.4 + d * 1.2);
        return <circle key={i} cx={Math.cos(a) * r} cy={s * 0.3 + Math.sin(a) * r * 0.4} r={10 - d * 12} fill={pal.accent} opacity={1 - d / 0.6} />;
      })}
      <g transform={`translate(0,${-fall * 1400 + bounce - (crush ? s * 0.02 : 0)})`}>
        <path d={`M${-s * 0.5},${-s * 0.32} L${s * 0.55},${-s * 0.32} Q${s * 0.42},${-s * 0.18} ${s * 0.18},${-s * 0.12} L${s * 0.22},${s * 0.12} L${-s * 0.3},${s * 0.12} L${-s * 0.26},${-s * 0.12} Q${-s * 0.42},${-s * 0.16} ${-s * 0.5},${-s * 0.32}Z`}
          fill="#3a4152" stroke="#232836" strokeWidth={6} />
        <rect x={-s * 0.36} y={s * 0.12} width={s * 0.64} height={s * 0.08} rx={6} fill="#2a2f3d" />
        {text && <T x={-s * 0.02} y={-s * 0.13} fs={fs} fill="#ffffff" rotate={-4}>{text}</T>}
      </g>
    </g>
  );
};

/** A piggy bank; a coin drops into it at `hit`. */
export const PiggyBank: React.FC<PropArgs> = ({ s, k, t, text, fs, hit = 0.6, pal }) => {
  const d = t - hit, coinY = d < 0 ? -s * 0.9 * (1 - Math.min(1, t / Math.max(0.01, hit))) - s * 0.35 : -s * 0.3 + Math.min(1, d / 0.2) * s * 0.1;
  return (
    <g transform={`scale(${0.3 + 0.7 * k})`}>
      {d < 0.25 && <g transform={`translate(${s * 0.02},${coinY})`}><ellipse rx={s * 0.08} ry={s * 0.08} fill="#ffd34d" stroke="#c99a00" strokeWidth={5} /></g>}
      <ellipse cx={0} cy={0} rx={s * 0.42} ry={s * 0.32} fill="#f6a3b5" stroke="#d97a92" strokeWidth={6} />
      <ellipse cx={s * 0.4} cy={s * 0.02} rx={s * 0.1} ry={s * 0.09} fill="#f08ca4" stroke="#d97a92" strokeWidth={5} />
      <circle cx={s * 0.37} cy={0} r={s * 0.015} fill="#a04b62" /><circle cx={s * 0.43} cy={0} r={s * 0.015} fill="#a04b62" />
      <circle cx={s * 0.22} cy={-s * 0.1} r={s * 0.025} fill="#3b2a30" />
      <path d={`M${s * 0.14},${-s * 0.28} l${s * 0.07},${-s * 0.12} l${s * 0.06},${s * 0.12}Z`} fill="#f08ca4" />
      {[-0.25, -0.05, 0.12, 0.28].map((x, i) => <rect key={i} x={s * x - s * 0.035} y={s * 0.26} width={s * 0.07} height={s * 0.14} rx={s * 0.02} fill="#e98fa5" />)}
      <rect x={-s * 0.07} y={-s * 0.33} width={s * 0.14} height={s * 0.025} rx={4} fill="#a04b62" />
      {text && <T x={-s * 0.04} y={s * 0.02} fs={fs} fill="#5a1f33">{text}</T>}
      {d > 0 && d < 0.5 && <circle cx={0} cy={-s * 0.32} r={s * (0.05 + d * 0.5)} fill="none" stroke={pal.accent} strokeWidth={6} opacity={1 - d / 0.5} />}
    </g>
  );
};

/** A bucket with a hole, the water level falling and drops leaking: money draining away. */
export const LeakyBucket: React.FC<PropArgs & { level?: number }> = ({ s, k, t, text, fs, level = 0.35, pal }) => {
  const water = 1 - (1 - level) * Math.min(1, t / 3);
  const top = -s * 0.36, bottom = s * 0.36, wy = bottom - (bottom - top) * 0.92 * water;
  return (
    <g transform={`scale(${0.3 + 0.7 * k})`}>
      <defs><clipPath id="bucket-clip"><path d={`M${-s * 0.4},${top} L${s * 0.4},${top} L${s * 0.3},${bottom} L${-s * 0.3},${bottom}Z`} /></clipPath></defs>
      <path d={`M${-s * 0.4},${top} L${s * 0.4},${top} L${s * 0.3},${bottom} L${-s * 0.3},${bottom}Z`} fill="#b07a4b" stroke="#7d5330" strokeWidth={7} />
      <g clipPath="url(#bucket-clip)"><rect x={-s / 2} y={wy} width={s} height={s} fill="#4dabf7" opacity={0.9} /><path d={`M${-s / 2},${wy} q${s * 0.12},${-10 * Math.sin(t * 3)} ${s * 0.25},0 t${s * 0.25},0 t${s * 0.25},0 t${s * 0.25},0`} fill="#a5d8ff" /></g>
      {[top + 30, (top + bottom) / 2, bottom - 30].map((y, i) => <rect key={i} x={-s * 0.42} y={y - 6} width={s * 0.84} height={12} fill="#7d5330" opacity={0.6} />)}
      {Array.from({ length: 5 }, (_, i) => {
        const ph = (t * 1.6 + i / 5) % 1;
        return <ellipse key={i} cx={s * 0.24 + ph * 30} cy={bottom - 40 + ph * s * 0.5} rx={9} ry={14} fill="#4dabf7" opacity={1 - ph} />;
      })}
      <circle cx={s * 0.26} cy={bottom - 46} r={9} fill="#3b2412" />
      {text && <T x={0} y={top - fs * 0.8} fs={fs} fill={pal.danger}>{text}</T>}
    </g>
  );
};

/** A bank vault door; the wheel turns and the door swings open. */
export const Vault: React.FC<PropArgs> = ({ s, k, t, text, fs, pal }) => {
  const open = Math.min(1, Math.max(0, (t - 0.6) / 0.8));
  return (
    <g transform={`scale(${0.3 + 0.7 * k})`}>
      <circle r={s * 0.46} fill="#5c6474" stroke="#3a404c" strokeWidth={14} />
      <circle r={s * 0.38} fill="#20242c" />
      {text && <T x={0} y={0} fs={fs} fill={pal.accent}>{text}</T>}
      <g transform={`translate(${-s * 0.38 * open},0) scale(${1 - 0.85 * open},1)`}>
        <circle r={s * 0.38} fill="#8a93a5" stroke="#5c6474" strokeWidth={8} />
        <g transform={`rotate(${t * 120})`}>
          {[0, 60, 120].map((a) => <rect key={a} x={-s * 0.3} y={-10} width={s * 0.6} height={20} rx={10} fill="#5c6474" transform={`rotate(${a})`} />)}
          <circle r={s * 0.08} fill="#3a404c" />
        </g>
      </g>
    </g>
  );
};

/** A long receipt printing out line by line; its total is the figure. */
export const Receipt: React.FC<PropArgs & { rows?: number }> = ({ s, k, text, label, fs, rows = 6 }) => {
  const h = s * 1.3 * k;
  return (
    <g>
      <rect x={-s / 2} y={-s * 0.65} width={s} height={h} fill="#fffdf8" stroke="#ddd3c0" strokeWidth={4} />
      {Array.from({ length: rows }, (_, i) => i * s * 0.1 + s * 0.08 < h - s * 0.3
        ? <g key={i}><rect x={-s * 0.4} y={-s * 0.55 + i * s * 0.1} width={s * (0.3 + (i % 3) * 0.1)} height={10} rx={5} fill="#d8ccb4" /><rect x={s * 0.2} y={-s * 0.55 + i * s * 0.1} width={s * 0.2} height={10} rx={5} fill="#d8ccb4" /></g>
        : null)}
      {k > 0.95 && label && <T x={-s * 0.4} y={-s * 0.65 + h - s * 0.2} fs={fs * 0.45} fill="#6b5f4a" weight={700} anchor="start">{label}</T>}
      {k > 0.95 && text && <T x={s * 0.42} y={-s * 0.65 + h - s * 0.08} fs={fs} fill="#1d2433" anchor="end">{text}</T>}
    </g>
  );
};

/** A desk calendar whose pages flip to the label (a year, "Month 12"). */
export const CalendarFlip: React.FC<PropArgs> = ({ s, k, t, text, fs, pal }) => {
  const flips = Math.floor(Math.max(0, t - 0.3) / 0.12);
  const flipping = flips < 6;
  return (
    <g transform={`scale(${0.3 + 0.7 * k})`}>
      <rect x={-s / 2} y={-s * 0.42} width={s} height={s * 0.84} rx={s * 0.05} fill="#ffffff" stroke="#d4d9e2" strokeWidth={5} />
      <rect x={-s / 2} y={-s * 0.42} width={s} height={s * 0.2} rx={s * 0.05} fill={pal.danger} />
      {[-0.3, 0, 0.3].map((x, i) => <rect key={i} x={s * x - 8} y={-s * 0.5} width={16} height={s * 0.14} rx={8} fill="#4b5563" />)}
      {flipping && <rect x={-s / 2} y={-s * 0.22} width={s} height={s * 0.64 * Math.abs(Math.cos(((t - 0.3) % 0.12) / 0.12 * Math.PI))} fill="#f1f3f7" />}
      {!flipping && text && <T x={0} y={s * 0.1} fs={fs} fill="#111827">{text}</T>}
    </g>
  );
};

/** A wall screen for charts in a world; `children` draw inside its glass (0..sw, 0..sh). */
export const WallScreen: React.FC<{ sw: number; sh: number; k: number; children?: React.ReactNode }> = ({ sw, sh, k, children }) => (
  <g opacity={Math.min(1, k * 2)}>
    <rect x={-24} y={-24} width={sw + 48} height={sh + 48} rx={22} fill="#1f2430" />
    <rect x={0} y={0} width={sw} height={sh} rx={10} fill="#0f1a2e" />
    <g clipPath="url(#screen-clip)">{children}</g>
    <defs><clipPath id="screen-clip"><rect x={0} y={0} width={sw} height={sh} rx={10} /></clipPath></defs>
    <rect x={sw / 2 - 60} y={sh + 24} width={120} height={50} fill="#2b3140" />
  </g>
);

export type MoneyPropName = "cheque" | "stack" | "tag" | "anvil" | "piggy" | "bucket" | "vault" | "receipt" | "calendar";
export const MONEY_PROPS: Record<MoneyPropName, React.FC<PropArgs & { fill?: number; level?: number }>> = {
  cheque: Cheque, stack: CashStack, tag: PriceTag, anvil: Anvil, piggy: PiggyBank, bucket: LeakyBucket,
  vault: Vault, receipt: Receipt, calendar: CalendarFlip,
};
