// Loop: "A new line, threaded through a city already full of Tube tunnels."
// Back in the hook's cut-open ground: the new tunnel lights along its length ("new", close); the camera
// pulls back up through the clay ("threaded", medium); the street and buildings light on top ("city");
// the old Tube tunnels glow around the new one as the camera settles on the hook's first frame ("full", wide).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Stage3D } from "../../three/index";
import { Section, k01 } from "./Parts";
import { BACK, FRONT, OPEN_DIR, OPEN_FROM, OPEN_LOOK } from "./Hook";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const nw = m.at("new", 2);
  const threaded = m.at("threaded", 14);
  const city = m.at("between", 26);
  const full = m.at("old", 40);
  const end = Math.max(m.end, full + 14);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 0, 0], dir: [0.4, 0.3, 0.87], from: 5, to: 4.4, dur: Math.max(8, threaded), fov: 42 },
    { at: threaded, move: "pullback", look: [1.5, 0.6, 0], dir: [0.5, 0.3, 0.81], to: 10, dur: Math.max(10, full - threaded) },
    { at: full, move: "pullback", look: OPEN_LOOK, dir: OPEN_DIR, to: OPEN_FROM, dur: Math.max(10, end - full) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor={false} bloom={1} dof={0} blur={1} shadowBox={10} fog={{ color: "#05070f", near: 16, far: 40 }}>
        <Camera3D keys={keys} seed="v2221-loop" />
        <Section f={f} front={FRONT} spin={f * 0.05} newLine={0.3 + 0.7 * k01(f, nw, 14)} lamps={0.25 + 0.75 * k01(f, city, 12)} tubes={1 - 0.6 * k01(f, nw, 8) + 0.6 * k01(f, full, 12)} />
      </Stage3D>
    </Freeze>
  );
};
export default Loop;
