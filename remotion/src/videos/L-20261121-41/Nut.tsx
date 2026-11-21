// Nut (3D cutaway): inside the fourth-floor box beam. The beam is two steel channels welded toe to toe; the
// near channel is drawn as a ghost so both rods show: the roof rod comes down through the beam to a washer and
// nut under the bottom flange (the beam sits on it), and the lower walkway's rod comes up through the beam to
// a nut on top. On "evening" the beam turns slowly; on "nut" the camera pushes in under the bottom flange;
// on "pulled" the stress colour climbs grey → amber → red round the nut; on "through" the welded seam splits,
// the flange folds open and the beam slides down past the nut, slowed; on "beam" sparks and flecks fall away.
import React from "react";
import { Easing, useCurrentFrame } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, Debris, direct, DisasterStage, Failure3D, Focus, glow, Label3D, mat, useDLook, type V3 } from "../../three/index";
import { kitClock, MonoCaption, Overlay } from "./ui";

const HW = 0.3, HH = 0.4, PT = 0.035, LEN = 3;
const UZ = -0.12, LZ = 0.12;          // the roof rod and the lower walkway's rod, offset along the beam
const NUT: V3 = [0, -HH - 0.07, UZ];

const Rod: React.FC<{ z: number; y0: number; y1: number }> = ({ z, y0, y1 }) => {
  const { paint } = useDLook();
  return <mesh position={[0, (y0 + y1) / 2, z]} material={paint("metal")} castShadow><cylinderGeometry args={[0.03, 0.03, y0 - y1, 12]} /></mesh>;
};
const NutWasher: React.FC<{ y: number; z: number; up?: boolean }> = ({ y, z, up }) => {
  const { paint } = useDLook();
  return (
    <group position={[0, y, z]} scale={[1, up ? -1 : 1, 1]}>
      <mesh position={[0, 0.01, 0]} material={paint("steel")} castShadow><cylinderGeometry args={[0.1, 0.1, 0.02, 24]} /></mesh>
      <mesh position={[0, -0.04, 0]} material={paint("dark")} castShadow><cylinderGeometry args={[0.07, 0.07, 0.07, 6]} /></mesh>
    </group>
  );
};

/** One channel: web on the outside (side -1 or +1), top and bottom flanges reaching to the seam; the bottom
 * flange's middle stretch (by the rods) is its own piece that folds down about the web edge by `fold`. */
const Channel: React.FC<{ side: -1 | 1; fold: number; ghost?: boolean }> = ({ side, fold, ghost }) => {
  const { paint } = useDLook();
  const m = ghost ? mat("glass", "#9fb6d8", { opacity: 0.28, transparent: true }) : paint("steel");
  const x = side * HW;
  const fx = side * HW / 2;
  const mid: [number, number] = [-0.5, 0.35];
  const midLen = mid[1] - mid[0], midZ = (mid[0] + mid[1]) / 2;
  const restA = [-LEN / 2, mid[0]], restB = [mid[1], LEN / 2];
  return (
    <group>
      <mesh position={[x, 0, 0]} material={m} castShadow receiveShadow><boxGeometry args={[PT, HH * 2, LEN]} /></mesh>
      <mesh position={[fx, HH - PT / 2, 0]} material={m} castShadow receiveShadow><boxGeometry args={[HW, PT, LEN]} /></mesh>
      {[restA, restB].map(([a, b], i) => (
        <mesh key={i} position={[fx, -HH + PT / 2, (a! + b!) / 2]} material={m} castShadow receiveShadow><boxGeometry args={[HW, PT, b! - a!]} /></mesh>
      ))}
      {/* the folding stretch, hinged at the web's bottom edge */}
      <group position={[x, -HH + PT / 2, midZ]} rotation-z={side * -fold}>
        <mesh position={[-side * HW / 2, 0, 0]} material={m} castShadow receiveShadow><boxGeometry args={[HW, PT, midLen]} /></mesh>
      </group>
    </group>
  );
};


/** The fourth-floor box beam cut away at its east hanger: the roof rod with its washer and nut under the
 * bottom flange, the lower walkway's rod with its nut on top. `stress` heats nut, washer and flange
 * grey → amber → red; `fold` opens the flange at the seam; `drop` slides the beam down past the nut. */
