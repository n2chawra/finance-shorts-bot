/**
 * The things "You borrow for a car. The rich borrow for this" is about, drawn for this video
 * only: a family sedan (state "old" fades and dents it), its key fob, the loan contract and a
 * signing pen, an office block and a corner shop the rich buy, red and green arrows for value
 * falling and growing, an APPROVED stamp and a handshake with the bank.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a family sedan, wheels turning; state "old" greys it and hangs a dent, k (0..1) is how shiny it is
  sedan: ({ s, t, k = 1, state }) => {
    const body = state === "old" ? PALETTE.grey : PALETTE.blue;
    const spin = t * 6;
    return (
      <g>
        <Shadow w={s * 1.7} s={s} />
        <Shape d={`M${-s * 0.8},${-s * 0.12} L${-s * 0.8},${-s * 0.36} L${-s * 0.5},${-s * 0.4} L${-s * 0.3},${-s * 0.62} L${s * 0.3},${-s * 0.62} L${s * 0.5},${-s * 0.4} L${s * 0.8},${-s * 0.34} L${s * 0.8},${-s * 0.12} Z`} fill={body} s={s} />
        <Shape d={`M${-s * 0.24},${-s * 0.56} L${-s * 0.04},${-s * 0.56} L${-s * 0.04},${-s * 0.42} L${-s * 0.4},${-s * 0.42} Z`} fill="#cfe8ff" s={s} />
        <Shape d={`M${s * 0.04},${-s * 0.56} L${s * 0.24},${-s * 0.56} L${s * 0.4},${-s * 0.42} L${s * 0.04},${-s * 0.42} Z`} fill="#cfe8ff" s={s} />
        <circle cx={s * 0.74} cy={-s * 0.3} r={s * 0.04} fill={PALETTE.yellow} />
        {k > 0.5 && state !== "old" && <path d={`M${-s * 0.5},${-s * 0.5} l${s * 0.05},${-s * 0.08} l${s * 0.05},${s * 0.08} l${-s * 0.05},${s * 0.08} Z`} fill="#fff" opacity={0.6 + 0.4 * Math.sin(t * 5)} />}
        {state === "old" && <path d={`M${s * 0.2},${-s * 0.3} q${s * 0.08},${s * 0.06} ${s * 0.16},0`} fill="none" stroke={INK} strokeWidth={line(s)} />}
        {[-0.48, 0.48].map((x) => (
          <g key={x} transform={`translate(${s * x},${-s * 0.12}) rotate(${spin * 57})`}>
            <circle r={s * 0.14} fill={INK} />
            <circle r={s * 0.06} fill={PALETTE.grey} />
            <line x1={-s * 0.06} y1={0} x2={s * 0.06} y2={0} stroke={INK} strokeWidth={line(s) * 0.6} />
          </g>
        ))}
      </g>
    );
  },
  // a car key fob on a ring, swinging
  keyfob: ({ s, t }) => (
    <g transform={`translate(0,${-s * 0.9}) rotate(${Math.sin(t * 3) * 14})`}>
      <circle r={s * 0.12} fill="none" stroke={PALETTE.grey} strokeWidth={s * 0.04} />
      <Box x={-s * 0.16} y={s * 0.1} w={s * 0.32} h={s * 0.52} fill={PALETTE.dark} s={s} r={0.3} />
      <circle cx={0} cy={s * 0.26} r={s * 0.06} fill={PALETTE.red} />
      <circle cx={0} cy={s * 0.44} r={s * 0.05} fill={PALETTE.grey} />
    </g>
  ),
  // the loan contract: a page with lines and a signature that writes itself (k 0..1)
  contract: ({ s, t, k = 0 }) => (
    <g transform={`translate(0,${bob(t, s, 1.6, 0.02)})`}>
      <Shadow w={s * 0.8} s={s} />
      <Box x={-s * 0.34} y={-s * 1.0} w={s * 0.68} h={s * 0.96} fill={PALETTE.white} s={s} r={0.04} />
      <Paint x={0} y={-s * 0.84} text="LOAN" size={s * 0.15} fill={INK} />
      {[0.7, 0.62, 0.54, 0.46, 0.38].map((y) => <line key={y} x1={-s * 0.24} y1={-s * y} x2={s * 0.24} y2={-s * y} stroke={PALETTE.grey} strokeWidth={line(s) * 0.6} />)}
      <path d={`M${-s * 0.22},${-s * 0.18} q${s * 0.06},${-s * 0.12} ${s * 0.1},0 t${s * 0.1},0 t${s * 0.12},-${s * 0.02}`} fill="none" stroke={PALETTE.blue} strokeWidth={line(s)}
        strokeDasharray={s * 0.6} strokeDashoffset={s * 0.6 * (1 - Math.min(1, k))} />
      <line x1={-s * 0.26} y1={-s * 0.12} x2={s * 0.26} y2={-s * 0.12} stroke={INK} strokeWidth={line(s) * 0.5} />
    </g>
  ),
  // a fountain pen, nib down, writing in little circles
  pen: ({ s, t }) => (
    <g transform={`translate(${Math.sin(t * 6) * s * 0.04},${Math.cos(t * 6) * s * 0.02}) rotate(25)`}>
      <Box x={-s * 0.06} y={-s * 0.9} w={s * 0.12} h={s * 0.65} fill={PALETTE.dark} s={s} r={0.4} />
      <rect x={-s * 0.065} y={-s * 0.32} width={s * 0.13} height={s * 0.06} fill={PALETTE.gold} />
      <Shape d={`M${-s * 0.06},${-s * 0.26} L${s * 0.06},${-s * 0.26} L0,0 Z`} fill={PALETTE.gold} s={s} />
    </g>
  ),
  // an office block with windows lighting up floor by floor (k 0..1 how many are lit)
  offices: ({ s, t, k = 0.6 }) => (
    <g>
      <Shadow w={s * 1.0} s={s} />
      <Box x={-s * 0.4} y={-s * 1.3} w={s * 0.8} h={s * 1.3} fill={PALETTE.navy} s={s} r={0.02} />
      {Array.from({ length: 6 }, (_, r) => Array.from({ length: 4 }, (_, c) => {
        const lit = (r * 4 + c + Math.floor(t * 2)) % 7 < 7 * k;
        return <rect key={`${r}${c}`} x={-s * 0.32 + c * s * 0.17} y={-s * 1.2 + r * s * 0.19} width={s * 0.12} height={s * 0.12} fill={lit ? "#ffe9a8" : shade(PALETTE.navy, 0.2)} stroke={INK} strokeWidth={line(s) * 0.3} />;
      }))}
      <rect x={-s * 0.1} y={-s * 0.14} width={s * 0.2} height={s * 0.14} fill={PALETTE.teal} stroke={INK} strokeWidth={line(s) * 0.5} />
    </g>
  ),
  // a small corner shop with a striped awning and an OPEN sign blinking
  shop: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.3} s={s} />
      <Box x={-s * 0.6} y={-s * 0.75} w={s * 1.2} h={s * 0.75} fill={PALETTE.cream} s={s} r={0.03} />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-s * 0.66 + i * s * 0.22} y={-s * 0.86} width={s * 0.22} height={s * 0.16} fill={i % 2 ? PALETTE.white : PALETTE.green} stroke={INK} strokeWidth={line(s) * 0.4} />)}
      <rect x={-s * 0.5} y={-s * 0.6} width={s * 0.5} height={s * 0.34} fill="#cfe8ff" stroke={INK} strokeWidth={line(s) * 0.5} />
      <rect x={s * 0.12} y={-s * 0.6} width={s * 0.34} height={s * 0.6} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.5} />
      <Box x={-s * 0.44} y={-s * 0.56} w={s * 0.36} h={s * 0.12} fill={Math.floor(t * 2) % 2 ? PALETTE.red : shade(PALETTE.red, -0.3)} s={s} r={0.2} />
      <Paint x={-s * 0.26} y={-s * 0.47} text="OPEN" size={s * 0.08} fill={PALETTE.white} />
    </g>
  ),
  // a red arrow pointing down: value falling
  downarrow: ({ s, t }) => (
    <g transform={`translate(0,${-s * 0.5 + Math.abs(Math.sin(t * 3)) * s * 0.06})`}>
      <Shape d={`M${-s * 0.14},${-s * 0.45} L${s * 0.14},${-s * 0.45} L${s * 0.14},0 L${s * 0.3},0 L0,${s * 0.4} L${-s * 0.3},0 L${-s * 0.14},0 Z`} fill={PALETTE.red} s={s} />
    </g>
  ),
  // a green arrow pointing up: value growing
  uparrow: ({ s, t }) => (
    <g transform={`translate(0,${-s * 0.5 - Math.abs(Math.sin(t * 3)) * s * 0.06})`}>
      <Shape d={`M${-s * 0.14},${s * 0.45} L${s * 0.14},${s * 0.45} L${s * 0.14},0 L${s * 0.3},0 L0,${-s * 0.4} L${-s * 0.3},0 L${-s * 0.14},0 Z`} fill={PALETTE.green} s={s} />
    </g>
  ),
  // a round APPROVED rubber stamp mark
  stamp: ({ s, t }) => (
    <g transform={`translate(0,${-s * 0.5}) rotate(${-12 + Math.sin(t * 2) * 2})`}>
      <circle r={s * 0.42} fill="rgba(255,255,255,0.85)" stroke={PALETTE.green} strokeWidth={s * 0.05} />
      <circle r={s * 0.34} fill="none" stroke={PALETTE.green} strokeWidth={s * 0.02} />
      <Paint x={0} y={s * 0.05} text="OK" size={s * 0.26} fill={PALETTE.green} />
    </g>
  ),
  // two hands shaking: the deal with the bank
  handshake: ({ s, t }) => (
    <g transform={`translate(0,${-s * 0.5 + Math.sin(t * 6) * s * 0.03})`}>
      <Box x={-s * 0.75} y={-s * 0.12} w={s * 0.45} h={s * 0.24} fill={PALETTE.navy} s={s} r={0.2} />
      <Box x={s * 0.3} y={-s * 0.12} w={s * 0.45} h={s * 0.24} fill={PALETTE.dark} s={s} r={0.2} />
      <Ball cx={-s * 0.14} cy={0} rx={s * 0.2} ry={s * 0.14} fill={PALETTE.skin} s={s} />
      <Ball cx={s * 0.14} cy={s * 0.02} rx={s * 0.2} ry={s * 0.13} fill={shade(PALETTE.skin, -0.15)} s={s} />
    </g>
  ),
};

export default props;
