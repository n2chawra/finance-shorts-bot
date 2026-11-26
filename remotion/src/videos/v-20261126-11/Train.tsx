// "Now, to reach Moscow by land, a train from here crosses two other countries first." A train leaves Kaliningrad;
// MOSCOW lights up at the far end; the rails draw on ahead; the train rolls east; a border gate lifts into Lithuania,
// a second into Belarus as the camera pulls back; the train reaches Russia.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapPin, MapRoute } from "../../flat/map";
import { BELARUS, Gate, KALININGRAD, MOSCOW, Map, On, Piece, RAIL, Rest, Train as Loco } from "./props";

const Train: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const re = m.at("reach", 4), mo = m.at("moscow", 16), la = m.at("land", 30), tr = m.at("train", 44), cr = m.at("crosses", 62), tw = m.at("two", 84), fi = m.at("first", 104);
  const wide = m.lerp([tw - 6, tw + 22], [0, 1]);
  const go = m.lerp([re, m.end], [0, 1], (x) => x * x * 0.4 + x * 0.6);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={[24.0 + 5.0 * wide, 54.2 + 0.2 * wide]} scale={5600 - 2700 * wide} colors={{
          Lithuania: { fill: "#f4c430", flag: "Lithuania", k: 0.9 }, Belarus: { fill: BELARUS, k: 0.85 }, Russia: { fill: "#e8d4a2", k: 0 },
        }}>
          <Rest flagK={0.9} />
          <Piece k={1} flagK={1} trace={1} />
          <MapRoute via={RAIL} k={m.lerp([la, la + 40], [0.06, 1])} color="#3b3046" width={10} dash />
          <MapRoute via={RAIL} k={0.02 + 0.98 * go} color="#3b3046" width={0.01} dash={false}
            mover={(x, y, a) => <Loco x={x} y={y - 20} s={80} angle={a} t={m.t} />} />
          <On at={[22.85, 54.82]} draw={(x, y) => <Gate x={x} y={y - 10} s={110} k={m.lerp([cr, cr + 10], [0, 1])} />} />
          <On at={[26.1, 54.35]} draw={(x, y) => <Gate x={x} y={y - 10} s={110} k={m.lerp([tw, tw + 10], [0, 1])} />} />
          <MapPin at={MOSCOW} k={m.pop(mo, 12)} color="#f2b134" />
          <MapLabel at={[MOSCOW[0], MOSCOW[1] + 1.0]} text="MOSCOW" size={56} k={m.pop(mo + 4, 12)} />
          {wide < 0.2 ? <MapLabel at={[KALININGRAD[0] + 1.1, KALININGRAD[1] - 0.45]} text="KALININGRAD" size={50} /> : null}
          <MapLabel at={[24.4, 55.7]} text="LITHUANIA" size={52} k={m.pop(cr + 4, 12)} />
          <MapLabel at={[28.2, 53.2]} text="BELARUS" size={52} k={m.pop(tw + 4, 12)} />
          <MapLabel at={[33.5, 56.4]} text="RUSSIA" size={58} k={m.pop(fi, 12)} />
        </Map>
      </View>
    </Stage>
  );
};
export default Train;
