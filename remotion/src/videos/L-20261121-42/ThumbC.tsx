// Thumbnail C (3D, engine "3d"): the pattern of "Fast-Tracked Failure" (1.2M) and Fascinating Horror's
// documentary (1.66M): heavy serious type over one wide picture of the atrium. Ours: the atrium at night from
// high on the far side, the upper walkway sagging at its middle connection, which glows red.
import React from "react";
import type { ThumbProps } from "../../studio/thumb";
import { DLookProvider, ThumbCamera } from "../../three/index";
import { Atrium, UPPER_Y, Walkways } from "./world";

export default function ThumbC(_: ThumbProps) {
  return (
    <DLookProvider look="nightGrid">
      <ThumbCamera target={[0.3, UPPER_Y - 0.6, 0]} dist={7.5} yaw={-0.55} pitch={0.02} fov={42} shift={0.32} range={3} />
      <Atrium frame={60} light="night" dance={0.45} band={0.5} lamps={0.4} />
      <Walkways frame={0} sag={0.9} stress={1} lit={0.6} />
      <pointLight position={[0, UPPER_Y - 0.4, 1]} intensity={14} distance={4} color="#ff3b30" />
    </DLookProvider>
  );
}
