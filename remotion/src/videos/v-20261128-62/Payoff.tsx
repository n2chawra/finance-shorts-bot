// Payoff: "पूरे {fact1} स्टेट्स, और दिल्ली भी! ऊपर से नेपाल का बॉर्डर अलग।" UP inside its full ring; the counter board stamps
// the sourced count on "पूरे" (low hit), the ring pulses on "स्टेट्स", Delhi flashes with a "+ दिल्ली" tag; the camera pulls
// back north on "ऊपर", Nepal fills with its flag on "नेपाल" and the UP-Nepal border runs bright on "बॉर्डर".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { SourceLine, Stage, View, motion } from "../../flat/kit";
import { BorderLine, Neighbour, StateTag } from "../../flat/india";
import { Counter, F, Link, MID, MapView, Ring, lerpFrame } from "./props";
import { RING, upStates } from "./upRing";

type Params = { fig?: { n?: string } };

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const n = (p.beat.params as Params).fig?.n ?? "";
  const po = m.at("poore", 2), st = m.at("states", 14), dl = m.at("delhi", 26), oo = m.at("oopar", 44), ne = m.at("nepal", 56), bo = m.at("border", 64);
  const ko = m.at("koi", 90);
  const frame = lerpFrame(lerpFrame(F.north, F.nepal, m.lerp([oo - 4, oo + 22], [0, 1])), F.north, m.lerp([ko - 4, ko + 20], [0, 1]));
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.03 + m.wave(70, 0.01) + 0.03 * m.pulse(po + 2, 6)}>
        <MapView frame={frame} states={upStates(m, "all", 0.5 + 0.3 * m.pulse(st + 4, 10) + 0.3 * m.pulse(ko + 8, 12))}>
          {RING.map((r) => <Link key={r.name} from={MID["Uttar Pradesh"]!} to={MID[r.name]!} k={1} color={r.ut ? "#ffb4ac" : "#ffffff"} />)}
          <Ring at={MID["Uttar Pradesh"]!} k={m.lerp([st, st + 20], [0, 1])} r={360} />
          <Ring at={MID.Delhi!} k={m.lerp([dl, dl + 18], [0, 1])} r={90} color="#e8453c" />
          <StateTag state="Delhi" text="+ दिल्ली" k={m.pop(dl, 12)} size={48} dy={90} bg="#ffd6d0" />
          <Neighbour name="Nepal" fill="#dc143c" flag="Nepal" k={m.lerp([ne - 2, ne + 10], [0, 1])} lift={0.3 * m.pulse(ne + 6, 10)} />
          <BorderLine name="Nepal" k={m.lerp([bo, bo + 26], [0, 1])} />
          <StateTag state="Uttar Pradesh" text="यूपी" k={1} size={52} dy={0} bg="#fff2a8" />
          <StateTag state="Bihar" at={MID.Nepal} text="नेपाल" k={m.pop(ne, 12)} size={50} dy={-80} />
        </MapView>
      </View>
      <Counter x={540} y={1230} value={n} label="यूपी के पड़ोसी स्टेट" k={1} bump={m.pulse(po + 2, 8)} />
      <SourceLine p={p} y={500} />
    </Stage>
  );
};
export default Payoff;
