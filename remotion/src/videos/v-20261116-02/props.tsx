// Props for the Larry Ellison Short: share certificates and their stacks, a padlock, a pay slip, a desk lamp,
// a banker, and Larry Ellison as a bobblehead (his real cut-out head, CC BY 2.0, on our body) with his name on a plate.
import React from "react";
import { Ball, Block, Glow, INK, STROKE, Txt } from "../../flat/kit";
import { Char } from "../../flat/cast";

/** One share certificate, face on: cream paper, an ornate border, a seal. */
export const Certificate: React.FC<{ x: number; y: number; w: number; rot?: number }> = ({ x, y, w, rot = 0 }) => {
  const h = w * 0.66;
  return (
    <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x + 8} y={y + 10} width={w} height={h} rx={6} fill="#000" opacity={0.25} />
      <rect x={x} y={y} width={w} height={h} rx={6} fill="#f6ecd2" stroke={INK} strokeWidth={STROKE} />
      <rect x={x + w * 0.06} y={y + h * 0.09} width={w * 0.88} height={h * 0.82} fill="none" stroke="#3f8f6a" strokeWidth={Math.max(3, w * 0.02)} strokeDasharray={`${w * 0.03} ${w * 0.015}`} />
      <rect x={x + w * 0.2} y={y + h * 0.22} width={w * 0.6} height={h * 0.1} fill="#c74634" />
      <rect x={x + w * 0.16} y={y + h * 0.45} width={w * 0.5} height={h * 0.05} fill="#bfae86" />
      <rect x={x + w * 0.16} y={y + h * 0.58} width={w * 0.42} height={h * 0.05} fill="#bfae86" />
      <circle cx={x + w * 0.76} cy={y + h * 0.66} r={w * 0.09} fill="#d4af37" stroke={INK} strokeWidth={3} />
    </g>
  );
};

/** A stack of certificates seen side on: `n` sheets of paper, edges alternating cream and green. */
export const CertStack: React.FC<{ x: number; y: number; w: number; n: number; sheet?: number }> = ({ x, y, w, n, sheet = 22 }) => (
  <g>
    {Array.from({ length: Math.max(0, Math.floor(n)) }).map((_, i) => (
      <rect key={i} x={x + ((i * 7) % 3) * 4 - 4} y={y - (i + 1) * sheet} width={w} height={sheet} fill={i % 2 ? "#f6ecd2" : "#e8dcb8"} stroke={INK} strokeWidth={3} />
    ))}
    {Array.from({ length: Math.max(0, Math.floor(n / 6)) }).map((_, i) => (
      <rect key={`b${i}`} x={x + w * 0.42} y={y - (i * 6 + 4) * sheet} width={w * 0.16} height={sheet * 2} fill="#c74634" stroke={INK} strokeWidth={2} />
    ))}
  </g>
);

/** A padlock; `shut` 0..1 closes the shackle. */
export const Padlock: React.FC<{ x: number; y: number; s: number; shut?: number }> = ({ x, y, s, shut = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M -40 ${-10 - (1 - shut) * 40} L -40 ${-60 - (1 - shut) * 40} A 40 40 0 0 1 40 ${-60 - (1 - shut) * 40} L 40 -10`} stroke="#9aa3b5" strokeWidth={18} fill="none" />
    <path d={`M -40 ${-10 - (1 - shut) * 40} L -40 ${-60 - (1 - shut) * 40} A 40 40 0 0 1 40 ${-60 - (1 - shut) * 40} L 40 -10`} stroke={INK} strokeWidth={4} fill="none" />
    <Block x={-70} y={-20} w={140} h={110} r={14} fill="#d4af37" />
    <circle cx={0} cy={25} r={14} fill={INK} />
    <rect x={-5} y={25} width={10} height={34} fill={INK} />
  </g>
);

/** The billionaire stand-in: a suit, silver hair, and a name plate he carries on his chest. */
export const Ellison: React.FC<{ x: number; y: number; s: number; face?: "neutral" | "smirk" | "grin" | "happy"; armL?: [number, number]; armR?: [number, number]; back?: boolean; sit?: boolean; plate?: boolean; look?: [number, number] }> = ({
  x, y, s, face = "smirk", armL = [20, 10], armR = [20, 10], back, sit, plate = true, look,
}) => (
  <g>
    <Char x={x} y={y} s={s} outfit="suit" top="#1f2433" pants="#1f2433" accent="#c74634" hair="side" hairColor="#d9d6d0" skin="#e6b08a"
      face={face} armL={armL} armR={armR} back={back} sit={sit} look={look} photo="ellison" />
    {plate && !back ? (
      <g>
        <rect x={x - Math.max(s * 0.62, 220)} y={y - s * (sit ? 1.0 : 1.45)} width={Math.max(s * 1.24, 440)} height={Math.max(s * 0.3, 70)} rx={8} fill="#d4af37" stroke={INK} strokeWidth={4} />
        <Txt x={x} y={y - s * (sit ? 1.0 : 1.45) + Math.max(s * 0.15, 35)} size={46} fill={INK}>LARRY ELLISON</Txt>
      </g>
    ) : null}
  </g>
);

/** A banker: waistcoat, glasses. */
export const Banker: React.FC<{ x: number; y: number; s: number; face?: "neutral" | "smirk" | "grin" | "happy" | "shock" | "worried"; armL?: [number, number]; armR?: [number, number]; look?: [number, number] }> = (q) => (
  <Char x={q.x} y={q.y} s={q.s} outfit="shirt" top="#3a4a6a" pants="#2a2f3d" hair="bald" glasses moustache skin="#c98652" face={q.face ?? "neutral"} armL={q.armL} armR={q.armR} look={q.look} />
);

/** A bag of cash. */
export const CashBag: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -60 0 Q -80 -70 -30 -100 L 30 -100 Q 80 -70 60 0 Z" fill="#c9a36a" stroke={INK} strokeWidth={5} />
    <rect x={-34} y={-118} width={68} height={22} rx={8} fill="#8a6a3a" stroke={INK} strokeWidth={4} />
    <Ball x={0} y={-50} r={22} fill="#3a9d5d" sw={3} shadow={false} />
  </g>
);

/** A desk lamp's warm pool of light. */
export const Lamp: React.FC<{ x: number; y: number; on?: number }> = ({ x, y, on = 1 }) => (
  <g>
    <line x1={x} y1={y} x2={x + 60} y2={y - 160} stroke={INK} strokeWidth={14} />
    <line x1={x + 60} y1={y - 160} x2={x + 160} y2={y - 120} stroke={INK} strokeWidth={14} />
    <path d={`M ${x + 120} ${y - 150} L ${x + 220} ${y - 120} L ${x + 190} ${y - 60} Z`} fill="#3fb6a0" stroke={INK} strokeWidth={5} />
    <Block x={x - 50} y={y - 10} w={100} h={24} r={8} fill="#2b2b33" />
    <Glow x={x + 200} y={y + 40} r={360} color="#ffd890" o={0.5 * on} />
  </g>
);

export default Certificate;
