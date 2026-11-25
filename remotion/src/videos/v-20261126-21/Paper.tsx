// Paper: "And a flat paper plane, with no curved top at all, still flies. So what is a wing really doing?"
// An office at night. "flat": a flat sheet on a desk folds itself into a paper dart (medium); "paper": it
// launches; "plane": it glides out over the desks; "curved": close side view, its wing a dead-flat sheet, a label
// writes on; "still": it holds its glide; "flies": the camera pulls back as it sails across the room (wide);
// "wing": its wing tilts up a little and glows; "really": air lines bend down off its back edge; "doing": the
// camera follows it on.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, GlowLine, Label3D, PaperPlane, Stage3D, TECH, type V3 } from "../../three/index";
import { CYAN, Office, k01 } from "./Parts";

const Paper: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const flat = m.at("flat", 6);
  const paper = m.at("paper", 18);
  const plane = m.at("plane", 26);
  const curved = m.at("curved", 44);
  const flies = m.at("flies", 70);
  const wing = m.at("wing", 84);
  const really = m.at("really", 96);
  const doing = m.at("doing", 108);
  const end = Math.max(m.end, doing + 20);
  const fold = k01(f, flat - 4, 14);
  // the plane stays near the origin; the office slides back past it once it launches
  const go = Math.max(0, f - paper);
  const travel = go * 0.05;
  const climb = 0.85 + 0.9 * k01(f, paper, 26) - 0.15 * k01(f, flies, 40);
  const tilt = 0.06 + 0.12 * k01(f, wing, 10);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 1.1, -0.6], dir: [0.4, 0.35, 1], from: 4.6, to: 4.0, dur: Math.max(8, curved), fov: 38 },
    { at: curved, move: "push", look: [0, climb - 0.3, 0], dir: [0.05, 0.3, 1], from: 2.8, to: 2.5, dur: Math.max(8, flies - curved) },
    { at: flies, move: "pullback", look: [0, 1.4, 0], dir: [-0.5, 0.3, 1], from: 3.5, to: 5.5, dur: Math.max(8, end - flies) },
  ]);
  const behind: V3[][] = [-0.12, 0, 0.12].map((z) => Array.from({ length: 16 }, (_, j) => {
    const s = j / 15;
    return [-0.45 - s * 1.4, climb - 0.02 - 0.5 * s * s, z];
  }));
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#0b1222", bottom: "#05070c" }} floor={false} bloom={1} dof={0} blur={1} shadowBox={6}>
        <Camera3D keys={keys} seed="v2621-paper" />
        <Office f={f} position={[-travel, 0, 1]} />
        <group position={[0, climb, 0]} rotation-z={f >= paper ? tilt : 0}>
          <PaperPlane length={0.9} fold={fold} color={k01(f, wing, 10) > 0.5 ? "#fff4d8" : "#f4f1ea"} />
        </group>
        <pointLight position={[0.6, climb + 1, 1.2]} intensity={2.5} color="#fff3e0" distance={3} />
        {behind.map((pts, i) => (
          <GlowLine key={i} points={pts} color={CYAN} width={4} k={k01(f, really, 12)} dashed dash={0.12} gap={0.1} flow={f * 0.04} />
        ))}
        <Label3D at={[0.1, climb, 0.1]} offset={[0.35, 0.22, 0]} text="flat wing, no curve" start={curved + 4} end={flies + 6} px={54} color={TECH.amber} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Paper;
