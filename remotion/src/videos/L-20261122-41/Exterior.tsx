// Exterior (3D): the Hyatt Regency from outside. A forty-storey-style tower with lit window rows, the glass
// atrium block glowing warm between the tower and the lower function block, a street with lamps and a
// forecourt sign. Shots (params.shot): street — from the kerb at dusk, the sign lights with the opening year
// and the camera tilts up the tower; roof — high over the roof, the atrium glass glowing, outlines lighting
// on their words; night — after the collapse, the atrium dark, a van pulls up under the canopy.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, DisasterStage, Focus, glow, rnd, type CamKey } from "../../three/index";
import { figOf, moments, Overlay, Readout } from "./ui";
import { useMats, WARM } from "./world";

type Params = { shot?: string };

/** A box's twelve edges as thin glowing bars (the outline that lights on its word). */
const Edges: React.FC<{ w: number; h: number; d: number; on: number; color: string }> = ({ w, h, d, on, color }) => {
  if (on <= 0) return null;
  const r = 0.12, out: React.ReactNode[] = [];
  for (const y of [-h / 2, h / 2]) for (const z of [-d / 2, d / 2]) out.push(<mesh key={`x${y}${z}`} position={[0, y, z]}><boxGeometry args={[w, r, r]} /><meshBasicMaterial color={color} transparent opacity={on} /></mesh>);
  for (const x of [-w / 2, w / 2]) for (const z of [-d / 2, d / 2]) out.push(<mesh key={`y${x}${z}`} position={[x, 0, z]}><boxGeometry args={[r, h, r]} /><meshBasicMaterial color={color} transparent opacity={on} /></mesh>);
  for (const x of [-w / 2, w / 2]) for (const y of [-h / 2, h / 2]) out.push(<mesh key={`z${x}${y}`} position={[x, y, 0]}><boxGeometry args={[r, r, d]} /><meshBasicMaterial color={color} transparent opacity={on} /></mesh>);
  return <group>{out}</group>;
};

