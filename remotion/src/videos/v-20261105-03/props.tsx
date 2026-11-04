/**
 * The things "Your $50,000 car budget: what the rich do with it" is about, drawn for this video only:
 * a shiny red luxury car (it dulls and gets a dent when "old"), a modest blue hatchback, a loan paper
 * that grows taller with k, a lender's office with a sign, a money plant in a pot (k = how grown),
 * a wallet, a car key on a ring and a glass coin jar that fills with k.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const wheel = (x: number, s: number, t: number, key: string) => (
  <g key={key}>
    <circle cx={x} cy={-s * 0.1} r={s * 0.1} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s) * 0.6} />
    <circle cx={x} cy={-s * 0.1} r={s * 0.04} fill={PALETTE.grey} />
    <line x1={x} y1={-s * 0.1} x2={x + Math.cos(t * 3) * s * 0.04} y2={-s * 0.1 + Math.sin(t * 3) * s * 0.04} stroke={INK} strokeWidth={line(s) * 0.4} />
  </g>
);

const props: PropSet = {
  // a low red sports car with a spoiler and a gleam; "old" dulls the paint and dents the door
  luxcar: ({ s, t, state }) => {
    const old = state === "old";
    const body = old ? "#9a5b5b" : PALETTE.red;
    return (
      <g>
        <Shadow w={s * 1.2} s={s} />
        <Shape d={`M${-s * 0.62},${-s * 0.12} L${-s * 0.6},${-s * 0.26} Q${-s * 0.5},${-s * 0.3} ${-s * 0.3},${-s * 0.32} L${-s * 0.14},${-s * 0.46} Q${s * 0.05},${-s * 0.52} ${s * 0.24},${-s * 0.44} L${s * 0.42},${-s * 0.3} Q${s * 0.6},${-s * 0.28} ${s * 0.62},${-s * 0.18} L${s * 0.62},${-s * 0.12} Z`} fill={body} s={s} />
        <path d={`M${-s * 0.1},${-s * 0.42} L${s * 0.04},${-s * 0.46} Q${s * 0.16},${-s * 0.46} ${s * 0.28},${-s * 0.33} L${-s * 0.2},${-s * 0.33} Z`} fill="#bfe6ff" stroke={INK} strokeWidth={line(s) * 0.5} />
        <rect x={-s * 0.64} y={-s * 0.36} width={s * 0.12} height={s * 0.04} fill={shade(body, -0.3)} stroke={INK} strokeWidth={line(s) * 0.4} />
        {old && <path d={`M${-s * 0.02},${-s * 0.24} q${s * 0.05},${s * 0.05} ${s * 0.1},0`} stroke={INK} strokeWidth={line(s) * 0.6} fill="none" />}
        {!old && <path d={`M${-s * 0.4},${-s * 0.26} l${s * 0.6},0`} stroke="#fff" strokeWidth={line(s) * 0.6} opacity={0.4 + 0.4 * Math.sin(t * 3)} />}
        {wheel(-s * 0.38, s, t, "a")}
        {wheel(s * 0.38, s, t, "b")}
      </g>
    );
  },
  // a modest blue hatchback, boxy and friendly
  plaincar: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2, 0.006)})`}>
      <Shadow w={s * 1.0} s={s} />
      <Shape d={`M${-s * 0.48},${-s * 0.12} L${-s * 0.48},${-s * 0.3} Q${-s * 0.46},${-s * 0.36} ${-s * 0.36},${-s * 0.36} L${-s * 0.24},${-s * 0.56} L${s * 0.26},${-s * 0.56} Q${s * 0.36},${-s * 0.56} ${s * 0.4},${-s * 0.4} L${s * 0.48},${-s * 0.34} L${s * 0.48},${-s * 0.12} Z`} fill={PALETTE.blue} s={s} />
      <rect x={-s * 0.2} y={-s * 0.52} width={s * 0.18} height={s * 0.14} rx={s * 0.02} fill="#bfe6ff" stroke={INK} strokeWidth={line(s) * 0.4} />
      <rect x={s * 0.02} y={-s * 0.52} width={s * 0.2} height={s * 0.14} rx={s * 0.02} fill="#bfe6ff" stroke={INK} strokeWidth={line(s) * 0.4} />
      <circle cx={s * 0.42} cy={-s * 0.26} r={s * 0.03} fill={PALETTE.yellow} />
      {wheel(-s * 0.3, s, t, "a")}
      {wheel(s * 0.3, s, t, "b")}
    </g>
  ),
  // a loan agreement on a clipboard; k 0..1 grows the pages taller
  loanpaper: ({ s, t, k = 0.4 }) => {
    const hh = s * (0.5 + 0.5 * k);
    return (
      <g transform={`rotate(${Math.sin(t * 1.5) * 2})`}>
        <Shadow w={s * 0.6} s={s} />
        <Box x={-s * 0.26} y={-hh} w={s * 0.52} h={hh} fill={PALETTE.brown} s={s} r={0.04} />
        <rect x={-s * 0.22} y={-hh + s * 0.06} width={s * 0.44} height={hh - s * 0.1} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.5} />
        <rect x={-s * 0.08} y={-hh - s * 0.02} width={s * 0.16} height={s * 0.06} rx={s * 0.02} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.4} />
        <Paint x={0} y={-hh + s * 0.16} text="LOAN" size={s * 0.08} fill={PALETTE.red} />
        {Array.from({ length: Math.max(2, Math.round((hh - s * 0.3) / (s * 0.06))) }, (_, i) => (
          <rect key={i} x={-s * 0.16} y={-hh + s * (0.24 + i * 0.06)} width={s * (0.32 - (i % 2) * 0.1)} height={s * 0.02} fill={PALETTE.grey} />
        ))}
      </g>
    );
  },
  // a lender's office: columns, a red sign
  lenderbank: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.0} s={s} />
      <Shape d={`M${-s * 0.5},${-s * 0.6} L0,${-s * 0.82} L${s * 0.5},${-s * 0.6} Z`} fill={PALETTE.red} s={s} />
      {[-0.32, -0.11, 0.11, 0.32].map((x, i) => <rect key={i} x={s * x - s * 0.05} y={-s * 0.56} width={s * 0.1} height={s * 0.48} fill={PALETTE.cream} stroke={INK} strokeWidth={line(s) * 0.5} />)}
      <Box x={-s * 0.5} y={-s * 0.08} w={s * 1.0} h={s * 0.08} fill={PALETTE.cream} s={s} r={0.05} />
      <Box x={-s * 0.46} y={-s * 0.62} w={s * 0.92} h={s * 0.06} fill={PALETTE.cream} s={s} r={0.05} />
      <circle cx={0} cy={-s * 0.7} r={s * 0.04 * (1 + 0.2 * Math.sin(t * 3))} fill={PALETTE.gold} />
    </g>
  ),
  // a money plant in a pot; k 0..1 = how grown, coins on its leaves
  moneyplant: ({ s, t, k = 0.5 }) => {
    const g = 0.35 + 0.65 * k;
    return (
      <g>
        <Shadow w={s * 0.6} s={s} />
        <Shape d={`M${-s * 0.2},${-s * 0.24} L${s * 0.2},${-s * 0.24} L${s * 0.15},0 L${-s * 0.15},0 Z`} fill={PALETTE.orange} s={s} />
        <path d={`M0,${-s * 0.24} q${s * 0.03},${-s * 0.3 * g} 0,${-s * 0.62 * g}`} stroke={PALETTE.green} strokeWidth={line(s) * 1.4} fill="none" />
        {Array.from({ length: Math.round(2 + 4 * k) }, (_, i) => {
          const y = -s * 0.24 - (i + 1) * s * 0.1 * g, side = i % 2 ? 1 : -1;
          return <g key={i} transform={`rotate(${side * (30 + Math.sin(t * 2 + i) * 6)} 0 ${y})`}>
            <ellipse cx={side * s * 0.1} cy={y} rx={s * 0.1} ry={s * 0.05} fill={PALETTE.green} stroke={INK} strokeWidth={line(s) * 0.4} />
            <circle cx={side * s * 0.16} cy={y - s * 0.02} r={s * 0.035} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.3} />
          </g>;
        })}
      </g>
    );
  },
  // a brown leather wallet with a note sticking out
  wallet: ({ s, t }) => (
    <g transform={`rotate(${-6 + Math.sin(t * 2) * 2})`}>
      <Shadow w={s * 0.8} s={s} />
      <rect x={-s * 0.22} y={-s * 0.5} width={s * 0.4} height={s * 0.18} rx={s * 0.02} fill="#8fd19e" stroke={INK} strokeWidth={line(s) * 0.5} transform="rotate(-8)" />
      <Box x={-s * 0.38} y={-s * 0.42} w={s * 0.76} h={s * 0.42} fill={PALETTE.brown} s={s} r={0.08} />
      <rect x={s * 0.06} y={-s * 0.3} width={s * 0.32} height={s * 0.16} rx={s * 0.05} fill={shade(PALETTE.brown, -0.15)} stroke={INK} strokeWidth={line(s) * 0.4} />
      <circle cx={s * 0.26} cy={-s * 0.22} r={s * 0.03} fill={PALETTE.gold} />
    </g>
  ),
  // a car key with a fob on a ring, swinging
  carkey: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 2.6) * 14} 0 ${-s * 0.9})`}>
      <circle cx={0} cy={-s * 0.82} r={s * 0.08} fill="none" stroke={PALETTE.grey} strokeWidth={line(s)} />
      <Box x={-s * 0.14} y={-s * 0.74} w={s * 0.28} h={s * 0.36} fill={PALETTE.dark} s={s} r={0.2} />
      {[0, 1].map((i) => <circle key={i} cx={0} cy={-s * (0.64 - i * 0.12)} r={s * 0.04} fill={i ? PALETTE.red : PALETTE.green} />)}
      <rect x={-s * 0.03} y={-s * 0.38} width={s * 0.06} height={s * 0.3} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.4} />
      {[0, 1, 2].map((i) => <rect key={i} x={s * 0.03} y={-s * (0.3 - i * 0.07)} width={s * 0.04} height={s * 0.03} fill={PALETTE.grey} />)}
    </g>
  ),
  // a glass coin jar; k 0..1 = how full
  coinjar: ({ s, t, k = 0.5 }) => (
    <g>
      <Shadow w={s * 0.7} s={s} />
      {Array.from({ length: Math.round(1 + 6 * k) }, (_, i) => <Ball key={i} cx={((i * 41) % 3 - 1) * s * 0.07} cy={-s * (0.06 + i * 0.07)} rx={s * 0.18} ry={s * 0.05} fill={PALETTE.gold} s={s} />)}
      <path d={`M${-s * 0.26},${-s * 0.62} L${-s * 0.26},${-s * 0.04} Q${-s * 0.26},0 ${-s * 0.2},0 L${s * 0.2},0 Q${s * 0.26},0 ${s * 0.26},${-s * 0.04} L${s * 0.26},${-s * 0.62}`} fill="rgba(200,230,255,0.25)" stroke={INK} strokeWidth={line(s)} />
      <rect x={-s * 0.28} y={-s * 0.7} width={s * 0.56} height={s * 0.08} rx={s * 0.03} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.6} />
      <circle cx={-s * 0.14} cy={-s * 0.5} r={s * 0.03 * (1 + 0.4 * Math.sin(t * 4))} fill="#fff" opacity={0.7} />
    </g>
  ),
};

export default props;
