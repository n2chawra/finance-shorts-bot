// Ice: "From space, Antarctica is a whole white continent at the bottom of the world, buried under ice so thick it
// hides whole mountain ranges." On "space" the camera dives toward the South Pole; on "white" Antarctica traces in
// light; on "continent" its name writes across the ice; on "bottom" a South Pole pin drops; on "buried" a dome of ice
// swells over it; on "thick" a cut line shows the ice deep over the land; on "mountain" peaks show under the ice.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapPin, useAt } from "../../flat/map";
import { ICE, Stars, World } from "./props";

/** Mountain ranges under the ice, drawn on their spots: grey peaks that show through as the ice thins. */
const Peaks: React.FC<{ k: number; thick: number }> = ({ k, thick }) => {
  const at = useAt();
  const spots: [number, number][] = [[60, -78], [80, -79], [100, -80], [-20, -80], [0, -81], [140, -82], [160, -83], [40, -77]];
  return (
    <g>
      {spots.map((sp, i) => {
        const xy = at(sp);
        if (!xy) return null;
        const h = 70 + (i % 3) * 20;
        return (
          <g key={i} opacity={Math.min(1, k)}>
            <path d={`M ${xy[0] - h * 0.7} ${xy[1]} L ${xy[0]} ${xy[1] - h} L ${xy[0] + h * 0.7} ${xy[1]} Z`} fill="#8a7a6a" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
            <path d={`M ${xy[0] - h * 0.7 - 10} ${xy[1] + 4} Q ${xy[0]} ${xy[1] - h - 40 * thick} ${xy[0] + h * 0.7 + 10} ${xy[1] + 4} Z`} fill={ICE} opacity={0.55 + 0.25 * thick} />
          </g>
        );
      })}
    </g>
  );
};

const Ice: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const sp = m.at("space", 4), wh = m.at("white", 30), cn = m.at("continent", 40), bo = m.at("bottom", 60), bu = m.at("buried", 84), th = m.at("thick", 100), mo = m.at("mountain", 120);
  const dive = m.lerp([sp, sp + 30], [0, 1]);
  return (
    <Stage p={p} bg="#0b1230" vignette={0.4}>
      <Stars t={m.t} />
      <View zoom={1.02 + 0.08 * m.lerp([mo, mo + 14], [0, 1]) + m.wave(90, 0.01)}>
        <World center={[30, -40 - 36 * dive]} scale={340 + 1160 * dive}
          colors={{ Antarctica: { fill: ICE, k: 1, trace: m.lerp([wh, wh + 26], [0, 1]), traceColor: "#bfe6f0", lift: m.lerp([bu, bu + 14], [0, 0.6]) } }}>
          <MapLabel at={[30, -76]} text="ANTARCTICA" size={64} fill="#2a4a6a" type={m.lerp([cn, cn + 18], [0, 1])} />
          <Peaks k={m.lerp([mo, mo + 14], [0, 1])} thick={m.lerp([th, th + 14], [0, 1])} />
          <MapPin at={[30, -86]} k={m.pop(bo, 10)} color="#d9483b" r={26} />
        </World>
      </View>
    </Stage>
  );
};
export default Ice;
