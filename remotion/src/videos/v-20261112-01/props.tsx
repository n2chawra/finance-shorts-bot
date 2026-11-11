/**
 * The things "Apple keeps more of a services dollar" is about, drawn for this video only: an iPhone
 * (camera bump, app icons on its screen), a MacBook, a smartwatch, an iCloud cloud with a storage bar,
 * headphones (music), an App Store tile, a dollar bill split into the kept share (k 0..1) and the cost,
 * Rohan's wallet, a phone factory with a chimney and conveyor, and a monthly bill that stacks up.
 */
import React from "react";
import { Ball, Box, INK, line, PALETTE, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const ICONS = [PALETTE.blue, PALETTE.green, PALETTE.red, PALETTE.orange, PALETTE.purple, PALETTE.teal, PALETTE.pink, PALETTE.yellow, PALETTE.mint];

const props: PropSet = {
  // a big modern phone: dark frame, glowing screen with a grid of app icons, the camera bump
  iphone: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.6} s={s} />
      <rect x={-s * 0.27} y={-s * 1.0} width={s * 0.54} height={s * 1.0} rx={s * 0.08} fill="#2b2f3a" stroke={INK} strokeWidth={line(s)} />
      <rect x={-s * 0.235} y={-s * 0.96} width={s * 0.47} height={s * 0.92} rx={s * 0.06} fill="#7fb8ff" />
      <rect x={-s * 0.235} y={-s * 0.96} width={s * 0.47} height={s * 0.92} rx={s * 0.06} fill="#c7a2ff" opacity={0.35 + 0.15 * Math.sin(t * 1.4)} />
      <rect x={-s * 0.07} y={-s * 0.94} width={s * 0.14} height={s * 0.04} rx={s * 0.02} fill={INK} />
      {ICONS.map((c, i) => (
        <rect key={i} x={-s * 0.19 + (i % 3) * s * 0.14} y={-s * 0.82 + Math.floor(i / 3) * s * 0.16} width={s * 0.1} height={s * 0.1} rx={s * 0.025} fill={c} stroke={INK} strokeWidth={line(s) * 0.3} />
      ))}
      <rect x={-s * 0.2} y={-s * 0.2} width={s * 0.4} height={s * 0.1} rx={s * 0.04} fill="#ffffff" opacity={0.45} />
    </g>
  ),
  // an open laptop: silver lid with a screen, a keyboard deck
  macbook: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.1} s={s} />
      <rect x={-s * 0.5} y={-s * 0.7} width={s * 1.0} height={s * 0.62} rx={s * 0.04} fill="#c9ced8" stroke={INK} strokeWidth={line(s)} />
      <rect x={-s * 0.45} y={-s * 0.65} width={s * 0.9} height={s * 0.52} rx={s * 0.02} fill="#3b4a7a" />
      <rect x={-s * 0.4} y={-s * 0.58} width={s * 0.5} height={s * 0.06} rx={s * 0.02} fill="#ffffff" opacity={0.5 + 0.2 * Math.sin(t * 2)} />
      <rect x={-s * 0.4} y={-s * 0.46} width={s * 0.7} height={s * 0.05} rx={s * 0.02} fill={PALETTE.mint} opacity={0.7} />
      <Shape d={`M${-s * 0.62},${-s * 0.08} L${s * 0.62},${-s * 0.08} L${s * 0.56},${0} L${-s * 0.56},${0} Z`} fill="#b8bec9" s={s} />
    </g>
  ),
  // a smartwatch: rounded square face with rings, a strap
  smartwatch: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.5} s={s} />
      <rect x={-s * 0.14} y={-s * 1.0} width={s * 0.28} height={s * 1.0} rx={s * 0.08} fill={PALETTE.orange} stroke={INK} strokeWidth={line(s)} />
      <rect x={-s * 0.24} y={-s * 0.74} width={s * 0.48} height={s * 0.5} rx={s * 0.12} fill="#2b2f3a" stroke={INK} strokeWidth={line(s)} />
      {[0.15, 0.11, 0.07].map((r, i) => (
        <circle key={r} cx={0} cy={-s * 0.49} r={s * r} fill="none" stroke={[PALETTE.red, PALETTE.green, PALETTE.blue][i]} strokeWidth={s * 0.03}
          strokeDasharray={`${s * r * 6.28 * (0.55 + 0.15 * i + 0.05 * Math.sin(t + i))} ${s * r * 6.28}`} transform={`rotate(-90 0 ${-s * 0.49})`} />
      ))}
    </g>
  ),
  // a puffy white cloud with a blue storage bar filling (k)
  icloud: ({ s, t, k = 0.6 }) => (
    <g transform={`translate(0,${Math.sin(t * 1.6) * s * 0.02})`}>
      <Shadow w={s * 0.8} s={s} />
      {[[-0.25, -0.45, 0.22], [0.02, -0.6, 0.28], [0.28, -0.45, 0.2], [0, -0.38, 0.25]].map(([x, y, r], i) => (
        <Ball key={i} cx={x! * s} cy={y! * s} rx={r! * s} fill="#f4f8ff" s={s} />
      ))}
      <rect x={-s * 0.3} y={-s * 0.32} width={s * 0.6} height={s * 0.08} rx={s * 0.04} fill="#d5deee" stroke={INK} strokeWidth={line(s) * 0.4} />
      <rect x={-s * 0.3} y={-s * 0.32} width={s * 0.6 * Math.max(0.1, Math.min(1, k))} height={s * 0.08} rx={s * 0.04} fill={PALETTE.blue} />
    </g>
  ),
  // over-ear headphones with music notes floating up
  headphones: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.7} s={s} />
      <path d={`M${-s * 0.3},${-s * 0.3} Q${-s * 0.32},${-s * 0.85} 0,${-s * 0.85} Q${s * 0.32},${-s * 0.85} ${s * 0.3},${-s * 0.3}`} fill="none" stroke={INK} strokeWidth={s * 0.07} />
      <path d={`M${-s * 0.3},${-s * 0.3} Q${-s * 0.32},${-s * 0.85} 0,${-s * 0.85} Q${s * 0.32},${-s * 0.85} ${s * 0.3},${-s * 0.3}`} fill="none" stroke={PALETTE.pink} strokeWidth={s * 0.04} />
      <Box x={-s * 0.4} y={-s * 0.42} w={s * 0.18} h={s * 0.34} fill={PALETTE.pink} s={s} r={s * 0.07} />
      <Box x={s * 0.22} y={-s * 0.42} w={s * 0.18} h={s * 0.34} fill={PALETTE.pink} s={s} r={s * 0.07} />
      {[0, 1].map((i) => {
        const f = (t * 0.6 + i * 0.5) % 1;
        const nx = (i ? 0.12 : -0.12) * s, ny = -s * (0.5 + f * 0.5);
        return <g key={i} opacity={1 - f}><ellipse cx={nx} cy={ny} rx={s * 0.05} ry={s * 0.035} fill={INK} /><rect x={nx + s * 0.035} y={ny - s * 0.16} width={s * 0.018} height={s * 0.16} fill={INK} /></g>;
      })}
    </g>
  ),
  // the App Store tile: a blue rounded square with a white A made of three sticks
  appstore: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 2) * 2})`}>
      <Shadow w={s * 0.8} s={s} />
      <rect x={-s * 0.4} y={-s * 0.85} width={s * 0.8} height={s * 0.8} rx={s * 0.18} fill="#1f8bff" stroke={INK} strokeWidth={line(s)} />
      <rect x={-s * 0.4} y={-s * 0.85} width={s * 0.8} height={s * 0.35} rx={s * 0.18} fill="#ffffff" opacity={0.15} />
      <line x1={-s * 0.05} y1={-s * 0.7} x2={-s * 0.22} y2={-s * 0.22} stroke="#fff" strokeWidth={s * 0.06} strokeLinecap="round" />
      <line x1={s * 0.05} y1={-s * 0.7} x2={s * 0.22} y2={-s * 0.22} stroke="#fff" strokeWidth={s * 0.06} strokeLinecap="round" />
      <line x1={-s * 0.24} y1={-s * 0.38} x2={s * 0.24} y2={-s * 0.38} stroke="#fff" strokeWidth={s * 0.06} strokeLinecap="round" />
    </g>
  ),
  // a big green dollar bill; k (0..1) of it glows gold as the share kept, the rest is greyed cost
  splitbill: ({ s, t, k = 1 }) => {
    const f = Math.max(0, Math.min(1, k));
    const W = s * 0.9, H = s * 0.48;
    return (
      <g transform={`rotate(${Math.sin(t * 1.2) * 1.5})`}>
        <Shadow w={W} s={s} />
        <rect x={-W / 2} y={-H - s * 0.04} width={W} height={H} rx={s * 0.04} fill="#9a9fa8" stroke={INK} strokeWidth={line(s)} />
        <rect x={-W / 2} y={-H - s * 0.04} width={W * f} height={H} rx={s * 0.04} fill="#6fcf87" />
        <rect x={-W / 2 + s * 0.05} y={-H + s * 0.01} width={W - s * 0.1} height={H - s * 0.1} rx={s * 0.03} fill="none" stroke={shade("#6fcf87", -0.35)} strokeWidth={line(s) * 0.6} />
        <Ball cx={0} cy={-H / 2 - s * 0.04} rx={s * 0.16} fill={PALETTE.cream} s={s} />
        <text x={0} y={-H / 2 + s * 0.04} textAnchor="middle" fontSize={s * 0.22} fontWeight={900} fill={shade("#6fcf87", -0.45)}>$</text>
        <line x1={-W / 2 + W * f} y1={-H - s * 0.08} x2={-W / 2 + W * f} y2={0} stroke={INK} strokeWidth={line(s) * 0.8} strokeDasharray={`${s * 0.05} ${s * 0.04}`} />
      </g>
    );
  },
  // Rohan's brown leather wallet with a note peeking out
  wallet: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.8} s={s} />
      <rect x={-s * 0.3} y={-s * 0.58 - Math.abs(Math.sin(t * 2)) * s * 0.03} width={s * 0.5} height={s * 0.25} rx={s * 0.02} fill="#7fcf8f" stroke={INK} strokeWidth={line(s) * 0.6} />
      <Box x={-s * 0.4} y={-s * 0.45} w={s * 0.8} h={s * 0.45} fill={PALETTE.brown} s={s} r={s * 0.06} />
      <rect x={s * 0.15} y={-s * 0.3} width={s * 0.25} height={s * 0.14} rx={s * 0.05} fill={shade(PALETTE.brown, -0.2)} stroke={INK} strokeWidth={line(s) * 0.5} />
      <circle cx={s * 0.3} cy={-s * 0.23} r={s * 0.025} fill={PALETTE.gold} />
    </g>
  ),
  // a phone factory: saw-tooth roof, a chimney puffing, a conveyor with phones on it
  factory: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.2} s={s} />
      <rect x={s * 0.25} y={-s * 0.95} width={s * 0.12} height={s * 0.4} fill="#8e5b49" stroke={INK} strokeWidth={line(s) * 0.6} />
      {[0, 1].map((i) => {
        const f = (t * 0.5 + i * 0.5) % 1;
        return <circle key={i} cx={s * (0.31 + f * 0.1)} cy={-s * (1.0 + f * 0.3)} r={s * (0.05 + f * 0.06)} fill="#dfe3ea" opacity={1 - f} />;
      })}
      <Box x={-s * 0.55} y={-s * 0.55} w={s * 1.1} h={s * 0.55} fill="#c9ced8" s={s} r={s * 0.02} />
      <Shape d={`M${-s * 0.55},${-s * 0.55} L${-s * 0.35},${-s * 0.75} L${-s * 0.35},${-s * 0.55} L${-s * 0.15},${-s * 0.75} L${-s * 0.15},${-s * 0.55} L${s * 0.05},${-s * 0.75} L${s * 0.05},${-s * 0.55} Z`} fill="#9aa3b5" s={s} />
      <rect x={-s * 0.45} y={-s * 0.2} width={s * 0.9} height={s * 0.06} fill={INK} />
      {[0, 1, 2].map((i) => {
        const x = ((t * 0.3 + i / 3) % 1) * s * 0.8 - s * 0.4;
        return <rect key={i} x={x - s * 0.04} y={-s * 0.33} width={s * 0.08} height={s * 0.13} rx={s * 0.02} fill="#2b2f3a" stroke={INK} strokeWidth={line(s) * 0.3} />;
      })}
      <rect x={-s * 0.45} y={-s * 0.45} width={s * 0.25} height={s * 0.12} fill="#ffe9a8" stroke={INK} strokeWidth={line(s) * 0.4} />
    </g>
  ),
  // a monthly bill: a paper slip with three lines and a red due stamp, stacking pages behind it
  monthlybill: ({ s, t, k = 0.3 }) => {
    const n = 1 + Math.round(Math.max(0, Math.min(1, k)) * 4);
    return (
      <g>
        <Shadow w={s * 0.7} s={s} />
        {Array.from({ length: n }, (_, i) => (
          <rect key={i} x={-s * 0.3 + i * s * 0.03} y={-s * 0.9 - i * s * 0.03} width={s * 0.6} height={s * 0.85} rx={s * 0.03} fill={i === n - 1 ? "#ffffff" : "#e8ecf3"} stroke={INK} strokeWidth={line(s) * 0.6} />
        ))}
        {[0.7, 0.55, 0.4].map((y, i) => <rect key={y} x={-s * 0.2 + (n - 1) * s * 0.03} y={-s * y - (n - 1) * s * 0.03} width={s * (0.4 - i * 0.08)} height={s * 0.04} rx={s * 0.02} fill={PALETTE.grey} />)}
        <circle cx={s * 0.12 + (n - 1) * s * 0.03} cy={-s * 0.22 - (n - 1) * s * 0.03} r={s * 0.09} fill="none" stroke={PALETTE.red} strokeWidth={s * 0.025} opacity={0.6 + 0.4 * Math.sin(t * 3)} />
      </g>
    );
  },
};

export default props;
