// Shared pieces for "Why does Gambia sit inside Senegal?". The map is the stage of every beat (owner,
// 2026-11-17: "this niche is all about animation with maps"): one living map of West Africa that the
// camera moves over, the story's events happening on it as small things standing on their real places
// (a fort at Banjul, flags planted on the land, a border that draws itself, boats on the river).
import React from "react";
import { Ball, Block, INK, Limb, STROKE, Txt, rng, shade } from "../../flat/kit";
import { WorldMap, country, useAt, useMap, type Fill } from "../../flat/map";

/** The Gambia River from its mouth at Banjul upstream to the eastern end of the country ([lon, lat]). */
// down the middle of the country's own outline (Natural Earth 50m), so the river never leaves the strip
export const RIVER: [number, number][] = [
  [-16.78, 13.45], [-16.55, 13.42], [-16.29, 13.392], [-16.14, 13.377], [-15.99, 13.375], [-15.84, 13.406], [-15.69, 13.44], [-15.54, 13.503], [-15.39, 13.551], [-15.24, 13.616], [-15.09, 13.638], [-14.94, 13.617], [-14.79, 13.555], [-14.64, 13.486], [-14.49, 13.428], [-14.34, 13.393], [-14.19, 13.391], [-14.04, 13.404], [-13.89, 13.413],
];
export const BANJUL: [number, number] = [-16.58, 13.45];
export const GAMBIA_MID: [number, number] = [-15.3, 13.45];
/** The river moved north or south by `dlat` degrees (0.09° is about 10 km): the treaty's ruled lines. */
export const shifted = (dlat: number): [number, number][] => RIVER.map(([lo, la]) => [lo, la + dlat]);

/** The countries a West Africa map can show. */
const NEAR = ["Gambia", "Senegal", "Mauritania", "Mali", "Guinea", "Guinea-Bissau", "Guinea Bissau", "Sierra Leone", "Cabo Verde", "Cape Verde"];

export const SEA = "#5f9fae", LAND = "#e8d4a2", RED = "#e8453c", GREEN = "#6cbf6a";

/** The map of West Africa, framed on a point at a scale (pixels per radian); animate both to move the camera
 * over the map itself (a push-in is a bigger scale, not a zoomed picture). */
export const GeoMap: React.FC<{ center: [number, number]; scale: number; colors?: Record<string, Fill>; sea?: string; land?: string; children?: React.ReactNode }> = ({
  center, scale, colors = {}, sea, land, children,
}) => (
  <WorldMap w={1080} h={1920} center={center} scale={scale} kind="flat" look="vintage" political={0.6} names={["Mauritania", "Mali", "Guinea", "Guinea-Bissau"]} sea={sea} land={land} detail="50m" colors={colors} only={NEAR}>
    <Detail scale={scale} />
    {children}
  </WorldMap>
);

const CITIES: [string, number, number][] = [
  // a few, far apart: names that sit on the story's own labels were cut (QA, 2026-11-18)
  ["Dakar", -17.44, 14.69], ["Ziguinchor", -16.27, 12.58], ["Tambacounda", -13.67, 13.77], ["Saint-Louis", -16.49, 16.03],
];
const TREES: [number, number][] = (() => {
  const r = rng("gambia-savanna");
  return Array.from({ length: 140 }).map(() => [-16.6 + r() * 4.9, 12.7 + r() * 3.1] as [number, number]);
})();

