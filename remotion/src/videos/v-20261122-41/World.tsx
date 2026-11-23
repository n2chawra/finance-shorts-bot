// The Mississippi stuck-rudder promo Short's shared world (Satellite Atlas look: lit physical materials on a
// night river, the camera free to rise high over the bend):
//   - River: the brown Mississippi (the kit's Ocean, low slow swell, river colour) with a current drift;
//   - Banks: the levees, the wharf on the far (starboard) bank with bollards and a shed, the city behind;
//   - City: seeded towers with lit window bands, and warm lights along the waterfront;
//   - Tanker: the kit's Ship (cargo hull, bridge aft) with its deck replaced by a tanker's pipe deck,
//     plus its stern gear below the waterline: propeller and rudder (`rudder` angle, `stress` 0..1 ramp);
//   - Riverboat: a white multi-deck passenger riverboat moored to the wharf, windows lit, `roll` to capsize;
//   - turnPose(phi): where the tanker is on its swing toward the far bank (phi radians turned);
//   - Shot3D / Flat: the beat wrappers (one stage, the look, the honesty tag, the PRELIMINARY tag).
// Machines and places only, never people. Every figure comes from the beat's params.
import React from "react";
import { AbsoluteFill, Freeze, random } from "remotion";
import { canvasTexture, DisasterStage, glow, rampColor, Ship, useDLook, type V3 } from "../../three/index";
import { DisasterLookProvider, LookBackground, Texture, HonestyTag as FlatTag } from "../../disaster/index";

export const RECIPE = "satellite-atlas" as const;
export const MONO = "'Courier Prime', 'Courier New', monospace";
export const ANTON = "Anton, Poppins, sans-serif";
export const AMBER = "#ff9a3c", RED = "#ff3b30", CREAM = "#f4efe7", RIVER = "#141d18";

const sh = { castShadow: true, receiveShadow: true } as const;
export const k01 = (x: number) => Math.max(0, Math.min(1, x));
export const sm = (x: number) => { const c = k01(x); return c * c * (3 - 2 * c); };
const q = (x: number, n = 12) => Math.round(x * n) / n;

export const TANKER_L = 8, BOAT_L = 5.4;
/** the swing: a right-hand turn of radius R from (X0, Z0), heading +x at phi = 0 */
export const R = 10, X0 = -10, Z0 = -2, PHI_HIT = 1.2;
/** the riverboat moored along the far bank, its river-side hull face at BOAT_Z - beam/2 */
export const BOAT_X = 0.8, BOAT_Z = 8.75, WHARF_Z = 9.3;

/** The tanker on its swing: centre position and yaw (rotation-y) after turning `phi` radians. */
export function turnPose(phi: number): { pos: V3; yaw: number; bow: V3; stern: V3 } {
  const x = X0 + R * Math.sin(phi), z = Z0 + R * (1 - Math.cos(phi));
  const fx = Math.cos(phi), fz = Math.sin(phi);
  return { pos: [x, 0, z], yaw: -phi, bow: [x + fx * TANKER_L / 2, 0, z + fz * TANKER_L / 2], stern: [x - fx * TANKER_L / 2, 0, z - fz * TANKER_L / 2] };
}

export function useMats() {
  const { paint } = useDLook();
  return {
    steel: paint("metal", "#8a8f96"), dark: paint("dark", "#1c1d20"), deck: paint("steel", "#7c2a22"), pipe: paint("metal", "#c9b98f"),
    white: paint("body", "#eef0f2"), grime: paint("dark", "#2a2622"), concrete: paint("concrete", "#5d5a55"), levee: paint("ground", "#1e2a20"),
    riprap: paint("concrete", "#4b463e"), tower: (c: string) => paint("concrete", c), bronze: paint("metal", "#b0874a"), rope: paint("rubber", "#cdbf9a"), paint,
    lamp: (c: string, s = 1) => (s < 0.08 ? paint("dark", "#202124") : glow(c, Math.min(1, s))),
  };
}

