// Parts: the models and places this video's beats share (all procedural, nothing downloaded).
// The 1947 point-contact transistor (a metal base, a germanium slab, a clear plastic wedge with gold
// foil on its two lower faces, slit at the tip, and the bent wire spring that presses it down), a lab
// bench at Bell Labs, an oscilloscope, a bulb, and the phone opened to its chip.
// Everything is a function of the values passed in; no figures here.
import React from "react";
import { Easing } from "remotion";
import { Block, ChipPackage, cue, glow, mat, PhonePartModel, PHONE, PHONE_STACK, rnd, TECH, Wire, type V3 } from "../../three/index";

type Group = React.JSX.IntrinsicElements["group"];

export const GOLD = "#f2c45a";
export const WARM = "#ffb84a";

/** 0..1 between two frames, eased. */
export const k01 = (f: number, a: number, d: number, e = Easing.inOut(Easing.cubic)) => cue(f, a, Math.max(1, d), e);
const q = (x: number, n = 10) => Math.round(x * n) / n;

// ------------------------------------------------------------------ the transistor
/** Height of the base + slab top (where the wedge's tip touches). */
export const SLAB_TOP = 0.26;
export const WEDGE_R = 0.34;
/** The tip of the wedge, when pressed down (relative to the transistor). */
export const TIP: V3 = [0, SLAB_TOP + 0.005, 0];

/** The wedge alone: a clear plastic triangle, point down at y=0, `slit` 0..1 splits its gold foil
 * into two strips with a hairline gap at the tip; `lit` 0..1 glows the gold; `wrap` 0..1 how much of
 * each face the foil covers (from the tip up). */
export const Wedge: React.FC<Group & { slit?: number; lit?: number; litL?: number; litR?: number; wrap?: number }> = ({ slit = 1, lit = 0, litL, litR, wrap = 1, ...g }) => {
  const r = WEDGE_R;
  const depth = 0.16;
  const face = r * Math.sqrt(3);
  const gap = 0.012 * slit;
  const w = Math.max(0.001, wrap);
  const strip = (side: 1 | -1, l: number) => {
    const ang = side > 0 ? Math.PI / 3 : (2 * Math.PI) / 3;
    const len = face * w;
    const cx = Math.cos(ang) * len / 2 + side * gap;
    const cy = Math.sin(ang) * len / 2;
    const em = q(l);
    return (
      <mesh position={[cx, cy, 0]} rotation-z={ang} material={mat("gold", undefined, { emissive: WARM, emissiveIntensity: 0.15 + 1.4 * em })} castShadow>
        <boxGeometry args={[len, 0.014, depth * 0.55]} />
      </mesh>
    );
  };
  return (
    <group {...g}>
      {/* the clear plastic prism, point down */}
      <mesh position={[0, r, 0]} rotation-x={Math.PI / 2} material={mat("glass", "#cfefff", { opacity: 0.45 })}>
        <cylinderGeometry args={[r, r, depth, 3]} />
      </mesh>
      <mesh position={[0, r, 0]} rotation-x={Math.PI / 2} material={glow(TECH.cyan, 0.12)}>
        <cylinderGeometry args={[r * 1.01, r * 1.01, depth * 1.01, 3, 1, true]} />
      </mesh>
      {strip(1, litR ?? lit)}
      {strip(-1, litL ?? lit)}
      {/* the foil over the point, before the razor cut */}
      {slit < 0.5 && (
        <mesh position={[0, 0.004, 0]} material={mat("gold")}>
          <boxGeometry args={[0.05, 0.012, depth * 0.55]} />
        </mesh>
      )}
    </group>
  );
};

/** The whole device: base, slab, the wedge held `lift` above the slab, the spring pressing on it.
 * `glowL` / `glowR` light the two contacts, `slabLit` the germanium under them. */
