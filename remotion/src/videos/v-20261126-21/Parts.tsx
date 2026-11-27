// Parts: the models and places this video's beats share (all procedural, nothing downloaded).
// The Airbus superjumbo (the kit's Jet as a four-engined widebody), a runway at dusk with grass, a
// classroom blackboard, a wind-tunnel test section with its wing slice, and an office at night.
// No figures here. Units: y is up; the jet's nose points +x, its left wing along +z.
import React from "react";
import { Easing } from "remotion";
import { Airfoil, Block, cue, FigLabel3D, glow, Jet, mat, rnd, type V3 } from "../../three/index";

type Group = React.JSX.IntrinsicElements["group"];

export const k01 = (f: number, a: number, d: number, e = Easing.inOut(Easing.cubic)) => cue(f, a, Math.max(1, d), e);
export const q = (x: number, n = 10) => Math.round(x * n) / n;

export const AMBER = "#ffb340";
export const CYAN = "#38e1ff";
export const LOWBLUE = "#3d8bff";

// ------------------------------------------------------------------ the superjumbo
export const JET_L = 6;
export const JET_SPAN = 0.55; // half span ÷ length
export const JET_SWEEP = 33.5;
export const JET_GIRTH = 0.115;
const r = (JET_L * JET_GIRTH) / 2;
/** the height of the jet's origin above the ground with its gear down */
export const GEAR_H = r * 1.4;
export const HALF_SPAN = JET_L * JET_SPAN;
/** a point on the left wing, u from root (0) to tip (1), in the jet's frame */
export const wingAt = (u: number, dx = 0): V3 => {
  const z = HALF_SPAN * u;
  return [JET_L * 0.075 - Math.tan((JET_SWEEP * Math.PI) / 180) * z - JET_L * 0.17 * (1 - 0.7 * u) * 0.5 + dx, -r * 0.5 + 0.07 * z, z];
};

export const SuperJumbo: React.FC<Group & { gear?: boolean }> = ({ gear = true, ...g }) => (
  <group {...g}>
    <Jet length={JET_L} sweep={JET_SWEEP} engines="underWing" perWing={2} girth={JET_GIRTH} span={JET_SPAN} windows={44} gear={gear}
      livery={{ body: "#f3f5f8", belly: "#c3cbd4", tail: "#1b3f8a", stripe: "#1b3f8a" }} />
    {/* the upper deck's window row */}
    {Array.from({ length: 26 }, (_, i) => (
      <group key={i}>
        {[1, -1].map((s) => (
          <mesh key={s} position={[JET_L * 0.22 - i * 0.13, r * 0.42, s * r * 0.9]} material={mat("blackPlastic", "#1b2433")}>
            <boxGeometry args={[0.05, 0.05, 0.02]} />
          </mesh>
        ))}
      </group>
    ))}
    {/* the maker's name painted on both sides of the fuselage (the Commons wordmark could not be fetched: 429) */}
    <FigLabel3D fig="AIRBUS" at={[JET_L * 0.12, r * 0.15, r + 0.012]} face="front" height={0.26} start={-20} count={0} plate={false} color="#16357a" />
    <mesh position={wingAt(1)} material={glow("#ff3b3b")}><sphereGeometry args={[0.04, 10, 10]} /></mesh>
    <mesh position={[wingAt(1)[0], wingAt(1)[1], -wingAt(1)[2]]} material={glow("#3bff6a")}><sphereGeometry args={[0.04, 10, 10]} /></mesh>
  </group>
);

// ------------------------------------------------------------------ runway at dusk
export const Runway: React.FC<Group & { len?: number; offset?: number; grassBend?: number; seed?: string }> = ({ len = 80, offset = 0, grassBend = 0, seed = "rw", ...g }) => {
  const W = 3.2;
  const wrap = (x: number, span: number) => (((x % span) + span) % span) - span / 2;
  return (
    <group {...g}>
      <mesh rotation-x={-Math.PI / 2} receiveShadow material={mat("clay", "#2a2d33", { roughness: 0.9 })}><planeGeometry args={[len, W * 2]} /></mesh>
      {[1, -1].map((s) => (
        <mesh key={s} rotation-x={-Math.PI / 2} position={[0, -0.005, s * (W + 6)]} material={mat("clay", "#28402a", { roughness: 1 })}><planeGeometry args={[len, 12]} /></mesh>
      ))}
      {/* centre line dashes and edge lights, sliding past as the plane rolls */}
      {Array.from({ length: 28 }, (_, i) => (
        <mesh key={`c${i}`} rotation-x={-Math.PI / 2} position={[wrap(i * 3 - offset, 84), 0.004, 0]} material={mat("clay", "#e8e8e2")}><planeGeometry args={[1.4, 0.09]} /></mesh>
      ))}
      {Array.from({ length: 40 }, (_, i) => (
        <group key={`l${i}`}>
          {[1, -1].map((s) => (
            <mesh key={s} position={[wrap(i * 2.1 - offset, 84), 0.05, s * W]} material={glow(s > 0 ? "#fff1c9" : "#fff1c9")}><sphereGeometry args={[0.05, 8, 8]} /></mesh>
          ))}
        </group>
      ))}
      {/* tufts of grass beside the runway: they flatten when `grassBend` rises */}
      {Array.from({ length: 140 }, (_, i) => {
        const x = wrap(rnd(seed, i) * 80 - offset, 80);
        const z = (rnd(seed, i + 500) > 0.5 ? 1 : -1) * (W + 0.4 + rnd(seed, i + 900) * 4.5);
        const h = 0.12 + rnd(seed, i + 1300) * 0.12;
        return (
          <mesh key={`g${i}`} position={[x, h / 2 * (1 - 0.7 * grassBend), z]} rotation-z={grassBend * 1.1 * (rnd(seed, i + 40) > 0.5 ? 1 : 0.8)} material={mat("clay", "#3f6b37")}>
            <boxGeometry args={[0.03, h, 0.03]} />
          </mesh>
        );
      })}
    </group>
  );
};

