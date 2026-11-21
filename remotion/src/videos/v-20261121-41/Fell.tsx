// Fell: "The nuts pulled through the beams. Both walkways fell."
// The night atrium after the fall (the long video's world): both walkways down on the lobby floor, the
// roof rods hanging empty and swinging, dust rising ("nuts", "beams"); a red mono caption types on at the
// top ("both"); the camera pulls back and up ("fell"). No people, no impact close-up.
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Focus, Smoke } from "../../three/index";
import { DateCaption, Shot3D } from "./World";
import { Atrium, UPPER_Y, Walkways } from "./Hall";

const Fell: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const beams = m.at("beams", 20), both = m.at("both", 40), fell = m.at("fell", 56);
  const keys = direct(p.beat.events, [
    { at: 0, move: "hold", pos: [5.2, UPPER_Y + 0.6, 6.2], look: [0, UPPER_Y - 0.4, 0], fov: 50 },
    { at: 1, move: "push", look: [0, UPPER_Y - 0.6, 0], dir: [0.6, 0.15, 0.78], from: 8.2, to: 7.4, dur: Math.max(10, beams - 1) },
    { at: beams, move: "cut", pos: [9.8, 6.8, 12.6], look: [0, 1.4, 0], fov: 56 },
    { at: beams + 1, move: "pullback", look: [0, 1.4, 0], dir: [0.6, 0.42, 0.72], from: 16.8, to: 18.2, dur: Math.max(10, fell - beams) },
    { at: fell, move: "pullback", look: [0, 2.0, 0], dir: [0.55, 0.55, 0.62], to: 21, dur: Math.max(12, m.end - fell) },
  ]);
  return (
    <Shot3D f={f} overlay={<DateCaption t={f} at={both} line="ROOF RODS STILL HANGING" top={320} />}>
      <Camera3D keys={keys} seed="hyatt-fell" drift={0.012} />
      <Focus at={[0, 2, 0]} range={8} />
      <Atrium dance={0.4} frame={f} dim={0.5} />
      <Walkways frame={f + 40} fall={1} />
      <Smoke frame={f + 30} at={[-3, 0, 0]} height={2.4} width={3.4} count={14} color="#d9c7a8" opacity={0.32} wind={[0.4, 0, 0.3]} seed="dust-a" />
      <Smoke frame={f + 40} at={[3, 0, 0]} height={2.4} width={3.4} count={14} color="#d9c7a8" opacity={0.32} wind={[-0.3, 0, 0.3]} seed="dust-b" />
    </Shot3D>
  );
};
export default Fell;
