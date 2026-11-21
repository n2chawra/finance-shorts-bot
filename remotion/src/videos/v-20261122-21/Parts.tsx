// Parts: the models and places this video's beats share (all procedural, nothing downloaded).
// A tunnel boring machine laid along the x axis, its cutterhead facing +x at `front`: the spinning
// wheel with its cutting discs, the shield, the sealed chamber behind the wheel, the screw and belt
// conveyor running back along the trailing gantries, the erector arm at the tail and the concrete
// rings it builds. Around it: London's ground cut open side-on (clay strata, the street, buildings
// with lit windows) and the old Tube tunnels crossing it with their trains. No figures in here.
import React from "react";
import { Easing } from "remotion";
import { Block, cue, glow, mat, rnd, TECH, type V3 } from "../../three/index";

type Group = React.JSX.IntrinsicElements["group"];

export const k01 = (f: number, a: number, d: number, e = Easing.inOut(Easing.cubic)) => cue(f, a, Math.max(1, d), e);
export const q = (x: number, n = 20) => Math.round(x * n) / n;

export const CLAY = "#7b5634";
export const CLAY_DARK = "#5a3d24";
export const CONCRETE = "#b7b0a2";
export const STEEL = "#9aa3b0";
export const YELLOW = "#f2b63c";
export const TUBE = "#ffb340";

/** the bore's radius, the shield's length, the tail (where rings are built) relative to the front */
export const R = 1;
export const SHIELD = 3.4;
export const TAIL = -SHIELD - 0.15;
export const RING_W = 0.3;
export const SURFACE = 3.4;

const DOUBLE = { side: 2 as const };

// ------------------------------------------------------------------ the machine
/** The cutterhead: a steel wheel facing +x, six spokes with cutting discs, openings between them. */
export const Cutterhead: React.FC<Group & { spin?: number; lit?: number }> = ({ spin = 0, lit = 0.4, ...g }) => (
  <group {...g}>
    <group rotation-x={spin}>
      {/* the back plate (dark, seen through the openings) */}
      <mesh rotation-z={Math.PI / 2} position={[-0.12, 0, 0]} material={mat("blackPlastic", "#20232b")}>
        <cylinderGeometry args={[R * 0.98, R * 0.98, 0.08, 40]} />
      </mesh>
      {/* the rim */}
      <mesh rotation-y={Math.PI / 2} material={mat("brushed", STEEL)} castShadow>
        <torusGeometry args={[R * 0.95, 0.07, 10, 48]} />
      </mesh>
      {/* the hub */}
      <mesh rotation-z={Math.PI / 2} position={[0.05, 0, 0]} material={mat("brushed", "#c3c9d3")}>
        <cylinderGeometry args={[0.2, 0.26, 0.22, 24]} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <group key={i} rotation-x={a}>
            <mesh position={[0, R * 0.52, 0]} material={mat("brushed", STEEL)} castShadow>
              <boxGeometry args={[0.16, R * 0.86, 0.2]} />
            </mesh>
            {[0.35, 0.55, 0.75, 0.9].map((r, j) => (
              <mesh key={j} position={[0.1, R * r, 0]} rotation-z={Math.PI / 2} material={mat("gold", "#e0b25a")}>
                <cylinderGeometry args={[0.065, 0.065, 0.05, 14]} />
              </mesh>
            ))}
          </group>
        );
      })}
      {/* a glowing edge so the wheel reads in the dark */}
      <mesh rotation-y={Math.PI / 2} position={[0.04, 0, 0]} material={glow(TECH.amber, q(lit))}>
        <torusGeometry args={[R * 0.99, 0.018, 6, 64]} />
      </mesh>
    </group>
  </group>
);

/** The shield: the steel tube behind the wheel. `see` 0..1 turns its near half see-through. */
export const Shield: React.FC<Group & { see?: number }> = ({ see = 0, ...g }) => (
  <group {...g}>
    <mesh rotation-z={Math.PI / 2} position={[-SHIELD / 2 - 0.15, 0, 0]} material={see > 0.5 ? mat("glass", "#9fd8ff") : mat("brushed", "#7d8693", DOUBLE)} castShadow>
      <cylinderGeometry args={[R * 1.01, R * 1.01, SHIELD, 40, 1, true]} />
    </mesh>
    {/* rings of bolts round the shield */}
    {[-0.6, -1.7, -2.8].map((x, i) => (
      <mesh key={i} rotation-y={Math.PI / 2} position={[x, 0, 0]} material={mat("brushed", "#5f6874")}>
        <torusGeometry args={[R * 1.02, 0.03, 6, 48]} />
      </mesh>
    ))}
  </group>
);

