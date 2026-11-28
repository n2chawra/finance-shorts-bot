// Promise: "मुंबई है {fact1} डिग्री नॉर्थ पर। इसी लाइन पर सीधे पूरब चलते हैं।" Close on Mumbai; a latitude signpost rises
// on "डिग्री"; on "इसी" the latitude glows across the map; on "लाइन" the line sets off east as the camera opens to medium;
// the arrow-headed traveller points east on "पूरब" and walks on "चलते".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { SourceLine, Stage, View, motion } from "../../flat/kit";
import { IndiaView, LatLine, MH, MUMBAI, OnMap, LatSign, Pin, frame, lerpF } from "./props";

type Params = { fig?: { lat?: string } };

const PromiseShot: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const lat = (p.beat.params as Params).fig?.lat ?? "";
  const mu = m.at("mumbai", 2), dg = m.at("dg", 14), isi = m.at("isi", 30), li = m.at("line", 40), po = m.at("poorab", 52), ch = m.at("chalte", 60);
  const f = lerpF(frame(74.2, 19.2, 6200, 120), frame(76.8, 19.4, 3600, 180), m.lerp([li - 4, li + 30], [0, 1]));
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.04 + m.wave(90, 0.012)}>
        <IndiaView f={f} states={{ Maharashtra: { fill: MH, lift: 0.3 } }}>
          <LatLine a={66} b={96} k={m.lerp([isi, isi + 12], [0, 1])} t={m.t} head={false} width={4} glow={0.3 * m.pulse(isi + 6, 10)} />
          <LatLine a={72.88} b={80} k={m.lerp([li, m.end], [0.02, 1])} t={m.t} glow={m.pulse(po + 3, 8)} />
          <OnMap ll={MUMBAI}>{(x, y) => (
            <g>
              <Pin x={x} y={y} k={1} t={m.t} r={30 + 6 * m.pulse(mu + 4, 8)} />
              <LatSign x={x + 40} y={y - 20} k={m.pop(dg, 12)} lat={lat} t={m.t} glow={m.pulse(dg + 10, 10) + 0.6 * m.pulse(ch, 10)} />
            </g>
          )}</OnMap>
        </IndiaView>
      </View>
      <SourceLine p={p} y={190} />
    </Stage>
  );
};
export default PromiseShot;
