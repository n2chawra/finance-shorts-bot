// The Colgan Air world (12 Feb 2009) as one lit 3D set, shared by the Sky beats. One unit ≈ 5.5 m.
// The airliner: a Bombardier turboprop of this type, drawn to its proportions: a long slim fuselage, a high
// wing on top of the cabin, two engine nacelles under the wing with six-blade propellers, a T-tail, a row
// of cabin windows, black de-icing boots on the wing's front edge (ice can build on them), landing gear that
// swings down. White with a dark tail; generic markings, no airline's livery or logo.
// The places: the night sky in snow and cloud, the ramp at Newark, a snowy street of houses in Clarence
// Center with fire engines and firefighters (people are shown, never hurt; the aftermath is lights, smoke
// far off and a glow, no wreckage close up), and the runway lights far away.
import React from "react";
import { clayMat, glow, rnd, type V3 } from "../../three/index";

const sh = { castShadow: true, receiveShadow: true } as const;
const k01 = (x: number) => Math.max(0, Math.min(1, x));
const clay = (c: string, o: { emissive?: string; emissiveIntensity?: number; opacity?: number } = {}) => clayMat(c, { ao: 0.25, ...o });

export const M = {
  white: () => clay("#eef1f4"),
  grey: () => clay("#8b939b"),
  dark: () => clay("#1b2026"),
  boot: () => clay("#202428"),
  tail: () => clay("#24446b"),
  stripe: () => clay("#3a6a9a"),
  glass: () => clay("#16202b"),
  rubber: () => clay("#151515"),
  snow: () => clay("#e9eef2"),
  ground: () => clay("#c9d1d8"),
  road: () => clay("#4a5157"),
  wall: (c: string) => clay(c),
  roof: () => clay("#3b4249"),
  tree: () => clay("#1f2c26"),
  red: () => clay("#b3261e"),
  terminal: () => clay("#5c656e"),
  ice: (k: number) => clay("#f4fbff", { emissive: "#bfe6ff", emissiveIntensity: 0.25, opacity: Math.round(k01(k) * 10) / 10 }),
  hot: (k: number) => {
    const q = Math.round(k01(k) * 10) / 10;
    return clay(q < 0.5 ? "#e8a23a" : "#ff3b30", { emissive: q < 0.5 ? "#ff9d2e" : "#ff3b30", emissiveIntensity: 0.3 + 1.1 * q });
  },
  window: (on: number) => clay("#ffd58a", { emissive: "#ffc46b", emissiveIntensity: 0.4 + 1.4 * k01(on) }),
};

export type Q400Props = {
  position?: V3;
  /** pitch (nose up +, radians), roll (right wing down +, radians), yaw */
  pitch?: number; roll?: number; yaw?: number;
  scale?: number;
  frame?: number;
  /** propeller speed (radians a frame; 0 still) */
  prop?: number;
  /** landing gear down 0..1 */
  gear?: number;
  /** ice on the leading edges and windshield 0..1 */
  ice?: number;
  /** the wing's top glows from amber to red (the stall) 0..1 */
  stall?: number;
  /** de-icing boots pulse (frames since they came on; <0 off) */
  boots?: number;
  /** landing lights and cabin windows 0..1 */
  lights?: number;
  /** flaps out 0..1 (the panels behind the wing's back edge, inboard of the engines and between them) */
  flaps?: number;
};

