/**
 * The things "Elon Musk can't just give it away" is about, drawn for this video only: a briefcase of
 * cash, a stack of share certificates (Tesla shares), a tax envelope, a gift box, an electric car,
 * a stock ticker screen, a charity jar and a battery pack.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // an open briefcase full of banknotes
  cashcase: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)})`}>
      <Shadow w={s * 1.0} s={s} />
      <Box x={-s * 0.5} y={-s * 0.42} w={s * 1.0} h={s * 0.42} fill={PALETTE.dark} s={s} r={0.06} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={-s * 0.44 + i * s * 0.22} y={-s * 0.4} width={s * 0.2} height={s * 0.12} rx={s * 0.02} fill={PALETTE.green} stroke={INK} strokeWidth={line(s) * 0.5} />)}
      <Box x={-s * 0.5} y={-s * 0.78} w={s * 1.0} h={s * 0.36} fill={shade(PALETTE.dark, 0.15)} s={s} r={0.06} />
      <rect x={-s * 0.12} y={-s * 0.88} width={s * 0.24} height={s * 0.1} rx={s * 0.04} fill="none" stroke={INK} strokeWidth={line(s)} />
      <Paint x={0} y={-s * 0.58} text="$" size={s * 0.16} fill={PALETTE.green} />
    </g>
  ),
  // a stack of share certificates; "tall" stacks more
  sharestack: ({ s, t, state }) => {
    const n = state === "tall" ? 7 : 4;
    return (
      <g>
        <Shadow w={s * 0.9} s={s} />
        {Array.from({ length: n }, (_, i) => (
          <g key={i} transform={`translate(${Math.sin(i * 1.7 + t * 0.6) * s * 0.02},${-i * s * 0.11})`}>
            <Box x={-s * 0.42} y={-s * 0.11} w={s * 0.84} h={s * 0.1} fill={PALETTE.cream} s={s} r={0.1} sheen={false} />
            <rect x={-s * 0.38} y={-s * 0.09} width={s * 0.76} height={s * 0.06} fill="none" stroke={PALETTE.red} strokeWidth={line(s) * 0.5} />
          </g>
        ))}
        <Paint x={0} y={-n * s * 0.11 - s * 0.06} text="SHARES" size={s * 0.1} fill={PALETTE.red} />
      </g>
    );
  },
  // a brown tax envelope with a red TAX stamp
  taxenvelope: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2)}) rotate(-4)`}>
      <Shadow w={s * 0.9} s={s} />
      <Box x={-s * 0.45} y={-s * 0.62} w={s * 0.9} h={s * 0.55} fill={PALETTE.tan} s={s} r={0.04} sheen={false} />
      <path d={`M${-s * 0.45},${-s * 0.62} L0,${-s * 0.3} L${s * 0.45},${-s * 0.62}`} fill="none" stroke={INK} strokeWidth={line(s)} />
      <rect x={-s * 0.2} y={-s * 0.26} width={s * 0.4} height={s * 0.13} rx={s * 0.02} fill="none" stroke={PALETTE.red} strokeWidth={line(s) * 1.2} />
      <Paint x={0} y={-s * 0.16} text="TAX" size={s * 0.1} fill={PALETTE.red} />
    </g>
  ),
  // a gift box with a ribbon; k (0..1) is its size
  giftbox: ({ s, t, k = 1 }) => {
    const q = s * (0.5 + 0.5 * Math.max(0, Math.min(1, k)));
    return (
      <g transform={`translate(0,${bob(t, s, 2.2)})`}>
        <Shadow w={q * 0.9} s={s} />
        <Box x={-q * 0.4} y={-q * 0.6} w={q * 0.8} h={q * 0.6} fill={PALETTE.purple} s={s} r={0.04} />
        <Box x={-q * 0.45} y={-q * 0.72} w={q * 0.9} h={q * 0.14} fill={shade(PALETTE.purple, 0.2)} s={s} r={0.04} />
        <rect x={-q * 0.06} y={-q * 0.72} width={q * 0.12} height={q * 0.72} fill={PALETTE.gold} />
        <Ball cx={-q * 0.12} cy={-q * 0.8} rx={q * 0.12} ry={q * 0.07} fill={PALETTE.gold} s={s} />
        <Ball cx={q * 0.12} cy={-q * 0.8} rx={q * 0.12} ry={q * 0.07} fill={PALETTE.gold} s={s} />
      </g>
    );
  },
  // a sleek electric car (no badge), wheels turning
  evcar: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.2} s={s} />
      <Shape d={`M${-s * 0.6},${-s * 0.1} L${-s * 0.58},${-s * 0.26} Q${-s * 0.3},${-s * 0.3} ${-s * 0.18},${-s * 0.46} Q${s * 0.1},${-s * 0.52} ${s * 0.3},${-s * 0.32} Q${s * 0.58},${-s * 0.28} ${s * 0.6},${-s * 0.14} L${s * 0.6},${-s * 0.1} Z`} fill={PALETTE.red} s={s} />
      <path d={`M${-s * 0.14},${-s * 0.42} Q${s * 0.08},${-s * 0.47} ${s * 0.24},${-s * 0.32} L${-s * 0.2},${-s * 0.32} Z`} fill="#bfe6ff" stroke={INK} strokeWidth={line(s) * 0.6} />
      {[-0.36, 0.36].map((x, i) => (
        <g key={i} transform={`translate(${s * x},${-s * 0.1}) rotate(${t * 200})`}>
          <circle r={s * 0.11} fill={INK} />
          <line x1={-s * 0.06} x2={s * 0.06} y1={0} y2={0} stroke={PALETTE.grey} strokeWidth={line(s) * 0.6} />
        </g>
      ))}
    </g>
  ),
  // a stock ticker screen with a line that falls; k (0..1) is how far it has fallen
  ticker: ({ s, t, k = 0.5 }) => {
    const pts = Array.from({ length: 8 }, (_, i) => `${-s * 0.4 + i * s * 0.114},${-s * (0.6 - (i > 3 ? (i - 3) * 0.06 * k * 1.6 : i * 0.02))}`).join(" ");
    return (
      <g>
        <Shadow w={s * 0.9} s={s} />
        <rect x={-s * 0.04} y={-s * 0.2} width={s * 0.08} height={s * 0.2} fill={PALETTE.grey} />
        <Box x={-s * 0.5} y={-s * 0.85} w={s * 1.0} h={s * 0.66} fill={PALETTE.navy} s={s} r={0.04} />
        <polyline points={pts} fill="none" stroke={PALETTE.red} strokeWidth={line(s) * 1.4} strokeLinejoin="round" />
        <circle cx={s * 0.4} cy={-s * (0.6 - 4 * 0.06 * k * 1.6)} r={s * 0.03 * (1 + 0.3 * Math.sin(t * 6))} fill={PALETTE.red} />
      </g>
    );
  },
  // a glass charity jar with a heart and a few coins
  charityjar: ({ s, t, k = 0.5 }) => (
    <g>
      <Shadow w={s * 0.6} s={s} />
      <path d={`M${-s * 0.24},${-s * 0.7} L${-s * 0.28},${-s * 0.05} Q0,${s * 0.02} ${s * 0.28},${-s * 0.05} L${s * 0.24},${-s * 0.7} Z`} fill="#e8f6ff" fillOpacity={0.55} stroke={INK} strokeWidth={line(s)} />
      <rect x={-s * 0.26} y={-s * (0.06 + 0.5 * k)} width={s * 0.52} height={s * 0.5 * k} fill={PALETTE.gold} opacity={0.8} />
      <rect x={-s * 0.27} y={-s * 0.8} width={s * 0.54} height={s * 0.1} rx={s * 0.03} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.6} />
      <path d={`M0,${-s * 0.32} c${-s * 0.12},${-s * 0.1} ${-s * 0.12},${-s * 0.22} 0,${-s * 0.18} c${s * 0.12},${-s * 0.04} ${s * 0.12},${s * 0.08} 0,${s * 0.18}`} fill={PALETTE.pink} stroke={INK} strokeWidth={line(s) * 0.5} transform={`translate(0,${Math.sin(t * 3) * s * 0.01})`} />
    </g>
  ),
  // a battery pack with a pulsing charge
  battery: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.7} s={s} />
      <Box x={-s * 0.35} y={-s * 0.4} w={s * 0.7} h={s * 0.4} fill={PALETTE.dark} s={s} r={0.08} />
      <rect x={s * 0.35} y={-s * 0.27} width={s * 0.06} height={s * 0.14} fill={PALETTE.grey} />
      <rect x={-s * 0.3} y={-s * 0.35} width={s * 0.6 * (0.5 + 0.5 * Math.abs(Math.sin(t * 1.5)))} height={s * 0.3} rx={s * 0.03} fill={PALETTE.green} />
    </g>
  ),
};

export default props;
