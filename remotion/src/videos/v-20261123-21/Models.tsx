// Models: the models and places this video's beats share (all procedural, nothing downloaded).
// The first handheld Motorola phone (a tall off-white handset, narrow from the front, deep from the
// side: keypad, earpiece grille, a small display window, a stubby antenna on top and the wordmark
// painted on its face), its insides (radio boards, antenna, battery pack), a modern phone from the kit
// beside it at the same scale (1 unit = about 47 mm, the modern phone 3.1 units tall), a clay brick, a
// seventies workbench, a city block at night, a rooftop radio tower, honeycomb cells, a New York street
// in daylight, a shop counter with a weighing scale. No figures in here.
import React from "react";
import { Easing } from "remotion";
import { Block, Board, cue, glow, mat, Phone, rnd, TECH, type V3 } from "../../three/index";

type Group = React.JSX.IntrinsicElements["group"];

export const k01 = (f: number, a: number, d: number, e = Easing.inOut(Easing.cubic)) => cue(f, a, Math.max(1, d), e);
export const q = (x: number, n = 20) => Math.round(x * n) / n;

export const SHELL = "#e9e3d6";
export const SHELL_DARK = "#c9c1b0";
export const BACK = { top: "#121a30", bottom: "#04060c", glow: "rgba(120,170,255,0.10)" };

/** the handset's body (front width, height, depth) and antenna; it stands on y = 0, face toward +z */
export const HS = { w: 0.95, h: 5.2, d: 1.85, ant: 1.1 } as const;

// ------------------------------------------------------------------ the handset
/** The handset, standing. `keys` 0..1 lights the keypad row by row; `lit` lights the display window;
 * `shell` 1 = closed, 0 = the shell gone (its insides show; see Insides); `mark` lights the wordmark. */
export const Handset: React.FC<Group & { keys?: number; lit?: number; shell?: number; mark?: number }> = ({ keys = 0, lit = 0.3, shell = 1, mark = 0.6, ...g }) => {
  const { w, h, d, ant } = HS;
  const so = q(shell);
  return (
    <group {...g}>
      {so > 0 && (
        <group>
          {/* the body: a lower part and a slightly narrower top with the earpiece */}
          <Block size={[w, h * 0.78, d]} radius={0.1} material={mat("white", SHELL, { roughness: 0.55, transparent: so < 1, opacity: so })} position={[0, h * 0.39, 0]} />
          <Block size={[w * 0.92, h * 0.24, d * 0.9]} radius={0.1} material={mat("white", SHELL_DARK, { roughness: 0.5, transparent: so < 1, opacity: so })} position={[0, h * 0.86, -0.02]} />
          {/* earpiece grille */}
          {Array.from({ length: 5 }, (_, i) => (
            <Block key={`e${i}`} size={[w * 0.55, 0.035, 0.02]} radius={0.01} preset="blackPlastic" position={[0, h * 0.9 - i * 0.08, d * 0.45 + 0.01]} />
          ))}
          {/* display window */}
          <mesh position={[0, h * 0.7, d / 2 + 0.012]} material={glow("#ff3b2f", q(0.15 + 0.85 * lit))}><planeGeometry args={[w * 0.62, 0.2]} /></mesh>
          <Block size={[w * 0.72, 0.3, 0.03]} radius={0.02} preset="glossy" position={[0, h * 0.7, d / 2 - 0.004]} />
          {/* the wordmark's plate (the name itself is a label in the beats) */}
          <mesh position={[0, h * 0.6, d / 2 + 0.012]} material={glow("#dfe8ff", q(0.15 + 0.6 * mark))}>
            <planeGeometry args={[w * 0.7, w * 0.12]} />
          </mesh>
          {/* keypad: 3 × 6 buttons, lit row by row */}
          {Array.from({ length: 18 }, (_, i) => {
            const r = Math.floor(i / 3), c = i % 3;
            const on = q(Math.max(0, Math.min(1, keys * 6 - r)));
            return (
              <group key={`k${i}`} position={[(c - 1) * w * 0.28, h * 0.49 - r * 0.34, d / 2 + 0.03]}>
                <Block size={[w * 0.22, 0.22, 0.06]} radius={0.03} preset="blackPlastic" color="#3a3d46" />
                <mesh position={[0, 0, 0.032]} material={glow("#9fe6ff", q(0.05 + 0.85 * on))}><planeGeometry args={[w * 0.12, 0.05]} /></mesh>
              </group>
            );
          })}
          {/* mouthpiece */}
          <Block size={[w * 0.5, 0.12, 0.03]} radius={0.03} preset="blackPlastic" position={[0, h * 0.06, d / 2 + 0.01]} />
        </group>
      )}
      {/* the antenna stub on top, at the back */}
      <mesh position={[w * 0.18, h + ant / 2 - 0.05, -d * 0.2]} material={mat("rubber", "#2a2b30")}><cylinderGeometry args={[0.09, 0.12, ant, 20]} /></mesh>
    </group>
  );
};