/** The airliner. Nose toward +x, wings along ±z, origin at the wing's middle. */
export const Q400: React.FC<Q400Props> = ({ position = [0, 0, 0], pitch = 0, roll = 0, yaw = 0, scale = 1, frame = 0, prop = 0.9, gear = 0, ice = 0, stall = 0, boots = -1, lights = 1, flaps = 0 }) => {
  const R = 0.25, L = 4.4; // fuselage radius, length of the cylinder
  const wingY = R + 0.04, chord = 0.5, span = 5.2;
  const bootK = boots >= 0 ? 0.5 + 0.5 * Math.sin(boots * 0.35) : 0;
  const top = stall > 0.02 ? M.hot(stall) : M.white();
  const blink = Math.floor(frame / 18) % 3 === 0 ? 1 : 0.15;
  return (
    <group position={position} rotation-y={yaw} scale={scale}><group rotation-z={pitch}><group rotation-x={roll}>
      {/* fuselage */}
      <mesh rotation-z={Math.PI / 2} material={M.white()} {...sh}><cylinderGeometry args={[R, R, L, 32]} /></mesh>
      <mesh position={[L / 2, -0.02, 0]} scale={[1.6, 0.92, 1]} material={M.white()} {...sh}><sphereGeometry args={[R, 28, 18, 0, Math.PI * 2, 0, Math.PI]} /></mesh>
      <mesh position={[-L / 2 - 0.62, 0.1, 0]} rotation-z={Math.PI / 2 - 0.12} material={M.white()} {...sh}><cylinderGeometry args={[R * 0.32, R, 1.3, 28]} /></mesh>
      {/* belly fairing and a cheat line */}
      <mesh position={[0.1, -R * 0.82, 0]} scale={[1, 0.35, 1]} rotation-z={Math.PI / 2} material={M.grey()}><cylinderGeometry args={[R * 0.75, R * 0.75, 1.8, 20]} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[0, -0.02, s * (R + 0.002)]} material={M.stripe()}><boxGeometry args={[L * 0.96, 0.035, 0.005]} /></mesh>)}
      {/* cockpit windows (frosted by ice) and cabin windows */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[L / 2 + 0.17, 0.1, s * 0.13]} rotation-y={s * 0.5} material={ice > 0.4 ? M.ice(1) : M.glass()}><boxGeometry args={[0.16, 0.08, 0.13]} /></mesh>
          {Array.from({ length: 20 }, (_, i) => <mesh key={i} position={[-1.7 + i * 0.19, 0.06, s * (R + 0.003)]} material={M.window(lights)}><boxGeometry args={[0.07, 0.07, 0.006]} /></mesh>)}
        </group>
      ))}
      {/* the high wing, its de-icing boots and the ice on them */}
      <group position={[0.25, wingY, 0]}>
        <mesh material={top} {...sh}><boxGeometry args={[chord, 0.07, span]} /></mesh>
        <mesh position={[chord / 2 + 0.01, -0.005, 0]} material={bootK > 0 ? glow("#4a6074", 0.6 + 0.4 * bootK) : M.boot()}><boxGeometry args={[0.05, 0.065, span * 0.98]} /></mesh>
        {ice > 0.02 && <mesh position={[chord / 2 + 0.035, 0, 0]} material={M.ice(ice)}><boxGeometry args={[0.04 + 0.03 * ice, 0.075, span * 0.97]} /></mesh>}
        <mesh position={[0, 0.045, 0]} scale={[1, 0.25, 1]} rotation-x={Math.PI / 2} material={top}><cylinderGeometry args={[chord / 2, chord / 2, span * 0.99, 18, 1, false, 0, Math.PI]} /></mesh>
        {[-1, 1].map((sd) => [0.45, 1.6].map((z0) => (
          <mesh key={`${sd}${z0}`} position={[-chord / 2 - 0.09 * flaps, -0.02 - 0.05 * flaps, sd * z0]} rotation-z={0.5 * flaps} material={flaps > 0.05 ? M.grey() : top}>
            <boxGeometry args={[0.16, 0.025, 0.85]} />
          </mesh>
        )))}
        {/* nav lights: red left (−z), green right (+z) */}
        <mesh position={[0, 0, -span / 2]} material={glow("#ff3b30", 1)}><sphereGeometry args={[0.04, 8, 6]} /></mesh>
        <mesh position={[0, 0, span / 2]} material={glow("#3dff7a", 1)}><sphereGeometry args={[0.04, 8, 6]} /></mesh>
      </group>
      {/* nacelles and propellers */}
      {[-1, 1].map((s) => (
        <group key={s} position={[0.55, wingY - 0.1, s * 0.82]}>
          <mesh rotation-z={Math.PI / 2} material={M.white()} {...sh}><cylinderGeometry args={[0.13, 0.11, 1.15, 20]} /></mesh>
          <mesh position={[0.62, 0, 0]} rotation-z={-Math.PI / 2} material={M.dark()}><coneGeometry args={[0.08, 0.2, 16]} /></mesh>
          <group position={[0.62, 0, 0]} rotation-x={frame * prop}>
            {Array.from({ length: 6 }, (_, i) => (
              <mesh key={i} rotation-x={(i / 6) * Math.PI * 2} position={[0, 0, 0]} material={M.dark()}>
                <boxGeometry args={[0.02, 0.4, 0.05]} />
              </mesh>
            ))}
          </group>
          {prop > 0.4 && <mesh position={[0.64, 0, 0]} rotation-z={Math.PI / 2} material={glow("#c9d3dc", 0.12)}><cylinderGeometry args={[0.38, 0.38, 0.005, 32]} /></mesh>}
          {/* main gear from the nacelle */}
          <group position={[-0.1, -0.12, 0]} rotation-z={-1.4 * (1 - k01(gear))}>
            <mesh position={[0, -0.22, 0]} material={M.grey()}><boxGeometry args={[0.04, 0.44, 0.04]} /></mesh>
            {[-0.05, 0.05].map((z) => <mesh key={z} position={[0, -0.45, z]} rotation-x={Math.PI / 2} material={M.rubber()}><cylinderGeometry args={[0.07, 0.07, 0.05, 16]} /></mesh>)}
          </group>
        </group>
      ))}
      {/* nose gear */}
      <group position={[L / 2 - 0.35, -R, 0]} rotation-z={1.4 * (1 - k01(gear))}>
        <mesh position={[0, -0.15, 0]} material={M.grey()}><boxGeometry args={[0.03, 0.3, 0.03]} /></mesh>
        <mesh position={[0, -0.3, 0]} rotation-x={Math.PI / 2} material={M.rubber()}><cylinderGeometry args={[0.05, 0.05, 0.06, 14]} /></mesh>
      </group>
      {/* T-tail */}
      <group position={[-L / 2 - 0.85, R * 0.7, 0]}>
        <mesh position={[0, 0.55, 0]} rotation-z={0.42} material={M.tail()} {...sh}><boxGeometry args={[0.55, 1.15, 0.05]} /></mesh>
        <mesh position={[-0.38, 1.1, 0]} material={M.tail()} {...sh}><boxGeometry args={[0.42, 0.05, 1.7]} /></mesh>
        <mesh position={[-0.3, 1.13, 0]} material={glow("#ff2a2a", blink)}><sphereGeometry args={[0.035, 8, 6]} /></mesh>
      </group>
      {/* landing lights */}
      {lights > 0 && <mesh position={[L / 2 + 0.35, -0.05, 0]} material={glow("#fff4d6", lights)}><sphereGeometry args={[0.05, 10, 8]} /></mesh>}
      {lights > 0 && <spotLight position={[L / 2 + 0.4, -0.05, 0]} target-position={[L / 2 + 8, -2, 0]} angle={0.35} penumbra={0.6} intensity={6 * lights} distance={14} color="#fff1d0" />}
      <mesh position={[0, -R - 0.02, 0]} material={glow("#ff2a2a", blink)}><sphereGeometry args={[0.035, 8, 6]} /></mesh>
    </group></group></group>
  );
};

