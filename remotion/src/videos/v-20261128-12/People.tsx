// "And people? For all that land, Mexico has only 2.7 times as many as Spain." The Atlantic with both countries in
// their colours; small figures start appearing on both on "people"; Mexico's wide land glows on "land" and fills with
// figures; on "only" a sign stamps the ratio in the ocean between them; the figures wave; Spain's crowd closer.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Stage, Tag, View, motion } from "../../flat/kit";
import { useAt } from "../../flat/map";
import { Crowd, ES_FILL, ES_PTS, GeoMap, MX_FILL, MX_PTS, SEA, between } from "./props";

type Params = { fig?: { ratio?: string } };

const Sign: React.FC<{ k: number; text: string }> = ({ k, text }) => {
  const xy = useAt()([-103, 28]);
  return xy ? <Tag x={xy[0] - 220} y={xy[1] - 70} w={440} h={140} text={text} size={64} k={k} /> : null;
};

const People: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ratio = (p.beat.params as Params).fig?.ratio ?? "";
  const pe = m.at("people", 2), la = m.at("land", 16), mx = m.at("mexico", 26), on = m.at("only", 36), sp = m.at("spain", 60);
  const cam = between({ center: [-4, 39], scale: 2200 }, { center: [-101, 22], scale: 2100 }, m.lerp([la, mx + 10], [0, 1]));
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.01)} cy={960}>
        <GeoMap cam={cam} colors={{ Mexico: { fill: MX_FILL, k: 1, flag: "Mexico", trace: m.lerp([la, la + 20], [0, 1]) }, Spain: { fill: ES_FILL, k: 1, flag: "Spain" } }}>
          <Crowd pts={MX_PTS} color="#2b6a9a" from={mx} gap={0.8} t={m.t} s={1.1} seed="mx" />
          <Crowd pts={ES_PTS.filter((_, i) => i % 3 === 0)} color="#c0392b" from={pe} gap={1} t={m.t} s={0.9} jitter={8} seed="es" />
          <Crowd pts={ES_PTS.filter((_, i) => i % 3 === 1)} color="#c0392b" from={sp} gap={0.5} t={m.t} s={0.9} jitter={8} seed="es2" />
          <Sign k={m.pop(on)} text={`${ratio} PEOPLE`} />
          {m.pulse(sp + 6, 10) > 0 ? null : null}
        </GeoMap>
      </View>
    </Stage>
  );
};
export default People;
