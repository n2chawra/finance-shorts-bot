// Hook: "Motorola's first phone you could carry was a brick. Why?"
// A lit studio stage: the first handset on sale turning on its plinth, its name writing on
// ("Motorola's"), the antenna catching the rim light ("first"); a modern phone rises
// beside it lights up and hops ("carry"); the MOTOROLA wordmark plate lights; the camera pushes in ("carry") as a clay brick slides in beside them and lands ("brick"); close on the keypad
// lighting row by row ("Why").
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Label3D, Stage3D, TECH, type V3 } from "../../three/index";
import { BACK, Brick, glow, Handset, ModernPhone, Plinth, k01, q } from "./Models";

export const HX = -0.9;
export const PX = 1.5;
export const OPEN_LOOK: V3 = [0.2, 4.6, 0];
export const OPEN_DIR: V3 = [0.32, 0.22, 1];
export const OPEN_DIST = 13.5;

/** The stage both the hook and the loop stand on: the handset on its plinth, the phone beside it. */
export const StudioSet: React.FC<{ f: number; turn: number; phone: number; keys: number; mark: number; brick?: number }> = ({ f, turn, phone, keys, mark, brick = 0 }) => (
  <group>
    {/* the studio's back wall: tall light panels that breathe */}
    <mesh position={[0, 6, -5]}><planeGeometry args={[30, 16]} /><meshStandardMaterial color="#0e1424" roughness={0.9} /></mesh>
    {[-6, -3.4, 3.8, 6.4].map((x, i) => (
      <mesh key={i} position={[x, 5.5, -4.9]} material={glow(i % 2 ? TECH.cyan : "#6f8cff", q(0.25 + 0.1 * Math.sin(f * 0.05 + i)))}><planeGeometry args={[0.35, 9]} /></mesh>
    ))}
    <mesh position={[0, 9.5, -4.9]} material={glow("#6f8cff", 0.18)}><planeGeometry args={[18, 0.12]} /></mesh>
    <Plinth position={[HX, 0, 0]} rim={0.5 + 0.2 * Math.sin(f * 0.08)} />
    <group position={[HX, 0.3, 0]} rotation-y={turn}>
      <Handset keys={keys} mark={mark} lit={0.4 + 0.3 * keys} />
    </group>
    <ModernPhone position={[PX, 0.3 + 0.5 * Math.sin(Math.PI * Math.min(1, phone * 1.4)) * (phone < 0.72 ? 1 : 0), 0.2]} rotation-y={-0.25} glowScreen={0.2 + 0.8 * phone} />
    {brick > 0 && <Brick position={[3.9 + 4 * (1 - brick), 0, 0.3]} rotation-y={-0.4} />}
  </group>
);

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const moto = m.at("motorola's", 0);
  const carry = m.at("carry", 30);
  const brick = m.at("brick", 50);
  const size = Math.max(carry + 4, brick - 10);
  const why = m.at("why", 66);
  const end = Math.max(m.end, why + 24);
  const keys = direct({}, [
    { at: 0, move: "push", look: OPEN_LOOK, dir: OPEN_DIR, from: OPEN_DIST, to: 12.5, dur: Math.max(8, size), fov: 40 },
    { at: size, move: "push", look: [1.2, 2.5, 0], dir: [0.25, 0.2, 1], to: 10.5, dur: Math.max(8, why - size) },
    { at: why, move: "dive", look: [HX, 2.4, 0.9], dir: [0.12, 0.1, 1], to: 4.2, dur: Math.max(12, end - why) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor="reflect" bloom={1} dof={0} blur={1} shadowBox={8}>
        <Camera3D keys={keys} seed="v2321-hook" />
        <StudioSet f={f} turn={-0.5 + 0.5 * k01(f, 0, Math.max(10, moto))} phone={k01(f, carry, 16)} keys={k01(f, why, 18)} mark={0.3 + 0.7 * k01(f, moto, 8)} brick={k01(f, size, Math.max(8, brick - size))} />
        <Label3D at={[HX + 0.45, 4.2, 0.9]} offset={[1.5, 0.3, 0]} text="Motorola" sub="first phone on sale" start={moto - 30} px={64} color={TECH.white} align="left" />
        <Label3D at={[3.9, 4.3, 0.3]} offset={[0.2, 1.6, 0]} text="brick" start={brick} px={60} color={TECH.amber} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Hook;
