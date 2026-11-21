// The Lac-Mégantic promo Short's shared world (Night Grid look: lit physical materials on a dark stage):
//   - Loco: a freight diesel (long hood, cab with a lamp and an empty seat, two three-axle trucks, headlight);
//   - TankCar: a black crude-oil tank car (rounded heads, top fittings, sill, trucks, end platform with the
//     hand brake wheel; `brake` 0..1 glows the wheel amber, `hot` lights the brake shoes);
//   - Consist: the locomotive and the tank cars on one line, rolling `travelled` units, per-vehicle poses
//     for the derailment;
//   - Line: the main line (rails, sleepers, ballast), a dark grass verge, trees, the town's lights far off;
//   - Town: houses and shops round the curve in the town centre, windows lit;
//   - Flames: a seeded flicker of glowing tongues (no texture), for the engine fire and the derailment;
//   - Shot3D / Flat: the beat wrappers (one stage, the look, the honesty tag, the grain).
// Machines and places only, never people. Every figure comes from the beat's params.
import React from "react";
import { AbsoluteFill, Freeze, random } from "remotion";
import { DisasterStage, glow, rampColor, Track, useDLook, type V3 } from "../../three/index";
import { DisasterLookProvider, LookBackground, Texture, useDisasterLook, HonestyTag as FlatTag } from "../../disaster/index";

export const RECIPE = "night-grid" as const;
export const MONO = "'Courier Prime', 'Courier New', monospace";
export const ANTON = "Anton, Poppins, sans-serif";
export const AMBER = "#ff9a3c", RED = "#ff3b30", CREAM = "#f4efe7";

const sh = { castShadow: true, receiveShadow: true } as const;
export const k01 = (x: number) => Math.max(0, Math.min(1, x));
export const sm = (x: number) => { const c = k01(x); return c * c * (3 - 2 * c); };
const q = (x: number, n = 10) => Math.round(x * n) / n;

/** The video's materials, from the look's painter (cached there): paint, steel, glass, lamps. */
export function useMats() {
  const { paint } = useDLook();
  return {
    black: paint("body", "#16171a"), grime: paint("dark", "#2a2622"), steel: paint("metal", "#8a8f96"), dark: paint("dark", "#1c1d20"),
    red: paint("body", "#8e1b17"), grey: paint("body", "#3a3d42"), yellow: paint("body", "#e8b514"), glass: paint("glass", "#0e1620"),
    seat: paint("rubber", "#2b3b52"), cabin: paint("steel", "#5b6168"), grass: paint("ground", "#1c2a1e"), pine: paint("ground", "#14261b"),
    ballast: paint("concrete", "#4b4741"), roof: paint("steel", "#2b2b30"), wall: (c: string) => paint("concrete", c), paint,
    lamp: (c: string, s = 1) => (s < 0.08 ? paint("dark", "#202124") : glow(c, Math.min(1, s))),
  };
}

/** A box or cylinder in the brake ramp: dark iron → amber → red (red only for the failure). */
export const RampMat: React.FC<{ v: number }> = ({ v }) => {
  const s = q(k01(v), 12);
  const c = `#${rampColor(s).getHexString()}`;
  return <meshPhysicalMaterial attach="material" color={s <= 0 ? "#2a2c30" : c} roughness={0.5} metalness={0.5} emissive={c} emissiveIntensity={s <= 0 ? 0 : 0.3 + s * 1.6} />;
};

// ---------------------------------------------------------------- running gear

export const WHEEL_R = 0.12, GAUGE = 0.36;

const Wheelset: React.FC<{ x: number; spin: number; hot?: number }> = ({ x, spin, hot = 0 }) => {
  const M = useMats();
  return (
  <group position={[x, WHEEL_R + 0.06, 0]}>
    {[-1, 1].map((s) => (
      <group key={s} position={[0, 0, s * (GAUGE / 2 + 0.02)]}>
        <mesh rotation-x={Math.PI / 2} rotation-y={spin} material={M.steel} {...sh}><cylinderGeometry args={[WHEEL_R, WHEEL_R, 0.045, 18]} /></mesh>
        <mesh rotation-x={Math.PI / 2} position={[0, 0, -s * 0.03]} material={M.dark}><cylinderGeometry args={[WHEEL_R * 1.1, WHEEL_R * 1.1, 0.015, 18]} /></mesh>
        {/* the brake shoe on the tread */}
        <mesh position={[WHEEL_R + 0.03, 0, 0]} ><boxGeometry args={[0.04, 0.12, 0.05]} /><RampMat v={hot} /></mesh>
      </group>
    ))}
    <mesh rotation-x={Math.PI / 2} material={M.steel}><cylinderGeometry args={[0.025, 0.025, GAUGE + 0.12, 8]} /></mesh>
  </group>
  );
};

