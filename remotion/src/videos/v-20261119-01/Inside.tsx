// Inside: "Inside, a magnet bends electrons into a spinning wheel past little copper cavities."
// The magnetron's fin stack lifts away on "Inside" and shows the copper ring with its cavities around a
// glowing centre wire (medium, seen from above); on "magnet" two magnets slide in above and below with
// field lines between them; on "electrons" a cloud of blue electrons leaves the wire (close); on
// "spinning" they curl into a turning wheel of spokes; on "cavities" the spokes sweep past the cavities,
// each lighting as a spoke passes.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, glow, Label3D, mat, Stage3D, TECH } from "../../three/index";
import { AnodeRing, cavityLight, Magnetron, k01 } from "./Parts";

const Inside: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const inside = m.at("inside", 4);
  const magnet = m.at("magnet", 20);
  const elec = m.at("electrons", 44);
  const spin = m.at("spinning", 70);
  const cav = m.at("cavities", 110);
  const bends = m.at("bends", 32);
  const wheelW = m.at("wheel", 84);
  const copper = m.at("copper", 98);
  const end = Math.max(m.end, cav + 24);
  const lift = k01(f, inside, 22);
  const mg = k01(f, magnet, 16);
  const cloud = k01(f, elec, 18);
  const spokes = k01(f, spin, 20);
  const wheel = f < spin ? 0 : (f - spin) * 0.05 + (f < wheelW ? 0 : (f - wheelW) * 0.04);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 0, 0.3], dir: [0, 1, 0.75], from: 7.4, to: 6.4, dur: Math.max(8, elec), fov: 35 },
    { at: elec, move: "push", look: [0, 0, 0.25], dir: [0.1, 1, 0.55], to: 4.4, dur: Math.max(8, cav - elec) },
    { at: cav, move: "push", look: [0.5, 0, 0.6], dir: [0.15, 1, 0.6], to: 3.4, dur: Math.max(10, end - cav) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop="void" floor={false} bloom={1.1} dof={0} blur={1} shadowBox={3}>
        <Camera3D keys={keys} seed="v1901-inside" />
        <pointLight position={[0, 2.5, 1.5]} intensity={12 * k01(f, copper, 10)} color="#ffb070" distance={7} />
        <AnodeRing wheel={wheel} cloud={cloud} spokes={spokes} lit={cavityLight(wheel, k01(f, cav - 4, 10))} f={f} />
        {/* the outside of the tube, lifting off and away */}
        {lift < 0.99 && <Magnetron scale={2.6} position={[0, -1.6 + 9 * lift, 0]} heat={0.3} />}
        {/* the magnets above and below, and the field lines between them */}
        {mg > 0.01 && [-1, 1].map((s) => (
          <mesh key={s} position={[3.4 - 3.4 * mg, s * 0.95, 0]} material={mat("ceramic", "#4a5263")}>
            <cylinderGeometry args={[1.0, 1.0, 0.22, 48]} />
          </mesh>
        ))}
        {mg > 0.5 && Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2 + 0.3;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.45, 0, Math.sin(a) * 0.45]} material={glow(TECH.violet, Math.round((0.3 + 0.3 * k01(f, bends, 8) + 0.2 * Math.sin(f / 5 + i)) * 10) / 10)}>
              <cylinderGeometry args={[0.012, 0.012, 1.7, 6]} />
            </mesh>
          );
        })}
        <Label3D at={[0.4, 0.2, -0.2]} offset={[0.2, 0.7, -0.6]} text="electrons" start={elec + 6} px={52} color={TECH.cyan} align="center" />
        <Label3D at={[Math.cos(Math.PI / 8 * 3) * 1.18, 0.2, Math.sin(Math.PI / 8 * 3) * 1.18]} offset={[0.3, 0.6, 0.4]} text="cavity" start={cav + 6} px={52} color={TECH.amber} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Inside;
