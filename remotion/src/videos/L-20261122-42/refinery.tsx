// The BP Texas City isomerization unit (23 March 2005) as one lit 3D world, shared by the Unit and Tower
// beats. One unit = 10 feet. The raffinate splitter tower (170 ft) with its platforms, ladder and insulation
// bands; the overhead pipe running from its top back down the side to three relief valves; the outlet line
// to the old blowdown drum and its tall open stack; the furnace; pipe racks; other columns and tanks behind;
// the contractors' trailers; the idling pickup truck. Phases add the liquid geyser from the stack, the
// ground-hugging vapour cloud, the ignition (fireball and pressure ring), and the aftermath (crushed
// trailers, fires, smoke). No people are drawn.
import React from "react";
import { Easing } from "remotion";
import { CloudDeck, glow, rnd, Smoke, useDLook, type V3 } from "../../three/index";

export const TOWER_H = 17, TOWER_R = 0.65;
export const VALVE_Y = 2.2, PIPE_X = 1.0;
export const DRUM: V3 = [8, 0, 0];
export const DRUM_H = 2.7, STACK_TOP = 11.3;
export const TRUCK: V3 = [9.6, 0, 2.1];
export const TRAILERS: V3[] = [[4.5, 0, 11.6], [7.5, 0, 12.1], [10.5, 0, 12.4], [13.5, 0, 12.2], [16.5, 0, 11.4], [5.5, 0, 15.2], [9.5, 0, 15.6], [13.5, 0, 15.5]];
const sh = { castShadow: true, receiveShadow: true } as const;
const k01 = (x: number) => Math.max(0, Math.min(1, x));
const q = (x: number, n = 10) => Math.round(k01(x) * n) / n;

export function useMats() {
  const { paint } = useDLook();
  return {
    steel: paint("steel", "#8d949b"), insul: paint("metal", "#b9bcc0"), dark: paint("dark", "#1d1f22"), pad: paint("concrete", "#4c4a46"),
    gravel: paint("ground", "#2a2926"), rust: paint("body", "#7a4a2c"), white: paint("body", "#e8e6df"), red: paint("body", "#9b2a22"),
    yellow: paint("body", "#d9a520"), glass: paint("glass", "#1a2a36"), grate: paint("metal", "#6d7277"), tank: paint("body", "#b9bec2"), paint,
    siding: paint("metal", "#c9c6bd"), door: paint("body", "#5a6470"), brick: paint("concrete", "#6b4a3a"),
  };
}

/** A pipe from a to b (straight segment). */
export const Pipe: React.FC<{ a: V3; b: V3; r?: number; mat?: unknown; glowC?: string; glowK?: number }> = ({ a, b, r = 0.09, glowC, glowK = 0 }) => {
  const M = useMats();
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
  const len = Math.hypot(dx, dy, dz);
  const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  // orient a Y-up cylinder along the segment
  const yaw = Math.atan2(dx, dz), pitch = Math.acos(Math.max(-1, Math.min(1, dy / (len || 1))));
  return (
    <group position={mid} rotation={[0, yaw, 0]}>
      <mesh rotation-x={pitch} material={glowK > 0 ? glow(glowC ?? "#ffb000", q(glowK)) : M.steel} castShadow>
        <cylinderGeometry args={[r, r, len, 12]} />
      </mesh>
    </group>
  );
};

