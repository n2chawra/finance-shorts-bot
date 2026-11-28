// "So Spain is the more crowded one, with more people packed onto every bit of its land." The camera pushes onto
// Spain; more figures squeeze in; Madrid and Barcelona glow as clusters on "more"; the figures shuffle shoulder to
// shoulder on "packed"; Spain's border pulses on "land".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Glow, Stage, View, motion } from "../../flat/kit";
import { MapLabel } from "../../flat/map";
import { At, Crowd, ES_FILL, ES_PTS, GeoMap, IBERIA, SEA, between } from "./props";

const Crowded: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const sp = m.at("spain", 2), cr = m.at("crowded", 14), mo = m.at("more", 26), pa = m.at("packed", 40), la = m.at("land", 56);
  const cam = between({ center: [-4, 39.5], scale: 2300 }, { center: [-3.2, 40.2], scale: 2900 }, m.lerp([sp, pa + 10], [0, 1]));
  const shuffle = m.lerp([pa, pa + 10], [0, 1]);
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.01)} cy={980}>
        <GeoMap cam={between(cam, IBERIA, 0)} colors={{ Spain: { fill: ES_FILL, k: 1, trace: m.pulse(la + 10, 14) > 0 ? 1 : 0, traceColor: "#ffd84a" } }}>
          {[[-3.7, 40.42], [2.17, 41.39]].map((c, i) => (
            <At key={i} ll={c as [number, number]}>{(x, y) => <Glow x={x} y={y} r={150} color="#ffd84a" o={0.7 * m.lerp([mo, mo + 10], [0, 1])} />}</At>
          ))}
          <Crowd pts={ES_PTS} color="#c0392b" from={sp - 40} gap={0} t={m.t} s={1.1} jitter={20 - 8 * shuffle} seed="esA" />
          <Crowd pts={ES_PTS.map(([a, b]) => [a + 0.5, b + 0.45] as [number, number]).filter((_, i) => i % 2 === 0)} color="#8e44ad" from={cr} gap={0.6} t={m.t} s={1.1} jitter={12} seed="esB" />
          <Crowd pts={[[-3.9, 40.3], [-3.5, 40.6], [-3.4, 40.2], [1.9, 41.5], [2.3, 41.2], [2.0, 41.7]]} color="#2b6a9a" from={mo} gap={2} t={m.t} s={1.1} jitter={10} seed="cities" />
          <MapLabel at={[-3.7, 39.7]} text="MADRID" size={44} k={m.pop(mo)} />
          <MapLabel at={[2.2, 40.8]} text="BARCELONA" size={44} k={m.pop(mo + 6)} />
        </GeoMap>
      </View>
    </Stage>
  );
};
export default Crowded;
