// Build: "Now spread all of it over {fact4} people. What does each one get?"
// Earth from orbit: the globe turns with a satellite counter beside it on "Now", gold coins rain down onto it on
// "spread", the satellite's counter rolls up to the population on "people", city lights spark on across the globe
// on "What", and the globe glows gold all over on "get".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Coin, Display, Limb, Stage, View, countText, motion, rng } from "../../flat/kit";
import { Globe } from "./props";

type Params = { fig?: { people?: string } };

const Earth: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fig = (p.beat.params as Params).fig ?? {};
  const spread = m.at("split", 10), people = m.at("people", 40), what = m.at("what", 55), get = m.at("get", 70);
  const rain = m.lerp([spread - 2, spread + 6], [0, 1]);
  const count = countText(fig.people ?? "", m.lerp([people - 14, people + 6], [0, 1]));
  const lights = m.lerp([what - 2, what + 14], [0, 1]);
  const gold = m.lerp([get - 2, get + 10], [0, 1]);
  const push = m.lerp([spread - 4, spread + 16], [0, 1], Easing.inOut(Easing.cubic));
  const back = m.lerp([get - 4, get + 14], [0, 1], Easing.inOut(Easing.cubic));
  const r = rng("stars");
  const stars = Array.from({ length: 70 }).map(() => [r() * 1880 - 400, r() * 2600 - 400, r()] as const);
  const cr = rng("rain");
  const coins = Array.from({ length: 22 }).map(() => [cr(), cr()] as const);
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#070a1e" vignette={0.4}>
        <View zoom={1 + 0.18 * push - 0.18 * back} cx={540 + m.wave(80, 10)} cy={900 + m.wave(90, 8)}>
          <rect x={-400} y={-400} width={1880} height={2700} fill="#070a1e" />
          {stars.map(([x, y, a], i) => <circle key={i} cx={x} cy={y} r={2 + a * 3} fill="#ffffff" opacity={0.4 + 0.4 * Math.sin(m.t / 8 + a * 9)} />)}
          <Globe x={540} y={1000} r={330} t={m.t} gold={gold} lights={lights} />
          {rain > 0 ? coins.map(([a, b], i) => {
            const ph = ((m.t - spread) * (10 + b * 8) + a * 300) % 520;
            const ang = a * Math.PI * 2;
            const x = 540 + Math.cos(ang) * (380 + 200 * (1 - ph / 520));
            const y = 1000 + Math.sin(ang) * (380 + 200 * (1 - ph / 520));
            return <Coin key={i} x={x} y={y} r={22} spin={Math.abs(Math.cos(m.t / 5 + i))} />;
          }) : null}
          {/* the satellite with its counter */}
          <g transform={`translate(0 ${m.wave(60, 8)})`}>
            <Limb a={[300, 400]} b={[780, 400]} w={10} color="#9aa3b5" />
            <Block x={150} y={350} w={140} h={100} fill="#2b6cd8" />
            <Block x={790} y={350} w={140} h={100} fill="#2b6cd8" />
            <Display x={300} y={260} w={480} h={260} label="PEOPLE ON EARTH" value={count} color="#5ab4ff" />
          </g>
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Earth;
