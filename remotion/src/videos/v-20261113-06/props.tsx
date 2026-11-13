/**
 * The things "590 billionaires are too poor for the Forbes rich list" is about, drawn for this video
 * only: the gold door of the rich list with its velvet rope, a single billionaire in a suit, a crowd
 * of billionaires stuck outside, a gold ladder (state "locked": chained shut), a tower of gold bars
 * (k: how tall; state "full": stacked to the top), a Google-style search bar, a SpaceX-style rocket,
 * a red electric car, and the printed rich list itself.
 */
import React from "react";
import { Ball, Box, INK, line, PALETTE, type PropSet, shade, Shadow, Shape, Paint, bob } from "../../studio/draw";

const GOLD = "#f5c542", GOLD_D = "#c8961c", VELVET = "#b3203a", SUIT = "#2c3550";

const suitPerson = (s: number, x: number, key: number | string, tone = SUIT, skin = "#f2c7a5") => (
  <g key={key} transform={`translate(${x},0)`}>
    <rect x={-s * 0.13} y={-s * 0.62} width={s * 0.26} height={s * 0.46} rx={s * 0.08} fill={tone} stroke={INK} strokeWidth={line(s) * 0.8} />
    <path d={`M${-s * 0.04},${-s * 0.62} L0,${-s * 0.5} L${s * 0.04},${-s * 0.62} Z`} fill="#ffffff" />
    <rect x={-s * 0.015} y={-s * 0.58} width={s * 0.03} height={s * 0.14} fill="#e5484d" />
    <rect x={-s * 0.11} y={-s * 0.17} width={s * 0.08} height={s * 0.17} fill={shade(tone, -0.2)} stroke={INK} strokeWidth={line(s) * 0.6} />
    <rect x={s * 0.03} y={-s * 0.17} width={s * 0.08} height={s * 0.17} fill={shade(tone, -0.2)} stroke={INK} strokeWidth={line(s) * 0.6} />
    <Ball cx={0} cy={-s * 0.75} rx={s * 0.12} fill={skin} s={s} />
    <rect x={-s * 0.1} y={-s * 0.9} width={s * 0.2} height={s * 0.06} rx={s * 0.03} fill="#4a3426" />
  </g>
);

