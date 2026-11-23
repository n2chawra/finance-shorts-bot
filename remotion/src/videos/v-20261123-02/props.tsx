// Props for the Starbucks pay Short (v-20261123-02): the green café (drawn; Starbucks' logo is not freely licensed, so
// the name is lettered on a sign), the barista in her green apron, Brian Niccol (his CC BY 2.0 photo head on our body),
// a giant cheque, the barista's pay slip, a poster frame.
import React from "react";
import { Block, Glow, INK, STROKE, Txt, type Motion } from "../../flat/kit";
import { Char, type FaceKind } from "../../flat/cast";
import { PhotoHead } from "../../studio/photo";

export const GREEN = "#00704a";

export const Barista: React.FC<{ x: number; y: number; s: number; m: Motion; face?: FaceKind; armL?: [number, number]; armR?: [number, number]; look?: [number, number] }> = ({ x, y, s, m, face = "happy", armL, armR, look }) => (
  <g>
    <Char x={x} y={y + m.wave(58, 3)} s={s} skin="#c58c5c" top="#2b2b2b" pants="#2c3550" hair="bun" hairColor="#2a1a10" face={face} armL={armL} armR={armR} look={look} />
    {/* the green apron */}
    <path d={`M ${x - s * 0.32} ${y - s * 1.75} L ${x + s * 0.32} ${y - s * 1.75} L ${x + s * 0.4} ${y - s * 0.75} L ${x - s * 0.4} ${y - s * 0.75} Z`} fill={GREEN} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

export const Niccol: React.FC<{ x: number; y: number; s: number; m: Motion; armL?: [number, number]; armR?: [number, number]; sit?: boolean; tilt?: number }> = ({ x, y, s, m, armL, armR, sit, tilt }) => (
  <Char x={x} y={y + m.wave(64, 3)} s={s} photo="niccol" outfit="suit" top="#4b4f8c" pants="#2b2b3a" armL={armL} armR={armR} sit={sit} tilt={tilt} />
);

/** The poster of the boss: his real head in a frame with his name. Top-left (x, y). */
export const Poster: React.FC<{ x: number; y: number; w: number; glow?: number }> = ({ x, y, w, glow = 0 }) => (
  <g>
    {glow > 0 ? <Glow x={x + w / 2} y={y + w * 0.6} r={w * 0.9} color="#ffe08a" o={0.6 * glow} /> : null}
    <Block x={x} y={y} w={w} h={w * 1.3} r={10} fill="#f4efe2" shadow={false} />
    <g transform={`translate(${x + w / 2} ${y + w * 0.55})`}><PhotoHead name="niccol" r={w * 0.36} /></g>
    <rect x={x} y={y + w * 1.02} width={w} height={w * 0.28} fill={GREEN} />
    <Txt x={x + w / 2} y={y + w * 1.16} size={Math.max(44, w * 0.13)} fill="#ffffff">THE BOSS</Txt>
  </g>
);

/** A giant cheque, centre (x, y), width w; `amount` written big. */
export const Cheque: React.FC<{ x: number; y: number; w: number; amount: string; rot?: number; clip?: "left" | "right" }> = ({ x, y, w, amount, rot = 0, clip }) => {
  const h = w * 0.45;
  const id = `chq-${Math.round(x)}-${Math.round(y)}-${clip ?? "all"}`;
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <defs><clipPath id={id}><rect x={clip === "right" ? x : x - w / 2 - 20} y={y - h / 2 - 20} width={clip ? w / 2 + 20 : w + 40} height={h + 40} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect x={x - w / 2 + 8} y={y - h / 2 + 10} width={w} height={h} rx={14} fill="#000" opacity={0.25} />
        <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={14} fill="#eaf6ee" stroke={INK} strokeWidth={STROKE} />
        <rect x={x - w / 2} y={y - h / 2} width={w} height={h * 0.2} rx={14} fill={GREEN} />
        <Txt x={x - w * 0.44} y={y - h * 0.4} size={Math.min(h * 0.11, w * 0.045)} fill="#ffffff" anchor="start" deco>PAY TO THE ORDER OF</Txt>
        <Txt x={x} y={y + h * 0.08} size={h * 0.32} fill={INK}>{amount}</Txt>
        <line x1={x - w * 0.4} y1={y + h * 0.32} x2={x + w * 0.4} y2={y + h * 0.32} stroke="#9aa3b5" strokeWidth={4} />
      </g>
    </g>
  );
};