/** The handset's insides, assembled where they sit; `apart` 0..1 lifts them away from each other. */
export const Insides: React.FC<Group & { apart?: number; radio?: number; antenna?: number; battery?: number; power?: number }> = ({ apart = 0, radio = 0, antenna = 0, battery = 0, power = 0, ...g }) => {
  const { w, h, d, ant } = HS;
  return (
    <group {...g}>
      {/* two radio boards, sliding out to the left */}
      <group position={[-2.1 * radio, 0, 0]}>
        <group position={[0, h * 0.62, 0.25]} rotation-x={Math.PI / 2}>
          <Board size={[w * 0.8, h * 0.4]} seed="dyna-a" traces={14} parts={10} />
        </group>
        <group position={[0, h * 0.62, -0.35]} rotation-x={Math.PI / 2}>
          <Board size={[w * 0.8, h * 0.4]} seed="dyna-b" traces={14} parts={10} dark />
        </group>
        <mesh position={[0, h * 0.62, -0.05]} material={glow(TECH.lime, q(0.1 + 0.5 * radio + 0.4 * power))}><boxGeometry args={[w * 0.7, h * 0.36, 0.04]} /></mesh>
      </group>
      {/* the antenna, rising out of the top */}
      <group position={[w * 0.18, h + ant / 2 - 0.05 + 1.4 * antenna + 0.6 * apart, -d * 0.2]}>
        <mesh material={mat("rubber", "#2a2b30")}><cylinderGeometry args={[0.09, 0.12, ant, 20]} /></mesh>
        <mesh position={[0, -ant / 2 - 0.5, 0]} material={glow(TECH.cyan, q(0.1 + 0.9 * antenna))}><cylinderGeometry args={[0.03, 0.03, 1.0, 10]} /></mesh>
      </group>
      {/* the battery pack, dropping out of the bottom */}
      <group position={[0, h * 0.2 - 0.9 * battery - 0.3 * apart, 0]}>
        <Block size={[w * 0.86, h * 0.36, d * 0.86]} radius={0.06} preset="battery" />
        <mesh position={[0, 0, d * 0.43 + 0.005]} material={glow(TECH.amber, q(0.1 + 0.8 * Math.max(battery, power)))}><planeGeometry args={[w * 0.5, 0.08]} /></mesh>
      </group>
      {/* power lines from the battery up into the boards */}
      {power > 0 && [-0.2, 0.2].map((x, i) => (
        <mesh key={i} position={[x - 1.05 * radio, h * 0.4, d * 0.3]} material={glow(TECH.amber, q(power))}>
          <boxGeometry args={[0.03, h * 0.3 * power, 0.03]} />
        </mesh>
      ))}
    </group>
  );
};

