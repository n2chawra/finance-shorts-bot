/**
 * The things "The 6 levels of money in India" is about, one per level: the pay envelope that's
 * gone by the 25th, the cushion, the broken chain of debt, money with a job, the crore, the money
 * tree that does the work.
 */
import React from "react";
import { Ball, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  envelope: ({ s }) => (
    <g>
      <Shadow w={s * 0.8} s={s} />
      <Box x={-s * 0.42} y={-s * 0.62} w={s * 0.84} h={s * 0.56} fill={PALETTE.cream} s={s} r={0.06} />
      <path d={`M${-s * 0.42},${-s * 0.62} L0,${-s * 0.3} L${s * 0.42},${-s * 0.62}`} fill="none" stroke={INK} strokeWidth={line(s)} />
      <Paint x={0} y={-s * 0.12} text="SALARY" size={s * 0.1} />
    </g>
  ),
  cushion: ({ s }) => (
    <g>
      <Shadow w={s * 0.9} s={s} />
      <Shape d={`M${-s * 0.5},${-s * 0.1} Q${-s * 0.55},${-s * 0.5} ${-s * 0.3},${-s * 0.52} Q0,${-s * 0.6} ${s * 0.3},${-s * 0.52} Q${s * 0.55},${-s * 0.5} ${s * 0.5},${-s * 0.1} Q0,${-s * 0.02} ${-s * 0.5},${-s * 0.1} Z`} fill={PALETTE.purple} s={s} />
      <Ball cx={0} cy={-s * 0.62} rx={s * 0.12} fill={PALETTE.gold} s={s} />
    </g>
  ),
  chain: ({ s }) => (
    <g>
      <Shadow w={s * 0.8} s={s} />
      {[0, 1].map((i) => <ellipse key={i} cx={-s * 0.24 + i * s * 0.1} cy={-s * 0.4 - i * s * 0.08} rx={s * 0.16} ry={s * 0.1} fill="none" stroke={PALETTE.grey} strokeWidth={line(s) * 2} transform={`rotate(-30)`} />)}
      {[0, 1].map((i) => <ellipse key={`r${i}`} cx={s * 0.24 + i * s * 0.1} cy={-s * 0.5 - i * s * 0.08} rx={s * 0.16} ry={s * 0.1} fill="none" stroke={PALETTE.grey} strokeWidth={line(s) * 2} transform={`rotate(25)`} />)}
      <Paint x={0} y={-s * 0.82} text="FREE" size={s * 0.16} fill={PALETTE.green} />
    </g>
  ),
  job: ({ s }) => (
    <g>
      <Shadow w={s * 0.8} s={s} />
      <Box x={-s * 0.42} y={-s * 0.6} w={s * 0.84} h={s * 0.52} fill={PALETTE.brown} s={s} r={0.1} />
      <rect x={-s * 0.14} y={-s * 0.72} width={s * 0.28} height={s * 0.14} rx={s * 0.05} fill="none" stroke={INK} strokeWidth={line(s)} />
      <Ball cx={0} cy={-s * 0.36} rx={s * 0.12} fill={PALETTE.gold} s={s} />
    </g>
  ),
  crore: ({ s }) => (
    <g>
      <Shadow w={s} s={s} />
      {[0, 1, 2, 3, 4].map((i) => <Box key={i} x={-s * 0.44} y={-s * 0.18 - i * s * 0.16} w={s * 0.88} h={s * 0.16} fill={i % 2 ? PALETTE.green : shade(PALETTE.green, 0.25)} s={s} r={0.2} sheen={false} />)}
      <Paint x={0} y={-s * 0.88} text="CRORE" size={s * 0.14} fill={PALETTE.gold} />
    </g>
  ),
  tree: ({ s }) => (
    <g>
      <Shadow w={s * 0.8} s={s} />
      <rect x={-s * 0.06} y={-s * 0.45} width={s * 0.12} height={s * 0.45} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s)} />
      <Ball cx={0} cy={-s * 0.68} rx={s * 0.38} ry={s * 0.3} fill={PALETTE.green} s={s} />
      {[[-0.18, -0.72], [0.12, -0.82], [0.2, -0.6], [-0.06, -0.55]].map(([x, y], i) => <Ball key={i} cx={s * x!} cy={s * y!} rx={s * 0.06} fill={PALETTE.gold} s={s} />)}
    </g>
  ),
};

export default props;