/** The sealed chamber right behind the wheel: `fill` 0..1 of packed clay, `glowing` lights the bulkhead. */
export const Chamber: React.FC<Group & { fill?: number; glowing?: number }> = ({ fill = 0, glowing = 0, ...g }) => (
  <group {...g}>
    {fill > 0.02 && (
      <mesh rotation-z={Math.PI / 2} position={[-0.5, -R * 0.94 * (1 - fill) * 0.5, 0]} material={mat("clay", CLAY)}>
        <cylinderGeometry args={[R * 0.94 * (0.45 + 0.55 * fill), R * 0.94 * (0.45 + 0.55 * fill), 0.7, 32]} />
      </mesh>
    )}
    {/* the bulkhead: the chamber's back wall */}
    <mesh rotation-z={Math.PI / 2} position={[-0.92, 0, 0]} material={mat("brushed", "#6b7380")}>
      <cylinderGeometry args={[R * 0.97, R * 0.97, 0.06, 40]} />
    </mesh>
    <mesh rotation-y={Math.PI / 2} position={[-0.88, 0, 0]} material={glow(TECH.amber, q(0.1 + 1.2 * glowing))}>
      <ringGeometry args={[R * 0.8, R * 0.95, 48]} />
    </mesh>
  </group>
);

/** Pressure arrows pushing out of the chamber into the face (+x) and the ground around it. */
export const Pressure: React.FC<Group & { k?: number; f?: number }> = ({ k = 0, f = 0, ...g }) => (
  <group {...g}>
    {k > 0.02 && Array.from({ length: 7 }, (_, i) => {
      const a = (i / 7) * Math.PI * 2 + 0.3;
      const push = 0.15 * Math.sin(f / 4 + i);
      return (
        <group key={i} position={[0.35 + 0.5 * k + push, Math.sin(a) * 0.55, Math.cos(a) * 0.55]} rotation-z={-Math.PI / 2}>
          <mesh material={glow(TECH.amber, q(1.3 * k))}><coneGeometry args={[0.12, 0.3, 12]} /></mesh>
          <mesh position={[0, -0.3, 0]} material={glow(TECH.amber, q(1.0 * k))}><cylinderGeometry args={[0.04, 0.04, 0.35, 8]} /></mesh>
        </group>
      );
    })}
  </group>
);

/** The screw conveyor out of the chamber and the belt running back along the gantries; clay rides it. */
export const Conveyor: React.FC<Group & { len?: number; flow?: number; f?: number; lit?: number }> = ({ len = 14, flow = 0, f = 0, lit = 0.2, ...g }) => (
  <group {...g}>
    {/* the screw: an inclined tube from the chamber floor up to the belt */}
    <mesh position={[-1.9, -0.35, 0.25]} rotation-z={Math.PI / 2 + 0.25} material={mat("brushed", "#8a929e")}>
      <cylinderGeometry args={[0.16, 0.16, 2.0, 18]} />
    </mesh>
    {Array.from({ length: 8 }, (_, i) => (
      <mesh key={i} position={[-1.05 - i * 0.24, -0.58 + i * 0.06, 0.25]} rotation-y={Math.PI / 2} rotation-x={f * 0.2 * flow + i}
        material={glow(TECH.amber, q(0.2 + 0.6 * flow))}>
        <torusGeometry args={[0.17, 0.015, 4, 16]} />
      </mesh>
    ))}
    {/* the belt */}
    <mesh position={[-2.8 - len / 2, 0.0, 0.25]} material={mat("rubber")}>
      <boxGeometry args={[len, 0.06, 0.34]} />
    </mesh>
    <mesh position={[-2.8 - len / 2, 0.035, 0.25]} rotation-x={-Math.PI / 2} material={glow(TECH.cyan, q(lit))}>
      <planeGeometry args={[len, 0.04]} />
    </mesh>
    {/* clay lumps riding the belt */}
    {flow > 0.02 && Array.from({ length: 34 }, (_, i) => {
      const t = (f * 0.012 * flow + i / 34) % 1;
      return (
        <mesh key={i} position={[-2.8 - t * len, 0.1, 0.25 + 0.08 * (rnd("lump", i) - 0.5)]} material={mat("clay", i % 3 ? CLAY : CLAY_DARK)}>
          <dodecahedronGeometry args={[0.07 + 0.04 * rnd("lumps", i), 0]} />
        </mesh>
      );
    })}
  </group>
);

