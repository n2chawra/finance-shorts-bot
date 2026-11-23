// City: the die on its green board (where), lifts off (lift), turns flat under the camera with a
// rainbow sheen running over the silicon (silicon), the camera dives at it (zoom), blocks rise like
// buildings with lanes of light between them (city), and the camera glides over them like a plane at
// night, fog closing in (plane). No figures in this beat.
//
// The kit reads useCurrentFrame(); a beat is not mounted in a Sequence and runs on the story clock,
// so the whole stage is frozen at the beat's own story frame (p.frame) and every kit cue is written
// in the same frames as the beat's events.
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import {
  Block, Board, Camera3D, cue, Die, direct, Focus, glow, mat, moves, rnd, Stage3D, TECH, type CamKey, type V3,
} from "../../three/index";

// ---------------------------------------------------------------------- the die city (shared with Dive)

/** Cells across the die's city grid, and the share of the die it covers. */
export const CITY_N = 11;
const CITY_COVER = 0.9;
const ADDITIVE = 2; // three's AdditiveBlending

export type CityCell = { x: number; z: number; h: number; fp: number; empty: boolean };

/** Where block (i, j) of the city on a die of `size` stands, its footprint and its height (die units). */
export function cityCell(size: number, i: number, j: number, seed = "v02-city"): CityCell {
  const usable = size * CITY_COVER;
  const cell = usable / CITY_N;
  const k = i * CITY_N + j;
  const r = rnd(seed, k);
  const tower = rnd(`${seed}-t`, k) > 0.86;
  return {
    x: -usable / 2 + (i + 0.5) * cell,
    z: -usable / 2 + (j + 0.5) * cell,
    fp: cell * 0.7,
    h: cell * (tower ? 1.6 + r * 1.2 : 0.25 + r * r * 1.1),
    empty: rnd(`${seed}-e`, k) < 0.07,
  };
}

const q20 = (x: number) => Math.round(Math.max(0, Math.min(1, x)) * 20) / 20;

export type DieCityProps = {
  size: number;
  /** the beat's frame */
  frame: number;
  /** the frame the blocks start rising (from the centre out) */
  riseAt: number;
  /** how bright the lanes and roof lights are (0..1) */
  lit?: number;
  /** a cell drawn elsewhere (the core a beat wraps in a Highlight) */
  skip?: [number, number];
  seed?: string;
  position?: V3;
};