/** A freight truck (bogie): side frames, a bolster, `axles` wheelsets. */
const Truck: React.FC<{ x: number; axles?: 2 | 3; spin: number; hot?: number }> = ({ x, axles = 2, spin, hot = 0 }) => {
  const M = useMats();
  const pitch = 0.3, xs = axles === 3 ? [-pitch, 0, pitch] : [-pitch / 2, pitch / 2];
  const len = axles === 3 ? 0.95 : 0.62;
  return (
    <group position={[x, 0, 0]}>
      {xs.map((dx, i) => <Wheelset key={i} x={dx} spin={spin + i} hot={hot} />)}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, WHEEL_R + 0.08, s * (GAUGE / 2 + 0.07)]} material={M.grime} {...sh}><boxGeometry args={[len, 0.1, 0.04]} /></mesh>
      ))}
      <mesh position={[0, WHEEL_R + 0.16, 0]} material={M.grime} {...sh}><boxGeometry args={[0.16, 0.08, GAUGE + 0.2]} /></mesh>
    </group>
  );
};

// ---------------------------------------------------------------- the tank car

export const CAR_LEN = 3.0, TANK_R = 0.36, TANK_Y = 0.78;

export type TankCarProps = { spin?: number; brake?: number; hot?: number; wheelTurn?: number; label?: boolean };

/** A crude-oil tank car, front (+x) end carrying the hand brake platform. */
export const TankCar: React.FC<TankCarProps> = ({ spin = 0, brake = 0, hot = 0, wheelTurn = 0 }) => {
  const M = useMats();
  const tankLen = CAR_LEN - 0.5;
  return (
    <group>
      {/* the tank: a cylinder with rounded heads */}
      <mesh position={[0, TANK_Y, 0]} rotation-z={Math.PI / 2} material={M.black} {...sh}><cylinderGeometry args={[TANK_R, TANK_R, tankLen, 28]} /></mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * tankLen / 2, TANK_Y, 0]} scale={[0.42, 1, 1]} material={M.black} {...sh}><sphereGeometry args={[TANK_R, 24, 16]} /></mesh>
      ))}
      {/* weld seams (rings) and the reflective strips */}
      {[-0.8, 0, 0.8].map((x) => (
        <mesh key={x} position={[x, TANK_Y, 0]} rotation-z={Math.PI / 2} material={M.grime}><torusGeometry args={[TANK_R + 0.004, 0.006, 6, 36]} /></mesh>
      ))}
      {[-0.5, 0.5].map((x) => [-1, 1].map((s) => (
        <mesh key={`${x}${s}`} position={[x, TANK_Y - 0.05, s * (TANK_R - 0.005)]} material={M.yellow}><boxGeometry args={[0.22, 0.05, 0.01]} /></mesh>
      )))}
      {/* the hazard placard on each side (a plain red diamond) */}
      {[-1, 1].map((s) => (
        <mesh key={`pl${s}`} position={[tankLen / 2 - 0.25, TANK_Y + 0.05, s * (TANK_R + 0.002)]} rotation={[0, s > 0 ? 0 : Math.PI, Math.PI / 4]} material={M.lamp("#b3261e", 0.7)}>
          <planeGeometry args={[0.13, 0.13]} />
        </mesh>
      ))}
      {/* top fittings: the dome and its walkway */}
      <mesh position={[0, TANK_Y + TANK_R + 0.04, 0]} material={M.grime} {...sh}><cylinderGeometry args={[0.1, 0.12, 0.1, 16]} /></mesh>
      <mesh position={[0, TANK_Y + TANK_R + 0.02, 0]} material={M.dark}><boxGeometry args={[0.5, 0.02, 0.3]} /></mesh>
      {/* the centre sill and the bolsters */}
      <mesh position={[0, 0.36, 0]} material={M.grime} {...sh}><boxGeometry args={[CAR_LEN - 0.1, 0.1, 0.14]} /></mesh>
      {[-1, 1].map((s) => (
        <mesh key={`b${s}`} position={[s * (CAR_LEN / 2 - 0.45), 0.42, 0]} material={M.grime}><boxGeometry args={[0.12, 0.1, 0.62]} /></mesh>
      ))}
      {/* the end platform and the hand brake wheel (front end) */}
      <mesh position={[CAR_LEN / 2 - 0.08, 0.42, 0]} material={M.dark}><boxGeometry args={[0.16, 0.03, 0.66]} /></mesh>
      <group position={[CAR_LEN / 2 - 0.12, 0.98, 0.18]} rotation-y={Math.PI / 2}>
        <mesh rotation-z={wheelTurn}><torusGeometry args={[0.1, 0.012, 8, 28]} /><RampMat v={brake * 0.55} /></mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation-z={wheelTurn + (i * Math.PI) / 3} material={M.steel}><boxGeometry args={[0.2, 0.01, 0.01]} /></mesh>
        ))}
        <mesh position={[0, -0.3, -0.02]} material={M.dark}><boxGeometry args={[0.02, 0.6, 0.02]} /></mesh>
      </group>
      {/* the coupler */}
      {[-1, 1].map((s) => (
        <mesh key={`c${s}`} position={[s * (CAR_LEN / 2 + 0.02), 0.36, 0]} material={M.dark}><boxGeometry args={[0.12, 0.08, 0.1]} /></mesh>
      ))}
      <Truck x={-(CAR_LEN / 2 - 0.45)} spin={spin} hot={hot} />
      <Truck x={CAR_LEN / 2 - 0.45} spin={spin + 0.7} hot={hot} />
    </group>
  );
};

