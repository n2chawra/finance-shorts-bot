// Thumbnail A (3D, engine "3d"): the pattern of "Updated BP Texas City Animation" (CSB, 2.26M): the liquid
// geyser erupting from the stack over the refinery's columns. Ours: the stack mid-eruption, spray raining
// round it, the tower beside it, the vapour cloud starting on the ground; the words sit on the left.
import React from "react";
import type { ThumbProps } from "../../studio/thumb";
import { DLookProvider, ThumbCamera } from "../../three/index";
import { Blowdown, Column, DRUM, Geyser, Overhead, Site, STACK_TOP, Vapour } from "./refinery";

export default function ThumbGeyser(_: ThumbProps) {
  return (
    <DLookProvider look="storm">
      <ThumbCamera target={[DRUM[0] - 2, STACK_TOP - 3, 0]} dist={22} yaw={-0.35} pitch={0.12} fov={40} shift={0.32} range={8} />
      <directionalLight position={[-20, 30, 15]} intensity={1.4} color="#fff4e0" />
      <ambientLight intensity={0.3} color="#8fa0b4" />
      <Site trailers={1} />
      <Column />
      <Overhead fill={1} valves={1} flow={1} />
      <Blowdown fill={1} />
      <Geyser frame={30} k={1} />
      <Vapour frame={30} k={0.6} />
      <pointLight position={[DRUM[0], STACK_TOP + 2, 2]} intensity={6} distance={8} color="#ffcf7a" />
    </DLookProvider>
  );
}
