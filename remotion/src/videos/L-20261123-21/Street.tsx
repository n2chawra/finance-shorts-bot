// Street: a quiet suburban street at night, a curved TV dish on every roof, all aimed at one fixed
// point in the sky where a box TV satellite hangs. Actions: sign, houses (porch lights), tv, dishes,
// aimline (parallel aim lines), converge (they meet at one point), satdot, sat, height, equator, hold
// (the stars wheel, the dot stays), bolts, check, dim.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, glow, mat, TECH, type V3 } from "../../three/index";
import { BACK, Beam, BoxSat, House, lerpV, OldDish, PulseRing, q, Shot, Stars, useBeat, Words, type Anchor } from "./kit";

const SAT: V3 = [20, 24, -52];
const N = 6;
const houseX = (i: number) => (i - (N - 1) / 2) * 6.2;
const dishAt = (i: number): V3 => [houseX(i) + 1.0, 3.05, 0.9];

const Street: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const lights = 0.25 + 0.6 * k("houses", 20) - 0.35 * k("dim", 30);
  const aim = k("aimline", 18);
  const conv = k("converge", 30);
  const dot = Math.max(k("satdot", 10), k("sat", 10));
  const anchors: Record<string, Anchor> = {
    street: { look: [0, 2.2, 0], dir: [0.18, 0.28, 1], d: 13 },
    dish: { look: [dishAt(2)[0], dishAt(2)[1] + 0.9, dishAt(2)[2]], dir: [0.3, 0.12, 1], d: 4.6 },
    mount: { look: [dishAt(2)[0], dishAt(2)[1] + 0.7, dishAt(2)[2]], dir: [0.45, 0.15, 1], d: 3.2 },
    sky: { look: [4, 6, -10], dir: [-0.2, 0.1, 1], d: 18 },
    sat: { look: SAT, dir: [-0.25, -0.35, 1], d: 10 },
    plate: { look: [SAT[0], SAT[1] - 3, SAT[2]], dir: [-0.25, -0.3, 1], d: 10 },
  };
  const pos = (on: string): V3 => on === "sat" ? SAT : on === "plate" ? [SAT[0] - 1.5, SAT[1] - 3.5, SAT[2]] : on === "dish" ? [dishAt(2)[0], dishAt(2)[1] + 1.3, dishAt(2)[2]] : on === "mount" ? [dishAt(2)[0], dishAt(2)[1] + 0.8, dishAt(2)[2]] : anchors[on]?.look ?? [0, 0, 0];
  return (
    <Shot p={p} b={b} anchors={anchors} dust={{ c: [0, 8, -10], r0: 16, r1: 70, size: 2.08 }} seed="street" backdrop={BACK} floor={false} bloom={1.15} fog={{ color: "#070a14", near: 30, far: 95 }}>
      <Stars f={f} n={150} r={90} bright={0.5} seed="streetstars" spin={has("hold") && f > at("hold") ? 0.0015 : 0} />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -10]}><planeGeometry args={[220, 140]} /><meshStandardMaterial color="#0b0e15" roughness={0.95} /></mesh>
      {/* the road and the kerb lights */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 5.5]}><planeGeometry args={[80, 4]} /><meshStandardMaterial color="#1a1d25" roughness={0.8} /></mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[-21 + i * 6, 0.02, 5.5]} material={glow("#ffe7a6", 0.35)}><planeGeometry args={[1.6, 0.08]} /></mesh>
      ))}
      {Array.from({ length: N }, (_, i) => {
        const d = dishAt(i);
        const dx = SAT[0] - d[0], dy = SAT[1] - (d[1] + 0.85), dz = SAT[2] - d[2];
        const yaw = Math.atan2(dx, dz), pitch = Math.atan2(dy, Math.hypot(dx, dz));
        const lit = Math.max(0, Math.min(1, k("dishes", 30) * N - i));
        const start: V3 = [d[0], d[1] + 0.85, d[2]];
        const par: V3 = [start[0] + dx * 0.18, start[1] + dy * 0.18, start[2] + dz * 0.18];
        return (
          <group key={i}>
            <House position={[houseX(i), 0, 0]} w={4.4} d={3.6} h={2.2} color={i % 2 ? "#b9a689" : "#a39785"} lights={lights} tv={i === 2 ? k("tv", 12) * (0.6 + 0.4 * Math.sin(f * 0.6)) : 0} seed={`st${i}`} />
            {/* the porch light */}
            <mesh position={[houseX(i) - 0.9, 1.6, 1.85]} material={glow("#ffd27a", q(lights))}><sphereGeometry args={[0.09, 8, 6]} /></mesh>
            <OldDish position={d} yaw={yaw} pitch={pitch} />
            {lit > 0 && <mesh position={start} material={glow(TECH.cyan, q(0.6 * lit))}><sphereGeometry args={[0.1, 8, 6]} /></mesh>}
            {aim > 0 && <Beam a={start} b={lerpV(par, SAT, conv)} r={0.025} o={0.55 * aim * (1 - 0.6 * k("dim", 30))} color={TECH.cyan} />}
          </group>
        );
      })}
      {/* the mount on the nearest dish, bolted */}
      {has("bolts") && [0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[dishAt(2)[0] + (i % 2 ? 0.07 : -0.07), dishAt(2)[1] + 0.5 + (i < 2 ? 0.1 : -0.1), dishAt(2)[2] + 0.06]} material={glow(TECH.amber, q(0.25 + 0.75 * k("bolts", 10)))}><sphereGeometry args={[0.03, 8, 6]} /></mesh>
      ))}
      {has("check") && <PulseRing f={f} start={at("check")} at={[dishAt(2)[0], dishAt(2)[1] + 0.5, dishAt(2)[2] + 0.1]} r={0.3} flat={false} color={TECH.lime} />}
      {/* the fixed point and its satellite */}
      {dot > 0 && <mesh position={SAT} material={glow(TECH.white, q(dot))}><sphereGeometry args={[0.7 * (1 - 0.6 * k("sat", 12)), 12, 8]} /></mesh>}
      {has("sat") && <group position={SAT} scale={2.6 * k("sat", 14)} rotation-y={-0.4}><BoxSat lit={0.7} /></group>}
      {has("height") && <Beam a={[SAT[0], SAT[1] - 1.2, SAT[2]]} b={[SAT[0], 0, SAT[2]]} r={0.08} o={0.5 * k("height", 20)} color={TECH.amber} />}
      {has("equator") && <Beam a={[-90, 1, -70]} b={[-90 + 180 * k("equator", 30), 1, -70]} r={0.25} o={0.8} color={TECH.amber} />}
      {/* the corner street sign */}
      <mesh position={[-19.5, 1.4, 3.6]} material={mat("aluminium", "#7d8594")}><cylinderGeometry args={[0.06, 0.06, 2.8, 8]} /></mesh>
      <Block size={[2.6, 0.9, 0.06]} radius={0.04} material={mat("glossy", "#1f5a3a")} position={[-19.5, 3.1, 3.6]} />
      <Words b={b} pos={pos} signAt={() => [-19.5, 3.1, 3.66]} signH={0.45} />
    </Shot>
  );
};
export default Street;