/** What a real map has on its land: a faint graticule, savanna trees, cities with their names. */
const Detail: React.FC<{ scale: number }> = ({ scale }) => {
  const at = useAt();
  const k = scale / 9000;
  const lines: React.ReactNode[] = [];
  for (let lon = -19; lon <= -10; lon++) {
    const a = at([lon, 10]), b = at([lon, 18]);
    if (a && b) lines.push(<line key={`o${lon}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#ffffff" strokeOpacity={0.28} strokeWidth={2} strokeDasharray="8 10" />);
  }
  for (let lat = 10; lat <= 18; lat++) {
    const a = at([-20, lat]), b = at([-9, lat]);
    if (a && b) lines.push(<line key={`a${lat}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#ffffff" strokeOpacity={0.28} strokeWidth={2} strokeDasharray="8 10" />);
  }
  const tr = Math.min(26, 9 * Math.sqrt(k));
  return (
    <g>
      {lines}
      {false && TREES.map(([lo, la], i) => {
        const xy = at([lo, la]);
        if (!xy || xy[0] < -40 || xy[0] > 1120 || xy[1] < -40 || xy[1] > 1960) return null;
        return <g key={i} opacity={0.75}>
          <rect x={xy[0] - tr * 0.15} y={xy[1] - tr * 0.2} width={tr * 0.3} height={tr * 0.9} fill="#8a6a4a" />
          <circle cx={xy[0]} cy={xy[1] - tr * 0.45} r={tr * 0.6} fill="#5f9e4a" stroke={INK} strokeWidth={1.5} />
        </g>;
      })}
      {CITIES.map(([name, lo, la]) => {
        const xy = at([lo, la]);
        if (!xy || xy[0] < 20 || xy[0] > 760 || xy[1] < 150 || xy[1] > 1700) return null;   // names run right: keep them inside the frame
        return <g key={name}>
          <circle cx={xy[0]} cy={xy[1]} r={9} fill="#ffffff" stroke={INK} strokeWidth={4} />
          <Txt x={xy[0] + 16} y={xy[1] - 4} size={30} fill="#1d1a2b" anchor="start" deco stroke="#ffffff">{name}</Txt>
        </g>;
      })}
    </g>
  );
};

/** Draw children at a [lon, lat] on the current map. */
export const At: React.FC<{ at: [number, number]; children: (x: number, y: number) => React.ReactNode }> = ({ at, children }) => {
  const xy = useAt()(at);
  return xy ? <>{children(xy[0], xy[1])}</> : null;
};

/** A country's border drawing itself (k 0 → 1), white dashes over an ink line. */
export const BorderTrace: React.FC<{ name: string; k: number; color?: string; width?: number; glow?: number }> = ({ name, k, color = "#ffffff", width = 10, glow = 0 }) => {
  const { path } = useMap();
  const c = country(name, "50m");
  const d = c ? path(c) ?? undefined : undefined;
  if (!d || k <= 0) return null;
  const kk = Math.min(1, k);
  return (
    <g>
      {glow > 0 ? <path d={d} fill="none" stroke="#fff3b0" strokeWidth={width * 4} opacity={0.35 * glow} pathLength={1} strokeDasharray={`${kk} 1`} /> : null}
      <path d={d} fill="none" stroke={INK} strokeWidth={width + 6} pathLength={1} strokeDasharray={`${kk} 1`} strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={width} pathLength={1} strokeDasharray={`${kk} 1`} strokeLinejoin="round" />
    </g>
  );
};

/** A tint over the whole map: old paper (sepia), dusk (orange), night (blue). */
export const Tint: React.FC<{ color: string; o: number }> = ({ color, o }) =>
  // a plain see-through layer (the headless renderer ignores blend modes), kept light
  o > 0 ? <rect x={-2000} y={-2000} width={5080} height={5920} fill={color} opacity={o * 0.5} /> : null;

// ------------------------------------------------------------------ flags

/** The Gambian flag: red, blue edged in white, green. `rise` 0..1 unfurls it. */
export const GambiaFlag: React.FC<{ x: number; y: number; w: number; wave?: number; rise?: number }> = ({ x, y, w, wave = 0, rise = 1 }) => {
  const h = w * 0.66, s = h / 18;
  return (
    <g transform={`translate(${x} ${y}) skewY(${wave}) scale(${Math.max(0.01, rise)} 1)`}>
      <rect x={0} y={0} width={w} height={6 * s} fill="#ce1126" />
      <rect x={0} y={6 * s} width={w} height={s} fill="#ffffff" />
      <rect x={0} y={7 * s} width={w} height={4 * s} fill="#0c1c8c" />
      <rect x={0} y={11 * s} width={w} height={s} fill="#ffffff" />
      <rect x={0} y={12 * s} width={w} height={6 * s} fill="#3a7728" />
      <rect x={0} y={0} width={w} height={h} fill="none" stroke={INK} strokeWidth={STROKE * 0.7} />
    </g>
  );
};

/** France's flag: blue, white, red. */
export const FranceFlag: React.FC<{ x: number; y: number; w: number; wave?: number }> = ({ x, y, w, wave = 0 }) => {
  const h = w * 0.66;
  return (
    <g transform={`translate(${x} ${y}) skewY(${wave})`}>
      <rect x={0} y={0} width={w / 3} height={h} fill="#1f4fbf" />
      <rect x={w / 3} y={0} width={w / 3} height={h} fill="#ffffff" />
      <rect x={(2 * w) / 3} y={0} width={w / 3} height={h} fill="#e0352b" />
      <rect x={0} y={0} width={w} height={h} fill="none" stroke={INK} strokeWidth={STROKE * 0.7} />
    </g>
  );
};

/** Senegal's flag: green, yellow with a green star, red. */
export const SenegalFlag: React.FC<{ x: number; y: number; w: number; wave?: number }> = ({ x, y, w, wave = 0 }) => {
  const h = w * 0.66, cx = w / 2, cy = h / 2, r = h * 0.2;
  const star = Array.from({ length: 10 }).map((_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.42 : r;
    return `${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`;
  }).join(" ");
  return (
    <g transform={`translate(${x} ${y}) skewY(${wave})`}>
      <rect x={0} y={0} width={w / 3} height={h} fill="#2f9e44" />
      <rect x={w / 3} y={0} width={w / 3} height={h} fill="#ffd43b" />
      <rect x={(2 * w) / 3} y={0} width={w / 3} height={h} fill="#e0352b" />
      <polygon points={star} fill="#2f9e44" />
      <rect x={0} y={0} width={w} height={h} fill="none" stroke={INK} strokeWidth={STROKE * 0.7} />
    </g>
  );
};

/** Britain's flag, simplified: blue with the white and red crosses. */
export const BritishFlag: React.FC<{ x: number; y: number; w: number; wave?: number }> = ({ x, y, w, wave = 0 }) => {
  const h = w * 0.5;
  return (
    <g transform={`translate(${x} ${y}) skewY(${wave})`}>
      <rect x={0} y={0} width={w} height={h} fill="#1c3f94" />
      <line x1={0} y1={0} x2={w} y2={h} stroke="#ffffff" strokeWidth={h * 0.2} />
      <line x1={w} y1={0} x2={0} y2={h} stroke="#ffffff" strokeWidth={h * 0.2} />
      <line x1={0} y1={0} x2={w} y2={h} stroke="#d0262d" strokeWidth={h * 0.07} />
      <line x1={w} y1={0} x2={0} y2={h} stroke="#d0262d" strokeWidth={h * 0.07} />
      <rect x={w / 2 - h * 0.17} y={0} width={h * 0.34} height={h} fill="#ffffff" />
      <rect x={0} y={h / 2 - h * 0.17} width={w} height={h * 0.34} fill="#ffffff" />
      <rect x={w / 2 - h * 0.1} y={0} width={h * 0.2} height={h} fill="#d0262d" />
      <rect x={0} y={h / 2 - h * 0.1} width={w} height={h * 0.2} fill="#d0262d" />
      <rect x={0} y={0} width={w} height={h} fill="none" stroke={INK} strokeWidth={STROKE * 0.7} />
    </g>
  );
};

/** A pole planted at (x, y) with a flag at its top, raised to `rise` (0 bottom .. 1 top). */
export const Pole: React.FC<{ x: number; y: number; h: number; rise?: number; children: (top: number) => React.ReactNode }> = ({ x, y, h, rise = 1, children }) => (
  <g>
    <Limb a={[x, y]} b={[x, y - h]} w={Math.max(6, h * 0.05)} color="#d9d2c3" />
    <Ball x={x} y={y - h - 6} r={Math.max(6, h * 0.05)} fill="#ffc43d" shadow={false} />
    {children(y - h * 0.12 - (h * 0.75) * rise)}
  </g>
);

type FlagKind = "gambia" | "france" | "britain" | "senegal";
const FLAGS: Record<FlagKind, React.FC<{ x: number; y: number; w: number; wave?: number }>> = {
  gambia: GambiaFlag, france: FranceFlag, britain: BritishFlag, senegal: SenegalFlag,
};

/** A flag planted on the map at [lon, lat]: it drops in and sticks (k 0 → 1), the pole's foot on the place. */
export const MapFlag: React.FC<{ at: [number, number]; kind: FlagKind; k: number; h?: number; wave?: number }> = ({ at, kind, k, h = 120, wave = 0 }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  const F = FLAGS[kind];
  h *= 1.4;   // big enough to read on a phone
  const drop = (1 - Math.min(1, k)) * -90;
  return (
    <g transform={`translate(0 ${drop})`} opacity={Math.min(1, k * 3)}>
      <ellipse cx={xy[0]} cy={xy[1]} rx={h * 0.12} ry={h * 0.04} fill={INK} opacity={0.35} />
      <Pole x={xy[0]} y={xy[1]} h={h}>{(top) => <F x={xy[0] + 3} y={top} w={h * 0.62} wave={wave} />}</Pole>
    </g>
  );
};

// ------------------------------------------------------------------ things that stand on the map

/** A stone fort (the British post at the river mouth), its door facing the viewer; `s` is its width. */
export const FortIcon: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s / 100})`}>
    <Block x={-50} y={-60} w={100} h={60} fill="#b9ab92" sw={4} />
    {[0, 1, 2, 3].map((i) => <Block key={i} x={-50 + i * 28} y={-74} w={16} h={16} fill="#b9ab92" shadow={false} sw={4} />)}
    <Block x={-12} y={-30} w={24} h={30} r={10} fill="#5a4a3a" shadow={false} sw={4} />
  </g>
);

/** A tall sailing ship, facing right; `s` is its length. */
export const ShipIcon: React.FC<{ x: number; y: number; s: number; roll?: number }> = ({ x, y, s, roll = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${roll}) scale(${s / 100})`}>
    {[-22, 8, 34].map((mx, i) => (
      <g key={i}>
        <Limb a={[mx, 0]} b={[mx, -88 + i * 10]} w={4} color="#6b4423" sw={3} />
        <rect x={mx - 20} y={-80 + i * 10} width={40} height={26} rx={4} fill="#fff4d6" stroke={INK} strokeWidth={3} />
        <rect x={mx - 17} y={-48 + i * 6} width={34} height={22} rx={4} fill="#fff4d6" stroke={INK} strokeWidth={3} />
      </g>
    ))}
    <path d="M -55 -4 L 58 -4 L 45 20 L -45 20 Z" fill="#6b3b1e" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
  </g>
);

