/**
 * The things "Rich vs poor: the same year-end bonus" is about, drawn for this video only: the
 * bonus envelope, a giant TV that gets scratched and dies, its sound bar, a shopping bag, an
 * index-fund certificate (a slice of many companies), a sapling that grows into a money tree, a
 * piggy bank, a factory with the TV maker's chimney, a trash bin for the old TV, a gift bow.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // the bonus: a fat envelope with a gold seal, notes peeking out
  envelope: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2)}) rotate(${Math.sin(t * 1.5) * 3})`}>
      <Shadow w={s * 1.1} s={s} />
      <rect x={-s * 0.4} y={-s * 0.82} width={s * 0.6} height={s * 0.3} rx={s * 0.03} fill="#9dc79f" stroke={INK} strokeWidth={line(s) * 0.6} transform={`rotate(-8)`} />
      <Box x={-s * 0.55} y={-s * 0.66} w={s * 1.1} h={s * 0.62} fill={PALETTE.cream} s={s} r={0.06} sheen={false} />
      <path d={`M${-s * 0.55},${-s * 0.66} L0,${-s * 0.3} L${s * 0.55},${-s * 0.66}`} fill="none" stroke={INK} strokeWidth={line(s)} />
      <Ball cx={0} cy={-s * 0.32} rx={s * 0.1} fill={PALETTE.gold} s={s} />
      <Paint x={0} y={-s * 0.1} text="BONUS" size={s * 0.13} fill={PALETTE.green} />
    </g>
  ),
  // a big flat TV on a stand: state "scratched" cracks the screen, "dead" goes black with a red X
  tv: ({ s, t, state }) => {
    const dead = state === "dead", scratched = state === "scratched" || dead;
    const glow = 0.5 + 0.5 * Math.sin(t * 3);
    return (
      <g>
        <Shadow w={s * 1.0} s={s} />
        <rect x={-s * 0.06} y={-s * 0.22} width={s * 0.12} height={s * 0.2} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s) * 0.6} />
        <Box x={-s * 0.3} y={-s * 0.06} w={s * 0.6} h={s * 0.06} fill={PALETTE.dark} s={s} r={0.3} sheen={false} />
        <Box x={-s * 0.8} y={-s * 0.95} w={s * 1.6} h={s * 0.75} fill={PALETTE.dark} s={s} r={0.04} sheen={false} />
        <rect x={-s * 0.74} y={-s * 0.89} width={s * 1.48} height={s * 0.63} fill={dead ? "#111" : `rgb(${60 + glow * 60},${120 + glow * 60},${220})`} />
        {!dead && <circle cx={s * 0.2} cy={-s * 0.62} r={s * 0.14} fill={PALETTE.yellow} opacity={0.8} />}
        {!dead && <path d={`M${-s * 0.74},${-s * 0.35} Q${-s * 0.3},${-s * 0.55} 0,${-s * 0.4} T${s * 0.74},${-s * 0.45} V${-s * 0.26} H${-s * 0.74} Z`} fill={PALETTE.green} opacity={0.8} />}
        {scratched && <path d={`M${-s * 0.5},${-s * 0.85} L${-s * 0.2},${-s * 0.55} L${-s * 0.35},${-s * 0.4} L0,${-s * 0.3} M${-s * 0.2},${-s * 0.55} L${s * 0.1},${-s * 0.7}`} stroke="#fff" strokeWidth={line(s) * 0.6} fill="none" opacity={0.8} />}
        {dead && <path d={`M${-s * 0.25},${-s * 0.75} L${s * 0.25},${-s * 0.4} M${s * 0.25},${-s * 0.75} L${-s * 0.25},${-s * 0.4}`} stroke={PALETTE.red} strokeWidth={s * 0.06} strokeLinecap="round" />}
      </g>
    );
  },
  // a sound bar with pulsing speaker dots
  soundbar: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.4} s={s} />
      <Box x={-s * 0.75} y={-s * 0.22} w={s * 1.5} h={s * 0.2} fill={PALETTE.dark} s={s} r={0.4} />
      {[-0.5, -0.25, 0, 0.25, 0.5].map((x, i) => <circle key={x} cx={s * x} cy={-s * 0.12} r={s * (0.04 + 0.015 * Math.abs(Math.sin(t * 8 + i)))} fill={PALETTE.grey} />)}
    </g>
  ),
  // a shopping bag with rope handles
  bag: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 2) * 3})`}>
      <Shadow w={s * 0.8} s={s} />
      <path d={`M${-s * 0.18},${-s * 0.75} q${s * 0.18},${-s * 0.3} ${s * 0.36},0`} fill="none" stroke={INK} strokeWidth={s * 0.04} />
      <Shape d={`M${-s * 0.4},${-s * 0.75} L${s * 0.4},${-s * 0.75} L${s * 0.45},0 L${-s * 0.45},0 Z`} fill={PALETTE.pink} s={s} />
      <Paint x={0} y={-s * 0.32} text="SALE" size={s * 0.18} fill="#fff" />
    </g>
  ),
  // an index-fund certificate: one sheet with many tiny company logos on it
  fund: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)}) rotate(4)`}>
      <Shadow w={s * 0.9} s={s} />
      <Box x={-s * 0.42} y={-s * 1.0} w={s * 0.84} h={s * 0.96} fill={PALETTE.cream} s={s} r={0.04} sheen={false} />
      <Paint x={0} y={-s * 0.84} text="INDEX FUND" size={s * 0.09} fill={PALETTE.navy} />
      {[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => (
        <rect key={`${r}${c}`} x={-s * 0.32 + c * s * 0.17} y={-s * 0.74 + r * s * 0.15} width={s * 0.12} height={s * 0.1} rx={s * 0.02}
          fill={[PALETTE.blue, PALETTE.red, PALETTE.green, PALETTE.orange, PALETTE.purple, PALETTE.teal][(r * 4 + c) % 6]} stroke={INK} strokeWidth={line(s) * 0.3} />
      )))}
      <Ball cx={s * 0.26} cy={-s * 0.14} rx={s * 0.08} fill={PALETTE.gold} s={s} />
    </g>
  ),
  // a money tree: k (0..1) is how grown it is, from a sapling to a full crown of notes
  tree: ({ s, t, k = 0.3 }) => {
    const h = s * (0.3 + 0.7 * k), crown = s * (0.12 + 0.38 * k);
    return (
      <g>
        <Shadow w={s * 0.8} s={s} />
        <Box x={-s * 0.22} y={-s * 0.16} w={s * 0.44} h={s * 0.16} fill={PALETTE.brown} s={s} r={0.2} />
        <rect x={-s * 0.03 - k * s * 0.02} y={-h} width={s * (0.06 + k * 0.04)} height={h - s * 0.14} fill={shade(PALETTE.brown, -0.1)} stroke={INK} strokeWidth={line(s) * 0.6} />
        <Ball cx={0} cy={-h} rx={crown} ry={crown * 0.85} fill={PALETTE.green} s={s} />
        {Array.from({ length: Math.round(2 + k * 8) }, (_, i) => {
          const a = i * 2.4 + t * 0.4;
          return <rect key={i} x={Math.cos(a) * crown * 0.6 - s * 0.05} y={-h + Math.sin(a) * crown * 0.5 - s * 0.025} width={s * 0.1} height={s * 0.05} rx={s * 0.01}
            fill="#9dc79f" stroke={INK} strokeWidth={line(s) * 0.3} transform={`rotate(${Math.sin(a) * 30},${Math.cos(a) * crown * 0.6},${-h + Math.sin(a) * crown * 0.5})`} />;
        })}
      </g>
    );
  },
  // the TV maker's factory: sawtooth roof, a chimney puffing
  factory: ({ s, t }) => (
    <g>
      <Box x={-s * 0.7} y={-s * 0.5} w={s * 1.4} h={s * 0.5} fill={PALETTE.grey} s={s} r={0.02} sheen={false} />
      <Shape d={`M${-s * 0.7},${-s * 0.5} L${-s * 0.7},${-s * 0.75} L${-s * 0.35},${-s * 0.5} L${-s * 0.35},${-s * 0.75} L0,${-s * 0.5} L0,${-s * 0.75} L${s * 0.35},${-s * 0.5} Z`} fill={PALETTE.dark} s={s} />
      <rect x={s * 0.42} y={-s * 1.0} width={s * 0.14} height={s * 0.5} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.6} />
      {[0, 1, 2].map((i) => { const f = (t * 0.6 + i / 3) % 1; return <circle key={i} cx={s * (0.49 + f * 0.2)} cy={-s * (1.05 + f * 0.4)} r={s * (0.05 + f * 0.08)} fill="#ddd" opacity={1 - f} />; })}
      {[-0.5, -0.2, 0.1].map((x) => <rect key={x} x={s * x} y={-s * 0.35} width={s * 0.16} height={s * 0.14} fill={PALETTE.yellow} stroke={INK} strokeWidth={line(s) * 0.4} />)}
    </g>
  ),
  // a trash bin, lid flapping
  bin: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.7} s={s} />
      <Shape d={`M${-s * 0.3},${-s * 0.75} L${s * 0.3},${-s * 0.75} L${s * 0.25},0 L${-s * 0.25},0 Z`} fill={PALETTE.grey} s={s} />
      {[-0.12, 0, 0.12].map((x) => <line key={x} x1={s * x} x2={s * x * 0.85} y1={-s * 0.65} y2={-s * 0.08} stroke={INK} strokeWidth={line(s) * 0.5} />)}
      <g transform={`rotate(${-10 - Math.abs(Math.sin(t * 4)) * 15},${-s * 0.34},${-s * 0.78})`}><Box x={-s * 0.36} y={-s * 0.86} w={s * 0.72} h={s * 0.1} fill={shade(PALETTE.grey, -0.2)} s={s} r={0.3} sheen={false} /></g>
    </g>
  ),
  // a price tag on a string
  pricetag: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 2.2) * 8})`}>
      <path d={`M0,${-s} L0,${-s * 0.8}`} stroke={INK} strokeWidth={line(s) * 0.5} />
      <Shape d={`M${-s * 0.25},${-s * 0.8} L${s * 0.25},${-s * 0.8} L${s * 0.25},${-s * 0.2} L0,0 L${-s * 0.25},${-s * 0.2} Z`} fill={PALETTE.yellow} s={s} />
      <circle cx={0} cy={-s * 0.68} r={s * 0.05} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.5} />
    </g>
  ),
  // a calendar page stack showing the years go by: k is how many pages have torn off
  years: ({ s, t, k = 0 }) => (
    <g transform={`rotate(${Math.sin(t) * 2})`}>
      <Box x={-s * 0.35} y={-s * 0.8} w={s * 0.7} h={s * 0.76} fill="#fff" s={s} r={0.05} sheen={false} />
      <rect x={-s * 0.35} y={-s * 0.8} width={s * 0.7} height={s * 0.18} fill={PALETTE.blue} stroke={INK} strokeWidth={line(s)} />
      {Array.from({ length: 3 }, (_, i) => {
        const f = clamp01((t * 1.2 + i / 3) % 1) * k;
        return <rect key={i} x={-s * 0.33 + f * s * 0.5} y={-s * 0.6 - f * s * 0.5} width={s * 0.66} height={s * 0.5} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.4} opacity={k > 0 ? 1 - f : 0} transform={`rotate(${f * 50})`} />;
      })}
    </g>
  ),
};

function clamp01(x: number) { return Math.min(1, Math.max(0, x)); }

export default props;
