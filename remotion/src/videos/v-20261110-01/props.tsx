/**
 * The things the locked Tesla pay deal is about, drawn for this video only: a ballot box with a
 * voting slip ("cast" drops the slip in), a steel lockbox of shares with a padlock ("open" lifts the
 * lid, "gold" gilds it), a share certificate, a tall value thermometer (k = how full), a target
 * flag, a rocket, a humanoid robot, a driverless robotaxi with a roof sensor, a fat money sack and a
 * paycheck slip.
 */
import React from "react";
import { Ball, bob, Box, INK, line, PALETTE, Paint, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const props: PropSet = {
  // a clear ballot box with a slot; "cast" drops a paper slip in
  ballot: ({ s, t, state }) => {
    const cast = state === "cast";
    return (
      <g>
        <Shadow w={s * 1.0} s={s} />
        <Box x={-s * 0.42} y={-s * 0.62} w={s * 0.84} h={s * 0.62} fill="#cfe8ff" s={s} r={0.04} />
        <rect x={-s * 0.42} y={-s * 0.7} width={s * 0.84} height={s * 0.1} fill={PALETTE.navy} stroke={INK} strokeWidth={line(s) * 0.5} />
        <rect x={-s * 0.16} y={-s * 0.67} width={s * 0.32} height={s * 0.035} rx={s * 0.01} fill={INK} />
        <Paint x={0} y={-s * 0.3} text="VOTE" size={s * 0.16} fill={PALETTE.navy} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={-s * 0.3 + i * s * 0.18} y={-s * 0.16} width={s * 0.14} height={s * 0.1} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.3}
            transform={`rotate(${-12 + i * 10} ${-s * 0.23 + i * s * 0.18} ${-s * 0.11})`} />
        ))}
        {!cast && <g transform={`translate(0,${-s * 0.72 + bob(t, s, 2.2, 0.03)})`}>
          <rect x={-s * 0.12} y={-s * 0.2} width={s * 0.24} height={s * 0.2} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.4} />
          <path d={`M${-s * 0.06},${-s * 0.1} l${s * 0.04},${s * 0.05} l${s * 0.08},${-s * 0.09}`} stroke={PALETTE.green} strokeWidth={line(s) * 0.7} fill="none" />
        </g>}
        {cast && <path d={`M${-s * 0.06},${-s * 0.5} l${s * 0.05},${s * 0.06} l${s * 0.1},${-s * 0.12}`} stroke={PALETTE.green} strokeWidth={line(s) * 0.9} fill="none" />}
      </g>
    );
  },
  // a steel strongbox with rivets and a padlock; "open" lifts the lid and shows share papers, "gold" gilds it
  lockbox: ({ s, t, state }) => {
    const open = state === "open";
    const body = state === "gold" ? PALETTE.gold : "#8c96ab";
    return (
      <g>
        <Shadow w={s * 1.1} s={s} />
        {open && <rect x={-s * 0.3} y={-s * 0.78} width={s * 0.6} height={s * 0.3} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.4} transform={`rotate(-6 0 ${-s * 0.6})`} />}
        <Box x={-s * 0.48} y={-s * 0.56} w={s * 0.96} h={s * 0.56} fill={body} s={s} r={0.05} />
        {[-0.38, 0.38].map((x) => [-0.46, -0.1].map((y) => <circle key={`${x}${y}`} cx={x * s} cy={y * s} r={s * 0.025} fill={shade(body, -0.3)} />))}
        <g transform={open ? `rotate(-38 ${-s * 0.48} ${-s * 0.56})` : undefined}>
          <Box x={-s * 0.5} y={-s * 0.7} w={s * 1.0} h={s * 0.16} fill={shade(body, 0.12)} s={s} r={0.05} />
        </g>
        {!open && (
          <g transform={`translate(0,${-s * 0.34}) rotate(${Math.sin(t * 3) * 4})`}>
            <path d={`M${-s * 0.08},${-s * 0.04} v${-s * 0.08} a${s * 0.08},${s * 0.08} 0 0 1 ${s * 0.16},0 v${s * 0.08}`} stroke={INK} strokeWidth={line(s) * 0.8} fill="none" />
            <Box x={-s * 0.12} y={-s * 0.04} w={s * 0.24} h={s * 0.2} fill={PALETTE.yellow} s={s} r={0.15} />
            <circle cx={0} cy={s * 0.05} r={s * 0.025} fill={INK} />
          </g>
        )}
      </g>
    );
  },
  // a share certificate with a fancy border and a seal
  sharecert: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.7)}) rotate(-5)`}>
      <Shadow w={s * 1.0} s={s} />
      <Box x={-s * 0.6} y={-s * 0.8} w={s * 1.2} h={s * 0.78} fill={PALETTE.cream} s={s} r={0.03} />
      <rect x={-s * 0.52} y={-s * 0.72} width={s * 1.04} height={s * 0.62} fill="none" stroke={PALETTE.green} strokeWidth={line(s) * 0.6} strokeDasharray={`${s * 0.04} ${s * 0.02}`} />
      <Paint x={0} y={-s * 0.56} text="SHARES" size={s * 0.15} fill={PALETTE.green} />
      {[0, 1].map((i) => <line key={i} x1={-s * 0.4} x2={s * 0.2} y1={-s * (0.38 - i * 0.09)} y2={-s * (0.38 - i * 0.09)} stroke={PALETTE.grey} strokeWidth={line(s) * 0.4} />)}
      <circle cx={s * 0.36} cy={-s * 0.26} r={s * 0.11} fill={PALETTE.red} stroke={INK} strokeWidth={line(s) * 0.4} />
    </g>
  ),
  // a tall glass thermometer of company value with tick marks; k fills it
  valuemeter: ({ s, t, k = 0.2 }) => {
    const hh = s * 0.82, fill = Math.max(0.04, Math.min(1, k));
    return (
      <g>
        <Shadow w={s * 0.5} s={s} />
        <Ball cx={0} cy={-s * 0.12} rx={s * 0.13} fill={PALETTE.green} s={s} />
        <rect x={-s * 0.07} y={-s * 0.12 - hh} width={s * 0.14} height={hh} rx={s * 0.07} fill="#eaf4ff" stroke={INK} strokeWidth={line(s) * 0.5} />
        <rect x={-s * 0.045} y={-s * 0.12 - hh * fill} width={s * 0.09} height={hh * fill} rx={s * 0.04} fill={PALETTE.green} opacity={0.85 + 0.15 * Math.sin(t * 5)} />
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={s * 0.07} x2={s * (i % 2 ? 0.13 : 0.18)} y1={-s * 0.18 - (hh * 0.9 * i) / 7} y2={-s * 0.18 - (hh * 0.9 * i) / 7} stroke={INK} strokeWidth={line(s) * 0.4} />
        ))}
        <Paint x={-s * 0.2} y={-s * 0.6} text="$" size={s * 0.16} fill={PALETTE.green} />
      </g>
    );
  },
  // a red target flag on a pole, rippling
  flag: ({ s, t }) => {
    const r = Math.sin(t * 5) * s * 0.03;
    return (
      <g>
        <rect x={-s * 0.03} y={-s * 1.0} width={s * 0.06} height={s * 1.0} fill={PALETTE.grey} stroke={INK} strokeWidth={line(s) * 0.3} />
        <Shape d={`M${s * 0.03},${-s * 0.98} Q${s * 0.3},${-s * 0.9 + r} ${s * 0.6},${-s * 0.96} L${s * 0.6},${-s * 0.62} Q${s * 0.3},${-s * 0.56 - r} ${s * 0.03},${-s * 0.64} Z`} fill={PALETTE.red} s={s} />
        <circle cx={s * 0.31} cy={-s * 0.79} r={s * 0.09} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.3} />
        <circle cx={s * 0.31} cy={-s * 0.79} r={s * 0.04} fill={PALETTE.red} />
      </g>
    );
  },
  // a white rocket with a red nose and a flickering flame
  rocket: ({ s, t }) => {
    const f = 0.8 + 0.2 * Math.sin(t * 20);
    return (
      <g transform={`translate(0,${bob(t, s, 3, 0.02)})`}>
        <Shape d={`M${-s * 0.08},${-s * 0.12} Q0,${s * 0.25 * f} ${s * 0.08},${-s * 0.12} Z`} fill={PALETTE.orange} s={s} />
        <Shape d={`M${-s * 0.14},${-s * 0.1} L${-s * 0.28},${-s * 0.02} L${-s * 0.14},${-s * 0.34} Z`} fill={PALETTE.red} s={s} />
        <Shape d={`M${s * 0.14},${-s * 0.1} L${s * 0.28},${-s * 0.02} L${s * 0.14},${-s * 0.34} Z`} fill={PALETTE.red} s={s} />
        <Shape d={`M${-s * 0.14},${-s * 0.1} L${-s * 0.14},${-s * 0.7} Q0,${-s * 1.05} ${s * 0.14},${-s * 0.7} L${s * 0.14},${-s * 0.1} Z`} fill="#fff" s={s} />
        <Shape d={`M${-s * 0.12},${-s * 0.74} Q0,${-s * 1.05} ${s * 0.12},${-s * 0.74} Z`} fill={PALETTE.red} s={s} />
        <circle cx={0} cy={-s * 0.5} r={s * 0.07} fill="#bfe6ff" stroke={INK} strokeWidth={line(s) * 0.4} />
      </g>
    );
  },
  // a friendly humanoid robot: round head with a visor, blinking eye light, boxy body, arms
  robot: ({ s, t }) => {
    const wave = Math.sin(t * 4) * 18;
    return (
      <g>
        <Shadow w={s * 0.7} s={s} />
        <rect x={-s * 0.16} y={-s * 0.32} width={s * 0.1} height={s * 0.32} fill="#d9dee8" stroke={INK} strokeWidth={line(s) * 0.4} />
        <rect x={s * 0.06} y={-s * 0.32} width={s * 0.1} height={s * 0.32} fill="#d9dee8" stroke={INK} strokeWidth={line(s) * 0.4} />
        <Box x={-s * 0.24} y={-s * 0.7} w={s * 0.48} h={s * 0.4} fill="#eef1f6" s={s} r={0.1} />
        <circle cx={0} cy={-s * 0.52} r={s * 0.05} fill={PALETTE.blue} opacity={0.6 + 0.4 * Math.sin(t * 6)} />
        <g transform={`rotate(${-20 + wave} ${-s * 0.24} ${-s * 0.66})`}><rect x={-s * 0.34} y={-s * 0.66} width={s * 0.1} height={s * 0.3} rx={s * 0.04} fill="#d9dee8" stroke={INK} strokeWidth={line(s) * 0.4} /></g>
        <rect x={s * 0.24} y={-s * 0.66} width={s * 0.1} height={s * 0.3} rx={s * 0.04} fill="#d9dee8" stroke={INK} strokeWidth={line(s) * 0.4} />
        <Ball cx={0} cy={-s * 0.84} rx={s * 0.16} ry={s * 0.14} fill="#eef1f6" s={s} />
        <rect x={-s * 0.12} y={-s * 0.89} width={s * 0.24} height={s * 0.08} rx={s * 0.04} fill={PALETTE.dark} />
        <circle cx={-s * 0.05} cy={-s * 0.85} r={s * 0.02} fill={PALETTE.mint} opacity={Math.sin(t * 2) > 0.95 ? 0.2 : 1} />
        <circle cx={s * 0.05} cy={-s * 0.85} r={s * 0.02} fill={PALETTE.mint} opacity={Math.sin(t * 2) > 0.95 ? 0.2 : 1} />
      </g>
    );
  },
  // a sleek driverless car with a spinning roof sensor and nobody at the wheel
  robotaxi: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.6} s={s} />
      <Shape d={`M${-s * 0.8},${-s * 0.14} L${-s * 0.76},${-s * 0.38} Q${-s * 0.4},${-s * 0.44} ${-s * 0.28},${-s * 0.62} L${s * 0.36},${-s * 0.62} Q${s * 0.6},${-s * 0.44} ${s * 0.8},${-s * 0.36} L${s * 0.82},${-s * 0.14} Z`} fill="#f4f6fb" s={s} />
      <Shape d={`M${-s * 0.22},${-s * 0.58} L${s * 0.3},${-s * 0.58} L${s * 0.48},${-s * 0.42} L${-s * 0.36},${-s * 0.42} Z`} fill="#2a3550" s={s} />
      <rect x={-s * 0.06} y={-s * 0.74} width={s * 0.12} height={s * 0.1} rx={s * 0.03} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s) * 0.3} />
      <rect x={-s * 0.05 + Math.sin(t * 8) * s * 0.03} y={-s * 0.72} width={s * 0.03} height={s * 0.06} fill={PALETTE.teal} />
      <rect x={-s * 0.7} y={-s * 0.3} width={s * 1.4} height={s * 0.05} fill={PALETTE.teal} />
      {[-0.5, 0.5].map((x) => (
        <g key={x}>
          <circle cx={x * s} cy={-s * 0.13} r={s * 0.15} fill={PALETTE.dark} stroke={INK} strokeWidth={line(s) * 0.5} />
          <circle cx={x * s} cy={-s * 0.13} r={s * 0.06} fill={PALETTE.grey} />
        </g>
      ))}
    </g>
  ),
  // a fat money sack with a gold rope and a dollar sign
  moneysack: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.4)})`}>
      <Shadow w={s * 0.9} s={s} />
      <Ball cx={0} cy={-s * 0.36} rx={s * 0.42} ry={s * 0.36} fill={shade(PALETTE.tan, -0.08)} s={s} />
      <Shape d={`M${-s * 0.15},${-s * 0.7} L${-s * 0.24},${-s * 0.92} L${s * 0.24},${-s * 0.92} L${s * 0.15},${-s * 0.7} Z`} fill={shade(PALETTE.tan, -0.15)} s={s} />
      <rect x={-s * 0.2} y={-s * 0.74} width={s * 0.4} height={s * 0.06} rx={s * 0.02} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.4} />
      <Paint x={0} y={-s * 0.24} text="$" size={s * 0.36} fill={PALETTE.green} />
    </g>
  ),
  // a paycheck slip with a signature line
  paycheck: ({ s, t }) => (
    <g transform={`translate(0,${bob(t, s, 1.5)}) rotate(4)`}>
      <Shadow w={s * 1.2} s={s} />
      <Box x={-s * 0.7} y={-s * 0.5} w={s * 1.4} h={s * 0.46} fill="#e9f7ef" s={s} r={0.03} />
      <Paint x={-s * 0.3} y={-s * 0.36} text="PAY" size={s * 0.12} fill={PALETTE.green} />
      <rect x={s * 0.1} y={-s * 0.44} width={s * 0.48} height={s * 0.12} fill="#fff" stroke={INK} strokeWidth={line(s) * 0.3} />
      <line x1={-s * 0.6} x2={s * 0.1} y1={-s * 0.2} y2={-s * 0.2} stroke={PALETTE.grey} strokeWidth={line(s) * 0.4} />
      <path d={`M${s * 0.2},${-s * 0.14} q${s * 0.06},${-s * 0.1} ${s * 0.12},0 t${s * 0.12},0`} stroke={PALETTE.blue} strokeWidth={line(s) * 0.5} fill="none" />
    </g>
  ),
};

export default props;
