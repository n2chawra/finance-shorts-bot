// Thumbnail A (3D, engine "3d"): the pattern of "Inside the Hyatt Regency Skywalk Collapse" (Stewart Hicks,
// 1.2M): the walkway itself in 3D on a dark ground, an arrow and two or three heavy words. Ours: the upper
// walkway at a low 3/4 view with its middle connection glowing red (the failure), the lower walkway hanging
// under it, the roof rods above; the words sit on the left.
import React from "react";
import type { ThumbProps } from "../../studio/thumb";
import { DLookProvider, ThumbCamera } from "../../three/index";
import { Atrium, FIRST, Walkways } from "./world";

export default function ThumbFail(_: ThumbProps) {
  return (
    <DLookProvider look="nightGrid">
      <ThumbCamera target={[FIRST[0], FIRST[1] - 0.3, FIRST[2]]} dist={4.2} yaw={0.55} pitch={0.05} fov={34} shift={0.38} range={1.5} />
      <Atrium dance={0.6} frame={40} dim={0.45} />
      <Walkways frame={0} stress={1} />
      <pointLight position={[0.4, FIRST[1] - 0.3, FIRST[2] + 0.6]} intensity={4} distance={3} color="#ff3b30" />
    </DLookProvider>
  );
}