export const Transistor: React.FC<Group & { lift?: number; slit?: number; glowL?: number; glowR?: number; slabLit?: number; spring?: number; xr?: number }> = ({
  lift = 0, slit = 1, glowL = 0, glowR = 0, slabLit = 0, spring = 1, xr = 0, ...g
}) => {
  const y = SLAB_TOP + 0.004 + lift;
  const top: V3 = [0, y + WEDGE_R * 1.5 + 0.02, 0];
  return (
    <group {...g}>
      {/* the metal base the germanium sits on (the third connection) */}
      <Block size={[0.9, 0.16, 0.9]} radius={0.02} preset="brushed" color="#8f96a3" position={[0, 0.08, 0]} />
      {/* the germanium slab */}
      <Block size={[0.56, 0.1, 0.56]} radius={0.01} material={xr > 0.05 ? mat("glass", "#9aa6b8", { opacity: q(0.9 - 0.6 * xr) }) : mat("silicon", "#5d6472", { emissive: WARM, emissiveIntensity: q(slabLit) * 0.8 })} position={[0, 0.21, 0]} />
      <Wedge position={[0, y, 0]} slit={slit} litL={glowL} litR={glowR} />
      {/* the spring: a post and a bent wire down to the wedge's top */}
      <mesh position={[0.62, 0.55, 0]} material={mat("brushed", "#6a707c")} castShadow><cylinderGeometry args={[0.03, 0.03, 0.9, 10]} /></mesh>
      <Wire points={[[0.62, 0.98, 0], [0.45, 1.08 - 0.05 * spring, 0], [0.18, top[1] + 0.12 * spring, 0], [0, top[1], 0]]} radius={0.012} preset="brushed" />
      {/* the two wires off the gold strips */}
      <Wire points={[[-0.2, y + 0.25, 0.05], [-0.55, y + 0.35, 0.1], [-0.85, 0.3, 0.2]]} radius={0.01} preset="copper" />
      <Wire points={[[0.2, y + 0.25, -0.05], [0.4, y + 0.35, -0.3], [0.7, 0.3, -0.5]]} radius={0.01} preset="copper" />
    </group>
  );
};

// ------------------------------------------------------------------ the lab
/** A Bell Labs bench (top at y=0), a back wall, a desk lamp at the left. `lamp` 0..1. */
export const Bench: React.FC<Group & { lamp?: number; f?: number }> = ({ lamp = 1, f = 0, ...g }) => (
  <group {...g}>
    <Block size={[8, 0.1, 2.2]} radius={0.02} preset="clay" color="#5e4b38" position={[0, -0.05, 0]} />
    <Block size={[8, 1.6, 2]} radius={0.02} preset="clay" color="#3b3a3f" position={[0, -0.9, 0]} />
    <mesh position={[0, 1.8, -1.15]} material={mat("clay", "#2e3540")} receiveShadow><boxGeometry args={[10, 4, 0.05]} /></mesh>
    {/* a shelf of instruments with dim dials */}
    <Block size={[6, 0.05, 0.36]} preset="clay" color="#5e4b38" position={[0, 1.55, -0.95]} />
    {Array.from({ length: 6 }, (_, i) => (
      <group key={i} position={[-2.5 + i * 1.0, 1.8, -0.95]}>
        <Block size={[0.7, 0.42, 0.3]} radius={0.03} preset="blackPlastic" color="#24282e" />
        <mesh position={[0, 0.02, 0.16]} material={glow(i % 2 ? "#7cf2a6" : WARM, q(0.3 + 0.25 * Math.max(0, Math.sin(f * 0.12 + i * 1.9))))}>
          <circleGeometry args={[0.1, 20]} />
        </mesh>
      </group>
    ))}
    <group position={[-2.4, 0, -0.4]}>
      <mesh position={[0, 0.03, 0]} material={mat("glossy", "#26302b")}><cylinderGeometry args={[0.2, 0.22, 0.06, 24]} /></mesh>
      <mesh position={[0.15, 0.5, 0]} rotation-z={-0.3} material={mat("brushed")}><cylinderGeometry args={[0.02, 0.02, 1, 8]} /></mesh>
      <mesh position={[0.4, 0.98, 0]} rotation-z={0.9} material={mat("glossy", "#26302b")}><coneGeometry args={[0.2, 0.3, 24, 1, true]} /></mesh>
      <mesh position={[0.48, 0.92, 0]} material={glow("#fff0c8", q(0.3 + 0.7 * lamp))}><sphereGeometry args={[0.06, 12, 10]} /></mesh>
      <pointLight position={[0.8, 0.9, 0.4]} intensity={1 + 9 * lamp} distance={6} color="#ffe2a8" />
    </group>
  </group>
);

/** A wall calendar page (about 0.7 × 0.8). */
export const Calendar: React.FC<Group & { flip?: number }> = ({ flip = 0, ...g }) => (
  <group {...g}>
    <mesh material={mat("white", "#efe8d8")}><boxGeometry args={[0.7, 0.8, 0.01]} /></mesh>
    <mesh position={[0, 0.32, 0.007]} material={mat("clay", "#b0302a")}><boxGeometry args={[0.7, 0.16, 0.004]} /></mesh>
    {Array.from({ length: 20 }, (_, i) => (
      <mesh key={i} position={[-0.27 + (i % 5) * 0.135, 0.12 - Math.floor(i / 5) * 0.12, 0.008]} material={mat("clay", "#8a8478")}>
        <boxGeometry args={[0.06, 0.05, 0.002]} />
      </mesh>
    ))}
    {flip > 0.01 && flip < 0.99 && (
      <mesh position={[0, 0.4 - 0.4 * flip, 0.02 + 0.1 * Math.sin(flip * Math.PI)]} rotation-x={-flip * Math.PI * 0.9} material={mat("white", "#f6f0e2")}>
        <boxGeometry args={[0.68, 0.78, 0.004]} />
      </mesh>
    )}
  </group>
);

