// "Today, fifty-eight countries are in the treaty, and bases from many of them sit inside other countries' slices."
// The whole frozen continent; the treaty scroll's counter climbs to the count on "countries"; a ring of small flags
// fills round the ocean on "treaty"; red station huts pop up over the slices on "bases" and "many"; one blinks inside
// New Zealand's slice on "inside"; on "slices" every station's lamp blinks.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Glow, Stage, View, countText, motion } from "../../flat/kit";
import { FLAG_NAMES } from "../../flat/flags";
import { Station } from "../../flat/polar";
import { useAt } from "../../flat/map";
import { ALL, AntMap, FlagRing, Floes, SEA, Scroll, Slices, between } from "./props";

type Params = { fig?: { parties?: string } };

const SPOTS: [number, number][] = [[166.7, -77.8], [0, -89.9], [106.8, -78.5], [39.6, -69], [-68.1, -67.6], [140, -66.7], [123.3, -75.1], [76.4, -69.4], [-58.9, -62.2], [11.7, -70.8], [-26.6, -75.6], [62.9, -67.6]];

const Blink: React.FC<{ ll: [number, number]; k: number }> = ({ ll, k }) => {
  const xy = useAt()(ll);
  return xy && k > 0 ? <Glow x={xy[0]} y={xy[1] - 40} r={130} color="#ffd84a" o={0.8 * k} /> : null;
};

const Parties: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const n = (p.beat.params as Params).fig?.parties ?? "";
  const to = m.at("today", 2), co = m.at("countries", 14), tr = m.at("treaty", 30), ba = m.at("bases", 44), ma = m.at("many", 56), ins = m.at("inside", 70), sl = m.at("slices", 90);
  const cam = between({ center: [0, -90], scale: 820 }, { center: [20, -85], scale: 960 }, m.lerp([0, m.end], [0, 1]));
  const names = FLAG_NAMES.slice(0, 40);
  return (
    <Stage p={p} bg={SEA} vignette={0.35}>
      <View zoom={1.0 + m.wave(80, 0.01)} cy={870}>
        <AntMap cam={cam}>
          <Floes t={m.t} n={50} />
          <Slices s={ALL({ frost: 1 })} />
          <FlagRing names={names} k={m.lerp([tr - 4, tr + 30], [0, 1])} lat={-55} w={56} t={m.t} />
          {SPOTS.map((s, i) => <Station key={i} at={s} k={m.pop((i < 6 ? ba : ma) + (i % 6) * 3)} s={0.75} t={m.t + i * 5 + (m.t > sl ? 0 : 100)} />)}
          <Blink ll={SPOTS[0]!} k={m.pulse(ins + 8, 14)} />
        </AntMap>
      </View>
      <Scroll x={290} y={400} w={500} k={m.lerp([to - 2, to + 12], [0.6, 1])} title="TREATY MEMBERS" figure={countText(n, m.lerp([to, co + 8], [0, 1]))} />
    </Stage>
  );
};
export default Parties;
