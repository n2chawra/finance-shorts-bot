// "The chip before this one already held {fact3} of them. Back then, that sounded like a lot."
// A dark clean-room bay under dim amber filter light, the older wafer the hero on a graphite bench: it is
// in frame from the first frame (just off-centre) and slides to the middle on "before"; on "already" one
// die on it is picked out and glows (a pointer lands on it), on "held" the camera pushes close and its
// count counts up on the bench's front edge; on "then" the camera starts drifting back across the bench
// and the count settles; "sounded" pulses it bigger once; on "lot" the camera pulls back and the glow dims.
//
// Clock: m.t / the events are story frames (p.frame); the 3D kit's own parts (FigLabel3D, Pointer3D)
// read Remotion's frame, the video's global frame, so their starts go through `G`.
import React from "react";
import { Easing, useCurrentFrame } from "remotion";
import { kitClock } from "./Hook";
import type { SceneProps } from "../../scenes/kit";
import { SourceLine, motion } from "../../flat/kit";
import { Block, Camera3D, direct, FigLabel3D, Focus, Pointer3D, Stage3D, TECH, Wafer, waferDieAt, type V3 } from "../../three/index";

type Params = { fig?: { before?: string } };

const TABLE_Y = 0.9;            // the bench top
const R = 0.62, DIE = 0.062;    // the older wafer: radius and die pitch (model sizes)
const AMBER_DIM = "#7a5418";    // the filter ceiling, low exposure

/** The die nearest a point on the wafer (deterministic: walks the wafer's own die order). */
function nearestDie(x: number, z: number): number {
  let best = 0, bd = Infinity;
  for (let i = 0; ; i++) {
    const d = waferDieAt(i, R, DIE);
    if (!d) break;
    const dd = Math.hypot(d[0] - x, d[2] - z);
    if (dd < bd) { bd = dd; best = i; }
  }
  return best;
}
const PICK = nearestDie(0.08, 0.3);

/** A dark fab bay: graphite floor and walls, dim amber filter strips, tool silhouettes with small lamps. */
const DarkBay: React.FC = () => (
  <group>
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, -3]} receiveShadow>
      <planeGeometry args={[12, 14]} />
      <meshStandardMaterial color="#17140f" roughness={0.55} metalness={0.2} />
    </mesh>
    <mesh position={[0, 2.5, -4.2]}><planeGeometry args={[12, 6]} /><meshStandardMaterial color="#14120e" roughness={0.9} /></mesh>
    {/* filter ceiling: dim amber strips receding */}
    {Array.from({ length: 12 }, (_, i) => (
      <mesh key={i} position={[-1.3 + (i % 3) * 1.3, 3.4, 0.4 - Math.floor(i / 3) * 1.3]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[1.1, 0.35]} />
        <meshBasicMaterial color={AMBER_DIM} toneMapped={false} />
      </mesh>
    ))}
    {/* tools along both walls: dark machines, a dark window, one small lamp each */}
    {[-1, 1].map((side) => [0, 1, 2].map((i) => (
      <group key={`${side}-${i}`} position={[side * 2.3, 0, -0.6 - i * 1.9]} rotation-y={-side * Math.PI / 2}>
        <Block size={[1.6, 2.1 + (i % 2) * 0.35, 1.1]} radius={0.06} preset="white" color="#2b2822" position={[0, 1.08, 0]} />
        <Block size={[0.8, 0.45, 0.02]} radius={0.02} preset="glossy" color="#0c0d12" position={[-0.2, 1.4, 0.56]} />
        <mesh position={[0.5, 1.62, 0.57]}><boxGeometry args={[0.07, 0.07, 0.01]} /><meshBasicMaterial color={i % 2 ? TECH.amber : TECH.cyan} toneMapped={false} /></mesh>
      </group>
    )))}
    {/* a warm pool of light on the bench only */}
    <spotLight position={[-2.6, 3.0, -0.4]} angle={0.4} penumbra={0.8} intensity={30} distance={8} decay={1.3} color="#ffd59a" castShadow />
    <pointLight position={[0, 2.6, -3.8]} intensity={3} distance={7} decay={1.5} color="#ffb347" />
  </group>
);