// ---------------------------------------------------------------- the locomotive

export const LOCO_LEN = 3.6;
/** where the cab is (local to the loco): its window and the driver's seat */
export const CAB: V3 = [LOCO_LEN / 2 - 0.62, 1.12, 0];

export type LocoProps = { spin?: number; lamp?: number; head?: number; hood?: number; hot?: number };

/** A freight diesel: long hood behind, the cab and short nose at the front (+x). `lamp` lights the cab,
 * `head` the headlight, `hood` 0..1 opens a glow at the engine hatch (the fire). */
export const Loco: React.FC<LocoProps> = ({ spin = 0, lamp: cabLamp = 1, head = 1, hot = 0 }) => {
  const M = useMats();
  const hoodLen = LOCO_LEN - 1.3;
  return (
    <group>
      {/* the frame and walkway */}
      <mesh position={[0, 0.42, 0]} material={M.dark} {...sh}><boxGeometry args={[LOCO_LEN, 0.08, 0.8]} /></mesh>
      <mesh position={[0, 0.36, 0.41]} material={M.yellow}><boxGeometry args={[LOCO_LEN, 0.04, 0.01]} /></mesh>
      <mesh position={[0, 0.36, -0.41]} material={M.yellow}><boxGeometry args={[LOCO_LEN, 0.04, 0.01]} /></mesh>
      {/* the long hood */}
      <mesh position={[-LOCO_LEN / 2 + hoodLen / 2 + 0.1, 0.8, 0]} material={M.red} {...sh}><boxGeometry args={[hoodLen, 0.68, 0.56]} /></mesh>
      {Array.from({ length: 6 }, (_, i) => (
        [-1, 1].map((s) => (
          <mesh key={`d${i}${s}`} position={[-LOCO_LEN / 2 + 0.35 + i * 0.36, 0.82, s * 0.281]} material={M.grey}><boxGeometry args={[0.22, 0.5, 0.005]} /></mesh>
        ))
      ))}
      {/* radiator fans and the exhaust stack on top */}
      {[0, 1].map((i) => (
        <mesh key={`f${i}`} position={[-LOCO_LEN / 2 + 0.4 + i * 0.42, 1.15, 0]} material={M.dark}><cylinderGeometry args={[0.15, 0.15, 0.03, 20]} /></mesh>
      ))}
      <mesh position={[-0.05, 1.2, 0]} material={M.dark}><boxGeometry args={[0.22, 0.1, 0.12]} /></mesh>
      {/* the engine hatch: hot glow from inside when it burns */}
      <mesh position={[-0.05, 1.145, 0]} material={M.lamp("#ff7a1a", hot > 0 ? 0.4 + hot : 0)}><boxGeometry args={[0.5, 0.012, 0.3]} /></mesh>
      {/* the cab */}
      <group position={[LOCO_LEN / 2 - 0.62, 0, 0]}>
        <mesh position={[0, 0.98, 0]} material={M.red} {...sh}><boxGeometry args={[0.62, 1.0, 0.8]} /></mesh>
        <mesh position={[0, 1.5, 0]} material={M.grey} {...sh}><boxGeometry args={[0.68, 0.05, 0.86]} /></mesh>
        {/* windows: front and sides, glass over a lit interior */}
        <mesh position={[0.312, 1.2, 0]} material={M.glass}><boxGeometry args={[0.01, 0.32, 0.68]} /></mesh>
        {[-1, 1].map((s) => (
          <mesh key={`w${s}`} position={[0.05, 1.2, s * 0.401]} material={M.glass}><boxGeometry args={[0.36, 0.3, 0.01]} /></mesh>
        ))}
        {/* inside: the control stand and the empty seat, lit by the cab lamp */}
        <mesh position={[0.18, 0.95, 0.18]} material={M.cabin}><boxGeometry args={[0.14, 0.3, 0.2]} /></mesh>
        <mesh position={[-0.05, 0.86, 0.18]} material={M.seat}><boxGeometry args={[0.18, 0.06, 0.18]} /></mesh>
        <mesh position={[-0.14, 1.0, 0.18]} material={M.seat}><boxGeometry args={[0.04, 0.26, 0.18]} /></mesh>
        <mesh position={[0, 1.44, 0]} material={M.lamp("#ffd9a0", cabLamp)}><sphereGeometry args={[0.035, 10, 8]} /></mesh>
        {cabLamp > 0.05 ? <pointLight position={[0, 1.36, 0]} intensity={0.9 * cabLamp} distance={1.6} color="#ffd29a" /> : null}
      </group>
      {/* detail: walkway handrails and stanchions, steps, sand boxes, horn, roof curve, door seams */}
      {[-1, 1].map((sd) => (
        <group key={`hr${sd}`}>
          <mesh position={[-0.35, 0.72, sd * 0.38]} rotation-z={Math.PI / 2} material={M.yellow}><cylinderGeometry args={[0.012, 0.012, LOCO_LEN - 1.1, 6]} /></mesh>
          {Array.from({ length: 7 }, (_, i) => (
            <mesh key={i} position={[-LOCO_LEN / 2 + 0.2 + i * 0.4, 0.58, sd * 0.38]} material={M.yellow}><cylinderGeometry args={[0.009, 0.009, 0.3, 5]} /></mesh>
          ))}
          {[-1, 1].map((e) => (
            <group key={e} position={[e * (LOCO_LEN / 2 - 0.12), 0.25, sd * 0.36]}>
              {[0, 1, 2].map((st) => <mesh key={st} position={[0, -st * 0.07, 0]} material={M.yellow}><boxGeometry args={[0.16, 0.012, 0.08]} /></mesh>)}
            </group>
          ))}
          <mesh position={[LOCO_LEN / 2 - 1.05, 0.5, sd * 0.36]} material={M.grime}><boxGeometry args={[0.3, 0.12, 0.06]} /></mesh>
          <mesh position={[0.6, 0.55, sd * 0.3]} material={M.grime}><boxGeometry args={[1.2, 0.2, 0.04]} /></mesh>
        </group>
      ))}
      <mesh position={[-LOCO_LEN / 2 + hoodLen / 2 + 0.1, 1.14, 0]} rotation-z={Math.PI / 2} scale={[1, 1, 0.5]} material={M.red}><cylinderGeometry args={[0.28, 0.28, hoodLen, 20, 1, false, 0, Math.PI]} /></mesh>
      <group position={[LOCO_LEN / 2 - 0.5, 1.58, 0]}>
        {[-0.06, 0, 0.06].map((z, i) => <mesh key={i} position={[0, 0, z]} rotation-z={Math.PI / 2} material={M.steel}><cylinderGeometry args={[0.02, 0.03, 0.14 + i * 0.03, 8]} /></mesh>)}
      </group>
      <mesh position={[-1.8, 0.88, 0]} material={M.grey}><boxGeometry args={[0.03, 0.66, 0.565]} /></mesh>
      {/* the short nose and the headlight */}
      <mesh position={[LOCO_LEN / 2 - 0.12, 0.72, 0]} material={M.red} {...sh}><boxGeometry args={[0.22, 0.52, 0.6]} /></mesh>
      <mesh position={[LOCO_LEN / 2 - 0.0, 0.8, 0]} material={M.yellow}><boxGeometry args={[0.012, 0.08, 0.6]} /></mesh>
      {[-0.1, 0.1].map((z) => (
        <mesh key={z} position={[LOCO_LEN / 2 + 0.005, 0.94, z]} rotation-z={Math.PI / 2} material={M.lamp("#fff2d0", head)}><cylinderGeometry args={[0.045, 0.045, 0.02, 14]} /></mesh>
      ))}
      {head > 0.05 ? <spotLight position={[LOCO_LEN / 2 + 0.1, 0.94, 0]} target-position={[LOCO_LEN / 2 + 8, 0, 0]} angle={0.45} penumbra={0.6} intensity={6 * head} distance={14} color="#fff0c8" /> : null}
      <mesh position={[LOCO_LEN / 2 + 0.1, 0.4, 0]} material={M.dark}><boxGeometry args={[0.1, 0.16, 0.7]} /></mesh>
      <Truck x={-LOCO_LEN / 2 + 0.7} axles={3} spin={spin} hot={hot > 0 ? 0 : 0} />
      <Truck x={LOCO_LEN / 2 - 0.75} axles={3} spin={spin + 1} />
    </group>
  );
};

