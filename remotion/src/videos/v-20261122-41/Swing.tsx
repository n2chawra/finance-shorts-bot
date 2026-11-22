// Swing: "It keeps turning the ship. Why not just stop?"
// The river bend from high above: the tanker turning, its track drawing behind it on the water in amber
// ("kept"); the track bends into a curve ("turning"); an arrow on the bow points across the river at the far
// bank's wharf and the moored riverboat ("bow"); the curve tightens ("swinging"); STOP? pulses at the bow ("stop").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Focus } from "../../three/index";
import { AMBER, River, Riverboat, Shot3D, Tag, TankerAt, turnPose } from "./World";

const Swing: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const kept = m.at("keeps", 2), turning = m.at("turning", 14), swinging = m.at("ship", 34), stop = m.at("stop", 56), bow = turning + 6;
  const phi = m.lerp([0, m.end], [0.3, 0.78]);
  const T = turnPose(phi);
  const centre: [number, number, number] = [-2, 0, 3];
  const keys = direct({}, [
    { at: 0, move: "push", look: centre, dir: [-0.15, 0.93, -0.33], from: 30, to: 26, dur: Math.max(10, turning) },
    { at: turning, move: "push", look: [T.pos[0] + 2, 0, T.pos[2] + 2], dir: [-0.2, 0.9, -0.38], to: 19, dur: Math.max(10, swinging - turning) },
    { at: swinging, move: "pullback", look: [-1, 0, 4], dir: [-0.2, 0.9, -0.38], to: 27, dur: Math.max(10, m.end - swinging) },
  ]);
  const drawn = m.lerp([kept, m.end], [0.25, 1]);
  const steps = 36;
  return (
    <Shot3D f={f}
      overlay={
        <>
          <Tag t={f} at={bow} top={390} text="BOW SWINGING TO THE FAR BANK" color={AMBER} size={46} />
          {f >= stop ? <Tag t={f} at={stop} top={1200} text="STOP?" color="#f4efe7" size={70} /> : null}
        </>
      }>
      <Camera3D keys={keys} seed="ms-swing" drift={0.02} />
      <Focus at={T.pos} range={40} />
      <River f={f} boat={<Riverboat />} />
      <TankerAt f={f} pos={T.pos} yaw={T.yaw} rudder={0.6} stress={0.7} />
      {/* the track: amber marks along the swing so far, from phi 0 */}
      {Array.from({ length: steps }, (_, i) => {
        const ph = (i / (steps - 1)) * phi;
        if (i / (steps - 1) > drawn) return null;
        const s = turnPose(ph).stern;
        return (
          <mesh key={i} position={[s[0], 0.05, s[2]]} rotation-x={-Math.PI / 2}>
            <circleGeometry args={[0.12, 12]} />
            <meshBasicMaterial color={AMBER} transparent opacity={0.85} />
          </mesh>
        );
      })}
      {/* the arrow ahead of the bow */}
      {f >= bow ? (() => {
        const ah = turnPose(Math.min(1.3, phi + 0.5)).bow;
        const k = m.lerp([bow, bow + 12], [0, 1]);
        const mx = T.bow[0] + (ah[0] - T.bow[0]) * k, mz = T.bow[2] + (ah[2] - T.bow[2]) * k;
        const len = Math.hypot(mx - T.bow[0], mz - T.bow[2]);
        const ang = Math.atan2(mz - T.bow[2], mx - T.bow[0]);
        return (
          <group position={[(T.bow[0] + mx) / 2, 0.12, (T.bow[2] + mz) / 2]} rotation-y={-ang}>
            <mesh rotation-x={-Math.PI / 2}><planeGeometry args={[Math.max(0.01, len), 0.16]} /><meshBasicMaterial color={AMBER} /></mesh>
            <mesh position={[len / 2 + 0.2, 0, 0]} rotation-z={-Math.PI / 2}><coneGeometry args={[0.35, 0.6, 3]} /><meshBasicMaterial color={AMBER} /></mesh>
          </group>
        );
      })() : null}
      <pointLight position={[T.stern[0], 0.6, T.stern[2]]} intensity={1.2} distance={4} color="#ff9a3c" />
    </Shot3D>
  );
};
export default Swing;