/** The trailing gantries: steel frames on wheels inside the finished tunnel, lit one by one by `lit`. */
export const Gantries: React.FC<Group & { n?: number; lit?: number }> = ({ n = 6, lit = 1, ...g }) => (
  <group {...g}>
    {Array.from({ length: n }, (_, i) => {
      const x = -4.2 - i * 2.2;
      const on = q(Math.max(0, Math.min(1, lit * n - i)));
      return (
        <group key={i} position={[x, 0, 0]}>
          {[-0.55, 0.55].map((z) => [-0.8, 0.8].map((dx) => (
            <mesh key={`${z}${dx}`} position={[dx, -0.35, z]} material={mat("brushed", "#59616d")}>
              <boxGeometry args={[0.08, 0.9, 0.08]} />
            </mesh>
          )))}
          <mesh position={[0, 0.12, 0]} material={mat("blackPlastic", "#2c3340")}><boxGeometry args={[1.9, 0.08, 1.2]} /></mesh>
          <mesh position={[0, 0.45, -0.3]} material={mat("blackPlastic", "#353d4c")}><boxGeometry args={[1.6, 0.5, 0.5]} /></mesh>
          <mesh position={[0, 0.45, -0.04]} material={glow(TECH.cyan, q(0.15 + 1.1 * on))}><planeGeometry args={[1.3, 0.06]} /></mesh>
        </group>
      );
    })}
  </group>
);

/** One ring of six curved concrete segments, axis along x; `pieces` how many are in place (0..6). */
export const Ring: React.FC<Group & { pieces?: number; lit?: number }> = ({ pieces = 6, lit = 0, ...g }) => (
  <group {...g}>
    {Array.from({ length: Math.min(6, Math.max(0, Math.floor(pieces))) }, (_, i) => (
      <mesh key={i} rotation-z={Math.PI / 2} material={mat("clay", CONCRETE, DOUBLE)} receiveShadow>
        <cylinderGeometry args={[R * 1.0, R * 1.0, RING_W - 0.02, 12, 1, true, (i / 6) * Math.PI * 2 + 0.02, Math.PI / 3 - 0.04]} />
      </mesh>
    ))}
    {lit > 0.02 && (
      <mesh rotation-y={Math.PI / 2} material={glow(TECH.cyan, q(lit))}>
        <torusGeometry args={[R * 1.0, 0.02, 6, 48]} />
      </mesh>
    )}
  </group>
);

/** The lined tunnel behind the tail: `n` rings, cut open on the camera's side (the far half only) when `cut`. */
export const Lining: React.FC<Group & { n?: number; cut?: boolean }> = ({ n = 40, cut = true, ...g }) => (
  <group {...g}>
    {Array.from({ length: n }, (_, i) => (
      <mesh key={i} position={[-i * RING_W, 0, 0]} rotation-z={Math.PI / 2} material={mat("clay", i % 2 ? CONCRETE : "#aaa395", DOUBLE)} receiveShadow>
        <cylinderGeometry args={[R * 1.0, R * 1.0, RING_W - 0.015, 18, 1, true, cut ? Math.PI / 2 : 0, cut ? Math.PI : Math.PI * 2]} />
      </mesh>
    ))}
  </group>
);

/** The erector arm at the tail: swings round the axis by `angle`, a segment on its end while `holding`. */
export const Erector: React.FC<Group & { angle?: number; holding?: boolean }> = ({ angle = 0, holding = true, ...g }) => (
  <group {...g}>
    <mesh rotation-z={Math.PI / 2} material={mat("brushed", "#6b7380")}><cylinderGeometry args={[0.18, 0.18, 0.4, 18]} /></mesh>
    <group rotation-x={angle}>
      <Block size={[0.22, 0.62, 0.22]} radius={0.04} preset="clay" color={YELLOW} position={[0, 0.32, 0]} />
      {holding && <Block size={[RING_W - 0.03, 0.14, 0.95]} radius={0.03} preset="clay" color={CONCRETE} position={[0, 0.82, 0]} />}
    </group>
  </group>
);