// ---------------------------------------------------------------- the consist

export type Pose = { dx?: number; dy?: number; dz?: number; yaw?: number; roll?: number; pitch?: number };
export const GAP = 0.14;
/** x of vehicle i's centre (0 = the locomotive) with the train's front at x=0 */
export const vehX = (i: number) => (i === 0 ? -LOCO_LEN / 2 : -LOCO_LEN - GAP - (i - 1) * (CAR_LEN + GAP) - CAR_LEN / 2);

export type ConsistProps = {
  cars?: number;
  travelled?: number;
  loco?: LocoProps;
  /** hand brake glow per car index (1-based) */
  brakes?: Record<number, number>;
  hot?: number;
  poses?: Record<number, Pose>;
  /** hand brake wheel turn per car */
  turn?: Record<number, number>;
};

export const Consist: React.FC<ConsistProps> = ({ cars = 10, travelled = 0, loco = {}, brakes = {}, hot = 0, poses = {}, turn = {} }) => {
  const spin = travelled / WHEEL_R;
  return (
    <group position={[travelled, 0, 0]}>
      {Array.from({ length: cars + 1 }, (_, i) => {
        const p = poses[i] ?? {};
        return (
          <group key={i} position={[vehX(i) + (p.dx ?? 0), p.dy ?? 0, p.dz ?? 0]} rotation={[p.roll ?? 0, p.yaw ?? 0, p.pitch ?? 0]}>
            {i === 0 ? <Loco spin={spin} {...loco} /> : <TankCar spin={spin + i} brake={brakes[i] ?? 0} hot={hot} wheelTurn={turn[i] ?? 0} />}
          </group>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- the line, the land, the lights


/** Trees along both sides of the line: seeded cones. */
export const Trees: React.FC<{ from: number; to: number; seed: string; near?: number; far?: number; clear?: [number, number] }> = ({ from, to, seed, near = 2.2, far = 9, clear }) => {
  const M = useMats();
  const n = Math.round((to - from) * 1.1);
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const x = from + (to - from) * random(`${seed}x${i}`);
        const side = random(`${seed}s${i}`) > 0.5 ? 1 : -1;
        const z = side * (near + (far - near) * random(`${seed}z${i}`));
        const h = 1.2 + 1.6 * random(`${seed}h${i}`);
        if (clear && z > 0 && x > clear[0] && x < clear[1]) return null;
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, h * 0.55, 0]} material={M.pine} castShadow><coneGeometry args={[h * 0.28, h, 7]} /></mesh>
            <mesh position={[0, h * 0.12, 0]} material={M.grime}><cylinderGeometry args={[0.04, 0.05, h * 0.25, 5]} /></mesh>
          </group>
        );
      })}
    </group>
  );
};

