// Shared pieces for "Why did Britain hide a power station inside a mountain?" (device: zoom from space).
// Two scales of one map: Britain (from the globe down to its cities at night) and the valley in Snowdonia
// at walking scale, where Elidir Fawr stands between its two lakes. The valley's lakes, tunnel, cavern and
// machines are drawn on their real spots with useAt, so they move and scale with the map's camera.
import React from "react";
import { Ball, Block, Glow, INK, Limb, STROKE, Txt, rng, shade } from "../../flat/kit";
import { WorldMap, useAt, type Fill } from "../../flat/map";

export const MARCHLYN: [number, number] = [-4.069, 53.146];
export const PERIS: [number, number] = [-4.112, 53.117];
export const ELIDIR: [number, number] = [-4.074, 53.131];
export const HALL: [number, number] = [-4.098, 53.124];   // the cavern, under the mountain's west side
export const WALES: [number, number] = [-3.7, 52.4];
export const SNOWDONIA: [number, number] = [-3.95, 52.95];
export const CITIES: { name: string; at: [number, number] }[] = [
  { name: "LONDON", at: [-0.12, 51.5] }, { name: "BIRMINGHAM", at: [-1.9, 52.48] }, { name: "MANCHESTER", at: [-2.24, 53.48] },
  { name: "GLASGOW", at: [-4.25, 55.86] }, { name: "CARDIFF", at: [-3.18, 51.48] }, { name: "LEEDS", at: [-1.55, 53.8] },
  { name: "NEWCASTLE", at: [-1.6, 54.97] }, { name: "BRISTOL", at: [-2.6, 51.45] }, { name: "EDINBURGH", at: [-3.19, 55.95] },
];
export const LONDON = CITIES[0]!.at;

export const GOLD = "#f2b134", RED = "#d9483b", WATER = "#3b8fd0", NIGHT_SEA = "#0e1b36", NIGHT_LAND = "#2d3a5a", ZAP = "#ffe14a";

const NEAR_UK = ["United Kingdom", "Ireland", "France", "Belgium", "Netherlands", "Norway", "Denmark", "Germany"];

/** Britain and its neighbours: day (the old map) or night (dark land, a deep sea). */
export const Britain: React.FC<{ center: [number, number]; scale: number; night?: number; colors?: Record<string, Fill>; children?: React.ReactNode }> = ({ center, scale, night = 0, colors = {}, children }) => (
  <WorldMap w={1080} h={1920} center={center} scale={scale} kind="flat" look={night > 0.5 ? "flat" : "vintage"} political={night > 0.5 ? 0 : 0.6}
    land={night > 0.5 ? NIGHT_LAND : undefined} sea={night > 0.5 ? NIGHT_SEA : undefined} border={night > 0.5 ? "#7d8db8" : undefined}
    detail="50m" only={NEAR_UK} colors={colors}>
    {children}
  </WorldMap>
);

/** The valley at walking scale: only Britain's land is drawn (the whole frame is Wales). */
export const Valley: React.FC<{ center: [number, number]; scale: number; night?: boolean; children?: React.ReactNode }> = ({ center, scale, night = false, children }) => (
  <WorldMap w={1080} h={1920} center={center} scale={scale} kind="flat" look={night ? "flat" : "vintage"} land={night ? "#33405f" : "#9cbf78"}
    sea={night ? NIGHT_SEA : undefined} detail="50m" only={["United Kingdom"]}>
    <Terrain night={night} />
    {children}
  </WorldMap>
);

/** Pixels per metre-ish on the valley map: everything drawn there scales with the map. */
export const useUnit = (): number => {
  const at = useAt();
  const a = at([-4.1, 53.13]), b = at([-4.09, 53.13]);
  return a && b ? Math.abs(b[0] - a[0]) / 140 : 1;   // ~140 units per 0.01 degree of longitude
};

const wobble = (cx: number, cy: number, rx: number, ry: number, seed: number, rot = 0): string => {
  const n = 28, pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 1 + 0.09 * Math.sin(a * 3 + seed) + 0.05 * Math.sin(a * 5 + seed * 2);
    const x = Math.cos(a) * rx * r, y = Math.sin(a) * ry * r;
    const c = Math.cos(rot), s = Math.sin(rot);
    pts.push(`${(cx + x * c - y * s).toFixed(1)},${(cy + x * s + y * c).toFixed(1)}`);
  }
  return `M${pts.join(" L")} Z`;
};

