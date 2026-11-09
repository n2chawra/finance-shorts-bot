/**
 * The things "the videos lose, the chocolate pays" is about, drawn for this video only: a film
 * camera on a tripod with a red REC light, a leaking money bag ("drain"), a question-mark mystery
 * box, a chocolate bar in a bright wrapper with a bite, a store shelf stacked with bars, a cash
 * till with an open drawer, a piggy bank, a gold trophy, a megaphone shouting AD, and a video
 * screen with a play button and a view counter bar.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const bar = (s: number, x: number, y: number, r = 0) => (
  <g transform={`translate(${x},${y}) rotate(${r})`}>
    <rect x={-s * 0.5} y={-s * 0.18} width={s} height={s * 0.36} rx={s * 0.04} fill="#3b82f6" stroke={INK} strokeWidth={line(s) * 0.8} />
    <rect x={-s * 0.5} y={-s * 0.18} width={s * 0.14} height={s * 0.36} fill={PALETTE.yellow} stroke={INK} strokeWidth={line(s) * 0.5} />
    <rect x={s * 0.36} y={-s * 0.18} width={s * 0.14} height={s * 0.36} fill={PALETTE.yellow} stroke={INK} strokeWidth={line(s) * 0.5} />
  </g>
);

const props: PropSet = {
  // a film camera on a tripod, two reels on top, a blinking red REC light
  filmcam: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.9} s={s} />
      {[-0.22, 0, 0.22].map((x) => <line key={x} x1={0} y1={-s * 0.42} x2={x * s * 1.4} y2={0} stroke={INK} strokeWidth={line(s) * 0.8} />)}
      <Box x={-s * 0.36} y={-s * 0.72} w={s * 0.62} h={s * 0.32} fill={PALETTE.dark} s={s} r={0.06} />
      <Shape d={`M${s * 0.26},${-s * 0.66} L${s * 0.46},${-s * 0.74} L${s * 0.46},${-s * 0.38} L${s * 0.26},${-s * 0.46} Z`} fill={shade(PALETTE.dark, 0.2)} s={s} />
      {[-0.2, 0.08].map((x, i) => (
        <g key={x} transform={`rotate(${t * 90 * (i ? 1 : -1)} ${x * s} ${-s * 0.86})`}>
          <circle cx={x * s} cy={-s * 0.86} r={s * 0.14} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.5} />
          {[0, 1, 2].map((j) => <circle key={j} cx={x * s + Math.cos(j * 2.1) * s * 0.07} cy={-s * 0.86 + Math.sin(j * 2.1) * s * 0.07} r={s * 0.03} fill={PALETTE.dark} />)}
        </g>
      ))}
      <circle cx={-s * 0.26} cy={-s * 0.62} r={s * 0.035} fill={PALETTE.red} opacity={Math.sin(t * 5) > 0 ? 1 : 0.25} />
    </g>
  ),
  // a money bag with a hole, notes leaking out; k (default 1) = how full
  leakbag: ({ s, t, k = 1 }) => {
    const f = Math.max(0.4, k);
    return (
      <g>
        <Shadow w={s * 0.9} s={s} />
        <Ball cx={0} cy={-s * 0.34 * f} rx={s * 0.4 * f} ry={s * 0.34 * f} fill={shade(PALETTE.tan, -0.1)} s={s} />
        <rect x={-s * 0.14} y={-s * 0.7 * f - s * 0.04} width={s * 0.28} height={s * 0.08} rx={s * 0.02} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.4} />
        <Paint x={0} y={-s * 0.26 * f} text="$" size={s * 0.3 * f} fill={PALETTE.green} />
        <circle cx={s * 0.3 * f} cy={-s * 0.18} r={s * 0.04} fill={INK} />
        {[0, 1, 2].map((i) => {
          const q = (t * 0.8 + i / 3) % 1;
          return <rect key={i} x={s * (0.34 + q * 0.3)} y={-s * 0.18 + q * s * 0.2} width={s * 0.16} height={s * 0.08} rx={s * 0.01} fill="#8fd19e" stroke={INK} strokeWidth={line(s) * 0.3}
            transform={`rotate(${q * 120} ${s * (0.42 + q * 0.3)} ${-s * 0.14 + q * s * 0.2})`} opacity={1 - q} />;
        })}
      </g>
    );
  },
  // a cardboard box with a big question mark, its lid bouncing
  mysterybox: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.9} s={s} />
      <Box x={-s * 0.38} y={-s * 0.64} w={s * 0.76} h={s * 0.64} fill={shade(PALETTE.tan, -0.05)} s={s} r={0.03} />
      <g transform={`translate(0,${-Math.abs(Math.sin(t * 4)) * s * 0.05})`}>
        <Box x={-s * 0.42} y={-s * 0.76} w={s * 0.84} h={s * 0.14} fill={PALETTE.tan} s={s} r={0.03} />
      </g>
      <Paint x={0} y={-s * 0.22} text="?" size={s * 0.42} fill={PALETTE.purple} />
    </g>
  ),
  // a big chocolate bar in a blue wrapper with yellow ends, a corner torn open showing the chocolate
  chocobar: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.6)}) rotate(-8)`}>
      <Shadow w={s * 1.0} s={s} />
      <rect x={-s * 0.5} y={-s * 0.62} width={s * 0.42} height={s * 0.5} rx={s * 0.02} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.5} />
      {[0, 1].map((i) => [0, 1, 2].map((j) => <rect key={`${i}${j}`} x={-s * 0.47 + i * s * 0.19} y={-s * 0.59 + j * s * 0.16} width={s * 0.16} height={s * 0.13} rx={s * 0.02} fill={shade(PALETTE.brown, 0.12)} />))}
      <Box x={-s * 0.14} y={-s * 0.66} w={s * 0.64} h={s * 0.58} fill="#3b82f6" s={s} r={0.03} />
      <rect x={s * 0.38} y={-s * 0.66} width={s * 0.12} height={s * 0.58} fill={PALETTE.yellow} stroke={INK} strokeWidth={line(s) * 0.4} />
      <Paint x={s * 0.12} y={-s * 0.42} text="CHOCO" size={s * 0.11} fill="#fff" />
      <Paint x={s * 0.12} y={-s * 0.28} text="BAR" size={s * 0.11} fill={PALETTE.yellow} />
    </g>
  ),
  // a store shelf: three wooden boards stacked with blue chocolate bars, a price tag
  shopshelf: ({ s }) => (
    <g>
      <Shadow w={s * 1.1} s={s} />
      <rect x={-s * 0.5} y={-s * 1.0} width={s * 1.0} height={s * 1.0} fill={shade(PALETTE.cream, -0.05)} stroke={INK} strokeWidth={line(s) * 0.6} />
      {[0.32, 0.64, 0.96].map((y) => (
        <g key={y}>
          <rect x={-s * 0.5} y={-s * (1.0 - y) - s * 0.04} width={s * 1.0} height={s * 0.05} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.4} />
          {[-0.3, 0, 0.3].map((x) => <g key={x}>{bar(s * 0.26, x * s, -s * (1.0 - y) - s * 0.1)}</g>)}
        </g>
      ))}
      <rect x={s * 0.3} y={-s * 0.08} width={s * 0.18} height={s * 0.08} fill={PALETTE.yellow} stroke={INK} strokeWidth={line(s) * 0.3} />
    </g>
  ),
  // a cash till with a screen and an open drawer full of notes
  cashtill: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.0} s={s} />
      <Box x={-s * 0.46} y={-s * 0.46} w={s * 0.92} h={s * 0.46} fill={PALETTE.grey} s={s} r={0.05} />
      <Box x={-s * 0.3} y={-s * 0.82} w={s * 0.6} h={s * 0.3} fill={PALETTE.dark} s={s} r={0.05} />
      <rect x={-s * 0.24} y={-s * 0.76} width={s * 0.48} height={s * 0.18} fill={PALETTE.mint} opacity={0.7 + 0.3 * Math.sin(t * 4)} />
      <rect x={-s * 0.42} y={-s * 0.14 + Math.abs(Math.sin(t * 2)) * s * 0.04} width={s * 0.84} height={s * 0.14} fill={shade(PALETTE.grey, -0.2)} stroke={INK} strokeWidth={line(s) * 0.4} />
      {[-0.26, -0.06, 0.14].map((x) => <rect key={x} x={x * s} y={-s * 0.2} width={s * 0.16} height={s * 0.1} fill="#8fd19e" stroke={INK} strokeWidth={line(s) * 0.3} />)}
    </g>
  ),
  // a pink piggy bank with a coin dropping into its slot
  piggybank: ({ s, t }) => {
    const q = (t * 0.7) % 1;
    return (
      <g>
        <Shadow w={s * 1.0} s={s} />
        <Ball cx={0} cy={-s * 0.4} rx={s * 0.48} ry={s * 0.34} fill={PALETTE.pink} s={s} />
        <Ball cx={s * 0.44} cy={-s * 0.4} rx={s * 0.1} ry={s * 0.09} fill={shade(PALETTE.pink, -0.1)} s={s} />
        {[-0.28, 0.2].map((x) => <rect key={x} x={x * s} y={-s * 0.12} width={s * 0.09} height={s * 0.12} fill={shade(PALETTE.pink, -0.15)} stroke={INK} strokeWidth={line(s) * 0.3} />)}
        <rect x={-s * 0.1} y={-s * 0.76} width={s * 0.2} height={s * 0.03} rx={s * 0.01} fill={INK} />
        <circle cx={s * 0.24} cy={-s * 0.5} r={s * 0.03} fill={INK} />
        <circle cx={0} cy={-s * 1.1 + q * s * 0.36} r={s * 0.07} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.3} opacity={q < 0.9 ? 1 : 0} />
      </g>
    );
  },
  // a gold trophy cup on a base, glinting
  trophy: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.7} s={s} />
      <Box x={-s * 0.24} y={-s * 0.14} w={s * 0.48} h={s * 0.14} fill={PALETTE.brown} s={s} r={0.05} />
      <rect x={-s * 0.05} y={-s * 0.36} width={s * 0.1} height={s * 0.22} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.4} />
      <Shape d={`M${-s * 0.3},${-s * 0.9} L${s * 0.3},${-s * 0.9} Q${s * 0.3},${-s * 0.4} 0,${-s * 0.36} Q${-s * 0.3},${-s * 0.4} ${-s * 0.3},${-s * 0.9} Z`} fill={PALETTE.gold} s={s} />
      <path d={`M${-s * 0.3},${-s * 0.82} q${-s * 0.18},${s * 0.04} ${-s * 0.04},${s * 0.24}`} stroke={INK} strokeWidth={line(s) * 0.6} fill="none" />
      <path d={`M${s * 0.3},${-s * 0.82} q${s * 0.18},${s * 0.04} ${s * 0.04},${s * 0.24}`} stroke={INK} strokeWidth={line(s) * 0.6} fill="none" />
      <circle cx={-s * 0.12} cy={-s * 0.74} r={s * 0.04} fill="#fff" opacity={0.5 + 0.5 * Math.sin(t * 4)} />
    </g>
  ),
  // a red megaphone with AD on its side and sound waves
  megaphone: ({ s, t }) => (
    <g transform={`rotate(-12)`}>
      <Shape d={`M${-s * 0.4},${-s * 0.52} L${s * 0.3},${-s * 0.78} L${s * 0.3},${-s * 0.2} L${-s * 0.4},${-s * 0.42} Z`} fill={PALETTE.red} s={s} />
      <rect x={-s * 0.5} y={-s * 0.54} width={s * 0.12} height={s * 0.14} rx={s * 0.03} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s) * 0.4} />
      <rect x={-s * 0.32} y={-s * 0.42} width={s * 0.08} height={s * 0.26} rx={s * 0.03} fill={PALETTE.dark} />
      <Paint x={-s * 0.02} y={-s * 0.42} text="AD" size={s * 0.16} fill="#fff" />
      {[0, 1, 2].map((i) => {
        const q = (t * 1.2 + i / 3) % 1;
        return <path key={i} d={`M${s * (0.4 + q * 0.3)},${-s * (0.74 + q * 0.1)} q${s * 0.1},${s * 0.25} 0,${s * (0.5 + q * 0.2)}`} stroke={PALETTE.yellow} strokeWidth={line(s) * 0.8} fill="none" opacity={1 - q} />;
      })}
    </g>
  ),
  // a video screen on a stand: a red play button, a progress bar and a view count bar
  videoscreen: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.2} s={s} />
      <rect x={-s * 0.05} y={-s * 0.2} width={s * 0.1} height={s * 0.2} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.3} />
      <Box x={-s * 0.62} y={-s * 0.94} w={s * 1.24} h={s * 0.76} fill={PALETTE.dark} s={s} r={0.04} />
      <rect x={-s * 0.56} y={-s * 0.88} width={s * 1.12} height={s * 0.56} fill="#2b4a7a" />
      <rect x={-s * 0.2} y={-s * 0.72} width={s * 0.4} height={s * 0.26} rx={s * 0.07} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.4} />
      <path d={`M${-s * 0.05},${-s * 0.66} L${s * 0.08},${-s * 0.59} L${-s * 0.05},${-s * 0.52} Z`} fill="#fff" />
      <rect x={-s * 0.56} y={-s * 0.28} width={s * 1.12} height={s * 0.04} fill={PALETTE.grey} />
      <rect x={-s * 0.56} y={-s * 0.28} width={s * 1.12 * ((t * 0.15) % 1)} height={s * 0.04} fill={PALETTE.red} />
    </g>
  ),
};

export default props;
