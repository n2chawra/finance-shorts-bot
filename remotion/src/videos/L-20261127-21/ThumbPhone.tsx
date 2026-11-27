// Thumbnail B (3D, P5 A becomes B, after Website Learners' phone-with-chat thumbnail 4.5M and ByteByteGo's
// question-to-answer chain 963K): your phone with the chat question on the left, a stream of light running from
// it to a glowing graphics chip on the right.
import React from "react";
import type { ThumbProps } from "../../studio/thumb";
import { Board, glow, Phone as PhoneModel, TECH, ThumbCamera } from "../../three/index";
import { Beads, BigChip, Dust } from "./kit";

export default function ThumbPhone(_: ThumbProps) {
  return (
    <group>
      <ThumbCamera target={[1.0, 0.2, 0]} dist={6.6} yaw={0.25} pitch={0.7} fov={34} shift={0.25} range={4} />
      <Dust f={0} spec={{ c: [0, 1, 0], r0: 5, r1: 14, size: 0.45, n: 900, color: "#a8c8ff" }} />
      <group position={[-1.6, 0, 0.4]} rotation-y={0.25} scale={0.9}>
        <PhoneModel glowScreen={1} />
        <mesh position={[0.1, 0.23, -0.5]} rotation-x={-Math.PI / 2} material={glow(TECH.cyan, 0.9)}><planeGeometry args={[1.05, 0.34]} /></mesh>
        <mesh position={[-0.05, 0.23, 0.25]} rotation-x={-Math.PI / 2} material={glow("#26324d", 0.9)}><planeGeometry args={[1.2, 0.8]} /></mesh>
      </group>
      <Board size={[11, 7]} seed="thumb-board" traces={60} parts={40} dark position={[2.4, -0.2, 0]} />
      <Beads a={[-1.2, 0.4, -0.6]} b={[2.6, 0.2, 0]} t={5} n={14} color={TECH.amber} r={0.07} spread={0.15} />
      <group position={[3.4, 0, 0]} scale={0.7}>
        <BigChip f={0} grid={1} wave={0.4} lit={0.9} mem={0.8} cols={20} />
      </group>
      <pointLight position={[3.4, 1.4, 1]} intensity={5} distance={5} color={TECH.amber} />
    </group>
  );
}