export const BeamCutaway: React.FC<{ t: number; stress: number; fold: number; drop: number; debris: number }> = ({ t, stress, fold, drop, debris }) => (
  <group>
    {/* the roof rod and its nut stay where they are */}
    <Rod z={UZ} y0={3} y1={-HH - 0.14} />
    <Failure3D stress={stress} frame={t} glowAt={2.6}>
      <group><NutWasher y={-HH - 0.0} z={UZ} /></group>
    </Failure3D>
    {stress > 0.4 && <pointLight position={[0.3, -HH - 0.1, UZ]} intensity={3 * stress} distance={1.4} color="#ff5a3c" />}
    {/* the beam (and the lower walkway's rod, which hangs from it) slides down past the nut */}
    <group position={[0, -drop, 0]}>
      <Failure3D stress={stress} frame={t} hot={[0, -HH, UZ]} hotRadius={0.42} glowAt={2.4}>
        <group>
          <Channel side={-1} fold={fold} />
          <Channel side={1} fold={fold} ghost />
        </group>
      </Failure3D>
      {[HH, -HH].map((y) => (
        <mesh key={y} position={[0, y + (y > 0 ? 0.005 : -0.005), 0]} material={glow(y < 0 && stress > 0.5 ? "#ff5a3c" : "#dbe8ff", 0.8)}>
          <boxGeometry args={[0.025, 0.012, LEN]} />
        </mesh>
      ))}
      <Rod z={LZ} y0={HH + 0.12} y1={-3} />
      <NutWasher y={HH} z={LZ} up />
    </group>
    <Debris at={[0, -HH - 0.05, UZ]} count={40} spread={0.12} dir={[0, -0.6, 0]} speed={1.2} size={0.022} start={0.02} seconds={1.6} slow={0.35} gravity={2.5}
      kind="metal" seed="seam" progress={debris} />
  </group>
);

const Nut: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const K = kitClock(p, useCurrentFrame());
  const t = m.t;
  const ev = { evening: m.at("evening", 2), nut: m.at("nut", 30), pulled: m.at("pulled", 50), through: m.at("through", 75), beam: m.at("beam", 100) };
  const end = Math.max(m.end, ev.beam + 30);
  const stress = cue(t, ev.pulled, Math.max(12, ev.through - ev.pulled + 4), (x) => x);
  const fold = cue(t, ev.through, 22, Easing.out(Easing.cubic)) * 0.95;
  const drop = cue(t, ev.through + 4, 46, Easing.in(Easing.quad)) * 1.4;
  const spin = 0.35 - 0.0025 * t;
  const keys = direct({ ...ev, end }, [
    { at: 0, move: "orbit", center: [0, -0.1, 0], radius: 3.1, height: 0.5, from: 0.95, to: 0.75, dur: Math.max(10, ev.nut), fov: 36 },
    { at: "nut", move: "push", look: [0, -0.45, UZ], dir: [1, -0.4, 0.75], to: 1.5, dur: Math.max(10, ev.through - ev.nut) },
    { at: "through", move: "dive", look: [0, -0.55, UZ], dir: [1, -0.3, 0.75], to: 1.05, dur: 14 },
    { at: ev.through + 14, move: "pullback", look: [0, -0.9, UZ], dir: [1, -0.1, 0.8], to: 2.6, dur: Math.max(10, end - ev.through - 14) },
  ]);
  return (
    <DisasterStage look="nightGrid" floor={false} dof={0.9} shadowBox={3}
      overlay={<Overlay text="3D reconstruction · slowed down"><MonoCaption t={t} at={ev.evening} text="INSIDE THE FOURTH-FLOOR BOX BEAM" /></Overlay>}>
      <Camera3D keys={keys} frame={t} drift={0.006} />
      <Focus at={t < ev.nut ? [0, -0.1, 0] : NUT} range={t < ev.nut ? 1.5 : 0.45} />
      <group rotation-y={spin}>
        <BeamCutaway t={t} stress={stress} fold={fold} drop={drop} debris={cue(t, ev.through, 60, (x) => x)} />
      </group>
      {t >= ev.evening + 6 && t < ev.through && (
        <Label3D at={[0, HH, -0.9]} offset={[0.2, 0.55, 0.2]} text="WELDED SEAM" sub="two channels, toe to toe" start={K(ev.evening + 6)} end={K(ev.nut + 10)} color="#ffd84a" px={44} />
      )}
    </DisasterStage>
  );
};

export default Nut;
