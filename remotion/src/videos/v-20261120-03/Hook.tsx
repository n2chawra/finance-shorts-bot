// Hook: "Michael Jordan paid about {fact1} for a losing team."
// An empty arena at night: a spotlight on Jordan (his real head) spinning a ball at centre court from frame 0. A price
// tag with what he paid swings down from the scoreboard on "paid", the lights flicker on over empty seats on "team", and
// the scoreboard flips to a big L on "barely" as the ball drops.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Glow, SourceLine, Stage, Tag, View, motion, type Motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Arena, GOLD, Hoopball, Scoreboard } from "./props";

type Params = { fig?: { paid?: string } };

/** Jordan at centre court under the scoreboard: frame 0, shared with the loop. */
export const CourtShot: React.FC<{ m: Motion; lights: number; board: string; ballY: number; children?: React.ReactNode }> = ({ m, lights, board, ballY, children }) => (
  <g>
    <Arena m={m} lights={lights} />
    <Scoreboard x={290} y={300} w={500} text={board} m={m} />
    <Glow x={540} y={1150} r={420} color="#fff4c8" o={0.45} ry={600} />
    <Char x={540} y={1330 + m.wave(50, 3)} s={260} outfit="suit" top="#1d2433" photo="jordan" face="smirk" armR={[150, 160]} armL={[20, 10]} />
    <Hoopball x={640} y={ballY} r={52} spin={m.t * 12} />
    {children}
  </g>
);

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const paid = (p.beat.params as Params).fig?.paid ?? "";
  const mike = m.at("michael", 2), pd = m.at("paid", 14), team = m.at("team", 80), barely = m.at("losing", 70);
  const tag = m.lerp([pd - 2, pd + 10], [0, 1], Easing.out(Easing.back(1.6)));
  const lights = m.t >= team ? 0.6 + 0.4 * (Math.floor(m.t / 3) % 2 === 0 || m.t > team + 12 ? 1 : 0) : 0.15 + 0.15 * m.pop(mike, 10);
  const drop = m.lerp([barely, barely + 12], [0, 1], Easing.bounce);
  const ballY = 760 + m.wave(14, 30) * (1 - drop) + 520 * drop;
  const wide = m.lerp([barely - 4, barely + 12], [0, 1], Easing.inOut(Easing.cubic));
  const push = m.lerp([pd - 4, pd + 12], [0, 1], Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#10132a" vignette={0.45}>
        <View zoom={1.05 + 0.15 * push - 0.15 * wide + 0.06 * m.lerp([56, 66], [0, 1]) * (1 - wide)} cx={540 - 50 * push + m.wave(60, 6)} cy={880 - 120 * push + 60 * wide + m.wave(70, 5)}>
          <CourtShot m={m} lights={lights} board={m.t >= barely ? "L" : ""} ballY={ballY}>
            <g transform={`rotate(${(1 - tag) * -30 + Math.sin(m.t / 9) * 3} 270 560)`} opacity={tag > 0 ? 1 : 0}>
              <Tag x={70} y={620} w={300} h={120} text={paid} size={64} bg={GOLD} k={tag} />
            </g>
          </CourtShot>
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Hook;
