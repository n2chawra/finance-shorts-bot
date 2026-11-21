/**
 * Disaster Desk's avatar (800×800) and banner (2560×1440; the name inside YouTube's 1546×423 safe area),
 * from branding/kit.md: a navy instrument face with a cracked steel I-beam seen end-on (red hairline crack:
 * red always means the failure), and a blueprint banner of four failures (airliner tail, truss bridge, dam,
 * ferry bow door), each with its one failing part in red. Our own shapes only.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import "../doc/fonts";
import { FONT } from "../design/fonts";

const NAVY = "#0d1b2a";
const NAVY_LIGHT = "#1b3048";
const CREAM = "#efe6d2";
const STEEL = "#c9c2b2";
const RED = "#ff3b30";
const GRID = "#2b4a6b";
const AMBER = "#f2a33a";
const MONO = "'Courier Prime', 'Courier New', monospace";

const Defs: React.FC = () => (
  <defs>
    <radialGradient id="dd-light" cx="50%" cy="42%" r="70%">
      <stop offset="0%" stopColor={NAVY_LIGHT} />
      <stop offset="100%" stopColor={NAVY} />
    </radialGradient>
    <linearGradient id="dd-steel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#f6efdd" />
      <stop offset="55%" stopColor={STEEL} />
      <stop offset="100%" stopColor="#8f897c" />
    </linearGradient>
    <filter id="dd-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="dd-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#000" floodOpacity="0.55" />
    </filter>
    <filter id="dd-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={11} />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer><feFuncA type="table" tableValues="0 0.4" /></feComponentTransfer>
    </filter>
  </defs>
);

/** The I-beam end-on, centred on (0,0), height h, with a red crack down the web. */
const Beam: React.FC<{ h: number }> = ({ h }) => {
  const w = h * 0.78, f = h * 0.15, web = h * 0.17;
  const crack = `M ${web * 0.1} ${-h / 2 + f} L ${-web * 0.25} ${-h * 0.18} L ${web * 0.2} ${-h * 0.02} L ${-web * 0.15} ${h * 0.14} L ${web * 0.12} ${h / 2 - f}`;
  return (
    <g filter="url(#dd-shadow)">
      <path d={`M ${-w / 2} ${-h / 2} H ${w / 2} V ${-h / 2 + f} H ${web / 2} V ${h / 2 - f} H ${w / 2} V ${h / 2} H ${-w / 2} V ${h / 2 - f} H ${-web / 2} V ${-h / 2 + f} H ${-w / 2} Z`}
        fill="url(#dd-steel)" stroke="#2a2420" strokeWidth={h * 0.018} strokeLinejoin="round" />
      <path d={crack} fill="none" stroke={RED} strokeWidth={h * 0.022} strokeLinecap="round" strokeLinejoin="round" filter="url(#dd-glow)" />
    </g>
  );
};

export const DisasterAvatar: React.FC = () => {
  const ticks = Array.from({ length: 60 }, (_, i) => i);
  return (
    <AbsoluteFill style={{ background: NAVY }}>
      <svg width={800} height={800} viewBox="0 0 800 800">
        <Defs />
        <circle cx={400} cy={400} r={400} fill="url(#dd-light)" />
        <g transform="translate(400 400)">
          <circle r={352} fill="none" stroke={GRID} strokeWidth={4} />
          {ticks.map((i) => {
            const a = (i / 60) * Math.PI * 2 - Math.PI / 2, long = i % 5 === 0;
            const r1 = long ? 318 : 332, r2 = 350;
            return <line key={i} x1={Math.cos(a) * r1} y1={Math.sin(a) * r1} x2={Math.cos(a) * r2} y2={Math.sin(a) * r2}
              stroke={i === 0 ? RED : CREAM} strokeWidth={i === 0 ? 10 : long ? 5 : 2.5} opacity={i === 0 ? 1 : long ? 0.75 : 0.4} strokeLinecap="round" />;
          })}
          <Beam h={430} />
        </g>
        <rect width={800} height={800} filter="url(#dd-grain)" opacity={0.12} style={{ mixBlendMode: "overlay" }} />
      </svg>
    </AbsoluteFill>
  );
};

