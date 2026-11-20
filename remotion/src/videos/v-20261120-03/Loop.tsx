// Loop: "Winning games or owning the team: which made Michael Jordan richer?"
// Back in the empty arena at night: a trophy lights up on the left on "Winning", a team deed lights up on the right on
// "owning", Jordan looks from one to the other on "made", and the spotlight snaps back onto him at centre court on
// "richer", the hook's first frame.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Ball, Block, Glow, Stage, Tag, View, motion } from "../../flat/kit";
import { CourtShot } from "./Hook";
import { GOLD } from "./props";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const win = m.at("winning", 2), own = m.at("owning", 16), richer = m.at("richer", 60);
  const a = m.pop(win - 1, 10), b = m.pop(own - 1, 10);
  const settle = m.lerp([richer - 4, m.end], [0, 1], Easing.inOut(Easing.cubic));
  const fade = 1 - m.lerp([richer, richer + 10], [0, 1]);
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#10132a" vignette={0.45}>
        <View zoom={0.98 + 0.07 * settle} cx={540 + m.wave(60, 6) * (1 - settle)} cy={900 - 20 * settle}>
          <CourtShot m={m} lights={0.3} board="" ballY={760 + m.wave(14, 30)}>
            <g opacity={fade}>
              {a > 0 ? (
                <g transform={`translate(190 1000) scale(${a})`}>
                  <Glow x={0} y={-120} r={200} color={GOLD} o={0.5} />
                  <Ball x={0} y={-180} r={80} fill={GOLD} />
                  <Block x={-20} y={-110} w={40} h={80} fill={GOLD} />
                  <Block x={-70} y={-40} w={140} h={40} r={6} fill="#8a5a2c" />
                </g>
              ) : null}
              {b > 0 ? (
                <g transform={`translate(880 960) scale(${b})`}>
                  <Glow x={0} y={-80} r={200} color="#7fd1a8" o={0.5} />
                  <Block x={-90} y={-200} w={180} h={230} r={8} fill="#f6ecd2" />
                  {[0, 1, 2, 3].map((i) => <rect key={i} x={-60} y={-160 + i * 40} width={120} height={10} rx={4} fill="#c8bfae" />)}
                </g>
              ) : null}
              <Tag x={80} y={760} w={240} h={90} text="WIN" bg={GOLD} k={a > 0.5 ? 1 : 0} />
              <Tag x={760} y={720} w={240} h={90} text="OWN" bg="#7fd1a8" k={b > 0.5 ? 1 : 0} />
            </g>
          </CourtShot>
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Loop;
