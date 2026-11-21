// The Hyatt Regency promo Short's shared world (the long video's Blueprint look, every kit: a pale
// matte scale model on the blueprint stage):
//   - Atrium: the hotel atrium in 3D, the 4th-floor walkway hung directly over the 2nd, the 3rd offset;
//     the as-built hangers (upper rods roof → 4th-floor box beams, lower rods 4th → 2nd), `fall` drops both;
//   - Joint: one 4th-floor box-beam connection at a big scale, cut away (front web off), the upper rod's
//     nut and washer under the bottom flange, the lower rod's nut inside; `pull` slides the beam down past
//     the nut as the flange halves fold open (the failure), the stress ramp on the beam;
//   - Shot3D / Flat: the beat wrappers (one stage, the look, the honesty tag, the grain).
// Parts only, never people. Every figure comes from the beat's params.
import React from "react";
import { AbsoluteFill, Freeze } from "remotion";
import { clayMat, DisasterStage, Failure3D, glow, rampColor, type V3 } from "../../three/index";
import { DisasterLookProvider, LookBackground, Texture, useDisasterLook, HonestyTag as FlatTag } from "../../disaster/index";

type Mat = ReturnType<typeof clayMat>;

export const RECIPE = "blueprint" as const;
export const MONO = "'Courier Prime', 'Courier New', monospace";
export const ANTON = "Anton, Poppins, sans-serif";

const sh = { castShadow: true, receiveShadow: true } as const;
const k01 = (x: number) => Math.max(0, Math.min(1, x));
const sm = (x: number) => { const c = k01(x); return c * c * (3 - 2 * c); };

// ---------------------------------------------------------------- materials (clay with one accent)

export function clay(color: string, emissive = "#000000", ei = 0, opacity = 1): Mat {
  return clayMat(color, { ao: 0.3, emissive, emissiveIntensity: ei, opacity });
}
const q = (x: number, n = 12) => Math.round(x * n) / n;
/** the stress ramp as a clay colour (quantised so materials stay cached) */
export function stressClay(v: number, base = "#bcd0ff"): Mat {
  const s = q(k01(v));
  if (s <= 0) return clay(base);
  const c = rampColor(0).set(base).lerp(rampColor(s), Math.min(1, s * 1.4));
  return clay(`#${c.getHexString()}`, `#${rampColor(s).getHexString()}`, s > 0.6 ? q((s - 0.6) * 3, 6) : 0);
}

const C = { wall: "#c9d8f5", slab: "#dfe8fb", deck: "#eef3ff", steel: "#bcd0ff", rod: "#e8eefc", floor: "#2a5bb8", glass: "#9fc0ff", accent: "#ffd84a" };

// ---------------------------------------------------------------- the atrium

export const W_X = 6;        // walkways span x -6..6
export const Y4 = 3.0, Y2 = 1.0, Y3 = 2.0, Z3 = -3.0, ROOF = 4.7;
export const HANGERS = [-4, 0, 4];
export const RZ = 0.42;      // rods at z = ±RZ

const Rod: React.FC<{ x: number; z: number; y0: number; y1: number; m?: Mat }> = ({ x, z, y0, y1, m }) => (
  <mesh position={[x, (y0 + y1) / 2, z]} material={m ?? clay(C.rod)}>
    <cylinderGeometry args={[0.022, 0.022, Math.abs(y1 - y0), 8]} />
  </mesh>
);

