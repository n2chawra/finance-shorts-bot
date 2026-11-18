/**
 * The tech channel's avatar (800×800) and banner (2560×1440, text inside YouTube's 1546×423 safe area),
 * drawn with plain shapes in the channel's studio look: near-black navy, a faint floor grid, steel grey
 * and white, one amber accent. No channel name on them, so they fit whichever name the owner picks.
 */
import React from "react";
import { AbsoluteFill } from "remotion";

const BG = "#0b0e14";
const STEEL = "#3a4252";
const STEEL_LIGHT = "#5b6577";
const AMBER = "#ffb23e";

/** A chip seen from above: package, pins on four sides, the die, and an amber core that glows. */
const Chip: React.FC<{ cx: number; cy: number; size: number; pins?: number }> = ({ cx, cy, size, pins = 7 }) => {
  const s = size;
  const x = cx - s / 2;
  const y = cy - s / 2;
  const pinLen = s * 0.16;
  const pinW = s * 0.05;
  const step = s / (pins + 1);
  const sides: React.ReactNode[] = [];
  for (let i = 1; i <= pins; i++) {
    const p = x + i * step - pinW / 2;
    const q = y + i * step - pinW / 2;
    sides.push(
      <rect key={`t${i}`} x={p} y={y - pinLen} width={pinW} height={pinLen} rx={pinW * 0.25} fill={STEEL_LIGHT} />,
      <rect key={`b${i}`} x={p} y={y + s} width={pinW} height={pinLen} rx={pinW * 0.25} fill={STEEL_LIGHT} />,
      <rect key={`l${i}`} x={x - pinLen} y={q} width={pinLen} height={pinW} rx={pinW * 0.25} fill={STEEL_LIGHT} />,
      <rect key={`r${i}`} x={x + s} y={q} width={pinLen} height={pinW} rx={pinW * 0.25} fill={STEEL_LIGHT} />,
    );
  }
  const die = s * 0.56;
  const core = s * 0.26;
  return (
    <g>
      {sides}
      <rect x={x} y={y} width={s} height={s} rx={s * 0.07} fill={STEEL} stroke={STEEL_LIGHT} strokeWidth={s * 0.012} />
      <rect x={cx - die / 2} y={cy - die / 2} width={die} height={die} rx={s * 0.03} fill="#20262f" stroke="#6c778a" strokeWidth={s * 0.008} />
      {/* the die's blocks: grey cells, one amber core */}
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => {
        const cell = die / 3.6;
        const gx = cx - die / 2 + die * 0.08 + c * (cell + die * 0.04);
        const gy = cy - die / 2 + die * 0.08 + r * (cell + die * 0.04);
        return <rect key={`c${r}${c}`} x={gx} y={gy} width={cell} height={cell} rx={cell * 0.12} fill={r === 1 && c === 1 ? "none" : "#2c3440"} />;
      }))}
      <circle cx={cx} cy={cy} r={core * 0.9} fill="url(#amberGlow)" />
      <rect x={cx - core / 2} y={cy - core / 2} width={core} height={core} rx={core * 0.12} fill={AMBER} />
      <rect x={cx - core / 2 + core * 0.12} y={cy - core / 2 + core * 0.12} width={core * 0.35} height={core * 0.12} rx={core * 0.05} fill="#fff3d9" opacity={0.8} />
    </g>
  );
};

const Defs: React.FC = () => (
  <defs>
    <radialGradient id="amberGlow">
      <stop offset="0%" stopColor={AMBER} stopOpacity={0.9} />
      <stop offset="100%" stopColor={AMBER} stopOpacity={0} />
    </radialGradient>
    <radialGradient id="studioLight" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stopColor="#1b2230" />
      <stop offset="100%" stopColor={BG} />
    </radialGradient>
  </defs>
);

/** A faint perspective floor grid from a horizon line down to the bottom edge. */
const FloorGrid: React.FC<{ w: number; h: number; horizon: number; lines?: number }> = ({ w, h, horizon, lines = 26 }) => {
  const vx = w / 2;
  const out: React.ReactNode[] = [];
  for (let i = -lines; i <= lines; i++) {
    out.push(<line key={`v${i}`} x1={vx} y1={horizon} x2={vx + i * (w / lines) * 1.6} y2={h} stroke="#2a3344" strokeWidth={2} />);
  }
  for (let k = 1; k <= 12; k++) {
    const t = Math.pow(k / 12, 2.2);
    const yy = horizon + (h - horizon) * t;
    out.push(<line key={`h${k}`} x1={0} y1={yy} x2={w} y2={yy} stroke="#2a3344" strokeWidth={2} />);
  }
  return <g opacity={0.8}>{out}</g>;
};

export const TechAvatar: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <svg width={800} height={800} viewBox="0 0 800 800">
      <Defs />
      <circle cx={400} cy={400} r={400} fill="url(#studioLight)" />
      {/* amber traces leaving the chip */}
      {([[-1, 0], [1, 0], [0, -1], [0, 1]] as const).map(([dx, dy], i) => (
        <g key={i} stroke={AMBER} strokeWidth={12} strokeLinecap="round" fill="none" opacity={0.85}>
          <path d={`M ${400 + dx * 250} ${400 + dy * 250} L ${400 + dx * 320 + dy * 60} ${400 + dy * 320 + dx * 60}`} />
          <circle cx={400 + dx * 320 + dy * 60} cy={400 + dy * 320 + dx * 60} r={14} fill={AMBER} stroke="none" />
        </g>
      ))}
      <Chip cx={400} cy={400} size={400} />
    </svg>
  </AbsoluteFill>
);

export const TechBanner: React.FC = () => {
  // circuit traces running from the chip to both edges, amber pulses on a few
  const traces: Array<{ d: string; amber: boolean }> = [
    { d: "M 1082 340 H 820 L 740 260 H 120", amber: true },
    { d: "M 1082 420 H 700 L 620 500 H 0", amber: false },
    { d: "M 1082 500 H 860 L 780 580 H 300", amber: false },
    { d: "M 1478 340 H 1740 L 1820 260 H 2440", amber: false },
    { d: "M 1478 420 H 1860 L 1940 500 H 2560", amber: true },
    { d: "M 1478 500 H 1700 L 1780 580 H 2260", amber: false },
  ];
  return (
    <AbsoluteFill style={{ background: BG }}>
      <svg width={2560} height={1440} viewBox="0 0 2560 1440">
        <Defs />
        <rect width={2560} height={1440} fill="url(#studioLight)" />
        <FloorGrid w={2560} h={1440} horizon={900} />
        {traces.map((t, i) => (
          <path key={i} d={t.d} stroke={t.amber ? AMBER : STEEL_LIGHT} strokeWidth={8} fill="none" strokeLinejoin="round" opacity={t.amber ? 0.9 : 0.6} />
        ))}
        {/* the chip sits behind the tagline's card, its core glowing above it */}
        <Chip cx={1280} cy={420} size={300} pins={6} />
        {/* the tagline inside the safe area every device shows (1546×423, centred) */}
        <rect x={507} y={590} width={1546} height={260} rx={36} fill="#05070b" opacity={0.86} stroke={STEEL} strokeWidth={3} />
        <text x={1280} y={705} fontFamily="Poppins" fontWeight={800} fontSize={78} textAnchor="middle" fill="#ffffff">How the things you use actually work</text>
        <text x={1280} y={800} fontFamily="Poppins" fontWeight={600} fontSize={54} textAnchor="middle" fill={AMBER}>Chips · AI · phones · the internet</text>
      </svg>
    </AbsoluteFill>
  );
};
