// Props for the bitcoin pizza Short: Laszlo (drawn: no freely licensed photo of him exists), the Papa John's driver,
// a pizza box with the real Papa John's logo, the laptop, the hallway by the front door at night, a bitcoin coin.
import React from "react";
import { Block, Glow, INK, STROKE, Txt, type Motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Photo } from "../../studio/photo";

export const HALLBG = "#2a2140";

/** Laszlo, drawn: glasses, a blue tee. */
export const Laszlo: React.FC<{ x: number; y: number; s: number; m: Motion; face?: "neutral" | "happy" | "grin" | "shock" | "worried"; armL?: [number, number]; armR?: [number, number]; look?: [number, number]; holdR?: (h: [number, number]) => React.ReactNode; holdL?: (h: [number, number]) => React.ReactNode }> = ({ x, y, s, m, face = "happy", armL, armR, look, holdR, holdL }) => (
  <Char x={x} y={y + m.wave(60, 3)} s={s} skin="#f1c27d" top="#3f6fd8" pants="#3a3550" hair="side" hairColor="#6b4a2b" glasses outfit="tee"
    face={face} armL={armL} armR={armR} look={look} holdR={holdR} holdL={holdL} />
);

/** The Papa John's driver in a red cap. */
export const Driver: React.FC<{ x: number; y: number; s: number; m: Motion; armR?: [number, number]; armL?: [number, number] }> = ({ x, y, s, m, armR = [70, 80], armL = [70, 80] }) => (
  <Char x={x} y={y + m.wave(55, 3, 1)} s={s} skin="#a86b3c" top="#c8102e" pants="#2c3550" hair="cap" hat="#c8102e" face="happy" look={[-0.7, 0]} armR={armR} armL={armL} />
);

/** A pizza box seen from the front-top, with the real Papa John's logo; `open` (0..1) lifts the lid. Centre at (x, y). */
export const PizzaBox: React.FC<{ x: number; y: number; w: number; m: Motion; open?: number; steam?: boolean }> = ({ x, y, w, m, open = 0, steam = true }) => {
  const h = w * 0.22;
  return (
    <g>
      {steam ? [0, 1, 2].map((i) => (
        <path key={i} d={`M ${x - w * 0.2 + i * w * 0.2} ${y - h} q ${10 * Math.sin(m.t / 8 + i)} -40 0 -80 q ${-10 * Math.sin(m.t / 8 + i)} -40 0 -80`}
          fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.35 + 0.2 * Math.sin(m.t / 6 + i)} />
      )) : null}
      <rect x={x - w / 2 + 8} y={y - h / 2 + 10} width={w} height={h} rx={8} fill="#000" opacity={0.25} />
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={8} fill="#f1e3c4" stroke={INK} strokeWidth={STROKE} />
      {open > 0 ? (
        <g>
          <ellipse cx={x} cy={y - h / 2} rx={w * 0.45} ry={w * 0.18 * open} fill="#e8a23a" stroke={INK} strokeWidth={5} />
          <ellipse cx={x} cy={y - h / 2} rx={w * 0.4} ry={w * 0.15 * open} fill="#d9442b" />
          {[[-0.2, 0], [0.15, -0.04], [0.05, 0.05], [-0.05, -0.06], [0.25, 0.04]].map(([dx, dy], i) => (
            <circle key={i} cx={x + dx! * w} cy={y - h / 2 + dy! * w * open} r={w * 0.035} fill="#8a1d1d" />
          ))}
        </g>
      ) : (
        <g>
          <path d={`M ${x - w / 2} ${y - h / 2} L ${x - w * 0.42} ${y - h * 1.1} L ${x + w * 0.42} ${y - h * 1.1} L ${x + w / 2} ${y - h / 2} Z`} fill="#f7ecd2" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
          <g transform={`translate(${x} ${y + h * 0.34})`}><Photo name="papajohns" s={h * 0.75} t={0} /></g>
        </g>
      )}
    </g>
  );
};

