// The Fire Ball world (Ohio State Fair, 26 July 2017) as one lit 3D set, shared by the Fair, Midway, Gate, Arm,
// Road and Shed beats. One unit ≈ one metre. The ride: a trailer base, a yellow A-frame tower, an orange boom
// hanging from the top that swings like a pendulum, and at its foot a wheel of six red sweep arms, each carrying
// a gondola of seats with shoulder bars and a lamp over each seat. Around it the midway: stalls with striped
// awnings, strings of bulbs, a Ferris wheel far off, the main gate, the crowd. Arm 0 is the arm that failed.
// No rider is ever shown falling; after the failure the shot is from far away, then the aftermath with rescuers.
import React from "react";
import { glow, rnd, type V3 } from "../../three/index";

export const sh = { castShadow: true, receiveShadow: true } as const;
export const k01 = (x: number) => Math.max(0, Math.min(1, x));

// ---------------------------------------------------------------- geometry of the ride
export const PIVOT: V3 = [0, 13.2, 0];
export const BOOM = 9.4;        // pivot to the wheel's hub
export const ARM = 3.3;         // hub to a gondola's mount
export const ARMS = 6;

/** The wheel's hub, the boom's direction and the wheel's two in-plane axes for a swing angle (rad, about z). */
export function hubAt(theta: number): { hub: V3; d: V3; e1: V3; e2: V3 } {
  const d: V3 = [Math.sin(theta), -Math.cos(theta), 0];
  const hub: V3 = [PIVOT[0] + BOOM * d[0], PIVOT[1] + BOOM * d[1], 0];
  return { hub, d, e1: [Math.cos(theta), Math.sin(theta), 0], e2: [0, 0, 1] };
}
/** Where gondola i hangs, for a swing angle and a wheel spin. */
export function gondolaAt(i: number, theta: number, spin: number): V3 {
  const { hub, e1, e2 } = hubAt(theta);
  const a = spin + (i / ARMS) * Math.PI * 2;
  return [hub[0] + ARM * (Math.cos(a) * e1[0] + Math.sin(a) * e2[0]), hub[1] + ARM * (Math.cos(a) * e1[1] + Math.sin(a) * e2[1]), hub[2] + ARM * (Math.cos(a) * e1[2] + Math.sin(a) * e2[2])];
}

/** The swing at a frame: amplitude by mode, a 6.4 s period. */
export function swingAngle(mode: string, f: number, k = 1): number {
  const A = mode === "high" ? 1.95 : mode === "low" ? 0.55 : mode === "stop" ? 0.06 : 0;
  return A * k * Math.sin((f / 192) * Math.PI * 2);
}

// ---------------------------------------------------------------- materials (JSX, so no imports)
type MatProps = { color: string; rough?: number; metal?: number; emissive?: string; ei?: number; opacity?: number };
export const Mat: React.FC<MatProps> = ({ color, rough = 0.5, metal = 0.2, emissive, ei = 0, opacity }) => (
  <meshStandardMaterial color={color} roughness={rough} metalness={metal} emissive={emissive ?? "#000000"} emissiveIntensity={ei}
    transparent={opacity !== undefined && opacity < 1} opacity={opacity ?? 1} depthWrite={opacity === undefined || opacity >= 0.99} />
);
/** The failure ramp: grey → amber → red (red only for the failure). */
export function rampHex(v: number): string {
  if (v < 0.5) return v < 0.15 ? "#c22a1f" : "#e07b22";
  return "#ff2a1a";
}

// ---------------------------------------------------------------- small things
export const Bulbs: React.FC<{ from: V3; to: V3; n: number; color?: string; on?: number; sag?: number; seed?: string; f?: number }> = ({ from, to, n, color = "#ffd58a", on = 1, sag = 0, seed = "b", f = 0 }) => (
  <group>
    {Array.from({ length: n }, (_, i) => {
      const u = n === 1 ? 0.5 : i / (n - 1);
      const y = from[1] + (to[1] - from[1]) * u - sag * 4 * u * (1 - u);
      const tw = 0.75 + 0.25 * Math.sin(f * 0.21 + rnd(seed, i) * 6.28);
      return (
        <mesh key={i} position={[from[0] + (to[0] - from[0]) * u, y, from[2] + (to[2] - from[2]) * u]} material={on > 0.05 ? glow(color, Math.round(Math.min(1, on * tw) * 10) / 10) : undefined}>
          <sphereGeometry args={[0.09, 8, 6]} />
          {on <= 0.05 && <Mat color="#4a4438" />}
        </mesh>
      );
    })}
  </group>
);

