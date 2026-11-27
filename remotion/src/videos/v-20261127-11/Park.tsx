// "Because it's kept on purpose. In 1980, Panama made the jungle a national park: 5,790 square kilometres of
// protected forest." The light warms to bright green; a gate with a padlock drops onto the end of the road, Panama's
// flag lights up, the park's border draws itself along the frontier and fills green as its sign with the year rises,
// the area stamps on the park, a ranger walks to the gate and trees grow thick across the park.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Glow, INK, Limb, Stage, Tag, View, motion, rng } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { useAt } from "../../flat/map";
import { AMap, Board, NORTH_ROAD, Road, SEA_GAP, TURBO, Tree, Waves, YAVIZA, between, type LL } from "./props";

type Params = { fig?: { year?: string; area?: string } };

/** Darién National Park, simplified: a band along the Panama side of the frontier down to the Pacific. */
const PARK: LL[] = [[-78.45, 7.55], [-78.2, 7.3], [-77.9, 7.22], [-77.82, 7.6], [-77.65, 7.95], [-77.48, 8.22], [-77.36, 8.5], [-77.55, 8.42], [-77.75, 8.1], [-78.0, 7.95], [-78.3, 7.85]];
const R = rng("park-27-11");
const PARK_TREES: LL[] = Array.from({ length: 30 }, () => [-78.3 + R() * 0.7, 7.35 + R() * 0.9] as LL);

const inside = (pt: LL, poly: LL[]): boolean => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!, b = poly[j]!;
    if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < ((b[0] - a[0]) * (pt[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
};
const TREES = PARK_TREES.filter((t) => inside(t, PARK));

const ParkArea: React.FC<{ draw: number; fill: number; trees: number }> = ({ draw, fill, trees }) => {
  const at = useAt();
  const xy = PARK.map((p) => at(p)).filter((p): p is [number, number] => !!p);
  if (xy.length < 3 || draw <= 0) return null;
  const d = xy.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + " Z";
  let len = 0;
  for (let i = 0; i < xy.length; i++) { const a = xy[i]!, b = xy[(i + 1) % xy.length]!; len += Math.hypot(b[0] - a[0], b[1] - a[1]); }
  return (
    <g>
      <path d={d} fill="#4f9a4a" opacity={0.55 * fill} />
      {TREES.map((t, i) => {
        const p = at(t);
        return p ? <Tree key={i} x={p[0]} y={p[1]} s={60} k={Math.min(1, Math.max(0, trees * 2 - i / TREES.length))} /> : null;
      })}
      <path d={d} fill="none" stroke="#1f5a2a" strokeWidth={10} strokeDasharray={`${len * Math.min(1, draw)} ${len}`} strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#c8f0a0" strokeWidth={4} strokeDasharray={`${len * Math.min(1, draw)} ${len}`} strokeLinejoin="round" />
    </g>
  );
};

const Gate: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()(YAVIZA);
  if (!xy || k <= 0) return null;
  const x = xy[0] + 40, y = xy[1] + 10, q = Math.min(1, k);
  return (
    <g transform={`translate(0,${(1 - q) * -120})`} opacity={Math.min(1, k * 2)}>
      <Limb a={[x - 70, y]} b={[x - 70, y - 120]} w={14} color="#6b4a2a" sw={3} />
      <Limb a={[x + 70, y]} b={[x + 70, y - 120]} w={14} color="#6b4a2a" sw={3} />
      {[0, 1, 2].map((i) => <Limb key={i} a={[x - 70, y - 30 - i * 35]} b={[x + 70, y - 30 - i * 35]} w={10} color="#8a6a3a" sw={2} />)}
      <Block x={x - 18} y={y - 80} w={36} h={30} fill="#d9a63a" r={4} sw={3} />
      <path d={`M${x - 11},${y - 80} v-12 a11,11 0 0 1 22,0 v12`} fill="none" stroke={INK} strokeWidth={5} />
      <Ball x={x} y={y - 66} r={4} fill={INK} shadow={false} sw={0} />
    </g>
  );
};

const Ranger: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()(YAVIZA);
  if (!xy || k <= 0) return null;
  const x = xy[0] - 220 + 120 * Math.min(1, k);
  return (
    <g>
      <Char x={x} y={xy[1] + 30 + Math.abs(Math.sin(t / 4)) * -4 * (k < 1 ? 1 : 0)} s={64} who="sharma" face="happy" armR={[20, 10]} />
      <ellipse cx={x} cy={xy[1] + 30 - 64 * 2.55} rx={52} ry={14} fill="#7a6a3a" stroke={INK} strokeWidth={3} />
    </g>
  );
};

