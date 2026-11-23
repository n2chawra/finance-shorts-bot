// Belt: "Where does it all go? A conveyor belt carries the clay back along the machine."
// Inside the see-through shield: the screw turns and drops clay ("conveyor", close); the belt lights and
// runs ("belt"); clay lumps ride it ("clay"); the camera tracks them back along the gantries ("back",
// medium); pull back to the whole machine, the belt running its length into the finished tunnel ("machine").
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Label3D, Stage3D, TECH } from "../../three/index";
import { Section, k01 } from "./Parts";
import { BACK } from "./Hook";

const Belt: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const go = m.at("go", 10);
  const conveyor = m.at("conveyor", 20);
  const belt = m.at("carries", 30);
  const clay = m.at("clay", 46);
  const back = m.at("back", 54);
  const machine = m.at("machine", 70);
  const end = Math.max(m.end, machine + 20);
  const keys = direct({}, [
    { at: 0, move: "push", look: [-1.3, -0.2, 0.25], dir: [0.3, 0.5, 0.81], from: 4.6, to: 4.0, dur: Math.max(8, conveyor), fov: 42 },
    { at: conveyor, move: "push", look: [-2.6, -0.1, 0.25], dir: [0.15, 0.55, 0.82], to: 3.5, dur: Math.max(8, back - conveyor) },
    { at: back, move: "fly", path: [[-4.5, 1.4, 3.2], [-8, 1.4, 3.0], [-9, 2.4, 6.5]], look: [-10, 0, 0], dur: Math.max(10, machine - back) },
    { at: machine, move: "pullback", look: [-8, 0.3, 0], dir: [0.62, 0.45, 0.65], to: 15, dur: Math.max(12, end - machine) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor={false} bloom={1} dof={0} blur={1} shadowBox={12} fog={{ color: "#05070f", near: 16, far: 42 }}>
        <Camera3D keys={keys} seed="v2221-belt" />
        <Section f={f} front={0} spin={f * 0.05} see={1} fill={1} bulk={0.3} flow={0.3 + 0.7 * k01(f, go, 8) * k01(f, conveyor, 10) + 0.7 * k01(f, clay, 10)} beltLit={0.15 + 1.0 * k01(f, belt, 8)} tubes={0.2} lamps={0.8} />
        <Label3D at={[-2.0, -0.2, 0.3]} offset={[-0.3, 1.3, 0.6]} text="screw conveyor" start={conveyor} end={back} px={54} color={TECH.white} align="center" />
        <Label3D at={[-7, 0.1, 0.3]} offset={[0, 0.9, 0.4]} text="belt" sub="clay out" start={back + 4} px={56} color={TECH.cyan} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Belt;