/** The raffinate splitter: shell (or a glass cutaway shell), bands, platforms, ladder, top head. */
export const Column: React.FC<{ glass?: number }> = ({ glass = 0 }) => {
  const M = useMats();
  return (
    <group>
      {glass < 1 && <mesh position={[0, TOWER_H / 2, 0]} material={M.insul} {...sh}><cylinderGeometry args={[TOWER_R, TOWER_R, TOWER_H, 32]} /></mesh>}
      {glass > 0 && (
        <mesh position={[0, TOWER_H / 2, 0]}>
          <cylinderGeometry args={[TOWER_R, TOWER_R, TOWER_H, 40, 1, true]} />
          <meshPhysicalMaterial color="#9fb6c8" transparent opacity={0.22} roughness={0.1} metalness={0.2} side={2} />
        </mesh>
      )}
      <mesh position={[0, TOWER_H + 0.25, 0]} scale={[1, 0.45, 1]} material={M.insul} castShadow><sphereGeometry args={[TOWER_R, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[0, 0.8 + i * 1.4, 0]} material={M.steel}><torusGeometry args={[TOWER_R + 0.01, 0.02, 6, 40]} /></mesh>
      ))}
      {[3, 6, 9, 12, 15].map((y) => (
        <group key={y} position={[0, y, 0]}>
          <mesh rotation-x={-Math.PI / 2} material={M.grate} receiveShadow><ringGeometry args={[TOWER_R, TOWER_R + 0.6, 32, 1, -0.6, 2.4]} /></mesh>
          <mesh position={[0, 0.45, 0]} material={M.yellow}><torusGeometry args={[TOWER_R + 0.6, 0.02, 6, 40, 2.4]} /></mesh>
        </group>
      ))}
      <mesh position={[-TOWER_R - 0.12, TOWER_H / 2, 0.2]} material={M.yellow} castShadow><boxGeometry args={[0.05, TOWER_H, 0.3]} /></mesh>
      <mesh position={[0, 0.3, 0]} material={M.pad} receiveShadow><cylinderGeometry args={[TOWER_R + 0.3, TOWER_R + 0.4, 0.6, 32]} /></mesh>
    </group>
  );
};

/** The overhead line (tower top → down the side) with the three relief valves, and the outlet line to the drum. */
export const Overhead: React.FC<{ fill?: number; valves?: number; flow?: number }> = ({ fill = 0, valves = 0, flow = 0 }) => {
  const M = useMats();
  const top = TOWER_H + 0.3;
  const filledTo = top - fill * (top - VALVE_Y);   // liquid running down the pipe
  return (
    <group>
      <Pipe a={[0, top, 0]} b={[PIPE_X, top, 0]} r={0.1} />
      <Pipe a={[PIPE_X, top, 0]} b={[PIPE_X, VALVE_Y + 0.3, 0]} r={0.1} />
      {fill > 0 && <Pipe a={[PIPE_X + 0.001, top, 0.001]} b={[PIPE_X + 0.001, filledTo, 0.001]} r={0.115} glowC="#ffb000" glowK={0.55} />}
      {[-0.32, 0, 0.32].map((z, i) => (
        <group key={i} position={[PIPE_X + 0.35, VALVE_Y, z]}>
          <mesh material={M.red} castShadow><cylinderGeometry args={[0.13, 0.13, 0.36, 16]} /></mesh>
          <mesh position={[0, 0.24 + 0.1 * valves, 0]} material={M.dark}><cylinderGeometry args={[0.06, 0.06, 0.2, 10]} /></mesh>
          {valves > 0 && <mesh position={[0.2, 0, 0]} material={glow("#ffb000", q(valves))}><sphereGeometry args={[0.07, 8, 8]} /></mesh>}
        </group>
      ))}
      <Pipe a={[PIPE_X + 0.35, VALVE_Y - 0.6, 0]} b={[DRUM[0] - 0.5, VALVE_Y - 0.6, 0]} r={0.12} />
      {flow > 0 && <Pipe a={[PIPE_X + 0.35, VALVE_Y - 0.6, 0.001]} b={[PIPE_X + 0.35 + (DRUM[0] - 0.85 - PIPE_X) * flow, VALVE_Y - 0.6, 0.001]} r={0.135} glowC="#ffb000" glowK={0.6} />}
    </group>
  );
};

