// Size: "Its tunnel machines were {fact1} metres long, and each one built the tunnel as it dug."
// Close on the cutterhead, then the camera pulls back along the shield ("machines"); a bracket runs the
// machine's whole length with its figure ("long", wide); the trailing gantries light one after another
// ("each"); concrete rings fill in behind the tail ("built", medium); the wheel turns and the machine
// creeps forward a step ("dug").
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Bracket3D, Camera3D, direct, Stage3D, TECH } from "../../three/index";
import { Section, k01 } from "./Parts";
import { BACK } from "./Hook";

type Params = { fig?: { length?: string } };

const Size: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const machines = m.at("machines", 8);
  const long = m.at("long", 30);
  const each = m.at("each", 44);
  const built = m.at("built", 56);
  const dug = m.at("dug", 72);
  const end = Math.max(m.end, dug + 16);
  const fig = (p.beat.params as Params).fig ?? {};
  const front = 2 + 0.3 * k01(f, dug, 14);
  const keys = direct({}, [
    { at: 0, move: "pullback", look: [2, 0, 0], dir: [0.7, 0.25, 0.67], from: 4.2, to: 6.5, dur: Math.max(8, long), fov: 42 },
    { at: long, move: "pullback", look: [-6, 0.6, 0], dir: [0.72, 0.42, 0.55], to: 21, dur: 22 },
    { at: built, move: "push", look: [-5, 0.2, 0], dir: [0.4, 0.4, 0.82], to: 11, dur: Math.max(12, end - built) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor={false} bloom={1} dof={0} blur={1} shadowBox={12} fog={{ color: "#05070f", near: 18, far: 46 }}>
        <Camera3D keys={keys} seed="v2221-size" />
        <Section f={f} front={front} spin={f * 0.05} tubes={0.3} gantries={k01(f, each, 16)} lining={46 * k01(f, built, 16)} lamps={0.8} />
        <Bracket3D from={[front, 1.4, 0]} to={[front - 18, 1.4, 0]} side={[0, 1, 0]} fig={fig.length ?? ""} caption="metres long" start={long} px={80} color={TECH.amber} />
      </Stage3D>
    </Freeze>
  );
};
export default Size;
