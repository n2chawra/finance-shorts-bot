// Route: the whole trip as a night landscape seen from above: a house with its flat dish, the satellite
// low in the sky, a field of ground-station dishes, a buried fibre line and a data centre. A dotted route
// joins them. Actions: map, path, house, up, sat, down, gate, dc, back, chapA..chapD (a sign post rises
// at each stop), swarm, lowline, tickA, tickB.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { glow, mat, rnd, TECH, type V3 } from "../../three/index";
import { BACK, Beam, DataCentre, FlatDish, FlatSat, GroundDish, House, lerpV, PulseRing, q, Shot, Stars, useBeat, Words, type Anchor } from "./kit";

const HOUSE: V3 = [-9, 0, 2];
const DISHP: V3 = [-9, 2.95, 2];
const DISHC: V3 = [-9, 4.1, 2];
const SAT: V3 = [-1.5, 10, -3];
const GATE: V3 = [6, 0, 0.5];
const DC: V3 = [13, 0, -3];
const legs: [V3, V3][] = [[DISHC, SAT], [SAT, [GATE[0], 1.2, GATE[2]]], [[GATE[0], 0.1, GATE[2]], [DC[0] - 2.5, 0.1, DC[2]]]];

const Route: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const path = Math.max(k("path", 40), has("map") ? 0.0 : 0);
  const pathOn = has("path") || has("back");
  const go = (name: string, dur = 22) => (has(name) && f >= at(name) ? Math.min(1, (f - at(name)) / dur) : -1);
  const up = go("up"), dn = go("down"), bk = go("back", 50);
  const satLit = Math.max(k("sat", 10), up >= 1 ? 1 : 0);
  const house = Math.max(k("house", 12), 0.3);
  const anchors: Record<string, Anchor> = {
    all: { look: [2, 3, -0.5], dir: [0, 0.85, 1], d: 13.5 },
    house: { look: [HOUSE[0], 2.2, HOUSE[2]], dir: [0.35, 0.55, 1], d: 6 },
    sat: { look: SAT, dir: [0.25, 0.05, 1], d: 6.5 },
    gateway: { look: [GATE[0], 0.8, GATE[2]], dir: [0.25, 0.55, 1], d: 7.5 },
    dc: { look: [DC[0], 1, DC[2]], dir: [-0.2, 0.55, 1], d: 7 },
    sky: { look: [-2, 6, -1], dir: [0.1, 0.45, 1], d: 11 },
  };
  const pos = (on: string): V3 => on === "house" ? [HOUSE[0], 4.6, HOUSE[2]] : on === "sat" ? SAT : on === "gateway" ? [GATE[0], 2.4, GATE[2]] : on === "dc" ? [DC[0], 2.6, DC[2]] : on === "sky" ? [1, 8, -3] : anchors[on]?.look ?? [0, 0, 0];
  // the dotted route, drawn out over "path"
  const dots: V3[] = [];
  legs.forEach(([a, c], li) => {
    for (let i = 0; i <= 14; i++) {
      const u = (li + i / 14) / legs.length;
      if (pathOn && (has("path") ? u <= path : true)) dots.push(lerpV(a, c, i / 14));
    }
  });
  // the return trip: along the legs backwards
  const backPt = (u: number): V3 => {
    const s = (1 - u) * legs.length;
    const li = Math.min(legs.length - 1, Math.floor(s));
    return lerpV(legs[li]![0], legs[li]![1], s - li);
  };
  const posts: [string, V3][] = [["chapA", [HOUSE[0] + 2.2, 0, HOUSE[2] + 1]], ["chapB", [-4.5, 0, 1.5]], ["chapC", [1.5, 0, 0.5]], ["chapD", [GATE[0] + 2.5, 0, GATE[2] + 1.5]]];
  return (
    <Shot p={p} b={b} anchors={anchors} dust={{ c: [0, 4, 0], r0: 18, r1: 60, size: 1.82 }} seed="route" backdrop={BACK} floor={false} bloom={1.15} fog={{ color: "#060912", near: 26, far: 70 }}>
      <Stars f={f} n={110} r={80} bright={0.45} seed="routestars" />
      <mesh rotation-x={-Math.PI / 2}><planeGeometry args={[90, 60]} /><meshStandardMaterial color="#0c1119" roughness={0.95} /></mesh>
      {/* a faint map grid and a road */}
      {Array.from({ length: 13 }, (_, i) => <Beam key={`g${i}`} a={[-30 + i * 5, 0.01, -18]} b={[-30 + i * 5, 0.01, 14]} r={0.01} o={0.12} color={TECH.cyan} />)}
      {Array.from({ length: 7 }, (_, i) => <Beam key={`h${i}`} a={[-30, 0.01, -18 + i * 5]} b={[30, 0.01, -18 + i * 5]} r={0.01} o={0.12} color={TECH.cyan} />)}
      <Beam a={[-20, 0.02, 5]} b={[22, 0.02, 3]} r={0.2} o={0.5} color="#2b3140" />
      {Array.from({ length: 16 }, (_, i) => (
        <mesh key={`t${i}`} position={[-18 + rnd("tx", i) * 36, 0.6, -10 + rnd("tz", i) * 6]} material={mat("clay", "#1f3a2c")}><coneGeometry args={[0.5, 1.3, 7]} /></mesh>
      ))}
      <House position={HOUSE} w={3.4} d={3} h={2} color="#a99678" lights={0.3 + 0.7 * house} tv={k("house", 12)} seed="routehouse" />
      <FlatDish position={DISHP} face={0.3 + 0.5 * k("up", 10)} />
      {[0, 1, 2, 3, 4, 5].map((i) => <GroundDish key={i} position={[GATE[0] - 2.4 + (i % 3) * 2.4, 0, GATE[2] - 1.2 + Math.floor(i / 3) * 2.6]} scale={1.1} lit={k("gate", 10) * Math.min(1, Math.max(0, k("gate", 30) * 6 - i))} />)}
      {has("dc") && <Beam a={[GATE[0], 0.05, GATE[2]]} b={lerpV([GATE[0], 0.05, GATE[2]], [DC[0] - 2.5, 0.05, DC[2]], k("dc", 24))} r={0.07} o={0.9} color={TECH.amber} />}
      <DataCentre position={DC} lit={Math.max(k("dc", 30), 0.05)} />
      <group position={SAT} rotation={[0.3, 0.4, 0]} scale={1.2}><FlatSat arrays={satLit} glowBody={satLit} /></group>
      <mesh position={SAT} material={glow(TECH.white, q(0.3 + 0.6 * satLit))}><sphereGeometry args={[0.22, 10, 8]} /></mesh>
      {dots.map((d, i) => <mesh key={i} position={d} material={glow(TECH.cyan, 0.75)}><sphereGeometry args={[0.07, 6, 4]} /></mesh>)}
      {up >= 0 && up < 1 && <mesh position={lerpV(DISHC, SAT, up)} material={glow(TECH.white, 1)}><sphereGeometry args={[0.22, 10, 8]} /></mesh>}
      {up >= 0 && <Beam a={DISHC} b={lerpV(DISHC, SAT, Math.min(1, up))} r={0.04} o={0.6} color={TECH.cyan} />}
      {dn >= 0 && dn < 1 && <mesh position={lerpV(SAT, [GATE[0], 1.2, GATE[2]], dn)} material={glow(TECH.white, 1)}><sphereGeometry args={[0.22, 10, 8]} /></mesh>}
      {bk >= 0 && bk < 1 && <mesh position={backPt(bk)} material={glow(TECH.lime, 1)}><sphereGeometry args={[0.24, 10, 8]} /></mesh>}
      {has("lowline") && <Beam a={[SAT[0] + 1.5, SAT[1], SAT[2]]} b={[SAT[0] + 1.5, 0.05, SAT[2]]} r={0.06} o={0.8 * k("lowline", 16)} color={TECH.amber} />}
      {has("tickA") && <PulseRing f={f} start={at("tickA")} at={DISHC} r={0.8} flat={false} color={TECH.lime} />}
      {has("tickB") && <PulseRing f={f} start={at("tickB")} at={SAT} r={1.2} flat={false} color={TECH.lime} />}
      {has("swarm") && Array.from({ length: 9 }, (_, i) => (
        <mesh key={`s${i}`} position={[-16 + i * 4.2 + 0.03 * f, 9 + Math.sin(i * 0.7) * 1.5, -6]} material={glow(TECH.white, q(0.8 * Math.max(0, Math.min(1, k("swarm", 30) * 9 - i))))}><sphereGeometry args={[0.18, 8, 6]} /></mesh>
      ))}
      {posts.map(([name, at3]) => has(name) && (
        <group key={name} position={at3}>
          <mesh position={[0, 0.9 * k(name, 12), 0]} material={glow(TECH.amber, q(0.8 * k(name, 12)))}><cylinderGeometry args={[0.05, 0.05, 1.8 * k(name, 12), 6]} /></mesh>
        </group>
      ))}
      <Words b={b} pos={(on) => {
        if (b.prm.labels?.some((l) => l.text === "inside the dish")) {
          // the promise beat: each sign stands on its post
          const map: Record<string, V3> = { house: [posts[0]![1][0], 2, posts[0]![1][2]], sky: [posts[1]![1][0], 2, posts[1]![1][2]], sat: [posts[2]![1][0], 2, posts[2]![1][2]], gateway: [posts[3]![1][0], 2, posts[3]![1][2]] };
          return map[on] ?? pos(on);
        }
        return pos(on);
      }} />
    </Shot>
  );
};
export default Route;