/** One walkway at height y (its deck top), centred on z, with its three box beams underneath. */
const Walkway: React.FC<{ y: number; z: number; beam?: Mat; rail?: string }> = ({ y, z, beam, rail = C.steel }) => (
  <group position={[0, y, z]}>
    <mesh position={[0, -0.04, 0]} material={clay(C.deck)} {...sh}><boxGeometry args={[W_X * 2, 0.08, 0.86]} /></mesh>
    {[-1, 1].map((s) => (
      <mesh key={`st${s}`} position={[0, -0.15, s * 0.36]} material={clay(C.steel)} {...sh}><boxGeometry args={[W_X * 2, 0.14, 0.07]} /></mesh>
    ))}
    {HANGERS.map((x) => (
      <mesh key={`bb${x}`} position={[x, -0.28, 0]} material={beam ?? clay(C.steel)} {...sh}><boxGeometry args={[0.16, 0.13, 0.98]} /></mesh>
    ))}
    {/* railings: posts, a top rail and a glass panel each side */}
    {[-1, 1].map((s) => (
      <group key={`r${s}`}>
        <mesh position={[0, 0.36, s * 0.4]} material={clay(rail)}><boxGeometry args={[W_X * 2, 0.035, 0.035]} /></mesh>
        <mesh position={[0, 0.17, s * 0.4]} material={clay(C.glass, "#000000", 0, 0.32)}><boxGeometry args={[W_X * 2, 0.34, 0.012]} /></mesh>
        {Array.from({ length: 13 }, (_, i) => (
          <mesh key={i} position={[-W_X + i, 0.18, s * 0.4]} material={clay(rail)}><boxGeometry args={[0.03, 0.36, 0.03]} /></mesh>
        ))}
      </group>
    ))}
  </group>
);

const Nut: React.FC<{ p: V3; m?: Mat; r?: number }> = ({ p, m, r = 0.045 }) => (
  <mesh position={p} material={m ?? clay("#9fb4de")}><cylinderGeometry args={[r, r, r * 0.9, 6]} /></mesh>
);

export type AtriumProps = {
  /** 0..1 stress on the 4th-floor connections */
  stress?: number;
  /** 0..1 the fall (both hung walkways) */
  fall?: number;
  /** small shiver (radians) */
  shiver?: number;
  /** evening warmth 0..1: warm lights on, the dance floor tiles glow */
  warm?: number;
  /** dance floor pulse 0..1 */
  pulse?: number;
  /** hide the hung walkways' rods below the upper beams (the empty hangers after the fall) */
  hangersOnly?: boolean;
};

