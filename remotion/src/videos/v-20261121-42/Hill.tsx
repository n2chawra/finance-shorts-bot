// Hill: "That night, its one driver had parked it on a downhill main line."
// The parked train on the main line above the town, wide from the hillside ("night"); a lantern moves away
// from the cab: the driver leaving ("driver"); the camera travels along the tank cars ("parked"); a dashed
// slope line and DOWNHILL label draw along the rails ("downhill"); the town's lights glow far below ("line").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Focus, glow, Label3D } from "../../three/index";
import { AMBER, CAB, Consist, Line, Shot3D, TownLights, Trees, vehX } from "./World";

export const GRADE = -0.03; // the main line falls toward +x (the town)

const Hill: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const driver = m.at("driver", 14), parked = m.at("parked", 30), downhill = m.at("downhill", 50), line = m.at("line", 64);
  const cabX = vehX(0) + CAB[0];
  const walk = m.lerp([driver, m.end], [0, 1]);
  const keys = direct({}, [
    { at: 0, move: "push", look: [-8, 0.6, 0], dir: [0.55, 0.32, 0.77], from: 15, to: 13.5, dur: Math.max(10, parked), fov: 44 },
    { at: parked, move: "fly", path: [[-3, 2.6, 6.5], [-9, 2.4, 6.2], [-14, 2.6, 6.6]], look: [-10, 0.6, 0], dur: Math.max(12, downhill - parked) },
    { at: downhill, move: "pullback", look: [-2, 0.2, 0], dir: [0.3, 0.45, 0.84], from: 10, to: 16, dur: Math.max(14, m.end - downhill) },
  ]);
  return (
    <Shot3D f={f} fog={{ color: "#07101a", near: 12, far: 60 }}>
      <Camera3D keys={keys} seed="lm-hill" drift={0.01} />
      <Focus at={[-6, 0.6, 0]} range={8} />
      <group rotation-z={GRADE}>
        <Line length={90} x={-15} />
        <Trees from={-60} to={30} seed="hill-trees" />
        <Consist cars={12} travelled={0} loco={{ lamp: 1, head: 0.35 }} />
        {/* the driver's lantern, moving off */}
        {f >= driver ? (
          <group position={[cabX + 0.6 + walk * 2.4, 0.55, 0.6 + walk * 3.2]}>
            <mesh material={glow("#ffd38a")}><sphereGeometry args={[0.05, 10, 8]} /></mesh>
            <pointLight intensity={0.9} distance={2.4} color="#ffcf8a" />
          </group>
        ) : null}
        <Label3D at={[-10, 0.15, 0.55]} offset={[0.4, 1.2, 0.8]} text="DOWNHILL MAIN LINE" start={downhill} px={52} color={AMBER} />
      </group>
      <TownLights at={[34, -3.5, -6]} spread={[22, 9]} n={120} seed="hill-town" k={m.lerp([line - 4, line + 12], [0.6, 1.2])} />
    </Shot3D>
  );
};
export default Hill;
