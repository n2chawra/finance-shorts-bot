// Parts: the models and places this video's beats share (all procedural, nothing downloaded).
// A rubber-tyred metro bogie (rubber tyres on flat running tracks, horizontal guide wheels against guide
// bars, a flanged steel safety wheel beside every tyre on the same axle, just above an ordinary rail), the
// track it runs on, a metro car around it, a truck tyre, the Paris "M" sign, and three places: a tunnel
// mouth, a tiled Paris platform and a Montreal station. Everything is a function of the numbers passed in;
// no figures here. Units: the track runs along x, across is z, y is up; the running tracks' top is y=0.
import React from "react";
import { Easing } from "remotion";
import { Block, cue, glow, mat, rnd, TECH, type V3 } from "../../three/index";

type Group = React.JSX.IntrinsicElements["group"];

export const k01 = (f: number, a: number, d: number, e = Easing.inOut(Easing.cubic)) => cue(f, a, Math.max(1, d), e);
/** quantise an animated value so materials stay cached */
export const q = (x: number, n = 10) => Math.round(x * n) / n;

export const AMBER = "#ffb340";
export const PARIS_BLUE = "#1f4fa8";
export const MTL_BLUE = "#1c6fd1";

// ------------------------------------------------------------------ dimensions
export const TYRE_R = 0.34;
export const TYRE_W = 0.2;
export const TYRE_Z = 0.7;
export const STEEL_R = 0.3;
export const FLANGE_R = 0.34;
export const STEEL_Z = 0.5;
export const RAIL_TOP = -0.02;
export const GUIDE_Z = 1.0;
export const GUIDE_Y = 0.24;
export const GW_R = 0.12;
export const AXLE_Y = TYRE_R;
export const AXLES = [-0.55, 0.55];
export const CAR_LEN = 6.2;
export const CAR_W = 2.1;
export const CAR_H = 1.7;
export const BODY_Y = 0.78;
export const BOGIES = [-2.1, 2.1];

// ------------------------------------------------------------------ tyre
/** A fat rubber tyre on its hub, axis along z, centre at the origin. `spin` turns it (radians), `squash`
 * 0..1 flattens it (a flat tyre: it sags onto its rim), `see` 0..1 turns it to glass, `lit` glows its tread. */
