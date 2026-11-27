// Parts: the models this video's beats share (all procedural, nothing downloaded).
// A car starter motor laid along the x axis, its pinion facing -x toward the engine's flywheel: the
// motor case with its spinning armature, the solenoid on its back (coil, plunger, return spring and the
// contact cap with two copper posts), the fork lever, the pinion gear with its one-way clutch, and the
// flywheel's toothed ring gear. Around it: a cut-open four-cylinder engine (block, pistons, con rods,
// crankshaft) and a car battery with its heavy cable. Geometry only: no figures in here.
import React from "react";
import { Easing } from "remotion";
import { Block, cue, glow, mat, TECH, xray, type V3 } from "../../three/index";

type Group = React.JSX.IntrinsicElements["group"];

export const k01 = (f: number, a: number, d: number, e = Easing.inOut(Easing.cubic)) => cue(f, a, Math.max(1, d), e);
export const q = (x: number, n = 20) => Math.round(x * n) / n;

export const STEEL = "#9aa3b0";
export const DARK = "#3a3f49";
export const RED = "#ff4d3d";
export const COPPER = "#e08a4b";
export const BACK = { top: "#0d1220", bottom: "#030409", glow: "rgba(255,180,80,0.10)" };

// the real tooth counts of the starter in the story (geometry only: what is said and shown comes from params.fig)
export const PINION_TEETH = 9;
export const RING_TEETH = 135;
/** the ring gear's pitch radius, the pinion's (in proportion to the tooth counts), the crank height */
export const RING_R = 1.55;
export const PIN_R = (RING_R * PINION_TEETH) / RING_TEETH;
export const HC = 2.2;
/** where the pinion meshes with the ring: below the crank, toward the camera (+z) */
const MESH_A = 0.62;
const D = RING_R + PIN_R;
export const STARTER_AT: V3 = [0, HC - D * Math.cos(MESH_A), D * Math.sin(MESH_A)];
/** the pinion's x when it is out (0) and in mesh (1) */
export const PIN_OUT = 0.42;
export const pinionX = (engage: number) => PIN_OUT * (1 - engage);
/** the ring turns the other way, 1 turn for every RING/PINION turns of the pinion */
export const ringAngle = (pinionAngle: number) => (-pinionAngle * PINION_TEETH) / RING_TEETH;

// ------------------------------------------------------------------ gears
/** A spur gear on the x axis: hub disc and teeth. `lit(i)` 0..1 lights tooth i amber. */
export const Gear: React.FC<Group & { teeth: number; r: number; w?: number; color?: string; angle?: number; lit?: (i: number) => number; face?: boolean }> = ({
  teeth, r, w = 0.2, color = STEEL, angle = 0, lit, face = true, ...g
}) => {
  const pitch = (2 * Math.PI * r) / teeth;
  const h = Math.min(0.09, pitch * 0.9);
  return (
    <group {...g}>
      <group rotation-x={angle}>
        {face && (
          <mesh rotation-z={Math.PI / 2} material={mat("brushed", color)} castShadow>
            <cylinderGeometry args={[r - h * 0.5, r - h * 0.5, w, Math.max(24, Math.min(96, teeth * 2))]} />
          </mesh>
        )}
        {Array.from({ length: teeth }, (_, i) => {
          const a = (i / teeth) * Math.PI * 2;
          const l = lit ? q(lit(i), 4) : 0;
          return (
            <group key={i} rotation-x={a}>
              <mesh position={[0, r, 0]} material={l > 0 ? glow(TECH.amber, Math.max(0.35, l)) : mat("brushed", color)}>
                <boxGeometry args={[w, h, pitch * 0.48]} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
};

/** The flywheel: a dark steel disc with bolt holes and the ring gear round its rim, on the x axis at the crank. */
export const Flywheel: React.FC<Group & { angle?: number; lit?: (i: number) => number; marker?: number }> = ({ angle = 0, lit, marker = 0, ...g }) => (
  <group {...g}>
    <group rotation-x={angle}>
      <mesh rotation-z={Math.PI / 2} material={mat("brushed", "#8f96a2")} castShadow>
        <cylinderGeometry args={[RING_R - 0.12, RING_R - 0.12, 0.12, 64]} />
      </mesh>
      <mesh rotation-z={Math.PI / 2} position={[-0.07, 0, 0]} material={mat("brushed", "#a6adb8")}>
        <cylinderGeometry args={[0.36, 0.36, 0.06, 32]} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} rotation-z={Math.PI / 2} position={[-0.07, Math.cos(a) * 0.62, Math.sin(a) * 0.62]} material={mat("blackPlastic", "#15171c")}>
            <cylinderGeometry args={[0.09, 0.09, 0.03, 16]} />
          </mesh>
        );
      })}
      {marker > 0 && (
        <mesh position={[-0.09, RING_R - 0.3, 0]} material={glow(TECH.cyan, q(marker))}>
          <sphereGeometry args={[0.09, 16, 12]} />
        </mesh>
      )}
    </group>
    <Gear teeth={RING_TEETH} r={RING_R} w={0.18} angle={angle} lit={lit} face={false} color="#c3c9d3" />
  </group>
);

