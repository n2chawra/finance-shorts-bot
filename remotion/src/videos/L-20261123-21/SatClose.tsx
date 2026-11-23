// SatClose: high above the Earth's curve, one flat satellite with its solar wing; its underside carries
// phased arrays (as many as params.fig.arrays) that light one by one, its beams lean down to patches of
// ground, and a separate beam drops to a ground station beside a road, cabled to a data building.
// Actions: sat, turn, grid, panels, beams, sweep, cells, dishes, cellHop, cellHopB, uplink, downlink,
// pulseDown, gate, gateLabel, fibre, dc.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { glow, mat, rnd, TECH, type V3 } from "../../three/index";
import { BACK, Beam, Cone, DataCentre, FlatSat, GroundDish, lerpV, q, Shot, Stars, useBeat, Words, type Anchor } from "./kit";

const RE = 60;
const surf = (x: number, z: number): V3 => [x, -RE - 2 + Math.sqrt(Math.max(0, RE * RE - x * x - z * z)), z];
const SAT: V3 = [0, 3.2, 0];
const GATE: V3 = surf(9, -5);
const DC: V3 = surf(15, -9);

const SatClose: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const nArr = Math.max(1, Math.min(9, parseInt(b.fig.arrays ?? "", 10) || 5));
  const drift = f * 0.004;
  const sat: V3 = [SAT[0] + drift, SAT[1], SAT[2]];
  const roll = has("turn") ? 0.7 * k("turn", 30) : 0.35;
  const arrays = Math.max(k("panels", 40), k("grid", 14) * 0.5, has("beams") || has("downlink") || has("uplink") ? 0.6 : 0.15);
  const beams = Math.max(k("beams", 14), has("sweep") || has("cells") ? 1 : 0);
  const sweep = has("sweep") && f >= at("sweep") ? (f - at("sweep")) * 0.03 : 0;
  const hop = (has("cellHop") && f >= at("cellHop") ? 1 : 0) + (has("cellHopB") && f >= at("cellHopB") ? 1 : 0);
  const cellAt = (i: number): V3 => surf(-6 + i * 4 + Math.sin(sweep + i) * 1.2 + hop * 1.6, -3 - (i % 2) * 3 + Math.cos(sweep * 0.7 + i));
  const cellsOn = Math.max(k("cells", 14), has("dishes") ? 1 : 0);
  const down = k("downlink", 16);
  const pd = has("pulseDown") && f >= at("pulseDown") ? ((f - at("pulseDown")) / 26) % 1 : -1;
  const up = k("uplink", 16);
  const anchors: Record<string, Anchor> = {
    sat: { look: [SAT[0] + 0.4, SAT[1] - 0.2, SAT[2]], dir: [0.5, 0.35, 1], d: 7 },
    panels: { look: [SAT[0], SAT[1] - 0.3, SAT[2]], dir: [0.35, -0.55, 1], d: 3 },
    ground: { look: [1, -1.5, -4], dir: [0.15, 0.85, 1], d: 12 },
    gateway: { look: lerpV(GATE, DC, 0.3), dir: [0.3, 0.55, 1], d: 7 },
  };
  const pos = (on: string): V3 => on === "sat" ? [sat[0] + 0.8, sat[1] + 0.3, sat[2]] : on === "panels" ? [sat[0] - 0.4, sat[1] - 0.4, sat[2] + 0.5] : on === "gateway" ? [GATE[0], GATE[1] + 2, GATE[2]] : anchors[on]?.look ?? SAT;
  return (
    <Shot p={p} b={b} anchors={anchors} dust={{ c: [0, 3, 0], r0: 14, r1: 90, size: 2.34 }} seed="sat" backdrop={BACK} floor={false} bloom={1.15} fov={40}>
      <Stars f={f} n={150} r={110} bright={0.6} seed="satstars" />
      <directionalLight position={[-14, 10, 8]} intensity={2.4} />
      {/* the Earth below: ocean, land, a glowing rim */}
      <mesh position={[0, -RE - 2, 0]} material={mat("glossy", "#1a3f78", { roughness: 0.4 })}><sphereGeometry args={[RE, 96, 64]} /></mesh>
      {Array.from({ length: 40 }, (_, i) => (
        <mesh key={i} position={surf((rnd("ld", i) - 0.5) * 50, -(rnd("lz", i)) * 40 + 4)} scale={[1, 0.08, 1]} material={mat("clay", i % 3 ? "#3f6b3a" : "#7a6a45")}>
          <sphereGeometry args={[1.5 + 2.5 * rnd("ls", i), 12, 6]} />
        </mesh>
      ))}
      <mesh position={[0, -RE - 2, 0]} scale={1.012} material={glow("#5aa8ff", 0.1)}><sphereGeometry args={[RE, 64, 40]} /></mesh>
      {/* the road, the ground station, the cable and the data building */}
      <Beam a={surf(2, -1)} b={surf(20, -12)} r={0.12} o={0.5} color="#3c4252" />
      {[0, 1, 2, 3].map((i) => {
        const g = surf(GATE[0] - 1.2 + (i % 2) * 2.4, GATE[2] - 1.2 + Math.floor(i / 2) * 2.4);
        return <GroundDish key={i} position={g} scale={0.7} lit={k("gate", 12)} />;
      })}
      {has("fibre") && <Beam a={[GATE[0], GATE[1] + 0.05, GATE[2]]} b={lerpV([GATE[0], GATE[1] + 0.05, GATE[2]], [DC[0], DC[1] + 0.05, DC[2]], k("fibre", 24))} r={0.06} o={0.9} color={TECH.amber} />}
      <DataCentre position={DC} rotation-y={-0.5} scale={0.8} lit={k("dc", 14)} />
      {/* patches of ground the beams serve */}
      {cellsOn > 0 && [0, 1, 2, 3].map((i) => (
        <group key={i}>
          <mesh position={[cellAt(i)[0], cellAt(i)[1] + 0.06, cellAt(i)[2]]} rotation-x={-Math.PI / 2} material={glow(TECH.cyan, q(0.3 * cellsOn))}><circleGeometry args={[1.5, 6]} /></mesh>
          {has("dishes") && Array.from({ length: 6 }, (_, j) => (
            <mesh key={j} position={[cellAt(i)[0] + (rnd("dd", i * 9 + j) - 0.5) * 2, cellAt(i)[1] + 0.12, cellAt(i)[2] + (rnd("de", i * 9 + j) - 0.5) * 2]} material={glow(TECH.white, q(k("dishes", 12)))}><sphereGeometry args={[0.07, 6, 4]} /></mesh>
          ))}
        </group>
      ))}
      {beams > 0 && [0, 1, 2, 3].map((i) => <Cone key={i} a={[sat[0], sat[1] - 0.2, sat[2]]} b={cellAt(i)} r={1.4} o={0.16 * beams} />)}
      {up > 0 && <Beam a={surf(-10, 6)} b={[sat[0], sat[1] - 0.15, sat[2]]} r={0.05} o={0.8 * up} color={TECH.cyan} />}
      {down > 0 && <Beam a={[sat[0], sat[1] - 0.15, sat[2]]} b={lerpV([sat[0], sat[1], sat[2]], [GATE[0], GATE[1] + 0.7, GATE[2]], down)} r={0.06} o={0.85} color={TECH.amber} />}
      {pd >= 0 && <mesh position={lerpV(sat, [GATE[0], GATE[1] + 0.7, GATE[2]], pd)} material={glow(TECH.white, 1)}><sphereGeometry args={[0.16, 10, 8]} /></mesh>}
      {/* the satellite */}
      <group position={sat} rotation={[roll, 0.5, 0.1]} scale={1.5}>
        <FlatSat arrays={arrays} n={nArr} glowBody={0.8} />
      </group>
      <Words b={b} pos={pos} />
    </Shot>
  );
};
export default SatClose;
