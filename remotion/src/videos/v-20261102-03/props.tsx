/**
 * The things "To earn a billion, start ten thousand years ago" is about, drawn for this video only:
 * a worker with a briefcase (state "old": grey hair and a cane), a pay envelope, a towering
 * billion-dollar pile, a sundial whose shadow turns, the moon-landing flag, the Colosseum, a
 * pyramid of Egypt, a glacier, a woolly mammoth and a stone-age spear.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a worker in a shirt and tie with a briefcase; state "old" greys the hair and adds a cane
  worker: ({ s, t, state }) => {
    const old = state === "old";
    return (
      <g transform={`translate(0,${bob(t, s, 2, 0.012)})`}>
        <Shadow w={s * 0.6} s={s} />
        <rect x={-s * 0.14} y={-s * 0.08} width={s * 0.1} height={s * 0.08} fill={INK} />
        <rect x={s * 0.04} y={-s * 0.08} width={s * 0.1} height={s * 0.08} fill={INK} />
        <Box x={-s * 0.2} y={-s * 0.7} w={s * 0.4} h={s * 0.62} fill={PALETTE.white} s={s} r={0.22} />
        <Shape d={`M${-s * 0.04},${-s * 0.68} L${s * 0.04},${-s * 0.68} L${s * 0.03},${-s * 0.35} L0,${-s * 0.3} L${-s * 0.03},${-s * 0.35} Z`} fill={PALETTE.red} s={s} />
        <Ball cx={0} cy={-s * 0.84} rx={s * 0.15} fill={PALETTE.skin} s={s} />
        <path d={`M${-s * 0.15},${-s * 0.88} Q0,${-s * 1.05} ${s * 0.15},${-s * 0.88}`} fill={old ? "#d9dde6" : INK} />
        <circle cx={-s * 0.05} cy={-s * 0.85} r={s * 0.016} fill={INK} />
        <circle cx={s * 0.05} cy={-s * 0.85} r={s * 0.016} fill={INK} />
        <path d={`M${-s * 0.05},${-s * 0.77} q${s * 0.05},${s * 0.04} ${s * 0.1},0`} fill="none" stroke={INK} strokeWidth={line(s) * 0.5} />
        <g transform={`translate(${-s * 0.3},${-s * 0.3})`}>
          <Box x={-s * 0.12} y={-s * 0.08} w={s * 0.24} h={s * 0.18} fill={PALETTE.brown} s={s} r={0.1} />
        </g>
        {old && <line x1={s * 0.28} y1={-s * 0.4} x2={s * 0.32} y2={0} stroke={PALETTE.brown} strokeWidth={s * 0.03} strokeLinecap="round" />}
      </g>
    );
  },
  // a pay envelope with a window and notes peeking out, flapping a little
  payenvelope: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.9} s={s} />
      <g transform={`translate(0,${-s * 0.62 - 0.02 * s * Math.sin(t * 3)}) rotate(-6)`}>
        <Box x={-s * 0.3} y={-s * 0.1} w={s * 0.6} h={s * 0.2} fill={PALETTE.green} s={s} r={0.1} />
      </g>
      <Box x={-s * 0.42} y={-s * 0.6} w={s * 0.84} h={s * 0.55} fill={PALETTE.cream} s={s} r={0.04} />
      <rect x={-s * 0.28} y={-s * 0.32} width={s * 0.36} height={s * 0.12} fill="#dfe9ff" stroke={INK} strokeWidth={line(s) * 0.4} />
      <Paint x={s * 0.2} y={-s * 0.14} text="PAY" size={s * 0.12} fill={PALETTE.navy} />
    </g>
  ),
  // a tall tower of cash bundles reaching for the sky, a gold star blinking on top
  billiontower: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.8} s={s} />
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i} transform={`translate(${Math.sin(i * 1.3) * s * 0.02},${-s * 0.08 * (i + 1)})`}>
          <Box x={-s * 0.28} y={0} w={s * 0.56} h={s * 0.08} fill={i % 2 ? PALETTE.green : shade(PALETTE.green, 0.15)} s={s} r={0.15} />
        </g>
      ))}
      <g transform={`translate(0,${-s * 1.08}) scale(${1 + 0.15 * Math.abs(Math.sin(t * 3))})`}>
        <path d={`M0,${-s * 0.08} L${s * 0.025},${-s * 0.025} L${s * 0.08},${-s * 0.025} L${s * 0.035},${s * 0.01} L${s * 0.05},${s * 0.07} L0,${s * 0.035} L${-s * 0.05},${s * 0.07} L${-s * 0.035},${s * 0.01} L${-s * 0.08},${-s * 0.025} L${-s * 0.025},${-s * 0.025} Z`} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.4} />
      </g>
    </g>
  ),
  // a stone sundial whose shadow sweeps round
  sundial: ({ s, t }) => {
    const a = t * 1.2;
    return (
      <g>
        <Shadow w={s * 1.0} s={s} />
        <Box x={-s * 0.12} y={-s * 0.45} w={s * 0.24} h={s * 0.45} fill={PALETTE.grey} s={s} r={0.05} />
        <ellipse cx={0} cy={-s * 0.5} rx={s * 0.45} ry={s * 0.15} fill={PALETTE.tan} stroke={INK} strokeWidth={line(s)} />
        <line x1={0} y1={-s * 0.5} x2={Math.cos(a) * s * 0.38} y2={-s * 0.5 + Math.sin(a) * s * 0.12} stroke={shade(PALETTE.tan, -0.5)} strokeWidth={s * 0.04} strokeLinecap="round" />
        <Shape d={`M0,${-s * 0.5} L${s * 0.05},${-s * 0.75} L${s * 0.12},${-s * 0.5} Z`} fill={PALETTE.gold} s={s} />
      </g>
    );
  },
  // the moon-landing flag planted in grey moon dust, with a footprint
  moonflag: ({ s, t }) => (
    <g>
      <Shape d={`M${-s * 0.5},0 Q0,${-s * 0.18} ${s * 0.5},0 Z`} fill="#c9ced8" s={s} />
      <ellipse cx={-s * 0.2} cy={-s * 0.05} rx={s * 0.06} ry={s * 0.025} fill="#9aa1ae" />
      <line x1={s * 0.05} y1={-s * 0.1} x2={s * 0.05} y2={-s * 0.95} stroke={PALETTE.grey} strokeWidth={s * 0.025} />
      <g transform={`translate(${s * 0.05},${-s * 0.92}) skewY(${Math.sin(t * 2) * 3})`}>
        <Box x={0} y={0} w={s * 0.42} h={s * 0.28} fill={PALETTE.white} s={s} r={0.02} />
        {[0.06, 0.14, 0.22].map((y) => <rect key={y} x={0} y={s * y} width={s * 0.42} height={s * 0.04} fill={PALETTE.red} />)}
        <rect x={0} y={0} width={s * 0.17} height={s * 0.14} fill={PALETTE.navy} />
      </g>
    </g>
  ),
  // the Colosseum: two tiers of arches, a broken top edge
  colosseum: ({ s }) => (
    <g>
      <Shadow w={s * 1.6} s={s} />
      <Shape d={`M${-s * 0.75},0 L${-s * 0.75},${-s * 0.7} L${s * 0.2},${-s * 0.7} L${s * 0.35},${-s * 0.55} L${s * 0.75},${-s * 0.55} L${s * 0.75},0 Z`} fill={PALETTE.tan} s={s} />
      {[0.12, 0.42].map((y) => Array.from({ length: 6 }, (_, i) => (
        <path key={`${y}${i}`} d={`M${-s * 0.65 + i * s * 0.24},${-s * y} l0,${-s * 0.12} q${s * 0.07},${-s * 0.09} ${s * 0.14},0 l0,${s * 0.12} Z`}
          fill={shade(PALETTE.tan, -0.45)} opacity={y > 0.3 && i > 3 ? 0.6 : 1} />
      )))}
    </g>
  ),
  // a pyramid of Egypt with stone courses and a heat shimmer
  pyramid: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.6} s={s} />
      <Shape d={`M${-s * 0.8},0 L0,${-s * 0.85} L${s * 0.8},0 Z`} fill={PALETTE.gold} s={s} />
      <Shape d={`M0,${-s * 0.85} L${s * 0.8},0 L${s * 0.2},0 Z`} fill={shade(PALETTE.gold, -0.2)} s={s} />
      {[0.2, 0.4, 0.6].map((f) => <line key={f} x1={-s * 0.8 * (1 - f)} x2={s * 0.8 * (1 - f)} y1={-s * 0.85 * f} y2={-s * 0.85 * f} stroke={shade(PALETTE.gold, -0.35)} strokeWidth={s * 0.01} />)}
      <path d={`M${-s * 0.6},${-s * 0.95} q${s * 0.1},${-s * 0.05 * Math.sin(t * 4)} ${s * 0.2},0 t${s * 0.2},0`} fill="none" stroke="#fff" strokeWidth={s * 0.012} opacity={0.5} />
    </g>
  ),
  // a glacier: blue-white ice cliffs with a dripping edge
  glacier: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.5} s={s} />
      <Shape d={`M${-s * 0.75},0 L${-s * 0.6},${-s * 0.6} L${-s * 0.3},${-s * 0.75} L${-s * 0.05},${-s * 0.55} L${s * 0.25},${-s * 0.8} L${s * 0.55},${-s * 0.5} L${s * 0.75},0 Z`} fill="#e6f4ff" s={s} />
      <Shape d={`M${-s * 0.05},${-s * 0.55} L${s * 0.25},${-s * 0.8} L${s * 0.2},${-s * 0.2} Z`} fill="#bfe1fb" s={s} />
      {[0, 1].map((i) => {
        const f = (t * 0.6 + i * 0.5) % 1;
        return <ellipse key={i} cx={s * (0.1 + i * 0.25)} cy={-s * (0.1 - f * 0.08)} rx={s * 0.015} ry={s * 0.025} fill="#9fd3fb" opacity={1 - f} />;
      })}
    </g>
  ),
  // a woolly mammoth with curved tusks, swinging its trunk
  mammoth: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.3} s={s} />
      {[-0.35, -0.12, 0.15, 0.35].map((x) => <rect key={x} x={s * (x - 0.07)} y={-s * 0.3} width={s * 0.14} height={s * 0.3} rx={s * 0.04} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.5} />)}
      <Ball cx={0} cy={-s * 0.5} rx={s * 0.55} ry={s * 0.3} fill={PALETTE.brown} s={s} />
      <Ball cx={s * 0.5} cy={-s * 0.62} rx={s * 0.22} fill={shade(PALETTE.brown, 0.1)} s={s} />
      <circle cx={s * 0.55} cy={-s * 0.68} r={s * 0.02} fill={INK} />
      <path d={`M${s * 0.62},${-s * 0.52} q${s * 0.12},${s * 0.2} ${s * (0.02 + 0.06 * Math.sin(t * 2))},${s * 0.42}`} fill="none" stroke={shade(PALETTE.brown, 0.1)} strokeWidth={s * 0.08} strokeLinecap="round" />
      <path d={`M${s * 0.55},${-s * 0.48} q${s * 0.3},${s * 0.12} ${s * 0.3},${-s * 0.15}`} fill="none" stroke={PALETTE.cream} strokeWidth={s * 0.04} strokeLinecap="round" />
    </g>
  ),
  // a stone-age spear with a flint tip; state "raised" tilts it up
  spear: ({ s, t, state }) => (
    <g transform={`rotate(${state === "raised" ? -35 + Math.sin(t * 3) * 4 : -10})`}>
      <line x1={0} y1={0} x2={0} y2={-s * 1.0} stroke={PALETTE.brown} strokeWidth={s * 0.04} strokeLinecap="round" />
      <Shape d={`M0,${-s * 1.2} L${s * 0.07},${-s * 0.98} L0,${-s * 0.94} L${-s * 0.07},${-s * 0.98} Z`} fill={PALETTE.grey} s={s} />
      <line x1={-s * 0.04} y1={-s * 0.93} x2={s * 0.04} y2={-s * 0.9} stroke={PALETTE.tan} strokeWidth={s * 0.02} />
    </g>
  ),
};

export default props;