export const Tyre: React.FC<Group & { spin?: number; squash?: number; see?: number; lit?: number; r?: number; w?: number }> = ({
  spin = 0, squash = 0, see = 0, lit = 0, r = TYRE_R, w = TYRE_W, ...g
}) => {
  const rubber = see > 0.05 ? mat("glass", "#9fb4c8", { opacity: q(0.9 - 0.75 * see) }) : mat("rubber", "#1d1e23");
  const sy = 1 - 0.32 * squash;
  return (
    <group {...g}>
      <group position={[0, -r * (1 - sy), 0]} scale={[1 + 0.08 * squash, sy, 1]}>
        <group rotation-z={-spin}>
          <mesh rotation-x={Math.PI / 2} material={rubber} castShadow>
            <cylinderGeometry args={[r, r, w, 40, 1]} />
          </mesh>
          {/* tread grooves */}
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * (r + 0.002), Math.sin(a) * (r + 0.002), 0]} rotation-z={a} material={lit > 0.05 ? glow(AMBER, q(0.3 + 0.6 * lit)) : mat("blackPlastic", "#0c0d10")}>
                <boxGeometry args={[0.012, 0.03, w * 0.92]} />
              </mesh>
            );
          })}
          {/* sidewall ring and hub */}
          {[1, -1].map((s) => (
            <group key={s}>
              <mesh position={[0, 0, s * (w / 2 + 0.002)]} material={see > 0.05 ? mat("glass", "#9fb4c8", { opacity: q(0.6 - 0.5 * see) }) : mat("rubber", "#26272d")}>
                <ringGeometry args={[r * 0.62, r * 0.96, 40]} />
              </mesh>
              <mesh position={[0, 0, s * (w / 2 + 0.004)]} material={mat("brushed", "#9aa1ad")}>
                <circleGeometry args={[r * 0.6, 32]} />
              </mesh>
            </group>
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[Math.cos((i / 5) * Math.PI * 2) * r * 0.38, Math.sin((i / 5) * Math.PI * 2) * r * 0.38, w / 2 + 0.01]} material={mat("solder")}>
              <cylinderGeometry args={[0.025, 0.025, 0.02, 8]} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

// ------------------------------------------------------------------ steel safety wheel
/** A flanged steel train wheel, axis along z, centre at the origin; the flange is on the -z side
 * (`flange` 1 or -1 picks the side). `lit` 0..1 glows it amber. */
export const SteelWheel: React.FC<Group & { spin?: number; lit?: number; flange?: number; hide?: number }> = ({ spin = 0, lit = 0, flange = -1, hide = 0, ...g }) => {
  if (hide >= 1) return null;
  const steel = lit > 0.05 ? mat("brushed", "#d8dde6", { emissive: AMBER, emissiveIntensity: q(0.15 + 1.3 * lit) }) : mat("brushed", "#7e858f");
  return (
    <group {...g}>
      <group rotation-z={-spin}>
        <mesh rotation-x={Math.PI / 2} material={steel} castShadow>
          <cylinderGeometry args={[STEEL_R, STEEL_R * 0.98, 0.09, 40]} />
        </mesh>
        <mesh rotation-x={Math.PI / 2} position={[0, 0, flange * 0.055]} material={steel} castShadow>
          <cylinderGeometry args={[FLANGE_R, FLANGE_R, 0.025, 40]} />
        </mesh>
        {/* spokes so the turning reads */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} rotation-z={(i / 6) * Math.PI} position={[0, 0, -flange * 0.05]} material={mat("blackPlastic", "#2a2e36")}>
            <boxGeometry args={[STEEL_R * 1.5, 0.03, 0.01]} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// ------------------------------------------------------------------ guide wheel
/** A small horizontal guide wheel (axis vertical), centre at the origin. */
export const GuideWheel: React.FC<Group & { spin?: number; lit?: number; out?: number }> = ({ spin = 0, lit = 0, out = 1, ...g }) => {
  if (out <= 0.01) return null;
  return (
    <group {...g} scale={out}>
      <group rotation-y={spin}>
        <mesh material={mat("rubber", "#1b1c21")} castShadow><cylinderGeometry args={[GW_R, GW_R, 0.08, 28]} /></mesh>
        <mesh position={[0, 0.042, 0]} rotation-x={-Math.PI / 2} material={lit > 0.05 ? glow(TECH.cyan, q(0.4 + 0.6 * lit)) : mat("brushed", "#a3aab5")}>
          <circleGeometry args={[GW_R * 0.55, 20]} />
        </mesh>
        <mesh position={[GW_R * 0.3, 0.046, 0]} material={mat("blackPlastic")}><boxGeometry args={[0.05, 0.01, 0.02]} /></mesh>
      </group>
    </group>
  );
};

// ------------------------------------------------------------------ bogie
export type BogieProps = Group & {
  spin?: number;
  /** guide wheels out 0..1 */
  guides?: number;
  guideLit?: number;
  guideSpin?: number;
  frameLit?: number;
  tyreSee?: number;
  tyreLit?: number;
  steelLit?: number;
  /** a flat tyre (front right) 0..1: it sags and the bogie drops onto the steel wheels */
  flat?: number;
  motorLit?: number;
  /** hide the steel wheels (before they are revealed) 0..1 dark */
  steelDim?: number;
};

/** The rubber-tyred bogie, its axles at x=±0.55, standing on the running tracks (y=0). */
export const Bogie: React.FC<BogieProps> = ({
  spin = 0, guides = 1, guideLit = 0, guideSpin = 0, frameLit = 0, tyreSee = 0, tyreLit = 0, steelLit = 0, flat = 0, motorLit = 0, steelDim = 0, ...g
}) => {
  const drop = (TYRE_R - STEEL_R - 0.0 + RAIL_TOP) * 0; // kept for clarity; the drop is computed below
  void drop;
  // when a tyre goes flat the bogie sinks until the steel wheel's tread meets the rail
  const sink = flat * (AXLE_Y - STEEL_R - RAIL_TOP);
  const frameMat = frameLit > 0.05 ? mat("brushed", "#3b4250", { emissive: TECH.cyan, emissiveIntensity: q(0.2 + 0.8 * frameLit) }) : mat("brushed", "#3b4250");
  return (
    <group {...g}>
      <group position={[0, -sink, 0]}>
        {/* frame: two side beams, two cross beams, the guide-wheel arms */}
        {[1, -1].map((s) => (
          <Block key={s} size={[1.9, 0.14, 0.12]} radius={0.03} material={frameMat} position={[0, AXLE_Y + 0.14, s * 0.86]} />
        ))}
        {[-0.25, 0.25].map((x) => (
          <Block key={x} size={[0.14, 0.12, 1.8]} radius={0.03} material={frameMat} position={[x, AXLE_Y + 0.14, 0]} />
        ))}
        {/* traction motor on the centre */}
        <Block size={[0.4, 0.28, 0.5]} radius={0.06} material={motorLit > 0.05 ? mat("brushed", "#55606f", { emissive: AMBER, emissiveIntensity: q(0.3 + motorLit) }) : mat("brushed", "#55606f")} position={[0, AXLE_Y + 0.05, 0]} />
        {AXLES.map((ax, ai) => (
          <group key={ax} position={[ax, AXLE_Y, 0]}>
            <mesh rotation-x={Math.PI / 2} material={mat("brushed", "#8b929c")}><cylinderGeometry args={[0.05, 0.05, 1.7, 14]} /></mesh>
            {[1, -1].map((s) => {
              const isFlat = ai === 1 && s === 1;
              return (
                <group key={s}>
                  <Tyre position={[0, 0, s * TYRE_Z]} spin={spin} see={tyreSee} lit={tyreLit} squash={isFlat ? flat : 0} />
                  {steelDim < 1 && <SteelWheel position={[0, 0, s * STEEL_Z]} spin={spin} lit={steelLit} flange={-s} />}
                </group>
              );
            })}
          </group>
        ))}
        {/* guide wheels on arms at the four corners */}
        {[-0.85, 0.85].map((x) => [1, -1].map((s) => (
          <group key={`${x}${s}`}>
            {guides > 0.01 && <Block size={[0.08, 0.06, 0.12 * guides]} radius={0.01} material={frameMat} position={[x, GUIDE_Y + 0.08, s * (0.86 + 0.06 * guides)]} />}
            <GuideWheel position={[x, GUIDE_Y + sink, s * (GUIDE_Z - GW_R - 0.02)]} out={guides} lit={guideLit} spin={guideSpin * s} />
          </group>
        )))}
      </group>
    </group>
  );
};

// ------------------------------------------------------------------ track
export type TrackProps = Group & {
  length?: number;
  /** slide the sleepers and bolts by this distance (the track passing under a moving train) */
  offset?: number;
  runLit?: number;
  railLit?: number;
  guideLit?: number;
  /** hide the guide bars (0..1 shown) */
  guides?: number;
  /** a glow sweeping along the running tracks from -x, 0..1 */
  sweep?: number;
};

/** The rubber-tyred track: two flat running tracks, the two ordinary rails inside them, a guide bar at each
 * side, on a concrete bed with sleepers. Centred on the origin along x. */
export const Track: React.FC<TrackProps> = ({ length = 20, offset = 0, runLit = 0, railLit = 0, guideLit = 0, guides = 1, sweep = 0, ...g }) => {
  const n = Math.round(length / 0.7);
  const step = length / n;
  const run = runLit > 0.05 ? mat("brushed", "#9aa3ae", { emissive: AMBER, emissiveIntensity: q(0.2 + 0.9 * runLit) }) : mat("brushed", "#8c939d");
  const rail = railLit > 0.05 ? mat("brushed", "#cfd5de", { emissive: AMBER, emissiveIntensity: q(0.2 + 1.2 * railLit) }) : mat("brushed", "#6f7680");
  const gbar = guideLit > 0.05 ? mat("brushed", "#b8c0cb", { emissive: TECH.cyan, emissiveIntensity: q(0.2 + 1.0 * guideLit) }) : mat("brushed", "#7d8590");
  const sw = Math.max(0, Math.min(1, sweep));
  return (
    <group {...g}>
      {/* concrete bed */}
      <mesh position={[0, -0.32, 0]} material={mat("clay", "#4a4c52")} receiveShadow><boxGeometry args={[length, 0.2, 2.8]} /></mesh>
      {/* sleepers, sliding with the offset */}
      {Array.from({ length: n }, (_, i) => {
        let x = -length / 2 + ((i * step + offset) % length + length) % length;
        if (x > length / 2) x -= length;
        return (
          <mesh key={i} position={[x, -0.18, 0]} material={mat("clay", "#5d5a55")} receiveShadow castShadow>
            <boxGeometry args={[0.24, 0.1, 2.5]} />
          </mesh>
        );
      })}
      {[1, -1].map((s) => (
        <group key={s}>
          {/* running track: a flat steel beam on its web */}
          <mesh position={[0, -0.025, s * TYRE_Z]} material={run} receiveShadow><boxGeometry args={[length, 0.05, 0.28]} /></mesh>
          <mesh position={[0, -0.1, s * TYRE_Z]} material={mat("brushed", "#555c66")}><boxGeometry args={[length, 0.12, 0.05]} /></mesh>
          {/* ordinary rail: head, web, foot */}
          <mesh position={[0, RAIL_TOP - 0.02, s * STEEL_Z]} material={rail} receiveShadow castShadow><boxGeometry args={[length, 0.04, 0.06]} /></mesh>
          <mesh position={[0, RAIL_TOP - 0.08, s * STEEL_Z]} material={mat("brushed", "#5c636d")}><boxGeometry args={[length, 0.08, 0.02]} /></mesh>
          <mesh position={[0, RAIL_TOP - 0.125, s * STEEL_Z]} material={mat("brushed", "#5c636d")}><boxGeometry args={[length, 0.012, 0.1]} /></mesh>
          {/* guide bar on posts */}
          {guides > 0.01 && (
            <group scale={[1, guides, 1]}>
              <mesh position={[0, GUIDE_Y, s * (GUIDE_Z + 0.02)]} material={gbar} castShadow><boxGeometry args={[length, 0.16, 0.05]} /></mesh>
              {Array.from({ length: Math.round(length / 1.4) }, (_, i) => {
                let x = -length / 2 + ((i * 1.4 + offset) % length + length) % length;
                if (x > length / 2) x -= length;
                return <mesh key={i} position={[x, GUIDE_Y / 2 - 0.1, s * (GUIDE_Z + 0.06)]} material={mat("brushed", "#4d545e")}><boxGeometry args={[0.08, GUIDE_Y + 0.12, 0.08]} /></mesh>;
              })}
            </group>
          )}
          {sw > 0.01 && sw < 0.99 && (
            <mesh position={[-length / 2 + length * sw, 0.01, s * TYRE_Z]} material={glow(AMBER, 0.9)}><boxGeometry args={[0.9, 0.02, 0.3]} /></mesh>
          )}
        </group>
      ))}
    </group>
  );
};

// ------------------------------------------------------------------ metro car
export type CarProps = Group & {
  /** 0..1: the body turns to a glass x-ray shell over the bogies */
  see?: number;
  spin?: number;
  lights?: number;
  livery?: { body: string; band: string; front: string };
  bogie?: Omit<BogieProps, keyof Group>;
  /** per-bogie overrides (0 = rear, 1 = front) */
  bogieAt?: Partial<Record<number, Omit<BogieProps, keyof Group>>>;
  /** draw the cab front at +x */
  cab?: boolean;
};

export const PARIS_LIVERY = { body: "#eef1f5", band: PARIS_BLUE, front: "#2fb26f" };
export const MTL_LIVERY = { body: "#e9edf2", band: MTL_BLUE, front: MTL_BLUE };

/** A metro car on its two rubber-tyred bogies, front (cab) toward +x, standing on the running tracks. */
export const MetroCar: React.FC<CarProps> = ({ see = 0, spin = 0, lights = 1, livery = PARIS_LIVERY, bogie = {}, bogieAt = {}, cab = true, ...g }) => {
  const shell = see > 0.03 ? mat("glass", "#bfe8ff", { opacity: q(0.95 - 0.8 * see) }) : mat("white", livery.body, { roughness: 0.3, clearcoat: 0.6 });
  const band = see > 0.03 ? mat("glass", livery.band, { opacity: q(0.9 - 0.8 * see) }) : mat("glossy", livery.band);
  const win = mat("screen", "#0b1220", { emissive: "#ffe3a8", emissiveIntensity: q(0.35 * lights) });
  const yC = BODY_Y + CAR_H / 2;
  const showBody = see < 0.97;
  return (
    <group {...g}>
      {showBody && (
        <group>
          <Block size={[CAR_LEN, CAR_H, CAR_W]} radius={0.22} material={shell} position={[0, yC, 0]} />
          {/* window band, blue stripe, doors (both sides) */}
          {[1, -1].map((s) => (
            <group key={s}>
              <mesh position={[0, yC + 0.25, s * (CAR_W / 2 + 0.005)]} rotation-y={s > 0 ? 0 : Math.PI} material={see > 0.3 ? mat("glass", "#ffe3a8", { opacity: 0.2 }) : win}>
                <planeGeometry args={[CAR_LEN * 0.86, 0.6]} />
              </mesh>
              <mesh position={[0, yC - 0.45, s * (CAR_W / 2 + 0.006)]} rotation-y={s > 0 ? 0 : Math.PI} material={band}>
                <planeGeometry args={[CAR_LEN * 0.98, 0.16]} />
              </mesh>
              {[-1.8, 0, 1.8].map((x) => (
                <mesh key={x} position={[x, yC - 0.05, s * (CAR_W / 2 + 0.008)]} rotation-y={s > 0 ? 0 : Math.PI} material={see > 0.3 ? mat("glass", "#9fb4c8", { opacity: 0.15 }) : mat("brushed", "#b9c0cb")}>
                  <planeGeometry args={[0.62, 1.4]} />
                </mesh>
              ))}
            </group>
          ))}
          {cab && (
            <group position={[CAR_LEN / 2 + 0.006, yC, 0]}>
              {/* windscreen, the green front panel, headlights, the line's number disc (blank) */}
              <mesh position={[0, 0.3, 0]} rotation-y={Math.PI / 2} material={see > 0.3 ? mat("glass", "#9fb4c8", { opacity: 0.15 }) : mat("screen", "#0b1220", { emissive: "#7fb2ff", emissiveIntensity: 0.15 })}>
                <planeGeometry args={[CAR_W * 0.82, 0.7]} />
              </mesh>
              <mesh position={[0.002, -0.42, 0]} rotation-y={Math.PI / 2} material={see > 0.3 ? mat("glass", livery.front, { opacity: 0.2 }) : mat("glossy", livery.front)}>
                <planeGeometry args={[CAR_W * 0.9, 0.5]} />
              </mesh>
              {[1, -1].map((s) => (
                <mesh key={s} position={[0.01, -0.42, s * 0.72]} rotation-y={Math.PI / 2} material={glow("#fff4d6", q(0.4 + 0.6 * lights))}>
                  <circleGeometry args={[0.09, 20]} />
                </mesh>
              ))}
            </group>
          )}
        </group>
      )}
      {/* the floor plate the bogies carry */}
      <mesh position={[0, BODY_Y - 0.02, 0]} material={see > 0.03 ? mat("glass", "#9fb4c8", { opacity: q(0.6 - 0.45 * see) }) : mat("blackPlastic", "#22252c")}>
        <boxGeometry args={[CAR_LEN * 0.96, 0.06, CAR_W * 0.9]} />
      </mesh>
      {BOGIES.map((bx, i) => (
        <Bogie key={bx} position={[bx, 0, 0]} spin={spin} {...bogie} {...(bogieAt[i] ?? {})} />
      ))}
    </group>
  );
};

// ------------------------------------------------------------------ truck tyre
/** A chunky truck tyre standing on the ground, axis along z, radius 0.5. */
export const TruckTyre: React.FC<Group & { spin?: number }> = ({ spin = 0, ...g }) => (
  <group {...g}>
    <group position={[0, 0.5, 0]} rotation-z={-spin}>
      <mesh rotation-x={Math.PI / 2} material={mat("rubber", "#1a1b1f")} castShadow><cylinderGeometry args={[0.5, 0.5, 0.32, 40]} /></mesh>
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.505, Math.sin(a) * 0.505, (i % 2 ? 1 : -1) * 0.07]} rotation-z={a} material={mat("rubber", "#26272c")}>
            <boxGeometry args={[0.04, 0.09, 0.14]} />
          </mesh>
        );
      })}
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, 0, s * 0.165]} material={mat("brushed", "#b3bac4")}><circleGeometry args={[0.28, 32]} /></mesh>
      ))}
    </group>
  </group>
);

