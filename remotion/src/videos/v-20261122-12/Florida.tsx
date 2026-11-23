// Florida: "Across the Atlantic, the sea closes in on Florida's long peninsula, and most of the state is under water
// too." On "Atlantic" the camera crosses the ocean; on "long" Florida traces in light; on "peninsula" a palm tree and a
// beach hut stand on it; on "closes" the sea eats in from both sides; on "most" only patches of high ground are
// left; on "water" the palm sinks under.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel } from "../../flat/map";
import { FLORIDA, Isle, NEW_SEA, Shape, World } from "./props";

const NEAR = ["United States of America", "Cuba", "Bahamas", "Mexico"];

const Florida: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const at = m.at("atlantic", 4), lo = m.at("long", 26), pe = m.at("peninsula", 36), cl = m.at("closes", 14), mo = m.at("most", 60), wa = m.at("water", 84);
  const cross = m.lerp([at, at + 22], [0, 1]);
  const flood = m.lerp([cl, mo + 10], [0, 0.6]) + m.lerp([mo, wa + 10], [0, 0.35]);
  return (
    <Stage p={p} bg="#3f7f96" vignette={0.36}>
      <View zoom={1.04 + 0.1 * m.lerp([wa, wa + 12], [0, 1]) + m.wave(90, 0.01)}>
        <World center={[-70 - 12 * cross, 28]} scale={1800 + 1400 * cross} fine only={NEAR}>
          <Shape pts={FLORIDA} fill="#f2b134" k={m.lerp([lo, lo + 12], [0.0, 0.9])} stroke="#ffd84a" sw={7} />
          <Shape pts={FLORIDA} fill={NEW_SEA} k={flood} stroke="#9fd3e0" sw={4} />
          {m.t >= pe ? <Isle at={[-81.4, 27.6]} s={1.2} sink={m.lerp([wa, wa + 16], [0, 1])} house t={m.t} /> : null}
          <MapLabel at={[-82, 31.6]} text="FLORIDA" size={56} k={m.lerp([lo, lo + 10], [0, 1])} />
          <MapLabel at={[-74, 26.5]} text="ATLANTIC" size={50} fill="#ffffff" k={m.lerp([at, at + 10], [0, 1])} />
        </World>
      </View>
    </Stage>
  );
};
export default Florida;
