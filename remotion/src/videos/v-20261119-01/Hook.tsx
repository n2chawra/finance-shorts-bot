// Hook: "How did a melted candy bar give Raytheon the microwave oven?"
// A kitchen at night. Frame 0: a candy bar on the counter in front of a humming microwave (medium,
// already pushing in); on "melted" the bar sags and drips; on "candy" the camera is close on the bar;
// on "Raytheon" a small badge glows on the oven's door; on "microwave" it pulls back wide to the oven,
// window glowing, plate turning; on "oven" the door light flares.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Label3D, Stage3D } from "../../three/index";
import { CandyBar, Kitchen, Microwave, k01 } from "./Parts";

export const BAR_AT: [number, number, number] = [-0.15, 0, 0.55];
export const OVEN_AT: [number, number, number] = [0.1, 0, -0.35];
/** the shared opening pose (the loop ends on it) */
export const OPEN_LOOK: [number, number, number] = [0, 0.15, 0.2];
export const OPEN_DIR: [number, number, number] = [0.15, 0.55, 1];

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const melted = m.at("melted", 10);
  const candy = m.at("chocolate", 22);
  const ray = m.at("raytheon", 36);
  const micro = m.at("microwave", 50);
  const oven = micro + 12;
  const end = Math.max(m.end, oven + 20);
  const keys = direct({}, [
    { at: 0, move: "push", look: OPEN_LOOK, dir: OPEN_DIR, from: 4.6, to: 3.6, dur: Math.max(8, candy) , fov: 35 },
    { at: candy, move: "push", look: [BAR_AT[0], 0.02, BAR_AT[2]], dir: [0.1, 0.6, 1], to: 1.5, dur: Math.max(8, micro - candy) },
    { at: micro, move: "pullback", look: [0.05, 0.3, -0.1], dir: [0.2, 0.45, 1], to: 5.4, dur: 22 },
    { at: micro + 22, move: "push", look: [0.05, 0.35, -0.1], dir: [0.2, 0.45, 1], to: 4.8, dur: Math.max(10, end - micro - 22) },
  ]);
  const flare = m.pulse(oven + 4, 8);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#0d1430", bottom: "#05060c", glow: "rgba(255,184,74,0.12)" }} floor={false} bloom={1} dof={0} blur={1} shadowBox={4}>
        <Camera3D keys={keys} seed="v1901-hook" />
        <Kitchen lights={0.2} />
        <Microwave position={OVEN_AT} on={0.75 + 0.25 * flare + 0.05 * Math.sin(f / 3)} plate={f * 0.05} badge={k01(f, ray, 8) * (0.7 + 0.3 * m.pulse(ray + 6, 6))} />
        <CandyBar position={BAR_AT} rotation-y={0.25} melt={0.08 + 0.7 * k01(f, melted, Math.max(20, end - melted))} f={f} />
        <Label3D at={[OVEN_AT[0] + 0.5, 0.95, OVEN_AT[2]]} offset={[0.3, 0.55, 0]} text="microwave oven" start={micro + 6} px={50} />
      </Stage3D>
    </Freeze>
  );
};
export default Hook;
