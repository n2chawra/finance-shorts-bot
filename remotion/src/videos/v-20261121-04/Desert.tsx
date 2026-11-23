// "Day two: Saudi Arabia has a way round, a pipeline west across the desert to the Red Sea." DAY TWO on the sign;
// Saudi Arabia traces on "Saudi" and fills on "Arabia"; an arrow curls round the strait on "way"; a pipe draws from
// the Gulf coast on "pipeline", runs west, dunes rise either side on "desert", reaches the Red Sea on "Red" where a
// tanker loads on "Sea".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapRoute, useAt } from "../../flat/map";
import { ABQAIQ, Barrier, DayBoard, Gulf, Port, Tanker, YANBU } from "./props";

const PIPE: [number, number][] = [ABQAIQ, [46.7, 25.0], [43.5, 24.6], [40.5, 24.3], YANBU];

const Dunes: React.FC<{ k: number }> = ({ k }) => {
  const at = useAt();
  const pts: [number, number][] = [[45.2, 25.8], [42.0, 23.6], [44.0, 23.4], [41.4, 25.6]];
  return <g>{pts.map((p, i) => { const xy = at(p); if (!xy || k <= 0) return null; const w = 90 * Math.min(1, k); return <path key={i} d={`M ${xy[0] - w} ${xy[1]} Q ${xy[0]} ${xy[1] - w * 0.7} ${xy[0] + w} ${xy[1]} Z`} fill="#e3b56f" stroke={INK} strokeWidth={4} />; })}</g>;
};

const Arrow: React.FC<{ k: number }> = ({ k }) => {
  const at = useAt();
  const a = at([50.5, 27.5]), b = at([47.5, 26.5]);
  if (!a || !b || k <= 0) return null;
  return <path d={`M ${a[0]} ${a[1]} Q ${(a[0] + b[0]) / 2} ${a[1] - 140} ${b[0]} ${b[1]}`} fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" pathLength={1} strokeDasharray={`${Math.min(1, k)} 1`} />;
};

const Load: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()(YANBU);
  if (!xy || k <= 0) return null;
  return <Tanker x={xy[0] - 70} y={xy[1] + 30} s={80 * Math.min(1, k)} t={t} barrels={k} />;
};

const Desert: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const dy = m.at("day", 2), sa = m.at("saudi", 14), ar = m.at("arabia", 22), wy = m.at("way", 34), pi = m.at("pipeline", 46), ds = m.at("desert", 70), rd = m.at("red", 84), se = m.at("sea", 92);
  const wide = m.lerp([pi - 4, rd], [0, 1]);
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.36}>
      <View zoom={1 + m.wave(80, 0.01)}>
        <Gulf center={[50 - 5.5 * wide, 25.8 - 0.6 * wide]} scale={3400 - 1300 * wide}
          colors={{ "Saudi Arabia": { fill: "#3a7a4a", trace: m.lerp([sa, sa + 26], [0, 1]), k: m.lerp([ar, ar + 12], [0, 1]) } }}>
          <Barrier k={1} />
          <Arrow k={m.lerp([wy, wy + 12], [0, 1])} />
          <Dunes k={m.lerp([ds, ds + 12], [0, 1])} />
          {m.t >= pi ? <MapRoute via={PIPE} k={m.lerp([pi, rd + 4], [0.03, 1])} color="#9aa0ad" width={16} dash={false} /> : null}
          <Port at={YANBU} name="RED SEA" k={m.lerp([rd, rd + 12], [0, 1])} dx={20} dy={-70} />
          <Load k={m.pop(se, 11)} t={m.t} />
          <MapLabel at={[45.3, 22.4]} text="SAUDI ARABIA" size={60} k={m.lerp([ar, ar + 10], [0, 1])} />
        </Gulf>
      </View>
      <DayBoard day={2} flip={m.pop(dy, 10)} />
    </Stage>
  );
};

export default Desert;