/** Blocks standing on a die like a city at night, lanes of light between them, light moving on the lanes. */
export const DieCity: React.FC<DieCityProps> = ({ size, frame, riseAt, lit = 1, skip, seed = "v02-city", position }) => {
  const usable = size * CITY_COVER;
  const cell = usable / CITY_N;
  const laneW = cell * 0.13;
  const lanesIn = cue(frame, riseAt + 4, 18, Easing.out(Easing.cubic));
  const l = q20(lit);
  const blocks: React.ReactNode[] = [];
  for (let i = 0; i < CITY_N; i++) {
    for (let j = 0; j < CITY_N; j++) {
      if (skip && skip[0] === i && skip[1] === j) continue;
      const c = cityCell(size, i, j, seed);
      if (c.empty) continue;
      const d = Math.hypot(i - (CITY_N - 1) / 2, j - (CITY_N - 1) / 2);
      const g = cue(frame, riseAt + d * 1.6, 12, Easing.out(Easing.back(1.3)));
      if (g <= 0.001) continue;
      const h = c.h * g;
      const k = i * CITY_N + j;
      const body = rnd(`${seed}-m`, k) > 0.7 ? mat("silicon") : mat("ceramic", rnd(`${seed}-c`, k) > 0.5 ? "#1d2438" : "#262c40");
      const roof = rnd(`${seed}-r`, k);
      blocks.push(
        <group key={k} position={[c.x, 0, c.z]}>
          <mesh position={[0, h / 2, 0]} material={body} castShadow receiveShadow>
            <boxGeometry args={[c.fp, Math.max(h, 1e-4), c.fp]} />
          </mesh>
          {roof > 0.62 && l > 0 && (
            <mesh position={[0, h + 0.002, 0]} material={glow(roof > 0.85 ? TECH.violet : TECH.cyan, Math.max(0.05, q20(l * 0.85)))}>
              <boxGeometry args={[c.fp * 0.6, 0.003, c.fp * 0.6]} />
            </mesh>
          )}
        </group>,
      );
    }
  }
  const lanes: React.ReactNode[] = [];
  const pulses: React.ReactNode[] = [];
  if (lanesIn > 0 && l > 0) {
    const op = Math.max(0.05, q20(l * lanesIn));
    for (let k = 0; k <= CITY_N; k++) {
      const at = -usable / 2 + k * cell;
      lanes.push(
        <mesh key={`x${k}`} position={[0, 0.002, at]} scale={[lanesIn, 1, 1]} material={glow(TECH.cyan, op)}>
          <boxGeometry args={[usable, 0.003, laneW]} />
        </mesh>,
        <mesh key={`z${k}`} position={[at, 0.002, 0]} scale={[1, 1, lanesIn]} material={glow(k % 3 === 0 ? TECH.violet : TECH.cyan, op)}>
          <boxGeometry args={[laneW, 0.003, usable]} />
        </mesh>,
      );
      // light travelling along some lanes, like traffic seen from a plane
      if (k % 2 === 1) {
        const speed = 0.012 + rnd(`${seed}-s`, k) * 0.01;
        const u = (((frame - riseAt) * speed + rnd(`${seed}-o`, k)) % 1 + 1) % 1;
        const along = -usable / 2 + u * usable;
        const v = (((frame - riseAt) * speed * 0.8 + rnd(`${seed}-p`, k)) % 1 + 1) % 1;
        const back = usable / 2 - v * usable;
        pulses.push(
          <mesh key={`px${k}`} position={[along, 0.005, at]} material={glow(TECH.white, op)}>
            <boxGeometry args={[cell * 0.35, 0.006, laneW * 1.4]} />
          </mesh>,
          <mesh key={`pz${k}`} position={[at, 0.005, back]} material={glow(TECH.amber, op)}>
            <boxGeometry args={[laneW * 1.4, 0.006, cell * 0.35]} />
          </mesh>,
        );
      }
    }
  }
  return (
    <group position={position}>
      {lanes}
      {pulses}
      {blocks}
    </group>
  );
};

// ---------------------------------------------------------------------- the beat

const DIE = 2.6;
const THICK = 0.1;
const BOARD_T = 0.12;
const REST_Y = BOARD_T + THICK / 2;
const LIFT_Y = 1.4;
const TOP = LIFT_Y + THICK / 2;

/** A rainbow sheen running over the die's top: strips whose hue shifts, lit by a band that sweeps across. */
const Sheen: React.FC<{ frame: number; from: number; until: number }> = ({ frame, from, until }) => {
  const env = cue(frame, from, 8) * (1 - cue(frame, until, 14));
  if (env <= 0.01) return null;
  const n = 12, w = (DIE * 0.97) / n;
  const phase = (((frame - from) / 42) % 1 + 1) % 1;
  const centre = (-0.75 + phase * 1.5) * DIE;
  return (
    <group position={[0, THICK / 2 + 0.004, 0]}>
      {Array.from({ length: n }, (_, i) => {
        const x = -DIE * 0.485 + (i + 0.5) * w;
        const o = Math.max(0, 1 - Math.abs(x - centre) / (DIE * 0.32)) * env;
        if (o <= 0.01) return null;
        const hue = Math.round((i * 26 + frame * 4) % 360);
        return (
          <mesh key={i} position={[x, 0, 0]} rotation-x={-Math.PI / 2} renderOrder={3}>
            <planeGeometry args={[w * 1.02, DIE * 0.97]} />
            <meshBasicMaterial color={`hsl(${hue}, 90%, 62%)`} transparent opacity={0.55 * o} toneMapped={false} depthWrite={false} blending={ADDITIVE} />
          </mesh>
        );
      })}
    </group>
  );
};

