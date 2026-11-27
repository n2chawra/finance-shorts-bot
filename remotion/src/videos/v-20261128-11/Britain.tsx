// "Britain draws the first line, back in its empire days, a slice down from the tip of South America." The whole
// continent with the year slider dropping in at the top on 1908; on "line" a ruler line runs out from the pole; on
// "slice" Britain's slice sweeps open and its flag plants; on "tip" the camera pans up to the tip of South America
// and SOUTH AMERICA writes on.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapRoute } from "../../flat/map";
import { AntMap, ClaimFlag, Floes, Name, SA_TIP, SEA, Slices, WHOLE, YearBar, between } from "./props";

const Britain: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const br = m.at("britain", 2), fi = m.at("first", 10), li = m.at("line", 18), yr = m.at("year", 30), sl = m.at("slice", 50), ti = m.at("tip", 66), am = m.at("america", 80);
  const cam = between(WHOLE, SA_TIP, m.lerp([ti, ti + 30], [0, 1]));
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.01)} cy={1060}>
        <AntMap cam={cam}>
          <Floes t={m.t} n={50} />
          <MapRoute via={[[-80, -90], [-80, -60]]} k={m.lerp([li, li + 14], [0, 1])} color="#fff4d0" width={8} />
          <MapRoute via={[[-20, -90], [-20, -60]]} k={m.lerp([li + 6, li + 20], [0, 1])} color="#fff4d0" width={8} />
          <Slices s={{ uk: { k: m.lerp([sl, sl + 18], [0, 1]), glow: m.pulse(sl + 14, 10) } }} />
          <ClaimFlag id="uk" k={m.pop(br)} t={m.t} s={1.1} />
          <Name at={[-66, -42]} text="SOUTH AMERICA" size={58} type={m.lerp([am - 6, am + 10], [0, 1])} />
        </AntMap>
      </View>
      <YearBar year={1908} k={m.pop(fi)} flash={m.pulse(yr + 4, 8)} />
    </Stage>
  );
};
export default Britain;
