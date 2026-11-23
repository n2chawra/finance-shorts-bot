// "Its nearest neighbour, Saint Helena, sits {fact1} to the north, and South Africa is {fact2} away to the east."
// The South Atlantic: the camera pulls back from Tristan on "nearest", a ruler line starts north on "neighbour",
// Saint Helena pops up on "Saint", the distance sign lands on "north"; South Africa traces itself and fills with
// its flag on "South", a second ruler runs east to Cape Town on "Africa" and its sign lands on "east".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { SourceLine, Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapPin, useAt } from "../../flat/map";
import { CAPE, HELENA, Isle, Ocean, Ruler, Sign, TRISTAN } from "./props";

type Params = { fig?: { helena?: string; africa?: string } };

const Signs: React.FC<{ a: string; b: string; ka: number; kb: number }> = ({ a, b, ka, kb }) => {
  const at = useAt();
  const t = at(TRISTAN), h = at(HELENA), c = at(CAPE);
  if (!t || !h || !c) return null;
  return (
    <g>
      <Sign x={Math.min(760, (t[0] + h[0]) / 2 + 250)} y={(t[1] + h[1]) / 2 + 40} w={420} text={a} k={ka} size={68} />
      <Sign x={Math.min(740, (t[0] + c[0]) / 2 + 40)} y={Math.min(1330, (t[1] + c[1]) / 2 + 230)} w={420} text={b} k={kb} size={68} bg="#ffe6a8" />
    </g>
  );
};

const Far: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fig = (p.beat.params as Params).fig ?? {};
  const nr = m.at("nearest", 4), nb = m.at("neighbour", 14), st = m.at("saint", 24), he = m.at("helena", 30), si = m.at("sits", 36), no = m.at("north", 64), so = m.at("south", 74), af = m.at("africa", 82), is = m.at("is", 88), aw = m.at("away", 112), ea = m.at("east", 124);
  const out = m.lerp([nr, no], [0, 1]);
  const wide = m.lerp([so - 6, ea + 10], [0, 1]);
  const scale = 1550 - 200 * out - 100 * wide;
  const center: [number, number] = [-12.3 + 12 * out + 6 * wide, -37 + 9 * out - 3 * wide];
  return (
    <Stage p={p} bg="#4f93a6" vignette={0.35}>
      <View zoom={1 + m.wave(90, 0.01)}>
        <Ocean center={center} scale={scale}
          colors={{ "South Africa": { fill: "#3a8a5a", trace: m.lerp([so, so + 26], [0, 1]), k: m.lerp([so + 10, so + 24], [0, 1]), flag: "South Africa" } }}>
          <Ruler from={TRISTAN} to={HELENA} k={m.lerp([0, st + 14], [0.2, 1])} />
          <Ruler from={TRISTAN} to={CAPE} k={m.lerp([af, aw], [0, 1])} color="#ffe6a8" />
          <Isle at={TRISTAN} r={34} t={m.t} name="TRISTAN" size={54} below />
          <Isle at={HELENA} r={28} t={m.t} k={Math.max(0.7, m.pop(st, 11))} name="SAINT HELENA" nameK={m.lerp([he, he + 12], [0, 1])} glow={m.pulse(no + 6, 10)} size={54} />
          <MapPin at={CAPE} k={m.pop(aw, 11)} r={26} />
          <MapLabel at={[CAPE[0] - 4, CAPE[1] - 3.2]} text="CAPE TOWN" size={50} type={m.lerp([aw, aw + 12], [0, 1])} />
          <Signs a={fig.helena ?? ""} b={fig.africa ?? ""} ka={m.pop(si, 11)} kb={m.pop(is, 11)} />
        </Ocean>
      </View>
      <SourceLine p={p} />
    </Stage>
  );
};

export default Far;