/** One house: walls, a pitched roof with snow on it, lit windows, a door light. */
export const House: React.FC<{ position: V3; rot?: number; wall?: string; lit?: number; w?: number; d?: number }> = ({ position, rot = 0, wall = "#a9b2bb", lit = 1, w = 1.6, d = 1.2 }) => (
  <group position={position} rotation-y={rot}>
    <mesh position={[0, 0.45, 0]} material={M.wall(wall)} {...sh}><boxGeometry args={[w, 0.9, d]} /></mesh>
    <mesh position={[0, 1.08, 0]} rotation-y={Math.PI / 4} scale={[1, 1, 1]} material={M.roof()} {...sh}>
      <coneGeometry args={[Math.max(w, d) * 0.78, 0.46, 4]} />
    </mesh>
    <mesh position={[0, 1.12, 0]} rotation-y={Math.PI / 4} material={M.snow()}><coneGeometry args={[Math.max(w, d) * 0.7, 0.36, 4]} /></mesh>
    {[-0.45, 0, 0.45].map((x, i) => <mesh key={i} position={[x * w / 1.6, 0.52, d / 2 + 0.005]} material={M.window(lit * (i === 1 ? 0.6 : 1))}><boxGeometry args={[0.22, 0.2, 0.01]} /></mesh>)}
    <mesh position={[0.5 * w / 1.6, 0.25, d / 2 + 0.006]} material={M.wall("#3d2f25")}><boxGeometry args={[0.18, 0.4, 0.01]} /></mesh>
  </group>
);