/** A wall sign plate (Label3D writes the words). */
export const Plate: React.FC<Group & { w?: number; h?: number; lit?: number; color?: string }> = ({ w = 1.4, h = 0.3, lit = 0.5, color = TECH.cyan, ...g }) => (
  <group {...g}>
    <mesh material={mat("glossy", "#11151d")}><boxGeometry args={[w, h, 0.03]} /></mesh>
    <mesh position={[0, -h / 2 + 0.02, 0.018]} material={glow(color, q(lit))}><boxGeometry args={[w * 0.92, 0.012, 0.002]} /></mesh>
  </group>
);

/** Tweezers, a razor blade and a roll of gold foil, laid on the bench. `roll` 0..1 rolls them in. */
export const Tools: React.FC<Group & { roll?: number }> = ({ roll = 1, ...g }) => {
  const r = Easing.out(Easing.cubic)(Math.min(1, Math.max(0, roll)));
  return (
    <group {...g}>
      <group position={[-0.9 + 0.9 * r, 0.06, 0.2]} rotation-z={(1 - r) * 4}>
        <mesh rotation-z={Math.PI / 2} material={mat("gold")} castShadow><cylinderGeometry args={[0.06, 0.06, 0.4, 24]} /></mesh>
        <mesh rotation-z={Math.PI / 2} material={mat("clay", "#cfc8b8")}><cylinderGeometry args={[0.025, 0.025, 0.44, 12]} /></mesh>
      </group>
      <group position={[0.1, 0.01, 0.45 - 0.3 * (1 - r)]} rotation-y={0.4}>
        <mesh position={[0, 0, -0.02]} rotation-y={0.04} material={mat("brushed")}><boxGeometry args={[0.5, 0.012, 0.02]} /></mesh>
        <mesh position={[0, 0, 0.02]} rotation-y={-0.04} material={mat("brushed")}><boxGeometry args={[0.5, 0.012, 0.02]} /></mesh>
      </group>
      <group position={[0.55, 0.006, 0.15 + 0.4 * (1 - r)]} rotation-y={-0.3}>
        <mesh material={mat("brushed", "#d9dde5")}><boxGeometry args={[0.3, 0.008, 0.13]} /></mesh>
        <mesh position={[0, 0.005, 0]} material={mat("blackPlastic")}><boxGeometry args={[0.18, 0.004, 0.03]} /></mesh>
      </group>
    </group>
  );
};

// ------------------------------------------------------------------ oscilloscope
/** A 1940s scope (about 1.1 wide), round screen facing +z with two traces: the weak one in, the
 * strong one out. `inAmp` / `outAmp` are their heights (0..1), `phase` scrolls them. */
export const Scope: React.FC<Group & { inAmp?: number; outAmp?: number; phase?: number; on?: number }> = ({ inAmp = 0, outAmp = 0, phase = 0, on = 1, ...g }) => {
  const N = 34;
  const trace = (y0: number, amp: number, color: string, key: string) =>
    Array.from({ length: N }, (_, i) => {
      const x = -0.32 + (0.64 * i) / (N - 1);
      const y = y0 + amp * Math.sin(i * 0.55 + phase);
      return (
        <mesh key={`${key}${i}`} position={[x, y, 0.275]} material={glow(color, q(0.4 + 0.6 * on))}>
          <sphereGeometry args={[0.011, 6, 4]} />
        </mesh>
      );
    });
  return (
    <group {...g}>
      <Block size={[1.1, 0.95, 0.5]} radius={0.05} preset="clay" color="#4b5058" position={[0, 0, 0]} />
      <mesh position={[0, 0.03, 0.252]} rotation-x={Math.PI / 2} material={mat("brushed", "#2a2e35")}><cylinderGeometry args={[0.4, 0.4, 0.02, 40]} /></mesh>
      <mesh position={[0, 0.03, 0.264]} material={glow("#0f3a22", q(0.5 + 0.5 * on))}><circleGeometry args={[0.37, 40]} /></mesh>
      <group position={[0, 0.03, 0]}>
        {trace(0.13, 0.03 * inAmp, "#a8ffcf", "a")}
        {trace(-0.12, 0.2 * outAmp, TECH.amber, "b")}
      </group>
      {[-0.4, 0.4].map((x) => (
        <mesh key={x} position={[x, -0.38, 0.26]} rotation-x={Math.PI / 2} material={mat("glossy", "#1b1d24")}><cylinderGeometry args={[0.05, 0.05, 0.04, 18]} /></mesh>
      ))}
    </group>
  );
};

