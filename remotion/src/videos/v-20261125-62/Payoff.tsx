// Payoff: "बांग्लादेश, पूरे {fact2}।" Close on Bangladesh: it fills with its flag and lifts on "बांग्लादेश", its flag
// sign planting; on "पूरे" its whole border with India runs bright all the way round and a big length tag stamps on
// with a low hit.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { BorderLine, Neighbour, type StateFx } from "../../flat/india";
import { F, FlagSign, LengthTag, MapView, N } from "./props";

type Params = { fig?: { len?: string } };
const RING: Record<string, string> = { "West Bengal": "#ffc43d", Meghalaya: "#e66aa0", Assam: "#3d8bd9", Tripura: "#b467c9", Mizoram: "#f08a3c" };

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const len = (p.beat.params as Params).fig?.len ?? "";
  const bd = m.at("bd", 2), po = m.at("poore", 18);
  const states: Record<string, StateFx> = Object.fromEntries(Object.entries(RING).map(([s, c]) => [s, { fill: c, k: 0.6 }]));
  return (
    <Stage p={p} bg="#16354d" vignette={0.32}>
      <View zoom={1.04 + m.lerp([0, m.end], [0, 0.04]) + m.wave(80, 0.01) + 0.04 * m.pulse(po + 2, 6)}>
        <MapView frame={F.bd} states={states} dim={0.55}>
          <Neighbour name="Myanmar" fill={N.Myanmar!.fill} flag="Myanmar" k={0.6} />
          <Neighbour name="Bangladesh" fill={N.Bangladesh!.fill} flag="Bangladesh" k={m.lerp([bd, bd + 8], [0.4, 1])} flagK={m.lerp([bd, bd + 12], [0, 1])} lift={m.lerp([bd, bd + 10], [0.3, 0.9]) + 0.3 * m.pulse(84, 10)} />
          <BorderLine name="Bangladesh" k={m.lerp([po, po + 30], [0, 1])} width={16 + 8 * m.pulse(54, 8)} />
          <FlagSign at={[88.4, 22.2]} name="Bangladesh" label={N.Bangladesh!.hi} k={m.pop(bd + 4, 12)} t={m.t} />
          <LengthTag at={[89.9, 25.25]} k={m.pop(po, 10)} text={len} dy={-260} big glow={m.pulse(po + 10, 14) + m.pulse(54, 8)} />
        </MapView>
      </View>
      <rect x={0} y={0} width={1080} height={1920} fill="#ffffff" opacity={0.25 * m.pulse(po + 1, 4)} data-probe="skip" />
    </Stage>
  );
};

export default Payoff;