/** A square steel tube between two points (for the tower's legs, the arms). */
export const Tube: React.FC<{ a: V3; b: V3; w?: number; color: string; emissive?: string; ei?: number; opacity?: number; metal?: number }> = ({ a, b, w = 0.3, color, emissive, ei, opacity, metal = 0.35 }) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
  const L = Math.hypot(dx, dy, dz);
  const yaw = Math.atan2(dx, dz);
  const pitch = Math.acos(Math.max(-1, Math.min(1, dy / (L || 1))));
  return (
    <group position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} rotation={[0, yaw, 0]}>
      <mesh rotation={[pitch, 0, 0]} {...sh}><boxGeometry args={[w, L, w]} /><Mat color={color} rough={0.38} metal={metal} emissive={emissive} ei={ei} opacity={opacity} /></mesh>
    </group>
  );
};

/** A person, simple and readable at any size (legs, body, head), with an optional hi-vis vest and a lamp. */
export const Person3D: React.FC<{ position: V3; h?: number; color?: string; vest?: boolean; yaw?: number; lamp?: boolean; sit?: boolean; arm?: number; f?: number; seed?: number }> = ({ position, h = 1.75, color = "#3e4a5c", vest, yaw = 0, lamp, sit, arm = 0, f = 0, seed = 0 }) => {
  const bob = Math.sin(f * 0.08 + seed) * 0.01 * h;
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {!sit && <mesh position={[0, h * 0.24, 0]} {...sh}><cylinderGeometry args={[h * 0.09, h * 0.075, h * 0.48, 10]} /><Mat color="#2b2f38" rough={0.8} metal={0} /></mesh>}
      <mesh position={[0, (sit ? h * 0.3 : h * 0.62) + bob, 0]} {...sh}><capsuleGeometry args={[h * 0.12, h * 0.24, 4, 12]} /><Mat color={vest ? "#e8c21c" : color} rough={0.7} metal={0} emissive={vest ? "#b89a10" : undefined} ei={vest ? 0.25 : 0} /></mesh>
      {vest && <mesh position={[0, (sit ? h * 0.3 : h * 0.62) + bob, 0]}><cylinderGeometry args={[h * 0.125, h * 0.125, h * 0.04, 12]} /><Mat color="#dfe6ee" emissive="#ffffff" ei={0.6} /></mesh>}
      <mesh position={[0, (sit ? h * 0.58 : h * 0.91) + bob, 0]} {...sh}><sphereGeometry args={[h * 0.09, 16, 12]} /><Mat color="#c9a27e" rough={0.6} metal={0} /></mesh>
      <group position={[h * 0.13, (sit ? h * 0.42 : h * 0.74) + bob, 0]} rotation={[0, 0, -0.2 - arm]}>
        <mesh position={[0, -h * 0.14, 0]}><capsuleGeometry args={[h * 0.035, h * 0.22, 4, 8]} /><Mat color={vest ? "#e8c21c" : color} rough={0.7} metal={0} /></mesh>
      </group>
      {lamp && <mesh position={[0, h * 0.97 + bob, h * 0.08]} material={glow("#fff3c4")}><sphereGeometry args={[h * 0.03, 8, 6]} /></mesh>}
    </group>
  );
};

// ---------------------------------------------------------------- the ride
export type ArmState = { stress?: number; xray?: number; broken?: boolean; glowK?: number; mount?: number };