/** The whole machine with its front at x = 0 (put it at `front` with position). */
export const Machine: React.FC<Group & {
  f: number; spin?: number; see?: number; fill?: number; bulk?: number; flow?: number; beltLit?: number;
  gantries?: number; arm?: number; holding?: boolean; lining?: number; rings?: number; ringLit?: number; wheelLit?: number;
}> = ({ f, spin = 0, see = 0, fill = 0, bulk = 0, flow = 0, beltLit = 0.2, gantries = 1, arm = 0, holding = false, lining = 46, rings = 0, ringLit = 0, wheelLit = 0.4, ...g }) => (
  <group {...g}>
    <Cutterhead spin={spin} lit={wheelLit} />
    <Shield see={see} />
    <Chamber fill={fill} glowing={bulk} />
    <Conveyor f={f} flow={flow} lit={beltLit} len={13} />
    <Gantries lit={gantries} />
    <Erector position={[TAIL + 0.3, 0, 0]} angle={arm} holding={holding} />
    {rings > 0 && <Ring position={[TAIL - 0.05, 0, 0]} pieces={rings} lit={ringLit} />}
    <Lining position={[TAIL - 0.05 - RING_W, 0, 0]} n={Math.round(lining)} />
  </group>
);

// ------------------------------------------------------------------ the ground
/** One old Tube tunnel crossing the section (axis along z) with a train sliding through it. */
export const TubeTunnel: React.FC<Group & { r?: number; lit?: number; f?: number; train?: number; color?: string }> = ({ r = 0.6, lit = 0.5, f = 0, train = 1, color = TUBE, ...g }) => {
  const z = ((f * 0.06 * train) % 8) - 4;
  return (
    <group {...g}>
      <mesh rotation-x={Math.PI / 2} material={mat("clay", "#8d8577", DOUBLE)}>
        <cylinderGeometry args={[r, r, 6, 28, 1, true]} />
      </mesh>
      <mesh position={[0, 0, 3.01]} material={glow(color, q(0.25 + 1.1 * lit))}>
        <ringGeometry args={[r * 0.9, r * 1.06, 40]} />
      </mesh>
      {train > 0 && (
        <group position={[0, -r * 0.25, z]}>
          <Block size={[r * 1.1, r * 1.0, 1.6]} radius={0.08} preset="white" color="#dfe4ea" />
          <mesh position={[r * 0.56, 0.05, 0]} rotation-y={Math.PI / 2} material={glow("#fff1c9", q(0.6 + 0.6 * lit))}>
            <planeGeometry args={[1.3, r * 0.3]} />
          </mesh>
          <mesh position={[0, -r * 0.1, 0.81]} material={glow("#e63a3a", 1)}><planeGeometry args={[r * 1.0, r * 0.14]} /></mesh>
        </group>
      )}
    </group>
  );
};

/** The buildings on the street: boxes with rows of lit windows; `lamps` 0..1 lights them along x. */
export const Street: React.FC<Group & { lamps?: number; from?: number; to?: number }> = ({ lamps = 1, from = -22, to = 14, ...g }) => {
  const n = Math.round((to - from) / 1.6);
  return (
    <group {...g}>
      <mesh position={[(from + to) / 2, SURFACE + 0.05, -0.2]} material={mat("blackPlastic", "#2a2e36")}><boxGeometry args={[to - from, 0.1, 3.2]} /></mesh>
      {Array.from({ length: n }, (_, i) => {
        const x = from + 0.8 + i * 1.6;
        const h = 1.2 + 2.2 * rnd("bh", i);
        const on = q(Math.max(0, Math.min(1, lamps * n - i)));
        return (
          <group key={i} position={[x, SURFACE + 0.1, -1.2]}>
            <Block size={[1.3, h, 1.1]} radius={0.03} preset="clay" color={rnd("bc", i) > 0.5 ? "#4a4f5c" : "#5b5246"} position={[0, h / 2, 0]} />
            {Array.from({ length: Math.floor(h / 0.45) }, (_, j) => (
              <mesh key={j} position={[0, 0.3 + j * 0.45, 0.56]} material={glow("#ffd58a", q(on * (rnd("w", i * 10 + j) > 0.3 ? 0.9 : 0.15)))}>
                <planeGeometry args={[0.9, 0.16]} />
              </mesh>
            ))}
          </group>
        );
      })}
      {/* street lamps */}
      {Array.from({ length: n }, (_, i) => (
        <mesh key={`l${i}`} position={[from + 1.6 + i * 1.6, SURFACE + 0.45, 0.9]} material={glow("#ffe3a8", q(lamps * 1.4))}>
          <sphereGeometry args={[0.06, 8, 6]} />
        </mesh>
      ))}
    </group>
  );
};

