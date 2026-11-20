// Flow: "A small voltage on one contact controls the current through the other."
// Inside the germanium, cut open under the two contacts (the crystal drawn large and see-through).
// "small": a small cyan wave pulses along the left wire; "voltage": a meter on that wire swings;
// "one": the left contact glows in time with it; "controls": the amber current under the right
// contact starts to swell and shrink with the wave; "current": the camera pulls back as the amber
// stream pulses through the crystal into the base; "other": the right contact flares on each swell.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Block, Camera3D, direct, glow, Label3D, mat, Stage3D, TECH } from "../../three/index";
import { k01 } from "./Parts";

const q = (x: number) => Math.round(x * 10) / 10;

const Flow: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const small = m.at("small", 2);
  const voltage = m.at("voltage", 14);
  const one = m.at("one", 30);
  const controls = m.at("controls", 50);
  const current = m.at("current", 70);
  const other = m.at("other", 90);
  const through = m.at("through", 80);
  const end = Math.max(m.end, other + 20);
  const wave = Math.sin(f * 0.35);
  const sig = k01(f, small, 8);
  const ctl = k01(f, controls, 10);
  const swell = 0.35 + 0.65 * (0.5 + 0.5 * wave);
  const amp = (1 - ctl) * 0.35 + ctl * swell;
  const keys = direct({}, [
    { at: 0, move: "push", look: [-0.9, 0.9, 0], dir: [0.1, 0.3, 1], from: 3.4, to: 2.8, dur: Math.max(8, controls), fov: 35 },
    { at: controls, move: "push", look: [0.7, 0.4, 0], dir: [0.25, 0.3, 1], to: 2.6, dur: Math.max(8, current - controls) },
    { at: current, move: "pullback", look: [0, 0.4, 0], dir: [0.2, 0.35, 1], to: 5.0, dur: Math.max(10, end - current) },
  ]);
  // the left wire, from the meter to the left contact; the right stream, down through the crystal
  const leftPath = Array.from({ length: 16 }, (_, i) => [-2.2 + i * 0.1, 1.5 - i * 0.02, 0] as [number, number, number]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop="void" floor="reflect" bloom={1.2} dof={0} blur={1} shadowBox={3}>
        <Camera3D keys={keys} seed="v2101-flow" />
        {/* the metal base and the cut crystal on it */}
        <Block size={[3.6, 0.3, 1.6]} radius={0.03} material={mat("brushed", "#7f8694", { emissive: TECH.amber, emissiveIntensity: Math.round(0.6 * k01(f, through, 8) * swell * 10) / 10 })} position={[0, 0.15, 0]} />
        <Block size={[3.0, 0.9, 1.2]} radius={0.02} material={mat("glass", "#8e9bb0", { opacity: 0.32 })} position={[0, 0.75, 0]} />
        {/* the crystal's atoms, faint */}
        {Array.from({ length: 60 }, (_, i) => (
          <mesh key={i} position={[-1.35 + (i % 12) * 0.245, 0.42 + Math.floor(i / 12) * 0.16, 0.45]} material={glow("#7d8cff", 0.25)}>
            <sphereGeometry args={[0.025, 8, 6]} />
          </mesh>
        ))}
        {/* the two contacts on top */}
        <mesh position={[-0.35, 1.28, 0]} rotation-z={-0.5} material={mat("gold", undefined, { emissive: TECH.cyan, emissiveIntensity: q(0.2 + 1.2 * k01(f, one, 6) * (0.5 + 0.5 * wave)) })}><boxGeometry args={[0.6, 0.05, 0.4]} /></mesh>
        <mesh position={[0.35, 1.28, 0]} rotation-z={0.5} material={mat("gold", undefined, { emissive: TECH.amber, emissiveIntensity: q(0.2 + 1.6 * k01(f, other, 6) * swell) })}><boxGeometry args={[0.6, 0.05, 0.4]} /></mesh>
        {/* the small signal on the left wire */}
        <mesh position={[-1.45, 1.35, 0]} rotation-z={Math.PI / 2 - 0.2} material={mat("copper")}><cylinderGeometry args={[0.02, 0.02, 1.6, 8]} /></mesh>
        {sig > 0.02 && leftPath.map((pt, i) => (
          <mesh key={i} position={[pt[0], pt[1] + 0.06 * Math.sin(i * 0.9 - f * 0.35), 0.03]} material={glow(TECH.cyan, q(0.9 * sig))}>
            <sphereGeometry args={[0.03, 8, 6]} />
          </mesh>
        ))}
        {/* the voltage meter on the left wire */}
        <group position={[-2.3, 1.55, 0]}>
          <Block size={[0.55, 0.55, 0.2]} radius={0.04} preset="blackPlastic" color="#23272f" />
          <mesh position={[0, 0, 0.105]} material={mat("white", "#f0ece2")}><circleGeometry args={[0.2, 30]} /></mesh>
          <mesh position={[0, -0.08, 0.115]} rotation-z={-0.6 * k01(f, voltage, 8) * wave} material={glow("#ff4d3d", 1)}><boxGeometry args={[0.012, 0.3, 0.005]} /></mesh>
        </group>
        {/* the current through the right contact, swelling with the signal */}
        {Array.from({ length: 18 }, (_, i) => {
          const t = ((f * 0.03 + i / 18) % 1);
          const y = 1.25 - t * 1.0;
          const x = 0.45 + 0.15 * Math.sin(t * 3);
          const r = 0.03 + 0.07 * amp;
          return (
            <mesh key={i} position={[x, y, 0]} material={glow(TECH.amber, q(0.5 + 0.5 * amp))}>
              <sphereGeometry args={[r, 10, 8]} />
            </mesh>
          );
        })}
        <mesh position={[1.9, 0.6, 0]} rotation-z={-0.3} material={mat("copper")}><cylinderGeometry args={[0.025, 0.025, 1.4, 8]} /></mesh>
        <Label3D at={[-2.3, 1.85, 0]} offset={[0.1, 0.45, 0]} text="small voltage" start={voltage} px={50} color={TECH.cyan} align="center" />
        <Label3D at={[0.5, 0.75, 0.3]} offset={[0.7, -0.5, 0.3]} text="current" start={current} px={52} color={TECH.amber} />
      </Stage3D>
    </Freeze>
  );
};
export default Flow;
