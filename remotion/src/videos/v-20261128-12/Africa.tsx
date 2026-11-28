// "Across the Mediterranean and onto Africa: over Morocco, Algeria and even Tunisia." The camera on the Mediterranean
// under Mexico's south-east tail, waves under it; AFRICA writes across the land; Morocco, Algeria and Tunisia each
// light and write their names on their words, the tail's tip lying over Tunisia.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, View, motion } from "../../flat/kit";
import { MapLabel } from "../../flat/map";
import { AFRICA, ES_FILL, GeoMap, MexicoOnSpain, SEA, between } from "./props";

const AfricaBeat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const me = m.at("mediterranean", 2), af = m.at("africa", 20), mo = m.at("morocco", 34), al = m.at("algeria", 44), tu = m.at("tunisia", 58);
  const cam = between({ center: [1, 36.5], scale: 1500 }, AFRICA, m.lerp([af - 4, af + 20], [0, 1]));
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.01) + 0.03 * m.lerp([tu, tu + 14], [0, 1])} cy={980}>
        <GeoMap cam={cam} colors={{
          Spain: { fill: ES_FILL, k: 1 },
          Morocco: { fill: "#8e5ea2", k: m.lerp([mo, mo + 10], [0, 1]), trace: m.lerp([mo, mo + 20], [0, 1]) },
          Algeria: { fill: "#e7a33e", k: m.lerp([al, al + 10], [0, 1]), trace: m.lerp([al, al + 20], [0, 1]) },
          Tunisia: { fill: "#e70013", k: m.lerp([tu, tu + 10], [0, 1]), trace: m.lerp([tu, tu + 20], [0, 1]) },
        }}>
          <MexicoOnSpain k={1} o={0.55} />
          <MapLabel at={[15.5, 34.6]} text="MEDITERRANEAN" size={44} fill="#e8f4fa" type={m.lerp([me, me + 14], [0, 1])} />
          <MapLabel at={[2, 29.5]} text="AFRICA" size={64} type={m.lerp([af, af + 12], [0, 1])} />
          <MapLabel at={[-6.5, 32.6]} text="MOROCCO" size={46} type={m.lerp([mo, mo + 10], [0, 1])} />
          <MapLabel at={[3, 33.4]} text="ALGERIA" size={46} type={m.lerp([al, al + 10], [0, 1])} />
          <MapLabel at={[9.6, 34.3]} text="TUNISIA" size={46} type={m.lerp([tu, tu + 10], [0, 1])} />
        </GeoMap>
      </View>
    </Stage>
  );
};
export default AfricaBeat;
