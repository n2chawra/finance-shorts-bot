// Payoff: "केरलम और अरुणाचल, दोनों का पक्षी है धनेश, ग्रेट हॉर्नबिल।" All of India: Keralam and Arunachal lift green on
// their names, a bright arc joins them on "दोनों", the real great hornbill drops onto the middle of India on "धनेश" with
// a low hit and the camera pushes in, and both tags turn to धनेश on "ग्रेट".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Flash, Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Photo } from "../../studio/photo";
import type { StateFx } from "../../flat/india";
import { Arc, ENDS, F, GREEN, MapView, SPOT, StateTag, doneBefore, lerpFrame, painted } from "./props";

const Hornbill: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const at = useAt();
  const c = at([81.0, 22.0]);
  if (!c || k <= 0) return null;
  const drop = (1 - Math.min(1, k)) * -320;
  return (
    <g transform={`translate(${c[0]} ${c[1] + 220 + drop})`} opacity={Math.min(1, k * 2)}>
      <Photo name="hornbill" s={500} t={t / 30} />
    </g>
  );
};

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ke = m.at("keralam", 2), ar = m.at("arunachal", 16), dn = m.at("donon", 30), dh = m.at("dhanesh", 46), gr = m.at("great", 58);
  const frame = lerpFrame(F.india, F.mid, m.lerp([dh, dh + 18], [0, 0.6]));
  const states: Record<string, StateFx> = {
    ...painted(doneBefore("payoff")),
    Kerala: { fill: GREEN, paint: m.lerp([ke, ke + 12], [0, 1]), trace: m.lerp([ke, ke + 20], [0, 1]), lift: m.lerp([ke, ke + 10], [0, 0.7]) },
    "Arunachal Pradesh": { fill: GREEN, paint: m.lerp([ar, ar + 12], [0, 1]), trace: m.lerp([ar, ar + 20], [0, 1]), lift: m.lerp([ar, ar + 10], [0, 0.7]) },
  };
  return (
    <Stage p={p} bg="#0f2e23" vignette={0.35}>
      <View zoom={1.02 + m.wave(80, 0.01) + 0.04 * m.pulse(dh + 2, 7)}>
        <MapView t={m.t} frame={frame} states={states} dim={0.55}>
          <Arc a={SPOT.Kerala!} b={SPOT["Arunachal Pradesh"]!} k={m.lerp([dn - 2, dn + 14], [0, 1])} bow={-180} color="#9ff0b8" solid />
          <Hornbill k={m.pop(dh, 12)} t={m.t} />
          {ENDS.map((s, i) => <StateTag key={s} state={s} at={SPOT[s]} text={m.t >= gr ? "धनेश" : i === 0 ? "केरलम" : "अरुणाचल"}
            k={m.pop(i === 0 ? ke : ar, 10) * (1 - 0.25 * m.pulse(gr, 4))} size={54} bg={m.t >= gr ? "#c9f5d6" : "#ffffff"} dy={-70} />)}
        </MapView>
      </View>
      <Flash k={0.5 * m.pulse(dh, 4)} />
    </Stage>
  );
};
export default Payoff;
