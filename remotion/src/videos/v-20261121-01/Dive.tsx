// Dive: "Shrink it, copy it, and one NVIDIA Ada Lovelace graphics chip holds up to {fact3} of them."
// The scale dive the other way. Extreme on the transistor: it shrinks to a glowing dot ("shrink");
// the dot copies into a field of thousands of switches ("copy", medium); the camera pulls back and the
// field becomes the die of a graphics card, its fans spinning ("NVIDIA", "graphics", wide); the die
// glows on the card ("chip"); then a dive back into the die, a wave of light sweeping the switches
// while the count climbs on it ("holds", extreme), and it all flares as it lands ("them").
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, Die, direct, FigLabel3D, glow, GPUCard, InstancedField, Label3D, Stage3D, TECH } from "../../three/index";
import { Transistor, k01 } from "./Parts";

type Params = { fig?: { count?: string } };
const CARD: [number, number, number] = [0, 0, 40];
const DIE: [number, number, number] = [CARD[0], 0.12, CARD[2]];

const Dive: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const shrink = m.at("shrink", 2);
  const copy = m.at("copy", 18);
  const nvidia = m.at("nvidia", 34);
  const graphics = m.at("graphics", 50);
  const chip = m.at("chip", 70);
  const holds = m.at("holds", 80);
  const them = m.at("them", 140);
  const up = m.at("up", 100);
  const lovelace = m.at("lovelace", 44);
  const one = m.at("one", 28);
  const mid = m.at("mid", 120);
  const end = Math.max(m.end, them + 20);
  const count = (p.beat.params as Params).fig?.count ?? "";
  const s = 1 - 0.97 * cue(f, shrink, 14, Easing.inOut(Easing.cubic));
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 0.35, 0], dir: [0.2, 0.45, 1], from: 2.4, to: 2.0, dur: Math.max(8, copy), fov: 35 },
    { at: copy, move: "pullback", look: [0, 0.05, 0], dir: [0.2, 0.9, 1], to: 5.5, dur: Math.max(10, nvidia - copy) },
    { at: nvidia, move: "cut", pos: [CARD[0] + 1.6, 2.4, CARD[2] + 3.4], look: [CARD[0], 0.2, CARD[2]] },
    { at: nvidia + 1, move: "push", look: [CARD[0], 0.15, CARD[2]], dir: [0.4, 0.75, 1], from: 4.3, to: 3.7, dur: Math.max(8, holds - nvidia) },
    { at: holds, move: "dive", look: [DIE[0], DIE[1], DIE[2]], dir: [0.2, 1, 0.5], to: 0.55, dur: 20 },
    { at: holds + 20, move: "push", look: [DIE[0], DIE[1], DIE[2]], dir: [0.2, 1, 0.5], to: 0.48, dur: Math.max(10, end - holds - 20) },
  ]);
  const flare = m.pulse(them + 4, 10) + 0.5 * m.pulse(mid + 3, 8);
  const open = k01(f, graphics, 18);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop="void" floor="reflect" bloom={1.2} dof={0} blur={1} shadowBox={4}>
        <Camera3D keys={keys} seed="v2101-dive" />
        {/* the transistor shrinking to a dot, then the field it copies into */}
        {f < nvidia + 2 && (
          <>
            {s > 0.05 && <Transistor position={[0, 0.06 * (1 - s), 0]} scale={s} glowL={0.6} glowR={0.6} />}
            {f >= shrink + 10 && <mesh position={[0, 0.03, 0]} material={glow(TECH.amber, 1)}><sphereGeometry args={[0.03, 12, 10]} /></mesh>}
            <InstancedField scale={1 + 0.08 * m.pulse(one + 3, 8)} cols={41} rows={41} spacing={0.12} start={copy} reveal={24} wave={10} pick={[840]} seed="v2101-copy" />
            <InstancedField cols={9} rows={9} spacing={0.12} start={-30} reveal={10} wave={0} seed="v2101-seed" />
          </>
        )}
        {/* the graphics card with its die, the field on the die */}
        {f >= nvidia - 1 && (
          <group>
            <GPUCard position={CARD} open={open} lit={0.4 + 0.6 * k01(f, chip, 8)} rps={1.4} seed="v2101-gpu" />
            <Die position={DIE} size={0.42} lit={0.5 + 0.5 * k01(f, chip, 8) + 0.3 * flare} seed="v2101-die" />
            {f >= holds && (
              <group position={[DIE[0], DIE[1] + 0.035, DIE[2]]}>
                <InstancedField cols={35} rows={35} spacing={0.011} start={holds} reveal={14} wave={16} seed="v2101-die-f" />
              </group>
            )}
            <Label3D at={[CARD[0] + 1.2, 0.4 + 1.1 * open, CARD[2]]} offset={[0.3, 0.6, 0]} text="NVIDIA" sub={f >= lovelace ? "Ada Lovelace" : undefined} start={nvidia + 2} end={holds} px={52} color={TECH.white} />
            <Label3D at={[DIE[0], DIE[1] + 0.05, DIE[2]]} offset={[-0.6, 0.5, 0.3]} text="the chip" start={chip} end={holds} px={52} color={TECH.amber} />
            <FigLabel3D fig={count} caption="transistors" at={[DIE[0], DIE[1] + 0.12, DIE[2]]} start={up} count={Math.max(12, them - up)} px={Math.round(120 + 20 * flare)} />
          </group>
        )}
      </Stage3D>
    </Freeze>
  );
};
export default Dive;