/** The 1950s blowdown drum with its open vent stack; `fill` glows the drum amber. */
export const Blowdown: React.FC<{ fill?: number }> = ({ fill = 0 }) => {
  const M = useMats();
  return (
    <group position={DRUM}>
      <mesh position={[0, DRUM_H / 2, 0]} material={M.rust} {...sh}><cylinderGeometry args={[0.5, 0.5, DRUM_H, 24]} /></mesh>
      {fill > 0 && <mesh position={[0, (DRUM_H * fill) / 2, 0]}><cylinderGeometry args={[0.52, 0.52, DRUM_H * fill, 24]} /><meshBasicMaterial color="#ffb000" transparent opacity={0.35} /></mesh>}
      <mesh position={[0, (DRUM_H + STACK_TOP) / 2, 0]} material={M.rust} castShadow><cylinderGeometry args={[0.2, 0.22, STACK_TOP - DRUM_H, 16]} /></mesh>
      {[4, 6.5, 9].map((y) => <mesh key={y} position={[0, y, 0]} material={M.dark}><torusGeometry args={[0.23, 0.025, 6, 20]} /></mesh>)}
      {[0, 1, 2, 3].map((i) => <mesh key={i} position={[Math.cos(i * 1.57) * 0.55, 0.3, Math.sin(i * 1.57) * 0.55]} material={M.dark}><boxGeometry args={[0.08, 0.6, 0.08]} /></mesh>)}
    </group>
  );
};

/** The raffinate furnace: a brick-lined firebox on legs, burner ports along the front, a convection box,
 * ducting and its own stack; `burn` 0..1 lights the burners blue → orange. */
export const Furnace: React.FC<{ burn?: number }> = ({ burn = 0 }) => {
  const M = useMats();
  const c = burn < 0.5 ? "#59a8ff" : "#ff8a2a";
  return (
    <group position={[-3.6, 0, 1.8]}>
      {[[-1, -0.7], [1, -0.7], [-1, 0.7], [1, 0.7]].map(([x, z], i) => <mesh key={i} position={[x!, 0.25, z!]} material={M.steel}><boxGeometry args={[0.14, 0.5, 0.14]} /></mesh>)}
      <mesh position={[0, 1.6, 0]} material={M.brick} {...sh}><boxGeometry args={[2.3, 2.2, 1.6]} /></mesh>
      {Array.from({ length: 6 }, (_, i) => <mesh key={i} position={[-1.0 + i * 0.4, 1.6, 0.81]} material={M.steel}><boxGeometry args={[0.04, 2.2, 0.04]} /></mesh>)}
      <mesh position={[0, 3.1, 0]} material={M.steel} castShadow><boxGeometry args={[1.6, 0.8, 1.2]} /></mesh>
      <mesh position={[0, 4.6, 0]} material={M.dark} castShadow><cylinderGeometry args={[0.25, 0.3, 2.2, 16]} /></mesh>
      <mesh position={[1.3, 2.4, 0]} rotation-z={Math.PI / 2} material={M.insul}><cylinderGeometry args={[0.12, 0.12, 0.8, 12]} /></mesh>
      {[-0.75, -0.25, 0.25, 0.75].map((x) => (
        <group key={x} position={[x, 0.72, 0.82]}>
          <mesh material={M.dark}><circleGeometry args={[0.12, 16]} /></mesh>
          <mesh position={[0, 0, 0.003]} material={glow(burn > 0 ? c : "#2a1c10", burn > 0 ? 0.4 + 0.6 * q(burn) : 0.6)}><circleGeometry args={[0.08, 16]} /></mesh>
        </group>
      ))}
      {burn > 0 && <pointLight position={[0, 0.8, 1.4]} intensity={4 * burn} distance={5} color={c} />}
    </group>
  );
};

