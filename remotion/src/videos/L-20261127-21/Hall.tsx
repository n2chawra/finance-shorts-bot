// Hall: a data-centre hall at night: two long rows of server racks with blinking lights, a glowing cable running
// out of the hall, light pulses on it; a rack slides open to show its boards of graphics chips; heat shimmers
// over the racks, power lines overhead, blue cooling pipes. Actions: racks, out, pieces, loop, path, glow,
// question, lights, open, boards, chips, sparks, heat, power, cool, pulse, aisle, cable, far.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { Block, glow, GPUCard, mat, ServerRack, TECH, type V3 } from "../../three/index";
import { Ask, Beads, Beam, DotGrid, HALL, Lines, q, Shot, useBeat, Words, type Anchor } from "./kit";

const ROWS = [-2.2, 2.2];
const RX = (i: number) => -10 + i * 1.25;
const OPEN_X = RX(9);

const Hall: React.FC<SceneProps> = (p) => {
  const b = useBeat(p);
  const { f, k, at, has } = b;
  const open = k("open", 18);
  const boards = k("boards", 16);
  const chips = k("chips", 12);
  const heat = k("heat", 24);
  const cool = k("cool", 20);
  const flare = has("glow") && f >= at("glow") ? Math.max(0, 1 - (f - at("glow")) / 20) : 0;
  const anchors: Record<string, Anchor> = {
    hall: { look: [0, 1.6, 0], dir: [0.55, 0.45, 1], d: 12 },
    rack: { look: [OPEN_X, 1.4, ROWS[1]! - 0.6], dir: [0.3, 0.25, -1], d: 6 },
    board: { look: [OPEN_X, 1.5, ROWS[1]! - 1.6], dir: [0.15, 0.7, -1], d: 4.2 },
    cable: { look: [4, 0.4, 0], dir: [0.6, 0.6, 1], d: 7 },
  };
  const pos = (on: string): V3 => on === "rack" ? [OPEN_X, 3.2, ROWS[1]!] : on === "cable" ? [6, 1.2, 0] : [0, 3.6, 0];
  const out: V3 = [-12, 0.08, 0], end: V3 = [16, 0.08, 0];
  return (
    <Shot p={p} b={b} anchors={anchors} seed="hall" backdrop={HALL} floor="reflect" bloom={1.15} light={0.8} dust={{ c: [0, 2, 0], r0: 6, r1: 18, size: 0.3, color: "#8fe8ff" }} fog={{ color: "#03080b", near: 14, far: 40 }}>
      {/* ceiling trays, power lines, a raised floor of tiles */}
      <Lines from={-14} to={18} step={1.2} along="x" span={[-5, 5]} z={-0.0} color="#0e1a20" r={0.01} />
      <DotGrid x0={-14} x1={18} y0={0.01} y1={0.02} z={4.5} gap={0.6} size={0.05} color="#0b1418" />
      {[-1.2, 1.2].map((z, i) => (
        <mesh key={i} position={[2, 3.6, z]} rotation-z={Math.PI / 2} material={has("power") && f >= at("power") ? glow(TECH.amber, q(0.4 + 0.4 * Math.abs(Math.sin(f * 0.2 + i)))) : mat("brushed", "#40484f")}>
          <cylinderGeometry args={[0.05, 0.05, 32, 8]} />
        </mesh>
      ))}
      {/* the racks */}
      {ROWS.map((z, r) => Array.from({ length: 14 }, (_, i) => {
        const isOpen = r === 1 && i === 9;
        return (
          <group key={`${r}-${i}`} position={[RX(i), 0, z]} rotation-y={r === 0 ? 0 : Math.PI}>
            <group position={[0, 0, isOpen ? -1.2 * open : 0]}>
              <ServerRack seed={`h-${r}-${i}`} lod={isOpen ? "high" : "low"} ledColor={heat > 0.5 ? TECH.amber : TECH.cyan} scale={1.3} />
            </group>
            {flare > 0 && <mesh position={[0, 1.5, 0.75]} material={glow(TECH.cyan, q(flare * 0.6))}><planeGeometry args={[0.9, 2.6]} /></mesh>}
            {heat > 0.02 && <mesh position={[0, 3.3 + 0.2 * Math.sin(f * 0.1 + i), 0]} material={glow("#ff7a3a", q(heat * (0.15 + 0.1 * Math.abs(Math.sin(f * 0.13 + i * 0.7)))))}><planeGeometry args={[1, 0.6]} /></mesh>}
          </group>
        );
      }))}
      {/* the opened rack's boards, sliding out into the aisle */}
      {has("boards") && [0, 1, 2].map((j) => (
        <group key={j} position={[OPEN_X, 0.9 + j * 0.7, ROWS[1]! - 1.2 - 1.3 * boards]} rotation-y={Math.PI / 2}>
          <GPUCard lit={0.3 + 0.6 * chips} seed={`hb${j}`} scale={0.55} />
        </group>
      ))}
      {has("sparks") && f >= at("sparks") && <Beads a={[OPEN_X - 3, 1.2, ROWS[1]!]} b={[OPEN_X + 3, 1.8, ROWS[1]!]} t={f - at("sparks")} n={10} color={TECH.white} r={0.04} spread={1.2} />}
      {/* cooling pipes along the floor */}
      {cool > 0.02 && ROWS.map((z, i) => <mesh key={i} position={[2, 0.15, z * 0.62]} rotation-z={Math.PI / 2} material={glow("#3aa8ff", q(0.3 + 0.5 * cool))}><cylinderGeometry args={[0.09, 0.09, 30, 10]} /></mesh>)}
      {/* the cable out of the hall, and the pulses on it */}
      <Beam a={out} b={end} r={0.06} color={has("cable") || has("out") || has("pieces") || has("pulse") ? TECH.cyan : "#2a5a6a"} o={0.9} />
      <Block size={[0.6, 0.6, 0.6]} radius={0.05} preset="blackPlastic" position={[OPEN_X + 0.6, 0.3, 0]} />
      {has("out") && f >= at("out") && <Beads a={[OPEN_X + 0.6, 0.12, 0]} b={end} t={f - at("out")} n={has("pieces") && f >= at("pieces") ? 9 : 2} color={TECH.amber} r={0.09} spread={0.02} />}
      {has("pulse") && f >= at("pulse") && <Beads a={[OPEN_X, 1.4, ROWS[1]! - 0.6]} b={[OPEN_X + 0.6, 0.12, 0]} t={(f - at("pulse")) * 1.5} n={3} color={TECH.amber} r={0.1} spread={0.02} />}
      {has("cable") && f >= at("cable") && <Beads a={[OPEN_X + 0.6, 0.12, 0]} b={end} t={(f - at("cable")) * 2} n={4} color={TECH.amber} r={0.11} spread={0.02} />}
      {has("loop") && f >= at("loop") && <mesh position={[OPEN_X, 1.6, ROWS[1]! - 0.75]} rotation-y={Math.PI / 2} material={glow(TECH.amber, q(0.6 + 0.3 * Math.sin(f * 0.3)))}><torusGeometry args={[0.9, 0.035, 6, 40, Math.PI * 2 * Math.min(1, k("loop", 30) + k("path", 30))]} /></mesh>}
      <Ask b={b} at={[0, 3, 0]} px={150} />
      <Words b={b} pos={pos} />
    </Shot>
  );
};
export default Hall;
