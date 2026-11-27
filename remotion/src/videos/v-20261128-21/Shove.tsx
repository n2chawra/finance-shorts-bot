// Shove: "That pulls a lever, shoving a small gear, the pinion, into the big toothed ring on the flywheel."
// The starter's nose beside the flywheel's rim (medium), slowed down. "pulls": the plunger draws the top of the
// fork lever back; "lever": it pivots, labelled; "shoving": its foot pushes the pinion along the shaft;
// "pinion": close on the pinion, labelled; "big": its teeth slide in between the ring's, which light amber;
// "flywheel": pull back to the whole flywheel with the pinion meshed at its rim (wide).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Label3D, Stage3D, TECH } from "../../three/index";
import { BACK, Flywheel, HC, RING_TEETH, STARTER_AT, Starter, k01, pinionX } from "./Parts";

export const MESH_ANGLE = Math.PI - 0.62;

const Shove: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const pulls = m.at("pulls", 4);
  const lever = m.at("lever", 12);
  const shoving = m.at("shoving", 20);
  const pinion = m.at("pinion", 34);
  const big = m.at("toothed", 46);
  const fly = m.at("flywheel", 60);
  const end = Math.max(m.end, fly + 20);
  const engage = 0.25 * k01(f, pulls, Math.max(6, shoving - pulls)) + 0.75 * k01(f, shoving, Math.max(8, big - shoving));
  const [sx, sy, sz] = STARTER_AT;
  const keys = direct({}, [
    { at: 0, move: "push", look: [sx + 0.5, sy + 0.25, sz], dir: [0.25, 0.3, 0.92], from: 2.8, to: 2.4, dur: Math.max(8, pinion), fov: 40 },
    { at: pinion, move: "push", look: [sx + 0.15, sy, sz], dir: [0.2, 0.25, 0.95], to: 2.0, dur: Math.max(8, fly - pinion) },
    { at: fly, move: "pullback", look: [0.3, HC - 0.4, 0.5], dir: [0.45, 0.2, 0.87], to: 6.4, dur: Math.max(12, end - fly) },
  ]);
  const lit = k01(f, big, 10);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor="reflect" bloom={1} dof={0} blur={1} shadowBox={6} fog={{ color: "#05070f", near: 10, far: 30 }}>
        <Camera3D keys={keys} seed="v2821-shove" />
        <Flywheel position={[0, HC, 0]} angle={0} lit={(i) => {
          const a = (i / RING_TEETH) * Math.PI * 2;
          return Math.abs(a - MESH_ANGLE) < 0.45 ? lit : 0;
        }} />
        <Starter position={STARTER_AT} engage={engage} spin={0} coil={0.8} see={1} />
        <Label3D at={[sx + 0.85, sy + 0.5, sz]} offset={[0.3, 0.7, 0.2]} text="lever" start={lever} end={pinion} px={58} color={TECH.white} align="center" />
        <Label3D at={[sx + pinionX(engage), sy - 0.1, sz]} offset={[0.5, 0.65, 0.3]} text="pinion" start={pinion} end={fly + 4} px={58} color={TECH.amber} align="center" />
        <Label3D at={[0, HC + 1.4, 0.2]} offset={[-0.2, 0.7, 0.3]} text="flywheel ring gear" start={fly + 4} px={56} color={TECH.cyan} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Shove;
