/**
 * The things "Two friends, one 1% fee. Guess the gap" is about, drawn for this video only: each
 * friend's savings jar, the little fee leech that sips from one of them, a snowball that grows as
 * it rolls (compounding), a checkpoint flag for each stop, the guess card, a balance tipping as the
 * gap opens, a rocket for the no-fee money, a hill the snowball rolls down and a magnifier.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a glass jar of coins: k (0..1) is how full it is; state "leak" drips coins from a crack
  jar: ({ s, t, k = 0.4, state }) => {
    const top = -s * 0.85, fill = s * 0.78 * k;
    return (
      <g>
        <Shadow w={s * 0.8} s={s} />
        <rect x={-s * 0.32} y={-fill - s * 0.03} width={s * 0.64} height={fill} rx={s * 0.06} fill={PALETTE.gold} />
        {Array.from({ length: Math.round(8 * k) }, (_, i) => <ellipse key={i} cx={-s * 0.2 + (i % 3) * s * 0.2} cy={-s * 0.06 - i * fill / Math.max(1, 8 * k)} rx={s * 0.09} ry={s * 0.03} fill={shade(PALETTE.gold, -0.2)} />)}
        <path d={`M${-s * 0.36},${top} L${-s * 0.36},${-s * 0.06} Q${-s * 0.36},0 ${-s * 0.3},0 L${s * 0.3},0 Q${s * 0.36},0 ${s * 0.36},${-s * 0.06} L${s * 0.36},${top}`} fill="rgba(200,235,255,0.25)" stroke={INK} strokeWidth={line(s)} />
        <rect x={-s * 0.3} y={top - s * 0.1} width={s * 0.6} height={s * 0.1} rx={s * 0.02} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.7} />
        <rect x={-s * 0.28} y={top + s * 0.05} width={s * 0.05} height={s * 0.6} fill="#fff" opacity={0.35} />
        {state === "leak" && <>
          <path d={`M${s * 0.36},${-s * 0.3} l${-s * 0.06},${s * 0.05} l${s * 0.04},${s * 0.04}`} fill="none" stroke={INK} strokeWidth={line(s) * 0.6} />
          <circle cx={s * 0.42} cy={-s * 0.25 + ((t * 1.2) % 1) * s * 0.25} r={s * 0.04} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.4} />
        </>}
      </g>
    );
  },
  // the fee: a little green leech with a straw, wiggling as it sips
  leech: ({ s, t }) => {
    const wig = Math.sin(t * 6) * s * 0.03;
    return (
      <g transform={`translate(0,${bob(t, s, 3, 0.03)})`}>
        <Shadow w={s * 0.9} s={s} />
        <Shape d={`M${-s * 0.45},${-s * 0.15} Q${-s * 0.2},${-s * 0.5 + wig} ${s * 0.1},${-s * 0.35} Q${s * 0.4},${-s * 0.25 - wig} ${s * 0.45},${-s * 0.12} Q${s * 0.2},0 ${-s * 0.45},${-s * 0.15} Z`} fill={PALETTE.green} s={s} />
        {[-0.25, -0.1, 0.05, 0.2].map((x) => <line key={x} x1={s * x} y1={-s * 0.08} x2={s * (x + 0.04)} y2={-s * 0.32} stroke={shade(PALETTE.green, -0.3)} strokeWidth={line(s) * 0.6} />)}
        <circle cx={s * 0.3} cy={-s * 0.25} r={s * 0.05} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.5} />
        <circle cx={s * 0.31} cy={-s * 0.25} r={s * 0.02} fill={INK} />
        <line x1={s * 0.42} y1={-s * 0.16} x2={s * 0.62} y2={-s * 0.45} stroke={PALETTE.red} strokeWidth={line(s) * 1.2} strokeLinecap="round" />
        <Paint x={-s * 0.12} y={-s * 0.18} text="FEE" size={s * 0.13} fill="#fff" />
      </g>
    );
  },
  // a snowball rolling: k (0..1) is how big it has grown
  snowball: ({ s, t, k = 0.3 }) => {
    const r = s * (0.15 + 0.35 * k);
    return (
      <g>
        <Shadow w={r * 2.2} s={s} />
        <g transform={`translate(0,${-r}) rotate(${t * 120})`}>
          <Ball cx={0} cy={0} rx={r} fill="#f4f9ff" s={s} />
          {[0, 1, 2, 3].map((i) => <circle key={i} cx={Math.cos(i * 1.6) * r * 0.55} cy={Math.sin(i * 1.6) * r * 0.55} r={r * 0.12} fill="#cfe2f5" />)}
        </g>
      </g>
    );
  },
  // a checkpoint flag on a pole, waving
  flag: ({ s, t }) => {
    const w = Math.sin(t * 4) * s * 0.04;
    return (
      <g>
        <Shadow w={s * 0.3} s={s} />
        <line x1={0} y1={0} x2={0} y2={-s} stroke={PALETTE.dark} strokeWidth={line(s) * 1.4} />
        <Shape d={`M0,${-s} Q${s * 0.25},${-s * 0.95 + w} ${s * 0.5},${-s} L${s * 0.5},${-s * 0.7} Q${s * 0.25},${-s * 0.65 - w} 0,${-s * 0.7} Z`} fill={PALETTE.orange} s={s} />
        <rect x={s * 0.08} y={-s * 0.95} width={s * 0.1} height={s * 0.1} fill="#fff" />
        <rect x={s * 0.28} y={-s * 0.85} width={s * 0.1} height={s * 0.1} fill="#fff" />
      </g>
    );
  },
  // the guess card: a big question mark on a card, tilting
  guesscard: ({ s, t }) => (
    <g transform={`translate(0,${-s * 0.5}) rotate(${Math.sin(t * 2) * 6})`}>
      <Box x={-s * 0.32} y={-s * 0.45} w={s * 0.64} h={s * 0.9} fill={PALETTE.purple} s={s} r={0.1} />
      <Paint x={0} y={s * 0.18} text="?" size={s * 0.6} fill="#fff" />
    </g>
  ),
  // a balance scale: k (0..1) is how far it tips toward the right pan
  balance: ({ s, t, k = 0.5 }) => {
    const a = (k - 0.5) * 30 + Math.sin(t * 2) * 1.5;
    return (
      <g>
        <Shadow w={s * 0.6} s={s} />
        <Shape d={`M${-s * 0.2},0 L${s * 0.2},0 L${s * 0.05},${-s * 0.1} L${-s * 0.05},${-s * 0.1} Z`} fill={PALETTE.brown} s={s} />
        <line x1={0} y1={-s * 0.1} x2={0} y2={-s * 0.75} stroke={PALETTE.brown} strokeWidth={line(s) * 1.6} />
        <g transform={`translate(0,${-s * 0.75}) rotate(${a})`}>
          <line x1={-s * 0.45} y1={0} x2={s * 0.45} y2={0} stroke={PALETTE.brown} strokeWidth={line(s) * 1.4} />
          {[-0.45, 0.45].map((x) => (
            <g key={x} transform={`translate(${s * x},0) rotate(${-a})`}>
              <line x1={0} y1={0} x2={-s * 0.12} y2={s * 0.25} stroke={INK} strokeWidth={line(s) * 0.5} />
              <line x1={0} y1={0} x2={s * 0.12} y2={s * 0.25} stroke={INK} strokeWidth={line(s) * 0.5} />
              <Shape d={`M${-s * 0.16},${s * 0.25} L${s * 0.16},${s * 0.25} Q0,${s * 0.38} ${-s * 0.16},${s * 0.25} Z`} fill={PALETTE.gold} s={s} />
            </g>
          ))}
          <Ball cx={0} cy={0} rx={s * 0.04} fill={PALETTE.gold} s={s} />
        </g>
      </g>
    );
  },
  // a little rocket with a flickering flame
  rocket: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 5, 0.03)}) rotate(20)`}>
      <Shape d={`M${-s * 0.08},${-s * 0.12} L0,${s * (0.05 + 0.08 * Math.abs(Math.sin(t * 12)))} L${s * 0.08},${-s * 0.12} Z`} fill={PALETTE.orange} s={s} />
      <Shape d={`M${-s * 0.13},${-s * 0.15} L${-s * 0.13},${-s * 0.65} Q0,${-s * 1.0} ${s * 0.13},${-s * 0.65} L${s * 0.13},${-s * 0.15} Z`} fill="#fff" s={s} />
      <Ball cx={0} cy={-s * 0.55} rx={s * 0.06} fill={PALETTE.blue} s={s} />
      <Shape d={`M${-s * 0.13},${-s * 0.3} L${-s * 0.25},${-s * 0.12} L${-s * 0.13},${-s * 0.15} Z`} fill={PALETTE.red} s={s} />
      <Shape d={`M${s * 0.13},${-s * 0.3} L${s * 0.25},${-s * 0.12} L${s * 0.13},${-s * 0.15} Z`} fill={PALETTE.red} s={s} />
    </g>
  ),
  // a snowy hill the snowball rolls down
  hill: ({ s }) => (
    <g>
      <Shape d={`M${-s * 0.9},0 Q${-s * 0.4},${-s * 0.9} ${s * 0.1},${-s * 0.6} Q${s * 0.5},${-s * 0.35} ${s * 0.9},0 Z`} fill="#e6f1fb" s={s} />
      <Shape d={`M${-s * 0.25},${-s * 0.72} L${-s * 0.1},${-s * 0.9} L${s * 0.05},${-s * 0.7} Z`} fill={PALETTE.grey} s={s} />
    </g>
  ),
  // a magnifying glass, sweeping slowly
  magnifier: ({ s, t }) => (
    <g transform={`translate(0,${-s * 0.5}) rotate(${-20 + Math.sin(t * 1.5) * 10})`}>
      <line x1={s * 0.18} y1={s * 0.18} x2={s * 0.42} y2={s * 0.42} stroke={PALETTE.brown} strokeWidth={s * 0.08} strokeLinecap="round" />
      <circle r={s * 0.26} fill="rgba(200,235,255,0.45)" stroke={INK} strokeWidth={line(s) * 1.5} />
      <path d={`M${-s * 0.14},${-s * 0.08} A${s * 0.16},${s * 0.16} 0 0 1 ${s * 0.02},${-s * 0.17}`} fill="none" stroke="#fff" strokeWidth={line(s)} />
    </g>
  ),
};

export default props;
