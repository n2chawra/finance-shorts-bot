// Loop: "It all starts with one phone call."
// Back inside the 4th-floor box beam, whole again: the camera dives from the beam's side down to the nut
// ("starts") and settles on the amber nut and washer exactly as the hook's first frame shows them ("call").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Focus } from "../../three/index";
import { Shot3D } from "./World";
import { BeamCutaway, NUT } from "./Cut";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const starts = m.at("starts", 6), call = m.at("call", 28);
  const keys = direct(p.beat.events, [
    { at: 0, move: "hold", pos: [3.4, 0.9, 2.6], look: [0, -0.1, -0.12], fov: 48 },
    { at: starts, move: "dive", look: [0, -0.3, -0.12], dir: [1, -0.25, 0.75], from: 4.2, to: 2.6, dur: Math.max(12, call - starts) },
    { at: call, move: "push", look: [0, -0.35, -0.12], dir: [1, -0.3, 0.75], from: 2.55, to: 2.3, dur: Math.max(10, m.end - call) },
  ]);
  return (
    <Shot3D f={f} floor={false}>
      <Camera3D keys={keys} seed="hyatt-loop" drift={0.006} />
      <Focus at={NUT} range={0.7} />
      <pointLight position={[1.5, 1.5, 2]} intensity={2.2} distance={8} color="#ffcf9a" />
      <group rotation-y={0.3}>
        <BeamCutaway t={f} stress={0.42 * m.lerp([starts, call], [0.5, 1])} fold={0} drop={0} debris={0} />
      </group>
    </Shot3D>
  );
};
export default Loop;
