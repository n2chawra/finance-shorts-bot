// Thumbnail A (3D, P1 INSIDE, after Branch Education's "The $200M Machine that Prints Microchips" 2.4M): the
// EUV machine's shell cut away, its insides lit violet: the plasma flash in its chamber, the bright beam
// zigzagging up a chain of mirrors to the mask and down to the wafer.
import React from "react";
import type { ThumbProps } from "../../studio/thumb";
import { Block, glow, mat, TECH, ThumbCamera, type V3 } from "../../three/index";
import { Beam, Dust, EUV, FlatMirror, PlasmaBall } from "./kit";

const PTS: V3[] = [[-2.2, 0.6, 0], [-1.2, 0.4, 0], [-0.4, 1.3, 0], [0.5, 2.1, 0], [1.2, 1.3, 0], [1.7, 0.4, 0]];

export default function ThumbInside(_: ThumbProps) {
  return (
    <group>
      <ThumbCamera target={[-0.1, 1.1, 0]} dist={6.6} yaw={0.55} pitch={0.3} fov={34} shift={0.3} range={3} />
      <Dust f={0} spec={{ c: [0, 1, 0], r0: 5, r1: 16, size: 0.5, n: 1200, color: "#c8b6ff" }} />
      {/* the white shell, its front cut away */}
      <Block size={[5, 2.8, 0.2]} radius={0.08} material={mat("brushed", "#4a4f60", { roughness: 0.45 })} position={[0, 1.3, -1.2]} />
      <Block size={[5, 0.25, 2.6]} radius={0.08} material={mat("brushed", "#4a4f60", { roughness: 0.45 })} position={[0, -0.1, 0]} />
      <Block size={[0.25, 2.8, 2.6]} radius={0.08} material={mat("brushed", "#3d4252", { roughness: 0.45 })} position={[2.6, 1.3, 0]} />
      <Block size={[5, 0.25, 2.6]} radius={0.08} material={mat("brushed", "#4a4f60", { roughness: 0.45 })} position={[0, 2.75, -0.6]} scale={[1, 1, 0.5]} />
      {/* the plasma chamber */}
      <mesh position={PTS[0]} material={mat("brushed", "#3a3e4c", { transparent: true, opacity: 0.45 })}><sphereGeometry args={[0.55, 24, 16]} /></mesh>
      <PlasmaBall position={PTS[0]} k={1} f={0} />
      {PTS.slice(1, 5).map((p, i) => <FlatMirror key={i} position={p} r={0.28} lit={0.8} rotation-z={i % 2 ? 0.7 : -0.7} rotation-x={0.3} />)}
      <Block size={[0.9, 0.08, 0.9]} radius={0.02} material={mat("silicon", "#2e3262", { emissive: EUV, emissiveIntensity: 0.8 })} position={[0.5, 2.25, 0]} />
      <mesh position={[1.9, 0.12, 0]} material={mat("silicon", "#3a3f7a", { emissive: EUV, emissiveIntensity: 0.6 })}><cylinderGeometry args={[0.5, 0.5, 0.04, 40]} /></mesh>
      {PTS.slice(0, -1).map((p, i) => <Beam key={i} a={p} b={PTS[i + 1]!} r={0.06} color={i === 0 ? "#ffffff" : EUV} o={1} />)}
      <Beam a={PTS[5]!} b={[1.9, 0.14, 0]} r={0.05} color="#e6dcff" o={1} />
      <pointLight position={[0, 1.2, 1.2]} intensity={3} distance={5} color={EUV} />
      <pointLight position={[-2.2, 0.8, 1]} intensity={2} distance={3} color={TECH.white} />
      {/* panel seams and status lights on the shell */}
      {Array.from({ length: 6 }, (_, i) => <mesh key={i} position={[-2.1 + i * 0.85, 1.3, -1.08]} material={mat("clay", "#22252f")}><boxGeometry args={[0.03, 2.6, 0.02]} /></mesh>)}
      {Array.from({ length: 8 }, (_, i) => <mesh key={`l${i}`} position={[2.74, 0.4 + i * 0.28, 0.9]} material={glow(i % 3 ? TECH.lime : TECH.amber, 0.9)}><sphereGeometry args={[0.04, 6, 4]} /></mesh>)}
      <mesh position={[0, -0.25, 0]} rotation-x={-Math.PI / 2} material={mat("brushed", "#1c1f28")}><planeGeometry args={[12, 6]} /></mesh>
    </group>
  );
}
