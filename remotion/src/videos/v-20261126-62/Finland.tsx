// Finland: "फ़िनलैंड, {area}। राजस्थान फिर भी बड़ा।" Vietnam slides away and Finland's blue-cross outline drops in from the
// north onto Rajasthan with snowflakes drifting off it; Rajasthan's edge glows round it and a second tick stamps.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { SeaRipples } from "../../flat/india";
import { Board, F, Laid, MapView, OnMap, Tick, lerpFrame, rj } from "./props";

type Params = { fig?: { area?: string } };
const FLAKES = Array.from({ length: 14 }, (_, i) => [((i * 37) % 13) / 13, ((i * 53) % 11) / 11] as [number, number]);

const Finland: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const area = (p.beat.params as Params).fig?.area ?? "";
  const fi = m.at("finland", 2), ra = m.at("rajasthan", 56), ph = m.at("phir", 64), ba = m.at("bada", 72);
  const frame = lerpFrame(F.nw, F.rj, m.lerp([ra - 4, ra + 20], [0, 0.6]));
  return (
    <Stage p={p} bg="#2a1c12" vignette={0.3}>
      <View zoom={1.02 + m.wave(70, 0.012)}>
        <MapView frame={frame} states={rj({ lift: 0.5, trace: m.lerp([ph, ph + 20], [0, 1]) })}>
          <SeaRipples t={m.t} />
          <Laid name="Vietnam" k={1 - m.lerp([0, fi + 10], [0, 1])} fill="#da251d" flagK={0.72} />
          <Laid name="Finland" k={m.lerp([fi, fi + 24], [0, 1])} fill="#ffffff" flagK={0.8} />
          <OnMap at={[73.8, 28.5]}>{(x, y) => (
            <g data-probe="skip">{FLAKES.map(([a, b], i) => {
              const f = ((m.t + i * 9) % 60) / 60;
              return m.t > ra ? <circle key={i} cx={x - 220 + a * 440} cy={y - 240 + b * 300 + f * 120} r={7} fill="#ffffff" opacity={0.8 * (1 - f)} /> : null;
            })}</g>
          )}</OnMap>
          <OnMap at={[73.2, 26.8]}>{(x, y) => <Tick x={x} y={y} k={m.pop(ba, 10)} />}</OnMap>
        </MapView>
        <Board x={540} y={360} k={m.pop(fi + 6, 12)} title="फ़िनलैंड" value={area} bg="#1e4e8c" />
      </View>
    </Stage>
  );
};
export default Finland;
