/**
 * The things the remake of "Why the rich borrow money" is about: the six debts
 * (a car, a credit card, a house, a diploma, the one question, the payment that never ends).
 */
import React from "react";
import { Ball, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  car: ({ s }) => (
    <g>
      <Shadow w={s * 1.2} s={s} />
      <Shape d={`M${-s * 0.62},${-s * 0.18} L${-s * 0.62},${-s * 0.4} L${-s * 0.36},${-s * 0.42} L${-s * 0.2},${-s * 0.66} L${s * 0.3},${-s * 0.66} L${s * 0.46},${-s * 0.42} L${s * 0.62},${-s * 0.38} L${s * 0.62},${-s * 0.18} Z`} fill={PALETTE.red} s={s} />
      <Shape d={`M${-s * 0.15},${-s * 0.6} L${s * 0.04},${-s * 0.6} L${s * 0.04},${-s * 0.44} L${-s * 0.27},${-s * 0.44} Z`} fill="#bfe6ff" s={s} />
      <Shape d={`M${s * 0.1},${-s * 0.6} L${s * 0.27},${-s * 0.6} L${s * 0.38},${-s * 0.44} L${s * 0.1},${-s * 0.44} Z`} fill="#bfe6ff" s={s} />
      <Ball cx={-s * 0.36} cy={-s * 0.16} rx={s * 0.14} fill={PALETTE.dark} s={s} />
      <Ball cx={s * 0.36} cy={-s * 0.16} rx={s * 0.14} fill={PALETTE.dark} s={s} />
    </g>
  ),
  card: ({ s }) => (
    <g transform="rotate(-10)">
      <Shadow w={s * 0.9} s={s} />
      <Box x={-s * 0.5} y={-s * 0.72} w={s} h={s * 0.62} fill={PALETTE.blue} s={s} r={0.1} />
      <rect x={-s * 0.5} y={-s * 0.6} width={s} height={s * 0.1} fill={PALETTE.navy} />
      <rect x={-s * 0.38} y={-s * 0.44} width={s * 0.2} height={s * 0.14} rx={s * 0.03} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.6} />
      <rect x={-s * 0.38} y={-s * 0.22} width={s * 0.6} height={s * 0.05} rx={s * 0.025} fill="#fff" opacity={0.7} />
    </g>
  ),
  house: ({ s }) => (
    <g>
      <Shadow w={s * 1.1} s={s} />
      <Box x={-s * 0.44} y={-s * 0.56} w={s * 0.88} h={s * 0.56} fill={PALETTE.cream} s={s} r={0.03} />
      <Shape d={`M${-s * 0.56},${-s * 0.54} L0,${-s * 1.0} L${s * 0.56},${-s * 0.54} Z`} fill={PALETTE.red} s={s} />
      <rect x={-s * 0.1} y={-s * 0.28} width={s * 0.2} height={s * 0.28} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s)} />
      <rect x={s * 0.18} y={-s * 0.44} width={s * 0.16} height={s * 0.14} fill={PALETTE.teal} stroke={INK} strokeWidth={line(s) * 0.7} />
    </g>
  ),
  diploma: ({ s }) => (
    <g>
      <Shadow w={s * 0.9} s={s} />
      <Shape d={`M${-s * 0.5},${-s * 0.55} L0,${-s * 0.78} L${s * 0.5},${-s * 0.55} L0,${-s * 0.32} Z`} fill={PALETTE.dark} s={s} />
      <Shape d={`M${-s * 0.28},${-s * 0.46} L${-s * 0.28},${-s * 0.22} Q0,${-s * 0.08} ${s * 0.28},${-s * 0.22} L${s * 0.28},${-s * 0.46}`} fill={PALETTE.dark} s={s} />
      <line x1={s * 0.38} y1={-s * 0.6} x2={s * 0.38} y2={-s * 0.3} stroke={PALETTE.gold} strokeWidth={line(s) * 1.4} />
      <Ball cx={s * 0.38} cy={-s * 0.26} rx={s * 0.05} fill={PALETTE.gold} s={s} />
    </g>
  ),
  // the one question: a balance with a question mark
  question: ({ s }) => (
    <g>
      <Shadow w={s * 0.8} s={s} />
      <rect x={-s * 0.04} y={-s * 0.8} width={s * 0.08} height={s * 0.78} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s)} />
      <line x1={-s * 0.45} y1={-s * 0.72} x2={s * 0.45} y2={-s * 0.62} stroke={INK} strokeWidth={line(s) * 1.6} strokeLinecap="round" />
      <Shape d={`M${-s * 0.6},${-s * 0.5} Q${-s * 0.45},${-s * 0.36} ${-s * 0.3},${-s * 0.5} Z`} fill={PALETTE.grey} s={s} />
      <Shape d={`M${s * 0.3},${-s * 0.4} Q${s * 0.45},${-s * 0.26} ${s * 0.6},${-s * 0.4} Z`} fill={PALETTE.grey} s={s} />
      <Ball cx={0} cy={-s * 0.92} rx={s * 0.16} fill={PALETTE.yellow} s={s} />
      <Paint x={0} y={-s * 0.86} text="?" size={s * 0.2} />
    </g>
  ),
  // the forever payment: a calendar on a chain
  forever: ({ s }) => (
    <g>
      <Shadow w={s * 0.8} s={s} />
      {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={-s * 0.45 + i * s * 0.14} cy={-s * 0.2 - i * s * 0.12} rx={s * 0.09} ry={s * 0.05} fill="none" stroke={PALETTE.grey} strokeWidth={line(s) * 1.4} transform={`rotate(-40 ${-s * 0.45 + i * s * 0.14} ${-s * 0.2 - i * s * 0.12})`} />)}
      <Box x={-s * 0.12} y={-s * 0.86} w={s * 0.6} h={s * 0.56} fill={PALETTE.white} s={s} r={0.08} />
      <rect x={-s * 0.12} y={-s * 0.86} width={s * 0.6} height={s * 0.14} fill={PALETTE.red} stroke={INK} strokeWidth={line(s)} />
      <Paint x={s * 0.18} y={-s * 0.46} text="∞" size={s * 0.3} />
    </g>
  ),
  // the bill for the car: a long receipt
  receipt: ({ s }) => (
    <g transform="rotate(4)">
      <Shadow w={s * 0.6} s={s} />
      <Shape d={`M${-s * 0.28},${-s * 1.0} L${s * 0.28},${-s * 1.0} L${s * 0.28},${-s * 0.06} l${-s * 0.07},${-s * 0.04} l${-s * 0.07},${s * 0.04} l${-s * 0.07},${-s * 0.04} l${-s * 0.07},${s * 0.04} l${-s * 0.07},${-s * 0.04} l${-s * 0.07},${s * 0.04} l${-s * 0.07},${-s * 0.04} l${-s * 0.07},${s * 0.04} Z`} fill={PALETTE.white} s={s} />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-s * 0.2} y={-s * (0.9 - i * 0.12)} width={s * (0.26 - (i % 2) * 0.08)} height={s * 0.03} rx={s * 0.015} fill={PALETTE.grey} opacity={0.6} />)}
      <rect x={-s * 0.2} y={-s * 0.24} width={s * 0.4} height={s * 0.06} rx={s * 0.02} fill={PALETTE.red} />
    </g>
  ),
  // the rich end: a tower of gold coins; the poor end: an empty pocket
  gold: ({ s }) => (
    <g>
      <Shadow w={s * 0.7} s={s} />
      {[0, 1, 2, 3, 4, 5].map((i) => <ellipse key={i} cx={0} cy={-s * 0.08 - i * s * 0.12} rx={s * 0.3} ry={s * 0.08} fill={i % 2 ? PALETTE.gold : shade(PALETTE.gold, 0.2)} stroke={INK} strokeWidth={line(s)} />)}
    </g>
  ),
  pocket: ({ s }) => (
    <g>
      <Shape d={`M${-s * 0.3},${-s * 0.8} L${s * 0.3},${-s * 0.8} L${s * 0.24},${-s * 0.2} Q0,${-s * 0.02} ${-s * 0.24},${-s * 0.2} Z`} fill={PALETTE.cream} s={s} />
      <Paint x={0} y={-s * 0.4} text="0" size={s * 0.26} fill={PALETTE.red} />
    </g>
  ),
};

export default props;