const Before: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const G = kitClock(p, useCurrentFrame());                  // story frame → the kit's frame
  const before = m.at("before", 6), already = m.at("already", Math.round(m.end * 0.32)), held = m.at("held", Math.round(m.end * 0.38));
  const lot = m.at("fit", Math.round(m.end * 0.9));
  const sounded = m.at("many", Math.round(m.end * 0.78));
  const tally = m.at("tally", Math.round(m.end * 0.5));     // while the figure is spoken: the count ticks bigger
  const closing = m.at("closing", Math.round(m.end * 0.95)); // the question's last words: one more tick
  const then = Math.min(m.at("so", Math.round(m.end * 0.66)), sounded - 4);
  const fig = (p.beat.params as Params).fig?.before ?? "";

  // the wafer sits just off-centre from the first frame and slides to the middle on "before"
  const slide = m.lerp([before - 4, before + 14], [0, 1], Easing.out(Easing.back(1.3)));
  const wx = -0.13 * (1 - slide);
  const lift = 0.06 * (1 - m.lerp([before + 6, before + 16], [0, 1], Easing.out(Easing.cubic)));
  const local = waferDieAt(PICK, R, DIE) ?? [0, 0.012, 0];
  const die: V3 = [local[0], TABLE_Y + local[1], local[2]];
  const edge: V3 = [die[0], TABLE_Y + 0.02, 0.7];
  const mid: V3 = [die[0], TABLE_Y + 0.02, (die[2] + edge[2]) / 2];
  const wide: V3 = [0.05, TABLE_Y, 0.22];

  // medium on the whole wafer (a slow push) → close on "held" (die + edge) → drift back on "then" → pull back on "lot"
  const keys = direct(p.beat.events, [
    { at: 0, move: "push", look: wide, dir: [0.25, 0.75, 0.95], from: 3.2, to: 2.85, dur: Math.max(4, held), fov: 36 },
    { at: held, move: "push", look: mid, dir: [0.18, 0.95, 0.7], to: 2.1, dur: 16 },
    { at: held + 16, move: "push", look: mid, dir: [0.18, 0.95, 0.7], to: 1.95, dur: Math.max(4, then - held - 16) },
    { at: then, move: "push", look: [mid[0] - 0.08, mid[1], mid[2] - 0.04], dir: [0.32, 0.95, 0.72], to: 2.6, dur: Math.max(8, lot - then) },
    { at: lot, move: "push", look: wide, dir: [0.25, 0.95, 0.75], to: 3.6, dur: Math.max(8, Math.round(m.end - lot)) },
  ]);
  const dim = 1 - 0.6 * m.lerp([lot, lot + 12], [0, 1]);

  const picked = m.t >= already;
  const glowPulse = picked ? 1 + 0.6 * m.pulse(already + 2, 10) : 0;
  // the count: lands on "held", settles (a small dip) on "then", pulses bigger once on "sounded"
  const px = Math.round(104 * (1 - 0.06 * m.pulse(then + 3, 6) + 0.14 * m.pulse(sounded, 10) + 0.1 * m.pulse(tally, 8) + 0.1 * m.pulse(closing, 8)));
  return (
    <Stage3D backdrop={{ top: "#0f0d0a", bottom: "#070605", glow: "rgba(255,179,71,0.06)" }} floor={false}
      light={0.42} keyFrom={[2, 6, 4]} rim={TECH.amber} bloom={0.9} dof={2} blur={1} shadowBox={2.5} vignette={0.6}
      fog={{ color: "#0b0906", near: 4.5, far: 11 }}
      overlay={<SourceLine p={p} />}>
      <Camera3D keys={keys} frame={m.t} seed="before-cam" />
      <Focus at={m.t < held ? wide : mid} range={m.t < held ? 1.8 : 0.8} />
      <DarkBay />
      {/* the bench: a graphite steel top on a dark body */}
      <Block size={[2.2, 0.05, 1.5]} radius={0.015} preset="brushed" color="#3a3936" position={[0, TABLE_Y - 0.025, 0]} />
      <Block size={[2.1, 0.8, 1.4]} radius={0.04} preset="white" color="#22201c" position={[0, (TABLE_Y - 0.06) / 2, -0.02]} />
      {/* the older wafer */}
      <group position={[wx, TABLE_Y + 0.031 + lift, 0]} rotation-y={-(1 - slide) * 0.25}>
        <Wafer r={R} die={DIE} seed="before-wafer" pick={picked ? PICK : -1} pickColor={TECH.amber} />
        {picked && (
          <mesh position={[local[0], 0.022, local[2]]}>
            <boxGeometry args={[DIE * 0.98, 0.004, DIE * 0.98]} />
            <meshBasicMaterial color={TECH.amber} transparent opacity={Math.min(1, 0.45 * glowPulse * dim)} toneMapped={false} />
          </mesh>
        )}
      </group>
      <Pointer3D at={[die[0], die[1] + 0.03, die[2]]} from={[0.1, 1, 0.25]} size={0.1} start={G(already)} />
      <FigLabel3D fig={fig} caption="switches, the chip before" at={edge} start={G(held)} count={Math.round(20 / p.tl.tempo)} px={px} />
    </Stage3D>
  );
};

export default Before;
