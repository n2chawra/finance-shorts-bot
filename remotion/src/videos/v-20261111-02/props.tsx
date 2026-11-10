/**
 * The things "Berkshire's cash pile" is about, drawn for this video only: a war chest (an open
 * treasure chest stuffed with cash bricks), a government bill (a cream certificate with a seal and a
 * ribbon), a glass jar filling with interest coins, a plain brick head office with a flag, a red SALE
 * sign on a post, a shopping cart, a market chart crashing (state "crash"), a price tag swinging,
 * a padlock (cash kept safe) and a pocket watch (waiting).
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // an open wooden chest overflowing with green cash bricks, a glint on top
  warchest: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.3} s={s} />
      {[[-0.32, 0], [0, 0], [0.32, 0], [-0.16, 1], [0.16, 1], [0, 2]].map(([x, r], i) => (
        <g key={i}>
          <rect x={x! * s - s * 0.15} y={-s * (0.56 + r! * 0.11)} width={s * 0.3} height={s * 0.11} rx={s * 0.015} fill="#7fcf8f" stroke={INK} strokeWidth={line(s) * 0.4} />
          <rect x={x! * s - s * 0.03} y={-s * (0.56 + r! * 0.11)} width={s * 0.06} height={s * 0.11} fill={PALETTE.cream} />
        </g>
      ))}
      <Box x={-s * 0.55} y={-s * 0.48} w={s * 1.1} h={s * 0.48} fill={PALETTE.brown} s={s} r={s * 0.04} />
      <rect x={-s * 0.55} y={-s * 0.3} width={s * 1.1} height={s * 0.06} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.5} />
      <Box x={-s * 0.08} y={-s * 0.36} w={s * 0.16} h={s * 0.16} fill={PALETTE.gold} s={s} r={s * 0.02} />
      <Shape d={`M${-s * 0.55},${-s * 0.48} L${-s * 0.5},${-s * 0.9} L${s * 0.5},${-s * 0.9} L${s * 0.55},${-s * 0.48} Z`} fill={shade(PALETTE.brown, -0.15)} s={s} opacity={0.0} />
      <circle cx={s * 0.2} cy={-s * 0.8} r={s * 0.03} fill="#fff" opacity={0.5 + 0.5 * Math.sin(t * 5)} />
    </g>
  ),
  // a government bill: a cream certificate with a blue border, a red seal and a ribbon
  tbill: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 1.5) * 2})`}>
      <Shadow w={s * 0.9} s={s} />
      <rect x={-s * 0.45} y={-s * 0.62} width={s * 0.9} height={s * 0.6} rx={s * 0.03} fill={PALETTE.cream} stroke={INK} strokeWidth={line(s)} />
      <rect x={-s * 0.4} y={-s * 0.57} width={s * 0.8} height={s * 0.5} rx={s * 0.02} fill="none" stroke={PALETTE.blue} strokeWidth={line(s) * 0.8} />
      {[0.46, 0.38, 0.3].map((y) => <rect key={y} x={-s * 0.3} y={-s * y} width={s * 0.4} height={s * 0.03} rx={s * 0.015} fill={PALETTE.grey} />)}
      <Ball cx={s * 0.24} cy={-s * 0.2} rx={s * 0.09} fill={PALETTE.red} s={s} />
      <Shape d={`M${s * 0.2},${-s * 0.13} L${s * 0.16},${s * 0.02} L${s * 0.22},${-s * 0.02} L${s * 0.26},${s * 0.04} L${s * 0.28},${-s * 0.13} Z`} fill={PALETTE.red} s={s * 0.4} />
    </g>
  ),
  // a glass jar; k fills it with gold coins
  interestjar: ({ s, t, k = 0.3 }) => {
    const f = Math.max(0.08, Math.min(1, k));
    return (
      <g>
        <Shadow w={s * 0.7} s={s} />
        <rect x={-s * 0.28} y={-s * 0.08 - s * 0.62 * f} width={s * 0.56} height={s * 0.62 * f} fill={PALETTE.gold} opacity={0.9} />
        {Array.from({ length: Math.round(6 * f) }, (_, i) => <ellipse key={i} cx={-s * 0.15 + (i % 3) * s * 0.15} cy={-s * 0.12 - Math.floor(i / 3) * s * 0.12} rx={s * 0.07} ry={s * 0.03} fill={shade(PALETTE.gold, 0.2)} stroke={INK} strokeWidth={line(s) * 0.3} />)}
        <rect x={-s * 0.3} y={-s * 0.75} width={s * 0.6} height={s * 0.73} rx={s * 0.08} fill="#dff3ff" opacity={0.35} stroke={INK} strokeWidth={line(s)} />
        <rect x={-s * 0.22} y={-s * 0.86} width={s * 0.44} height={s * 0.1} rx={s * 0.02} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.6} />
        <rect x={-s * 0.2} y={-s * 0.62} width={s * 0.05} height={s * 0.4} rx={s * 0.02} fill="#fff" opacity={0.5 + 0.2 * Math.sin(t * 2)} />
      </g>
    );
  },
  // a plain brick head office with rows of windows and a flag on the roof
  hq: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.0} s={s} />
      <Box x={-s * 0.4} y={-s * 0.8} w={s * 0.8} h={s * 0.8} fill="#b5654a" s={s} r={s * 0.01} />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-s * 0.32 + (i % 4) * s * 0.17} y={-s * 0.72 + Math.floor(i / 4) * s * 0.19} width={s * 0.11} height={s * 0.12} fill="#ffe9a8" stroke={INK} strokeWidth={line(s) * 0.4} />)}
      <rect x={-s * 0.08} y={-s * 0.18} width={s * 0.16} height={s * 0.18} fill={INK} />
      <line x1={s * 0.3} y1={-s * 0.8} x2={s * 0.3} y2={-s * 1.05} stroke={INK} strokeWidth={line(s) * 0.6} />
      <Shape d={`M${s * 0.3},${-s * 1.05} Q${s * 0.4},${-s * (1.0 + 0.03 * Math.sin(t * 4))} ${s * 0.5},${-s * 1.02} L${s * 0.5},${-s * 0.93} Q${s * 0.4},${-s * (0.92 + 0.03 * Math.sin(t * 4))} ${s * 0.3},${-s * 0.96} Z`} fill={PALETTE.blue} s={s * 0.5} />
    </g>
  ),
  // a red sale sign on a post, wobbling
  salesign: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 3) * 3} 0 0)`}>
      <Shadow w={s * 0.5} s={s} />
      <rect x={-s * 0.03} y={-s * 0.6} width={s * 0.06} height={s * 0.6} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.5} />
      <Box x={-s * 0.4} y={-s * 0.95} w={s * 0.8} h={s * 0.4} fill={PALETTE.red} s={s} r={s * 0.05} />
      <text x={0} y={-s * 0.68} textAnchor="middle" fontSize={s * 0.22} fontWeight={900} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.3}>SALE</text>
    </g>
  ),
  // a shopping cart on four wheels
  cart: ({ s, t }) => (
    <g transform={`translate(${Math.sin(t * 2) * s * 0.01},0)`}>
      <Shadow w={s * 0.9} s={s} />
      <path d={`M${-s * 0.5},${-s * 0.62} L${-s * 0.38},${-s * 0.62} L${-s * 0.28},${-s * 0.2} L${s * 0.36},${-s * 0.2} L${s * 0.44},${-s * 0.5} L${-s * 0.34},${-s * 0.5}`} fill="#e8eef7" stroke={INK} strokeWidth={line(s)} strokeLinejoin="round" />
      {[-0.1, 0.06, 0.22].map((x) => <line key={x} x1={x * s} y1={-s * 0.5} x2={x * s - s * 0.02} y2={-s * 0.2} stroke={INK} strokeWidth={line(s) * 0.4} />)}
      <circle cx={-s * 0.2} cy={-s * 0.07} r={s * 0.06} fill={INK} />
      <circle cx={s * 0.28} cy={-s * 0.07} r={s * 0.06} fill={INK} />
    </g>
  ),
  // a price chart: a line climbing; "crash" sends it diving red
  crashchart: ({ s, t, state }) => {
    const crash = state === "crash";
    const pts = crash ? [[-0.4, -0.3], [-0.2, -0.45], [0, -0.55], [0.15, -0.35], [0.28, -0.22], [0.4, -0.12]] : [[-0.4, -0.2], [-0.2, -0.3], [0, -0.4], [0.2, -0.5], [0.4, -0.62]];
    return (
      <g>
        <Shadow w={s * 1.0} s={s} />
        <Box x={-s * 0.5} y={-s * 0.8} w={s * 1.0} h={s * 0.78} fill="#fff" s={s} r={s * 0.04} />
        {[0.25, 0.45, 0.65].map((y) => <line key={y} x1={-s * 0.45} y1={-s * y} x2={s * 0.45} y2={-s * y} stroke={PALETTE.grey} strokeWidth={line(s) * 0.3} opacity={0.5} />)}
        <polyline points={pts.map(([x, y]) => `${x! * s},${y! * s}`).join(" ")} fill="none" stroke={crash ? PALETTE.red : PALETTE.green} strokeWidth={line(s) * 1.4} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={pts[pts.length - 1]![0]! * s} cy={pts[pts.length - 1]![1]! * s} r={s * (0.03 + 0.01 * Math.sin(t * 6))} fill={crash ? PALETTE.red : PALETTE.green} />
      </g>
    );
  },
  // a swinging price tag on a string
  pricetag: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 2.5) * 10} 0 ${-s * 0.9})`}>
      <line x1={0} y1={-s * 0.9} x2={0} y2={-s * 0.62} stroke={INK} strokeWidth={line(s) * 0.5} />
      <Shape d={`M${-s * 0.18},${-s * 0.6} L${s * 0.18},${-s * 0.6} L${s * 0.3},${-s * 0.4} L${s * 0.3},${-s * 0.05} L${-s * 0.3},${-s * 0.05} L${-s * 0.3},${-s * 0.4} Z`} fill={PALETTE.yellow} s={s} />
      <circle cx={0} cy={-s * 0.5} r={s * 0.04} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.4} />
    </g>
  ),
  // a big padlock, shackle shut
  padlock: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)})`}>
      <Shadow w={s * 0.6} s={s} />
      <path d={`M${-s * 0.16},${-s * 0.45} L${-s * 0.16},${-s * 0.62} A${s * 0.16},${s * 0.16} 0 0 1 ${s * 0.16},${-s * 0.62} L${s * 0.16},${-s * 0.45}`} fill="none" stroke={PALETTE.grey} strokeWidth={line(s) * 2.2} />
      <Box x={-s * 0.28} y={-s * 0.48} w={s * 0.56} h={s * 0.46} fill={PALETTE.gold} s={s} r={s * 0.06} />
      <circle cx={0} cy={-s * 0.28} r={s * 0.05} fill={INK} />
      <rect x={-s * 0.015} y={-s * 0.28} width={s * 0.03} height={s * 0.1} fill={INK} />
    </g>
  ),
  // a gold pocket watch on its chain, ticking
  pocketwatch: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.6} s={s} />
      <path d={`M0,${-s * 0.72} q${s * 0.2},${-s * 0.2} ${s * 0.35},${-s * 0.05}`} fill="none" stroke={PALETTE.gold} strokeWidth={line(s) * 0.7} strokeDasharray={`${s * 0.03} ${s * 0.02}`} />
      <circle cx={0} cy={-s * 0.38} r={s * 0.33} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s)} />
      <circle cx={0} cy={-s * 0.38} r={s * 0.26} fill="#fffdf2" stroke={INK} strokeWidth={line(s) * 0.5} />
      <line x1={0} y1={-s * 0.38} x2={0} y2={-s * 0.58} stroke={INK} strokeWidth={line(s) * 0.8} strokeLinecap="round" transform={`rotate(${Math.floor(t * 2) * 30} 0 ${-s * 0.38})`} />
      <circle cx={0} cy={-s * 0.38} r={s * 0.025} fill={INK} />
    </g>
  ),
  // a big round vault door with a spoked wheel, turning slowly
  vaultdoor: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.0} s={s} />
      <circle cx={0} cy={-s * 0.48} r={s * 0.46} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s)} />
      <circle cx={0} cy={-s * 0.48} r={s * 0.36} fill={shade(PALETTE.grey, 0.2)} stroke={INK} strokeWidth={line(s) * 0.6} />
      {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={Math.cos(i * 0.628) * s * 0.41} cy={-s * 0.48 + Math.sin(i * 0.628) * s * 0.41} r={s * 0.02} fill={INK} />)}
      <g transform={`translate(0,${-s * 0.48}) rotate(${t * 25})`}>
        {[0, 60, 120].map((a) => <rect key={a} x={-s * 0.2} y={-s * 0.015} width={s * 0.4} height={s * 0.03} rx={s * 0.015} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.3} transform={`rotate(${a})`} />)}
        <circle r={s * 0.06} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.5} />
      </g>
    </g>
  ),
  // a big bouncing question mark
  questionmark: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 3, 0.04)})`}>
      <Shadow w={s * 0.4} s={s} />
      <path d={`M${-s * 0.18},${-s * 0.72} Q${-s * 0.18},${-s * 0.95} 0,${-s * 0.95} Q${s * 0.2},${-s * 0.95} ${s * 0.2},${-s * 0.75} Q${s * 0.2},${-s * 0.6} 0,${-s * 0.5} L0,${-s * 0.32}`} fill="none" stroke={INK} strokeWidth={line(s) * 4.2} strokeLinecap="round" />
      <path d={`M${-s * 0.18},${-s * 0.72} Q${-s * 0.18},${-s * 0.95} 0,${-s * 0.95} Q${s * 0.2},${-s * 0.95} ${s * 0.2},${-s * 0.75} Q${s * 0.2},${-s * 0.6} 0,${-s * 0.5} L0,${-s * 0.32}`} fill="none" stroke={PALETTE.purple} strokeWidth={line(s) * 2.6} strokeLinecap="round" />
      <circle cx={0} cy={-s * 0.14} r={s * 0.07} fill={PALETTE.purple} stroke={INK} strokeWidth={line(s) * 0.7} />
    </g>
  ),
  // a desk calendar page for one year, pages fluttering
  yearpage: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.7} s={s} />
      {[2, 1, 0].map((i) => <rect key={i} x={-s * 0.3 + i * s * 0.03} y={-s * 0.78 + i * s * 0.03} width={s * 0.6} height={s * 0.74} rx={s * 0.04} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.6} transform={i === 0 ? `rotate(${Math.sin(t * 4) * 4} ${-s * 0.3} ${-s * 0.78})` : undefined} />)}
      <rect x={-s * 0.3} y={-s * 0.78} width={s * 0.6} height={s * 0.16} rx={s * 0.04} fill={PALETTE.teal} stroke={INK} strokeWidth={line(s) * 0.6} />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-s * 0.22 + (i % 4) * s * 0.12} y={-s * 0.52 + Math.floor(i / 4) * s * 0.14} width={s * 0.08} height={s * 0.08} rx={s * 0.015} fill={i === 11 ? PALETTE.gold : PALETTE.grey} />)}
    </g>
  ),
};

export default props;
