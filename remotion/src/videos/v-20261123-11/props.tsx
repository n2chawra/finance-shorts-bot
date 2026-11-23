// Shared pieces for "Russia once ended at the Urals. Then what?" (device: route and race). The channel's vintage
// map of northern Asia at a few scales; Russia's red spreads east river by river as the Cossack boats race to
// the Pacific. Crimea is drawn apart from Russia's colour (the internationally recognised border).
import React from "react";
import { Ball, Block, INK, Limb, STROKE, Txt, shade } from "../../flat/kit";
import { WorldMap, country, useAt, useMap, type Fill } from "../../flat/map";

export type LL = [number, number];

export const RED = "#d23b30", GOLD = "#f2b134", RIVER = "#3f86c9", SNOW = "#f4f8fb", PINE = "#2f6b45", WOOD = "#8a5a32";
const UKR = "#cdbb83", RUS_LAND = "#d8c28c";

export const MOSCOW: LL = [37.62, 55.75];
export const PERM: LL = [56.25, 58.0];
export const SIBIR: LL = [68.4, 58.15];
export const TOBOLSK: LL = [68.25, 58.2];
export const OKHOTSK: LL = [143.2, 59.4];
export const URALS: LL[] = [[65.8, 68.6], [63.2, 66.2], [60.6, 64.4], [59.3, 62.0], [59.0, 60.0], [59.2, 58.2], [58.9, 56.4], [58.4, 54.6], [58.6, 52.6]];
export const OB: LL[] = [[84, 52.5], [83.8, 53.4], [82.9, 55.0], [84.5, 57.5], [82.5, 59.5], [77.5, 60.8], [73.4, 61.2], [69.0, 61.0], [66.5, 63.5], [66.6, 66.5], [69.5, 67.2], [72.5, 68.5], [73.5, 71]];
export const IRTYSH: LL[] = [[73.4, 55.0], [71, 57.4], [68.4, 58.2], [69.0, 61.0]];
export const TURA: LL[] = [[60.4, 58.9], [63, 58.1], [65.5, 57.15], [66.6, 57.8], [68.3, 58.2]];
export const YENISEI: LL[] = [[92, 53.7], [92.9, 56.0], [92.1, 58.45], [90.5, 61.5], [88, 63.5], [87.9, 65.8], [86.6, 68.5], [86.2, 69.4], [82.5, 71.5]];
export const LENA: LL[] = [[106.5, 54.5], [105.7, 56.8], [108.1, 57.8], [114, 59.5], [120.4, 60.4], [125, 61.3], [129.7, 62.0], [128, 64.5], [123.4, 66.8], [125.5, 70.5], [126.5, 72.5]];
export const RACE: LL[] = [[57.5, 58.4], [60.4, 58.9], [65.5, 57.15], [68.3, 58.2], [75, 60.9], [82.5, 59.5], [92.1, 58.45], [102.7, 58.0], [105.7, 56.8], [114, 59.5], [129.7, 62.0], [136, 60.5], [143.2, 59.4]];
export const FORTS: LL[] = [[68.25, 58.2], [82.5, 59.5], [92.1, 58.45], [129.7, 62.0], [143.2, 59.4]];

const NEAR = ["Russia", "Kazakhstan", "Mongolia", "China", "Finland", "Estonia", "Latvia", "Lithuania", "Belarus", "Ukraine", "Norway", "Sweden", "Japan", "North Korea", "South Korea", "Poland", "Georgia", "Azerbaijan", "Kyrgyzstan", "Uzbekistan", "Turkmenistan", "Moldova", "Romania", "Armenia", "Iran"];

/** Northern Asia on the old map; `center` and `scale` are the camera. */
export const Asia: React.FC<{ center: LL; scale: number; colors?: Record<string, Fill>; children?: React.ReactNode }> = ({ center, scale, colors = {}, children }) => (
  <WorldMap w={1080} h={1920} center={center} scale={scale} kind="flat" look="vintage" political={0.45} detail="50m" only={NEAR}
    colors={{ Russia: { fill: RUS_LAND }, Ukraine: { fill: UKR }, ...colors }}>
    <Crimea />
    {children}
  </WorldMap>
);

