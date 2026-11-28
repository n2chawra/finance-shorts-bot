// India: "महाराष्ट्र, तेलंगाना, छत्तीसगढ़, ओडिशा, और फिर समंदर।" The traveller crosses central India; each state lights on
// its word (Maharashtra traced, the others painted with their tags); on "फिर" it reaches the Odisha coast and on
// "समंदर" runs out over the Bay of Bengal as the camera pulls back.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { stateHi } from "../../flat/india";
import { EAST_COAST, IndiaView, LatLine, MH, OnMap, Pill, frame, lerpF } from "./props";

const STATES: { name: string; ev: string; at: [number, number]; fill: string }[] = [
  { name: "Telangana", ev: "tg", at: [78.6, 18.4], fill: "#e86a8c" },
  { name: "Chhattisgarh", ev: "cg", at: [81.6, 20.6], fill: "#5fb36b" },
  { name: "Odisha", ev: "od", at: [84.2, 20.4], fill: "#7d8de0" },
];

const Across: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const mh = m.at("mh", 2), ph = m.at("phir", 50), sa = m.at("samandar", 58);
  const f = lerpF(frame(79.2, 19.6, 3400, 200), frame(82.5, 19.5, 2100, 240), m.lerp([sa - 4, sa + 24], [0, 1]));
  const k = m.t < ph ? m.lerp([0, ph], [0.12, 0.72]) : m.lerp([ph, m.end], [0.72, 1]);
  const states: Record<string, { fill: string; paint?: number; trace?: number; lift?: number }> = { Maharashtra: { fill: MH, trace: m.lerp([mh, mh + 24], [0, 1]), lift: 0.2 } };
  for (const s of STATES) states[s.name] = { fill: s.fill, paint: m.lerp([m.at(s.ev, 20), m.at(s.ev, 20) + 14], [0, 1]), lift: 0.15 + 0.3 * m.pulse(m.at(s.ev, 20) + 8, 10) };
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.03 + m.wave(70, 0.01)}>
        <IndiaView f={f} states={states}>
          <LatLine a={72.88} b={EAST_COAST + (89 - EAST_COAST) * 1.0} k={k} t={m.t} glow={0.8 * m.pulse(ph + 3, 8)} />
          <OnMap ll={[75.6, 19.9]}>{(x, y) => <Pill x={x} y={y} text={stateHi("Maharashtra")} k={m.pop(mh, 12)} size={50} dy={-120} />}</OnMap>
          {STATES.map((s, i) => (
            <OnMap key={s.name} ll={s.at}>{(x, y) => <Pill x={x} y={y} text={stateHi(s.name)} k={m.pop(m.at(s.ev, 20), 12)} size={50} dy={i % 2 ? -150 : 150} />}</OnMap>
          ))}
          <OnMap ll={[89.8, 15.2]}>{(x, y) => <Pill x={x} y={y} text="बंगाल की खाड़ी" k={m.pop(sa, 12)} size={46} dy={70} bg="#cfeeff" />}</OnMap>
        </IndiaView>
      </View>
    </Stage>
  );
};
export default Across;
