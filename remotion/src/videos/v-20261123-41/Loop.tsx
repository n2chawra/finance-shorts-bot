// Loop: "Because in that cloud, he said he was climbing."
// Back inside the grey cloud: the camera glides through it toward the Sikorsky ("Because"); the rotor blur shows
// through the grey ("cloud"); the frame settles on the hook's first picture, the helicopter beside us ("climbing").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Cam, Country, HeliAt, InCloud, sm, Shot3D, Veil } from "./World";
import { HELI_Y, hookPose } from "./Hook";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const climbing = m.at("climbing", 40);
  const u = sm(f / Math.max(10, climbing + 8));
  const H = hookPose(0);
  const pos: [number, number, number] = [H.cam[0] + 5 * (1 - u), H.cam[1] + 1.5 * (1 - u), H.cam[2] + 6 * (1 - u)];
  const far = 8 + 5 * u;
  return (
    <Shot3D f={f} fog={{ color: "#7d8690", near: 1.2, far }} overlay={<Veil f={f} k={1} />}>
      <Cam pos={pos} look={H.look} fov={40} seed="cal-loop" range={4} />
      <Country />
      <InCloud f={f} y={HELI_Y} />
      <HeliAt f={f} pos={[0, HELI_Y, 0]} bank={-0.05} />
    </Shot3D>
  );
};
export default Loop;
