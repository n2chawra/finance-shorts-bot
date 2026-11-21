// The Hyatt Regency atrium (Kansas City, 1981) as one 3D world shared by Hook, Fall and Toll: a tall glass
// atrium with roof trusses, side balconies, the fourth-floor walkway hung directly above the second-floor
// walkway (as built: the lower one hung from the upper one's box beams) and the third-floor walkway offset
// to one side. Scale: one unit ≈ 2.4 m. No people are drawn: the crowd is the dance floor's light.
import React from "react";
import { Easing } from "remotion";
import { Failure3D, glow, rnd, useDLook, type V3 } from "../../three/index";

export const FH = 1.3;                    // floor height
export const UPPER_Y = 4 * FH, LOWER_Y = 2 * FH, THIRD_Y = 3 * FH;
export const ROOF_Y = 7.6;
export const SPAN = 12;                   // walkway length along x
export const HANGERS = [-4, 0, 4];        // box beams (and hanger pairs) along the walkway
export const ROD_Z = 0.55;                // rods sit at the box beam's ends
/** the east end of the upper walkway's middle box beam, where the report says the failure began */
export const FIRST: V3 = [0, UPPER_Y - 0.14, ROD_Z];
export const WARM = "#ffb46a";

const sh = { castShadow: true, receiveShadow: true } as const;

/** One walkway: deck, glass-and-rail sides, three box beams under it with their nuts. */
export const Walkway: React.FC<{ y: number; z?: number; lit?: number; hot?: { stress: number; frame: number } }> = ({ y, z = 0, lit = 0, hot }) => {
  const { paint } = useDLook();
  const beams = HANGERS.map((x) => {
    const el = (
      <group key={x} position={[x, -0.14, 0]}>
        <mesh material={paint("steel")} {...sh}><boxGeometry args={[0.2, 0.18, 1.3]} /></mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, -0.12, s * ROD_Z]} material={paint("dark")}><cylinderGeometry args={[0.045, 0.045, 0.06, 6]} /></mesh>
        ))}
      </group>
    );
    return x === 0 && hot ? (
      <Failure3D key={x} stress={hot.stress} frame={hot.frame} hot={[0, -0.14, ROD_Z]} hotRadius={0.6} glowAt={2.2}>{el}</Failure3D>
    ) : el;
  });
  return (
    <group position={[0, y, z]}>
      <mesh material={paint("concrete")} {...sh}><boxGeometry args={[SPAN, 0.1, 0.95]} /></mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[0, 0.3, s * 0.46]} material={paint("glass")}><boxGeometry args={[SPAN, 0.42, 0.02]} /></mesh>
          <mesh position={[0, 0.52, s * 0.46]} material={paint("metal")}><boxGeometry args={[SPAN, 0.04, 0.05]} /></mesh>
          {lit > 0 && <mesh position={[0, 0.06, s * 0.49]} material={glow("#ffd84a", 0.9 * lit)}><boxGeometry args={[SPAN, 0.03, 0.03]} /></mesh>}
        </group>
      ))}
      {beams}
    </group>
  );
};

/** A hanger rod from y0 down to y1 at (x, z), swinging `swing` radians about its top. */
export const Rod: React.FC<{ x: number; z: number; y0: number; y1: number; swing?: number }> = ({ x, z, y0, y1, swing = 0 }) => {
  const { paint } = useDLook();
  const h = y0 - y1;
  return (
    <group position={[x, y0, z]} rotation-z={swing} rotation-x={swing * 0.4}>
      <mesh position={[0, -h / 2, 0]} material={paint("metal")}><cylinderGeometry args={[0.022, 0.022, h, 6]} /></mesh>
    </group>
  );
};

/** The building around the walkways: floor, back tower wall with floor bands and lit windows, side
 * balconies on floors 2–4, the roof trusses and the glass roof grid. */
