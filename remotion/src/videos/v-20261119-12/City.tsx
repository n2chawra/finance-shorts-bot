// Promise: "In under a month, {fact4} people pressed play on it."
// A city of apartment blocks at night: the calendar on a rooftop billboard flips its pages on "under", windows across
// the city switch to the same pink-and-green glow on "month", the billboard counter rolls up on "people", and every
// window lights at once on "play".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Display, Glow, SourceLine, Stage, Txt, View, countText, motion, rng } from "../../flat/kit";
import { Char } from "../../flat/cast";

type Params = { fig?: { people?: string } };

const City: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fig = (p.beat.params as Params).fig ?? {};
  const under = m.at("under", 2), month = m.at("month", 14), people = m.at("people", 30), play = m.at("play", 50);
  const pages = m.t >= under ? Math.min(4, Math.floor((m.t - under) / 4)) : 0;
  const glowK = m.lerp([month - 2, play + 2], [0.05, 0.75]);
  const all = m.t >= play ? 1 : glowK;
  const count = countText(fig.people ?? "", m.lerp([month - 2, people - 2], [0, 1]));
  const lift = m.lerp([people - 2, people + 8], [0, 1], Easing.out(Easing.back(1.4)));
  const tap = m.t >= play;
  const push = m.lerp([people - 4, people + 10], [0, 1], Easing.inOut(Easing.cubic));
  const back = m.lerp([play - 4, play + 12], [0, 1], Easing.inOut(Easing.cubic));
  const r = rng("blocks");
  const blocks = Array.from({ length: 7 }).map((_, i) => ({ x: -260 + i * 240, h: 520 + r() * 420, c: ["#2c2a4a", "#33305a", "#282640"][i % 3]! }));
  const wr = rng("wins");
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#0c0a22" vignette={0.42}>
        <View zoom={1.04 + 0.16 * push - 0.14 * back} cx={540 + m.wave(70, 10)} cy={880 + m.wave(80, 6)}>
          <rect x={-400} y={-400} width={1880} height={2700} fill="#0c0a22" />
          <circle cx={880} cy={240} r={60} fill="#fff6d8" />
          {blocks.map((b, i) => (
            <g key={i}>
              <Block x={b.x} y={1300 - b.h} w={210} h={b.h + 400} fill={b.c} />
              {Array.from({ length: Math.floor(b.h / 90) * 3 }).map((_, j) => {
                const lit = wr() < all;
                const col = j % 2 ? "#f07aa8" : "#3dff8a";
                return <rect key={j} x={b.x + 24 + (j % 3) * 60} y={1300 - b.h + 30 + Math.floor(j / 3) * 90} width={40} height={52} rx={4} fill={lit ? col : "#3a3860"} opacity={lit ? 0.9 : 1} />;
              })}
            </g>
          ))}
          <Glow x={540} y={1000} r={600} color="#f07aa8" o={0.25 * all} />
          {/* the rooftop billboard with its calendar and counter */}
          <Block x={180} y={300} w={720} h={360} r={16} fill="#1d1a2b" />
          <Block x={220} y={340} w={200} h={280} r={10} fill="#ffffff" />
          <Block x={220} y={340} w={200} h={64} r={10} fill="#e9473b" shadow={false} />
          <Txt x={320} y={372} size={36} fill="#ffffff" deco>WEEK</Txt>
          {Array.from({ length: 4 }).map((_, i) => (
            <rect key={i} x={244 + (i % 2) * 80} y={430 + Math.floor(i / 2) * 80} width={64} height={60} rx={8} fill={i < pages ? "#e9473b" : "#e0e0ea"} />
          ))}
          <Display x={450} y={350} w={420} h={260} label="PRESSED PLAY" value={count} color="#3dff8a" />
          <Block x={300} y={660} w={30} h={300} fill="#3a3a48" />
          <Block x={760} y={660} w={30} h={300} fill="#3a3a48" />
          {/* Rohan's window, close in front: him on his couch with his phone */}
          <Block x={120} y={900} w={840} h={460} r={14} fill="#3b2e4f" />
          <rect x={150} y={930} width={780} height={400} fill={tap ? "#4a2e5a" : "#2a2240"} />
          <Glow x={600} y={1100} r={300} color={tap ? "#f07aa8" : "#5ab4ff"} o={tap ? 0.6 : 0.25} />
          <Block x={220} y={1180} w={640} h={150} r={30} fill="#7a4a8a" />
          <Char x={540} y={1330 + m.wave(50, 3)} s={130} who="rohan" sit phone="R" face={tap ? "grin" : "neutral"} look={[0.4, 0.6]}
            armR={[60 + 50 * lift, 120 + 20 * lift]} light={tap ? "#3dff8a" : undefined} />
          <rect x={150} y={1125} width={780} height={12} fill="#3b2e4f" />
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default City;