/** A box or blade in the failure ramp: dark steel → amber → red (red only for the failure). */
export const RampMat: React.FC<{ v: number }> = ({ v }) => {
  const s = q(k01(v));
  const c = `#${rampColor(s).getHexString()}`;
  return <meshPhysicalMaterial attach="material" color={s <= 0 ? "#3a3d42" : c} roughness={0.45} metalness={0.6} emissive={c} emissiveIntensity={s <= 0 ? 0 : 0.3 + s * 1.7} />;
};

// ---------------------------------------------------------------- the tanker

/** A tanker's deck in place of the container stacks: the red deck plate, pipe runs fore and aft, the
 * midships manifold with its crane, catwalk stanchions, tank hatches and deck lamps. */
const TankerDeck: React.FC<{ L: number; lamps?: number }> = ({ L, lamps = 1 }) => {
  const M = useMats();
  const top = L * 0.06 + 0.005, B = L * 0.14;
  const x0 = -L * 0.33, x1 = L * 0.36;
  return (
    <group>
      <mesh position={[(x0 + x1) / 2, top, 0]} material={M.deck} receiveShadow><boxGeometry args={[x1 - x0, 0.012, B * 0.86]} /></mesh>
      {[-0.22, -0.1, 0.1, 0.22].map((z, i) => (
        <mesh key={i} position={[(x0 + x1) / 2, top + 0.05, z * B]} rotation-z={Math.PI / 2} material={M.pipe} castShadow>
          <cylinderGeometry args={[0.022, 0.022, x1 - x0, 10]} />
        </mesh>
      ))}
      {/* the catwalk down the centreline */}
      <mesh position={[(x0 + x1) / 2, top + 0.16, 0]} material={M.steel} castShadow><boxGeometry args={[x1 - x0, 0.015, 0.09]} /></mesh>
      {Array.from({ length: 16 }, (_, i) => (
        <mesh key={`st${i}`} position={[x0 + (i + 0.5) * (x1 - x0) / 16, top + 0.08, 0]} material={M.steel}><boxGeometry args={[0.02, 0.16, 0.02]} /></mesh>
      ))}
      {/* tank hatches */}
      {Array.from({ length: 6 }, (_, i) => [1, -1].map((s) => (
        <mesh key={`h${i}${s}`} position={[x0 + 0.3 + i * (x1 - x0 - 0.6) / 5, top + 0.03, s * B * 0.34]} material={M.grime} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.05, 14]} />
        </mesh>
      )))}
      {/* the manifold and its hose crane */}
      <group position={[L * 0.02, top, 0]}>
        {[-1, 1].map((s) => <mesh key={s} position={[0, 0.07, s * B * 0.32]} material={M.pipe} castShadow><boxGeometry args={[0.32, 0.12, 0.08]} /></mesh>)}
        <mesh position={[0, 0.32, 0]} material={M.white} castShadow><cylinderGeometry args={[0.04, 0.05, 0.62, 10]} /></mesh>
        <mesh position={[0.22, 0.6, 0]} rotation-z={-1.1} material={M.white} castShadow><boxGeometry args={[0.04, 0.55, 0.04]} /></mesh>
      </group>
      {/* the forecastle and its mast */}
      <mesh position={[L * 0.4, top + 0.06, 0]} material={M.white} castShadow><boxGeometry args={[L * 0.07, 0.12, B * 0.5]} /></mesh>
      <mesh position={[L * 0.42, top + 0.4, 0]} material={M.steel} castShadow><cylinderGeometry args={[0.02, 0.025, 0.7, 8]} /></mesh>
      {/* deck lamps */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={`l${i}`} position={[x0 + i * (x1 - x0) / 4, top + 0.34, 0]} material={M.lamp("#ffd9a0", 0.9 * lamps)}><sphereGeometry args={[0.03, 8, 6]} /></mesh>
      ))}
    </group>
  );
};

/** The stern gear under the tanker's counter: a four-blade propeller and the rudder behind it. `rudder` is
 * the blade's angle (radians; + is to starboard), `stress` its colour on the ramp, `spin` the propeller. */
