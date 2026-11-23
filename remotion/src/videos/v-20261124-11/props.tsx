// Shared pieces for "Why does South Africa have a hole in it?" (device: paint and wrap). The channel's vintage
// map of southern Africa: the Basotho's blue painted over their valleys, the Free State's orange wrapping round
// and eating the lowlands, then South Africa wrapping all the way round the mountain island that was left.
import React from "react";
import { Ball, Block, Glow, INK, Limb, STROKE, shade } from "../../flat/kit";
import { WorldMap, country, useAt, useMap, type Fill } from "../../flat/map";
import { FlagArt } from "../../flat/flags";

export type LL = [number, number];

export const BLUE = "#2f6fd0", ORANGE = "#e88a2a", GOLD = "#f2b134", RIVER = "#3f86c9", ROCK = "#8a6a4a", SNOW = "#f4f8fb", MAIZE = "#e9c94a";
export const LESOTHO_C: LL = [28.25, -29.55];
export const MASERU: LL = [27.48, -29.31];
export const THABA: LL = [27.68, -29.37];
export const BLOEM: LL = [26.21, -29.12];
export const LOWEST: LL = [27.35, -30.15];
export const BELGIUM_AT: LL = [25.4, -29.3];
/** the Caledon River, north-east to south-west along Lesotho's north-west border */
export const CALEDON: LL[] = [[28.95, -28.68], [28.6, -28.62], [28.2, -28.72], [27.88, -28.88], [27.6, -29.12], [27.48, -29.31], [27.3, -29.5], [27.05, -29.72], [27.0, -29.9], [26.6, -30.25], [26.05, -30.6]];
/** the Basotho valleys west of the river, later the Free State's "conquered territory" (simplified) */
export const WEST: LL[] = [[28.95, -28.68], [28.6, -28.2], [27.8, -28.1], [27.0, -28.35], [26.45, -28.85], [26.35, -29.6], [26.75, -30.15], [27.0, -29.9], [27.05, -29.72], [27.3, -29.5], [27.48, -29.31], [27.6, -29.12], [27.88, -28.88], [28.2, -28.72], [28.6, -28.62]];
/** the colonies that joined in the union (simplified outlines); the Cape is the rest of South Africa */
export const FREE_STATE: LL[] = [[24.3, -28.6], [25.5, -27.3], [27.0, -26.6], [28.4, -27.0], [29.4, -27.5], [29.0, -28.6], [28.6, -28.62], [28.2, -28.72], [27.88, -28.88], [27.48, -29.31], [27.0, -29.9], [26.05, -30.6], [24.6, -30.0]];
export const TRANSVAAL: LL[] = [[26.0, -24.7], [27.5, -23.5], [29.5, -22.2], [31.3, -22.4], [32.0, -25.7], [31.0, -27.3], [30.0, -27.4], [29.4, -27.5], [28.4, -27.0], [27.0, -26.6], [25.5, -27.0], [25.0, -25.8]];
export const NATAL: LL[] = [[29.4, -27.5], [30.0, -27.4], [31.0, -27.3], [32.1, -26.85], [32.9, -26.9], [32.4, -28.6], [31.0, -29.8], [30.2, -31.1], [29.3, -30.9], [29.2, -29.9], [29.46, -29.4], [29.2, -28.6]];
/** mountain tops inside Lesotho (the Maloti and the Drakensberg edge) */
export const PEAKS: LL[] = [[28.6, -29.2], [29.0, -29.0], [29.2, -29.45], [28.85, -29.7], [28.4, -29.95], [28.0, -30.2], [28.75, -30.25], [29.15, -29.9], [28.3, -29.4], [27.95, -29.75], [28.5, -30.45], [29.3, -29.25]];

const NEAR = ["South Africa", "Lesotho", "eSwatini", "Botswana", "Namibia", "Zimbabwe", "Mozambique"];

/** Southern Africa on the old map; `center` and `scale` are the camera. */
export const Map: React.FC<{ center: LL; scale: number; colors?: Record<string, Fill>; children?: React.ReactNode }> = ({ center, scale, colors = {}, children }) => (
  <WorldMap w={1080} h={1920} center={center} scale={scale} kind="flat" look="vintage" political={0.4} detail="50m" only={NEAR} colors={colors}>
    {children}
  </WorldMap>
);

