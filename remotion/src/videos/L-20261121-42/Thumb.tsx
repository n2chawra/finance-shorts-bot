// Thumbnail A (3D, engine "3d"): the pattern of "Inside the Hyatt Regency Skywalk Collapse" (1.2M): the
// walkway itself in 3D on a dark ground, an arrow and a few heavy words. Ours: the two stacked walkways at a
// low 3/4 view in the evening atrium, the upper walkway's middle connection glowing red (the failure); the
// words sit on the left.
import React from "react";
import type { ThumbProps } from "../../studio/thumb";
import { DLookProvider, ThumbCamera } from "../../three/index";
import { Atrium, UPPER_Y, Walkways } from "./world";

export default function Thumb(_: ThumbProps) {
  return (
    <DLookProvider look="nightGrid">
      <ThumbCamera target={[0, UPPER_Y - 0.4, 0.55]} dist={2.7} yaw={0.75} pitch={-0.22} fov={38} shift={0.34} range={1.0} />
      <Atrium frame={40} light="night" dance={0.5} band={0.4} lamps={0.35} />
      <Walkways frame={0} stress={1} lit={0.5} />
      <pointLight position={[0.4, UPPER_Y - 0.5, 1.1]} intensity={10} distance={3} color="#ff3b30" />
    </DLookProvider>
  );
}
