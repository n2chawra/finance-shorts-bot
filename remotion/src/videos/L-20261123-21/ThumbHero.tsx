// Thumbnail C (3D, P2 hero object glowing, after "Setup Starlink for the First Time!" 0.88M and "I bought UK
// Starlink internet" 1.17M, both the dish itself as the hero): the flat dish on its mast on a rooftop at dusk,
// its grid glowing through the face, a beam rising to a satellite streak in the sky.
import React from "react";
import type { ThumbProps } from "../../studio/thumb";
import { glow, TECH, ThumbCamera, type V3 } from "../../three/index";
import { Beam, Cone, dishCentre, Dust, FlatDish, FlatSat, House, Stars } from "./kit";

export default function ThumbHero(_: ThumbProps) {
  const base: V3 = [0, 0, 0];
  const c = dishCentre(base);
  const sat: V3 = [-1.4, 3.0, -2.2];
  return (
    <group>
      <ThumbCamera target={[-0.2, 1.4, -0.4]} dist={5.2} yaw={0.6} pitch={0.15} fov={34} shift={0.34} range={1.5} />
      <FlatDish position={base} face={1} xr={0.4} />
      <Beam a={c} b={sat} r={0.035} o={0.9} />
      <Cone a={c} b={[c[0] + (sat[0] - c[0]) * 0.2, c[1] + (sat[1] - c[1]) * 0.2, c[2] + (sat[2] - c[2]) * 0.2]} r={0.4} o={0.3} />
      <group position={sat} scale={0.6} rotation={[0.3, 0.6, 0]}><FlatSat arrays={1} /></group>
      <mesh position={sat} material={glow(TECH.white, 0.9)}><sphereGeometry args={[0.12, 10, 8]} /></mesh>
      <Stars n={260} r={30} bright={0.85} seed="thumbstars" />
      <Dust f={0} spec={{ c: [0, 0, 0], r0: 9, r1: 32, size: 0.9, n: 1500 }} />
      <House position={[0, -3.62, 0]} w={5} d={4.2} h={2.4} color="#b8a48a" lights={0.8} seed="thumbhouse" />
    </group>
  );
}