/** One gondola: a curved bench of four seats facing out, padded shoulder bars, a lamp over each seat. */
export const Gondola: React.FC<{ bars?: number; green?: number; riders?: boolean; colour?: string; f?: number; seed?: number }> = ({ bars = 1, green = 0, riders, colour = "#d4321f", f = 0, seed = 0 }) => (
  <group>
    {/* the tub */}
    <mesh position={[0, -0.25, 0]} {...sh}><boxGeometry args={[2.3, 0.5, 1.1]} /><Mat color={colour} rough={0.35} metal={0.25} /></mesh>
    <mesh position={[0, -0.52, 0]} {...sh}><boxGeometry args={[2.4, 0.08, 1.2]} /><Mat color="#2a2c31" rough={0.6} metal={0.5} /></mesh>
    {[-0.84, -0.28, 0.28, 0.84].map((x, i) => (
      <group key={i} position={[x, 0, 0]}>
        <mesh position={[0, 0.05, -0.12]} {...sh}><boxGeometry args={[0.5, 0.12, 0.6]} /><Mat color="#1b1d22" rough={0.7} metal={0} /></mesh>
        <mesh position={[0, 0.55, -0.42]} {...sh}><boxGeometry args={[0.5, 1.0, 0.14]} /><Mat color="#1b1d22" rough={0.7} metal={0} /></mesh>
        {/* the shoulder bar: hinged at the top of the seat back, down over the shoulders when closed */}
        <group position={[0, 1.05, -0.36]} rotation={[-1.25 + 1.25 * k01(bars), 0, 0]}>
          <mesh position={[0, -0.32, 0.22]}><boxGeometry args={[0.36, 0.62, 0.12]} /><Mat color="#e8e2d6" rough={0.4} metal={0.1} /></mesh>
        </group>
        <mesh position={[0, 1.28, -0.4]} material={glow(green > (i + 1) / 5 ? "#39ff7a" : "#5a3a2a", green > (i + 1) / 5 ? 1 : 0.6)}><sphereGeometry args={[0.07, 10, 8]} /></mesh>
        {riders && <Person3D position={[0, -0.1, -0.12]} h={1.15} sit color={["#3d5a80", "#8a4f3a", "#4f6b5c", "#6e5b7a"][(i + seed) % 4]!} f={f} seed={i} />}
      </group>
    ))}
    {/* the mount where the gondola meets its arm */}
    <mesh position={[0, 1.05, -0.62]} {...sh}><boxGeometry args={[0.5, 0.5, 0.5]} /><Mat color="#8f969e" rough={0.3} metal={0.8} /></mesh>
  </group>
);

