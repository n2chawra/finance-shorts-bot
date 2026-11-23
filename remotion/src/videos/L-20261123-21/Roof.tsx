// Roof: a rooftop at dusk with the flat dish on its mast, the neighbours' roofs behind, and satellites
// crossing the sky on an arc. Its actions (params.moments[].do): sat (the first satellite crossing),
// track (it speeds on), set (it sinks behind the roofs), rise (the next one climbs from the other side),
// beam / handoff / jump / beamStrain / beamOff (the dish's beam on a satellite), face / faceWave (the grid
// inside the dish lights, a wave runs across it), lock (a ring round the still mount), olddish / oldswing
// / wear (a curved TV dish chasing the satellite), rings (ripples off the dish), altitude (a height line
// under the satellite), flash, swarm (more satellites), stars, question, dark, lockNew.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, FigLabel3D, glow, mat, TECH, type V3 } from "../../three/index";
import { Beam, Cone, DISH, DUSK, dishCentre, FlatDish, FlatSat, House, OldDish, PulseRing, q, Ripples, Shot, Stars, useBeat, Words, type Anchor } from "./kit";

const BASE: V3 = [0, 3.6, 0];
const C = dishCentre(BASE);
const OLD: V3 = [2.3, 3.1, 0.9];
/** a satellite on the sky arc at u (0 rising on the left, 1 set on the right) */
const skyAt = (u: number, lane = 0): V3 => [-38 + 76 * u, 3 + (19 - lane * 3) * Math.sin(Math.PI * Math.min(1, Math.max(0, u))) - (u > 1 ? 6 * (u - 1) : 0), -34 - lane * 4];

