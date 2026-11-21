// Promise: "Each copy is {fact1}. Take-Two expects at least {std_total} from all its games by New Year."
// The same game shop (weekly test: the promise stays in the hook's place): one continuous move from the hook's close
// framing on the box (its price tag swinging hard on "Each"), pulling back and tilting up to the wall TV over the shelf
// on "copy". The TV lights with the Take-Two logo, counts up the figure on "expects", stamps AT LEAST on "least", the shelves light on
// "all", boxes of other games circle the TV on "games", a NEW YEAR banner drops on "New".
import React from "react";
import { AbsoluteFill } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Display, Glow, INK, SourceLine, Stage, Tag, Txt, View, countText, motion } from "../../flat/kit";
import { Photo } from "../../studio/photo";
import { GameBox, SHOPBG } from "./props";
import { Shelf } from "./Hook";

type Params = { fig?: { low?: string; price?: string } };

const PromiseShot: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const fig = (p.beat.params as Params).fig ?? {};
  const each = m.at("each", 2), owner = m.at("copy", 16), expects = m.at("expects", 50), to = m.at("least", 75), all = m.at("all", 90), games = m.at("games", 110), nw = m.at("new", m.end - 25);
  const tt = m.at("take-two", owner + 20);
  const tv = m.lerp([tt, tt + 8], [0, 1]);
  const count = m.lerp([expects, expects + 22], [0, 1]);
  const high = m.pop(to, 10);
  const lit = m.lerp([all, all + 14], [0, 1]);
  const ring = m.lerp([games, games + 12], [0, 1]);
  const banner = m.pop(nw, 12);
  // one continuous move: from the hook's close framing down on the box, pulling back and up to the TV
  const zoom = m.lerp([owner, expects + 10], [1.28, 1.02]);
  const cy = m.lerp([owner, expects + 10], [760, 210]);
  const flip = m.pulse(each + 6, 8) + m.pulse(m.at("is", each + 20) + 6, 8);
  const colors = ["#3fa7ff", "#7ad36b", "#ff8a3d", "#b07bff", "#ff5f6d", "#2fd3c4"];
  return (
    <AbsoluteFill>
      <Stage p={p} bg={SHOPBG} vignette={0.45}>
        <View zoom={zoom} cx={540 + m.wave(120, 5)} cy={cy}>
          <Shelf m={m} price={fig.price ?? ""} spot={1} tag={1 - Math.min(1, flip) * 0.4} copies={0} logo={0} swing={1 + flip * 4} />
          <Glow x={540} y={600} r={1100} ry={500} color="#7ad3ff" o={0.25 * lit} />
          {/* the wall TV over the shelf */}
          <Glow x={540} y={-120} r={600} color="#7fb8ff" o={0.45 * tv} />
          <Block x={110} y={-470} w={860} h={560} r={24} fill="#0b0f14" />
          <rect x={140} y={-440} width={800} height={500} rx={14} fill={tv > 0.1 ? "#141c34" : "#06080c"} />
          {tv > 0 ? (
            <g opacity={tv}>
              <rect x={170} y={-420} width={260} height={210} rx={14} fill="#ffffff" stroke={INK} strokeWidth={5} />
              <g transform="translate(300 -225)"><Photo name="taketwo" s={170} t={0} /></g>
              <Txt x={680} y={-390} size={34} fill="#9fd0ff" deco>FORECAST</Txt>
              <Glow x={685} y={-275} r={260} color="#4dff9a" o={0.8 * m.pulse(m.at("from", to + 20) + 4, 8)} />
              <Display x={460} y={-350} w={450} h={150} value={countText(fig.low ?? "", count)} color="#4dff9a" bg="#0b1a14" k={Math.min(1, count * 3)} />
              <Tag x={500} y={-150} w={380} h={110} text="AT LEAST" size={62} k={high} bg="#4dff9a" rot={-4} />
            </g>
          ) : null}
          {/* other games circling the TV */}
          {ring > 0
            ? Array.from({ length: 8 }).map((_, i) => {
                const a = (i / 8) * Math.PI * 2 + m.t / 40;
                return (
                  <g key={i} opacity={ring} transform={`translate(${540 + Math.cos(a) * 520 * ring} ${-180 + Math.sin(a) * 330 * ring})`}>
                    <rect x={-45} y={-60} width={90} height={120} rx={8} fill={colors[i % 6]} stroke={INK} strokeWidth={5} />
                  </g>
                );
              })
            : null}
          <GameBox x={540} y={1080} w={360} />
          {/* the New Year banner */}
          {banner > 0 ? (
            <g transform={`translate(0 ${(1 - banner) * -300})`}>
              <path d="M 200 30 L 880 30 L 850 130 L 230 130 Z" fill="#ffc43d" stroke={INK} strokeWidth={6} />
              <Txt x={540} y={80} size={58} fill={INK}>NEW YEAR</Txt>
            </g>
          ) : null}
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default PromiseShot;