/** a dusk sky: a sun glow low on the horizon */
export const DUSK = { top: "#1a2448", bottom: "#d9824a", glow: "rgba(255,170,90,0.28)" };

// ------------------------------------------------------------------ the blackboard
export const BOARD_W = 5.2, BOARD_H = 3.0;
export const Blackboard: React.FC<Group> = (g) => (
  <group {...g}>
    <Block size={[BOARD_W + 0.3, BOARD_H + 0.3, 0.1]} radius={0.03} material={mat("clay", "#6b4a2b")} position={[0, 0, -0.06]} />
    <Block size={[BOARD_W, BOARD_H, 0.06]} radius={0.01} material={mat("clay", "#1f3a2e", { roughness: 0.95 })} />
    {/* chalk tray and chalk */}
    <Block size={[BOARD_W, 0.08, 0.22]} radius={0.01} material={mat("clay", "#5a3d22")} position={[0, -BOARD_H / 2 - 0.1, 0.1]} />
    <Block size={[0.3, 0.05, 0.05]} radius={0.02} material={mat("clay", "#f1efe6")} position={[1.6, -BOARD_H / 2 - 0.03, 0.12]} />
    {/* smudges of old chalk */}
    {Array.from({ length: 6 }, (_, i) => (
      <mesh key={i} position={[-2.2 + i * 0.85, 0.9 - (i % 3) * 0.5, 0.035]} material={mat("clay", "#2b4a3c", { transparent: true, opacity: 0.8 })}>
        <circleGeometry args={[0.35, 20]} />
      </mesh>
    ))}
    {/* the classroom wall around it */}
    <mesh position={[0, 0, -0.12]} material={mat("clay", "#3b3f4c")}><planeGeometry args={[16, 10]} /></mesh>
  </group>
);

// ------------------------------------------------------------------ the wind tunnel
export const CHORD = 2;
export const TunnelSection: React.FC<Group & { f: number; aoa?: number; fanSpeed?: number; lit?: number }> = ({ f, aoa = 0, fanSpeed = 1, lit = 0, ...g }) => (
  <group {...g}>
    {/* ribs of the square test section, receding */}
    {Array.from({ length: 9 }, (_, i) => (
      <group key={i} position={[-8 + i * 2, 0, 0]}>
        {[[0, 2.2, 0, 0.1, 0.12, 5], [0, -2.2, 0, 0.1, 0.12, 5]].map((b, j) => (
          <mesh key={j} position={[b[0]!, b[1]!, b[2]!]} material={mat("brushed", "#3a4150")}><boxGeometry args={[b[3]!, b[4]!, b[5]!]} /></mesh>
        ))}
        <mesh position={[0, 0, -2.5]} material={mat("brushed", "#3a4150")}><boxGeometry args={[0.1, 4.5, 0.12]} /></mesh>
        <mesh position={[0, 2.12, 0]} material={glow("#9fd8ff", 0.9)}><boxGeometry args={[0.6, 0.03, 0.03]} /></mesh>
      </group>
    ))}
    {/* back wall with a grid, floor */}
    <mesh position={[0, 0, -2.56]} material={mat("clay", "#121826")}><planeGeometry args={[20, 4.5]} /></mesh>
    {Array.from({ length: 21 }, (_, i) => (
      <mesh key={`v${i}`} position={[-10 + i, 0, -2.54]} material={mat("clay", "#1c2538")}><planeGeometry args={[0.02, 4.4]} /></mesh>
    ))}
    {Array.from({ length: 5 }, (_, i) => (
      <mesh key={`h${i}`} position={[0, -2 + i, -2.54]} material={mat("clay", "#1c2538")}><planeGeometry args={[20, 0.02]} /></mesh>
    ))}
    <mesh rotation-x={-Math.PI / 2} position={[0, -2.2, 0]} material={mat("clay", "#0d1119")}><planeGeometry args={[20, 5]} /></mesh>
    {/* the fan far upstream */}
    <group position={[-9.5, 0, -0.5]} rotation-y={Math.PI / 2}>
      <mesh material={mat("brushed", "#2b3140")}><torusGeometry args={[1.6, 0.12, 12, 40]} /></mesh>
      <group rotation-z={f * 0.35 * fanSpeed}>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} rotation-z={(i / 6) * Math.PI * 2} position={[0, 0, 0]} material={mat("brushed", "#59627a")}>
            <boxGeometry args={[0.35, 2.9, 0.04]} />
          </mesh>
        ))}
      </group>
    </group>
    {/* the mount: a strut from the floor to the wing slice's centre */}
    <mesh position={[0, -1.15, -0.2]} material={mat("brushed", "#7a8292")}><cylinderGeometry args={[0.05, 0.08, 2.1, 12]} /></mesh>
    <mesh position={[0, -2.15, -0.2]} material={mat("brushed", "#4a5162")}><cylinderGeometry args={[0.4, 0.45, 0.1, 24]} /></mesh>
    <Airfoil chord={CHORD} span={1.6} aoa={aoa} position={[0, 0, 0]} color="#e7ecf3" />
    {lit > 0.02 && <pointLight position={[0, 1.2, 1.5]} intensity={4 * lit} color={CYAN} distance={6} />}
    <pointLight position={[1, 2, 3]} intensity={9} color="#dfe8ff" distance={12} />
  </group>
);