/** London's ground cut open side-on: clay strata behind the machine, gravel and the street above. */
export const Ground: React.FC<Group & { from?: number; to?: number; bottom?: number }> = ({ from = -24, to = 16, bottom = -6, ...g }) => {
  const w = to - from;
  const cx = (from + to) / 2;
  return (
    <group {...g}>
      <mesh position={[cx, (SURFACE + bottom) / 2, -1.45]} material={mat("clay", CLAY)} receiveShadow>
        <boxGeometry args={[w, SURFACE - bottom, 0.3]} />
      </mesh>
      {/* the gravel layer and made ground under the street */}
      <mesh position={[cx, SURFACE - 0.45, -1.28]} material={mat("clay", "#8f7a5a")}><boxGeometry args={[w, 0.9, 0.05]} /></mesh>
      <mesh position={[cx, SURFACE - 0.06, -1.27]} material={mat("clay", "#5c5248")}><boxGeometry args={[w, 0.12, 0.05]} /></mesh>
      {/* darker bands in the clay */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[cx, -0.8 - i * 1.1 + 0.3 * rnd("band", i), -1.28]} material={mat("clay", CLAY_DARK)}>
          <boxGeometry args={[w, 0.06 + 0.08 * rnd("bandh", i), 0.04]} />
        </mesh>
      ))}
      {/* pebbles */}
      {Array.from({ length: 60 }, (_, i) => (
        <mesh key={`p${i}`} position={[from + w * rnd("px", i), bottom + (SURFACE - 1 - bottom) * rnd("py", i), -1.27]} material={mat("clay", "#6a4a2c")}>
          <circleGeometry args={[0.04 + 0.06 * rnd("pr", i), 8]} />
        </mesh>
      ))}
    </group>
  );
};

/** The clay face the wheel bites into, seen from ahead: a wall with a hole the size of the bore. */
export const Face: React.FC<Group> = (g) => (
  <group {...g}>
    <mesh rotation-y={Math.PI / 2} material={mat("clay", CLAY)}>
      <ringGeometry args={[R * 1.03, 9, 64]} />
    </mesh>
  </group>
);

/** Clay chunks breaking off the face and falling into the openings. */
export const Chunks: React.FC<Group & { f: number; k?: number; seed?: string; spread?: number }> = ({ f, k = 1, seed = "ch", spread = 0.9, ...g }) => (
  <group {...g}>
    {k > 0.02 && Array.from({ length: 22 }, (_, i) => {
      const t = (f * 0.03 + rnd(seed, i)) % 1;
      const a = rnd(`${seed}a`, i) * Math.PI * 2;
      const r0 = spread * (0.2 + 0.75 * rnd(`${seed}r`, i));
      return (
        <mesh key={i} position={[0.15 - 0.3 * t, Math.sin(a) * r0 - 1.4 * t * t, Math.cos(a) * r0]} rotation={[t * 4, i, t * 3]} material={mat("clay", i % 2 ? CLAY : CLAY_DARK)}>
          <dodecahedronGeometry args={[(0.05 + 0.06 * rnd(`${seed}s`, i)) * k, 0]} />
        </mesh>
      );
    })}
  </group>
);

/** The places the old Tube tunnels cross this stretch of ground (x, y, radius). */
export const TUBES: [number, number, number][] = [[7, 0.2, 0.62], [-7, 1.8, 0.6], [2.5, -2.0, 0.6], [-14, -1.6, 0.62]];

export const Section: React.FC<{ f: number; front: number; lamps?: number; tubes?: number; newLine?: number } & Omit<React.ComponentProps<typeof Machine>, "f">> = ({ f, front, lamps = 1, tubes = 0.5, newLine = 0, ...mach }) => (
  <group>
    <Ground />
    <Street lamps={lamps} />
    {TUBES.map(([x, y, r], i) => (
      <TubeTunnel key={i} position={[x, y, 0]} r={r} f={f + i * 37} lit={q(Math.max(0, Math.min(1, tubes * TUBES.length - i)))} />
    ))}
    <Machine f={f} position={[front, 0, 0]} {...mach} />
    {newLine > 0.01 && (
      <mesh position={[front - 30 * newLine / 2, 0, 1.02]} material={glow(TECH.cyan, q(0.8))}>
        <boxGeometry args={[30 * newLine, 0.04, 0.02]} />
      </mesh>
    )}
  </group>
);

export const tint = (v: V3, s: number): V3 => [v[0] * s, v[1] * s, v[2] * s];
export default Machine;
