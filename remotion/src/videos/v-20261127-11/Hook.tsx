// Hook: "Why does the road from Alaska to Argentina stop in Panama?" The whole of the Americas on the old map from
// frame 0, the highway drawn down them with a red break in Panama and a car rolling south; the road flashes,
// ALASKA and ARGENTINA write on with pins, a road-closed barrier drops on the break and Panama traces with its flag
// as the camera pushes in.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { SourceLine, Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapPin, useAt } from "../../flat/map";
import { ALASKA, AMap, ARGENTINA, Barrier, GapMark, Highway, NORTH_ROAD, OnRoad, PANAMA_VIEW, SEA_WIDE, WIDE, Waves, YAVIZA, between } from "./props";

const OnGap: React.FC<{ k: number; s: number }> = ({ k, s }) => {
  const xy = useAt()(YAVIZA);
  return xy ? <Barrier x={xy[0] + 20} y={xy[1] - 10} s={s} k={k} /> : null;
};

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ro = m.at("road", 4), al = m.at("alaska", 14), ar = m.at("argentina", 30), st = m.at("stop", 44), pa = m.at("panama", 52);
  const push = m.lerp([pa, m.end + 6], [0, 0.55]);
  const cam = between(WIDE, PANAMA_VIEW, push);
  return (
    <>
      <Stage p={p} bg="#5f9fae" vignette={0.35}>
        <View zoom={1.02 + m.wave(90, 0.01)}>
          <AMap center={cam.center} scale={cam.scale} colors={{ Panama: { fill: "#e2bd7a", k: m.lerp([pa, pa + 12], [0, 1]), trace: m.lerp([pa, pa + 26], [0, 1]), flag: "Panama" }, Argentina: { fill: "#a8c8e8", k: m.lerp([ar, ar + 12], [0, 1]), flag: "Argentina" } }}>
            <Waves pts={SEA_WIDE} t={m.t} />
            <Highway w={10} flash={m.pulse(ro, 14)} run={m.lerp([ro, ro + 50], [0, 1])} />
            <GapMark pulse={0.5 + 0.5 * Math.sin(m.t / 5)} w={9} />
            <OnRoad pts={NORTH_ROAD} k={m.lerp([0, m.end], [0.08, 0.3])} t={m.t} s={90} />
            <MapPin at={[-148.4, 70.2]} k={m.pop(al)} />
            <MapLabel at={[ALASKA[0] + 12, ALASKA[1] - 4]} text="ALASKA" size={56} type={m.lerp([al, al + 14], [0, 1])} />
            <MapPin at={[-68.3, -54.8]} k={m.pop(ar)} />
            <MapLabel at={ARGENTINA} text="ARGENTINA" size={56} type={m.lerp([ar, ar + 14], [0, 1])} />
            <OnGap k={m.pop(st)} s={150} />
          </AMap>
        </View>
      </Stage>
      <SourceLine p={p} />
    </>
  );
};
export default Hook;
