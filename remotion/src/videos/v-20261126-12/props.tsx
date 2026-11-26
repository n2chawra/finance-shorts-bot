// Shared pieces for "Why would the Mediterranean turn into a salt desert?" (device: flood or grow). The vintage map
// of the Mediterranean; the sea dries basin by basin to white salt (water kept in shrinking pools in the deep basins,
// masked so it never covers land), the land bridge that closes Gibraltar, and the Atlantic flooding back as moving water.
import React from "react";
import { Ball, Block, Glow, INK, Limb, STROKE, Txt } from "../../flat/kit";
import { WorldMap, country, useAt, useMap, type Fill } from "../../flat/map";
import { MapWater } from "../../flat/water";

export type LL = [number, number];

export const SEA = "#5f9fae", SALT = "#efe7d2", GOLD = "#f2b134", RED = "#c8102e";
export const GIB: LL = [-5.6, 35.97];
export const NILE: LL = [31.0, 31.5];

/** the Mediterranean's outline, simplified (clockwise from the strait); islands come back through the land mask */
export const MED: LL[] = [[-5.6, 36.1], [-4.5, 36.75], [-2.0, 36.8], [-0.4, 38.4], [0.3, 39.2], [0.9, 40.9], [3.2, 41.9], [3.1, 43.2], [4.6, 43.5], [6.6, 43.2], [8.6, 44.5], [10.2, 44.0], [10.6, 42.9], [12.3, 41.8], [14.1, 40.9], [15.7, 40.1], [16.6, 38.9], [17.2, 39.4], [18.5, 40.2], [16.9, 41.3], [13.6, 43.7], [12.3, 44.8], [13.7, 45.8], [15.2, 44.5], [17.5, 43.1], [19.4, 41.9], [19.4, 40.3], [21.1, 38.4], [22.0, 36.6], [23.2, 36.4], [23.0, 38.1], [22.9, 40.6], [24.4, 41.0], [26.1, 40.9], [26.3, 40.0], [26.8, 39.2], [27.2, 37.9], [28.0, 36.8], [29.7, 36.2], [32.6, 36.2], [34.7, 36.9], [36.2, 36.7], [35.9, 35.2], [35.5, 33.9], [34.9, 32.4], [34.2, 31.3], [32.3, 31.2], [30.0, 31.5], [28.0, 31.1], [25.2, 31.7], [22.0, 32.9], [20.1, 32.3], [19.9, 31.0], [18.5, 30.4], [15.2, 32.3], [13.0, 32.9], [11.1, 33.4], [10.1, 34.3], [11.1, 35.3], [10.4, 37.0], [9.6, 37.4], [7.0, 37.1], [3.0, 36.9], [0.0, 35.9], [-2.1, 35.2], [-5.3, 35.9]];

/** the deep basins where the last water pools: [lon, lat, radius in degrees when full] */
export const POOLS: [number, number, number][] = [[4.5, 39.0, 7.5], [12.0, 40.0, 4.5], [18.5, 35.0, 8.0], [27.5, 33.8, 7.5], [24.5, 38.5, 4.5], [15.5, 43.0, 4.0], [-1.5, 36.4, 3.5]];

export const COUNTRIES = ["Spain", "Portugal", "France", "Italy", "Switzerland", "Austria", "Germany", "Slovenia", "Croatia", "Bosnia and Herz.", "Serbia", "Montenegro", "Kosovo", "Albania", "Macedonia", "N. Macedonia", "Greece", "Bulgaria", "Romania", "Hungary", "Turkey", "Cyprus", "N. Cyprus", "Syria", "Lebanon", "Israel", "Palestine", "Jordan", "Iraq", "Saudi Arabia", "Egypt", "Libya", "Tunisia", "Algeria", "Morocco", "Malta", "Sudan", "Chad", "Niger", "Mali", "Mauritania", "Moldova", "Ukraine", "Georgia", "Armenia", "Azerbaijan", "Iran", "Belgium", "Luxembourg", "Czechia", "Slovakia", "Andorra", "Monaco", "San Marino", "Vatican"];

