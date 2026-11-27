// "Here at the Bering Strait, only 82 kilometres of sea separate them." The camera pulls up over the strait, BERING
// STRAIT writes on in the water, the two coasts light up, a ruler stretches from coast to coast with the width on its
// tag and the camera eases back to show both coasts whole.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Tag, View, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { SideNames, BMap, DEZHNEV, PRINCE, SEA_STRAIT, STRAIT, Waves, between, mix, type LL , Floes } from "./props";

type Params = { fig?: { width?: string } };

export const Ruler: React.FC<{ a: LL; b: LL; k: number; text: string; dy?: number; tagW?: number }> = ({ a: A, b: B, k, text, dy = -120, tagW = 320 }) => {
  const at = useAt();
  const a = at(A), b = at(B);
  if (!a || !b || k <= 0) return null;
  const y = (a[1] + b[1]) / 2 + dy;
  const x2 = mix(a[0], b[0], k);
  return (
    <g>
      <line x1={a[0]} y1={y} x2={x2} y2={y} stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <line x1={a[0]} y1={y} x2={x2} y2={y} stroke="#fff4d0" strokeWidth={7} strokeLinecap="round" />
      <line x1={a[0]} y1={y - 28} x2={a[0]} y2={y + 28} stroke={INK} strokeWidth={8} />
      {k >= 1 ? <line x1={b[0]} y1={y - 28} x2={b[0]} y2={y + 28} stroke={INK} strokeWidth={8} /> : null}
      <Tag x={(a[0] + b[0]) / 2 - tagW / 2} y={y - 140} w={tagW} h={100} text={text} size={56} k={Math.max(0, (k - 0.6) / 0.4)} />
    </g>
  );
};

const Near: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const w = (p.beat.params as Params).fig?.width ?? "";
  const he = m.at("here", 2), be = m.at("bering", 10), st = m.at("strait", 22), on = m.at("only", 30), se = m.at("sea", 60), sp = m.at("separate", 70);
  const start = { center: [-168.95, 65.84] as LL, scale: 22000 };
  const a = between(start, { center: [-168.9, 65.9], scale: 18000 }, m.lerp([he, he + 20], [0, 1]));
  const cam = between(a, STRAIT, m.lerp([sp, sp + 24], [0, 1]));
  const lit = m.lerp([st, st + 14], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.008)}>
        <BMap center={cam.center} scale={cam.scale} colors={{
          Russia: { fill: "#e6a39a", k: lit, trace: lit },
          "United States of America": { fill: "#a8c0e0", k: lit, trace: lit },
        }}>
          <Floes t={m.t} size={34} />
          <SideNames />
          <Waves pts={SEA_STRAIT} t={m.t} />
          <MapLabel at={[-168.95, 65.35]} text="BERING STRAIT" size={60} type={m.lerp([be, be + 16], [0, 1])} />
          <Ruler a={DEZHNEV} b={PRINCE} k={m.lerp([on, se], [0, 1])} text={`${w} KM`} dy={-180} />
        </BMap>
      </View>
    </Stage>
  );
};
export default Near;
