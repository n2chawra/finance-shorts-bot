// Push: "Here's the catch: deeper water pushes harder. When the lake drops, the push weakens."
// The lake in cross-section against the dam. The cut face lights ("catch", medium); the camera sinks
// down the water, darker with depth ("deeper", wide); pressure arrows press on the dam, longest at the
// bottom ("pushes"); the bottom arrow pulses ("harder"); the waterline glows ("lake"); the level slides
// down, the white band left behind ("drops"); the arrows shrink and the flow into the pipe slows ("weakens", close).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, glow, Label3D, Stage3D, TECH } from "../../three/index";
import { Arrow, FULL, LOW, Section, k01 } from "./Parts";

const DEPTHS = [3.0, 2.3, 1.6, 0.9, 0.25];

const Push: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const catchW = m.at("water", 4);
  const deeper = m.at("deeper", 22);
  const pushes = m.at("pushes", 34);
  const harder = m.at("harder", 42);
  const lake = m.at("lake", 58);
  const drops = m.at("drops", 66);
  const weakens = m.at("weakens", 86);
  const end = Math.max(m.end, weakens + 24);
  const level = FULL - (FULL - LOW) * k01(f, drops, 26);
  const keys = direct({}, [
    { at: 0, move: "push", look: [-1.4, 1.6, 0], dir: [0.12, 0.08, 1], from: 9.5, to: 8.5, dur: Math.max(8, deeper), fov: 40 },
    { at: deeper, move: "pullback", look: [-1.2, 1.0, 0], dir: [0.1, 0.05, 1], to: 11.5, dur: Math.max(8, drops - deeper) },
    { at: drops, move: "push", look: [-1.0, 1.2, 0], dir: [0.1, 0.1, 1], to: 9.0, dur: Math.max(8, weakens - drops) },
    { at: weakens, move: "push", look: [-1.1, 0.3, 0], dir: [0.15, 0.12, 1], to: 4.6, dur: Math.max(12, end - weakens) },
  ]);
  const shown = k01(f, pushes, 10);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#081a2c", bottom: "#02050a", glow: "rgba(56,225,255,0.10)" }} floor={false} bloom={1} dof={0} blur={1} shadowBox={8}>
        <Camera3D keys={keys} seed="v2001-push" />
        <Section f={f} level={level} flow={1 - 0.75 * k01(f, weakens, 12)} pipeLit={0.2} towerLit={0.3} />
        {/* darker water with depth */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[-3.2, -0.2 + i * 0.6, 0.415]} material={glow("#02152b", Math.round(0.35 * k01(f, deeper, 14) * (1 - i * 0.3) * 20) / 20)}>
            <planeGeometry args={[5.9, 0.6]} />
          </mesh>
        ))}
        {/* the pressure arrows on the dam's lake face */}
        {DEPTHS.map((y, i) => {
          const d = Math.max(0, level - 0.2 - y);
          const big = i === DEPTHS.length - 1 ? 1 + 0.25 * m.pulse(harder + 2, 10) : 1;
          return <Arrow key={i} position={[-0.32 - (0.25 + 0.42 * d) * big * shown, y, 0.45]} len={(0.25 + 0.42 * d) * big * shown} o={0.5 + 0.6 * shown} />;
        })}
        {/* the waterline, lit on "lake" */}
        <mesh position={[-3.2, level - 0.2, 0.43]} material={glow("#bfeaff", Math.round((0.3 + 0.9 * m.pulse(lake + 4, 12)) * 20) / 20)}><boxGeometry args={[5.9, 0.04, 0.01]} /></mesh>
        <Label3D at={[-0.9, 0.25, 0.5]} offset={[-1.2, -1.0, 0]} text="deeper = harder push" start={harder} end={drops + 4} px={52} color={TECH.amber} align="center" />
        <Label3D at={[-2.4, level - 0.2, 0.5]} offset={[-0.6, 1.0, 0]} text="Lake Mead" start={catchW + 4} end={deeper + 6} px={54} color={TECH.cyan} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Push;
