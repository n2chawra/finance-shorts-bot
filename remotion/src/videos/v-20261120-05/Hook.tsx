// Hook: "What if one passport let you into every place on Earth, because there was only one country left?"
// The political world map; at frame 0 a passport is already landing on it. Pins pop up on every continent on
// "place", the camera pulls back on "Earth", the flags fold down on "only", and on "country" an eraser sweeps
// west to east rubbing out every border as the colours melt into one, finished on "left".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { Eraser, Passport, PoleFlag, Spot, World, merged } from "./props";

export const FLAGS: { name: string; at: [number, number] }[] = [
  { name: "Brazil", at: [-51, -10] }, { name: "United States of America", at: [-100, 40] }, { name: "Nigeria", at: [8, 9.5] },
  { name: "France", at: [2.5, 46.5] }, { name: "India", at: [79, 22] }, { name: "China", at: [104, 34] }, { name: "Japan", at: [138.5, 36.5] }, { name: "Canada", at: [-105, 57] },
];
const PINS: [number, number][] = [[-60, -15], [20, 5], [90, 50], [-95, 45], [135, -25]];

/** The hook's picture; the loop ends on it at its frame-0 values. */
export const HookPic: React.FC<{ t: number; back: number; drop: number; pins: number; down: number; sweep: number; eraser: number }> = ({ t, back, drop, pins, down, sweep, eraser }) => {
  const scale = 520 - 220 * back;
  const ex = 1080 * Math.max(0, Math.min(1, (sweep + 190) / 390));
  return (
    <g>
      <World center={[10 - 5 * back, 22 - 6 * back]} scale={scale} merge={merged(sweep)}>
        {FLAGS.map((f, i) => <PoleFlag key={f.name} at={f.at} name={f.name} k={1} down={down * (1 + i * 0.08)} s={0.9 + 0.3 * (1 - back)} t={t} />)}
        {PINS.map((at, i) => <Spot key={i} at={at} name="" k={Math.max(0, Math.min(1, pins * 5 - i))} color="#d9483b" />)}
      </World>
      <Eraser x={ex} y={900} k={eraser} t={t} />
      <g transform={`translate(0 ${(1 - drop) * -500})`} opacity={Math.min(1, drop * 3)}>
        <Passport x={540} y={600} s={190 - 50 * back} rot={-8 + 8 * drop} />
      </g>
    </g>
  );
};

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const pl = m.at("everywhere", 25), ea = m.at("earth", 55), on = ea + 8, co = m.at("one", 75), lf = m.at("country", 90);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.32}>
      <View zoom={1.02 + m.wave(70, 0.012)}>
        <HookPic t={m.t}
          back={m.lerp([ea - 4, ea + 16], [0, 1])}
          drop={m.lerp([0, 12], [0.8, 1])}
          pins={m.lerp([pl, pl + 14], [0, 1])}
          down={m.lerp([on, on + 16], [0, 1])}
          sweep={m.lerp([co - 4, lf + 14], [-190, 200], (x) => x)}
          eraser={m.lerp([co - 6, co], [0, 1]) * (1 - m.lerp([lf + 12, lf + 16], [0, 1]))} />
      </View>
    </Stage>
  );
};

export default Hook;