/** The modern phone from the kit, standing upright, screen toward +z, its foot on y = 0. */
export const ModernPhone: React.FC<Group & { glowScreen?: number }> = ({ glowScreen = 1, ...g }) => (
  <group {...g}>
    <group position={[0, 1.55, 0]} rotation-x={Math.PI / 2}>
      <Phone glowScreen={glowScreen} />
    </group>
  </group>
);

/** A clay brick standing on end (about 215 × 102 × 65 mm at the handset's scale). */
export const Brick: React.FC<Group> = (g) => (
  <group {...g}>
    <Block size={[2.15, 4.55, 1.37]} radius={0.05} preset="clay" color="#a3452c" position={[0, 2.275, 0]} />
    {[1.3, 3.25].map((y, i) => (
      <mesh key={i} position={[0, y, 0.69]} material={mat("clay", "#7c3220")}><cylinderGeometry args={[0.32, 0.32, 0.02, 20]} /></mesh>
    ))}
  </group>
);

/** A round plinth with a lit rim. */
export const Plinth: React.FC<Group & { r?: number; rim?: number }> = ({ r = 1.6, rim = 0.6, ...g }) => (
  <group {...g}>
    <mesh position={[0, 0.15, 0]} material={mat("glossy", "#141824")} receiveShadow castShadow><cylinderGeometry args={[r, r * 1.04, 0.3, 48]} /></mesh>
    <mesh position={[0, 0.305, 0]} rotation-x={-Math.PI / 2} material={glow(TECH.cyan, q(rim))}><ringGeometry args={[r * 0.96, r, 64]} /></mesh>
  </group>
);

// ------------------------------------------------------------------ the bench (metre scale)
/** A seventies electronics workbench against a pegboard wall: wooden top, a lamp, a soldering iron
 * with a glowing tip, an oscilloscope with a green trace, boards. `f` drives the scope and the iron. */
export const Bench: React.FC<Group & { f: number; lamp?: number }> = ({ f, lamp = 1, ...g }) => (
  <group {...g}>
    <mesh position={[0, 1.6, -0.75]} receiveShadow><planeGeometry args={[6, 3.2]} /><meshStandardMaterial color="#6b5a43" roughness={0.95} /></mesh>
    {Array.from({ length: 60 }, (_, i) => (
      <mesh key={i} position={[-2.6 + (i % 15) * 0.37, 0.9 + Math.floor(i / 15) * 0.42, -0.74]} material={mat("blackPlastic", "#3b3226")}><circleGeometry args={[0.025, 8]} /></mesh>
    ))}
    <Block size={[3.4, 0.08, 1.2]} radius={0.02} preset="white" color="#8a6440" position={[0, 0.76, -0.1]} />
    {[[-1.6, -0.6], [1.6, -0.6], [-1.6, 0.4], [1.6, 0.4]].map(([x, z], i) => (
      <Block key={i} size={[0.07, 0.76, 0.07]} radius={0.01} preset="aluminium" position={[x!, 0.38, z!]} />
    ))}
    {/* oscilloscope */}
    <group position={[1.15, 0.8, -0.45]}>
      <Block size={[0.6, 0.42, 0.45]} radius={0.03} preset="white" color="#c7c2b5" position={[0, 0.21, 0]} />
      <mesh position={[-0.08, 0.24, 0.226]} material={glow("#1c3b24", 1)}><planeGeometry args={[0.3, 0.24]} /></mesh>
      {Array.from({ length: 16 }, (_, i) => (
        <mesh key={i} position={[-0.21 + i * 0.0175, 0.24 + 0.07 * Math.sin(i * 0.8 + f * 0.25), 0.228]} material={glow(TECH.lime)}><circleGeometry args={[0.008, 6]} /></mesh>
      ))}
      {[0, 1, 2].map((i) => <mesh key={`b${i}`} position={[0.18, 0.32 - i * 0.08, 0.226]} material={mat("blackPlastic")}><circleGeometry args={[0.025, 12]} /></mesh>)}
    </group>
    {/* soldering iron in its stand */}
    <group position={[-1.2, 0.82, -0.2]} rotation-z={0.9}>
      <mesh material={mat("blackPlastic", "#2b5fa8")}><cylinderGeometry args={[0.025, 0.025, 0.28, 12]} /></mesh>
      <mesh position={[0, 0.2, 0]} material={mat("brushed")}><cylinderGeometry args={[0.008, 0.012, 0.14, 8]} /></mesh>
      <mesh position={[0, 0.275, 0]} material={glow("#ff6a2a", q(0.6 + 0.4 * Math.sin(f * 0.3) ** 2))}><sphereGeometry args={[0.012, 8, 6]} /></mesh>
    </group>
    {/* lamp */}
    <group position={[0.45, 0.8, -0.55]}>
      <mesh material={mat("blackPlastic")}><cylinderGeometry args={[0.1, 0.12, 0.04, 20]} /></mesh>
      <mesh position={[0.1, 0.3, 0]} rotation-z={-0.3} material={mat("blackPlastic")}><cylinderGeometry args={[0.015, 0.015, 0.6, 8]} /></mesh>
      <mesh position={[0.28, 0.58, 0.05]} rotation-z={0.8} material={mat("white", "#2f6b4f")}><coneGeometry args={[0.13, 0.18, 24, 1, true]} /></mesh>
      <pointLight position={[0.35, 0.5, 0.2]} intensity={3.5 * lamp} distance={3.5} color="#ffd59a" />
    </group>
  </group>
);

