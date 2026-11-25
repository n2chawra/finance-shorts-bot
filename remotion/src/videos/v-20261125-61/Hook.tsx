// Hook: "मध्य प्रदेश, उत्तर प्रदेश और बिहार, तीनों एक ही महीने में क्यों कटे?" The old heart of India at frame 0: Madhya
// Pradesh, Uttar Pradesh and Bihar each whole, in one colour; each traces and lifts on its name, a November page drops
// on "महीने", and on "कटे" a red dashed cut starts across Madhya Pradesh as the camera pushes in.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { CutLine, StateTag } from "../../flat/india";
import { CG, F, MP, UP, BI, MapView, MonthPage, Olds, lerpFrame } from "./props";

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const mp = m.at("mp", 2), up = m.at("up", 16), bi = m.at("bihar", 30), ma = m.at("mahine", 50), ka = m.at("kate", 66);
  const push = m.lerp([ka - 6, m.end], [0, 1]);
  const frame = lerpFrame(F.heart, lerpFrame(F.heart, F.mp, 0.5), push);
  const tr = (s: number) => m.lerp([s, s + 22], [0, 1]);
  const lf = (s: number) => 0.15 + 0.5 * m.lerp([s, s + 10], [0, 1]) - 0.3 * m.lerp([s + 18, s + 34], [0, 1]);
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01) + 0.03 * m.pulse(ka + 2, 6)}>
        <MapView frame={frame} dim={0.5}>
          <Olds fx={{ [MP]: { lift: lf(mp), trace: tr(mp) }, [UP]: { lift: lf(up), trace: tr(up) }, [BI]: { lift: lf(bi), trace: tr(bi) } }} />
          <StateTag state={MP} k={m.pop(mp + 2, 12)} size={48} dy={40} />
          <StateTag state={UP} k={m.pop(up + 2, 12)} size={48} dy={-20} />
          <StateTag state={BI} k={m.pop(bi + 2, 12)} size={48} dy={-60} />
          <CutLine state={CG} parent={MP} k={m.lerp([ka, m.end + 30], [0, 1])} />
        </MapView>
      </View>
      <MonthPage x={830} y={250} k={m.pop(ma, 12)} month="नवंबर" t={m.t} size={0.75} />
    </Stage>
  );
};

export default Hook;