// ------------------------------------------------------------------ Paris "M" sign
/** The round Metro sign: a yellow ring with an M, on a post; faces +x. `lit` 0..1. */
export const MSign: React.FC<Group & { lit?: number }> = ({ lit = 1, ...g }) => {
  const y = mat("white", "#f2c230", { emissive: "#f2c230", emissiveIntensity: q(0.1 + 0.9 * lit) });
  return (
    <group {...g}>
      <group rotation-y={Math.PI / 2}>
        <mesh material={mat("glossy", "#14213d")}><circleGeometry args={[0.42, 40]} /></mesh>
        <mesh position={[0, 0, 0.01]} material={y}><ringGeometry args={[0.34, 0.42, 40]} /></mesh>
        {/* the M: two legs and a V */}
        {[-0.15, 0.15].map((x) => <mesh key={x} position={[x, 0, 0.012]} material={y}><boxGeometry args={[0.07, 0.38, 0.01]} /></mesh>)}
        {[-1, 1].map((s) => <mesh key={s} position={[s * 0.075, 0.07, 0.012]} rotation-z={s * 0.6} material={y}><boxGeometry args={[0.06, 0.24, 0.01]} /></mesh>)}
      </group>
    </group>
  );
};

// ------------------------------------------------------------------ tunnel mouth (Paris)
/** A tunnel along -x from a portal at x=0: an arched tube with lamps, the portal wall facing +x with the M
 * sign over it. `lamps` 0..1. */