/** A region from [lon, lat] points, painted in from its middle as `k` goes 0 -> 1. */
export const Zone: React.FC<{ via: LL[]; fill: string; k?: number; o?: number; edge?: number }> = ({ via, fill, k = 1, o = 0.8, edge = 0 }) => {
  const at = useAt();
  const xy = via.map((p) => at(p)).filter((p): p is [number, number] => !!p);
  if (xy.length < 3 || k <= 0) return null;
  const cx = xy.reduce((a, p) => a + p[0], 0) / xy.length, cy = xy.reduce((a, p) => a + p[1], 0) / xy.length;
  const kk = Math.min(1, k);
  const d = xy.map((p, i) => `${i ? "L" : "M"}${(cx + (p[0] - cx) * kk).toFixed(1)},${(cy + (p[1] - cy) * kk).toFixed(1)}`).join(" ") + " Z";
  return (
    <g>
      <path d={d} fill={fill} opacity={o * kk} stroke={shade(fill, -0.45)} strokeWidth={4} strokeLinejoin="round" />
      {edge > 0 ? <path d={d} fill="none" stroke="#ffe08a" strokeWidth={9} pathLength={1} strokeDasharray={`${Math.min(1, edge)} 1`} strokeLinejoin="round" /> : null}
    </g>
  );
};

/** A region swept over from the west: only the part west of longitude `east` shows. */
export const Sweep: React.FC<{ via: LL[]; fill: string; east: number; id: string; o?: number }> = ({ via, fill, east, id, o = 0.85 }) => {
  const at = useAt();
  const xy = via.map((p) => at(p)).filter((p): p is [number, number] => !!p);
  const e = at([east, -29]);
  if (xy.length < 3 || !e) return null;
  const d = xy.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + " Z";
  return (
    <g>
      <defs><clipPath id={id}><rect x={-20000} y={-20000} width={e[0] + 20000} height={40000} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <path d={d} fill={fill} opacity={o} stroke={shade(fill, -0.45)} strokeWidth={4} strokeLinejoin="round" />
      </g>
    </g>
  );
};

/** Lesotho's own outline, lit along its border as `k` goes 0 -> 1 (and a soft glow inside). */
export const LesothoEdge: React.FC<{ k: number; color?: string; w?: number }> = ({ k, color = "#ffe08a", w = 10 }) => {
  const { path } = useMap();
  const c = country("Lesotho");
  if (!c || k <= 0) return null;
  const d = path(c) ?? undefined;
  return <path d={d} fill="none" stroke={color} strokeWidth={w} pathLength={1} strokeDasharray={`${Math.min(1, k)} 1`} strokeLinejoin="round" strokeLinecap="round" />;
};

/** A mountain peak standing on the map; `k` raises it. */
export const Peak: React.FC<{ x: number; y: number; s: number; k?: number }> = ({ x, y, s, k = 1 }) => {
  if (k <= 0) return null;
  const hh = s * Math.min(1, k);
  return (
    <g>
      <path d={`M${x - s * 0.62},${y} L${x - s * 0.05},${y - hh} L${x + s * 0.62},${y} Z`} fill={ROCK} stroke={INK} strokeWidth={STROKE * 0.6} strokeLinejoin="round" />
      <path d={`M${x - s * 0.05},${y - hh} L${x + s * 0.62},${y} L${x + s * 0.18},${y} Z`} fill={shade(ROCK, -0.25)} />
      <path d={`M${x - s * 0.22},${y - hh * 0.72} L${x - s * 0.05},${y - hh} L${x + s * 0.14},${y - hh * 0.72} L${x + s * 0.02},${y - hh * 0.64} Z`} fill={SNOW} stroke={INK} strokeWidth={2} />
    </g>
  );
};

/** The peaks at their [lon, lat] spots, risen one after another as `k` goes 0 -> 1. */
export const Peaks: React.FC<{ k: number; s?: number; pts?: LL[] }> = ({ k, s = 70, pts = PEAKS }) => {
  const at = useAt();
  return (
    <g>
      {pts.map((p, i) => {
        const xy = at(p);
        const kk = Math.max(0, Math.min(1, k * pts.length * 0.5 - i * 0.5));
        return xy ? <Peak key={i} x={xy[0]} y={xy[1]} s={s * (0.85 + (i % 3) * 0.12)} k={kk} /> : null;
      })}
    </g>
  );
};

