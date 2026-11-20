// Props for the Arnold Schwarzenegger "Twins for $0" Short: the old studio office, a salary cheque that tears,
// director's chairs, a film reel that turns into a pie, the cinema marquee, the video shop, the giant cheque.
import React from "react";
import { Block, Glow, INK, STROKE, Txt, type Motion } from "../../flat/kit";
import { Char } from "../../flat/cast";

export const GOLD = "#ffc43d";
export const FILMRED = "#c0392b";

/** Arnold: his real head on our body, in a dark suit. He never speaks. */
export const Arnold: React.FC<React.ComponentProps<typeof Char>> = (p) => (
  <Char photo="schwarzenegger" outfit="suit" top="#2a2f3d" pants="#22252f" {...p} />
);

/** The old studio office: wood panels, a window over the hills, a big desk. Children draw on the desk. */
export const Office: React.FC<{ m: Motion; children?: React.ReactNode; arnold?: React.ReactNode }> = ({ m, children, arnold }) => (
  <g>
    <rect x={-600} y={-600} width={2280} height={3200} fill="#6b3f1e" />
    {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={-600 + i * 200} y={-600} width={8} height={1800} fill="#5a3418" />)}
    {/* window over the hills */}
    <Block x={140} y={180} w={800} h={420} r={14} fill="#f6b26b" />
    <path d="M 150 520 Q 350 380 540 470 Q 740 360 930 500 L 930 590 L 150 590 Z" fill="#c9763a" />
    <Txt x={540} y={300} size={40} fill="#ffffff" weight={800} deco>H O L L Y W O O D</Txt>
    <rect x={530} y={180} width={20} height={420} fill="#6b3f1e" />
    <Glow x={540} y={400} r={500} color="#ffd98a" o={0.3 + m.wave(90, 0.04)} />
    {arnold}
    {/* the desk */}
    <Block x={-200} y={1020} w={1480} h={110} r={10} fill="#8a5226" />
    <rect x={-200} y={1130} width={1480} height={900} fill="#4a2a12" stroke={INK} strokeWidth={STROKE} />
    {[40, 400, 760].map((x) => (
      <g key={x}>
        <Block x={x} y={1170} w={300} h={150} r={10} fill="#5a3418" />
        <rect x={x + 110} y={1235} width={80} height={18} rx={9} fill="#c9a24a" stroke={INK} strokeWidth={4} />
      </g>
    ))}
    {/* on the desk: a phone, a script, a nameplate */}
    <Block x={40} y={950} w={170} h={80} r={10} fill="#1f2230" />
    <Block x={850} y={960} w={180} h={70} r={6} fill="#f4f1e8" />
    <Txt x={940} y={995} size={30} fill={INK} deco>SCRIPT</Txt>
    {children}
  </g>
);

/** A pay cheque: green paper, the amount big; `tear` 0..1 rips it in two. */
export const Cheque: React.FC<{ x: number; y: number; w: number; label: string; value: string; tear?: number; rot?: number; big?: number }> = ({ x, y, w, label, value, tear = 0, rot = 0, big = 90 }) => {
  const h = w * 0.45;
  const half = (side: -1 | 1) => (
    <g transform={`translate(${side * tear * 150} ${tear * tear * 260}) rotate(${side * tear * 25})`}>
      <clipPath id={`cq${side < 0 ? "l" : "r"}${Math.round(x)}${Math.round(y)}`}>
        <rect x={side < 0 ? -w / 2 - 10 : 0} y={-h / 2 - 10} width={w / 2 + 10} height={h + 20} />
      </clipPath>
      <g clipPath={`url(#cq${side < 0 ? "l" : "r"}${Math.round(x)}${Math.round(y)})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={12} fill="#dff3d8" stroke={INK} strokeWidth={STROKE} />
        <rect x={-w / 2} y={-h / 2} width={w} height={h * 0.24} rx={10} fill="#3a8d4f" />
        <Txt x={0} y={-h / 2 + h * 0.12} size={Math.min(46, h * 0.18)} fill="#ffffff">{label}</Txt>
        <Txt x={0} y={h * 0.1} size={big} fill={INK}>{value}</Txt>
        <rect x={-w / 2 + 30} y={h * 0.32} width={w - 60} height={6} rx={3} fill="#9fbf95" />
      </g>
    </g>
  );
  return <g transform={`translate(${x} ${y}) rotate(${rot})`}>{half(-1)}{half(1)}</g>;
};

/** A director's chair with a name on its back. */
export const DirChair: React.FC<{ x: number; y: number; name: string; k?: number; size?: number }> = ({ x, y, name, k = 1, size = 44 }) => (
  <g transform={`translate(${x} ${y})`}>
    <line x1={-90} y1={0} x2={70} y2={-230} stroke="#6b3f1e" strokeWidth={16} />
    <line x1={90} y1={0} x2={-70} y2={-230} stroke="#6b3f1e" strokeWidth={16} />
    <rect x={-100} y={-250} width={200} height={40} rx={6} fill={FILMRED} stroke={INK} strokeWidth={5} />
    <line x1={-90} y1={-250} x2={-90} y2={-420} stroke="#6b3f1e" strokeWidth={14} />
    <line x1={90} y1={-250} x2={90} y2={-420} stroke="#6b3f1e" strokeWidth={14} />
    <g transform={`translate(0 -370) scale(1 ${Math.max(0.05, k)})`}>
      <rect x={-130} y={-45} width={260} height={90} rx={6} fill={INK} stroke={INK} strokeWidth={5} />
      <Txt x={0} y={2} size={size} fill="#ffffff">{name}</Txt>
    </g>
  </g>
);

/** An empty pay envelope. */
export const Envelope: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-70} y={-45} width={140} height={90} rx={6} fill="#f4e7c8" stroke={INK} strokeWidth={5} />
    <path d="M -70 -45 L 0 10 L 70 -45" fill="none" stroke={INK} strokeWidth={5} />
    <Txt x={0} y={25} size={22} fill={INK} deco>PAY</Txt>
  </g>
);

export default Office;
