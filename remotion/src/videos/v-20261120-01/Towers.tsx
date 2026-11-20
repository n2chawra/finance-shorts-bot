// Towers: "Water rushes into towers in the lake, then drops down steel pipes through the rock."
// The dam cut open side-on. Glowing streams swirl toward the intake tower ("rushes", wide); the tower's
// shaft lights and a label writes on ("towers", medium); the lake's cut face glows ("lake"); the camera
// dives down the shaft with the water ("drops", close); the steel pipe lights ("steel"); water streaks
// rush down it ("pipes"); pull back: the pipe runs through the rock to the powerhouse ("rock", wide).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, glow, Label3D, rnd, Stage3D, TECH } from "../../three/index";
import { FULL, Section, k01 } from "./Parts";

const q = (x: number) => Math.round(x * 20) / 20;

const Towers: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const rushes = m.at("rushes", 4);
  const towers = m.at("towers", 18);
  const lake = m.at("and", 30);
  const drops = m.at("drops", 46);
  const steel = m.at("steel", 60);
  const pipes = m.at("pipes", 70);
  const rock = m.at("rock", 84);
  const end = Math.max(m.end, rock + 24);
  const keys = direct({}, [
    { at: 0, move: "push", look: [-1.5, 0.6, 0], dir: [0.1, 0.12, 1], from: 10.5, to: 9.5, dur: Math.max(8, towers), fov: 40 },
    { at: towers, move: "push", look: [-1.4, 2.0, 0], dir: [0.15, 0.1, 1], to: 7.5, dur: Math.max(8, drops - towers) },
    { at: drops, move: "dive", look: [-1.3, -0.9, 0], dir: [0.2, 0.15, 1], to: 4.0, dur: 22 },
    { at: rock, move: "pullback", look: [0.6, -1.0, 0], dir: [0.05, 0.15, 1], to: 10, dur: Math.max(14, end - rock) },
  ]);
  const swirl = k01(f, rushes, 10);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#0a1a2e", bottom: "#03060c", glow: "rgba(56,225,255,0.10)" }} floor={false} bloom={1} dof={0} blur={1} shadowBox={8}>
        <Camera3D keys={keys} seed="v2001-towers" />
        <Section f={f} level={FULL} flow={k01(f, pipes - 6, 10)} pipeLit={0.15 + 0.7 * k01(f, steel, 8)} towerLit={0.1 + 0.9 * k01(f, towers, 8)} />
        {/* streams in the lake swirling toward the tower */}
        {swirl > 0.02 && Array.from({ length: 26 }, (_, i) => {
          const t = (f * 0.015 + rnd("sw", i)) % 1;
          const y0 = 0.2 + 3.0 * rnd("swy", i);
          const x = -5.2 + 3.8 * t;
          const y = y0 + (0.25 - y0) * t * t;
          return (
            <mesh key={i} position={[x, y, 0.42]} material={glow("#bfeaff", q(0.9 * swirl * (1 - t * 0.5)))}>
              <sphereGeometry args={[0.055, 8, 6]} />
            </mesh>
          );
        })}
        {/* the lake's cut face, lit on "lake" */}
        <mesh position={[-3.2, (FULL - 0.4) / 2 - 0.2, 0.405]} material={glow(TECH.cyan, q(0.06 + 0.2 * m.pulse(lake + 4, 10)))}>
          <planeGeometry args={[5.9, FULL + 0.4]} />
        </mesh>
        <Label3D at={[-1.4, 3.6, 0.3]} offset={[-0.9, 0.9, 0]} text="intake tower" start={towers + 2} end={drops} px={54} color={TECH.white} align="center" />
        <Label3D at={[0.6, -1.85, 0.3]} offset={[0.2, -1.1, 0]} text="steel pipe" sub="through the rock" start={steel + 2} px={54} color={TECH.cyan} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Towers;
