// "Spain itself runs from the Pyrenees down to Gibraltar, with Portugal along its western side." Iberia close: Spain
// traces with its flag; peaks rise along the Pyrenees with their label; a pin drops on Gibraltar as the camera pushes
// south; Portugal traces in its own colour and PORTUGAL writes along the west coast.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapPin } from "../../flat/map";
import { At, ES_FILL, GeoMap, IBERIA, SEA, between } from "./props";

const PEAKS: [number, number][] = [[-1.6, 42.85], [-0.6, 42.75], [0.4, 42.7], [1.4, 42.55], [2.3, 42.45]];

const SpainBeat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const sp = m.at("spain", 2), py = m.at("pyrenees", 20), gi = m.at("gibraltar", 38), po = m.at("portugal", 56), we = m.at("western", 70);
  const cam = between(between(IBERIA, { center: [-4.6, 37.6], scale: 3000 }, m.lerp([gi - 4, gi + 16], [0, 1])), IBERIA, m.lerp([po, po + 18], [0, 1]));
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.01)} cy={980}>
        <GeoMap cam={cam} colors={{ Spain: { fill: ES_FILL, k: 1, trace: m.lerp([sp, sp + 24], [0, 1]), flag: "Spain" }, Portugal: { fill: "#5a9a4a", k: m.lerp([po, po + 12], [0, 1]), trace: m.lerp([po, po + 22], [0, 1]), flag: "Portugal" } }}>
          {PEAKS.map((c, i) => (
            <At key={i} ll={c}>{(x, y) => { const k = m.pop(py + i * 3); return k > 0 ? <path d={`M ${x - 34} ${y} L ${x} ${y - 60 * Math.min(1, k)} L ${x + 34} ${y} Z`} fill="#8a7a6a" stroke={INK} strokeWidth={4} /> : null; }}</At>
          ))}
          <MapLabel at={[0.5, 43.6]} text="PYRENEES" size={48} type={m.lerp([py, py + 14], [0, 1])} />
          <MapPin at={[-5.6, 36.01]} k={m.pop(gi)} r={24} />
          <MapLabel at={[-5.5, 35.5]} text="STRAIT OF GIBRALTAR" size={46} type={m.lerp([gi, gi + 14], [0, 1])} />
          <MapLabel at={[-10.6, 39.6]} text="PORTUGAL" size={48} type={m.lerp([we, we + 14], [0, 1])} />
        </GeoMap>
      </View>
    </Stage>
  );
};
export default SpainBeat;
