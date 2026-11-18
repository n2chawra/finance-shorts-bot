// "So zoom back out, past the cores, past the fans, to this NVIDIA chip." (the loop)
// The dark studio stage (void backdrop, reflective floor), the reverse of the dive:
//   extreme   the camera sits among the switches; on "zoom" it rushes back up out of them (motion blur)
//   "cores"   cut: the grid of cores on the die flashes past as the camera keeps rushing back
//   "fans"    cut: close over the chip on the graphics card, the shroud and its fans close back over it
//   "nvidia"  the card turns on (die and accent light up, fans spinning), turning on the stage, and the
//             camera settles into the Hook's first frame: HOOK below (medium, the card turning), so the
//             last frame cuts seamlessly into the first.
//
// Clock: m.t / the events are story frames (p.frame); the 3D kit's own parts read Remotion's frame,
// the video's global frame, so their starts go through `G` (kitClock, from Hook.tsx).
import React from "react";
import { Easing, useCurrentFrame } from "remotion";
import { cardPoint, kitClock, OPEN, STAGE, STAND, StandingCard, StudioSet } from "./Hook";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, type CamKey, Die, direct, fieldCellAt, Focus, InstancedField, Stage3D, TECH, type V3 } from "../../three/index";

/** The Hook's first frame (Hook.tsx), matched by this beat's last: the card stood up (STAND), closed
 * (seed "gpu", lit 0.45, fans at 1.6 rps), turned OPEN.rot and turning OPEN.spin a story frame; the
 * camera on the Hook's opening orbit (OPEN: centre, radius, height) at angle OPEN.angle, coming to rest
 * there as the Hook's orbit starts from rest. */
const HOOK = { ...OPEN, lit: 0.45, rps: 1.6 } as const;

const FIELD = { cols: 56, rows: 56, spacing: 0.08 } as const;
const CENTER = (FIELD.rows / 2) * FIELD.cols + FIELD.cols / 2;

/** where the card's die sits, the card turned by `rot` (GPUBoard: the die at x -0.2, its top ~0.13) */
const dieOnCard = (rot: number): V3 => cardPoint(rot, [-0.2, 0.13, 0]);
/** the card's face direction (its fans' side), the card turned by `rot` */
const faceOf = (rot: number): V3 => {
  const a = cardPoint(rot, [0, 0, 0]), b = cardPoint(rot, [0, 1, 0]);
  return [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
};

const Back: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const G = kitClock(p, useCurrentFrame());                  // story frame → the kit's frame
  const zoom = m.at("zoom", 4);
  const cores = m.at("cores", Math.round(m.end * 0.3));
  const fans = m.at("fans", Math.round(m.end * 0.55));
  const nvidia = m.at("nvidia", Math.round(m.end * 0.78));
  const sw = m.at("switches", Math.round((zoom + cores) / 2));   // "past the switches": a wave of light runs across them
  const end = Math.max(nvidia + 8, m.end);

  const cell = fieldCellAt(CENTER, FIELD.cols, FIELD.rows, FIELD.spacing);
  const cellAt: V3 = [cell[0], 0.04, cell[2]];
  // the card's turn: it reaches HOOK.rot on the last frame, turning at the Hook's own rate
  const rot = HOOK.rot - (end - m.t) * HOOK.spin;
  const rotAtFans = HOOK.rot - (end - fans) * HOOK.spin;
  const dieAtFans = dieOnCard(rotAtFans);
  const faceAtFans = faceOf(rotAtFans);

  const rushA = direct(p.beat.events, [
    // extreme: among the switches, creeping in, then the rush back out on "zoom"
    { at: 0, move: "push", look: cellAt, dir: [0.25, 1, 0.55], from: 0.42, to: 0.34, dur: Math.max(4, zoom), fov: 38 },
    { at: zoom, move: "pullback", look: cellAt, dir: [0.25, 1, 0.55], to: 6.5, dur: Math.max(4, cores - zoom), ease: Easing.in(Easing.cubic) },
    // close: cut onto the die's cores, which flash past as the camera keeps rushing back
    { at: cores, move: "pullback", look: [0, 0.06, 0], dir: [0.2, 1, 0.45], from: 0.45, to: 5.5, dur: Math.max(4, fans - cores), ease: Easing.in(Easing.quad) },
  ]);
  // past the fans: cut close over the chip, pull back onto the Hook's orbit, then swing (slowing to rest)
  // into its first frame, the same direction the Hook's orbit then carries on
  const swing = direct(p.beat.events, [
    { at: nvidia, move: "orbit", center: HOOK.center, radius: HOOK.radius, height: HOOK.height, from: HOOK.angle + 0.32, to: HOOK.angle, dur: end - nvidia, fov: HOOK.fov },
  ]);
  const keys: CamKey[] = [
    ...rushA,
    { f: fans, pos: [dieAtFans[0] + faceAtFans[0] * 1.15 + 0.25, dieAtFans[1] + faceAtFans[1] * 1.15 + 0.1, dieAtFans[2] + faceAtFans[2] * 1.15], look: dieAtFans, fov: 38, cut: true },
    { ...swing[0]!, ease: Easing.out(Easing.cubic) },
    ...swing.slice(1),
  ];

  const inSwitches = m.t < cores, inCores = m.t >= cores && m.t < fans, onCard = m.t >= fans;
  const close = m.lerp([fans, fans + 18], [1, 0], Easing.inOut(Easing.cubic));   // the shroud closes over the chip
  const on = m.lerp([nvidia - 2, nvidia + 10], [0, 1], Easing.out(Easing.cubic)); // the card turns on
  const surge = m.lerp([nvidia + 4, end], [0.35, 0], Easing.out(Easing.quad)) * on; // its first light, settling to the Hook's
  const flash = m.pulse(cores + 1, 5) + m.pulse(fans + 1, 5) + m.pulse(m.at("out", Math.round((zoom + sw) / 2)), 6);

  return (
    <Stage3D {...STAGE} dof={inCores ? 2 : 3} blur={1.4}>
      <Camera3D keys={keys} frame={m.t} seed="back-cam" blur={1.2} />
      {inSwitches && (
        <>
          <Focus at={cellAt} range={0.6} />
          <InstancedField {...FIELD} start={G(m.t < sw ? -90 : sw)} reveal={1} wave={m.t < sw ? 20 : 34} waveColor={m.t < sw ? TECH.cyan : TECH.amber} pick={[CENTER]} seed="back-field" />
        </>
      )}
      {inCores && (
        <>
          <Focus at={[0, 0.06, 0]} range={2} />
          <Die size={3} cores={[6, 8]} thick={0.08} seed="back-cores" lit={0.85 + 0.15 * flash} position={[0, 0.04, 0]} />
        </>
      )}
      {onCard && (
        <>
          <Focus at={m.t < nvidia ? dieAtFans : STAND.center} range={m.t < nvidia ? 1.2 : 1.6} />
          <StudioSet phase={m.t - end} />
          <StandingCard yaw={rot} open={close} lit={0.12 + (HOOK.lit - 0.12) * on + surge} rps={0.3 + (HOOK.rps - 0.3) * on} />
        </>
      )}
    </Stage3D>
  );
};

export default Back;
