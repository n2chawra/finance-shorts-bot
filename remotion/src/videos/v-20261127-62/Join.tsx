// Join: "और उसी साल, सिक्किम भारत का नया स्टेट बन गया।" The kingdom's flag on Sikkim folds away on "उसी", Sikkim paints in
// a state's saffron and traces on its name, the camera pulls back to all of India on "नया" with Sikkim lifting into place,
// and a नया स्टेट tag stamps on it on "बन".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { stateColours, INDIA_STATES, type StateFx } from "../../flat/india";
import { Photo } from "../../studio/photo";
import { F, MapView, OnMap, SAFFRON, SIK, StateTag, lerpFrame } from "./props";

const TONES = ["#5fae6a", "#3d8bd9", "#b467c9", "#e66aa0", "#ffc43d", "#2fb5a5", "#c98a4b"];
const COL = stateColours(TONES, INDIA_STATES, 1);

const Join: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const us = m.at("usi", 4), sk = m.at("sikkim", 14), na = m.at("naya", 34), ba = m.at("ban", 44);
  const frame = lerpFrame(F.region, F.india, m.lerp([na - 4, na + 18], [0, 1]));
  const others = m.lerp([na, na + 16], [0, 0.55]);
  const states: Record<string, StateFx> = Object.fromEntries(INDIA_STATES.filter((s) => s !== "Sikkim").map((s) => [s, { fill: COL[s]!, k: others }]));
  states.Sikkim = { fill: m.t < sk ? "#ffc43d" : SAFFRON, paint: m.lerp([sk, sk + 12], [0, 1]), trace: m.lerp([sk, sk + 22], [0, 1]), lift: 0.3 + 0.6 * m.pulse(na + 12, 14) };
  return (
    <Stage p={p} bg="#2a1a14" vignette={0.3}>
      <View zoom={1.03 + m.wave(80, 0.01)}>
        <MapView t={m.t} frame={frame} states={states} dim={0.45}>
          {m.t < us + 14 ? (
            <OnMap ll={SIK}>{(xy) => (
              <g transform={`translate(${xy[0]} ${xy[1] + 60}) scale(1 ${1 - m.lerp([us, us + 12], [0, 1])})`}>
                <Photo name="sikkimflag" s={150} t={m.t / 25} />
              </g>
            )}</OnMap>
          ) : null}
          <StateTag state="Sikkim" at={[88.45, 27.9]} text="सिक्किम" k={m.pop(sk, 10) * (1 - m.lerp([ba - 2, ba + 4], [0, 1]))} size={52} dy={-90} />
          <StateTag state="Sikkim" at={[88.45, 27.9]} text="नया स्टेट" k={m.pop(ba, 10)} size={56} bg="#ffe6c9" dy={-110} />
        </MapView>
      </View>
    </Stage>
  );
};
export default Join;
