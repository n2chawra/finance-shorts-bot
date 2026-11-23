// Joint (3D, night-grid look): the box beam joint, close up. `params.shot`:
//  tease     the cut-away beam under the upper walkway, load arrows, the steel warming amber round the nut
//  enter     along the walkway's underside to the middle box beam, whose skin peels away (cut-away)
//  build     a shop bench: two channels slide together and a weld bead runs along the seam
//  rodnut    the rod comes down through the flange holes, a washer and nut spin on, the beam settles on it
//  seam      under the beam: the rod hole drilled through the seam between the two flange edges, the weld
//  lips      the weight pressing through the washer onto the two thin flange lips (flex exaggerated)
//  compare   the design (one rod) and the as-built (two rods) side by side, turning
//  double / doubled   the as-built joint: two load arrows meet on the roof rod's nut, merge, the multiplier
//  locate    along the fourth-floor walkway's underside to the middle beam's east end
//  notrod    rod ✓, nut ✓, the flange and weld around them red
//  study     the joint turning under a spotlight on a dark table; rod, nut, washer light in turn
import React from "react";
import { useCurrentFrame } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, direct, DisasterStage, Focus, glow, type Shot, type V3 } from "../../three/index";
import { BeamJoint, Channel, HH, HW, JRod, M, NutWasher, UPPER_Y, UZ, Walkways, Welds, Atrium as Room } from "./world";
import { ChapterTitle, evs, inside, kitClock, MonoCaption, MonoLine, Overlay } from "./ui";

type Params = { shot?: string; fig?: { times?: string; depth?: string }; tag?: string };

/** A glowing load arrow pointing down at `to`, `len` long, `k` 0..1 grows it. */
const Arrow3: React.FC<{ to: V3; len?: number; k: number; color?: string; r?: number }> = ({ to, len = 1, k, color = "#ffb23e", r = 0.025 }) => {
  if (k <= 0) return null;
  const L = len * k;
  const op = Math.round(Math.min(1, k * 1.5) * 10) / 10;
  return (
    <group position={[to[0], to[1] + 0.12 + L / 2, to[2]]}>
      <mesh material={glow(color, op)}><cylinderGeometry args={[r, r, L, 10]} /></mesh>
      <mesh position={[0, -L / 2 - 0.06, 0]} rotation-x={Math.PI} material={glow(color, op)}><coneGeometry args={[r * 3, 0.12, 14]} /></mesh>
    </group>
  );
};

type Recipe = {
  names: string[];
  cam: (e: Record<string, number>, end: number) => Shot[];
  focus: V3; range: number;
  scene: (t: number, e: Record<string, number>, p: Params) => React.ReactNode;
  overlay?: (t: number, e: Record<string, number>, p: Params) => React.ReactNode;
  world?: boolean;
  caption?: string;
};
const d = (a: number, b: number, min = 10) => Math.max(min, b - a);
const NUT: V3 = [0, -HH - 0.04, UZ];

