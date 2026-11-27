// "It's Kaliningrad, squeezed between Poland and Lithuania. So how did Russia get here?" A pin and KALININGRAD on the
// city; the camera pushes in; Poland fills with its flag to the south, Lithuania with its flag to the east; a
// question mark pops over the piece.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapPin } from "../../flat/map";
import { KALININGRAD, Map, On, PIECE_C, Piece, Pole, QMark } from "./props";

const Between: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ka = m.at("kaliningrad", 6), sq = m.at("squeezed", 22), po = m.at("poland", 34), li = m.at("lithuania", 46), ho = m.at("how", 64), he = m.at("here", 80);
  const push = m.lerp([sq - 2, sq + 20], [0, 1]) - 0.5 * m.lerp([ho - 4, ho + 16], [0, 1]);
  const press = m.lerp([sq, sq + 14], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={[21.8, 54.0 + 0.15 * push]} scale={7000 + 2200 * push} colors={{
          Poland: { fill: "#f1ecec", k: m.lerp([po, po + 14], [0, 1]), lift: 0.15 * press },
          Lithuania: { fill: "#f4d76a", k: m.lerp([li, li + 14], [0, 1]), lift: 0.15 * press },
          Russia: { fill: "#e8d4a2", k: 0 },
        }}>
          <Piece k={1} flagK={1} trace={1} />
          <MapPin at={KALININGRAD} k={m.pop(ka, 12)} />
          <MapLabel at={[KALININGRAD[0] - 0.2, KALININGRAD[1] + 0.42]} text="KALININGRAD" size={56} k={m.pop(ka + 4, 12)} type={m.lerp([ka + 4, ka + 20], [0, 1])} />
          <On at={[21.6, 53.95]} draw={(x, y) => <Pole x={x} y={y} flag="Poland" k={m.pop(po, 12)} t={m.t} />} />
          <On at={[23.4, 54.95]} draw={(x, y) => <Pole x={x} y={y} flag="Lithuania" k={m.pop(li, 12)} t={m.t} />} />
          <MapLabel at={[20.8, 53.5]} text="POLAND" size={56} k={m.pop(po + 6, 12)} />
          <MapLabel at={[23.1, 55.35]} text="LITHUANIA" size={56} k={m.pop(li + 6, 12)} />
          <On at={[PIECE_C[0], PIECE_C[1] + 0.05]} draw={(x, y) => <QMark x={x} y={y - 150 - 30 * m.pulse(he, 10)} size={150} k={m.pop(ho, 12)} t={m.t} />} />
        </Map>
      </View>
    </Stage>
  );
};
export default Between;
