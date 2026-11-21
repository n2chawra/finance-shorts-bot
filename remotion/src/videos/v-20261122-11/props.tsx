// Shared pieces for "Why are English cities poorer in the east?" (device: flood or grow). Two stages:
// the old English city as a vintage street plan (a river across it, the town hall in the middle, villas to the
// west, terraces to the east, factory chimneys whose smoke the west wind carries east), and England on the
// channel's old map with its industrial cities pinned, each pin split into a green west and a grey east.
import React from "react";
import { Block, Glow, INK, Limb, STROKE, Txt, rng, shade } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { MapLabel, WorldMap, useAt } from "../../flat/map";

export const GREEN = "#6fa85a", GREY = "#5d5862", RED = "#d9483b", GOLD = "#f2b134", SOOT = "#2f2a30", PAPER = "#e8d4a2", SEA_BLUE = "#3f7f96";

// ------------------------------------------------------------------ the city plan (frame coordinates, 1080 x 1920)

export const CITY = { x0: 40, x1: 1040, y0: 400, y1: 1380, mid: 540 };
const RIVER = "M 20 985 C 230 925, 380 1065, 560 1000 S 860 925, 1060 985";
export const HALL: [number, number] = [540, 860];
export const CHIMNEYS: [number, number][] = [[400, 760], [610, 700], [720, 830], [470, 1150], [650, 1210], [800, 1110], [330, 1270]];

export type CityState = {
  t: number;
  /** the west half tinted green, the east half grey (0..1) */
  west?: number; east?: number;
  /** the dividing line drawn top to bottom (0..1), and its red glow */
  line?: number; lineGlow?: number;
  /** villas and gardens on the west side, terraced rows on the east (0..1) */
  villas?: number; terraces?: number;
  /** chimneys rising (0..1), toppling (0..1) */
  chim?: number; topple?: number;
  /** smoke pouring east (0..1), the cloud over the east (0..1), the air clearing (0..1) */
  smoke?: number; cloud?: number; clear?: number;
  /** wind arrows across the city (0..1) */
  wind?: number;
  /** WEST and EAST written over the halves (0..1) */
  labels?: number;
  /** show only one half's label */
  only?: "west" | "east";
  /** the town hall's pennant, weathervane spin (frames), vane pointing west (0..1) */
  pennant?: number; vane?: number;
  /** soot falling over the east (0..1), modern traffic (0..1) */
  soot?: number; traffic?: number;
  children?: React.ReactNode;
};

const ease = (x: number) => Math.max(0, Math.min(1, x));

const Villa: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => {
  if (k <= 0) return null;
  const s = Math.min(1, k * 1.3);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={-26} cy={20} r={22} fill="#4e8f45" stroke={INK} strokeWidth={4} />
      <circle cx={30} cy={24} r={18} fill="#5ea052" stroke={INK} strokeWidth={4} />
      <rect x={-22} y={-26} width={44} height={36} fill="#f1e2c2" stroke={INK} strokeWidth={4} />
      <path d="M -28 -24 L 0 -46 L 28 -24 Z" fill="#b5523f" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <rect x={-6} y={-6} width={12} height={16} fill="#6b4a2f" />
    </g>
  );
};

