// Hook: "Every chip you own is built from a Bell Labs invention."
// A phone on a dark desk, its screen already sliding off at frame 0 (medium); "chip": the camera
// pushes onto the main chip as its lid lifts (close); "built": the die lights up; "Bell": a wave of
// light ripples across it; "invention": the die flares as the camera closes over it (extreme).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, InstancedField, Label3D, Stage3D, TECH } from "../../three/index";
import { CHIP_AT, Desk, OpenPhone, k01 } from "./Parts";

/** the shared opening pose (the loop ends on it) */
export const OPEN_LOOK: [number, number, number] = [0, 0.1, -0.2];
export const OPEN_DIR: [number, number, number] = [0.05, 1, 0.6];

const TxHook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const chip = m.at("chip", 8);
  const built = m.at("built", 30);
  const bell = m.at("bell", 50);
  const inv = m.at("invention", 70);
  const end = Math.max(m.end, inv + 20);
  const keys = direct({}, [
    { at: 0, move: "push", look: OPEN_LOOK, dir: OPEN_DIR, from: 5.6, to: 4.8, dur: Math.max(8, chip), fov: 35 },
    { at: chip, move: "push", look: [CHIP_AT[0], CHIP_AT[1], CHIP_AT[2]], dir: [0.1, 1, 0.5], to: 1.5, dur: Math.max(8, inv - chip) },
    { at: inv, move: "dive", look: [CHIP_AT[0], CHIP_AT[1] + 0.09, CHIP_AT[2]], dir: [0.1, 1, 0.5], to: 0.6, dur: Math.max(10, end - inv) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop="void" floor={false} bloom={1.1} dof={0} blur={1} shadowBox={4}>
        <Camera3D keys={keys} seed="v2101-hook" />
        <Desk />
        <group rotation-y={0.15}>
          <OpenPhone open={k01(f, 0, Math.max(12, chip + 6))} lid={k01(f, chip, 14)} lit={0.3 + 0.5 * k01(f, built, 10) + 0.4 * m.pulse(inv + 4, 10)} />
          {f >= bell && (
            <group position={[CHIP_AT[0], CHIP_AT[1] + 0.09, CHIP_AT[2]]}>
              <InstancedField cols={25} rows={25} spacing={0.011} start={bell} reveal={10} wave={18} seed="v2101-hook" />
            </group>
          )}
        </group>
        <Label3D at={[CHIP_AT[0], CHIP_AT[1] + 0.1, CHIP_AT[2]]} offset={[0.35, 0.3, 0]} text="the main chip" start={chip + 4} end={inv} px={52} color={TECH.white} />
      </Stage3D>
    </Freeze>
  );
};
export default TxHook;
