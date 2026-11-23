// Dive: high over the die city (wide), a 1 s dive with motion blur into one block (dive), a pointer
// lands on that core and it glows amber (core), the glow drains to plain grey and the city's lanes go
// dark (magic), rows of tiny switches rise packed tight on the core's roof (tiny), and the camera
// lands just above them (switches). No figures in this beat.
//
// The stage is frozen at the beat's story frame (p.frame), so every kit cue below is in the same
// frames as the beat's events (see City.tsx).
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import {
  Camera3D, cue, Die, direct, Focus, glow, Highlight, InstancedField, mat, Pointer3D, Stage3D, TECH, type V3,
} from "../../three/index";
import { cityCell, DieCity } from "./City";

const DIE = 2.6;
const THICK = 0.1;
const S = 4;                                   // the die city, four times bigger than in City
const CORE: [number, number] = [6, 4];
const cell = cityCell(DIE, CORE[0], CORE[1]);
const CORE_H = Math.max(cell.h, 0.12);         // the core is never a flat lot
const roofLocal: V3 = [cell.x, THICK + CORE_H, cell.z];
const ROOF: V3 = [roofLocal[0] * S, roofLocal[1] * S, roofLocal[2] * S];
const FIELD_N = 20;
const FIELD_SP = (cell.fp * 0.96) / FIELD_N;    // switches packed edge to edge over the roof

const Dive: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const dive = m.at("dive", 8);
  const core = m.at("core", 30);
  const magic = m.at("magic", 58);
  const tiny = m.at("tiny", 88);
  const switches = m.at("switches", 104);
  const end = Math.max(m.end, switches + 24);

  const keys = direct(p.beat.events, [
    { at: 0, move: "push", look: ROOF, dir: [0.15, 1, 0.55], from: 12.5, to: 11, dur: Math.max(10, dive), fov: 40 },
    { at: dive, move: "dive", look: ROOF, dir: [0.1, 1, 0.42], to: 2.2, dur: 30, fov: 38 },
    { at: dive + 30, move: "push", look: ROOF, dir: [0.1, 1, 0.42], to: 1.55, dur: Math.max(12, tiny - dive - 30) },
    { at: tiny, move: "push", look: ROOF, dir: [0.05, 1, 0.5], to: 1.2, dur: Math.max(8, switches - tiny) },
    { at: switches, move: "push", look: ROOF, dir: [0, 1, 0.55], to: 0.36, dur: 20, ease: Easing.out(Easing.cubic) },
    { at: switches + 20, move: "push", look: ROOF, dir: [-0.05, 1, 0.55], to: 0.3, dur: Math.max(20, end - switches - 20) },
  ]);

  // the magic drains: lanes and the die's floorplan go dark after "magic"
  const drain = cue(f, magic, 16);
  const lit = 1 - 0.88 * drain;
  // the core's own amber roof light: on with the pointer, gone with the magic
  const amber = Math.round(cue(f, core, 8) * (1 - cue(f, magic, 14)) * (0.8 + 0.2 * Math.sin(f / 4)) * 20) / 20;
  const fk = cue(f, dive, 30);
  const fog = { near: Math.round((16 - 12 * fk) * 2) / 2, far: Math.round((40 - 26 * fk) * 2) / 2 };

  return (
    <Freeze frame={f}>
      <Stage3D backdrop="void" floor="reflect" bloom={0.9} dof={2.5} blur={1.2} shadowBox={6} fog={fog}
       >
        <Camera3D keys={keys} seed="v02-dive" />
        <Focus at={ROOF} range={f < dive + 20 ? 4 : 0.9} />
        <group scale={S}>
          <Die size={DIE} thick={THICK} lit={0.5 * lit} seed="v02-die" cores={[3, 4]} position={[0, THICK / 2, 0]} />
          <DieCity size={DIE} frame={f} riseAt={-60} lit={lit} skip={CORE} position={[0, THICK, 0]} />
          {/* the core: amber on "core", drained to plain grey on "magic" */}
          <Highlight start={core} end={magic + 14} color={TECH.amber} strength={1.6}>
            <mesh position={[cell.x, THICK + CORE_H / 2, cell.z]} material={mat("clay", "#8b909c")} castShadow receiveShadow>
              <boxGeometry args={[cell.fp, CORE_H, cell.fp]} />
            </mesh>
          </Highlight>
          {amber > 0.02 && (
            <mesh position={[cell.x, THICK + CORE_H + 0.0008, cell.z]} material={glow(TECH.amber, amber)}>
              <boxGeometry args={[cell.fp * 1.04, 0.0012, cell.fp * 1.04]} />
            </mesh>
          )}
          {/* rows of tiny switches on its roof */}
          <InstancedField cols={FIELD_N} rows={FIELD_N} spacing={FIELD_SP} start={tiny} reveal={16} wave={0}
            color="#7a8296" seed="v02-dive-field" position={[cell.x, THICK + CORE_H + 0.0005, cell.z]} />
        </group>
        <Pointer3D at={ROOF} from={[0.25, 1, 0.35]} size={0.45} start={core - 6} end={tiny + 6} />
      </Stage3D>
    </Freeze>
  );
};

export default Dive;
