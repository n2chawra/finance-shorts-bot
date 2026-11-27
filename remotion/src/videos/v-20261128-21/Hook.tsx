// Hook: "This motor fits in your hand, yet it spins a whole car engine to life."
// Frame 0: the starter, cut open, already spinning at the foot of a cut-open engine (medium). "motor": its
// label writes on; "hand": a second line says it is hand-sized; "spins": the ring gear's teeth light as it
// turns; "whole" (wide): the camera pulls back to the whole engine towering over it, pistons moving;
// "life": the cylinders flash and the camera settles in (medium).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Label3D, Stage3D, TECH } from "../../three/index";
import { BACK, HC, Machine, RING_TEETH, STARTER_AT, k01 } from "./Parts";

export const OPEN_LOOK: [number, number, number] = [STARTER_AT[0] + 1.0, STARTER_AT[1] + 0.15, STARTER_AT[2]];
export const OPEN_DIR: [number, number, number] = [0.42, 0.28, 0.86];
export const SPIN = 0.55;

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const motor = m.at("motor", 2);
  const hand = m.at("hand-sized", 10);
  const spins = m.at("starts", 22);
  const whole = m.at("whole", 30);
  const life = m.at("engine", 40);
  const end = Math.max(m.end, life + 20);
  const keys = direct({}, [
    { at: 0, move: "push", look: OPEN_LOOK, dir: OPEN_DIR, from: 3.9, to: 3.4, dur: Math.max(8, whole), fov: 40 },
    { at: whole, move: "pullback", look: [2.3, HC + 0.4, 0.4], dir: [0.4, 0.3, 0.87], to: 10.5, dur: Math.max(12, life - whole + 6) },
    { at: life + 6, move: "push", look: [2.0, HC, 0.5], dir: [0.38, 0.28, 0.88], to: 8.6, dur: Math.max(10, end - life - 6) },
  ]);
  const sweep = k01(f, spins, 24);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor="reflect" bloom={1} dof={0} blur={1} shadowBox={8} fog={{ color: "#05070f", near: 14, far: 36 }}>
        <Camera3D keys={keys} seed="v2821-hook" />
        <Machine pinion={f * SPIN} engage={1} coil={0.7} contact={0.7} windings={0.6} fire={0.15 + 0.85 * k01(f, life, 8)}
          ringLit={(i) => (i / RING_TEETH < sweep ? 0.6 * (1 - k01(f, whole + 10, 20)) : 0)} />
        <Label3D at={[STARTER_AT[0] + 1.2, STARTER_AT[1] + 0.3, STARTER_AT[2]]} offset={[0.2, 0.75, 0.3]} text="starter motor"
          sub={f >= hand ? "hand-sized" : undefined} start={-20} end={whole + 6} px={60} color={TECH.white} align="center" />
        <Label3D at={[2.6, HC + 2.6, 0]} offset={[0.3, 0.8, 0.3]} text="car engine" start={whole + 4} px={60} color={TECH.cyan} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Hook;