/** Distant lit windows (the town at the bottom of the grade): a field of small warm points. */
export const TownLights: React.FC<{ at: V3; spread?: [number, number]; n?: number; seed?: string; k?: number }> = ({ at, spread = [16, 6], n = 90, seed = "town", k = 1 }) => {
  const M = useMats();
  return (
  <group position={at}>
    {Array.from({ length: n }, (_, i) => {
      const x = (random(`${seed}a${i}`) - 0.5) * spread[0], z = (random(`${seed}b${i}`) - 0.5) * spread[1];
      const y = 0.1 + random(`${seed}c${i}`) * 0.5;
      const warm = random(`${seed}d${i}`) > 0.25 ? "#ffc878" : "#cfe3ff";
      return (
        <mesh key={i} position={[x, y, z]} material={M.lamp(warm, k * (0.6 + 0.6 * random(`${seed}e${i}`)))}><sphereGeometry args={[0.05, 6, 4]} /></mesh>
      );
    })}
  </group>
  );
};

/** The main line along x with its verge. */
export const Line: React.FC<{ length?: number; x?: number }> = ({ length = 80, x = 0 }) => {
  const M = useMats();
  return (
  <group>
    <mesh rotation-x={-Math.PI / 2} position={[x, -0.05, 0]} material={M.grass} receiveShadow><planeGeometry args={[length + 40, 40]} /></mesh>
    <mesh position={[x, -0.03, 0]} material={M.ballast} receiveShadow><boxGeometry args={[length, 0.05, 1.6]} /></mesh>
    <Track length={length} position={[x, 0, 0]} />
  </group>
  );
};

