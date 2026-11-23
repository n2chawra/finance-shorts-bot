// Thumbnail B (3D, P6 one labelled secret, after "How Starlink Actually Works" 4.6M and "How Does The Starlink
// System Work?" 0.77M): one flat satellite with its long solar wing above the Earth's curve, its beams leaning
// down at an angle onto lit patches of ground at night.
import React from "react";
import type { ThumbProps } from "../../studio/thumb";
import { glow, mat, rnd, TECH, ThumbCamera, type V3 } from "../../three/index";
import { Cone, Dust, FlatSat, Stars } from "./kit";

const RE = 40;
const surf = (x: number, z: number): V3 => [x, -RE - 2 + Math.sqrt(RE * RE - x * x - z * z), z];

export default function ThumbBeams(_: ThumbProps) {
  const sat: V3 = [0.5, 2.4, 0];
  return (
    <group>
      <ThumbCamera target={[0.4, 1.4, 0]} dist={8.5} yaw={0.45} pitch={0.18} fov={34} shift={0.34} range={3} />
      <Stars n={260} r={30} bright={0.85} seed="thumbstars" />
      <Dust f={0} spec={{ c: [0, 0, 0], r0: 9, r1: 32, size: 1.0, n: 2600 }} />
      <mesh position={[0, -RE - 2, 0]} material={mat("clay", "#0b1f45", { roughness: 0.85 })}><sphereGeometry args={[RE, 96, 64]} /></mesh>
      <mesh position={[0, -RE - 2, 0]} scale={1.015} material={glow("#5aa8ff", 0.16)}><sphereGeometry args={[RE, 64, 40]} /></mesh>
      {Array.from({ length: 420 }, (_, i) => {
        const x = (rnd("tc", i) - 0.5) * 22, z = (rnd("tz", i) - 0.5) * 14;
        const g = surf(x, z);
        return <mesh key={`c${i}`} position={[g[0], g[1] + 0.04, g[2]]} material={glow("#ffcf7a", 0.5 + 0.5 * rnd("tb", i))}><sphereGeometry args={[0.05 + 0.05 * rnd("ts", i), 6, 4]} /></mesh>;
      })}
      {[[-3, 1], [-1.2, -1.5], [1.8, 1.4], [3.6, -1], [-4.8, -1.8]].map(([x, z], i) => {
        const g = surf(x!, z!);
        return (
          <group key={i}>
            <Cone a={sat} b={g} r={0.9} o={0.13} />
            <mesh position={[g[0], g[1] + 0.05, g[2]]} rotation-x={-Math.PI / 2} material={glow(TECH.cyan, 0.6)}><ringGeometry args={[0.7, 1.05, 6]} /></mesh>
          </group>
        );
      })}
      <group position={sat} rotation={[0.55, 0.5, 0.1]} scale={1.3}><FlatSat arrays={1} glowBody={1} /></group>
      <directionalLight position={[-6, 6, 6]} intensity={2.5} />
    </group>
  );
}
