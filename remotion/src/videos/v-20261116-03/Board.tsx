// Promise: "Sold as a Leonardo da Vinci, it went for $450.3M. So what changed?"
// The auction room's price board: close on the clean painting glowing under a new gold plate on "Leonardo", the camera
// pulls back on "went" as the price board above it rolls up to the record figure, the old paper tag flutters down
// off the frame on "what", and on "changed" the camera follows it to the floor.
import React from "react";
import { Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Display, Glow, INK, Stage, View, countText, motion } from "../../flat/kit";
import { Painting, PaperTag, Plate } from "./props";

type Params = { fig?: { price?: string; old?: string } };

const Board: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const price = (p.beat.params as Params).fig?.price ?? "";
  const old = (p.beat.params as Params).fig?.old ?? "";
  const so = m.at("so", 60), leo = m.at("leonardo", 6), went = m.at("went", 30), what = m.at("what", 70), changed = m.at("changed", 84);
  const wide = m.lerp([went - 4, went + 12], [0, 1], Easing.inOut(Easing.cubic));
  const down = m.lerp([changed - 4, changed + 12], [0, 1], Easing.inOut(Easing.cubic));
  const zoom = 1.45 - 0.45 * wide + 0.3 * down, cx = 540 + 120 * down, cy = 820 - 60 * wide + 420 * down;
  const k = m.lerp([went - 2, went + 22], [0, 1], Easing.out(Easing.cubic));
  const fall = m.lerp([what - 2, what + 20], [0, 1], Easing.in(Easing.quad));
  return (
    <Stage p={p} bg="#3a0f14" vignette={0.46}>
      <View zoom={zoom} cx={cx + m.wave(80, 5)} cy={cy}>
        <rect x={-400} y={-400} width={1880} height={1800} fill="#6a1c22" />
        {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={-400 + i * 200} y={-400} width={8} height={1800} fill="#5a161c" />)}
        <rect x={-400} y={1320} width={1880} height={900} fill="#2a1a1a" />
        <Glow x={540} y={300} r={520} color="#ffd23f" o={0.5 * m.pulse(so, 10)} />
        <Display x={210} y={180} w={660} h={240} label="SOLD" value={m.t < went - 2 ? "- - -" : countText(price, k)} color="#ffd23f" />
        <Glow x={540} y={760} r={460} color="#ffe6a0" o={0.35 + 0.25 * m.pop(leo, 12)} />
        <Painting x={350} y={470} w={380} glow={m.pop(leo, 12)} />
        <Plate x={270} y={1010} w={540} text="LEONARDO DA VINCI" k={m.t < leo - 2 ? 0 : m.pop(leo - 2, 10)} />
        {/* rows of chairs */}
        {Array.from({ length: 2 }).map((_, r) => Array.from({ length: 7 }).map((__, i) => <Block key={`${r}-${i}`} x={-120 + i * 190} y={1200 + r * 90} w={140} h={70} r={8} fill="#8a2a30" sw={4} />))}
        {/* the old tag, falling */}
        <g transform={`translate(${fall * 120} ${fall * 640})`}><PaperTag x={760} y={580} text={old} rot={10 + fall * 70 + m.wave(10, 6 * fall)} s={0.7} /></g>
      </View>
    </Stage>
  );
};

export default Board;
