// "Its north-west corner, Baja California, hangs out over the Atlantic beyond Portugal." Mexico laid on Spain; the
// camera slides to its north-west corner; the Baja arm glows and BAJA CALIFORNIA writes along it; waves ripple under
// it in the ocean; ATLANTIC writes on the sea; Portugal's coast flashes beside it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { ES_FILL, GeoMap, MexicoOnSpain, SEA, between } from "./props";

// Baja's arm once Mexico is laid on Spain (its centroid on Spain's): about 12-14° west and 5-8° north of Madrid
const BAJA_ON: [number, number] = [-15.5, 44.5];

const Ripples: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const xy = useAt()(BAJA_ON);
  if (!xy || k <= 0) return null;
  return (
    <g opacity={k} data-probe="skip">
      {[0, 1, 2].map((i) => {
        const r = ((t * 2 + i * 60) % 180) + 60;
        return <ellipse key={i} cx={xy[0]} cy={xy[1]} rx={r * 1.6} ry={r} fill="none" stroke="#d8efe9" strokeWidth={6} opacity={1 - r / 240} />;
      })}
    </g>
  );
};

const Baja: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const co = m.at("corner", 2), ba = m.at("baja", 12), ca = m.at("california", 22), ha = m.at("hangs", 34), at = m.at("atlantic", 50), po = m.at("portugal", 64);
  const cam = between({ center: [-8, 42], scale: 2400 }, { center: [-14, 44.5], scale: 3300 }, m.lerp([co, ba + 20], [0, 1]));
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.01)} cy={980}>
        <GeoMap cam={cam} colors={{ Spain: { fill: ES_FILL, k: 1 }, Portugal: { fill: "#5a9a4a", k: 1, trace: m.lerp([po, po + 20], [0, 1]) } }}>
          <Ripples t={m.t} k={m.lerp([ha, ha + 10], [0, 1])} />
          <MexicoOnSpain k={1} o={0.72 + 0.2 * m.pulse(ba + 6, 10)} cutLat={36.2} />
          <MapLabel at={[-14.5, 47.4]} text="BAJA CALIFORNIA" size={48} type={m.lerp([ca, ca + 16], [0, 1])} />
          <MapLabel at={[-17.5, 41.2]} text="ATLANTIC" size={52} fill="#e8f4fa" type={m.lerp([at, at + 12], [0, 1])} />
        </GeoMap>
      </View>
    </Stage>
  );
};
export default Baja;
