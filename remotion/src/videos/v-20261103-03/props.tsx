/**
 * The things "Zuckerberg's paycheck is $1. So who pays his bills?" is about, drawn for this video
 * only: a tiny pay slip, a coffee cup, a tower of company shares, an income-tax jar, a private jet,
 * a lender's building, a credit line, an ordinary wage slip, a villa and a pair of scales.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a pay slip with a perforated edge
  payslip: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)}) rotate(-5)`}>
      <Shadow w={s * 0.6} s={s} />
      <Box x={-s * 0.3} y={-s * 0.95} w={s * 0.6} h={s * 0.85} fill={PALETTE.white} s={s} r={0.03} sheen={false} />
      <rect x={-s * 0.3} y={-s * 0.95} width={s * 0.6} height={s * 0.12} fill={PALETTE.blue} />
      <Paint x={0} y={-s * 0.86} text="PAY" size={s * 0.08} fill="#fff" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={-s * 0.22} y={-s * (0.72 - i * 0.1)} width={s * (0.44 - (i % 2) * 0.14)} height={s * 0.03} rx={s * 0.015} fill={PALETTE.grey} opacity={0.6} />)}
      <rect x={-s * 0.22} y={-s * 0.3} width={s * 0.44} height={s * 0.1} rx={s * 0.02} fill="#e9f7ef" stroke={PALETTE.green} strokeWidth={line(s) * 0.6} />
    </g>
  ),
  // a takeaway coffee cup with steam
  coffeecup: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.5} s={s} />
      {[0, 1].map((i) => <path key={i} d={`M${-s * 0.06 + i * s * 0.12},${-s * 0.95} q${s * 0.05},${-s * 0.08} 0,${-s * 0.16}`} stroke="#fff" strokeWidth={line(s)} fill="none" opacity={0.5 + 0.4 * Math.sin(t * 3 + i)} />)}
      <Shape d={`M${-s * 0.24},${-s * 0.82} L${s * 0.24},${-s * 0.82} L${s * 0.18},0 L${-s * 0.18},0 Z`} fill={PALETTE.white} s={s} />
      <Box x={-s * 0.27} y={-s * 0.9} w={s * 0.54} h={s * 0.1} fill={PALETTE.brown} s={s} r={0.3} />
      <rect x={-s * 0.22} y={-s * 0.55} width={s * 0.42} height={s * 0.2} fill={PALETTE.green} stroke={INK} strokeWidth={line(s) * 0.6} />
    </g>
  ),
  // a tower of company shares: k (0..1) is how tall it has grown
  sharetower: ({ s, t, k = 0.6 }) => {
    const n = Math.max(3, Math.round(3 + 7 * Math.min(1, k)));
    return (
      <g>
        <Shadow w={s * 0.7} s={s} />
        {Array.from({ length: n }, (_, i) => (
          <g key={i} transform={`translate(${Math.sin(i * 1.7) * s * 0.02},${-i * s * 0.09})`}>
            <Box x={-s * 0.3} y={-s * 0.09} w={s * 0.6} h={s * 0.08} fill={i % 2 ? PALETTE.cream : shade(PALETTE.cream, -0.06)} s={s} r={0.1} sheen={false} />
            <rect x={-s * 0.24} y={-s * 0.065} width={s * 0.48} height={s * 0.03} fill="none" stroke={PALETTE.blue} strokeWidth={line(s) * 0.5} />
          </g>
        ))}
        <g transform={`translate(0,${-n * s * 0.09 - s * 0.1 + Math.sin(t * 3) * s * 0.01})`}>
          <Shape d={`M0,${-s * 0.1} L${s * 0.1},0 L${s * 0.04},0 L${s * 0.04},${s * 0.08} L${-s * 0.04},${s * 0.08} L${-s * 0.04},0 L${-s * 0.1},0 Z`} fill={PALETTE.green} s={s} />
        </g>
      </g>
    );
  },
  // a glass tax jar with a slot, almost empty
  taxjar: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.6} s={s} />
      <Box x={-s * 0.3} y={-s * 0.8} w={s * 0.6} h={s * 0.8} fill="#dff1ff" s={s} r={0.2} sheen />
      <Box x={-s * 0.24} y={-s * 0.92} w={s * 0.48} h={s * 0.14} fill={PALETTE.grey} s={s} r={0.3} />
      <rect x={-s * 0.1} y={-s * 0.88} width={s * 0.2} height={s * 0.03} rx={s * 0.015} fill={INK} />
      <Ball cx={0} cy={-s * 0.08 + Math.sin(t * 2) * s * 0.005} rx={s * 0.06} ry={s * 0.03} fill={PALETTE.gold} s={s} />
      <Paint x={0} y={-s * 0.42} text="TAX" size={s * 0.15} fill={PALETTE.red} />
    </g>
  ),
  // a private jet
  privatejet: ({ s, t }) => (
    <g transform={`translate(0,${Math.sin(t * 2) * s * 0.02}) rotate(-6)`}>
      <Shape d={`M${-s * 0.75},${-s * 0.3} Q${-s * 0.7},${-s * 0.42} ${-s * 0.4},${-s * 0.42} L${s * 0.55},${-s * 0.42} Q${s * 0.8},${-s * 0.36} ${s * 0.8},${-s * 0.3} Q${s * 0.8},${-s * 0.24} ${s * 0.55},${-s * 0.2} L${-s * 0.55},${-s * 0.2} Z`} fill={PALETTE.white} s={s} />
      <Shape d={`M${-s * 0.1},${-s * 0.24} L${-s * 0.35},${-s * 0.02} L${-s * 0.2},${-s * 0.02} L${s * 0.15},${-s * 0.24} Z`} fill={PALETTE.grey} s={s} />
      <Shape d={`M${-s * 0.55},${-s * 0.4} L${-s * 0.72},${-s * 0.62} L${-s * 0.6},${-s * 0.62} L${-s * 0.38},${-s * 0.42} Z`} fill={PALETTE.blue} s={s} />
      {[0, 1, 2, 3].map((i) => <circle key={i} cx={-s * 0.2 + i * s * 0.15} cy={-s * 0.33} r={s * 0.035} fill={PALETTE.teal} stroke={INK} strokeWidth={line(s) * 0.5} />)}
    </g>
  ),
  // the lender: a bank building with a dollar sign over the door
  lender: ({ s }) => (
    <g>
      <Shadow w={s * 1.2} s={s} />
      <Box x={-s * 0.55} y={-s * 0.1} w={s * 1.1} h={s * 0.1} fill={PALETTE.grey} s={s} r={0.1} />
      {[-0.38, -0.13, 0.13, 0.38].map((x) => <Box key={x} x={s * x - s * 0.06} y={-s * 0.62} w={s * 0.12} h={s * 0.52} fill={PALETTE.cream} s={s} r={0.2} />)}
      <Shape d={`M${-s * 0.6},${-s * 0.62} L0,${-s * 0.92} L${s * 0.6},${-s * 0.62} Z`} fill={PALETTE.gold} s={s} />
      <circle cx={0} cy={-s * 0.73} r={s * 0.07} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.6} />
    </g>
  ),
  // a credit line: a long contract unrolling
  creditline: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2.2, 0.02)}) rotate(5)`}>
      <Shadow w={s * 0.6} s={s} />
      <Box x={-s * 0.3} y={-s * 1.0} w={s * 0.6} h={s * 0.92} fill={PALETTE.cream} s={s} r={0.04} sheen={false} />
      <Ball cx={0} cy={-s * 0.08} rx={s * 0.34} ry={s * 0.06} fill={shade(PALETTE.cream, -0.12)} s={s} />
      <Paint x={0} y={-s * 0.86} text="LOAN" size={s * 0.12} fill={PALETTE.blue} />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-s * 0.22} y={-s * (0.74 - i * 0.1)} width={s * (0.44 - (i % 2) * 0.12)} height={s * 0.03} rx={s * 0.015} fill={PALETTE.grey} opacity={0.55} />)}
    </g>
  ),
  // an ordinary wage slip with a big red bite taken out (tax)
  wageslip: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)}) rotate(4)`}>
      <Shadow w={s * 0.6} s={s} />
      <Box x={-s * 0.3} y={-s * 0.95} w={s * 0.6} h={s * 0.85} fill={PALETTE.white} s={s} r={0.03} sheen={false} />
      <rect x={-s * 0.3} y={-s * 0.95} width={s * 0.6} height={s * 0.12} fill={PALETTE.teal} />
      {[0, 1, 2].map((i) => <rect key={i} x={-s * 0.22} y={-s * (0.7 - i * 0.1)} width={s * 0.36} height={s * 0.03} rx={s * 0.015} fill={PALETTE.grey} opacity={0.6} />)}
      <rect x={-s * 0.22} y={-s * 0.38} width={s * 0.44} height={s * 0.12} rx={s * 0.02} fill="#fde8e8" stroke={PALETTE.red} strokeWidth={line(s) * 0.6} />
    </g>
  ),
  // a villa with a pool
  villa: ({ s }) => (
    <g>
      <Shadow w={s * 1.2} s={s} />
      <Box x={-s * 0.55} y={-s * 0.5} w={s * 0.8} h={s * 0.5} fill={PALETTE.white} s={s} r={0.03} />
      <Box x={-s * 0.6} y={-s * 0.58} w={s * 0.9} h={s * 0.08} fill={PALETTE.dark} s={s} r={0.1} />
      {[-0.42, -0.2, 0.02].map((x) => <rect key={x} x={s * x} y={-s * 0.4} width={s * 0.14} height={s * 0.2} fill={PALETTE.teal} stroke={INK} strokeWidth={line(s) * 0.6} />)}
      <Box x={s * 0.28} y={-s * 0.1} w={s * 0.34} h={s * 0.1} fill={PALETTE.blue} s={s} r={0.3} />
    </g>
  ),
  // a pair of scales: state "tip" tips it to one side
  scales: ({ s, t, state }) => {
    const a = state === "tip" ? 14 : Math.sin(t * 1.5) * 6;
    return (
      <g>
        <Shadow w={s * 0.6} s={s} />
        <Box x={-s * 0.2} y={-s * 0.08} w={s * 0.4} h={s * 0.08} fill={PALETTE.brown} s={s} r={0.2} />
        <rect x={-s * 0.025} y={-s * 0.8} width={s * 0.05} height={s * 0.72} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.6} />
        <g transform={`translate(0,${-s * 0.8}) rotate(${a})`}>
          <rect x={-s * 0.45} y={-s * 0.02} width={s * 0.9} height={s * 0.04} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.6} />
          {[-1, 1].map((d) => <g key={d} transform={`translate(${d * s * 0.42},0) rotate(${-a})`}>
            <line x1={0} y1={0} x2={0} y2={s * 0.25} stroke={INK} strokeWidth={line(s) * 0.6} />
            <path d={`M${-s * 0.14},${s * 0.25} Q0,${s * 0.38} ${s * 0.14},${s * 0.25} Z`} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.6} />
          </g>)}
        </g>
      </g>
    );
  },
};

export default props;
