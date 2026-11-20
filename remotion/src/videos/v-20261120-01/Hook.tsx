// Hook: "Hoover Dam makes less power when Lake Mead drops."
// Black Canyon at night. Frame 0: the floodlit arch, outlets spilling, the camera pushing in (wide);
// "less": a row of powerhouse windows dims; "power": the outlet water thins; "Lake": it drifts up to the
// lake (medium); "drops": the waterline slides down the canyon walls, leaving the white band.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Label3D, Stage3D, TECH } from "../../three/index";
import { DamScene, FULL, LOW, k01 } from "./Parts";

export const OPEN_LOOK: [number, number, number] = [0, 0.1, 0.4];
export const OPEN_DIR: [number, number, number] = [0.06, 0.42, 1];
export const OPEN_FROM = 17;
export const OPEN_TO = 15.2;
/** how far the hook lets the lake fall (the next beat goes on from there) */
export const HOOK_FALL = 0.45;

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const hoover = m.at("hoover", 2);
  const less = m.at("less", 18);
  const power = m.at("power", 26);
  const lake = m.at("lake", 40);
  const drops = m.at("drops", 52);
  const end = Math.max(m.end, drops + 16);
  const level = FULL - (FULL - LOW) * HOOK_FALL * k01(f, drops, Math.max(14, end - drops));
  const lights = 1 - 0.35 * k01(f, less, 8);
  const keys = direct({}, [
    { at: 0, move: "push", look: OPEN_LOOK, dir: OPEN_DIR, from: OPEN_FROM, to: OPEN_TO, dur: Math.max(8, lake), fov: 40 },
    { at: lake, move: "push", look: [0, 2.8, -6.5], dir: [0.15, 0.5, 1], to: 13, dur: Math.max(12, end - lake) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#0b1430", bottom: "#04060c", glow: "rgba(90,160,255,0.12)" }} floor={false} bloom={1} dof={0} blur={1} shadowBox={8}
        fog={{ color: "#070b18", near: 18, far: 42 }}>
        <Camera3D keys={keys} seed="v2001-hook" />
        <DamScene f={f} level={level} lights={lights} outlets={1 - 0.6 * k01(f, power, 10)} />
        <Label3D at={[0, 4.1, -0.6]} offset={[-0.6, 1.0, 0]} text="Hoover Dam" start={hoover + 3} end={lake} px={58} color={TECH.white} align="center" />
        <Label3D at={[0.5, level, -8]} offset={[0.4, 1.0, 0]} text="Lake Mead" start={lake + 2} px={54} color={TECH.cyan} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Hook;
