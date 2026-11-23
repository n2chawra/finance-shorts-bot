// Parts: the models and places this video's beats share (all procedural, nothing downloaded).
// Hoover Dam in Black Canyon (a curved concrete arch, Lake Mead behind it with the white band the
// falling lake leaves on the rock, the powerhouse at its foot, the intake towers), the dam cut open
// side-on (lake, tower, the steel pipe through the rock), a turbine runner in its spiral case, a
// generator's rotor of magnets inside copper coils, power lines and a desert city at night, and a
// control room with a big output dial. Everything is a function of the numbers passed in; no figures.
import React from "react";
import { Easing } from "remotion";
import { Block, cue, glow, mat, rnd, TECH, type V3 } from "../../three/index";

type Group = React.JSX.IntrinsicElements["group"];

export const k01 = (f: number, a: number, d: number, e = Easing.inOut(Easing.cubic)) => cue(f, a, Math.max(1, d), e);
const q = (x: number, n = 20) => Math.round(x * n) / n;

export const CONCRETE = "#a9a08c";
export const ROCK = "#7a4d34";
export const BAND = "#ece5d6";
export const WATER = "#0e3354";
export const WARM = "#ffc46b";

/** the dam's height, the full lake's height and its lowest in this video */
export const DAM_H = 4;
export const FULL = 3.6;
export const LOW = 1.7;

// ------------------------------------------------------------------ the arch
const R = 5; // radius of the downstream face at the base
const T = 1.3; // thickness at the base
const PHI = 0.56; // half the arch's angle

/** The curved concrete arch: convex toward the lake (-z), its crest at y=DAM_H, ends in the canyon walls. */
export const Arch: React.FC<Group> = (g) => {
  const N = 22;
  // three stacked courses, thinner toward the crest (a gravity arch), each a ring of blocks
  const courses: [number, number, number][] = [[0, 1.4, T], [1.4, 1.4, T * 0.62], [2.8, DAM_H - 2.8, T * 0.3]];
  return (
    <group {...g}>
      {courses.map(([y, h, th], c) => Array.from({ length: N }, (_, i) => {
        const a = -PHI + ((i + 0.5) / N) * PHI * 2;
        const r = R + T - th / 2;
        const w = (2 * PHI * (R + T)) / N + 0.03;
        return (
          <mesh key={`${c}-${i}`} position={[-r * Math.sin(a), y + h / 2, R - r * Math.cos(a)]} rotation-y={a} material={mat("clay", CONCRETE)} castShadow receiveShadow>
            <boxGeometry args={[w, h, th]} />
          </mesh>
        );
      }))}
      {/* the road on the crest and its lamps */}
      {Array.from({ length: 9 }, (_, i) => {
        const a = -PHI * 0.9 + (i / 8) * PHI * 1.8;
        const r = R + T - 0.16;
        return (
          <mesh key={i} position={[-r * Math.sin(a), DAM_H + 0.12, R - r * Math.cos(a)]} material={glow(WARM, 1.4)}>
            <sphereGeometry args={[0.05, 10, 8]} />
          </mesh>
        );
      })}
    </group>
  );
};

/** x of the canyon wall at the dam */
export const WALL_X = 2.75;

