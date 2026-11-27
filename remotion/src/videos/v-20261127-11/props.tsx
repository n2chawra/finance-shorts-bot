// Shared pieces for "Why does the road from Alaska to Argentina stop in Panama?" (device: route and race). The
// channel's vintage map of the Americas with the Pan-American Highway drawn down it (simplified line): a car drives
// it south from Alaska until the tarmac ends at Yaviza; the Darién Gap between Yaviza and Turbo stays empty.
import React from "react";
import { Ball, Block, Display, Glow, INK, Limb, Txt, shade } from "../../flat/kit";
import { WorldMap, useAt, type Fill } from "../../flat/map";

export type LL = [number, number];

export const RED = "#d9452f", GOLD = "#f2b134", FOREST = "#3f7a46", ROAD = "#3a3330", SEA = "#5f9fae";

/** The highway, simplified: Prudhoe Bay in Alaska, down through Canada, the United States, Mexico and Central
 * America to Yaviza in Panama. */
export const NORTH_ROAD: LL[] = [
  [-148.4, 70.2], [-147.7, 64.8], [-141.0, 62.6], [-135.1, 60.7], [-128.7, 59.4], [-120.2, 55.8], [-113.5, 53.5],
  [-112.0, 49.5], [-105.0, 42.0], [-100.0, 36.0], [-98.5, 30.5], [-99.5, 27.5], [-100.3, 25.7], [-99.1, 19.4],
  [-96.7, 17.1], [-92.1, 15.4], [-90.5, 14.6], [-88.9, 13.7], [-87.2, 13.3], [-86.3, 12.1], [-85.4, 10.6],
  [-84.1, 9.9], [-82.4, 8.4], [-80.4, 8.1], [-79.5, 9.0], [-79.1, 9.15], [-78.4, 8.75], [-77.97, 8.5], [-77.69, 8.16],
];
/** From Turbo in Colombia south through the Andes to Ushuaia in Argentina. */
export const SOUTH_ROAD: LL[] = [
  [-76.73, 8.09], [-76.65, 7.65], [-75.57, 6.25], [-75.7, 4.8], [-76.5, 3.45], [-77.3, 1.2], [-78.5, -0.2],
  [-79.9, -2.2], [-80.6, -5.2], [-79.0, -8.1], [-77.0, -12.0], [-75.7, -14.1], [-71.5, -16.4], [-70.3, -18.5],
  [-70.4, -23.6], [-70.6, -33.4], [-68.8, -32.9], [-64.2, -31.4], [-60.6, -32.9], [-58.4, -34.6], [-62.3, -38.7],
  [-65.1, -42.8], [-67.5, -45.9], [-69.2, -51.6], [-68.3, -54.8],
];
export const YAVIZA: LL = [-77.69, 8.16];
export const TURBO: LL = [-76.73, 8.09];
export const ALASKA: LL = [-150, 66];
export const ARGENTINA: LL = [-65.5, -38.5];
export const GAP_MID: LL = [-77.2, 8.0];

/** The wide framing of the whole Americas (Mercator), and the push onto Panama. */
export const WIDE: { center: LL; scale: number } = { center: [-97, 10], scale: 500 };
export const PANAMA_VIEW: { center: LL; scale: number } = { center: [-81, 9.5], scale: 2600 };
/** The close framing of the gap. */
export const GAP_VIEW: { center: LL; scale: number } = { center: [-77.2, 7.95], scale: 21000 };

const NEAR = [
  "Canada", "United States of America", "Mexico", "Guatemala", "Belize", "Honduras", "El Salvador", "Nicaragua",
  "Costa Rica", "Panama", "Colombia", "Venezuela", "Ecuador", "Peru", "Brazil", "Bolivia", "Chile", "Argentina",
  "Paraguay", "Uruguay", "Cuba", "Jamaica", "Haiti", "Dominican Rep.", "Guyana", "Suriname", "Greenland", "Bahamas",
];

