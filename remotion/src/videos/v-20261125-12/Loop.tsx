// "New island or new coast: which side would you pick? Because one day, Africa will split in two." The island side
// and the coast side pulse in turn, a pointer swings between them, then the camera pulls back to the whole of Africa,
// its coast traces in light, the crack glows and the frame settles on the hook's own map.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Crack, Island, Map, SeaMarks, WIDE, mix, mixLL } from "./props";
import { RIFTV } from "./Line";

const Pointer: React.FC<{ k: number; swing: number }> = ({ k, swing }) => {
  const at = useAt();
  const a = at([44.5, 4.0]), b = at([32.5, 4.0]);
  if (!a || !b || k <= 0) return null;
  const x = a[0] + (b[0] - a[0]) * swing, y = a[1] - 170;
  return <path d={`M${x},${y + 70} l-40,-70 l80,0 Z`} fill="#ffd36a" stroke={INK} strokeWidth={5} strokeLinejoin="round" opacity={Math.min(1, k)} />;
};

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ne = m.at("new", 2), co = m.at("coast", 24), pi = m.at("pick", 44), be = m.at("below", 58), da = m.at("day", 70), af = m.at("africa", 84), sp = m.at("split", 100), tw = m.at("two", 112);
  const out = m.lerp([da, da + 30], [0, 1]);
  const trace = m.lerp([af, af + 30], [0, 1]);
  const all = ["Egypt", "Sudan", "Libya", "Algeria", "Morocco", "Chad", "Niger", "Mali", "Nigeria", "Ethiopia", "Kenya", "Tanzania", "Somalia", "Dem. Rep. Congo", "Angola", "Namibia", "South Africa", "Mozambique", "Zambia"];
  const fade = 1 - m.lerp([tw, m.end - 4], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.02 + m.wave(90, 0.01)}>
        <Map center={mixLL(RIFTV.center, WIDE.center, out)} scale={mix(RIFTV.scale, WIDE.scale, out)}
          colors={Object.fromEntries(all.map((n) => [n, { fill: "#e2bd7a", k: 0.25, trace }]))}>
          <SeaMarks t={m.t} />
          <Island tint={fade * (0.6 + 0.4 * m.pulse(ne + 6, 12))} />
          <Crack glow={0.5 + m.pulse(sp + 4, 12) + 0.4 * m.pulse(co + 4, 12)} w={9} />
          <Pointer k={m.pop(pi) * (1 - out)} swing={m.pulse(be + 4, 8) * 0.1 + (m.t > pi ? 0.5 + 0.5 * Math.sin((m.t - pi) / 9) : 0)} />
        </Map>
      </View>
    </Stage>
  );
};
export default Loop;