export const SternGear: React.FC<{ L: number; rudder: number; stress: number; spin: number; prop?: number }> = ({ L, rudder, stress, spin, prop = 0 }) => {
  const M = useMats();
  const xs = -L / 2, bottom = -L * 0.06;
  return (
    <group>
      {/* the skeg and shaft */}
      <mesh position={[xs + 0.18, bottom * 0.55, 0]} material={M.dark} {...sh}><boxGeometry args={[0.36, -bottom * 0.7, 0.06]} /></mesh>
      <group position={[xs + 0.02, bottom * 0.55, 0]} rotation-x={spin}>
        <mesh rotation-z={Math.PI / 2} material={M.bronze}><cylinderGeometry args={[0.045, 0.06, 0.12, 12]} /></mesh>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation-x={(i * Math.PI) / 2}>
            <mesh position={[0, 0.11, 0]} rotation-y={0.5}>
              <boxGeometry args={[0.03, 0.17, 0.09]} />
              <RampMat v={prop * 0.55} />
            </mesh>
          </group>
        ))}
      </group>
      {/* the rudder: stock from the counter, the blade hinged at its leading edge */}
      <mesh position={[xs - 0.14, -0.06, 0]} material={M.steel} castShadow><cylinderGeometry args={[0.025, 0.025, 0.16, 8]} /></mesh>
      <group position={[xs - 0.14, bottom * 0.52, 0]} rotation-y={rudder}>
        <mesh position={[-0.15, 0, 0]} castShadow>
          <boxGeometry args={[0.3, -bottom * 0.78, 0.05]} />
          <RampMat v={stress} />
        </mesh>
      </group>
    </group>
  );
};

/** The tanker: the kit's cargo hull with a tanker's deck and its stern gear. Bow +x, waterline y = 0. */
export const Tanker: React.FC<{ rudder?: number; stress?: number; spin?: number; prop?: number; lamps?: number; bowStress?: number }> = ({ rudder = 0, stress = 0, spin = 0, prop = 0, lamps = 1, bowStress = 0 }) => (
  <group>
    <Ship hull="cargo" length={TANKER_L} decks={4} funnels={1} seed="tanker"
      livery={{ hull: "#23272c", bottom: "#8f2c25", boot: "#121417", band: "#7a1f1a", deck: "#7c2a22", super: "#e9ecef", funnel: "#c9ced4", window: "#ffcf87" }}
      wrap={{ cargo: () => <TankerDeck L={TANKER_L} lamps={lamps} /> }} />
    <SternGear L={TANKER_L} rudder={rudder} stress={stress} spin={spin} prop={prop} />
    {/* the bulbous bow's stem plate, which glows on the ramp at the impact */}
    {bowStress > 0 ? (
      <mesh position={[TANKER_L / 2 - 0.05, 0.12, 0]}><boxGeometry args={[0.14, 0.42, 0.34]} /><RampMat v={bowStress} /></mesh>
    ) : null}
    {/* the bridge's lit windows and masthead light */}
    <pointLight position={[-TANKER_L * 0.4, 1.2, 0]} intensity={0.8 * lamps} distance={4} color="#ffd9a0" />
  </group>
);

// ---------------------------------------------------------------- the riverboat

/** The white passenger riverboat: the kit's ferry hull with three decks and no funnel, lit windows,
 * deck lamps along its rails. `roll` tips it (radians, negative = toward the river), `sink` lowers it. */
export const Riverboat: React.FC<{ roll?: number; sink?: number; lights?: number; dent?: number }> = ({ roll = 0, sink = 0, lights = 1, dent = 0 }) => {
  const M = useMats();
  return (
    <group position={[BOAT_X, -sink, BOAT_Z]} rotation-x={roll}>
      <Wash f={0} len={BOAT_L * 0.9} half={BOAT_L * 0.085} seed="rw" />
      <Ship hull="ferry" length={BOAT_L} decks={3} funnels={0} seed="riverboat"
        livery={{ hull: "#f3f1ec", bottom: "#7d2a24", boot: "#20242a", band: "#1f4e79", deck: "#9aa1a8", super: "#fbfaf7", window: "#3a3226" }} />
      {/* rows of lit windows along the river side */}
      {[0, 1, 2].map((d) => Array.from({ length: 14 }, (_, i) => (
        <mesh key={`${d}-${i}`} position={[-BOAT_L * 0.38 + i * BOAT_L * 0.052, BOAT_L * 0.1 + d * BOAT_L * 0.022, -BOAT_L * 0.085 - 0.012]}
          material={M.lamp(random(`rb${d}${i}`) > 0.2 ? "#ffd38a" : "#3a3226", lights * 0.85)}>
          <boxGeometry args={[0.11, 0.06, 0.01]} />
        </mesh>
      )))}
      {/* the white rails' lamps */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={`r${i}`} position={[-BOAT_L * 0.36 + i * BOAT_L * 0.085, BOAT_L * 0.17, -BOAT_L * 0.08]} material={M.lamp("#fff2d0", lights)}><sphereGeometry args={[0.025, 8, 6]} /></mesh>
      ))}
      {/* the stove-in plating where the bow struck */}
      {dent > 0 ? (
        <mesh position={[0, BOAT_L * 0.03, -BOAT_L * 0.085]}><boxGeometry args={[0.7, 0.34, 0.06]} /><RampMat v={dent} /></mesh>
      ) : null}
      <pointLight position={[0, 1.4, -1.2]} intensity={0.6 * lights} distance={3} color="#ffdcaa" />
    </group>
  );
};

