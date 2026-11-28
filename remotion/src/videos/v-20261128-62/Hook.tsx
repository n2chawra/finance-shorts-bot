// Hook: "यूपी, महाराष्ट्र या असम, सबसे ज़्यादा पड़ोसी किसके हैं?" All of India with UP, Maharashtra and Assam already
// lit at frame 0; each lifts and gets its tag on its name; rings pulse round all three on "सबसे"; the camera pushes in on
// "पड़ोसी" and a question mark stamps between them on "किसके".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { StateTag } from "../../flat/india";
import { AS, F, MH, MID, MapView, OnMap, Question, Ring, UP, lerpFrame } from "./props";

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const up = m.at("up", 2), mh = m.at("mh", 12), as = m.at("as", 22), sa = m.at("sabse", 32), pa = m.at("padosi", 44), ki = m.at("kiske", 56);
  const frame = lerpFrame(F.three, F.mid, m.lerp([pa - 4, pa + 24], [0, 1]));
  const lift = (at: number) => 0.25 + 0.5 * m.pulse(at + 6, 10);
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01) + 0.03 * m.pulse(ki + 2, 6)}>
        <MapView frame={frame} states={{ "Uttar Pradesh": { fill: UP, lift: lift(up) }, Maharashtra: { fill: MH, lift: lift(mh) }, Assam: { fill: AS, lift: lift(as) } }}>
          {[MID["Uttar Pradesh"]!, MID.Maharashtra!, MID.Assam!].map((ll, i) => <Ring key={i} at={ll} k={m.lerp([sa + i * 3, sa + i * 3 + 20], [0, 1])} />)}
          <StateTag state="Uttar Pradesh" text="यूपी" k={Math.max(0.8, m.pop(up, 12))} size={56} dy={-90} />
          <StateTag state="Maharashtra" k={Math.max(0.8, m.pop(mh, 12))} size={52} dy={-80} />
          <StateTag state="Assam" k={Math.max(0.8, m.pop(as, 12))} size={52} dy={-90} />
          <OnMap ll={[84, 21.5]}>{(x, y) => <Question x={Math.min(x, 820)} y={y} k={m.pop(ki, 10)} r={95} />}</OnMap>
        </MapView>
      </View>
    </Stage>
  );
};
export default Hook;
