// Loop: "अपने स्टेट के पड़ोसी गिनिए, और कमेंट कीजिए। फिर देखिए," All of India; every state's border flashes white in a wave on
// "पड़ोसी", small dots pop on states one after another on "गिनिए", a comment bubble on "कमेंट"; the dots fade on "फिर", and on
// "देखिए" UP, Maharashtra and Assam light again, the picture the hook opens on.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { INDIA_STATES, StateTag, type StateFx } from "../../flat/india";
import { AS, Bubble, F, MH, MapView, UP, lerpFrame } from "./props";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ap = m.at("apne", 2), pa = m.at("padosi", 10), gi = m.at("ginie", 20), co = m.at("comment", 32), ph = m.at("phir", 46), dk = m.at("dekhiye", 54);
  const frame = m.t < ph ? lerpFrame(F.north, F.india, m.lerp([ap, ap + 22], [0, 1])) : lerpFrame(F.india, F.three, m.lerp([ph, m.end], [0, 1]));
  const states: Record<string, StateFx> = {};
  INDIA_STATES.forEach((s, i) => {
    const w = pa + (i % 12) * 2;
    if (m.t > w - 2 && m.t < w + 14) states[s] = { fill: "#f1e6cf", trace: m.lerp([w, w + 10], [0, 1]), traceColor: "#ffffff" };
  });
  const back = m.lerp([dk - 4, dk + 10], [0, 1]);
  if (back > 0) Object.assign(states, { "Uttar Pradesh": { fill: UP, paint: back, lift: 0.25 }, Maharashtra: { fill: MH, paint: back, lift: 0.25 }, Assam: { fill: AS, paint: back, lift: 0.25 } });
  const dots = ["Rajasthan", "Gujarat", "Karnataka", "Odisha", "Punjab", "Tamil Nadu", "West Bengal", "Bihar"];
  const fade = m.lerp([ph, ph + 10], [1, 0]);
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01)}>
        <MapView frame={frame} states={states}>
          {dots.map((s, i) => <StateTag key={s} state={s} text="?" k={m.pop(gi + i * 3, 12) * fade} size={44} dy={0} bg="#ffd84a" />)}
        </MapView>
      </View>
      <Bubble x={470} y={330} k={m.pop(co, 12) * fade} text="आपके कितने?" />
    </Stage>
  );
};
export default Loop;
