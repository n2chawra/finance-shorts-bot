// Ring: "At the back, an arm bolts curved concrete pieces into a ring, lining the tunnel as it goes."
// Behind the shield, looking forward at the tail: the camera reaches it ("back", medium); the yellow
// erector arm swings up ("arm", close) carrying a curved concrete piece ("curved"); it clicks in with a
// flash ("bolts"); the last pieces close the ring ("ring"); pull back down the tunnel, ring after ring
// lining it ("lining", wide); the newest ring glows ("goes").
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Label3D, Stage3D, TECH } from "../../three/index";
import { Section, TAIL, k01 } from "./Parts";
import { BACK } from "./Hook";

const Ring: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const back = m.at("back", 4);
  const arm = m.at("arm", 14);
  const curved = m.at("concrete", 24);
  const bolts = m.at("bolts", 34);
  const ring = m.at("ring", 46);
  const lining = m.at("lining", 56);
  const goes = m.at("lining", 60) + 12;
  const end = Math.max(m.end, goes + 16);
  const pieces = 3 + k01(f, bolts, 4) + 2 * k01(f, ring, 10);
  const swing = -0.4 + 2.2 * k01(f, arm, 14) - 0.9 * k01(f, bolts + 4, 10) + 1.6 * k01(f, ring, 10);
  const tail = TAIL;
  const keys = direct({}, [
    { at: 0, move: "push", look: [tail, 0.2, 0], dir: [-0.45, 0.3, 0.84], from: 6.4, to: 5.8, dur: Math.max(8, arm), fov: 42 },
    { at: arm, move: "push", look: [tail, 0.5, 0.2], dir: [-0.4, 0.3, 0.87], to: 4.4, dur: Math.max(10, lining - arm) },
    { at: lining, move: "pullback", look: [tail - 4, 0.2, 0], dir: [-0.35, 0.45, 0.82], to: 11, dur: Math.max(12, end - lining) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor={false} bloom={1} dof={0} blur={1} shadowBox={10} fog={{ color: "#05070f", near: 14, far: 40 }}>
        <Camera3D keys={keys} seed="v2221-ring" />
        <Section f={f} front={0} spin={f * 0.05} see={1} fill={1} flow={0.6} beltLit={0.6} arm={swing} holding={f < bolts}
          rings={pieces} ringLit={0.15 + 1.2 * m.pulse(bolts + 2, 10) + 1.0 * k01(f, goes, 8)} tubes={0.2} lamps={0.8} />
        <Label3D at={[tail + 0.3, 0.5, 0.2]} offset={[0.3, 1.1, 0.5]} text="erector arm" start={arm + 2} end={lining} px={56} color={TECH.white} align="center" />
        <Label3D at={[tail - 3, 0.9, -0.3]} offset={[-0.2, 1.0, 0.6]} text="concrete rings" start={lining + 2} px={56} color={TECH.cyan} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Ring;