export const Atrium: React.FC<AtriumProps> = ({ stress = 0, fall = 0, shiver = 0, warm = 0, pulse = 0 }) => {
  const f4 = sm(fall) ** 1.6;
  const f2 = sm((fall - 0.18) / 0.82) ** 1.6;
  const d4 = f4 * (Y4 - 0.55), d2 = f2 * (Y2 - 0.32);
  const beam4 = stressClay(stress, C.steel);
  const tilt4 = f4 * 0.05, tilt2 = f2 * -0.03;
  return (
    <group>
      {/* lobby floor with the dance floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, 0]} material={clay(C.floor)} receiveShadow><planeGeometry args={[30, 22]} /></mesh>
      {Array.from({ length: 5 * 8 }, (_, i) => {
        const cx = (i % 8) - 3.5, cz = Math.floor(i / 8) - 2 + 2.4;
        const lit = warm * (0.35 + 0.65 * ((i * 7) % 5 === Math.round(pulse * 4) % 5 ? 1 : 0.25));
        return (
          <mesh key={i} rotation-x={-Math.PI / 2} position={[cx * 0.62, 0.005, cz * 0.62]} material={clay("#3b6cc8", "#ffd84a", q(lit * 0.9, 8))}>
            <planeGeometry args={[0.58, 0.58]} />
          </mesh>
        );
      })}
      {/* the atrium's sides: floor slabs the walkways bridge between */}
      {[-1, 1].map((s) => (
        <group key={`side${s}`} position={[s * (W_X + 1.1), 0, 0]}>
          <mesh position={[s * 0.9, ROOF / 2, 0]} material={clay(C.wall)} {...sh}><boxGeometry args={[0.3, ROOF, 12]} /></mesh>
          {[1, 2, 3, 4].map((fl) => (
            <mesh key={fl} position={[0, fl * 1.0 - 0.06, 0]} material={clay(C.slab)} {...sh}><boxGeometry args={[2.2, 0.12, 12]} /></mesh>
          ))}
          {[-5, -2.5, 0, 2.5, 5].map((z) => (
            <mesh key={z} position={[-s * 1.05, ROOF / 2, z]} material={clay(C.wall)} {...sh}><boxGeometry args={[0.16, ROOF, 0.16]} /></mesh>
          ))}
        </group>
      ))}
      {/* back wall with tall windows, warm at night */}
      <mesh position={[0, ROOF / 2, -6]} material={clay(C.wall)} receiveShadow><boxGeometry args={[18, ROOF, 0.2]} /></mesh>
      {[-6, -3, 0, 3, 6].map((x) => (
        <mesh key={x} position={[x, 2.4, -5.88]} material={clay("#24427f", "#ffe7a0", q(0.15 + warm * 0.7, 8))}><boxGeometry args={[1.6, 3.4, 0.04]} /></mesh>
      ))}
      {/* the roof: trusses over each hanger line and a skylight */}
      {HANGERS.map((x) => (
        <mesh key={`tr${x}`} position={[x, ROOF + 0.12, -1.2]} material={clay(C.steel)} {...sh}><boxGeometry args={[0.22, 0.24, 11]} /></mesh>
      ))}
      <mesh position={[0, ROOF + 0.3, -1.2]} material={clay("#dfe9f2", "#fff4e0", 0.5)}><boxGeometry args={[13, 0.04, 11]} /></mesh>

      {/* 3rd-floor walkway, offset, on its own rods (it stayed up) */}
      <Walkway y={Y3} z={Z3} />
      {HANGERS.map((x) => [-1, 1].map((s) => <Rod key={`r3${x}${s}`} x={x} z={Z3 + s * RZ} y0={ROOF} y1={Y3 - 0.34} />))}

      {/* upper rods: roof → 4th-floor box beams; they stay when the beams pull off */}
      {HANGERS.map((x) => [-1, 1].map((s) => (
        <group key={`u${x}${s}`}>
          <Rod x={x} z={s * RZ} y0={ROOF} y1={Y4 - 0.38} />
          <Nut p={[x, Y4 - 0.38, s * RZ]} />
        </group>
      )))}

      {/* the 4th-floor walkway and, hung from it, the 2nd-floor walkway */}
      <group position={[0, -d4, 0]} rotation={[0, 0, tilt4 + shiver]}>
        <Walkway y={Y4} z={0} beam={beam4} />
        {/* lower rods: 4th-floor beams → 2nd-floor beams, offset along the beam */}
        {fall < 0.18 && HANGERS.map((x) => [-1, 1].map((s) => (
          <Rod key={`l${x}${s}`} x={x + 0.1} z={s * RZ * 0.88} y0={Y4 - 0.22} y1={Y2 - 0.36} />
        )))}
      </group>
      <group position={[0, -d2, 0]} rotation={[0, 0, tilt2 + shiver * 0.7]}>
        <Walkway y={Y2} z={0} />
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- the joint, big

export type JointProps = {
  /** 0..1 stress on the box beam, hot at the upper nut */
  stress?: number;
  /** 0..1 the pull-through: flange halves fold open, the beam slides down past the nut */
  pull?: number;
  frame?: number;
  /** show the lower rod (the as-built change) */
  lower?: boolean;
  /** 0..1 a ring of light pulses round the upper nut */
  ring?: number;
};

export const JOINT_NUT: V3 = [0, -0.66, 0];

/** Behind the joint: the atrium's far wall as a blueprint panel grid, so the close-ups sit in a place. */
const JointBackdrop: React.FC = () => (
  <group position={[0, 0, -3.2]}>
    <mesh material={clay("#1f4ea6")}><boxGeometry args={[30, 30, 0.1]} /></mesh>
    {Array.from({ length: 25 }, (_, i) => (
      <mesh key={`v${i}`} position={[-12 + i, 0, 0.08]} material={clay(i % 4 === 0 ? "#c9d8f5" : "#5f86d4")}><boxGeometry args={[i % 4 === 0 ? 0.12 : 0.04, 30, 0.04]} /></mesh>
    ))}
    {Array.from({ length: 25 }, (_, i) => (
      <mesh key={`h${i}`} position={[0, -12 + i, 0.08]} material={clay(i % 4 === 0 ? "#c9d8f5" : "#5f86d4")}><boxGeometry args={[30, i % 4 === 0 ? 0.12 : 0.04, 0.04]} /></mesh>
    ))}
    {[-6, -2, 2, 6].map((x) => (
      <mesh key={`w${x}`} position={[x, 2, 0.12]} material={clay("#24427f", "#ffe7a0", 0.25)}><boxGeometry args={[2.2, 3.4, 0.04]} /></mesh>
    ))}
  </group>
);

export const Joint: React.FC<JointProps> = ({ stress = 0, pull = 0, frame = 0, lower = true, ring = 0 }) => {
  const open = sm(pull / 0.45) * 1.05;
  const drop = sm((pull - 0.15) / 0.85) ** 1.5 * 3.2;
  const beam = stressClay(stress, C.steel);
  const flange = stressClay(Math.min(1, stress * 1.15), C.steel);
  return (
    <group>
      <JointBackdrop />
      {/* the upper rod and its nut: fixed to the roof, they stay */}
      <mesh position={[0, 4.2, 0]} material={clay(C.rod)}><cylinderGeometry args={[0.09, 0.09, 9.6, 16]} /></mesh>
      <mesh position={JOINT_NUT} material={clay("#9fb4de")}><cylinderGeometry args={[0.2, 0.2, 0.18, 6]} /></mesh>
      <mesh position={[0, -0.55, 0]} material={clay("#b3c6ea")}><cylinderGeometry args={[0.28, 0.28, 0.04, 20]} /></mesh>
      {ring > 0 && (
        <mesh position={JOINT_NUT} rotation-x={Math.PI / 2} material={glow(C.accent, q(0.4 + ring * 1.2, 8))}>
          <torusGeometry args={[0.34 + 0.12 * ring, 0.018, 8, 40]} />
        </mesh>
      )}
      {/* the box beam (two channels toe to toe), cut away: no front web; it drops in the failure */}
      <group position={[0, -drop, 0]}>
        <Failure3D stress={stress} frame={frame} hot={[0, -0.5, 0]} hotRadius={1.1} glowAt={1.2}
          debris={{ at: [0, -0.62, 0], count: 26, size: 0.05, speed: 1.4, dir: [0, -0.6, 0.6], spread: 0.25, start: 0.1, seconds: 1.8, slow: 0.45, gravity: 2.2, seed: "hyatt-nut", kind: "metal" }}
          progress={pull}>
          <group>
            <mesh position={[0, 0.5, 0]} material={beam} {...sh}><boxGeometry args={[4, 0.08, 1.0]} /></mesh>
            <mesh position={[0, 0, -0.5]} material={beam} {...sh}><boxGeometry args={[4, 1.0, 0.08]} /></mesh>
            {/* bottom flange halves, the seam at z=0; each folds down about its web */}
            {[-1, 1].map((s) => (
              <group key={s} position={[0, -0.5, s * 0.5]} rotation={[s * open, 0, 0]}>
                <mesh position={[0, 0, -s * 0.25]} material={flange} {...sh}><boxGeometry args={[4, 0.08, 0.5]} /></mesh>
              </group>
            ))}
            {/* the cut edge of the front web, as a thin rim */}
            <mesh position={[0, 0.46, 0.5]} material={beam}><boxGeometry args={[4, 0.08, 0.06]} /></mesh>
          </group>
        </Failure3D>
        {/* the walkway deck on top */}
        <mesh position={[0.6, 0.72, -0.3]} material={clay(C.deck)} {...sh}><boxGeometry args={[5.2, 0.3, 2.4]} /></mesh>
        {/* the lower rod (to the 2nd-floor walkway), its nut inside on the bottom flange */}
        {lower && (
          <group>
            <mesh position={[0.95, -4.6, 0]} material={clay(C.rod)}><cylinderGeometry args={[0.09, 0.09, 8.4, 16]} /></mesh>
            <mesh position={[0.95, -0.36, 0]} material={clay("#9fb4de")}><cylinderGeometry args={[0.2, 0.2, 0.18, 6]} /></mesh>
            <mesh position={[0.95, -0.45, 0]} material={clay("#b3c6ea")}><cylinderGeometry args={[0.28, 0.28, 0.04, 20]} /></mesh>
          </group>
        )}
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- wrappers

/** A 3D beat: the beat's frame frozen into the stage, the clay look, the honesty tag and any overlay. */
export const Shot3D: React.FC<{ f: number; children: React.ReactNode; overlay?: React.ReactNode; tag?: "reconstruction" | "paused"; dof?: number; shadowBox?: number; floor?: boolean; fog?: { color?: string; near: number; far: number } }> = ({
  f, children, overlay, tag = "reconstruction", dof = 1, shadowBox = 8, floor = true, fog,
}) => (
  <Freeze frame={f}>
    <DisasterStage look="nightGrid" dof={dof} shadowBox={shadowBox} floor={floor ? "reflect" : false} fog={fog ?? { color: "#08111c", near: floor ? 18 : 6, far: floor ? 50 : 20 }}
      overlay={<DisasterLookProvider value={RECIPE}><AbsoluteFill style={{ pointerEvents: "none" }}>{overlay}<FlatTag t={f} tag={tag} at={0} /></AbsoluteFill></DisasterLookProvider>}>
      {children}
    </DisasterStage>
  </Freeze>
);

/** A flat or doc beat in the video's look: the backdrop, the drawing, the grain and an honesty tag. */
export const Flat: React.FC<{ t: number; children: React.ReactNode; html?: React.ReactNode; tag?: string }> = ({ t, children, html, tag = "principle" }) => (
  <DisasterLookProvider value={RECIPE}>
    <AbsoluteFill>
      <LookBackground />
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 19 }, (_, i) => <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={1920} stroke="rgba(255,255,255,0.3)" strokeWidth={i % 5 === 0 ? 8 : 5} />)}
        {Array.from({ length: 33 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 60} x2={1080} y2={i * 60} stroke="rgba(255,255,255,0.3)" strokeWidth={i % 5 === 0 ? 8 : 5} />)}
      </svg>
      {children}
      {html}
      <Texture t={t} />
      {tag ? <FlatTag t={t} tag={tag} at={0} /> : null}
    </AbsoluteFill>
  </DisasterLookProvider>
);

export const useLook = () => useDisasterLook(RECIPE);

/** The dated mono caption (date · place), typing on. */
export const DateCaption: React.FC<{ t: number; at: number; line: string; title?: string; titleAt?: number; top?: number }> = ({ t, at, line, title, titleAt, top = 300 }) => {
  const n = t < at ? 0 : Math.max(line.length * (at === 0 ? 1 : 0), Math.floor((t - at) * 1.6));
  const nt = Math.max(0, Math.floor((t - (titleAt ?? at)) * 2.2));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", pointerEvents: "none" }}>
      {title ? <div style={{ fontFamily: ANTON, fontSize: 96, color: "#f4efe7", letterSpacing: 2, textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>{title.slice(0, nt)}</div> : null}
      <div style={{ display: "inline-block", marginTop: 10, fontFamily: MONO, fontWeight: 700, fontSize: 48, letterSpacing: 4, color: "#f4efe7",
        background: "rgba(10,10,12,0.72)", padding: "8px 22px", borderLeft: "6px solid #ffd84a" }}>{line.slice(0, n)}</div>
    </div>
  );
};

export default Atrium;
