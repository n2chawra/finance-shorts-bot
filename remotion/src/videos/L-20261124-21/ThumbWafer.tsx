// Thumbnail B (3D, P2 hero object glowing, after Xprocess's "How are BILLIONS of MICROCHIPS made" 1.5M and
// CNBC's machine hero shots): one big silicon wafer filling the frame, its chip grid glowing, a violet beam
// of light striking the middle.
import React from "react";
import type { ThumbProps } from "../../studio/thumb";
import { glow, mat, ThumbCamera } from "../../three/index";
import { Beam, Cone, Dust, EUV } from "./kit";

const R = 1.6, G = 0.32;

export default function ThumbWafer(_: ThumbProps) {
  const cells: [number, number][] = [];
  for (let j = -5; j <= 5; j++) for (let i = -5; i <= 5; i++) {
    const x = i * G, z = j * G;
    if (Math.hypot(Math.abs(x) + G / 2, Math.abs(z) + G / 2) < R - 0.05) cells.push([x, z]);
  }
  return (
    <group>
      <ThumbCamera target={[0, 0.1, 0]} dist={4.2} yaw={0.35} pitch={0.62} fov={34} shift={0.3} range={2} />
      <Dust f={0} spec={{ c: [0, 0, 0], r0: 5, r1: 14, size: 0.45, n: 1000, color: "#c8b6ff" }} />
      <mesh material={mat("silicon", "#353a74", { iridescence: 1, roughness: 0.05 })}><cylinderGeometry args={[R, R, 0.05, 64]} /></mesh>
      {cells.map(([x, z], i) => {
        const d = Math.hypot(x, z) / R;
        return <mesh key={i} position={[x, 0.03, z]} rotation-x={-Math.PI / 2} material={glow(d < 0.25 ? "#ffffff" : EUV, Math.max(0.3, 0.95 - d * 0.7))}><planeGeometry args={[G * 0.86, G * 0.86]} /></mesh>;
      })}
      <Beam a={[0, 3.2, 0]} b={[0, 0.04, 0]} r={0.09} color="#e6dcff" o={1} />
      <Cone a={[0, 0.05, 0]} b={[0, 1.4, 0]} r={0.6} color={EUV} o={0.25} />
      <mesh position={[0, 0.06, 0]} material={glow("#ffffff", 0.9)}><sphereGeometry args={[0.14, 14, 10]} /></mesh>
      <pointLight position={[0, 0.6, 0.4]} intensity={8} distance={4} color={EUV} />
    </group>
  );
}
