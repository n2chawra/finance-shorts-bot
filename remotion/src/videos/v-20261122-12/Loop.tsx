// Loop: "Netherlands or Florida: which new coastline surprised you more? Tell me below, before Antarctica's ice melts,
// all of it." The flooded world from space: on "Netherlands" it glows, on "Florida" Florida glows; on "coastline" the
// new coasts trace blue; on "Tell" a comment bubble pops; on "before" the water drains off the map; on "melts" the
// ice cap of Antarctica is white again, as in the first frame.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { MapLabel } from "../../flat/map";
import { FLORIDA, ICE, NEW_SEA, Shape, Stars, World, iceColor } from "./props";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ne = m.at("netherlands", 2), fl = m.at("florida", 16), co = m.at("coastline", 28), te = m.at("tell", 60), be = m.at("before", 76), me = m.at("melts", 96);
  const drain = m.lerp([be, be + 20], [0, 1]);
  const glowN = Math.max(m.pulse(ne + 6, 10), 0), glowF = m.pulse(fl + 6, 10);
  const bub = m.pop(te, 10) * (1 - m.lerp([be + 6, be + 14], [0, 1]));
  const home = m.lerp([be, me + 10], [0, 1]);
  return (
    <Stage p={p} bg="#0b1230" vignette={0.4}>
      <Stars t={m.t} />
      <View zoom={1.04 + 0.06 * (1 - home) + m.wave(90, 0.01)}>
        <World center={[10 + 30 * home, 20 - 28 * home]} scale={360 - 60 * home}
          colors={{ Netherlands: { fill: glowN > 0.2 ? "#ffd84a" : NEW_SEA, k: 1 - drain }, Bangladesh: { fill: NEW_SEA, k: 1 - drain },
            Antarctica: { fill: drain > 0 ? iceColor(1 - drain) : "#9aa6ad", k: 1, trace: m.lerp([me, me + 16], [0, 1]), traceColor: "#bfe6f0" } }}>
          <Shape pts={FLORIDA} fill={glowF > 0.2 ? "#ffd84a" : NEW_SEA} k={0.9 * (1 - drain)} stroke="#9fd3e0" sw={4} />
          <MapLabel at={[40, -80]} text="ANTARCTICA" size={56} fill={ICE} k={m.lerp([me, me + 10], [0, 1])} />
        </World>
        {co > 0 ? <rect x={0} y={0} width={1080} height={1920} fill="#7fd0e6" opacity={0.1 * m.pulse(co + 8, 12)} /> : null}
      </View>
      {bub > 0 ? (
        <g transform={`translate(540 520) scale(${bub})`}>
          <rect x={-300} y={-90} width={600} height={150} rx={40} fill="#ffffff" stroke={INK} strokeWidth={7} />
          <path d="M -40 58 L -70 120 L 10 58 Z" fill="#ffffff" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          <Txt x={0} y={-16} size={50} fill={INK}>NETHERLANDS or FLORIDA?</Txt>
        </g>
      ) : null}
    </Stage>
  );
};
export default Loop;