// ------------------------------------------------------------------ bulb
/** A bulb on a small stand (about 0.7 tall). `on` 0..1. */
export const Bulb: React.FC<Group & { on?: number }> = ({ on = 0, ...g }) => {
  const o = q(on);
  return (
    <group {...g}>
      <mesh position={[0, 0.06, 0]} material={mat("brushed", "#6a707c")}><cylinderGeometry args={[0.16, 0.2, 0.12, 24]} /></mesh>
      <mesh position={[0, 0.2, 0]} material={mat("brushed", "#b9bfca")}><cylinderGeometry args={[0.07, 0.08, 0.16, 16]} /></mesh>
      <mesh position={[0, 0.45, 0]} material={o > 0.05 ? glow("#fff1c8", 0.25 + 0.75 * o) : mat("glass", "#e8f4ff", { opacity: 0.35 })}>
        <sphereGeometry args={[0.2, 28, 20]} />
      </mesh>
      <mesh position={[0, 0.42, 0]} material={o > 0.05 ? glow(WARM, 1) : mat("copper")}><torusGeometry args={[0.05, 0.008, 6, 16]} /></mesh>
      {o > 0.05 && <pointLight position={[0, 0.5, 0.2]} intensity={8 * o} distance={4} color="#ffd9a0" />}
    </group>
  );
};

// ------------------------------------------------------------------ the phone, opened to its chip
/** Where the main chip sits on the phone's board (relative to the phone). */
export const CHIP_AT: V3 = [0.05, PHONE_STACK.board + 0.05, -0.55];
/** A phone lying screen up, its screen slid off by `open` (0..1) to show the board and its chip.
 * `lid` 0..1 lifts the chip's lid; `lit` lights the die. */
export const OpenPhone: React.FC<Group & { open?: number; lid?: number; lit?: number; glowScreen?: number }> = ({ open = 0, lid = 0, lit = 0.5, glowScreen = 0.8, ...g }) => {
  const o = Easing.inOut(Easing.cubic)(Math.min(1, Math.max(0, open)));
  return (
    <group {...g}>
      <PhonePartModel part="back" position={[0, PHONE_STACK.back, 0]} />
      <PhonePartModel part="battery" position={[0, PHONE_STACK.battery, PHONE.d * 0.18]} />
      <PhonePartModel part="board" position={[0, PHONE_STACK.board, 0]} />
      <PhonePartModel part="frame" position={[0, PHONE_STACK.frame, 0]} />
      <ChipPackage size={0.5} lid={false} seed="v2101-soc" lit={lit} position={CHIP_AT} />
      {lid < 0.98 && (
        <Block size={[0.41, 0.05, 0.41]} radius={0.02} preset="brushed" position={[CHIP_AT[0], CHIP_AT[1] + 0.16 + 0.9 * lid, CHIP_AT[2]]} rotation-x={-0.5 * lid} />
      )}
      {o < 0.995 && <PhonePartModel part="screen" glowScreen={glowScreen} position={[o * (PHONE.w + 0.6), PHONE_STACK.screen + 0.25 * Math.sin(o * Math.PI), -o * 0.3]} rotation-z={-0.35 * Math.sin(o * Math.PI)} />}
    </group>
  );
};

/** A dark desk under the phone. */
export const Desk: React.FC<Group> = (g) => (
  <group {...g}>
    <Block size={[9, 0.08, 6]} radius={0.02} preset="glossy" color="#151a24" position={[0, -0.04, 0]} />
    {Array.from({ length: 10 }, (_, i) => (
      <mesh key={i} position={[-4 + rnd("desk", i) * 8, 0.002, -2.5 + rnd("deskz", i) * 5]} rotation-x={-Math.PI / 2} material={glow(i % 2 ? TECH.cyan : TECH.violet, 0.08)}>
        <circleGeometry args={[0.3 + rnd("deskr", i) * 0.4, 24]} />
      </mesh>
    ))}
  </group>
);

const Parts = { Wedge, Transistor, Bench, Calendar, Plate, Tools, Scope, Bulb, OpenPhone, Desk };
export default Parts;
