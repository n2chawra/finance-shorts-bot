// Promise: "नवंबर, सन दो हज़ार। हर एक के अंदर से एक नया स्टेट कटकर निकला। पर कैसे?" The November page flips big; the
// camera pulls back to all of India; on "हर" a cut line draws inside each old state; on "नया" the three pieces glow
// white; on "निकला" they lift off together; on "कैसे" a question mark pops over each.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { CutLine, type StateFx } from "../../flat/india";
import { AT, F, MapView, MonthPage, OLD, OnMap, Olds, PAIRS, Question, lerpFrame } from "./props";

const Promise: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const nv = m.at("navambar", 2), sa = m.at("san", 14), ha = m.at("har", 34), na = m.at("naya", 60), ni = m.at("nikla", 74), ks = m.at("kaise", 86);
  const pull = m.lerp([sa, sa + 30], [0, 1]);
  const frame = lerpFrame(lerpFrame(F.heart, F.mp, 0.5), F.india, pull);
  const out = m.t >= ni;
  const lift = m.lerp([ni, ni + 14], [0, 1]);
  const states: Record<string, StateFx> = {};
  if (out) for (const [o, n] of PAIRS) { states[o] = { fill: OLD[o]! }; states[n] = { fill: "#ffffff", lift: 0.3 + 0.7 * lift }; }
  const glow = m.lerp([na, na + 10], [0, 1]);
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01) + 0.025 * m.pulse(ni + 3, 7)}>
        <MapView frame={frame} states={states} dim={0.5}>
          {out ? null : <Olds fx={Object.fromEntries(PAIRS.map(([o]) => [o, {}]))} />}
          {PAIRS.map(([o, n], i) => (out ? null : <CutLine key={n} state={n} parent={o} k={i === 0 ? Math.max(0.35, m.lerp([ha, ha + 24], [0.35, 1])) : m.lerp([ha + i * 6, ha + i * 6 + 24], [0, 1])} />))}
          {!out && glow > 0 ? PAIRS.map(([, n]) => <OnMap key={n} at={AT[n]!}>{(x, y) => <circle cx={x} cy={y} r={60 + 20 * m.wave(20, 1)} fill="#ffffff" opacity={0.55 * glow} data-probe="skip" />}</OnMap>) : null}
          {PAIRS.map(([, n], i) => <OnMap key={`q${n}`} at={AT[n]!}>{(x, y) => <Question x={x} y={y - 120} k={m.pop(ks + i * 3, 12)} r={56} />}</OnMap>)}
        </MapView>
      </View>
      <MonthPage x={830 - 250 * m.lerp([nv, nv + 14], [0, 1]) + 250 * pull} y={250 + 120 * m.lerp([nv, nv + 14], [0, 1]) - 120 * pull} k={1} month="नवंबर" t={m.t}
        size={0.75 + 0.35 * m.lerp([nv, nv + 14], [0, 1]) - 0.35 * pull} flip={m.lerp([nv, nv + 10], [0.2, 1])} />
    </Stage>
  );
};

export default Promise;
