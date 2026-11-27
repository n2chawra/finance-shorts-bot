// "Seven countries have cut this ice into slices, like a cake, from the South Pole." From the peninsula the camera
// pulls back to the whole continent; a sign at the pole carries the count; on "slices" the seven claims fan open
// one after another round the pole; on "cake" they lift apart a little; on "South" a pin drops on the pole.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, Tag, View, motion } from "../../flat/kit";
import { MapPin, useAt } from "../../flat/map";
import { AntMap, CLAIMS, Floes, PEN, SEA, Slices, WHOLE, between, type SliceState } from "./props";

type Params = { fig?: { claims?: string } };

const PoleSign: React.FC<{ k: number; text: string }> = ({ k, text }) => {
  const xy = useAt()([0, -90]);
  return xy ? <Tag x={xy[0] - 210} y={xy[1] - 330} w={420} h={110} text={text} size={56} k={k} /> : null;
};

const SlicesBeat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const claims = (p.beat.params as Params).fig?.claims ?? "";
  const co = m.at("countries", 6), cu = m.at("cut", 22), sl = m.at("slices", 34), ca = m.at("cake", 56), so = m.at("south", 74), po = m.at("pole", 84);
  const cam = between({ center: PEN.center, scale: 1900 }, WHOLE, m.lerp([0, cu + 24], [0, 1]));
  const ids = Object.keys(CLAIMS);
  const lift = m.lerp([ca, ca + 10], [0, 1]) * (1 - m.lerp([po, po + 14], [0, 1]));
  const s: Record<string, SliceState> = Object.fromEntries(ids.map((id, i) => [id, {
    k: i < 3 ? 1 : m.lerp([sl + (i - 3) * 6, sl + (i - 3) * 6 + 14], [0, 1]), stripes: i < 3, lift, glow: m.pulse(sl + (i - 3) * 6 + 8, 8),
  }]));
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.01)} cy={1000}>
        <AntMap cam={cam}>
          <Floes t={m.t} n={50} />
          <Slices s={s} />
          <MapPin at={[0, -90]} k={m.pop(so)} r={22 + 6 * m.pulse(po + 6, 10)} />
          <PoleSign k={m.pop(co)} text={`${claims} CLAIMS`} />
        </AntMap>
      </View>
    </Stage>
  );
};
export default SlicesBeat;
