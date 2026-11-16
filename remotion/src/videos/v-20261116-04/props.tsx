// Props for the Amazon cloud Short: a brown parcel with the smile tape, a server rack with blinking
// lights, warehouse shelving, a delivery van.
import React from "react";
import { Ball, Block, Glow, INK, STROKE, rng, shade } from "../../flat/kit";

/** A brown parcel with a strip of tape and a smile-arrow printed on the side. */
export const Parcel: React.FC<{ x: number; y: number; w: number; h?: number; rot?: number }> = ({ x, y, w, h, rot = 0 }) => {
  const hh = h ?? w * 0.72;
  return (
    <g transform={`rotate(${rot} ${x + w / 2} ${y + hh / 2})`}>
      <rect x={x} y={y} width={w} height={hh} rx={6} fill="#c48a4a" stroke={INK} strokeWidth={Math.max(3, w * 0.03)} />
      <rect x={x} y={y} width={w} height={hh * 0.2} fill="#a87339" stroke={INK} strokeWidth={Math.max(2, w * 0.02)} />
      <rect x={x + w * 0.44} y={y} width={w * 0.12} height={hh} fill="#e8d3a6" opacity={0.85} />
      <path d={`M ${x + w * 0.2} ${y + hh * 0.62} Q ${x + w * 0.5} ${y + hh * 0.8} ${x + w * 0.8} ${y + hh * 0.6}`} fill="none" stroke="#ff9900" strokeWidth={Math.max(3, w * 0.045)} strokeLinecap="round" />
      <path d={`M ${x + w * 0.74} ${y + hh * 0.55} L ${x + w * 0.81} ${y + hh * 0.6} L ${x + w * 0.73} ${y + hh * 0.66}`} fill="none" stroke="#ff9900" strokeWidth={Math.max(3, w * 0.04)} strokeLinecap="round" />
    </g>
  );
};

/** A server rack: a dark cabinet with rows of units and little lights that blink with `t`. */
export const Rack: React.FC<{ x: number; y: number; w: number; h: number; t: number; on?: number; seed?: string; color?: string }> = ({
  x, y, w, h, t, on = 1, seed = "rack", color = "#4dd8ff",
}) => {
  const r = rng(seed);
  const rows = Math.max(4, Math.floor(h / 46));
  const uh = (h - 30) / rows;
  return (
    <g>
      <Block x={x} y={y} w={w} h={h} r={8} fill="#232838" />
      {Array.from({ length: rows }).map((_, i) => {
        const yy = y + 15 + i * uh;
        const lit = on * rows > i;
        const ph = r() * 6.28, sp = 6 + r() * 10;
        const blink = Math.sin(t / sp + ph) > -0.2 ? 1 : 0.25;
        return (
          <g key={i}>
            <rect x={x + 12} y={yy + 3} width={w - 24} height={uh - 6} rx={4} fill="#323a50" stroke={INK} strokeWidth={2} />
            <rect x={x + 24} y={yy + uh / 2 - 3} width={(w - 48) * 0.45} height={6} rx={3} fill="#1b2030" />
            {[0, 1, 2].map((k) => (
              <circle key={k} cx={x + w - 34 - k * 20} cy={yy + uh / 2} r={5} fill={lit ? (k === 1 ? "#7dff9a" : color) : "#3d4458"} opacity={lit ? (k === 0 ? blink : 1) : 1} />
            ))}
          </g>
        );
      })}
      {on > 0 ? <Glow x={x + w / 2} y={y + h / 2} r={w * 0.9} color={color} o={0.18 * on} /> : null}
    </g>
  );
};

/** Warehouse shelving full of parcels. */
export const Shelves: React.FC<{ x: number; y: number; w: number; h: number; seed?: string }> = ({ x, y, w, h, seed = "shelf" }) => {
  const r = rng(seed);
  const levels = 4, lh = h / levels;
  return (
    <g>
      {[x, x + w - 22].map((px) => <rect key={px} x={px} y={y} width={22} height={h} fill="#2f6fb5" stroke={INK} strokeWidth={4} />)}
      {Array.from({ length: levels }).map((_, i) => {
        const ly = y + (i + 1) * lh;
        const items: React.ReactNode[] = [];
        let cx = x + 30;
        let k = 0;
        while (cx < x + w - 60) {
          const pw = 60 + r() * 60, ph = lh * (0.45 + r() * 0.35);
          if (cx + pw > x + w - 30) break;
          items.push(<Parcel key={k++} x={cx} y={ly - 14 - ph} w={pw} h={ph} />);
          cx += pw + 8;
        }
        return (
          <g key={i}>
            {items}
            <rect x={x} y={ly - 14} width={w} height={14} fill="#f2a33a" stroke={INK} strokeWidth={4} />
          </g>
        );
      })}
    </g>
  );
};

/** A delivery van, side on, facing right; `doors` opens the back. */
export const Van: React.FC<{ x: number; y: number; s?: number; t: number; color?: string }> = ({ x, y, s = 1, t, color = "#e9eef4" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Block x={0} y={-300} w={520} h={250} r={18} fill={color} />
    <path d="M 520 -250 L 640 -250 L 700 -160 L 700 -50 L 520 -50 Z" fill={color} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
    <path d="M 540 -232 L 630 -232 L 676 -165 L 540 -165 Z" fill="#8fd3ff" stroke={INK} strokeWidth={4} />
    <rect x={0} y={-110} width={700} height={22} fill="#1f6fbf" />
    <path d="M 120 -170 Q 260 -120 400 -175" fill="none" stroke="#ff9900" strokeWidth={14} strokeLinecap="round" />
    {[140, 580].map((wx) => (
      <g key={wx} transform={`rotate(${t * 9} ${wx} -45)`}>
        <Ball x={wx} y={-45} r={52} fill="#2a2d38" />
        <Ball x={wx} y={-45} r={22} fill="#b9bfcc" sw={4} shadow={false} />
        <line x1={wx} y1={-67} x2={wx} y2={-23} stroke={INK} strokeWidth={4} />
      </g>
    ))}
    <rect x={690} y={-90} width={22} height={30} rx={4} fill="#ffd23f" stroke={INK} strokeWidth={4} />
    <rect x={-6} y={-90} width={16} height={24} fill="#e0352b" stroke={INK} strokeWidth={3} />
  </g>
);

/** Floor stripes for a warehouse or dock. */
export const Floor: React.FC<{ y: number; color: string }> = ({ y, color }) => (
  <g>
    <rect x={-300} y={y} width={1680} height={1200} fill={color} />
    <line x1={-300} y1={y} x2={1380} y2={y} stroke={INK} strokeWidth={STROKE} />
    {[-200, 100, 400, 700, 1000, 1300].map((x2, i) => <line key={i} x1={540} y1={y} x2={x2 - 300 + i * 40} y2={y + 1200} stroke={shade(color, -0.15)} strokeWidth={5} />)}
  </g>
);

const props = { Parcel, Rack, Shelves, Van, Floor };
export default props;
