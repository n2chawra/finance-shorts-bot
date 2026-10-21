/**
 * More lit, layered sets (see studio/sets.tsx for the layer contract): an office at dusk, a bank
 * hall with its vault door, and an Indian street market at night.
 */
import React from "react";
import { random } from "remotion";
import { Dust, type SetArgs } from "./sets";

const r = (seed: string, k: string | number) => random(`${seed}:${k}`);

// ---------------- an office floor at dusk ----------------

export const OfficeBack: React.FC<SetArgs> = ({ w, h, t, seed }) => {
  const g = h * 0.74;
  return (
    <svg width={w} height={h} style={{ position: "absolute" }}>
      <defs>
        <linearGradient id={`${seed}os`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f2a65a" /><stop offset="0.6" stopColor="#c2607a" /><stop offset="1" stopColor="#5b3d78" /></linearGradient>
        <linearGradient id={`${seed}ow`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b4257" /><stop offset="1" stopColor="#2a2f40" /></linearGradient>
        <radialGradient id={`${seed}om`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#8ec5ff" stopOpacity="0.55" /><stop offset="1" stopColor="#8ec5ff" stopOpacity="0" /></radialGradient>
      </defs>
      {/* the glass wall on a sunset city */}
      <rect width={w} height={g} fill={`url(#${seed}os)`} />
      {Array.from({ length: 10 }, (_, i) => {
        const bw = w * (0.08 + r(seed, `w${i}`) * 0.08), bx = i * w * 0.11 - ((t * 4) % (w * 0.11)), bh = g * (0.25 + r(seed, `h${i}`) * 0.4);
        return <rect key={i} x={bx} y={g - bh} width={bw} height={bh} fill="#3d2f57" opacity={0.85} />;
      })}
      {[0.2, 0.4, 0.6, 0.8].map((f) => <rect key={f} x={w * f - 5} y={0} width={10} height={g} fill="#262a38" />)}
      <rect y={0} width={w} height={h * 0.05} fill="#20232f" />
      {Array.from({ length: 3 }, (_, i) => <rect key={i} x={w * (0.12 + i * 0.3)} y={h * 0.05} width={w * 0.18} height={10} rx={5} fill="#fdfcf2" />)}
      {/* rows of cubicles with glowing monitors */}
      {Array.from({ length: 3 }, (_, row) => {
        const y = g - h * 0.04 + row * h * 0.035, sc = 0.6 + row * 0.2;
        return Array.from({ length: 5 }, (_, i) => {
          const x = w * (0.05 + i * 0.21) + row * 40;
          const flick = 0.75 + 0.25 * Math.sin(t * 3 + i * 1.7 + row);
          return (
            <g key={`${row}${i}`} transform={`translate(${x},${y}) scale(${sc})`}>
              <ellipse cx={60} cy={-70} rx={120} ry={80} fill={`url(#${seed}om)`} opacity={flick} />
              <rect x={10} y={-120} width={100} height={64} rx={6} fill="#1b2030" />
              <rect x={16} y={-114} width={88} height={52} rx={3} fill="#7fb6ff" opacity={flick} />
              <rect x={-20} y={-50} width={180} height={54} fill="#5c6478" />
              <rect x={-20} y={-54} width={180} height={8} fill="#7a8399" />
            </g>
          );
        });
      })}
      <rect y={g} width={w} height={h - g} fill={`url(#${seed}ow)`} />
      {Array.from({ length: 7 }, (_, i) => <line key={i} x1={w * 0.5 + (i - 3) * w * 0.12} y1={g} x2={w * 0.5 + (i - 3) * w * 0.42} y2={h} stroke="#454c62" strokeWidth={3} />)}
    </svg>
  );
};

export const OfficeFront: React.FC<SetArgs> = ({ w, h, t, seed }) => (
  <svg width={w} height={h} style={{ position: "absolute" }}>
    {/* the edge of a desk with a coffee mug steaming, closest to the lens */}
    <rect x={w * 0.62} y={h * 0.9} width={w * 0.5} height={h * 0.12} rx={14} fill="#4a5164" />
    <rect x={w * 0.8} y={h * 0.84} width={70} height={80} rx={12} fill="#e9e5dc" />
    {Array.from({ length: 3 }, (_, i) => {
      const k = ((t * 0.6 + i / 3) % 1);
      return <path key={i} d={`M${w * 0.8 + 25 + i * 10},${h * 0.84 - k * 90} q-12,-20 0,-40`} stroke="#ffffff" strokeWidth={6} fill="none" opacity={(1 - k) * 0.5} strokeLinecap="round" />;
    })}
    <Dust w={w} h={h} t={t} seed={seed} x={0} y={h * 0.1} rw={w} rh={h * 0.6} color="#ffe1c2" n={16} />
  </svg>
);

// ---------------- a bank hall ----------------

export const BankBack: React.FC<SetArgs> = ({ w, h, t, seed }) => {
  const g = h * 0.75;
  const turn = (t * 8) % 360;
  return (
    <svg width={w} height={h} style={{ position: "absolute" }}>
      <defs>
        <linearGradient id={`${seed}bw`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9dfc9" /><stop offset="1" stopColor="#cdbf9f" /></linearGradient>
        <radialGradient id={`${seed}bl`} cx="0.5" cy="0" r="0.9"><stop offset="0" stopColor="#fff7dc" stopOpacity="0.6" /><stop offset="1" stopColor="#fff7dc" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={w} height={g} fill={`url(#${seed}bw)`} />
      {/* marble columns */}
      {[0.06, 0.3, 0.7, 0.94].map((f) => (
        <g key={f}><rect x={w * f - 40} y={h * 0.05} width={80} height={g - h * 0.05} fill="#f6f0e2" /><rect x={w * f - 52} y={h * 0.05} width={104} height={24} fill="#ded3ba" />
          {[0.25, 0.5, 0.75].map((q) => <rect key={q} x={w * f - 40 + 80 * q - 3} y={h * 0.08} width={6} height={g - h * 0.1} fill="#e2d9c4" />)}</g>
      ))}
      {/* the vault door, wheel turning slowly */}
      <g transform={`translate(${w * 0.5},${h * 0.36})`}>
        <circle r={w * 0.17} fill="#9aa2ad" stroke="#6c737c" strokeWidth={14} />
        <circle r={w * 0.13} fill="#b7bec8" />
        <g transform={`rotate(${turn})`}>{[0, 60, 120].map((d) => <rect key={d} x={-w * 0.11} y={-8} width={w * 0.22} height={16} rx={8} fill="#5e646d" transform={`rotate(${d})`} />)}<circle r={26} fill="#5e646d" /></g>
      </g>
      {/* teller counter with glass and queue posts */}
      <rect x={0} y={g - h * 0.16} width={w} height={h * 0.16} fill="#7a4f33" />
      <rect x={0} y={g - h * 0.17} width={w} height={h * 0.015} fill="#5a3824" />
      {[0.2, 0.5, 0.8].map((f) => <g key={f}><rect x={w * f - w * 0.11} y={g - h * 0.33} width={w * 0.22} height={h * 0.16} fill="#bfe3f2" opacity={0.35} stroke="#8a6a50" strokeWidth={6} />
        <rect x={w * f - 60} y={g - h * 0.3} width={120} height={36} rx={6} fill="#2f4f8a" /></g>)}
      <rect width={w} height={g} fill={`url(#${seed}bl)`} />
      <rect y={g} width={w} height={h - g} fill="#c8bda7" />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={i * w / 5 - 40} y={g} width={w / 5} height={h - g} fill={i % 2 ? "#bfb39c" : "#d2c7b1"} />)}
    </svg>
  );
};

export const BankFront: React.FC<SetArgs> = ({ w, h, t, seed }) => (
  <svg width={w} height={h} style={{ position: "absolute" }}>
    {/* queue posts and their red rope, closest to the lens */}
    {[0.08, 0.5, 0.92].map((f) => <g key={f}><rect x={w * f - 12} y={h * 0.8} width={24} height={h * 0.2} fill="#c9a24a" /><circle cx={w * f} cy={h * 0.8} r={22} fill="#e2bc5c" /></g>)}
    <path d={`M${w * 0.08},${h * 0.82} Q${w * 0.29},${h * 0.88 + Math.sin(t * 1.5) * 6} ${w * 0.5},${h * 0.82} Q${w * 0.71},${h * 0.88 + Math.cos(t * 1.4) * 6} ${w * 0.92},${h * 0.82}`} stroke="#b3202f" strokeWidth={22} fill="none" />
    <Dust w={w} h={h} t={t} seed={seed} x={w * 0.2} y={0} rw={w * 0.6} rh={h * 0.7} n={18} />
  </svg>
);

// ---------------- an Indian street market at night ----------------

export const MarketBack: React.FC<SetArgs> = ({ w, h, t, seed }) => {
  const g = h * 0.76;
  const colors = ["#e8613c", "#f2b134", "#3d9a6e", "#3d6fb5", "#c2457a"];
  return (
    <svg width={w} height={h} style={{ position: "absolute" }}>
      <defs><linearGradient id={`${seed}ms`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#141633" /><stop offset="1" stopColor="#3b2a4a" /></linearGradient></defs>
      <rect width={w} height={g} fill={`url(#${seed}ms)`} />
      {/* buildings with balconies, wires overhead */}
      {Array.from({ length: 6 }, (_, i) => {
        const bx = i * w * 0.18 - 30, bw = w * 0.2, bh = g * (0.55 + r(seed, `bh${i}`) * 0.35);
        return <g key={i}><rect x={bx} y={g - bh} width={bw} height={bh} fill={["#4a3c5c", "#3f4a63", "#5a4048"][i % 3]} />
          {Array.from({ length: 4 }, (_, j) => <rect key={j} x={bx + 20} y={g - bh + 40 + j * bh * 0.2} width={bw - 40} height={bh * 0.08} fill="#2a2235" />)}
          {Array.from({ length: 4 }, (_, j) => <rect key={`w${j}`} x={bx + 30 + (j % 2) * bw * 0.45} y={g - bh + 60 + Math.floor(j / 2) * bh * 0.3} width={36} height={44} fill={r(seed, `l${i}${j}`) > 0.4 ? "#ffcf6b" : "#2a2235"} />)}</g>;
      })}
      {Array.from({ length: 3 }, (_, i) => <path key={i} d={`M0,${h * (0.12 + i * 0.05)} Q${w / 2},${h * (0.2 + i * 0.05)} ${w},${h * (0.1 + i * 0.05)}`} stroke="#0c0c14" strokeWidth={3} fill="none" />)}
      {/* stall awnings and hanging bulbs, swaying */}
      {Array.from({ length: 4 }, (_, i) => {
        const x = i * w * 0.27 - 20, sw = w * 0.3;
        return <g key={i}>
          <path d={`M${x},${g - h * 0.2} L${x + sw},${g - h * 0.2} L${x + sw - 20},${g - h * 0.16} L${x + 20},${g - h * 0.16}Z`} fill={colors[i % 5]} />
          {Array.from({ length: 6 }, (_, j) => <rect key={j} x={x + 20 + j * (sw - 40) / 6} y={g - h * 0.2} width={(sw - 40) / 12} height={h * 0.04} fill="#ffffff" opacity={0.25} />)}
          <rect x={x + 10} y={g - h * 0.16} width={sw - 20} height={h * 0.16} fill="#2a2030" />
          {Array.from({ length: 8 }, (_, j) => <circle key={`f${j}`} cx={x + 30 + (j % 4) * (sw - 60) / 3} cy={g - h * 0.1 + Math.floor(j / 4) * 40} r={16} fill={colors[(i + j) % 5]} />)}
          {[0.3, 0.7].map((f) => {
            const sway = Math.sin(t * 2 + i + f * 5) * 6;
            return <g key={f}><line x1={x + sw * f} y1={g - h * 0.2} x2={x + sw * f + sway} y2={g - h * 0.13} stroke="#111" strokeWidth={2} />
              <circle cx={x + sw * f + sway} cy={g - h * 0.125} r={10} fill="#fff1b0" /><circle cx={x + sw * f + sway} cy={g - h * 0.125} r={36} fill="#ffe08a" opacity={0.2} /></g>;
          })}
        </g>;
      })}
      <rect y={g} width={w} height={h - g} fill="#3a3340" />
      {/* an auto-rickshaw driving past in the distance */}
      <g transform={`translate(${((t * 140) % (w + 400)) - 200},${g + 30}) scale(0.7)`}>
        <path d="M0,0 L0,-90 Q10,-130 60,-130 L150,-130 L170,-60 L170,0Z" fill="#f2c230" /><rect x={0} y={-95} width={170} height={40} fill="#2d6a3e" />
        <circle cx={30} cy={6} r={22} fill="#1b1b1b" /><circle cx={150} cy={6} r={22} fill="#1b1b1b" /><circle cx={172} cy={-40} r={8} fill="#fff6c2" />
      </g>
    </svg>
  );
};

export const MarketFront: React.FC<SetArgs> = ({ w, h, t, seed }) => (
  <svg width={w} height={h} style={{ position: "absolute" }}>
    {/* a fruit cart corner and a string of bulbs, closest to the lens */}
    <rect x={-w * 0.05} y={h * 0.86} width={w * 0.38} height={h * 0.16} rx={12} fill="#6b4a2f" />
    {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={w * (0.02 + (i % 5) * 0.06)} cy={h * 0.86 - 14 - Math.floor(i / 5) * 26} r={22} fill={["#e8613c", "#f2b134", "#7cc36d"][i % 3]} />)}
    <path d={`M0,${h * 0.04} Q${w / 2},${h * 0.1 + Math.sin(t) * 6} ${w},${h * 0.03}`} stroke="#222" strokeWidth={3} fill="none" />
    {Array.from({ length: 9 }, (_, i) => {
      const x = i * w / 8, y = h * 0.04 + Math.sin((i / 8) * Math.PI) * h * 0.06 + Math.sin(t + i) * 3;
      return <g key={i}><circle cx={x} cy={y + 14} r={9} fill={["#ffd36b", "#ff8a6b", "#9be3ff"][i % 3]} /><circle cx={x} cy={y + 14} r={28} fill="#ffe08a" opacity={0.18 + 0.1 * Math.sin(t * 3 + i)} /></g>;
    })}
    <Dust w={w} h={h} t={t} seed={seed} x={0} y={h * 0.2} rw={w} rh={h * 0.6} color="#ffd9a0" n={20} />
  </svg>
);
