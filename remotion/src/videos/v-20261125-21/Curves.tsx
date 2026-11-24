// Curves: "Bend one flat sheet into a smooth dome: a single patch, round edges."
// A drafting table of light; a flat glowing sheet lifts its corners and bends up (medium); "patch": its
// rim glows (close); "dome": it closes into a smooth dome; "few": a plate on the table edge reads "one
// piece"; "round"/"edges": light slides down its rim (medium).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Label3D, Stage3D } from "../../three/index";
import { AMBER, LightTable, Plinth, SmoothDome, k01 } from "./Parts";

const Curves: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const flat = m.at("flat", 6);
  const sheet = m.at("sheet", 12);
  const curve = m.at("sheet", 12) + 10;
  const dome = m.at("dome", 30);
  const single = m.at("single", 40);
  const patch = m.at("patch", 46);
  const few = single;
  const round = m.at("round", 74);
  const edges = m.at("edges", 80);
  const end = Math.max(m.end, edges + 20);
  const rise = 0.04 + 0.5 * k01(f, sheet, 18) + 0.3 * k01(f, curve, 16) + 0.16 * k01(f, dome, 14);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 0.4, 0], dir: [0.4, 0.55, 1], from: 8, to: 7.2, dur: Math.max(8, patch), fov: 35 },
    { at: single, move: "orbit", center: [0, 0.4, 0], radius: 6.6, height: 3.2, from: 0.4, to: 0.9, dur: Math.max(8, patch - single) },
    { at: patch, move: "push", look: [0, 0.5, 0.4], dir: [0.6, 0.5, 1], from: 5.4, to: 4.6, dur: Math.max(8, few - patch) },
    { at: few, move: "pullback", look: [0, 0.4, 0.4], dir: [0.4, 0.5, 1], from: 6.4, to: 7.4, dur: Math.max(10, end - few) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#10172c", bottom: "#030409", glow: "rgba(255,179,64,0.10)" }} floor={false} bloom={1.1} dof={0} blur={1}>
        <Camera3D keys={keys} seed="v2521-curves" />
        <LightTable lit={0.6 + 0.4 * m.pulse(flat + 4, 10)} />
        <SmoothDome r={1.3} rise={rise} lit={0.3 + 0.7 * k01(f, patch, 8) * (0.7 + 0.3 * m.pulse(round + 6, 10))} grid={1 - 0.6 * k01(f, dome, 12)} rotation-y={f * 0.01} />
        <Label3D at={[1.3, 0.05, 0]} offset={[0.5, 0.9, 0.6]} text="one patch" start={patch + 2} px={56} color={AMBER} align="center" />
        <Plinth position={[0, 0, 1.6]} w={1.8} lit={k01(f, few, 8)} />
        <Label3D at={[0, 0.5, 1.7]} offset={[-0.4, 0.5, 0.3]} text="one piece" start={few} px={56} color={AMBER} align="center" />
        <pointLight position={[2.5, 3, 2.5]} intensity={8} color="#ffd9a0" distance={10} />
      </Stage3D>
    </Freeze>
  );
};
export default Curves;
