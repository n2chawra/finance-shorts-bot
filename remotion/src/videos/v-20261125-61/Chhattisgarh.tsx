// "{fact1} नवंबर को मध्य प्रदेश का दक्षिण-पूर्वी हिस्सा अलग होकर बना छत्तीसगढ़।" From all of India the camera glides to
// Madhya Pradesh; a date pin drops on "नवंबर"; the old state pulses on "मध्य"; the cut runs on "दक्षिण-पूर्वी"; the
// south-east lifts off on "अलग" as the camera pushes in; green brushes in on "बना"; its tag pops on "छत्तीसगढ़".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { CutLine, StateTag, type StateFx } from "../../flat/india";
import { AT, BI, CG, DatePin, F, MP, MapView, NEW, OLD, Olds, UP, lerpFrame } from "./props";

type Params = { fig?: { day?: string } };

const Chhattisgarh: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const day = (p.beat.params as Params).fig?.day ?? "";
  const nv = m.at("navambar", 6), mp = m.at("mp", 16), dk = m.at("dakshin", 36), al = m.at("alag", 54), bn = m.at("bana", 66), cg = m.at("cg", 74);
  const glide = m.lerp([0, 20], [0, 1]);
  const push = m.lerp([al, al + 24], [0, 1]);
  const frame = lerpFrame(lerpFrame(F.india, F.mp, glide), F.cg, push);
  const split = m.t >= al;
  const states: Record<string, StateFx> = {};
  if (split) {
    states[MP] = { fill: OLD[MP]! };
    states[CG] = { fill: NEW[CG]!, lift: m.lerp([al, al + 12], [0, 0.9]), paint: m.lerp([bn, bn + 16], [0, 1]), from: AT[CG] };
  }
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01) + 0.03 * m.pulse(mp + 2, 8) + 0.025 * m.pulse(cg + 2, 7)}>
        <MapView frame={frame} states={states} dim={0.5}>
          <Olds fx={{ ...(split ? {} : { [MP]: { lift: 0.15 + 0.35 * m.pulse(mp + 6, 10) } }), [UP]: {}, [BI]: {} }} />
          {split ? null : <CutLine state={CG} parent={MP} k={m.lerp([dk, dk + 20], [0.4, 1])} />}
          <StateTag state={CG} k={m.pop(cg, 12)} size={52} dy={-40} bg="#ffffff" />
          <DatePin at={[83.2, 22.6]} k={m.pop(nv, 12)} day={day} month="नवंबर" t={m.t} dy={-30} />
        </MapView>
        {split && m.t < bn ? <rect x={0} y={0} width={1080} height={1920} fill={NEW[CG]!} opacity={0.12 * m.pulse(al + 3, 6)} data-probe="skip" /> : null}
      </View>
    </Stage>
  );
};

export default Chhattisgarh;