const City: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const where = m.at("where", 6);
  const lift = m.at("lift", 40);
  const silicon = m.at("silicon", 58);
  const zoom = m.at("zoom", 82);
  const city = m.at("city", 128);
  const plane = m.at("plane", 152);
  const night = m.at("night", 140);   // "at night": the lanes of light flare once
  const end = Math.max(m.end, plane + 24);

  // the die: a glint on "where", lifts off tilted on "lift", turns flat on "silicon"
  const up = cue(f, lift, 22, Easing.out(Easing.cubic));
  const flat = cue(f, silicon, 16, Easing.inOut(Easing.cubic));
  const dieY = REST_Y + (LIFT_Y - REST_Y) * up;
  const tilt = 0.32 * up * (1 - flat);
  const spin = 0.35 * up * (1 - flat);
  const lit = 0.35 + 0.35 * cue(f, where, 10) - 0.2 * cue(f, city, 16) + 0.35 * m.pulse(night, 12);

  // the camera: medium on the board, follows the lift, top-down on silicon, dives on zoom, pulls up to
  // a wide over the city, then glides over it like a plane
  const P1: V3 = [-0.15, 3.3, 3.4];
  const lookDir: V3 = [0, -0.45, -1];
  const ln = Math.hypot(lookDir[0], lookDir[1], lookDir[2]);
  const back: V3 = [-lookDir[0] / ln, -lookDir[1] / ln, -lookDir[2] / ln];
  const L1: V3 = [P1[0] - back[0] * 3, P1[1] - back[1] * 3, P1[2] - back[2] * 3];
  const keys: CamKey[] = [
    ...direct(p.beat.events, [
      { at: 0, move: "push", look: [0, 0.3, 0], dir: [0, 1, 0.62], from: 9, to: 8, dur: Math.max(12, lift), fov: 40 },
      { at: lift, move: "push", look: [0, 1.1, 0], dir: [0, 1, 0.5], to: 6.2, dur: Math.max(12, silicon - lift + 8) },
      { at: silicon, move: "push", look: [0, LIFT_Y, 0], dir: [0.08, 1, 0.24], to: 5.0, dur: Math.max(10, zoom - silicon) },
      { at: zoom, move: "dive", look: [0.25, TOP, 0.2], dir: [0, 1, 0.42], to: 1.0, dur: 22, fov: 38 },
      { at: zoom + 22, move: "push", look: [0.25, TOP, 0.2], dir: [0, 1, 0.42], to: 0.85, dur: Math.max(10, city - zoom - 22) },
      { at: city, move: "pullback", look: L1, dir: back, to: 3, dur: Math.max(14, plane - city), fov: 42 },
    ]),
    ...moves.dolly(Math.max(city + 14, plane), end + 12, P1, [0.25, 2.45, 0.9], lookDir, 42, Easing.inOut(Easing.sin)),
  ];

  // fog closes in over the city (a plane at night)
  const fk = cue(f, city, 24);
  const fog = { near: Math.round((30 - 27.5 * fk) * 2) / 2, far: Math.round((80 - 71 * fk) * 2) / 2 };
  const focus: V3 = f < city ? [0, dieY, 0] : [0, TOP, -0.2];

  return (
    <Freeze frame={f}>
      <Stage3D backdrop="void" floor="reflect" bloom={0.9} dof={2.5} blur={1} shadowBox={4} fog={fog}
       >
        <Camera3D keys={keys} seed="v02-city" />
        <Focus at={focus} range={f < city ? 2.4 : 2.8} />
        <Board size={[6.4, 4.6]} thick={BOARD_T} seed="v02-board" parts={150} position={[0, BOARD_T / 2, 0]} avoid={[[0, 0, 3.1, 3.1]]} />
        {/* the die's empty seat, left behind on the board */}
        <Block size={[DIE * 1.04, 0.012, DIE * 1.04]} radius={0.004} preset="glossy" position={[0, BOARD_T + 0.006, 0]} />
        <group position={[0, dieY, 0]} rotation={[tilt, spin, tilt * 0.4]}>
          <Die size={DIE} thick={THICK} lit={lit} seed="v02-die" cores={[3, 4]} />
          <Sheen frame={f} from={silicon} until={city} />
          <DieCity size={DIE} frame={f} riseAt={city} position={[0, THICK / 2, 0]} />
        </group>
      </Stage3D>
    </Freeze>
  );
};

export default City;