export const Atrium: React.FC<{ dance: number; frame: number; dim?: number }> = ({ dance, frame, dim = 0 }) => {
  const { paint } = useDLook();
  const tiles: React.ReactNode[] = [];
  for (let i = 0; i < 12; i++) for (let k = 0; k < 6; k++) {
    const x = -6.6 + i * 1.2, z = -3 + k * 1.2;
    const on = 0.25 + 0.75 * Math.max(0, Math.sin(frame / 9 + rnd("tile", i * 7 + k) * 6.28));
    const col = ["#ffb46a", "#ff7a59", "#ffd84a", "#7fd0ff"][(i + k) % 4]!;
    tiles.push(
      <mesh key={`${i}-${k}`} position={[x, 0.012, z]} rotation-x={-Math.PI / 2} material={glow(col, Math.round(dance * on * (1 - dim) * 20) / 20 * 0.55)}>
        <planeGeometry args={[1.05, 1.05]} />
      </mesh>,
    );
  }
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} material={paint("ground")} receiveShadow><planeGeometry args={[40, 30]} /></mesh>
      {dance > 0 && tiles}
      {/* warm lobby light: lamps under the balconies and a glow up through the atrium */}
      <pointLight position={[-6, 2.2, 2]} intensity={5 * (1 - dim)} distance={14} color={WARM} />
      <pointLight position={[6, 2.2, 2]} intensity={5 * (1 - dim)} distance={14} color={WARM} />
      <pointLight position={[0, 6.5, 3]} intensity={3 * (1 - dim * 0.5)} distance={18} color="#ffe2b8" />
      {dance > 0 && <pointLight position={[0, 1.2, 0]} intensity={6 * dance * (1 - dim)} distance={12} color={WARM} />}
      {/* back wall (the tower side) with floor bands and window rows */}
      <mesh position={[0, ROOF_Y / 2, -6.5]} material={paint("concrete")} {...sh}><boxGeometry args={[22, ROOF_Y, 0.3]} /></mesh>
      {[1, 2, 3, 4, 5].map((f) => (
        <group key={f}>
          <mesh position={[0, f * FH, -6.3]} material={paint("steel")}><boxGeometry args={[22, 0.12, 0.1]} /></mesh>
          {Array.from({ length: 14 }, (_, i) => (
            <mesh key={i} position={[-9.1 + i * 1.4, f * FH + 0.6, -6.33]} material={glow(WARM, Math.round((0.35 + 0.4 * rnd("win", f * 20 + i)) * (1 - dim) * 10) / 10)}>
              <planeGeometry args={[0.7, 0.45]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* side balconies where the walkways land */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 9.5, ROOF_Y / 2, -1.5]} material={paint("concrete")} {...sh}><boxGeometry args={[0.3, ROOF_Y, 10]} /></mesh>
          {[2, 3, 4].map((f) => (
            <mesh key={f} position={[s * 7.8, f * FH, -1.5]} material={paint("concrete")} {...sh}><boxGeometry args={[3.4, 0.14, 10]} /></mesh>
          ))}
        </group>
      ))}
      {/* roof trusses across the atrium and the glass grid */}
      {[-6, -4, -2, 0, 2, 4, 6].map((x) => (
        <group key={x} position={[x, ROOF_Y, -1.5]}>
          <mesh material={paint("steel")} {...sh}><boxGeometry args={[0.16, 0.16, 10.5]} /></mesh>
          <mesh position={[0, 0.5, 0]} material={paint("steel")}><boxGeometry args={[0.1, 0.1, 10.5]} /></mesh>
          {[-4, -2, 0, 2, 4].map((z) => (
            <mesh key={z} position={[0, 0.25, z]} rotation-x={0.7} material={paint("steel")}><boxGeometry args={[0.06, 0.6, 0.06]} /></mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, ROOF_Y + 0.6, -1.5]} rotation-x={-Math.PI / 2} material={paint("glass")}><planeGeometry args={[19, 10.5]} /></mesh>
    </group>
  );
};

/** The three walkways and their rods. `fall` 0→1: the upper walkway drops onto the lower (to 0.45), then
 * both fall to the floor; the roof rods stay and swing. `stress` heats the first connection. */
export const Walkways: React.FC<{ frame: number; fall?: number; stress?: number; lit?: number }> = ({ frame, fall = 0, stress = 0, lit = 0 }) => {
  const g = (x: number) => Easing.in(Easing.quad)(Math.min(1, Math.max(0, x)));
  const a = g(fall / 0.45), b = g((fall - 0.45) / 0.55);
  const upperY = UPPER_Y - a * (UPPER_Y - LOWER_Y - 0.32) - b * (LOWER_Y - 0.02);
  const lowerY = LOWER_Y - b * (LOWER_Y - 0.12 - 0.06);
  const tilt = b * 0.03;
  const swing = fall > 0.05 ? Math.sin(frame / 7) * 0.05 * Math.exp(-Math.max(0, fall - 0.05) * 1.2) : 0;
  return (
    <group>
      {/* third floor walkway: offset, hung from the roof on its own rods; it stayed up */}
      <Walkway y={THIRD_Y} z={-3.4} />
      {HANGERS.map((x) => [-1, 1].map((s) => <Rod key={`t${x}${s}`} x={x} z={-3.4 + s * ROD_Z} y0={ROOF_Y} y1={THIRD_Y - 0.26} />))}
      {/* roof → upper box beams: they stay hanging after the nuts pull through */}
      {HANGERS.map((x) => [-1, 1].map((s) => (
        <Rod key={`u${x}${s}`} x={x - 0.06} z={s * ROD_Z} y0={ROOF_Y} y1={fall > 0.05 ? UPPER_Y - 0.26 : upperY - 0.26} swing={swing * s} />
      )))}
      <group position={[0, upperY - UPPER_Y, 0]} rotation-z={tilt}>
        <Walkway y={UPPER_Y} lit={lit} hot={{ stress, frame }} />
      </group>
      {/* upper box beams → lower box beams (as built) */}
      {HANGERS.map((x) => [-1, 1].map((s) => (
        <Rod key={`l${x}${s}`} x={x + 0.06} z={s * ROD_Z} y0={upperY - 0.14} y1={lowerY - 0.26} />
      )))}
      <group position={[0, lowerY - LOWER_Y, 0]} rotation-z={-tilt * 0.6}>
        <Walkway y={LOWER_Y} lit={lit} />
      </group>
    </group>
  );
};
export default Atrium;
