// Loop: "All of that, for a phone that fit in one hand."
// Back on the studio stage: the rail's light flows into the handset's keypad ("All", close); it turns on
// its plinth ("that"); the camera pulls back past the modern phone, its screen glowing ("phone",
// medium); a hand's outline traces round the grip ("fit"); the wide first-frame shot of the hook, the
// screen dimming and the handset turned as the hook opens ("hand", wide).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, glow, Stage3D, TECH } from "../../three/index";
import { HX, OPEN_DIR, OPEN_DIST, OPEN_LOOK, StudioSet } from "./Hook";
import { BACK, HS, k01, q } from "./Models";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const all = m.at("all", 2);
  const that = m.at("that", 10);
  const phone = m.at("phone", 20);
  const fit = m.at("fit", 28);
  const hand = m.at("hand", 38);
  const end = Math.max(m.end, hand + 14);
  const keys = direct({}, [
    { at: 0, move: "push", look: [HX, 2.4, 0.9], dir: [0.12, 0.1, 1], from: 4.6, to: 4.4, dur: Math.max(8, phone), fov: 40 },
    { at: phone, move: "pullback", look: [0.2, 2.4, 0], dir: [0.28, 0.2, 1], to: 10, dur: Math.max(8, hand - phone) },
    { at: hand, move: "pullback", look: OPEN_LOOK, dir: OPEN_DIR, to: OPEN_DIST, dur: Math.max(8, end - hand - 2), fov: 40 },
  ]);
  const handK = k01(f, fit, 12) * (1 - k01(f, end - 10, 8));
  const turn = -0.5 * k01(f, that, Math.max(10, end - that - 2));
  const glowS = k01(f, phone, 10) * (1 - k01(f, end - 12, 10));
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor="reflect" bloom={1} dof={0} blur={1} shadowBox={8}>
        <Camera3D keys={keys} seed="v2321-loop" />
        <StudioSet f={f} turn={turn} phone={glowS} keys={1 - k01(f, all, Math.max(10, end - all))} mark={0.3 + 0.7 * (1 - k01(f, end - 12, 10))} />
        {handK > 0 && (
          <mesh position={[HX, 0.3 + HS.h * 0.35, 0]} rotation-x={Math.PI / 2} material={glow(TECH.amber, q(0.9))}>
            <torusGeometry args={[1.25, 0.05, 8, 48, Math.PI * 2 * handK]} />
          </mesh>
        )}
      </Stage3D>
    </Freeze>
  );
};
export default Loop;
