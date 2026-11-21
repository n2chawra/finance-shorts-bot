// The fourth-floor box beam cut away at its hanger: copied from L-20261121-41/Nut.tsx (BeamCutaway), the
// long video this Short promotes. The roof rod, washer and nut under the bottom flange; the lower rod's nut
// on top; `stress` heats it grey to amber to red, `fold` opens the seam, `drop` slides the beam past the nut.
import React from "react";
import { Debris, Failure3D, glow, mat, useDLook, type V3 } from "../../three/index";

const HW = 0.3, HH = 0.4, PT = 0.035, LEN = 3;
const UZ = -0.12, LZ = 0.12;          // the roof rod and the lower walkway's rod, offset along the beam
export const NUT: V3 = [0, -HH - 0.07, UZ];

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


export default BeamCutaway;
