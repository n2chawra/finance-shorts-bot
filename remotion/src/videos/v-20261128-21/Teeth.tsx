// Teeth: "But a motor this small can't turn an engine head-on. This pinion has {fact1} teeth. The ring has {fact2}."
// A dark workbench under a lamp, the starter's pinion in mesh with the flywheel's ring gear, both at their
// true sizes, seen from behind the flywheel (wide). "But": the motor strains, nothing moves; "head-on": a red
// stop bar flashes across the stuck gears, then the starter's tag writes on (Bosch, from a Saab); "pinion" (close): its teeth
// light one by one, the count on a plate; "teeth": the last one lights; "ring" (wide): the camera pulls back
// across the ring, its teeth lighting round the rim, its count on a second plate.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion, SourceLine } from "../../flat/kit";
import { Block, Camera3D, direct, FigLabel3D, glow, Label3D, Stage3D, TECH } from "../../three/index";
import { BACK, Flywheel, HC, PINION_TEETH, RED, RING_R, RING_TEETH, STARTER_AT, Starter, k01, q } from "./Parts";

type Params = { fig?: { pinion?: string; ring?: string } };

const Teeth: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const fig = (p.beat.params as Params).fig ?? {};
  const but = m.at("but", 2);
  const headon = m.at("head-on", 24);
  const bosch = m.at("head-on", 24) + 12;
  const pinion = m.at("pinion", 52);
  const teeth = m.at("teeth", 66);
  const ring = m.at("ring", 84);
  const end = Math.max(m.end, ring + 30);
  const strain = f < pinion ? 0.04 * Math.sin(f * 1.9) * k01(f, but, 6) : 0;
  const pinLit = k01(f, pinion, Math.max(8, teeth - pinion));
  const ringLit = k01(f, ring, Math.max(16, end - ring - 14));
  const [sx, sy, sz] = STARTER_AT;
  const keys = direct({}, [
    { at: 0, move: "push", look: [0.6, HC - 0.6, 0.5], dir: [-0.75, 0.2, 0.63], from: 6.6, to: 6.0, dur: Math.max(10, pinion), fov: 40 },
    { at: pinion, move: "push", look: [sx, sy, sz], dir: [-0.8, 0.15, 0.58], to: 1.6, dur: Math.max(8, ring - pinion) },
    { at: ring, move: "pullback", look: [0, HC - 0.2, 0.3], dir: [-0.9, 0.12, 0.42], to: 6.4, dur: Math.max(12, end - ring) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor={false} bloom={1} dof={0} blur={1} shadowBox={6} fog={{ color: "#05070f", near: 10, far: 30 }}
        overlay={<SourceLine p={p} />}>
        <Camera3D keys={keys} seed="v2821-teeth" />
        {/* the workbench and its lamp */}
        <Block size={[7, 0.2, 4]} preset="clay" color="#4a3a2c" position={[0.8, HC - RING_R - 0.25, 0.3]} />
        <Block size={[0.5, 0.5, 0.5]} preset="brushed" color="#3d434d" position={[sx + 1.2, sy - 0.55, sz]} />
        <mesh position={[0.4, HC + 3.2, 1.0]} material={glow("#ffd9a0", 0.9)}>
          <sphereGeometry args={[0.18, 16, 12]} />
        </mesh>
        <group position={[0, strain, 0]}>
          <Flywheel position={[0, HC, 0]} angle={0} lit={(i) => (i / RING_TEETH < ringLit ? 0.9 : 0)} />
        </group>
        <Starter position={[sx, sy + strain, sz]} engage={1} spin={0} coil={0.6} windings={f < pinion ? 0.5 + 0.4 * Math.abs(Math.sin(f * 0.7)) : 0.2} see={0.4}
          warn={f < pinion ? k01(f, but, 8) : 0} />
        {/* the pinion's teeth lit one by one: a glowing ring of dots over them */}
        {Array.from({ length: PINION_TEETH }, (_, i) => {
          const a = (i / PINION_TEETH) * Math.PI * 2;
          const on = pinLit * PINION_TEETH > i + 0.5 ? 1 : 0;
          return on ? (
            <mesh key={i} position={[sx - 0.12, sy + Math.cos(a) * 0.15, sz + Math.sin(a) * 0.15]} material={glow(TECH.amber, 1)}>
              <sphereGeometry args={[0.022, 8, 6]} />
            </mesh>
          ) : null;
        })}
        {/* the red stop bar */}
        {f >= headon && f < pinion && (
          <mesh position={[sx - 0.25, sy + 0.25, sz + 0.1]} rotation-x={0.7} material={glow(RED, q(1 - k01(f, headon + 14, Math.max(4, pinion - headon - 14))))}>
            <boxGeometry args={[0.06, 1.3, 0.12]} />
          </mesh>
        )}
        <Label3D at={[sx + 1.2, sy + 0.3, sz]} offset={[-0.2, 0.9, 0.2]} text="Bosch starter" sub="from a Saab" start={bosch} end={pinion + 4} px={58} color={TECH.white} align="center" />
        {f >= pinion && <FigLabel3D fig={fig.pinion ?? ""} caption="pinion teeth" at={[sx - 0.2, sy + 0.75, sz + 0.5]} start={pinion + 2} count={Math.max(8, teeth - pinion)} px={110} end={ring + 6} />}
        {f >= ring && <FigLabel3D fig={fig.ring ?? ""} caption="ring gear teeth" at={[-0.2, HC + 0.3, 0.2]} start={ring + 2} count={Math.max(14, end - ring - 16)} px={110} />}
      </Stage3D>
    </Freeze>
  );
};
export default Teeth;
