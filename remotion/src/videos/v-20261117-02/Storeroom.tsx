// Turn: "But the popcorn, drinks and candy themselves cost AMC very little."
// The storeroom behind the snack bar: a sack of corn kernels drops on the scale on "popcorn", a syrup box lands
// beside it on "drinks", a crate of candy lands on top on "candy", the invoice on the clipboard rolls out on
// "cost", and on "little" a SMALL stamp lands on it.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Glow, INK, Stage, Tag, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";

const Storeroom: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const pop = m.at("popcorn", 6), drinks = m.at("drinks", 16), candy = m.at("candy", 24), c = m.at("cost", 34), only = m.at("little", 46);
  const drop = (at: number) => m.lerp([at - 6, at], [-900, 0], Easing.in(Easing.quad));
  const roll = m.lerp([c - 2, c + 12], [0, 1], Easing.out(Easing.cubic));
  const mid = m.lerp([c - 4, c + 10], [0, 1], Easing.inOut(Easing.cubic));
  const close = m.lerp([only - 4, only + 8], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.0 + 0.08 * mid + 0.12 * close;
  const cx = 540 + 60 * mid + 40 * close, cy = 880 - 60 * mid - 60 * close;
  const sq = (at: number) => 1 - 0.12 * m.pulse(at + 1, 4);
  return (
    <Stage p={p} bg="#3a2e22" vignette={0.44}>
      <View zoom={zoom} cx={cx + m.wave(90, 4)} cy={cy}>
        <rect x={-400} y={-400} width={1880} height={2600} fill="#4a3a2a" />
        {[0, 1, 2].map((i) => <Block key={i} x={-300} y={250 + i * 240} w={1680} h={22} fill="#6a5a4a" shadow={false} />)}
        {Array.from({ length: 18 }).map((_, i) => <Block key={`b${i}`} x={-260 + (i % 9) * 170} y={150 + Math.floor(i / 9) * 240} w={130} h={100} r={6} fill={["#c9a36a", "#a8724a", "#e0b070"][i % 3]!} sw={3} shadow={false} />)}
        <Glow x={400} y={300} r={420} color="#ffe2a8" o={0.35} />
        <rect x={-400} y={1300} width={1880} height={900} fill="#2a2016" />
        {/* the scale */}
        <Block x={80} y={1200} w={560} h={90} r={10} fill="#9aa3b5" />
        <Block x={300} y={1290} w={120} h={30} fill="#5a5f73" shadow={false} />
        {/* the kernel sack */}
        {m.t >= pop - 6 ? <g transform={`translate(0 ${drop(pop)}) translate(250 1200) scale(1 ${sq(pop)}) translate(-250 -1200)`}>
          <path d="M 130 1200 Q 110 980 170 940 L 330 940 Q 390 980 370 1200 Z" fill="#e8d6a0" stroke={INK} strokeWidth={6} />
          <Txt x={250} y={1080} size={48} fill="#a8724a">CORN</Txt>
        </g> : null}
        {/* the syrup box */}
        {m.t >= drinks - 6 ? <g transform={`translate(0 ${drop(drinks)})`}>
          <Block x={400} y={1020} w={210} h={180} fill="#3a7bd5" />
          <Txt x={505} y={1110} size={46} fill="#ffffff">SODA</Txt>
        </g> : null}
        {/* the candy crate */}
        {m.t >= candy - 6 ? <g transform={`translate(0 ${drop(candy)})`}>
          <Block x={300} y={840} w={260} h={170} fill="#ff7cc0" />
          {[0, 1, 2].map((i) => <Ball key={i} x={350 + i * 80} y={880} r={22} fill={["#ffcf4a", "#7cff9a", "#4dd2ff"][i]!} sw={3} />)}
          <Txt x={430} y={960} size={46} fill={INK}>CANDY</Txt>
        </g> : null}
        {/* the stock clerk who checks it all in */}
        <Char x={880} y={1480 + m.wave(60, 3)} s={160} outfit="shirt" top="#3a8a5a" pants="#2a2f3d" hair="cap" hat="#d7262b" skin="#c98a5e"
          face={m.t >= only ? "smirk" : "neutral"} look={[-0.8, -0.2]} armL={m.t >= c ? [140, 160] : [60, 100]} armR={[20, 10]} />
        {/* the clipboard and its invoice */}
        <Block x={660} y={380} w={300} h={140 + 400 * roll} r={12} fill="#a8724a" />
        <rect x={680} y={420} width={260} height={100 + 380 * roll} fill="#fffdf4" stroke={INK} strokeWidth={4} />
        <Block x={750} y={360} w={120} h={50} r={8} fill="#9aa3b5" />
        <Txt x={810} y={470} size={46} fill={INK}>INVOICE</Txt>
        {Array.from({ length: Math.floor(5 * roll) }).map((_, i) => <rect key={i} x={710} y={530 + i * 50} width={200} height={14} fill="#c9c4b8" />)}
        <Tag x={665} y={700} w={290} h={130} size={84} text="SMALL" rot={-5} k={m.t < only ? 0 : m.pop(only, 9)} bg="#7cff9a" />
      </View>
    </Stage>
  );
};

export default Storeroom;
