// "Lay Mexico on top, and it covers almost all of Spain, then most of Portugal." Iberia in its colours; on "Lay"
// Mexico's flag-filled outline slides in from the west and drops onto Spain with a dust ring; Spain's edge flashes
// under it on "covers"; SPAIN writes on; Portugal lights under the outline as the camera pulls back.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { ES_C, ES_FILL, GeoMap, IBERIA, MexicoOnSpain, SEA, between } from "./props";

const Dust: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()(ES_C);
  if (!xy || k <= 0 || k >= 1) return null;
  return <ellipse cx={xy[0]} cy={xy[1]} rx={200 + 500 * k} ry={120 + 300 * k} fill="none" stroke="#fff4d0" strokeWidth={14 * (1 - k)} opacity={1 - k} />;
};

const Cover: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const la = m.at("lay", 2), mx = m.at("mexico", 10), co = m.at("covers", 24), sp = m.at("spain", 40), po = m.at("portugal", 56);
  const cam = between(IBERIA, { center: [-5, 41.5], scale: 2000 }, m.lerp([la, po + 16], [0, 1]));
  const slide = 0.86 + 0.14 * m.lerp([la, mx + 6], [0, 1]);
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.01) + 0.03 * m.pulse(mx + 6, 6)} cy={980}>
        <GeoMap cam={cam} colors={{ Spain: { fill: ES_FILL, k: 1, trace: m.lerp([co, co + 20], [0, 1]) }, Portugal: { fill: "#5a9a4a", k: 1, trace: m.lerp([po, po + 20], [0, 1]) } }}>
          <MexicoOnSpain k={slide} o={0.72} cutLat={36.2} />
          <Dust k={m.lerp([mx + 6, mx + 26], [0, 1])} />
          <MapLabel at={[-3.7, 40.2]} text="SPAIN" size={58} k={m.pop(sp)} />
          <MapLabel at={[-8.0, 39.6]} text="PORTUGAL" size={44} k={m.pop(po)} />
        </GeoMap>
      </View>
    </Stage>
  );
};
export default Cover;
