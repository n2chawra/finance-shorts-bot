// West: "गुजरात, महाराष्ट्र, गोवा, कर्नाटक, केरलम।" The camera rides down the Arabian Sea coast; each state paints in on its
// name, its coast lights blue and its tag pops out in the sea; a small boat sails off Gujarat.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, View, motion } from "../../flat/kit";
import { CoastLine, CoastSurf, SeaRipples, type StateFx } from "../../flat/india";
import { COLOUR, F, MapView, OnMap, Tags, WEST, lerpFrame } from "./props";

const EVENTS = ["gj", "mh", "goa", "ka", "kl"];

const Boat: React.FC<{ x: number; y: number; bob: number }> = ({ x, y, bob }) => (
  <g transform={`translate(${x} ${y + bob})`} data-probe="skip">
    <path d="M -46 0 L 46 0 L 32 22 L -32 22 Z" fill="#e8453c" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <line x1={0} y1={0} x2={0} y2={-70} stroke={INK} strokeWidth={5} />
    <path d="M 4 -66 L 44 -10 L 4 -10 Z" fill="#ffffff" stroke={INK} strokeWidth={4} />
  </g>
);

const West: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = EVENTS.map((e, i) => m.at(e, 4 + i * 16));
  const top = { center: [F.west.center[0], F.west.center[1] + 2.2] as [number, number], scale: F.west.scale * 1.08 };
  const low = { center: [F.west.center[0] + 0.6, F.west.center[1] - 2.2] as [number, number], scale: F.west.scale * 1.08 };
  const frame = lerpFrame(lerpFrame(F.india, top, m.lerp([0, t[0]! + 10], [0.35, 1])), low, m.lerp([t[3]! - 6, t[4]! + 14], [0, 1]));
  const states: Record<string, StateFx> = Object.fromEntries(WEST.map((s, i) => [s, { fill: COLOUR[s]!, paint: m.lerp([t[i]!, t[i]! + 12], [0, 1]), from: [70 + i, 22 - i * 3] as [number, number], lift: m.pulse(t[i]! + 6, 12) }]));
  return (
    <Stage p={p} bg="#123049" vignette={0.3}>
      <View zoom={1.02 + m.wave(66, 0.012)}>
        <MapView frame={frame} states={states}>
          <SeaRipples t={m.t} k={1} />
          <CoastSurf t={m.t} />
          {WEST.map((s, i) => <CoastLine key={s} name={s} k={m.lerp([t[i]! + 2, t[i]! + 18], [0, 1])} width={11} />)}
          <Tags names={WEST} ks={t.map((f) => m.pop(f, 10))} />
          <OnMap at={[67.6 + m.lerp([0, m.end], [0, 1.2]), 22.6]}>{(x, y) => <Boat x={x} y={y} bob={m.wave(30, 4)} />}</OnMap>
        </MapView>
      </View>
    </Stage>
  );
};
export default West;
