// Fire: "Then the lead locomotive caught fire. Firefighters shut its engine down."
// Medium on the parked locomotive at the head of the train ("locomotive"); flames and smoke burst from the
// engine hatch, the camera pushes in ("fire"); pull back wide as a fire truck's red lights flash across the
// train ("firefighters"); the flames die, the exhaust stops and the cab lamp goes out ("down").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Focus, Label3D, Smoke } from "../../three/index";
import { AMBER, Consist, Flames, Line, Shot3D, Trees, useMats, vehX } from "./World";
import { GRADE } from "./Hill";

/** The fire truck by the line, its light bar flashing red and blue. */
const FireTruck: React.FC<{ flash: number }> = ({ flash }) => {
  const M = useMats();
  const red = M.paint("body", "#b11a14"), tyre = M.paint("rubber", "#151515");
  return (
    <group position={[1.2, 0, 3.2]} rotation-y={-0.4}>
      <mesh position={[0, 0.42, 0]} material={red} castShadow><boxGeometry args={[1.8, 0.62, 0.7]} /></mesh>
      <mesh position={[0.62, 0.86, 0]} material={red}><boxGeometry args={[0.56, 0.3, 0.68]} /></mesh>
      <mesh position={[0.62, 1.04, 0]} material={M.lamp(flash > 0.5 ? "#ff2a2a" : "#2a5cff", 1)}><boxGeometry args={[0.4, 0.06, 0.3]} /></mesh>
      {[-0.55, 0.6].map((x) => [-1, 1].map((s) => (
        <mesh key={`${x}${s}`} position={[x, 0.12, s * 0.36]} rotation-x={Math.PI / 2} material={tyre}><cylinderGeometry args={[0.13, 0.13, 0.08, 14]} /></mesh>
      )))}
      <pointLight position={[0.62, 1.4, 0]} intensity={5 * flash} distance={9} color={flash > 0.5 ? "#ff3030" : "#3a6cff"} />
    </group>
  );
};

const Fire: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const fire = m.at("fire", 18), ff = m.at("firefighters", 34), down = m.at("down", 60);
  const hatch: [number, number, number] = [vehX(0) - 0.05, 1.16, 0];
  const burn = m.lerp([fire, fire + 10], [0, 1]) * m.lerp([down, down + 14], [1, 0]);
  const off = m.lerp([down, down + 8], [1, 0]);
  const flash = f >= ff ? (Math.floor(f / 5) % 2 === 0 ? 1 : 0.15) : 0;
  const keys = f >= ff
    ? direct({}, [
        { at: 0, move: "hold", pos: [4.5, 2.6, 7.5], look: [-3, 0.7, 0], fov: 44 },
        { at: ff, move: "cut", pos: [4.5, 2.6, 7.5], look: [-3, 0.7, 0], fov: 44 },
        { at: ff + 1, move: "pullback", look: [-3, 0.7, 0], dir: [0.5, 0.25, 0.83], from: 9.3, to: 10.5, dur: Math.max(10, m.end - ff) },
      ])
    : direct({}, [
        { at: 0, move: "hold", pos: [1.6, 1.9, 3.4], look: [-1.9, 1.0, 0], fov: 44 },
        { at: fire, move: "push", look: [hatch[0], 1.2, 0], dir: [0.6, 0.35, 0.72], from: 4.6, to: 3.2, dur: Math.max(10, ff - fire) },
      ]);
  return (
    <Shot3D f={f}>
      <Camera3D keys={keys} seed="lm-fire" drift={0.01} />
      <Focus at={[-1.8, 1.0, 0]} range={4} />
      <group rotation-z={GRADE}>
        <Line length={90} x={-15} />
        <Trees from={-60} to={30} seed="hill-trees" />
        <Consist cars={10} travelled={0} loco={{ lamp: off, head: 0.35 * off, hot: burn }} />
        <Flames at={hatch} t={f} k={burn} size={0.7} spread={0.2} seed="engine" />
        {f >= fire ? <Smoke frame={f - fire} at={[hatch[0], 1.3, 0]} height={4} width={1.6} count={26} life={90} wind={[-0.5, 0, 0.1]} opacity={0.65 * Math.max(0.2, burn)} glow="#ff7a2a" seed="lm-smoke" /> : null}
        {/* the fire truck by the line, its light bar flashing */}
        {f >= ff ? <FireTruck flash={flash} /> : null}
        {f >= down ? <Label3D at={[vehX(0), 1.2, 0.3]} offset={[0.3, 1.0, 0.6]} text="ENGINE SHUT DOWN" start={down} px={50} color={AMBER} /> : null}
      </group>
    </Shot3D>
  );
};
export default Fire;
