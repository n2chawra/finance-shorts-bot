// Thumbnail A (3D, P2 hero object glowing + a verdict, after IBM Technology's "How Large Language Models Work"
// 1.8M and ByteByteGo's "How ChatGPT Works Technically" 963K, which both draw the machinery, not a face): the
// data-centre graphics chip big in the frame, its grid of maths units glowing, parameter beads pouring in.
import React from "react";
import type { ThumbProps } from "../../studio/thumb";
import { Board, TECH, ThumbCamera } from "../../three/index";
import { Beads, BigChip, Dust } from "./kit";

export default function ThumbChip(_: ThumbProps) {
  return (
    <group>
      <ThumbCamera target={[0, 0.1, 0]} dist={6.2} yaw={0.4} pitch={0.75} fov={34} shift={0.32} range={3} />
      <Dust f={0} spec={{ c: [0, 1, 0], r0: 5, r1: 14, size: 0.45, n: 900, color: "#ffd9a0" }} />
      <BigChip f={0} grid={1} wave={0.55} lit={0.9} mem={0.9} cols={22} />
      <Board size={[11, 7]} seed="thumb-board" traces={60} parts={40} dark position={[0, -0.2, 0]} />
      <Beads a={[2.05, 0.6, 0]} b={[0.3, 0.2, 0]} t={9} n={18} color={TECH.amber} r={0.06} spread={0.4} />
      <Beads a={[-2.05, 0.6, 0]} b={[-0.3, 0.2, 0]} t={4} n={18} color={TECH.amber} r={0.06} spread={0.4} />
      <pointLight position={[0, 1.4, 1]} intensity={6} distance={6} color={TECH.amber} />
    </group>
  );
}
