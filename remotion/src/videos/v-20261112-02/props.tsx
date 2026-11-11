/**
 * The things "Bezos's small Amazon salary" is about, drawn for this video only: an Amazon shipping
 * parcel (tape, a curved smile line), a paycheck (a cheque with a signature), an armoured black SUV
 * (security), a private jet (business travel), a pie of Amazon with his slice pulled out (k = share),
 * an hourglass, a fulfilment warehouse, a CEO's desk nameplate, a tower of paychecks (k = height)
 * and a share certificate.
 */
import React from "react";
import { Ball, Box, INK, line, PALETTE, type PropSet, shade, Shadow, Shape } from "../../studio/draw";

const CARD = "#c8975a";

const props: PropSet = {
  // a brown cardboard parcel with tape and a curved smile line on its side
  parcel: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 1.3) * 1.5})`}>
      <Shadow w={s * 1.0} s={s} />
      <Box x={-s * 0.45} y={-s * 0.7} w={s * 0.9} h={s * 0.7} fill={CARD} s={s} r={s * 0.02} />
      <Shape d={`M${-s * 0.45},${-s * 0.7} L${-s * 0.3},${-s * 0.85} L${s * 0.6},${-s * 0.85} L${s * 0.45},${-s * 0.7} Z`} fill={shade(CARD, 0.15)} s={s} />
      <rect x={-s * 0.06} y={-s * 0.85} width={s * 0.12} height={s * 0.85} fill="#e9d3a8" opacity={0.85} />
      <path d={`M${-s * 0.3},${-s * 0.25} Q0,${-s * 0.1} ${s * 0.3},${-s * 0.25}`} fill="none" stroke={PALETTE.orange} strokeWidth={s * 0.04} strokeLinecap="round" />
      <path d={`M${s * 0.24},${-s * 0.3} L${s * 0.31},${-s * 0.25} L${s * 0.22},${-s * 0.2}`} fill="none" stroke={PALETTE.orange} strokeWidth={s * 0.035} strokeLinecap="round" />
    </g>
  ),
  // a paycheck: a pale green cheque with lines, a box for the amount and a scribbled signature
  paycheck: ({ s, t, state }) => (
    <g>
      <Shadow w={s * 0.8} s={s} />
      <line x1={-s * 0.3} y1={0} x2={-s * 0.15} y2={-s * 0.5} stroke={PALETTE.brown} strokeWidth={line(s)} />
      <line x1={s * 0.3} y1={0} x2={s * 0.15} y2={-s * 0.5} stroke={PALETTE.brown} strokeWidth={line(s)} />
    <g transform={`translate(0,${-s * 0.42}) rotate(${-4 + Math.sin(t * 1.6) * 2})`}>
      <rect x={-s * 0.5} y={-s * 0.52} width={s * 1.0} height={s * 0.48} rx={s * 0.03} fill={state === "gone" ? "#c9ccd2" : "#dff5e3"} stroke={INK} strokeWidth={line(s)} />
      {[0.42, 0.32].map((y) => <rect key={y} x={-s * 0.42} y={-s * y} width={s * 0.45} height={s * 0.03} rx={s * 0.015} fill={PALETTE.grey} />)}
      <rect x={s * 0.1} y={-s * 0.3} width={s * 0.32} height={s * 0.1} rx={s * 0.02} fill="#ffffff" stroke={INK} strokeWidth={line(s) * 0.5} />
      <path d={`M${-s * 0.4},${-s * 0.12} q${s * 0.05},${-s * 0.08} ${s * 0.1},0 t${s * 0.1},0 t${s * 0.1},0`} fill="none" stroke={PALETTE.blue} strokeWidth={s * 0.02} />
    </g>
    </g>
  ),
  // a black armoured SUV with tinted windows and a blinking light
  armoredcar: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.3} s={s} />
      <Box x={-s * 0.62} y={-s * 0.42} w={s * 1.24} h={s * 0.3} fill="#2a2d36" s={s} r={s * 0.06} />
      <Shape d={`M${-s * 0.42},${-s * 0.42} L${-s * 0.3},${-s * 0.66} L${s * 0.36},${-s * 0.66} L${s * 0.5},${-s * 0.42} Z`} fill="#2a2d36" s={s} />
      <rect x={-s * 0.26} y={-s * 0.62} width={s * 0.26} height={s * 0.16} fill="#4b5874" />
      <rect x={s * 0.04} y={-s * 0.62} width={s * 0.28} height={s * 0.16} fill="#4b5874" />
      <circle cx={-s * 0.35} cy={-s * 0.1} r={s * 0.12} fill={INK} />
      <circle cx={s * 0.38} cy={-s * 0.1} r={s * 0.12} fill={INK} />
      <circle cx={-s * 0.35} cy={-s * 0.1} r={s * 0.05} fill="#9aa3b5" />
      <circle cx={s * 0.38} cy={-s * 0.1} r={s * 0.05} fill="#9aa3b5" />
      <rect x={s * 0.0} y={-s * 0.72} width={s * 0.1} height={s * 0.06} rx={s * 0.02} fill={Math.sin(t * 8) > 0 ? PALETTE.red : PALETTE.blue} />
    </g>
  ),
  // a white private jet, nose to the right, bobbing
  jet: ({ s, t }) => (
    <g transform={`translate(0,${Math.sin(t * 1.8) * s * 0.03})`}>
      <Shadow w={s * 1.2} s={s} />
      <Shape d={`M${-s * 0.6},${-s * 0.45} Q${-s * 0.6},${-s * 0.58} ${-s * 0.4},${-s * 0.58} L${s * 0.45},${-s * 0.58} Q${s * 0.68},${-s * 0.52} ${s * 0.45},${-s * 0.42} L${-s * 0.5},${-s * 0.42} Z`} fill="#f4f6fb" s={s} />
      <Shape d={`M${-s * 0.5},${-s * 0.56} L${-s * 0.62},${-s * 0.82} L${-s * 0.48},${-s * 0.82} L${-s * 0.32},${-s * 0.58} Z`} fill={PALETTE.navy} s={s} />
      <Shape d={`M${-s * 0.05},${-s * 0.46} L${-s * 0.25},${-s * 0.25} L${-s * 0.1},${-s * 0.25} L${s * 0.15},${-s * 0.46} Z`} fill="#d5dae5" s={s} />
      {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={-s * 0.2 + i * s * 0.12} cy={-s * 0.52} r={s * 0.03} fill="#6fa8ff" />)}
    </g>
  ),
  // a pie of Amazon: a big orange disc with a slice of share k pulled outward
  stakepie: ({ s, t, k = 0.08 }) => {
    const a = Math.max(0.03, Math.min(0.9, k)) * Math.PI * 2;
    const r = s * 0.42, cy = -s * 0.5;
    const off = s * (0.06 + 0.02 * Math.sin(t * 3));
    const x1 = Math.sin(0) * r, y1 = -Math.cos(0) * r, x2 = Math.sin(a) * r, y2 = -Math.cos(a) * r;
    const mx = Math.sin(a / 2) * off, my = -Math.cos(a / 2) * off;
    return (
      <g>
        <Shadow w={s * 0.9} s={s} />
        <path d={`M0,${cy} L${x2},${cy + y2} A${r},${r} 0 1 1 ${x1},${cy + y1} Z`} fill={CARD} stroke={INK} strokeWidth={line(s)} />
        <path d={`M${mx},${cy + my} L${mx + x1},${cy + my + y1} A${r},${r} 0 0 1 ${mx + x2},${cy + my + y2} Z`} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s)} />
        {Array.from({ length: 11 }, (_, i) => { const b = a + (i + 1) * (Math.PI * 2 - a) / 12; return <line key={i} x1={0} y1={cy} x2={Math.sin(b) * r} y2={cy - Math.cos(b) * r} stroke={shade(CARD, -0.25)} strokeWidth={line(s) * 0.5} />; })}
        {[0.35, 0.7].map((q) => <circle key={q} cx={0} cy={cy} r={r * q} fill="none" stroke={shade(CARD, 0.2)} strokeWidth={line(s) * 0.4} />)}
        <path d={`M${-r * 0.5},${cy + r * 0.3} Q0,${cy + r * 0.55} ${r * 0.5},${cy + r * 0.3}`} fill="none" stroke={PALETTE.orange} strokeWidth={s * 0.035} strokeLinecap="round" />
      </g>
    );
  },
  // an hourglass with sand running from top to bottom
  hourglass: ({ s, t, k = 0.5 }) => {
    const f = Math.max(0, Math.min(1, k));
    return (
      <g>
        <Shadow w={s * 0.6} s={s} />
        <rect x={-s * 0.3} y={-s * 1.0} width={s * 0.6} height={s * 0.07} rx={s * 0.02} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.6} />
        <rect x={-s * 0.3} y={-s * 0.07} width={s * 0.6} height={s * 0.07} rx={s * 0.02} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.6} />
        <path d={`M${-s * 0.24},${-s * 0.93} L${s * 0.24},${-s * 0.93} L${s * 0.03},${-s * 0.5} L${s * 0.24},${-s * 0.07} L${-s * 0.24},${-s * 0.07} L${-s * 0.03},${-s * 0.5} Z`} fill="#e6f2ff" opacity={0.6} stroke={INK} strokeWidth={line(s)} />
        <path d={`M${-s * 0.2 * (1 - f)},${-s * (0.55 + 0.33 * (1 - f))} L${s * 0.2 * (1 - f)},${-s * (0.55 + 0.33 * (1 - f))} L0,${-s * 0.52} Z`} fill={PALETTE.yellow} />
        <path d={`M${-s * 0.22},${-s * 0.08} L${s * 0.22},${-s * 0.08} L0,${-s * (0.1 + 0.3 * f)} Z`} fill={PALETTE.yellow} />
        <line x1={0} y1={-s * 0.5} x2={0} y2={-s * 0.1} stroke={PALETTE.yellow} strokeWidth={s * 0.012} opacity={0.5 + 0.5 * Math.sin(t * 10)} />
      </g>
    );
  },
  // a long grey fulfilment warehouse with loading doors and a conveyor of parcels
  warehouse: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.4} s={s} />
      <Box x={-s * 0.7} y={-s * 0.55} w={s * 1.4} h={s * 0.55} fill="#b9c1cf" s={s} r={s * 0.02} />
      <Shape d={`M${-s * 0.72},${-s * 0.55} L0,${-s * 0.72} L${s * 0.72},${-s * 0.55} Z`} fill="#8a93a6" s={s} />
      {[-0.5, -0.2, 0.1, 0.4].map((x) => <rect key={x} x={x * s} y={-s * 0.32} width={s * 0.2} height={s * 0.32} fill="#5d6577" stroke={INK} strokeWidth={line(s) * 0.4} />)}
      {[0, 1, 2].map((i) => {
        const x = ((t * 0.25 + i / 3) % 1) * s * 1.2 - s * 0.6;
        return <rect key={i} x={x} y={-s * 0.5} width={s * 0.1} height={s * 0.08} fill={CARD} stroke={INK} strokeWidth={line(s) * 0.3} />;
      })}
    </g>
  ),
  // a CEO's desk nameplate: a wooden wedge with a brass plate
  nameplate: ({ s, t }) => (
    <g>
      <Shadow w={s * 1.1} s={s} />
      <rect x={-s * 0.55} y={-s * 0.55} width={s * 1.1} height={s * 0.08} fill={shade(PALETTE.brown, -0.1)} stroke={INK} strokeWidth={line(s) * 0.6} />
      <rect x={-s * 0.48} y={-s * 0.47} width={s * 0.08} height={s * 0.47} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.5} />
      <rect x={s * 0.4} y={-s * 0.47} width={s * 0.08} height={s * 0.47} fill={PALETTE.brown} stroke={INK} strokeWidth={line(s) * 0.5} />
    <g transform={`translate(0,${-s * 0.55})`}>
      <Shape d={`M${-s * 0.5},0 L${-s * 0.42},${-s * 0.4} L${s * 0.42},${-s * 0.4} L${s * 0.5},0 Z`} fill={PALETTE.brown} s={s} />
      <rect x={-s * 0.36} y={-s * 0.34} width={s * 0.72} height={s * 0.24} rx={s * 0.02} fill={PALETTE.gold} stroke={INK} strokeWidth={line(s) * 0.5} />
      <rect x={-s * 0.26} y={-s * 0.24} width={s * 0.52} height={s * 0.04} rx={s * 0.02} fill={INK} opacity={0.7} />
      <circle cx={s * 0.3} cy={-s * 0.3} r={s * 0.02} fill="#fff" opacity={0.5 + 0.5 * Math.sin(t * 4)} />
    </g>
    </g>
  ),
  // a tower of paychecks stacked; k (0..1) is how tall it has grown
  paytower: ({ s, t, k = 0.3 }) => {
    const n = 2 + Math.round(Math.max(0, Math.min(1, k)) * 14);
    return (
      <g>
        <Shadow w={s * 0.6} s={s} />
        {Array.from({ length: n }, (_, i) => (
          <rect key={i} x={-s * 0.25 + Math.sin(i * 1.7 + t * 0.5) * s * 0.02} y={-s * 0.065 * (i + 1)} width={s * 0.5} height={s * 0.06} rx={s * 0.01} fill={i % 2 ? "#dff5e3" : "#c9ecd1"} stroke={INK} strokeWidth={line(s) * 0.35} />
        ))}
      </g>
    );
  },
  // a share certificate: cream paper, ornate border, a gold seal
  sharecert: ({ s, t }) => (
    <g transform={`rotate(${Math.sin(t * 1.4) * 2})`}>
      <Shadow w={s * 0.9} s={s} />
      <rect x={-s * 0.42} y={-s * 0.95} width={s * 0.84} height={s * 0.9} rx={s * 0.03} fill={PALETTE.cream} stroke={INK} strokeWidth={line(s)} />
      <rect x={-s * 0.36} y={-s * 0.89} width={s * 0.72} height={s * 0.78} fill="none" stroke={PALETTE.green} strokeWidth={line(s) * 0.7} strokeDasharray={`${s * 0.04} ${s * 0.02}`} />
      {[0.75, 0.65, 0.55].map((y) => <rect key={y} x={-s * 0.25} y={-s * y} width={s * 0.5} height={s * 0.035} rx={s * 0.015} fill={PALETTE.grey} />)}
      <Ball cx={s * 0.18} cy={-s * 0.3} rx={s * 0.1} fill={PALETTE.gold} s={s} />
    </g>
  ),
};

export default props;