/** Crimea, cut out of the Russia outline and painted in Ukraine's colour. */
const CRIMEA_BOX: [LL, LL] = [[32.3, 46.15], [36.62, 44.25]];
const Crimea: React.FC = () => {
  const { proj, path } = useMap();
  const c = country("Russia");
  const a = proj(CRIMEA_BOX[0]), b = proj(CRIMEA_BOX[1]);
  if (!c || !a || !b) return null;
  return (
    <g>
      <defs><clipPath id="v1123crim"><rect x={a[0]} y={a[1]} width={b[0] - a[0]} height={b[1] - a[1]} /></clipPath></defs>
      <path d={path(c) ?? undefined} fill={UKR} clipPath="url(#v1123crim)" stroke="#4a3218" strokeWidth={3} />
    </g>
  );
};

/** Russia's red, reaching east as far as longitude `east` (a bright front line on its edge); Crimea left out. */
export const RedLand: React.FC<{ east: number; o?: number; front?: number; id: string; outline?: number }> = ({ east, o = 0.82, front = 1, id, outline = 0 }) => {
  const { proj, path } = useMap();
  const c = country("Russia");
  const e = proj([east, 60]);
  const a = proj(CRIMEA_BOX[0]), b = proj(CRIMEA_BOX[1]);
  if (!c || !e || !a || !b) return null;
  const d = path(c) ?? undefined;
  const x = e[0];
  return (
    <g>
      <defs>
        <clipPath id={`${id}c`}><path d={d} /></clipPath>
        <mask id={`${id}m`}>
          <rect x={-20000} y={-20000} width={x + 20000} height={40000} fill="#ffffff" />
          <rect x={a[0]} y={a[1]} width={b[0] - a[0]} height={b[1] - a[1]} fill="#000000" />
        </mask>
      </defs>
      <g mask={`url(#${id}m)`}>
        <path d={d} fill={RED} opacity={o} stroke="#5a1a14" strokeWidth={4} />
        {outline > 0 ? <path d={d} fill="none" stroke="#ffe08a" strokeWidth={9} pathLength={1} strokeDasharray={`${Math.min(1, outline)} 1`} strokeLinejoin="round" /> : null}
      </g>
      {front > 0 ? (
        <g clipPath={`url(#${id}c)`} opacity={front}>
          <rect x={x - 16} y={-20000} width={16} height={40000} fill="#ffe08a" />
          <rect x={x - 40} y={-20000} width={24} height={40000} fill="#ffb347" opacity={0.5} />
        </g>
      ) : null}
    </g>
  );
};

/** A line through [lon, lat] points (a river, a route), drawn up to `k`. */
export const Line: React.FC<{ via: LL[]; k?: number; color?: string; w?: number; dash?: boolean; ink?: boolean }> = ({ via, k = 1, color = RIVER, w = 10, dash = false, ink = true }) => {
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
    <g>
      {ink ? <path d={d} fill="none" stroke={INK} strokeWidth={w + 7} strokeLinecap="round" strokeLinejoin="round" /> : null}
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash ? `${w * 2} ${w * 1.4}` : undefined} />
    </g>
  );
};

/** The tip of a line through `via` at `k` (to stand a boat on), in screen pixels, with its heading in degrees. */
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

/** The Ural Mountains: a ridge of snow-capped peaks along the range, rising as `k` goes 0 -> 1. */
export const Ridge: React.FC<{ k?: number; s?: number; shake?: number; glow?: number }> = ({ k = 1, s = 1, shake = 0, glow = 0 }) => {
  const at = useAt();
  const peaks: [number, number][] = [];
  for (let i = 0; i < URALS.length - 1; i++) for (let j = 0; j < 3; j++) {
    const [p, q] = [URALS[i]!, URALS[i + 1]!];
    const xy = at([p[0] + (q[0] - p[0]) * (j / 3), p[1] + (q[1] - p[1]) * (j / 3)]);
    if (xy) peaks.push(xy);
  }
  const h = 64 * s * Math.max(0, Math.min(1, k));
  const sk = Math.max(0, Math.min(1, k));
  if (h <= 1) return null;
  return (
    <g transform={`translate(${Math.sin(shake * 40) * shake * 8} 0)`}>
      {glow > 0 ? peaks.map(([x, y], i) => <circle key={`g${i}`} cx={x} cy={y - h * 0.4} r={60 * s} fill="#ffe08a" opacity={0.35 * glow} />) : null}
      {peaks.map(([x, y], i) => {
        const nb = peaks[i + 1] ?? peaks[i - 1] ?? [x + 200, y];
        const gap = Math.hypot(nb[0] - x, nb[1] - y);
        const ww = Math.min(46 * s, gap * 0.75);
        const hh = Math.min(h, ww * 1.5 * sk) * (0.8 + ((i * 37) % 10) / 25);
        return (
          <g key={i}>
            <path d={`M${x - ww},${y + 10 * s} L${x},${y - hh} L${x + ww},${y + 10 * s} Z`} fill="#8b6a45" stroke={INK} strokeWidth={STROKE * 0.6} strokeLinejoin="round" />
            <path d={`M${x},${y - hh} L${x + ww},${y + 10 * s} L${x + ww * 0.25},${y + 10 * s} Z`} fill="#6b4f33" />
            <path d={`M${x - ww * 0.34},${y - hh * 0.62} L${x},${y - hh} L${x + ww * 0.34},${y - hh * 0.62} L${x + ww * 0.1},${y - hh * 0.7} L${x - ww * 0.1},${y - hh * 0.6} Z`} fill={SNOW} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          </g>
        );
      })}
    </g>
  );
};

