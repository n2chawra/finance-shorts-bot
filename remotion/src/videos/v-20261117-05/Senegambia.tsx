// "So did anyone ever fix it? In {fact7}, the two countries even joined as one, Senegambia. By {fact8},
// they had split again." On the map: the camera pushes in on "fix", both flags are planted on "two", the two
// countries flood one colour on "joined" with the first year on a tag, the joined name lands across them on
// "Senegambia"; on "split" the border cracks white, the map shakes and the two colours snap back, and the tag
// flips to the second year on "again".
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, Tag, View, motion } from "../../flat/kit";
import { MapLabel, MapRoute } from "../../flat/map";
import { At, BorderTrace, GREEN, GeoMap, MapFlag, RED, RIVER } from "./props";

type Params = { fig?: { from?: string; to?: string } };

const PURPLE = "#9b72cf";

const Senegambia: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fig = (p.beat.params as Params).fig ?? {};
  const fix = m.at("fix", 4), two = m.at("two", 40), joined = m.at("joined", 60), sg = m.at("senegambia", 80), split = m.at("split", 120), again = m.at("again", 135);
  // one colour paints out from the border on "joined"; on "split" each country paints back its own from the border
  const one = m.lerp([joined, joined + 20], [0, 1]);
  const back = m.lerp([split, split + 16], [0, 1]);
  const push = m.lerp([fix, two], [0, 1]);
  const scale = 7000 + 2500 * push;
  const shake = m.pulse(split, 8) * 14;
  const SEAM: [number, number] = [-15.2, 13.85];
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.3}>
      <View zoom={1 + m.wave(80, 0.01)} cx={540 + shake * Math.sin(m.t * 2)} cy={960}>
        <GeoMap center={[-14.7, 14.1]} scale={scale}
          colors={m.t < split
            ? { Gambia: { fill: one > 0 ? PURPLE : RED, paint: one > 0 ? one : 1, from: SEAM }, Senegal: { fill: one > 0 ? PURPLE : GREEN, paint: one > 0 ? one : 1, from: SEAM } }
            : { Gambia: { fill: RED, paint: back, from: SEAM }, Senegal: { fill: GREEN, paint: back, from: SEAM } }}>
          <MapRoute via={RIVER} k={1} color="#2f7fb8" width={9} dash={false} />
          <MapFlag at={[-14.3, 13.45]} kind="gambia" k={m.pop(two, 11)} h={120} wave={m.wave(22, 3)} />
          <MapFlag at={[-13.4, 15.2]} kind="senegal" k={m.pop(two + 6, 11)} h={150} wave={m.wave(24, 3)} />
          <BorderTrace name="Gambia" k={m.t >= split ? 1 : 0} width={10 + 8 * m.pulse(split, 8)} color="#ffffff" />
          <MapLabel at={[-14.9, 14.45]} text="SENEGAMBIA" size={70} type={m.lerp([sg, sg + 12], [0, 1])} k={m.t < split ? 1 : 0} />
          <At at={[-14.9, 15.65]}>{(x, y) => (
            <Tag x={x - 130} y={y} w={260} h={100} text={m.t < again ? (fig.from ?? "") : (fig.to ?? "")} k={m.t < again ? m.pop(joined, 12) : m.pop(again, 10)} bg="#ffffff" />
          )}</At>
        </GeoMap>
      </View>
    </Stage>
  );
};

export default Senegambia;