/** A fire engine: red body, cab, ladder, and red and blue lights that flash in turn. */
export const FireEngine: React.FC<{ position: V3; rot?: number; frame: number; phase?: number }> = ({ position, rot = 0, frame, phase = 0 }) => {
  const on = Math.floor((frame + phase) / 7) % 2 === 0;
  return (
    <group position={position} rotation-y={rot}>
      <mesh position={[0, 0.35, 0]} material={M.red()} {...sh}><boxGeometry args={[1.9, 0.5, 0.55]} /></mesh>
      <mesh position={[0.82, 0.62, 0]} material={M.red()} {...sh}><boxGeometry args={[0.36, 0.36, 0.55]} /></mesh>
      <mesh position={[0.96, 0.65, 0]} material={M.glass()}><boxGeometry args={[0.08, 0.2, 0.5]} /></mesh>
      <mesh position={[-0.2, 0.66, 0]} material={M.grey()}><boxGeometry args={[1.4, 0.06, 0.2]} /></mesh>
      {[-0.6, 0.6].map((x) => [-0.29, 0.29].map((z) => <mesh key={`${x}${z}`} position={[x, 0.12, z]} rotation-x={Math.PI / 2} material={M.rubber()}><cylinderGeometry args={[0.12, 0.12, 0.08, 14]} /></mesh>))}
      <mesh position={[0.82, 0.83, -0.15]} material={glow("#ff2a2a", on ? 1 : 0.15)}><sphereGeometry args={[0.06, 8, 6]} /></mesh>
      <mesh position={[0.82, 0.83, 0.15]} material={glow("#3a7bff", on ? 0.15 : 1)}><sphereGeometry args={[0.06, 8, 6]} /></mesh>
      <pointLight position={[0.82, 1.1, 0]} intensity={on ? 3 : 2.4} distance={7} color={on ? "#ff2a2a" : "#3a7bff"} />
    </group>
  );
};

/** A bare winter tree: a trunk and a dark cone. */
const Tree: React.FC<{ position: V3; h?: number }> = ({ position, h = 1.4 }) => (
  <group position={position}>
    <mesh position={[0, h * 0.2, 0]} material={M.dark()}><cylinderGeometry args={[0.05, 0.07, h * 0.4, 6]} /></mesh>
    <mesh position={[0, h * 0.62, 0]} material={M.tree()}><coneGeometry args={[h * 0.28, h * 0.7, 7]} /></mesh>
  </group>
);

/** The street in Clarence Center under snow: two rows of houses along a road, trees, street lamps; the crash
 * house far down the street is marked only by an orange glow (`glowK`), smoke rising and the engines' lights. */
export const Town: React.FC<{ frame: number; glowK?: number; engines?: number }> = ({ frame, glowK = 0, engines = 0 }) => {
  const walls = ["#a9b2bb", "#b8a58c", "#8d9aa6", "#c2b49a", "#9aa39a", "#b0a3a3"];
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow material={M.ground()}><planeGeometry args={[260, 260]} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]} material={M.road()}><planeGeometry args={[120, 1.6]} /></mesh>
      {Array.from({ length: 18 }, (_, i) => {
        const x = -40 + i * 4.6;
        return (
          <group key={i}>
            <House position={[x, 0, -2.4]} wall={walls[i % walls.length]} lit={rnd("lit", i) > 0.3 ? 1 : 0.15} />
            <House position={[x + 2.2, 0, 2.4]} rot={Math.PI} wall={walls[(i + 3) % walls.length]} lit={rnd("lit2", i) > 0.35 ? 1 : 0.15} />
            <Tree position={[x + 1.2, 0, -4.2]} h={1.3 + rnd("tr", i) * 0.8} />
            {i % 3 === 0 && (
              <group position={[x + 1, 0, 1.1]}>
                <mesh position={[0, 0.6, 0]} material={M.dark()}><cylinderGeometry args={[0.02, 0.02, 1.2, 6]} /></mesh>
                <mesh position={[0, 1.22, 0]} material={glow("#ffd9a0", 1)}><sphereGeometry args={[0.06, 8, 6]} /></mesh>
              </group>
            )}
          </group>
        );
      })}
      {/* a second and third row behind, for a town seen from above */}
      {Array.from({ length: 40 }, (_, i) => (
        <House key={`b${i}`} position={[-60 + (i % 20) * 6, 0, (i < 20 ? -9 : 9) + rnd("bz", i) * 2]} rot={rnd("br", i) * 0.6} wall={walls[i % walls.length]} lit={rnd("bl", i) > 0.4 ? 1 : 0.1} />
      ))}
      {/* the crash site, far down the street: glow and smoke only */}
      {glowK > 0 && (
        <group position={[34, 0, -2.4]}>
          <pointLight position={[0, 2, 0]} intensity={14 * glowK} distance={30} color="#ff7a2a" />
          <mesh position={[0, 0.8, 0]} material={glow("#ff8a3a", 0.55 * glowK)}><sphereGeometry args={[1.6, 18, 12]} /></mesh>
          {Array.from({ length: 14 }, (_, i) => {
            const life = ((frame * 0.6 + i * 17) % 120) / 120;
            return <mesh key={i} position={[Math.sin(i * 2.1) * 0.6 + life * 2, 1.5 + life * 9, Math.cos(i * 1.3) * 0.6]} material={clay("#3a3d42", { opacity: Math.round((0.6 * (1 - life)) * 10) / 10 })}><sphereGeometry args={[0.6 + life * 1.6, 10, 8]} /></mesh>;
          })}
        </group>
      )}
      {engines > 0 && [[26, 0.3, 0.2], [29, -0.2, 3.1], [22, 0.1, 0]].slice(0, Math.ceil(engines * 3)).map(([x, z, r], i) => <FireEngine key={i} position={[x!, 0, z!]} rot={r} frame={frame} phase={i * 5} />)}
    </group>
  );
};

