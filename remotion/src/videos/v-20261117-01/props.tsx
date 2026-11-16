// Props for the Edwin Castro Short: the giant Powerball cheque, Castro (drawn: no free photo of him exists),
// a pair of scissors, a mailbox with envelopes, lottery balls and the Powerball logo (public domain, Commons).
import React from "react";
import { Ball, Block, INK, STROKE, Txt, shade } from "../../flat/kit";
import { Char, type FaceKind } from "../../flat/cast";
import { Photo } from "../../studio/photo";

/** The giant presentation cheque: a red band with the logo, "PAY TO", the name and the figure. */
export const Cheque: React.FC<{ x: number; y: number; w: number; amount: string; name?: string; rot?: number; logo?: boolean; t?: number; box?: boolean }> = ({
  x, y, w, amount, name = "EDWIN CASTRO", rot = 0, logo = true, t = 0, box = true,
}) => {
  const h = w * 0.46;
  return (
    <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x + 12} y={y + 14} width={w} height={h} rx={14} fill="#000" opacity={0.28} />
      <rect x={x} y={y} width={w} height={h} rx={14} fill="#fbfaf3" stroke={INK} strokeWidth={STROKE} />
      <rect x={x} y={y} width={w} height={h * 0.2} rx={14} fill="#d7262b" stroke={INK} strokeWidth={STROKE} />
      {logo ? <g transform={`translate(${x + w * 0.27} ${y + h * 0.185})`}><Photo name="powerball" s={h * 0.36} t={t} /></g> : null}
      <Txt x={x + w * 0.06} y={y + h * 0.36} size={Math.max(30, w * 0.04)} fill="#6b6880" weight={700} anchor="start" deco>PAY TO</Txt>
      <Txt x={x + w * 0.06} y={y + h * 0.5} size={Math.max(48, w * 0.065)} fill={INK} anchor="start">{name}</Txt>
      {box ? <rect x={x + w * 0.06} y={y + h * 0.64} width={w * 0.88} height={h * 0.26} rx={10} fill="#fff6c9" stroke={INK} strokeWidth={4} /> : null}
      <Txt x={x + w / 2} y={y + h * 0.775} size={Math.max(60, w * 0.12)} fill="#1f8a52">{amount}</Txt>
    </g>
  );
};

/** Edwin Castro, drawn (no freely licensed photo exists): a polo shirt, dark hair, sunglasses pushed up. */
export const Castro: React.FC<{ x: number; y: number; s: number; face?: FaceKind; armL?: [number, number]; armR?: [number, number]; back?: boolean; look?: [number, number] }> = ({
  x, y, s, face = "happy", armL = [20, 10], armR = [20, 10], back, look,
}) => (
  <Char x={x} y={y} s={s} outfit="shirt" top="#2f5d9e" pants="#2a2f3d" hair="side" hairColor="#2a1f1a" skin="#c98a5e" accent="#ffcf4a"
    face={face} armL={armL} armR={armR} back={back} look={look} />
);

/** A name plate (a gold bar with the name in ink). */
export const NamePlate: React.FC<{ x: number; y: number; w: number; text: string }> = ({ x, y, w, text }) => (
  <g>
    <Block x={x - w / 2} y={y} w={w} h={84} r={10} fill="#d4af37" />
    <Txt x={x} y={y + 44} size={52} fill={INK}>{text}</Txt>
  </g>
);

/** Big scissors, blades opened by `open` (0 shut .. 1 wide), pointing down. */
export const Scissors: React.FC<{ x: number; y: number; s?: number; open?: number }> = ({ x, y, s = 1, open = 0.4 }) => {
  const a = 6 + open * 22;
  const blade = (sgn: number) => (
    <g transform={`rotate(${sgn * a})`}>
      <path d="M -14 0 L 0 260 L 14 0 Z" fill="#cfd6e2" stroke={INK} strokeWidth={5} />
      <circle cx={0} cy={-70} r={44} fill="none" stroke={sgn > 0 ? "#e0352b" : "#c42a22"} strokeWidth={22} />
      <circle cx={0} cy={-70} r={44} fill="none" stroke={INK} strokeWidth={4} />
      <line x1={0} y1={-26} x2={0} y2={0} stroke={INK} strokeWidth={14} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {blade(-1)}
      {blade(1)}
      <circle r={12} fill="#8a93a6" stroke={INK} strokeWidth={4} />
    </g>
  );
};

