// Islands: "साथ में दमन दीव, पुडुचेरी, लक्षद्वीप और अंडमान निकोबार के द्वीप।" All of India wide: the four coastal UTs light
// teal on their names with their tags, rings pulse round Lakshadweep and the Andamans, the camera pans east, and on
// "द्वीप" every island coast traces bright.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { CoastLine, CoastSurf, SeaRipples, type StateFx } from "../../flat/india";
import { COAST, F, MapView, OnMap, Tags, UTS, UT_COLOUR, painted } from "./props";

const EVENTS = ["daman", "pondy", "laksh", "andaman"];

const Ring: React.FC<{ x: number; y: number; k: number; t: number }> = ({ x, y, k, t }) => {
  if (k <= 0) return null;
  const f = (t % 40) / 40;
  return (
    <g data-probe="skip" opacity={Math.min(1, k * 2)}>
      <circle cx={x} cy={y} r={50 + 50 * f} fill="none" stroke="#e9f8ff" strokeWidth={6} opacity={1 - f} />
      <circle cx={x} cy={y} r={44 * Math.min(1, k)} fill="none" stroke={UT_COLOUR} strokeWidth={8} />
    </g>
  );
};

const Islands: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = EVENTS.map((e, i) => m.at(e, 6 + i * 14));
  const dw = m.at("dweep", 70);
  const frame = { center: [F.india.center[0] + m.lerp([t[3]! - 8, t[3]! + 20], [-1.2, 1.0]), F.india.center[1] - 1.5] as [number, number], scale: F.india.scale * 1.04 };
  const states: Record<string, StateFx> = {
    ...painted(COAST),
    ...Object.fromEntries(UTS.map((s, i) => [s, { fill: UT_COLOUR, k: m.lerp([t[i]!, t[i]! + 8], [0, 1]), lift: m.pulse(t[i]! + 5, 10) }])),
  };
  return (
    <Stage p={p} bg="#123049" vignette={0.3}>
      <View zoom={1.02 + m.wave(70, 0.012)}>
        <MapView frame={frame} states={states}>
          <SeaRipples t={m.t} k={1} />
          <CoastSurf t={m.t} />
          <CoastLine k={1} width={8} color="#5fd3ff" />
          {UTS.map((s, i) => <CoastLine key={s} name={s} k={m.lerp([t[i]! + 2, t[i]! + 14], [0, 1]) * 0.6 + 0.4 * m.lerp([dw, dw + 12], [0, 1])} width={10 + 6 * m.pulse(dw + 6, 10)} color="#ffffff" />)}
          <OnMap at={[72.7, 10.6]}>{(x, y) => <Ring x={x} y={y} k={m.pop(t[2]!, 10)} t={m.t} />}</OnMap>
          <OnMap at={[92.8, 11.0]}>{(x, y) => <Ring x={x} y={y} k={m.pop(t[3]!, 10)} t={m.t + 20} />}</OnMap>
          <Tags names={UTS} ks={t.map((f) => m.pop(f, 10))} size={44} />
        </MapView>
      </View>
    </Stage>
  );
};
export default Islands;