// ------------------------------------------------------------------ the starter
export type StarterProps = Group & {
  /** 0 = pinion out, plunger out; 1 = plunger in, lever over, pinion in mesh */
  engage?: number;
  /** the pinion (and armature) angle in radians */
  spin?: number;
  /** the coil's glow 0..1 */
  coil?: number;
  /** the copper contact disc's glow 0..1 */
  contact?: number;
  /** the windings glow 0..1 (current in the motor) */
  windings?: number;
  /** red warning on the case 0..1 */
  warn?: number;
  /** see-through case 0..1 (0.5+ shows the inside) */
  see?: number;
  /** the pinion spins on its own (free-wheeling): its angle, else it follows `spin` */
  pinionSpin?: number;
};

/** The starter, origin at the pinion's mesh point when engaged; the motor runs along +x. */
export const Starter: React.FC<StarterProps> = ({ engage = 0, spin = 0, coil = 0, contact = 0, windings = 0, warn = 0, see = 0.7, pinionSpin, ...g }) => {
  const px = pinionX(engage);
  const plunger = 0.16 * engage; // the plunger slides +x into the coil
  const lever = -0.42 * engage; // the fork lever's swing about its pivot
  const shows = see > 0.5;
  const caseMat = shows ? xray(warn > 0.3 ? RED : TECH.cyan, 0.9) : mat("brushed", "#59606c");
  const sx = 0.55; // the motor case starts here
  return (
    <group {...g}>
      {/* the drive shaft and the pinion with its clutch shell */}
      <mesh rotation-z={Math.PI / 2} position={[0.55, 0, 0]} material={mat("brushed", "#c7ccd6")}>
        <cylinderGeometry args={[0.035, 0.035, 1.2, 12]} />
      </mesh>
      <group position={[px, 0, 0]}>
        <Gear teeth={PINION_TEETH} r={PIN_R + 0.02} w={0.2} angle={pinionSpin ?? spin} color="#d6dbe3" />
        <mesh rotation-z={Math.PI / 2} position={[0.2, 0, 0]} material={mat("brushed", "#8b929e")}>
          <cylinderGeometry args={[0.15, 0.15, 0.2, 24]} />
        </mesh>
        {/* the collar the fork pushes */}
        <mesh rotation-y={Math.PI / 2} position={[0.33, 0, 0]} material={mat("brushed", "#b0b6c0")}>
          <torusGeometry args={[0.1, 0.025, 8, 24]} />
        </mesh>
      </group>
      {/* the fork lever: pivot between the solenoid and the motor */}
      <group position={[sx + 0.3, 0.3, 0]} rotation-z={lever}>
        <mesh position={[0, 0.12, 0]} material={mat("brushed", "#e0b25a")}>
          <boxGeometry args={[0.05, 0.3, 0.06]} />
        </mesh>
        <mesh position={[-0.1, -0.2, 0]} rotation-z={0.5} material={mat("brushed", "#e0b25a")}>
          <boxGeometry args={[0.05, 0.42, 0.06]} />
        </mesh>
        <mesh rotation-x={Math.PI / 2} material={mat("brushed", "#555b66")}>
          <cylinderGeometry args={[0.035, 0.035, 0.12, 12]} />
        </mesh>
      </group>
      {/* the motor case and its armature */}
      <mesh rotation-z={Math.PI / 2} position={[sx + 0.75, 0, 0]} material={caseMat}>
        <cylinderGeometry args={[0.32, 0.32, 1.5, 40, 1, true]} />
      </mesh>
      <mesh rotation-z={Math.PI / 2} position={[sx + 1.52, 0, 0]} material={mat("brushed", "#4d535e")}>
        <cylinderGeometry args={[0.3, 0.26, 0.08, 32]} />
      </mesh>
      <group position={[sx + 0.75, 0, 0]} rotation-x={spin}>
        <mesh rotation-z={Math.PI / 2} material={mat("brushed", "#6d737e")}>
          <cylinderGeometry args={[0.2, 0.2, 1.1, 24]} />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[0, Math.cos(a) * 0.21, Math.sin(a) * 0.21]} material={windings > 0.05 ? glow(COPPER, q(0.4 + 0.6 * windings)) : mat("copper")}>
              <boxGeometry args={[1.05, 0.045, 0.06]} />
            </mesh>
          );
        })}
      </group>
      {/* field magnets inside the case */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[sx + 0.75, 0, s * 0.27]} material={mat("blackPlastic", "#2a2e37")}>
          <boxGeometry args={[1.1, 0.24, 0.05]} />
        </mesh>
      ))}
      {/* the solenoid on its back */}
      <group position={[sx + 0.5, 0.5, 0]}>
        <mesh rotation-z={Math.PI / 2} position={[0.4, 0, 0]} material={shows ? xray(TECH.cyan, 0.8) : mat("brushed", "#7d8693")}>
          <cylinderGeometry args={[0.17, 0.17, 0.8, 32, 1, true]} />
        </mesh>
        {/* the coil */}
        <mesh rotation-z={Math.PI / 2} position={[0.4, 0, 0]} material={coil > 0.05 ? glow(COPPER, q(0.35 + 0.65 * coil)) : mat("copper")}>
          <cylinderGeometry args={[0.14, 0.14, 0.5, 24, 1, true]} />
        </mesh>
        {/* the plunger and its rod */}
        <mesh rotation-z={Math.PI / 2} position={[0.12 + plunger, 0, 0]} material={mat("brushed", "#c9ced6")}>
          <cylinderGeometry args={[0.08, 0.08, 0.42, 20]} />
        </mesh>
        <mesh rotation-z={Math.PI / 2} position={[0.58 + plunger, 0, 0]} material={mat("brushed", "#9aa1ad")}>
          <cylinderGeometry args={[0.025, 0.025, 0.36, 10]} />
        </mesh>
        {/* the return spring round the plunger */}
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} rotation-y={Math.PI / 2} position={[0.3 + plunger * 0.5 + i * (0.05 - plunger * 0.12), 0, 0]} material={mat("brushed", "#d8dde6")}>
            <torusGeometry args={[0.1, 0.012, 6, 20]} />
          </mesh>
        ))}
        {/* the copper disc on the rod, and the contact cap with two posts */}
        <mesh rotation-z={Math.PI / 2} position={[0.76 + plunger, 0, 0]} material={contact > 0.05 ? glow(COPPER, q(0.4 + 0.6 * contact)) : mat("copper")}>
          <cylinderGeometry args={[0.12, 0.12, 0.03, 24]} />
        </mesh>
        <mesh rotation-z={Math.PI / 2} position={[0.98, 0, 0]} material={mat("blackPlastic", "#1d2027")}>
          <cylinderGeometry args={[0.17, 0.17, 0.12, 32]} />
        </mesh>
        {[0.08, -0.08].map((z) => (
          <mesh key={z} rotation-z={Math.PI / 2} position={[0.98, 0, z]} material={contact > 0.05 ? glow(COPPER, q(0.4 + 0.6 * contact)) : mat("copper")}>
            <cylinderGeometry args={[0.03, 0.03, 0.32, 10]} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/** The pinion's one-way (roller) clutch, sliced open, on the x axis: outer ring, inner hub, rollers in
 * ramps. `slip` 0..1 slides the rollers back in their ramps; outer/inner are the two angles. */
export const Clutch: React.FC<Group & { outer?: number; inner?: number; slip?: number; lit?: number }> = ({ outer = 0, inner = 0, slip = 0, lit = 0, ...g }) => (
  <group {...g}>
    <group rotation-x={outer}>
      <mesh rotation-z={Math.PI / 2} material={mat("brushed", "#8b929e", { side: 2 })}>
        <cylinderGeometry args={[1.0, 1.0, 0.4, 48, 1, true]} />
      </mesh>
      <mesh rotation-y={Math.PI / 2} material={mat("brushed", "#b0b6c0")}>
        <torusGeometry args={[1.0, 0.05, 8, 48]} />
      </mesh>
      <Gear teeth={PINION_TEETH} r={1.12} w={0.36} color="#d6dbe3" face={false} />
    </group>
    <group rotation-x={inner}>
      <mesh rotation-z={Math.PI / 2} material={mat("brushed", "#5f6670")}>
        <cylinderGeometry args={[0.55, 0.55, 0.42, 5]} />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2 + 0.25 + 0.22 * slip;
        return (
          <group key={i}>
            <mesh rotation-z={Math.PI / 2} position={[0, Math.cos(a) * 0.74, Math.sin(a) * 0.74]} material={lit > 0.05 ? glow(TECH.amber, q(0.4 + 0.6 * lit)) : mat("solder")}>
              <cylinderGeometry args={[0.12, 0.12, 0.44, 16]} />
            </mesh>
            <mesh position={[0, Math.cos(a - 0.34) * 0.72, Math.sin(a - 0.34) * 0.72]} material={mat("brushed", "#d8dde6")}>
              <boxGeometry args={[0.44, 0.05, 0.05]} />
            </mesh>
          </group>
        );
      })}
    </group>
  </group>
);