/** Black Canyon: two rock walls, the lake behind the dam at `level`, the white band above it, the river below. */
export const Canyon: React.FC<Group & { level?: number; f?: number }> = ({ level = FULL, f = 0, ...g }) => (
  <group {...g}>
    {/* glints drifting on the lake */}
    {Array.from({ length: 46 }, (_, i) => {
      const x = (rnd("gx", i) - 0.5) * (WALL_X * 2 - 0.4);
      const z = -2.0 - 20 * rnd("gz", i) + ((f * 0.01 + rnd("gd", i)) % 1) * 0.6;
      const tw = 0.5 + 0.5 * Math.sin(f / 5 + i * 1.9);
      return (
        <mesh key={`g${i}`} position={[x, level + 0.012, z]} rotation-x={-Math.PI / 2} material={glow("#9fdcff", q(0.25 + 0.6 * tw))}>
          <planeGeometry args={[0.28, 0.035]} />
        </mesh>
      );
    })}
    {[-1, 1].map((s) => (
      <group key={s}>
        <Block size={[5, 7, 46]} radius={0.1} preset="clay" color={ROCK} position={[s * (WALL_X + 2.5), 3.0, -10]} />
        {/* ledges for texture */}
        {Array.from({ length: 7 }, (_, i) => (
          <Block key={i} size={[0.5, 0.25 + 0.2 * rnd("ledge", i + s * 10), 2 + 3 * rnd("ledgew", i)]} radius={0.05} preset="clay" color="#6a412b"
            position={[s * (WALL_X + 0.05), 0.8 + i * 0.85, 4 - i * 4.2]} />
        ))}
        {/* the white band the lake left, upstream of the dam */}
        {FULL - level > 0.01 && (
          <mesh position={[s * (WALL_X - 0.02), level + (FULL - level) / 2, -12.5]} rotation-y={-s * Math.PI / 2} material={mat("clay", BAND)}>
            <planeGeometry args={[22, FULL - level]} />
          </mesh>
        )}
      </group>
    ))}
    {/* Lake Mead */}
    <mesh position={[0, (level - 1) / 2, -12.6]} material={glow("#0c2a47", 1)}>
      <boxGeometry args={[WALL_X * 2, level + 1, 22]} />
    </mesh>
    {/* the river below the dam */}
    <mesh position={[0, 0.03, 8]} rotation-x={-Math.PI / 2} material={glow("#081a2b", 1)}>
      <planeGeometry args={[WALL_X * 2, 14]} />
    </mesh>
  </group>
);

/** An intake tower standing in the lake: a tall round tower with a cap and, if `scale` > 0, a depth scale. */
export const Tower: React.FC<Group & { scale?: number; lit?: number }> = ({ scale = 0, lit = 0.6, ...g }) => (
  <group {...g}>
    <mesh position={[0, (DAM_H + 0.5) / 2 - 0.5, 0]} material={mat("clay", CONCRETE)} castShadow>
      <cylinderGeometry args={[0.32, 0.38, DAM_H + 0.5, 24]} />
    </mesh>
    <mesh position={[0, DAM_H + 0.1, 0]} material={mat("clay", "#c9c0ad")}>
      <cylinderGeometry args={[0.42, 0.34, 0.2, 24]} />
    </mesh>
    <mesh position={[0, DAM_H + 0.32, 0]} material={mat("clay", "#b9ae97")}>
      <coneGeometry args={[0.36, 0.3, 24]} />
    </mesh>
    {/* slit windows, lit */}
    {[0.4, 0.8, 1.2, 1.6].map((y, i) => (
      <mesh key={i} position={[0, DAM_H - y, 0.33]} material={glow(WARM, q(lit))}>
        <planeGeometry args={[0.06, 0.18]} />
      </mesh>
    ))}
    {scale > 0 && Array.from({ length: 9 }, (_, i) => (
      <mesh key={i} position={[0.0, 0.2 + i * 0.4, -0.385]} material={glow(i % 2 ? TECH.white : TECH.amber, q(scale))}>
        <boxGeometry args={[i % 2 ? 0.12 : 0.22, 0.03, 0.01]} />
      </mesh>
    ))}
  </group>
);