/** The Americas on the old map; `center` and `scale` are the camera. A region close-up uses the 50m outlines. */
export const AMap: React.FC<{ center: LL; scale: number; colors?: Record<string, Fill>; children?: React.ReactNode }> = ({ center, scale, colors = {}, children }) => (
  <WorldMap w={1080} h={1920} center={center} scale={scale} kind="flat" look="vintage" political={0.35} detail={scale > 1800 ? "50m" : "110m"} only={NEAR} colors={colors}>
    {children}
  </WorldMap>
);

const segs = (pts: LL[]) => pts.slice(1).map((p, i) => {
  const a = pts[i]!;
  const c = Math.cos(((a[1] + p[1]) / 2) * (Math.PI / 180));
  return Math.hypot((p[0] - a[0]) * c, p[1] - a[1]);
});
/** [lon, lat] at fraction k of a line's length, with the stops up to there. */
export const along = (pts: LL[], k: number): { at: LL; upTo: LL[] } => {
  const s = segs(pts);
  const total = s.reduce((a, b) => a + b, 0);
  let d = Math.max(0, Math.min(1, k)) * total;
  const out: LL[] = [pts[0]!];
  for (let i = 0; i < s.length; i++) {
    const L = s[i]!;
    const a = pts[i]!, b = pts[i + 1]!;
    if (d <= L || i === s.length - 1) {
      const q = L > 0 ? Math.min(1, d / L) : 0;
      const at: LL = [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q];
      out.push(at);
      return { at, upTo: out };
    }
    out.push(b);
    d -= L;
  }
  return { at: pts[pts.length - 1]!, upTo: out };
};
/** the fraction of the north road's length at the stop nearest to `ll` */
export const fracNear = (pts: LL[], ll: LL): number => {
  const s = segs(pts);
  const total = s.reduce((a, b) => a + b, 0);
  let best = 0, bd = 1e9, acc = 0;
  pts.forEach((p, i) => {
    const dd = Math.hypot(p[0] - ll[0], p[1] - ll[1]);
    if (dd < bd) { bd = dd; best = acc; }
    if (i < s.length) acc += s[i]!;
  });
  return best / total;
};

const dOf = (xy: [number, number][]) => xy.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

/** A highway line: an ink casing, the dark tarmac and a yellow centre dash; `k` draws it from its start, `flash`
 * lights it, `run` (0..1) sends a light along it. */
export const Road: React.FC<{ pts: LL[]; k?: number; w?: number; flash?: number; run?: number; dashed?: boolean; o?: number }> = ({ pts, k = 1, w = 12, flash = 0, run = -1, dashed, o = 1 }) => {
  const at = useAt();
  if (k <= 0) return null;
  const xy = along(pts, k).upTo.map((p) => at(p)).filter((p): p is [number, number] => !!p);
  if (xy.length < 2) return null;
  const d = dOf(xy);
  const r = run >= 0 && run <= 1 ? at(along(pts, run).at) : null;
  return (
    <g opacity={o}>
      <path d={d} fill="none" stroke="#fff4d0" strokeOpacity={0.22 + 0.6 * flash} strokeWidth={w * 3.4} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={INK} strokeWidth={w + 6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed ? `${w * 2} ${w * 1.4}` : undefined} />
      <path d={d} fill="none" stroke={flash > 0.05 ? shade(GOLD, -0.35 + 0.35 * flash) : ROAD} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed ? `${w * 2} ${w * 1.4}` : undefined} />
      {!dashed ? <path d={d} fill="none" stroke="#f6d35a" strokeWidth={Math.max(2, w * 0.22)} strokeDasharray={`${w * 0.9} ${w * 1.1}`} /> : null}
      {r ? (
        <g>
          <Glow x={r[0]} y={r[1]} r={w * 9} color="#fff3b0" o={0.9} />
          <circle cx={r[0]} cy={r[1]} r={w * 1.3} fill="#ffffff" />
        </g>
      ) : null}
    </g>
  );
};

/** Both halves of the highway, drawn in full. */
export const Highway: React.FC<{ w?: number; flash?: number; run?: number }> = ({ w = 12, flash = 0, run = -1 }) => (
  <g>
    <Road pts={NORTH_ROAD} w={w} flash={flash} run={run >= 0 && run <= 0.55 ? run / 0.55 : -1} />
    <Road pts={SOUTH_ROAD} w={w} flash={flash} run={run > 0.55 && run <= 1 ? (run - 0.55) / 0.45 : -1} />
  </g>
);

