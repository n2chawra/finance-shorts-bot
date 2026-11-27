// "So what fills it? Steep mountains, thick rainforest, and on the Colombian side, a marsh 80 kilometres wide." The
// camera pushes into the gap; the land darkens along the border, a ridge of peaks rises along it, rainforest trees
// sprout across the gap, the Colombian side lights up and water spreads through the Atrato marsh with reeds, then a
// width bar spans the marsh with the figure on its tag.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Tag, View, motion, rng, shade } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { MapWater } from "../../flat/water";
import { AMap, NORTH_ROAD, Road, SEA_GAP, TURBO, Tree, Waves, between, type LL } from "./props";

type Params = { fig?: { width?: string } };

export const BORDER: LL[] = [[-77.36, 8.66], [-77.45, 8.45], [-77.58, 8.22], [-77.72, 7.95], [-77.82, 7.65], [-77.89, 7.25]];
export const MARSH: LL[] = [[-77.3, 7.95], [-77.0, 8.0], [-76.8, 7.85], [-76.7, 7.45], [-76.8, 7.05], [-77.05, 6.95], [-77.3, 7.1], [-77.4, 7.5]];
const R = rng("darien-forest-27-11");
export const FOREST_PTS: LL[] = Array.from({ length: 46 }, () => [-77.85 + R() * 0.85, 7.3 + R() * 1.15] as LL)
  .filter((t) => !(t[0] > -77.35 && t[1] < 8.0 && t[1] > 6.95));

export const Peaks: React.FC<{ k: number }> = ({ k }) => {
  const at = useAt();
  if (k <= 0) return null;
  return (
    <g>
      {BORDER.slice(0, -1).flatMap((a, i) => {
        const b = BORDER[i + 1]!;
        return [0.2, 0.6].map((q, j) => {
          const ll: LL = [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q];
          const xy = at(ll);
          if (!xy) return null;
          const n = i * 2 + j;
          const h = (90 + (n % 3) * 30) * Math.min(1, Math.max(0, k * 1.6 - n * 0.06));
          if (h <= 0) return null;
          return (
            <g key={`${i}-${j}`}>
              <path d={`M${xy[0] - 70},${xy[1] + 20} L${xy[0]},${xy[1] + 20 - h} L${xy[0] + 70},${xy[1] + 20} Z`} fill="#8a7458" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
              <path d={`M${xy[0]},${xy[1] + 20 - h} L${xy[0] + 70},${xy[1] + 20} L${xy[0] + 18},${xy[1] + 20} Z`} fill={shade("#8a7458", -0.2)} />
              <path d={`M${xy[0] - 18},${xy[1] + 20 - h * 0.74} L${xy[0]},${xy[1] + 20 - h} L${xy[0] + 18},${xy[1] + 20 - h * 0.74} Z`} fill="#f4f1ea" />
            </g>
          );
        });
      })}
    </g>
  );
};

export const Forest: React.FC<{ k: number; s?: number }> = ({ k, s = 64 }) => {
  const at = useAt();
  if (k <= 0) return null;
  return (
    <g>
      {FOREST_PTS.map((t, i) => {
        const xy = at(t);
        return xy ? <Tree key={i} x={xy[0]} y={xy[1]} s={s} k={Math.min(1, Math.max(0, k * 2 - (i / FOREST_PTS.length)))} /> : null;
      })}
    </g>
  );
};

const Reeds: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const at = useAt();
  if (k <= 0) return null;
  const pts: LL[] = [[-77.2, 7.8], [-77.0, 7.6], [-76.9, 7.3], [-77.15, 7.3], [-77.25, 7.55], [-76.85, 7.7]];
  return (
    <g>
      {pts.map((ll, i) => {
        const xy = at(ll);
        if (!xy) return null;
        const q = Math.min(1, Math.max(0, k * 2 - i * 0.15));
        const sway = Math.sin(t / 10 + i) * 6;
        return (
          <g key={i} opacity={q}>
            {[-14, 0, 14].map((dx, j) => <path key={j} d={`M${xy[0] + dx},${xy[1]} q${sway},-${30 * q} ${sway * 1.5},-${60 * q}`} stroke="#4f7a3a" strokeWidth={7} fill="none" strokeLinecap="round" />)}
          </g>
        );
      })}
    </g>
  );
};

const WidthBar: React.FC<{ k: number; text: string }> = ({ k, text }) => {
  const at = useAt();
  const a = at([-77.4, 7.5]), b = at([-76.7, 7.5]);
  if (!a || !b || k <= 0) return null;
  const y = a[1];
  const mx = (a[0] + b[0]) / 2, half = ((b[0] - a[0]) / 2) * Math.min(1, k);
  return (
    <g>
      <line x1={mx - half} y1={y} x2={mx + half} y2={y} stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <line x1={mx - half} y1={y} x2={mx + half} y2={y} stroke="#fff4d0" strokeWidth={7} strokeLinecap="round" />
      <Tag x={mx - 200} y={y - 170} w={400} h={100} text={text} size={54} k={Math.max(0, (k - 0.5) / 0.5)} />
    </g>
  );
};

const Jungle: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const w = (p.beat.params as Params).fig?.width ?? "";
  const fi = m.at("fills", 2), st = m.at("steep", 20), mo = m.at("mountains", 30), ra = m.at("rainforest", 48), co = m.at("colombian", 70), ma = m.at("marsh", 84), wi = m.at("wide", 110);
  const wide = { center: [-77.2, 7.85] as LL, scale: 15500 };
  const med = { center: [-77.4, 7.85] as LL, scale: 19000 };
  const close = { center: [-77.05, 7.45] as LL, scale: 23000 };
  const a = between(wide, med, m.lerp([fi, mo + 10], [0, 1]));
  const cam = between(a, close, m.lerp([ma, ma + 24], [0, 1]));
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(70, 0.008)}>
        <AMap center={cam.center} scale={cam.scale} colors={{
          Panama: { fill: shade("#e2bd7a", -0.25 * m.lerp([st, st + 14], [0, 1])), k: 1, flag: "Panama" },
          Colombia: { fill: "#e8cf86", k: 1, flag: "Colombia", trace: m.lerp([co, co + 24], [0, 1]) },
        }}>
          <Waves pts={SEA_GAP} t={m.t} />
          <Road pts={NORTH_ROAD} w={14} />
          <Road pts={[TURBO, [-76.68, 7.8], [-76.65, 7.5], [-76.5, 7.1]]} w={14} />
          <MapWater area={MARSH} from={[-77.0, 8.0]} k={m.lerp([ma, ma + 30], [0, 1])} t={m.t} band={30} />
          <Reeds k={m.lerp([ma + 10, ma + 30], [0, 1])} t={m.t} />
          <Forest k={m.lerp([ra, ra + 26], [0, 1])} />
          <Peaks k={m.lerp([mo, mo + 20], [0, 1])} />
          <WidthBar k={m.lerp([wi - 14, wi + 10], [0, 1])} text={`${w} KM WIDE`} />
        </AMap>
      </View>
    </Stage>
  );
};
export default Jungle;
