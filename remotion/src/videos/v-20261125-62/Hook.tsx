// Hook: "चीन या पाकिस्तान, भारत की सबसे लंबी सीमा किसके साथ है?" India between China and Pakistan, both already filled
// with their flags at frame 0; each plants its flag sign on its name; India's name pops on "भारत"; on "लंबी" both
// borders run bright as the camera pushes in; on "किसके" a big question mark stamps between them.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { BorderLine, Neighbour, StateTag } from "../../flat/india";
import { F, FlagSign, MapView, N, OnMap, Question, lerpFrame } from "./props";

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ch = m.at("china", 2), pk = m.at("pak", 12), bh = m.at("bharat", 26), la = m.at("lambi", 40), ki = m.at("kiske", 56);
  const frame = lerpFrame(F.india, F.north, m.lerp([la - 4, m.end], [0, 0.7]));
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01) + 0.03 * m.pulse(ki + 2, 6)}>
        <MapView frame={frame} dim={0.5}>
          <Neighbour name="China" fill={N.China!.fill} flag="China" flagK={0.85} lift={0.2 + 0.3 * m.pulse(ch + 6, 10)} />
          <Neighbour name="Pakistan" fill={N.Pakistan!.fill} flag="Pakistan" flagK={0.85} lift={0.2 + 0.3 * m.pulse(pk + 6, 10)} />
          <BorderLine name="China" k={m.lerp([la, la + 30], [0, 1])} />
          <BorderLine name="Pakistan" k={m.lerp([la, la + 30], [0, 1])} />
          <StateTag state="Madhya Pradesh" text="भारत" k={m.pop(bh, 12)} size={56} dy={0} />
          <FlagSign at={N.China!.tag} name="China" label={N.China!.hi} k={m.pop(ch, 12)} t={m.t} />
          <FlagSign at={N.Pakistan!.tag} name="Pakistan" label={N.Pakistan!.hi} k={m.pop(pk, 12)} t={m.t + 9} />
          <OnMap at={[77.5, 27.5]}>{(x, y) => <Question x={x} y={y} k={m.pop(ki, 10)} r={100} />}</OnMap>
        </MapView>
      </View>
    </Stage>
  );
};

export default Hook;
