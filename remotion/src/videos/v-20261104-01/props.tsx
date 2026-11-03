/**
 * The things "Saudi Arabia planned a 170 km city. By 2030: 2.4 km" is about, drawn for this video
 * only: the mirrored line city, a tower crane, the blueprint roll, a measuring tape that runs out, a
 * crowd of future residents, an hourglass, a pile of gold bars for the budget, a kilometre marker
 * post, a camel and a cement mixer.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // The Line: two mirrored walls running off to the horizon; k (0..1) is how much of it stands
  linecity: ({ s, t, k = 1 }) => {
    const len = s * (0.3 + 1.5 * Math.max(0, Math.min(1, k)));
    const glint = ((t * 0.35) % 1) * len;
    return (
      <g>
        <Shadow w={len * 1.1} s={s} />
        <Shape d={`M${-len / 2},0 L${-len / 2},${-s * 0.62} L${len / 2},${-s * 0.5} L${len / 2},0 Z`} fill="#8fd3f4" s={s} />
        <Shape d={`M${-len / 2},${-s * 0.62} L${-len / 2 + s * 0.08},${-s * 0.7} L${len / 2 + s * 0.06},${-s * 0.56} L${len / 2},${-s * 0.5} Z`} fill={shade("#8fd3f4", 0.35)} s={s} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-len / 2} x2={len / 2} y1={-s * (0.1 + i * 0.09)} y2={-s * (0.1 + i * 0.075)} stroke="#fff" strokeOpacity={0.35} strokeWidth={line(s) * 0.6} />)}
        <rect x={-len / 2 + glint} y={-s * 0.64} width={s * 0.06} height={s * 0.62} fill="#fff" opacity={0.55} transform={`skewX(-12)`} />
      </g>
    );
  },
  // a yellow tower crane, its jib swinging slowly, a load on the hook
  crane: ({ s, t }) => {
    const a = Math.sin(t * 0.8) * 8;
    return (
      <g>
        <Shadow w={s * 0.5} s={s} />
        <Box x={-s * 0.06} y={-s * 0.95} w={s * 0.12} h={s * 0.95} fill={PALETTE.yellow} s={s} r={0.05} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-s * 0.06} x2={s * 0.06} y1={-s * (0.1 + i * 0.15)} y2={-s * (0.2 + i * 0.15)} stroke={INK} strokeWidth={line(s) * 0.6} />)}
        <g transform={`translate(0,${-s * 0.95}) rotate(${a})`}>
          <Box x={-s * 0.2} y={-s * 0.06} w={s * 0.75} h={s * 0.07} fill={PALETTE.yellow} s={s} r={0.1} />
          <rect x={-s * 0.22} y={-s * 0.02} width={s * 0.12} height={s * 0.1} fill={PALETTE.dark} />
          <line x1={s * 0.45} x2={s * 0.45} y1={0} y2={s * 0.35} stroke={INK} strokeWidth={line(s) * 0.7} />
          <Box x={s * 0.37} y={s * 0.35} w={s * 0.16} h={s * 0.1} fill={PALETTE.grey} s={s} r={0.1} />
        </g>
      </g>
    );
  },
  // a blueprint sheet, half unrolled, with one long straight line drawn across it
  blueprint: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)}) rotate(-3)`}>
      <Shadow w={s * 1.1} s={s} />
      <Box x={-s * 0.55} y={-s * 0.75} w={s * 1.1} h={s * 0.65} fill={PALETTE.blue} s={s} r={0.03} sheen={false} />
      {Array.from({ length: 5 }, (_, i) => <line key={i} x1={-s * 0.5} x2={s * 0.5} y1={-s * (0.7 - i * 0.13)} y2={-s * (0.7 - i * 0.13)} stroke="#fff" strokeOpacity={0.2} strokeWidth={line(s) * 0.5} />)}
      <line x1={-s * 0.48} x2={s * 0.48} y1={-s * 0.42} y2={-s * 0.44} stroke="#fff" strokeWidth={line(s) * 1.6} strokeLinecap="round" />
      <Ball cx={s * 0.58} cy={-s * 0.42} rx={s * 0.07} ry={s * 0.33} fill={shade(PALETTE.blue, -0.25)} s={s} />
      <Paint x={-s * 0.2} y={-s * 0.2} text="PLAN" size={s * 0.1} fill="#fff" />
    </g>
  ),
  // a measuring tape: the reel and its tape running out to the right; k (0..1) is how far
  tape: ({ s, t, k = 0.6 }) => {
    const len = s * (0.15 + 1.1 * Math.max(0, Math.min(1, k)));
    return (
      <g>
        <Shadow w={s * 0.5 + len} s={s} />
        <rect x={0} y={-s * 0.14} width={len} height={s * 0.1} fill={PALETTE.yellow} stroke={INK} strokeWidth={line(s) * 0.6} />
        {Array.from({ length: Math.max(1, Math.floor(len / (s * 0.08))) }, (_, i) => <line key={i} x1={i * s * 0.08} x2={i * s * 0.08} y1={-s * 0.14} y2={-s * (i % 2 ? 0.09 : 0.06)} stroke={INK} strokeWidth={line(s) * 0.4} />)}
        <g transform={`rotate(${t * 20} ${-s * 0.15} ${-s * 0.2})`}>
          <Ball cx={-s * 0.15} cy={-s * 0.2} rx={s * 0.2} fill={PALETTE.red} s={s} />
          <circle cx={-s * 0.15} cy={-s * 0.2} r={s * 0.06} fill={PALETTE.dark} />
        </g>
      </g>
    );
  },
  // a crowd of future residents; k (0..1) is how many of them are there
  crowd: ({ s, t, k = 1 }) => {
    const n = Math.max(1, Math.round(15 * Math.max(0, Math.min(1, k))));
    const cols = [PALETTE.red, PALETTE.blue, PALETTE.green, PALETTE.orange, PALETTE.purple];
    return (
      <g>
        <Shadow w={s * 1.1} s={s} />
        {Array.from({ length: n }, (_, i) => {
          const r = Math.floor(i / 5), c = i % 5;
          const x = (c - 2) * s * 0.2 + (r % 2) * s * 0.1, y = -r * s * 0.12;
          return (
            <g key={i} transform={`translate(${x},${y + Math.sin(t * 3 + i) * s * 0.01})`}>
              <Shape d={`M${-s * 0.07},0 L${-s * 0.07},${-s * 0.22} Q0,${-s * 0.3} ${s * 0.07},${-s * 0.22} L${s * 0.07},0 Z`} fill={cols[i % 5]!} s={s} />
              <Ball cx={0} cy={-s * 0.33} rx={s * 0.06} fill={PALETTE.skin} s={s} />
            </g>
          );
        })}
      </g>
    );
  },
  // an hourglass whose sand runs down; "flip" turns it over
  hourglass: ({ s, t, state }) => {
    const f = (t * 0.15) % 1;
    return (
      <g transform={state === "flip" ? `rotate(${Math.min(180, t * 90)} 0 ${-s * 0.5})` : undefined}>
        <Shadow w={s * 0.5} s={s} />
        <Box x={-s * 0.3} y={-s * 0.06} w={s * 0.6} h={s * 0.06} fill={PALETTE.brown} s={s} r={0.2} />
        <Box x={-s * 0.3} y={-s * 1.0} w={s * 0.6} h={s * 0.06} fill={PALETTE.brown} s={s} r={0.2} />
        <path d={`M${-s * 0.24},${-s * 0.94} L${s * 0.24},${-s * 0.94} L${s * 0.03},${-s * 0.5} L${s * 0.24},${-s * 0.06} L${-s * 0.24},${-s * 0.06} L${-s * 0.03},${-s * 0.5} Z`} fill="#e8f6ff" fillOpacity={0.6} stroke={INK} strokeWidth={line(s)} />
        <path d={`M${-s * 0.2 * (1 - f)},${-s * (0.55 + 0.35 * (1 - f))} L${s * 0.2 * (1 - f)},${-s * (0.55 + 0.35 * (1 - f))} L0,${-s * 0.52} Z`} fill={PALETTE.tan} />
        <line x1={0} x2={0} y1={-s * 0.5} y2={-s * 0.08} stroke={PALETTE.tan} strokeWidth={line(s) * 0.6} />
        <path d={`M${-s * 0.22},${-s * 0.06} L${s * 0.22},${-s * 0.06} L0,${-s * (0.08 + 0.3 * f)} Z`} fill={PALETTE.tan} />
      </g>
    );
  },
  // the budget: a pyramid of gold bars
  goldpile: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.1} s={s} />
      {[[0, 4], [1, 3], [2, 2], [3, 1]].map(([r, n]) => Array.from({ length: n! }, (_, i) => (
        <g key={`${r}-${i}`} transform={`translate(${(i - (n! - 1) / 2) * s * 0.24},${-r! * s * 0.13})`}>
          <Shape d={`M${-s * 0.11},0 L${s * 0.11},0 L${s * 0.08},${-s * 0.12} L${-s * 0.08},${-s * 0.12} Z`} fill={PALETTE.gold} s={s} />
        </g>
      )))}
      <rect x={-s * 0.4 + ((t * 0.5) % 1) * s * 0.8} y={-s * 0.5} width={s * 0.05} height={s * 0.5} fill="#fff" opacity={0.4} transform="skewX(-20)" />
    </g>
  ),
  // a dug kilometre: a mound of dirt with a shovel in it and a red KM flag
  kmpost: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.0} s={s} />
      <Shape d={`M${-s * 0.5},0 Q${-s * 0.25},${-s * 0.42} 0,${-s * 0.4} Q${s * 0.3},${-s * 0.38} ${s * 0.5},0 Z`} fill={PALETTE.brown} s={s} />
      {[[-0.2, -0.15], [0.1, -0.22], [0.28, -0.1]].map(([x, y], i) => <circle key={i} cx={s * x!} cy={s * y!} r={s * 0.03} fill={shade(PALETTE.brown, -0.3)} />)}
      <g transform={`rotate(${18 + Math.sin(t * 2) * 4} ${s * 0.1} ${-s * 0.35})`}>
        <rect x={s * 0.07} y={-s * 0.95} width={s * 0.05} height={s * 0.55} fill={PALETTE.tan} stroke={INK} strokeWidth={line(s) * 0.6} />
        <rect x={s * 0.02} y={-s * 1.0} width={s * 0.15} height={s * 0.05} rx={s * 0.02} fill={PALETTE.dark} />
        <Shape d={`M${s * 0.0},${-s * 0.42} L${s * 0.19},${-s * 0.42} L${s * 0.17},${-s * 0.22} Q${s * 0.095},${-s * 0.14} ${s * 0.02},${-s * 0.22} Z`} fill={PALETTE.grey} s={s} />
      </g>
      <line x1={-s * 0.25} x2={-s * 0.25} y1={-s * 0.3} y2={-s * 0.85} stroke={INK} strokeWidth={line(s)} />
      <path d={`M${-s * 0.25},${-s * 0.85} L${s * 0.0},${-s * 0.78 + Math.sin(t * 4) * s * 0.02} L${-s * 0.25},${-s * 0.68} Z`} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.6} />
      <Paint x={-s * 0.15} y={-s * 0.74} text="KM" size={s * 0.08} fill="#fff" />
    </g>
  ),
  // a camel standing in the desert, its head nodding
  camel: ({ s, t }) => { const C = PALETTE.brown; return (
    <g>
      <Shadow w={s * 0.9} s={s} />
      {[-0.28, -0.14, 0.16, 0.3].map((x, i) => <rect key={i} x={s * x} y={-s * 0.42} width={s * 0.06} height={s * 0.42} fill={shade(C, -0.2)} stroke={INK} strokeWidth={line(s) * 0.5} />)}
      <Ball cx={0} cy={-s * 0.5} rx={s * 0.38} ry={s * 0.14} fill={C} s={s} />
      <Ball cx={-s * 0.1} cy={-s * 0.64} rx={s * 0.13} ry={s * 0.12} fill={C} s={s} />
      <Ball cx={s * 0.14} cy={-s * 0.64} rx={s * 0.12} ry={s * 0.11} fill={C} s={s} />
      <g transform={`rotate(${Math.sin(t * 1.6) * 6} ${s * 0.36} ${-s * 0.55})`}>
        <path d={`M${s * 0.34},${-s * 0.55} L${s * 0.46},${-s * 0.85}`} stroke={C} strokeWidth={s * 0.08} strokeLinecap="round" />
        <Ball cx={s * 0.5} cy={-s * 0.88} rx={s * 0.08} ry={s * 0.05} fill={C} s={s} />
      </g>
    </g>
  ); },
  // a cement mixer, its drum turning
  mixer: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.0} s={s} />
      <Box x={-s * 0.45} y={-s * 0.3} w={s * 0.9} h={s * 0.14} fill={PALETTE.dark} s={s} r={0.2} />
      <Box x={s * 0.22} y={-s * 0.55} w={s * 0.24} h={s * 0.28} fill={PALETTE.orange} s={s} r={0.1} />
      <g transform={`rotate(${-15} ${-s * 0.1} ${-s * 0.5})`}>
        <Ball cx={-s * 0.1} cy={-s * 0.5} rx={s * 0.28} ry={s * 0.18} fill={PALETTE.grey} s={s} />
        {[0, 1, 2].map((i) => { const x = ((t * 0.6 + i / 3) % 1 - 0.5) * s * 0.5; return <line key={i} x1={-s * 0.1 + x} x2={-s * 0.1 + x + s * 0.06} y1={-s * 0.64} y2={-s * 0.36} stroke={INK} strokeWidth={line(s) * 0.8} />; })}
      </g>
      {[-0.3, 0.3].map((x, i) => <circle key={i} cx={s * x} cy={-s * 0.08} r={s * 0.08} fill={INK} />)}
    </g>
  ),
};

export default props;
