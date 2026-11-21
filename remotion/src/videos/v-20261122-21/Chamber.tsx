// Chamber: "So why doesn't the ground cave in? Dug clay packs a sealed chamber that pushes back."
// The shield side-on in the clay. "ground": cracks run up through the clay above it; "cave": loose clay
// trickles from the roof (wide); "Dug": the shield turns see-through and the chamber behind the wheel
// shows (medium); "packs": clay pours in and fills it; "sealed": the bulkhead glows; "pushes": pressure
// arrows push out into the face (close) and the cracks close.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, glow, Label3D, Stage3D, TECH } from "../../three/index";
import { Chunks, Pressure, Section, k01, q } from "./Parts";
import { BACK } from "./Hook";

const CRACKS: [number, number, number, number][] = [[0.6, 1.4, 0.9, 0.35], [-0.6, 1.5, 1.1, -0.3], [1.4, 1.3, 0.8, 0.5], [-1.6, 1.6, 0.9, -0.2]];

const Chamber: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const ground = m.at("ground", 14);
  const cave = m.at("cave", 24);
  const dug = m.at("dug", 40);
  const packs = m.at("fills", 50);
  const sealed = m.at("sealed", 62);
  const pushes = m.at("pushes", 76);
  const end = Math.max(m.end, pushes + 20);
  const crack = k01(f, ground, 10) * (1 - k01(f, pushes + 6, 12));
  const keys = direct({}, [
    { at: 0, move: "push", look: [-0.5, 1.2, 0], dir: [0.25, 0.25, 1], from: 10.5, to: 9.5, dur: Math.max(8, dug), fov: 42 },
    { at: dug, move: "push", look: [-0.6, 0.1, 0], dir: [0.3, 0.3, 1], to: 6.2, dur: Math.max(10, pushes - dug) },
    { at: pushes, move: "push", look: [0.3, 0, 0], dir: [0.45, 0.2, 1], to: 4.4, dur: Math.max(12, end - pushes) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor={false} bloom={1} dof={0} blur={1} shadowBox={8} fog={{ color: "#05070f", near: 14, far: 36 }}>
        <Camera3D keys={keys} seed="v2221-chamber" />
        <Section f={f} front={0} spin={f * 0.05} see={k01(f, dug, 6)} fill={k01(f, packs, 14)} bulk={k01(f, sealed, 8)} tubes={0.2} lamps={0.8} />
        {crack > 0.02 && CRACKS.map(([x, y, h, tilt], i) => (
          <mesh key={i} position={[x, y + h / 2, -1.25]} rotation-z={tilt} material={glow("#ff5a3c", q(1.2 * crack))}>
            <planeGeometry args={[0.05, h * crack]} />
          </mesh>
        ))}
        <Chunks f={f} k={k01(f, cave, 8) * (1 - k01(f, pushes, 10))} seed="roof" spread={0.5} position={[-0.8, 1.2, 0]} />
        <Pressure f={f} k={k01(f, pushes, 10)} />
        <Label3D at={[-0.5, 0.2, 0.4]} offset={[-0.5, 1.6, 0.4]} text="sealed chamber" start={sealed} px={56} color={TECH.amber} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Chamber;