/** A house or shop: walls, a pitched roof, lit windows. */
const House: React.FC<{ p: V3; w: number; d: number; h: number; yaw?: number; seed: string; k?: number; color?: string }> = ({ p, w, d, h, yaw = 0, seed, k = 1, color = "#6d5f55" }) => {
  const M = useMats();
  return (
  <group position={p} rotation-y={yaw}>
    <mesh position={[0, h / 2, 0]} material={M.wall(color)} {...sh}><boxGeometry args={[w, h, d]} /></mesh>
    <mesh position={[0, h + 0.22, 0]} rotation-y={Math.PI / 4} scale={[w * 0.75, 1, d * 0.75]} material={M.roof} castShadow>
      <coneGeometry args={[1, 0.45, 4]} />
    </mesh>
    {/* a door with a step, a chimney, eaves and the siding's courses */}
    <mesh position={[w * 0.3, 0.32, d / 2 + 0.01]} material={M.paint("body", "#3b2a22")}><boxGeometry args={[0.2, 0.62, 0.02]} /></mesh>
    <mesh position={[w * 0.3, 0.03, d / 2 + 0.1]} material={M.ballast}><boxGeometry args={[0.34, 0.06, 0.2]} /></mesh>
    <mesh position={[-w * 0.25, h + 0.4, -d * 0.1]} material={M.paint("concrete", "#6a4636")} castShadow><boxGeometry args={[0.14, 0.5, 0.14]} /></mesh>
    <mesh position={[0, h + 0.01, 0]} material={M.roof}><boxGeometry args={[w + 0.14, 0.04, d + 0.14]} /></mesh>
    {Array.from({ length: Math.floor(h / 0.18) }, (_, i) => (
      <mesh key={`sd${i}`} position={[0, 0.12 + i * 0.18, d / 2 + 0.003]} material={M.wall("#3d362f")}><boxGeometry args={[w, 0.012, 0.004]} /></mesh>
    ))}
    {Array.from({ length: Math.max(1, Math.floor(w / 0.5)) }, (_, i) => [0, 1].map((r) => (
      r * 0.6 + 0.5 < h ? (
        <mesh key={`${i}${r}`} position={[-w / 2 + 0.3 + i * 0.5, 0.4 + r * 0.6, d / 2 + 0.005]} material={M.lamp(random(`${seed}${i}${r}`) > 0.3 ? "#ffcc80" : "#3a3328", k * 0.9)}>
          <planeGeometry args={[0.22, 0.28]} />
        </mesh>
      ) : null
    )))}
  </group>
  );
};

