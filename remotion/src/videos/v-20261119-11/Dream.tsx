// Turn: "So with every billionaire in, everyone gets rich? Not even close."
// Rohan's tiny apartment at night: he sits on his bed counting the bills on "So", a dream bubble opens over his head
// on "every", a sports car and a mansion appear in it on "rich", the bubble pops and the light drops cold on "Not",
// and his face falls on "close".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Cash, CityWindow, Flash, Glow, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { Bubble, Mansion, SportsCar } from "./props";

const Dream: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const every = m.at("everyone", 6), rich = m.at("rich", 26), not = m.at("not", 40), close = m.at("close", 50);
  const popped = m.t >= not;
  const bubble = popped ? 0 : m.pop(every - 1, 12);
  const dream = m.pop(rich - 1, 10);
  const cold = m.lerp([not - 1, not + 6], [0, 1]);
  const wide = m.lerp([rich - 4, rich + 10], [0, 1], Easing.inOut(Easing.cubic));
  const push = m.lerp([not - 2, not + 12], [0, 1], Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#2a2240" vignette={0.42}>
        <View zoom={1.1 - 0.1 * wide + 0.2 * push} cx={540 + m.wave(60, 8)} cy={860 + 160 * push + m.wave(70, 6)}>
          <rect x={-400} y={-400} width={1880} height={2700} fill={cold > 0.5 ? "#26304a" : "#3b2e4f"} />
          <CityWindow x={700} y={430} w={300} h={380} night seed="flat" />
          <Glow x={300} y={880} r={360} color={cold > 0.5 ? "#7fa8ff" : "#ffc87a"} o={0.45} />
          {/* the lamp */}
          <Block x={90} y={940} w={120} h={180} fill="#7a5a3a" />
          <path d="M 70 940 L 230 940 L 200 860 L 100 860 Z" fill={cold > 0.5 ? "#556" : "#ffe08a"} stroke="#1d1a2b" strokeWidth={6} />
          <rect x={-400} y={1250} width={1880} height={900} fill="#4a3a2a" />
          {/* the bed */}
          <Block x={260} y={1080} w={620} h={170} r={20} fill="#5a7bd8" />
          <Block x={230} y={980} w={60} h={270} fill="#7a5a3a" />
          <Char x={560} y={1260} s={210} who="rohan" sit face={m.t >= close ? "sad" : popped ? "shock" : m.t >= rich ? "grin" : "happy"}
            look={popped ? [0, 0.3] : m.t >= every ? [0.3, -1] : [0, 0.6]} armR={[60, 100]} armL={[50, 110]} sweat={m.t >= close} />
          {[0, 1, 2].map((i) => <Cash key={i} x={500 + i * 30} y={1110 - i * 8} w={90} />)}
          <Bubble x={150} y={250} w={780} h={440} k={bubble} tx={560} ty={760}>
            {dream > 0 ? (
              <g opacity={Math.min(1, dream)}>
                <Mansion x={220} y={600} w={320} />
                <SportsCar x={560} y={600} w={320} />
                <Txt x={540} y={330} size={58} fill="#1d1a2b">RICH?</Txt>
              </g>
            ) : null}
          </Bubble>
          {popped ? (
            <g>
              {/* the dream falls to bits on the floor, grey */}
              <g opacity={0.85} transform={`translate(0 ${m.lerp([not, not + 14], [-300, 0], Easing.in(Easing.quad))})`}>
                <g transform="rotate(-8 300 900)"><Mansion x={150} y={760} w={300} /></g>
                <g transform="rotate(10 760 900)"><SportsCar x={600} y={760} w={320} /></g>
              </g>
              <path d="M 160 380 L 920 760 M 920 380 L 160 760" stroke="#e9473b" strokeWidth={34} strokeLinecap="round" opacity={m.pop(not + 6)} />
              <Txt x={540} y={300} size={84} fill="#ff6b5a" stroke="#1d1a2b">NOT RICH</Txt>
            </g>
          ) : null}
        </View>
        <Flash k={m.pulse(not, 5)} color="#cfe0ff" />
      </Stage>
    </AbsoluteFill>
  );
};

export default Dream;
