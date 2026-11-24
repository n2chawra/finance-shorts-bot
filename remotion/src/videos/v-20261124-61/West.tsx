// West: "महाराष्ट्र एम एच, गुजरात जी जे, कर्नाटक के ए, केरल के एल।" The camera slides down the west coast; Maharashtra,
// Gujarat, Karnataka and Kerala paint in on their names with their plates, the north's plates still standing behind.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { CODES, COLOUR, F, MapView, OldPlates, Plate, WEST, doneBefore, lerpFrame, painted } from "./props";
import type { StateFx } from "../../flat/india";

const EVENTS = ["mh", "gj", "ka", "kl"];
const AT: Record<string, [number, number]> = { Maharashtra: [75.8, 19.6], Gujarat: [71.6, 22.8], Karnataka: [75.9, 14.6], Kerala: [76.3, 10.2] };

const West: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = EVENTS.map((e, i) => m.at(e, 4 + i * 22));
  const before = doneBefore("west");
  const lower = { center: [F.west.center[0], F.west.center[1] - 2.2] as [number, number], scale: F.west.scale * 1.12 };
  const frame = lerpFrame(lerpFrame(F.north, F.west, m.lerp([0, t[0]! + 8], [0.25, 1])), lower, m.lerp([t[2]! - 4, t[3]! + 10], [0, 1]));
  const states: Record<string, StateFx> = {
    ...painted(before),
    ...Object.fromEntries(WEST.map((s, i) => [s, { fill: COLOUR[s]!, paint: m.lerp([t[i]!, t[i]! + 12], [0, 1]), lift: m.pulse(t[i]! + 6, 12) }])),
  };
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.wave(66, 0.012)}>
        <MapView frame={frame} states={states}>
          <OldPlates names={before} size={0.75} />
          {WEST.map((s, i) => <Plate key={s} at={AT[s]} text={CODES[s]!} k={m.pop(t[i]!, 10)} size={1.1} glow={m.pulse(t[i]! + 2, 14)} />)}
        </MapView>
      </View>
    </Stage>
  );
};

export default West;
