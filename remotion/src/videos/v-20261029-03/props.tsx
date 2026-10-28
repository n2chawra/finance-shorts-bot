/**
 * The things "5 money levels: which one are you on?" is about, drawn for this video only: a
 * five-rung ladder that lights rung by rung, an empty tip jar (level one, broke), a rain cloud and
 * the umbrella that keeps it off (level two, a buffer), a credit card and the scissors that cut it
 * (level three, no debt), a sprout that grows into a tree of notes (level four, investing), a pile
 * of bills that money pays and a beach chair (level five).
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a wooden ladder with five rungs; k (0..1) lights the rungs from the bottom
  ladder: ({ s, t, k = 0 }) => {
    const lit = Math.round(k * 5);
    return (
      <g>
        <Shadow w={s * 0.6} s={s} />
        {[-0.22, 0.22].map((x) => <rect key={x} x={s * x - s * 0.03} y={-s} width={s * 0.06} height={s} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.6} />)}
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={-s * 0.2} y={-s * (0.14 + i * 0.19)} width={s * 0.4} height={s * 0.05} rx={s * 0.02}
            fill={i < lit ? PALETTE.yellow : shade(PALETTE.brown, 0.2)} stroke={INK} strokeWidth={line(s) * 0.5} opacity={i < lit ? 0.8 + 0.2 * Math.sin(t * 4 + i) : 1} />
        ))}
      </g>
    );
  },
  // an empty glass tip jar with a single fly buzzing round it
  tipjar: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.7} s={s} />
      <path d={`M${-s * 0.28},${-s * 0.72} L${-s * 0.3},${-s * 0.06} Q${-s * 0.3},0 ${-s * 0.24},0 L${s * 0.24},0 Q${s * 0.3},0 ${s * 0.3},${-s * 0.06} L${s * 0.28},${-s * 0.72} Z`}
        fill="#d8f0ff" opacity={0.6} stroke={INK} strokeWidth={line(s)} />
      <rect x={-s * 0.32} y={-s * 0.8} width={s * 0.64} height={s * 0.1} rx={s * 0.03} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.6} />
      <Paint x={0} y={-s * 0.36} text="EMPTY" size={s * 0.12} fill={PALETTE.red} />
      <circle cx={Math.cos(t * 3) * s * 0.4} cy={-s * 0.9 + Math.sin(t * 6) * s * 0.08} r={s * 0.025} fill={INK} />
    </g>
  ),
  // a grey rain cloud, raindrops falling
  raincloud: ({ s, t }) => (
    <g transform={`translate(${Math.sin(t) * s * 0.03},0)`}>
      {[0, 1, 2, 3, 4].map((i) => { const f = (t * 1.5 + i / 5) % 1; return <line key={i} x1={s * (-0.3 + i * 0.15)} y1={-s * 0.55 + f * s * 0.5} x2={s * (-0.32 + i * 0.15)} y2={-s * 0.47 + f * s * 0.5} stroke={PALETTE.blue} strokeWidth={line(s)} strokeLinecap="round" opacity={1 - f} />; })}
      <Ball cx={-s * 0.2} cy={-s * 0.7} rx={s * 0.22} fill={PALETTE.grey} s={s} />
      <Ball cx={s * 0.15} cy={-s * 0.75} rx={s * 0.27} fill={PALETTE.grey} s={s} />
      <Ball cx={s * 0.0} cy={-s * 0.62} rx={s * 0.3} ry={s * 0.16} fill={shade(PALETTE.grey, -0.1)} s={s} />
    </g>
  ),
  // an open umbrella, gently swaying
  umbrella: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 1.5) * 4},0,0)`}>
      <Shadow w={s * 0.5} s={s} />
      <path d={`M0,${-s * 0.6} L0,${-s * 0.08} Q0,0 ${s * 0.08},0`} stroke={INK} strokeWidth={s * 0.035} fill="none" strokeLinecap="round" />
      <Shape d={`M${-s * 0.5},${-s * 0.6} Q0,${-s * 1.1} ${s * 0.5},${-s * 0.6} Q${s * 0.33},${-s * 0.66} ${s * 0.17},${-s * 0.6} Q0,${-s * 0.66} ${-s * 0.17},${-s * 0.6} Q${-s * 0.33},${-s * 0.66} ${-s * 0.5},${-s * 0.6} Z`} fill={PALETTE.teal} s={s} />
      <Paint x={0} y={-s * 0.72} text="BUFFER" size={s * 0.09} fill="#fff" />
    </g>
  ),
  // a credit card; state "cut" splits it in two halves drifting apart
  creditcard: ({ s, t, state }) => {
    const cut = state === "cut";
    const half = (side: number) => (
      <g transform={cut ? `translate(${side * s * 0.12},${s * 0.04 * Math.sin(t * 2 + side)}) rotate(${side * 10})` : undefined}>
        <g clipPath={undefined}>
          <rect x={side < 0 ? -s * 0.5 : 0} y={-s * 0.62} width={s * 0.5} height={s * 0.6} rx={s * 0.05} fill={PALETTE.purple} stroke={INK} strokeWidth={line(s)} />
          {side < 0 && <rect x={-s * 0.38} y={-s * 0.46} width={s * 0.16} height={s * 0.12} rx={s * 0.02} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.5} />}
          <rect x={side < 0 ? -s * 0.5 : 0} y={-s * 0.24} width={s * 0.5} height={s * 0.05} fill={shade(PALETTE.purple, -0.3)} />
        </g>
      </g>
    );
    return (
      <g transform={`translate(0,${bob(t, s)})`}>
        <Shadow w={s} s={s} />
        {half(-1)}{half(1)}
        {!cut && <Paint x={s * 0.2} y={-s * 0.08} text="CARD" size={s * 0.09} fill="#fff" />}
      </g>
    );
  },
  // big red scissors snipping
  scissors: ({ s, t }) => {
    const open = 12 + Math.abs(Math.sin(t * 5)) * 18;
    return (
      <g transform={`translate(0,${-s * 0.5})`}>
        {[1, -1].map((d) => (
          <g key={d} transform={`rotate(${d * open})`}>
            <path d={`M0,0 L${s * 0.55},${d * -s * 0.04}`} stroke={PALETTE.grey} strokeWidth={s * 0.06} strokeLinecap="round" />
            <circle cx={-s * 0.18} cy={d * s * 0.06} r={s * 0.1} fill="none" stroke={PALETTE.red} strokeWidth={s * 0.05} />
          </g>
        ))}
        <circle r={s * 0.03} fill={INK} />
      </g>
    );
  },
  // a sprout in a pot that grows into a small tree with notes for leaves: k is how grown
  sprout: ({ s, t, k = 0.2 }) => {
    const hgt = s * (0.2 + 0.6 * k), crown = s * (0.08 + 0.25 * k);
    return (
      <g>
        <Shadow w={s * 0.6} s={s} />
        <Shape d={`M${-s * 0.2},${-s * 0.22} L${s * 0.2},${-s * 0.22} L${s * 0.15},0 L${-s * 0.15},0 Z`} fill={PALETTE.orange} s={s} />
        <rect x={-s * 0.02} y={-s * 0.22 - hgt} width={s * 0.04} height={hgt} fill={PALETTE.green} stroke={INK} strokeWidth={line(s) * 0.4} />
        <Ball cx={0} cy={-s * 0.22 - hgt} rx={crown} fill={PALETTE.green} s={s} />
        {Array.from({ length: Math.round(1 + k * 6) }, (_, i) => {
          const a = i * 2.3 + t * 0.6;
          return <rect key={i} x={Math.cos(a) * crown * 0.6 - s * 0.04} y={-s * 0.22 - hgt + Math.sin(a) * crown * 0.5 - s * 0.02} width={s * 0.08} height={s * 0.04} rx={s * 0.01} fill="#9dc79f" stroke={INK} strokeWidth={line(s) * 0.3} />;
        })}
      </g>
    );
  },
  // a pile of bills, each stamped PAID as they flip
  billpile: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.8} s={s} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${(i % 2 ? 1 : -1) * s * 0.05},${-i * s * 0.12}) rotate(${(i % 2 ? 4 : -5) + Math.sin(t * 2 + i) * 2})`}>
          <Box x={-s * 0.35} y={-s * 0.14} w={s * 0.7} h={s * 0.12} fill="#fff" s={s} r={0.1} sheen={false} />
          <Paint x={0} y={-s * 0.05} text="PAID" size={s * 0.08} fill={PALETTE.green} />
        </g>
      ))}
    </g>
  ),
  // a striped beach chair under a little sun
  beachchair: ({ s, t }) => (
    <g>
      <Shadow w={s} s={s} />
      <circle cx={s * 0.4} cy={-s * 0.9} r={s * (0.1 + 0.01 * Math.sin(t * 3))} fill={PALETTE.yellow} stroke={INK} strokeWidth={line(s) * 0.5} />
      <line x1={-s * 0.35} y1={0} x2={s * 0.15} y2={-s * 0.6} stroke={PALETTE.brown} strokeWidth={s * 0.04} />
      <line x1={s * 0.3} y1={0} x2={-s * 0.1} y2={-s * 0.3} stroke={PALETTE.brown} strokeWidth={s * 0.04} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${-s * (0.2 - i * 0.08)},${-s * (0.25 + i * 0.09)} L${s * (0.25 + i * 0.03)},${-s * (0.25 + i * 0.09) + s * 0.02}`} stroke={i % 2 ? "#fff" : PALETTE.red} strokeWidth={s * 0.08} />)}
    </g>
  ),
};

export default props;
