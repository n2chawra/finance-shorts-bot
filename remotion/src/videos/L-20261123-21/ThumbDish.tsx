// Thumbnail A (3D, P4 exploded stack, after Branch Education's "How does Starlink Satellite Internet Work?"
// 9.9M): the flat dish taken apart in the air, layer over layer: the white cover lifted high, the antenna
// grid glowing brightest in the middle, the back housing and stand below, radio ripples leaving the grid.
import React from "react";
import type { ThumbProps } from "../../studio/thumb";
import { Block, glow, mat, TECH, ThumbCamera } from "../../three/index";
import { Dust, Stars } from "./kit";

export default function ThumbDish(_: ThumbProps) {
  const W = 1.6, L = 2.3;
  return (
    <group>
      <ThumbCamera target={[0, 0.9, 0]} dist={6.2} yaw={0.7} pitch={0.42} fov={32} shift={0.36} range={2} />
      <Stars n={260} r={30} bright={0.85} seed="thumbstars" />
      <Dust f={0} spec={{ c: [0, 0, 0], r0: 9, r1: 32, size: 0.9, n: 1500 }} />
      <group rotation={[0.25, 0, -0.15]}>
        {/* the cover, lifted */}
        <Block size={[W, 0.07, L]} radius={0.1} material={mat("white", "#f2f4f8", { roughness: 0.45 })} position={[0, 2.1, 0]} />
        {/* the antenna grid */}
        <Block size={[W * 0.96, 0.05, L * 0.96]} radius={0.03} preset="pcbDark" position={[0, 1.0, 0]} />
        {Array.from({ length: 10 * 14 }, (_, n) => {
          const i = n % 10, j = Math.floor(n / 10);
          const c = Math.hypot(i - 4.5, j - 6.5) / 8;
          return <mesh key={n} position={[(i - 4.5) * W * 0.088, 1.03, (j - 6.5) * L * 0.066]} rotation-x={-Math.PI / 2} material={glow(c < 0.35 ? TECH.white : TECH.cyan, Math.max(0.35, 1 - c))}><planeGeometry args={[W * 0.06, L * 0.042]} /></mesh>;
        })}
        {/* chips under it */}
        {[0, 1, 2].map((i) => <Block key={i} size={[0.25, 0.05, 0.25]} radius={0.02} preset="ceramic" position={[-0.5 + i * 0.5, 0.55, 0]} />)}
        {/* the back housing and the stand */}
        <Block size={[W, 0.1, L]} radius={0.08} preset="blackPlastic" position={[0, 0.1, 0]} />
        <mesh position={[0, -0.6, 0]} material={mat("aluminium", "#d7dbe3")}><cylinderGeometry args={[0.05, 0.06, 1.3, 12]} /></mesh>
        {/* ripples rising off the grid */}
        {[0.7, 1.2, 1.7].map((r, i) => (
          <mesh key={i} position={[0, 1.05 + 0.35 * (i + 1), 0]} rotation-x={-Math.PI / 2} material={glow(TECH.cyan, 0.75 - i * 0.18)}><torusGeometry args={[r, 0.025, 6, 48]} /></mesh>
        ))}
      </group>
      <pointLight position={[0, 1.6, 0.6]} intensity={5} distance={4} color={TECH.cyan} />
    </group>
  );
}
