// Promise: "जवाब, इन दोनों में से कोई नहीं।" The same map; the question mark spins away on "जवाब"; both flags pulse on
// "दोनों"; a red cross stamps on China on "कोई" and on Pakistan on "नहीं" as the camera punches in.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { BorderLine, Neighbour } from "../../flat/india";
import { Cross, F, FlagSign, MapView, N, OnMap, Question, lerpFrame } from "./props";

const Promise: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ja = m.at("jawab", 2), dn = m.at("donon", 14), ko = m.at("koi", 24), na = m.at("nahin", 30);
  const frame = lerpFrame(lerpFrame(F.india, F.north, 0.7), F.north, m.lerp([na, na + 16], [0, 1]));
  const pulse = m.pulse(dn + 4, 8);
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01) + 0.035 * m.pulse(na + 2, 6)}>
        <MapView frame={frame} dim={0.5}>
          <Neighbour name="China" fill={N.China!.fill} flag="China" flagK={0.85} lift={0.2 + 0.5 * pulse} />
          <Neighbour name="Pakistan" fill={N.Pakistan!.fill} flag="Pakistan" flagK={0.85} lift={0.2 + 0.5 * pulse} />
          <BorderLine name="China" k={1} />
          <BorderLine name="Pakistan" k={1} />
          <FlagSign at={N.China!.tag} name="China" label={N.China!.hi} k={1} t={m.t} />
          <FlagSign at={N.Pakistan!.tag} name="Pakistan" label={N.Pakistan!.hi} k={1} t={m.t + 9} />
          <OnMap at={[77.5, 27.5]}>{(x, y) => <Question x={x + 600 * m.lerp([ja, ja + 14], [0, 1])} y={y} k={1 - m.lerp([ja + 8, ja + 14], [0, 1])} r={100} spin={360 * m.lerp([ja, ja + 14], [0, 1])} />}</OnMap>
          <OnMap at={[82.5, 33.5]}>{(x, y) => <Cross x={x} y={y} k={m.pop(ko, 10)} />}</OnMap>
          <OnMap at={[69.5, 29.0]}>{(x, y) => <Cross x={Math.max(x, 160)} y={y} k={m.pop(na, 10)} />}</OnMap>
        </MapView>
      </View>
    </Stage>
  );
};

export default Promise;
