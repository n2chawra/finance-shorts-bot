// Loop: "The show, or the members it pulled in: which was Netflix paying for? So"
// Back at the playground arena at night: the Netflix camera rolls on "show", a crowd of glowing phone screens rises in
// the stands on "members", Rohan in the stands looks from the camera to the phones on "paying", and on "So" the camera
// settles on the arena and the red traffic light, the hook's first frame.
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { Block, Stage, View, motion } from "../../flat/kit";
import { Char } from "../../flat/cast";
import { ArenaShot } from "./Hook";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const show = m.at("show", 2), members = m.at("members", 14), paying = m.at("paying", 40), so = m.at("so", 55);
  const phones = m.lerp([members - 2, members + 14], [0, 1], Easing.out(Easing.back(1.3)));
  const settle = m.lerp([so - 6, so + 4], [0, 1], Easing.inOut(Easing.cubic));
  const wide = m.lerp([members - 4, members + 10], [0, 1], Easing.inOut(Easing.cubic));
  const look: [number, number] = m.t >= paying ? (Math.floor((m.t - paying) / 9) % 2 ? [-1, 0] : [1, 0]) : [-1, 0];
  const camPush = m.pulse(show + 6, 10);
  return (
    <AbsoluteFill>
      <Stage p={p} bg="#1b1030" vignette={0.4}>
        <View zoom={1.12 - 0.12 * wide - 0.0 * settle + 0.04 * camPush} cx={560 - 20 * settle + m.wave(50, 8)} cy={920 - 20 * settle + m.wave(64, 6)}>
          <ArenaShot m={m} green={0}>
            {/* the phones rising in the stands, fading as the loop settles */}
            <g opacity={1 - settle}>
              {Array.from({ length: 8 }).map((_, i) => (
                <g key={i} transform={`translate(0 ${(1 - phones) * 260})`}>
                  <Block x={600 + (i % 4) * 110} y={620 + Math.floor(i / 4) * 170} w={80} h={140} r={14} fill="#1d1a2b" />
                  <rect x={610 + (i % 4) * 110} y={634 + Math.floor(i / 4) * 170} width={60} height={110} rx={8} fill={i % 2 ? "#f07aa8" : "#3dff8a"} opacity={0.6 + 0.3 * Math.sin(m.t / 6 + i)} />
                </g>
              ))}
              <Char x={760} y={1340 + m.wave(50, 3)} s={140} who="rohan" face="worried" look={look} armR={[40, 30]} armL={[40, 30]} />
            </g>
          </ArenaShot>
        </View>
      </Stage>
    </AbsoluteFill>
  );
};

export default Loop;
