// Maldives: "Out in the Indian Ocean lie the Maldives, hundreds of coral islands, none much higher than a house. Every
// one goes under. A whole country, gone." On "Indian" the camera dives into the ocean; on "Maldives" a chain of tiny
// islands traces in light and the name writes on; on "coral" palm trees and houses stand on them; on "house" a house
// stands by a height mark; on "Every" the sea rises over them one by one; on "whole" the flag sinks; on "gone" only
// ripples are left.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Limb, Stage, View, motion } from "../../flat/kit";
import { MapLabel } from "../../flat/map";
import { Isle, Ripples, World } from "./props";

const ISLES: [number, number][] = [[73.4, 6.8], [73.0, 5.6], [73.6, 4.6], [73.3, 3.5], [73.6, 2.2], [73.1, 0.6], [73.2, -0.6], [72.9, 4.1]];
const NEAR = ["India", "Sri Lanka"];

const Maldives: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ind = m.at("indian", 4), ma = m.at("maldives", 20), co = m.at("coral", 40), ho = m.at("house", 70), ev = m.at("every", 84), wh = m.at("whole", 112), go = m.at("gone", 128);
  const dive = m.lerp([ind, ind + 22], [0, 1]);
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.36}>
      <View zoom={1.04 + 0.1 * m.lerp([co, co + 12], [0, 1]) * (1 - m.lerp([go, go + 14], [0, 0.6])) + m.wave(90, 0.01)}>
        <World center={[78 - 4.8 * dive, 8 - 5 * dive]} scale={900 + 7200 * dive} fine only={NEAR}>
          {ISLES.map((a, i) => <Isle key={i} at={a} house={i % 3 === 0 && m.t >= co} s={i === 3 ? 1.3 + 0.2 * m.pop(ho, 10) : 0.9} sink={m.lerp([ev + i * 4, ev + i * 4 + 14], [0, 1])} t={m.t} />)}
          {ISLES.map((a, i) => <Ripples key={`r${i}`} at={a} k={m.lerp([ev + i * 4 + 10, ev + i * 4 + 20], [0, 1])} t={m.t} />)}
          <MapLabel at={[71.2, 4.6]} text="MALDIVES" size={60} fill="#ffffff" type={m.lerp([ma, ma + 16], [0, 1])} />
        </World>
      </View>
      {m.t >= wh ? (
        <g transform={`translate(540 ${760 + 120 * m.lerp([wh, wh + 16], [0, 1])})`} opacity={1 - m.lerp([wh + 8, wh + 18], [0, 1])}>
          <Limb a={[0, 0]} b={[0, -160]} w={8} color={INK} sw={0} />
          <rect x={0} y={-160} width={150} height={100} fill="#d21034" stroke={INK} strokeWidth={5} />
          <rect x={30} y={-140} width={90} height={60} fill="#007e3a" />
        </g>
      ) : null}
    </Stage>
  );
};
export default Maldives;
