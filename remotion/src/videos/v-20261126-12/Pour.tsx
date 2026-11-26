// "The sun takes more water from this sea than its rivers bring, so the Atlantic keeps pouring in. So what if that
// door closed?" A hot sun rises over the whole sea and steam curls off it; the Nile and the Rhone glint as they flow
// in; the camera slides to the strait and arrows of Atlantic water pour through; the gap flashes red.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Glow, Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapRoute } from "../../flat/map";
import { GIB, Map, NILE, On, Steam, Stream, Sun } from "./props";

const Pour: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const su = m.at("sun", 4), ta = m.at("takes", 12), wa = m.at("water", 20), ri = m.at("rivers", 40), br = m.at("bring", 52), at = m.at("atlantic", 70), po = m.at("pouring", 86), cl = m.at("closed", 120);
  const west = m.lerp([at - 4, at + 20], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={[16.0 - 20.5 * west, 36.6 - 0.7 * west]} scale={1700 + 5500 * west}>
          <On at={[16.0, 41.8]} draw={(x, y) => <Sun x={x} y={y - 120} r={70} k={m.pop(su, 14) * (1 - west)} t={m.t} />} />
          {[[5.0, 38.5], [18.0, 35.0], [27.0, 33.8]].map((s, i) => <On key={i} at={s as [number, number]} draw={(x, y) => <Steam x={x} y={y} t={m.t} k={m.lerp([ta + i * 3, wa + 6], [0, 1]) * (1 - west)} />} />)}
          <MapRoute via={[[31.2, 27.0], [31.0, 29.0], [31.2, 30.4], NILE]} k={m.lerp([ri, ri + 14], [0, 1])} color="#3f86c9" width={14} dash={false} />
          <MapRoute via={[[4.8, 45.7], [4.8, 44.5], [4.6, 43.5]]} k={m.lerp([ri + 4, ri + 18], [0, 1])} color="#3f86c9" width={14} dash={false} />
          <On at={NILE} draw={(x, y) => <Glow x={x} y={y} r={40} color="#bfe6ff" o={0.9 * m.pulse(br, 14)} />} />
          <On at={[4.6, 43.5]} draw={(x, y) => <Glow x={x} y={y} r={40} color="#bfe6ff" o={0.9 * m.pulse(br + 3, 14)} />} />
          <MapLabel at={[31.3, 29.3]} text="NILE" size={50} k={m.pop(ri, 12) * (1 - west)} />
          <On at={[-6.6, 35.97]} draw={(x, y) => { return <Stream a={[x, y]} b={[x + 300, y]} t={m.t} k={m.lerp([po - 2, po + 8], [0, 1])} />; }} />
          <On at={GIB} draw={(x, y) => <Glow x={x} y={y} r={80} color="#ff5a4a" o={0.9 * m.pulse(cl, 18)} />} />
        </Map>
      </View>
    </Stage>
  );
};
export default Pour;
