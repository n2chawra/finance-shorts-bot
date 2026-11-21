// Ask: "The transistor. What did the very first one look like?"
// Deep in the chip: a field of tiny switches, one glowing amber, a label writes on ("transistor",
// extreme); the field dims around it ("what"); a question mark of light rises over it ("first",
// close); the camera pulls back while it pulses ("look", medium).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, FigLabel3D, InstancedField, Label3D, Stage3D, TECH } from "../../three/index";
import { k01 } from "./Parts";

const COLS = 21;
const PICK = Math.floor((COLS * COLS) / 2);

const Ask: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const tr = m.at("transistor", 2);
  const what = m.at("what", 24);
  const first = m.at("first", 50);
  const look = m.at("look", 66);
  const end = Math.max(m.end, look + 20);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 0.05, 0], dir: [0.3, 0.9, 1.0], from: 1.3, to: 1.05, dur: Math.max(8, first), fov: 35 },
    { at: first, move: "push", look: [0, 0.25, 0], dir: [0.25, 0.6, 1], to: 1.4, dur: Math.max(8, look - first) },
    { at: look, move: "pullback", look: [0, 0.2, 0], dir: [0.2, 1, 0.8], to: 2.7, dur: Math.max(10, end - look) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop="void" floor={false} bloom={1.2} dof={0} blur={1} shadowBox={3}>
        <Camera3D keys={keys} seed="v2101-ask" />
        <InstancedField cols={COLS} rows={COLS} spacing={0.22} start={-20} reveal={10} wave={k01(f, what, 4) > 0.5 ? 0 : 14}
          pick={[PICK]} color={f >= what ? "#262b45" : "#4a5785"} seed="v2101-ask" />
        <pointLight position={[0, 0.6, 0]} intensity={4 + 6 * k01(f, what, 10)} distance={2.5} color={TECH.amber} />
        <Label3D at={[0, 0.12, 0]} offset={[0.35, 0.3, 0]} text="transistor" sub="a tiny switch" start={tr} end={first} px={56} color={TECH.amber} />
        <FigLabel3D fig="?" at={[0, 0.5, 0]} start={first} count={0} plate={false} px={Math.round(190 + 30 * m.pulse(look + 4, 10))} />
      </Stage3D>
    </Freeze>
  );
};
export default Ask;
