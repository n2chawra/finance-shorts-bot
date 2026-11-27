// "By one estimate it roared in at up to {fact6} cubic metres every second, filling the sea within two years." A flow
// gauge pops up by the strait; the water front races east over the salt; the flow figure lands; the needle hits the
// top; the camera pulls back as the flood sweeps across the basin to the far coasts until the sea is blue again.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { Dry, Flood as Water, Gauge, Map } from "./props";

type Params = { fig?: { flow?: string } };

const Flood: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const flow = (p.beat.params as Params).fig?.flow ?? "";
  const es = m.at("estimate", 4), ro = m.at("roared", 20), cu = m.at("cubic", 60), se = m.at("second", 76), fi = m.at("filling", 90), sea = m.at("sea", 104), tw = m.at("two", 118);
  const wide = m.lerp([fi - 6, fi + 22], [0, 1]);
  const k = 0.2 + 0.25 * m.lerp([ro, fi], [0, 1]) + 0.55 * m.lerp([fi, tw + 8], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={[2.0 + 13.0 * wide, 36.0 - 0.4 * wide]} scale={3600 - 2150 * wide}>
          <Dry level={0} t={m.t} glitter={0.4 * (1 - k)} />
          <Water k={k} t={m.t} />
        </Map>
      </View>
      <Gauge x={540} y={560} label="CUBIC METRES A SECOND" value={flow} k={m.pop(es, 12) * (1 - m.lerp([sea, sea + 12], [0, 1]))} needle={m.lerp([cu, se + 6], [0.1, 1])} w={720} />
    </Stage>
  );
};
export default Flood;
