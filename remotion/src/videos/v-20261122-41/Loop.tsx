// Loop: "It all began with one rudder that would not turn."
// Back low over the night river beside the tanker: the camera glides in over the water ("began"); the stern's
// wake glows amber ("rudder"); the frame settles on the hook's first picture, the bow beside us, so the Short
// plays straight back into its opening ("turn").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Focus } from "../../three/index";
import { River, Shot3D, TankerAt, turnPose } from "./World";
import { hookPhi, Wake } from "./Hook";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const turn = m.at("turn", 40);
  // the tanker arrives at the hook's frame-0 pose on the beat's last frame
  const back = (fr: number) => hookPhi(0, 1e9) - 0.0016 * (m.end - fr);
  const T = turnPose(back(f));
  const T0 = turnPose(hookPhi(0, 1e9));
  const look: [number, number, number] = [T0.bow[0] - 2.2, 0.55, T0.bow[2]];
  const keys = direct({}, [
    { at: 0, move: "push", look, dir: [0.55, 0.16, -0.82], from: 12, to: 7.6, dur: Math.max(10, m.end), fov: undefined },
  ]);
  const trail = Array.from({ length: 10 }, (_, i) => back(f - i * 6));
  return (
    <Shot3D f={f}>
      <Camera3D keys={keys} seed="ms-hook" drift={0.012} />
      <Focus at={[T.bow[0] - 2, 0.5, T.bow[2]]} range={5} />
      <River f={f} />
      <TankerAt f={f} pos={T.pos} yaw={T.yaw} rudder={0} stress={0.35} />
      <Wake f={f} phis={trail} hot={m.lerp([0, turn], [0.3, 0.7])} />
      <pointLight position={[T.stern[0], 0.5, T.stern[2]]} intensity={1.4} distance={3.5} color="#ff9a3c" />
    </Shot3D>
  );
};
export default Loop;
