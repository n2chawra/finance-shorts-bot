// "Look at the map: every bit of their coast lies inside the Gulf." The camera sweeps along the inner shore on
// "Look"; the three countries glow on "map"; a bright line runs along their whole coast on "coast"; it stays inside,
// ending short of the strait, on "inside"; the Gulf's water darkens like a closed room on "Gulf".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapRoute } from "../../flat/map";
import { Barrier, DayBoard, Gulf } from "./props";

const SHORE: [number, number][] = [[48.0, 29.9], [48.2, 29.0], [48.9, 28.0], [49.8, 26.9], [50.5, 26.2], [50.9, 25.6], [51.2, 26.1], [51.6, 25.9], [51.5, 25.0], [51.8, 24.4]];

const Coast: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const lk = m.at("look", 2), mp = m.at("map", 14), co = m.at("coast", 34), ins = m.at("inside", 52), gu = m.at("gulf", 66), dr = m.at("door", 84);
  const sweep = m.lerp([lk, co + 20], [0, 1]);
  const dark = m.lerp([gu, gu + 14], [0, 1]);
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.36 + 0.3 * dark}>
      <View zoom={1.05 + m.wave(80, 0.01)}>
        <Gulf center={[49.8 + 2.4 * m.lerp([ins - 6, gu + 10], [0, 1]), 27.6 - 1.4 * sweep]} scale={5200 - 1400 * m.lerp([ins - 6, gu + 10], [0, 1])}
          colors={{ Kuwait: { fill: "#4a8f5a", k: 0.6 + 0.4 * m.lerp([mp, mp + 8], [0, 1]) }, Qatar: { fill: "#8a1538", k: 0.6 + 0.4 * m.lerp([mp, mp + 8], [0, 1]) }, Bahrain: { fill: "#ce1126", k: 0.6 + 0.4 * m.lerp([mp, mp + 8], [0, 1]) }, "Saudi Arabia": { fill: "#3a7a4a", k: 0.3 } }}>
          <MapRoute via={SHORE} k={m.lerp([co, ins + 6], [0.02, 1])} color="#ffd84a" width={14} dash={false} />
          <Barrier k={1} glow={Math.max(m.lerp([ins, ins + 10], [0, 0.6]), m.lerp([dr, dr + 8], [0, 1]))} />
          <MapLabel at={[48.0, 29.0]} text="KUWAIT" size={54} />
          <MapLabel at={[51.5, 24.75]} text="QATAR" size={54} />
          <MapLabel at={[52.3, 27.9]} text="THE GULF" size={64} fill="#ffd84a" k={m.lerp([gu, gu + 10], [0, 1])} />
        </Gulf>
      </View>
      <rect x={0} y={0} width={1080} height={1920} fill="#0d1424" opacity={0.25 * dark} />
      <DayBoard day={1} />
    </Stage>
  );
};

export default Coast;
