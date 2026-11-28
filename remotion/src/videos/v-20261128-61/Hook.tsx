// Hook: "मुंबई की सीध में दुनिया का कौन-सा बड़ा शहर है?" All of India, Maharashtra painted and Mumbai's pin pulsing at
// frame 0; on "सीध" the line shoots east across India; the camera slides east with it on "दुनिया"; on "बड़ा" it runs
// out over the Bay of Bengal; on "शहर" a question mark stamps at its tip.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { frameOf } from "../../flat/india";
import { IndiaView, LatLine, MH, MUMBAI, OnMap, Pill, Pin, Question, frame, lerpF } from "./props";

export const HOOK_FRAME = (() => { const f = frameOf(["India"], 1080, 1360, 70); return frame(77.5, 21.0, f.scale * 1.5, 120); })();

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const mu = m.at("mumbai", 2), se = m.at("seedh", 14), du = m.at("duniya", 26), ba = m.at("bada", 40), sh = m.at("shahar", 52);
  const f = lerpF(HOOK_FRAME, frame(83, 20.0, 3300, 200), m.lerp([du - 4, du + 26], [0, 1]));
  const tipK = m.lerp([se, ba + 10], [0, 1]);
  const tip = 72.88 + (91 - 72.88) * tipK;
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01) + 0.03 * m.pulse(sh + 2, 6)}>
        <IndiaView f={f} states={{ Maharashtra: { fill: MH, lift: 0.25 + 0.25 * m.pulse(mu + 4, 10) } }}>
          <LatLine a={72.88} b={91} k={tipK} t={m.t} />
          <OnMap ll={MUMBAI}>{(x, y) => (
            <g>
              <Pin x={x} y={y} k={Math.max(0.75, m.pop(mu - 2, 12))} t={m.t} />
              <Pill x={x} y={y - 60} text="मुंबई" k={Math.max(0.8, m.pop(mu, 12))} size={58} dy={-120} />
            </g>
          )}</OnMap>
          <OnMap ll={[tip, 19.08]}>{(x, y) => <Question x={Math.min(x + 40, 850)} y={y - 170} k={m.pop(sh, 10)} r={95} />}</OnMap>
        </IndiaView>
      </View>
    </Stage>
  );
};
export default Hook;