export const Tunnel: React.FC<Group & { lamps?: number; f?: number; sign?: number; len?: number }> = ({ lamps = 1, f = 0, sign = 1, len = 40, ...g }) => {
  const R = 2.3;
  return (
    <group {...g}>
      {/* the arched tube (inside faces), floor */}
      <mesh position={[-len / 2, 0.6, 0]} rotation-z={Math.PI / 2} material={mat("clay", "#2c3038", { side: 1 })}>
        <cylinderGeometry args={[R, R, len, 40, 1, true, 0, Math.PI]} />
      </mesh>
      <mesh position={[-len / 2, -0.42, 0]} material={mat("clay", "#2a2b2f")} receiveShadow><boxGeometry args={[len, 0.02, 2 * R]} /></mesh>
      {/* lamps along both walls */}
      {Array.from({ length: Math.round(len / 3) }, (_, i) => [1, -1].map((s) => (
        <mesh key={`${i}${s}`} position={[-1.5 - i * 3, 1.6, s * (R - 0.25)]} material={glow("#ffd9a0", q(0.25 + 0.7 * lamps * (0.9 + 0.1 * Math.sin(f / 5 + i))))}>
          <boxGeometry args={[0.5, 0.08, 0.08]} />
        </mesh>
      )))}
      {/* the portal wall */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, 1.2, s * (R + 2.2)]} material={mat("clay", "#3b3f48")}><boxGeometry args={[0.4, 5, 4.4]} /></mesh>
      ))}
      <mesh position={[0, 4.4, 0]} material={mat("clay", "#3b3f48")}><boxGeometry args={[0.4, 2.2, 2 * R + 8.8]} /></mesh>
      <mesh position={[0.21, 0.6, 0]} rotation-y={Math.PI / 2} material={glow("#9fb4c8", 0.25)}>
        <ringGeometry args={[R - 0.02, R + 0.12, 48, 1, 0, Math.PI]} />
      </mesh>
      <MSign position={[0.25, 3.55, 0]} lit={sign} />
    </group>
  );
};