/** The satellite control room beside the unit: a low brick block with a lit window band and a door. */
export const ControlRoom: React.FC = () => {
  const M = useMats();
  return (
    <group position={[-9, 0, 6]}>
      <mesh position={[0, 0.9, 0]} material={M.brick} {...sh}><boxGeometry args={[4, 1.8, 2.4]} /></mesh>
      <mesh position={[0, 1.85, 0]} material={M.steel}><boxGeometry args={[4.2, 0.12, 2.6]} /></mesh>
      <mesh position={[0, 1.1, 1.21]} material={glow("#d9ffe8", 0.55)}><planeGeometry args={[3.2, 0.4]} /></mesh>
      <mesh position={[1.6, 0.55, 1.21]} material={M.door}><planeGeometry args={[0.4, 0.9]} /></mesh>
    </group>
  );
};

/** A flare stack: the safe alternative, a tall stack with a pilot flame on top. */
export const Flare: React.FC<{ frame: number; at: V3; k?: number }> = ({ frame, at, k = 1 }) => {
  const M = useMats();
  if (k <= 0) return null;
  return (
    <group position={at} scale={[1, k, 1]}>
      <mesh position={[0, 6, 0]} material={M.steel} castShadow><cylinderGeometry args={[0.18, 0.25, 12, 14]} /></mesh>
      {[3, 6, 9].map((y) => <mesh key={y} position={[0, y, 0]} material={M.grate}><torusGeometry args={[0.45, 0.02, 6, 24]} /></mesh>)}
      <mesh position={[0, 12.6 + 0.1 * Math.sin(frame / 3), 0]} scale={[1, 1 + 0.2 * Math.sin(frame / 2), 1]}><coneGeometry args={[0.35, 1.3, 12]} /><meshBasicMaterial color="#ff9a3c" /></mesh>
      <pointLight position={[0, 12.8, 0]} intensity={8} distance={10} color="#ff9a3c" />
    </group>
  );
};

/** One contractor trailer (a double-wide office unit): ribbed siding, windows with frames, a door with steps,
 * a dark skirt; `crush` 0..1 buckles it. */
export const Trailer: React.FC<{ at: V3; rot?: number; crush?: number; lit?: number }> = ({ at, rot = 0, crush = 0, lit = 0.6 }) => {
  const M = useMats();
  const sy = 1 - 0.55 * crush;
  return (
    <group position={at} rotation-y={rot}>
      <group rotation-z={crush * 0.18} position={[0, -0.1 * crush, 0]}>
        <mesh position={[0, 0.7 * sy, 0]} scale={[1, sy, 1]} material={M.white} {...sh}><boxGeometry args={[2.6, 1.0, 1.0]} /></mesh>
        <mesh position={[0, 1.22 * sy, 0]} scale={[1, sy, 1]} material={M.steel} castShadow><boxGeometry args={[2.66, 0.05, 1.06]} /></mesh>
        {Array.from({ length: 14 }, (_, i) => <mesh key={i} position={[-1.25 + i * 0.19, 0.7 * sy, 0.505]} scale={[1, sy, 1]} material={M.siding}><boxGeometry args={[0.025, 0.96, 0.01]} /></mesh>)}
        {crush < 0.5 && [-0.8, -0.2, 0.4].map((x) => (
          <group key={x} position={[x, 0.82, 0.512]}>
            <mesh material={M.dark}><planeGeometry args={[0.42, 0.32]} /></mesh>
            <mesh position={[0, 0, 0.002]} material={glow("#ffe2b0", q(lit * 0.8))}><planeGeometry args={[0.36, 0.26]} /></mesh>
          </group>
        ))}
        <mesh position={[0.95, 0.55 * sy, 0.512]} material={M.door}><planeGeometry args={[0.34, 0.7 * sy]} /></mesh>
      </group>
      <mesh position={[0, 0.1, 0]} material={M.dark}><boxGeometry args={[2.5, 0.2, 0.94]} /></mesh>
      {crush < 0.5 && [0, 1, 2].map((s) => <mesh key={s} position={[0.95, 0.06 + s * 0.08, 0.6 + (2 - s) * 0.1]} material={M.steel}><boxGeometry args={[0.4, 0.04, 0.12]} /></mesh>)}
    </group>
  );
};

