// "But the rest of Mexico, laid on Spain: where does it end up?" Back over Spain with Mexico's outline laid on it; its
// south-east tail glows on "rest"; Spain under it pulses; a question mark pops over the tail; on "end" the camera
// slides south-east along the tail toward the sea.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { ES_FILL, GeoMap, MexicoOnSpain, SEA, between } from "./props";

const Q: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const xy = useAt()([-1, 35.2]);
  return xy && k > 0 ? <Txt x={xy[0]} y={xy[1] - 120 + Math.sin(t / 8) * 8} size={150 * Math.min(1, k)} fill="#fff4d0" stroke={INK}>?</Txt> : null;
};

const Tail: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const re = m.at("rest", 4), mx = m.at("mexico", 12), la = m.at("laid", 24), sp = m.at("spain", 34), en = m.at("end", 50);
  const cam = between({ center: [-3, 37.5], scale: 3000 }, { center: [1, 35.5], scale: 2300 }, m.lerp([en - 6, en + 24], [0, 1]));
  const cut = 36.2 - 16 * m.lerp([en, en + 26], [0, 1]);
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.01)} cy={980}>
        <GeoMap cam={cam} colors={{ Spain: { fill: ES_FILL, k: 1, trace: m.lerp([la, la + 20], [0, 1]) } }}>
          <g transform={`translate(0 ${-20 * (1 - m.lerp([mx - 6, mx + 6], [0, 1]))})`}><MexicoOnSpain k={1} o={0.7 + 0.2 * m.pulse(re + 6, 10)} cutLat={cut} /></g>
          <Q k={m.pop(sp)} t={m.t} />
        </GeoMap>
      </View>
    </Stage>
  );
};
export default Tail;