// ---------------------------------------------------------------- the river, the banks, the city

/** The far bank's wharf: a concrete apron along x with bollards, mooring lines to the riverboat and a shed. */
export const Wharf: React.FC<{ lines?: number }> = ({ lines = 1 }) => {
  const M = useMats();
  return (
    <group>
      <mesh position={[0, 0.16, WHARF_Z + 1.4]} material={M.concrete} {...sh}><boxGeometry args={[40, 0.42, 2.8]} /></mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-8 + i * 2, 0.42, WHARF_Z + 0.25]} material={M.dark} castShadow><cylinderGeometry args={[0.05, 0.06, 0.12, 10]} /></mesh>
      ))}
      {lines > 0 ? [-1.8, 1.9].map((x, i) => (
        <mesh key={`m${i}`} position={[BOAT_X + x, 0.42, (BOAT_Z + WHARF_Z + 0.25) / 2 + 0.05]} rotation-x={Math.PI / 2} material={M.rope}>
          <cylinderGeometry args={[0.008, 0.008, WHARF_Z + 0.25 - BOAT_Z + 0.3, 5]} />
        </mesh>
      )) : null}
      {/* the terminal shed with its lit doors */}
      <mesh position={[1, 0.75, WHARF_Z + 2.4]} material={M.tower("#4a4f57")} {...sh}><boxGeometry args={[7, 0.8, 1.2]} /></mesh>
      <mesh position={[1, 1.2, WHARF_Z + 2.4]} rotation-z={0} material={M.dark}><boxGeometry args={[7.2, 0.08, 1.4]} /></mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`d${i}`} position={[-1.6 + i * 1.05, 0.62, WHARF_Z + 1.79]} material={M.lamp("#ffd9a0", 0.8)}><planeGeometry args={[0.5, 0.36]} /></mesh>
      ))}
    </group>
  );
};

/** A tower facade: dark panels, mullions and a grid of windows, most lit warm, some cool, some dark. */
function facade(v: number) {
  return canvasTexture(`ms-facade-${v}`, 256, 512, (g) => {
    g.fillStyle = ["#252a33", "#2b2f36", "#22262d"][v % 3]!;
    g.fillRect(0, 0, 256, 512);
    const cols = 6 + (v % 3), rows = 22 + v * 3;
    const cw = 256 / cols, rh = 512 / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = random(`fw${v}-${r}-${c}`);
      g.fillStyle = x > 0.55 ? "#ffcf86" : x > 0.42 ? "#bcd6ff" : x > 0.3 ? "#5a5348" : "#151820";
      g.fillRect(c * cw + cw * 0.18, r * rh + rh * 0.22, cw * 0.64, rh * 0.56);
    }
    g.fillStyle = "rgba(255,255,255,0.06)";
    for (let c = 0; c <= cols; c++) g.fillRect(c * cw - 1, 0, 2, 512);
  });
}

