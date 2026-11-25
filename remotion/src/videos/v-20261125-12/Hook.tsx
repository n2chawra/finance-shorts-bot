// Hook: "What if Africa split in two?" The whole of Africa on the old map from frame 0 with a crack glowing down its
// east side; on "Africa" its coast traces in light, on "split" the crack zigzags on south, on "two" the land either
// side tints apart and the camera eases in.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { SourceLine, Stage, View, motion } from "../../flat/kit";
import { Crack, Island, Map, SeaMarks, WIDE, mix, mixLL } from "./props";

export const HOOK_END = { center: [30, 5] as [number, number], scale: 900 };

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const wh = m.at("what", 2), af = m.at("africa", 12), sp = m.at("split", 30), tw = m.at("two", 44);
  const push = m.lerp([tw, m.end], [0, 1]);
  const trace = m.lerp([af, af + 30], [0, 1]);
  const all = ["Egypt", "Sudan", "Libya", "Algeria", "Morocco", "Chad", "Niger", "Mali", "Nigeria", "Ethiopia", "Kenya", "Tanzania", "Somalia", "Dem. Rep. Congo", "Angola", "Namibia", "South Africa", "Mozambique", "Zambia"];
  return (
    <>
      <Stage p={p} bg="#5f9fae" vignette={0.35}>
        <View zoom={1.02 + m.wave(90, 0.01)}>
          <Map center={mixLL(WIDE.center, HOOK_END.center, push)} scale={mix(WIDE.scale, HOOK_END.scale, push)}
            colors={Object.fromEntries(all.map((n) => [n, { fill: "#e2bd7a", k: 0.25, trace }]))}>
            <SeaMarks t={m.t} />
            <Island tint={m.lerp([tw, tw + 12], [0, 1])} />
            <Crack k={m.lerp([0, sp + 18], [0.45, 1])} glow={0.5 + 0.5 * m.pulse(wh + 4, 12) + m.pulse(sp, 10)} w={9} />
          </Map>
        </View>
      </Stage>
      <SourceLine p={p} />
    </>
  );
};
export default Hook;
