// Box: "But to cook dinner, the waves had to stay inside. So Raytheon shut the tube in a metal box: the Radarange."
// A workshop. The magnetron sits alone on the workbench, waves leaking off in every direction
// ("cook", medium); they fade into the dark ("stay"); a Raytheon sign lights over the bench
// ("Raytheon"); steel walls fly in one by one around the tube ("metal", wide); the box closes and the
// waves bounce inside it, seen through the walls ("box"); a nameplate lands on the door ("Radarange").
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, direct, glow, Label3D, mat, Stage3D, TECH, xray, type V3 } from "../../three/index";
import { Magnetron, WaveRings, Workshop, k01, WARM } from "./Parts";

const W = 1.6, H = 1.0, D = 1.1;
// the walls: where each one ends, where it flies in from, its size and turn
const WALLS: { at: V3; from: V3; size: V3 }[] = [
  { at: [0, H / 2, -D / 2], from: [0, H / 2, -4], size: [W, H, 0.03] },
  { at: [-W / 2, H / 2, 0], from: [-4, H / 2, 0], size: [0.03, H, D] },
  { at: [W / 2, H / 2, 0], from: [4, H / 2, 0], size: [0.03, H, D] },
  { at: [0, H, 0], from: [0, 4, 0], size: [W, 0.03, D] },
  { at: [0, H / 2, D / 2], from: [0, H / 2, 4], size: [W, H, 0.03] },
];

const Box: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const cook = m.at("cook", 10);
  const dinner = m.at("dinner", 20);
  const stay = m.at("stay", 40);
  const inside = m.at("inside", 56);
  const shutW = m.at("shut", 84);
  const ray = m.at("raytheon", 70);
  const metal = m.at("metal", 96);
  const tubeW = m.at("tube", 90);
  const wavesW = m.at("waves", 30);
  const box = m.at("box", 112);
  const rr = m.at("radarange", 140);
  const end = Math.max(m.end, rr + 24);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 0.6, 0], dir: [0.2, 0.45, 1], from: 4.4, to: 3.8, dur: Math.max(8, ray), fov: 35 },
    { at: ray, move: "pullback", look: [0, 1.0, -0.3], dir: [0.15, 0.4, 1], to: 6.2, dur: Math.max(8, metal - ray) },
    { at: metal, move: "orbit", center: [0, 0.5, 0], radius: 5.6, height: 2.6, from: 0.15, to: -0.2, dur: Math.max(10, rr - metal) },
    { at: rr, move: "push", look: [0, 0.45, 0.5], dir: [-0.1, 0.4, 1], to: 3.4, dur: Math.max(10, end - rr) },
  ]);
  const leak = 1 - 0.5 * k01(f, stay, 10) - 0.5 * k01(f, inside, 10);
  const sign = k01(f, ray, 10);
  const shut = cue(f, box + 6, 1);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#22180f", bottom: "#070504", glow: "rgba(255,184,74,0.10)" }} floor={false} bloom={1} dof={0} blur={1} shadowBox={4}>
        <Camera3D keys={keys} seed="v1901-box" />
        <Workshop />
        <Magnetron scale={0.45 * (1 + 0.08 * m.pulse(tubeW + 4, 8))} position={[0.35, 0, -0.1]} heat={0.6 + 0.4 * k01(f, tubeW, 8)} />
        {leak > 0.05 && [0, 1, 2].map((i) => (
          <WaveRings key={i} f={f} start={cook - 10 + i * 3} every={8} reach={2.6 * leak * (1 + 0.25 * m.pulse(wavesW + 4, 8))} position={[0.35, 0.68, -0.1]} rotation-y={i * 1.05} rotation-x={i * 0.4} stop={inside} />
        ))}
        {/* waves bouncing inside the closed box */}
        {shut > 0 && <WaveRings f={f} start={box + 6} every={5} reach={0.55} position={[0.0, 0.5, 0]} rotation-y={0.6} />}
        {shut > 0 && <WaveRings f={f} start={box + 8} every={5} reach={0.45} position={[-0.35, 0.5, 0]} rotation-y={-0.9} />}
        {/* the dinner plate */}
        {f >= dinner - 2 && (
          <group position={[-1.6 + 0.4 * k01(f, dinner - 2, 12), 0, 0.5]}>
            <mesh position={[0, 0.02, 0]} material={mat("white", "#f1efe8")}><cylinderGeometry args={[0.32, 0.26, 0.04, 36]} /></mesh>
            <mesh position={[0.05, 0.08, 0]} scale={[1, 0.5, 0.8]} material={mat("clay", "#b5652e")}><sphereGeometry args={[0.14, 20, 14]} /></mesh>
            <mesh position={[-0.12, 0.06, 0.05]} material={mat("clay", "#6aa84f")}><sphereGeometry args={[0.07, 14, 10]} /></mesh>
          </group>
        )}
        {/* the sign over the bench */}
        <mesh position={[0, 2.5, -1.06]} material={glow(TECH.cyan, Math.round(sign * (0.25 + 0.1 * Math.sin(f / 5)) * 10) / 10 || 0.01)}>
          <planeGeometry args={[3.0, 0.7]} />
        </mesh>
        <Label3D at={[0, 2.5, -1.0]} offset={[0, 0.0, 0.01]} text="RAYTHEON" start={ray} px={64} color={TECH.white} align="center" />
        {/* the walls flying in */}
        {WALLS.map((w, i) => {
          const k = cue(f, i === 0 ? shutW : metal + (i - 1) * 4, 12, Easing.out(Easing.back(1.2)));
          if (k <= 0) return null;
          const pos: V3 = [w.from[0] + (w.at[0] - w.from[0]) * k, w.from[1] + (w.at[1] - w.from[1]) * k, w.from[2] + (w.at[2] - w.from[2]) * k];
          return (
            <mesh key={i} position={pos} material={i === 4 ? mat("glass", "#b8c7d8", { opacity: 0.45 }) : xray("#c9d2de", 0.8)}>
              <boxGeometry args={w.size} />
            </mesh>
          );
        })}
        {shut > 0 && <mesh position={[0, H / 2, D / 2 + 0.02]} material={glow(WARM, 0.25)}><planeGeometry args={[W * 0.6, H * 0.5]} /></mesh>}
        <Label3D at={[0, H + 0.02, D / 2]} offset={[-0.4, 0.7, 0.2]} text="Radarange" start={rr} px={60} color={TECH.amber} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Box;