/** A wooden river boat (a pirogue), facing right, with an optional sail or a load of peanut sacks. */
export const Boat: React.FC<{ x: number; y: number; s: number; color?: string; sail?: boolean; load?: boolean }> = ({ x, y, s, color = "#b5652b", sail = false, load = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s / 100})`}>
    {sail ? <g>
      <Limb a={[0, -10]} b={[0, -150]} w={8} color="#6b4423" />
      <polygon points="6,-140 6,-24 80,-24" fill="#fff4d6" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
    </g> : null}
    {load ? <g>
      <Ball x={-30} y={-22} r={20} fill="#d8b479" shadow={false} />
      <Ball x={8} y={-24} r={22} fill="#caa36a" shadow={false} />
      <Ball x={42} y={-20} r={18} fill="#d8b479" shadow={false} />
    </g> : null}
    <path d="M -90 -18 L 95 -18 Q 85 18 40 22 L -50 22 Q -88 14 -90 -18 Z" fill={color} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
    <path d="M -80 -6 L 88 -6" stroke={shade(color, 0.25)} strokeWidth={6} />
  </g>
);

/** A round village hut; `s` is its width. */
export const Hut: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s / 100})`}>
    <Block x={-38} y={-44} w={76} h={44} fill="#e9d2a6" shadow={false} sw={4} />
    <polygon points="-52,-40 0,-92 52,-40" fill="#b07b3a" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