const R: Record<string, Recipe> = {
  tease: {
    names: ["upper", "nut", "holding", "far", "ever"], caption: "INSIDE THE FOURTH-FLOOR BOX BEAM",
    cam: (e, end) => [
      { at: 0, move: "orbit", center: [0, -0.1, 0], radius: 3.2, height: -0.9, from: 0.9, to: 0.7, dur: d(0, e.nut!), fov: 38 },
      { at: "nut", move: "push", look: NUT, dir: [1, -0.35, 0.8], to: 1.2, dur: d(e.nut!, e.ever!) },
      { at: "ever", move: "pullback", look: [0, -0.2, 0], dir: [1, -0.45, 0.8], to: 3.2, dur: d(e.ever!, end) },
    ],
    focus: NUT, range: 0.8,
    scene: (t, e) => (
      <>
        <BeamJoint t={t} rods="two" stress={0.15 + 0.4 * cue(t, e.far!, 20)} ghostNear={t >= e.upper!} />
        <Arrow3 to={[0, HH + 0.05, UZ - 0.3]} k={cue(t, e.holding!, 10)} len={1.1} />
        <Arrow3 to={[0, HH + 0.05, UZ + 0.55]} k={cue(t, e.holding! + 6, 10)} len={1.1} />
      </>
    ),
    overlay: (t, e) => <MonoLine t={t} at={e.ever!} text="FOURTH-FLOOR BOX BEAM" x={1220} y={760} size={36} color="#ffd84a" />,
  },
  enter: {
    names: ["wrong", "first", "inside", "joint"], world: true,
    cam: (e, end) => [
      { at: 0, move: "hold", pos: [-5, UPPER_Y - 1.4, 2.2], look: [-3, UPPER_Y - 0.2, 0], fov: 44 },
      { at: "first", move: "fly", path: [[-5, UPPER_Y - 1.4, 2.2], [-2, UPPER_Y - 1.0, 1.9], [0.6, UPPER_Y - 0.7, 1.6]], look: [0, UPPER_Y - 0.3, 0.55], dur: d(e.first!, e.inside!) },
      { at: "inside", move: "push", look: [0, UPPER_Y - 0.3, 0.55], dir: [0.6, -0.4, 1], to: 0.9, dur: d(e.inside!, end) },
    ],
    focus: [0, UPPER_Y - 0.3, 0.55], range: 2,
    scene: (t, e) => (
      <>
        <Room frame={t} light="evening" dance={0.4} lamps={0.7} />
        <Walkways frame={t} lit={0.4} stress={0.3 * cue(t, e.joint!, 10)} />
      </>
    ),
    overlay: (t, e) => (
      <>
        {t >= e.inside! && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 52%, rgba(0,0,0,0) ${Math.max(30, 70 - (t - e.inside!) * 2)}%, rgba(4,8,14,0.85) ${Math.max(55, 95 - (t - e.inside!) * 2)}%)` }} />}
        <MonoLine t={t} at={e.joint!} text="THE JOINT" x={960} y={760} size={48} color="#ffd84a" center />
      </>
    ),
  },
  build: {
    names: ["steel", "box", "channels", "welded"], caption: "A BOX BEAM, AS DRAWN",
    cam: (e, end) => [
      { at: 0, move: "orbit", center: [0, 0.6, 0], radius: 3.4, height: 1.4, from: 0.6, to: 1.0, dur: d(0, e.channels!), fov: 36 },
      { at: "channels", move: "push", look: [0, 0.6, 0.6], dir: [0.9, 0.5, 0.9], to: 2.0, dur: d(e.channels!, end) },
    ],
    focus: [0, 0.6, 0], range: 1.5,
    scene: (t, e) => {
      const apart = 0.5 * cue(t, e.channels!, 12) * (1 - cue(t, e.welded!, 14));
      const weld = cue(t, e.welded! + 8, 30, (x) => x);
      return (
        <group>
          <mesh position={[0, -0.05, 0]} material={M.wood()} receiveShadow><boxGeometry args={[3.2, 0.1, 4]} /></mesh>
          {[-1.3, 1.3].map((x) => <mesh key={x} position={[x, -0.6, 0]} material={M.darkSteel()}><boxGeometry args={[0.1, 1.1, 3.6]} /></mesh>)}
          <group position={[0, 0.6, 0]} rotation-y={0.002 * t}>
            <group position={[-apart, 0, 0]}><Channel side={-1} fold={0} length={3} /></group>
            <group position={[apart, 0, 0]}><Channel side={1} fold={0} length={3} /></group>
            {weld > 0 && [HH, -HH].map((y) => (
              <mesh key={y} position={[0, y + (y > 0 ? 0.01 : -0.01), -1.5 + 1.5 * weld]} material={glow("#ffb23e", 0.9)}><boxGeometry args={[0.035, 0.02, 3 * weld]} /></mesh>
            ))}
            {weld > 0 && weld < 1 && <pointLight position={[0, HH + 0.1, -1.5 + 3 * weld]} intensity={6} distance={2} color="#ffd9a0" />}
          </group>
        </group>
      );
    },
    overlay: (t, e, p) => (
      <>
        <ChapterTitle t={t} at={e.steel!} text="HOW IT WAS MEANT TO HOLD" out={e.box! + 40} />
        <MonoLine t={t} at={e.channels! + 4} text={`TWO ${p.fig?.depth ?? ""}-INCH CHANNELS`} x={1180} y={300} size={36} color="#ffd84a" />
        <MonoLine t={t} at={e.welded! + 4} text="WELDED TOE TO TOE" x={1180} y={370} size={36} />
      </>
    ),
  },
  rodnut: {
    names: ["rod", "hole", "nut", "held"], caption: "ONE HANGER, AS DRAWN",
    cam: (e, end) => [
      { at: 0, move: "orbit", center: [0, -0.1, 0], radius: 3.4, height: -0.9, from: 0.75, to: 0.55, dur: d(0, e.nut!), fov: 40 },
      { at: "nut", move: "push", look: [0, -HH - 0.05, 0], dir: [1, -0.4, 0.8], to: 1.3, dur: d(e.nut!, end) },
    ],
    focus: [0, -HH, 0], range: 1,
    scene: (t, e) => {
      const rodY = 3.2 * (1 - cue(t, e.rod!, 26));
      const nutK = cue(t, e.nut!, 16);
      const settle = 0.03 * cue(t, e.held!, 8);
      return (
        <group>
          <group position={[0, rodY, 0]}><JRod z={0} y0={3} y1={-HH - 0.25} /></group>
          {nutK > 0 && <group position={[0, -0.4 * (1 - nutK), 0]}><NutWasher y={-HH} z={0} spin={nutK * 9} /></group>}
          <group position={[0, settle * -1 + 0.03, 0]}>
            <Channel side={-1} fold={0} /><Channel side={1} fold={0} ghost />
            <Welds hot={0} open={0} />
          </group>
          {t >= e.hole! && <mesh position={[0, -HH, 0]} rotation-x={Math.PI / 2} material={glow("#7fd0ff", 0.8)}><torusGeometry args={[0.06, 0.008, 6, 24]} /></mesh>}
          {t >= e.held! && (
            <group position={[0.45, -HH - 0.6, 0]}>
              <mesh position={[0, 0.25, 0]} material={glow("#3ddc84", 0.9)}><cylinderGeometry args={[0.02, 0.02, 0.5 * cue(t, e.held!, 10), 8]} /></mesh>
              <mesh position={[0, 0.25 + 0.25 * cue(t, e.held!, 10) + 0.05, 0]} material={glow("#3ddc84", 0.9)}><coneGeometry args={[0.06, 0.1, 12]} /></mesh>
            </group>
          )}
        </group>
      );
    },
    overlay: (t, e) => (
      <>
        <MonoLine t={t} at={e.rod!} text="HANGER ROD" x={1240} y={240} size={36} />
        <MonoLine t={t} at={e.nut! + 4} text="WASHER AND NUT" x={1240} y={760} size={36} color="#ffd84a" />
      </>
    ),
  },
  seam: {
    names: ["weak", "hole", "edges", "weld"], caption: "UNDER THE BOX BEAM",
    cam: (e, end) => [
      { at: 0, move: "hold", pos: [0.9, -1.6, 1.4], look: [0, -HH, 0], fov: 38 },
      { at: "weak", move: "push", look: [0, -HH, 0], dir: [0.5, -1, 0.9], from: 2.2, to: 1.3, dur: d(e.weak!, e.weld!) },
      { at: "weld", move: "orbit", center: [0, -HH, 0], radius: 1.2, height: -0.85, from: 0.9, to: 1.4, dur: d(e.weld!, end) },
    ],
    focus: [0, -HH, 0], range: 0.8,
    scene: (t, e) => (
      <group>
        <BeamJoint t={t} rods="one" ghostNear={false} />
        {t >= e.hole! && <mesh position={[0, -HH - 0.03, 0]} rotation-x={Math.PI / 2} material={glow("#ffd84a", 0.9)}><torusGeometry args={[0.07, 0.01, 6, 24]} /></mesh>}
        {t >= e.edges! && [-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.02, -HH - 0.025, 0]} material={glow("#7fd0ff", 0.85)}><boxGeometry args={[0.008, 0.008, 3]} /></mesh>
        ))}
        {t >= e.weld! && <mesh position={[0, -HH - 0.03, 0]} material={glow("#ffb23e", 0.9)}><boxGeometry args={[0.02, 0.012, 3]} /></mesh>}
      </group>
    ),
    overlay: (t, e) => (
      <>
        <MonoLine t={t} at={e.hole! + 2} text="ROD HOLE THROUGH THE SEAM" x={1160} y={260} size={34} color="#ffd84a" />
        <MonoLine t={t} at={e.weld! + 2} text="ONE WELD HOLDS THE EDGES" x={1160} y={330} size={34} />
      </>
    ),
  },
  lips: {
    names: ["weight", "washer", "lips", "weld", "take"], caption: "SIMPLIFIED · NOT TO SCALE",
    cam: (e, end) => [
      { at: 0, move: "orbit", center: [0, -0.2, 0], radius: 2.6, height: -0.8, from: 1.5, to: 1.3, dur: d(0, e.washer!), fov: 38 },
      { at: "washer", move: "push", look: [0, -HH - 0.04, 0], dir: [1, -0.45, 0.4], to: 1.15, dur: d(e.washer!, end) },
    ],
    focus: [0, -HH, 0], range: 0.8,
    scene: (t, e) => {
      const flex = 0.12 * cue(t, e.lips!, 14) * (0.8 + 0.2 * Math.sin(t / 5));
      return (
        <group>
          <BeamJoint t={t} rods="one" fold={flex} stress={0.25 * cue(t, e.weld!, 10)} />
          <Arrow3 to={[0, HH + 0.05, -0.6]} k={cue(t, e.weight!, 12)} len={1} />
          <Arrow3 to={[0, HH + 0.05, 0.6]} k={cue(t, e.weight! + 5, 12)} len={1} />
          {t >= e.washer! && <mesh position={[0, -HH + 0.01, 0]} rotation-x={Math.PI / 2} material={glow("#ffd84a", 0.7)}><torusGeometry args={[0.1, 0.01, 6, 28]} /></mesh>}
        </group>
      );
    },
    overlay: (t, e) => (
      <>
        <MonoLine t={t} at={e.lips!} text="TWO THIN FLANGE LIPS" x={1180} y={300} size={36} color="#ffd84a" />
        {t >= e.take! && <div style={{ position: "absolute", left: 1500, top: 420, fontFamily: "Anton, Poppins, sans-serif", fontSize: 200, color: "#ffd84a", opacity: Math.min(1, (t - e.take!) / 8) }}>?</div>}
      </>
    ),
  },
  compare: {
    names: ["paper", "joints", "same", "aren't"], caption: "THE DESIGN · AS BUILT",
    cam: (e, end) => [{ at: 0, move: "push", look: [0, -0.1, 0], dir: [0.12, 0.18, 1], from: 6.4, to: 5.4, dur: d(0, end), fov: 40 }],
    focus: [0, 0, 0], range: 3,
    scene: (t, e) => {
      const spin = 0.6 * (1 - cue(t, e.same!, 30));
      return (
        <>
          <group position={[-1.5, 0, 0]} rotation-y={0.5 + spin}><BeamJoint t={t} rods="one" length={1.6} rodGlow={0.5 * cue(t, e.joints!, 10)} /></group>
          <group position={[1.5, 0, 0]} rotation-y={0.5 + spin}><BeamJoint t={t} rods="two" length={1.6} stress={0.45 * cue(t, e["aren't"]!, 10)} rodGlow={0.5 * cue(t, e.joints! + 6, 10)} /></group>
        </>
      );
    },
    overlay: (t, e) => (
      <>
        <MonoLine t={t} at={e.joints!} text="THE DESIGN · ONE ROD" x={250} y={820} size={34} color="#7fd0ff" />
        <MonoLine t={t} at={e.joints! + 6} text="AS BUILT · TWO RODS" x={1150} y={820} size={34} color="#ffd84a" />
      </>
    ),
  },
  double: {
    names: ["nut", "own", "whole", "below"], caption: "AS BUILT · THE FOURTH-FLOOR BOX BEAM",
    cam: (e, end) => [
      { at: 0, move: "orbit", center: [0, -0.1, 0], radius: 3.2, height: -0.9, from: 1.0, to: 0.85, dur: d(0, e.nut!), fov: 38 },
      { at: "nut", move: "push", look: NUT, dir: [1, -0.25, 0.9], to: 1.7, dur: d(e.nut!, end) },
    ],
    focus: NUT, range: 1.2,
    scene: (t, e) => (
      <>
        <BeamJoint t={t} rods="two" stress={0.5 * cue(t, e.below!, 12)} />
        <Arrow3 to={[0, HH + 0.05, -0.65]} k={cue(t, e.own!, 10)} len={0.9} />
        {t >= e.whole! && (
          <group>
            <mesh position={[0, -1.3 + 0.9 * cue(t, e.whole!, 16), 0.12]} material={glow("#ff8a3c", 0.95)}><sphereGeometry args={[0.05, 12, 12]} /></mesh>
            <mesh position={[0, -1.5 + 0.5 * cue(t, e.whole!, 16), 0.12]} material={glow("#ff8a3c", 0.8)}><cylinderGeometry args={[0.022, 0.022, 0.9 * cue(t, e.whole!, 16), 10]} /></mesh>
          </group>
        )}
      </>
    ),
    overlay: (t, e) => (
      <>
        <MonoLine t={t} at={e.own!} text="ITS OWN WALKWAY" x={1160} y={250} size={34} />
        <MonoLine t={t} at={e.whole!} text="+ THE WALKWAY BELOW" x={1160} y={320} size={34} color="#ff8a3c" />
      </>
    ),
  },
  doubled: {
    names: ["load", "doubled"], caption: "AS BUILT",
    cam: (e, end) => [{ at: 0, move: "push", look: NUT, dir: [1, -0.2, 0.9], from: 1.6, to: 1.15, dur: d(0, end), fov: 38 }],
    focus: NUT, range: 0.8,
    scene: (t, e) => (
      <>
        <BeamJoint t={t} rods="two" stress={0.5 + 0.25 * cue(t, e.doubled!, 10)} />
        <Arrow3 to={[0, HH + 0.05, UZ - 0.25]} k={1} len={0.9} color={t >= e.load! + 10 ? "#ff3b30" : "#ffb23e"} r={0.025 + 0.02 * cue(t, e.load!, 14)} />
      </>
    ),
    overlay: (t, e, p) => (
      t >= e.doubled! ? (
        <div style={{ position: "absolute", left: 1240, top: 330, fontFamily: "Anton, Poppins, sans-serif", fontSize: 220, color: "#ff3b30",
          transform: `scale(${1.6 - 0.6 * Math.min(1, (t - e.doubled!) / 6)}) rotate(-6deg)`, textShadow: "0 8px 40px rgba(0,0,0,0.8)" }}>×{p.fig?.times ?? ""}</div>
      ) : null
    ),
  },
  stack: {
    names: ["each", "nut", "carried"], caption: "THE DESIGN · ONE ROD, TWO BEAMS",
    cam: (e, end) => [
      { at: 0, move: "push", look: [0, -1.4, 0], dir: [1, -0.25, 0.7], from: 3.2, to: 2.7, dur: d(0, e.carried!), fov: 40 },
      { at: "carried", move: "pullback", look: [0, -0.6, 0], dir: [1, -0.1, 0.7], to: 6.5, dur: d(e.carried!, end) },
    ],
    focus: [0, -0.8, 0], range: 3,
    scene: (t, e) => (
      <group position={[0, 0.4, 0]}>
        <group position={[0, 0, 0]}><BeamJoint t={t} rods="one" length={2} rodGlow={0.35} /></group>
        <group position={[0, -2.4, 0]}><BeamJoint t={t} rods="one" length={2} rodGlow={0.35} ghostNear={false} /></group>
        <Arrow3 to={[0, HH + 0.05, -0.6]} k={cue(t, e.each!, 10)} len={0.8} />
        <Arrow3 to={[0, -2.4 + HH + 0.05, -0.6]} k={cue(t, e.nut!, 10)} len={0.8} />
      </group>
    ),
    overlay: (t, e) => (
      <>
        <MonoLine t={t} at={e.each! + 2} text="FOURTH FLOOR · ITS OWN NUT" x={1160} y={300} size={34} color="#ffd84a" />
        <MonoLine t={t} at={e.nut! + 2} text="SECOND FLOOR · ITS OWN NUT" x={1160} y={640} size={34} color="#ffd84a" />
        <MonoLine t={t} at={e.carried!} text="EACH NUT · ONE WALKWAY" x={960} y={820} size={38} center />
      </>
    ),
  },
  nocalc: {
    names: ["who", "calculated", "nobody"], caption: "AS BUILT · THE TWO-ROD JOINT",
    cam: (e, end) => [{ at: 0, move: "orbit", center: [0, -0.2, 0], radius: 3.4, height: -0.8, from: 0.4, to: 1.0, dur: d(0, end), fov: 38 }],
    focus: [0, -0.3, 0], range: 1.5,
    scene: (t, e) => (
      <>
        <BeamJoint t={t} rods="two" rodGlow={0.4 * cue(t, e.who!, 10)} stress={t >= e.nobody! ? 0.35 : 0} />
        {t >= e.nobody! && <mesh position={[0, -HH - 0.05, UZ]} rotation-x={Math.PI / 2} material={glow("#ff3b30", 0.9)}><torusGeometry args={[0.32, 0.012, 6, 48]} /></mesh>}
      </>
    ),
    overlay: (t, e) => (
      <>
        <MonoLine t={t} at={e.calculated!} text="CONNECTION CALCULATIONS:" x={1100} y={300} size={36} />
        {t >= e.nobody! && <MonoLine t={t} at={e.nobody!} text="NONE" x={1100} y={370} size={56} color="#ff3b30" />}
      </>
    ),
  },
  review: {
    names: ["office", "technician", "detailed", "calculated"], caption: "THE SHOP DRAWINGS' JOINT · AS REVIEWED",
    cam: (e, end) => [
      { at: 0, move: "orbit", center: [0, -0.2, 0], radius: 4.6, height: -0.9, from: 1.2, to: 1.0, dur: d(0, e.detailed!), fov: 40 },
      { at: "detailed", move: "push", look: NUT, dir: [1, -0.4, 0.8], to: 1.5, dur: d(e.detailed!, end) },
    ],
    focus: [0, -0.3, 0], range: 1.6,
    scene: (t, e) => (
      <>
        <BeamJoint t={t} rods="two" />
        {t >= e.detailed! && Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return <mesh key={i} position={[Math.cos(a) * 0.34, -HH - 0.05, UZ + Math.sin(a) * 0.34]} rotation-y={-a} material={glow("#ff3b30", 0.9)}><boxGeometry args={[0.012, 0.012, 0.07]} /></mesh>;
        })}
      </>
    ),
    overlay: (t, e) => (
      t >= e.technician! ? (
        <div style={{ position: "absolute", right: 80, top: 220, background: "#f8f5ec", padding: "20px 28px", fontFamily: "'Courier Prime', monospace", fontWeight: 700, fontSize: 34, color: "#1b2533", opacity: Math.min(1, (t - e.technician!) / 8) }}>
          <div style={{ marginBottom: 12 }}>REVIEW CHECKLIST</div>
          {["DIMENSIONS", "MEMBER SIZES", "MATERIALS"].map((r, i) => <div key={r} style={{ color: t >= e.technician! + 8 + i * 6 ? "#2e8b57" : "#1b2533" }}>{t >= e.technician! + 8 + i * 6 ? "☑" : "☐"} {r}</div>)}
          <div style={{ color: t >= e.calculated! ? "#c0392b" : "#1b2533" }}>☐ CONNECTIONS</div>
        </div>
      ) : null
    ),
  },
  locate: {
    names: ["began", "east", "middle", "beam"], world: true,
    cam: (e, end) => [
      { at: 0, move: "hold", pos: [-7, UPPER_Y - 1.0, 3.2], look: [-4, UPPER_Y - 0.3, 0.5], fov: 44 },
      { at: "east", move: "fly", path: [[-7, UPPER_Y - 1.0, 3.2], [-3.5, UPPER_Y - 0.9, 2.6], [-0.4, UPPER_Y - 0.6, 2.0]], look: [0, UPPER_Y - 0.3, 0.55], dur: d(e.east!, e.beam!) },
      { at: "beam", move: "push", look: [0, UPPER_Y - 0.3, 0.55], dir: [-0.4, -0.4, 1], to: 1.3, dur: d(e.beam!, end) },
    ],
    focus: [0, UPPER_Y - 0.3, 0.55], range: 3,
    scene: (t, e) => (
      <>
        <Room frame={t} light="evening" dance={1} band={1} lamps={0.8} />
        <Walkways frame={t} lit={0.8} stress={0.3 + 0.3 * cue(t, e.middle!, 10)} />
      </>
    ),
    overlay: (t, e) => (
      <>
        <ChapterTitle t={t} at={e.began!} text="THE FAILURE" out={e.east! + 30} />
        <MonoLine t={t} at={e.beam!} text="MIDDLE BOX BEAM · EAST END" x={960} y={760} size={40} color="#ffd84a" center />
      </>
    ),
  },
  notrod: {
    names: ["rod", "nut", "beam"], caption: "INSIDE THE FOURTH-FLOOR BOX BEAM",
    cam: (e, end) => [
      { at: 0, move: "orbit", center: NUT, radius: 1.3, height: 0.2, from: 0.95, to: 0.7, dur: d(0, e.beam!), fov: 38 },
      { at: "beam", move: "push", look: NUT, dir: [1, -0.4, 0.7], to: 0.85, dur: d(e.beam!, end) },
    ],
    focus: NUT, range: 0.6,
    scene: (t, e) => <BeamJoint t={t} rods="two" stress={0.4 + 0.5 * cue(t, e.beam!, 10)} />,
    overlay: (t, e) => (
      <>
        <MonoLine t={t} at={e.rod!} text="✓ ROD" x={1180} y={240} size={40} color="#3ddc84" />
        <MonoLine t={t} at={e.nut!} text="✓ NUT" x={1180} y={320} size={40} color="#3ddc84" />
        <MonoLine t={t} at={e.beam!} text="✗ FLANGE AND WELD" x={1180} y={400} size={40} color="#ff3b30" />
      </>
    ),
  },
  study: {
    names: ["students", "rod", "nut", "washer", "phone"], caption: "THE JOINT",
    cam: (e, end) => [
      { at: 0, move: "orbit", center: [0, 0.2, 0], radius: 3.6, height: 0.9, from: 0.2, to: 1.1, dur: d(0, e.phone!), fov: 36 },
      { at: "phone", move: "push", look: [0, -0.2, 0], dir: [0.8, 0.3, 1], to: 2.4, dur: d(e.phone!, end) },
    ],
    focus: [0, 0, 0], range: 1.5,
    scene: (t, e) => (
      <group>
        <mesh position={[0, -1.3, 0]} material={M.wood()} receiveShadow><boxGeometry args={[6, 0.08, 4]} /></mesh>
        <spotLight position={[0, 4, 1]} angle={0.5} penumbra={0.7} intensity={30} distance={9} color="#fff1dc" castShadow />
        <group rotation-y={0.004 * t}>
          <BeamJoint t={t} rods="two" length={1.8} rodGlow={t >= e.rod! && t < e.nut! ? 0.7 : 0} stress={t >= e.nut! && t < e.washer! + 20 ? 0.45 : 0} />
          {t >= e.washer! && <mesh position={[0, -HH + 0.01, UZ]} rotation-x={Math.PI / 2} material={glow("#ffd84a", 0.8)}><torusGeometry args={[0.1, 0.01, 6, 28]} /></mesh>}
        </group>
        {t >= e.phone! && (
          <group position={[1.4, -1.22, 0.6]}>
            {Array.from({ length: 18 }, (_, i) => {
              const k = Math.min(1, (t - e.phone!) / 30);
              if (i / 18 > k) return null;
              return <mesh key={i} position={[Math.cos(i * 0.9) * 0.12 - i * 0.05, 0.02, Math.sin(i * 0.9) * 0.12]} rotation-x={Math.PI / 2} material={M.darkSteel()}><torusGeometry args={[0.09, 0.012, 6, 16]} /></mesh>;
            })}
          </group>
        )}
      </group>
    ),
  },
};

const JointBeat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  useCurrentFrame();
  const t = m.t;
  const params = p.beat.params as Params;
  const r = R[params.shot ?? "tease"] ?? R.tease!;
  const e = evs(m, r.names);
  const end = Math.max(m.end, 30);
  const raw = direct({ ...e, end }, r.cam(e, end));
  const keys = r.world ? inside(raw) : raw;
  const K = kitClock(p, useCurrentFrame());
  void K;
  return (
    <DisasterStage look="nightGrid" floor={false} light={r.world ? 0.32 : 1} dof={r.world ? 1.2 : 0.9} shadowBox={r.world ? 12 : 3}
      fog={r.world ? { color: "#08111c", near: 14, far: 40 } : { color: "#06101a", near: 5, far: 16 }}
      overlay={
        <Overlay text={params.tag === "principle" ? "general principle · simplified" : "3D reconstruction · cutaway"}>
          {r.caption && <MonoCaption t={t} at={2} text={r.caption} />}
          {r.overlay?.(t, e, params)}
        </Overlay>
      }>
      <Camera3D keys={keys} frame={t} drift={0.006} />
      <Focus at={r.focus} range={r.range} />
      {!r.world && <pointLight position={[1.5, 1.2, 2]} intensity={6} distance={7} color="#ffe2bf" />}
      {!r.world && <pointLight position={[-2, -0.5, -1.5]} intensity={4} distance={6} color="#59c8ff" />}
      {!r.world && params.shot !== "build" && params.shot !== "study" && params.shot !== "compare" && (
        <group>
          <mesh position={[0, HH + 0.1, 0]} material={M.concrete()} receiveShadow castShadow><boxGeometry args={[9, 0.2, 3.3]} /></mesh>
          <mesh position={[0, HH + 0.205, 0]} material={M.carpet()}><boxGeometry args={[9, 0.01, 3.0]} /></mesh>
          {[-1.62, 1.62].map((z) => <mesh key={z} position={[0, HH - 0.05, z]} material={M.painted()} castShadow><boxGeometry args={[9, 0.5, 0.14]} /></mesh>)}
          {[-3, 3].map((x) => <group key={x} position={[x, 0, 0]}><mesh material={M.millscale()} castShadow><boxGeometry args={[0.6, 0.8, 3]} /></mesh></group>)}
          {Array.from({ length: 10 }, (_, i) => <mesh key={i} position={[-4.4 + i, HH + 0.75, 1.5]} material={M.painted()}><boxGeometry args={[0.05, 0.9, 0.05]} /></mesh>)}
          <mesh position={[0, HH + 1.2, 1.5]} material={M.brass()}><boxGeometry args={[9, 0.06, 0.1]} /></mesh>
          <mesh position={[0, HH + 0.75, 1.5]} material={M.glass()}><boxGeometry args={[9, 0.85, 0.02]} /></mesh>
        </group>
      )}
      {r.scene(t, e, params)}
    </DisasterStage>
  );
};

export default JointBeat;