/** The Fire Ball: trailer, tower, boom, wheel of six arms and gondolas. Arm 0 carries the failure state. */
export const FireBall: React.FC<{ theta: number; spin: number; f: number; lights?: number; arm0?: ArmState; bars?: number; green?: number; riders?: boolean; raise?: number; other?: boolean; flash?: number }> = ({
  theta, spin, f, lights = 1, arm0 = {}, bars = 1, green = 0, riders, raise = 1, other, flash = 0,
}) => {
  const yellow = other ? "#e9edf2" : "#f2b51c", boomC = other ? "#2f6fd1" : "#ef6a1d", armC = other ? "#2a4f9a" : "#c9281c";
  const legs: [V3, V3][] = [[[-5.2, 1.1, 2.2], [0, PIVOT[1], 0.7]], [[5.2, 1.1, 2.2], [0, PIVOT[1], 0.7]], [[-5.2, 1.1, -2.2], [0, PIVOT[1], -0.7]], [[5.2, 1.1, -2.2], [0, PIVOT[1], -0.7]]];
  const bulb = other ? "#cfe3ff" : "#ffd27a";
  const st = arm0.stress ?? 0;
  return (
    <group scale={[1, raise, 1]}>
      {/* trailer base and the loading deck */}
      <mesh position={[0, 0.55, 0]} {...sh}><boxGeometry args={[13, 1.1, 5.4]} /><Mat color="#3a3f47" rough={0.55} metal={0.6} /></mesh>
      <mesh position={[0, 1.12, 0]} {...sh}><boxGeometry args={[13.2, 0.06, 5.6]} /><Mat color="#6d737a" rough={0.4} metal={0.7} /></mesh>
      {[-5.6, -3.2, 3.2, 5.6].map((x) => [-2.7, 2.7].map((z) => (
        <mesh key={`${x}${z}`} position={[x, 0.45, z]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.45, 0.45, 0.35, 18]} /><Mat color="#16171a" rough={0.9} metal={0} /></mesh>
      )))}
      <mesh position={[0, 1.9, 0]} {...sh}><cylinderGeometry args={[4.6, 4.8, 0.18, 40]} /><Mat color="#8e949b" rough={0.45} metal={0.6} /></mesh>
      {Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return <mesh key={i} position={[Math.cos(a) * 4.7, 2.35, Math.sin(a) * 4.7]}><cylinderGeometry args={[0.04, 0.04, 0.9, 6]} /><Mat color="#c8ccd1" metal={0.8} rough={0.3} /></mesh>; })}
      <mesh position={[0, 2.78, 0]} rotation-x={Math.PI / 2}><torusGeometry args={[4.7, 0.05, 6, 60]} /><Mat color="#c8ccd1" metal={0.8} rough={0.3} /></mesh>
      {/* the A-frame tower with bulbs up each leg */}
      {legs.map(([a, b], i) => <group key={i}><Tube a={a} b={b} w={0.55} color={yellow} metal={0.25} /><Bulbs from={[a[0], a[1] + 0.6, a[2] + (a[2] > 0 ? 0.3 : -0.3)]} to={[b[0], b[1] - 0.6, b[2] + (b[2] > 0 ? 0.3 : -0.3)]} n={16} color={bulb} on={lights} seed={`leg${i}`} f={f} /></group>)}
      {[-1, 1].map((s) => <Tube key={s} a={[-2.6, 7, s * 1.5]} b={[2.6, 7, s * 1.5]} w={0.32} color={yellow} />)}
      <mesh position={PIVOT} rotation-x={Math.PI / 2} {...sh}><cylinderGeometry args={[0.55, 0.55, 2.2, 24]} /><Mat color="#7d848c" metal={0.85} rough={0.3} /></mesh>
      {!other && <mesh position={[0, PIVOT[1] + 1.3, 0]} {...sh}><boxGeometry args={[3.6, 1.1, 0.25]} /><Mat color="#1a1a1e" rough={0.5} metal={0.2} emissive="#ff5a1a" ei={0.35 * lights} /></mesh>}
      {/* the boom and the wheel */}
      <group position={PIVOT} rotation-z={theta}>
        <mesh position={[0, -BOOM / 2, 0]} {...sh}><boxGeometry args={[0.8, BOOM, 0.8]} /><Mat color={boomC} rough={0.35} metal={0.3} /></mesh>
        {[-1, 1].map((s) => <Bulbs key={s} from={[s * 0.45, -0.8, 0.42]} to={[s * 0.45, -BOOM + 1, 0.42]} n={14} color={bulb} on={lights} seed={`boom${s}`} f={f} />)}
        <group position={[0, -BOOM, 0]} rotation-y={spin}>
          <mesh {...sh}><cylinderGeometry args={[1.1, 1.1, 0.7, 32]} /><Mat color="#40454d" metal={0.8} rough={0.3} /></mesh>
          <mesh position={[0, -0.45, 0]} material={glow(other ? "#9fd0ff" : "#ff7a2a", 0.9 * lights + 0.1)}><cylinderGeometry args={[0.9, 0.6, 0.2, 32]} /></mesh>
          {Array.from({ length: ARMS }, (_, i) => {
            const a = (i / ARMS) * Math.PI * 2;
            const failed = i === 0 && arm0.broken;
            const xr = i === 0 ? arm0.xray ?? 0 : 0;
            const hot = i === 0 ? Math.max(st, arm0.glowK ?? 0) : 0;
            const col = hot > 0.05 ? rampHex(hot) : armC;
            return (
              <group key={i} rotation-y={-a}>
                {/* the sweep arm: a square hollow tube from the hub to the gondola mount */}
                <mesh position={[ARM / 2 + 0.4, 0, 0]} {...sh}>
                  <boxGeometry args={[ARM - 0.2, 0.42, 0.42]} />
                  <Mat color={col} rough={0.32} metal={0.3} emissive={hot > 0.05 ? col : undefined} ei={hot * 1.4 + (flash > 0 && i === 0 ? flash : 0)} opacity={xr > 0 ? 1 - 0.75 * xr : undefined} />
                </mesh>
                {xr > 0 && <mesh position={[ARM / 2 + 0.4, 0, 0]}><boxGeometry args={[ARM - 0.3, 0.3, 0.3]} /><Mat color="#8a4a22" rough={0.95} metal={0} emissive="#7a3412" ei={0.5 * xr} opacity={xr} /></mesh>}
                {failed ? (
                  <mesh position={[ARM + 0.1, 0, 0]}><boxGeometry args={[0.2, 0.46, 0.46]} /><Mat color="#ff2a1a" emissive="#ff2a1a" ei={1.2} /></mesh>
                ) : (
                  <group position={[ARM + 0.35, -1.1, 0]} rotation-y={Math.PI / 2}>
                    <Gondola bars={bars} green={green} riders={riders} colour={i % 2 ? (other ? "#2f6fd1" : "#e08a1c") : (other ? "#d9dee5" : "#d4321f")} f={f} seed={i} />
                    {i === 0 && (arm0.mount ?? 0) > 0 && <mesh position={[0, 1.05, -0.62]}><boxGeometry args={[0.62, 0.62, 0.62]} /><Mat color="#ffb23e" emissive="#ffb23e" ei={arm0.mount} opacity={0.6} /></mesh>}
                  </group>
                )}
              </group>
            );
          })}
        </group>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- the midway
