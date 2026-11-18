// Ring: "Each cavity rings like a whistle, and invisible waves pour out."
// Extreme close on one keyhole cavity as a spoke of electrons sweeps past; on "rings" it pulses amber in
// rhythm; on "whistle" ripples shiver out of its mouth; on "waves" the camera pulls back (medium): every
// cavity sends ripples inward; on "pour" a stream of waves pours up out of the antenna.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, glow, Label3D, mat, Stage3D, TECH } from "../../three/index";
import { AnodeRing, CAVS, cavityLight, WaveRings, k01 } from "./Parts";

const ONE = (Math.PI * 2 / CAVS) * 2.5;
const CAV: [number, number, number] = [Math.cos(ONE) * 1.18, 0.2, Math.sin(ONE) * 1.18];

const Ring: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const rings = m.at("rings", 14);
  const whistle = m.at("whistle", 34);
  const waves = m.at("waves", 60);
  const pour = m.at("pour", 80);
  const end = Math.max(m.end, pour + 24);
  const wheel = 6 + f * 0.07;
  const lit = cavityLight(wheel, 1).map((l, i) => (i === 2 ? Math.max(l, 0.4 * k01(f, rings, 6) * (0.5 + 0.5 * Math.sin(f / 2.5))) : l * k01(f, waves - 6, 10)));
  const keys = direct({}, [
    { at: 0, move: "push", look: CAV, dir: [0.1, 1, 0.5], from: 1.7, to: 1.4, dur: Math.max(8, waves), fov: 35 },
    { at: waves, move: "pullback", look: [0, 0.3, 0.3], dir: [0.2, 1, 0.8], to: 5.4, dur: 24 },
    { at: waves + 24, move: "push", look: [0, 0.8, 0.2], dir: [0.2, 0.7, 1], to: 5.0, dur: Math.max(10, end - waves - 24) },
  ]);
  const antenna = k01(f, waves, 14);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop="void" floor={false} bloom={1.2} dof={0} blur={1} shadowBox={3}>
        <Camera3D keys={keys} seed="v1901-ring" />
        <AnodeRing wheel={wheel} cloud={1} spokes={1} lit={lit} f={f} />
        {/* ripples out of the one cavity, then out of every cavity */}
        <WaveRings f={f} start={whistle} every={6} reach={0.7} axis="y" position={[CAV[0], 0.25, CAV[2]]} color={TECH.amber} />
        {Array.from({ length: CAVS }, (_, i) => {
          const a = (Math.PI * 2 / CAVS) * (i + 0.5);
          return i === 2 ? null : <WaveRings key={i} f={f} start={waves + i * 2} every={7} reach={0.6} axis="y" position={[Math.cos(a) * 1.18, 0.25, Math.sin(a) * 1.18]} color={TECH.amber} />;
        })}
        {/* the antenna rising from the ring, and the waves pouring out of it */}
        {antenna > 0.01 && (
          <mesh position={[0, 0.2 + 0.7 * antenna, -0.9]} material={mat("brushed")}><cylinderGeometry args={[0.06, 0.06, 1.4 * antenna, 12]} /></mesh>
        )}
        <WaveRings f={f} start={pour} every={6} reach={1.4} axis="y" position={[0, 1.6, -0.9]} />
        <WaveRings f={f} start={pour + 3} every={6} reach={1.0} axis="y" position={[0, 2.1, -0.9]} />
        {antenna > 0.5 && <mesh position={[0, 1.6, -0.9]} material={glow("#ffd7a0", 0.8)}><sphereGeometry args={[0.08, 12, 10]} /></mesh>}
        <Label3D at={[0, 1.6, -0.9]} offset={[0.5, 0.5, 0]} text="microwaves" start={pour + 4} px={52} color={TECH.amber} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Ring;
