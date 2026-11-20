// Build: "On the court, it kept losing. Not one playoff round won while he ran it."
// The locker room after another loss: the door bangs open and the players slump onto the bench on "court", L stickers
// slap onto the whiteboard one after another on "losing", the empty playoff bracket on the wall gets a red cross on
// "playoff", and Jordan in his suit shakes his head in the doorway on "ran".
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Limb, SourceLine, Stage, Txt, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { PURPLE, TEAL } from "./props";

const Locker: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const court = m.at("court", 6), losing = m.at("losing", 20), playoff = m.at("playoff", 50), ran = m.at("ran", 80);
  const slump = m.lerp([court, court + 10], [0, 1]);
  const ls = Math.max(0, Math.min(8, Math.floor((m.t - losing) / 3) + 1));
  const cross = m.lerp([playoff, playoff + 8], [0, 1], Easing.out(Easing.back(2)));
  const shake = m.t >= ran ? m.wave(8, 12) : 0;
  const push = m.lerp([playoff - 4, playoff + 12], [0, 1], Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#1c2a33" vignette={0.42}>
        <View zoom={1.0 + 0.15 * push} cx={540 + m.wave(60, 6)} cy={860 - 220 * push + m.wave(70, 5)}>
          <rect x={-500} y={-600} width={2080} height={3200} fill="#2f4552" />
          {Array.from({ length: 7 }).map((_, i) => <Block key={i} x={-260 + i * 230} y={760} w={200} h={520} r={6} fill={i % 2 ? TEAL : "#22707c"} />)}
          <rect x={-500} y={1270} width={2080} height={1300} fill="#5a6470" />
          {/* the whiteboard of losses */}
          <Block x={100} y={240} w={470} h={420} r={10} fill="#f4f6f8" />
          {Array.from({ length: ls }).map((_, i) => (
            <Txt key={i} x={170 + (i % 4) * 105} y={340 + Math.floor(i / 4) * 160} size={110} fill="#e23b3b" rotate={((i * 37) % 20) - 10}>L</Txt>
          ))}
          {/* the playoff bracket */}
          <Block x={620} y={240} w={400} h={420} r={10} fill="#e7e1d6" />
          <Txt x={820} y={300} size={48} fill={PURPLE}>PLAYOFFS</Txt>
          {[0, 1, 2, 3].map((i) => <rect key={i} x={660} y={360 + i * 70} width={130} height={40} rx={6} fill="#ffffff" stroke="#1d1a2b" strokeWidth={4} />)}
          {[0, 1].map((i) => <rect key={i} x={830} y={395 + i * 140} width={130} height={40} rx={6} fill="#ffffff" stroke="#1d1a2b" strokeWidth={4} />)}
          {cross > 0 ? (
            <g opacity={cross} transform={`translate(820 460) scale(${cross})`}>
              <Limb a={[-150, -150]} b={[150, 150]} w={30} color="#e23b3b" />
              <Limb a={[150, -150]} b={[-150, 150]} w={30} color="#e23b3b" />
            </g>
          ) : null}
          {/* the bench and the players */}
          <Block x={-100} y={1230} w={1280} h={70} r={10} fill="#8a5a2c" />
          {[150, 400, 650].map((x, i) => (
            <Char key={x} x={x} y={1300 + 30 * slump} s={200} sit top={TEAL} skin={["#8a5a3c", "#c98652", "#5a3a2a"][i]} face="sad" look={[0, 0.8 * slump]} tilt={8 * slump} />
          ))}
          {/* Jordan in the doorway */}
          <Block x={740} y={700} w={240} h={600} fill="#1d1a2b" />
          <g transform={`rotate(${shake * 0.1} 860 1300)`}>
            <Char x={860} y={1300} s={170} outfit="suit" top="#1d2433" photo="jordan" face="sad" armL={[20, 10]} armR={[20, 10]} />
          </g>
        </View>
      </Stage>
      <SourceLine p={p} />
    </AbsoluteFill>
  );
};

export default Locker;