/** A bitcoin coin: the real CC0 logo, spinning with `spin` 0..1. Centre at (x, y), radius r. */
export const BtcCoin: React.FC<{ x: number; y: number; r: number; spin?: number }> = ({ x, y, r, spin = 1 }) => (
  <g transform={`translate(${x} ${y + r}) scale(${Math.max(0.15, spin)} 1)`}>
    <Photo name="bitcoin" s={r * 2} t={0} />
  </g>
);

/** The 2010 laptop on a little hall table; `screen` draws what is on it. Its screen's centre at (x, y - 150). */
export const Laptop: React.FC<{ x: number; y: number; s?: number; screen?: React.ReactNode; glow?: number }> = ({ x, y, s = 1, screen, glow = 0.5 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Glow x={0} y={-150} r={300} color="#7fb8ff" o={glow * 0.5} />
    <path d="M -230 -290 L 230 -290 L 230 -20 L -230 -20 Z" fill="#2b2d3c" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
    <rect x={-205} y={-268} width={410} height={226} rx={6} fill="#dfeaff" />
    {screen}
    <path d="M -270 -20 L 270 -20 L 300 20 L -300 20 Z" fill="#9aa0b4" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
  </g>
);

/** The hallway by the front door at night: warm wall, a framed picture, the open door onto the night street. */
export const Hall: React.FC<{ m: Motion; door?: number }> = ({ m, door = 1 }) => (
  <g>
    <rect x={-800} y={-800} width={2680} height={3400} fill="#e7c98f" />
    <rect x={-800} y={1300} width={2680} height={1400} fill="#8a5a3a" />
    {Array.from({ length: 14 }).map((_, i) => <rect key={i} x={-800 + i * 200} y={1300} width={6} height={1400} fill="#6b4329" />)}
    <rect x={-800} y={1290} width={2680} height={20} fill="#6b4329" />
    <Block x={-140} y={360} w={260} h={200} r={6} fill="#5a7a9a" />
    <Glow x={120} y={260} r={200} color="#fff1c9" o={0.5} />
    {/* the door frame and the night outside */}
    <Block x={600} y={330} w={460} h={980} r={6} fill="#0f1433" />
    {Array.from({ length: 12 }).map((_, i) => <circle key={i} cx={640 + ((i * 97) % 400)} cy={380 + ((i * 61) % 300)} r={3} fill="#fff6d8" opacity={0.5 + 0.5 * Math.sin(m.t / 9 + i)} />)}
    <rect x={590} y={320} width={480} height={20} fill="#6b4329" />
    {/* the door swung open into the hall */}
    <path d={`M 600 330 L ${600 - 180 * door} ${360} L ${600 - 180 * door} ${1290} L 600 1310 Z`} fill="#a0683f" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
    {/* the name plate on the wall: who lives here */}
    <rect x={150} y={404} width={320} height={160} rx={14} fill="#c9a24a" stroke={INK} strokeWidth={STROKE} />
    <Txt x={310} y={452} size={52} fill={INK}>LASZLO</Txt>
    <Txt x={310} y={516} size={52} fill={INK}>HANYECZ</Txt>
  </g>
);

export const BigTag: React.FC<{ x: number; y: number; w: number; text: string; k: number; rot?: number; size?: number }> = ({ x, y, w, text, k, rot = -6, size = 72 }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${1 + (1 - Math.min(1, k)) * 1.2})`}>
      <path d={`M ${-w / 2} -60 L ${w / 2} -60 L ${w / 2 + 50} 0 L ${w / 2} 60 L ${-w / 2} 60 Z`} fill="#ffc43d" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <circle cx={w / 2 + 12} cy={0} r={12} fill={INK} />
      <Txt x={0} y={2} size={size} fill={INK}>{text}</Txt>
    </g>
  );

export default { Laszlo, Driver, PizzaBox, BtcCoin, Laptop, Hall, BigTag };