/** A wall calendar: a red header bar and a stack of pages; `torn` pages have flown off by now. */
export const Calendar: React.FC<Group & { f: number; tearFrom: number; tearTo: number; pages?: number }> = ({ f, tearFrom, tearTo, pages = 6, ...g }) => {
  return (
    <group {...g}>
      <Block size={[0.8, 0.16, 0.04]} radius={0.01} preset="white" color="#b3261e" position={[0, 0.42, 0]} />
      <Block size={[0.78, 0.8, 0.02]} radius={0.005} preset="white" color="#f3efe4" position={[0, 0, -0.01]} />
      {Array.from({ length: pages }, (_, i) => {
        const at = tearFrom + ((tearTo - tearFrom) * i) / Math.max(1, pages);
        const k = k01(f, at, 10, Easing.in(Easing.quad));
        if (k >= 1) return null;
        return (
          <group key={i} position={[0, 0.34, 0.012 + 0.002 * (pages - i)]} rotation-x={-2.2 * k}>
            <mesh position={[0.25 * k, -0.37 + 0.2 * k, 0]} material={mat("white", i % 2 ? "#f6f2e7" : "#efe9da", { side: 2 as const, transparent: k > 0.6, opacity: 1 - Math.max(0, k - 0.6) * 2.5 })}>
              <planeGeometry args={[0.76, 0.72]} />
            </mesh>
            {Array.from({ length: 12 }, (_, j) => (
              <mesh key={j} position={[-0.27 + (j % 4) * 0.18 + 0.25 * k, -0.2 - Math.floor(j / 4) * 0.17 + 0.2 * k, 0.002]} material={mat("blackPlastic", "#7b7466")}>
                <planeGeometry args={[0.1, 0.07]} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
};

// ------------------------------------------------------------------ the city at night (block scale: 1 unit ≈ 10 m)
/** A grid of city blocks seen from above: towers with lit windows, dark streets between. */
export const CityGrid: React.FC<Group & { n?: number; lights?: number; seed?: string }> = ({ n = 7, lights = 1, seed = "city", ...g }) => {
  const s = 2.4;
  return (
    <group {...g}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, 0]} receiveShadow><planeGeometry args={[n * s + 8, n * s + 8]} /><meshStandardMaterial color="#0d111b" roughness={0.9} /></mesh>
      {Array.from({ length: n * n }, (_, i) => {
        const x = (i % n - (n - 1) / 2) * s, z = (Math.floor(i / n) - (n - 1) / 2) * s;
        const hgt = 0.6 + 3.2 * rnd(seed, i) ** 2;
        const wl = q(lights * (rnd(`${seed}w`, i) > 0.35 ? 0.85 : 0.2));
        return (
          <group key={i} position={[x, 0, z]}>
            <Block size={[1.6, hgt, 1.6]} radius={0.04} preset="clay" color={rnd(`${seed}c`, i) > 0.5 ? "#2c3240" : "#343038"} position={[0, hgt / 2, 0]} />
            {Array.from({ length: Math.max(1, Math.floor(hgt / 0.4)) }, (_, j) => (
              <mesh key={j} position={[0, 0.25 + j * 0.4, 0.805]} material={glow("#ffd68f", q(wl * (rnd(`${seed}j`, i * 20 + j) > 0.3 ? 1 : 0.2)))}><planeGeometry args={[1.2, 0.12]} /></mesh>
            ))}
            {Array.from({ length: Math.max(1, Math.floor(hgt / 0.4)) }, (_, j) => (
              <mesh key={`s${j}`} position={[0.805, 0.25 + j * 0.4, 0]} rotation-y={Math.PI / 2} material={glow("#ffd68f", q(wl * (rnd(`${seed}k`, i * 20 + j) > 0.4 ? 0.9 : 0.15)))}><planeGeometry args={[1.2, 0.12]} /></mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
};

/** The height of block i in CityGrid (to put a tower on its roof). */
export const blockTop = (i: number, seed = "city") => 0.6 + 3.2 * rnd(seed, i) ** 2;
export const blockAt = (i: number, n = 7): V3 => [(i % n - (n - 1) / 2) * 2.4, 0, (Math.floor(i / n) - (n - 1) / 2) * 2.4];

/** A lattice radio mast with a dish and a red beacon; `lit` makes its tip glow. */
export const Tower: React.FC<Group & { h?: number; lit?: number; f?: number }> = ({ h = 2.2, lit = 0.3, f = 0, ...g }) => (
  <group {...g}>
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
      <mesh key={i} position={[x! * 0.12, h / 2, z! * 0.12]} rotation={[z! * 0.05, 0, -x! * 0.05]} material={mat("aluminium")}><cylinderGeometry args={[0.02, 0.025, h, 6]} /></mesh>
    ))}
    {Array.from({ length: 6 }, (_, i) => (
      <mesh key={`r${i}`} position={[0, 0.2 + i * (h / 6.5), 0]} material={mat("aluminium")}><boxGeometry args={[0.28 - i * 0.02, 0.02, 0.28 - i * 0.02]} /></mesh>
    ))}
    <group position={[0.12, h * 0.78, 0.12]} rotation={[0.3, 0.8, 0]}>
      <mesh material={mat("white", "#dfe3ea", { side: 2 as const })}><sphereGeometry args={[0.2, 20, 10, 0, Math.PI * 2, 0, 0.9]} /></mesh>
    </group>
    <mesh position={[0, h + 0.05, 0]} material={glow(lit > 0.5 ? TECH.cyan : "#ff3b2f", q(0.4 + 0.6 * Math.max(lit, Math.sin(f * 0.2) ** 2)))}><sphereGeometry args={[0.06 + 0.05 * lit, 12, 8]} /></mesh>
  </group>
);

/** Rings of radio waves spreading from a point (flat, on the ground plane or upright toward `face`). */
export const Waves: React.FC<Group & { f: number; start: number; n?: number; reach?: number; color?: string; upright?: boolean }> = ({ f, start, n = 4, reach = 4, color = TECH.cyan, upright = false, ...g }) => {
  if (f < start) return null;
  return (
    <group {...g}>
      {Array.from({ length: n }, (_, i) => {
        const u = (((f - start) / 40 + i / n) % 1);
        const r = 0.2 + u * reach;
        return (
          <mesh key={i} rotation-x={upright ? 0 : -Math.PI / 2} material={glow(color, q(0.85 * (1 - u)))}>
            <ringGeometry args={[r, r + 0.06, 64]} />
          </mesh>
        );
      })}
    </group>
  );
};

/** One hexagonal cell outline on the ground; `fill` washes it with colour. */
export const Hex: React.FC<Group & { r: number; line?: number; fill?: number; color?: string }> = ({ r, line = 1, fill = 0, color = TECH.cyan, ...g }) => (
  <group {...g}>
    <mesh rotation-x={-Math.PI / 2} rotation-z={Math.PI / 6} material={glow(color, q(line))}><ringGeometry args={[r * 0.95, r, 6, 1]} /></mesh>
    {fill > 0 && <mesh rotation-x={-Math.PI / 2} rotation-z={Math.PI / 6} position={[0, 0.005, 0]} material={glow(color, q(fill * 0.3))}><circleGeometry args={[r * 0.95, 6]} /></mesh>}
  </group>
);

// ------------------------------------------------------------------ the New York street (person scale: 1 unit ≈ 1 m)
/** An avenue in daylight: towers both sides with window grids, pavements, a crossing. */
export const Avenue: React.FC<Group & { length?: number }> = ({ length = 60, ...g }) => (
  <group {...g}>
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, -length / 2 + 6]} receiveShadow><planeGeometry args={[14, length]} /><meshStandardMaterial color="#3d4048" roughness={0.9} /></mesh>
    {[-5.2, 5.2].map((x, s) => (
      <mesh key={s} position={[x, 0.08, -length / 2 + 6]} receiveShadow material={mat("clay", "#a39c90")}><boxGeometry args={[2.4, 0.16, length]} /></mesh>
    ))}
    {Array.from({ length: 6 }, (_, i) => (
      <mesh key={`z${i}`} rotation-x={-Math.PI / 2} position={[-3 + i * 1.2, 0.01, 1.5]} material={mat("white", "#e9e6dd")}><planeGeometry args={[0.6, 2.4]} /></mesh>
    ))}
    {Array.from({ length: 16 }, (_, i) => {
      const side = i % 2 ? 1 : -1;
      const z = -Math.floor(i / 2) * 7.5 - 2;
      const hgt = 14 + 26 * rnd("ny", i);
      const col = ["#b9a68a", "#8f8a85", "#a07c62", "#c7c0b2"][i % 4]!;
      return (
        <group key={i} position={[side * 10.5, 0, z]}>
          <Block size={[8, hgt, 7]} radius={0.05} preset="clay" color={col} position={[0, hgt / 2, 0]} />
          {Array.from({ length: Math.floor(hgt / 2.2) }, (_, j) => (
            <mesh key={j} position={[-side * 4.01, 1.6 + j * 2.2, 0]} rotation-y={-side * Math.PI / 2} material={mat("glossy", "#40506a")}><planeGeometry args={[6, 1.1]} /></mesh>
          ))}
        </group>
      );
    })}
  </group>
);

/** A simple faceless clay figure (about 1.75 m), optionally holding the handset to his ear. */
export const Person: React.FC<Group & { raise?: number; coat?: string }> = ({ raise = 0, coat = "#3c4a63", ...g }) => (
  <group {...g}>
    {[-0.11, 0.11].map((x, i) => <mesh key={i} position={[x, 0.42, 0]} material={mat("clay", "#2b2d33")} castShadow><capsuleGeometry args={[0.08, 0.7, 4, 10]} /></mesh>)}
    <mesh position={[0, 1.15, 0]} material={mat("clay", coat)} castShadow><capsuleGeometry args={[0.22, 0.5, 6, 14]} /></mesh>
    <mesh position={[0, 1.66, 0]} material={mat("clay", "#d8bfa3")} castShadow><sphereGeometry args={[0.14, 20, 14]} /></mesh>
    <mesh position={[-0.28, 1.12, 0]} rotation-z={0.12} material={mat("clay", coat)}><capsuleGeometry args={[0.06, 0.55, 4, 8]} /></mesh>
    <group position={[0.26, 1.38, 0]} rotation-z={lerpArm(raise)}>
      <mesh position={[0, -0.28, 0]} material={mat("clay", coat)}><capsuleGeometry args={[0.06, 0.55, 4, 8]} /></mesh>
      <Handset scale={0.055} position={[-0.04, -0.68, 0.06]} rotation-z={Math.PI} lit={0.9} keys={1} />
    </group>
  </group>
);
function lerpArm(k: number) { return -0.15 + (Math.PI * 0.85) * k; }

// ------------------------------------------------------------------ the shop (handset scale)
/** A shop counter with a glass front, a back wall of shelves, and a digital weighing scale on top. */
export const Counter: React.FC<Group> = (g) => (
  <group {...g}>
    <Block size={[14, 3.2, 4]} radius={0.06} preset="white" color="#5a3f2c" position={[0, -1.6, 0]} />
    <Block size={[14.2, 0.18, 4.2]} radius={0.04} preset="glossy" color="#1a1d26" position={[0, 0.0, 0]} />
    <mesh position={[0, 4.5, -4]} receiveShadow><planeGeometry args={[30, 14]} /><meshStandardMaterial color="#2a2f3d" roughness={0.9} /></mesh>
    {[1.5, 4.5, 7.5].map((y, i) => <Block key={i} size={[16, 0.12, 1.2]} radius={0.02} preset="white" color="#8b6a4a" position={[0, y, -3.4]} />)}
    {Array.from({ length: 12 }, (_, i) => (
      <Block key={`b${i}`} size={[0.9 + 0.5 * rnd("box", i), 1.0 + 0.8 * rnd("boxh", i), 0.9]} radius={0.05} preset="clay"
        color={["#c9a45c", "#7a8fb0", "#b2574a", "#d8d2c4"][i % 4]!} position={[-7 + (i % 6) * 2.6, 1.56 + Math.floor(i / 6) * 3 + 0.5, -3.3]} />
    ))}
  </group>
);

/** A digital kitchen scale: a platform, a body and a display (the figure goes on it from the beat). */
export const Scale: React.FC<Group & { press?: number; lit?: number }> = ({ press = 0, lit = 0.6, ...g }) => (
  <group {...g}>
    <Block size={[3.4, 0.5, 3.0]} radius={0.12} preset="white" color="#dfe2e8" position={[0, 0.25, 0]} />
    <Block size={[3.0, 0.1, 2.6]} radius={0.05} preset="brushed" position={[0, 0.55 - 0.06 * press, 0]} />
    <Block size={[1.6, 0.42, 0.06]} radius={0.04} preset="glossy" position={[0, 0.25, 1.52]} />
    <mesh position={[0, 0.25, 1.556]} material={glow("#79ffb0", q(0.08 + 0.3 * lit))}><planeGeometry args={[1.4, 0.3]} /></mesh>
  </group>
);

/** A corrugated roller shutter, `down` 0..1 from rolled up to closed over a w × h opening. */
export const Shutter: React.FC<Group & { down: number; w?: number; h?: number }> = ({ down, w = 14, h = 12, ...g }) => {
  const k = q(down, 40);
  if (k <= 0) return null;
  return (
    <group {...g}>
      <Block size={[w + 0.6, 0.8, 0.8]} radius={0.1} preset="aluminium" color="#8c939e" position={[0, h + 0.4, 0]} />
      {Array.from({ length: Math.ceil(16 * k) }, (_, i) => (
        <Block key={i} size={[w, h / 16 - 0.04, 0.12]} radius={0.03} preset="aluminium" color={i % 2 ? "#a3aab5" : "#959ca8"} position={[0, h - (i + 0.5) * (h / 16), 0]} />
      ))}
    </group>
  );
};

export { glow, mat, Board };
export default Handset;
