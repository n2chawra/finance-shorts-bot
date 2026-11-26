// "Back then, nobody minded: Lithuania, Latvia and Belarus were Soviet too, so the land ran unbroken to Moscow." The
// camera slides east; Lithuania, Latvia and Belarus each get their name tag (with a flag where the kit has one) and
// fill Soviet red on their word; SOVIET UNION writes across; a road draws from the piece to Moscow; a star pin drops.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, Stage, Txt, View, motion } from "../../flat/kit";
import { MapLabel, MapPin, MapRoute } from "../../flat/map";
import { FlagArt } from "../../flat/flags";
import { Dial, MOSCOW, Map, On, Piece, RAIL, SOVIET, Star } from "./props";

const NameTag: React.FC<{ at: [number, number]; text: string; flag?: string; k: number }> = ({ at, text, flag, k }) => (
  k <= 0 ? null : (
    <On at={at} draw={(x, y) => (
      <g transform={`translate(${x},${y}) scale(${Math.min(1, k)})`}>
        <Block x={-205} y={-46} w={410} h={92} fill="#f4e6c4" r={16} />
        {flag ? <FlagArt name={flag} x={-190} y={-26} w={78} h={52} /> : null}
        <Txt x={flag ? 48 : 0} y={18} size={46} fill="#3a2a1a">{text}</Txt>
      </g>
    )} />
  )
);

const Joined: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const ba = m.at("back", 2), li = m.at("lithuania", 22), la = m.at("latvia", 36), be = m.at("belarus", 50), so = m.at("soviet", 66), un = m.at("unbroken", 90), mo = m.at("moscow", 110);
  const slide = m.lerp([ba, li + 10], [0, 1]), wide = m.lerp([un - 6, un + 20], [0, 1]);
  const red = (at: number) => m.lerp([at + 4, at + 16], [0, 1]);
  return (
    <Stage p={p} bg="#5f9fae" vignette={0.35}>
      <View zoom={1.04 + m.wave(80, 0.008)}>
        <Map center={[22.5 + 2.5 * slide + 5 * wide, 54.3 + 0.2 * wide]} scale={5200 - 2000 * wide} colors={{
          Russia: { fill: SOVIET, k: 0.9 },
          Lithuania: { fill: SOVIET, k: red(li) }, Latvia: { fill: SOVIET, k: red(la) }, Belarus: { fill: SOVIET, k: red(be) },
          Estonia: { fill: SOVIET, k: red(be) * 0.9 }, Ukraine: { fill: SOVIET, k: red(be) * 0.9 },
        }}>
          <Piece k={0.95} fill={SOVIET} />
          <NameTag at={[23.9, 55.35]} text="LITHUANIA" flag="Lithuania" k={m.pop(li, 10) * (1 - red(so))} />
          <NameTag at={[25.0, 56.85]} text="LATVIA" flag="Latvia" k={m.pop(la, 10) * (1 - red(so))} />
          <NameTag at={[27.9, 53.6]} text="BELARUS" k={m.pop(be, 10) * (1 - red(so))} />
          <MapLabel at={[27.5, 55.2]} text="SOVIET UNION" size={62} k={m.pop(so, 12)} type={m.lerp([so, so + 20], [0, 1])} />
          <MapRoute via={RAIL} k={m.lerp([un, mo + 10], [0, 1])} color="#ffe08a" width={12} dash={false} />
          <MapPin at={MOSCOW} k={m.pop(mo, 12)} color="#f2b134" />
          <On at={MOSCOW} draw={(x, y) => <Star x={x} y={y - 120} r={40} k={m.pop(mo + 6, 12)} />} />
          <MapLabel at={[MOSCOW[0], MOSCOW[1] + 0.9]} text="MOSCOW" size={56} k={m.pop(mo + 4, 12)} />
        </Map>
      </View>
      <Dial pos={1} />
    </Stage>
  );
};
export default Joined;