/** The town centre round the line: rows of houses and shops on both sides. */
export const Town: React.FC<{ x0: number; x1: number; k?: number; gap?: [number, number] }> = ({ x0, x1, k = 1, gap }) => {
  const n = Math.round((x1 - x0) / 1.3);
  const cols = ["#6d5f55", "#7a6a5a", "#5a6470", "#83705f", "#5d5a66"];
  return (
    <group>
      {Array.from({ length: n }, (_, i) => [-1, 1].map((s) => {
        const x = x0 + i * 1.3 + random(`tx${i}${s}`) * 0.3;
        const h = 1.1 + random(`th${i}${s}`) * 1.0;
        if (s > 0 && gap && x > gap[0] && x < gap[1]) return null;
        return <House key={`${i}${s}`} seed={`h${i}${s}`} p={[x, 0, s * (2.6 + random(`tz${i}${s}`) * 0.8)]} w={1.0} d={0.9} h={h} yaw={s > 0 ? Math.PI : 0} k={k} color={cols[(i + (s > 0 ? 2 : 0)) % cols.length]} />;
      }))}
    </group>
  );
};

/** Flickering flame tongues (glowing cones), seeded; `k` 0..1 how strong. */
export const Flames: React.FC<{ at: V3; t: number; k: number; n?: number; size?: number; spread?: number; seed?: string }> = ({ at, t, k, n = 9, size = 0.5, spread = 0.25, seed = "fl" }) => {
  if (k <= 0.02) return null;
  return (
    <group position={at}>
      {Array.from({ length: n }, (_, i) => {
        const ph = random(`${seed}p${i}`) * 6.28;
        const fl = 0.7 + 0.3 * Math.sin(t * 0.55 + ph) + 0.15 * Math.sin(t * 1.3 + ph * 2);
        const h = size * k * fl * (0.6 + 0.6 * random(`${seed}h${i}`));
        const x = (random(`${seed}x${i}`) - 0.5) * spread * 2, z = (random(`${seed}z${i}`) - 0.5) * spread * 2;
        return (
          <group key={i} position={[x, h / 2, z]}>
            <mesh material={glow(i % 3 === 0 ? "#ffb84a" : "#ff5a12", 0.45)}><coneGeometry args={[size * 0.1 * k, h, 7]} /></mesh>
          </group>
        );
      })}
      <pointLight position={[0, size * 0.6, 0]} intensity={4 * k * (0.85 + 0.15 * Math.sin(t * 0.9))} distance={7} color="#ff8a3a" />
    </group>
  );
};

// ---------------------------------------------------------------- wrappers

/** Night mist drifting over a 3D shot: coarse fractal noise, screen-blended, so the dark sky and fields
 * have air in them instead of one flat colour. Seeded and a pure function of the frame. */
export const Mist: React.FC<{ f: number; k?: number }> = ({ f, k = 1 }) => (
  <svg data-probe="skip" viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: 0.55 * k }}>
    <defs>
      <filter id="lm-mist" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.0045 0.009" numOctaves={3} seed={11} />
        <feColorMatrix values="0 0 0 0 0.42  0 0 0 0 0.52  0 0 0 0 0.68  0 0 0 0.9 -0.18" />
      </filter>
    </defs>
    <rect x={-300 + ((f * 0.8) % 300)} y={0} width={1680} height={1920} filter="url(#lm-mist)" />
  </svg>
);

