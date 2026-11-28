// Pacific: "फिर चीन का हैनान द्वीप, और आगे खुला प्रशांत महासागर। लाइन रुकेगी कहाँ?" Close on Hainan, which fills with
// China's flag on "चीन" and gets its tag on "हैनान"; on "आगे" the camera pulls back over the whole Pacific, the line
// stretching out over open water with waves drifting under it; on "रुकेगी" a question mark bobs at its tip.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion, rng } from "../../flat/kit";
import { Land, LatLine, OnMap, Pill, Question, WorldView, frame, lerpF , SeaDefs } from "./props";

const HAINAN: [number, number, number, number] = [107.5, 17.5, 111.8, 20.5];

/** Small wave crests on the open ocean, drifting east. */
const Waves: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const r = rng("v61-waves");
  const pts = Array.from({ length: 60 }, () => [116 + r() * 100, 4 + r() * 34] as [number, number]);
  return (
    <g opacity={k} data-probe="skip">
      {pts.map(([lo, la], i) => (
        <OnMap key={i} ll={[lo + ((t * 0.04 + i) % 3), la]}>{(x, y) => (
          <path d={`M ${x - 40} ${y} q 20 -20 40 0 q 20 -20 40 0`} fill="none" stroke="#cfeeff" strokeWidth={7} strokeLinecap="round" opacity={0.35 + 0.3 * Math.sin(t / 9 + i)} />
        )}</OnMap>
      ))}
    </g>
  );
};

const Pacific: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ch = m.at("china", 6), ha = m.at("hainan", 14), aa = m.at("aage", 30), kh = m.at("khula", 38), pr = m.at("prashant", 46), ru = m.at("rukegi", 70);
  const f = lerpF(frame(110.2, 19.3, 7200, 200), frame(172, 19.3, 1250, 220), m.lerp([aa - 2, aa + 36], [0, 1]));
  const k = m.t < aa ? m.lerp([0, aa], [0, 0.08]) : m.lerp([aa, ru], [0.08, 1]);
  return (
    <Stage p={p} bg="#2f6f9a" vignette={0.3} defs={<SeaDefs t={m.t} />}>
      <View zoom={1.03 + m.wave(80, 0.01)}>
        <WorldView f={f}>
          <Land name="China" box={HAINAN} fill="#ee1c25" flag="China" k={m.lerp([ch - 2, ch + 10], [0.35, 1])} lift={0.3 + 0.3 * m.pulse(ch + 6, 10)} trace={m.lerp([ch, ch + 24], [0, 1])} />
          <Waves t={m.t} k={m.lerp([kh - 6, kh + 10], [0, 1]) * (0.7 + 0.3 * m.pulse(pr + 6, 12))} />
          <LatLine a={104} b={200} k={k} t={m.t} glow={m.pulse(kh + 4, 10)} width={10} ship={m.lerp([aa, aa + 14], [0, 1.1])} />
          <OnMap ll={[109.6, 19.2]}>{(x, y) => <Pill x={x} y={y} text="हैनान (चीन)" k={m.pop(ha, 12) * m.lerp([aa + 10, aa + 24], [1, 0])} size={54} dy={-230} />}</OnMap>
          <OnMap ll={[200, 19.08]}>{(x, y) => <Question x={Math.min(x, 830)} y={y - 170 + m.wave(30, 10)} k={m.pop(ru, 10)} r={90} />}</OnMap>
          <OnMap ll={[185, 15]}>{(x, y) => <Pill x={x} y={y} text="प्रशांत महासागर" k={m.pop(pr, 12)} size={64} dy={120} bg="#cfeeff" />}</OnMap>
        </WorldView>
      </View>
    </Stage>
  );
};
export default Pacific;
