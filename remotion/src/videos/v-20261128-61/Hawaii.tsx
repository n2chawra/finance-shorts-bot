// Turn: "पर बीच समंदर में अचानक ज़मीन, अमेरिका का हवाई!" The traveller slows over empty water; on "अचानक" the camera
// punches in on a speck of land; on "ज़मीन" Hawaii's islands rise and trace bright; on "अमेरिका" they fill with the US
// flag; on "हवाई" the name tag pops.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { Land, LatLine, OnMap, Pill, WorldView, frame, lerpF , SeaDefs } from "./props";

const HI: [number, number, number, number] = [-160.8, 18.5, -154.5, 22.5];

const Hawaii: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const be = m.at("beech", 2), ac = m.at("achanak", 18), za = m.at("zameen", 28), am = m.at("america", 36), hw = m.at("hawaii", 48);
  const f = lerpF(frame(-158.5, 19.6, 3000, 230), frame(-156.6, 19.9, 5200, 220), m.lerp([ac - 2, ac + 18], [0, 1]));
  const k = m.t < za ? m.lerp([be, za], [0.55, 0.8]) : m.lerp([za, m.end], [0.8, 1]);
  const rise = m.lerp([za - 4, za + 12], [0, 1]);
  return (
    <Stage p={p} bg="#2f6f9a" vignette={0.3} defs={<SeaDefs t={m.t} />}>
      <View zoom={1.03 + m.wave(70, 0.012) + 0.03 * m.pulse(ac + 4, 6)}>
        <WorldView f={f}>
          <Land name="United States of America" box={HI} fill="#3c3b6e" flag={m.t >= am ? "United States of America" : undefined}
            k={rise} lift={0.4 * rise + 0.3 * m.pulse(am + 6, 10)} trace={m.lerp([za, za + 26], [0, 1])} min={160} />
          <LatLine a={175} b={225} k={k} t={m.t} glow={m.pulse(za + 4, 10)} width={10} ship={1} />
          <OnMap ll={[-155.5, 19.6]}>{(x, y) => (
            <g>
              <Pill x={x} y={y} text="हवाई" k={m.pop(hw, 12)} size={70} dy={-260} />
              <Pill x={x} y={y} text="अमेरिका" k={m.pop(am, 12)} size={48} dy={230} bg="#ffd84a" />
            </g>
          )}</OnMap>
        </WorldView>
      </View>
    </Stage>
  );
};
export default Hawaii;