const STALL_COLS = ["#d62828", "#1f6fd1", "#2a9d8f", "#f4a261", "#8e44ad", "#e9c46a"];

/** A row of stalls with striped awnings and lit signs, along x at depth z, facing +z (or -z with flip). */
export const Stalls: React.FC<{ x0: number; n: number; z: number; flip?: boolean; lights: number; seed: string; f: number }> = ({ x0, n, z, flip, lights, seed, f }) => (
  <group position={[0, 0, z]} rotation-y={flip ? Math.PI : 0}>
    {Array.from({ length: n }, (_, i) => {
      const c = STALL_COLS[Math.floor(rnd(seed, i) * STALL_COLS.length)]!;
      const x = x0 + i * 4.6;
      return (
        <group key={i} position={[x, 0, 0]}>
          <mesh position={[0, 1.4, 0]} {...sh}><boxGeometry args={[4, 2.8, 3]} /><Mat color="#efe6d6" rough={0.8} metal={0} /></mesh>
          <mesh position={[0, 1.0, 1.55]} {...sh}><boxGeometry args={[3.8, 1.0, 0.25]} /><Mat color={c} rough={0.5} metal={0} /></mesh>
          {Array.from({ length: 6 }, (_, j) => (
            <mesh key={j} position={[-1.67 + j * 0.67, 3.0, 1.9]} rotation-x={0.45} {...sh}><boxGeometry args={[0.67, 0.06, 1.4]} /><Mat color={j % 2 ? "#ffffff" : c} rough={0.7} metal={0} /></mesh>
          ))}
          <mesh position={[0, 3.55, 1.2]} material={glow(c, Math.round((0.25 + 0.75 * lights) * 10) / 10)}><boxGeometry args={[2.6, 0.5, 0.1]} /></mesh>
          <Bulbs from={[-2, 3.25, 2.5]} to={[2, 3.25, 2.5]} n={7} on={lights} seed={`${seed}${i}`} f={f} />
        </group>
      );
    })}
  </group>
);

/** The Ferris wheel far off: a lit ring, spokes and small cars, turning slowly. */
export const FerrisWheel: React.FC<{ position: V3; f: number; lights: number }> = ({ position, f, lights }) => {
  const r = 11, rot = f * 0.0025;
  return (
    <group position={position}>
      <Tube a={[-4, 0, 0]} b={[0, r + 1, 0]} w={0.5} color="#d9dde2" />
      <Tube a={[4, 0, 0]} b={[0, r + 1, 0]} w={0.5} color="#d9dde2" />
      <group position={[0, r + 1, 0.6]} rotation-z={rot}>
        <mesh material={glow("#ff4fa0", Math.round((0.3 + 0.7 * lights) * 10) / 10)}><torusGeometry args={[r, 0.12, 8, 80]} /></mesh>
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return (
            <group key={i}>
              <mesh position={[Math.cos(a) * r / 2, Math.sin(a) * r / 2, 0]} rotation-z={a + Math.PI / 2}><boxGeometry args={[0.08, r, 0.08]} /><Mat color="#e6e9ee" metal={0.6} /></mesh>
              <group position={[Math.cos(a) * r, Math.sin(a) * r, 0]} rotation-z={-rot}>
                <mesh position={[0, -0.9, 0]}><boxGeometry args={[1.2, 1.0, 1.0]} /><Mat color={STALL_COLS[i % STALL_COLS.length]!} rough={0.5} /></mesh>
              </group>
            </group>
          );
        })}
      </group>
    </group>
  );
};

