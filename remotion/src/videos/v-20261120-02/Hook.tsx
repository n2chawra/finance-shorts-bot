// Hook: "McDonald's typical worker makes {fact2}. And the CEO?"
// The McDonald's counter at lunchtime under the real golden arches (frame 0), the crew member sliding a carton of fries
// across to Rohan. The arches flare on "McDonald's", a pay slip pops up on the tray with the year's pay on "earns",
// a flash cut on "So" tilts up the head office tower, the top window lights gold on "CEO" and a question mark stamps on
// it on "one".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Flash, SourceLine, Stage, Tag, Txt, View, motion, type Motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Fries, GOLD, PaySlip, RED, Restaurant, Tower } from "./props";

type Params = { fig?: { pay?: string } };

/** The counter shot, shared with the loop: frame 0 of the video. */
export const CounterShot: React.FC<{ m: Motion; lit: number; slide: number; children?: React.ReactNode; menu?: React.ReactNode }> = ({ m, lit, slide, children, menu }) => (
  <Restaurant m={m} lit={lit} crewArm={1 - slide} menu={menu}>
    <Fries x={700 - 330 * slide} y={1150} s={1.1} />
    <Char x={200} y={1720 + m.wave(50, 3)} s={300} who="rohan" back armR={[60 + 30 * slide, 40]} />
    {children}
  </Restaurant>
);

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const pay = (p.beat.params as Params).fig?.pay ?? "";
  const mcd = m.at("mcd", 2), earns = m.at("makes", 16), so = m.at("and", 50), ceo = m.at("ceo", 58), one = ceo + 8;
  const lit = Math.max(0.6, m.lerp([mcd, mcd + 8], [0.6, 1]));
  const slide = m.lerp([0, earns], [0, 1], Easing.out(Easing.cubic));
  const slip = m.pop(earns - 2, 10);
  const tilt = m.lerp([so, ceo + 6], [0, 1], Easing.inOut(Easing.cubic));
  const top = m.t >= ceo ? 1 : 0;
  const q = m.pop(one - 1, 8);
  const towerShot = m.t >= so;
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#7a1a14" vignette={0.38}>
        {!towerShot ? (
          <View zoom={1.05 + 0.12 * m.lerp([earns - 4, earns + 10], [0, 1])} cx={540 + 60 * slip + m.wave(60, 6)} cy={880 + 60 * slip + m.wave(70, 5)}>
            <CounterShot m={m} lit={lit} slide={slide}>
              <PaySlip x={420} y={760} w={440} value={pay} label="PAY A YEAR" k={slip} rot={-4} />
            </CounterShot>
          </View>
        ) : (
          <View zoom={1.0 + 0.12 * tilt} cx={540 + m.wave(60, 6)} cy={1500 - 1450 * tilt}>
            <Tower m={m} top={top} />
            <Tag x={380} y={-330} w={320} h={120} text="CEO" bg={GOLD} fg="#1d1a2b" k={m.pop(ceo - 1, 9)} />
            {q > 0 ? (
              <g transform={`translate(540 -90) scale(${q})`}>
                <Txt x={0} y={0} size={200} fill={RED} stroke="#ffffff">?</Txt>
              </g>
            ) : null}
          </View>
        )}
        <Flash k={m.pulse(so, 5) * 0.7} color={GOLD} />
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Hook;