/** A 3D beat: the beat's frame frozen into the stage, the Night Grid look, the honesty tag and any overlay. */
export const Shot3D: React.FC<{ f: number; children: React.ReactNode; overlay?: React.ReactNode; tag?: "reconstruction" | "paused"; dof?: number; fog?: { color?: string; near: number; far: number }; floor?: boolean }> = ({
  f, children, overlay, tag = "reconstruction", dof = 1, fog, floor = false,
}) => (
  <Freeze frame={f}>
    <DisasterStage look="nightGrid" dof={dof} shadowBox={10} floor={floor ? "reflect" : false} fog={fog ?? { color: "#07101a", near: 10, far: 48 }}
      overlay={<DisasterLookProvider value={RECIPE}><AbsoluteFill style={{ pointerEvents: "none" }}><Mist f={f} />{overlay}<FlatTag t={f} tag={tag} at={0} /></AbsoluteFill></DisasterLookProvider>}>
      <ambientLight intensity={0.22} color="#6f86b0" />
      <directionalLight position={[-6, 9, 5]} intensity={0.55} color="#9fb6e0" />
      {children}
    </DisasterStage>
  </Freeze>
);

/** A flat or doc beat in the video's look: the backdrop, the drawing, the grain and an honesty tag. */
export const Flat: React.FC<{ t: number; children: React.ReactNode; html?: React.ReactNode; tag?: string }> = ({ t, children, html, tag = "principle" }) => (
  <DisasterLookProvider value={RECIPE}>
    <AbsoluteFill>
      <LookBackground />
      <svg data-probe="skip" viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 19 }, (_, i) => <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={1920} stroke="rgba(120,170,230,0.22)" strokeWidth={i % 5 === 0 ? 7 : 4} />)}
        {Array.from({ length: 33 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 60} x2={1080} y2={i * 60} stroke="rgba(120,170,230,0.22)" strokeWidth={i % 5 === 0 ? 7 : 4} />)}
      </svg>
      <Mist f={t} k={0.6} />
      {children}
      {html}
      <Texture t={t} />
      {tag ? <FlatTag t={t} tag={tag} at={0} /> : null}
    </AbsoluteFill>
  </DisasterLookProvider>
);

export const useLook = () => useDisasterLook(RECIPE);

/** The dated mono caption (place · date), typing on, with an optional big title. */
export const DateCaption: React.FC<{ t: number; at: number; line: string; title?: string; titleAt?: number; top?: number }> = ({ t, at, line, title, titleAt, top = 300 }) => {
  const n = t < at ? 0 : Math.max(at <= 0 ? line.length : 0, Math.floor((t - at) * 1.8));
  const nt = title ? (titleAt !== undefined && titleAt < 0 ? title.length : Math.max(0, Math.floor((t - (titleAt ?? at)) * 2.2))) : 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", pointerEvents: "none" }}>
      {title ? <div style={{ fontFamily: ANTON, fontSize: 104, color: CREAM, letterSpacing: 2, textShadow: "0 6px 24px rgba(0,0,0,0.7)" }}>{title.slice(0, nt)}</div> : null}
      <div style={{ display: "inline-block", marginTop: 10, fontFamily: MONO, fontWeight: 700, fontSize: 46, letterSpacing: 4, color: CREAM,
        background: "rgba(8,10,14,0.74)", padding: "8px 22px", borderLeft: `6px solid ${AMBER}` }}>{line.slice(0, n)}</div>
    </div>
  );
};

/** A big readout over a 3D shot: a figure in Anton with a mono caption under it. */
export const Readout: React.FC<{ value: string; caption: string; top?: number; k?: number; color?: string }> = ({ value, caption, top = 560, k = 1, color = CREAM }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", opacity: k, transform: `scale(${0.85 + 0.15 * k})`, pointerEvents: "none" }}>
    <div style={{ fontFamily: ANTON, fontSize: 200, lineHeight: 1, color, textShadow: "0 8px 30px rgba(0,0,0,0.75)" }}>{value}</div>
    <div style={{ display: "inline-block", marginTop: 12, fontFamily: MONO, fontWeight: 700, fontSize: 48, letterSpacing: 4, color: CREAM, background: "rgba(8,10,14,0.74)", padding: "6px 20px" }}>{caption}</div>
  </div>
);

export default Consist;
