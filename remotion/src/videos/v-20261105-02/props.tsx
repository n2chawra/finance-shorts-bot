/**
 * The things "Your Costco cart barely makes them money. This does" is about, drawn for this video only:
 * a giant shopping cart piled with bulk goods, a long till receipt, a thin sliver of coins (what the
 * store keeps), a membership card, a warehouse store with a big sign and a roller door, a pallet of
 * bulk boxes, a turnstile at the entrance, a stack of membership cards (the fees) and a bulging
 * money sack.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a big shopping cart heaped with bulk packs; k 0..1 = how full
  giantcart: ({ s, t, k = 1 }) => (
    <g>
      <Shadow w={s * 1.0} s={s} />
      {[[-0.3, 0.12], [0.3, 0.12]].map(([x], i) => <circle key={i} cx={x! * s} cy={-s * 0.07} r={s * 0.07} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s) * 0.6} />)}
      {Array.from({ length: Math.round(2 + 5 * k) }, (_, i) => (
        <Box key={i} x={-s * 0.4 + (i % 4) * s * 0.2} y={-s * (0.62 + Math.floor(i / 4) * 0.16) + Math.sin(t * 2 + i) * s * 0.004} w={s * 0.18} h={s * 0.16}
          fill={[PALETTE.orange, PALETTE.blue, PALETTE.yellow, PALETTE.pink, PALETTE.green, PALETTE.tan, PALETTE.purple][i % 7]!} s={s} r={0.06} />
      ))}
      <path d={`M${-s * 0.46},${-s * 0.5} L${s * 0.46},${-s * 0.5} L${s * 0.38},${-s * 0.16} L${-s * 0.38},${-s * 0.16} Z`} fill="rgba(200,215,235,0.55)" stroke={INK} strokeWidth={line(s)} />
      {[-0.24, 0, 0.24].map((x, i) => <line key={i} x1={x * s} x2={x * s * 0.85} y1={-s * 0.5} y2={-s * 0.16} stroke={INK} strokeWidth={line(s) * 0.5} />)}
      <path d={`M${s * 0.46},${-s * 0.5} L${s * 0.62},${-s * 0.66}`} stroke={INK} strokeWidth={line(s) * 1.3} strokeLinecap="round" />
      <line x1={-s * 0.38} x2={s * 0.38} y1={-s * 0.12} y2={-s * 0.12} stroke={INK} strokeWidth={line(s)} />
    </g>
  ),
  // a long till receipt curling at the bottom
  tillreceipt: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)}) rotate(4)`}>
      <Shadow w={s * 0.5} s={s} />
      <path d={`M${-s * 0.2},${-s * 0.95} L${s * 0.2},${-s * 0.95} L${s * 0.2},${-s * 0.12} q${-s * 0.1},${s * 0.12} ${-s * 0.2},0 q${-s * 0.1},${s * 0.12} ${-s * 0.2},0 Z`} fill="#fff" stroke={INK} strokeWidth={line(s)} />
      {Array.from({ length: 7 }, (_, i) => <rect key={i} x={-s * 0.14} y={-s * (0.84 - i * 0.09)} width={s * (0.18 + (i % 3) * 0.04)} height={s * 0.025} rx={s * 0.01} fill={PALETTE.grey} />)}
      <rect x={-s * 0.14} y={-s * 0.2} width={s * 0.28} height={s * 0.035} fill={INK} />
    </g>
  ),
  // a thin sliver of two coins: what the store keeps
  coinsliver: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.5} s={s} />
      {[0, 1].map((i) => <Ball key={i} cx={i * s * 0.06 - s * 0.03} cy={-s * (0.07 + i * 0.1)} rx={s * 0.2} ry={s * 0.065} fill={PALETTE.gold} s={s} />)}
      <circle cx={s * 0.16} cy={-s * 0.3} r={s * 0.03 * (1 + 0.5 * Math.sin(t * 5))} fill="#fff" />
    </g>
  ),
  // a membership card with a photo square and a chip
  membercard: ({ s, t, state }) => (
    <g transform={`translate(0,${bob(t, s, 1.8)}) rotate(-6)`}>
      <Shadow w={s * 0.9} s={s} />
      <Box x={-s * 0.5} y={-s * 0.62} w={s * 1.0} h={s * 0.6} fill={state === "gold" ? PALETTE.gold : "#e9eef7"} s={s} r={0.06} />
      <rect x={-s * 0.5} y={-s * 0.62} width={s * 1.0} height={s * 0.16} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.5} />
      <rect x={-s * 0.5} y={-s * 0.46} width={s * 1.0} height={s * 0.05} fill={PALETTE.blue} />
      <Paint x={0} y={-s * 0.5} text="MEMBER" size={s * 0.1} fill="#fff" />
      <rect x={-s * 0.4} y={-s * 0.36} width={s * 0.22} height={s * 0.26} rx={s * 0.02} fill={PALETTE.tan} stroke={INK} strokeWidth={line(s) * 0.4} />
      <circle cx={-s * 0.29} cy={-s * 0.28} r={s * 0.05} fill={PALETTE.brown} />
      {[0, 1].map((i) => <rect key={i} x={-s * 0.1} y={-s * (0.3 - i * 0.08)} width={s * (0.42 - i * 0.12)} height={s * 0.035} rx={s * 0.015} fill={PALETTE.grey} />)}
    </g>
  ),
  // a warehouse store: a long low building, a big red sign, a roller door; "open" lifts the door
  warehouse: ({ s, t, state }) => (
    <g>
      <Shadow w={s * 1.3} s={s} />
      <Box x={-s * 0.65} y={-s * 0.5} w={s * 1.3} h={s * 0.5} fill="#cfd6e3" s={s} r={0.01} />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-s * 0.6 + i * s * 0.15} x2={-s * 0.6 + i * s * 0.15} y1={-s * 0.5} y2={0} stroke={shade("#cfd6e3", -0.15)} strokeWidth={line(s) * 0.4} />)}
      <Box x={-s * 0.4} y={-s * 0.64} w={s * 0.8} h={s * 0.16} fill={PALETTE.red} s={s} r={0.06} />
      <rect x={-s * 0.36} y={-s * 0.58} width={s * 0.72} height={s * 0.04} fill={PALETTE.blue} />
      <Paint x={0} y={-s * 0.53 + Math.sin(t * 2) * s * 0.003} text="WAREHOUSE" size={s * 0.075} fill="#fff" />
      <rect x={-s * 0.2} y={-s * 0.34} width={s * 0.4} height={s * 0.34} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s) * 0.6} />
      <rect x={-s * 0.2} y={-s * 0.34} width={s * 0.4} height={s * (state === "open" ? 0.08 : 0.34)} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.6} />
      {state === "open" && <rect x={-s * 0.18} y={-s * 0.24} width={s * 0.36} height={s * 0.24} fill={PALETTE.yellow} opacity={0.5 + 0.2 * Math.sin(t * 4)} />}
    </g>
  ),
  // a pallet of bulk boxes, shrink-wrapped
  pallet: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.9} s={s} />
      <rect x={-s * 0.42} y={-s * 0.08} width={s * 0.84} height={s * 0.08} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.5} />
      {Array.from({ length: 6 }, (_, i) => <Box key={i} x={-s * 0.4 + (i % 3) * s * 0.27} y={-s * (0.34 + Math.floor(i / 3) * 0.26)} w={s * 0.26} h={s * 0.26} fill={PALETTE.tan} s={s} r={0.03} />)}
      <rect x={-s * 0.42} y={-s * 0.62} width={s * 0.84} height={s * 0.54} fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.6)" strokeWidth={line(s) * 0.4} />
      <circle cx={s * 0.3} cy={-s * 0.5} r={s * 0.025 * (1 + 0.5 * Math.sin(t * 4))} fill="#fff" />
    </g>
  ),
  // an entrance turnstile with a card reader; "open" turns the arm
  turnstile: ({ s, t, state }) => (
    <g>
      <Shadow w={s * 0.6} s={s} />
      <Box x={-s * 0.16} y={-s * 0.6} w={s * 0.32} h={s * 0.6} fill={PALETTE.grey} s={s} r={0.08} />
      <rect x={-s * 0.1} y={-s * 0.52} width={s * 0.2} height={s * 0.1} rx={s * 0.02} fill={state === "open" ? PALETTE.green : PALETTE.red} />
      <g transform={`rotate(${state === "open" ? -70 : 0} ${s * 0.16} ${-s * 0.36})`}>
        <rect x={s * 0.16} y={-s * 0.39} width={s * 0.42} height={s * 0.06} rx={s * 0.03} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s) * 0.4} />
      </g>
    </g>
  ),
  // a fanned pile of membership cards: everyone's fees
  cardpile: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.9} s={s} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${(i - 2) * s * 0.07},${-s * 0.06 - i * s * 0.05}) rotate(${(i - 2) * 9 + Math.sin(t * 1.5 + i) * 2})`}>
          <Box x={-s * 0.32} y={-s * 0.4} w={s * 0.64} h={s * 0.38} fill="#e9eef7" s={s} r={0.06} />
          <rect x={-s * 0.32} y={-s * 0.4} width={s * 0.64} height={s * 0.1} fill={PALETTE.red} />
        </g>
      ))}
    </g>
  ),
  // a bulging money sack with a dollar sign
  feesack: ({ s, t }) => (
    <g transform={`scale(${1 + 0.02 * Math.sin(t * 3)})`}>
      <Shadow w={s * 0.8} s={s} />
      <Shape d={`M${-s * 0.1},${-s * 0.74} Q${-s * 0.45},${-s * 0.5} ${-s * 0.38},${-s * 0.16} Q${-s * 0.32},0 0,0 Q${s * 0.32},0 ${s * 0.38},${-s * 0.16} Q${s * 0.45},${-s * 0.5} ${s * 0.1},${-s * 0.74} Z`} fill={PALETTE.tan} s={s} />
      <rect x={-s * 0.12} y={-s * 0.8} width={s * 0.24} height={s * 0.07} rx={s * 0.03} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.5} />
      <Paint x={0} y={-s * 0.22} text="$" size={s * 0.3} fill={PALETTE.green} />
    </g>
  ),
};

export default props;
