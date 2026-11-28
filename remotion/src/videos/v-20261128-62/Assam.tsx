// Build: "और असम को अरुणाचल, नागालैंड, मणिपुर, मिज़ोरम, त्रिपुरा, मेघालय और बंगाल छूते हैं। पर सबसे आगे कौन?" The camera
// sweeps to the north-east; Assam lifts and traces, and its seven neighbours light one by one round it, each with a tag and
// a link line; the camera pushes in on "मिज़ोरम" and opens on "बंगाल"; a question mark pops on "कौन".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { StateTag } from "../../flat/india";
import { AS, F, MapView, OnMap, Question, Ring, MID, lerpFrame } from "./props";
import { RingTags, ringStates, type N } from "./RingOf";

const NS: N[] = [
  { name: "Arunachal Pradesh", ev: "ar", dy: -70, text: "अरुणाचल" },
  { name: "Nagaland", ev: "nl", dy: 0 },
  { name: "Manipur", ev: "mn", dy: 60 },
  { name: "Mizoram", ev: "mz", dy: 160 },
  { name: "Tripura", ev: "tr", dy: 70 },
  { name: "Meghalaya", ev: "ml", dy: -80 },
  { name: "West Bengal", ev: "wb", dy: -70, text: "बंगाल" },
];

const Assam: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const as = m.at("as", 8), mz = m.at("mz", 40), wb = m.at("wb", 70), ch = m.at("chhoote", 80), ka = m.at("kaun", 100);
  const a = lerpFrame(F.three, F.ne, m.lerp([0, as + 6], [0.4, 1]));
  const frame = m.t < wb ? a : lerpFrame(F.ne, F.assam, m.lerp([wb - 4, wb + 22], [0, 1]));
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.03 + m.wave(70, 0.01) + 0.02 * m.pulse(mz + 2, 6)}>
        <MapView frame={frame} states={ringStates(m, "Assam", AS, NS, as)}>
          <Ring at={MID.Assam!} k={m.lerp([ch, ch + 20], [0, 1])} r={200} />
          <RingTags m={m} centre="Assam" ns={NS} size={46} />
          <StateTag state="Assam" at={[91.9, 26.3]} k={m.pop(as, 12) * m.lerp([m.at("nl", 30), m.at("nl", 30) + 8], [1, 0.0])} size={50} dy={-20} bg="#fff2a8" />
          <OnMap ll={[89.2, 27.2]}>{(x, y) => <Question x={Math.max(140, Math.min(x, 820))} y={y - 60} k={m.pop(ka, 10)} r={85} />}</OnMap>
        </MapView>
      </View>
    </Stage>
  );
};
export default Assam;
