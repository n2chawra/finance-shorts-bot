// Newton: "Push air down, and the air pushes the wing back up."
// Low beside the runway as the superjumbo lifts off over the camera (wide). "Push": a sheet of air rushes down
// off the wing onto the runway; "down": the grass flattens in a wave; "air": dust sprays out sideways; "pushes":
// a big amber arrow up from the wing answers the cyan arrow down (medium); "back": the plane climbs away; "up":
// the up arrow glows.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, glow, GlowLine, rnd, Stage3D, type V3 } from "../../three/index";
import { AMBER, Arrow, CYAN, DUSK, GEAR_H, Runway, SuperJumbo, k01, q, wingAt } from "./Parts";

const Newton: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const push = m.at("push", 4);
  const down = m.at("down", 12);
  const air = m.at("air", 24);
  const pushes = m.at("pushes", 34);
  const back = m.at("back", 50);
  const up = m.at("up", 58);
  const end = Math.max(m.end, up + 20);
  const climb = 0.9 + 0.012 * f + 0.9 * k01(f, back, 30);
  const px = -1.5 + 0.03 * f;
  const w = wingAt(0.5);
  const W: V3 = [px + w[0], climb + w[1], w[2]];
  const keys = direct({}, [
    { at: 0, move: "push", look: [-0.4, 1.3, 0.6], dir: [0.35, 0.05, 1], from: 6.8, to: 6.2, dur: Math.max(8, pushes), fov: 40 },
    { at: pushes, move: "push", look: [W[0], W[1], W[2]], dir: [0.4, 0.15, 1], from: 6.2, to: 5.6, dur: Math.max(8, end - pushes) },
  ]);
  const sheet = k01(f, push, 10);
  const falls: V3[][] = [0.2, 0.35, 0.5, 0.65, 0.8].map((u, i) => {
    const a = wingAt(u);
    return Array.from({ length: 12 }, (_, j) => [px + a[0] - 0.5 - 0.06 * j, climb + a[1] - (climb + a[1]) * (j / 11), a[2] + 0.02 * i]);
  });
  const dust = Array.from({ length: 36 }, (_, i) => {
    const age = Math.max(0, f - air - rnd("dust", i) * 10);
    const ang = rnd("dust", i + 50) * Math.PI;
    const r = age * 0.05;
    return { pos: [px + w[0] - 0.6 + Math.cos(ang) * r, 0.05 + age * 0.008, w[2] + Math.sin(ang) * r * 1.5] as V3, o: Math.max(0, 1 - age / 40) };
  });
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={DUSK} floor={false} bloom={1.1} dof={0} blur={1} shadowBox={8}>
        <Camera3D keys={keys} seed="v2621-newton" />
        <Runway offset={f * 0.02} grassBend={k01(f, down, 14)} seed="rw2" />
        <group position={[px, climb, 0]} rotation-z={0.14}>
          <SuperJumbo gear={f < back} />
        </group>
        {falls.map((pts, i) => (
          <GlowLine key={i} points={pts} color={CYAN} width={4} k={sheet} opacity={0.85} dashed dash={0.18} gap={0.12} flow={-f * 0.08} />
        ))}
        {f >= air && dust.map((d, i) => d.o > 0.02 && (
          <mesh key={i} position={d.pos} material={glow("#e8d8b8", q(0.6 * d.o))}><sphereGeometry args={[0.05, 8, 6]} /></mesh>
        ))}
        <group position={[W[0] - 0.4, W[1] - 0.25, W[2]]} rotation-z={Math.PI}>
          <Arrow k={k01(f, push, 10)} len={1.3} color={CYAN} thick={0.06} />
        </group>
        <group position={[W[0] - 0.4, W[1] + 0.25, W[2]]}>
          <Arrow k={k01(f, pushes, 10)} len={1.3 + 0.2 * m.pulse(up + 2, 10)} color={AMBER} thick={0.06 + 0.02 * k01(f, up, 8)} />
        </group>
        <pointLight position={[-6, 4, 6]} intensity={30} color="#ffc48a" distance={30} />
        <pointLight position={[2, 2, 5]} intensity={8} color="#9fb8ff" distance={14} />
      </Stage3D>
    </Freeze>
  );
};
export default Newton;
