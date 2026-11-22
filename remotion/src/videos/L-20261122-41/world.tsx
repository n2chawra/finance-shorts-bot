// The Hyatt Regency atrium (Kansas City, July 1981) as one lit 3D world, shared by every atrium beat.
// One unit ≈ 2.4 m. The building: a polished stone lobby floor with round tables, chairs and table lamps,
// a dance floor and a bandstand; the tower wall behind with lit window rows; side balconies on floors 2–4
// where the walkways land; roof trusses and a glass roof. The walkways: a concrete deck on two steel
// stringers, glass balustrades with posts and a handrail, three box beams across the underside with the
// hanger rods and their nuts. As built, the fourth-floor walkway hangs from the roof and the second-floor
// walkway hangs from the fourth-floor box beams; the third-floor walkway is offset and hangs on its own rods.
// No people are drawn: the crowd is the table lamps and the warm light on the decks.
import React from "react";
import { Easing } from "remotion";
import { Failure3D, glow, rnd, useDLook, type V3 } from "../../three/index";

export const FH = 1.3;
export const UPPER_Y = 4 * FH, LOWER_Y = 2 * FH, THIRD_Y = 3 * FH;
export const ROOF_Y = 7.6;
export const SPAN = 12;
export const HANGERS = [-4, 0, 4];
export const ROD_Z = 0.55;
export const THIRD_Z = -3.4;
export const WARM = "#ffb46a";
const sh = { castShadow: true, receiveShadow: true } as const;
const k01 = (x: number) => Math.max(0, Math.min(1, x));
const q = (x: number, n = 12) => Math.round(k01(x) * n) / n;

/** The video's materials, from the look's painter (cached there). */
export function useMats() {
  const { paint } = useDLook();
  return {
    deck: paint("concrete", "#8d8a84"), slab: paint("concrete", "#6f6b66"), stone: paint("concrete", "#2f2b27"), wall: paint("concrete", "#4a4642"),
    steel: paint("steel", "#9aa1a8"), dark: paint("dark", "#1b1c1f"), beam: paint("metal", "#7d848c"), rod: paint("metal", "#b9c0c7"),
    glass: paint("glass", "#1a2a36"), rail: paint("metal", "#c9a46a"), wood: paint("body", "#5a3b26"), cloth: paint("body", "#e9e2d4"),
    chair: paint("body", "#7a1f22"), brass: paint("metal", "#b8893c"), truss: paint("steel", "#5c636b"), paint,
  };
}

/** A part that glows amber → red when `v` > 0 (the stress ramp: red only for the failure). */
const HotMat: React.FC<{ v: number; base: string }> = ({ v, base }) => {
  const s = q(v);
  const c = s < 0.5 ? "#ffb23e" : "#ff3b30";
  return <meshPhysicalMaterial attach="material" color={s <= 0 ? base : c} roughness={0.45} metalness={0.6} emissive={c} emissiveIntensity={s <= 0 ? 0 : 0.4 + s * 1.8} />;
};

/** One box beam under a walkway: two channels toe to toe (a seam line), with the nuts at the rod ends. */
const BoxBeam: React.FC<{ x: number; hot?: number }> = ({ x, hot = 0 }) => {
  const M = useMats();
  return (
    <group position={[x, -0.2, 0]}>
      <mesh {...sh}><boxGeometry args={[0.2, 0.2, 1.3]} />{hot > 0 ? <HotMat v={hot} base="#7d848c" /> : <primitive object={M.beam} attach="material" />}</mesh>
      <mesh position={[0, -0.101, 0]} material={M.dark}><boxGeometry args={[0.012, 0.004, 1.3]} /></mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[0, -0.13, s * ROD_Z]}>
          <mesh material={M.steel}><cylinderGeometry args={[0.06, 0.06, 0.015, 16]} /></mesh>
          <mesh position={[0, -0.035, 0]}><cylinderGeometry args={[0.04, 0.04, 0.05, 6]} />{hot > 0 ? <HotMat v={hot} base="#1b1c1f" /> : <primitive object={M.dark} attach="material" />}</mesh>
        </group>
      ))}
    </group>
  );
};

export type WalkwayProps = { y: number; z?: number; lit?: number; occ?: number; hot?: number[]; sag?: number };

