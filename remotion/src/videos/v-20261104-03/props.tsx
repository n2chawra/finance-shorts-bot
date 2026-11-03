/**
 * The things "Pay in 4, zero interest. So who pays Affirm?" is about, drawn for this video only: a
 * phone checkout with a pay-later button, a shop front, a shopping bag, a pair of sneakers with a
 * price tag, a payment split into four slices, a cash register, a shop owner's cash drawer and a
 * tiny coin cut.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a phone at checkout, a big PAY IN 4 button; "pressed" lights the button
  checkout: ({ s, t, state }) => (
    <g transform={`translate(0,${bob(t, s)}) rotate(-3)`}>
      <Shadow w={s * 0.6} s={s} />
      <Box x={-s * 0.28} y={-s * 1.0} w={s * 0.56} h={s * 0.98} fill={PALETTE.dark} s={s} r={0.08} />
      <rect x={-s * 0.24} y={-s * 0.94} width={s * 0.48} height={s * 0.84} rx={s * 0.03} fill={PALETTE.white} />
      <rect x={-s * 0.18} y={-s * 0.86} width={s * 0.36} height={s * 0.22} rx={s * 0.02} fill={PALETTE.cream} />
      <path d={`M${-s * 0.1},${-s * 0.7} q${s * 0.1},${-s * 0.1} ${s * 0.2},0`} stroke={PALETTE.blue} strokeWidth={line(s)} fill="none" />
      {[0, 1].map((i) => <rect key={i} x={-s * 0.18} y={-s * (0.58 - i * 0.07)} width={s * (0.36 - i * 0.12)} height={s * 0.03} rx={s * 0.015} fill={PALETTE.grey} opacity={0.6} />)}
      <rect x={-s * 0.2} y={-s * 0.36} width={s * 0.4} height={s * 0.12} rx={s * 0.05} fill={state === "pressed" ? PALETTE.green : PALETTE.blue} stroke={INK} strokeWidth={line(s) * 0.6} />
      <Paint x={0} y={-s * 0.28} text="PAY IN 4" size={s * 0.06} fill="#fff" />
    </g>
  ),
  // a shop front with an awning
  shopfront: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.1} s={s} />
      <Box x={-s * 0.5} y={-s * 0.7} w={s * 1.0} h={s * 0.7} fill={PALETTE.cream} s={s} r={0.02} />
      {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${-s * 0.55 + i * s * 0.22},${-s * 0.72} l${s * 0.22},0 l0,${s * 0.1} q${-s * 0.11},${s * 0.08} ${-s * 0.22},0 Z`} fill={i % 2 ? PALETTE.white : PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.5} />)}
      <rect x={-s * 0.42} y={-s * 0.5} width={s * 0.42} height={s * 0.32} fill="#bfe6ff" stroke={INK} strokeWidth={line(s) * 0.6} />
      <rect x={s * 0.1} y={-s * 0.5} width={s * 0.28} height={s * 0.5} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.6} />
      <circle cx={s * 0.33} cy={-s * 0.25} r={s * 0.02} fill={PALETTE.gold} />
      <Paint x={0} y={-s * 0.82 + Math.sin(t * 2) * s * 0.005} text="SHOP" size={s * 0.09} fill={INK} />
    </g>
  ),
  // a paper shopping bag with handles
  bag: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 1.8) * 3})`}>
      <Shadow w={s * 0.6} s={s} />
      <path d={`M${-s * 0.14},${-s * 0.6} q0,${-s * 0.18} ${s * 0.14},${-s * 0.18} q${s * 0.14},0 ${s * 0.14},${s * 0.18}`} stroke={INK} strokeWidth={line(s)} fill="none" />
      <Box x={-s * 0.28} y={-s * 0.62} w={s * 0.56} h={s * 0.62} fill={PALETTE.pink} s={s} r={0.04} />
    </g>
  ),
  // a sneaker with a swinging price tag
  sneaker: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.9} s={s} />
      <Shape d={`M${-s * 0.45},0 L${-s * 0.45},${-s * 0.2} Q${-s * 0.4},${-s * 0.42} ${-s * 0.15},${-s * 0.42} L${0},${-s * 0.3} Q${s * 0.3},${-s * 0.24} ${s * 0.45},${-s * 0.12} L${s * 0.45},0 Z`} fill={PALETTE.orange} s={s} />
      <rect x={-s * 0.46} y={-s * 0.06} width={s * 0.92} height={s * 0.06} fill={PALETTE.white} stroke={INK} strokeWidth={line(s) * 0.5} />
      {[0, 1, 2].map((i) => <line key={i} x1={-s * (0.2 - i * 0.06)} x2={-s * (0.12 - i * 0.06)} y1={-s * 0.36} y2={-s * 0.3} stroke="#fff" strokeWidth={line(s) * 0.7} />)}
      <g transform={`rotate(${Math.sin(t * 2.5) * 12} ${-s * 0.3} ${-s * 0.42})`}>
        <line x1={-s * 0.3} y1={-s * 0.42} x2={-s * 0.3} y2={-s * 0.6} stroke={INK} strokeWidth={line(s) * 0.5} />
        <Box x={-s * 0.4} y={-s * 0.72} w={s * 0.2} h={s * 0.12} fill={PALETTE.yellow} s={s} r={0.15} />
      </g>
    </g>
  ),
  // one payment split into four slices; k (0..1) is how far apart they drift
  split4: ({ s, t, k = 0.5 }) => (
    <g>
      <Shadow w={s * 0.9} s={s} />
      {[0, 1, 2, 3].map((i) => {
        const a = (i * 90 + 45) * Math.PI / 180, d = s * 0.08 * k;
        return <path key={i} d={`M0,0 L${Math.cos((i * 90) * Math.PI / 180) * s * 0.36},${Math.sin((i * 90) * Math.PI / 180) * s * 0.36} A${s * 0.36},${s * 0.36} 0 0 1 ${Math.cos(((i + 1) * 90) * Math.PI / 180) * s * 0.36},${Math.sin(((i + 1) * 90) * Math.PI / 180) * s * 0.36} Z`}
          transform={`translate(${Math.cos(a) * d},${-s * 0.42 + Math.sin(a) * d + Math.sin(t * 2 + i) * s * 0.008})`} fill={[PALETTE.blue, PALETTE.teal, PALETTE.purple, PALETTE.pink][i]!} stroke={INK} strokeWidth={line(s)} />;
      })}
    </g>
  ),
  // a cash register with a drawer that pops open; "open" slides the drawer
  register: ({ s, t, state }) => (
    <g>
      <Shadow w={s * 0.9} s={s} />
      <Box x={-s * 0.42} y={-s * 0.3} w={s * 0.84} h={s * 0.3} fill={PALETTE.grey} s={s} r={0.06} />
      <Box x={-s * 0.3} y={-s * 0.62} w={s * 0.6} h={s * 0.34} fill={shade(PALETTE.grey, -0.1)} s={s} r={0.06} />
      <rect x={-s * 0.22} y={-s * 0.56} width={s * 0.44} height={s * 0.12} fill={PALETTE.green} opacity={0.7 + 0.3 * Math.sin(t * 4)} />
      {state === "open" && <Box x={-s * 0.36} y={-s * 0.06} w={s * 0.72} h={s * 0.12} fill={PALETTE.tan} s={s} r={0.08} />}
    </g>
  ),
  // a small pile of coins: the cut
  coincut: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.6} s={s} />
      {[0, 1, 2, 3].map((i) => <Ball key={i} cx={(i % 2) * s * 0.12 - s * 0.06} cy={-s * (0.08 + i * 0.1)} rx={s * 0.18} ry={s * 0.06} fill={PALETTE.gold} s={s} />)}
      <circle cx={s * 0.2} cy={-s * 0.5} r={s * 0.04 * (1 + 0.4 * Math.sin(t * 5))} fill="#fff" opacity={0.8} />
    </g>
  ),
  // a bank building with columns: the pay-later company
  lenderhq: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.0} s={s} />
      <Shape d={`M${-s * 0.5},${-s * 0.62} L0,${-s * 0.86} L${s * 0.5},${-s * 0.62} Z`} fill={PALETTE.blue} s={s} />
      <Box x={-s * 0.46} y={-s * 0.62} w={s * 0.92} h={s * 0.08} fill={PALETTE.white} s={s} r={0.05} />
      {[-0.32, -0.11, 0.11, 0.32].map((x, i) => <rect key={i} x={s * x - s * 0.05} y={-s * 0.54} width={s * 0.1} height={s * 0.46} fill={PALETTE.white} stroke={INK} strokeWidth={line(s) * 0.5} />)}
      <Box x={-s * 0.5} y={-s * 0.08} w={s * 1.0} h={s * 0.08} fill={PALETTE.white} s={s} r={0.05} />
      <circle cx={0} cy={-s * 0.74} r={s * 0.04 * (1 + 0.2 * Math.sin(t * 3))} fill={PALETTE.gold} />
    </g>
  ),
};

export default props;