const R = rng("dinorwig-trees");
const TREES: [number, number, number][] = Array.from({ length: 170 }, () => [-4.17 + R() * 0.16, 53.095 + R() * 0.08, 0.7 + R() * 0.6] as [number, number, number])
  .filter(([lo, la]) => Math.hypot((lo - ELIDIR[0]) * 0.6, la - ELIDIR[1]) > 0.012 && Math.hypot((lo - MARCHLYN[0]) * 0.6, la - MARCHLYN[1]) > 0.008 && Math.hypot((lo - PERIS[0]) * 0.6, la - PERIS[1]) > 0.006);
const HOUSES: [number, number][] = [[-4.128, 53.113], [-4.124, 53.11], [-4.131, 53.108], [-4.12, 53.116], [-4.134, 53.114], [-4.118, 53.107], [-4.127, 53.104]];

/** The valley's life on the map: woods, the slate quarry's terraces above the low lake, the village and its road. */
export const Terrain: React.FC<{ night?: boolean }> = ({ night = false }) => {
  const at = useAt();
  const u = useUnit();
  const q = at([-4.104, 53.122]);
  const road = [[-4.15, 53.1], [-4.13, 53.108], [-4.118, 53.112], [-4.1, 53.111], [-4.08, 53.105]].map((p) => at(p as [number, number])).filter((p): p is [number, number] => !!p);
  return (
    <g>
      {road.length > 1 ? <path d={`M${road.map((p) => p.join(",")).join(" L")}`} fill="none" stroke={night ? "#55607e" : "#d9c79a"} strokeWidth={22 * u} strokeLinecap="round" strokeLinejoin="round" /> : null}
      {q ? [0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M${q[0] - (150 - i * 18) * u},${q[1] + (i * 34 - 60) * u} q${140 * u},${-50 * u} ${300 * u - i * 36 * u},0`} fill="none" stroke={night ? "#4a5470" : "#7d8494"} strokeWidth={22 * u} strokeLinecap="round" />
      )) : null}
      {TREES.map(([lo, la, s], i) => {
        const xy = at([lo, la]);
        if (!xy || xy[0] < -60 || xy[0] > 1140 || xy[1] < -60 || xy[1] > 1980) return null;
        return <Ball key={i} x={xy[0]} y={xy[1]} r={18 * s * u} fill={night ? "#2c3b54" : i % 3 ? "#4f8a4a" : "#3d7a45"} sw={Math.max(2, 3 * u)} />;
      })}
      {HOUSES.map((h, i) => {
        const xy = at(h);
        if (!xy) return null;
        return <g key={`h${i}`}><Block x={xy[0] - 16 * u} y={xy[1] - 12 * u} w={32 * u} h={24 * u} fill={night ? "#ffe9a8" : "#f4efe4"} sw={Math.max(2, 3 * u)} shadow={false} />
          <path d={`M${xy[0] - 20 * u},${xy[1] - 12 * u} L${xy[0]},${xy[1] - 28 * u} L${xy[0] + 20 * u},${xy[1] - 12 * u} Z`} fill="#8a4a3a" stroke={INK} strokeWidth={Math.max(2, 3 * u)} /></g>;
      })}
    </g>
  );
};

/** The mountain from above: contour rings round the summit, rock and grass. */
export const Mountain: React.FC<{ night?: boolean; glow?: number }> = ({ night = false, glow = 0 }) => {
  const xy = useAt()(ELIDIR);
  const u = useUnit();
  if (!xy) return null;
  const tones = night ? ["#3b4a6e", "#46557a", "#526288", "#5f6f95"] : ["#8fb26a", "#a7b97a", "#b9a77c", "#c9b99a"];
  return (
    <g>
      {[520, 390, 260, 130].map((r, i) => (
        <path key={r} d={wobble(xy[0], xy[1], r * u * 1.15, r * u, i * 1.7, -0.5)} fill={tones[i]} stroke={shade(tones[i]!, -0.35)} strokeWidth={Math.max(2, 3 * u)} />
      ))}
      <path d={`M${xy[0] - 30 * u},${xy[1] + 12 * u} L${xy[0]},${xy[1] - 34 * u} L${xy[0] + 34 * u},${xy[1] + 14 * u} Z`} fill={night ? "#8a96b8" : "#f4efe4"} stroke={INK} strokeWidth={Math.max(2, 4 * u)} strokeLinejoin="round" />
      {glow > 0 ? <Glow x={xy[0] - 60 * u} y={xy[1] + 40 * u} r={240 * u} color={ZAP} o={0.55 * glow} /> : null}
    </g>
  );
};

/** One lake on its spot; `level` 0 (mud) .. 1 (full). */
export const Lake: React.FC<{ at: [number, number]; rx: number; ry: number; level: number; seed: number; rot?: number; night?: boolean; t?: number }> = ({ at, rx, ry, level, seed, rot = 0, night = false, t = 0 }) => {
  const xy = useAt()(at);
  const u = useUnit();
  if (!xy) return null;
  const L = Math.max(0.12, Math.min(1, level));
  return (
    <g>
      <path d={wobble(xy[0], xy[1], rx * u, ry * u, seed, rot)} fill={night ? "#4b4436" : "#9b8462"} stroke={INK} strokeWidth={Math.max(2, 4 * u)} />
      <path d={wobble(xy[0], xy[1], rx * u * L, ry * u * L, seed, rot)} fill={night ? "#2a5c9a" : WATER} stroke={shade(WATER, -0.3)} strokeWidth={Math.max(2, 3 * u)} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${xy[0] - rx * u * 0.4 * L + i * 22 * u},${xy[1] - ry * u * 0.2 + i * 30 * u + Math.sin(t / 9 + i) * 6 * u} q${12 * u},${-8 * u} ${24 * u},0`} fill="none" stroke="#d8efff" strokeWidth={Math.max(2, 4 * u)} opacity={0.7 * L} />
      ))}
    </g>
  );
};

