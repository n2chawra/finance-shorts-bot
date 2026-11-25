// Triangles: "Other chips cut that dome into flat triangles. More pieces, each easy to draw."
// The smooth dome sits left on the table; a second dome slides in on the right over a rival chip
// (medium); "cut"/"dome"/"flat": lines slice it into facets; "triangles": the mesh glows cyan (close);
// "more"/"pieces": the triangles multiply; "each": dive onto one triangle (extreme); "easy": it lights amber; "draw": pull back on both domes side by side (medium).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, ChipPackage, direct, Label3D, Stage3D, TECH } from "../../three/index";
import { AMBER, LightTable, SmoothDome, TriDome, k01 } from "./Parts";

const Triangles: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const every = m.at("other", 2);
  const other = m.at("chips", 8);
  const cut = m.at("cut", 18);
  const dome = m.at("dome", 24);
  const flat = m.at("flat", 30);
  const tri = m.at("triangles", 36);
  const more = m.at("more", 48);
  const pieces = m.at("pieces", 54);
  const each = m.at("each", 62);
  const dead = m.at("easy", 70);
  const draw = m.at("draw", 82);
  const end = Math.max(m.end, draw + 20);
  const slide = k01(f, every - 4, 14);
  const detail = 0.15 + 0.35 * k01(f, more, 10) + 0.5 * k01(f, pieces, 12);
  const R: [number, number, number] = [1.6, 0, 0];
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 0.6, 0], dir: [0.2, 0.5, 1], from: 9, to: 8.4, dur: Math.max(8, tri), fov: 35 },
    { at: tri, move: "push", look: [1.6, 0.6, 0], dir: [0.3, 0.45, 1], from: 7.4, to: 6.6, dur: Math.max(8, each - tri) },
    { at: each, move: "dive", look: [1.6, 0.95, 0.9], dir: [0.1, 0.3, 1], from: 4, to: 2.2, dur: 22 },
    { at: draw, move: "pullback", look: [0, 0.6, 0], dir: [0.2, 0.5, 1], from: 7, to: 8.6, dur: Math.max(10, end - draw) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#10172c", bottom: "#030409", glow: "rgba(56,225,255,0.10)" }} floor={false} bloom={1.1} dof={0} blur={1}>
        <Camera3D keys={keys} seed="v2521-tri" />
        <LightTable w={8} />
        <SmoothDome r={1.1} rise={1} lit={0.4} grid={0.2} position={[-1.7, 0, 0]} />
        <group position={[R[0] + 4 * (1 - slide), 0, 0]}>
          <ChipPackage size={1.6} lid={false} seed="rival" lit={0.3 + 0.6 * k01(f, other, 8)} position={[0, -0.05, 0]} scale={[1, 0.6, 1]} />
          <TriDome r={1.1} detail={detail} cut={k01(f, cut, 12)} lit={0.3 + 0.7 * k01(f, tri, 8)} one={k01(f, dead, 8) * (1 - 0.3 * k01(f, draw, 10))} position={[0, 0.1, 0]} />
        </group>
        <Label3D at={[R[0], 1.2, 0]} offset={[0.3, 0.9, 0]} text="triangles" start={tri} px={60} color={TECH.cyan} align="center" />
        <Label3D at={[-1.7, 1.1, 0]} offset={[-0.3, 0.9, 0]} text="curves" start={draw} px={56} color={AMBER} align="center" />
        <pointLight position={[2.5, 3, 3]} intensity={8} color="#bfe9ff" distance={10} />
      </Stage3D>
    </Freeze>
  );
};
export default Triangles;
