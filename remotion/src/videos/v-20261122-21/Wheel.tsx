// Wheel: "At the front, a steel wheel spins into the London clay, cutting a hole {fact3} metres across."
// Ahead of the machine, facing the cutterhead in the hole it cuts: the camera swings round to it
// ("front", medium); a label writes on ("steel", close); the wheel spins faster ("spins"); clay chunks
// crumble off the face ("clay"); a bracket spans the wheel ("hole", medium) and its figure lands ("across").
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Bracket3D, Camera3D, direct, Label3D, Stage3D, TECH } from "../../three/index";
import { Chunks, Cutterhead, Face, Shield, k01 } from "./Parts";
import { BACK } from "./Hook";

type Params = { fig?: { diameter?: string } };

const Wheel: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const front = m.at("front", 4);
  const steel = m.at("steel", 16);
  const spins = m.at("spins", 26);
  const clay = m.at("clay", 40);
  const hole = m.at("hole", 56);
  const across = m.at("across", 76);
  const end = Math.max(m.end, across + 16);
  const fig = (p.beat.params as Params).fig ?? {};
  const speed = 0.05 + 0.1 * k01(f, spins, 12);
  // the spin, integrated so speeding up never jumps
  const spin = 0.05 * f + 0.1 * Math.max(0, f - spins - 6);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 0, 0], dir: [0.6, 0.15, 0.78], from: 6.5, to: 5.6, dur: Math.max(8, steel), fov: 42 },
    { at: steel, move: "push", look: [0, 0.1, 0], dir: [0.9, 0.12, 0.42], to: 3.6, dur: Math.max(10, hole - steel) },
    { at: hole, move: "pullback", look: [0, 0, 0], dir: [0.95, 0.1, 0.3], to: 5.2, dur: Math.max(12, end - hole) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor={false} bloom={1} dof={0} blur={1} shadowBox={6}>
        <Camera3D keys={keys} seed="v2221-wheel" />
        <group position={[0, 0.02 * Math.sin(f * 1.7) * speed * 10, 0]}>
          <Cutterhead spin={spin} lit={0.5 + 0.8 * m.pulse(spins + 2, 12)} />
          <Shield />
        </group>
        <Face position={[0.08, 0, 0]} />
        <Chunks f={f} k={k01(f, clay, 10)} position={[0.2, 0.3, 0]} />
        <Label3D at={[0.1, 0.95, 0.3]} offset={[0.2, 0.8, 0.4]} text="cutterhead" start={steel + 2} end={hole} px={58} color={TECH.white} align="center" />
        <Bracket3D from={[0.25, -1, 1.05]} to={[0.25, 1, 1.05]} side={[0, 0, 1]} fig={fig.diameter ?? ""} caption="metres across" start={hole} px={80} color={TECH.amber} />
      </Stage3D>
    </Freeze>
  );
};
export default Wheel;
