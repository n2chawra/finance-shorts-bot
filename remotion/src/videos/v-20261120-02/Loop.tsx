// Loop: "Crew or CEO: who really makes McDonald's its money? Look at the counter."
// Back at the McDonald's counter. A CREW button lights over the crew member on "Crew", Kempczinski's real face appears on
// the menu screen with a CEO button on "CEO", the till drawer pops open on "money", and on "Look" the camera settles on
// the counter, the hook's first frame.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Stage, Tag, View, motion } from "../../flat/kit";
import { PhotoHead } from "../../studio/photo";
import { CounterShot } from "./Hook";
import { GOLD } from "./props";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const crew = m.at("crew", 2), ceo = m.at("ceo", 14), money = m.at("money", 40), look = m.at("look", 60);
  const a = m.pop(crew - 1, 10), b = m.pop(ceo - 1, 10);
  const till = m.lerp([money - 2, money + 6], [0, 1], Easing.out(Easing.back(2)));
  const settle = m.lerp([look - 4, m.end], [0, 1], Easing.inOut(Easing.cubic));
  const fade = 1 - m.lerp([look, look + 12], [0, 1]);
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#7a1a14" vignette={0.38}>
        <View zoom={0.98 + 0.07 * settle} cx={540 + m.wave(60, 6) * (1 - settle)} cy={860 + 20 * settle}>
          <CounterShot m={m} lit={1} slide={0}
            menu={b > 0 ? (
              <g opacity={fade}>
                <Block x={760} y={300} w={300} h={260} r={12} fill="#1d1a2b" />
                <g transform={`translate(910 450) scale(${b})`}><PhotoHead name="kempczinski" r={55} /></g>
                <Tag x={790} y={190} w={220} h={90} text="CEO" bg="#ffffff" k={b} rot={3} />
              </g>
            ) : null}>
            <g opacity={fade}>
              <Block x={360} y={1080 - 90 * till} w={220} h={90} r={8} fill="#3a3a48" />
              <Tag x={360} y={860} w={240} h={100} text="CREW" bg={GOLD} k={a} rot={-4} />
            </g>
          </CounterShot>
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Loop;