/** Poles with strings of bulbs over the midway, in front of the stall rows. */
export const LightStrings: React.FC<{ lights: number; f: number }> = ({ lights, f }) => (
  <group>
    {Array.from({ length: 11 }, (_, i) => {
      const x = -44 + i * 8;
      return (
        <group key={i}>
          <mesh position={[x, 3.5, -12]}><cylinderGeometry args={[0.08, 0.1, 7, 8]} /><Mat color="#3a3f46" metal={0.6} /></mesh>
          {i < 10 && <Bulbs from={[x, 6.8, -12]} to={[x + 8, 6.8, -12]} n={12} sag={0.7} on={lights} seed={`s${i}`} f={f} color={i % 2 ? "#ffe0a0" : "#ffb070"} />}
        </group>
      );
    })}
  </group>
);

/** The fairground floor, the fence round the ride, trees and the far skyline of rides. */
export const Grounds: React.FC<{ wet?: number; day: number; other?: boolean }> = ({ wet = 0, day, other }) => (
  <group>
    <mesh rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[260, 260]} /><Mat color={other ? "#4d5a48" : "#4a4c50"} rough={0.95 - 0.7 * wet} metal={0.1 + 0.3 * wet} /></mesh>
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]} receiveShadow><planeGeometry args={[60, 22]} /><Mat color="#5c5a55" rough={0.9 - 0.6 * wet} metal={0.1 + 0.3 * wet} /></mesh>
    {Array.from({ length: 28 }, (_, i) => {
      const a = (i / 28) * Math.PI * 2;
      return <mesh key={i} position={[Math.cos(a) * 9.5, 0.55, Math.sin(a) * 7.2]}><boxGeometry args={[0.08, 1.1, 0.08]} /><Mat color="#b9bec4" metal={0.8} rough={0.3} /></mesh>;
    })}
    <mesh position={[0, 1.05, 0]} rotation-x={Math.PI / 2} scale={[1, 7.2 / 9.5, 1]}><torusGeometry args={[9.5, 0.05, 6, 80]} /><Mat color="#b9bec4" metal={0.8} rough={0.3} /></mesh>
    {Array.from({ length: 34 }, (_, i) => {
      const x = -90 + i * 5.5 + rnd("tree", i) * 3, z = -58 - rnd("tree", i + 50) * 12;
      const s = 2.5 + rnd("tree", i + 9) * 2.5;
      return (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, s * 0.5, 0]}><cylinderGeometry args={[0.2, 0.3, s, 6]} /><Mat color="#3d2f22" rough={1} metal={0} /></mesh>
          <mesh position={[0, s * 1.2, 0]}><sphereGeometry args={[s * 0.75, 10, 8]} /><Mat color={day > 0.5 ? "#3f6b3a" : "#1e2b22"} rough={1} metal={0} /></mesh>
        </group>
      );
    })}
  </group>
);

/** The main gate: an arch over the entrance with the fair's name on a lit sign. */
export const Gate: React.FC<{ position: V3; lights: number; f: number }> = ({ position, lights, f }) => (
  <group position={position}>
    {[-7, 7].map((x) => <mesh key={x} position={[x, 3.5, 0]} {...sh}><boxGeometry args={[1.2, 7, 1.2]} /><Mat color="#8a1d1d" rough={0.5} /></mesh>)}
    <mesh position={[0, 7.4, 0]} {...sh}><boxGeometry args={[16, 1.8, 0.8]} /><Mat color="#1f3a6b" rough={0.45} emissive="#1f3a6b" ei={0.2 + 0.4 * lights} /></mesh>
    <Bulbs from={[-7.8, 8.45, 0.45]} to={[7.8, 8.45, 0.45]} n={30} on={Math.max(0.4, lights)} seed="gate" f={f} />
    {[-10, -8.6, 8.6, 10].map((x) => <mesh key={x} position={[x, 0.6, 0]}><boxGeometry args={[0.1, 1.2, 0.1]} /><Mat color="#b9bec4" metal={0.8} /></mesh>)}
  </group>
);