// ------------------------------------------------------------------ the engine
const CYL_X = [1.0, 2.0, 3.0, 4.0];
const PHASE = [0, Math.PI, Math.PI, 0];
const THROW = 0.32, ROD = 1.15;

/** A cut-open four-cylinder engine on the crank axis (y = HC), flywheel at x = 0, block toward +x.
 * `crank` is the crankshaft angle; `fire` 0..1 flashes the cylinders; `lit` marks the pistons. */
export const Engine: React.FC<Group & { crank?: number; fire?: number; see?: number; lit?: number }> = ({ crank = 0, fire = 0, see = 1, lit = 0, ...g }) => (
  <group {...g}>
    {/* the block shell */}
    <mesh position={[2.55, HC + 0.9, 0]} material={see > 0.5 ? xray("#7fb6ff", 0.7) : mat("brushed", "#5b616b")}>
      <boxGeometry args={[4.5, 3.3, 1.5]} />
    </mesh>
    {/* the cylinder head and its valve cover on top, the oil pan underneath: reads as an engine */}
    <Block size={[4.6, 0.45, 1.6]} preset="brushed" color="#6d737e" position={[2.55, HC + 2.78, 0]} />
    <Block size={[4.2, 0.4, 1.2]} preset="glossy" color="#8e2424" position={[2.55, HC + 3.2, 0]} radius={0.12} />
    {[0.9, 1.9, 2.9, 3.9].map((x) => (
      <mesh key={x} position={[x + 0.25, HC + 3.45, 0]} material={mat("brushed", "#c9ced6")}>
        <cylinderGeometry args={[0.07, 0.07, 0.12, 12]} />
      </mesh>
    ))}
    <Block size={[4.0, 0.5, 1.3]} preset="brushed" color="#4d535e" position={[2.6, HC - 0.95, 0]} radius={0.1} />
    {/* the crankshaft */}
    <mesh rotation-z={Math.PI / 2} position={[2.4, HC, 0]} material={mat("brushed", "#c3c9d3")}>
      <cylinderGeometry args={[0.09, 0.09, 4.6, 16]} />
    </mesh>
    {CYL_X.map((x, i) => {
      const a = crank + PHASE[i]!;
      const pinY = HC + Math.cos(a) * THROW, pinZ = Math.sin(a) * THROW;
      const pisY = pinY + Math.sqrt(Math.max(0.01, ROD * ROD - pinZ * pinZ));
      const rodLen = Math.hypot(pisY - pinY, pinZ);
      const rodTilt = Math.atan2(-pinZ, pisY - pinY);
      const flash = q(fire * (0.5 + 0.5 * Math.cos(a)), 10);
      return (
        <group key={i}>
          {/* the crank throw */}
          <group position={[x, HC, 0]} rotation-x={a}>
            <mesh position={[0, THROW / 2, 0]} material={mat("brushed", "#9aa3b0")}>
              <boxGeometry args={[0.12, THROW + 0.2, 0.3]} />
            </mesh>
          </group>
          {/* the con rod */}
          <mesh position={[x, (pinY + pisY) / 2, pinZ / 2]} rotation-x={rodTilt} material={mat("brushed", "#b9bfca")}>
            <boxGeometry args={[0.1, rodLen, 0.1]} />
          </mesh>
          {/* the piston */}
          <mesh position={[x, pisY + 0.18, 0]} material={lit > 0.05 ? glow(TECH.amber, q(0.45 + 0.55 * lit)) : mat("aluminium", "#d2d7df")}>
            <cylinderGeometry args={[0.36, 0.36, 0.42, 28]} />
          </mesh>
          {/* the cylinder bore */}
          <mesh position={[x, HC + 1.75, 0]} material={mat("glass", "#bfe8ff")}>
            <cylinderGeometry args={[0.4, 0.4, 1.5, 28, 1, true]} />
          </mesh>
          {/* the spark plug and its flash */}
          <mesh position={[x, HC + 2.6, 0]} material={mat("ceramic", "#e8e8ee")}>
            <cylinderGeometry args={[0.06, 0.06, 0.3, 10]} />
          </mesh>
          {flash > 0.05 && (
            <mesh position={[x, HC + 2.25, 0]} material={glow(TECH.amber, flash)}>
              <sphereGeometry args={[0.32, 16, 12]} />
            </mesh>
          )}
        </group>
      );
    })}
  </group>
);