/** The city behind a bank: seeded towers with lit window facades and roof caps, and waterfront lights. */
export const City: React.FC<{ z0: number; depth: number; side: 1 | -1; seed: string; n?: number; x0?: number; x1?: number }> = ({ z0, depth, side, seed, n = 46, x0 = -30, x1 = 30 }) => {
  const M = useMats();
  const cols = ["#3b4250", "#454c58", "#2f3540", "#50525a", "#3a4048"];
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[(x0 + x1) / 2, 0.02, z0 + side * depth / 2]} material={M.levee} receiveShadow><planeGeometry args={[x1 - x0 + 20, depth + 4]} /></mesh>
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + random(`${seed}x${i}`) * (x1 - x0);
        const z = z0 + side * (1.5 + random(`${seed}z${i}`) * (depth - 2));
        const tall = random(`${seed}t${i}`);
        const h = 0.6 + tall * tall * 5.5, w = 0.6 + random(`${seed}w${i}`) * 1.0;
        const bands = Math.max(1, Math.floor(h / 0.32));
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, h / 2, 0]} {...sh}>
              <boxGeometry args={[w, h, w]} />
              <meshStandardMaterial map={facade(i % 3)} emissiveMap={facade(i % 3)} emissive="#ffffff" emissiveIntensity={0.55} roughness={0.55} metalness={0.3} />
            </mesh>
            <mesh position={[0, h + 0.04, 0]} material={M.tower(cols[i % cols.length]!)} castShadow><boxGeometry args={[w * 1.04, 0.08, w * 1.04]} /></mesh>
            {bands > 8 ? <mesh position={[w * 0.2, h + 0.3, 0]} material={M.steel}><cylinderGeometry args={[0.015, 0.015, 0.5, 6]} /></mesh> : null}
            {bands > 8 ? <mesh position={[w * 0.2, h + 0.56, 0]} material={M.lamp("#ff4a3a", 0.9)}><sphereGeometry args={[0.03, 6, 4]} /></mesh> : null}
          </group>
        );
      })}
      {Array.from({ length: 30 }, (_, i) => (
        <mesh key={`wl${i}`} position={[x0 + i * (x1 - x0) / 29, 0.32, z0 + side * 0.6]} material={M.lamp("#ffc878", 0.9)}><sphereGeometry args={[0.05, 6, 4]} /></mesh>
      ))}
    </group>
  );
};

/** The Mississippi between its levees: slow brown swell, the near bank and the far bank with the wharf
 * and the city. `wharf` false leaves the far bank's wharf out (a shot that doesn't see it). */
export const River: React.FC<{ f: number; wharf?: boolean; boat?: React.ReactNode }> = ({ f, wharf = true, boat }) => {
  const M = useMats();
  return (
  <group>
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow userData={{ noFail: true }}>
      <planeGeometry args={[160, 160]} />
      <meshStandardMaterial color={RIVER} roughness={0.6} metalness={0.1} envMapIntensity={0.15} />
    </mesh>
    {/* the city's lights smeared on the water, shimmering */}
    {Array.from({ length: 34 }, (_, i) => {
      const x = -30 + random(`st${i}`) * 60, far = random(`sz${i}`) > 0.4;
      const z = far ? WHARF_Z - 0.6 - random(`sd${i}`) * 3 : -8.2 + random(`sd${i}`) * 3;
      return (
        <group key={`s${i}`} position={[x, 0.006, z]}>
          {[0, 1, 2, 3, 4].map((k) => (
            <mesh key={k} position={[0.12 * Math.sin(f * 0.09 + i + k * 2.3) + 0.25 * (random(`sx${i}${k}`) - 0.5), 0, (k - 2) * 0.28 + 0.1 * random(`sy${i}${k}`)]} rotation-x={-Math.PI / 2}>
              <planeGeometry args={[(0.04 + 0.05 * random(`sw${i}${k}`)) * (1 + 0.4 * Math.sin(f * 0.13 + k + i)), 0.08 + 0.1 * random(`sl${i}${k}`)]} />
              <meshBasicMaterial color={random(`sc${i}`) > 0.3 ? "#ffcf86" : "#bcd6ff"} transparent opacity={Math.max(0, 0.12 + 0.28 * Math.sin(f * 0.17 + i * 1.7 + k * 2.1))} />
            </mesh>
          ))}
        </group>
      );
    })}
    {/* the levees: rip-rap slopes down to the water on both banks */}
    <mesh position={[0, -0.25, -8.6]} rotation-x={-0.5} material={M.riprap} receiveShadow><boxGeometry args={[160, 0.1, 2.2]} /></mesh>
    {wharf ? null : <mesh position={[0, -0.25, WHARF_Z + 0.3]} rotation-x={0.5} material={M.riprap} receiveShadow><boxGeometry args={[160, 0.1, 2.2]} /></mesh>}
    <City z0={-9} depth={14} side={-1} seed="nola-near" n={34} />
    <City z0={WHARF_Z + 3} depth={16} side={1} seed="nola-far" n={56} />
    {wharf ? <Wharf /> : null}
    {boat}
    {/* the key: the city's warm glow from the far bank, a cool moon from behind the near one */}
    <directionalLight position={[6, 9, 18]} intensity={0.15} color="#ffc98a" />
  </group>
  );
};