/** The Mediterranean on the old map; `center` and `scale` are the camera. */
export const Map: React.FC<{ center: LL; scale: number; colors?: Record<string, Fill>; children?: React.ReactNode }> = ({ center, scale, colors = {}, children }) => (
  <WorldMap w={1080} h={1920} center={center} scale={scale} kind="flat" look="vintage" political={0.3} detail="50m" only={COUNTRIES} colors={colors}>
    {children}
  </WorldMap>
);

const ringD = (at: (p: LL) => [number, number] | null, via: LL[]) => {
  const xy = via.map((p) => at(p)).filter((p): p is [number, number] => !!p);
  return xy.length < 3 ? null : xy.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + " Z";
};

/** A wavy closed outline round (x, y): a pool's shore that never looks like a circle. */
export const blob = (x: number, y: number, r: number, t: number, i: number) => {
  const n = 56;
  const pts = Array.from({ length: n }).map((_, j) => {
    const a = (j / n) * Math.PI * 2;
    const rr = r * (1 + 0.09 * Math.sin(3 * a + i * 1.3) + 0.05 * Math.sin(7 * a + t / 9 + i) + 0.025 * Math.sin(13 * a - t / 6));
    return `${j ? "L" : "M"}${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr * 0.9).toFixed(1)}`;
  });
  return pts.join(" ") + " Z";
};

/** A mask that is white on the sea and black on land, so what is drawn under it never covers a coast. */
export const SeaMask: React.FC<{ id: string }> = ({ id }) => {
  const { path } = useMap();
  return (
    <defs>
      <mask id={id} maskUnits="userSpaceOnUse" x={-20000} y={-20000} width={40000} height={40000}>
        <rect x={-20000} y={-20000} width={40000} height={40000} fill="#fff" />
        {COUNTRIES.map((n) => { const c = country(n); const d = c ? path(c) : null; return d ? <path key={n} d={d} fill="#000" /> : null; })}
      </mask>
    </defs>
  );
};

/**
 * The sea drying: `level` 1 = full (nothing drawn over the map's own blue), 0 = all salt. The salt basin is drawn
 * over the sea; the water stays in pools over the deep basins that shrink as `level` falls, their edges foaming.
 * `glitter` sparkles the salt; `t` is the story clock.
 */
export const Dry: React.FC<{ level: number; t: number; glitter?: number; shore?: number }> = ({ level, t, glitter = 0, shore = 0 }) => {
  const at = useAt();
  const { proj } = useMap();
  const d = ringD(at, MED);
  if (!d || level >= 1) return null;
  const px = proj.scale() * (Math.PI / 180) * 1.25;     // pixels per degree, roughly, at these latitudes
  const lv = Math.max(0, level);
  const pools = POOLS.map(([lon, lat, r], i) => {
    const xy = at([lon, lat]);
    return xy ? { x: xy[0], y: xy[1], r: r * px * Math.pow(lv, 0.8) * (1 + 0.015 * Math.sin(t / 9 + i)) } : null;
  }).filter((p): p is { x: number; y: number; r: number } => !!p && p.r > 1);
  const sparkle: React.ReactNode[] = [];
  if (glitter > 0) {
    for (let i = 0; i < 40; i++) {
      const a = (i * 137.5) % 360, rr = (i * 53) % 100;
      const base = POOLS[i % POOLS.length]!;
      const xy = at([base[0] + Math.cos((a * Math.PI) / 180) * rr * 0.07, base[1] + Math.sin((a * Math.PI) / 180) * rr * 0.04]);
      if (!xy) continue;
      const tw = 0.5 + 0.5 * Math.sin(t / 5 + i * 1.7);
      sparkle.push(<path key={i} d={`M${xy[0]},${xy[1] - 9 * tw - 3} L${xy[0] + 3},${xy[1]} L${xy[0]},${xy[1] + 9 * tw + 3} L${xy[0] - 3},${xy[1]} Z`} fill="#ffffff" opacity={glitter * tw} />);
    }
  }
  return (
    <g>
      <SeaMask id="med-sea" />
      <defs><clipPath id="med-ring"><path d={d} /></clipPath></defs>
      <g mask="url(#med-sea)">
        <path d={d} fill={SALT} opacity={Math.min(1, (1 - lv) * 4)} />
        <g clipPath="url(#med-ring)">
          {pools.map((p, i) => <path key={`f${i}`} d={blob(p.x, p.y, p.r + 9, t, i)} fill="#f4fbfb" opacity={0.85} />)}
          {pools.map((p, i) => <path key={`s${i}`} d={blob(p.x, p.y, p.r + 26, t * 0.7, i + 3)} fill="#8fcfdc" opacity={0.35} />)}
          {pools.map((p, i) => <path key={`w${i}`} d={blob(p.x, p.y, p.r, t, i)} fill={SEA} />)}
          {pools.map((p, i) => <circle key={`r${i}`} cx={p.x + Math.sin(t / 13 + i) * p.r * 0.2} cy={p.y} r={p.r * 0.55} fill="none" stroke="#9fd0da" strokeWidth={4} opacity={0.5} />)}
        </g>
        {sparkle}
        {shore > 0 ? <path d={d} fill="none" stroke="#ffe08a" strokeWidth={8} strokeDasharray="22 16" opacity={Math.min(1, shore)} /> : null}
      </g>
    </g>
  );
};

