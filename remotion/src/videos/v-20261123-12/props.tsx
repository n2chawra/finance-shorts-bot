// Shared pieces for "The Strait of Malacca closes. Which way round?" (device: erase and redraw). The channel's
// vintage map of South-East Asia; the lane between Malaysia and Sumatra is rubbed out and the tankers' new roads
// are drawn south through the Sunda and Lombok straits.
import React from "react";
import { Block, INK, STROKE, Txt, shade } from "../../flat/kit";
import { WorldMap, useAt, type Fill } from "../../flat/map";

export type LL = [number, number];
export const RED = "#d23b30", GOLD = "#f2b134", SEA = "#5f9fae", LAND = "#d9c48e", ROUTE = "#ffe08a";

export const LANE: LL[] = [[93.5, 7.2], [96.0, 6.0], [98.0, 4.6], [100.2, 3.0], [101.6, 2.2], [102.9, 1.45], [103.75, 1.17], [104.4, 1.3], [105.4, 2.4], [107.5, 4.6]];
export const SINGAPORE: LL = [103.82, 1.35];
export const SUNDA: LL = [105.8, -6.0];
export const LOMBOK: LL = [115.75, -8.6];
export const BALI: LL = [115.1, -8.35];
export const SUNDA_ROUTE: LL[] = [[93.5, 7.2], [94.5, 3.0], [97.5, -1.5], [101.5, -5.2], [104.8, -6.6], [105.8, -6.0], [106.6, -4.5], [107.4, -1.5], [108.0, 2.0], [109.5, 5.5]];
export const LOMBOK_ROUTE: LL[] = [[93.5, 7.2], [95.0, 1.0], [101.0, -7.0], [108.0, -9.6], [114.0, -9.6], [115.75, -9.0], [115.85, -8.2], [117.4, -5.0], [118.4, -1.5], [119.0, 1.5], [119.6, 5.0], [120.5, 9.0]];
export const HORMUZ: LL = [56.3, 26.6];

const NEAR = ["Malaysia", "Indonesia", "Singapore", "Thailand", "Myanmar", "Cambodia", "Vietnam", "Laos", "Brunei", "Philippines", "Timor-Leste", "Papua New Guinea", "Australia", "India", "Sri Lanka", "Bangladesh", "China", "Taiwan"];

/** South-East Asia on the old map; `center` and `scale` are the camera. `wide` draws the whole world at low detail. */
export const SEAsia: React.FC<{ center: LL; scale: number; colors?: Record<string, Fill>; wide?: boolean; children?: React.ReactNode }> = ({ center, scale, colors = {}, wide = false, children }) => (
  <WorldMap w={1080} h={1920} center={center} scale={scale} kind="flat" look="vintage" political={0.45}
    detail={wide ? "110m" : "50m"} only={wide ? undefined : NEAR} colors={colors}>
    {children}
  </WorldMap>
);

/** A line through [lon, lat] points, drawn up to `k`. */
export const Line: React.FC<{ via: LL[]; k?: number; color?: string; w?: number; dash?: boolean; ink?: boolean; o?: number }> = ({ via, k = 1, color = ROUTE, w = 10, dash = false, ink = true, o = 1 }) => {
  const at = useAt();
  const xy = via.map((p) => at(p)).filter((p): p is [number, number] => !!p);
  const pts: [number, number][] = [];
  for (let i = 0; i < xy.length - 1; i++) for (let s = 0; s < 12; s++) {
    const [p, q] = [xy[i]!, xy[i + 1]!];
    pts.push([p[0] + (q[0] - p[0]) * (s / 12), p[1] + (q[1] - p[1]) * (s / 12)]);
  }
  if (xy.length) pts.push(xy[xy.length - 1]!);
  const n = Math.round(pts.length * Math.max(0, Math.min(1, k)));
  if (n < 2) return null;
  const d = pts.slice(0, n).map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <g opacity={o}>
      {ink ? <path d={d} fill="none" stroke={INK} strokeWidth={w + 7} strokeLinecap="round" strokeLinejoin="round" /> : null}
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash ? `${w * 2} ${w * 1.4}` : undefined} />
    </g>
  );
};