/** A pine tree standing at screen [x, y] (its foot), popping up with `k`. */
export const Pine: React.FC<{ x: number; y: number; s: number; k?: number; frost?: number }> = ({ x, y, s, k = 1, frost = 0 }) => {
  if (k <= 0) return null;
  const q = Math.min(1.1, k);
  return (
    <g transform={`translate(${x} ${y}) scale(${(s / 100) * q})`}>
      <Block x={-6} y={-24} w={12} h={26} fill={WOOD} sw={3} shadow={false} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${-42 + i * 9},${-18 - i * 30} L0,${-70 - i * 30} L${42 - i * 9},${-18 - i * 30} Z`} fill={i % 2 ? shade(PINE, 0.08) : PINE} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      ))}
      {frost > 0 ? <path d="M-14,-118 L0,-130 L14,-118 Z" fill={SNOW} opacity={frost} /> : null}
    </g>
  );
};

/** A Cossack river boat (a strug) at screen [x, y], heading `rot` degrees, with `crew` rowers; `oar` is the stroke phase. */
export const Boat: React.FC<{ x: number; y: number; s: number; rot?: number; crew?: number; oar?: number; sail?: string; sailSize?: number; leader?: boolean; k?: number }> = ({
  x, y, s, rot = 0, crew = 3, oar = 0, sail, sailSize = 56, leader = false, k = 1,
}) => {
  if (k <= 0) return null;
  const flip = Math.abs(rot) > 90 ? -1 : 1;
  const r = flip < 0 ? rot - 180 * Math.sign(rot) : rot;
  const sw = Math.sin(oar) * 18;
  return (
    <g transform={`translate(${x} ${y}) rotate(${Math.max(-25, Math.min(25, r))}) scale(${(s / 100) * flip * Math.min(1, k)} ${(s / 100) * Math.min(1, k)})`}>
      <ellipse cx={0} cy={22} rx={110} ry={14} fill="#1d3b4d" opacity={0.25} />
      {sail ? (
        <g>
          <Limb a={[10, 4]} b={[10, -190]} w={8} color="#5b3a1e" sw={3} />
          <path d="M14,-182 Q92,-150 86,-60 L14,-60 Z" fill="#f3e4c2" stroke={INK} strokeWidth={4} />
          <g transform={`scale(${flip} 1)`}>
            <Txt x={flip * 50} y={-112} size={sailSize} fill={RED} stroke="#f3e4c2">{sail}</Txt>
          </g>
        </g>
      ) : null}
      {Array.from({ length: crew }, (_, i) => {
        const cx = -54 + i * 40;
        return (
          <g key={i}>
            <Limb a={[cx, -8]} b={[cx - 30 + sw, 30]} w={5} color="#6b4a2b" sw={2} />
            <Block x={cx - 13} y={-44} w={26} h={34} r={8} fill={i === crew - 1 && leader ? RED : "#3b5b8c"} sw={3} shadow={false} />
            <Ball x={cx} y={-56} r={13} fill="#f0c9a0" sw={3} shadow={false} />
            <path d={`M${cx - 14},${-62} Q${cx},${-84} ${cx + 14},${-62} Z`} fill={leader && i === crew - 1 ? "#3a2a1a" : RED} stroke={INK} strokeWidth={3} />
          </g>
        );
      })}
      <path d="M-104,-6 L104,-6 Q96,22 64,24 L-70,24 Q-98,20 -112,-14 Z" fill={WOOD} stroke={INK} strokeWidth={STROKE * 0.8} strokeLinejoin="round" />
      <path d="M-96,6 L96,6" stroke={shade(WOOD, -0.3)} strokeWidth={4} />
    </g>
  );
};

/** A small Cossack standing at screen [x, y] (feet), red coat and dark cap; `arm` raises the right arm. */
export const Cossack: React.FC<{ x: number; y: number; s: number; k?: number; arm?: number; bob?: number; coat?: string }> = ({ x, y, s, k = 1, arm = 0, bob = 0, coat = RED }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${(s / 100) * Math.min(1, k)})`}>
      <Limb a={[-10, -40]} b={[-14, 0]} w={11} color="#2a2a35" sw={3} />
      <Limb a={[10, -40]} b={[14, 0]} w={11} color="#2a2a35" sw={3} />
      <path d="M-26,-96 L26,-96 L32,-34 L-32,-34 Z" fill={coat} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <Limb a={[-24, -88]} b={[-36, -50]} w={10} color={coat} sw={3} />
      <Limb a={[24, -88]} b={[24 + 30 * Math.sin(arm * 1.4), -88 + 38 * Math.cos(arm * 1.4) * (arm > 0 ? -1 : 1)]} w={10} color={coat} sw={3} />
      <Ball x={0} y={-114} r={19} fill="#f0c9a0" sw={3} shadow={false} />
      <path d="M-20,-120 Q0,-150 20,-120 Z" fill="#3a2a1a" stroke={INK} strokeWidth={3} />
      <path d="M-8,-106 Q0,-98 8,-106" stroke="#3a2a1a" strokeWidth={5} fill="none" />
    </g>
  );
};

