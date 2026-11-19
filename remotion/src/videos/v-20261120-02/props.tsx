// Props for the McDonald's crew-vs-CEO Short: the counter under the golden arches, a crew member in a red cap,
// a fry carton, a pay slip, the head office tower, a vault of share certificates, a balance scale, a calendar road.
import React from "react";
import { Block, Glow, INK, Txt, shade, type Motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Photo } from "../../studio/photo";

export const RED = "#d62d20";
export const GOLD = "#ffc72c";

/** A carton of fries. */
export const Fries: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-38, -22, -6, 10, 26, 40].map((dx, i) => (
      <rect key={i} x={dx - 8} y={-150 + (i % 3) * 14} width={16} height={110} rx={4} fill="#ffd34d" stroke={INK} strokeWidth={4} transform={`rotate(${dx / 6} ${dx} -40)`} />
    ))}
    <path d="M -60 -70 L 60 -70 L 48 40 L -48 40 Z" fill={RED} stroke={INK} strokeWidth={6} />
    <path d="M -24 -40 Q 0 -10 24 -40" fill="none" stroke={GOLD} strokeWidth={9} />
  </g>
);

/** A crew member in the red cap and shirt. */
export const Crew: React.FC<React.ComponentProps<typeof Char>> = (p) => (
  <Char skin="#e2b48f" top={RED} pants="#2c2c38" hair="cap" hat={RED} hairColor="#6b4a2c" outfit="tee" {...p} />
);

/** A pay slip: white paper, a red head strip, the figure big on it. */
export const PaySlip: React.FC<{ x: number; y: number; w: number; value: string; label: string; k?: number; rot?: number }> = ({ x, y, w, value, label, k = 1, rot = 0 }) => {
  if (k <= 0) return null;
  const h = w * 0.62;
  const s = 0.4 + 0.6 * Math.min(1, k);
  return (
    <g transform={`translate(${x + w / 2} ${y + h / 2}) rotate(${rot}) scale(${s}) translate(${-w / 2} ${-h / 2})`}>
      <rect x={8} y={12} width={w} height={h} rx={10} fill="#000" opacity={0.25} />
      <Block x={0} y={0} w={w} h={h} r={10} fill="#fffaf0" shadow={false} />
      <rect x={3} y={3} width={w - 6} height={h * 0.26} rx={8} fill={RED} />
      <Txt x={w / 2} y={h * 0.14} size={50} fill="#ffffff">{label}</Txt>
      <Txt x={w / 2} y={h * 0.6} size={Math.min(110, w * 0.2)} fill={INK}>{value}</Txt>
      {[0.82, 0.9].map((f) => <rect key={f} x={w * 0.15} y={h * f} width={w * 0.7} height={6} rx={3} fill="#d8d0c0" />)}
    </g>
  );
};

/** The restaurant: red wall, menu boards, the real golden arches big over the counter, the crew member behind it. */
export const Restaurant: React.FC<{ m: Motion; lit: number; crewArm?: number; menu?: React.ReactNode; children?: React.ReactNode }> = ({ m, lit, crewArm = 0, menu, children }) => (
  <g>
    <rect x={-500} y={-500} width={2080} height={3000} fill="#7a1a14" />
    <rect x={-500} y={180} width={2080} height={900} fill="#b8241a" />
    {/* menu boards */}
    {[-180, 840].map((x, i) => (
      <g key={i}>
        <Block x={x} y={300} w={400} h={300} r={12} fill="#1d1a2b" />
        {[0, 1, 2].map((r) => <rect key={r} x={x + 30} y={340 + r * 80} width={340} height={50} rx={8} fill={["#ffd34d", "#f4f1e8", "#e9473b"][r]} opacity={0.75 + 0.2 * Math.sin(m.t / 7 + r + i)} />)}
      </g>
    ))}
    {menu}
    {/* the golden arches, the real logo */}
    <Glow x={540} y={420} r={360} color={GOLD} o={0.18 + 0.35 * lit} />
    <g transform={`translate(540 ${640}) scale(${0.85 + 0.15 * lit})`} opacity={0.35 + 0.65 * lit}>
      <Photo name="mcdonalds" s={440} t={m.t / 30} />
    </g>
    {/* the crew member behind the counter */}
    <Crew x={720} y={1240 + m.wave(56, 3)} s={250} face="happy" look={[-0.8, 0.2]} armR={[40 + 60 * crewArm, 30 + 40 * crewArm]} armL={[14, 10]} />
    {/* the counter */}
    <Block x={-300} y={1060} w={1680} h={420} fill="#e7e1d6" />
    <rect x={-300} y={1060} width={1680} height={40} fill="#c8bfae" />
    <Block x={60} y={1160} w={960} h={60} r={8} fill={RED} shadow={false} />
    {children}
  </g>
);

/** The head office tower at dusk, its top window lit gold. */
export const Tower: React.FC<{ m: Motion; top: number }> = ({ m, top }) => (
  <g>
    <rect x={-500} y={-1200} width={2080} height={4000} fill="#2b2350" />
    <rect x={-500} y={900} width={2080} height={1800} fill="#e07a4a" opacity={0.5} />
    {[-260, 900, 1180].map((x, i) => <Block key={i} x={x} y={500 + i * 120} w={260} h={1600} fill="#3a3366" />)}
    <Block x={250} y={-200} w={580} h={2400} fill="#4a5578" />
    {Array.from({ length: 13 }).map((_, r) => [0, 1, 2, 3].map((c) => (
      <rect key={`${r}-${c}`} x={290 + c * 132} y={-60 + r * 150} width={100} height={100} rx={6}
        fill={(r * 4 + c) % 5 === 0 ? "#ffd98a" : "#283152"} opacity={0.9} />
    )))}
    {/* the top floor */}
    <Block x={300} y={-160} w={480} h={150} r={10} fill={top > 0.5 ? GOLD : "#283152"} />
    <Glow x={540} y={-90} r={420} color={GOLD} o={0.6 * top + 0.05 * m.wave(20, 1)} />
    <Block x={-500} y={2150} w={2080} h={400} fill="#3a3a48" />
  </g>
);

/** A share certificate with the arches in gold. */
export const Certificate: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = 0 }) => (
  <g transform={`rotate(${rot} ${x + 80} ${y + 55})`}>
    <rect x={x} y={y} width={160} height={110} rx={6} fill="#f6ecd2" stroke={INK} strokeWidth={4} />
    <rect x={x + 10} y={y + 10} width={140} height={90} rx={4} fill="none" stroke="#3f7a52" strokeWidth={4} />
    <path d={`M ${x + 52} ${y + 84} Q ${x + 66} ${y + 18} ${x + 80} ${y + 70} Q ${x + 94} ${y + 18} ${x + 108} ${y + 84}`} fill="none" stroke={GOLD} strokeWidth={9} />
  </g>
);

/** A small castle on the horizon. */
export const Castle: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Block x={-90} y={-160} w={180} h={160} fill="#8a7f9a" shadow={false} />
    {[-90, 40].map((dx) => <Block key={dx} x={dx} y={-230} w={50} h={230} fill="#9a8fae" shadow={false} />)}
    <path d="M -100 -230 L -65 -290 L -30 -230 Z M 30 -230 L 65 -290 L 100 -230 Z" fill="#6a4a7a" stroke={INK} strokeWidth={4} />
    <rect x={-20} y={-70} width={40} height={70} rx={20} fill={shade("#8a7f9a", -0.5)} />
  </g>
);

export default Restaurant;