// ------------------------------------------------------------------ Paris platform
/** A Paris station: a white bevelled-tile vault along x behind a platform at z<0, the track at z=0. */
export const ParisStation: React.FC<Group & { f?: number; len?: number }> = ({ f = 0, len = 24, ...g }) => {
  const tiles = mat("white", "#eef0ee", { roughness: 0.15, clearcoat: 1 });
  return (
    <group {...g}>
      {/* platform slab and its edge */}
      <mesh position={[0, 0.45, -3.3]} material={mat("clay", "#8c8780")} receiveShadow><boxGeometry args={[len, 1.0, 3.6]} /></mesh>
      <mesh position={[0, 0.96, -1.58]} material={mat("white", "#e9e4d6")}><boxGeometry args={[len, 0.03, 0.18]} /></mesh>
      {/* the curved tiled vault behind */}
      <mesh position={[0, 1.4, 0]} rotation-z={Math.PI / 2} material={tiles}>
        <cylinderGeometry args={[5.4, 5.4, len, 48, 1, true, Math.PI * 0.5, Math.PI * 0.55]} />
      </mesh>
      {/* tile joints: a few dark lines for the bevelled tile look */}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[0, 1.6 + i * 0.32, -5.1 + i * 0.04]} material={mat("clay", "#c9ccc9")}><boxGeometry args={[len, 0.012, 0.01]} /></mesh>
      ))}
      {/* lamps along the vault */}
      {Array.from({ length: Math.round(len / 3) }, (_, i) => (
        <mesh key={i} position={[-len / 2 + 1.5 + i * 3, 5.2, -2.4]} material={glow("#fff0cf", q(0.8 + 0.1 * Math.sin(f / 6 + i)))}>
          <boxGeometry args={[1.2, 0.06, 0.12]} />
        </mesh>
      ))}
      <pointLight position={[0, 4, -1.5]} intensity={14} color="#fff0d6" distance={14} />
    </group>
  );
};

