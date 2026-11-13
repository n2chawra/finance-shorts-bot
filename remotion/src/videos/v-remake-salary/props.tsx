/**
 * The things "Paid $1 a year" is about, drawn for this video only: a pay slip, a stack of share
 * certificates with a rising line, a bank, a mansion, a private jet, a tycoon in a top hat (the 25
 * richest, one each), a paycheck envelope, and a company building with a rising chart on its roof.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a pay slip on a clipboard: a header band, lines, and an amount box (the figure is a tag, never painted)
  payslip: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)}) rotate(-4)`}>
      <Shadow w={s * 0.9} s={s} />
      <Box x={-s * 0.42} y={-s} w={s * 0.84} h={s * 0.98} fill={PALETTE.cream} s={s} r={0.06} />
      <rect x={-s * 0.42} y={-s} width={s * 0.84} height={s * 0.18} rx={s * 0.05} fill={PALETTE.green} stroke={INK} strokeWidth={line(s)} />
      <Paint x={0} y={-s * 0.87} text="PAY SLIP" size={s * 0.09} fill="#fff" />
      {[0.32, 0.42, 0.52].map((y, i) => <rect key={i} x={-s * 0.32} y={-s + s * y} width={s * (0.64 - i * 0.12)} height={s * 0.03} rx={s * 0.015} fill={shade(PALETTE.grey, 0.2)} />)}
      <rect x={-s * 0.32} y={-s * 0.36} width={s * 0.64} height={s * 0.2} rx={s * 0.03} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.8} />
    </g>
  ),
  // share certificates fanned out, the top one with a line climbing across it
  // state "locked": a padlock and a chain across them (pledged to the bank)
  shares: ({ s, t, state }) => {
    const k = 0.5 + 0.5 * Math.sin(t * 1.2);
    const lock = state === "locked";
    return (
      <g>
        <Shadow w={s * 1.1} s={s} />
        {[2, 1, 0].map((i) => (
          <g key={i} transform={`translate(${(i - 1) * s * 0.12},${-i * s * 0.05}) rotate(${(i - 1) * 6})`}>
            <Box x={-s * 0.45} y={-s * 0.8} w={s * 0.9} h={s * 0.62} fill={i === 0 ? "#fff8e6" : shade("#fff8e6", -0.06 * i)} s={s} r={0.05} sheen={false} />
            <rect x={-s * 0.4} y={-s * 0.75} width={s * 0.8} height={s * 0.52} rx={s * 0.03} fill="none" stroke={PALETTE.gold} strokeWidth={line(s)} />
          </g>
        ))}
        <path d={`M${-s * 0.32},${-s * 0.3} L${-s * 0.12},${-s * 0.42} L${s * 0.04},${-s * 0.36} L${s * 0.3},${-s * (0.58 + 0.06 * k)}`} fill="none" stroke={PALETTE.green} strokeWidth={line(s) * 2.2} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={s * 0.3} cy={-s * (0.58 + 0.06 * k)} r={s * 0.045} fill={PALETTE.green} stroke={INK} strokeWidth={line(s) * 0.6} />
        <Paint x={0} y={-s * 0.66} text="SHARES" size={s * 0.08} fill={shade(PALETTE.gold, -0.35)} />
        {lock && <g>
          <path d={`M${-s * 0.55},${-s * 0.62} L${s * 0.55},${-s * 0.32}`} stroke={PALETTE.grey} strokeWidth={s * 0.05} strokeDasharray={`${s * 0.06} ${s * 0.03}`} />
          <Box x={-s * 0.12} y={-s * 0.5} w={s * 0.24} h={s * 0.2} fill={PALETTE.gold} s={s} r={0.15} />
          <path d={`M${-s * 0.07},${-s * 0.5} v${-s * 0.06} a${s * 0.07},${s * 0.07} 0 0 1 ${s * 0.14},0 v${s * 0.06}`} fill="none" stroke={INK} strokeWidth={line(s) * 1.4} />
          <circle cx={0} cy={-s * 0.41} r={s * 0.025} fill={INK} />
        </g>}
      </g>
    );
  },
  // a bank: steps, four columns, a pediment with a coin on top
  bank: ({ s }) => (
    <g>
      <Shadow w={s * 1.2} s={s} />
      <Box x={-s * 0.6} y={-s * 0.12} w={s * 1.2} h={s * 0.12} fill={PALETTE.grey} s={s} r={0.1} sheen={false} />
      {[-0.42, -0.14, 0.14, 0.42].map((x) => <Box key={x} x={s * x - s * 0.06} y={-s * 0.62} w={s * 0.12} h={s * 0.5} fill="#f4f1e6" s={s} r={0.2} sheen={false} />)}
      <Shape d={`M${-s * 0.64},${-s * 0.62} L0,${-s * 0.92} L${s * 0.64},${-s * 0.62} Z`} fill={PALETTE.teal} s={s} />
      <Ball cx={0} cy={-s * 0.98} rx={s * 0.08} fill={PALETTE.gold} s={s} />
    </g>
  ),
  // a big house: two wings, a door, warm windows
  mansion: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.4} s={s} />
      <Box x={-s * 0.7} y={-s * 0.55} w={s * 1.4} h={s * 0.55} fill="#f2e2c4" s={s} r={0.04} />
      <Shape d={`M${-s * 0.78},${-s * 0.55} L0,${-s * 0.9} L${s * 0.78},${-s * 0.55} Z`} fill={PALETTE.red} s={s} />
      {[-0.5, -0.25, 0.25, 0.5].map((x, i) => <rect key={x} x={s * x - s * 0.07} y={-s * 0.45} width={s * 0.14} height={s * 0.16} rx={s * 0.02}
        fill={Math.sin(t * 1.5 + i) > -0.3 ? "#ffe58a" : "#cfe6ff"} stroke={INK} strokeWidth={line(s) * 0.8} />)}
      <Box x={-s * 0.09} y={-s * 0.3} w={s * 0.18} h={s * 0.3} fill={PALETTE.brown} s={s} r={0.2} sheen={false} />
    </g>
  ),
  // a private jet, gently cruising
  jet: ({ s, t }) => (
    <g transform={`translate(0,${-s * 0.35 + bob(t, s, 2, 0.03)})`}>
      <Shape d={`M${-s * 0.75},0 Q${-s * 0.75},${-s * 0.12} ${-s * 0.5},${-s * 0.12} L${s * 0.55},${-s * 0.12} Q${s * 0.8},${-s * 0.1} ${s * 0.82},0 Q${s * 0.8},${s * 0.1} ${s * 0.55},${s * 0.1} L${-s * 0.5},${s * 0.1} Q${-s * 0.75},${s * 0.1} ${-s * 0.75},0 Z`} fill="#f7f9fc" s={s} />
      <Shape d={`M${-s * 0.1},${s * 0.05} L${s * 0.15},${s * 0.4} L${s * 0.28},${s * 0.4} L${s * 0.15},${s * 0.05} Z`} fill={shade("#f7f9fc", -0.1)} s={s} />
      <Shape d={`M${-s * 0.6},${-s * 0.1} L${-s * 0.72},${-s * 0.42} L${-s * 0.58},${-s * 0.42} L${-s * 0.4},${-s * 0.11} Z`} fill={PALETTE.navy} s={s} />
      {[0.1, 0.22, 0.34, 0.46].map((x) => <circle key={x} cx={s * x} cy={-s * 0.02} r={s * 0.03} fill="#9fd1ff" stroke={INK} strokeWidth={line(s) * 0.5} />)}
    </g>
  ),
  // a tycoon: a little figure in a top hat (one of the richest), drawn small enough to fill a grid
  tycoon: ({ s }) => (
    <g>
      <Shape d={`M${-s * 0.28},0 L${-s * 0.22},${-s * 0.5} Q0,${-s * 0.6} ${s * 0.22},${-s * 0.5} L${s * 0.28},0 Z`} fill={PALETTE.navy} s={s} />
      <Ball cx={0} cy={-s * 0.66} rx={s * 0.17} fill={PALETTE.skin} s={s} />
      {/* a face: eyes, a smug smile, a moustache */}
      {[-1, 1].map((k) => <circle key={k} cx={k * s * 0.06} cy={-s * 0.69} r={s * 0.018} fill={INK} />)}
      <path d={`M${-s * 0.07},${-s * 0.6} Q0,${-s * 0.55} ${s * 0.07},${-s * 0.6}`} fill="none" stroke={INK} strokeWidth={line(s) * 0.8} strokeLinecap="round" />
      <path d={`M${-s * 0.08},${-s * 0.63} Q${-s * 0.04},${-s * 0.66} 0,${-s * 0.63} Q${s * 0.04},${-s * 0.66} ${s * 0.08},${-s * 0.63}`} fill={INK} />
      {/* a white shirt, a red tie and a gold chain on the coat */}
      <path d={`M${-s * 0.08},${-s * 0.5} L0,${-s * 0.36} L${s * 0.08},${-s * 0.5} Z`} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.6} />
      <path d={`M0,${-s * 0.48} L${-s * 0.03},${-s * 0.4} L0,${-s * 0.3} L${s * 0.03},${-s * 0.4} Z`} fill={PALETTE.red} />
      <path d={`M${-s * 0.15},${-s * 0.3} Q${-s * 0.05},${-s * 0.22} ${s * 0.04},${-s * 0.3}`} fill="none" stroke={PALETTE.gold} strokeWidth={line(s) * 0.9} />
      <rect x={-s * 0.2} y={-s * 0.84} width={s * 0.4} height={s * 0.05} fill={INK} />
      <rect x={-s * 0.13} y={-s * 1.04} width={s * 0.26} height={s * 0.22} rx={s * 0.02} fill={INK} />
      <rect x={-s * 0.13} y={-s * 0.88} width={s * 0.26} height={s * 0.04} fill={PALETTE.red} />
    </g>
  ),
  // a paycheck: an envelope with a window and a green stripe
  paycheck: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)}) rotate(3)`}>
      <Shadow w={s * 1.0} s={s} />
      <Box x={-s * 0.5} y={-s * 0.62} w={s} h={s * 0.6} fill="#f6f1e2" s={s} r={0.05} sheen={false} />
      <Shape d={`M${-s * 0.5},${-s * 0.62} L0,${-s * 0.3} L${s * 0.5},${-s * 0.62}`} fill="none" s={s} />
      <rect x={-s * 0.36} y={-s * 0.2} width={s * 0.4} height={s * 0.1} rx={s * 0.02} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.7} />
      <rect x={s * 0.12} y={-s * 0.2} width={s * 0.26} height={s * 0.1} rx={s * 0.02} fill={PALETTE.green} stroke={INK} strokeWidth={line(s) * 0.7} />
    </g>
  ),
  // a company: a tall glass building with a rising chart on its roof
  company: ({ s, t }) => {
    const k = 0.5 + 0.5 * Math.sin(t * 1.4);
    return (
      <g>
        <Shadow w={s * 0.9} s={s} />
        <Box x={-s * 0.32} y={-s * 0.82} w={s * 0.64} h={s * 0.82} fill="#7fb3f2" s={s} r={0.04} />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-s * 0.24 + (i % 3) * s * 0.17} y={-s * 0.74 + Math.floor(i / 3) * s * 0.17} width={s * 0.12} height={s * 0.1}
          fill={(i + Math.floor(t * 2)) % 5 === 0 ? "#ffe58a" : "#d6e9ff"} stroke={INK} strokeWidth={line(s) * 0.5} />)}
        <path d={`M${-s * 0.25},${-s * 0.9} L${-s * 0.05},${-s * 1.0} L${s * 0.08},${-s * 0.95} L${s * 0.28},${-s * (1.12 + 0.05 * k)}`} fill="none" stroke={PALETTE.green} strokeWidth={line(s) * 2.4} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  },
};

export default props;
