// Tube: "Nothing near him was hot, so what melted it? A magnetron, the tube that makes radar's microwaves."
// The same bench, cold blue (medium): the lamp, a thermometer whose bulb stays low and blue on "hot";
// on "magnetron" the copper tube rises on its stand and glows, its name writes on (close); on "tube" the
// camera circles it; on "microwaves" rings of waves pulse out of its antenna toward the coat.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Block, Camera3D, direct, glow, Label3D, mat, Stage3D, TECH } from "../../three/index";
import { Coat, Lab, Magnetron, WaveRings, k01 } from "./Parts";

const TUBE: [number, number, number] = [0, 0, 0.1];

const Tube: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const nothing = m.at("nothing", 4);
  const hot = m.at("hot", 26);
  const melted = m.at("melted", 50);
  const mag = m.at("magnetron", 80);
  const makes = m.at("makes", 120);
  const tube = m.at("tube", 100);
  const micro = m.at("microwaves", 140);
  const end = Math.max(m.end, micro + 24);
  const rise = k01(f, mag - 4, 18);
  const top: [number, number, number] = [TUBE[0], 0.15 + 0.62 * 0.75 * rise, TUBE[2]];
  const keys = direct({}, [
    { at: 0, move: "push", look: [0.2, 0.5, 0], dir: [-0.1, 0.4, 1], from: 5.6, to: 4.8, dur: Math.max(10, mag) , fov: 35 },
    { at: mag, move: "push", look: [TUBE[0], 0.55, TUBE[2]], dir: [0.25, 0.35, 1], to: 2.6, dur: Math.max(8, tube - mag) },
    { at: tube, move: "orbit", center: [TUBE[0], 0.55, TUBE[2]], radius: 2.6, height: 1.4, from: 0.25, to: -0.35, dur: Math.max(10, micro - tube) },
    { at: micro, move: "pullback", look: [0.4, 0.8, 0], dir: [-0.15, 0.35, 1], to: 4.6, dur: Math.max(10, end - micro) },
  ]);
  const cold = k01(f, nothing, 10);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#101a2c", bottom: "#04060b", glow: "rgba(56,225,255,0.10)" }} floor={false} bloom={1} dof={0} blur={1} shadowBox={4}>
        <Camera3D keys={keys} seed="v1901-tube" />
        <Lab f={f} />
        <Coat position={[2.0, 0, 0]} />
        {/* the thermometer: its bulb stays low and blue */}
        <group position={[-1.0, 0, 0.4]} scale={1.8}>
          <mesh position={[0, 0.45, 0]} material={mat("glass")}><cylinderGeometry args={[0.04, 0.04, 0.8, 16]} /></mesh>
          <mesh position={[0, 0.06, 0]} material={glow("#4fa8ff", 0.6 + 0.4 * Math.max(m.pulse(hot + 4, 8), m.pulse(melted + 4, 8)))}><sphereGeometry args={[0.07, 16, 12]} /></mesh>
          <mesh position={[0, 0.16, 0]} material={glow("#4fa8ff", 0.8)}><cylinderGeometry args={[0.015, 0.015, 0.16, 8]} /></mesh>
          <Block size={[0.14, 0.9, 0.04]} preset="white" color="#d6dae2" position={[0, 0.45, -0.05]} />
        </group>
        {/* a cold spotlight on the empty middle of the bench, until the tube rises there */}
        {f >= melted && rise < 0.95 && (
          <mesh position={[TUBE[0], 0.01, TUBE[2]]} rotation-x={-Math.PI / 2} material={glow("#7fb6ff", Math.round(0.5 * k01(f, melted, 8) * (1 - rise) * 10) / 10 || 0.01)}>
            <circleGeometry args={[0.6, 40]} />
          </mesh>
        )}
        {/* cold blue light over the bench until the tube shows */}
        <pointLight position={[0, 2, 1.5]} intensity={4 * cold * (1 - rise)} color="#7fb6ff" distance={6} />
        <group position={[TUBE[0], -0.9 + 0.9 * rise, TUBE[2]]} rotation-y={0.4}>
          <Magnetron scale={0.75} heat={Math.min(1, 0.2 + 0.6 * k01(f, mag, 14) + 0.2 * k01(f, makes, 6))} />
        </group>
        <pointLight position={[0, 1.2, 0.8]} intensity={8 * rise} color="#ff8a3d" distance={4} />
        {f >= makes && <mesh position={[0, 0.75 * 1.47, TUBE[2]]} material={glow("#fff0c8", Math.round((0.5 + 0.5 * m.pulse(makes + 4, 8)) * 10) / 10)}><sphereGeometry args={[0.1 + 0.08 * m.pulse(makes + 4, 8), 16, 12]} /></mesh>}
        <WaveRings f={f} start={micro} every={8} reach={2.4} position={[top[0], 0.75 * 1.47, top[2]]} rotation-y={1.2} />
        <Label3D at={[TUBE[0] - 0.3, 0.7, TUBE[2]]} offset={[1.0, 0.9, 0.2]} text="magnetron" sub="the tube that makes microwaves" start={mag + 4} end={micro} px={54} color={TECH.amber} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Tube;
