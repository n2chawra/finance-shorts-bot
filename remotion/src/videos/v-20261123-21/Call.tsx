// Call: "In April of {fact2} it made a real call, on a New York street."
// A New York avenue in daylight: the camera glides down between the towers ("street", wide); a banner
// with the date lands over the crossing ("April") and bounces as the camera sweeps on (1.9 s); a figure on the pavement lifts the prototype to his
// ear ("made", medium) as a passer-by walks up the far pavement ("it"); a signal arc leaps from it to a rooftop tower ("real"); close on the handset,
// its display blinking with the call ("call", close); the passer-by turns ("New"); it blinks again ("street").
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, FigLabel3D, glow, Label3D, rnd, Stage3D, TECH, type V3 } from "../../three/index";
import { Avenue, k01, Person, Tower } from "./Models";

type Params = { fig?: { year?: string } };
const DAY = { top: "#7fb3e6", bottom: "#e6edf5", glow: "rgba(255,240,200,0.25)" };
const MAN: V3 = [-4.4, 0.16, 0];
const TOWER_H = 14 + 26 * rnd("ny", 2);
const TOWER: V3 = [-10.5, TOWER_H, -9.5];

const Call: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const april = m.at("april", 14);
  const it = m.at("it", 26);
  const made = m.at("made", 30);
  const real = m.at("real", 40);
  const call = m.at("call", 48);
  const nw = m.at("new", 60);
  const street = m.at("street", 72);
  const end = Math.max(m.end, street + 14);
  const fig = (p.beat.params as Params).fig ?? {};
  const raise = k01(f, made, 14);
  const ear: V3 = [MAN[0] + 0.25, MAN[1] + 1.7, MAN[2] + 0.1];
  const arc = k01(f, real, 16);
  const keys = direct({}, [
    { at: 0, move: "fly", path: [[1.5, 9, 30], [0.5, 6, 16], [-1.2, 3.6, 7.5]], look: [-3.5, 3.5, -4], dur: Math.max(16, made) },
    { at: made, move: "push", look: [MAN[0], 2.2, 0], dir: [0.8, 0.25, 1], to: 4.6, dur: Math.max(8, call - made) },
    { at: call, move: "push", look: [ear[0], ear[1] - 0.1, ear[2]], dir: [0.9, 0.15, 1], to: 1.7, dur: Math.max(12, end - call) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={DAY} floor={false} bloom={0.7} dof={0} blur={1} shadowBox={14} light={1.4} fog={{ color: "#dfe8f2", near: 30, far: 90 }}>
        <Camera3D keys={keys} seed="v2321-call" />
        <Avenue />
        <Person position={MAN} rotation-y={0.9} raise={raise} />
        {/* the handset's display blinking with the call */}
        <mesh position={[ear[0] - 0.05, ear[1] - 0.25, ear[2] + 0.12]} material={glow("#ff3b2f", Math.round(20 * (0.2 + 0.8 * Math.max(m.pulse(call + 3, 5), m.pulse(street + 3, 5)))) / 20)}><sphereGeometry args={[0.05, 8, 6]} /></mesh>
        <Person position={[-5.6, 0.16, -3]} rotation-y={0.2} coat="#7a4a3a" />
        <Person position={[5.0, 0.16, -6 + 2.5 * k01(f, it, 30)]} rotation-y={-2.6 + 1.2 * k01(f, nw, 10)} coat="#4f6b4a" />
        <group position={TOWER}><Tower h={4} lit={k01(f, real + 10, 6)} f={f} /></group>
        {Array.from({ length: 16 }, (_, i) => i / 15).filter((u) => u <= arc).map((u, i) => {
          const pos: V3 = [ear[0] + (TOWER[0] - ear[0]) * u, ear[1] + (TOWER[1] + 4 - ear[1]) * u + 4 * Math.sin(Math.PI * u), ear[2] + (TOWER[2] - ear[2]) * u];
          return <mesh key={i} position={pos} material={glow(TECH.cyan)}><sphereGeometry args={[0.12, 8, 6]} /></mesh>;
        })}
        {/* the date banner over the crossing */}
        <group position={[0, 7.5, 1.5]}>
          {[-6.5, 6.5].map((x, i) => <mesh key={i} position={[x, -3.75, 0]}><cylinderGeometry args={[0.08, 0.08, 7.5, 8]} /><meshStandardMaterial color="#3b3f48" /></mesh>)}
        </group>
        <FigLabel3D fig={fig.year ?? ""} caption="April" at={[0, 7.4, 1.5]} start={april} count={0} px={Math.round(130 + 30 * m.pulse(57, 8))} color={TECH.amber} />
        <Label3D at={[MAN[0], 1.9, 0]} offset={[1.2, 1.0, 0]} text="New York" sub="the first public call" start={made} end={call + 6} px={52} color={TECH.white} align="left" />
      </Stage3D>
    </Freeze>
  );
};
export default Call;