const ParkSign: React.FC<{ k: number; year: string }> = ({ k, year }) => {
  const xy = useAt()([-77.95, 7.6]);
  return xy ? <Board x={Math.max(360, Math.min(700, xy[0]))} y={xy[1] - 20} w={640} title="NATIONAL PARK" value={`SINCE ${year}`} k={k} tone="#dff0c8" /> : null;
};

const FrontGlow: React.FC<{ k: number }> = ({ k }) => {
  const at = useAt();
  if (k <= 0 || k >= 1) return null;
  const pts: LL[] = [[-77.36, 8.6], [-77.58, 8.22], [-77.72, 7.95], [-77.85, 7.5]];
  const a = at(pts[Math.min(3, Math.floor(k * 3))]!), b = at(pts[Math.min(3, Math.floor(k * 3) + 1)]!);
  if (!a || !b) return null;
  const q = (k * 3) % 1;
  return <Glow x={a[0] + (b[0] - a[0]) * q} y={a[1] + (b[1] - a[1]) * q} r={160} color="#b8f08a" o={0.8} />;
};

const Park: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const be = m.at("because", 2), pu = m.at("purpose", 14), pa = m.at("panama", 36), pk = m.at("park", 56), sq = m.at("square", 76), pr = m.at("protected", 100), fo = m.at("forest", 112), ju = m.at("jungle", 46), km = m.at("kilometres", 90);
  const med = { center: [-77.45, 8.0] as LL, scale: 19000 };
  const wide = { center: [-77.75, 7.85] as LL, scale: 13500 };
  const close = { center: [-77.7, 8.1] as LL, scale: 21000 };
  const a = between(med, wide, m.lerp([pk, pk + 24], [0, 1]));
  const cam = between(a, close, m.lerp([pr, pr + 20], [0, 1]));
  const light = m.lerp([be, be + 16], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.3}>
      <View zoom={1.0 + m.wave(70, 0.008)}>
        <AMap center={cam.center} scale={cam.scale} colors={{
          Panama: { fill: "#e2bd7a", k: 1, flag: "Panama", trace: m.lerp([pa, pa + 24], [0, 1]) },
          Colombia: { fill: "#e8cf86", k: 1, flag: "Colombia" },
        }}>
          <Waves pts={SEA_GAP} t={m.t} />
          <Road pts={NORTH_ROAD} w={14} />
          <Road pts={[TURBO, [-76.68, 7.8], [-76.65, 7.5], [-76.5, 7.1]]} w={14} />
          <ParkArea draw={m.lerp([pk, pk + 30], [0, 1])} fill={m.lerp([pk + 16, pk + 36], [0, 1])} trees={m.lerp([fo, fo + 20], [0, 1])} />
          <Gate k={m.pop(pu)} />
          <FrontGlow k={m.lerp([ju, ju + 20], [0, 1])} />
          <ParkSign k={m.pop(pk + 10)} year={f.year ?? ""} />
          <Ranger k={m.lerp([pr, pr + 24], [0, 1])} t={m.t} />
        </AMap>
      </View>
      <rect x={0} y={0} width={1080} height={1920} fill="#b8f08a" opacity={0.12 * light} />
      <Tag x={330} y={300} w={420} h={110} text={`${f.area ?? ""} SQ KM`} size={58} k={m.pop(sq)} rot={4 * m.pulse(km, 10)} />
    </Stage>
  );
};
export default Park;