// ------------------------------------------------------------------ Montreal station
/** A Montreal-style station: bare concrete walls with a ribbed vault, a platform at z<0; the long wall faces +z. */
export const MontrealStation: React.FC<Group & { f?: number; len?: number; map?: number; flash?: number }> = ({ f = 0, len = 24, map = 0, flash = 0, ...g }) => {
  const concrete = mat("clay", "#8f8a82");
  return (
    <group {...g}>
      <mesh position={[0, 0.45, -3.3]} material={mat("clay", "#6f6a64")} receiveShadow><boxGeometry args={[len, 1.0, 3.6]} /></mesh>
      <mesh position={[0, 0.96, -1.58]} material={mat("white", "#e2b23a")}><boxGeometry args={[len, 0.03, 0.18]} /></mesh>
      <mesh position={[0, 3.2, -5.2]} material={concrete}><boxGeometry args={[len, 6.4, 0.3]} /></mesh>
      {/* ribs on the wall */}
      {Array.from({ length: Math.round(len / 2) }, (_, i) => (
        <mesh key={i} position={[-len / 2 + 1 + i * 2, 3.2, -5.0]} material={mat("clay", "#7c776f")}><boxGeometry args={[0.25, 6.4, 0.2]} /></mesh>
      ))}
      {/* a strip of light under the ceiling */}
      <mesh position={[0, 6.2, -2.6]} material={glow("#ffe9c2", q(0.7 + 0.1 * Math.sin(f / 7)))}><boxGeometry args={[len, 0.08, 0.3]} /></mesh>
      {/* the network map: four coloured lines drawing on along the wall (0..1) */}
      {map > 0.01 && (
        <group position={[-2.2, 3.4, -4.86]}>
          <mesh position={[1.4, 0.1, -0.01]} material={mat("glossy", "#0f1420")}><boxGeometry args={[3.6, 2.6, 0.04]} /></mesh>
          {([
            ["#25a24a", [[0, 1.0], [1.2, 1.0], [2.0, 0.4], [2.9, 0.4]]],
            ["#f08a1c", [[0.2, -0.8], [0.8, 0.0], [0.8, 1.0], [1.6, 1.0]]],
            ["#f2c230", [[1.6, 0.2], [2.6, 0.2]]],
            ["#1c6fd1", [[1.0, -0.9], [1.6, -0.2], [2.6, -0.2]]],
          ] as [string, [number, number][]][]).map(([c, pts], li) => {
            const k = Math.max(0, Math.min(1, map * 1.4 - li * 0.12));
            const segs = pts.length - 1;
            return pts.slice(1).map((pt, si) => {
              const a = pts[si]!;
              const sk = Math.max(0, Math.min(1, k * segs - si));
              if (sk <= 0) return null;
              const dx = pt[0] - a[0], dy = pt[1] - a[1];
              const L = Math.hypot(dx, dy) * sk;
              const ang = Math.atan2(dy, dx);
              return (
                <mesh key={`${li}${si}`} position={[a[0] + (Math.cos(ang) * L) / 2 + 0.1, a[1] + (Math.sin(ang) * L) / 2 - 0.1, 0.03]} rotation-z={ang} material={glow(c, 0.95)} scale={[1, 1 + 0.8 * flash, 1]}>
                  <boxGeometry args={[L, 0.07, 0.02]} />
                </mesh>
              );
            });
          })}
        </group>
      )}
      <pointLight position={[0, 4.5, -1]} intensity={12} color="#ffe6c4" distance={14} />
    </group>
  );
};

