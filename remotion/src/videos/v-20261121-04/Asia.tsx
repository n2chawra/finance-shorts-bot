// "Day four: no new tankers leave for China, India, Japan or South Korea, and most of the oil through Hormuz sails
// east to Asia." The map from Hormuz to Japan: DAY FOUR on the sign; tankers at Hormuz stay put and the dashed routes
// east stay empty on "leave"; China, India, Japan and South Korea each trace and fill on their names; a fat arrow
// from Hormuz points east on "most", sweeps across the ocean on "east", and the empty routes blink on "Asia".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapRoute, useAt } from "../../flat/map";
import { BUSAN, DayBoard, Gulf, HORMUZ, MUMBAI, SHANGHAI, TOKYO, Tanker } from "./props";

const ROUTES: [number, number][][] = [
  [HORMUZ, [62, 22], MUMBAI],
  [HORMUZ, [70, 12], [80, 5.5], [97, 5.5], [104, 2], [112, 12], SHANGHAI],
  [HORMUZ, [70, 12], [80, 5.5], [97, 5.5], [104, 2], [118, 15], [126, 30], BUSAN],
  [HORMUZ, [70, 12], [80, 5.5], [97, 5.5], [104, 2], [120, 18], [134, 31], TOKYO],
];

const Arrow: React.FC<{ k: number; sweep: number }> = ({ k, sweep }) => {
  const xy = useAt()(HORMUZ);
  if (!xy || k <= 0) return null;
  const len = 160 + 420 * sweep;
  return (
    <g transform={`translate(${xy[0] + 40} ${xy[1] + 40}) rotate(12) scale(${Math.min(1, k)})`}>
      <path d={`M 0 -26 L ${len} -26 L ${len} -60 L ${len + 80} 0 L ${len} 60 L ${len} 26 L 0 26 Z`} fill="#ffd84a" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    </g>
  );
};

const Waiting: React.FC<{ t: number }> = ({ t }) => {
  const xy = useAt()([57.6, 25.2]);
  return xy ? <g><Tanker x={xy[0]} y={xy[1]} s={56} t={t} /><Tanker x={xy[0] + 30} y={xy[1] + 40} s={56} t={t + 9} /></g> : null;
};

const Asia: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const dy = m.at("day", 2), lv = m.at("leave", 16), ch = m.at("china", 30), ind = m.at("india", 40), ja = m.at("japan", 50), so = m.at("south", 60), ko = m.at("korea", 66), mo = m.at("most", 80), ea = m.at("east", 100), as = m.at("asia", 112);
  const tr = (w: number) => m.lerp([w, w + 22], [0, 1]);
  const blink = m.t >= as ? 0.4 + 0.6 * Math.abs(Math.sin(m.t / 4)) : 1;
  const push = m.lerp([as - 4, as + 14], [0, 1]);
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.36}>
      <View zoom={1 + 0.08 * push + m.wave(80, 0.01)}>
        <Gulf wide center={[94, 20]} scale={540}
          colors={{ China: { fill: "#c9343a", trace: tr(ch), k: tr(ch), flag: "China" }, India: { fill: "#e3934a", trace: tr(ind), k: tr(ind), flag: "India" }, Japan: { fill: "#f4efe4", trace: tr(ja), k: tr(ja), flag: "Japan" }, "South Korea": { fill: "#f4efe4", trace: tr(so), k: tr(ko), flag: "South Korea" } }}>
          <g opacity={(0.3 + 0.5 * m.lerp([lv, lv + 10], [0, 1])) * blink}>
            {ROUTES.map((r, i) => <MapRoute key={i} via={r} k={1} color="#f4efe4" width={6} />)}
          </g>
          <Waiting t={m.t} />
          <Arrow k={m.pop(mo, 11)} sweep={m.lerp([ea, ea + 16], [0, 1])} />
          <MapLabel at={[103, 34]} text="CHINA" size={56} k={tr(ch)} />
          <MapLabel at={[78, 22]} text="INDIA" size={56} k={tr(ind)} />
          <MapLabel at={[128, 44]} text="JAPAN" size={48} k={tr(ja)} />
          <MapLabel at={[120, 39.5]} text="KOREA" size={46} k={tr(ko)} />
          <MapLabel at={[56, 30.5]} text="HORMUZ" size={50} fill="#ffd84a" />
        </Gulf>
      </View>
      <DayBoard day={4} flip={m.pop(dy, 10)} />
    </Stage>
  );
};

export default Asia;
