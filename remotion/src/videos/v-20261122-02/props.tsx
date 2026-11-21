// Props for the Musk jet Short: the desert runway at sunset, the white private jet (side on), an invoice with a
// company logo and an amount, a guard in a black suit, a stack of cash.
import React from "react";
import { Ball, Block, Cash, Glow, INK, STROKE, Txt, type Motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Photo } from "../../studio/photo";

export const SUNSET = "#3a1d3f";

/** The desert runway at sunset: sky gradient, sun, far dunes, the tarmac with its centre line. */
export const Runway: React.FC<{ m: Motion }> = ({ m }) => (
  <g>
    <defs>
      <linearGradient id="mj-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2b1d5c" />
        <stop offset="0.55" stopColor="#e2557a" />
        <stop offset="1" stopColor="#ffb35c" />
      </linearGradient>
    </defs>
    <rect x={-900} y={-900} width={2880} height={2000} fill="url(#mj-sky)" />
    <Glow x={760} y={880} r={300} color="#ffe3a0" o={0.6} />
    <circle cx={760} cy={900} r={130} fill="#ffd27a" />
    <path d="M -900 1010 Q -400 900 100 1000 T 1100 980 T 1980 1000 L 1980 1100 L -900 1100 Z" fill="#c9734f" stroke={INK} strokeWidth={5} />
    <rect x={-900} y={1080} width={2880} height={1500} fill="#4a3a4a" />
    <rect x={-900} y={1080} width={2880} height={20} fill="#2f2632" />
    {Array.from({ length: 14 }).map((_, i) => (
      <rect key={i} x={-880 + i * 220 - ((m.t * 2) % 220)} y={1300} width={120} height={18} rx={6} fill="#f4efe3" opacity={0.85} />
    ))}
  </g>
);

/** The white private jet, side on, nose to the right; `doorOpen` drops the steps. Its centre at (x, y). */
export const Jet: React.FC<{ x: number; y: number; s?: number; m: Motion; steps?: number; tail?: React.ReactNode; glow?: number }> = ({ x, y, s = 1, m, steps = 1, tail, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={190} rx={520} ry={28} fill="#000" opacity={0.3} />
    {/* tail fin */}
    <path d="M -430 -40 L -560 -330 L -470 -330 L -330 -50 Z" fill="#f4f6fb" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
    {tail}
    {/* fuselage */}
    <path d="M -480 -60 Q -500 40 -440 70 L 380 70 Q 520 60 540 0 Q 520 -60 400 -80 L -420 -80 Z" fill="#ffffff" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
    <rect x={-440} y={20} width={880} height={14} fill="#2c4a8a" />
    {/* cockpit and windows */}
    <path d="M 430 -66 Q 500 -50 515 -18 L 440 -18 Z" fill="#7fb8ff" stroke={INK} strokeWidth={4} />
    {[-300, -210, -120, -30, 60, 150].map((wx) => <ellipse key={wx} cx={wx} cy={-30} rx={22} ry={17} fill="#7fb8ff" stroke={INK} strokeWidth={4} />)}
    {/* the door and its steps */}
    <rect x={250} y={-68} width={70} height={120} rx={14} fill="#e8ecf5" stroke={INK} strokeWidth={4} />
    {steps > 0 ? (
      <g opacity={steps}>
        <path d={`M 250 52 L 320 52 L ${330 + 120 * steps} 190 L ${260 + 120 * steps} 190 Z`} fill="#d8dce8" stroke={INK} strokeWidth={4} />
        {[0.3, 0.55, 0.8].map((k) => <line key={k} x1={250 + (10 + 120 * steps) * k} y1={52 + 138 * k} x2={320 + (10 + 120 * steps) * k} y2={52 + 138 * k} stroke={INK} strokeWidth={3} />)}
      </g>
    ) : null}
    {/* wing and engine */}
    <path d="M -120 40 L -300 150 L -200 150 L 40 50 Z" fill="#e8ecf5" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
    <rect x={-400} y={-120} width={150} height={60} rx={30} fill="#d8dce8" stroke={INK} strokeWidth={5} />
    <Glow x={-420} y={-90} r={90 + glow * 60} color="#ffb35c" o={0.2 + 0.5 * glow + 0.1 * Math.sin(m.t / 3)} />
    {/* wheels */}
    {[-200, 300].map((wx) => <Ball key={wx} x={wx} y={160} r={30} fill="#2a2a32" />)}
    <line x1={-200} y1={70} x2={-200} y2={135} stroke={INK} strokeWidth={8} />
    <line x1={300} y1={70} x2={300} y2={135} stroke={INK} strokeWidth={8} />
  </g>
);

/** An invoice: white paper with a logo at the top, "INVOICE", lines and an amount box. `amount` is a placeholder
 * figure; `k` (0..1) stamps it in. Top-left at (x, y). */
export const Invoice: React.FC<{ x: number; y: number; w: number; logo: string; amount: string; k: number; to?: string; rot?: number }> = ({ x, y, w, logo, amount, k, to, rot = 0 }) => {
  const h = w * 1.3;
  return (
    <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x + 10} y={y + 12} width={w} height={h} rx={10} fill="#000" opacity={0.25} />
      <rect x={x} y={y} width={w} height={h} rx={10} fill="#fbf8f0" stroke={INK} strokeWidth={STROKE} />
      <g transform={`translate(${x + w / 2} ${y + w * 0.2})`}><Photo name={logo} s={w * 0.11} t={0} /></g>
      <Txt x={x + w / 2} y={y + w * 0.32} size={w * 0.1} fill={INK} deco={w * 0.1 < 44}>INVOICE</Txt>
      {to ? <Txt x={x + w / 2} y={y + w * 0.46} size={w * 0.065} fill="#6b6880" weight={700} deco>{to}</Txt> : null}
      {[0.58, 0.66, 0.74].map((r) => <rect key={r} x={x + w * 0.12} y={y + w * r} width={w * 0.76} height={w * 0.025} rx={4} fill="#d7d2c4" />)}
      {k > 0 ? (
        <g transform={`translate(${x + w / 2} ${y + w * 1.03}) scale(${1 + (1 - Math.min(1, k)) * 1.2}) rotate(-4)`}>
          <rect x={-w * 0.42} y={-w * 0.12} width={w * 0.84} height={w * 0.24} rx={10} fill="#ffc43d" stroke={INK} strokeWidth={5} />
          <Txt x={0} y={2} size={Math.max(48, w * 0.13)} fill={INK}>{amount}</Txt>
        </g>
      ) : null}
    </g>
  );
};