// ------------------------------------------------------------------ the office at night
export const Office: React.FC<Group & { f: number }> = ({ f, ...g }) => (
  <group {...g}>
    <mesh rotation-x={-Math.PI / 2} material={mat("clay", "#2a2f3a")} receiveShadow><planeGeometry args={[60, 14]} /></mesh>
    {/* the night window wall with city lights */}
    <mesh position={[0, 3, -4]} material={mat("clay", "#0b1222")}><planeGeometry args={[60, 7]} /></mesh>
    {Array.from({ length: 110 }, (_, i) => (
      <mesh key={i} position={[-28 + rnd("city", i) * 56, 1.6 + rnd("city", i + 99) * 3.6, -3.98]}
        material={glow(rnd("city", i + 7) > 0.7 ? "#ffd38a" : "#8fb4ff", q(0.4 + 0.5 * rnd("city", i + 3)))}>
        <planeGeometry args={[0.12, 0.18]} />
      </mesh>
    ))}
    {Array.from({ length: 14 }, (_, i) => (
      <mesh key={`m${i}`} position={[-26 + i * 4, 3, -3.95]} material={mat("brushed", "#3a4150")}><boxGeometry args={[0.1, 7, 0.06]} /></mesh>
    ))}
    {/* rows of desks with glowing monitors */}
    {Array.from({ length: 12 }, (_, i) => (
      <group key={`d${i}`} position={[-20 + i * 4, 0, -1]}>
        <Block size={[2.6, 0.08, 1.2]} radius={0.02} material={mat("clay", "#7d6c56")} position={[0, 0.75, 0]} />
        {[-1.1, 1.1].map((x) => <Block key={x} size={[0.06, 0.75, 1.0]} radius={0.01} material={mat("brushed", "#59627a")} position={[x, 0.37, 0]} />)}
        <Block size={[0.9, 0.55, 0.04]} radius={0.02} material={mat("blackPlastic", "#111")} position={[0, 1.15, -0.35]} />
        <mesh position={[0, 1.15, -0.32]} material={glow(i % 2 ? "#6fa8ff" : "#8de3ff", q(0.45 + 0.1 * Math.sin(f * 0.1 + i)))}><planeGeometry args={[0.82, 0.47]} /></mesh>
      </group>
    ))}
    <pointLight position={[0, 3.5, 2]} intensity={10} color="#d8e2ff" distance={14} />
    <pointLight position={[-4, 1.6, 0]} intensity={4} color="#7fb0ff" distance={6} />
  </group>
);

// ------------------------------------------------------------------ arrows and air
/** A solid arrow pointing along +y in its own frame (rotate the group to aim it); `k` 0..1 grows it. */
export const Arrow: React.FC<Group & { k?: number; len?: number; color?: string; thick?: number }> = ({ k = 1, len = 1.2, color = AMBER, thick = 0.07, ...g }) => {
  if (k <= 0.01) return null;
  const L = len * k;
  return (
    <group {...g}>
      <mesh position={[0, L * 0.4, 0]} material={glow(color, 0.95)}><cylinderGeometry args={[thick, thick, L * 0.8, 12]} /></mesh>
      <mesh position={[0, L * 0.88, 0]} material={glow(color, 0.95)}><coneGeometry args={[thick * 2.6, L * 0.3, 16]} /></mesh>
    </group>
  );
};

/** A soft glowing cloud of colour (low or high pressure): stacked translucent spheres. */
export const Haze: React.FC<Group & { k?: number; color?: string; size?: [number, number, number] }> = ({ k = 1, color = LOWBLUE, size = [1, 0.4, 0.6], ...g }) => {
  if (k <= 0.01) return null;
  return (
    <group {...g}>
      {[1, 0.75, 0.5].map((s, i) => (
        <mesh key={i} scale={[size[0] * s, size[1] * s, size[2] * s]} material={glow(color, q(0.12 * k + 0.08 * i * k, 20))}>
          <sphereGeometry args={[1, 24, 16]} />
        </mesh>
      ))}
    </group>
  );
};

const Parts: React.FC = () => null;
export default Parts;