/** The diesel pickup truck, engine idling (exhaust puffs). */
export const Truck: React.FC<{ frame: number; spark?: number }> = ({ frame, spark = 0 }) => {
  const M = useMats();
  return (
    <group position={TRUCK} rotation-y={0.4}>
      <mesh position={[-0.2, 0.42, 0]} material={M.red} castShadow><boxGeometry args={[0.6, 0.3, 0.5]} /></mesh>
      <mesh position={[0.3, 0.36, 0]} material={M.red} castShadow><boxGeometry args={[0.42, 0.18, 0.5]} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[0.3, 0.52, s * 0.23]} material={M.red}><boxGeometry args={[0.42, 0.16, 0.04]} /></mesh>)}
      <mesh position={[0.5, 0.52, 0]} material={M.red}><boxGeometry args={[0.04, 0.16, 0.5]} /></mesh>
      <mesh position={[-0.12, 0.72, 0]} material={M.red} castShadow><boxGeometry args={[0.42, 0.28, 0.48]} /></mesh>
      {[-1, 1].map((s) => <mesh key={`l${s}`} position={[-0.51, 0.45, s * 0.17]} material={glow("#fff4d8", 0.8)}><boxGeometry args={[0.02, 0.06, 0.1]} /></mesh>)}
      <mesh position={[-0.12, 0.74, 0]} material={M.glass}><boxGeometry args={[0.44, 0.2, 0.5]} /></mesh>
      {[-0.32, 0.32].map((x) => [-1, 1].map((s) => <mesh key={`${x}${s}`} position={[x, 0.18, s * 0.26]} rotation-x={Math.PI / 2} material={M.dark}><cylinderGeometry args={[0.16, 0.16, 0.08, 14]} /></mesh>))}
      <Smoke frame={frame} at={[0.55, 0.25, -0.2]} height={1.2} width={0.4} count={8} life={60} color="#6b6f74" opacity={0.35} wind={[0.4, 0.3, 0]} seed="exhaust" />
      {spark > 0 && <pointLight position={[0.3, 0.5, 0]} intensity={8 * spark} distance={3} color="#ffd08a" />}
      {spark > 0 && <mesh position={[0.3, 0.5, 0.26]} material={glow("#fff1c8", q(spark))}><sphereGeometry args={[0.08, 8, 8]} /></mesh>}
    </group>
  );
};