/** The Atlantic flooding back in from Gibraltar over the salt (moving water, masked to the sea). */
export const Flood: React.FC<{ k: number; t: number }> = ({ k, t }) => (
  k <= 0 ? null : (
    <g mask="url(#med-sea)">
      <MapWater area={MED} from={GIB} k={k} t={t} deep={SEA} shallow="#8fcfdc" />
    </g>
  )
);

/** The land bridge that closes the strait: land rises from both coasts (`k`) and meets in the middle; `crack` splits it. */
export const Bridge: React.FC<{ k: number; crack?: number }> = ({ k, crack = 0 }) => {
  const at = useAt();
  if (k <= 0) return null;
  const kk = Math.min(1, k);
  const half = (lat0: number, lat1: number) => {
    const lat = lat0 + (lat1 - lat0) * kk;
    const ring: LL[] = [[-5.95, lat0], [-5.25, lat0], [-5.28, lat], [-5.45, lat + (lat1 - lat0) * 0.08], [-5.62, lat], [-5.78, lat + (lat1 - lat0) * 0.06], [-5.92, lat]];
    return ringD(at, ring);
  };
  const n = half(36.12, 35.965), s = half(35.82, 35.975);
  const c1 = at([-5.62, 36.1]), c2 = at([-5.58, 35.97]), c3 = at([-5.64, 35.84]);
  return (
    <g>
      {n ? <path d={n} fill="#dcc596" stroke="#4a3218" strokeWidth={4} strokeLinejoin="round" /> : null}
      {s ? <path d={s} fill="#dcc596" stroke="#4a3218" strokeWidth={4} strokeLinejoin="round" /> : null}
      {crack > 0 && c1 && c2 && c3 ? <path d={`M${c1[0]},${c1[1]} L${c2[0] + 14},${(c1[1] + c2[1]) / 2} L${c2[0]},${c2[1]} L${c3[0]},${c3[1]}`} fill="none" stroke={INK} strokeWidth={9} pathLength={1} strokeDasharray={`${Math.min(1, crack)} 1`} strokeLinecap="round" /> : null}
    </g>
  );
};

/** Renders `draw(x, y)` at a [lon, lat] on the current map. */
export const On: React.FC<{ at: LL; draw: (x: number, y: number) => React.ReactNode }> = ({ at, draw }) => {
  const xy = useAt()(at);
  return xy ? <>{draw(xy[0], xy[1])}</> : null;
};

/** A blazing sun with turning rays. */
export const Sun: React.FC<{ x: number; y: number; r: number; k?: number; t: number }> = ({ x, y, r, k = 1, t }) => {
  if (k <= 0) return null;
  const q = Math.min(1, k);
  return (
    <g transform={`translate(${x},${y}) scale(${q}) rotate(${t * 0.6})`}>
      <Glow x={0} y={0} r={r * 2.2} color="#ffd36a" o={0.6} />
      {Array.from({ length: 12 }).map((_, i) => <Limb key={i} a={[Math.cos((i * Math.PI) / 6) * r * 1.2, Math.sin((i * Math.PI) / 6) * r * 1.2]} b={[Math.cos((i * Math.PI) / 6) * r * 1.6, Math.sin((i * Math.PI) / 6) * r * 1.6]} w={r * 0.12} color={GOLD} sw={3} />)}
      <Ball x={0} y={0} r={r} fill="#ffc43d" sw={4} />
    </g>
  );
};

