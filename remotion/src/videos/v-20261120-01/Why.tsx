// Why: "Why does the height of a lake matter?"
// Beside an intake tower in the lake. The camera glides toward the tower ("Why", medium); close on the
// depth scale painted on it, its marks lighting ("height", close); the water slides down past the marks
// ("lake"); the tower's windows dim as the camera pulls back ("matter", medium).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Label3D, Stage3D, TECH } from "../../three/index";
import { DamScene, FULL, LOW, k01 } from "./Parts";
import { HOOK_FALL } from "./Hook";

const Why: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const height = m.at("height", 14);
  const lake = m.at("lake", 30);
  const matter = m.at("matter", 40);
  const end = Math.max(m.end, matter + 16);
  const fall = HOOK_FALL + (1 - HOOK_FALL) * 0.6 * k01(f, lake, Math.max(14, end - lake));
  const level = FULL - (FULL - LOW) * fall;
  const keys = direct({}, [
    { at: 0, move: "push", look: [-1.7, 2.2, -2.6], dir: [0.45, 0.3, -1], from: 8, to: 6.5, dur: Math.max(8, height), fov: 40 },
    { at: height, move: "push", look: [-1.7, 2.0, -2.6], dir: [0.35, 0.15, -1], to: 4.4, dur: Math.max(8, matter - height) },
    { at: matter, move: "pullback", look: [-1.0, 2.0, -2.0], dir: [0.45, 0.35, -1], to: 7.5, dur: Math.max(12, end - matter) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#0b1430", bottom: "#04060c", glow: "rgba(90,160,255,0.12)" }} floor={false} bloom={1} dof={0} blur={1} shadowBox={8}
        fog={{ color: "#070b18", near: 14, far: 36 }}>
        <Camera3D keys={keys} seed="v2001-why" />
        <DamScene f={f} level={level} lights={0.65 - 0.3 * k01(f, matter, 8)} scale={0.3 + 0.9 * k01(f, height, 8)} />
        <Label3D at={[-1.3, level + 0.05, -3.0]} offset={[0.9, 0.9, 0]} text="water level" start={lake} px={52} color={TECH.cyan} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Why;
