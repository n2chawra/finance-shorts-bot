/**
 * The things "Taylor Swift's Eras Tour sold $2 billion of tickets" is about, drawn for this video
 * only: a packed stadium at night with light beams, a concert ticket, a tower of ticket stubs (k),
 * a crowd of fans with phone lights, an acoustic guitar, a friendship bracelet, a wall calendar of
 * tour months, a band T-shirt on a hanger, and a stage with a microphone stand under a spotlight.
 */
import React from "react";
import { Ball, Box, INK, line, PALETTE, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const PINK = "#ff7ac6", LILAC = "#b28dff";

const ticketShape = (s: number, fill: string, key?: number | string, dy = 0) => (
  <g key={key} transform={`translate(0,${dy})`}>
    <path d={`M${-s * 0.5},${-s * 0.32} L${s * 0.5},${-s * 0.32} L${s * 0.5},${-s * 0.2} a${s * 0.05},${s * 0.05} 0 0 0 0,${s * 0.1} L${s * 0.5},${0} L${-s * 0.5},${0} L${-s * 0.5},${-s * 0.1} a${s * 0.05},${s * 0.05} 0 0 0 0,${-s * 0.1} Z`}
      fill={fill} stroke={INK} strokeWidth={line(s) * 0.7} />
    <line x1={s * 0.22} y1={-s * 0.3} x2={s * 0.22} y2={-s * 0.02} stroke={INK} strokeWidth={line(s) * 0.4} strokeDasharray={`${s * 0.03} ${s * 0.02}`} />
    <rect x={-s * 0.4} y={-s * 0.24} width={s * 0.5} height={s * 0.05} rx={s * 0.02} fill="#ffffff" opacity={0.8} />
    <rect x={-s * 0.4} y={-s * 0.14} width={s * 0.34} height={s * 0.04} rx={s * 0.02} fill="#ffffff" opacity={0.6} />
  </g>
);

const props: PropSet = {
  // a stadium bowl at night: tiers of seats dotted with phone lights, light beams sweeping
  stadium: ({ s, t }) => {
    const W = s * 1.6;
    return (
      <g>
        <Shadow w={W * 0.7} s={s} />
        {[-0.35, 0, 0.35].map((x, i) => {
          const a = Math.sin(t * 0.9 + i * 1.7) * 18;
          return <path key={i} d={`M${x * W},${-s * 0.5} L${x * W - s * 0.12},${-s * 1.3} L${x * W + s * 0.12},${-s * 1.3} Z`} fill={[PINK, LILAC, "#7fd6ff"][i]} opacity={0.35} transform={`rotate(${a} ${x * W} ${-s * 0.5})`} />;
        })}
        <path d={`M${-W / 2},${-s * 0.62} Q0,${-s * 0.9} ${W / 2},${-s * 0.62} L${W * 0.45},0 L${-W * 0.45},0 Z`} fill="#3a3f63" stroke={INK} strokeWidth={line(s)} />
        {[0.5, 0.36, 0.22].map((y, r) => (
          <path key={y} d={`M${-W * 0.44},${-s * y} Q0,${-s * (y + 0.18)} ${W * 0.44},${-s * y}`} fill="none" stroke={shade("#3a3f63", 0.2)} strokeWidth={s * 0.02} />
        ))}
        {Array.from({ length: 36 }, (_, i) => {
          const x = -W * 0.4 + (i % 12) * W * 0.073, y = -s * (0.48 - Math.floor(i / 12) * 0.14) - Math.cos((x / W) * 3) * s * 0.06;
          return <circle key={i} cx={x} cy={y} r={s * 0.012} fill="#fff7c2" opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 3 + i))} />;
        })}
      </g>
    );
  },
  // one concert ticket, pink, tilting
  ticket: ({ s, t }) => <g transform={`rotate(${-6 + Math.sin(t * 1.6) * 3} 0 ${-s * 0.16})`}><Shadow w={s * 0.8} s={s} />{ticketShape(s, PINK)}</g>,
  // a tower of ticket stubs: k (0..1) how many are stacked
  tickettower: ({ s, k = 1 }) => {
    const n = Math.max(1, Math.round(12 * Math.max(0, Math.min(1, k))));
    const ts = s * 0.5;
    return (
      <g>
        <Shadow w={ts * 1.2} s={s} />
        {Array.from({ length: n }, (_, i) => (
          <g key={i} transform={`rotate(${Math.sin(i * 2.3) * 4})`}>{ticketShape(ts, [PINK, LILAC, "#7fd6ff"][i % 3]!, i, -i * ts * 0.16)}</g>
        ))}
      </g>
    );
  },
  // a crowd of fans: rows of heads with raised phone lights
  crowd: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.4} s={s} />
      {Array.from({ length: 15 }, (_, i) => {
        const row = Math.floor(i / 5), col = i % 5;
        const x = -s * 0.6 + col * s * 0.3 + (row % 2) * s * 0.15, y = -s * (0.15 + row * 0.2);
        const c = [PALETTE.skin, "#c98b62", "#8a5a3b", "#f1c7a0"][i % 4]!;
        return (
          <g key={i}>
            <Box x={x - s * 0.1} y={y} w={s * 0.2} h={s * 0.18} fill={[PINK, LILAC, PALETTE.teal, PALETTE.yellow][i % 4]!} s={s} r={s * 0.06} />
            <Ball cx={x} cy={y - s * 0.04} rx={s * 0.07} fill={c} s={s} />
            {i % 2 === 0 && <rect x={x + s * 0.08} y={y - s * 0.2 - Math.abs(Math.sin(t * 2 + i)) * s * 0.03} width={s * 0.05} height={s * 0.08} rx={s * 0.01} fill="#fff7c2" stroke={INK} strokeWidth={line(s) * 0.3} />}
          </g>
        );
      })}
    </g>
  ),
  // an acoustic guitar standing on its base
  guitar: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 1.4) * 2} 0 0)`}>
      <Shadow w={s * 0.6} s={s} />
      <rect x={-s * 0.035} y={-s * 1.0} width={s * 0.07} height={s * 0.55} fill="#8a5a2b" stroke={INK} strokeWidth={line(s) * 0.5} />
      <rect x={-s * 0.06} y={-s * 1.08} width={s * 0.12} height={s * 0.1} rx={s * 0.02} fill="#5b3a1d" stroke={INK} strokeWidth={line(s) * 0.4} />
      <Ball cx={0} cy={-s * 0.42} rx={s * 0.2} fill="#e8b46a" s={s} />
      <Ball cx={0} cy={-s * 0.18} rx={s * 0.26} fill="#e8b46a" s={s} />
      <circle cx={0} cy={-s * 0.3} r={s * 0.08} fill={INK} />
      <rect x={-s * 0.1} y={-s * 0.12} width={s * 0.2} height={s * 0.04} fill="#5b3a1d" />
    </g>
  ),
  // a friendship bracelet: a ring of coloured beads with letter beads
  bracelet: ({ s, t }) => (
    <g transform={`translate(0,${-s * 0.45}) rotate(${t * 20})`}>
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * s * 0.35} cy={Math.sin(a) * s * 0.35} r={s * 0.07} fill={i % 4 === 0 ? "#ffffff" : [PINK, LILAC, PALETTE.yellow, "#7fd6ff"][i % 4]!} stroke={INK} strokeWidth={line(s) * 0.35} />;
      })}
    </g>
  ),
  // a wall calendar whose pages flip
  tourcal: ({ s, t }) => {
    const f = (t * 0.8) % 1;
    return (
      <g>
        <Shadow w={s * 0.7} s={s} />
        <rect x={-s * 0.35} y={-s * 0.9} width={s * 0.7} height={s * 0.86} rx={s * 0.03} fill="#ffffff" stroke={INK} strokeWidth={line(s)} />
        <rect x={-s * 0.35} y={-s * 0.9} width={s * 0.7} height={s * 0.18} rx={s * 0.03} fill={PINK} stroke={INK} strokeWidth={line(s) * 0.6} />
        {[-0.2, 0.2].map((x) => <rect key={x} x={x * s - s * 0.025} y={-s * 0.97} width={s * 0.05} height={s * 0.13} rx={s * 0.02} fill="#9aa3b5" stroke={INK} strokeWidth={line(s) * 0.3} />)}
        {Array.from({ length: 16 }, (_, i) => <rect key={i} x={-s * 0.29 + (i % 4) * s * 0.15} y={-s * 0.64 + Math.floor(i / 4) * s * 0.14} width={s * 0.11} height={s * 0.1} rx={s * 0.015} fill={i % 5 === 0 ? LILAC : "#e3e7f0"} />)}
        <rect x={-s * 0.35} y={-s * 0.72} width={s * 0.7} height={s * 0.68 * (1 - f)} fill="#f7f8fb" opacity={0.7 * (1 - f)} />
      </g>
    );
  },
  // a band T-shirt on a hanger
  tshirt: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 1.5) * 3} 0 ${-s * 1.0})`}>
      <Shadow w={s * 0.6} s={s} />
      <path d={`M0,${-s * 1.05} L0,${-s * 0.98} M${-s * 0.25},${-s * 0.85} L0,${-s * 0.98} L${s * 0.25},${-s * 0.85}`} fill="none" stroke={INK} strokeWidth={line(s) * 0.6} />
      <Shape d={`M${-s * 0.2},${-s * 0.88} L${-s * 0.45},${-s * 0.72} L${-s * 0.35},${-s * 0.55} L${-s * 0.25},${-s * 0.62} L${-s * 0.25},${-s * 0.05} L${s * 0.25},${-s * 0.05} L${s * 0.25},${-s * 0.62} L${s * 0.35},${-s * 0.55} L${s * 0.45},${-s * 0.72} L${s * 0.2},${-s * 0.88} Q0,${-s * 0.78} ${-s * 0.2},${-s * 0.88} Z`} fill={LILAC} s={s} />
      <circle cx={0} cy={-s * 0.5} r={s * 0.12} fill={PINK} stroke={INK} strokeWidth={line(s) * 0.4} />
    </g>
  ),
  // a round stage with a microphone stand under a spotlight
  stage: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.2} s={s} />
      <path d={`M${-s * 0.15},${-s * 1.2} L${-s * 0.5},${-s * 0.15} L${s * 0.5},${-s * 0.15} L${s * 0.15},${-s * 1.2} Z`} fill="#fff7c2" opacity={0.18 + 0.08 * Math.sin(t * 3)} />
      <ellipse cx={0} cy={-s * 0.12} rx={s * 0.6} ry={s * 0.12} fill={LILAC} stroke={INK} strokeWidth={line(s) * 0.6} />
      <rect x={-s * 0.6} y={-s * 0.12} width={s * 1.2} height={s * 0.12} fill={shade(LILAC, -0.25)} />
      <rect x={-s * 0.015} y={-s * 0.75} width={s * 0.03} height={s * 0.6} fill={INK} />
      <Ball cx={0} cy={-s * 0.8} rx={s * 0.06} ry={s * 0.08} fill="#9aa3b5" s={s} />
    </g>
  ),
};

export default props;