/** The refinery around the unit: pad, gravel, pipe racks, other columns, spheres and tanks, a fence and the town edge. */
export const Site: React.FC<{ trailers?: number; crush?: number; town?: boolean; frame?: number; away?: number }> = ({ trailers = 1, crush = 0, town = false, frame = 0, away = 0 }) => {
  const M = useMats();
  return (
    <group>
      {/* the sky and the rest of the refinery on the horizon */}
      <CloudDeck frame={frame} y={34} size={220} cover={0.55} puffs={40} seed="tc-sky" />
      {Array.from({ length: 46 }, (_, i) => {
        const a = -1.2 + (i / 45) * 2.4, d = 45 + rnd("hz", i) * 20, h = 4 + rnd("hh", i) * 14, w = 0.4 + rnd("hw", i) * 1.4;
        return <mesh key={`h${i}`} position={[4 + Math.sin(a) * d, h / 2, -Math.cos(a) * d]} material={M.dark}><boxGeometry args={[w, h, w]} /></mesh>;
      })}
      {/* paving seams and painted lines on the unit pad, gravel bands outside */}
      {Array.from({ length: 12 }, (_, i) => <mesh key={`sx${i}`} position={[-8 + i * 2, 0.02, 0]} rotation-x={-Math.PI / 2}><planeGeometry args={[0.05, 9]} /><meshBasicMaterial color="#2c2a27" /></mesh>)}
      {Array.from({ length: 5 }, (_, i) => <mesh key={`sz${i}`} position={[3, 0.02, -4 + i * 2]} rotation-x={-Math.PI / 2}><planeGeometry args={[22, 0.05]} /><meshBasicMaterial color="#2c2a27" /></mesh>)}
      <mesh position={[3, 0.025, 4.3]} rotation-x={-Math.PI / 2}><planeGeometry args={[22, 0.12]} /><meshBasicMaterial color="#d9a520" /></mesh>
      {Array.from({ length: 30 }, (_, i) => (
        <mesh key={`g${i}`} position={[-20 + rnd("gx", i) * 50, 0.015, 6 + rnd("gz", i) * 26]} rotation-x={-Math.PI / 2} rotation-z={rnd("gr", i) * 3}>
          <planeGeometry args={[2 + rnd("gw", i) * 5, 0.6 + rnd("gl", i) * 1.5]} /><meshBasicMaterial color={i % 2 ? "#2f2e2b" : "#4a4843"} />
        </mesh>
      ))}
      <mesh rotation-x={-Math.PI / 2} position={[4, 0, 4]} material={M.gravel} receiveShadow><planeGeometry args={[120, 90]} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[3, 0.01, 0]} material={M.pad} receiveShadow><planeGeometry args={[22, 9]} /></mesh>
      {/* pipe rack along the unit */}
      {Array.from({ length: 14 }, (_, i) => -10 + i * 2).map((x) => (
        <group key={x} position={[x, 0, -3.2]}>
          {[-0.6, 0.6].map((z) => <mesh key={z} position={[0, 1.6, z]} material={M.steel} castShadow><boxGeometry args={[0.14, 3.2, 0.14]} /></mesh>)}
          {[1.6, 2.6, 3.2].map((y) => <mesh key={y} position={[0, y, 0]} material={M.steel}><boxGeometry args={[0.12, 0.12, 1.4]} /></mesh>)}
        </group>
      ))}
      {[1.75, 2.75, 3.35].map((y, j) => [-0.45, -0.1, 0.25].map((z, i) => (
        <mesh key={`${y}${z}`} position={[3, y, -3.2 + z]} rotation-z={Math.PI / 2} material={(i + j) % 2 ? M.steel : M.insul} castShadow><cylinderGeometry args={[0.08, 0.08, 28, 10]} /></mesh>
      )))}
      {/* other columns and tanks behind */}
      {[[-7, -7, 0.5, 12], [-4.5, -8, 0.4, 9], [3.5, -8, 0.55, 14], [6, -7.5, 0.35, 8], [12, -8, 0.45, 11]].map(([x, z, r, h], i) => (
        <group key={i} position={[x!, 0, z!]}>
          <mesh position={[0, h! / 2, 0]} material={M.insul} castShadow><cylinderGeometry args={[r!, r!, h!, 20]} /></mesh>
          {[0.3, 0.6].map((f) => <mesh key={f} position={[0, h! * f, 0]} material={M.grate}><torusGeometry args={[r! + 0.3, 0.02, 6, 30]} /></mesh>)}
        </group>
      ))}
      {[[-14, -14], [-6, -16], [2, -17], [20, -12]].map(([x, z], i) => (
        <group key={i} position={[x!, 0, z!]}>
          <mesh position={[0, 2.4, 0]} material={M.tank} castShadow receiveShadow><cylinderGeometry args={[3, 3, 4.8, 32]} /></mesh>
          <mesh position={[0, 5.1, 0]} material={M.steel} castShadow><coneGeometry args={[3.05, 0.6, 32]} /></mesh>
          {[1.2, 2.4, 3.6].map((y) => <mesh key={y} position={[0, y, 0]} material={M.grate}><torusGeometry args={[3.01, 0.03, 6, 48]} /></mesh>)}
          {Array.from({ length: 8 }, (_, s) => <mesh key={s} position={[Math.cos(s * 0.18) * 3.1, 0.3 + s * 0.6, Math.sin(s * 0.18) * 3.1]} material={M.yellow}><boxGeometry args={[0.3, 0.05, 0.5]} /></mesh>)}
          <mesh position={[0, 1.4, 3.01]} material={M.rust}><planeGeometry args={[1.6, 0.8]} /></mesh>
        </group>
      ))}
      {[[18, -4], [21, -1]].map(([x, z], i) => (
        <group key={i} position={[x!, 0, z!]}>
          <mesh position={[0, 2.6, 0]} material={M.tank} castShadow><sphereGeometry args={[2, 24, 16]} /></mesh>
          {[0, 1, 2, 3, 4, 5].map((l) => <mesh key={l} position={[Math.cos(l * 1.05) * 1.7, 0.9, Math.sin(l * 1.05) * 1.7]} material={M.steel}><cylinderGeometry args={[0.08, 0.08, 1.8, 8]} /></mesh>)}
          <mesh position={[0, 2.6, 0]} material={M.grate}><torusGeometry args={[2.01, 0.03, 6, 48]} /></mesh>
        </group>
      ))}
      {/* trailers */}
      {trailers > 0 && TRAILERS.map((at, i) => <Trailer key={i} at={[at[0] + away * 14, at[1], at[2] + away * 10]} rot={(rnd("trot", i) - 0.5) * 0.3} crush={crush * (i < 5 ? 1 : 0.6) * (0.7 + 0.3 * rnd("tcr", i))} />)}
      <ControlRoom />
      {/* fence and the town beyond */}
      {Array.from({ length: 24 }, (_, i) => <mesh key={i} position={[-20 + i * 2.2, 0.6, 24]} material={M.grate}><boxGeometry args={[0.05, 1.2, 0.05]} /></mesh>)}
      {town && Array.from({ length: 14 }, (_, i) => (
        <group key={i} position={[-18 + i * 3.2, 0, 30 + (i % 3) * 3]}>
          <mesh position={[0, 0.9, 0]} material={M.white} castShadow><boxGeometry args={[2, 1.8, 1.8]} /></mesh>
          <mesh position={[0, 2.1, 0]} rotation-y={Math.PI / 4} material={M.red}><coneGeometry args={[1.5, 0.8, 4]} /></mesh>
          <mesh position={[0.4, 1, 0.91]} material={glow("#ffe2b0", 0.7)}><planeGeometry args={[0.4, 0.35]} /></mesh>
        </group>
      ))}
    </group>
  );
};

