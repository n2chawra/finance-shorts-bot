// "भूटान के साथ {fact5}।" Close above Assam: Bhutan fills with its flag and lifts as its border with India runs bright
// on "भूटान"; its flag sign plants; a length tag drops onto the border on "साथ".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { BorderLine, Neighbour } from "../../flat/india";
import { ALL, F, FlagSign, LengthTag, MapView, N, lerpFrame } from "./props";

type Params = { fig?: { len?: string } };

const Bhutan: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const len = (p.beat.params as Params).fig?.len ?? "";
  const bt = m.at("bhutan", 2), sa = m.at("saath", 14);
  const frame = lerpFrame(F.india, F.bhutan, m.lerp([0, 18], [0, 1]));
  return (
    <Stage p={p} bg="#16354d" vignette={0.3}>
      <View zoom={1.02 + m.lerp([0, m.end], [0, 0.04]) + m.wave(80, 0.01)}>
        <MapView frame={frame} dim={0.5}>
          {ALL.filter((n) => n !== "Bhutan").map((n) => <Neighbour key={n} name={n} fill={n === "Bangladesh" ? "#9aa0a8" : N[n]!.fill} k={0.4} />)}
          <Neighbour name="Bhutan" fill={N.Bhutan!.fill} flag="Bhutan" k={m.lerp([bt, bt + 8], [0.4, 1])} flagK={m.lerp([bt, bt + 12], [0, 1])} lift={m.lerp([bt, bt + 10], [0, 0.8])} />
          <BorderLine name="Bhutan" k={m.lerp([bt, bt + 20], [0, 1])} />
          <FlagSign at={[91.6, 28.0]} name="Bhutan" label={N.Bhutan!.hi} k={m.pop(bt + 4, 12)} t={m.t + 20 * m.pulse(54, 10)} size={1} />
          <LengthTag at={N.Bhutan!.border} k={m.pop(sa, 10)} text={len} dy={170} dx={-80} glow={m.pulse(sa + 8, 12) + m.pulse(78, 8)} />
        </MapView>
      </View>
    </Stage>
  );
};

export default Bhutan;
