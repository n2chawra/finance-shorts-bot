// Forests: "ये दोनों तरफ़ के घने जंगलों में रहता है, पश्चिमी घाट में भी, पूर्वोत्तर में भी।" Close on the west coast: the
// green states glow, trees sprout down the Western Ghats on "घाट" with its tag; on "पूर्वोत्तर" the camera pulls back to all
// of India as forest spreads over the north-east hills and a drawn hornbill flies from one belt to the other.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import type { StateFx } from "../../flat/india";
import { Arc, BirdShape, F, Forest, GREEN, MapView, StateTag, doneBefore, lerpFrame, painted, type LL } from "./props";

const GHATS: LL[] = [[73.4, 18.6], [73.8, 16.2], [74.6, 14.0], [75.6, 11.8], [76.6, 9.6], [77.2, 8.6]];
const NE: LL[] = [[92.0, 26.8], [93.6, 27.4], [95.2, 27.8], [94.2, 25.6], [93.0, 24.4], [92.6, 23.2]];

const Forests: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const tf = m.at("tarf", 4), ju = m.at("jungle", 14), gh = m.at("ghat", 30), pu = m.at("purvottar", 52);
  const frame = lerpFrame(lerpFrame(F.india, F.ghats, m.lerp([0, tf + 10], [0.5, 1])), F.india, m.lerp([pu - 2, pu + 20], [0, 1]));
  const glow = 0.3 + 0.4 * m.pulse(tf + 4, 10);
  const states: Record<string, StateFx> = { ...painted(doneBefore("forests")), Kerala: { fill: GREEN, lift: glow }, "Arunachal Pradesh": { fill: GREEN, lift: glow } };
  return (
    <Stage p={p} bg="#0f2e23" vignette={0.3}>
      <View zoom={1.03 + m.wave(70, 0.012)}>
        <MapView t={m.t} frame={frame} states={states}>
          <Forest line={GHATS} k={m.lerp([ju, gh + 16], [0, 1])} n={11} seed="ghats" s={m.t < pu ? 80 : 46} />
          <Forest line={NE} k={m.lerp([pu, pu + 20], [0, 1])} n={9} seed="ne" s={46} />
          <StateTag state="Karnataka" at={[74.6, 14.4]} text="पश्चिमी घाट" k={m.pop(gh + 2, 10)} size={50} bg="#c9f5d6" dy={-90} />
          <StateTag state="Assam" at={[93.4, 26.2]} text="पूर्वोत्तर" k={m.pop(pu + 6, 10)} size={50} bg="#c9f5d6" dy={-110} />
          <Arc a={[76.0, 12.0]} b={[93.4, 26.0]} k={m.t >= pu + 4 ? 1 : 0} dots={false} bow={220} ride={m.lerp([pu + 4, m.end], [0, 1])}>
            {(xy) => <BirdShape x={xy[0]} y={xy[1]} s={120} flap={m.t / 2} c="#2b2b33" rot={-35} casque />}
          </Arc>
        </MapView>
      </View>
    </Stage>
  );
};
export default Forests;
