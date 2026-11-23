// Waves: "How does it call with no wire? The radio turns your voice into radio waves for a tower nearby."
// A city block at night: close on the handset on a street corner, a phone cord that isn't there drops
// away ("How", "wire") as its display blinks ("call"); the keypad lights ("turns"); the radio glows through the shell ("radio", medium); a sound wave pulses from the
// mouthpiece ("voice"); rings of radio waves spread over the street ("waves"); the camera rises to the
// rooftop tower as they reach it and it lights ("tower", wide); its beacon blinks back ("nearby").
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, glow, Label3D, Stage3D, TECH, type V3 } from "../../three/index";
import { BACK, blockAt, blockTop, CityGrid, Handset, k01, q, Tower, Waves as Rings } from "./Models";

const HAND: V3 = [1.2, 0, 1.2];
const TB = 16;
export const towerTop = (): V3 => { const b = blockAt(TB); return [b[0], blockTop(TB) + 2.2, b[2]]; };

const Waves: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const call = m.at("call", 6);
  const wire = m.at("wire", 14);
  const turns = m.at("turns", 32);
  const radio = m.at("radio", 26);
  const voice = m.at("voice", 38);
  const waves = m.at("waves", 50);
  const tower = m.at("tower", 62);
  const near = m.at("nearby", 72);
  const end = Math.max(m.end, near + 20);
  const tt = towerTop();
  const drop = k01(f, wire, 16);
  const keys = direct({}, [
    { at: 0, move: "push", look: [HAND[0], 0.5, HAND[2]], dir: [0.6, 0.35, 1], from: 3.4, to: 3.0, dur: Math.max(8, radio), fov: 42 },
    { at: radio, move: "pullback", look: [0.4, 0.8, 0.4], dir: [0.6, 0.5, 1], to: 7, dur: Math.max(8, tower - radio) },
    { at: tower, move: "pullback", look: [-0.6, 2.2, -0.8], dir: [0.55, 0.65, 1], to: 13, dur: Math.max(12, end - tower) },
  ]);
  const b = blockAt(TB);
  // the beam from the handset to the tower, drawn out as the waves reach it
  const beam = k01(f, waves + 6, Math.max(8, tower - waves));
  const pts = Array.from({ length: 14 }, (_, i) => i / 13).filter((u) => u <= beam);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor={false} bloom={1.1} dof={0} blur={1} shadowBox={10} fog={{ color: "#05070f", near: 10, far: 34 }}>
        <Camera3D keys={keys} seed="v2321-waves" />
        <CityGrid n={7} lights={0.9} />
        <group position={HAND}>
          <group scale={0.12} rotation-y={-0.6}><Handset lit={0.3 + 0.7 * m.pulse(call + 4, 6) + 0.5 * k01(f, radio, 10)} keys={0.2 + 0.8 * k01(f, turns, 10)} /></group>
          {/* the cord that isn't needed: it hangs from the handset, then drops away and fades */}
          {drop < 1 && (
            <mesh position={[0.1, 0.18 - 0.5 * drop, 0.15]} rotation-z={0.3 + drop} material={glow("#c9c1b0", q(1 - drop))}>
              <torusGeometry args={[0.12, 0.012, 6, 24, Math.PI * 1.4]} />
            </mesh>
          )}
          {/* the radio glowing through the shell */}
          <mesh position={[0, 0.45, 0]} material={glow(TECH.lime, q(0.6 * k01(f, radio, 10)))}><sphereGeometry args={[0.12, 16, 10]} /></mesh>
          {/* the voice: a pulse from the mouthpiece */}
          <Rings f={f} start={voice} n={2} reach={0.6} color={TECH.amber} upright position={[0, 0.15, 0.2]} />
          <Rings f={f} start={waves} n={4} reach={6} position={[0, 0.05, 0]} />
        </group>
        <group position={[b[0], blockTop(TB), b[2]]}><Tower lit={k01(f, tower, 8) * (1 - 0.6 * m.pulse(near + 6, 5))} f={f} /></group>
        {pts.map((u, i) => {
          const pos: V3 = [HAND[0] + (tt[0] - HAND[0]) * u, 0.5 + (tt[1] - 0.5) * u + 1.2 * Math.sin(Math.PI * u), HAND[2] + (tt[2] - HAND[2]) * u];
          return <mesh key={i} position={pos} material={glow(TECH.cyan, 0.9)}><sphereGeometry args={[0.05, 8, 6]} /></mesh>;
        })}
        <Label3D at={tt} offset={[0.6, 0.9, 0]} text="tower" start={tower} px={58} color={TECH.cyan} align="left" />
        <Label3D at={[HAND[0], 0.4, HAND[2]]} offset={[0.5, 0.8, 0]} text="radio" start={radio} end={tower} px={54} color={TECH.lime} align="left" />
      </Stage3D>
    </Freeze>
  );
};
export default Waves;
