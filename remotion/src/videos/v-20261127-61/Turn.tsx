// Turn: "कर्नाटक नीलकंठ, तेलंगाना नीलकंठ, ओडिशा भी नीलकंठ! तो दो सिरों वाले स्टेट्स का?" Over the Deccan: Karnataka,
// Telangana and Odisha paint the same roller blue on their names, each with a नीलकंठ tag; on "भी" the real Indian roller
// drops onto the three as a die-cut sticker and the camera pushes in; on "सिरों" it pulls up to all of India and question
// tags blink on Keralam and Arunachal.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Photo } from "../../studio/photo";
import type { StateFx } from "../../flat/india";
import { BLUE, ENDS, F, MapView, ROLLER, SPOT, StateTag, doneBefore, lerpFrame, painted } from "./props";

const Sticker: React.FC<{ k: number; t: number; away: number }> = ({ k, t, away }) => {
  const at = useAt();
  const c = at([79.2, 16.2]);
  if (!c || k <= 0) return null;
  const drop = (1 - Math.min(1, k)) * -300;
  return (
    <g transform={`translate(${c[0]} ${c[1] + 150 + drop}) scale(${1 - 0.45 * away})`} opacity={Math.min(1, k * 2)}>
      <Photo name="roller" s={400} t={t / 30} />
    </g>
  );
};

const Turn: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = ["karnataka", "telangana", "odisha"].map((e, i) => m.at(e, 4 + i * 16));
  const bh = m.at("bhi", 46), si = m.at("sire", 80);
  let frame = lerpFrame(F.south, F.roller, m.lerp([0, t[0]! + 10], [0, 1]));
  frame = lerpFrame(frame, { ...F.roller, scale: F.roller.scale * 1.18 }, m.lerp([bh, bh + 14], [0, 1]));
  frame = lerpFrame(frame, F.mid, m.lerp([si - 2, si + 18], [0, 1]));
  const states: Record<string, StateFx> = {
    ...painted(doneBefore("turn")),
    ...Object.fromEntries(ROLLER.map((s, i) => [s, { fill: BLUE, paint: m.lerp([t[i]!, t[i]! + 12], [0, 1]), trace: m.lerp([t[i]!, t[i]! + 18], [0, 1]), lift: 0.2 + 0.5 * m.pulse(bh + 4 + i * 2, 10) }])),
  };
  return (
    <Stage p={p} bg="#14382b" vignette={0.3}>
      <View zoom={1.02 + m.wave(70, 0.01) + 0.03 * m.pulse(bh + 2, 6)}>
        <MapView t={m.t} frame={frame} states={states}>
          {ROLLER.map((s, i) => <StateTag key={s} state={s} at={SPOT[s]} text="नीलकंठ" k={m.pop(t[i]! + 2, 10)} size={50} bg="#d6e9ff" dy={-50 - (i % 2) * 40} />)}
          <Sticker k={m.pop(bh, 12)} t={m.t} away={m.lerp([si, si + 16], [0, 1])} />
          {ENDS.map((s, i) => <StateTag key={s} state={s} at={SPOT[s]} text="?" k={m.pop(si + 8 + i * 4, 9)} size={60} bg="#ffc43d" dy={-60} />)}
        </MapView>
      </View>
    </Stage>
  );
};
export default Turn;