/** The tunnel from the high lake to the cavern and on to the low lake, drawn as `k` goes 0 -> 1; `flow` sends water along it. */
export const Tunnel: React.FC<{ k: number; flow?: number; up?: boolean; t?: number }> = ({ k, flow = 0, up = false, t = 0 }) => {
  const at = useAt();
  const u = useUnit();
  const a = at(MARCHLYN), m = at(HALL), b = at(PERIS);
  if (!a || !m || !b || k <= 0) return null;
  const d = `M${a[0]},${a[1]} Q${m[0] + 120 * u},${m[1] - 140 * u} ${m[0]},${m[1]} T${b[0]},${b[1]}`;
  const dash = 34 * u;
  const off = (up ? 1 : -1) * t * 6 * u;
  return (
    <g>
      <path d={d} fill="none" stroke={INK} strokeWidth={30 * u} strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`} opacity={0.85} />
      <path d={d} fill="none" stroke="#6b5a48" strokeWidth={20 * u} strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`} />
      {flow > 0 ? <path d={d} fill="none" stroke="#7fd0ff" strokeWidth={13 * u} strokeLinecap="round" strokeDasharray={`${dash} ${dash * 0.7}`} strokeDashoffset={off} opacity={Math.min(1, flow)} /> : null}
    </g>
  );
};

/** A turbine seen from above: a ring with blades, spinning by `spin` (degrees). */
export const Turbine: React.FC<{ x: number; y: number; r: number; spin: number; lit?: number }> = ({ x, y, r, spin, lit = 0 }) => (
  <g>
    {lit > 0 ? <Glow x={x} y={y} r={r * 2.2} color={ZAP} o={0.6 * lit} /> : null}
    <circle cx={x} cy={y} r={r} fill="#d7dce6" stroke={INK} strokeWidth={Math.max(3, r * 0.08)} />
    <g transform={`rotate(${spin} ${x} ${y})`}>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <path key={a} transform={`rotate(${a} ${x} ${y})`} d={`M${x},${y} q${r * 0.5},${-r * 0.2} ${r * 0.85},${-r * 0.05} l${-r * 0.2},${r * 0.22} Z`} fill="#3f6fb5" stroke={INK} strokeWidth={Math.max(2, r * 0.04)} />
      ))}
    </g>
    <circle cx={x} cy={y} r={r * 0.2} fill={GOLD} stroke={INK} strokeWidth={Math.max(2, r * 0.05)} />
  </g>
);