/** Runway and approach lights, far off: two rows of white lights and a flashing approach line. */
export const RunwayLights: React.FC<{ position: V3; frame: number; rot?: number }> = ({ position, frame, rot = 0 }) => (
  <group position={position} rotation-y={rot}>
    {Array.from({ length: 30 }, (_, i) => [-0.6, 0.6].map((z) => <mesh key={`${i}${z}`} position={[i * 0.9, 0.05, z]} material={glow("#fff6dc", 1)}><sphereGeometry args={[0.07, 6, 4]} /></mesh>))}
    {Array.from({ length: 10 }, (_, i) => <mesh key={`a${i}`} position={[-1 - i * 0.9, 0.06, 0]} material={glow("#ffffff", Math.floor(frame / 2) % 10 === 9 - i ? 1 : 0.3)}><sphereGeometry args={[0.09, 6, 4]} /></mesh>)}
  </group>
);

/** The ramp at Newark at night: wet apron, the terminal with lit windows, a jet bridge, floodlights. */
export const Ramp: React.FC<{ frame: number }> = ({ frame }) => (
  <group>
    <mesh rotation-x={-Math.PI / 2} receiveShadow material={clay("#3c434a")}><planeGeometry args={[300, 300]} /></mesh>
    {Array.from({ length: 16 }, (_, i) => <mesh key={i} position={[-40 + i * 5, 0.01, 4]} rotation-x={-Math.PI / 2} material={clay("#c9b14a")}><planeGeometry args={[2.5, 0.06]} /></mesh>)}
    <mesh position={[0, 1.8, -9]} material={M.terminal()} {...sh}><boxGeometry args={[80, 3.6, 5]} /></mesh>
    {Array.from({ length: 40 }, (_, i) => <mesh key={i} position={[-39 + i * 2, 2.2, -6.45]} material={M.window(0.8)}><boxGeometry args={[1.4, 1, 0.02]} /></mesh>)}
    <mesh position={[3.4, 1.15, -4.2]} rotation-y={0.5} material={M.grey()} {...sh}><boxGeometry args={[0.7, 0.6, 5]} /></mesh>
    {[-14, 0, 14].map((x, i) => (
      <group key={i} position={[x, 0, -5]}>
        <mesh position={[0, 4, 0]} material={M.dark()}><cylinderGeometry args={[0.08, 0.1, 8, 8]} /></mesh>
        <mesh position={[0, 8, 0.2]} material={glow("#fff2cf", 1)}><boxGeometry args={[0.9, 0.3, 0.2]} /></mesh>
        <pointLight position={[0, 7.5, 1.5]} intensity={5} distance={22} color="#ffe9c0" />
      </group>
    ))}
    {Array.from({ length: 6 }, (_, i) => <mesh key={`b${i}`} position={[-30 + i * 3, 0.1, 9]} material={glow(i % 2 ? "#3dff7a" : "#3a7bff", 0.5 + 0.5 * Math.sin(frame * 0.1 + i))}><sphereGeometry args={[0.08, 6, 4]} /></mesh>)}
  </group>
);

export default Q400;