/** The break between Yaviza and Turbo: a red dashed gap marker that pulses. */
export const GapMark: React.FC<{ k?: number; pulse?: number; w?: number }> = ({ k = 1, pulse = 0, w = 12 }) => {
  const at = useAt();
  const a = at(YAVIZA), b = at(TURBO);
  if (!a || !b || k <= 0) return null;
  return (
    <g opacity={Math.min(1, k)}>
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={RED} strokeOpacity={0.35 + 0.5 * pulse} strokeWidth={w * (2.6 + 2 * pulse)} strokeLinecap="round" />
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#fff" strokeWidth={w * 0.6} strokeDasharray={`${w} ${w}`} strokeLinecap="round" />
    </g>
  );
};

/** A small red car, side on, facing right (`flip` faces left); `bump` bobs it. */
export const Car: React.FC<{ x: number; y: number; s: number; bump?: number; flip?: boolean; color?: string }> = ({ x, y, s, bump = 0, flip, color = "#e8453c" }) => (
  <g transform={`translate(${x},${y - Math.abs(bump) * s * 0.05}) scale(${flip ? -1 : 1},1)`}>
    <ellipse cx={0} cy={s * 0.02} rx={s * 0.6} ry={s * 0.07} fill="#000" opacity={0.25} />
    <Block x={-s * 0.58} y={-s * 0.36} w={s * 1.16} h={s * 0.26} fill={color} r={s * 0.08} sw={3} />
    <path d={`M${-s * 0.32},${-s * 0.36} L${-s * 0.2},${-s * 0.62} L${s * 0.26},${-s * 0.62} L${s * 0.42},${-s * 0.36} Z`} fill={shade(color, -0.1)} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <path d={`M${-s * 0.22},${-s * 0.38} L${-s * 0.14},${-s * 0.56} L${s * 0.02},${-s * 0.56} L${s * 0.02},${-s * 0.38} Z`} fill="#bfe3f2" stroke={INK} strokeWidth={2} />
    <path d={`M${s * 0.07},${-s * 0.38} L${s * 0.07},${-s * 0.56} L${s * 0.22},${-s * 0.56} L${s * 0.34},${-s * 0.38} Z`} fill="#bfe3f2" stroke={INK} strokeWidth={2} />
    <circle cx={s * 0.55} cy={-s * 0.26} r={s * 0.05} fill="#fff3a8" stroke={INK} strokeWidth={2} />
    {[-0.34, 0.34].map((dx, i) => (
      <g key={i}>
        <circle cx={dx * s} cy={-s * 0.1} r={s * 0.13} fill="#2a2a2a" stroke={INK} strokeWidth={3} />
        <circle cx={dx * s} cy={-s * 0.1} r={s * 0.05} fill="#bbb" />
      </g>
    ))}
  </g>
);

/** The car at fraction `k` of a road, facing the way it drives. */
export const OnRoad: React.FC<{ pts: LL[]; k: number; t: number; s?: number }> = ({ pts, k, t, s = 110 }) => {
  const at = useAt();
  const a = at(along(pts, k).at), b = at(along(pts, Math.min(1, k + 0.01)).at);
  if (!a) return null;
  const left = b ? b[0] < a[0] - 0.5 : false;
  return (
    <g>
      <Car x={a[0]} y={a[1] - 4} s={s} bump={Math.sin(t / 3)} flip={left} />
    </g>
  );
};

/** A sign on a post at (x, y) with a title and a big value; `k` drops it in. */
export const Board: React.FC<{ x: number; y: number; w: number; title: string; value?: string; k?: number; tone?: string; type?: number }> = ({ x, y, w, title, value, k = 1, tone = "#f4e6c4", type = 1 }) => {
  if (k <= 0) return null;
  const drop = (1 - Math.min(1, k)) * -90;
  const h = value ? 180 : 120;
  const shown = title.slice(0, Math.max(0, Math.round(title.length * Math.min(1, type))));
  return (
    <g transform={`translate(0,${drop})`} opacity={Math.min(1, k * 2)}>
      <Limb a={[x, y]} b={[x, y - 120]} w={16} color="#6b4a2a" sw={3} />
      <Block x={x - w / 2} y={y - 120 - h} w={w} h={h} fill={tone} r={14} />
      <Txt x={x} y={y - 120 - h + 56} size={48} fill="#5a3a1a">{shown}</Txt>
      {value ? <Txt x={x} y={y - 120 - h + 134} size={64} fill={INK}>{value}</Txt> : null}
    </g>
  );
};