/** The cavern cut open in the mountain's side: a jagged opening in the rock, a lit hall with `n` machines,
 * each in its housing. `open` 0 -> 1 tears it open; `ghost` draws it as a dashed outline under the grass. */
export const Cavern: React.FC<{ open: number; n: number; spin: number; lit?: number; flicker?: number; ghost?: number }> = ({ open, n, spin, lit = 0, flicker = 0, ghost = 0 }) => {
  const xy = useAt()(HALL);
  const u = useUnit();
  if (!xy || open <= 0) return null;
  const k = Math.min(1, open);
  const rx = 210 * u, ry = 120 * u * k;
  if (ghost > 0.5) {
    return <path d={wobble(xy[0], xy[1], rx, 120 * u, 4.2)} fill="none" stroke="#f4efe4" strokeWidth={Math.max(3, 6 * u)} strokeDasharray={`${18 * u} ${12 * u}`} opacity={0.9} />;
  }
  return (
    <g>
      <path d={wobble(xy[0] + 6 * u, xy[1] + 10 * u, rx + 34 * u, ry + 30 * u, 4.2)} fill="#1d1a2b" opacity={0.35} />
      <path d={wobble(xy[0], xy[1], rx + 30 * u, ry + 28 * u, 4.2)} fill="#7a6650" stroke={INK} strokeWidth={Math.max(3, 6 * u)} />
      <path d={wobble(xy[0], xy[1], rx + 14 * u, ry + 12 * u, 1.3)} fill="#5b4b3a" />
      <path d={wobble(xy[0], xy[1], rx, ry, 2.6)} fill="#151a2c" stroke={INK} strokeWidth={Math.max(2, 4 * u)} />
      <Glow x={xy[0]} y={xy[1]} r={rx * 1.1} color="#ffd98a" o={(0.4 + 0.3 * lit) * (0.85 + 0.15 * flicker) * k} />
      {k > 0.6 ? Array.from({ length: n }, (_, i) => {
        const x = xy[0] - rx * 0.72 + (rx * 1.44 * i) / 5, y = xy[1] + 8 * u;
        return (
          <g key={i}>
            <rect x={x - 26 * u} y={y - 52 * u} width={52 * u} height={22 * u} rx={6 * u} fill="#c94f3d" stroke={INK} strokeWidth={Math.max(2, 3 * u)} />
            <Turbine x={x} y={y} r={28 * u} spin={spin + i * 17} lit={lit} />
          </g>
        );
      }) : null}
    </g>
  );
};

/** A sign on two posts stuck in the ground: a label and a big figure. */
export const Sign: React.FC<{ x: number; y: number; w: number; label: string; value: string; k?: number; bg?: string; fg?: string }> = ({ x, y, w, label, value, k = 1, bg = "#fff6dc", fg = INK }) => {
  if (k <= 0) return null;
  const h = w * 0.5, s = 0.6 + 0.4 * Math.min(1, k);
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`} opacity={Math.min(1, k * 2)}>
      {[-0.32, 0.32].map((f) => <Limb key={f} a={[x + f * w, y]} b={[x + f * w, y + h * 0.95]} w={14} color="#7a5230" sw={4} />)}
      <Block x={x - w / 2} y={y - h} w={w} h={h} fill={bg} r={14} sw={STROKE} />
      <Txt x={x} y={y - h * 0.72} size={Math.max(44, h * 0.2)} fill={shade(fg, 0.25)}>{label}</Txt>
      <Txt x={x} y={y - h * 0.32} size={h * 0.4} fill={fg}>{value}</Txt>
    </g>
  );
};

/** A kettle (side view), with steam rising by `steam` 0..1. */
export const Kettle: React.FC<{ x: number; y: number; s: number; steam?: number; t?: number; lit?: number }> = ({ x, y, s, steam = 0, t = 0, lit = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s / 100})`}>
    {lit > 0 ? <Glow x={0} y={-40} r={110} color={ZAP} o={0.5 * lit} /> : null}
    <path d="M -46 0 L -40 -62 Q 0 -86 40 -62 L 46 0 Z" fill="#e9eef5" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 40 -50 Q 70 -60 74 -30 L 60 -28 Q 58 -44 42 -38 Z" fill="#e9eef5" stroke={INK} strokeWidth={4} />
    <path d="M -40 -50 L -70 -78 L -60 -84 L -34 -60 Z" fill="#e9eef5" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-16} y={-84} width={32} height={10} rx={4} fill={INK} />
    <rect x={-50} y={-6} width={100} height={12} rx={4} fill={RED} stroke={INK} strokeWidth={4} />
    <circle cx={0} cy={-30} r={7} fill={lit > 0.3 ? "#ff6a3d" : "#6b6880"} stroke={INK} strokeWidth={3} />
    {steam > 0 ? [0, 1, 2].map((i) => (
      <path key={i} d={`M ${-66 + i * 8} ${-92 - i * 4} q ${-14 + Math.sin(t / 8 + i) * 6} -24 0 -48 q 14 -24 0 -48`} fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round"
        opacity={steam * (0.8 - i * 0.2)} transform={`translate(0 ${-((t * 2 + i * 20) % 40) * steam})`} />
    )) : null}
  </g>
);

