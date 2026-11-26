// Hook: "This cable on the ocean floor is about as wide as a garden hose."
// Frame 0: a black subsea cable across the dark blue seabed, light pulses already racing along its seam,
// marine snow drifting, its label on (medium). "wide": a width bracket snaps across it; "garden": a green
// garden hose slides in beside it, the same width (close); "hose": its label writes on.
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, direct, Label3D, Stage3D, TECH } from "../../three/index";
import { Cable, HOOK_DIR, HOOK_FROM, HOOK_LOOK, Hose, R, SEA_BOTTOM, SEA_TOP, Seabed, Snow, WidthBracket, k01 } from "./Parts";

export const SEA_BACK = { top: SEA_TOP, bottom: SEA_BOTTOM, glow: "rgba(90,180,255,0.12)" };
export const SEA_FOG = { color: "#04182a", near: 6, far: 26 };

/** The seabed with the cable on it: the hook's place (the loop beat ends here too). */
export const SeabedShot: React.FC<{ f: number; pulse?: number; speed?: number; cut?: number }> = ({ f, pulse = 1, speed = 0.1, cut = 0 }) => (
  <group>
    <Seabed />
    <Cable f={f} pulse={pulse} speed={speed} cut={cut} />
    <Snow f={f} center={[0, 2.5, 0]} />
    <directionalLight position={[2, 9, 4]} intensity={0.8} color="#9fd4ff" />
    <pointLight position={[0.5, 2.2, 2]} intensity={6} color="#7cc8ff" distance={9} />
  </group>
);

export const HZ = -0.85; // the hose lies beside the cable

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const wide = m.at("wide", 40);
  const garden = m.at("garden", 52);
  const hose = m.at("hose", 62);
  const end = Math.max(m.end, hose + 20);
  const hoseIn = cue(f, garden - 4, 14, Easing.out(Easing.cubic));
  const keys = direct({}, [
    { at: 0, move: "push", look: HOOK_LOOK, dir: HOOK_DIR, from: HOOK_FROM, to: 4.0, dur: Math.max(8, garden), fov: 35 },
    { at: garden, move: "push", look: [0.9, R, HZ / 2], dir: [0.2, 0.55, 1], to: 2.6, dur: Math.max(8, end - garden) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={SEA_BACK} floor={false} fog={SEA_FOG} bloom={1.1} dof={0} blur={1} shadowBox={5}>
        <Camera3D keys={keys} seed="v2721-hook" />
        <SeabedShot f={f} />
        <WidthBracket x={0.2} k={cue(f, wide, 8, Easing.out(Easing.back(1.4)))} />
        {f >= garden - 6 && (
          <group position={[-9 * (1 - hoseIn), 0, HZ]}>
            <Hose x0={-8} x1={1.9} />
          </group>
        )}
        {f >= hose && <Label3D at={[1.0, R * 2, HZ]} offset={[0, 0.3, 0.15]} text="garden hose" start={hose} px={56} color={TECH.white} align="center" />}
        {f < garden && <Label3D at={[0.6, R * 2, 0]} offset={[0.3, 0.7, 0]} text="internet cable" start={-30} px={52} color={TECH.cyan} align="center" />}
      </Stage3D>
    </Freeze>
  );
};
export default Hook;
