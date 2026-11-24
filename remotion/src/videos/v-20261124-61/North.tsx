// North: "दिल्ली डी एल, पंजाब पी बी, उत्तर प्रदेश यू पी, बिहार बी आर।" The camera settles on the north; Delhi, Punjab,
// Uttar Pradesh and Bihar paint in one by one on their names, each plate dropping onto its state, the camera drifting east.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { CODES, COLOUR, F, MapView, NORTH, Plate, lerpFrame, type Frame } from "./props";
import type { StateFx } from "../../flat/india";

const EVENTS = ["delhi", "punjab", "up", "bihar"];
/** where each plate stands (Delhi's beside the tiny territory so it can be read) */
const AT: Record<string, [number, number]> = { Delhi: [77.1, 29.9], Punjab: [75.4, 31.0], "Uttar Pradesh": [80.6, 27.0], Bihar: [85.6, 25.9] };

const North: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = EVENTS.map((e, i) => m.at(e, 4 + i * 22));
  const eastward: Frame = { center: [F.north.center[0] + 1.6, F.north.center[1]], scale: F.north.scale };
  const frame = lerpFrame(lerpFrame(F.india, F.north, m.lerp([0, t[0]! + 10], [0.3, 1])), eastward, m.lerp([t[2]!, m.end], [0, 1]));
  const states: Record<string, StateFx> = Object.fromEntries(NORTH.map((s, i) => [s, {
    fill: COLOUR[s]!, paint: m.lerp([t[i]!, t[i]! + 12], [0, 1]), lift: m.pulse(t[i]! + 6, 12),
  }]));
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.wave(70, 0.012)}>
        <MapView frame={frame} states={states}>
          {NORTH.map((s, i) => <Plate key={s} at={AT[s]} text={CODES[s]!} k={m.pop(t[i]!, 10)} size={1.1} glow={m.pulse(t[i]! + 2, 14)} />)}
        </MapView>
      </View>
    </Stage>
  );
};

export default North;