/** Broken white water along a hull's waterline, both sides, flickering. */
export const Wash: React.FC<{ f: number; len: number; half: number; seed: string }> = ({ f, len, half, seed }) => (
  <group>
    {[1, -1].map((s) => Array.from({ length: 14 }, (_, i) => (
      <mesh key={`${s}${i}`} position={[-len / 2 + (i + 0.5) * len / 14, 0.012, s * (half + 0.03 + 0.02 * random(`${seed}${s}${i}`))]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[len / 14 * (0.9 + 0.5 * random(`${seed}l${s}${i}`)), 0.04 + 0.08 * random(`${seed}w${s}${i}`)]} />
        <meshBasicMaterial color="#cfdcd6" transparent opacity={Math.max(0, 0.06 + 0.1 * Math.sin(f * 0.2 + i * 1.9 + s))} />
      </mesh>
    )))}
  </group>
);

/** A tanker at a pose with a gentle swell motion. */
export const TankerAt: React.FC<{ f: number; pos: V3; yaw: number; rudder?: number; stress?: number; prop?: number; bowStress?: number; spin?: number }> = ({ f, pos, yaw, rudder = 0, stress = 0, prop = 0, bowStress = 0, spin }) => (
  <group position={[pos[0], pos[1] + 0.012 * Math.sin(f * 0.05), pos[2]]} rotation-y={yaw} rotation-x={0.006 * Math.sin(f * 0.041)}>
    <Tanker rudder={rudder} stress={stress} spin={spin ?? f * 0.32} prop={prop} bowStress={bowStress} />
    <Wash f={f} len={TANKER_L * 0.92} half={TANKER_L * 0.072} seed="tw" />
  </group>
);

// ---------------------------------------------------------------- wrappers

/** Night river mist over a 3D shot (screen-blended noise), seeded, a pure function of the frame. */
export const Mist: React.FC<{ f: number; k?: number }> = ({ f, k = 1 }) => (
  <svg data-probe="skip" viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: 0.42 * k }}>
    <defs>
      <filter id="ms-mist" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.004 0.011" numOctaves={3} seed={23} />
        <feColorMatrix values="0 0 0 0 0.44  0 0 0 0 0.52  0 0 0 0 0.58  0 0 0 0.9 -0.2" />
      </filter>
    </defs>
    <rect x={-300 + ((f * 0.6) % 300)} y={0} width={1680} height={1920} filter="url(#ms-mist)" />
  </svg>
);

/** The PRELIMINARY tag every beat carries (the NTSB has not reported yet). */
export const Prelim: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 292, textAlign: "center", pointerEvents: "none" }}>
    <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 44, letterSpacing: 3, color: AMBER, background: "rgba(8,10,14,0.7)", padding: "6px 16px", border: `2px solid ${AMBER}` }}>
      NTSB · PRELIMINARY
    </span>
  </div>
);

