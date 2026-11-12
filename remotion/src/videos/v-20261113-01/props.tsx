/**
 * The things "MrBeast made more than the rest of Forbes' top creators" is about, drawn for this video
 * only: a streaming rig (ring light, webcam, gaming chair), a game controller, a talk-show desk with
 * two mugs, a podcast microphone on a boom arm, a film clapperboard, a tall cash tower that grows with
 * k, a pile of cash bundles, the Forbes list on a clipboard, and a red play-button award.
 */
import React from "react";
import { Ball, Box, INK, line, PALETTE, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const CASH = "#7fcf8f";

const bundle = (x: number, y: number, w: number, h: number, s: number, key: string | number) => (
  <g key={key}>
    <rect x={x} y={y} width={w} height={h} rx={s * 0.01} fill={CASH} stroke={INK} strokeWidth={line(s) * 0.5} />
    <rect x={x + w * 0.42} y={y} width={w * 0.16} height={h} fill={PALETTE.cream} stroke={INK} strokeWidth={line(s) * 0.3} />
  </g>
);

const props: PropSet = {
  // a streamer's corner: a glowing ring light on a stand, a webcam on a monitor, a red gaming chair
  streamrig: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.1} s={s} />
      <rect x={-s * 0.5} y={-s * 0.95} width={s * 0.03} height={s * 0.95} fill={INK} />
      <circle cx={-s * 0.485} cy={-s * 0.95} r={s * 0.17} fill="none" stroke="#fff6d8" strokeWidth={s * 0.05} opacity={0.8 + 0.2 * Math.sin(t * 3)} />
      <circle cx={-s * 0.485} cy={-s * 0.95} r={s * 0.17} fill="none" stroke={INK} strokeWidth={line(s) * 0.4} />
      <Box x={-s * 0.25} y={-s * 0.78} w={s * 0.6} h={s * 0.38} fill="#2b2f3a" s={s} r={s * 0.03} />
      <rect x={-s * 0.21} y={-s * 0.74} width={s * 0.52} height={s * 0.3} rx={s * 0.02} fill={PALETTE.purple} opacity={0.7 + 0.2 * Math.sin(t * 2)} />
      <circle cx={s * 0.05} cy={-s * 0.82} r={s * 0.04} fill={INK} />
      <circle cx={s * 0.05} cy={-s * 0.82} r={s * 0.015} fill={PALETTE.red} opacity={0.5 + 0.5 * Math.sin(t * 6)} />
      <rect x={s * 0.03} y={-s * 0.4} width={s * 0.04} height={s * 0.12} fill={INK} />
      <Box x={s * 0.2} y={-s * 0.62} w={s * 0.3} h={s * 0.42} fill={PALETTE.red} s={s} r={s * 0.06} />
      <Box x={s * 0.15} y={-s * 0.24} w={s * 0.4} h={s * 0.1} fill={shade(PALETTE.red, -0.2)} s={s} r={s * 0.03} />
      <rect x={s * 0.33} y={-s * 0.14} width={s * 0.04} height={s * 0.14} fill={INK} />
    </g>
  ),
  // a game controller: two grips, a d-pad and four coloured buttons
  gamepad: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 2.2) * 4} 0 ${-s * 0.4})`}>
      <Shadow w={s * 0.9} s={s} />
      <Shape d={`M${-s * 0.45},${-s * 0.6} Q0,${-s * 0.72} ${s * 0.45},${-s * 0.6} Q${s * 0.6},${-s * 0.3} ${s * 0.42},${-s * 0.12} Q${s * 0.3},${-s * 0.05} ${s * 0.2},${-s * 0.3} L${-s * 0.2},${-s * 0.3} Q${-s * 0.3},${-s * 0.05} ${-s * 0.42},${-s * 0.12} Q${-s * 0.6},${-s * 0.3} ${-s * 0.45},${-s * 0.6} Z`} fill="#3a3f4f" s={s} />
      <rect x={-s * 0.32} y={-s * 0.52} width={s * 0.06} height={s * 0.18} fill="#cfd5e2" />
      <rect x={-s * 0.38} y={-s * 0.46} width={s * 0.18} height={s * 0.06} fill="#cfd5e2" />
      {[[0.28, -0.52, PALETTE.yellow], [0.36, -0.44, PALETTE.red], [0.28, -0.36, PALETTE.green], [0.2, -0.44, PALETTE.blue]].map(([x, y, c], i) => (
        <circle key={i} cx={(x as number) * s} cy={(y as number) * s} r={s * 0.035} fill={c as string} stroke={INK} strokeWidth={line(s) * 0.3} />
      ))}
    </g>
  ),
  // a talk-show desk: a wooden counter with two coffee mugs and a backdrop of light bulbs
  talkdesk: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.2} s={s} />
      {Array.from({ length: 7 }, (_, i) => (
        <circle key={i} cx={-s * 0.5 + i * s * (1 / 6)} cy={-s * 0.9} r={s * 0.035} fill={PALETTE.yellow} opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 2 + i))} stroke={INK} strokeWidth={line(s) * 0.25} />
      ))}
      <Box x={-s * 0.6} y={-s * 0.5} w={s * 1.2} h={s * 0.5} fill="#b7773e" s={s} r={s * 0.03} />
      <rect x={-s * 0.6} y={-s * 0.5} width={s * 1.2} height={s * 0.08} fill={shade("#b7773e", 0.25)} stroke={INK} strokeWidth={line(s) * 0.5} />
      <Box x={-s * 0.4} y={-s * 0.66} w={s * 0.14} h={s * 0.16} fill={PALETTE.teal} s={s} r={s * 0.02} />
      <Box x={s * 0.26} y={-s * 0.66} w={s * 0.14} h={s * 0.16} fill={PALETTE.orange} s={s} r={s * 0.02} />
      {[0, 1].map((i) => <path key={i} d={`M${(i ? 0.33 : -0.33) * s},${-s * 0.7} q${s * 0.03},${-s * 0.06} 0,${-s * 0.12}`} fill="none" stroke="#fff" strokeWidth={s * 0.015} opacity={0.6 + 0.3 * Math.sin(t * 3 + i)} />)}
    </g>
  ),
  // a podcast microphone on a boom arm with a pop filter
  podmic: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.6} s={s} />
      <rect x={-s * 0.2} y={-s * 0.06} width={s * 0.4} height={s * 0.06} rx={s * 0.03} fill={INK} />
      <path d={`M0,${-s * 0.06} L${-s * 0.1},${-s * 0.5} L${s * 0.05},${-s * 0.75}`} fill="none" stroke={INK} strokeWidth={s * 0.03} />
      <Box x={-s * 0.02} y={-s * 1.0} w={s * 0.18} h={s * 0.32} fill="#2b2f3a" s={s} r={s * 0.09} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={s * 0.0} y={-s * (0.94 - i * 0.06)} width={s * 0.14} height={s * 0.015} fill="#6b7386" />)}
      <circle cx={-s * 0.18} cy={-s * 0.84} r={s * 0.12} fill="#d9dde6" opacity={0.6} stroke={INK} strokeWidth={line(s) * 0.4} />
      <circle cx={s * 0.07} cy={-s * 1.05} r={s * 0.02} fill={PALETTE.red} opacity={0.5 + 0.5 * Math.sin(t * 5)} />
    </g>
  ),
  // a film clapperboard whose striped top claps open and shut
  clapper: ({ s, t }) => {
    const a = -12 - 12 * Math.abs(Math.sin(t * 2.5));
    return (
      <g>
        <Shadow w={s * 0.8} s={s} />
        <Box x={-s * 0.4} y={-s * 0.6} w={s * 0.8} h={s * 0.6} fill="#2b2f3a" s={s} r={s * 0.02} />
        {[0.42, 0.3, 0.18].map((y) => <rect key={y} x={-s * 0.32} y={-s * y} width={s * 0.64} height={s * 0.02} fill="#e8ecf3" />)}
        <g transform={`rotate(${a} ${-s * 0.4} ${-s * 0.6})`}>
          <rect x={-s * 0.4} y={-s * 0.74} width={s * 0.8} height={s * 0.14} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.6} />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M${-s * 0.36 + i * s * 0.2},${-s * 0.74} l${s * 0.1},0 l${-s * 0.06},${s * 0.14} l${-s * 0.1},0 Z`} fill={INK} />)}
        </g>
      </g>
    );
  },
  // a tall tower of cash bundles: k (0..1) is how much of it has stacked up
  cashtower: ({ s, t, k = 1 }) => {
    const n = Math.max(1, Math.round(14 * Math.max(0, Math.min(1, k))));
    const bw = s * 0.42, bh = s * 0.068;
    return (
      <g>
        <Shadow w={bw * 1.4} s={s} />
        {Array.from({ length: n }, (_, i) => bundle(-bw / 2 + Math.sin(i * 1.7) * s * 0.012, -(i + 1) * bh, bw, bh, s, i))}
        {k >= 0.99 && <circle cx={0} cy={-n * bh - s * 0.04} r={s * 0.03} fill={PALETTE.gold} opacity={0.6 + 0.4 * Math.sin(t * 4)} />}
      </g>
    );
  },
  // a messy pile of cash bundles, wider than tall
  cashpile: ({ s, t }) => {
    const bw = s * 0.32, bh = s * 0.09;
    const rows = [[-0.48, -0.16, 0.16], [-0.32, 0], [-0.16]];
    return (
      <g transform={`translate(0,${Math.sin(t * 2) * s * 0.005})`}>
        <Shadow w={s * 1.1} s={s} />
        {rows.map((r, j) => r.map((x, i) => bundle(x * s, -(j + 1) * bh, bw, bh, s, `${j}-${i}`)))}
      </g>
    );
  },
  // the Forbes creators list: a clipboard with rows of names, the top row gold
  creatorlist: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.7} s={s} />
      <Box x={-s * 0.33} y={-s * 1.0} w={s * 0.66} h={s * 0.98} fill="#b7773e" s={s} r={s * 0.03} />
      <rect x={-s * 0.28} y={-s * 0.92} width={s * 0.56} height={s * 0.86} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.4} />
      <rect x={-s * 0.1} y={-s * 1.04} width={s * 0.2} height={s * 0.08} rx={s * 0.02} fill="#9aa3b5" stroke={INK} strokeWidth={line(s) * 0.4} />
      <text x={0} y={-s * 0.8} textAnchor="middle" fontSize={s * 0.09} fontWeight={900} fill={INK}>FORBES</text>
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x={-s * 0.22} y={-s * (0.72 - i * 0.09)} width={s * (i === 0 ? 0.44 : 0.36 - (i % 3) * 0.05)} height={s * 0.05} rx={s * 0.02}
          fill={i === 0 ? PALETTE.gold : "#c9ced8"} opacity={i === 0 ? 0.8 + 0.2 * Math.sin(t * 4) : 1} />
      ))}
    </g>
  ),
  // a red play-button award plaque on a stand
  playaward: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 1.5) * 2})`}>
      <Shadow w={s * 0.7} s={s} />
      <rect x={-s * 0.08} y={-s * 0.2} width={s * 0.16} height={s * 0.2} fill="#9aa3b5" stroke={INK} strokeWidth={line(s) * 0.5} />
      <Box x={-s * 0.36} y={-s * 0.95} w={s * 0.72} h={s * 0.75} fill="#e8c34a" s={s} r={s * 0.04} />
      <rect x={-s * 0.24} y={-s * 0.78} width={s * 0.48} height={s * 0.34} rx={s * 0.09} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.5} />
      <path d={`M${-s * 0.06},${-s * 0.7} L${s * 0.09},${-s * 0.61} L${-s * 0.06},${-s * 0.52} Z`} fill="#fff" />
      <Ball cx={s * 0.22} cy={-s * 0.88} rx={s * 0.03} fill="#fff8d6" s={s} />
    </g>
  ),
};

export default props;
