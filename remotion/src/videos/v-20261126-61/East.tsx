// East: "फिर तमिलनाडु, आंध्र प्रदेश, ओडिशा और पश्चिम बंगाल।" Round the tip and up the Bay of Bengal: each state paints
// in on its name, its coast lights, its tag pops out in the bay; the west coast stays lit behind.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { CoastLine, CoastSurf, SeaRipples, type StateFx } from "../../flat/india";
import { COLOUR, EAST, F, MapView, Tags, WEST, lerpFrame, painted } from "./props";

const EVENTS = ["tn", "ap", "od", "wb"];

const East: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = EVENTS.map((e, i) => m.at(e, 6 + i * 16));
  const low = { center: [F.east.center[0] - 0.4, F.east.center[1] - 2.4] as [number, number], scale: F.east.scale * 1.06 };
  const high = { center: [F.east.center[0] + 0.4, F.east.center[1] + 1.8] as [number, number], scale: F.east.scale * 1.06 };
  const frame = lerpFrame(lerpFrame(F.south, low, m.lerp([0, t[0]! + 10], [0, 1])), high, m.lerp([t[2]! - 6, t[3]! + 14], [0, 1]));
  const states: Record<string, StateFx> = {
    ...painted(WEST),
    ...Object.fromEntries(EAST.map((s, i) => [s, { fill: COLOUR[s]!, paint: m.lerp([t[i]!, t[i]! + 12], [0, 1]), from: [78 + i * 2.5, 9 + i * 4] as [number, number], lift: m.pulse(t[i]! + 6, 12) }])),
  };
  return (
    <Stage p={p} bg="#123049" vignette={0.3}>
      <View zoom={1.02 + m.wave(70, 0.012)}>
        <MapView frame={frame} states={states}>
          <SeaRipples t={m.t} k={1} />
          <CoastSurf t={m.t} />
          {WEST.map((s) => <CoastLine key={s} name={s} k={1} width={9} />)}
          {EAST.map((s, i) => <CoastLine key={s} name={s} k={m.lerp([t[i]! + 2, t[i]! + 18], [0, 1])} width={11} />)}
          <Tags names={EAST} ks={t.map((f) => m.pop(f, 10))} />
        </MapView>
      </View>
    </Stage>
  );
};
export default East;
