// Thumbnail C (3D, P5 A becomes B, after PROCESS BHARAT's sand-to-chip 2.3M split): left, a drop of molten
// tin bursting into violet plasma; right, the finished chip glowing; a beam of light joins them.
import React from "react";
import type { ThumbProps } from "../../studio/thumb";
import { ChipPackage, glow, TECH, ThumbCamera } from "../../three/index";
import { Beam, Dust, EUV, PlasmaBall, TinDrop } from "./kit";

export default function ThumbTinChip(_: ThumbProps) {
  return (
    <group>
      <ThumbCamera target={[0.2, 0.5, 0]} dist={4.6} yaw={0.15} pitch={0.3} fov={34} shift={0.22} range={2.4} />
      <Dust f={0} spec={{ c: [0, 0.5, 0], r0: 5, r1: 14, size: 0.45, n: 1000, color: "#c8b6ff" }} />
      <TinDrop position={[-1.1, 0.7, 0]} r={0.36} />
      <PlasmaBall position={[-0.75, 0.65, 0.2]} k={0.9} f={3} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return <mesh key={i} position={[-0.9 + Math.cos(a) * 0.75, 0.7 + Math.sin(a) * 0.75, 0.2]} material={glow(i % 2 ? "#ffffff" : TECH.cyan, 0.9)}><sphereGeometry args={[0.04, 6, 4]} /></mesh>;
      })}
      <Beam a={[-0.5, 0.6, 0.2]} b={[1.2, 0.3, 0]} r={0.05} color={EUV} o={1} />
      <group position={[1.5, 0.05, 0]} rotation={[0.55, -0.4, 0]}>
        <ChipPackage size={1.4} lid={false} lit={1} seed="thumbchip" />
      </group>
      <pointLight position={[1.4, 0.9, 0.8]} intensity={6} distance={4} color={EUV} />
    </group>
  );
}