/** The powerhouse at the foot of the dam: a long low building whose windows are lit in order up to `lights` (0..1). */
export const Powerhouse: React.FC<Group & { lights?: number; f?: number }> = ({ lights = 1, f = 0, ...g }) => {
  const N = 12;
  return (
    <group {...g}>
      <Block size={[4.6, 0.9, 1.0]} radius={0.04} preset="clay" color="#cfc6b2" position={[0, 0.45, 0]} />
      <Block size={[4.7, 0.08, 1.1]} radius={0.02} preset="clay" color="#a99f8b" position={[0, 0.94, 0]} />
      {Array.from({ length: N }, (_, i) => {
        const on = i / N < lights ? 1 : 0.05;
        const flick = 0.9 + 0.1 * Math.sin(f / 4 + i * 1.7);
        return (
          <mesh key={i} position={[-2.06 + i * 0.375, 0.52, 0.505]} material={glow(WARM, q(on * flick * 1.3))}>
            <planeGeometry args={[0.22, 0.42]} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Water from the outlet pipes below the dam: glowing white streaks arcing into the river. */
export const Outlets: React.FC<Group & { f: number; k?: number }> = ({ f, k = 1, ...g }) => (
  <group {...g}>
    {k > 0.02 && Array.from({ length: 18 }, (_, i) => {
      const side = i % 2 ? 1 : -1;
      const t = ((f * 0.03 + rnd("out", i)) % 1);
      const x = side * (1.2 + 0.25 * (i % 3));
      return (
        <mesh key={i} position={[x, 1.1 - 1.0 * t * t, 0.2 + 1.6 * t]} material={glow("#e8f6ff", q(0.9 * k))}>
          <sphereGeometry args={[0.07 + 0.05 * t, 8, 6]} />
        </mesh>
      );
    })}
  </group>
);

/** The whole dam seen from downstream: canyon, lake, arch, towers, powerhouse, outlets. */
export const DamScene: React.FC<Group & { level?: number; lights?: number; f: number; outlets?: number; scale?: number }> = ({ level = FULL, lights = 1, f, outlets = 1, scale = 0, ...g }) => (
  <group {...g}>
    <Canyon level={level} f={f} />
    <Arch />
    <Tower position={[-1.7, 0, -2.6]} scale={scale} />
    <Tower position={[1.7, 0, -2.6]} />
    <Tower position={[-1.9, 0, -4.4]} />
    <Tower position={[1.9, 0, -4.4]} />
    <Powerhouse position={[0, 0, 1.9]} lights={lights} f={f} />
    <Outlets f={f} k={outlets} position={[0, 0, 1.0]} />
    {/* floodlights on the dam's face */}
    <spotLight position={[-4, 7, 10]} angle={0.4} penumbra={0.8} intensity={22} color="#fff0d8" target-position={[0, 2, 0]} />
  </group>
);

// ------------------------------------------------------------------ the dam cut open, side-on
/** The lake, the dam and the rock sliced along the canyon: lake on the left (x<0), dam at x≈0,
 * a tower at x=-1.4, the pipe from the tower's foot down through the rock to the powerhouse at x≈2.6. */
export const PIPE: V3[] = [[-1.4, 0.2, 0], [-1.4, -0.6, 0], [-1.0, -1.4, 0], [0.2, -1.8, 0], [1.6, -1.9, 0], [2.4, -1.6, 0]];

export const Section: React.FC<Group & { level?: number; f: number; flow?: number; pipeLit?: number; towerLit?: number }> = ({ level = FULL, f, flow = 1, pipeLit = 0.3, towerLit = 0.3, ...g }) => {
  const segs = PIPE.slice(1).map((b, i) => {
    const a = PIPE[i]!;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return { mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0] as V3, len, rot: Math.atan2(b[1] - a[1], b[0] - a[0]) };
  });
  const total = segs.reduce((s2, g2) => s2 + g2.len, 0);
  const along = (t: number): V3 => {
    let d = t * total;
    for (let i = 0; i < segs.length; i++) {
      const g2 = segs[i]!;
      if (d <= g2.len || i === segs.length - 1) {
        const a = PIPE[i]!, b = PIPE[i + 1]!;
        const k = Math.min(1, d / g2.len);
        return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, 0];
      }
      d -= g2.len;
    }
    return PIPE[PIPE.length - 1]!;
  };
  return (
    <group {...g}>
      {/* rock under everything, cut face toward the camera */}
      <Block size={[12, 3.2, 1.6]} radius={0.04} preset="clay" color={ROCK} position={[0, -2.0, -0.85]} />
      <Block size={[12, 0.02, 1.0]} radius={0} preset="clay" color="#5d3825" position={[0, -0.39, 0.4]} />
      {/* the lake in section */}
      <mesh position={[-3.2, (level - 0.4) / 2 - 0.2 + 0.0, -0.3]} material={mat("glossy", WATER, { transparent: true, opacity: 0.55 })}>
        <boxGeometry args={[5.9, level + 0.4, 1.4]} />
      </mesh>
      <mesh position={[-3.2, level + 0.003 - 0.2, 0.41]} material={glow("#7fd0ff", 0.9)}>
        <boxGeometry args={[5.9, 0.025, 0.01]} />
      </mesh>
      {/* depth lines and drifting specks in the water */}
      {[0.6, 1.4, 2.2, 3.0].filter((y) => y < level - 0.25).map((y) => (
        <mesh key={`d${y}`} position={[-3.2, y - 0.2, 0.42]} material={glow("#5fb8ff", 0.25)}><boxGeometry args={[5.6, 0.012, 0.01]} /></mesh>
      ))}
      {Array.from({ length: 40 }, (_, i) => {
        const x = -6 + 5.6 * rnd("sx", i) + 0.15 * Math.sin(f / 20 + i);
        const y = -0.3 + (level - 0.1) * ((rnd("sy", i) + f * 0.002) % 1);
        return (
          <mesh key={`s${i}`} position={[x, y, 0.43]} material={glow("#bfe9ff", q(0.3 + 0.3 * Math.sin(f / 7 + i)))}>
            <sphereGeometry args={[0.025 + 0.02 * rnd("ss", i), 6, 4]} />
          </mesh>
        );
      })}
      {/* the white band on the dam's lake face above the water */}
      {FULL - level > 0.01 && (
        <mesh position={[-0.31, level - 0.2 + (FULL - level) / 2, 0]} rotation-y={-Math.PI / 2} material={mat("clay", BAND)}>
          <planeGeometry args={[1.2, FULL - level]} />
        </mesh>
      )}
      {/* the dam: a vertical lake face, a sloping downstream face (stacked courses) */}
      {[[-0.4, 1.3, 1.4], [1.0, 1.4, 0.95], [2.4, 1.4, 0.55], [3.8, 0.2, 0.32]].map(([y, h, w], i) => (
        <mesh key={i} position={[-0.3 + w! / 2, y! + h! / 2 - 0.2, -0.3]} material={mat("clay", CONCRETE)} castShadow>
          <boxGeometry args={[w!, h!, 1.2]} />
        </mesh>
      ))}
      {/* the tower, cut in half: its shaft glows */}
      <mesh position={[-1.4, DAM_H / 2 - 0.2, -0.2]} material={mat("clay", CONCRETE)}>
        <boxGeometry args={[0.6, DAM_H + 0.1, 0.6]} />
      </mesh>
      <mesh position={[-1.4, DAM_H / 2 - 0.2, 0.11]} material={glow("#7fd0ff", q(towerLit))}>
        <boxGeometry args={[0.24, DAM_H, 0.01]} />
      </mesh>
      {/* the steel pipe */}
      {segs.map((g2, i) => (
        <group key={i} position={g2.mid} rotation-z={g2.rot}>
          <mesh rotation-z={Math.PI / 2} material={mat("brushed", "#9aa3b0")}><cylinderGeometry args={[0.16, 0.16, g2.len + 0.12, 16]} /></mesh>
          <mesh rotation-z={Math.PI / 2} material={glow(TECH.cyan, q(pipeLit))}><cylinderGeometry args={[0.165, 0.165, g2.len + 0.1, 16, 1, true]} /></mesh>
        </group>
      ))}
      {/* water rushing down it */}
      {flow > 0.02 && Array.from({ length: 22 }, (_, i) => {
        const t = (f * 0.012 * (0.4 + flow) + i / 22) % 1;
        const p = along(t);
        return (
          <mesh key={i} position={[p[0], p[1], p[2] + 0.17]} material={glow("#bfeaff", q(Math.min(1.4, 0.6 + flow)))}>
            <sphereGeometry args={[0.06, 8, 6]} />
          </mesh>
        );
      })}
      {/* the powerhouse at the pipe's end */}
      <Block size={[1.4, 1.2, 1.2]} radius={0.03} preset="clay" color="#cfc6b2" position={[2.9, -1.0, -0.2]} />
      <mesh position={[2.9, -0.8, 0.41]} material={glow(WARM, 1.1)}><planeGeometry args={[0.9, 0.3]} /></mesh>
    </group>
  );
};

/** A pressure arrow pointing +x (into the dam), its length `len`. */
export const Arrow: React.FC<Group & { len: number; color?: string; o?: number }> = ({ len, color = TECH.amber, o = 1, ...g }) => (
  <group {...g}>
    {len > 0.02 && (
      <>
        <mesh position={[len / 2 - 0.1, 0, 0]} rotation-z={Math.PI / 2} material={glow(color, q(o))}>
          <cylinderGeometry args={[0.035, 0.035, Math.max(0.01, len - 0.2), 8]} />
        </mesh>
        <mesh position={[len - 0.08, 0, 0]} rotation-z={-Math.PI / 2} material={glow(color, q(o))}>
          <coneGeometry args={[0.1, 0.2, 12]} />
        </mesh>
      </>
    )}
  </group>
);

// ------------------------------------------------------------------ turbine
/** A turbine runner (Francis type): a hub with curved blades round a crown; spins about y by `turn`.
 * `worn` 0..1 roughens and darkens it, `lit` 0..1 lights the blades in order. */
export const Runner: React.FC<Group & { turn?: number; lit?: number; worn?: number; color?: string }> = ({ turn = 0, lit = 0, worn = 0, color = "#b9c2cf", ...g }) => {
  const N = 13;
  const blade = mat("brushed", worn > 0.5 ? "#7d6a58" : color);
  return (
    <group {...g}>
      <group rotation-y={turn}>
        <mesh position={[0, 0.35, 0]} material={mat("brushed", worn > 0.5 ? "#6f6458" : "#c9d0da")}>
          <cylinderGeometry args={[0.95, 0.95, 0.12, 40]} />
        </mesh>
        <mesh position={[0, -0.05, 0]} material={mat("brushed", "#8f99a6")}>
          <cylinderGeometry args={[0.3, 0.18, 0.7, 24]} />
        </mesh>
        <mesh position={[0, -0.35, 0]} material={mat("brushed", "#aab3bf")}>
          <torusGeometry args={[0.85, 0.06, 10, 40]} />
        </mesh>
        {Array.from({ length: N }, (_, i) => {
          const a = (i / N) * Math.PI * 2;
          const on = i / N < lit;
          return (
            <group key={i} rotation-y={a}>
              <mesh position={[0.6, 0.0, 0]} rotation={[0.0, 0.55, -0.35]} material={on ? glow(TECH.cyan, 0.9) : blade}>
                <boxGeometry args={[0.55, 0.62, 0.04]} />
              </mesh>
              {worn > 0.3 && (
                <mesh position={[0.7, 0.05, 0.05]} material={glow("#ff7a3d", q(worn))}>
                  <sphereGeometry args={[0.04, 6, 4]} />
                </mesh>
              )}
            </group>
          );
        })}
      </group>
    </group>
  );
};

/** The spiral case round the runner: a see-through scroll the water spins inward through. */
export const Scroll: React.FC<Group & { f: number; flow?: number; o?: number }> = ({ f, flow = 1, o = 0.35, ...g }) => (
  <group {...g}>
    <mesh rotation-x={Math.PI / 2} material={mat("glass", "#9fd2ff", { transparent: true, opacity: q(o) })}>
      <torusGeometry args={[1.45, 0.38, 16, 48]} />
    </mesh>
    {flow > 0.02 && Array.from({ length: 30 }, (_, i) => {
      const t = (f * 0.02 * flow + i / 30) % 1;
      const a = t * Math.PI * 2.2 + i * 0.4;
      const r = 1.5 - 0.8 * t;
      return (
        <mesh key={i} position={[r * Math.cos(a), 0.05 * Math.sin(i), r * Math.sin(a)]} material={glow("#c4ecff", q(0.8 + 0.4 * flow))}>
          <sphereGeometry args={[0.05, 8, 6]} />
        </mesh>
      );
    })}
  </group>
);

// ------------------------------------------------------------------ generator
/** A rotor of magnets (red and blue, alternating) spinning by `turn` inside a ring of copper coils.
 * Coils flash as a magnet passes when `live` > 0. Axis is y. */
export const Generator: React.FC<Group & { turn?: number; magnets?: number; coils?: number; live?: number }> = ({ turn = 0, magnets = 1, coils = 1, live = 0, ...g }) => {
  const NM = 12, NC = 18;
  return (
    <group {...g}>
      {/* the shaft */}
      <mesh position={[0, -1.4, 0]} material={mat("brushed", "#8f99a6")}><cylinderGeometry args={[0.18, 0.18, 2.6, 20]} /></mesh>
      <group rotation-y={turn}>
        <mesh material={mat("brushed", "#5d6470")}><cylinderGeometry args={[1.1, 1.1, 0.5, 48]} /></mesh>
        {Array.from({ length: NM }, (_, i) => {
          const a = (i / NM) * Math.PI * 2;
          return (
            <mesh key={i} position={[1.17 * Math.cos(a), 0, 1.17 * Math.sin(a)]} rotation-y={-a}
              material={glow(i % 2 ? "#ff4d5e" : "#4d8dff", q(0.3 + 0.9 * magnets))}>
              <boxGeometry args={[0.14, 0.46, 0.4]} />
            </mesh>
          );
        })}
      </group>
      {Array.from({ length: NC }, (_, i) => {
        const a = (i / NC) * Math.PI * 2;
        // which magnet is nearest this coil now
        let d = ((a - turn) % (Math.PI * 2 / NM) + Math.PI * 2) % (Math.PI * 2 / NM);
        d = Math.min(d, Math.PI * 2 / NM - d);
        const flash = live * Math.max(0, 1 - d / 0.12);
        return (
          <mesh key={i} position={[1.62 * Math.cos(a), 0, 1.62 * Math.sin(a)]} rotation={[0, -a, Math.PI / 2]}
            material={flash > 0.1 ? glow("#ffd27a", q(0.6 + flash)) : mat("copper")}>
            <torusGeometry args={[0.2, 0.07 * coils + 0.01, 8, 18]} />
          </mesh>
        );
      })}
      <mesh position={[0, 0, 0]} rotation-x={Math.PI / 2} material={mat("brushed", "#3d434d")}>
        <torusGeometry args={[1.95, 0.08, 8, 64]} />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------ power lines and a city
/** A steel lattice pylon, `h` tall, its arms along x. */
export const Pylon: React.FC<Group & { h?: number }> = ({ h = 2.4, ...g }) => (
  <group {...g}>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * 0.18, h / 2, 0]} rotation-z={s * 0.07} material={mat("brushed", "#8c96a5")}>
        <boxGeometry args={[0.05, h, 0.05]} />
      </mesh>
    ))}
    <mesh position={[0, h - 0.1, 0]} material={mat("brushed", "#8c96a5")}><boxGeometry args={[1.2, 0.05, 0.05]} /></mesh>
    <mesh position={[0, h * 0.7, 0]} material={mat("brushed", "#8c96a5")}><boxGeometry args={[0.9, 0.05, 0.05]} /></mesh>
  </group>
);

/** A line of pylons from `a` to `b` and a cable with a pulse running along it (0..1 `k`). */
export const PowerLine: React.FC<{ a: V3; b: V3; n?: number; k?: number; f: number; h?: number }> = ({ a, b, n = 6, k = 0, f, h = 2.4 }) => {
  const pts: V3[] = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  });
  const yaw = Math.atan2(b[0] - a[0], b[2] - a[2]) + Math.PI / 2;
  return (
    <group>
      {pts.map((p, i) => <Pylon key={i} position={p} rotation-y={yaw} h={h} />)}
      {pts.slice(1).map((p, i) => {
        const s = pts[i]!;
        const mid: V3 = [(s[0] + p[0]) / 2, (s[1] + p[1]) / 2 + h - 0.15, (s[2] + p[2]) / 2];
        const len = Math.hypot(p[0] - s[0], p[1] - s[1], p[2] - s[2]);
        const seg = (i + 0.5) / (n - 1);
        const on = k > seg ? 1 : 0;
        return (
          <mesh key={i} position={mid} rotation-y={Math.atan2(p[0] - s[0], p[2] - s[2])} material={on ? glow("#ffe08a", q(1.2 + 0.3 * Math.sin(f / 3 + i))) : mat("blackPlastic")}>
            <boxGeometry args={[0.03, 0.03, len]} />
          </mesh>
        );
      })}
    </group>
  );
};

