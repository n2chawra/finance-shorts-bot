/**
 * The things "Your $5,000 bonus: the rich turn it into a paycheck" is about, drawn for this video
 * only: a year-end bonus envelope stuffed with cash, a flat-screen TV with a price tag (it fades and
 * cracks as it ages), a mystery gift box, a share certificate, a business with a chimney and a lit
 * sign, a pile of profit coins, a money tree that grows (k 0..1), a pay cheque and a mailbox.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a fat year-end bonus envelope with notes poking out; "open" flips the flap up
  bonusenv: ({ s, t, state }) => (
    <g transform={`translate(0,${bob(t, s)}) rotate(-4)`}>
      <Shadow w={s * 0.8} s={s} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={-s * 0.3 + i * s * 0.08} y={-s * (0.62 + (state === "open" ? 0.14 : 0)) - i * s * 0.03} width={s * 0.3} height={s * 0.16}
          rx={s * 0.02} fill="#8fd19e" stroke={INK} strokeWidth={line(s) * 0.6} transform={`rotate(${-10 + i * 9})`} />
      ))}
      <Box x={-s * 0.4} y={-s * 0.56} w={s * 0.8} h={s * 0.52} fill={PALETTE.tan} s={s} r={0.04} />
      {state === "open"
        ? <Shape d={`M${-s * 0.4},${-s * 0.56} L0,${-s * 0.84} L${s * 0.4},${-s * 0.56} Z`} fill={shade(PALETTE.tan, -0.08)} s={s} />
        : <Shape d={`M${-s * 0.4},${-s * 0.56} L0,${-s * 0.3} L${s * 0.4},${-s * 0.56} Z`} fill={shade(PALETTE.tan, -0.08)} s={s} />}
      <circle cx={0} cy={-s * 0.32} r={s * 0.06} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.5} />
      <Paint x={0} y={-s * 0.1} text="BONUS" size={s * 0.1} fill={INK} />
    </g>
  ),
  // a flat-screen TV on a stand, a swinging price tag; "old" dims the screen and cracks it
  flattv: ({ s, t, state }) => {
    const old = state === "old";
    return (
      <g>
        <Shadow w={s * 0.9} s={s} />
        <rect x={-s * 0.04} y={-s * 0.16} width={s * 0.08} height={s * 0.12} fill={PALETTE.dark} />
        <Box x={-s * 0.22} y={-s * 0.06} w={s * 0.44} h={s * 0.06} fill={PALETTE.dark} s={s} r={0.2} />
        <Box x={-s * 0.5} y={-s * 0.72} w={s * 1.0} h={s * 0.58} fill={PALETTE.dark} s={s} r={0.03} />
        <rect x={-s * 0.46} y={-s * 0.68} width={s * 0.92} height={s * 0.5} fill={old ? "#4a5068" : "#57b8ff"} />
        {!old && <path d={`M${-s * 0.46},${-s * 0.3} q${s * 0.25},${-s * (0.16 + 0.04 * Math.sin(t * 2))} ${s * 0.5},${-s * 0.04} t${s * 0.42},${-s * 0.08} l0,${s * 0.12} l${-s * 0.92},0 Z`} fill="#7be0a6" />}
        {!old && <circle cx={s * 0.26} cy={-s * 0.56} r={s * 0.06} fill={PALETTE.yellow} />}
        {old && <path d={`M${-s * 0.1},${-s * 0.68} l${s * 0.08},${s * 0.16} l${-s * 0.1},${s * 0.12} l${s * 0.12},${s * 0.22}`} stroke="#fff" strokeWidth={line(s) * 0.7} fill="none" />}
        <g transform={`rotate(${Math.sin(t * 2.4) * 10} ${s * 0.46} ${-s * 0.7})`}>
          <line x1={s * 0.46} y1={-s * 0.7} x2={s * 0.5} y2={-s * 0.56} stroke={INK} strokeWidth={line(s) * 0.5} />
          <Box x={s * 0.4} y={-s * 0.58} w={s * 0.2} h={s * 0.12} fill={old ? PALETTE.grey : PALETTE.yellow} s={s} r={0.15} />
        </g>
      </g>
    );
  },
  // a gift box with a big question mark, its lid hopping
  mysterybox: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.8} s={s} />
      <Box x={-s * 0.32} y={-s * 0.56} w={s * 0.64} h={s * 0.56} fill={PALETTE.purple} s={s} r={0.04} />
      <rect x={-s * 0.05} y={-s * 0.56} width={s * 0.1} height={s * 0.56} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.4} />
      <g transform={`translate(0,${-Math.abs(Math.sin(t * 3)) * s * 0.05})`}>
        <Box x={-s * 0.36} y={-s * 0.68} w={s * 0.72} h={s * 0.14} fill={shade(PALETTE.purple, 0.12)} s={s} r={0.06} />
        <rect x={-s * 0.05} y={-s * 0.68} width={s * 0.1} height={s * 0.14} fill={PALETTE.gold} />
      </g>
      <Paint x={s * 0.17} y={-s * 0.2} text="?" size={s * 0.26} fill="#fff" />
    </g>
  ),
  // a share certificate: a scalloped border, a seal, a ribbon
  sharecert: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.3)}) rotate(3)`}>
      <Shadow w={s * 0.8} s={s} />
      <Box x={-s * 0.42} y={-s * 0.66} w={s * 0.84} h={s * 0.6} fill={PALETTE.cream} s={s} r={0.03} />
      <rect x={-s * 0.36} y={-s * 0.6} width={s * 0.72} height={s * 0.48} fill="none" stroke={PALETTE.green} strokeWidth={line(s) * 0.7} strokeDasharray={`${s * 0.03} ${s * 0.02}`} />
      <Paint x={0} y={-s * 0.46} text="SHARE" size={s * 0.11} fill={PALETTE.green} />
      {[0, 1].map((i) => <rect key={i} x={-s * 0.26} y={-s * (0.36 - i * 0.07)} width={s * (0.34 - i * 0.1)} height={s * 0.025} rx={s * 0.012} fill={PALETTE.grey} />)}
      <circle cx={s * 0.22} cy={-s * 0.24} r={s * 0.09} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.6} />
      <path d={`M${s * 0.18},${-s * 0.16} l-${s * 0.04},${s * 0.14} l${s * 0.05},-${s * 0.03} l${s * 0.03},${s * 0.04} Z`} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.4} />
    </g>
  ),
  // a business: brick front, chimney with smoke, a lit sign and a loading door
  bizfactory: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.1} s={s} />
      <rect x={s * 0.22} y={-s * 0.9} width={s * 0.12} height={s * 0.4} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.6} />
      {[0, 1, 2].map((i) => {
        const f = (t * 0.5 + i / 3) % 1;
        return <circle key={i} cx={s * (0.28 + f * 0.12)} cy={-s * (0.95 + f * 0.3)} r={s * (0.05 + f * 0.06)} fill="#dfe4ee" opacity={1 - f} />;
      })}
      <Shape d={`M${-s * 0.5},0 L${-s * 0.5},${-s * 0.5} L${-s * 0.25},${-s * 0.66} L${-s * 0.25},${-s * 0.5} L0,${-s * 0.66} L0,${-s * 0.5} L${s * 0.5},${-s * 0.5} L${s * 0.5},0 Z`} fill={PALETTE.red} s={s} />
      {[0, 1, 2].map((i) => <rect key={i} x={-s * 0.42 + i * s * 0.18} y={-s * 0.4} width={s * 0.12} height={s * 0.12} fill={PALETTE.yellow} opacity={0.7 + 0.3 * Math.sin(t * 3 + i)} stroke={INK} strokeWidth={line(s) * 0.4} />)}
      <rect x={s * 0.14} y={-s * 0.3} width={s * 0.26} height={s * 0.3} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.5} />
      {[0, 1, 2].map((i) => <line key={i} x1={s * 0.14} x2={s * 0.4} y1={-s * (0.24 - i * 0.07)} y2={-s * (0.24 - i * 0.07)} stroke={INK} strokeWidth={line(s) * 0.3} />)}
    </g>
  ),
  // a pile of gold coins with a glint
  profitcoins: ({ s, t }) => (
    <g>
      <Shadow w={s * 0.7} s={s} />
      {[0, 1, 2, 3, 4].map((i) => <Ball key={i} cx={((i * 37) % 3 - 1) * s * 0.08} cy={-s * (0.06 + i * 0.08)} rx={s * 0.2} ry={s * 0.06} fill={PALETTE.gold} s={s} />)}
      <circle cx={s * 0.16} cy={-s * 0.5} r={s * 0.035 * (1 + 0.5 * Math.sin(t * 5))} fill="#fff" />
    </g>
  ),
  // a money tree: k 0..1 is how grown it is, notes hang from the branches
  cashtree: ({ s, t, k = 1 }) => {
    const g = 0.45 + 0.55 * k;
    return (
      <g>
        <Shadow w={s * 0.8} s={s} />
        <Shape d={`M${-s * 0.06},0 L${-s * 0.04},${-s * 0.5 * g} L${s * 0.04},${-s * 0.5 * g} L${s * 0.06},0 Z`} fill={PALETTE.brown} s={s} />
        {[[-0.22, -0.62], [0.2, -0.66], [0, -0.82], [-0.3, -0.42], [0.3, -0.44]].map(([x, y], i) => (
          <Ball key={i} cx={x! * s * g} cy={y! * s * g + Math.sin(t * 1.6 + i) * s * 0.01} rx={s * 0.22 * g} fill={i % 2 ? PALETTE.green : shade(PALETTE.green, 0.15)} s={s} />
        ))}
        {[[-0.2, -0.5], [0.16, -0.58], [0.02, -0.74], [-0.04, -0.4]].slice(0, Math.round(1 + 3 * k)).map(([x, y], i) => (
          <rect key={i} x={x! * s * g - s * 0.06} y={y! * s * g} width={s * 0.12} height={s * 0.07} rx={s * 0.01} fill="#8fd19e" stroke={INK} strokeWidth={line(s) * 0.4}
            transform={`rotate(${Math.sin(t * 2.2 + i) * 12} ${x! * s * g} ${y! * s * g})`} />
        ))}
      </g>
    );
  },
  // a pay cheque with a signature line and a green PAY stamp
  paycheck: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 2)}) rotate(-5)`}>
      <Shadow w={s * 0.9} s={s} />
      <Box x={-s * 0.5} y={-s * 0.48} w={s * 1.0} h={s * 0.44} fill="#e8f7ec" s={s} r={0.03} />
      <rect x={-s * 0.5} y={-s * 0.48} width={s * 0.12} height={s * 0.44} fill={PALETTE.green} stroke={INK} strokeWidth={line(s) * 0.5} />
      <Paint x={s * 0.08} y={-s * 0.34} text="PAY" size={s * 0.1} fill={PALETTE.green} />
      <line x1={-s * 0.3} x2={s * 0.42} y1={-s * 0.2} y2={-s * 0.2} stroke={INK} strokeWidth={line(s) * 0.4} />
      <path d={`M${s * 0.1},${-s * 0.13} q${s * 0.05},${-s * 0.08} ${s * 0.1},0 t${s * 0.1},0 t${s * 0.1},0`} stroke={PALETTE.blue} strokeWidth={line(s) * 0.5} fill="none" />
    </g>
  ),
  // a mailbox on a post, its flag up; "open" drops the door
  mailbox: ({ s, t, state }) => (
    <g>
      <Shadow w={s * 0.6} s={s} />
      <rect x={-s * 0.04} y={-s * 0.5} width={s * 0.08} height={s * 0.5} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.5} />
      <path d={`M${-s * 0.3},${-s * 0.5} L${-s * 0.3},${-s * 0.74} Q${-s * 0.3},${-s * 0.9} ${-s * 0.1},${-s * 0.9} L${s * 0.3},${-s * 0.9} L${s * 0.3},${-s * 0.5} Z`}
        fill={PALETTE.blue} stroke={INK} strokeWidth={line(s)} />
      {state === "open" && <rect x={-s * 0.36} y={-s * 0.56} width={s * 0.08} height={s * 0.28} fill={shade(PALETTE.blue, -0.2)} stroke={INK} strokeWidth={line(s) * 0.6} />}
      <g transform={`rotate(${-70 + Math.sin(t * 3) * 6} ${s * 0.28} ${-s * 0.62})`}>
        <rect x={s * 0.28} y={-s * 0.66} width={s * 0.24} height={s * 0.05} fill={PALETTE.dark} />
        <rect x={s * 0.44} y={-s * 0.74} width={s * 0.1} height={s * 0.1} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.4} />
      </g>
    </g>
  ),
};

export default props;