/** Curls of steam rising from (x, y). */
export const Steam: React.FC<{ x: number; y: number; t: number; k: number; n?: number; s?: number }> = ({ x, y, t, k, n = 3, s = 1 }) => {
  if (k <= 0) return null;
  return (
    <g opacity={0.85 * Math.min(1, k)}>
      {Array.from({ length: n }).map((_, i) => {
        const ph = ((t * 1.6 + i * 40) % 120) / 120;
        const yy = y - ph * 160 * s, xx = x + (i - (n - 1) / 2) * 50 * s + Math.sin(t / 8 + i) * 10;
        return <path key={i} d={`M${xx},${yy} q${-16 * s},${-22 * s} 0,${-44 * s} q${16 * s},${-22 * s} 0,${-44 * s}`} fill="none" stroke="#ffffff" strokeWidth={8 * s} strokeLinecap="round" opacity={1 - ph} />;
      })}
    </g>
  );
};

/** A gauge on a post: a label above and a big figure on its face; `needle` 0..1 swings its pointer. */
export const Gauge: React.FC<{ x: number; y: number; label: string; value: string; k?: number; needle?: number; w?: number }> = ({ x, y, label, value, k = 1, needle = 0, w = 520 }) => {
  if (k <= 0) return null;
  const q = Math.min(1, k), h = 230;
  return (
    <g transform={`translate(${x},${y}) scale(${q}) translate(${-x},${-y})`} opacity={Math.min(1, k * 2)}>
      <Block x={x - w / 2} y={y - h} w={w} h={h} fill="#f4e6c4" r={20} />
      <Txt x={x} y={y - h + 62} size={46} fill="#6b5236">{label}</Txt>
      <Txt x={x} y={y - 50} size={72} fill="#3a2a1a">{value}</Txt>
      {needle > 0 ? <Limb a={[x + w / 2 - 50, y - 30]} b={[x + w / 2 - 50 + Math.cos(Math.PI * (1 - needle)) * 36, y - 30 - Math.sin(Math.PI * (1 - needle)) * 36]} w={8} color={RED} sw={2} /> : null}
    </g>
  );
};

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

/** Arrows of water streaming along a line from a to b, moving with `t`. */
export const Stream: React.FC<{ a: [number, number]; b: [number, number]; t: number; k?: number; color?: string }> = ({ a, b, t, k = 1, color = "#e7f6f8" }) => {
  if (k <= 0) return null;
  const n = 4;
  return (
    <g opacity={Math.min(1, k)}>
      {Array.from({ length: n }).map((_, i) => {
        const f = ((t / 30 + i / n) % 1);
        const x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f;
        const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
        return <path key={i} transform={`translate(${x},${y}) rotate(${ang})`} d="M-30,-14 L10,-14 L10,-28 L40,0 L10,28 L10,14 L-30,14 Z" fill={color} stroke={INK} strokeWidth={STROKE * 0.5} opacity={Math.sin(f * Math.PI)} />;
      })}
    </g>
  );
};

/** A stone tablet standing on the map, its words carved big. */
export const Tablet: React.FC<{ x: number; y: number; text: string; sub: string; k?: number }> = ({ x, y, text, sub, k = 1 }) => {
  if (k <= 0) return null;
  const rise = (1 - Math.min(1, k)) * 120;
  return (
    <g opacity={Math.min(1, k * 2)} transform={`translate(0,${rise})`}>
      <path d={`M${x - 220},${y} L${x - 220},${y - 200} Q${x},${y - 280} ${x + 220},${y - 200} L${x + 220},${y} Z`} fill="#b9b1a2" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <Txt x={x} y={y - 120} size={64} fill="#2e2a26">{text}</Txt>
      <Txt x={x} y={y - 50} size={46} fill="#3e3a34">{sub}</Txt>
    </g>
  );
};

export default Map;