const props: PropSet = {
  // the gold door of the rich list: a tall gilded arch, a FORBES plate, two posts and a velvet rope
  golddoor: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.9} s={s} />
      <path d={`M${-s * 0.3},0 L${-s * 0.3},${-s * 0.7} Q0,${-s * 1.0} ${s * 0.3},${-s * 0.7} L${s * 0.3},0 Z`} fill={GOLD} stroke={INK} strokeWidth={line(s)} />
      <path d={`M${-s * 0.22},0 L${-s * 0.22},${-s * 0.66} Q0,${-s * 0.9} ${s * 0.22},${-s * 0.66} L${s * 0.22},0 Z`} fill="#6b3b12" stroke={INK} strokeWidth={line(s) * 0.7} />
      <line x1={0} y1={-s * 0.82} x2={0} y2={0} stroke={INK} strokeWidth={line(s) * 0.6} />
      <circle cx={-s * 0.05} cy={-s * 0.36} r={s * 0.025} fill={GOLD} stroke={INK} strokeWidth={2} />
      <circle cx={s * 0.05} cy={-s * 0.36} r={s * 0.025} fill={GOLD} stroke={INK} strokeWidth={2} />
      <Box x={-s * 0.2} y={-s * 0.98} w={s * 0.4} h={s * 0.1} fill="#fff7dd" s={s} />
      <Paint x={0} y={-s * 0.905} text="FORBES" size={s * 0.07} />
      {[-0.42, 0.42].map((x) => (
        <g key={x}><rect x={s * x - s * 0.02} y={-s * 0.3} width={s * 0.04} height={s * 0.3} fill={GOLD_D} stroke={INK} strokeWidth={2} />
          <circle cx={s * x} cy={-s * 0.31} r={s * 0.035} fill={GOLD} stroke={INK} strokeWidth={2} /></g>
      ))}
      <path d={`M${-s * 0.42},${-s * 0.28} Q0,${-s * (0.12 + 0.02 * Math.sin(t * 2))} ${s * 0.42},${-s * 0.28}`} fill="none" stroke={VELVET} strokeWidth={s * 0.035} strokeLinecap="round" />
    </g>
  ),
  // a velvet rope on two gold posts
  rope: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.9} s={s} />
      {[-0.4, 0.4].map((x) => <rect key={x} x={s * x - s * 0.03} y={-s * 0.6} width={s * 0.06} height={s * 0.6} fill={GOLD} stroke={INK} strokeWidth={line(s)} />)}
      <path d={`M${-s * 0.4},${-s * 0.55} Q0,${-s * (0.3 + 0.03 * Math.sin(t * 2))} ${s * 0.4},${-s * 0.55}`} fill="none" stroke={VELVET} strokeWidth={s * 0.07} strokeLinecap="round" />
    </g>
  ),
  // one billionaire in a dark suit and red tie
  billionaire: ({ s, t }) => <g transform={`translate(0,${bob(t, s)})`}><Shadow w={s * 0.4} s={s} />{suitPerson(s, 0, "b")}</g>,
  // a crowd of billionaires in suits, waiting outside
  suitcrowd: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.4} s={s} />
      {[-0.5, -0.25, 0, 0.25, 0.5].map((x, i) => (
        <g key={i} transform={`translate(0,${-s * 0.12 * (i % 2) + Math.sin(t * 2 + i) * s * 0.01}) scale(${i % 2 ? 0.85 : 1})`}>
          {suitPerson(s * 0.8, x * s * 1.2, i, [SUIT, "#3b2f4f", "#24414a"][i % 3]!, ["#f2c7a5", "#c99a72", "#8d5b3d"][i % 3]!)}
        </g>
      ))}
    </g>
  ),
  // a tall gold ladder; state "locked" wraps it in a chain with a padlock
  ladder: ({ s, state }) => {
    const rungs = 9;
    return (
      <g>
        <Shadow w={s * 0.5} s={s} />
        <rect x={-s * 0.2} y={-s} width={s * 0.05} height={s} fill={GOLD} stroke={INK} strokeWidth={line(s)} />
        <rect x={s * 0.15} y={-s} width={s * 0.05} height={s} fill={GOLD} stroke={INK} strokeWidth={line(s)} />
        {Array.from({ length: rungs }, (_, i) => (
          <rect key={i} x={-s * 0.16} y={-s * (0.08 + i * 0.105)} width={s * 0.32} height={s * 0.03} fill={GOLD_D} stroke={INK} strokeWidth={line(s) * 0.6} />
        ))}
        {state === "locked" && (
          <g>
            <path d={`M${-s * 0.26},${-s * 0.42} L${s * 0.26},${-s * 0.3} M${-s * 0.26},${-s * 0.3} L${s * 0.26},${-s * 0.42}`} stroke="#8a93a6" strokeWidth={s * 0.035} strokeDasharray={`${s * 0.04} ${s * 0.015}`} />
            <Box x={-s * 0.08} y={-s * 0.4} w={s * 0.16} h={s * 0.13} fill="#8a93a6" s={s} />
            <path d={`M${-s * 0.05},${-s * 0.4} Q0,${-s * 0.5} ${s * 0.05},${-s * 0.4}`} fill="none" stroke={INK} strokeWidth={s * 0.02} />
          </g>
        )}
      </g>
    );
  },
  // a tower of gold bars; k (0..1) how tall, state "full" stacks it to the top
  goldtower: ({ s, k = 1, state }) => {
    const n = Math.max(2, Math.round(14 * (state === "full" ? 1 : Math.max(0.15, Math.min(1, k)))));
    const bh = s / 14;
    return (
      <g>
        <Shadow w={s * 0.7} s={s} />
        {Array.from({ length: n }, (_, i) => (
          <g key={i} transform={`translate(${(i % 2 ? 1 : -1) * s * 0.02},${-i * bh})`}>
            <path d={`M${-s * 0.28},0 L${s * 0.28},0 L${s * 0.22},${-bh} L${-s * 0.22},${-bh} Z`} fill={i % 2 ? GOLD : shade(GOLD, -0.06)} stroke={INK} strokeWidth={line(s) * 0.6} />
            <rect x={-s * 0.16} y={-bh * 0.75} width={s * 0.2} height={bh * 0.18} fill="#fff" opacity={0.35} />
          </g>
        ))}
      </g>
    );
  },
  // a search bar with a coloured logo dot row and a magnifying glass, like Google's home page
  searchbar: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)})`}>
      <Shadow w={s * 1.1} s={s} />
      <Box x={-s * 0.6} y={-s * 0.62} w={s * 1.2} h={s * 0.62} fill="#ffffff" s={s} r={0.08} />
      {["#4285f4", "#ea4335", "#fbbc05", "#4285f4", "#34a853", "#ea4335"].map((c, i) => (
        <circle key={i} cx={-s * 0.3 + i * s * 0.12} cy={-s * 0.45} r={s * 0.045} fill={c} stroke={INK} strokeWidth={2} />
      ))}
      <rect x={-s * 0.5} y={-s * 0.28} width={s * 1.0} height={s * 0.14} rx={s * 0.07} fill="#f1f3f4" stroke={INK} strokeWidth={line(s) * 0.6} />
      <circle cx={-s * 0.4} cy={-s * 0.21} r={s * 0.03} fill="none" stroke={INK} strokeWidth={3} />
      <line x1={-s * 0.38} y1={-s * 0.19} x2={-s * 0.35} y2={-s * 0.16} stroke={INK} strokeWidth={3} />
    </g>
  ),
  // a white rocket with a black nose and a flame, on its pad
  rocket: ({ s, t }) => {
    const f = 0.8 + 0.2 * Math.sin(t * 20);
    return (
      <g>
        <Shadow w={s * 0.5} s={s} />
        <path d={`M${-s * 0.06},${-s * 0.1} Q0,${s * (0.0 + 0.12 * f)} ${s * 0.06},${-s * 0.1} Z`} fill="#ffb347" />
        <rect x={-s * 0.08} y={-s * 0.9} width={s * 0.16} height={s * 0.8} rx={s * 0.03} fill="#f4f6fa" stroke={INK} strokeWidth={line(s)} />
        <path d={`M${-s * 0.08},${-s * 0.9} Q0,${-s * 1.08} ${s * 0.08},${-s * 0.9} Z`} fill="#20242e" stroke={INK} strokeWidth={line(s)} />
        <path d={`M${-s * 0.08},${-s * 0.22} L${-s * 0.17},${-s * 0.1} L${-s * 0.08},${-s * 0.1} Z`} fill="#20242e" stroke={INK} strokeWidth={line(s) * 0.6} />
        <path d={`M${s * 0.08},${-s * 0.22} L${s * 0.17},${-s * 0.1} L${s * 0.08},${-s * 0.1} Z`} fill="#20242e" stroke={INK} strokeWidth={line(s) * 0.6} />
        <rect x={-s * 0.08} y={-s * 0.7} width={s * 0.16} height={s * 0.04} fill="#20242e" />
      </g>
    );
  },
  // a sleek red electric car
  teslacar: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2, 0.006)})`}>
      <Shadow w={s * 1.3} s={s} />
      <path d={`M${-s * 0.65},${-s * 0.12} L${-s * 0.6},${-s * 0.3} Q${-s * 0.2},${-s * 0.34} ${-s * 0.1},${-s * 0.52} L${s * 0.25},${-s * 0.52} Q${s * 0.45},${-s * 0.34} ${s * 0.65},${-s * 0.3} L${s * 0.66},${-s * 0.12} Z`} fill="#d7263d" stroke={INK} strokeWidth={line(s)} />
      <path d={`M${-s * 0.04},${-s * 0.48} L${s * 0.22},${-s * 0.48} L${s * 0.36},${-s * 0.32} L${-s * 0.2},${-s * 0.32} Z`} fill="#9fd3ff" stroke={INK} strokeWidth={line(s) * 0.6} />
      {[-0.38, 0.4].map((x) => <g key={x}><Ball cx={s * x} cy={-s * 0.1} rx={s * 0.12} fill="#20242e" s={s} /><circle cx={s * x} cy={-s * 0.1} r={s * 0.05} fill="#c0c6d4" /></g>)}
    </g>
  ),
  // the printed rich list: a magazine page with rows of names and a gold seal
  forbeslist: ({ s }) => (
    <g>
      <Shadow w={s * 0.7} s={s} />
      <Box x={-s * 0.32} y={-s} w={s * 0.64} h={s} fill="#fffdf6" s={s} r={0.04} />
      <rect x={-s * 0.26} y={-s * 0.93} width={s * 0.52} height={s * 0.1} fill={INK} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={-s * 0.24} y={-s * (0.75 - i * 0.08)} width={s * (0.42 - (i % 3) * 0.06)} height={s * 0.03} rx={s * 0.01} fill={PALETTE.grey} opacity={0.5} />
      ))}
      <Shape d={`M${s * 0.14},${-s * 0.12} m-${s * 0.08},0 a${s * 0.08},${s * 0.08} 0 1,0 ${s * 0.16},0 a${s * 0.08},${s * 0.08} 0 1,0 -${s * 0.16},0`} fill={GOLD} s={s} />
    </g>
  ),
};

export default props;