/** A wooden fort (an ostrog) at screen [x, y]: a log wall with a watchtower, built up as `k` goes 0 -> 1. */
export const Fort: React.FC<{ x: number; y: number; s: number; k?: number; flag?: number; t?: number }> = ({ x, y, s, k = 1, flag = 0, t = 0 }) => {
  if (k <= 0) return null;
  const logs = 9;
  return (
    <g transform={`translate(${x} ${y}) scale(${s / 100})`}>
      <ellipse cx={0} cy={6} rx={120} ry={16} fill="#3a2a1a" opacity={0.25} />
      {Array.from({ length: logs }, (_, i) => {
        const kk = Math.max(0, Math.min(1, k * logs - i * 0.6));
        const h = 90 * kk;
        const lx = -96 + i * 24;
        return kk > 0 ? <path key={i} d={`M${lx - 11},0 L${lx - 11},${-h} L${lx},${-h - 16} L${lx + 11},${-h} L${lx + 11},0 Z`} fill={i % 2 ? WOOD : shade(WOOD, 0.1)} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" /> : null;
      })}
      {k > 0.6 ? (
        <g opacity={Math.min(1, (k - 0.6) * 3)}>
          <Block x={-26} y={-150} w={52} h={70} fill={shade(WOOD, -0.1)} sw={4} />
          <path d="M-40,-150 L0,-196 L40,-150 Z" fill="#5b3a1e" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <Block x={-9} y={-130} w={18} h={22} fill="#2a1d12" sw={3} shadow={false} />
        </g>
      ) : null}
      {flag > 0 ? (
        <g transform={`translate(0 -196)`}>
          <Limb a={[0, 0]} b={[0, -70 * Math.min(1, flag)]} w={5} color="#3a2a1a" sw={2} />
          {flag > 0.5 ? <path d={`M2,-70 L56,${-60 + Math.sin(t / 5) * 4} L2,-44 Z`} fill={RED} stroke={INK} strokeWidth={3} /> : null}
        </g>
      ) : null}
    </g>
  );
};

/** A planted banner on a pole at screen [x, y]. */
export const Banner: React.FC<{ x: number; y: number; s: number; k: number; t: number; color?: string }> = ({ x, y, s, k, t, color = RED }) => {
  if (k <= 0) return null;
  const h = 150 * Math.min(1, k);
  return (
    <g transform={`translate(${x} ${y}) scale(${s / 100})`}>
      <Limb a={[0, 0]} b={[0, -h]} w={8} color="#3a2a1a" sw={3} />
      {k > 0.4 ? <path d={`M4,${-h} Q40,${-h - 8 + Math.sin(t / 6) * 6} 80,${-h + 2} L80,${-h + 50} Q40,${-h + 44 + Math.sin(t / 6 + 1) * 6} 4,${-h + 50} Z`} fill={color} stroke={INK} strokeWidth={4} /> : null}
    </g>
  );
};