const line = { fill: "none", stroke: CREAM, strokeWidth: 5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const red = { ...line, stroke: RED, strokeWidth: 8 };

/** Four failures in one continuous line drawing, each drawn in a 520-wide cell starting at x. */
const Jet: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path {...line} d="M 0 0 C 30 -18 80 -22 140 -22 L 380 -22 L 430 -110 L 470 -110 L 455 -22 L 500 -18 L 500 6 L 140 8 C 70 8 20 6 0 0 Z" />
    <path {...line} d="M 220 -4 L 300 60 L 340 60 L 300 -4" />
    {[...Array(9)].map((_, i) => <circle key={i} cx={150 + i * 24} cy={-10} r={4} fill={CREAM} />)}
    <path {...red} d="M 410 -110 L 500 -110" filter="url(#dd-glow)" />
  </g>
);
const Bridge: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path {...line} d="M 0 0 H 520 M 20 -90 H 500 M 20 -90 L 0 0 M 500 -90 L 520 0" />
    {[...Array(8)].map((_, i) => <path key={i} {...line} strokeWidth={3.5} d={`M ${20 + i * 60} -90 L ${80 + i * 60} 0 M ${80 + i * 60} -90 L ${20 + i * 60} 0`} />)}
    <path {...line} d="M 60 0 V 110 M 460 0 V 110" />
    <path {...red} d="M 260 -90 L 290 -46 L 260 0" filter="url(#dd-glow)" />
  </g>
);
const Dam: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path {...line} d="M 0 110 H 520" />
    <path {...line} d="M 180 110 L 240 -110 L 290 -110 L 420 110" />
    <path {...line} strokeWidth={3} strokeDasharray="14 10" d="M 0 -80 H 236" />
    <path {...red} d="M 290 -110 C 330 -60 370 20 420 110" filter="url(#dd-glow)" />
  </g>
);
const Ferry: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path {...line} d="M 20 -10 L 470 -10 L 500 -60 L 500 -100 L 60 -100 L 20 -60 Z" />
    <path {...line} d="M 100 -100 V -160 H 400 V -100 M 140 -160 V -200 H 340 V -160 M 250 -200 V -240 H 290 V -200" />
    {[...Array(10)].map((_, i) => <rect key={i} x={120 + i * 26} y={-145} width={14} height={10} fill={CREAM} />)}
    <path {...line} strokeWidth={3} d="M 0 20 C 80 0 160 40 260 20 S 440 0 520 20" />
    <path {...red} d="M 500 -100 L 540 -70 L 540 -30 L 500 -60" filter="url(#dd-glow)" />
  </g>
);

export const DisasterBanner: React.FC = () => {
  const W = 2560, H = 1440;
  return (
    <AbsoluteFill style={{ background: NAVY }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs />
        <rect width={W} height={H} fill="url(#dd-light)" />
        {[...Array(Math.ceil(W / 64))].map((_, i) => <line key={`v${i}`} x1={i * 64} y1={0} x2={i * 64} y2={H} stroke={GRID} strokeWidth={i % 4 === 0 ? 2 : 1} opacity={0.5} />)}
        {[...Array(Math.ceil(H / 64))].map((_, i) => <line key={`h${i}`} x1={0} y1={i * 64} x2={W} y2={i * 64} stroke={GRID} strokeWidth={i % 4 === 0 ? 2 : 1} opacity={0.5} />)}
        <g opacity={0.95}>
          <Jet x={90} y={420} />
          <Bridge x={1950} y={430} />
          <Dam x={90} y={1090} />
          <Ferry x={1950} y={1110} />
        </g>
        <g transform={`translate(${W / 2} ${H / 2})`}>
          <rect x={-760} y={-200} width={1520} height={400} fill={NAVY} opacity={0.82} rx={10} />
          <rect x={-760} y={-200} width={1520} height={400} fill="none" stroke={CREAM} strokeOpacity={0.35} strokeWidth={3} rx={10} />
          <rect x={-760} y={-200} width={14} height={400} fill={RED} />
          <text x={0} y={-10} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={150} letterSpacing={14} fill={CREAM}>DISASTER DESK</text>
          <text x={0} y={92} textAnchor="middle" fontFamily={FONT} fontWeight={500} fontSize={58} fill={STEEL}>What went wrong, and the rule that changed</text>
          <text x={700} y={168} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={34} letterSpacing={4} fill={AMBER}>FROM THE OFFICIAL REPORTS</text>
        </g>
        <rect width={W} height={H} filter="url(#dd-grain)" opacity={0.1} style={{ mixBlendMode: "overlay" }} />
      </svg>
    </AbsoluteFill>
  );
};
