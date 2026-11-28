// Build: "मध्य प्रदेश, छत्तीसगढ़, झारखंड और बिहार।" The ring goes on round UP's south and east: each state paints in with its
// link line and tag on its word, the counter ticking on; the camera pans east on "और" and the ring closes on "बिहार".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { StateTag } from "../../flat/india";
import { Counter, F, Link, MID, MapView, lerpFrame } from "./props";
import { RING, litStates, upStates } from "./upRing";

const RingEast: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const au = m.at("aur", 40);
  const frame = lerpFrame(F.north, F.upEast, m.lerp([au - 6, au + 20], [0, 1]));
  const n = litStates(m, "b");
  const last = Math.max(...RING.map((r, i) => (r.beat === "b" && m.t >= m.at(r.ev, 10 + i * 8) ? m.at(r.ev, 10 + i * 8) : -99)));
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.03 + m.wave(70, 0.01)}>
        <MapView frame={frame} states={upStates(m, "b")}>
          {RING.map((r, i) => <Link key={`l${r.name}`} from={MID["Uttar Pradesh"]!} to={MID[r.name]!} k={r.beat === "a" ? 1 : m.lerp([m.at(r.ev, 10 + i * 8) - 2, m.at(r.ev, 10 + i * 8) + 10], [0, 1])} color={r.ut ? "#ffb4ac" : "#ffffff"} />)}
          {RING.map((r, i) => r.beat === "b" ? <StateTag key={r.name} state={r.name} text={r.text} k={m.pop(m.at(r.ev, 10 + i * 8), 12)} size={44} dy={r.dy} /> : null)}
          <StateTag state="Uttar Pradesh" text="यूपी" k={1} size={52} dy={0} bg="#fff2a8" />
        </MapView>
      </View>
      <Counter x={540} y={1230} value={String(n)} label="यूपी के पड़ोसी स्टेट" k={1} bump={m.pulse(last + 3, 6)} />
    </Stage>
  );
};
export default RingEast;