/** The whole machine: engine, flywheel and the starter meshed at its rim. */
export const Machine: React.FC<Group & {
  pinion: number; engage?: number; coil?: number; contact?: number; windings?: number; warn?: number; fire?: number;
  ringLit?: (i: number) => number; marker?: number; pistons?: number; seeEngine?: number; pinionSpin?: number; crank?: number;
}> = ({ pinion, engage = 1, coil = 0, contact = 0, windings = 0, warn = 0, fire = 0, ringLit, marker = 0, pistons = 0, seeEngine = 1, pinionSpin, crank, ...g }) => {
  const ring = crank ?? ringAngle(pinion);
  return (
    <group {...g}>
      <Engine crank={ring} fire={fire} see={seeEngine} lit={pistons} />
      <Flywheel position={[0, HC, 0]} angle={ring} lit={ringLit} marker={marker} />
      <Starter position={STARTER_AT} engage={engage} spin={pinion} pinionSpin={pinionSpin} coil={coil} contact={contact} windings={windings} warn={warn} />
    </group>
  );
};

/** A car battery: a black case, a red and a black terminal; `lit` lights the terminals. */
export const Battery: React.FC<Group & { lit?: number }> = ({ lit = 0, ...g }) => (
  <group {...g}>
    <Block size={[1.0, 0.75, 0.6]} preset="battery" color="#23262e" position={[0, 0.375, 0]} />
    <Block size={[1.02, 0.08, 0.62]} preset="blackPlastic" position={[0, 0.78, 0]} />
    {[[-0.32, RED], [0.32, "#2b2f38"]].map(([x, c]) => (
      <mesh key={String(x)} position={[Number(x), 0.88, 0]} material={lit > 0.05 ? glow(String(c) === RED ? RED : TECH.cyan, q(0.4 + 0.6 * lit)) : mat("solder", String(c))}>
        <cylinderGeometry args={[0.07, 0.08, 0.14, 14]} />
      </mesh>
    ))}
  </group>
);

