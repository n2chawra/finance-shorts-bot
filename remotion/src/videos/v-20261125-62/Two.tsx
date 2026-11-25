// "म्यांमार के साथ {fact4}, और नेपाल के साथ {fact3}।" East over the Myanmar hills: Myanmar fills with its flag and its
// border runs bright on "म्यांमार", its length tag drops on "साथ"; on "और" the camera pans west along the mountains to
// Nepal, which fills with its flag on "नेपाल", its border glowing and its length tag dropping.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { BorderLine, Neighbour } from "../../flat/india";
import { ALL, F, FlagSign, LengthTag, MapView, N, lerpFrame } from "./props";

type Params = { fig?: { mm?: string; np?: string } };

const Two: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fig = (p.beat.params as Params).fig ?? {};
  const my = m.at("myanmar", 2), sa = m.at("saath", 12), au = m.at("aur", 40), np = m.at("nepal", 50), ns = m.at("nsaath", 60);
  const toM = m.lerp([0, 16], [0, 1]), toN = m.lerp([au, au + 22], [0, 1]);
  const frame = lerpFrame(lerpFrame(F.bhutan, F.myanmar, toM), F.nepal, toN);
  const done = ["Bhutan"];
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.wave(80, 0.01) + 0.025 * m.pulse(sa + 3, 7) + 0.025 * m.pulse(np + 6, 7)}>
        <MapView frame={frame} dim={0.5}>
          {ALL.filter((n) => !["Myanmar", "Nepal", ...done].includes(n)).map((n) => <Neighbour key={n} name={n} fill={n === "Bangladesh" ? "#9aa0a8" : N[n]!.fill} k={0.4} />)}
          <Neighbour name="Bhutan" fill={N.Bhutan!.fill} flag="Bhutan" lift={0.5 * m.pulse(90, 10)} />
          <BorderLine name="Bhutan" k={1} color="#ffffff" width={8} />
          <Neighbour name="Myanmar" fill={N.Myanmar!.fill} flag="Myanmar" k={m.lerp([my, my + 8], [0.4, 1])} flagK={m.lerp([my, my + 12], [0, 1])} lift={m.lerp([my, my + 10], [0, 0.8]) * (1 - 0.6 * toN)} />
          <BorderLine name="Myanmar" k={m.lerp([my, my + 22], [0, 1])} />
          <Neighbour name="Nepal" fill={N.Nepal!.fill} flag="Nepal" k={m.lerp([np, np + 8], [0.4, 1])} flagK={m.lerp([np, np + 12], [0, 1])} lift={m.lerp([np, np + 10], [0, 0.8]) + 0.3 * m.pulse(138, 10)} />
          <BorderLine name="Nepal" k={m.lerp([np, np + 22], [0, 1])} />
          <FlagSign at={[96.2, 23.6]} name="Myanmar" label={N.Myanmar!.hi} k={m.pop(my + 4, 12) * (1 - toN)} t={m.t} size={1} />
          <LengthTag at={N.Myanmar!.border} k={m.pop(sa, 10) * (1 - toN)} text={fig.mm ?? ""} dx={-200} dy={-200} glow={m.pulse(sa + 8, 12) + m.pulse(45, 10)} />
          <FlagSign at={[82.6, 29.6]} name="Nepal" label={N.Nepal!.hi} k={m.pop(np + 4, 12)} t={m.t + 20 * m.pulse(162, 10)} size={1} />
          <LengthTag at={N.Nepal!.border} k={m.pop(ns, 10)} text={fig.np ?? ""} dy={200} glow={m.pulse(ns + 8, 12) + m.pulse(138, 10)} />
        </MapView>
      </View>
    </Stage>
  );
};

export default Two;
