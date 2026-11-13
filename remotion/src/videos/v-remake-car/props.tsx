/**
 * The things "How car dealers win back your discount" is about, drawn for this video only:
 * a shiny hatchback, a discount tag on a string, a rate dial whose needle climbs, the loan paper
 * (stamped when approved), a grinning car salesman, the lender's little bank building, a monthly
 * bill stub, the dealer's commission envelope and a boomerang (the discount coming back).
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a shiny red hatchback with spinning wheels and a glint sliding over the windows
  hatchback: ({ s, t }) => {
    const g = ((t * 0.5) % 1) * s * 1.4 - s * 0.7;
    return (
      <g>
        <Shadow w={s * 1.6} s={s} />
        <Shape d={`M${-s * 0.75},${-s * 0.12} L${-s * 0.75},${-s * 0.32} Q${-s * 0.72},${-s * 0.4} ${-s * 0.6},${-s * 0.42} L${-s * 0.35},${-s * 0.44} L${-s * 0.18},${-s * 0.66} L${s * 0.38},${-s * 0.66} L${s * 0.62},${-s * 0.42} Q${s * 0.76},${-s * 0.4} ${s * 0.76},${-s * 0.28} L${s * 0.76},${-s * 0.12} Z`} fill={PALETTE.red} s={s} />
        <Shape d={`M${-s * 0.13},${-s * 0.61} L${s * 0.1},${-s * 0.61} L${s * 0.1},${-s * 0.45} L${-s * 0.28},${-s * 0.45} Z`} fill="#bfe3ff" s={s} />
        <Shape d={`M${s * 0.16},${-s * 0.61} L${s * 0.35},${-s * 0.61} L${s * 0.52},${-s * 0.45} L${s * 0.16},${-s * 0.45} Z`} fill="#bfe3ff" s={s} />
        <clipPath id="hb-glass"><rect x={-s * 0.3} y={-s * 0.62} width={s * 0.85} height={s * 0.18} /></clipPath>
        <rect x={g} y={-s * 0.62} width={s * 0.08} height={s * 0.18} fill="#ffffff" opacity={0.6} clipPath="url(#hb-glass)" transform={`skewX(-20)`} />
        <rect x={s * 0.62} y={-s * 0.34} width={s * 0.1} height={s * 0.06} rx={s * 0.02} fill={PALETTE.yellow} stroke={INK} strokeWidth={line(s) * 0.4} />
        {[-0.45, 0.45].map((x) => (
          <g key={x} transform={`translate(${s * x},${-s * 0.12}) rotate(${t * 200})`}>
            <circle r={s * 0.14} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s)} />
            <circle r={s * 0.06} fill={PALETTE.grey} />
            <line x1={-s * 0.06} x2={s * 0.06} y1={0} y2={0} stroke={INK} strokeWidth={line(s) * 0.5} />
          </g>
        ))}
      </g>
    );
  },
  // a yellow discount tag on a string with a big percent sign, swinging
  discounttag: ({ s, t }) => (
    <g transform={`translate(0,${-s * 0.9}) rotate(${Math.sin(t * 2.2) * 10})`}>
      <line x1={0} y1={0} x2={0} y2={s * 0.2} stroke={INK} strokeWidth={line(s) * 0.6} />
      <Shape d={`M0,${s * 0.2} L${s * 0.3},${s * 0.35} L${s * 0.3},${s * 0.85} L${-s * 0.3},${s * 0.85} L${-s * 0.3},${s * 0.35} Z`} fill={PALETTE.yellow} s={s} />
      <circle cx={0} cy={s * 0.33} r={s * 0.04} fill={PALETTE.cream} stroke={INK} strokeWidth={line(s) * 0.4} />
      <Paint x={0} y={s * 0.68} text="%" size={s * 0.32} fill={PALETTE.red} />
    </g>
  ),
  // a round rate gauge: green to red arc, a needle whose angle is k (0..1)
  ratedial: ({ s, t, k = 0.35 }) => {
    const a = Math.PI * (1 - k) + Math.sin(t * 6) * 0.02;
    return (
      <g>
        <Shadow w={s * 1.0} s={s} />
        <rect x={-s * 0.04} y={-s * 0.3} width={s * 0.08} height={s * 0.3} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.4} />
        <Ball cx={0} cy={-s * 0.62} rx={s * 0.45} fill={PALETTE.cream} s={s} />
        <path d={`M${-s * 0.36},${-s * 0.62} A${s * 0.36},${s * 0.36} 0 0 1 0,${-s * 0.98}`} fill="none" stroke={PALETTE.green} strokeWidth={s * 0.07} />
        <path d={`M0,${-s * 0.98} A${s * 0.36},${s * 0.36} 0 0 1 ${s * 0.36},${-s * 0.62}`} fill="none" stroke={PALETTE.red} strokeWidth={s * 0.07} />
        <line x1={0} y1={-s * 0.62} x2={Math.cos(a) * s * 0.32} y2={-s * 0.62 - Math.sin(a) * s * 0.32} stroke={INK} strokeWidth={s * 0.035} strokeLinecap="round" />
        <circle cx={0} cy={-s * 0.62} r={s * 0.05} fill={INK} />
      </g>
    );
  },
  // the loan paper: lines of print and a signature line; state "approved" adds a green tick stamp
  loanpaper: ({ s, t, state }) => (
    <g transform={`rotate(${Math.sin(t * 1.3) * 3})`}>
      <Shadow w={s * 0.8} s={s} />
      <Box x={-s * 0.32} y={-s * 0.95} w={s * 0.64} h={s * 0.9} fill={PALETTE.white} s={s} r={0.03} />
      <Paint x={0} y={-s * 0.8} text="LOAN" size={s * 0.12} fill={PALETTE.navy} />
      {[0.66, 0.56, 0.46, 0.36].map((y) => <line key={y} x1={-s * 0.22} x2={s * 0.22} y1={-s * y} y2={-s * y} stroke={PALETTE.grey} strokeWidth={s * 0.016} />)}
      <line x1={-s * 0.22} x2={s * 0.05} y1={-s * 0.18} y2={-s * 0.18} stroke={INK} strokeWidth={s * 0.012} />
      <path d={`M${-s * 0.2},${-s * 0.2} q${s * 0.05},${-s * 0.08} ${s * 0.1},0 t${s * 0.1},0`} fill="none" stroke={PALETTE.blue} strokeWidth={s * 0.014} />
      {state === "approved" && (
        <g transform={`translate(${s * 0.17},${-s * 0.22}) rotate(-12)`}>
          <circle r={s * 0.1} fill="none" stroke={PALETTE.green} strokeWidth={s * 0.025} />
          <path d={`M${-s * 0.05},0 l${s * 0.035},${s * 0.04} l${s * 0.06},${-s * 0.07}`} fill="none" stroke={PALETTE.green} strokeWidth={s * 0.03} />
        </g>
      )}
    </g>
  ),
  // a car salesman in a loud checked jacket, grinning and twirling a pen
  dealer: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2.2, 0.015)})`}>
      <Shadow w={s * 0.6} s={s} />
      <rect x={-s * 0.14} y={-s * 0.08} width={s * 0.1} height={s * 0.08} fill={INK} />
      <rect x={s * 0.04} y={-s * 0.08} width={s * 0.1} height={s * 0.08} fill={INK} />
      <Box x={-s * 0.22} y={-s * 0.7} w={s * 0.44} h={s * 0.62} fill={PALETTE.orange} s={s} r={0.22} />
      {[-0.12, 0, 0.12].map((x) => <line key={x} x1={s * x} x2={s * x} y1={-s * 0.66} y2={-s * 0.12} stroke={shade(PALETTE.orange, -0.3)} strokeWidth={s * 0.012} />)}
      <Shape d={`M${-s * 0.05},${-s * 0.68} L${s * 0.05},${-s * 0.68} L0,${-s * 0.4} Z`} fill={PALETTE.blue} s={s} />
      <Ball cx={0} cy={-s * 0.84} rx={s * 0.16} fill={PALETTE.skin} s={s} />
      <path d={`M${-s * 0.15},${-s * 0.92} Q0,${-s * 1.06} ${s * 0.15},${-s * 0.92}`} fill={INK} />
      <circle cx={-s * 0.05} cy={-s * 0.86} r={s * 0.016} fill={INK} />
      <circle cx={s * 0.05} cy={-s * 0.86} r={s * 0.016} fill={INK} />
      <path d={`M${-s * 0.08},${-s * 0.79} q${s * 0.08},${s * 0.07} ${s * 0.16},0`} fill={PALETTE.white} stroke={INK} strokeWidth={line(s) * 0.5} />
      <g transform={`translate(${s * 0.28},${-s * 0.55}) rotate(${t * 180})`}>
        <rect x={-s * 0.1} y={-s * 0.012} width={s * 0.2} height={s * 0.024} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.3} />
      </g>
    </g>
  ),
  // the lender: a small bank building with columns and a coin on its roof
  lender: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.2} s={s} />
      <Box x={-s * 0.55} y={-s * 0.1} w={s * 1.1} h={s * 0.1} fill={PALETTE.grey} s={s} r={0.05} />
      {[-0.4, -0.15, 0.1, 0.35].map((x) => <Box key={x} x={s * x} y={-s * 0.58} w={s * 0.08} h={s * 0.48} fill={PALETTE.cream} s={s} r={0.1} />)}
      <Shape d={`M${-s * 0.6},${-s * 0.58} L0,${-s * 0.9} L${s * 0.6},${-s * 0.58} Z`} fill={PALETTE.teal} s={s} />
      <g transform={`translate(0,${-s * 0.98 + bob(t, s, 3, 0.03)})`}>
        <circle r={s * 0.08} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.5} />
      </g>
    </g>
  ),
  // a monthly bill stub with a perforated edge and a bold amount line
  billstub: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 1.7) * 4})`}>
      <Shadow w={s * 0.7} s={s} />
      <Box x={-s * 0.28} y={-s * 0.85} w={s * 0.56} h={s * 0.8} fill="#eaf7ff" s={s} r={0.04} />
      <line x1={-s * 0.28} x2={s * 0.28} y1={-s * 0.68} y2={-s * 0.68} stroke={INK} strokeWidth={s * 0.012} strokeDasharray={`${s * 0.03} ${s * 0.025}`} />
      <Paint x={0} y={-s * 0.73} text="DUE" size={s * 0.1} fill={PALETTE.red} />
      {[0.55, 0.45, 0.35].map((y) => <line key={y} x1={-s * 0.18} x2={s * 0.18} y1={-s * y} y2={-s * y} stroke={PALETTE.grey} strokeWidth={s * 0.016} />)}
      <rect x={-s * 0.18} y={-s * 0.24} width={s * 0.36} height={s * 0.08} fill={PALETTE.navy} />
    </g>
  ),
  // the dealer's commission: a fat brown envelope with notes peeking out, wobbling
  commission: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 2.5) * 5})`}>
      <Shadow w={s * 0.9} s={s} />
      {[-0.1, 0.05].map((x, i) => (
        <g key={x} transform={`translate(${s * x},${-s * (0.55 + 0.03 * Math.sin(t * 3 + i))}) rotate(${-10 + i * 18})`}>
          <Box x={-s * 0.22} y={-s * 0.1} w={s * 0.44} h={s * 0.2} fill={PALETTE.green} s={s} r={0.1} />
        </g>
      ))}
      <Box x={-s * 0.4} y={-s * 0.55} w={s * 0.8} h={s * 0.5} fill={PALETTE.tan} s={s} r={0.04} />
      <path d={`M${-s * 0.4},${-s * 0.55} L0,${-s * 0.28} L${s * 0.4},${-s * 0.55}`} fill="none" stroke={INK} strokeWidth={line(s) * 0.6} />
      <Paint x={0} y={-s * 0.12} text="FEE" size={s * 0.12} fill={PALETTE.brown} />
    </g>
  ),
  // a wooden boomerang spinning in place
  boomerang: ({ s, t }) => (
    <g transform={`translate(0,${-s * 0.5}) rotate(${t * 360})`}>
      <Shape d={`M${-s * 0.45},${s * 0.1} Q0,${-s * 0.55} ${s * 0.45},${s * 0.1} L${s * 0.32},${s * 0.18} Q0,${-s * 0.3} ${-s * 0.32},${s * 0.18} Z`} fill={PALETTE.brown} s={s} />
      <circle cx={0} cy={-s * 0.2} r={s * 0.04} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.4} />
    </g>
  ),
};

export default props;
