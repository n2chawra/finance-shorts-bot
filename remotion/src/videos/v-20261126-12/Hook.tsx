// Hook: "Why would the Mediterranean Sea turn into a desert of salt?" The whole sea between Europe and Africa, half
// dried already: pools shrinking in the deep basins over white salt; MEDITERRANEAN SEA writes across it; the waterline
// slips back; the camera pushes in on the dry floor; salt crystals glitter.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel } from "../../flat/map";
import { Dry, Map, type LL } from "./props";

export const WIDE: { center: LL; scale: number } = { center: [15.0, 35.6], scale: 1450 };

export const HookMap: React.FC<{ t: number; level: number; glitter: number; label: number; push: number }> = ({ t, level, glitter, label, push }) => (
  <Map center={[WIDE.center[0] + 2.5 * push, WIDE.center[1] + 0.4 * push]} scale={WIDE.scale + 700 * push}>
    <Dry level={level} t={t} glitter={glitter} />
    <MapLabel at={[17.0, 36.6]} text="MEDITERRANEAN SEA" size={52} k={label} type={label} />
  </Map>
);

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const me = m.at("mediterranean", 6), se = m.at("sea", 20), de = m.at("desert", 40), sa = m.at("salt", 56);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(90, 0.01)}>
        <HookMap t={m.t} level={0.5 - 0.2 * m.lerp([se, m.end], [0, 1])} glitter={m.lerp([sa, sa + 10], [0, 1])}
          label={m.lerp([me, me + 18], [0, 1])} push={m.lerp([de - 4, de + 20], [0, 1])} />
      </View>
    </Stage>
  );
};
export default Hook;
