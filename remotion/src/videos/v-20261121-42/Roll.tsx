// Roll: "In the dark, it began to roll toward the town."
// Beside the line on the grade: the dark, empty train slides past the camera ("dark"); the camera rises
// over it as it pulls away ("roll"); the lights of Lac-Mégantic glow ahead at the bottom ("town").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Focus, Label3D } from "../../three/index";
import { AMBER, Consist, Line, Shot3D, TownLights, Trees } from "./World";
import { GRADE } from "./Hill";

const Roll: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const roll = m.at("rolled", 18), town = m.at("town", 40);
  const travelled = -8 + 0.0035 * (f + 40) ** 2;
  const keys = direct({}, [
    { at: 0, move: "hold", pos: [1.5, 0.9, 2.6], look: [-4, 0.8, 0], fov: 44 },
    { at: roll, move: "crane", look: [travelled + 6, 0.4, 0], base: [-2, 1.2, 3.4], from: 1.0, to: 5.5, dur: Math.max(16, m.end - roll) },
  ]);
  return (
    <Shot3D f={f} fog={{ color: "#07101a", near: 14, far: 70 }}>
      <Camera3D keys={keys} seed="lm-roll" drift={0.012} />
      <Focus at={[travelled - 4, 0.7, 0]} range={9} />
      <group rotation-z={GRADE}>
        <Line length={140} x={10} />
        <Trees from={-50} to={70} seed="roll-trees" />
        <Consist cars={12} travelled={travelled} loco={{ lamp: 0, head: 0 }} />
      </group>
      <TownLights at={[42, -1.6, -2]} spread={[24, 10]} n={140} seed="roll-town" k={m.lerp([town - 6, town + 10], [0.7, 1.4])} />
      <Label3D at={[34, -1.2, -2]} offset={[0, 1.4, 0]} text="LAC-MÉGANTIC" start={town} px={56} color={AMBER} align="center" />
    </Shot3D>
  );
};
export default Roll;