/** A heavy cable through the given points, with a glowing pulse travelling along it (`k` 0..1, `lit` 0..1). */
export const Cable: React.FC<{ points: V3[]; k?: number; lit?: number; color?: string }> = ({ points, k = 0, lit = 0, color = RED }) => {
  const segs = points.slice(1).map((b, i) => {
    const a = points[i]!;
    const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    return { a, b, mid, len };
  });
  const total = segs.reduce((s, x) => s + x.len, 0);
  let acc = 0;
  return (
    <group>
      {segs.map((s, i) => {
        const dir = [s.b[0] - s.a[0], s.b[1] - s.a[1], s.b[2] - s.a[2]];
        const yaw = Math.atan2(dir[2]!, dir[0]!);
        const pitch = Math.atan2(dir[1]!, Math.hypot(dir[0]!, dir[2]!));
        const from = acc / total;
        acc += s.len;
        const on = q(Math.min(1, Math.max(0, (k - from) / Math.max(0.01, s.len / total))), 5);
        return (
          <group key={i} position={s.mid} rotation={[0, -yaw, pitch]}>
            <mesh rotation-z={Math.PI / 2} material={on > 0 && lit > 0.05 ? glow(color, q(0.4 + 0.6 * lit * on)) : mat("rubber", "#1f2127")}>
              <cylinderGeometry args={[0.06, 0.06, s.len + 0.04, 12]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
export default Machine;