/** A fur pelt (sable: dark brown; fox: orange with a white tail tip) at screen [x, y]. */
export const Pelt: React.FC<{ x: number; y: number; s: number; kind: "sable" | "fox"; k?: number; rot?: number }> = ({ x, y, s, kind, k = 1, rot = 0 }) => {
  if (k <= 0) return null;
  const c = kind === "sable" ? "#4a3122" : "#e07a2e";
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${(s / 100) * Math.min(1.12, k)})`}>
      <path d="M0,-76 Q16,-72 18,-52 L40,-42 L54,-56 L60,-38 L32,-22 Q38,10 32,30 L58,44 L52,62 L30,48 Q16,40 0,40 Q-16,40 -30,48 L-52,62 L-58,44 L-32,30 Q-38,10 -32,-22 L-60,-38 L-54,-56 L-40,-42 L-18,-52 Q-16,-72 0,-76 Z" fill={c} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M0,36 Q10,80 -6,118" stroke={INK} strokeWidth={26} fill="none" strokeLinecap="round" />
      <path d="M0,36 Q10,80 -6,118" stroke={c} strokeWidth={17} fill="none" strokeLinecap="round" />
      {kind === "fox" ? <circle cx={-6} cy={116} r={10} fill="#ffffff" stroke={INK} strokeWidth={3} /> : null}
      <path d="M0,-40 L0,24" stroke={shade(c, 0.25)} strokeWidth={8} fill="none" strokeLinecap="round" />
      <circle cx={-6} cy={-60} r={3} fill={INK} /><circle cx={6} cy={-60} r={3} fill={INK} />
    </g>
  );
};

/** A hunters' tent (a cone of hides on poles) at screen [x, y]. */
export const Tent: React.FC<{ x: number; y: number; s: number; k?: number; warm?: number }> = ({ x, y, s, k = 1, warm = 1 }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${(s / 100) * Math.min(1.1, k)})`}>
      {warm > 0 ? <circle cx={0} cy={-40} r={90} fill="#ffb347" opacity={0.3 * warm} /> : null}
      <Limb a={[-14, -110]} b={[22, -134]} w={4} color="#3a2a1a" sw={2} />
      <Limb a={[14, -110]} b={[-22, -134]} w={4} color="#3a2a1a" sw={2} />
      <path d="M-60,0 L0,-112 L60,0 Z" fill={shade("#b08a5a", -0.1 * (1 - warm))} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M0,-112 L60,0 L24,0 Z" fill="#8f6c44" />
      <path d="M-14,0 L0,-40 L14,0 Z" fill={warm > 0.3 ? "#ffcf6a" : "#3a2a1a"} stroke={INK} strokeWidth={3} />
    </g>
  );
};

/** A reindeer at screen [x, y] (feet), facing right. */
export const Reindeer: React.FC<{ x: number; y: number; s: number; k?: number; t?: number }> = ({ x, y, s, k = 1, t = 0 }) => {
  if (k <= 0) return null;
  const nod = Math.sin(t / 9) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${(s / 100) * Math.min(1, k)})`}>
      {[-34, -18, 18, 34].map((lx, i) => <Limb key={i} a={[lx, -40]} b={[lx + (i % 2 ? 3 : -3), 0]} w={8} color="#6b4a2b" sw={3} />)}
      <ellipse cx={0} cy={-52} rx={50} ry={24} fill="#8a6a48" stroke={INK} strokeWidth={4} />
      <ellipse cx={-6} cy={-42} rx={30} ry={8} fill="#efe6d6" />
      <g transform={`translate(44 ${-72 + nod})`}>
        <Limb a={[-8, 20]} b={[6, -6]} w={16} color="#8a6a48" sw={3} />
        <ellipse cx={14} cy={-10} rx={20} ry={13} fill="#8a6a48" stroke={INK} strokeWidth={4} />
        <path d="M4,-20 L-4,-56 L-18,-66 M-4,-56 L8,-70 M12,-20 L22,-52 L14,-70 M22,-52 L36,-62" stroke="#5b3a1e" strokeWidth={5} fill="none" strokeLinecap="round" />
        <circle cx={18} cy={-14} r={2.6} fill={INK} />
      </g>
    </g>
  );
};

/** A hunter of the taiga at screen [x, y]: a hide coat with a fur hood; `bow` raises a bow. */
export const Hunter: React.FC<{ x: number; y: number; s: number; k?: number; bow?: number; hold?: number }> = ({ x, y, s, k = 1, bow = 0, hold = 0 }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${(s / 100) * Math.min(1, k)})`}>
      <Limb a={[-10, -40]} b={[-12, 0]} w={11} color="#5b3a1e" sw={3} />
      <Limb a={[10, -40]} b={[12, 0]} w={11} color="#5b3a1e" sw={3} />
      <path d="M-26,-96 L26,-96 L34,-30 L-34,-30 Z" fill="#a0784c" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M-34,-36 L34,-36" stroke="#efe6d6" strokeWidth={6} />
      <Limb a={[-24, -88]} b={[-34, -52]} w={10} color="#a0784c" sw={3} />
      <Limb a={[24, -88]} b={[24 + 40 * Math.max(bow, hold), -88 + 30 * (1 - Math.max(bow, hold)) - 26 * bow]} w={10} color="#a0784c" sw={3} />
      {bow > 0 ? <path d={`M${60},${-150} Q${86},${-110} ${60},${-70}`} stroke="#3a2a1a" strokeWidth={5} fill="none" opacity={Math.min(1, bow * 2)} /> : null}
      <Ball x={0} y={-114} r={20} fill="#e0b48a" sw={3} shadow={false} />
      <path d="M-26,-112 Q-24,-146 0,-146 Q24,-146 26,-112 Q20,-132 0,-132 Q-20,-132 -26,-112 Z" fill="#efe6d6" stroke={INK} strokeWidth={3} />
    </g>
  );
};

