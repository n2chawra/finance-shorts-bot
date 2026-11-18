// Hook: "Why does Gambia sit inside Senegal, like a worm inside an apple?" The vintage map of West Africa,
// made on screen: Gambia's outline is already drawing itself in frame 0, the river runs in from the sea
// with a boat on it, and on "Gambia" the strip paints red from the river mouth as its name writes on; on
// "Senegal" Senegal's border draws round it and fills green; a worm's eyes peek out of the strip's far end
// on "worm"; the camera settles in on "apple".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Ball, INK, Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapRoute } from "../../flat/map";
import { At, BANJUL, Boat, GREEN, GeoMap, RED, RIVER } from "./props";

/** The hook's map, also the loop's last frame: every part takes how far it has been made (0 -> 1). */
export const WestAfrica: React.FC<{ t: number; outline: number; red: number; label: number; green: number; worm: number; river: number; boat: number; scale?: number }> = ({
  t, outline, red, label, green, worm, river, boat, scale = 9000,
}) => (
  <GeoMap center={[-15.1, 13.9]} scale={scale}
    colors={{ Gambia: { fill: RED, draw: outline, paint: red > 0 ? red : 0.001, from: BANJUL }, Senegal: { fill: GREEN, draw: green, paint: green, from: [-14.4, 14.6] } }}>
    <MapRoute via={RIVER} k={river} color="#2f7fb8" width={9} dash={false} />
    <MapRoute via={RIVER} k={boat} color="rgba(0,0,0,0)" width={1} dash={false} mover={(x, y) => <Boat x={x} y={y - 6} s={40} sail />} />
    <At at={[-13.82, 13.42]}>{(x, y) => worm > 0.01 ? (
      <g transform={`translate(${x + 16} ${y - 4}) scale(${worm})`}>
        <Ball x={0} y={0} r={30} fill="#f28aa0" shadow={false} />
        <Ball x={-9} y={-7} r={9} fill="#ffffff" shadow={false} />
        <Ball x={10} y={-7} r={9} fill="#ffffff" shadow={false} />
        <circle cx={-8 + Math.sin(t / 6) * 2} cy={-6} r={4} fill={INK} />
        <circle cx={11 + Math.sin(t / 6) * 2} cy={-6} r={4} fill={INK} />
      </g>) : null}</At>
    <MapLabel at={[-15.3, 14.05]} text="GAMBIA" size={60} dy={-40} type={label} />
    <MapLabel at={[-14.9, 15.0]} text="SENEGAL" size={68} type={green} />
  </GeoMap>
);

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const gam = m.at("gambia", 8), sen = m.at("senegal", 30), worm = m.at("worm", 60), apple = m.at("apple", 80);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1 + m.lerp([0, worm], [0, 0.04]) + m.lerp([worm, m.end], [0, 0.2])}
        cx={m.lerp([worm, apple + 20], [540, 480])} cy={m.lerp([worm, apple + 20], [960, 975])}>
        <WestAfrica t={m.t}
          outline={1}
          red={m.lerp([0, gam + 14], [0.8, 1])}
          label={1}
          green={m.lerp([0, sen + 20], [0.45, 1])}
          worm={m.pop(worm, 9)}
          river={m.lerp([0, gam + 10], [0.4, 1])}
          boat={m.lerp([0, m.end], [0.04, 0.5])} />
      </View>
    </Stage>
  );
};

export default Hook;
