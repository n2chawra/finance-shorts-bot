// Guide: "But a tyre can't steer itself. So small sideways wheels press on a guide bar at each side."
// A bogie alone on its track, seen from above at an angle (medium), rolling. "But": it rolls on;
// "tyre": the front tyre glows; "steer": the bogie drifts sideways off its line, a red arrow showing it
// heading off the track; "itself": it slides back onto the line; "small": a small flat wheel pops out at
// each corner (close on one); "sideways": they spin on their sides; "wheels": all four are out; "press":
// they touch the bars, a cyan flash; "guide": the guide bars light up with a label; "bar": the bogie rolls
// on dead straight between them; "side": the camera rises to a wide view, a bar on each side.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Label3D, Stage3D, TECH } from "../../three/index";
import { Bogie, FlatArrow, GUIDE_Y, GUIDE_Z, TYRE_R, Track, k01 } from "./Parts";

const Guide: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const tyre = m.at("tyre", 10);
  const steer = m.at("steer", 24);
  const itself = m.at("itself", 36);
  const small = m.at("small", 56);
  const sideways = m.at("sideways", 76);
  const wheels = m.at("wheels", 88);
  const press = m.at("press", 100);
  const guide = m.at("guide", 116);
  const bar = m.at("bar", 128);
  const side = m.at("side", 160);
  const end = Math.max(m.end, side + 24);
  const dist = f * 0.06;
  const drift = 0.32 * k01(f, steer - 2, 14) * (1 - k01(f, itself, 12));
  const yaw = 0.12 * k01(f, steer - 2, 14) * (1 - k01(f, itself, 12));
  const out = k01(f, small - 2, 10);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0.3, 0.3, 0.2], dir: [0.55, 1.0, 0.85], from: 6.2, to: 5.4, dur: Math.max(8, small), fov: 35 },
    { at: small, move: "push", look: [0.85, GUIDE_Y, 0.9], dir: [0.5, 0.75, 1], to: 2.4, dur: Math.max(8, side - small) },
    { at: side, move: "pullback", look: [0.4, 0.2, 0], dir: [0.25, 1.4, 0.45], to: 7.0, dur: Math.max(10, end - side) },
  ]);
  const flash = m.pulse(press + 3, 8);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#0f1a2e", bottom: "#04060b", glow: "rgba(56,225,255,0.12)" }} floor={false} bloom={1.1} dof={0} blur={1} shadowBox={4}>
        <Camera3D keys={keys} seed="v2421-guide" />
        <Track length={24} offset={-dist} guideLit={Math.max(0.6 * flash, k01(f, guide, 8))} />
        <group position={[0, 0, drift]} rotation-y={-yaw}>
          <Bogie spin={dist / TYRE_R} guides={out} guideSpin={(f - small) * 0.3} guideLit={Math.max(flash, 0.5 * m.pulse(wheels + 2, 8), 0.3 * k01(f, bar, 8))}
            tyreLit={k01(f, tyre, 8) * (1 - k01(f, small, 8))} steelDim={1} />
        </group>
        <FlatArrow position={[0.9, 0.05, 0.75]} rotation-y={-0.35} k={k01(f, steer, 10) * (1 - k01(f, itself + 6, 8))} len={1.8} />
        <pointLight position={[1.5, 2.5, 2.5]} intensity={12} color="#dfe8ff" distance={10} />
        <Label3D at={[0.85, GUIDE_Y, 0.86]} offset={[0.35, 0.6, 0.3]} text="guide wheel" start={sideways} end={side} px={52} color={TECH.cyan} align="center" />
        <Label3D at={[-1.2, GUIDE_Y + 0.08, GUIDE_Z + 0.02]} offset={[-0.3, 0.7, 0.4]} text="guide bar" start={guide + 2} px={54} color={TECH.cyan} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Guide;