/** The barista's pay slip, centre (x, y), width w. */
export const Slip: React.FC<{ x: number; y: number; w: number; amount: string; rot?: number; k?: number }> = ({ x, y, w, amount, rot = 0, k = 1 }) => {
  if (k <= 0) return null;
  const h = w * 0.62;
  const s = 0.6 + 0.4 * Math.min(1, k);
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot}) translate(${-x} ${-y})`} opacity={Math.min(1, k * 1.4)}>
      <rect x={x - w / 2 + 6} y={y - h / 2 + 8} width={w} height={h} rx={10} fill="#000" opacity={0.22} />
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={10} fill="#ffffff" stroke={INK} strokeWidth={STROKE} />
      <Txt x={x} y={y - h * 0.28} size={Math.max(44, h * 0.15)} fill={GREEN}>HER YEAR</Txt>
      <Txt x={x} y={y + h * 0.12} size={h * 0.26} fill={INK}>{amount}</Txt>
      <rect x={x - w * 0.35} y={y + h * 0.33} width={w * 0.7} height={10} rx={5} fill="#d5d9e2" />
    </g>
  );
};

/** The café: back wall, menu board, the green sign, the espresso machine, the counter. Counter top at y=1180. */
export const CafeSet: React.FC<{ m: Motion; sign: number }> = ({ m, sign }) => (
  <g>
    <rect x={-400} y={-400} width={1880} height={2800} fill="#efe6d6" />
    <rect x={-400} y={-400} width={1880} height={560} fill="#e2d6bf" />
    {/* the sign */}
    <Glow x={540} y={250} r={360} ry={110} color="#5fdc9e" o={0.45 * sign} />
    <Block x={190} y={180} w={700} h={130} r={20} fill={sign > 0.5 ? GREEN : "#2f4f40"} shadow={false} />
    <Txt x={540} y={247} size={78} fill="#ffffff">STARBUCKS</Txt>
    {/* menu board */}
    <Block x={560} y={380} w={340} h={300} r={10} fill="#1f2a26" shadow={false} />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={590} y={420 + i * 62} width={200 - i * 20} height={20} rx={10} fill="#d9e7df" opacity={0.7} />)}
    {/* espresso machine */}
    <Block x={150} y={880} w={320} h={300} r={16} fill="#c9ced8" />
    <rect x={190} y={920} width={240} height={60} rx={8} fill="#2a2f3e" />
    <rect x={230} y={1000} width={30} height={70} fill="#5b6275" /><rect x={360} y={1000} width={30} height={70} fill="#5b6275" />
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M ${250 + i * 60} 870 q ${12 * Math.sin(m.t / 8 + i)} -50 0 -100 q ${-12 * Math.sin(m.t / 8 + i)} -50 0 -100`} fill="none" stroke="#ffffff" strokeWidth={10} strokeLinecap="round" opacity={0.5} />
    ))}
    {/* counter */}
    <Block x={-200} y={1180} w={1480} h={70} r={10} fill="#5a3a26" shadow="bottom" />
    <Block x={-200} y={1250} w={1480} h={700} fill={GREEN} shadow={false} />
  </g>
);

/** A takeaway cup, base centre at (x, y). */
export const Cup: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -55 -170 L 55 -170 L 42 0 L -42 0 Z" fill="#ffffff" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-50} y={-120} width={100} height={50} fill="#a87b5a" stroke={INK} strokeWidth={4} />
    <circle cx={0} cy={-145} r={16} fill={GREEN} />
    <rect x={-64} y={-196} width={128} height={30} rx={8} fill="#ffffff" stroke={INK} strokeWidth={6} />
  </g>
);

export default { Barista, Niccol, Poster, Cheque, Slip, CafeSet, Cup, GREEN };