/** A bag of coins at screen [x, y]. */
export const CoinBag: React.FC<{ x: number; y: number; s: number; k?: number }> = ({ x, y, s, k = 1 }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${(s / 100) * Math.min(1.1, k)})`}>
      <path d="M-40,-10 Q-56,40 0,46 Q56,40 40,-10 Q30,-34 12,-40 L-12,-40 Q-30,-34 -40,-10 Z" fill="#c9a25a" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M-16,-40 L-10,-54 L10,-54 L16,-40" fill="#a8823e" stroke={INK} strokeWidth={4} />
      <circle cx={0} cy={10} r={16} fill={GOLD} stroke={INK} strokeWidth={4} />
    </g>
  );
};

/** A gold bar at screen [x, y]. */
export const GoldBar: React.FC<{ x: number; y: number; s: number; k?: number }> = ({ x, y, s, k = 1 }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${(s / 100) * Math.min(1.1, k)})`}>
      <path d="M-70,30 L-46,-24 L46,-24 L70,30 Z" fill={GOLD} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M-46,-24 L46,-24 L36,-8 L-36,-8 Z" fill="#ffd877" />
      <path d="M46,-24 L70,30 L54,30 L36,-8 Z" fill="#c98f1e" />
    </g>
  );
};

/** A big gold question mark, bobbing. */
export const QMark: React.FC<{ x: number; y: number; k: number; t: number; size?: number }> = ({ x, y, k, t, size = 220 }) =>
  k <= 0 ? null : <Txt x={x} y={y - Math.abs(Math.sin(t / 5)) * 20} size={size * Math.min(1.15, k)} fill={GOLD} stroke={INK}>?</Txt>;

/** A place name on the map: a dot and its name typed on as `k` goes 0 -> 1. */
export const Spot: React.FC<{ at: LL; name: string; k?: number; size?: number; left?: boolean; color?: string; dy?: number }> = ({ at, name, k = 1, size = 50, left = false, color = GOLD, dy = 0 }) => {
  const xy = useAt()(at);
  if (!xy || k <= 0) return null;
  const n = Math.max(1, Math.round(name.length * Math.min(1, k * 1.4)));
  return (
    <g opacity={Math.min(1, k * 2)}>
      <Ball x={xy[0]} y={xy[1]} r={13} fill={color} shadow={false} sw={4} />
      <Txt x={xy[0] + (left ? -26 : 26)} y={xy[1] + dy} size={size} fill="#ffffff" anchor={left ? "end" : "start"} stroke={INK}>{name.slice(0, n)}</Txt>
    </g>
  );
};

/** Trees scattered over Siberia's forest belt (lon 62..140, lat 56..66), each with its own pop-in order. */
export const FOREST: [number, number, number][] = (() => {
  const out: [number, number, number][] = [];
  let s = 7;
  const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < 70; i++) out.push([62 + r() * 80, 56 + r() * 9.5, r()]);
  return out;
})();

const props = { MOSCOW, OKHOTSK };
export default props;