/** One walkway: deck, stringers, balustrades, three box beams. `hot` per box beam (0..1). */
export const Walkway: React.FC<WalkwayProps> = ({ y, z = 0, lit = 0, occ = 0, hot = [0, 0, 0], sag = 0 }) => {
  const M = useMats();
  const posts = Array.from({ length: 21 }, (_, i) => -SPAN / 2 + 0.3 + i * ((SPAN - 0.6) / 20));
  return (
    <group position={[0, y, z]}>
      <group rotation-z={0} position={[0, -sag * 0.25, 0]}>
        <mesh material={M.deck} {...sh}><boxGeometry args={[SPAN, 0.1, 0.95]} /></mesh>
        <mesh position={[0, 0.052, 0]} rotation-x={-Math.PI / 2} material={M.slab} receiveShadow><planeGeometry args={[SPAN - 0.05, 0.9]} /></mesh>
        {[-1, 1].map((s) => (
          <group key={s}>
            {/* stringer fascia, rail posts, glass, handrail */}
            <mesh position={[0, -0.08, s * 0.47]} material={M.steel} {...sh}><boxGeometry args={[SPAN, 0.2, 0.06]} /></mesh>
            {posts.map((x) => <mesh key={x} position={[x, 0.28, s * 0.45]} material={M.rail} castShadow><cylinderGeometry args={[0.014, 0.014, 0.46, 6]} /></mesh>)}
            <mesh position={[0, 0.27, s * 0.455]} material={M.glass}><boxGeometry args={[SPAN, 0.38, 0.012]} /></mesh>
            <mesh position={[0, 0.52, s * 0.45]} rotation-z={Math.PI / 2} material={M.rail} castShadow><cylinderGeometry args={[0.024, 0.024, SPAN, 8]} /></mesh>
            {lit > 0 && <mesh position={[0, 0.0, s * 0.51]} material={glow("#ffd84a", q(lit, 8) * 0.9)}><boxGeometry args={[SPAN, 0.03, 0.02]} /></mesh>}
          </group>
        ))}
        {occ > 0 && Array.from({ length: 16 }, (_, i) => (
          <mesh key={i} position={[-5.4 + i * 0.72 + rnd("occ", i) * 0.3, 0.07, (rnd("occz", i) - 0.5) * 0.6]} rotation-x={-Math.PI / 2} material={glow(WARM, q(occ * (0.5 + 0.5 * rnd("occo", i)), 6) * 0.7)}>
            <circleGeometry args={[0.16, 12]} />
          </mesh>
        ))}
        {HANGERS.map((x, i) => <BoxBeam key={x} x={x} hot={hot[i] ?? 0} />)}
      </group>
    </group>
  );
};

/** A hanger rod from y0 down to y1 at (x, z); `on` glows it, `swing` rocks it about its top. */
export const Rod: React.FC<{ x: number; z: number; y0: number; y1: number; swing?: number; on?: number; ghost?: boolean }> = ({ x, z, y0, y1, swing = 0, on = 0, ghost }) => {
  const M = useMats();
  const h = y0 - y1;
  const m = ghost ? glow("#59c8ff", 0.35) : on > 0 ? glow("#ffd84a", 0.5 + 0.5 * q(on, 6)) : M.rod;
  return (
    <group position={[x, y0, z]} rotation-z={swing} rotation-x={swing * 0.4}>
      <mesh position={[0, -h / 2, 0]} material={m} castShadow><cylinderGeometry args={[0.022, 0.022, h, 8]} /></mesh>
    </group>
  );
};