const Roof: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  // the first satellite: always moving, faster on "track", down behind the roofs on "set"
  const u1 = 0.32 + 0.0016 * f + 0.22 * k("track", 50) + 0.42 * k("set", 40);
  const s1 = skyAt(u1);
  const showB = has("rise");
  const uB = -0.04 + 0.2 * k("rise", 50) + (f > at("rise") ? 0.0012 * (f - at("rise")) : 0);
  const sB = skyAt(uB, 1);
  // which satellite the beam is on, and how strongly
  const beamStart = Math.min(at("beam"), at("track"), at("handoff"), at("jump"), at("beamStrain"), has("sat") && !has("olddish") ? at("sat") : Infinity);
  let beamO = beamStart <= 2 ? 1 : f >= beamStart ? Math.min(1, (f - beamStart) / 10) : 0;
  if (has("beamOff") && f >= at("beamOff")) beamO *= 0.3 + 0.7 * Math.abs(Math.sin((f - at("beamOff")) * 0.5)) * Math.max(0, 1 - (f - at("beamOff")) / 30);
  if (has("dark") && f >= at("dark")) beamO = 0;
  if (u1 > 1.02 && !has("handoff")) beamO *= Math.max(0, 1 - (u1 - 1.02) * 8);
  const onB = has("handoff") && f >= at("handoff") + 6;
  const jumping = has("jump") && f >= at("jump");
  const jumpB = jumping && Math.floor((f - at("jump")) / Math.max(3, 9 - (f - at("jump")) / 12)) % 2 === 1;
  const target = onB || jumpB ? (showB ? sB : skyAt(0.62, 1)) : s1;
  const flash = has("flash") ? Math.max(0, 1 - Math.abs(f - at("flash")) / 6) : 0;
  const face = Math.max(k("face"), 0.35 * beamO);
  const wave = has("faceWave") && f >= at("faceWave") ? (((f - at("faceWave")) / 22) % 1) : -1;
  // the curved dish chases the satellite a step behind
  const lagU = u1 - (has("oldswing") && f > at("oldswing") ? 0.18 : 0.05);
  const lag = skyAt(lagU);
  const yaw = Math.atan2(lag[0] - OLD[0], -(lag[2] - OLD[2])) * k("oldswing", 30, 0);
  const swarm = k("swarm", 30);
  const sats: V3[] = has("swarm") ? Array.from({ length: 7 }, (_, i) => skyAt(((i * 0.17 + 0.0012 * f + 0.07 * i) % 1.1), (i % 3) + 0.3)) : [];
  const anchors: Record<string, Anchor> = {
    dish: { look: [C[0] - 0.5, C[1] - 0.7, C[2] - 0.6], dir: [0.5, 0.25, 1], d: 5.5 },
    mount: { look: [BASE[0], BASE[1] + 0.9, BASE[2]], dir: [0.6, 0.3, 1], d: 4.6 },
    sky: { look: [0, 7, -16], dir: [0.2, 0.05, 1], d: 14 },
    sat: { look: skyAt(0.32 + 0.0016 * b.end * 0.6 + 0.22), dir: [0.15, -0.35, 1], d: 9 },
    satB: { look: skyAt(0.14, 1), dir: [-0.2, -0.3, 1], d: 9 },
    horizon: { look: [16, 5, -26], dir: [-0.35, 0.15, 1], d: 10 },
    olddish: { look: [OLD[0], OLD[1] + 0.9, OLD[2]], dir: [0.45, 0.3, 1], d: 3.8 },
  };
  const pos = (on: string): V3 => on === "sat" ? s1 : on === "satB" ? sB : on === "mount" ? [BASE[0], BASE[1] + 0.4, BASE[2]] : on === "olddish" ? [OLD[0], OLD[1] + 1.2, OLD[2]] : on === "dish" ? C : anchors[on]?.look ?? C;
  return (
    <Shot p={p} b={b} anchors={anchors} dust={{ c: [0, 8, -14], r0: 14, r1: 60, size: 1.82 }} seed="roof" backdrop={DUSK} floor={false} bloom={1.2} shadowBox={8} fog={{ color: "#141a34", near: 26, far: 80 }}>
      <Stars f={f} n={120} r={70} bright={0.35 + 0.5 * k("stars", 30) - 0.2 * k("dark", 20)} seed="roofstars" />
      {/* the ground and the street of roofs behind */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, -20]}><planeGeometry args={[200, 120]} /><meshStandardMaterial color="#0d1018" roughness={0.95} /></mesh>
      <House w={5.2} d={4.2} h={2.4} color="#b8a48a" lights={0.6} seed="me" />
      {Array.from({ length: 9 }, (_, i) => (
        <House key={i} position={[-26 + i * 6.5, 0, -14 - (i % 3) * 4]} w={4} d={3.5} h={1.8 + (i % 2) * 0.6} color={i % 2 ? "#8f8270" : "#7b7466"} lights={0.5} seed={`n${i}`} />
      ))}
      {/* the chimney (a sign can sit on it) */}
      <Block size={[0.5, 1.2, 0.5]} radius={0.02} material={mat("clay", "#6d4b3e")} position={[-1.8, 3.6, 0.3]} />
      <FlatDish position={BASE} face={face} wave={wave} />
      {has("lock") && <PulseRing f={b.f} start={at("lock")} at={[BASE[0], BASE[1] + 0.25, BASE[2]]} r={0.5} />}
      {has("lock") && [0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[BASE[0] + (i % 2 ? 0.18 : -0.18), BASE[1] + 0.07, BASE[2] + (i < 2 ? 0.18 : -0.18)]} material={glow(TECH.amber, q(0.2 + 0.8 * k("lock", 8)))}><sphereGeometry args={[0.035, 8, 6]} /></mesh>
      ))}
      {has("olddish") && <OldDish position={OLD} yaw={yaw} pitch={0.55} strain={k("wear", 20)} o={k("olddish", 12)} />}
      {has("rings") && <Ripples f={f} start={at("rings")} position={C} n={3} reach={1.4} upright={false} />}
      {/* the satellites */}
      {u1 < 1.15 && (
        <group position={s1} scale={4} rotation={[0.2, 0.4, 0]}>
          <FlatSat arrays={0.6} />
          <mesh material={glow(TECH.white, 0.9)}><sphereGeometry args={[0.22, 10, 8]} /></mesh>
        </group>
      )}
      {showB && f >= at("rise") && (
        <group position={sB} scale={4} rotation={[0.2, -0.4, 0]}>
          <FlatSat arrays={0.6} />
          <mesh material={glow(TECH.white, 0.9)}><sphereGeometry args={[0.25, 10, 8]} /></mesh>
        </group>
      )}
      {has("lockNew") && <PulseRing f={f} start={at("lockNew")} at={sB} r={2.4} flat={false} color={TECH.cyan} />}
      {sats.map((s, i) => (
        <group key={i} position={s} scale={1.2}>
          <mesh material={glow(TECH.white, q(0.4 + 0.6 * swarm))}><sphereGeometry args={[0.28, 8, 6]} /></mesh>
          <mesh position={[-1.4, 0, 0]} rotation-z={Math.PI / 2} material={glow("#9fc3ff", q(0.25 * swarm))}><cylinderGeometry args={[0.05, 0.01, 2.6, 6]} /></mesh>
        </group>
      ))}
      {/* the beam */}
      {beamO > 0 && <Beam a={C} b={target} r={0.05 + 0.06 * flash} o={Math.min(1, 0.55 * beamO + flash)} color={k("beamStrain", 20) > 0.5 ? TECH.amber : TECH.cyan} />}
      {beamO > 0 && <Cone a={C} b={[C[0] + (target[0] - C[0]) * 0.12, C[1] + (target[1] - C[1]) * 0.12, C[2] + (target[2] - C[2]) * 0.12]} r={0.6} o={0.18 * beamO} />}
      {has("altitude") && (
        <Beam a={[s1[0], s1[1], s1[2]]} b={[s1[0], 3, s1[2]]} r={0.06} o={0.5 * k("altitude", 16)} color={TECH.amber} />
      )}
      {has("question") && <FigLabel3D fig="?" at={[0.2, 7.2, 0]} start={at("question")} count={0} px={150} color={TECH.amber} plate={false} />}
      <Words b={b} pos={pos} signAt={() => [-1.8, 4.4, 0.56]} signH={0.32} />
    </Shot>
  );
};
export default Roof;
export { DISH };