/** A green highway shield sign (screen space). */
export const Shield: React.FC<{ x: number; y: number; k: number; name: number; value: string; bounce?: number }> = ({ x, y, k, name, value, bounce = 0 }) => {
  if (k <= 0) return null;
  const q = Math.min(1, k);
  const top = "PAN-AMERICAN", low = "HIGHWAY";
  const n = Math.round((top.length + low.length) * Math.min(1, name));
  return (
    <g transform={`translate(0,${(1 - q) * 160 - 24 * bounce})`} opacity={Math.min(1, k * 2)}>
      <Limb a={[x - 180, y + 300]} b={[x - 180, y + 40]} w={18} color="#8a8f96" sw={3} />
      <Limb a={[x + 180, y + 300]} b={[x + 180, y + 40]} w={18} color="#8a8f96" sw={3} />
      <Block x={x - 300} y={y - 220} w={600} h={290} fill="#1f7a4a" r={22} />
      <rect x={x - 284} y={y - 204} width={568} height={258} rx={16} fill="none" stroke="#f4f4f0" strokeWidth={5} />
      <Txt x={x} y={y - 140} size={58} fill="#f4f4f0">{top.slice(0, n)}</Txt>
      <Txt x={x} y={y - 74} size={52} fill="#f4f4f0">{low.slice(0, Math.max(0, n - top.length))}</Txt>
      <Txt x={x} y={y + 18} size={62} fill="#ffe08a">{value}</Txt>
    </g>
  );
};

/** The odometer at the top of the frame (screen space): the kilometres driven so far. */
export const Odo: React.FC<{ value: string; k?: number }> = ({ value, k = 1 }) => (
  <Display x={240} y={150} w={600} h={200} label="KM DRIVEN" value={`${value} KM`} color="#ffd36a" bg="#1b1712" k={k} />
);