/** The operator's booth beside the ride: a small cabin, a window, the control desk with its pedal and button. */
export const Booth: React.FC<{ position: V3; f: number; startGlow?: number; stickers?: number; screen?: number }> = ({ position, f, startGlow = 0, stickers = 0, screen = 0 }) => (
  <group position={position}>
    <mesh position={[0, 1.4, 0]} {...sh}><boxGeometry args={[2.4, 2.8, 2]} /><Mat color="#b9bcc0" rough={0.45} metal={0.55} /></mesh>
    <mesh position={[0, 1.7, 1.01]}><planeGeometry args={[1.8, 1.0]} /><Mat color="#1d2a36" rough={0.1} metal={0.4} /></mesh>
    <mesh position={[0, 2.95, 0.25]} {...sh}><boxGeometry args={[2.9, 0.16, 2.8]} /><Mat color="#c9281c" rough={0.4} metal={0.3} /></mesh>
    <mesh position={[0, 2.45, 1.02]}><boxGeometry args={[2.42, 0.22, 0.02]} /><Mat color="#f2b51c" rough={0.4} /></mesh>
    <mesh position={[0, 0.6, 1.02]}><boxGeometry args={[2.42, 0.16, 0.02]} /><Mat color="#c9281c" rough={0.4} /></mesh>
    {[-0.92, 0.92].map((x) => <mesh key={x} position={[x, 1.7, 1.02]}><boxGeometry args={[0.08, 1.1, 0.04]} /><Mat color="#8f969e" metal={0.8} rough={0.3} /></mesh>)}
    <mesh position={[0, 1.7, 1.0]}><planeGeometry args={[1.7, 0.9]} /><Mat color="#0b1622" emissive="#1e6ad6" ei={0.15 + 0.6 * screen} /></mesh>
    <mesh position={[1.21, 2.0, 0]} rotation-y={Math.PI / 2}><planeGeometry args={[1.9, 1.6]} /><Mat color="#d8d2c4" rough={0.8} /></mesh>
    {/* the control desk outside the booth's window */}
    <mesh position={[0, 1.0, 1.4]} rotation-x={-0.5} {...sh}><boxGeometry args={[1.9, 0.12, 0.8]} /><Mat color="#2c3037" rough={0.4} metal={0.6} /></mesh>
    <mesh position={[0, 0.5, 1.4]} {...sh}><boxGeometry args={[1.8, 1.0, 0.6]} /><Mat color="#3a3f47" rough={0.5} metal={0.5} /></mesh>
    {[-0.6, -0.3, 0, 0.3].map((x, i) => <mesh key={i} position={[x, 1.1, 1.36]} rotation-x={-0.5} material={glow(["#39ff7a", "#ffd23e", "#4fa8ff", "#ff6a3a"][i]!, 0.6 + 0.4 * Math.sin(f * 0.15 + i))}><cylinderGeometry args={[0.06, 0.06, 0.04, 12]} /></mesh>)}
    <mesh position={[0.62, 1.12, 1.38]} rotation-x={-0.5} material={glow("#39ff7a", Math.round((0.3 + 0.7 * startGlow) * 10) / 10)}><cylinderGeometry args={[0.11, 0.11, 0.06, 16]} /></mesh>
    <mesh position={[-0.2, 1.09, 1.5]} rotation-x={-0.5}><planeGeometry args={[0.6, 0.34]} /><Mat color="#0b1622" emissive="#1e6ad6" ei={0.4 + 0.8 * screen} /></mesh>
    <mesh position={[0.5, 0.06, 2.0]} {...sh}><boxGeometry args={[0.4, 0.08, 0.5]} /><Mat color="#1b1d22" metal={0.4} /></mesh>
    {/* inspection stickers on the booth's side, appearing one by one */}
    {[["#2a9d3f", 0], ["#1f6fd1", 1], ["#e9c46a", 2], ["#d62828", 3]].map(([c, i]) => (stickers > (i as number) / 4 ? (
      <mesh key={i as number} position={[1.21, 1.9 - (i as number) * 0.42, 0.55 - ((i as number) % 2) * 0.5]} rotation-y={Math.PI / 2}><circleGeometry args={[0.17, 24]} /><Mat color={c as string} rough={0.4} metal={0} /></mesh>
    ) : null))}
  </group>
);