/** The lobby: floor, tables, dance floor, bandstand, tower wall, balconies, roof. */
export const Atrium: React.FC<{ dance: number; frame: number; dim?: number; tables?: boolean; after?: boolean }> = ({ dance, frame, dim = 0, tables = true, after = false }) => {
  const M = useMats();
  const lampOn = (1 - dim) * (after ? 0.15 : 1);
  const tiles: React.ReactNode[] = [];
  for (let i = 0; i < 8; i++) for (let k = 0; k < 4; k++) {
    const on = 0.3 + 0.7 * Math.max(0, Math.sin(frame / 9 + rnd("tile", i * 7 + k) * 6.28));
    const col = ["#ffb46a", "#ff7a59", "#ffd84a", "#7fd0ff"][(i + k) % 4]!;
    tiles.push(
      <mesh key={`${i}-${k}`} position={[-3.85 + i * 1.1, 0.012, -1.65 + k * 1.1]} rotation-x={-Math.PI / 2} material={glow(col, q(dance * on * lampOn, 10) * 0.5)}>
        <planeGeometry args={[1.0, 1.0]} />
      </mesh>,
    );
  }
  const tableAt: [number, number][] = [];
  for (let i = 0; i < 34; i++) {
    const x = -8.2 + rnd("tx", i) * 16.4, z = -5.6 + rnd("tz", i) * 10.4;
    if (Math.abs(x) < 4.6 && z > -2.4 && z < 2.6) continue;      // keep the dance floor clear
    tableAt.push([x, z]);
  }
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} material={M.stone} receiveShadow><planeGeometry args={[40, 30]} /></mesh>
      {dance > 0 && tiles}
      {tables && tableAt.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]} rotation-y={rnd("tr", i) * 3}>
          <mesh position={[0, 0.3, 0]} material={M.cloth} {...sh}><cylinderGeometry args={[0.26, 0.24, 0.04, 18]} /></mesh>
          <mesh position={[0, 0.15, 0]} material={M.dark}><cylinderGeometry args={[0.03, 0.05, 0.3, 8]} /></mesh>
          {[0, 1, 2, 3].map((c) => (
            <group key={c} rotation-y={c * Math.PI / 2}>
              <mesh position={[0.36, 0.17, 0]} material={M.chair} castShadow><boxGeometry args={[0.14, 0.04, 0.14]} /></mesh>
              <mesh position={[0.43, 0.28, 0]} material={M.chair}><boxGeometry args={[0.03, 0.2, 0.14]} /></mesh>
            </group>
          ))}
          {lampOn > 0.05 && <mesh position={[0, 0.37, 0]} material={glow(WARM, q(0.7 * lampOn, 8))}><sphereGeometry args={[0.04, 10, 8]} /></mesh>}
        </group>
      ))}
      {/* the bandstand, back left */}
      <group position={[-6.6, 0, -4.6]}>
        <mesh position={[0, 0.15, 0]} material={M.wood} {...sh}><boxGeometry args={[3.4, 0.3, 1.6]} /></mesh>
        <mesh position={[0, 1.0, -0.75]} material={glow("#ff9a3c", q(0.25 + 0.4 * dance * lampOn, 8))}><boxGeometry args={[3.2, 1.4, 0.05]} /></mesh>
        {[-1, 0, 1].map((i) => <mesh key={i} position={[i * 0.9, 0.45, 0.1]} material={M.brass} castShadow><cylinderGeometry args={[0.18, 0.18, 0.3, 16]} /></mesh>)}
      </group>
      {/* warm lobby light */}
      <pointLight position={[-6, 2.2, 2]} intensity={6 * lampOn} distance={14} color={WARM} />
      <pointLight position={[6, 2.2, 2]} intensity={6 * lampOn} distance={14} color={WARM} />
      <pointLight position={[0, 6.8, 3]} intensity={3.5 * (1 - dim * 0.6)} distance={18} color="#ffe2b8" />
      {dance > 0 && <pointLight position={[0, 1.2, 0]} intensity={7 * dance * lampOn} distance={12} color={WARM} />}
      {/* tower wall with floor bands and windows */}
      <mesh position={[0, ROOF_Y / 2, -6.5]} material={M.wall} {...sh}><boxGeometry args={[22, ROOF_Y, 0.3]} /></mesh>
      {[1, 2, 3, 4, 5].map((f) => (
        <group key={f}>
          <mesh position={[0, f * FH, -6.3]} material={M.steel}><boxGeometry args={[22, 0.12, 0.1]} /></mesh>
          {Array.from({ length: 14 }, (_, i) => (
            <mesh key={i} position={[-9.1 + i * 1.4, f * FH + 0.6, -6.33]} material={glow(WARM, Math.round((0.3 + 0.4 * rnd("win", f * 20 + i)) * (1 - dim) * 10) / 10)}>
              <planeGeometry args={[0.7, 0.45]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* side balconies where the walkways land, with their railings */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 9.5, ROOF_Y / 2, -1.5]} material={M.wall} {...sh}><boxGeometry args={[0.3, ROOF_Y, 12]} /></mesh>
          {[2, 3, 4].map((f) => (
            <group key={f}>
              <mesh position={[s * 7.8, f * FH, -1.5]} material={M.slab} {...sh}><boxGeometry args={[3.4, 0.16, 10]} /></mesh>
              <mesh position={[s * 6.12, f * FH + 0.5, -1.5]} rotation-x={Math.PI / 2} material={M.rail}><cylinderGeometry args={[0.022, 0.022, 10, 8]} /></mesh>
              <mesh position={[s * 6.12, f * FH + 0.27, -1.5]} material={M.glass}><boxGeometry args={[0.012, 0.4, 10]} /></mesh>
            </group>
          ))}
        </group>
      ))}
      {/* roof trusses (chords and web) and the glass roof */}
      {[-6, -4, -2, 0, 2, 4, 6].map((x) => (
        <group key={x} position={[x, ROOF_Y, -1.5]}>
          <mesh material={M.truss} {...sh}><boxGeometry args={[0.16, 0.16, 11]} /></mesh>
          <mesh position={[0, 0.6, 0]} material={M.truss}><boxGeometry args={[0.1, 0.1, 11]} /></mesh>
          {[-5, -3, -1, 1, 3, 5].map((z, i) => (
            <mesh key={z} position={[0, 0.3, z]} rotation-x={i % 2 ? 0.75 : -0.75} material={M.truss}><boxGeometry args={[0.05, 0.8, 0.05]} /></mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, ROOF_Y + 0.7, -1.5]} rotation-x={-Math.PI / 2} material={M.glass}><planeGeometry args={[19, 11]} /></mesh>
    </group>
  );
};

export type WalkwaysProps = {
  frame: number; fall?: number; lit?: Record<string, number>; occ?: number;
  /** stress per fourth-floor box beam (west, middle, east) */
  hot4?: number[]; hot3?: number[]; sag?: number;
  /** ghost the original continuous rods (the design) */
  original?: number;
};

/** The three walkways and their rods. `fall` 0→1: the upper walkway drops onto the lower (to 0.45), then
 * both fall to the floor; the roof rods stay and swing. */
export const Walkways: React.FC<WalkwaysProps> = ({ frame, fall = 0, lit = {}, occ = 0, hot4 = [0, 0, 0], hot3 = [0, 0, 0], sag = 0, original = 0 }) => {
  const g = (x: number) => Easing.in(Easing.quad)(k01(x));
  const a = g(fall / 0.45), b = g((fall - 0.45) / 0.55);
  const upperY = UPPER_Y - a * (UPPER_Y - LOWER_Y - 0.32) - b * (LOWER_Y - 0.02);
  const lowerY = LOWER_Y - b * (LOWER_Y - 0.12 - 0.06);
  const tilt = b * 0.03;
  const swing = fall > 0.05 ? Math.sin(frame / 7) * 0.05 * Math.exp(-Math.max(0, fall - 0.05) * 1.2) : 0;
  const on = (k: string) => lit[k] ?? 0;
  return (
    <group>
      <Walkway y={THIRD_Y} z={THIRD_Z} lit={on("third")} hot={hot3} />
      {HANGERS.map((x) => [-1, 1].map((s) => <Rod key={`t${x}${s}`} x={x} z={THIRD_Z + s * ROD_Z} y0={ROOF_Y} y1={THIRD_Y - 0.26} on={on("thirdrods")} />))}
      {HANGERS.map((x) => [-1, 1].map((s) => (
        <Rod key={`u${x}${s}`} x={x - 0.06} z={s * ROD_Z} y0={ROOF_Y} y1={fall > 0.05 ? UPPER_Y - 0.36 : upperY - 0.36} swing={swing * s} on={Math.max(on("rods"), on("stack") * 0.5)} />
      )))}
      {original > 0 && HANGERS.map((x) => [-1, 1].map((s) => <Rod key={`o${x}${s}`} x={x} z={s * ROD_Z} y0={UPPER_Y - 0.3} y1={LOWER_Y - 0.36} ghost />))}
      <group position={[0, upperY - UPPER_Y, 0]} rotation-z={tilt}>
        <Walkway y={UPPER_Y} lit={Math.max(on("fourth"), on("stack"))} occ={occ} hot={hot4} sag={sag} />
      </group>
      {original < 0.5 && HANGERS.map((x) => [-1, 1].map((s) => (
        <Rod key={`l${x}${s}`} x={x + 0.06} z={s * ROD_Z} y0={upperY - 0.2} y1={lowerY - 0.36} on={on("lowerrods")} />
      )))}
      <group position={[0, lowerY - LOWER_Y, 0]} rotation-z={-tilt * 0.6}>
        <Walkway y={LOWER_Y} lit={Math.max(on("second"), on("stack"))} occ={occ} />
      </group>
    </group>
  );
};
export default Atrium;

/** The atrium as seen from inside a close-up: two walls of lit windows and floor bands behind the subject
 * (blurred by the lens), the floor far below. For the cutaway and lab beats, so a close shot is still in the
 * hotel, never on black. */
export const Surround: React.FC<{ dist?: number; y?: number; dim?: number }> = ({ dist = 9, y = 0, dim = 0 }) => {
  const M = useMats();
  const wall = (key: string, pos: V3, rotY: number) => (
    <group key={key} position={pos} rotation-y={rotY}>
      <mesh material={M.wall}><planeGeometry args={[30, 16]} /></mesh>
      {Array.from({ length: 7 }, (_, f) => (
        <group key={f}>
          <mesh position={[0, -6 + f * 2, 0.02]} material={M.steel}><planeGeometry args={[30, 0.18]} /></mesh>
          {Array.from({ length: 12 }, (_, i) => (
            <mesh key={i} position={[-13 + i * 2.4, -5.1 + f * 2, 0.03]} material={glow(WARM, Math.round((0.12 + 0.3 * rnd(`sw${key}`, f * 12 + i)) * (1 - dim) * 10) / 10)}>
              <planeGeometry args={[0.9, 0.6]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
  return (
    <group position={[0, y, 0]}>
      {wall("a", [0, 0, -dist], 0)}
      {wall("b", [-dist, 0, 0], Math.PI / 2)}
      <mesh position={[0, -4, 0]} rotation-x={-Math.PI / 2} material={M.stone}><planeGeometry args={[40, 40]} /></mesh>
    </group>
  );
};
