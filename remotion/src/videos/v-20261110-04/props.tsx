/**
 * The things "California's billionaire tax and the exit door" is about, drawn for this video only:
 * a state capitol with a white dome and columns, a ballot box with a paper going in, a pile of
 * share certificates tied with a ribbon (state "locked": a padlock on top), a long tax bill with a
 * red total line, a giant cheque, a small steel cash safe, a falling price chart on a screen, a
 * moving truck loaded with boxes, a search bar on a stand (labelled with the company's name by the
 * scene), a travel suitcase with stickers, a billionaire's top hat and an estate heap (mansion, car, coins).
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a state capitol: steps, a row of columns, a white dome with a flag on top
  capitol: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.3} s={s} />
      <Box x={-s * 0.62} y={-s * 0.1} w={s * 1.24} h={s * 0.1} fill={shade(PALETTE.cream, -0.12)} s={s} r={0.01} />
      <Box x={-s * 0.56} y={-s * 0.46} w={s * 1.12} h={s * 0.36} fill={PALETTE.cream} s={s} r={0.01} />
      {[-0.44, -0.26, -0.08, 0.1, 0.28, 0.46].map((x) => (
        <rect key={x} x={x * s - s * 0.03} y={-s * 0.44} width={s * 0.06} height={s * 0.32} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.4} />
      ))}
      <Shape d={`M${-s * 0.6},${-s * 0.46} L0,${-s * 0.6} L${s * 0.6},${-s * 0.46} Z`} fill={shade(PALETTE.cream, -0.06)} s={s} />
      <rect x={-s * 0.2} y={-s * 0.72} width={s * 0.4} height={s * 0.12} fill={PALETTE.cream} stroke={INK} strokeWidth={line(s) * 0.5} />
      <Ball cx={0} cy={-s * 0.74} rx={s * 0.22} ry={s * 0.2} fill="#f4f6fb" s={s} />
      <rect x={-s * 0.22} y={-s * 0.75} width={s * 0.44} height={s * 0.04} fill={PALETTE.cream} />
      <line x1={0} y1={-s * 0.94} x2={0} y2={-s * 1.1} stroke={INK} strokeWidth={line(s) * 0.6} />
      <path d={`M0,${-s * 1.1} q${s * 0.08},${Math.sin(t * 4) * s * 0.02} ${s * 0.16},0 l0,${s * 0.08} q${-s * 0.08},${Math.sin(t * 4 + 1) * s * 0.02} ${-s * 0.16},0 Z`}
        fill={PALETTE.blue} stroke={INK} strokeWidth={line(s) * 0.3} />
    </g>
  ),
  // a ballot box: a blue box with a slot, a paper sliding in and out
  ballotbox: ({ s, t }) => {
    const q = (t * 0.6) % 1;
    return (
      <g>
        <Shadow w={s * 0.9} s={s} />
        <rect x={-s * 0.12} y={-s * 0.86 + q * s * 0.2} width={s * 0.24} height={s * 0.28} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.4}
          opacity={q < 0.85 ? 1 : 0} />
        <path d={`M${-s * 0.06},${-s * 0.76 + q * s * 0.2} l${s * 0.04},${s * 0.04} l${s * 0.08},${-s * 0.08}`} stroke={PALETTE.green} strokeWidth={line(s) * 0.6} fill="none" opacity={q < 0.85 ? 1 : 0} />
        <Box x={-s * 0.4} y={-s * 0.62} w={s * 0.8} h={s * 0.62} fill={PALETTE.blue} s={s} r={0.03} />
        <rect x={-s * 0.18} y={-s * 0.64} width={s * 0.36} height={s * 0.04} rx={s * 0.01} fill={INK} />
        <Paint x={0} y={-s * 0.24} text="VOTE" size={s * 0.16} fill="#fff" />
      </g>
    );
  },
  // a pile of share certificates with wavy borders, tied with a ribbon; "locked" adds a padlock
  sharepile: ({ s, t, state }) => (
    <g transform={`translate(0,${bob(t, s, 1.4)})`}>
      <Shadow w={s * 1.1} s={s} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${(i % 2 ? 1 : -1) * s * 0.03},${-i * s * 0.12}) rotate(${(i % 2 ? 2 : -2)})`}>
          <rect x={-s * 0.5} y={-s * 0.14} width={s * 1.0} height={s * 0.13} rx={s * 0.01} fill={shade(PALETTE.cream, -0.04 * i)} stroke={INK} strokeWidth={line(s) * 0.4} />
          <rect x={-s * 0.44} y={-s * 0.12} width={s * 0.88} height={s * 0.09} fill="none" stroke={PALETTE.green} strokeWidth={line(s) * 0.4} strokeDasharray={`${s * 0.03} ${s * 0.015}`} />
        </g>
      ))}
      <g transform={`translate(0,${-s * 0.6})`}>
        <rect x={-s * 0.5} y={-s * 0.14} width={s * 1.0} height={s * 0.14} rx={s * 0.01} fill={PALETTE.cream} stroke={INK} strokeWidth={line(s) * 0.5} />
        <Paint x={0} y={-s * 0.04} text="SHARES" size={s * 0.1} fill={PALETTE.green} />
      </g>
      <rect x={-s * 0.04} y={-s * 0.76} width={s * 0.08} height={s * 0.76} fill={PALETTE.red} opacity={0.85} />
      {state === "locked" && (
        <g transform={`translate(0,${-s * 0.86})`}>
          <path d={`M${-s * 0.08},0 v${-s * 0.08} a${s * 0.08},${s * 0.08} 0 0 1 ${s * 0.16},0 v${s * 0.08}`} stroke={INK} strokeWidth={line(s) * 0.8} fill="none" />
          <Box x={-s * 0.12} y={0} w={s * 0.24} h={s * 0.18} fill={PALETTE.gold} s={s} r={0.03} />
        </g>
      )}
    </g>
  ),
  // a long paper tax bill curling at the foot, lines of print and a red total box
  taxbill: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 2) * 2})`}>
      <Shadow w={s * 0.7} s={s} />
      <Shape d={`M${-s * 0.3},${-s * 1.0} L${s * 0.3},${-s * 1.0} L${s * 0.3},${-s * 0.12} q0,${s * 0.12} ${-s * 0.12},${s * 0.12} L${-s * 0.3},0 Z`} fill="#fff" s={s} />
      <rect x={-s * 0.22} y={-s * 0.92} width={s * 0.44} height={s * 0.08} fill={PALETTE.red} />
      <Paint x={0} y={-s * 0.86} text="TAX" size={s * 0.08} fill="#fff" />
      {[0.74, 0.64, 0.54, 0.44].map((y) => <rect key={y} x={-s * 0.22} y={-s * y} width={s * (y > 0.6 ? 0.44 : 0.3)} height={s * 0.03} fill={PALETTE.grey} />)}
      <Box x={-s * 0.22} y={-s * 0.32} w={s * 0.44} h={s * 0.12} fill={shade(PALETTE.red, 0.35)} s={s} r={0.02} />
    </g>
  ),
  // a giant paper cheque with a signature line and a pen scribble
  bigcheque: ({ s, t }) => (
    <g transform={`rotate(${-6 + Math.sin(t * 2.4) * 2})`}>
      <Shadow w={s * 1.2} s={s} />
      <Box x={-s * 0.62} y={-s * 0.56} w={s * 1.24} h={s * 0.5} fill="#e6f7ec" s={s} r={0.03} />
      <rect x={-s * 0.56} y={-s * 0.5} width={s * 1.12} height={s * 0.08} fill={PALETTE.green} />
      <rect x={-s * 0.5} y={-s * 0.34} width={s * 0.6} height={s * 0.03} fill={PALETTE.grey} />
      <Box x={s * 0.16} y={-s * 0.38} w={s * 0.38} h={s * 0.1} fill="#fff" s={s} r={0.02} />
      <line x1={s * 0.1} y1={-s * 0.14} x2={s * 0.54} y2={-s * 0.14} stroke={INK} strokeWidth={line(s) * 0.4} />
      <path d={`M${s * 0.14},${-s * 0.17} q${s * 0.06},${-s * 0.08} ${s * 0.1},0 t${s * 0.1},0 t${s * 0.1},0`} stroke={PALETTE.navy} strokeWidth={line(s) * 0.6} fill="none" />
    </g>
  ),
  // a small steel safe with a dial and a handle, its door slightly open, almost empty inside
  cashsafe: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.9} s={s} />
      <Box x={-s * 0.4} y={-s * 0.8} w={s * 0.8} h={s * 0.76} fill={PALETTE.grey} s={s} r={0.05} />
      <rect x={-s * 0.32} y={-s * 0.72} width={s * 0.64} height={s * 0.6} fill={shade(PALETTE.dark, 0.1)} stroke={INK} strokeWidth={line(s) * 0.4} />
      <rect x={-s * 0.12} y={-s * 0.24} width={s * 0.2} height={s * 0.08} fill="#8fd19e" stroke={INK} strokeWidth={line(s) * 0.3} />
      <g transform={`rotate(${t * 40} ${s * 0.18} ${-s * 0.52})`}>
        <circle cx={s * 0.18} cy={-s * 0.52} r={s * 0.1} fill={PALETTE.white} stroke={INK} strokeWidth={line(s) * 0.5} />
        <line x1={s * 0.18} y1={-s * 0.52} x2={s * 0.18} y2={-s * 0.6} stroke={INK} strokeWidth={line(s) * 0.5} />
      </g>
      <rect x={-s * 0.36} y={-s * 0.04} width={s * 0.12} height={s * 0.04} fill={INK} />
      <rect x={s * 0.24} y={-s * 0.04} width={s * 0.12} height={s * 0.04} fill={INK} />
    </g>
  ),
  // a screen on a stand with a red price line falling, an arrow down at its end
  sellchart: ({ s, t }) => {
    const k = Math.min(1, (t % 3) / 1.5);
    const pts = [[-0.5, -0.82], [-0.3, -0.76], [-0.1, -0.8], [0.1, -0.6], [0.3, -0.5], [0.46, -0.34]];
    const n = Math.max(2, Math.ceil(k * pts.length));
    const d = pts.slice(0, n).map(([x, y], i) => `${i ? "L" : "M"}${x! * s},${y! * s}`).join(" ");
    const last = pts[n - 1]!;
    return (
      <g>
        <Shadow w={s * 1.1} s={s} />
        <rect x={-s * 0.05} y={-s * 0.2} width={s * 0.1} height={s * 0.2} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.3} />
        <Box x={-s * 0.62} y={-s * 1.0} w={s * 1.24} h={s * 0.8} fill={PALETTE.dark} s={s} r={0.04} />
        {[0.84, 0.66, 0.48].map((y) => <line key={y} x1={-s * 0.54} y1={-s * y} x2={s * 0.54} y2={-s * y} stroke="#3c4660" strokeWidth={line(s) * 0.3} />)}
        <path d={d} stroke={PALETTE.red} strokeWidth={line(s) * 1.4} fill="none" strokeLinejoin="round" />
        <circle cx={last[0]! * s} cy={last[1]! * s} r={s * 0.04} fill={PALETTE.red} />
        <Paint x={-s * 0.3} y={-s * 0.32} text="SELL" size={s * 0.12} fill={PALETTE.yellow} />
      </g>
    );
  },
  // a moving truck: a box body loaded with cartons, a cab, wheels turning
  movingtruck: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.6} s={s} />
      <Box x={-s * 0.8} y={-s * 0.74} w={s * 1.06} h={s * 0.6} fill={PALETTE.orange} s={s} r={0.03} />
      <Paint x={-s * 0.27} y={-s * 0.4} text="MOVING" size={s * 0.13} fill="#fff" />
      {[-0.6, -0.36].map((x) => <rect key={x} x={x * s} y={-s * 0.92} width={s * 0.2} height={s * 0.18} fill={PALETTE.tan} stroke={INK} strokeWidth={line(s) * 0.4} />)}
      <Shape d={`M${s * 0.28},${-s * 0.56} L${s * 0.6},${-s * 0.56} L${s * 0.76},${-s * 0.34} L${s * 0.76},${-s * 0.14} L${s * 0.28},${-s * 0.14} Z`} fill={PALETTE.red} s={s} />
      <rect x={s * 0.36} y={-s * 0.5} width={s * 0.2} height={s * 0.14} fill="#bfe3ff" stroke={INK} strokeWidth={line(s) * 0.3} />
      {[-0.56, 0.52].map((x) => (
        <g key={x} transform={`rotate(${t * 300} ${x * s} ${-s * 0.12})`}>
          <circle cx={x * s} cy={-s * 0.12} r={s * 0.12} fill={INK} />
          <line x1={x * s - s * 0.08} y1={-s * 0.12} x2={x * s + s * 0.08} y2={-s * 0.12} stroke={PALETTE.grey} strokeWidth={line(s) * 0.5} />
        </g>
      ))}
    </g>
  ),
  // a big search bar on a stand: a white rounded box, a magnifier and a blinking cursor
  searchbar: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.1} s={s} />
      <rect x={-s * 0.04} y={-s * 0.3} width={s * 0.08} height={s * 0.3} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.3} />
      <Box x={-s * 0.62} y={-s * 0.56} w={s * 1.24} h={s * 0.26} fill="#fff" s={s} r={0.5} />
      <circle cx={-s * 0.44} cy={-s * 0.44} r={s * 0.06} fill="none" stroke={PALETTE.blue} strokeWidth={line(s) * 0.7} />
      <line x1={-s * 0.4} y1={-s * 0.4} x2={-s * 0.34} y2={-s * 0.34} stroke={PALETTE.blue} strokeWidth={line(s) * 0.7} />
      {[PALETTE.blue, PALETTE.red, PALETTE.yellow, PALETTE.green].map((c, i) => (
        <rect key={c} x={-s * 0.24 + i * s * 0.12} y={-s * 0.46} width={s * 0.1} height={s * 0.04} rx={s * 0.02} fill={c} />
      ))}
      <rect x={s * 0.3} y={-s * 0.5} width={s * 0.02} height={s * 0.14} fill={INK} opacity={Math.sin(t * 6) > 0 ? 1 : 0} />
    </g>
  ),
  // a travel suitcase with a handle and two round stickers, rocking a little
  suitcase: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 3) * 3})`}>
      <Shadow w={s * 0.8} s={s} />
      <path d={`M${-s * 0.12},${-s * 0.7} v${-s * 0.1} h${s * 0.24} v${s * 0.1}`} stroke={INK} strokeWidth={line(s) * 0.9} fill="none" />
      <Box x={-s * 0.36} y={-s * 0.7} w={s * 0.72} h={s * 0.64} fill={PALETTE.purple} s={s} r={0.06} />
      <rect x={-s * 0.36} y={-s * 0.42} width={s * 0.72} height={s * 0.04} fill={shade(PALETTE.purple, -0.25)} />
      <circle cx={-s * 0.16} cy={-s * 0.56} r={s * 0.08} fill={PALETTE.yellow} stroke={INK} strokeWidth={line(s) * 0.3} />
      <circle cx={s * 0.16} cy={-s * 0.24} r={s * 0.07} fill={PALETTE.mint} stroke={INK} strokeWidth={line(s) * 0.3} />
      {[-0.26, 0.26].map((x) => <circle key={x} cx={x * s} cy={-s * 0.02} r={s * 0.04} fill={INK} />)}
    </g>
  ),
  // a billionaire's top hat with a gold band and a monocle on a chain hanging beside it
  tophat: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.8)})`}>
      <Shadow w={s * 0.9} s={s} />
      <Ball cx={0} cy={-s * 0.08} rx={s * 0.5} ry={s * 0.08} fill={PALETTE.dark} s={s} />
      <Box x={-s * 0.3} y={-s * 0.78} w={s * 0.6} h={s * 0.7} fill={PALETTE.dark} s={s} r={0.04} />
      <rect x={-s * 0.3} y={-s * 0.3} width={s * 0.6} height={s * 0.1} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.4} />
      <circle cx={s * 0.52} cy={-s * 0.34} r={s * 0.09} fill="#cfe8ff" opacity={0.8} stroke={PALETTE.gold} strokeWidth={line(s) * 0.7} />
      <path d={`M${s * 0.52},${-s * 0.25} q${-s * 0.04},${s * 0.14} ${-s * 0.2},${s * 0.18}`} stroke={PALETTE.gold} strokeWidth={line(s) * 0.4} fill="none" />
    </g>
  ),
  // everything a billionaire owns in one heap: a mansion with a pool, a car and a pile of coins
  estate: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.4} s={s} />
      <Box x={-s * 0.56} y={-s * 0.6} w={s * 0.7} h={s * 0.5} fill={PALETTE.cream} s={s} r={0.02} />
      <Shape d={`M${-s * 0.62},${-s * 0.6} L${-s * 0.21},${-s * 0.86} L${s * 0.2},${-s * 0.6} Z`} fill={PALETTE.red} s={s} />
      {[-0.46, -0.3, -0.12].map((x) => <rect key={x} x={x * s} y={-s * 0.48} width={s * 0.1} height={s * 0.12} fill="#ffe08a" stroke={INK} strokeWidth={line(s) * 0.3}
        opacity={0.7 + 0.3 * Math.sin(t * 3 + x * 10)} />)}
      <rect x={-s * 0.26} y={-s * 0.3} width={s * 0.12} height={s * 0.2} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.3} />
      <Ball cx={-s * 0.2} cy={-s * 0.04} rx={s * 0.38} ry={s * 0.05} fill="#6fd3f0" s={s} />
      <Shape d={`M${s * 0.16},${-s * 0.12} l${s * 0.08},${-s * 0.12} h${s * 0.24} l${s * 0.1},${s * 0.12} Z`} fill={PALETTE.blue} s={s} />
      <circle cx={s * 0.26} cy={-s * 0.1} r={s * 0.05} fill={INK} /><circle cx={s * 0.5} cy={-s * 0.1} r={s * 0.05} fill={INK} />
      {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={s * 0.46} cy={-s * (0.24 + i * 0.06)} rx={s * 0.14} ry={s * 0.035} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.3} />)}
    </g>
  ),
};

export default props;
