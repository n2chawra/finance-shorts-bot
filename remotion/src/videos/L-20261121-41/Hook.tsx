// Hook (3D, blueprint look): the Hyatt Regency atrium, early evening. Frame 0 is already the atrium with the
// date · place caption and the reconstruction tag; the hotel's name types on "Hyatt", the camera pushes in on
// "Kansas", the two stacked walkways light up on "Two", labels draw on "walkways", the dance floor pulses on
// "crowded" and the camera tilts down to the lobby on "lobby".
import React from "react";
import { useCurrentFrame } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, direct, DisasterStage, Focus, Label3D } from "../../three/index";
import { Atrium, LOWER_Y, UPPER_Y, Walkways } from "./world";
import { kitClock, MonoCaption, Overlay } from "./ui";

type Params = { fig?: { year?: string; day?: string } };

const Hook: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const K = kitClock(p, useCurrentFrame());
  const t = m.t;
  const fig = (p.beat.params as Params).fig ?? {};
  const ev = {
    hyatt: m.at("hyatt", 2), kansas: m.at("kansas", 30), two: m.at("two", 90), walkways: m.at("walkways", 115),
    crowded: m.at("crowded", 150), lobby: m.at("lobby", 170),
  };
  const end = Math.max(m.end, ev.lobby + 30);
  const lit = cue(t, ev.two, 12);
  const dance = 0.25 + 0.75 * cue(t, ev.crowded, 14);
  const keys = direct(ev, [
    { at: 0, move: "push", look: [0, 4.2, -0.5], dir: [-0.85, 0.12, 1], from: 21, to: 19, dur: Math.max(10, ev.kansas), fov: 42 },
    { at: "kansas", move: "push", look: [0, 4.0, 0], dir: [-0.75, 0.2, 1], to: 15, dur: Math.max(12, ev.two - ev.kansas) },
    { at: "two", move: "push", look: [-1, 3.9, 0.2], dir: [-0.55, 0.22, 1], to: 10.5, dur: Math.max(12, ev.lobby - ev.two) },
    { at: "lobby", move: "crane", look: [0, 1.6, 0], base: [-6.4, 0, 9], from: 5.6, to: 4.6, dur: Math.max(12, end - ev.lobby) },
  ]);
  return (
    <DisasterStage look="nightGrid" dof={1.5} shadowBox={11} fog={{ color: "#08111c", near: 18, far: 50 }}
      overlay={
        <Overlay>
          <MonoCaption t={t} at={-80} text={`JULY ${fig.day ?? ""}, ${fig.year ?? ""} · KANSAS CITY, MISSOURI`} size={34} />
          <MonoCaption t={t} at={ev.hyatt} text="HYATT REGENCY HOTEL · THE ATRIUM" top={164} size={30} color="#f4f8ff" />
        </Overlay>
      }>
      <Camera3D keys={keys} frame={t} drift={0.02} />
      <Focus at={[0, 3.8, 0]} range={8} />
      <Atrium dance={dance} frame={t} />
      <Walkways frame={t} lit={lit} />
      {t >= ev.walkways && (
        <>
          <Label3D at={[-3, UPPER_Y + 0.55, 0.4]} offset={[-1.2, 1.0, 0.6]} text="FOURTH-FLOOR WALKWAY" start={K(ev.walkways)} color="#ffd84a" px={44} />
          <Label3D at={[-3.4, LOWER_Y + 0.55, 0.4]} offset={[-1.4, -0.9, 0.8]} text="SECOND-FLOOR WALKWAY" sub="hung below it" start={K(ev.walkways + 10)} color="#ffd84a" px={44} />
        </>
      )}
    </DisasterStage>
  );
};

export default Hook;
