// Build: "So the studio made the whole film for just {fact3}."
// The studio's money room: the boss pulls a cord on "So" and the budget board flips over, cash bundles slide
// onto the table on "studio", the board counts up from "whole", a film reel stamps on it on "film".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Cash, Display, Glow, INK, STROKE, SourceLine, Stage, View, countText, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";

type Params = { fig?: { budget?: string } };

const Budget: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = (p.beat.params as Params).fig ?? {};
  const so = m.at("so", 2), st = m.at("studio", 10), wh = m.at("whole", 20), film = m.at("film", 32), just = m.at("just", 40);
  const board = m.lerp([so, so + 8], [0, 1]);
  const cash = m.lerp([st, st + 10], [0, 1], Easing.out(Easing.back(1.5)));
  const reel = m.pop(film, 10);
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#14301f" vignette={0.42}>
        <View zoom={1.0 + 0.12 * m.lerp([film - 6, film + 10], [0, 1])} cx={540} cy={800}>
          <rect x={-500} y={-500} width={2080} height={2900} fill="#1f4a32" />
          {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={-500 + i * 220} y={-500} width={10} height={1600} fill="#1a3f2a" />)}
          <Glow x={540} y={500} r={520} color="#9dffb0" o={0.18} />
          {/* the budget board */}
          <g transform={`translate(540 520) scale(1 ${Math.max(0.05, board)})`}>
            <Display x={-400} y={-200} w={800} h={340} label="THE WHOLE FILM COST" value={countText(f.budget ?? "", m.lerp([wh, film], [0.1, 1], Easing.out(Easing.cubic)))} color="#ffc43d" />
          </g>
          <line x1={980} y1={-100} x2={980} y2={m.lerp([so - 4, so + 4], [500, 620])} stroke="#ddd" strokeWidth={6} />
          {reel > 0 ? (
            <g transform={`translate(200 820) scale(${reel}) rotate(${m.t * 3})`}>
              <Ball x={0} y={0} r={90} fill="#3a3f55" />
              {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={50 * Math.cos((a * Math.PI) / 180)} cy={50 * Math.sin((a * Math.PI) / 180)} r={20} fill="#1f2230" />)}
            </g>
          ) : null}
          {/* the boss and the table */}
          <Char x={860} y={1240 + m.wave(60, 3)} s={210} skin="#e2b48f" top="#3a3f55" outfit="suit" hair="bald" face={m.t >= film ? "grin" : "smirk"} glasses
            armR={m.t >= just ? [m.lerp([just, just + 4], [150, 60]), 30] : [m.lerp([so - 4, so + 4], [150, 170]), 160]} armL={[20, 10]} look={[-0.6, -0.4]} />
          <Block x={-120} y={1000} w={820} h={90} r={10} fill="#8a5226" />
          <rect x={-120} y={1090} width={820} height={300} fill="#5a3418" stroke={INK} strokeWidth={STROKE} />
          {cash > 0 ? [0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i} transform={`translate(${(1 - cash) * -600} ${-30 * m.pulse(just + 2, 5)})`}><Cash x={60 + (i % 3) * 190} y={960 - Math.floor(i / 3) * 34} w={170} /></g>
          )) : null}
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Budget;