/** A road-closed barrier: red and white striped bar on two legs; `k` drops it in. */
export const Barrier: React.FC<{ x: number; y: number; s: number; k: number }> = ({ x, y, s, k }) => {
  if (k <= 0) return null;
  const q = Math.min(1, k);
  return (
    <g transform={`translate(0,${(1 - q) * -120})`} opacity={Math.min(1, k * 2)}>
      <Limb a={[x - s * 0.4, y]} b={[x - s * 0.4, y - s * 0.5]} w={s * 0.06} color="#777" sw={2} />
      <Limb a={[x + s * 0.4, y]} b={[x + s * 0.4, y - s * 0.5]} w={s * 0.06} color="#777" sw={2} />
      <Block x={x - s * 0.55} y={y - s * 0.62} w={s * 1.1} h={s * 0.2} fill="#f4f4f0" r={6} sw={3} />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M${x - s * 0.5 + i * s * 0.22},${y - s * 0.42} l${s * 0.1},${-s * 0.2} l${s * 0.1},0 l${-s * 0.1},${s * 0.2} Z`} fill={RED} />
      ))}
    </g>
  );
};

export const Tree: React.FC<{ x: number; y: number; s: number; k?: number }> = ({ x, y, s, k = 1 }) => {
  if (k <= 0) return null;
  const q = Math.min(1, k);
  return (
    <g transform={`translate(${x},${y}) scale(${q}) translate(${-x},${-y})`}>
      <rect x={x - s * 0.06} y={y - s * 0.4} width={s * 0.12} height={s * 0.4} fill="#6b4a2a" stroke={INK} strokeWidth={2} />
      <Ball x={x} y={y - s * 0.62} r={s * 0.3} fill={FOREST} sw={3} />
      <Ball x={x - s * 0.22} y={y - s * 0.46} r={s * 0.2} fill={shade(FOREST, -0.1)} sw={3} />
      <Ball x={x + s * 0.22} y={y - s * 0.46} r={s * 0.2} fill={shade(FOREST, 0.1)} sw={3} />
    </g>
  );
};

export const House: React.FC<{ x: number; y: number; s: number; k?: number; roof?: string }> = ({ x, y, s, k = 1, roof = "#b5532f" }) => {
  if (k <= 0) return null;
  const q = Math.min(1, k);
  return (
    <g transform={`translate(${x},${y}) scale(${q}) translate(${-x},${-y})`}>
      <Block x={x - s * 0.4} y={y - s * 0.5} w={s * 0.8} h={s * 0.5} fill="#f1e2bf" r={4} sw={3} />
      <path d={`M${x - s * 0.5},${y - s * 0.48} L${x},${y - s * 0.9} L${x + s * 0.5},${y - s * 0.48} Z`} fill={roof} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <rect x={x - s * 0.1} y={y - s * 0.3} width={s * 0.2} height={s * 0.3} fill="#6b4a2a" stroke={INK} strokeWidth={2} />
    </g>
  );
};

/** A question mark in a gold disc. */
export const QMark: React.FC<{ x: number; y: number; size: number; k: number; t: number }> = ({ x, y, size, k, t }) => {
  if (k <= 0) return null;
  const s = Math.min(1.1, k) * (1 + 0.04 * Math.sin(t / 6));
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <Glow x={0} y={0} r={size * 0.8} color="#ffe08a" o={0.5} />
      <Ball x={0} y={0} r={size * 0.45} fill={GOLD} />
      <Txt x={0} y={size * 0.04} size={size * 0.55} fill={INK}>?</Txt>
    </g>
  );
};

/** A cow, side on, facing right. */
export const Cow: React.FC<{ x: number; y: number; s: number; k?: number; flip?: boolean; graze?: number }> = ({ x, y, s, k = 1, flip, graze = 0 }) => {
  if (k <= 0) return null;
  const q = Math.min(1.15, k);
  return (
    <g transform={`translate(${x},${y}) scale(${(flip ? -1 : 1) * q},${q})`}>
      <ellipse cx={0} cy={0} rx={s * 0.55} ry={s * 0.08} fill="#000" opacity={0.2} />
      {[-0.3, -0.15, 0.2, 0.33].map((dx, i) => <Limb key={i} a={[dx * s, -s * 0.3]} b={[dx * s, 0]} w={s * 0.08} color="#3b3046" sw={2} />)}
      <Ball x={0} y={-s * 0.45} r={s * 0.45} ry={s * 0.22} fill="#f7f3ea" sw={3} />
      <Ball x={-s * 0.15} y={-s * 0.5} r={s * 0.12} ry={s * 0.09} fill="#3b3046" sw={0} shadow={false} />
      <Ball x={s * 0.18} y={-s * 0.4} r={s * 0.09} fill="#3b3046" sw={0} shadow={false} />
      <g transform={`rotate(${graze * 35} ${s * 0.4} ${-s * 0.5})`}>
        <Ball x={s * 0.55} y={-s * 0.55} r={s * 0.16} ry={s * 0.14} fill="#f7f3ea" sw={3} shadow={false} />
        <Ball x={s * 0.66} y={-s * 0.5} r={s * 0.08} ry={s * 0.07} fill="#e8a8a0" sw={2} shadow={false} />
        <path d={`M${s * 0.48},${-s * 0.68} l${-s * 0.06},${-s * 0.1} M${s * 0.6},${-s * 0.68} l${s * 0.06},${-s * 0.1}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <circle cx={s * 0.58} cy={-s * 0.6} r={s * 0.025} fill={INK} />
      </g>
    </g>
  );
};