/** A city at night on the plain: blocks of towers whose windows switch on outward from the centre by `on`. */
export const City: React.FC<Group & { on?: number; f?: number }> = ({ on = 1, f = 0, ...g }) => (
  <group {...g}>
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, 0]} material={mat("clay", "#2a2230")}><planeGeometry args={[14, 10]} /></mesh>
    {Array.from({ length: 70 }, (_, i) => {
      const x = (rnd("cx", i) - 0.5) * 9;
      const z = (rnd("cz", i) - 0.5) * 6;
      const r = Math.hypot(x / 4.5, z / 3);
      const h = 0.2 + (1.4 - r) * rnd("ch", i) * 1.4;
      const lit = on > r * 0.85 ? 1 : 0;
      const tw = 0.85 + 0.15 * Math.sin(f / 5 + i);
      return (
        <group key={i} position={[x, Math.max(0.1, h) / 2, z]}>
          <mesh material={mat("blackPlastic", "#1d2130")}><boxGeometry args={[0.3, Math.max(0.1, h), 0.3]} /></mesh>
          <mesh position={[0, 0, 0.152]} material={lit ? glow(i % 5 ? WARM : "#bfe3ff", q(tw * 1.2)) : mat("blackPlastic", "#151821")}>
            <planeGeometry args={[0.22, Math.max(0.06, h - 0.08)]} />
          </mesh>
        </group>
      );
    })}
  </group>
);

