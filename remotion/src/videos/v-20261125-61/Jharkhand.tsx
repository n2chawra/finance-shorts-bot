// "और {fact4} नवंबर को बिहार का दक्षिणी हिस्सा बना झारखंड।" The camera glides east to Bihar on "और"; a date pin drops
// on "नवंबर"; Bihar pulses on "बिहार"; the cut runs and small trees pop up across the south on "दक्षिणी" as the camera
// pushes in; the south lifts off in orange on "बना"; its tag pops on "झारखंड".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { CutLine, StateTag, type StateFx } from "../../flat/india";
import { AT, BI, CG, DatePin, F, JH, MP, MapView, NEW, OLD, Olds, OnMap, Tree, UK, UP, lerpFrame, splitFx } from "./props";

type Params = { fig?: { day?: string } };
const TREES: [number, number][] = [[84.2, 23.9], [85.0, 23.3], [85.9, 23.9], [86.6, 23.2], [84.8, 22.7], [86.2, 24.5], [84.5, 24.4], [85.6, 22.9]];

const Jharkhand: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const day = (p.beat.params as Params).fig?.day ?? "";
  const au = m.at("aur", 2), nv = m.at("navambar", 12), bi = m.at("bihar", 20), dk = m.at("dakshini", 30), bn = m.at("bana", 42), jh = m.at("jh", 50);
  const glide = m.lerp([au, au + 22], [0, 1]);
  const push = m.lerp([dk, dk + 22], [0, 1]);
  const frame = lerpFrame(lerpFrame(lerpFrame(F.up, F.uk, 0.45), F.bi, glide), F.jh, push);
  const split = m.t >= bn;
  const states: Record<string, StateFx> = { ...splitFx([[MP, CG], [UP, UK]], 0.2) };
  if (split) {
    states[BI] = { fill: OLD[BI]! };
    states[JH] = { fill: NEW[JH]!, lift: m.lerp([bn, bn + 12], [0, 0.9]), paint: m.lerp([bn, bn + 14], [0, 1]), from: AT[JH] };
  }
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01) + 0.03 * m.pulse(bi + 2, 8) + 0.025 * m.pulse(jh + 2, 7)}>
        <MapView frame={frame} states={states} dim={0.5}>
          <Olds fx={split ? {} : { [BI]: { lift: 0.15 + 0.35 * m.pulse(bi + 6, 10) } }} />
          {split ? null : <CutLine state={JH} parent={BI} k={m.lerp([dk, bn], [0, 1])} />}
          <g data-probe="skip">
            {TREES.map((ll, i) => <OnMap key={i} at={ll}>{(x, y) => <Tree x={x} y={y} s={64} k={m.pop(dk + i * 2, 12)} t={m.t} />}</OnMap>)}
          </g>
          <StateTag state={JH} k={m.pop(jh, 12)} size={52} dy={-60} />
          <DatePin at={[87.0, 24.6]} k={m.pop(nv, 12)} day={day} month="नवंबर" t={m.t} dy={-40} />
        </MapView>
      </View>
    </Stage>
  );
};

export default Jharkhand;