/** A red germ: a spiky ball. */
export const Germ: React.FC<{ x: number; y: number; r: number; k?: number; t: number }> = ({ x, y, r, k = 1, t }) => {
  if (k <= 0) return null;
  const q = Math.min(1, k) * (1 + 0.08 * Math.sin(t / 4 + x));
  return (
    <g transform={`translate(${x},${y}) scale(${q})`} opacity={Math.min(1, k)}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + t / 30;
        return <line key={i} x1={0} y1={0} x2={Math.cos(a) * r * 1.5} y2={Math.sin(a) * r * 1.5} stroke="#8a1f16" strokeWidth={r * 0.25} strokeLinecap="round" />;
      })}
      <circle cx={0} cy={0} r={r} fill={RED} stroke={INK} strokeWidth={3} />
      <circle cx={-r * 0.3} cy={-r * 0.3} r={r * 0.22} fill="#f7b0a6" />
    </g>
  );
};

/** A car-carrier ship facing right with `cars` cars on deck. */
export const Ship: React.FC<{ x: number; y: number; s: number; cars?: number; flip?: boolean; puff?: number }> = ({ x, y, s, cars = 0, flip, puff = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -1 : 1},1)`}>
    <path d={`M${-s * 0.7},${-s * 0.25} L${s * 0.75},${-s * 0.25} L${s * 0.55},${s * 0.08} L${-s * 0.6},${s * 0.08} Z`} fill="#2f4a6a" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-s * 0.62} y={-s * 0.17} width={s * 1.3} height={s * 0.05} fill="#f4f1ea" />
    <Block x={-s * 0.62} y={-s * 0.62} w={s * 0.36} h={s * 0.37} fill="#f4f1ea" r={6} sw={3} />
    <Block x={-s * 0.52} y={-s * 0.86} w={s * 0.12} h={s * 0.24} fill={RED} r={4} sw={3} />
    {puff > 0 ? <circle cx={-s * 0.46} cy={-s * (0.95 + 0.3 * puff)} r={s * (0.06 + 0.1 * puff)} fill="#f4f1ea" opacity={1 - puff * 0.7} /> : null}
    {Array.from({ length: Math.min(4, Math.max(0, Math.round(cars))) }, (_, i) => (
      <Car key={i} x={-s * 0.1 + i * s * 0.22} y={-s * 0.25} s={s * 0.2} color={["#e8453c", "#f2b134", "#4f8fd0", "#7fae4a"][i]} />
    ))}
  </g>
);

/** Wave strokes in the open sea (life in the water); `pts` are sea points. */
export const Waves: React.FC<{ pts: LL[]; t: number; o?: number }> = ({ pts, t, o = 0.7 }) => {
  const at = useAt();
  return (
    <g>
      {pts.map((pt, i) => {
        const xy = at(pt);
        if (!xy || xy[0] < -100 || xy[0] > 1180 || xy[1] < -100 || xy[1] > 2020) return null;
        const ph = Math.sin(t / 14 + i * 1.7) * 10;
        return <path key={i} d={`M${xy[0] - 36 + ph},${xy[1]} q18,-14 36,0 q18,-14 36,0`} fill="none" stroke="#e6f2f0" strokeWidth={6} strokeLinecap="round" opacity={o} />;
      })}
    </g>
  );
};
/** Sea points for the wide map (Pacific and Atlantic), and for the close map round the isthmus. */
export const SEA_WIDE: LL[] = [[-125, 20], [-118, 10], [-110, 0], [-105, -12], [-98, -24], [-92, -36], [-85, 22], [-55, 30], [-45, 18], [-62, 40], [-50, 6], [-125, 32], [-112, 18], [-90, -5], [-45, 32], [-30, 20], [-82, -45]];
export const SEA_GAP: LL[] = [[-78.6, 9.15], [-78.0, 9.25], [-77.6, 9.4], [-76.9, 9.2], [-76.4, 9.1], [-78.6, 7.0], [-78.9, 7.6], [-78.2, 6.8], [-77.75, 6.5]];

export const mix = (a: number, b: number, k: number) => a + (b - a) * Math.max(0, Math.min(1, k));
export const mixLL = (a: LL, b: LL, k: number): LL => [mix(a[0], b[0], k), mix(a[1], b[1], k)];
/** a camera move between two framings: centre and scale (scale moved in log space so a zoom feels even) */
export const between = (a: { center: LL; scale: number }, b: { center: LL; scale: number }, k: number) => ({
  center: mixLL(a.center, b.center, k),
  scale: Math.exp(mix(Math.log(a.scale), Math.log(b.scale), k)),
});

export default AMap;