// ------------------------------------------------------------------ control room
/** The control room: a back wall with panels, a desk; lit cool. */
export const ControlRoom: React.FC<Group & { f: number; red?: number }> = ({ f, red = 0, ...g }) => (
  <group {...g}>
    <Block size={[9, 5, 0.3]} radius={0.02} preset="clay" color={red > 0.5 ? "#3a1c22" : "#1f2a3a"} position={[0, 2.5, -1.2]} />
    {Array.from({ length: 6 }, (_, i) => (
      <group key={i} position={[-3.4 + i * 1.36, 0.9, -1.0]}>
        <Block size={[1.1, 1.6, 0.25]} radius={0.03} preset="blackPlastic" position={[0, 0, 0]} />
        {Array.from({ length: 6 }, (_, j) => (
          <mesh key={j} position={[-0.3 + (j % 3) * 0.3, 0.4 - Math.floor(j / 3) * 0.35, 0.13]}
            material={glow(j % 2 ? TECH.lime : (red > 0.5 ? "#ff4d4d" : TECH.cyan), q(0.4 + 0.4 * (Math.sin(f / 6 + i * 2 + j) > 0 ? 1 : 0)))}>
            <circleGeometry args={[0.05, 12]} />
          </mesh>
        ))}
      </group>
    ))}
    <Block size={[4.5, 0.12, 1.4]} radius={0.03} preset="brushed" color="#5a6270" position={[0, 0.95, 1.4]} />
    <Block size={[4.3, 0.9, 1.2]} radius={0.03} preset="blackPlastic" position={[0, 0.45, 1.4]} />
  </group>
);

