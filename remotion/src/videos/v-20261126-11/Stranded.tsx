// "Lithuania and Belarus became countries of their own, and Kaliningrad was stranded." Lithuania fills with its flag,
// Belarus with its own green; a border traces round each; the camera turns back to the piece; the road east breaks and
// a gap opens between the piece and Russia.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapRoute } from "../../flat/map";
import { BELARUS, Dial, Map, PIECE_C, Piece, RAIL, Rest } from "./props";

const Stranded: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const li = m.at("lithuania", 2), be = m.at("belarus", 20), co = m.at("countries", 34), ka = m.at("kaliningrad", 56), st = m.at("stranded", 72);
  const back = m.lerp([ka - 4, ka + 18], [0, 1]), close = m.lerp([st - 4, st + 16], [0, 1]);
  const brk = m.lerp([st, st + 14], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={[25.5 - 2.6 * back, 54.0 + 0.2 * back]} scale={4300 + 2200 * back + 1200 * close} colors={{
          Lithuania: { fill: "#f4c430", flag: "Lithuania", k: m.lerp([li, li + 14], [0, 1]), trace: m.lerp([co, co + 22], [0, 1]) },
          Belarus: { fill: BELARUS, k: m.lerp([be, be + 14], [0, 1]), trace: m.lerp([co + 4, co + 26], [0, 1]) },
          Russia: { fill: "#e8d4a2", k: 0 },
        }}>
          <Rest flagK={1} />
          <Piece k={1} flagK={1} trace={1} glow={m.pulse(st + 6, 20)} />
          <MapLabel at={[24.0, 55.45]} text="LITHUANIA" size={54} k={m.pop(li + 6, 12)} />
          <MapLabel at={[27.8, 53.4]} text="BELARUS" size={54} k={m.pop(be + 6, 12)} />
          <MapRoute via={RAIL.slice(0, 2)} k={1} color="#ffe08a" width={12} dash={false} />
          <MapRoute via={RAIL.slice(1)} k={1 - brk} color="#ffe08a" width={12} dash={false} />
          <MapLabel at={[PIECE_C[0], PIECE_C[1] + 0.7]} text="CUT OFF" size={60} fill="#ffd0c8" k={m.pop(st + 4, 12)} />
        </Map>
      </View>
      <Dial pos={2} />
    </Stage>
  );
};
export default Stranded;