/** The point at `k` along a line through `via`, in screen pixels, with its heading in degrees. */
export function tipOf(at: (p: LL) => [number, number] | null, via: LL[], k: number): [number, number, number] | null {
  const xy = via.map((p) => at(p)).filter((p): p is [number, number] => !!p);
  if (xy.length < 2) return null;
  const lens = xy.slice(1).map((q, i) => Math.hypot(q[0] - xy[i]![0], q[1] - xy[i]![1]));
  const total = lens.reduce((s, v) => s + v, 0);
  let left = total * Math.max(0, Math.min(1, k));
  for (let i = 0; i < lens.length; i++) {
    if (left <= lens[i]! || i === lens.length - 1) {
      const f = lens[i]! > 0 ? Math.min(1, left / lens[i]!) : 0;
      const [p, q] = [xy[i]!, xy[i + 1]!];
      return [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f, (Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI];
    }
    left -= lens[i]!;
  }
  return null;
}

/** An oil tanker at screen [x, y], pointing along `rot` degrees; a wake trails behind it. */
export const Tanker: React.FC<{ x: number; y: number; s: number; rot?: number; k?: number; t?: number; hull?: string; boxes?: boolean }> = ({ x, y, s, rot = 0, k = 1, t = 0, hull = "#9b2f2a", boxes = false }) => {
  if (k <= 0) return null;
  const flip = Math.abs(rot) > 90;
  const r = flip ? rot - 180 * Math.sign(rot) : rot;
  const bob = Math.sin(t / 9) * 2;
  return (
    <g transform={`translate(${x} ${y + bob}) rotate(${r}) scale(${(s / 100) * (flip ? -1 : 1) * Math.min(1, k)} ${(s / 100) * Math.min(1, k)})`}>
      <path d="M-150,6 Q-170,6 -176,0" stroke="#ffffff" strokeWidth={6} fill="none" opacity={0.7} />
      <path d="M-120,-14 L104,-14 L126,0 L104,16 L-120,16 Z" fill={hull} stroke={INK} strokeWidth={STROKE * 0.7} strokeLinejoin="round" />
      <path d="M-120,4 L112,4" stroke={shade(hull, -0.3)} strokeWidth={5} />
      {boxes ? [-90, -60, -30, 0, 30, 60].map((bx, i) => <Block key={i} x={bx} y={-36} w={28} h={22} fill={["#e8453c", "#3b6fb8", "#f2b134", "#3a9d5d"][i % 4]!} sw={3} shadow={false} />)
        : <g>{[-70, -20, 30].map((bx, i) => <ellipse key={i} cx={bx} cy={-18} rx={20} ry={7} fill="#d8d2c4" stroke={INK} strokeWidth={3} />)}</g>}
      <Block x={-116} y={-48} w={30} h={34} fill="#f4f1ea" sw={3} shadow={false} />
      <Block x={-110} y={-62} w={8} h={14} fill={INK} sw={2} shadow={false} />
    </g>
  );
};

/** A red-and-white barrier across the water from screen a to b, dropping in as `k` goes 0 -> 1. */
export const Barrier: React.FC<{ a: [number, number]; b: [number, number]; k: number; lamp?: number }> = ({ a, b, k, lamp = 0 }) => {
  if (k <= 0) return null;
  const lift = (1 - Math.min(1, k)) * -260;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  const n = Math.max(3, Math.round(len / 50));
  return (
    <g transform={`translate(${a[0]} ${a[1] + lift}) rotate(${ang})`}>
      {Array.from({ length: n }, (_, i) => <rect key={i} x={(len / n) * i} y={-16} width={len / n} height={32} fill={i % 2 ? "#ffffff" : RED} stroke={INK} strokeWidth={4} />)}
      {[0, len].map((px, i) => (
        <g key={i}>
          <rect x={px - 12} y={-60} width={24} height={60} fill="#5a5a66" stroke={INK} strokeWidth={4} />
          <circle cx={px} cy={-66} r={14} fill={lamp > 0 ? "#ffcf4a" : "#8a6b2a"} stroke={INK} strokeWidth={3} />
          {lamp > 0 ? <circle cx={px} cy={-66} r={46} fill="#ffcf4a" opacity={0.35 * lamp} /> : null}
        </g>
      ))}
    </g>
  );
};

/** A big gold question mark, bobbing. */
export const QMark: React.FC<{ x: number; y: number; k: number; t: number; size?: number }> = ({ x, y, k, t, size = 180 }) =>
  k <= 0 ? null : <Txt x={x} y={y - Math.abs(Math.sin(t / 5)) * 18} size={size * Math.min(1.15, k)} fill={GOLD} stroke={INK}>?</Txt>;

/** A place name with a dot, typed on as `k` goes 0 -> 1. */
export const Spot: React.FC<{ at: LL; name: string; k?: number; size?: number; left?: boolean; color?: string; dy?: number }> = ({ at, name, k = 1, size = 50, left = false, color = GOLD, dy = 0 }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  const n = Math.max(1, Math.round(name.length * Math.min(1, k * 1.4)));
  return (
    <g opacity={Math.min(1, k * 2)}>
      <circle cx={xy[0]} cy={xy[1]} r={13} fill={color} stroke={INK} strokeWidth={4} />
      <Txt x={xy[0] + (left ? -26 : 26)} y={xy[1] + dy} size={size} fill="#ffffff" anchor={left ? "end" : "start"} stroke={INK}>{name.slice(0, n)}</Txt>
    </g>
  );
};

/** A night tint over the whole frame. */
export const Night: React.FC<{ k: number }> = ({ k }) => (k > 0 ? <rect x={-2000} y={-2000} width={6000} height={6000} fill="#101a3a" opacity={0.38 * Math.min(1, k)} /> : null);

const props = { LANE };
export default props;