/** A guard in a black suit and dark glasses with an earpiece. */
export const Guard: React.FC<{ x: number; y: number; s: number; m: Motion; i: number; look?: [number, number] }> = ({ x, y, s, m, i, look = [0, 0] }) => (
  <g>
    <Char x={x} y={y + m.wave(70 + i * 4, 2, i)} s={s} outfit="suit" top="#1a1a22" pants="#1a1a22" hair="side" hairColor="#1d1a2b"
      skin={["#c98652", "#8d5524", "#f1c27d", "#a86b3c"][i % 4]} glasses face="neutral" look={look} armL={[15, -20]} armR={[15, -20]} />
    <path d={`M ${x + s * 0.42} ${y - s * 2.35} q ${s * 0.12} ${s * 0.2} ${s * 0.02} ${s * 0.45}`} fill="none" stroke="#e8ecf5" strokeWidth={Math.max(3, s * 0.02)} />
  </g>
);

/** A neat stack of cash bundles, `n` high, base centre at (x, y). */
export const CashStack: React.FC<{ x: number; y: number; n: number; w?: number }> = ({ x, y, n, w = 200 }) => (
  <g>
    {Array.from({ length: Math.max(0, Math.floor(n)) }).map((_, i) => (
      <Cash key={i} x={x - w / 2 + ((i * 13) % 9) - 4} y={y - (i + 1) * w * 0.32} w={w} />
    ))}
  </g>
);

export const Desk: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => (
  <g>
    <Block x={x} y={y} w={w} h={40} fill="#8a6f4a" shadow="bottom" />
    <Block x={x + 20} y={y + 40} w={w - 40} h={300} fill="#6b5236" shadow={false} />
  </g>
);

export default { Runway, Jet, Invoice, Guard, CashStack, Desk };