/** The liquid geyser from the stack top: a rising column and droplets raining round the base. `k` 0..1. */
export const Geyser: React.FC<{ frame: number; k: number }> = ({ frame, k }) => {
  if (k <= 0) return null;
  const h = 3.2 * Easing.out(Easing.cubic)(k01(k * 1.4));
  const drops = Array.from({ length: 140 }, (_, i) => {
    const life = 40, ph = (frame + rnd("gd", i) * life) % life / life;
    const a = rnd("ga", i) * Math.PI * 2, r = 0.2 + ph * (0.8 + rnd("gr", i) * 1.6);
    const y = STACK_TOP + h * (1 - ph) - ph * ph * (STACK_TOP + 1) * 0.9;
    return <mesh key={i} position={[DRUM[0] + Math.cos(a) * r, Math.max(0.05, y), Math.sin(a) * r]}><sphereGeometry args={[0.07, 6, 6]} /><meshBasicMaterial color="#e8c27a" transparent opacity={0.8} /></mesh>;
  });
  return (
    <group>
      <mesh position={[DRUM[0], STACK_TOP + h / 2, 0]}><cylinderGeometry args={[0.28, 0.4, h, 16]} /><meshBasicMaterial color="#e8c27a" transparent opacity={0.85} /></mesh>
      {drops}
      <Smoke frame={frame} at={[DRUM[0], STACK_TOP + h, 0]} height={2} width={1.4} count={12} life={50} color="#e9dcc0" opacity={0.35 * k} wind={[0.3, -0.2, 0.2]} seed="gmist" />
    </group>
  );
};

