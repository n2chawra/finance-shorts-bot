// Build: "उत्तराखंड, हिमाचल, हरियाणा, दिल्ली, राजस्थान," UP in gold; each neighbour on its north and west side paints in with
// a link line from UP and its tag on its own word, the counter at the top ticking up for every state (tiny Delhi is lit in
// red, a union territory); the camera pushes in on "दिल्ली" and opens again on "राजस्थान".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { StateTag } from "../../flat/india";
import { Counter, F, Link, MID, MapView, lerpFrame } from "./props";
import { RING, litStates, upStates } from "./upRing";

const RingWest: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const dl = m.at("dl", 40), rj = m.at("rj", 52);
  const frame = m.t < rj - 4 ? lerpFrame(F.north, F.upWest, m.lerp([dl - 6, dl + 16], [0, 1])) : lerpFrame(F.upWest, F.north, m.lerp([rj - 4, rj + 18], [0, 1]));
  const n = litStates(m, "a");
  const last = Math.max(...RING.map((r, i) => (r.beat === "a" && !r.ut && m.t >= m.at(r.ev, 10 + i * 8) ? m.at(r.ev, 10 + i * 8) : -99)));
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.03 + m.wave(70, 0.01)}>
        <MapView frame={frame} states={upStates(m, "a")}>
          {RING.map((r, i) => r.beat === "a" ? <Link key={`l${r.name}`} from={MID["Uttar Pradesh"]!} to={MID[r.name]!} k={m.lerp([m.at(r.ev, 10 + i * 8) - 2, m.at(r.ev, 10 + i * 8) + 10], [0, 1])} color={r.ut ? "#ffb4ac" : "#ffffff"} /> : null)}
          {RING.map((r, i) => r.beat === "a" ? <StateTag key={r.name} state={r.name} text={r.text} k={m.pop(m.at(r.ev, 10 + i * 8), 12)} size={44} dy={r.dy} bg={r.ut ? "#ffd6d0" : "#ffffff"} /> : null)}
          <StateTag state="Uttar Pradesh" text="यूपी" k={1} size={52} dy={0} bg="#fff2a8" />
        </MapView>
      </View>
      <Counter x={540} y={1230} value={String(n)} label="यूपी के पड़ोसी स्टेट" k={1} bump={m.pulse(last + 3, 6)} />
    </Stage>
  );
};
export default RingWest;