/** The big output dial: a white face, ticks, a needle at `needle` (0 = left end, 1 = right end), a ring glow. */
export const Dial: React.FC<Group & { needle?: number; ring?: number; ringColor?: string; lit?: number }> = ({ needle = 0, ring = 0, ringColor = TECH.amber, lit = 1, ...g }) => {
  const a = Math.PI * 0.75 - needle * Math.PI * 1.5;
  return (
    <group {...g}>
      <mesh rotation-x={Math.PI / 2} material={mat("brushed", "#3c424c")}><cylinderGeometry args={[1.25, 1.25, 0.12, 64]} /></mesh>
      <mesh position={[0, 0, 0.065]} material={lit > 0.5 ? glow("#f2efe6", 0.75) : mat("white", "#d9d6cc")}><circleGeometry args={[1.12, 64]} /></mesh>
      {Array.from({ length: 13 }, (_, i) => {
        const t = Math.PI * 0.75 - (i / 12) * Math.PI * 1.5;
        return (
          <mesh key={i} position={[0.98 * Math.cos(t), 0.98 * Math.sin(t), 0.07]} rotation-z={t} material={mat("blackPlastic")}>
            <boxGeometry args={[i % 3 ? 0.1 : 0.18, 0.025, 0.01]} />
          </mesh>
        );
      })}
      {/* a red zone at the low end */}
      <mesh position={[0, 0, 0.068]} rotation-z={Math.PI * 0.75 - Math.PI * 0.3} material={glow("#ff4d4d", 0.6)}>
        <ringGeometry args={[0.86, 0.94, 24, 1, 0, Math.PI * 0.3]} />
      </mesh>
      <group position={[0, 0, 0.08]} rotation-z={a}>
        <mesh position={[0.42, 0, 0]} material={glow("#ff3b30", 1.1)}><boxGeometry args={[0.84, 0.05, 0.02]} /></mesh>
      </group>
      <mesh position={[0, 0, 0.09]} material={mat("brushed", "#222")}><circleGeometry args={[0.08, 16]} /></mesh>
      {ring > 0.02 && (
        <mesh position={[0, 0, 0.07]} material={glow(ringColor, q(ring * 1.3))}><ringGeometry args={[1.13, 1.24, 64]} /></mesh>
      )}
    </group>
  );
};