// ------------------------------------------------------------------ small effects
/** Sparks thrown from a point: seeded, a pure function of the frames since `start`. */
export const Sparks: React.FC<Group & { f: number; start: number; n?: number; seed?: string }> = ({ f, start, n = 18, seed = "spk", ...g }) => {
  const t = f - start;
  if (t < 0 || t > 26) return null;
  return (
    <group {...g}>
      {Array.from({ length: n }, (_, i) => {
        const a = rnd(seed, i) * Math.PI - Math.PI / 2;
        const v = 0.04 + 0.05 * rnd(seed + "v", i);
        const x = Math.cos(a) * v * t, y = Math.abs(Math.sin(a)) * v * t * 0.8 - 0.004 * t * t;
        return (
          <mesh key={i} position={[x, Math.max(-0.02, y), (rnd(seed + "z", i) - 0.5) * 0.3]} material={glow(i % 3 ? AMBER : "#fff2c4", q(1 - t / 26))}>
            <boxGeometry args={[0.03, 0.03, 0.03]} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Expanding rings (sound), facing the camera's side (+z), fading over `life` frames, one every `every`. */
export const Rings: React.FC<Group & { f: number; start: number; every?: number; life?: number; reach?: number; color?: string; strength?: number; stop?: number }> = ({
  f, start, every = 10, life = 30, reach = 1.2, color = TECH.cyan, strength = 1, stop, ...g
}) => {
  if (f < start) return null;
  const out: React.ReactNode[] = [];
  for (let k = 0; k < 4; k++) {
    const born = start + Math.floor((f - start) / every) * every - k * every;
    if (born < start || (stop !== undefined && born > stop)) continue;
    const age = (f - born) / life;
    if (age < 0 || age > 1) continue;
    const r = 0.1 + reach * age;
    out.push(
      <mesh key={born} material={glow(color, q((1 - age) * 0.8 * strength))}>
        <ringGeometry args={[r, r + 0.03, 40]} />
      </mesh>,
    );
  }
  return <group {...g}>{out}</group>;
};

/** A downward arrow (weight), glowing; `k` 0..1 grows it, its tip at the origin. */
export const DownArrow: React.FC<Group & { k?: number; color?: string; len?: number }> = ({ k = 1, color = AMBER, len = 0.7, ...g }) => {
  if (k <= 0.01) return null;
  return (
    <group {...g} scale={[1, k, 1]}>
      <mesh position={[0, 0.18 + len / 2, 0]} material={glow(color, 0.9)}><boxGeometry args={[0.07, len, 0.07]} /></mesh>
      <mesh position={[0, 0.1, 0]} rotation-x={Math.PI} material={glow(color, 0.9)}><coneGeometry args={[0.13, 0.2, 16]} /></mesh>
    </group>
  );
};

/** A flat arrow along +x lying on the ground (a drift or a direction), `k` 0..1 draws it. */
export const FlatArrow: React.FC<Group & { k?: number; color?: string; len?: number }> = ({ k = 1, color = "#ff4d3d", len = 1.4, ...g }) => {
  if (k <= 0.01) return null;
  const L = len * k;
  return (
    <group {...g}>
      <mesh position={[L / 2, 0, 0]} material={glow(color, 0.9)}><boxGeometry args={[L, 0.03, 0.09]} /></mesh>
      <mesh position={[L + 0.1, 0, 0]} rotation-z={-Math.PI / 2} material={glow(color, 0.9)}><coneGeometry args={[0.16, 0.24, 3]} /></mesh>
    </group>
  );
};

/** The gap bracket: two short ticks and a bar between y0 and y1 at x, z. */
export const GapBracket: React.FC<{ at: V3; y0: number; y1: number; k?: number; color?: string }> = ({ at, y0, y1, k = 1, color = AMBER }) => {
  if (k <= 0.01) return null;
  const h = (y1 - y0) * k;
  return (
    <group position={at}>
      <mesh position={[0, y0 + h / 2, 0]} material={glow(color, 1)}><boxGeometry args={[0.012, h, 0.012]} /></mesh>
      <mesh position={[0, y0, 0]} material={glow(color, 1)}><boxGeometry args={[0.08, 0.01, 0.012]} /></mesh>
      {k > 0.95 && <mesh position={[0, y1, 0]} material={glow(color, 1)}><boxGeometry args={[0.08, 0.01, 0.012]} /></mesh>}
    </group>
  );
};

const Parts = { Tyre, SteelWheel, GuideWheel, Bogie, Track, MetroCar, TruckTyre, MSign, Tunnel, ParisStation, MontrealStation, Sparks, Rings, DownArrow, FlatArrow, GapBracket };
export default Parts;