/** The vapour cloud spreading over the ground from the drum toward the trailers. `k` 0..1. */
export const Vapour: React.FC<{ frame: number; k: number }> = ({ frame, k }) => {
  if (k <= 0) return null;
  return (
    <group>
      {Array.from({ length: 16 }, (_, i) => {
        const a = rnd("va", i) * Math.PI * 1.2 - 0.1, d = (0.5 + rnd("vd", i) * 9) * k;
        const x = DRUM[0] + Math.cos(a) * d * 0.8, z = Math.sin(a) * d * 1.3;
        const s = (1.2 + rnd("vs", i) * 1.8) * (0.4 + 0.6 * k);
        return (
          <mesh key={i} position={[x, 0.35 + 0.1 * Math.sin(frame / 20 + i), z]} scale={[s * 1.4, 0.35 * s, s]}>
            <sphereGeometry args={[1, 16, 10]} />
            <meshBasicMaterial color="#d8e2c0" transparent opacity={0.16} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/** The ignition: a fireball over the cloud and a pressure ring rolling out. `k` 0..1 from the ignition. */
export const Blast: React.FC<{ k: number }> = ({ k }) => {
  if (k <= 0) return null;
  const f = Easing.out(Easing.cubic)(k01(k * 2));
  const fade = 1 - k01((k - 0.3) / 0.7);
  return (
    <group position={[DRUM[0] + 1, 0, 3]}>
      <mesh position={[0, 1.2 + 2 * f, 0]} scale={[1 + 7 * f, 0.6 + 3.5 * f, 1 + 7 * f]}><sphereGeometry args={[1, 24, 16]} /><meshBasicMaterial color="#ff8a2a" transparent opacity={0.85 * fade} depthWrite={false} /></mesh>
      <mesh position={[0, 1.4 + 2 * f, 0]} scale={[0.6 + 4 * f, 0.4 + 2 * f, 0.6 + 4 * f]}><sphereGeometry args={[1, 20, 12]} /><meshBasicMaterial color="#fff1c8" transparent opacity={0.9 * fade} depthWrite={false} /></mesh>
      <mesh position={[0, 0.2, 0]} rotation-x={-Math.PI / 2}><ringGeometry args={[1 + 22 * f, 1.4 + 22 * f, 64]} /><meshBasicMaterial color="#ffd08a" transparent opacity={0.6 * fade} depthWrite={false} /></mesh>
      <pointLight position={[0, 4, 0]} intensity={120 * fade} distance={60} color="#ffb36a" />
    </group>
  );
};

/** Fires and smoke after the blast, among the trailers and the unit. */
export const Aftermath: React.FC<{ frame: number; fire?: number }> = ({ frame, fire = 1 }) => (
  <group>
    {[[6, 11.8], [10, 12.2], [14, 12], [9, 3], [4, 1.5]].map(([x, z], i) => (
      <group key={i} position={[x!, 0, z!]}>
        {fire > 0 && Array.from({ length: 5 }, (_, j) => (
          <mesh key={j} position={[(rnd("fx", i * 9 + j) - 0.5) * 0.8, 0.5 + 0.2 * Math.sin(frame / 3 + j), (rnd("fz", i * 9 + j) - 0.5) * 0.6]} scale={[1, 1 + 0.3 * Math.sin(frame / 2.5 + j * 2), 1]}>
            <coneGeometry args={[0.22, 1.1, 8]} />
            <meshBasicMaterial color={j % 2 ? "#ff7a2a" : "#ffc04a"} transparent opacity={0.85 * fire} />
          </mesh>
        ))}
        {fire > 0 && <pointLight position={[0, 1, 0]} intensity={6 * fire} distance={7} color="#ff8a3a" />}
        <Smoke frame={frame + i * 30} at={[0, 0.8, 0]} height={9} width={2.6} count={16} life={140} color="#2e2c2a" opacity={0.55} wind={[0.6, 0, -0.2]} seed={`as${i}`} />
      </group>
    ))}
  </group>
);
export default Column;
