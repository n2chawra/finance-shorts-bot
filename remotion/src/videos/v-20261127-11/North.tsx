// "Start in Alaska and drive south: through Canada, the United States, Mexico, and down the thin neck of Central
// America." The car sits at the top of the road in Alaska, a pin drops on its start; it drives south with the camera
// following while Canada, the United States and Mexico fill with their flags on their words; then the camera pulls
// back over the narrow land and CENTRAL AMERICA writes on.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapPin } from "../../flat/map";
import { AMap, GapMark, Highway, NORTH_ROAD, OnRoad, SEA_WIDE, Waves, along, between } from "./props";

const North: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const st = m.at("start", 2), al = m.at("alaska", 12), so = m.at("south", 26), ca = m.at("canada", 44), us = m.at("united", 62), mx = m.at("mexico", 84), ne = m.at("neck", 104), ce = m.at("central", 116);
  const k = m.lerp([so, ne + 20], [0, 0.86]);
  const car = along(NORTH_ROAD, k).at;
  const follow = { center: [car[0] + 2, car[1] - 3] as [number, number], scale: 1500 };
  const first = { center: [-140, 62] as [number, number], scale: 1400 };
  const f = between(first, follow, m.lerp([so, so + 20], [0, 1]));
  const cam = between(f, { center: [-90, 14], scale: 1500 }, m.lerp([ne, ne + 26], [0, 1]));
  const usK = Math.max(m.lerp([al, al + 12], [0, 1]), m.lerp([us, us + 12], [0, 1]));
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(70, 0.008)}>
        <AMap center={cam.center} scale={cam.scale} colors={{
          "United States of America": { fill: "#d9b28a", k: usK, flag: "United States of America" },
          Canada: { fill: "#e6a39a", k: m.lerp([ca, ca + 12], [0, 1]), trace: m.lerp([ca, ca + 24], [0, 1]), flag: "Canada" },
          Mexico: { fill: "#b9c98a", k: m.lerp([mx, mx + 12], [0, 1]), trace: m.lerp([mx, mx + 24], [0, 1]), flag: "Mexico" },
        }}>
          <Waves pts={SEA_WIDE} t={m.t} />
          <Highway w={12} />
          <GapMark pulse={0.5 + 0.5 * Math.sin(m.t / 5)} w={10} />
          <MapLabel at={[-90, 16.5]} text="CENTRAL AMERICA" size={56} dy={-40} type={m.lerp([ce, ce + 16], [0, 1])} />
          <MapPin at={[-148.4, 70.2]} k={m.pop(st)} />
          <OnRoad pts={NORTH_ROAD} k={k} t={m.t} s={120} />
        </AMap>
      </View>
    </Stage>
  );
};
export default North;
