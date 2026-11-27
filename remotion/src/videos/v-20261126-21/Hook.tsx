// Hook: "Why does this wing lift Airbus's superjumbo?"
// Frame 0: the superjumbo already rolling down a runway at dusk, seen along its left wing (medium). "Why": glowing
// air lines start streaming over the wing; "wing": its leading edge lights up; "lift": the nose rotates up and the
// wheels leave the runway; "superjumbo": the camera pulls out to the whole plane, a label writes on (wide).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, GlowLine, Label3D, Stage3D, TECH, type V3 } from "../../three/index";
import { DUSK, GEAR_H, Runway, SuperJumbo, k01, wingAt } from "./Parts";

/** the opening shot, shared with the payoff's loop: the camera along the left wing */
export const WING_LOOK: V3 = [-0.6, GEAR_H + 0.1, 1.9];
export const WING_DIR: V3 = [-0.75, 0.42, 1];

/** glowing air lines streaming back over the left wing; `k` how many are drawn, `down` how much they bend down behind it */
export const WingAir: React.FC<{ f: number; k?: number; down?: number; color?: string }> = ({ f, k = 1, down = 0.35, color = TECH.cyan }) => (
  <group>
    {[0.25, 0.4, 0.55, 0.7, 0.85].map((u, i) => {
      const [x, y, z] = wingAt(u);
      const pts: V3[] = Array.from({ length: 30 }, (_, j) => {
        const s = j / 29; // 0 ahead of the wing … 1 well behind it
        const xx = x + 1.2 - s * 3.2;
        const behind = Math.max(0, (x - 0.5 - xx) / 1.5);
        return [xx, y + 0.08 + 0.05 * Math.sin(Math.min(1, s * 2) * Math.PI) - down * behind * behind, z];
      });
      return <GlowLine key={i} points={pts} color={color} width={3} k={Math.min(1, Math.max(0, k * 6 - i))} opacity={0.8} dashed dash={0.22} gap={0.14} flow={f * 0.06} />;
    })}
  </group>
);

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const wing = m.at("wing", 8);
  const lift = m.at("lift", 16);
  const jumbo = m.at("superjumbo", 40);
  const why = m.at("why", 2);
  const end = Math.max(m.end, jumbo + 24);
  const pitch = 0.16 * k01(f, lift, 24);
  const rise = 0.5 * k01(f, lift + 8, 40);
  const roll = f * 0.22;
  const keys = direct({}, [
    { at: 0, move: "push", look: WING_LOOK, dir: WING_DIR, from: 4.4, to: 4.0, dur: Math.max(8, jumbo), fov: 38 },
    { at: jumbo, move: "pullback", look: [0, GEAR_H + 0.4, 0], dir: [0.35, 0.22, 1], from: 8, to: 10.5, dur: Math.max(8, end - jumbo) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={DUSK} floor={false} bloom={1.1} dof={0} blur={1} shadowBox={8}>
        <Camera3D keys={keys} seed="v2621-hook" />
        <Runway offset={roll} />
        <group position={[0, GEAR_H + rise, 0]} rotation-z={pitch}>
          <SuperJumbo />
          <WingAir f={f} k={0.25 + 0.75 * k01(f, why, 12)} />
          <GlowLine points={Array.from({ length: 12 }, (_, i) => wingAt(0.08 + i * 0.083, 0.42))} color={TECH.amber} width={6} k={k01(f, wing, 10)} opacity={0.9} />
        </group>
        <pointLight position={[-6, 4, 6]} intensity={30} color="#ffc48a" distance={30} />
        <pointLight position={[4, 3, -4]} intensity={10} color="#9fb8ff" distance={20} />
        <Label3D at={[1.2, GEAR_H + 0.6 + rise, 0]} offset={[0.3, 1.2, 0.3]} text="Airbus superjumbo" start={jumbo + 2} px={56} color={TECH.white} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Hook;