/** A lorry with the folded ride on its trailer (the ride travels from fair to fair). */
export const Rig: React.FC<{ position: V3; f: number }> = ({ position, f }) => (
  <group position={position}>
    <mesh position={[8.4, 1.9, 0]} {...sh}><boxGeometry args={[3.2, 3.2, 2.6]} /><Mat color="#c8281c" rough={0.35} metal={0.4} /></mesh>
    <mesh position={[9.6, 2.5, 0]}><boxGeometry args={[0.9, 1.2, 2.4]} /><Mat color="#1c2733" rough={0.1} metal={0.4} /></mesh>
    <mesh position={[0, 1.2, 0]} {...sh}><boxGeometry args={[13, 0.5, 2.6]} /><Mat color="#3a3f47" metal={0.6} rough={0.5} /></mesh>
    {/* the folded tower and boom lying along the trailer */}
    <mesh position={[-0.5, 2.0, 0.5]} {...sh}><boxGeometry args={[11, 0.55, 0.55]} /><Mat color="#f2b51c" rough={0.35} metal={0.3} /></mesh>
    <mesh position={[-0.5, 2.0, -0.5]} {...sh}><boxGeometry args={[11, 0.55, 0.55]} /><Mat color="#f2b51c" rough={0.35} metal={0.3} /></mesh>
    <mesh position={[-1.2, 2.75, 0]} {...sh}><boxGeometry args={[9, 0.8, 0.8]} /><Mat color="#ef6a1d" rough={0.35} metal={0.3} /></mesh>
    <mesh position={[-5.4, 2.6, 0]} {...sh}><cylinderGeometry args={[1.1, 1.1, 0.7, 24]} /><Mat color="#40454d" metal={0.8} rough={0.3} /></mesh>
    {[-5, -3.6, 3, 7.4, 9.4].map((x, i) => [-1.3, 1.3].map((z) => (
      <mesh key={`${i}${z}`} position={[x, 0.55, z]} rotation={[Math.PI / 2, 0, 0]} rotation-y={f * 0.4}><cylinderGeometry args={[0.55, 0.55, 0.4, 18]} /><Mat color="#141518" rough={0.9} metal={0} /></mesh>
    )))}
  </group>
);

/** Emergency vehicles: an ambulance and a fire truck with light bars pulsing red and blue. */
export const Emergency: React.FC<{ f: number; k: number; away?: number }> = ({ f, k, away = 0 }) => {
  const red = 0.5 + 0.5 * Math.sin(f * 0.5), blue = 0.5 + 0.5 * Math.sin(f * 0.5 + Math.PI);
  return (
    <group>
      <group position={[-13 - 30 * away, 0, 6]} rotation-y={0.3}>
        <mesh position={[0, 1.4, 0]} {...sh}><boxGeometry args={[5.5, 2.6, 2.3]} /><Mat color="#eef0f2" rough={0.4} metal={0.3} /></mesh>
        <mesh position={[0, 1.4, 1.16]}><planeGeometry args={[5.4, 0.3]} /><Mat color="#d62828" /></mesh>
        <mesh position={[-1.5, 2.8, 0.6]} material={glow("#ff2a2a", Math.round(red * k * 10) / 10 || 0.1)}><boxGeometry args={[0.6, 0.2, 0.3]} /></mesh>
        <mesh position={[-1.5, 2.8, -0.6]} material={glow("#2a6aff", Math.round(blue * k * 10) / 10 || 0.1)}><boxGeometry args={[0.6, 0.2, 0.3]} /></mesh>
        <pointLight position={[-1.5, 3.4, 0]} intensity={40 * red * k} distance={22} color="#ff3030" />
        <pointLight position={[-1.5, 3.4, 1]} intensity={40 * blue * k} distance={22} color="#3060ff" />
      </group>
      <group position={[12, 0, -9]} rotation-y={0.4}>
        <mesh position={[0, 1.6, 0]} {...sh}><boxGeometry args={[8, 3, 2.5]} /><Mat color="#b51d16" rough={0.35} metal={0.4} /></mesh>
        <mesh position={[1, 3.25, 0]} material={glow("#ff2a2a", Math.round(blue * k * 10) / 10 || 0.1)}><boxGeometry args={[1.2, 0.25, 1.6]} /></mesh>
        <pointLight position={[1, 4, 0]} intensity={30 * blue * k} distance={20} color="#ff3030" />
      </group>
    </group>
  );
};

/** Yellow tape round the ride on posts. */
export const Tape: React.FC = () => (
  <group>
    {Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2, b = ((i + 1) / 14) * Math.PI * 2;
      const p: V3 = [Math.cos(a) * 12, 1, Math.sin(a) * 9.5], q: V3 = [Math.cos(b) * 12, 1, Math.sin(b) * 9.5];
      return (
        <group key={i}>
          <mesh position={[p[0], 0.5, p[2]]}><cylinderGeometry args={[0.05, 0.05, 1, 6]} /><Mat color="#d8d8d8" /></mesh>
          <Tube a={p} b={q} w={0.05} color="#ffd400" metal={0} />
        </group>
      );
    })}
  </group>
);
export default FireBall;
