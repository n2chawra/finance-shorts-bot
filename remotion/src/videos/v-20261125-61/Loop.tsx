// Loop: "आपका स्टेट कब बना? कमेंट कीजिए। और सोचिए, नक्शे पर" From the hills the camera pulls back to all of India on
// "आपका", the three new states painted; a comment bubble pops on "कब" and bounces on "कमेंट"; on "सोचिए" the new states
// fade back into their old states; on "नक्शे" the camera glides to the hook's first framing (the old heart of India).
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { type StateFx } from "../../flat/india";
import { BI, Bubble, CG, F, JH, MP, MapView, NEW, OLD, Olds, UK, UP, lerpFrame } from "./props";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ap = m.at("aapka", 2), kb = m.at("kab", 12), cm = m.at("comment", 24), so = m.at("sochiye", 40), nk = m.at("nakshe", 52);
  const pull = m.lerp([ap, ap + 26], [0, 1]);
  const back = m.lerp([nk - 4, Math.max(nk + 8, m.end - 2)], [0, 1]);
  const frame = lerpFrame(lerpFrame(lerpFrame(F.up, F.uk, 0.6), F.india, pull), F.heart, back);
  const fade = m.lerp([so, so + 14], [0, 1]);
  const states: Record<string, StateFx> = {
    [MP]: { fill: OLD[MP]! }, [UP]: { fill: OLD[UP]! }, [BI]: { fill: OLD[BI]! },
    [CG]: { fill: NEW[CG]!, lift: 0.3 }, [JH]: { fill: NEW[JH]!, lift: 0.3 }, [UK]: { fill: NEW[UK]!, lift: 0.3 + 0.4 * (1 - pull) },
  };
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01) + 0.02 * m.pulse(cm + 2, 7)}>
        <MapView frame={frame} states={states} dim={0.5}>
          {fade > 0 ? <Olds fx={{ [MP]: { k: fade, lift: 0.15 }, [UP]: { k: fade, lift: 0.15 }, [BI]: { k: fade, lift: 0.15 } }} /> : null}
        </MapView>
      </View>
      <Bubble x={500} y={330} w={640} h={150} k={m.pop(kb, 10) * (1 + 0.12 * m.pulse(cm + 1, 8))} text="आपका स्टेट?" size={60} o={1 - m.lerp([nk, nk + 10], [0, 1])} />
    </Stage>
  );
};

export default Loop;