/** A round thatched hut. */
export const Hut: React.FC<{ x: number; y: number; s: number; k?: number }> = ({ x, y, s, k = 1 }) => {
  if (k <= 0) return null;
  const q = Math.min(1, k);
  return (
    <g transform={`translate(${x},${y}) scale(${q}) translate(${-x},${-y})`}>
      <Block x={x - s * 0.4} y={y - s * 0.5} w={s * 0.8} h={s * 0.5} fill="#c99a62" r={s * 0.08} />
      <path d={`M${x - s * 0.55},${y - s * 0.45} L${x},${y - s * 1.0} L${x + s * 0.55},${y - s * 0.45} Z`} fill="#d9b25a" stroke={INK} strokeWidth={STROKE * 0.6} strokeLinejoin="round" />
      <rect x={x - s * 0.1} y={y - s * 0.32} width={s * 0.2} height={s * 0.32} fill={INK} />
    </g>
  );
};

/** A small person on the map: a body and a round head, walking (`step`). */
export const Walker: React.FC<{ x: number; y: number; s: number; color: string; step?: number; hat?: boolean }> = ({ x, y, s, color, step = 0, hat }) => {
  const sw = Math.sin(step) * s * 0.16;
  return (
    <g>
      <Limb a={[x, y - s * 0.45]} b={[x - sw, y]} w={s * 0.12} color="#3b3046" sw={2} />
      <Limb a={[x, y - s * 0.45]} b={[x + sw, y]} w={s * 0.12} color="#3b3046" sw={2} />
      <Block x={x - s * 0.17} y={y - s * 0.95} w={s * 0.34} h={s * 0.55} fill={color} r={s * 0.1} sw={3} />
      <Ball x={x} y={y - s * 1.15} r={s * 0.18} fill="#8a5a3a" sw={3} />
      {hat ? <rect x={x - s * 0.24} y={y - s * 1.32} width={s * 0.48} height={s * 0.08} fill="#4a3a2a" stroke={INK} strokeWidth={2} /> : null}
    </g>
  );
};

/** An ox wagon with a white canvas hood and an ox in front, facing right. */
export const Wagon: React.FC<{ x: number; y: number; s: number; roll?: number }> = ({ x, y, s, roll = 0 }) => (
  <g>
    <Ball x={x + s * 0.95} y={y - s * 0.3} r={s * 0.22} fill="#7a4a2a" ry={s * 0.16} sw={3} />
    <Ball x={x + s * 1.12} y={y - s * 0.36} r={s * 0.1} fill="#7a4a2a" sw={3} />
    <Limb a={[x + s * 0.4, y - s * 0.3]} b={[x + s * 0.8, y - s * 0.3]} w={s * 0.04} color="#5a3a1a" sw={2} />
    <Block x={x - s * 0.5} y={y - s * 0.42} w={s * 0.95} h={s * 0.22} fill="#8a5a32" sw={3} />
    <path d={`M${x - s * 0.48},${y - s * 0.42} Q${x - s * 0.5},${y - s * 0.95} ${x - s * 0.02},${y - s * 0.95} Q${x + s * 0.46},${y - s * 0.95} ${x + s * 0.43},${y - s * 0.42} Z`} fill={SNOW} stroke={INK} strokeWidth={3} />
    {[-0.3, 0.25].map((dx, i) => (
      <g key={i} transform={`rotate(${roll * 57} ${x + dx * s} ${y - s * 0.12})`}>
        <circle cx={x + dx * s} cy={y - s * 0.12} r={s * 0.16} fill="#5a3a1a" stroke={INK} strokeWidth={3} />
        <line x1={x + dx * s - s * 0.15} y1={y - s * 0.12} x2={x + dx * s + s * 0.15} y2={y - s * 0.12} stroke={INK} strokeWidth={3} />
      </g>
    ))}
  </g>
);

/** A flag on a pole planted at (x, y); `k` drops it in. `name` is a country the flag table has, else `color`. */
export const Planted: React.FC<{ x: number; y: number; s: number; k?: number; name?: string; color?: string; wave?: number }> = ({ x, y, s, k = 1, name, color = ORANGE, wave = 0 }) => {
  if (k <= 0) return null;
  const drop = (1 - Math.min(1, k)) * -s * 1.5;
  const fw = s * 0.9, fh = s * 0.6, top = y - s * 1.6 + drop;
  return (
    <g opacity={Math.min(1, k * 2)}>
      <Limb a={[x, y + drop]} b={[x, top]} w={s * 0.06} color="#6b4a2a" sw={3} />
      <g transform={`skewY(${wave * 4})`} style={{ transformOrigin: `${x}px ${top}px` }}>
        {name ? <FlagArt name={name} x={x} y={top} w={fw} h={fh} /> : <rect x={x} y={top} width={fw} height={fh} fill={color} />}
        <rect x={x} y={top} width={fw} height={fh} fill="none" stroke={INK} strokeWidth={3} />
      </g>
    </g>
  );
};

