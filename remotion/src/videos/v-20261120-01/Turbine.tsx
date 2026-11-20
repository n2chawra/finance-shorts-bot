// Turbine: "At the bottom, it slams into a turbine's curved blades and spins it."
// The turbine pit. The pipe's mouth opens into the see-through spiral case ("bottom", medium); water
// streams hit the runner and it jolts ("slams"); a label writes on ("turbine's"); the curved blades
// light one after another ("curved"); close on the blades ("blades"); it whirls and the camera orbits ("spins").
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, glow, Label3D, mat, Stage3D, TECH } from "../../three/index";
import { Runner, Scroll, k01 } from "./Parts";

const Turbine: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const bottom = m.at("below", 2);
  const slams = m.at("slams", 20);
  const turb = m.at("turbine's", 32);
  const curved = m.at("curved", 42);
  const blades = m.at("blades", 50);
  const spins = m.at("spins", 62);
  const end = Math.max(m.end, spins + 24);
  const after = (a: number) => Math.max(0, f - a);
  const turn = 0.01 * f + 0.06 * after(slams) + 0.08 * after(spins) + 0.25 * k01(f, slams, 6);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 0, 0], dir: [0.35, 0.9, 1], from: 7.5, to: 6.2, dur: Math.max(8, blades), fov: 40 },
    { at: blades, move: "push", look: [0.4, 0.05, 0.3], dir: [0.7, 0.35, 1], to: 3.2, dur: Math.max(8, spins - blades) },
    { at: spins, move: "orbit", center: [0, 0, 0], radius: 5.2, height: 2.6, from: 0.6, to: 1.6, dur: Math.max(16, end - spins) },
  ]);
  const open = k01(f, bottom, 10);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#0a1626", bottom: "#03050a", glow: "rgba(56,225,255,0.12)" }} floor="reflect" bloom={1} dof={0} blur={1} shadowBox={5}>
        <Camera3D keys={keys} seed="v2001-turbine" />
        <group position={[0, 1.0, 0]}>
          <Scroll f={f} flow={0.2 + 1.0 * k01(f, slams - 4, 8)} o={0.3} />
          <Runner turn={turn} lit={k01(f, curved, 16)} position={[0, -0.05 * m.pulse(slams + 2, 6), 0]} />
          {/* the shaft up to the generator */}
          <mesh position={[0, 1.6, 0]} material={mat("brushed", "#8f99a6")}><cylinderGeometry args={[0.18, 0.18, 2.6, 20]} /></mesh>
          {/* the pipe's mouth feeding the case */}
          <mesh position={[-2.6, 0, 1.45]} rotation-z={Math.PI / 2} material={mat("brushed", "#9aa3b0")}><cylinderGeometry args={[0.4, 0.4, 2.4, 24, 1, true]} /></mesh>
          <mesh position={[-1.4, 0, 1.45]} rotation-y={Math.PI / 2} material={glow("#bfeaff", Math.round((0.2 + 1.0 * open) * 20) / 20)}><circleGeometry args={[0.38, 24]} /></mesh>
        </group>
        <Label3D at={[0.5, 1.4, 0.3]} offset={[-0.3, 1.3, 0]} text="turbine" sub="curved blades" start={turb} end={blades + 2} px={54} color={TECH.white} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Turbine;
