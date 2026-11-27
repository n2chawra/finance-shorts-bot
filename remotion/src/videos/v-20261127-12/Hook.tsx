// Hook: "What if you could drive from Russia to Alaska, over the sea?" The tip of Russia facing Alaska across the
// Bering Strait on the old map from frame 0: a car rolls up to the end of the land beside a green road sign pointing
// across the water to ALASKA; Russia's flag plants on its shore, the American flag on Alaska's and the sign's arrow
// lights, a dotted line arcs over the water and the camera pushes in on the waves.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { SourceLine, Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { SideNames, BMap, Car, Diomedes, DEZHNEV, HOOK_VIEW, PRINCE, Planted, RoadSign, SEA_STRAIT, Waves, between, mix , Floes } from "./props";

const AtCape: React.FC<{ roll: number; t: number; sign: number; lit: number }> = ({ roll, t, sign, lit }) => {
  const xy = useAt()(DEZHNEV);
  if (!xy) return null;
  return (
    <g>
      <RoadSign x={Math.max(230, xy[0] + 40)} y={xy[1] - 30} text="TO ALASKA" k={sign} lit={lit} />
      <Car x={mix(xy[0] - 260, xy[0] - 40, roll)} y={xy[1] + 40} s={120} bump={roll < 1 ? Math.sin(t / 3) : 0} />
    </g>
  );
};

const Arc: React.FC<{ k: number }> = ({ k }) => {
  const at = useAt();
  const a = at(DEZHNEV), b = at(PRINCE);
  if (!a || !b || k <= 0) return null;
  const mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - 220;
  const d = `M${a[0] + 40},${a[1] + 20} Q${mx},${my} ${b[0]},${b[1] - 10}`;
  return (
    <g>
      <defs><mask id="hook-arc"><path d={d} fill="none" stroke="#fff" strokeWidth={16} pathLength={1} strokeDasharray={`${k} 1`} /></mask></defs>
      <path d={d} fill="none" stroke="#fff4d0" strokeWidth={10} strokeDasharray="22 18" strokeLinecap="round" mask="url(#hook-arc)" />
    </g>
  );
};

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const dr = m.at("drive", 6), ru = m.at("russia", 18), al = m.at("alaska", 30), ov = m.at("over", 42), se = m.at("sea", 52);
  const cam = between(HOOK_VIEW, { center: [-168.95, 65.84], scale: 26000 }, m.lerp([se, m.end + 6], [0, 1]));
  return (
    <>
      <Stage p={p} bg="#5f9fae" vignette={0.35}>
        <View zoom={1.02 + m.wave(90, 0.01)}>
          <BMap center={cam.center} scale={cam.scale} colors={{ Russia: { fill: "#e6a39a", k: 0.3 * m.lerp([ru, ru + 10], [0, 1]), flag: "Russia" } }}>
            <Floes t={m.t} size={34} />
          <Waves pts={SEA_STRAIT} t={m.t} o={0.6 + 0.3 * m.lerp([se, se + 10], [0, 1])} />
            <Diomedes t={m.t} />
            <Arc k={m.lerp([ov, ov + 12], [0, 1])} />
            <Planted at={[-170.15, 66.28]} name="Russia" k={1 + 0.25 * m.pulse(ru, 10)} dx={-60} />
            <SideNames />
            <Planted at={[-168.0, 65.72]} name="United States of America" k={1 + 0.25 * m.pulse(al, 10)} dx={-150} />
            <AtCape roll={m.lerp([0, dr + 10], [0.35, 1])} t={m.t} sign={1} lit={m.lerp([al, al + 10], [0, 1])} />
          </BMap>
        </View>
      </Stage>
      <SourceLine p={p} />
    </>
  );
};
export default Hook;
