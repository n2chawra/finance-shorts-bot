// Loop: "All from gold foil on a plastic wedge: the switch now inside every chip in your phone."
// Close on the 1947 wedge standing small and glowing ("gold"); it sinks into a chip's open package
// ("plastic"); pull back: the chip sits on a phone's board on the dark desk ("now", medium); the
// screen slides back over it ("every"); the camera settles on the hook's opening shot ("phone"), so
// the Short runs straight back into its first frame.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Stage3D } from "../../three/index";
import { CHIP_AT, Desk, OpenPhone, Wedge, k01 } from "./Parts";
import { OPEN_DIR, OPEN_LOOK } from "./TxHook";

const TxLoop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const gold = m.at("gold", 4);
  const plastic = m.at("plastic", 24);
  const now = m.at("now", 50);
  const every = m.at("every", 70);
  const phone = m.at("phone", 90);
  const inside = m.at("inside", 80);
  const sw = m.at("switch", 40);
  const end = Math.max(m.end, phone + 20);
  const sink = k01(f, sw, 16);
  const W: [number, number, number] = [CHIP_AT[0], CHIP_AT[1] + 0.1 + 0.2 * (1 - sink), CHIP_AT[2]];
  const keys = direct({}, [
    { at: 0, move: "push", look: [CHIP_AT[0], CHIP_AT[1] + 0.22, CHIP_AT[2]], dir: [0.25, 0.4, 1], from: 1.7, to: 1.45, dur: Math.max(8, now), fov: 35 },
    { at: now, move: "pullback", look: [0, 0.1, -0.3], dir: [0.1, 1, 0.6], to: 3.0, dur: Math.max(8, phone - now) },
    { at: phone, move: "push", look: OPEN_LOOK, dir: OPEN_DIR, to: 5.6, dur: Math.max(8, end - phone) },
  ]);
  const close = 1 - k01(f, every, 20);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop="void" floor={false} bloom={1.1} dof={0} blur={1} shadowBox={4}>
        <Camera3D keys={keys} seed="v2101-loop" />
        <Desk />
        <OpenPhone open={close} lid={1} lit={0.6 + 0.4 * k01(f, sw + 10, 10) + 0.4 * m.pulse(inside + 3, 10)} rotation-y={0.15} />
        {sink < 0.98 && (
          <group rotation-y={0.15}>
            <Wedge position={W} rotation-y={0.6 * k01(f, plastic, 20)} scale={0.4 * (1 - 0.8 * sink)} lit={0.6 + 0.4 * m.pulse(gold + 4, 10) + 0.6 * m.pulse(sw + 3, 8)} />
          </group>
        )}
      </Stage3D>
    </Freeze>
  );
};
export default TxLoop;