/** A report folder on the desk. */
export const Folder: React.FC<Group & { open?: number }> = ({ open = 0, ...g }) => (
  <group {...g}>
    <Block size={[0.9, 0.04, 0.65]} radius={0.01} preset="clay" color="#2f5d8a" position={[0, 0.02, 0]} />
    <group position={[-0.45, 0.045, 0]} rotation-z={-open * 0.9}>
      <Block size={[0.88, 0.02, 0.62]} radius={0.01} preset="clay" color="#f1ece0" position={[0.44, 0, 0]} />
    </group>
  </group>
);

/** A small wall screen showing the lake: water filled to `level` (0..1) with a mark line at `mark`. */
export const LakeScreen: React.FC<Group & { level?: number; mark?: number; o?: number }> = ({ level = 1, mark = 0.3, o = 1, ...g }) => (
  <group {...g}>
    <Block size={[1.5, 1.0, 0.08]} radius={0.03} preset="blackPlastic" />
    <mesh position={[0, 0, 0.045]} material={glow("#0b1626", 0.9)}><planeGeometry args={[1.36, 0.86]} /></mesh>
    <mesh position={[0, -0.43 + 0.43 * level, 0.05]} material={glow("#2f8bdc", q(0.8 * o))}><planeGeometry args={[1.36, 0.86 * level]} /></mesh>
    <mesh position={[0, -0.43 + 0.86 * mark, 0.055]} material={glow("#ff4d4d", q(o))}><planeGeometry args={[1.36, 0.02]} /></mesh>
  </group>
);

