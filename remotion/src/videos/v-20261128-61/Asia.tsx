// Asia: "म्यांमार, थाईलैंड, लाओस, वियतनाम, सब इसी लाइन पर। पर शहर अभी दूर है।" East of the Bay of Bengal the line lands on
// four countries, each filling with its whole flag on its name; the camera pans east on "लाओस"; on "सब" the flags pulse
// together, on "लाइन" the line glows, on "दूर" its tip runs on past Vietnam's coast.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { Neighbour } from "../../flat/india";
import { IndiaView, Land, LatLine, OnMap, Pill, frame, lerpF } from "./props";

const C: { name: string; ev: string; fill: string; tag: [number, number]; hi: string; dy: number }[] = [
  { name: "Myanmar", ev: "mm", fill: "#34b233", tag: [95.6, 21.6], hi: "म्यांमार", dy: -200 },
  { name: "Thailand", ev: "th", fill: "#2d2a4a", tag: [99.8, 16.5], hi: "थाईलैंड", dy: 170 },
  { name: "Laos", ev: "la", fill: "#ce1126", tag: [102.6, 20.6], hi: "लाओस", dy: -190 },
  { name: "Vietnam", ev: "vn", fill: "#da251d", tag: [105.6, 17.2], hi: "वियतनाम", dy: 190 },
];

const Asia: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const la = m.at("la", 30), sab = m.at("sab", 46), li = m.at("line", 56), dur = m.at("door", 80);
  const f = lerpF(frame(96.8, 19.2, 3000, 220), frame(102.2, 19.2, 3100, 220), m.lerp([la - 6, la + 30], [0, 1]));
  const k = m.t < dur ? m.lerp([0, dur], [0, 0.85]) : m.lerp([dur, dur + 24], [0.85, 1]);
  const all = m.pulse(sab + 6, 10);
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.03 + m.wave(75, 0.01)}>
        <IndiaView f={f} dim={0.5}>
          {C.map((c) => {
            const on = m.at(c.ev, 10);
            const kk = m.lerp([on - 2, on + 10], [0, 1]);
            return c.name === "Myanmar"
              ? <Neighbour key={c.name} name="Myanmar" fill={c.fill} flag="Myanmar" k={kk} lift={0.2 + 0.4 * m.pulse(on + 6, 10) + 0.3 * all} />
              : <Land key={c.name} name={c.name} fill={c.fill} flag={c.name} k={kk} lift={0.2 + 0.4 * m.pulse(on + 6, 10) + 0.3 * all} trace={m.lerp([on, on + 24], [0, 1])} />;
          })}
          <LatLine a={88} b={112} k={k} t={m.t} glow={m.pulse(li + 4, 10)} width={10} />
          {C.map((c) => <OnMap key={`t${c.name}`} ll={c.tag}>{(x, y) => <Pill x={x} y={y} text={c.hi} k={m.pop(m.at(c.ev, 10), 12)} size={52} dy={c.dy} />}</OnMap>)}
        </IndiaView>
      </View>
    </Stage>
  );
};
export default Asia;
