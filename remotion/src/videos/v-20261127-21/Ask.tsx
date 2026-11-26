// Ask: "How does the internet fit inside it?"
// The same seabed, the hose beside the cable (medium). "internet": the light pulses stream faster along the
// cable; "fit": the camera swings round to the cable's cut end; "inside": light glows out of it (close).
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Label3D, Stage3D, TECH } from "../../three/index";
import { CABLE_END, Hose, R, k01 } from "./Parts";
import { HZ, SEA_BACK, SEA_FOG, SeabedShot } from "./Hook";

const Ask: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const internet = m.at("internet", 8);
  const fit = m.at("fit", 22);
  const inside = m.at("inside", 34);
  const end = Math.max(m.end, inside + 20);
  const keys = direct({}, [
    { at: 0, move: "pullback", look: [1.0, R, HZ / 2], dir: [0.3, 0.5, 1], from: 3.0, to: 4.2, dur: Math.max(8, fit), fov: 35 },
    { at: fit, move: "push", look: [CABLE_END, R, 0], dir: [1, 0.35, 0.55], from: 4.0, to: 2.0, dur: Math.max(10, end - fit), ease: Easing.inOut(Easing.cubic) },
  ]);
  const glowK = k01(f, inside, 10);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={SEA_BACK} floor={false} fog={SEA_FOG} bloom={1.15} dof={0} blur={1} shadowBox={5}>
        <Camera3D keys={keys} seed="v2721-ask" />
        <SeabedShot f={f + 70} speed={0.1 + 0.14 * k01(f, internet, 10)} cut={0.3 + 0.7 * k01(f, fit, 10)} />
        <group position={[0, 0, HZ]}><Hose x0={-8} x1={1.9} /></group>
        {f >= inside && <pointLight position={[CABLE_END + 0.6, R, 0]} intensity={12 * glowK} color={TECH.cyan} distance={4} />}
        {f >= inside && (
          <mesh position={[CABLE_END + 0.05, R, 0]} rotation-y={Math.PI / 2} scale={1 + 0.8 * glowK}>
            <circleGeometry args={[R * 0.4, 32]} />
            <meshBasicMaterial color="#9ff0ff" transparent opacity={0.5 * glowK} toneMapped={false} />
          </mesh>
        )}
        {f >= internet && f < fit + 4 && <Label3D at={[0.2, R * 2, 0]} offset={[0.2, 0.7, 0]} text="the internet" start={internet + 2} px={54} color={TECH.cyan} align="center" />}
      </Stage3D>
    </Freeze>
  );
};
export default Ask;