/** A small sheep (from above it reads as a white puff with a dark head). */
export const Sheep: React.FC<{ x: number; y: number; s: number; t: number; phase?: number }> = ({ x, y, s, t, phase = 0 }) => (
  <g transform={`translate(${x + Math.sin(t / 30 + phase) * s * 0.15} ${y})`}>
    <Ball x={0} y={0} r={s * 0.45} fill="#f7f4ee" sw={3} />
    <Ball x={s * 0.45} y={-s * 0.08 + Math.sin(t / 7 + phase) * s * 0.05} r={s * 0.2} fill="#3a3346" shadow={false} sw={3} />
  </g>
);

/** A question mark that bounces in on `k`. */
export const QMark: React.FC<{ x: number; y: number; k: number; t: number; size?: number }> = ({ x, y, k, t, size = 200 }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y + Math.sin(t / 8) * 10}) scale(${Math.min(1.15, k)})`}>
      <Txt x={0} y={0} size={size} fill={GOLD} stroke={INK}>?</Txt>
    </g>
  );

/** A comment bubble with a word in it. */
export const Bubble: React.FC<{ x: number; y: number; k: number; text: string }> = ({ x, y, k, text }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${Math.min(1.1, k)})`}>
      <path d="M -200 -70 Q -200 -110 -160 -110 L 160 -110 Q 200 -110 200 -70 L 200 30 Q 200 70 160 70 L -60 70 L -110 120 L -100 70 L -160 70 Q -200 70 -200 30 Z" fill="#ffffff" stroke={INK} strokeWidth={6} />
      <Txt x={0} y={-20} size={64} fill={INK}>{text}</Txt>
    </g>
  );

/** Stars for the space shots. */
export const Stars: React.FC<{ t: number; o?: number }> = ({ t, o = 1 }) => (
  <g opacity={o}>
    {Array.from({ length: 90 }, (_, i) => {
      const x = (i * 397) % 1080, y = (i * 653) % 1920, r = 2 + (i % 3);
      return <circle key={i} cx={x} cy={y} r={r} fill="#ffffff" opacity={0.4 + 0.4 * Math.abs(Math.sin(t / 14 + i))} />;
    })}
  </g>
);

/** City lights: a glowing dot per city, `on` 0..1 (all of them), or each city switched by `each(i)`. */
export const CityLights: React.FC<{ each: (i: number) => number; names?: boolean; size?: number }> = ({ each, names = false, size = 44 }) => {
  const at = useAt();
  return (
    <g>
      {CITIES.map((c, i) => {
        const xy = at(c.at);
        const k = each(i);
        if (!xy) return null;
        return (
          <g key={c.name}>
            {k > 0 ? <Glow x={xy[0]} y={xy[1]} r={70 + 40 * k} color={ZAP} o={0.75 * k} /> : null}
            <circle cx={xy[0]} cy={xy[1]} r={12} fill={k > 0.3 ? "#fff3a6" : "#5d6888"} stroke={INK} strokeWidth={3} />
            {names && i < 3 ? <Txt x={xy[0]} y={xy[1] - 46} size={size} fill="#ffffff" stroke={INK} deco>{c.name}</Txt> : null}
          </g>
        );
      })}
    </g>
  );
};

const props = { MARCHLYN, PERIS, ELIDIR, HALL };
export default props;