/** A white lottery ball with a number-free coloured band. */
export const LottoBall: React.FC<{ x: number; y: number; r?: number; red?: boolean }> = ({ x, y, r = 34, red }) => (
  <g>
    <Ball x={x} y={y} r={r} fill={red ? "#e0352b" : "#ffffff"} sw={4} />
    <circle cx={x} cy={y} r={r * 0.45} fill={red ? "#ffffff" : "#ffcf4a"} stroke={INK} strokeWidth={3} />
  </g>
);

/** An envelope with a green cheque peeking out. */
export const Envelope: React.FC<{ x: number; y: number; w?: number; rot?: number }> = ({ x, y, w = 120, rot = 0 }) => {
  const h = w * 0.62;
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <rect x={x - w / 2 + w * 0.12} y={y - h / 2 - h * 0.25} width={w * 0.76} height={h * 0.5} fill="#a7e0b8" stroke={INK} strokeWidth={3} />
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={6} fill="#f4ecd8" stroke={INK} strokeWidth={4} />
      <path d={`M ${x - w / 2} ${y - h / 2} L ${x} ${y + h * 0.1} L ${x + w / 2} ${y - h / 2}`} fill="none" stroke={INK} strokeWidth={4} />
    </g>
  );
};

/** A flat bundle stack of cash, `rows` high, drawn as bricks. */
export const CashPile: React.FC<{ x: number; y: number; cols: number; rows: number; bw?: number; ghost?: boolean }> = ({ x, y, cols, rows, bw = 110, ghost }) => (
  <g opacity={ghost ? 0.35 : 1}>
    {Array.from({ length: Math.max(0, Math.floor(rows)) }).map((_, r) =>
      Array.from({ length: cols - (r % 2) }).map((__, c) => {
        const bx = x + c * bw + (r % 2) * bw * 0.5, by = y - (r + 1) * bw * 0.36;
        return (
          <g key={`${r}-${c}`}>
            <rect x={bx} y={by} width={bw} height={bw * 0.36} rx={4} fill={ghost ? "#cfd6e2" : "#3a9d5d"} stroke={INK} strokeWidth={3} />
            <rect x={bx + bw * 0.42} y={by} width={bw * 0.16} height={bw * 0.36} fill={ghost ? "#eef1f6" : "#f4f1e8"} />
          </g>
        );
      }),
    )}
  </g>
);

/** A press photographer with a camera; `flash` 0..1. */
export const Photographer: React.FC<{ x: number; y: number; s: number; flash: number; face?: FaceKind }> = ({ x, y, s, flash, face = "neutral" }) => (
  <g>
    <Char x={x} y={y} s={s} outfit="tee" top="#5a5f73" pants="#2a2f3d" hair="cap" hairColor="#333" hat="#e0352b" skin="#e6b08a" face={face} armL={[100, 160]} armR={[100, 200]} />
    <Block x={x - s * 0.35} y={y - s * 2.6} w={s * 0.7} h={s * 0.42} r={8} fill="#2b2b33" />
    <circle cx={x} cy={y - s * 2.39} r={s * 0.14} fill="#7fb0ff" stroke={INK} strokeWidth={3} />
    {flash > 0.02 ? <circle cx={x} cy={y - s * 2.6} r={s * 0.9 * flash} fill="#ffffff" opacity={0.85 * flash} /> : null}
  </g>
);

export const darker = (c: string) => shade(c, -0.2);
export default Cheque;