const Exterior: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const t = m.t;
  const M = useMats();
  const shot = (p.beat.params as Params).shot ?? "street";
  const ev = moments(p, m.at, m.end);
  const e = (n: string) => ev[n] ?? 1e9;
  const end = Math.max(m.end, 30);
  const night = shot === "night";
  const keys: CamKey[] = shot === "roof"
    ? [{ f: 0, pos: [-26, 22, 30], look: [2, 4, 0], fov: 40 }, { f: end + 10, pos: [-18, 26, 22], look: [4, 3, 0], fov: 40 }]
    : shot === "night"
      ? [{ f: 0, pos: [-4, 2.2, 26], look: [4, 5, 0], fov: 44 }, { f: end + 10, pos: [-1, 2.4, 20], look: [5, 5, 0], fov: 44 }]
      : [{ f: 0, pos: [-6, 1.8, 24], look: [0, 4, 0], fov: 44 }, { f: end + 10, pos: [-5, 1.6, 21], look: [-2, 14, -6], fov: 46 }];
  const tower = cue(t, e("tower"), 14), atr = cue(t, e("glass"), 14), rooms = cue(t, e("rooms"), 14);
  const sign = cue(t, e("opened"), 12);
  const van = night ? cue(t, e("investigators"), 40) : 0;
  return (
    <DisasterStage look="nightGrid" floor={false} dof={0.8} shadowBox={30} fog={{ color: "#070b12", near: 30, far: 110 }}
      overlay={<Overlay t={t} marks={Object.values(ev)}>{shot === "street" && <Readout x={1240} y={160} label="HYATT REGENCY · OPENED" value={figOf(p, "year")} k={sign} />}</Overlay>}>
      <Camera3D keys={keys} frame={t} drift={0.02} />
      <Focus at={[0, 6, 0]} range={20} />
      <ambientLight intensity={0.25} color="#5a6a8a" />
      <directionalLight position={[-30, 20, 20]} intensity={night ? 0.2 : 0.7} color={night ? "#6a7aa0" : "#ff9a6a"} />
      {/* street and pavement */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 8]} material={M.dark} receiveShadow><planeGeometry args={[140, 60]} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 14]}><planeGeometry args={[140, 0.15]} /><meshBasicMaterial color="#c9c19a" /></mesh>
      <mesh position={[0, 0.08, 9]} material={M.slab} receiveShadow><boxGeometry args={[60, 0.16, 5]} /></mesh>
      {[-24, -14, -4, 6, 16, 26].map((x) => (
        <group key={x} position={[x, 0, 11.2]}>
          <mesh position={[0, 2, 0]} material={M.dark}><cylinderGeometry args={[0.08, 0.1, 4, 8]} /></mesh>
          <mesh position={[0, 4.05, 0]} material={glow("#ffd9a0", 0.95)}><sphereGeometry args={[0.25, 12, 8]} /></mesh>
          <pointLight position={[0, 3.8, 0]} intensity={4} distance={10} color="#ffcf8a" />
        </group>
      ))}
      {/* the tower */}
      <group position={[-9, 14, -6]}>
        <mesh material={M.wall} castShadow receiveShadow><boxGeometry args={[12, 28, 9]} /></mesh>
        {Array.from({ length: 18 }, (_, f) => Array.from({ length: 9 }, (_, i) => (
          <mesh key={`${f}-${i}`} position={[-5 + i * 1.25, -12.5 + f * 1.45, 4.52]} material={glow(WARM, Math.round((0.15 + 0.6 * rnd("tw", f * 9 + i)) * 10) / 10)}>
            <planeGeometry args={[0.7, 0.6]} />
          </mesh>
        )))}
        <Edges w={12} h={28} d={9} on={tower} color="#ffb000" />
      </group>
      {/* the atrium: a glass block, warm inside (dark after the collapse) */}
      <group position={[5, 5, -4]}>
        <mesh><boxGeometry args={[13, 10, 12]} /><meshPhysicalMaterial color="#1c2a36" transparent opacity={0.55} roughness={0.1} metalness={0.4} emissive={night ? "#05080a" : "#ff9a4a"} emissiveIntensity={night ? 0.05 : 0.35 + 0.25 * atr} /></mesh>
        {!night && <pointLight position={[0, 0, 0]} intensity={12} distance={22} color={WARM} />}
        {[-4.5, -1.5, 1.5, 4.5].map((x) => <mesh key={x} position={[x, 0, 6.02]} material={M.truss}><boxGeometry args={[0.15, 10, 0.1]} /></mesh>)}
        {[-2.5, 2.5].map((y) => <mesh key={y} position={[0, y, 6.02]} material={M.truss}><boxGeometry args={[13, 0.12, 0.1]} /></mesh>)}
        <Edges w={13} h={10} d={12} on={atr} color="#ffb000" />
      </group>
      {/* the function block (meeting rooms) */}
      <group position={[17, 3.5, -5]}>
        <mesh material={M.wall} castShadow receiveShadow><boxGeometry args={[11, 7, 13]} /></mesh>
        {Array.from({ length: 3 }, (_, f) => Array.from({ length: 6 }, (_, i) => (
          <mesh key={`${f}-${i}`} position={[-4.2 + i * 1.7, -2 + f * 2.2, 6.52]} material={glow(WARM, 0.35)}><planeGeometry args={[1.1, 0.9]} /></mesh>
        )))}
        <Edges w={11} h={7} d={13} on={rooms} color="#ffb000" />
      </group>
      {/* canopy and the forecourt sign */}
      <mesh position={[5, 3.2, 3.6]} material={M.truss} castShadow><boxGeometry args={[9, 0.3, 3.5]} /></mesh>
      <group position={[-1.5, 1.1, 8.2]}>
        <mesh material={M.dark}><boxGeometry args={[4.2, 1.6, 0.3]} /></mesh>
        <mesh position={[0, 0, 0.16]} material={glow("#ffb000", 0.2 + 0.7 * sign)}><planeGeometry args={[3.8, 0.12]} /></mesh>
      </group>
      {van > 0 && (
        <group position={[18 - 14 * van, 0, 6.2]}>
          <mesh position={[0, 1.1, 0]} material={M.cloth} castShadow><boxGeometry args={[4.4, 1.9, 2]} /></mesh>
          <mesh position={[-2.25, 1.4, 0]} material={M.glass}><boxGeometry args={[0.1, 0.8, 1.7]} /></mesh>
          {[-1.4, 1.4].map((x) => [-1, 1].map((s) => <mesh key={`${x}${s}`} position={[x, 0.4, s * 1.02]} rotation-x={Math.PI / 2} material={M.dark}><cylinderGeometry args={[0.4, 0.4, 0.2, 16]} /></mesh>))}
          <pointLight position={[-2.6, 1, 0]} intensity={6} distance={10} color="#fff4d8" />
        </group>
      )}
    </DisasterStage>
  );
};

export default Exterior;
