// Loop: "Standard or Ultimate: which one did you buy? Check the price tag."
// Back in the game shop at the GTA VI shelf: Rohan holds up the standard box on "Standard" and the gold Ultimate box
// on "Ultimate", a question mark pops between them on "buy", he puts one back on "Check", and the camera settles on
// the hook's opening framing as the yellow price tag swings on the box on "tag": the first frame again.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { INK, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { GameBox, SHOPBG } from "./props";
import { Shelf } from "./Hook";

type Params = { fig?: { price?: string } };

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const price = (p.beat.params as Params).fig?.price ?? "";
  const std = m.at("standard", 2), ult = m.at("ultimate", 18), buy = m.at("buy", 36), check = m.at("check", 50), tag = m.at("tag", m.end - 10);
  const left = m.pop(std, 10), right = m.pop(ult, 10);
  const q = m.pop(buy, 9);
  const away = m.lerp([check, check + 14], [0, 1]);
  // medium on Rohan with both boxes -> the hook's opening framing on the box
  const zoom = m.t < check ? m.lerp([0, check], [1.0, 1.06]) : m.lerp([check, m.end], [1.06, 1.12]);
  const cx = m.t < check ? 540 : m.lerp([check, m.end], [540, 540]);
  const cy = m.t < check ? 900 : m.lerp([check, m.end], [900, 740]);
  return (
    <Stage p={p} bg={SHOPBG} vignette={0.45}>
      <View zoom={zoom} cx={cx + m.wave(110, 6)} cy={cy}>
        <Shelf m={m} price={price} spot={1} tag={m.t >= tag - 6 ? 1 : 0.0001} copies={0} logo={m.pulse(tag, 8)} swing={1} />
        <g opacity={1 - away}>
          <Char x={540} y={1700 + away * 300} s={330} who="rohan" face={m.t >= buy ? "grin" : "happy"} look={[m.t < ult ? -0.6 : 0.6, -0.2]}
            armL={[150 * left, 40]} armR={[150 * right, 40]}
            holdL={([hx, hy]) => (left > 0 ? <GameBox x={hx} y={hy + 120} w={170} /> : null)}
            holdR={([hx, hy]) => (right > 0 ? <GameBox x={hx} y={hy + 120} w={170} ultimate /> : null)} />
          {q > 0 ? (
            <g transform={`translate(540 520) scale(${0.4 + 0.6 * q})`}>
              <circle r={72} fill="#ffc43d" stroke={INK} strokeWidth={6} />
              <Txt x={0} y={4} size={100} fill={INK}>?</Txt>
            </g>
          ) : null}
        </g>
      </View>
    </Stage>
  );
};

export default Loop;
