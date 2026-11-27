// "It's the Pan-American Highway: about 30,000 kilometres of road, one line down two continents." From the push onto
// Panama the camera drifts north over Mexico where a green highway sign rises beside the line, its name writing on
// and the length counting up; then it pulls back to the whole road, a light runs down it from Alaska to Argentina
// and NORTH AMERICA and SOUTH AMERICA write on.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, countText, motion } from "../../flat/kit";
import { MapLabel } from "../../flat/map";
import { AMap, GapMark, Highway, PANAMA_VIEW, SEA_WIDE, Shield, WIDE, Waves, between } from "./props";

type Params = { fig?: { length?: string } };

const MEXICO = { center: [-97, 16] as [number, number], scale: 1500 };

const HighwayBeat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const len = (p.beat.params as Params).fig?.length ?? "";
  const pn = m.at("pan-american", 4), hw = m.at("highway", 14), ro = m.at("road", 40), li = m.at("line", 56), tw = m.at("two", 70), co = m.at("continents", 80), ab = m.at("about", 44), km = m.at("kilometres", 66);
  const t = m.t;
  const start = between(WIDE, PANAMA_VIEW, 0.55);
  const toMex = m.lerp([0, li], [0, 1]);
  const back = m.lerp([li, li + 30], [0, 1]);
  const a = between(start, MEXICO, toMex);
  const cam = between(a, WIDE, back);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.008)}>
        <AMap center={cam.center} scale={cam.scale}>
          <Waves pts={SEA_WIDE} t={m.t} />
          <Highway w={10} run={m.lerp([li, li + 50], [0, 1])} flash={m.pulse(li, 16)} />
          <GapMark pulse={0.5 + 0.5 * Math.sin(m.t / 5)} w={9} />
          <MapLabel at={[-104, 52]} text="NORTH AMERICA" size={60} type={m.lerp([tw, tw + 14], [0, 1])} />
          <MapLabel at={[-62, -14]} text="SOUTH AMERICA" size={60} type={m.lerp([co, co + 14], [0, 1])} />
        </AMap>
      </View>
      <g opacity={1 - back}>
        <Shield x={540} y={720} k={m.pop(pn)} name={m.lerp([hw, hw + 16], [0, 1])} value={`${countText(len, m.lerp([ab, ro], [0, 1]))}${t >= km ? " KM" : ""}`} bounce={m.pulse(ro, 10)} />
      </g>
    </Stage>
  );
};
export default HighwayBeat;
