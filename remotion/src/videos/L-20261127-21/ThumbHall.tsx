// Thumbnail C (3D, P3 scale shock, after IBM Technology's 1.8M and ByteByteGo's 963K, which show the system
// behind the chatbot): one small phone in front of a long data-centre aisle of glowing server racks, a line of
// light running from the phone into the hall.
import React from "react";
import type { ThumbProps } from "../../studio/thumb";
import { glow, Phone as PhoneModel, ServerRack, TECH, ThumbCamera } from "../../three/index";
import { Beads, Dust } from "./kit";

export default function ThumbHall(_: ThumbProps) {
  return (
    <group>
      <ThumbCamera target={[0, 1.4, -4]} dist={9} yaw={0.35} pitch={0.18} fov={40} shift={0.3} range={8} />
      <Dust f={0} spec={{ c: [0, 2, -4], r0: 5, r1: 16, size: 0.4, n: 900, color: "#8fe8ff" }} />
      {[-1.8, 1.8].map((x, r) => Array.from({ length: 10 }, (_, i) => r === 1 && i < 3 ? null : (
        <ServerRack key={`${r}-${i}`} seed={`th-${r}-${i}`} lod="low" position={[x, 0, -1 - i * 1.4]} rotation-y={r ? -Math.PI / 2 : Math.PI / 2} scale={1.6} ledColor={TECH.cyan} />
      )))}
      <group position={[0.5, 1.3, 2.2]} rotation-x={1.1} scale={0.55}>
        <PhoneModel glowScreen={1} />
        <mesh position={[0.05, 0.23, -0.5]} rotation-x={-Math.PI / 2} material={glow("#cfe0ff", 0.95)}><planeGeometry args={[1.2, 0.4]} /></mesh>
        <mesh position={[-0.05, 0.23, 0.3]} rotation-x={-Math.PI / 2} material={glow(TECH.cyan, 0.85)}><planeGeometry args={[1.2, 0.9]} /></mesh>
      </group>
      <Beads a={[0.5, 1.4, 1.9]} b={[0, 0.3, -14]} t={3} n={16} color={TECH.amber} r={0.09} spread={0.05} />
      <pointLight position={[0, 3, -3]} intensity={10} distance={14} color={TECH.cyan} />
    </group>
  );
}