/** A 3D beat: the beat's frame frozen into the stage, the night-river look, the tags and any overlay. */
export const Shot3D: React.FC<{ f: number; children: React.ReactNode; overlay?: React.ReactNode; tag?: "reconstruction" | "paused"; dof?: number; fog?: { color?: string; near: number; far: number }; under?: boolean }> = ({
  f, children, overlay, tag = "reconstruction", dof = 1, fog, under = false,
}) => (
  <Freeze frame={f}>
    <DisasterStage look="nightGrid" dof={dof} shadowBox={12} floor={false} fog={fog ?? (under ? { color: "#14261f", near: 1.5, far: 9 } : { color: "#0a121a", near: 14, far: 70 })}
      overlay={<DisasterLookProvider value={RECIPE}><AbsoluteFill style={{ pointerEvents: "none" }}><Mist f={f} k={under ? 0.3 : 1} />{overlay}<Prelim /><FlatTag t={f} tag={tag} at={0} /></AbsoluteFill></DisasterLookProvider>}>
      <ambientLight intensity={under ? 0.5 : 0.26} color={under ? "#6f9c86" : "#7088b0"} />
      <directionalLight position={[-8, 12, -6]} intensity={under ? 0.3 : 0.7} color="#a9bfe6" castShadow />
      <hemisphereLight args={["#2a3a55", "#1a140c", 0.35]} />
      {children}
    </DisasterStage>
  </Freeze>
);

/** A flat or doc beat in the video's look: the backdrop, the drawing, the grain, an honesty tag, the PRELIMINARY tag. */
export const Flat: React.FC<{ t: number; children: React.ReactNode; tag?: string; prelim?: boolean }> = ({ t, children, tag = "principle", prelim = true }) => (
  <DisasterLookProvider value={RECIPE}>
    <AbsoluteFill>
      <LookBackground />
      <Mist f={t} k={0.5} />
      {children}
      <Texture t={t} />
      {prelim ? <Prelim /> : null}
      {tag ? <FlatTag t={t} tag={tag} at={0} /> : null}
    </AbsoluteFill>
  </DisasterLookProvider>
);

/** The dated mono caption (place · date), typing on, with an optional big title. */
export const DateCaption: React.FC<{ t: number; at: number; line: string; title?: string; titleAt?: number; top?: number }> = ({ t, at, line, title, titleAt, top = 380 }) => {
  const n = t < at ? 0 : Math.max(at <= 0 ? line.length : 0, Math.floor((t - at) * 1.8));
  const nt = title ? (titleAt !== undefined && titleAt < 0 ? title.length : Math.max(0, Math.floor((t - (titleAt ?? at)) * 2.2))) : 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", pointerEvents: "none" }}>
      {title ? <div style={{ fontFamily: ANTON, fontSize: 96, color: CREAM, letterSpacing: 2, textShadow: "0 6px 24px rgba(0,0,0,0.7)" }}>{title.slice(0, nt)}</div> : null}
      <div style={{ display: "inline-block", marginTop: 10, fontFamily: MONO, fontWeight: 700, fontSize: 44, letterSpacing: 3, color: CREAM,
        background: "rgba(8,10,14,0.74)", padding: "8px 22px", borderLeft: `6px solid ${AMBER}` }}>{line.slice(0, n)}</div>
    </div>
  );
};

/** A mono label in a dark box over a 3D shot, typing on from `at`. */
export const Tag: React.FC<{ t: number; at: number; text: string; top: number; color?: string; size?: number }> = ({ t, at, text, top, color = AMBER, size = 50 }) => {
  if (t < at) return null;
  const n = Math.max(1, Math.floor((t - at) * 1.8));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", pointerEvents: "none" }}>
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: 4, color, background: "rgba(8,10,14,0.76)", padding: "8px 22px" }}>{text.slice(0, n)}</span>
    </div>
  );
};

/** A clock readout over a shot: the figure big in Anton, its unit and caption under it. */
export const Clock: React.FC<{ value: string; caption: string; top?: number; k?: number; color?: string; left?: number }> = ({ value, caption, top = 520, k = 1, color = CREAM, left }) => (
  <div style={{ position: "absolute", left: left ?? 0, right: left === undefined ? 0 : undefined, top, textAlign: "center", opacity: k, transform: `scale(${0.85 + 0.15 * k})`, pointerEvents: "none" }}>
    <div style={{ display: "inline-block", background: "rgba(8,10,14,0.72)", border: `4px solid ${color}`, borderRadius: 18, padding: "10px 34px" }}>
      <div style={{ fontFamily: ANTON, fontSize: 150, lineHeight: 1.05, color }}>{value}</div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 46, letterSpacing: 4, color: CREAM }}>{caption}</div>
    </div>
  </div>
);

export default Tanker;
