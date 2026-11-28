// Promise: "महाराष्ट्र को देखिए, गुजरात, मध्य प्रदेश, छत्तीसगढ़, तेलंगाना, कर्नाटक, गोवा।" Western India; Maharashtra lifts and
// traces on its name, then each neighbour paints in with its tag and a link line from Maharashtra on its own word; the
// camera pushes south on "कर्नाटक" for tiny Goa.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { StateTag } from "../../flat/india";
import { F, MH, MID, MapView, Ring, lerpFrame } from "./props";
import { RingTags, ringStates, type N } from "./RingOf";

const NS: N[] = [
  { name: "Gujarat", ev: "gj", dy: -80 },
  { name: "Madhya Pradesh", ev: "mp", dy: -80 },
  { name: "Chhattisgarh", ev: "cg", dy: 80 },
  { name: "Telangana", ev: "tg", dy: 80 },
  { name: "Karnataka", ev: "ka", dy: 70 },
  { name: "Goa", ev: "goa", dy: -70 },
];

const Maha: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const mh = m.at("mh", 2), ka = m.at("ka", 70);
  const frame = lerpFrame(F.maha, F.mahaSouth, m.lerp([ka - 4, ka + 26], [0, 1]));
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.03 + m.wave(70, 0.01)}>
        <MapView frame={frame} states={ringStates(m, "Maharashtra", MH, NS, mh)}>
          <Ring at={MID.Maharashtra!} k={m.lerp([m.at("kai", 90), m.at("kai", 90) + 20], [0, 1])} r={260} />
          <RingTags m={m} centre="Maharashtra" ns={NS} />
          <StateTag state="Maharashtra" k={1} size={54} dy={-10} bg="#fff2a8" />
        </MapView>
      </View>
    </Stage>
  );
};
export default Maha;
