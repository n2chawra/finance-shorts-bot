// Bits: the field of switches, the camera circling one close. A scan dome singles one switch out
// (either), it lights amber (on), goes dark (off), "1 / ON" and "0 / OFF" write on above it (zero),
// then a wave flicks across the field and red, green and blue light rises out of it into one coloured
// dot above the field while the camera pulls back to a medium (colour). No figures in this beat: the
// one and the zero are the words of the line, written as labels.
//
// The stage is frozen at the beat's story frame (p.frame), so every kit cue below is in the same
// frames as the beat's events (see City.tsx).
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import {
  Camera3D, cue, direct, fieldCellAt, Focus, glow, InstancedField, Label3D, lerp3, mat, ScanDome, Stage3D, TECH, type V3,
} from "../../three/index";

const N = 21;
const SP = 0.12;
const CENTER = Math.floor(N / 2) * N + Math.floor(N / 2);
const ONE: V3 = fieldCellAt(CENTER, N, N, SP);           // the singled-out switch
const TOP_Y = SP * 0.56;
const DOT: V3 = [0, 0.62, 0];
const SOURCES: { i: number; color: string }[] = [
  { i: CENTER - 3 * N - 4, color: "#ff3b5c" },
  { i: CENTER + 2 * N + 5, color: "#3bff7a" },
  { i: CENTER + 4 * N - 3, color: "#3b8bff" },
];
const ADDITIVE = 2; // three's AdditiveBlending

const Bits: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const either = m.at("either", 12);
  const on = m.at("on", 24);
  const off = m.at("off", 40);
  const zero = m.at("zero", 70);
  const colour = m.at("colour", 120);
  const every = m.at("every", colour - 10);                         // "every colour": the camera starts to lift
  const thats = m.at("thats", Math.round((off + zero) / 2));   // "That's it." → the switch blinks once
  const end = Math.max(m.end, colour + 30);

  const keys = direct(p.beat.events, [
    { at: 0, move: "orbit", center: [ONE[0], 0.05, ONE[2]], radius: 0.78, height: 0.62, from: 0.55, to: -0.3, dur: Math.max(30, colour), fov: 38,
      ease: Easing.inOut(Easing.sin) },
    { at: every, move: "pullback", look: [0, 0.3, 0], dir: [0.2, 0.62, 1], to: 1.4, dur: Math.max(6, colour - every) },
    { at: colour, move: "pullback", look: [0, 0.3, 0], dir: [0.2, 0.62, 1], to: 2.5, dur: 28 },
    { at: colour + 28, move: "push", look: [0, 0.3, 0], dir: [0.3, 0.62, 1], from: 2.5, to: 2.25, dur: Math.max(20, end - colour - 28) },
  ]);

  // the one switch: lit between "on" and "off", then dark (a black cap and no halo)
  const lightK = Math.max(cue(f, on, 4) * (1 - cue(f, off, 5)), m.pulse(thats, 10));
  const dark = cue(f, off, 5) * (1 - cue(f, colour, 10));
  const lit = f >= on && f < off + 3;
  // the coloured dot: red, green and blue rise out of the field and merge into one
  const merge = cue(f, colour + 14, 22, Easing.inOut(Easing.cubic));
  const built = m.at("built", colour + 30);                          // "built from them": the dot pops into being
  const dotGrow = cue(f, built, 12, Easing.out(Easing.back(1.8)));
  const before = f < colour;

  return (
    <Freeze frame={f}>
      <Stage3D backdrop="void" floor="reflect" bloom={1} dof={2.5} blur={1} shadowBox={2} fog={{ near: 3, far: 9 }}
       >
        <Camera3D keys={keys} seed="v02-bits" />
        <Focus at={before ? [ONE[0], TOP_Y, ONE[2]] : [0, 0.3, 0]} range={before ? 0.7 : 1.6} />
        {before ? (
          <InstancedField cols={N} rows={N} spacing={SP} start={-40} reveal={1} wave={0} pick={lit ? [CENTER] : []}
            pickColor={TECH.amber} color="#7a8296" seed="v02-bits-field" />
        ) : (
          // the same field, a wave of switches flicking on and off across it from "colour"
          <InstancedField cols={N} rows={N} spacing={SP} start={colour} reveal={0} wave={16} waveColor={TECH.cyan}
            color="#7a8296" seed="v02-bits-field" />
        )}
        {/* the scan singles one switch out */}
        <ScanDome at={[ONE[0], 0, ONE[2]]} radius={0.17} start={either} end={zero + 8} speed={0.9} />
        {/* on: a warm halo above it; off: its top goes black */}
        {lightK > 0.02 && (
          <mesh position={[ONE[0], TOP_Y + 0.02, ONE[2]]} scale={0.6 + 0.4 * lightK} renderOrder={4}>
            <sphereGeometry args={[0.06, 24, 16]} />
            <meshBasicMaterial color={TECH.amber} transparent opacity={0.45 * lightK} toneMapped={false} depthWrite={false} blending={ADDITIVE} />
          </mesh>
        )}
        {dark > 0.02 && (
          <mesh position={[ONE[0], TOP_Y + 0.002, ONE[2]]} material={mat("glossy", "#05060a")}>
            <boxGeometry args={[SP * 0.64 * dark, 0.004, SP * 0.22]} />
          </mesh>
        )}
        {/* a one and a zero write on above it */}
        <Label3D at={[ONE[0] - 0.01, TOP_Y, ONE[2]]} offset={[-0.2, 0.26, 0]} text="1" sub="ON" color={TECH.amber} px={96} align="right"
          start={zero - 6} end={colour + 12} />
        <Label3D at={[ONE[0] + 0.01, TOP_Y, ONE[2]]} offset={[0.2, 0.26, 0]} text="0" sub="OFF" color={TECH.white} px={96} align="left"
          start={zero + 2} end={colour + 12} />
        {/* every colour is built from them */}
        {!before && SOURCES.map((s, k) => {
          const rise = cue(f, colour + 4 + k * 3, 12, Easing.out(Easing.cubic));
          if (rise <= 0 || merge >= 1) return null;
          const src = fieldCellAt(s.i, N, N, SP);
          const lifted: V3 = [src[0], TOP_Y + 0.25 * rise, src[2]];
          return (
            <mesh key={k} position={lerp3(lifted, DOT, merge)} scale={rise * (1 - 0.5 * merge)} material={glow(s.color)}>
              <sphereGeometry args={[0.035, 20, 14]} />
            </mesh>
          );
        })}
        {dotGrow > 0 && (
          <group position={DOT}>
            <mesh scale={dotGrow} material={glow("#ff8a3d")}>
              <sphereGeometry args={[0.075, 32, 20]} />
            </mesh>
            <mesh scale={dotGrow * (1.6 + 0.15 * Math.sin(f / 5))} renderOrder={4}>
              <sphereGeometry args={[0.075, 32, 20]} />
              <meshBasicMaterial color="#ff8a3d" transparent opacity={0.22} toneMapped={false} depthWrite={false} blending={ADDITIVE} />
            </mesh>
          </group>
        )}
      </Stage3D>
    </Freeze>
  );
};

export default Bits;
