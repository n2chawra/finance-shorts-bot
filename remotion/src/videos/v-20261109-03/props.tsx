/**
 * The things "Airlines don't make their money on your seat" is about, drawn for this video only: a
 * red-tailed jetliner, a canvas fare bag of ticket money, a fuel truck, a boarding pass, a round
 * BEFORE TAX stamp, a closed wallet with a question mark, a gold rewards credit card, a miles badge
 * with a wing, an airplane seat and a leather wallet with a card peeking out.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a white jetliner seen side-on with a red tail, windows and a turning engine fan
  jetliner: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.4, 0.02)})`}>
      <Shadow w={s * 1.5} s={s} />
      <Shape d={`M${-s * 0.8},${-s * 0.42} Q${-s * 0.86},${-s * 0.52} ${-s * 0.72},${-s * 0.56} L${s * 0.6},${-s * 0.56} Q${s * 0.86},${-s * 0.52} ${s * 0.88},${-s * 0.44}
        Q${s * 0.86},${-s * 0.34} ${s * 0.6},${-s * 0.32} L${-s * 0.72},${-s * 0.32} Z`} fill="#f5f7fb" s={s} />
      <Shape d={`M${-s * 0.62},${-s * 0.56} L${-s * 0.78},${-s * 0.9} L${-s * 0.62},${-s * 0.9} L${-s * 0.42},${-s * 0.56} Z`} fill={PALETTE.red} s={s} />
      <Shape d={`M${-s * 0.1},${-s * 0.4} L${s * 0.2},${-s * 0.14} L${s * 0.34},${-s * 0.14} L${s * 0.2},${-s * 0.4} Z`} fill={shade("#f5f7fb", -0.1)} s={s} />
      {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={-s * 0.5 + i * s * 0.11} cy={-s * 0.47} r={s * 0.025} fill={PALETTE.navy} />)}
      <rect x={-s * 0.82} y={-s * 0.4} width={s * 1.68} height={s * 0.03} fill={PALETTE.navy} opacity={0.8} />
      <g transform={`translate(${s * 0.12},${-s * 0.22})`}>
        <Ball cx={0} cy={0} rx={s * 0.13} ry={s * 0.08} fill={PALETTE.grey} s={s} />
        <line x1={s * 0.1} y1={-s * 0.06 * Math.cos(t * 12)} x2={s * 0.1} y2={s * 0.06 * Math.cos(t * 12)} stroke={INK} strokeWidth={line(s) * 0.5} />
      </g>
      <Shape d={`M${s * 0.66},${-s * 0.53} Q${s * 0.8},${-s * 0.52} ${s * 0.84},${-s * 0.46} L${s * 0.68},${-s * 0.46} Z`} fill={PALETTE.navy} s={s} />
    </g>
  ),
  // a canvas money bag stuffed with tickets and notes
  farebag: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.6)})`}>
      <Shadow w={s * 0.9} s={s} />
      {[-0.12, 0.04, 0.16].map((x, i) => <rect key={i} x={x * s - s * 0.08} y={-s * 0.98 + i * s * 0.03} width={s * 0.16} height={s * 0.3} rx={s * 0.02} fill={i === 1 ? "#ffe9a8" : "#8fd19e"} stroke={INK} strokeWidth={line(s) * 0.35}
        transform={`rotate(${(i - 1) * 14} ${x * s} ${-s * 0.8})`} />)}
      <Ball cx={0} cy={-s * 0.36} rx={s * 0.42} ry={s * 0.36} fill="#d8c6a0" s={s} />
      <rect x={-s * 0.22} y={-s * 0.76} width={s * 0.44} height={s * 0.07} rx={s * 0.03} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.35} />
      <Paint x={0} y={-s * 0.26} text="FARES" size={s * 0.12} fill={PALETTE.navy} />
    </g>
  ),
  // a fuel tanker truck with a hose
  fueltruck: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.5} s={s} />
      <Box x={-s * 0.7} y={-s * 0.62} w={s * 1.0} h={s * 0.44} fill={PALETTE.yellow} s={s} r={0.25} />
      <Paint x={-s * 0.2} y={-s * 0.36} text="FUEL" size={s * 0.13} fill={INK} />
      <Box x={s * 0.34} y={-s * 0.56} w={s * 0.36} h={s * 0.38} fill={PALETTE.red} s={s} r={0.08} />
      <rect x={s * 0.44} y={-s * 0.5} width={s * 0.2} height={s * 0.13} fill="#bfe6ff" stroke={INK} strokeWidth={line(s) * 0.4} />
      {[-0.5, -0.1, 0.5].map((x) => <circle key={x} cx={x * s} cy={-s * 0.14} r={s * 0.11} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s) * 0.5} />)}
      <path d={`M${-s * 0.7},${-s * 0.4} q${-s * 0.14},${s * 0.1} ${-s * 0.1},${s * 0.3}`} stroke={INK} strokeWidth={line(s) * 0.7} fill="none" />
      <circle cx={-s * 0.8} cy={-s * 0.08 + Math.sin(t * 4) * s * 0.01} r={s * 0.03} fill={PALETTE.orange} />
    </g>
  ),
  // a boarding pass with a barcode and a plane mark
  boardingpass: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2)}) rotate(-6)`}>
      <Shadow w={s * 1.0} s={s} />
      <Box x={-s * 0.6} y={-s * 0.52} w={s * 1.2} h={s * 0.46} fill="#fff" s={s} r={0.05} />
      <rect x={-s * 0.6} y={-s * 0.52} width={s * 1.2} height={s * 0.12} fill={PALETTE.blue} />
      <Paint x={-s * 0.2} y={-s * 0.42} text="BOARDING" size={s * 0.08} fill="#fff" />
      <line x1={s * 0.24} y1={-s * 0.52} x2={s * 0.24} y2={-s * 0.06} stroke={PALETTE.grey} strokeWidth={line(s) * 0.4} strokeDasharray={`${s * 0.03} ${s * 0.03}`} />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={s * 0.3 + i * s * 0.025} y={-s * 0.32} width={s * (i % 3 ? 0.01 : 0.018)} height={s * 0.18} fill={INK} />)}
      <path d={`M${-s * 0.46},${-s * 0.22} l${s * 0.24},${-s * 0.06} l${-s * 0.04},${s * 0.04} l${s * 0.14},0`} stroke={PALETTE.navy} strokeWidth={line(s) * 0.6} fill="none" />
    </g>
  ),
  // a round red rubber stamp mark reading TAX
  taxstamp: ({ s, t }) => (
    <g transform={`translate(0,${-s * 0.5}) rotate(${-12 + Math.sin(t * 2) * 2})`}>
      <circle r={s * 0.44} fill="none" stroke={PALETTE.red} strokeWidth={line(s) * 1.4} />
      <circle r={s * 0.34} fill="none" stroke={PALETTE.red} strokeWidth={line(s) * 0.6} />
      <Paint x={0} y={s * 0.06} text="TAX" size={s * 0.2} fill={PALETTE.red} />
    </g>
  ),
  // a closed brown wallet with a glowing question mark
  mysterywallet: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.5)})`}>
      <Shadow w={s * 1.0} s={s} />
      <Box x={-s * 0.5} y={-s * 0.7} w={s * 1.0} h={s * 0.64} fill={PALETTE.brown} s={s} r={0.08} />
      <Box x={s * 0.1} y={-s * 0.52} w={s * 0.46} h={s * 0.26} fill={shade(PALETTE.brown, -0.15)} s={s} r={0.15} />
      <circle cx={s * 0.42} cy={-s * 0.39} r={s * 0.04} fill={PALETTE.gold} />
      <Paint x={-s * 0.2} y={-s * 0.3} text="?" size={s * 0.4} fill={PALETTE.yellow} />
    </g>
  ),
  // a gold rewards credit card with a chip and a contactless mark
  rewardcard: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2.2)}) rotate(-8)`}>
      <Shadow w={s * 1.0} s={s} />
      <Box x={-s * 0.58} y={-s * 0.7} w={s * 1.16} h={s * 0.68} fill={PALETTE.gold} s={s} r={0.07} />
      <rect x={-s * 0.58} y={-s * 0.7} width={s * 1.16} height={s * 0.68} rx={s * 0.05} fill="#fff" opacity={0.15 + 0.1 * Math.sin(t * 3)} />
      <rect x={-s * 0.44} y={-s * 0.48} width={s * 0.2} height={s * 0.15} rx={s * 0.02} fill={shade(PALETTE.gold, -0.2)} stroke={INK} strokeWidth={line(s) * 0.4} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${-s * 0.12 + i * s * 0.05},${-s * 0.52} q${s * 0.04},${s * 0.06} 0,${s * 0.12}`} stroke={INK} strokeWidth={line(s) * 0.4} fill="none" />)}
      {[0, 1, 2, 3].map((i) => <rect key={i} x={-s * 0.44 + i * s * 0.22} y={-s * 0.22} width={s * 0.16} height={s * 0.05} rx={s * 0.01} fill={shade(PALETTE.gold, -0.3)} />)}
    </g>
  ),
  // a round miles badge with a wing
  milesbadge: ({ s, t }) => (
    <g transform={`translate(0,${-s * 0.5 + bob(t, s, 2.4, 0.03)})`}>
      <circle r={s * 0.42} fill={PALETTE.navy} stroke={INK} strokeWidth={line(s) * 0.6} />
      <circle r={s * 0.34} fill="none" stroke={PALETTE.gold} strokeWidth={line(s) * 0.5} />
      <path d={`M${-s * 0.24},${s * 0.02} q${s * 0.12},${-s * 0.2} ${s * 0.3},${-s * 0.18} q${-s * 0.06},${s * 0.06} ${-s * 0.02},${s * 0.08} q${s * 0.1},0 ${s * 0.2},${-s * 0.04}
        q${-s * 0.1},${s * 0.18} ${-s * 0.48},${s * 0.14} Z`} fill="#fff" />
      <Paint x={0} y={s * 0.22} text="MILES" size={s * 0.11} fill={PALETTE.gold} />
    </g>
  ),
  // an airplane seat with a headrest cover
  planeseat: ({ s }) => (
    <g>
      <Shadow w={s * 0.8} s={s} />
      <Box x={-s * 0.3} y={-s * 1.0} w={s * 0.46} h={s * 0.7} fill={PALETTE.blue} s={s} r={0.15} />
      <rect x={-s * 0.26} y={-s * 0.98} width={s * 0.38} height={s * 0.14} rx={s * 0.03} fill="#fff" />
      <Box x={-s * 0.34} y={-s * 0.38} w={s * 0.64} h={s * 0.16} fill={shade(PALETTE.blue, -0.1)} s={s} r={0.3} />
      <rect x={s * 0.2} y={-s * 0.5} width={s * 0.16} height={s * 0.05} rx={s * 0.02} fill={PALETTE.dark} />
      <rect x={-s * 0.06} y={-s * 0.22} width={s * 0.06} height={s * 0.22} fill={PALETTE.dark} />
    </g>
  ),
  // a leather wallet, open, a gold card peeking out
  wallet: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.6)})`}>
      <Shadow w={s * 1.0} s={s} />
      <Box x={-s * 0.32} y={-s * 0.86} w={s * 0.56} h={s * 0.34} fill={PALETTE.gold} s={s} r={0.08} />
      <Box x={-s * 0.5} y={-s * 0.62} w={s * 1.0} h={s * 0.56} fill={shade(PALETTE.brown, -0.05)} s={s} r={0.08} />
      <path d={`M${-s * 0.44},${-s * 0.56} h${s * 0.88}`} stroke={shade(PALETTE.brown, 0.2)} strokeWidth={line(s) * 0.5} strokeDasharray={`${s * 0.04} ${s * 0.03}`} />
    </g>
  ),
};

export default props;
