// Hook: "केरलम और अरुणाचल, भारत के दो सिरे, फिर भी पक्षी एक क्यों?" All of India at frame 0 with Keralam and Arunachal
// already green; each traces on its name, a dotted arc draws between them on "सिरे", a bird flies along it on "पक्षी" and
// a big question mark stamps on the middle of India as the camera pushes in on "क्यों".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Arc, BirdShape, ENDS, F, GREEN, MapView, Question, SPOT, StateTag, lerpFrame } from "./props";

const Mid: React.FC<{ q: number }> = ({ q }) => {
  const at = useAt();
  const c = at([80.5, 21.5]);
  return c ? <Question x={c[0]} y={c[1]} k={q} r={110} /> : null;
};

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ke = m.at("keralam", 2), ar = m.at("arunachal", 16), si = m.at("sire", 34), pk = m.at("pakshi", 50), ky = m.at("kyon", 62);
  const frame = lerpFrame(F.india, F.mid, m.lerp([ky - 4, ky + 16], [0, 1]));
  const states = {
    Kerala: { fill: GREEN, trace: m.lerp([ke, ke + 22], [0, 1]), lift: 0.3 + 0.4 * m.pulse(ke + 6, 10) },
    "Arunachal Pradesh": { fill: GREEN, trace: m.lerp([ar, ar + 22], [0, 1]), lift: 0.3 + 0.4 * m.pulse(ar + 6, 10) },
  };
  return (
    <Stage p={p} bg="#14382b" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01) + 0.03 * m.pulse(ky + 2, 6)}>
        <MapView t={m.t} frame={frame} states={states} dim={0.5}>
          <Arc a={SPOT.Kerala!} b={SPOT["Arunachal Pradesh"]!} k={m.lerp([si - 4, si + 18], [0, 1])} bow={200}
            ride={m.lerp([pk, m.end], [0, 1])}>
            {(xy) => (pk <= m.t ? <BirdShape x={xy[0]} y={xy[1] - 30} s={130} flap={m.t / 2.2} c="#ffffff" rot={-30} /> : null)}
          </Arc>
          {ENDS.map((s, i) => <StateTag key={s} state={s} at={SPOT[s]} text={i === 0 ? "केरलम" : "अरुणाचल"} k={m.pop(i === 0 ? ke : ar, 10)} size={50} dy={i === 0 ? -80 : -70} />)}
          <Mid q={m.pop(ky, 10)} />
        </MapView>
      </View>
    </Stage>
  );
};
export default Hook;
