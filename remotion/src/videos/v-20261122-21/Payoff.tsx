// Payoff: "The new tunnel passed over it with just {fact4} millimetres to spare."
// Under Tottenham Court Road, side-on: the new machine slides in above the Northern line ("new",
// medium); the camera tracks beside it ("passed"); close on the band of clay between them ("over"); a
// bracket spans the gap ("just"); its figure slams on in amber, the frame shakes once ("spare", extreme).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Bracket3D, Camera3D, direct, glow, Stage3D, TECH } from "../../three/index";
import { k01, q } from "./Parts";
import { GAP, NR, Station } from "./Station";
import { BACK } from "./Hook";

type Params = { fig?: { gap?: string } };

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const nw = m.at("new", 2);
  const passed = m.at("passed", 12);
  const over = m.at("over", 20);
  const just = m.at("just", 28);
  const spare = m.at("spare", 52);
  const end = Math.max(m.end, spare + 30);
  const fig = (p.beat.params as Params).fig ?? {};
  const front = -0.4 + 2.6 * k01(f, nw, Math.max(20, spare - nw));
  const shake = 0.04 * m.pulse(spare + 2, 8) * Math.sin(f * 2.3);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 1.0, 0], dir: [0.2, 0.12, 1], from: 7.6, to: 6.8, dur: Math.max(8, over), fov: 42 },
    { at: over, move: "push", look: [0.3, NR + GAP / 2, 0.8], dir: [0.15, 0.08, 1], to: 5.4, dur: Math.max(8, spare - over) },
    { at: spare, move: "push", look: [0.3, NR + GAP / 2, 1.0], dir: [0.12, 0.05, 1], to: 4.8, dur: Math.max(12, end - spare) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor={false} bloom={1.1} dof={0} blur={1} shadowBox={8} fog={{ color: "#05070f", near: 14, far: 38 }}>
        <Camera3D keys={keys} seed="v2221-payoff" />
        <group position={[shake, 0, 0]}>
          <Station f={f} front={front} northern={1} spin={f * 0.05} />
          {/* the band of clay between the tunnels, lit on "over" */}
          <mesh position={[0.3, NR + GAP / 2, 1.0]} material={glow(TECH.amber, q(0.04 + 0.22 * k01(f, over, 8)))}>
            <planeGeometry args={[3.2, GAP * 0.9]} />
          </mesh>
        </group>
        <Bracket3D from={[1.3, NR, 1.1]} to={[1.3, NR + GAP, 1.1]} side={[1, 0, 0]} fig={k01(f, spare, 2) > 0.5 ? (fig.gap ?? "") : ""} caption="millimetres" start={just} px={Math.round(120 + 30 * m.pulse(spare + 2, 10))} color={TECH.amber} />
      </Stage3D>
    </Freeze>
  );
};
export default Payoff;