/** Two crossed spears with a shield, stamped onto the map (`k` stamps it). */
export const Spears: React.FC<{ x: number; y: number; s: number; k?: number }> = ({ x, y, s, k = 1 }) => {
  if (k <= 0) return null;
  const q = 1.6 - 0.6 * Math.min(1, k);
  return (
    <g transform={`translate(${x},${y}) scale(${q})`} opacity={Math.min(1, k * 2)}>
      {[-1, 1].map((d) => (
        <g key={d}>
          <Limb a={[-d * s * 0.6, s * 0.6]} b={[d * s * 0.5, -s * 0.5]} w={s * 0.07} color="#8a5a32" sw={2} />
          <path d={`M${d * s * 0.5},${-s * 0.5} l${d * s * 0.2},${-s * 0.2} l${-d * s * 0.06},${s * 0.16} Z`} fill="#c8c8c8" stroke={INK} strokeWidth={3} />
        </g>
      ))}
      <Ball x={0} y={0} r={s * 0.32} ry={s * 0.42} fill="#f2e6c8" sw={3} />
      <rect x={-s * 0.05} y={-s * 0.38} width={s * 0.1} height={s * 0.76} fill={INK} />
    </g>
  );
};

/** A folded letter with a red seal. */
export const Letter: React.FC<{ x: number; y: number; s: number; rot?: number }> = ({ x, y, s, rot = 0 }) => (
  <g transform={`rotate(${rot} ${x} ${y})`}>
    <Block x={x - s / 2} y={y - s * 0.33} w={s} h={s * 0.66} fill="#f6efdc" sw={3} />
    <path d={`M${x - s / 2},${y - s * 0.33} L${x},${y + s * 0.05} L${x + s / 2},${y - s * 0.33}`} fill="none" stroke={INK} strokeWidth={3} />
    <circle cx={x} cy={y + s * 0.05} r={s * 0.1} fill="#c8102e" stroke={INK} strokeWidth={2} />
  </g>
);

/** A question mark sign, popping on `k`. */
export const QMark: React.FC<{ x: number; y: number; size: number; k: number; t: number }> = ({ x, y, size, k, t }) => {
  if (k <= 0) return null;
  const s = Math.min(1.1, k) * (1 + 0.04 * Math.sin(t / 6));
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <Glow x={0} y={0} r={size * 0.8} color="#ffe08a" o={0.5} />
      <Ball x={0} y={0} r={size * 0.45} fill={GOLD} />
      <text x={0} y={size * 0.17} fontFamily="Poppins" fontWeight={900} fontSize={size * 0.55} textAnchor="middle" fill={INK}>?</text>
    </g>
  );
};

/** A crown. */
export const Crown: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g>
    <path d={`M${x - s * 0.5},${y} L${x - s * 0.55},${y - s * 0.55} L${x - s * 0.25},${y - s * 0.25} L${x},${y - s * 0.7} L${x + s * 0.25},${y - s * 0.25} L${x + s * 0.55},${y - s * 0.55} L${x + s * 0.5},${y} Z`} fill={GOLD} stroke={INK} strokeWidth={STROKE * 0.6} strokeLinejoin="round" />
    {[-0.55, 0, 0.55].map((d, i) => <circle key={i} cx={x + d * s} cy={y - s * (i === 1 ? 0.72 : 0.57)} r={s * 0.07} fill="#c8102e" stroke={INK} strokeWidth={2} />)}
  </g>
);

/** Maize rows striping a field at (x, y). */
export const Field: React.FC<{ x: number; y: number; w: number; k: number; color?: string }> = ({ x, y, w, k, color = MAIZE }) => {
  if (k <= 0) return null;
  return (
    <g opacity={Math.min(1, k * 1.5)}>
      {[0, 1, 2, 3].map((i) => <rect key={i} x={x - w / 2} y={y + i * w * 0.14} width={w * Math.min(1, k)} height={w * 0.07} rx={w * 0.03} fill={color} stroke={shade(color, -0.4)} strokeWidth={2} />)}
    </g>
  );
};
export default Map;