/** A baobab tree, trunk at (x, y); `s` about its height. */
export const Baobab: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s / 100})`}>
    <path d="M -34 0 Q -30 -90 -22 -150 L 22 -150 Q 30 -90 34 0 Z" fill="#9a7457" stroke={INK} strokeWidth={STROKE} />
    {[[-70, -175, 44], [-20, -200, 52], [40, -190, 48], [85, -165, 36], [0, -160, 40]].map(([dx, dy, r], i) => (
      <Ball key={i} x={dx!} y={dy!} r={r!} fill={i % 2 ? "#5f9e4a" : "#6fae55"} shadow={false} />
    ))}
  </g>
);

/** A border post: a striped barrier and a small hut, standing on a point of the border. */
export const BorderPost: React.FC<{ x: number; y: number; s: number; lift: number }> = ({ x, y, s, lift }) => (
  <g transform={`translate(${x} ${y}) scale(${s / 100})`}>
    <Block x={-70} y={-60} w={44} h={60} fill="#f1e3c6" sw={4} />
    <Block x={-76} y={-70} w={56} h={12} fill="#3a7728" shadow={false} sw={4} />
    <Block x={-20} y={-34} w={10} h={34} fill="#2f3445" shadow={false} sw={3} />
    <g transform={`rotate(${-70 * lift} -15 -30)`}>
      <rect x={-15} y={-36} width={90} height={12} fill="#ffffff" stroke={INK} strokeWidth={3} />
      {[0, 1, 2].map((i) => <rect key={i} x={-5 + i * 30} y={-36} width={15} height={12} fill={RED} />)}
    </g>
  </g>
);

const props = { RIVER, BANJUL, GAMBIA_MID };
export default props;
