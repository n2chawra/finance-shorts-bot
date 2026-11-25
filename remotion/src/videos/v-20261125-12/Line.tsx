// "And that crack is only the top of one long line, the East African Rift, running south through Kenya and into
// Tanzania." The Afar crack pulses, a pin marks the top, the camera pulls back as the rift draws south, its name
// writes along it, and Kenya and Tanzania trace with their flags on their names.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel, MapPin } from "../../flat/map";
import { Crack, Map, SeaMarks, mix, mixLL, type LL } from "./props";

export const RIFTV: { center: LL; scale: number } = { center: [37.5, 2.5], scale: 1750 };

const Line: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const to = m.at("starts", 4), cr = m.at("afar", 22), li = m.at("south", 40), ri = m.at("rift", 56), so = m.at("line", 52), tu = m.at("turkana", 84), ke = m.at("kenya", 88), ta = m.at("tanzania", 104);
  const out = m.lerp([li, li + 30], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.008)}>
        <Map center={mixLL([40.6, 10.2], RIFTV.center, out)} scale={mix(4200, RIFTV.scale, out)}
          colors={{
            Ethiopia: { fill: "#e9c46a", flag: "Ethiopia", k: 1 },
            Kenya: { fill: "#c9604a", flag: "Kenya", k: m.lerp([ke, ke + 12], [0, 1]), trace: m.lerp([ke, ke + 28], [0, 1]) },
            Tanzania: { fill: "#7fb6d9", flag: "Tanzania", k: m.lerp([ta, ta + 12], [0, 1]), trace: m.lerp([ta, ta + 28], [0, 1]) },
          }}>
          <SeaMarks t={m.t} />
          <Crack k={m.lerp([li - 6, so + 10], [0.3, 1])} glow={0.4 + m.pulse(cr + 4, 12)} w={10} />
          <MapPin at={[43.0, 12.5]} k={m.pop(to)} r={30} />
          <MapLabel at={[33.0, 3.6]} text="LAKE TURKANA" size={48} type={m.lerp([tu, tu + 18], [0, 1])} />
          <MapLabel at={[41.6, 13.8]} text="AFAR" size={60} type={m.lerp([cr, cr + 14], [0, 1])} />
          <MapLabel at={[31.6, 6.5]} text="EAST AFRICAN RIFT" size={56} type={m.lerp([ri, ri + 22], [0, 1])} />
        </Map>
      </View>
    </Stage>
  );
};
export default Line;
