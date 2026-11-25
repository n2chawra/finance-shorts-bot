// "Then it swings east, crosses into New South Wales, and climbs north through Queensland," The truck reaches the
// bend and turns east; a corner post marks where three states meet, NEW SOUTH WALES writes on below the line, the
// camera pulls back as the line climbs north and QUEENSLAND writes on above it.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, INK, Limb, Stage, Txt, View, countText, motion } from "../../flat/kit";
import { MapLabel, useAt } from "../../flat/map";
import { CORNER, CORNER_K, Fence, Map, Odo, OnFence, along, mix, mixLL, type LL, SeaMarks } from "./props";
import { NORTH_END } from "./North";

type Params = { fig?: { length?: string } };

export const EAST_END = 0.72;

const Post: React.FC<{ k: number }> = ({ k }) => {
  const xy = useAt()(CORNER);
  if (!xy || k <= 0) return null;
  const q = Math.min(1, k);
  return (
    <g transform={`translate(${Math.max(270, Math.min(800, xy[0]))},${xy[1]}) scale(${q})`}>
      <Limb a={[0, 0]} b={[0, -150]} w={16} color="#6b4a2a" sw={3} />
      <Block x={-200} y={-250} w={400} h={100} fill="#f4e6c4" r={12} />
      <Txt x={0} y={-200} size={48} fill={INK}>THREE STATES</Txt>
    </g>
  );
};

const East: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const len = (p.beat.params as Params).fig?.length ?? "";
  const th = m.at("then", 2), ea = m.at("east", 12), co = m.at("corner", 22), cr = m.at("crosses", 40), wa = m.at("wales", 48), cl = m.at("climbs", 62), qu = m.at("queensland", 80);
  const k = m.lerp([th, cr + 10], [NORTH_END, CORNER_K]) + m.lerp([cr + 10, m.end], [0, EAST_END - CORNER_K]);
  const out = m.lerp([cl, cl + 30], [0, 1]);
  const look: LL = mixLL([along(k)[0] + 0.3, along(k)[1] - 0.2], [144.5, -27.5], out);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(70, 0.008)}>
        <Map center={look} scale={mix(7000, 3600, out)}>
          <SeaMarks t={m.t} />
          <Fence w={12} flash={m.pulse(ea + 4, 10)} />
          <Post k={m.pop(co)} />
          <MapLabel at={[145.5, -31.8]} text="NEW SOUTH WALES" size={54} type={m.lerp([wa, wa + 20], [0, 1])} />
          <MapLabel at={[144.5, -24.6]} text="QUEENSLAND" size={58} type={m.lerp([qu, qu + 18], [0, 1])} />
          <OnFence k={k} t={m.t} s={mix(140, 110, out)} />
        </Map>
      </View>
      <Odo value={countText(len, k)} />
    </Stage>
  );
};
export default East;
