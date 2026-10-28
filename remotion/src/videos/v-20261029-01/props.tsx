/**
 * The things "One day on $25,000 a year vs $25 million a year" is about, drawn for this video
 * only: a stopwatch that runs through the hour, the day pages (Tuesday, Friday), Rohan's thin
 * wallet that empties, Sharma's money sack, a month's pay packet, a sports car, a sunrise, a rent
 * key, a city bus, a lunch box, a mansion, a mountain of money sacks, Rohan's little coin pile, a
 * bed under the night, a champagne bottle and money wearing a hard hat (the night shift).
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const dayPage = (word: string, top: string): PropSet[string] => ({ s, t }) => (
  <g transform={`translate(0,${bob(t, s, 1.4)}) rotate(${Math.sin(t * 1.1) * 3})`}>
    <Shadow w={s * 0.8} s={s} />
    <Box x={-s * 0.4} y={-s * 0.9} w={s * 0.8} h={s * 0.86} fill="#fff" s={s} r={0.06} sheen={false} />
    <rect x={-s * 0.4} y={-s * 0.9} width={s * 0.8} height={s * 0.24} rx={s * 0.04} fill={top} stroke={INK} strokeWidth={line(s)} />
    {[-0.24, 0.24].map((x) => <rect key={x} x={s * x - s * 0.03} y={-s * 0.98} width={s * 0.06} height={s * 0.16} rx={s * 0.03} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.5} />)}
    <Paint x={0} y={-s * 0.32} text={word} size={s * 0.26} fill={INK} />
  </g>
);

const props: PropSet = {
  // a big stopwatch: k (0..1) is how far the red hand has swept, the face fills as it runs
  stopwatch: ({ s, t, k = 0 }) => {
    const r = s * 0.4, a = (k * 360 + t * 40) * Math.PI / 180;
    return (
      <g transform={`translate(0,${bob(t, s)})`}>
        <Shadow w={s * 0.8} s={s} />
        <rect x={-s * 0.07} y={-s * 1.0} width={s * 0.14} height={s * 0.12} rx={s * 0.03} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s)} />
        <Ball cx={0} cy={-s * 0.46} rx={r + s * 0.05} fill={PALETTE.red} s={s} />
        <circle cx={0} cy={-s * 0.46} r={r * 0.9} fill={PALETTE.cream} stroke={INK} strokeWidth={line(s) * 0.6} />
        <path d={`M0,${-s * 0.46} L0,${-s * 0.46 - r * 0.9} A${r * 0.9},${r * 0.9} 0 ${k > 0.5 ? 1 : 0} 1 ${Math.sin(k * 6.283) * r * 0.9},${-s * 0.46 - Math.cos(k * 6.283) * r * 0.9} Z`} fill={PALETTE.yellow} opacity={k > 0.01 ? 0.7 : 0} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={Math.sin(i * 0.5236) * r * 0.78} y1={-s * 0.46 - Math.cos(i * 0.5236) * r * 0.78} x2={Math.sin(i * 0.5236) * r * 0.88} y2={-s * 0.46 - Math.cos(i * 0.5236) * r * 0.88} stroke={INK} strokeWidth={line(s) * 0.6} />)}
        <line x1={0} y1={-s * 0.46} x2={Math.sin(a) * r * 0.8} y2={-s * 0.46 - Math.cos(a) * r * 0.8} stroke={PALETTE.red} strokeWidth={line(s) * 1.2} strokeLinecap="round" />
        <circle cx={0} cy={-s * 0.46} r={s * 0.04} fill={INK} />
      </g>
    );
  },
  tuesday: dayPage("TUE", PALETTE.blue),
  friday: dayPage("FRI", PALETTE.green),
  // Rohan's thin wallet: state "empty" opens it, nothing inside, a moth flutters out
  wallet: ({ s, t, state }) => {
    const empty = state === "empty";
    return (
      <g>
        <Shadow w={s * 0.9} s={s} />
        {!empty && <rect x={-s * 0.32} y={-s * 0.62} width={s * 0.5} height={s * 0.22} rx={s * 0.02} fill="#9dc79f" stroke={INK} strokeWidth={line(s) * 0.5} transform="rotate(-6)" />}
        <Box x={-s * 0.45} y={-s * 0.5} w={s * 0.9} h={s * 0.48} fill={PALETTE.brown} s={s} r={0.12} />
        <rect x={s * 0.12} y={-s * 0.38} width={s * 0.33} height={s * 0.18} rx={s * 0.06} fill={shade(PALETTE.brown, -0.25)} stroke={INK} strokeWidth={line(s) * 0.6} />
        {empty && <g transform={`translate(${Math.sin(t * 3) * s * 0.2},${-s * 0.7 - (t % 2) * s * 0.15})`}>
          <ellipse cx={-s * 0.06} cy={0} rx={s * 0.07} ry={s * 0.04 * (1 + Math.sin(t * 20))} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.4} />
          <ellipse cx={s * 0.06} cy={0} rx={s * 0.07} ry={s * 0.04 * (1 + Math.sin(t * 20))} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.4} />
        </g>}
      </g>
    );
  },
  // Sharma's money sack, tied with gold rope, a dollar sign painted on
  moneybag: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 1.6) * 2})`}>
      <Shadow w={s * 0.9} s={s} />
      <Shape d={`M${-s * 0.15},${-s * 0.78} Q${-s * 0.5},${-s * 0.55} ${-s * 0.42},${-s * 0.2} Q${-s * 0.35},0 0,0 Q${s * 0.35},0 ${s * 0.42},${-s * 0.2} Q${s * 0.5},${-s * 0.55} ${s * 0.15},${-s * 0.78} Z`} fill={PALETTE.tan} s={s} />
      <path d={`M${-s * 0.2},${-s * 0.78} Q0,${-s * 0.72} ${s * 0.2},${-s * 0.78}`} stroke={PALETTE.gold} strokeWidth={s * 0.05} fill="none" />
      <Shape d={`M${-s * 0.12},${-s * 0.8} L${-s * 0.2},${-s * 0.96} L0,${-s * 0.86} L${s * 0.2},${-s * 0.96} L${s * 0.12},${-s * 0.8} Z`} fill={PALETTE.tan} s={s} />
      <Paint x={0} y={-s * 0.2} text="$" size={s * 0.42} fill={PALETTE.green} />
    </g>
  ),
  // a month's pay packet with a "MONTH" stamp
  monthpay: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2)}) rotate(-4)`}>
      <Shadow w={s * 1.0} s={s} />
      <Box x={-s * 0.5} y={-s * 0.62} w={s * 1.0} h={s * 0.58} fill={PALETTE.cream} s={s} r={0.05} sheen={false} />
      <path d={`M${-s * 0.5},${-s * 0.62} L0,${-s * 0.35} L${s * 0.5},${-s * 0.62}`} fill="none" stroke={INK} strokeWidth={line(s)} />
      <rect x={-s * 0.32} y={-s * 0.25} width={s * 0.64} height={s * 0.16} rx={s * 0.03} fill="none" stroke={PALETTE.red} strokeWidth={line(s)} />
      <Paint x={0} y={-s * 0.12} text="MONTH" size={s * 0.13} fill={PALETTE.red} />
    </g>
  ),
  // a low red sports car, wheels spinning, headlight glinting
  sportscar: ({ s, t }) => {
    const spin = t * 400;
    return (
      <g>
        <Shadow w={s * 1.8} s={s} />
        <Shape d={`M${-s * 0.95},${-s * 0.12} L${-s * 0.9},${-s * 0.32} L${-s * 0.4},${-s * 0.38} L${-s * 0.15},${-s * 0.58} L${s * 0.35},${-s * 0.58} L${s * 0.65},${-s * 0.36} L${s * 0.95},${-s * 0.3} L${s * 0.95},${-s * 0.12} Z`} fill={PALETTE.red} s={s} />
        <Shape d={`M${-s * 0.1},${-s * 0.53} L${s * 0.32},${-s * 0.53} L${s * 0.52},${-s * 0.38} L${-s * 0.3},${-s * 0.38} Z`} fill="#bfe6ff" s={s} />
        <circle cx={s * 0.88} cy={-s * 0.24} r={s * 0.04} fill={PALETTE.yellow} opacity={0.6 + 0.4 * Math.sin(t * 5)} />
        {[-0.55, 0.55].map((x) => (
          <g key={x} transform={`translate(${s * x},${-s * 0.12}) rotate(${spin})`}>
            <circle r={s * 0.15} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s)} />
            <circle r={s * 0.07} fill={PALETTE.grey} />
            <line x1={-s * 0.07} x2={s * 0.07} y1={0} y2={0} stroke={INK} strokeWidth={line(s) * 0.5} />
          </g>
        ))}
      </g>
    );
  },
  // a sun rising over a hill, rays turning
  sunrise: ({ s, t, k = 1 }) => (
    <g>
      <g transform={`translate(0,${-s * 0.3 - k * s * 0.25}) rotate(${t * 20})`}>
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-s * 0.03} y={-s * 0.48} width={s * 0.06} height={s * 0.14} rx={s * 0.03} fill={PALETTE.yellow} transform={`rotate(${i * 36})`} />)}
      </g>
      <Ball cx={0} cy={-s * 0.3 - k * s * 0.25} rx={s * 0.28} fill={PALETTE.orange} s={s} />
      <Shape d={`M${-s * 0.7},0 Q0,${-s * 0.5} ${s * 0.7},0 Z`} fill={PALETTE.green} s={s} />
    </g>
  ),
  // the flat's rent key on a big tag
  rentkey: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 2.4) * 10},0,${-s})`}>
      <line x1={0} y1={-s} x2={0} y2={-s * 0.82} stroke={INK} strokeWidth={line(s) * 0.6} />
      <Ball cx={0} cy={-s * 0.7} rx={s * 0.14} fill={PALETTE.gold} s={s} />
      <circle cx={0} cy={-s * 0.7} r={s * 0.05} fill={PALETTE.cream} stroke={INK} strokeWidth={line(s) * 0.5} />
      <Box x={-s * 0.035} y={-s * 0.58} w={s * 0.07} h={s * 0.5} fill={PALETTE.gold} s={s} r={0.3} sheen={false} />
      <rect x={s * 0.03} y={-s * 0.22} width={s * 0.1} height={s * 0.05} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.5} />
      <rect x={s * 0.03} y={-s * 0.13} width={s * 0.07} height={s * 0.05} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.5} />
      <Box x={-s * 0.35} y={-s * 0.62} w={s * 0.26} h={s * 0.18} fill={PALETTE.cream} s={s} r={0.15} sheen={false} />
      <Paint x={-s * 0.22} y={-s * 0.49} text="RENT" size={s * 0.07} fill={PALETTE.red} />
    </g>
  ),
  // a city bus, windows lit, bouncing a little
  bus: ({ s, t }) => (
    <g transform={`translate(0,${Math.abs(Math.sin(t * 6)) * -s * 0.015})`}>
      <Shadow w={s * 1.9} s={s} />
      <Box x={-s * 0.95} y={-s * 0.75} w={s * 1.9} h={s * 0.62} fill={PALETTE.yellow} s={s} r={0.08} />
      {[-0.78, -0.42, -0.06, 0.3].map((x) => <rect key={x} x={s * x} y={-s * 0.66} width={s * 0.3} height={s * 0.22} rx={s * 0.03} fill="#bfe6ff" stroke={INK} strokeWidth={line(s) * 0.6} />)}
      <rect x={s * 0.64} y={-s * 0.66} width={s * 0.22} height={s * 0.48} rx={s * 0.03} fill="#bfe6ff" stroke={INK} strokeWidth={line(s) * 0.6} />
      <Paint x={-s * 0.2} y={-s * 0.22} text="CITY" size={s * 0.12} fill={INK} />
      {[-0.6, 0.55].map((x) => <circle key={x} cx={s * x} cy={-s * 0.12} r={s * 0.12} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s)} />)}
    </g>
  ),
  // a plastic lunch box with a sandwich peeking out
  lunchbox: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.9} s={s} />
      <Box x={-s * 0.45} y={-s * 0.42} w={s * 0.9} h={s * 0.4} fill={PALETTE.teal} s={s} r={0.15} />
      <g transform={`rotate(${-14 - Math.abs(Math.sin(t * 2)) * 6},${-s * 0.45},${-s * 0.42})`}>
        <Box x={-s * 0.45} y={-s * 0.5} w={s * 0.9} h={s * 0.1} fill={shade(PALETTE.teal, 0.2)} s={s} r={0.3} sheen={false} />
      </g>
      <Shape d={`M${-s * 0.25},${-s * 0.42} L0,${-s * 0.62} L${s * 0.25},${-s * 0.42} Z`} fill={PALETTE.tan} s={s} />
      <path d={`M${-s * 0.18},${-s * 0.46} L${s * 0.18},${-s * 0.46}`} stroke={PALETTE.green} strokeWidth={s * 0.04} />
    </g>
  ),
  // a white mansion with columns and lit windows
  mansion: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.6} s={s} />
      <Box x={-s * 0.8} y={-s * 0.6} w={s * 1.6} h={s * 0.6} fill={PALETTE.cream} s={s} r={0.02} sheen={false} />
      <Shape d={`M${-s * 0.9},${-s * 0.6} L0,${-s * 0.95} L${s * 0.9},${-s * 0.6} Z`} fill={PALETTE.navy} s={s} />
      {[-0.55, -0.25, 0.25, 0.55].map((x) => <rect key={x} x={s * x - s * 0.04} y={-s * 0.58} width={s * 0.08} height={s * 0.56} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.5} />)}
      {[-0.4, 0.4].map((x, i) => <rect key={x} x={s * x - s * 0.08} y={-s * 0.45} width={s * 0.16} height={s * 0.14} fill={PALETTE.yellow} opacity={0.7 + 0.3 * Math.sin(t * 2 + i)} stroke={INK} strokeWidth={line(s) * 0.5} />)}
      <rect x={-s * 0.1} y={-s * 0.3} width={s * 0.2} height={s * 0.3} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.6} />
    </g>
  ),
  // a mountain of money sacks, the top one glinting
  moneymountain: ({ s, t }) => {
    const rows = [5, 4, 3, 2, 1];
    return (
      <g>
        <Shadow w={s * 1.6} s={s} />
        {rows.map((n, r) => Array.from({ length: n }, (_, i) => {
          const x = (i - (n - 1) / 2) * s * 0.3, y = -r * s * 0.2;
          return (
            <g key={`${r}${i}`} transform={`translate(${x},${y})`}>
              <Shape d={`M${-s * 0.13},${-s * 0.02} Q${-s * 0.17},${-s * 0.2} ${-s * 0.05},${-s * 0.24} L${s * 0.05},${-s * 0.24} Q${s * 0.17},${-s * 0.2} ${s * 0.13},${-s * 0.02} Z`} fill={(r + i) % 2 ? PALETTE.tan : shade(PALETTE.tan, -0.1)} s={s} />
              <Paint x={0} y={-s * 0.07} text="$" size={s * 0.1} fill={PALETTE.green} />
            </g>
          );
        }))}
        <circle cx={s * 0.05} cy={-s * 1.02} r={s * (0.03 + 0.02 * Math.sin(t * 6))} fill="#fff" />
      </g>
    );
  },
  // Rohan's little pile of coins
  coinpile: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.7} s={s} />
      {[0, 1, 2, 3].map((i) => <Ball key={i} cx={(i % 2 ? 0.06 : -0.06) * s} cy={-s * 0.08 - i * s * 0.1} rx={s * 0.22} ry={s * 0.07} fill={PALETTE.gold} s={s} />)}
      <circle cx={s * 0.1} cy={-s * 0.4} r={s * (0.02 + 0.015 * Math.sin(t * 5))} fill="#fff" />
    </g>
  ),
  // a narrow bed with a pillow, a "Zzz" drifting up
  bed: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.6} s={s} />
      <rect x={-s * 0.8} y={-s * 0.55} width={s * 0.08} height={s * 0.55} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.6} />
      <Box x={-s * 0.78} y={-s * 0.3} w={s * 1.56} h={s * 0.22} fill={PALETTE.blue} s={s} r={0.2} />
      <Ball cx={-s * 0.55} cy={-s * 0.36} rx={s * 0.18} ry={s * 0.08} fill="#fff" s={s} />
      {[0, 1, 2].map((i) => { const f = (t * 0.5 + i / 3) % 1; return <Paint key={i} x={-s * 0.4 + f * s * 0.3} y={-s * 0.5 - f * s * 0.4} text="z" size={s * (0.08 + f * 0.08)} fill="#fff" />; })}
    </g>
  ),
  // a champagne bottle, cork popping on a loop, bubbles
  champagne: ({ s, t }) => {
    const f = (t * 0.8) % 1;
    return (
      <g transform={`rotate(${Math.sin(t * 2) * 4})`}>
        <Shadow w={s * 0.5} s={s} />
        <Shape d={`M${-s * 0.15},0 L${-s * 0.15},${-s * 0.5} Q${-s * 0.15},${-s * 0.62} ${-s * 0.05},${-s * 0.7} L${-s * 0.05},${-s * 0.88} L${s * 0.05},${-s * 0.88} L${s * 0.05},${-s * 0.7} Q${s * 0.15},${-s * 0.62} ${s * 0.15},${-s * 0.5} L${s * 0.15},0 Z`} fill={PALETTE.green} s={s} />
        <rect x={-s * 0.13} y={-s * 0.4} width={s * 0.26} height={s * 0.16} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.5} />
        <rect x={-s * 0.05} y={-s * 0.9 - f * s * 0.3} width={s * 0.1} height={s * 0.08} rx={s * 0.02} fill={PALETTE.tan} stroke={INK} strokeWidth={line(s) * 0.5} />
        {[0, 1, 2, 3].map((i) => <circle key={i} cx={Math.sin(t * 4 + i) * s * 0.08} cy={-s * 0.95 - ((t * 0.9 + i / 4) % 1) * s * 0.3} r={s * 0.025} fill="#fff" opacity={0.8} />)}
      </g>
    );
  },
  // a bundle of notes wearing a yellow hard hat, swinging a tiny pickaxe: money on the night shift
  hardhat: ({ s, t }) => {
    const swing = Math.sin(t * 6) * 30;
    return (
      <g transform={`translate(0,${bob(t, s, 3, 0.02)})`}>
        <Shadow w={s * 0.8} s={s} />
        <Box x={-s * 0.32} y={-s * 0.62} w={s * 0.64} h={s * 0.58} fill="#9dc79f" s={s} r={0.08} />
        <rect x={-s * 0.32} y={-s * 0.36} width={s * 0.64} height={s * 0.08} fill={PALETTE.cream} stroke={INK} strokeWidth={line(s) * 0.5} />
        <circle cx={-s * 0.1} cy={-s * 0.48} r={s * 0.035} fill={INK} />
        <circle cx={s * 0.1} cy={-s * 0.48} r={s * 0.035} fill={INK} />
        <Shape d={`M${-s * 0.3},${-s * 0.64} Q0,${-s * 0.95} ${s * 0.3},${-s * 0.64} Z`} fill={PALETTE.yellow} s={s} />
        <rect x={-s * 0.36} y={-s * 0.67} width={s * 0.72} height={s * 0.05} rx={s * 0.02} fill={PALETTE.yellow} stroke={INK} strokeWidth={line(s) * 0.5} />
        <circle cx={0} cy={-s * 0.78} r={s * 0.04} fill="#fff" opacity={0.6 + 0.4 * Math.sin(t * 7)} />
        <g transform={`translate(${s * 0.34},${-s * 0.3}) rotate(${swing})`}>
          <line x1={0} y1={0} x2={s * 0.22} y2={-s * 0.22} stroke={PALETTE.brown} strokeWidth={s * 0.04} strokeLinecap="round" />
          <path d={`M${s * 0.12},${-s * 0.3} Q${s * 0.25},${-s * 0.26} ${s * 0.3},${-s * 0.12}`} stroke={PALETTE.grey} strokeWidth={s * 0.05} fill="none" strokeLinecap="round" />
        </g>
        {clamp01(Math.sin(t * 6)) > 0.9 && <circle cx={s * 0.58} cy={-s * 0.42} r={s * 0.03} fill={PALETTE.yellow} />}
      </g>
    );
  },
};

export default props;
