/**
 * The things "How the casino wins even on your lucky night" is about, drawn for this video only:
 * the roulette wheel with its green zeros, a pile of chips, the croupier's rake, a clock for the
 * hour, a moon for the night, a slot machine, the casino's neon front, the house's slice (a pie
 * with one wedge cut out), a trophy for a lucky win and a free cocktail.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a roulette wheel seen from above at an angle: k (0..1) is how fast it spins; state "zero" lights the green pockets
  wheel: ({ s, t, k = 0.3, state }) => {
    const n = 19, spin = t * (0.4 + k * 6);
    return (
      <g>
        <Shadow w={s * 1.6} s={s} />
        <g transform={`translate(0,${-s * 0.4}) scale(1,0.55)`}>
          <circle r={s * 0.78} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 1.6} />
          {Array.from({ length: n }, (_, i) => {
            const a0 = spin + (i / n) * Math.PI * 2, a1 = spin + ((i + 1) / n) * Math.PI * 2;
            const zero = i === 0 || i === 10;
            const fill = zero ? (state === "zero" ? PALETTE.mint : PALETTE.green) : i % 2 ? PALETTE.red : PALETTE.dark;
            return <path key={i} d={`M0,0 L${Math.cos(a0) * s * 0.66},${Math.sin(a0) * s * 0.66} A${s * 0.66},${s * 0.66} 0 0 1 ${Math.cos(a1) * s * 0.66},${Math.sin(a1) * s * 0.66} Z`} fill={fill} stroke={PALETTE.gold} strokeWidth={line(s) * 0.4} />;
          })}
          <circle r={s * 0.28} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s)} />
          <circle r={s * 0.06} fill={PALETTE.cream} cx={Math.cos(-spin * 1.7) * s * 0.58} cy={Math.sin(-spin * 1.7) * s * 0.58} stroke={INK} strokeWidth={line(s) * 0.5} />
        </g>
      </g>
    );
  },
  // a pile of casino chips in three colours
  chips: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s)})`}>
      <Shadow w={s * 1.1} s={s} />
      {[[-0.3, PALETTE.red, 5], [0.05, PALETTE.blue, 7], [0.36, PALETTE.green, 4]].map(([x, c, n]) => (
        Array.from({ length: n as number }, (_, i) => (
          <g key={`${x}${i}`}>
            <ellipse cx={s * (x as number)} cy={-s * (0.06 + i * 0.09)} rx={s * 0.17} ry={s * 0.06} fill={shade(c as string, -0.25)} stroke={INK} strokeWidth={line(s) * 0.5} />
            <ellipse cx={s * (x as number)} cy={-s * (0.09 + i * 0.09)} rx={s * 0.17} ry={s * 0.06} fill={c as string} stroke={INK} strokeWidth={line(s) * 0.5} strokeDasharray={`${s * 0.04} ${s * 0.04}`} />
          </g>
        ))
      ))}
    </g>
  ),
  // the croupier's rake, pulling chips in
  rake: ({ s, t }) => (
    <g transform={`rotate(${-20 + Math.sin(t * 3) * 8})`}>
      <line x1={0} y1={0} x2={0} y2={-s} stroke={PALETTE.brown} strokeWidth={s * 0.05} strokeLinecap="round" />
      <Box x={-s * 0.25} y={-s * 1.04} w={s * 0.5} h={s * 0.08} fill={PALETTE.tan} s={s} r={0.3} />
    </g>
  ),
  // a wall clock, the minute hand racing: k (0..1) speeds it
  clock: ({ s, t, k = 0.2 }) => (
    <g>
      <Ball cx={0} cy={-s * 0.5} rx={s * 0.45} fill={PALETTE.cream} s={s} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={Math.cos(i * Math.PI / 6) * s * 0.36} y1={-s * 0.5 + Math.sin(i * Math.PI / 6) * s * 0.36} x2={Math.cos(i * Math.PI / 6) * s * 0.41} y2={-s * 0.5 + Math.sin(i * Math.PI / 6) * s * 0.41} stroke={INK} strokeWidth={line(s) * 0.6} />)}
      <line x1={0} y1={-s * 0.5} x2={Math.sin(t * (0.5 + k * 12)) * s * 0.32} y2={-s * 0.5 - Math.cos(t * (0.5 + k * 12)) * s * 0.32} stroke={INK} strokeWidth={line(s)} strokeLinecap="round" />
      <line x1={0} y1={-s * 0.5} x2={Math.sin(t * (0.05 + k)) * s * 0.2} y2={-s * 0.5 - Math.cos(t * (0.05 + k)) * s * 0.2} stroke={PALETTE.red} strokeWidth={line(s) * 1.4} strokeLinecap="round" />
    </g>
  ),
  // a full yellow moon with craters and a twinkle
  moon: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1, 0.03)})`}>
      <Ball cx={0} cy={-s * 0.5} rx={s * 0.42} fill={PALETTE.yellow} s={s} />
      <circle cx={-s * 0.12} cy={-s * 0.42} r={s * 0.08} fill={shade(PALETTE.yellow, -0.15)} />
      <circle cx={s * 0.14} cy={-s * 0.6} r={s * 0.05} fill={shade(PALETTE.yellow, -0.15)} />
      <circle cx={s * 0.42} cy={-s * 0.92} r={s * (0.03 + 0.02 * Math.abs(Math.sin(t * 4)))} fill="#fff" />
    </g>
  ),
  // a slot machine, its reels rolling
  slots: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.8} s={s} />
      <Box x={-s * 0.35} y={-s * 1.0} w={s * 0.7} h={s * 1.0} fill={PALETTE.purple} s={s} r={0.08} />
      <rect x={-s * 0.27} y={-s * 0.78} width={s * 0.54} height={s * 0.26} rx={s * 0.03} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.7} />
      {[-0.18, 0, 0.18].map((x, i) => <circle key={x} cx={s * x} cy={-s * 0.65 + ((t * 3 + i * 0.3) % 1 - 0.5) * s * 0.12} r={s * 0.06} fill={[PALETTE.red, PALETTE.gold, PALETTE.green][i]} />)}
      <line x1={s * 0.38} y1={-s * 0.6} x2={s * 0.5} y2={-s * 0.85} stroke={INK} strokeWidth={s * 0.04} />
      <Ball cx={s * 0.5} cy={-s * 0.88} rx={s * 0.06} fill={PALETTE.red} s={s} />
    </g>
  ),
  // the casino front: neon sign, lights chasing round it
  casino: ({ s, t }) => (
    <g>
      <Box x={-s * 0.9} y={-s * 0.7} w={s * 1.8} h={s * 0.7} fill={PALETTE.dark} s={s} r={0.03} sheen={false} />
      <Shape d={`M${-s * 0.6},${-s * 0.7} L${-s * 0.6},${-s * 1.0} L${s * 0.6},${-s * 1.0} L${s * 0.6},${-s * 0.7} Z`} fill={PALETTE.navy} s={s} />
      <Paint x={0} y={-s * 0.8} text="CASINO" size={s * 0.16} fill={PALETTE.pink} />
      {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={-s * 0.56 + i * s * 0.086} cy={-s * 0.98} r={s * 0.018} fill={(Math.floor(t * 8) + i) % 3 ? PALETTE.yellow : "#7a5a10"} />)}
      <rect x={-s * 0.18} y={-s * 0.4} width={s * 0.36} height={s * 0.4} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.6} />
    </g>
  ),
  // the house's slice: a pie of every bet with one wedge pulled out in gold
  edge: ({ s, t }) => {
    const out = s * (0.08 + 0.03 * Math.sin(t * 3));
    return (
      <g transform={`translate(0,${-s * 0.5})`}>
        <path d={`M0,0 L${s * 0.45},0 A${s * 0.45},${s * 0.45} 0 1 1 ${Math.cos(-0.4) * s * 0.45},${Math.sin(-0.4) * s * 0.45} Z`} fill={PALETTE.green} stroke={INK} strokeWidth={line(s)} />
        <g transform={`translate(${Math.cos(-0.2) * out},${Math.sin(-0.2) * out})`}>
          <path d={`M0,0 L${Math.cos(-0.4) * s * 0.45},${Math.sin(-0.4) * s * 0.45} A${s * 0.45},${s * 0.45} 0 0 1 ${s * 0.45},0 Z`} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s)} />
        </g>
      </g>
    );
  },
  // a little gold trophy for a lucky night
  trophy: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2.5, 0.03)})`}>
      <Shadow w={s * 0.6} s={s} />
      <Box x={-s * 0.22} y={-s * 0.14} w={s * 0.44} h={s * 0.14} fill={PALETTE.brown} s={s} r={0.2} />
      <rect x={-s * 0.05} y={-s * 0.36} width={s * 0.1} height={s * 0.22} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.6} />
      <Shape d={`M${-s * 0.3},${-s * 0.95} L${s * 0.3},${-s * 0.95} Q${s * 0.28},${-s * 0.4} 0,${-s * 0.36} Q${-s * 0.28},${-s * 0.4} ${-s * 0.3},${-s * 0.95} Z`} fill={PALETTE.gold} s={s} />
      <path d={`M${-s * 0.3},${-s * 0.85} q${-s * 0.18},${s * 0.05} ${-s * 0.02},${s * 0.25} M${s * 0.3},${-s * 0.85} q${s * 0.18},${s * 0.05} ${s * 0.02},${s * 0.25}`} fill="none" stroke={INK} strokeWidth={line(s)} />
    </g>
  ),
  // a free cocktail: the casino's thank-you, with a cherry
  cocktail: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 2) * 4})`}>
      <Shadow w={s * 0.5} s={s} />
      <line x1={0} y1={-s * 0.02} x2={0} y2={-s * 0.45} stroke={INK} strokeWidth={line(s)} />
      <rect x={-s * 0.16} y={-s * 0.04} width={s * 0.32} height={s * 0.04} fill={INK} />
      <Shape d={`M${-s * 0.32},${-s * 0.9} L${s * 0.32},${-s * 0.9} L0,${-s * 0.45} Z`} fill={PALETTE.pink} s={s} opacity={0.9} />
      <Ball cx={s * 0.12} cy={-s * 0.92} rx={s * 0.06} fill={PALETTE.red} s={s} />
    </g>
  ),
};

export default props;
