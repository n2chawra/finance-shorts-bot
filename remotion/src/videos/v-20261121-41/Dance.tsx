// Dance: "July {fact1}. A tea dance fills the lobby."
// The night atrium from high on the far side (the long video's world): the dated caption types on
// ("July"); the lobby lamps and windows warm ("tea"); the dance floor tiles light and pulse ("dance");
// the camera tilts up from the floor to the two walkways hanging over it ("lobby").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Focus } from "../../three/index";
import { DateCaption, Shot3D } from "./World";
import { Atrium, UPPER_Y, Walkways } from "./Hall";

type Params = { fig?: { year?: string } };

const Dance: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const year = (p.beat.params as Params).fig?.year ?? "";
  const july = m.at("july", 2), tea = m.at("tea", 20), dance = m.at("dance", 36), lobby = m.at("lobby", 50);
  const keys = direct(p.beat.events, [
    { at: 0, move: "hold", pos: [-9.5, 7.6, 10.5], look: [0, 1.2, 0], fov: 56 },
    { at: 1, move: "push", look: [0, 1.2, 0], dir: [-0.62, 0.48, 0.68], from: 15.2, to: 13.6, dur: Math.max(10, lobby - 1) },
    { at: lobby, move: "push", look: [0, UPPER_Y - 0.6, 0], dir: [-0.6, 0.12, 0.8], from: 13.4, to: 11.6, dur: Math.max(12, m.end - lobby) },
  ]);
  const lit = m.lerp([tea, tea + 14], [0.2, 1]);
  const floor = m.lerp([dance, dance + 10], [0.15, 1]);
  return (
    <Shot3D f={f} overlay={<DateCaption t={f} at={july} line={`JULY ${year} · EVENING · TEA DANCE`} top={320} />}>
      <Camera3D keys={keys} seed="hyatt-dance" drift={0.015} />
      <Focus at={[0, 2.2, 0]} range={8} />
      <Atrium dance={floor} frame={f} dim={1 - lit} />
      <Walkways frame={f} lit={lit * 0.6} stress={0.15} />
    </Shot3D>
  );
};
export default Dance;
