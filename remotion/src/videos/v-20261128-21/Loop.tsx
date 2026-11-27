// Loop: "Jet engine or wind turbine next? And when you turn the key, think of this motor."
// The dark studio, wide: "Jet": a jet engine's fan glows in the dark on the left; "turbine": a wind turbine's
// blades turn on the right; "next": both fade as the camera glides back to the engine; "key": the starter's
// pinion shoots forward again; "think": the camera settles on the starter framed as the first frame; "motor":
// its armature spins, as at the start (the loop).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, glow, Label3D, mat, Stage3D, TECH } from "../../three/index";
import { BACK, Machine, k01, q } from "./Parts";
import { OPEN_DIR, OPEN_LOOK, SPIN } from "./Hook";

const Fan: React.FC<{ spin: number; o: number }> = ({ spin, o }) => (
  <group position={[-3.4, 3.4, -2]} rotation-y={0.5}>
    <mesh rotation-x={Math.PI / 2} material={mat("brushed", "#8b929e", { side: 2 })}>
      <cylinderGeometry args={[1.3, 1.3, 1.6, 40, 1, true]} />
    </mesh>
    <group rotation-z={spin}>
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} rotation-z={(i / 14) * Math.PI * 2} position={[0, 0, 0.5]} material={glow(TECH.cyan, q(0.3 + 0.6 * o))}>
          <boxGeometry args={[0.08, 1.15, 0.03]} />
        </mesh>
      ))}
    </group>
  </group>
);

const Turbine: React.FC<{ spin: number; o: number }> = ({ spin, o }) => (
  <group position={[7.5, 0, -3]}>
    <mesh position={[0, 3, 0]} material={mat("white", "#dfe4ee")}>
      <cylinderGeometry args={[0.1, 0.2, 6, 16]} />
    </mesh>
    <group position={[0, 6.1, 0.3]} rotation-z={spin}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation-z={(i / 3) * Math.PI * 2} position={[0, 0, 0]} material={glow(TECH.amber, q(0.3 + 0.6 * o))}>
          <boxGeometry args={[0.16, 5.2, 0.05]} />
        </mesh>
      ))}
    </group>
  </group>
);

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const jet = m.at("jet", 2);
  const engine = m.at("engine", 6);
  const turbine = m.at("turbine", 14);
  const and = m.at("when", 32);
  const next = m.at("next", 24);
  const key = m.at("key", 40);
  const think = m.at("think", 50);
  const motor = m.at("motor", 62);
  const end = Math.max(m.end, motor + 14);
  const fade = 1 - k01(f, next, 14);
  const keys = direct({}, [
    { at: 0, move: "push", look: [2.0, 2.6, -0.5], dir: [0.3, 0.2, 0.93], from: 15, to: 14, dur: Math.max(10, next), fov: 40 },
    { at: next, move: "push", look: OPEN_LOOK, dir: OPEN_DIR, to: 5.2, dur: Math.max(12, think - next) },
    { at: think, move: "push", look: OPEN_LOOK, dir: OPEN_DIR, to: 3.9, dur: Math.max(10, end - think) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor="reflect" bloom={1} dof={0} blur={1} shadowBox={8} fog={{ color: "#05070f", near: 16, far: 40 }}>
        <Camera3D keys={keys} seed="v2821-loop" />
        {fade > 0.02 && f >= jet && <Fan spin={f * 0.12 + 0.25 * Math.max(0, f - engine)} o={fade * k01(f, jet, 8)} />}
        {fade > 0.02 && f >= turbine && <Turbine spin={f * 0.06} o={fade * k01(f, turbine, 8)} />}
        <Machine pinion={f * SPIN} engage={k01(f, key, 6)} coil={0.7 * k01(f, key, 4)} contact={0.7 * k01(f, key, 4)} windings={0.6 * k01(f, motor, 6)} fire={0.15 + 0.6 * k01(f, and, 8) * (1 - k01(f, think, 10))} />
        {f < next + 4 && <Label3D at={[-3.4, 4.8, -2]} offset={[0, 0.6, 0.2]} text="jet engine" start={jet + 2} end={next + 4} px={56} color={TECH.cyan} align="center" />}
        {f < next + 4 && <Label3D at={[7.5, 3.2, -3]} offset={[-0.6, 0.4, 0.2]} text="wind turbine" start={turbine + 2} end={next + 4} px={56} color={TECH.amber} align="center" />}
      </Stage3D>
    </Freeze>
  );
};
export default Loop;