/** An overhead crane girder across the powerhouse, its hook at `hook` (x) with a cable down to `drop` (y). */
export const Crane: React.FC<Group & { hook?: number; top?: number; drop?: number }> = ({ hook = 0, top = 4.2, drop = 2, ...g }) => (
  <group {...g}>
    <Block size={[9, 0.35, 0.5]} radius={0.03} preset="clay" color="#e0a32a" position={[0, top, 0]} />
    <Block size={[0.6, 0.35, 0.8]} radius={0.03} preset="clay" color="#3a3f4a" position={[hook, top - 0.3, 0]} />
    <mesh position={[hook, (top - 0.4 + drop) / 2, 0]} material={mat("brushed", "#aab")}><cylinderGeometry args={[0.02, 0.02, Math.max(0.01, top - 0.4 - drop), 6]} /></mesh>
  </group>
);

/** The powerhouse floor: a long hall, generator domes in a row, a pit in the middle. */
export const Hall: React.FC<Group & { f: number }> = ({ f, ...g }) => (
  <group {...g}>
    <Block size={[14, 0.1, 8]} radius={0.01} preset="clay" color="#8b8578" position={[0, -0.05, 0]} />
    <Block size={[14, 6, 0.3]} radius={0.01} preset="clay" color="#cfc6b2" position={[0, 3, -3.5]} />
    {Array.from({ length: 6 }, (_, i) => (
      <mesh key={i} position={[-5.4 + i * 2.2, 2.2, -3.33]} material={glow("#fff3d6", q(0.7 + 0.1 * Math.sin(f / 7 + i)))}><planeGeometry args={[1.1, 2.6]} /></mesh>
    ))}
    {[-4.5, -2.2, 2.2, 4.5].map((x) => (
      <group key={x} position={[x, 0, -1.6]}>
        <mesh position={[0, 0.35, 0]} material={mat("glossy", "#b8352b")}><cylinderGeometry args={[0.85, 0.95, 0.7, 40]} /></mesh>
        <mesh position={[0, 0.75, 0]} material={mat("glossy", "#d2d6dc")}><cylinderGeometry args={[0.5, 0.85, 0.12, 40]} /></mesh>
      </group>
    ))}
    {/* the open pit */}
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.005, 0.6]} material={mat("blackPlastic", "#0c0d10")}><circleGeometry args={[1.25, 40]} /></mesh>
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0.6]} material={glow(TECH.amber, 0.5)}><ringGeometry args={[1.25, 1.33, 48]} /></mesh>
  </group>
);

const Parts: React.FC = () => null;
export default Parts;