const Terrace: React.FC<{ x: number; y: number; k: number; dirty: number }> = ({ x, y, k, dirty }) => {
  if (k <= 0) return null;
  const n = Math.max(1, Math.round(6 * Math.min(1, k * 1.2)));
  const wall = shade("#a86a4a", -0.35 * dirty);
  return (
    <g>
      {[0, 1].map((row) => (
        <g key={row}>
          {Array.from({ length: n }, (_, i) => (
            <g key={i}>
              <rect x={x - 45 + i * 15} y={y - 22 + row * 30} width={15} height={20} fill={wall} stroke={INK} strokeWidth={2.5} />
              <path d={`M ${x - 45 + i * 15} ${y - 22 + row * 30} l 7.5 -7 l 7.5 7`} fill={shade("#5b4a52", -0.2 * dirty)} stroke={INK} strokeWidth={2} />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
};

/** A factory: a brick shed and a tall chimney rising `k`, toppling over by `topple`. */
export const Chimney: React.FC<{ x: number; y: number; k: number; topple?: number; s?: number }> = ({ x, y, k, topple = 0, s = 1 }) => {
  if (k <= 0) return null;
  const h = 130 * Math.min(1, k) * s;
  return (
    <g opacity={1 - 0.75 * ease(topple * 1.4 - 0.4)}>
      <Block x={x - 44 * s} y={y - 30 * s} w={70 * s} h={34 * s} fill="#9c5a3c" r={3} sw={4} />
      <path d={`M ${x - 44 * s} ${y - 30 * s} l 18 ${-14 * s} l 0 ${14 * s} l 18 ${-14 * s} l 0 ${14 * s} l 18 ${-14 * s} l 0 ${14 * s}`} fill="#7d4630" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <g transform={`rotate(${84 * ease(topple)} ${x + 14 * s} ${y})`}>
        <rect x={x + 4 * s} y={y - h} width={22 * s} height={h} fill="#b8673f" stroke={INK} strokeWidth={4} />
        <rect x={x + 1 * s} y={y - h - 6} width={28 * s} height={10} fill="#7d4630" stroke={INK} strokeWidth={3} />
      </g>
    </g>
  );
};

/** A plume of smoke leaving a chimney top and leaning east with the wind. */
const Plume: React.FC<{ x: number; y: number; k: number; t: number; seed: number }> = ({ x, y, k, t, seed }) => {
  if (k <= 0) return null;
  return (
    <g>
      {Array.from({ length: 7 }, (_, i) => {
        const f = ((t * 0.012 + i / 7 + seed * 0.13) % 1);
        const reach = 420 * k;
        const px = x + f * reach, py = y - 20 - f * 60 + Math.sin(t / 14 + i) * 6;
        const r = 16 + f * 46;
        return <circle key={i} cx={px} cy={py} r={r} fill={SOOT} opacity={0.6 * (1 - f * 0.7) * Math.min(1, k * 2)} />;
      })}
    </g>
  );
};

/** A wind arrow: a wavy line with a head, gliding east. */
export const WindArrow: React.FC<{ x: number; y: number; len?: number; k?: number; color?: string; w?: number }> = ({ x, y, len = 260, k = 1, color = "#ffffff", w = 14 }) => {
  if (k <= 0) return null;
  const d = `M ${x} ${y} c ${len * 0.25} -26, ${len * 0.5} 26, ${len * 0.75} 0 s ${len * 0.2} -12, ${len * 0.25} -4`;
  return (
    <g opacity={Math.min(1, k)}>
      <path d={d} fill="none" stroke={INK} strokeWidth={w + 8} strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={`M ${x + len + 6} ${y - 4} l -38 -26 l 6 26 l -6 26 Z`} fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};

/** The town hall with a St George's cross pennant and a weathervane on its tower. */
const Hall: React.FC<{ pennant: number; vane: number; vaneWest: number; t: number }> = ({ pennant, vane, vaneWest, t }) => {
  const [x, y] = HALL;
  const ang = vaneWest >= 1 ? 180 : (vane * 9) % 360 * (1 - vaneWest) + 180 * vaneWest;
  return (
    <g>
      <Block x={x - 70} y={y - 40} w={140} h={70} fill="#d8c7a0" r={4} />
      <rect x={x - 22} y={y - 120} width={44} height={84} fill="#cdb98e" stroke={INK} strokeWidth={5} />
      <path d={`M ${x - 30} ${y - 118} L ${x} ${y - 160} L ${x + 30} ${y - 118} Z`} fill="#7d6b8c" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <Limb a={[x, y - 160]} b={[x, y - 205]} w={6} color={INK} sw={0} />
      <g transform={`translate(${x} ${y - 205}) scale(${Math.cos((ang * Math.PI) / 180)} 1)`}>
        <path d="M -46 0 L 34 0 M 34 0 l -14 -10 M 34 0 l -14 10 M -46 0 l -10 -14 l 22 14 l -22 14 Z" stroke={INK} strokeWidth={6} fill={GOLD} strokeLinecap="round" />
      </g>
      {pennant > 0 ? (
        <g transform={`translate(${x + 22} ${y - 110}) scale(${Math.min(1, pennant)})`}>
          <Limb a={[0, 0]} b={[0, -70]} w={5} color={INK} sw={0} />
          <g transform={`skewY(${Math.sin(t / 6) * 6})`}>
            <rect x={0} y={-70} width={66} height={44} fill="#ffffff" stroke={INK} strokeWidth={4} />
            <rect x={27} y={-70} width={12} height={44} fill={RED} />
            <rect x={0} y={-54} width={66} height={12} fill={RED} />
          </g>
        </g>
      ) : null}
    </g>
  );
};

/** The old English city on a vintage street plan; everything that changes in the story is a prop. */
export const CityPlan: React.FC<CityState> = ({ t, west = 0, east = 0, line = 0, lineGlow = 0, villas = 0, terraces = 0, chim = 0, topple = 0, smoke = 0, cloud = 0, clear = 0, wind = 0, labels = 0, pennant = 0, vane = 0, soot = 0, traffic = 0, only, children }) => {
  const r = rng("v1122city");
  const cells: { x: number; y: number; west: boolean; d: number }[] = [];
  for (let gy = 0; gy < 9; gy++) for (let gx = 0; gx < 9; gx++) {
    const x = 95 + gx * 112 + (gy % 2) * 18, y = 470 + gy * 106;
    const ry = 985 + Math.sin((x / 1080) * Math.PI * 2) * 30;
    if (Math.abs(y - ry) < 70) continue;
    if (Math.abs(x - HALL[0]) < 110 && Math.abs(y - HALL[1]) < 90) continue;
    cells.push({ x, y, west: x < CITY.mid, d: r() });
  }
  const air = 1 - ease(clear);
  return (
    <g>
      <defs>
        <pattern id="v1122grain" patternUnits="userSpaceOnUse" width={60} height={60}>
          <rect width={60} height={60} fill={PAPER} />
          <circle cx={12} cy={18} r={2} fill="#c9b07a" opacity={0.5} /><circle cx={44} cy={40} r={1.6} fill="#c9b07a" opacity={0.5} />
        </pattern>
      </defs>
      {/* the sheet */}
      <rect x={CITY.x0 + 12} y={CITY.y0 + 16} width={CITY.x1 - CITY.x0} height={CITY.y1 - CITY.y0} fill="#000" opacity={0.25} />
      <rect x={CITY.x0} y={CITY.y0} width={CITY.x1 - CITY.x0} height={CITY.y1 - CITY.y0} fill="url(#v1122grain)" stroke="#4a3218" strokeWidth={8} />
      {/* streets: a grid of lanes */}
      {Array.from({ length: 10 }, (_, i) => <line key={`v${i}`} x1={40 + i * 112} y1={CITY.y0} x2={40 + i * 112 + 30} y2={CITY.y1} stroke="#cdb383" strokeWidth={10} />)}
      {Array.from({ length: 10 }, (_, i) => <line key={`h${i}`} x1={CITY.x0} y1={420 + i * 106} x2={CITY.x1} y2={420 + i * 106 + 14} stroke="#cdb383" strokeWidth={10} />)}
      {/* the halves */}
      <rect x={CITY.x0} y={CITY.y0} width={CITY.mid - CITY.x0} height={CITY.y1 - CITY.y0} fill={GREEN} opacity={0.42 * ease(west)} />
      <rect x={CITY.mid} y={CITY.y0} width={CITY.x1 - CITY.mid} height={CITY.y1 - CITY.y0} fill={GREY} opacity={0.5 * ease(east)} />
      {/* the river */}
      <path d={RIVER} fill="none" stroke={INK} strokeWidth={66} />
      <path d={RIVER} fill="none" stroke={SEA_BLUE} strokeWidth={54} />
      <path d={RIVER} fill="none" stroke="#86c1cc" strokeWidth={4} strokeDasharray="30 50" strokeDashoffset={-t * 2} />
      {/* blocks: plain lots, then villas (west) and terraces (east) */}
      {cells.map((c, i) => {
        const vk = ease(villas * 1.6 - c.d * 0.6), tk = ease(terraces * 1.6 - c.d * 0.6);
        const built = c.west ? vk : tk;
        return (
          <g key={i}>
            {built < 1 ? <rect x={c.x - 34} y={c.y - 24} width={68} height={48} rx={4} fill="#d6bd8a" stroke="#a88a58" strokeWidth={3} opacity={1 - built} /> : null}
            {c.west ? <Villa x={c.x} y={c.y} k={vk} /> : <Terrace x={c.x} y={c.y} k={tk} dirty={ease(soot) * air + 0.2} />}
          </g>
        );
      })}
      <Hall pennant={pennant} vane={vane} vaneWest={0} t={t} />
      {/* factories and their smoke */}
      {CHIMNEYS.map(([x, y], i) => <Chimney key={i} x={x} y={y} k={ease(chim * 1.5 - i * 0.07)} topple={ease(topple * 1.6 - i * 0.1)} />)}
      {CHIMNEYS.map(([x, y], i) => <Plume key={`p${i}`} x={x + 15} y={y - 136} k={ease(smoke) * air * (1 - ease(topple * 2))} t={t} seed={i} />)}
      {/* the cloud over the east */}
      <g opacity={0.62 * ease(cloud) * air}>
        {[[640, 560, 170], [820, 620, 200], [700, 820, 190], [900, 900, 160], [650, 1120, 200], [860, 1220, 190], [960, 1300, 120], [600, 1320, 140]].map(([x, y, rr], i) => (
          <ellipse key={i} cx={x! + Math.sin(t / 30 + i) * 14 - (1 - ease(cloud)) * 200} cy={y} rx={rr} ry={rr! * 0.6} fill={SOOT} />
        ))}
      </g>
      {/* soot flakes */}
      {soot > 0 ? Array.from({ length: 26 }, (_, i) => {
        const x = 580 + ((i * 97) % 440), y = CITY.y0 + ((t * 3 + i * 131) % (CITY.y1 - CITY.y0));
        return <circle key={`s${i}`} cx={x + Math.sin(t / 9 + i) * 8} cy={y} r={5} fill={SOOT} opacity={0.8 * ease(soot) * air} />;
      }) : null}
      {/* modern traffic */}
      {traffic > 0 ? [0, 1, 2, 3, 4].map((i) => {
        const y = 420 + (i * 2 + 1) * 106 + 8;
        const x = CITY.x0 + ((t * 5 + i * 230) % (CITY.x1 - CITY.x0));
        return <rect key={`c${i}`} x={x} y={y - 10} width={40} height={20} rx={6} fill={["#e8453c", "#3a78c9", "#f2b134", "#ffffff", "#3fae6a"][i]} stroke={INK} strokeWidth={3} opacity={ease(traffic)} />;
      }) : null}
      {/* the wind across the city */}
      {wind > 0 ? [520, 760, 1110, 1300].map((y, i) => {
        const x = -260 + ((t * 7 + i * 340) % 1500);
        return <WindArrow key={`w${i}`} x={x} y={y} len={230} k={ease(wind)} />;
      }) : null}
      {/* the dividing line */}
      {line > 0 ? (
        <g>
          {lineGlow > 0 ? <Glow x={CITY.mid} y={(CITY.y0 + CITY.y1) / 2} r={160} ry={520} color={RED} o={0.45 * lineGlow} /> : null}
          <line x1={CITY.mid} y1={CITY.y0} x2={CITY.mid} y2={CITY.y0 + (CITY.y1 - CITY.y0) * ease(line)} stroke={INK} strokeWidth={18} strokeLinecap="round" />
          <line x1={CITY.mid} y1={CITY.y0} x2={CITY.mid} y2={CITY.y0 + (CITY.y1 - CITY.y0) * ease(line)} stroke={lineGlow > 0.5 ? RED : "#ffffff"} strokeWidth={10} strokeDasharray="34 20" strokeLinecap="round" />
        </g>
      ) : null}
      {labels > 0 ? (
        <g opacity={ease(labels * 2)}>
          {only !== "east" ? <Txt x={290} y={470} size={64} fill="#ffffff" stroke={INK}>WEST</Txt> : null}
          {only !== "west" ? <Txt x={790} y={470} size={64} fill="#ffffff" stroke={INK}>EAST</Txt> : null}
        </g>
      ) : null}
      {children}
    </g>
  );
};

/** The title cartouche over the plan. */
export const Cartouche: React.FC<{ text: string; k: number; y?: number }> = ({ text, k, y = 300 }) => {
  if (k <= 0) return null;
  const n = Math.round(text.length * ease(k));
  return (
    <g>
      <rect x={140} y={y - 56} width={800} height={112} rx={20} fill="#f4e3bd" stroke="#4a3218" strokeWidth={7} />
      <Txt x={540} y={y + 2} size={56} fill="#4a3218">{text.slice(0, n)}<tspan opacity={0}>{text.slice(n)}</tspan></Txt>
    </g>
  );
};

/** A big gold question mark bouncing in. */
export const QMark: React.FC<{ x: number; y: number; k: number; t: number; size?: number }> = ({ x, y, k, t, size = 220 }) =>
  k <= 0 ? null : <Txt x={x} y={y - (1 - Math.min(1, k)) * 300 - Math.abs(Math.sin(t / 6)) * 14} size={size} fill={GOLD} stroke={INK}>?</Txt>;

/** A small person standing on the map. */
export const Walker: React.FC<{ x: number; y: number; s?: number; top: string; hat?: boolean; face?: "neutral" | "happy" | "worried" | "sad" | "smirk"; armR?: [number, number]; armL?: [number, number]; t: number; hold?: (h: [number, number]) => React.ReactNode }> = ({ x, y, s = 62, top, hat, face = "neutral", armR, armL, t, hold }) => (
  <Char x={x} y={y + Math.sin(t / 9 + x) * 2} s={s} top={top} outfit={hat ? "suit" : "shirt"} hair={hat ? "cap" : "side"} hat={hat ? "#1d1a2b" : undefined} face={face} armR={armR} armL={armL} holdR={hold} />
);

// ------------------------------------------------------------------ England on the old map

export const CITIES: { name: string; at: [number, number]; label?: [number, number] }[] = [
  { name: "LONDON", at: [-0.12, 51.5], label: [0.9, 51.15] },
  { name: "BIRMINGHAM", at: [-1.9, 52.48], label: [-1.9, 52.12] },
  { name: "MANCHESTER", at: [-2.24, 53.48], label: [-2.5, 53.13] },
  { name: "LEEDS", at: [-1.55, 53.8], label: [-1.2, 54.12] },
  { name: "SHEFFIELD", at: [-1.47, 53.38], label: [99, 0] },
  { name: "LIVERPOOL", at: [-2.98, 53.41], label: [99, 0] },
  { name: "NEWCASTLE", at: [-1.61, 54.97], label: [-3.3, 55.35] },
  { name: "BRISTOL", at: [-2.59, 51.45], label: [-2.75, 51.78] },
];

export const NEAR = ["United Kingdom", "Ireland", "France", "Belgium", "Netherlands", "Germany", "Denmark", "Norway", "Luxembourg"];

export const SEA = "url(#v1122sea)";
export const SeaPattern: React.FC = () => (
  <defs>
    <pattern id="v1122sea" patternUnits="userSpaceOnUse" width={90} height={66}>
      <rect width={90} height={66} fill={SEA_BLUE} />
      <path d="M 6 20 q 10 -9 20 0 q 10 9 20 0" fill="none" stroke="#7fb8c6" strokeWidth={6} strokeLinecap="round" />
      <path d="M 50 54 q 10 -9 20 0 q 10 9 20 0" fill="none" stroke="#7fb8c6" strokeWidth={6} strokeLinecap="round" />
    </pattern>
  </defs>
);

/** Britain on the channel's old map (Mercator, 50m detail for the near countries). */
export const Britain: React.FC<{ center: [number, number]; scale: number; uk?: number; trace?: number; children?: React.ReactNode }> = ({ center, scale, uk = 0, trace, children }) => (
  <WorldMap w={1080} h={1920} center={center} scale={scale} kind="flat" look="vintage" political={0.5} sea={SEA} detail="50m" only={NEAR}
    colors={{ "United Kingdom": { fill: "#d9b46a", k: uk, trace } }}>
    <SeaPattern />
    {children}
  </WorldMap>
);

/** A city pin split in two: its west half green, its east half grey, as `split` goes 0 -> 1. */
export const SplitPin: React.FC<{ at: [number, number]; k: number; split: number; r?: number; glow?: number }> = ({ at, k, split, r = 34, glow = 0 }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  const [x, y] = [xy[0], xy[1] - (1 - Math.min(1, k)) * 140];
  const gap = 6 * ease(split);
  return (
    <g>
      {glow > 0 ? <Glow x={x} y={y} r={r * 2.4} color="#fff2b0" o={0.5 * glow} /> : null}
      <path d={`M ${x - gap} ${y - r} A ${r} ${r} 0 0 0 ${x - gap} ${y + r} Z`} fill={split > 0 ? GREEN : "#f4efe4"} stroke={INK} strokeWidth={STROKE * 0.8} />
      <path d={`M ${x + gap} ${y - r} A ${r} ${r} 0 0 1 ${x + gap} ${y + r} Z`} fill={split > 0 ? GREY : "#f4efe4"} stroke={INK} strokeWidth={STROKE * 0.8} />
    </g>
  );
};

/** A chimney standing at a place on the map, smoke leaning east. */
export const MapChimney: React.FC<{ at: [number, number]; k: number; t: number; s?: number; smoke?: number }> = ({ at, k, t, s = 0.55, smoke = 1 }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  const top = xy[1] - 130 * s * Math.min(1, k);
  return (
    <g>
      <Chimney x={xy[0] - 10} y={xy[1]} k={k} s={s} />
      {smoke > 0 ? [0, 1, 2, 3].map((i) => {
        const f = (t * 0.015 + i / 4) % 1;
        return <circle key={i} cx={xy[0] + 4 + f * 120} cy={top - 10 - f * 30} r={8 + f * 24} fill={SOOT} opacity={0.55 * (1 - f) * ease(smoke) * Math.min(1, k)} />;
      }) : null}
    </g>
  );
};

export const CityLabels: React.FC<{ k: number[]; size?: number }> = ({ k, size = 44 }) => (
  <g>
    {CITIES.filter((c) => !c.label || c.label[0] < 90).map((c) => [c, CITIES.indexOf(c)] as const).map(([c, i]) => <MapLabel key={c.name} at={c.label ?? [c.at[0] + 0.0, c.at[1] + 0.32]} text={c.name} size={size} k={k[i] ?? 0} />)}
  </g>
);

/** A wooden board on a post planted on the map: a label and a big figure. */
export const Board: React.FC<{ x: number; y: number; label: string; value: string; k: number; w?: number; color?: string }> = ({ x, y, label, value, k, w = 600, color = RED }) => {
  if (k <= 0) return null;
  const s = Math.min(1, k);
  return (
    <g transform={`translate(${x} ${y + (1 - s) * -200})`}>
      <Limb a={[0, 60]} b={[0, 200]} w={16} color="#7a5230" />
      <rect x={-w / 2 + 10} y={-120 + 12} width={w} height={190} rx={18} fill="#000" opacity={0.25} />
      <rect x={-w / 2} y={-120} width={w} height={190} rx={18} fill="#f4e3bd" stroke={INK} strokeWidth={7} />
      <Txt x={0} y={-78} size={46} fill="#4a3218">{label}</Txt>
      <Txt x={0} y={4} size={96} fill={color} stroke={INK}>{value}</Txt>
    </g>
  );
};

const props = { CITY, HALL };
export default props;
