// Loop: "Today that same tube hums in your kitchen, all thanks to one melted candy bar."
// Back in the dark kitchen. The tall Radarange shrinks into today's microwave on the counter ("Today",
// wide); the microwave turns see-through and its small magnetron glows inside ("tube", close); the
// kitchen lights come up around it, the plate turning ("kitchen"); a candy bar slides onto the counter
// and starts to sag ("melted"); the camera settles on the hook's opening shot, bar in front of the
// oven ("bar"), so the Short runs straight back into its first frame.
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, direct, Stage3D } from "../../three/index";
import { CandyBar, Kitchen, Microwave, Radarange, WaveRings, k01 } from "./Parts";
import { BAR_AT, OPEN_DIR, OPEN_LOOK, OVEN_AT } from "./Hook";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const today = m.at("today", 4);
  const tube = m.at("tube", 24);
  const kitchen = m.at("kitchen", 46);
  const melted = m.at("melted", 80);
  const bar = m.at("bar", 100);
  const hums = m.at("hums", 34);
  const thanks = m.at("thanks", 64);
  const candy = m.at("candy", 92);
  const end = Math.max(m.end, bar + 20);
  const morph = cue(f, today, 20, Easing.inOut(Easing.cubic));
  const xr = k01(f, tube, 10) * (1 - k01(f, melted, 14));
  const slide = cue(f, melted - 8, 14, Easing.out(Easing.cubic));
  const keys = direct({}, [
    { at: 0, move: "push", look: [0.1, 0.7, -0.3], dir: [0.15, 0.4, 1], from: 6.4, to: 5.6, dur: Math.max(8, tube), fov: 35 },
    { at: tube, move: "push", look: [0.45, 0.4, -0.4], dir: [0.3, 0.45, 1], to: 2.6, dur: Math.max(8, kitchen - tube) },
    { at: kitchen, move: "pullback", look: [0.1, 0.4, -0.2], dir: [0.2, 0.45, 1], to: 4.4, dur: Math.max(8, bar - kitchen) },
    { at: bar, move: "push", look: OPEN_LOOK, dir: OPEN_DIR, to: 4.6, dur: Math.max(8, end - bar) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#0d1430", bottom: "#05060c", glow: "rgba(255,184,74,0.12)" }} floor={false} bloom={1} dof={0} blur={1} shadowBox={4}>
        <Camera3D keys={keys} seed="v1901-loop" />
        <Kitchen lights={0.2 + 0.6 * k01(f, kitchen, 14) * (1 - k01(f, bar, 16))} />
        {morph < 0.98 && <Radarange position={OVEN_AT} scale={1 - 0.9 * morph} on={0.6} />}
        {morph > 0.02 && <Microwave position={OVEN_AT} scale={morph} on={0.7 + 0.3 * k01(f, thanks, 8) + 0.05 * Math.sin(f / 3)} plate={f * 0.05} xray={xr} />}
        {xr > 0.05 && <WaveRings f={f} start={hums} every={7} reach={0.5} position={[OVEN_AT[0] + 0.55 * 1, 0.3 + 0.32, OVEN_AT[2] - 0.15]} stop={melted} />}
        {f >= candy && <pointLight position={[BAR_AT[0], 0.6, BAR_AT[2] + 0.6]} intensity={3 * m.pulse(candy + 5, 10)} color="#ff6a5a" distance={2} />}
        {slide > 0 && <CandyBar position={[BAR_AT[0] - 2.5 * (1 - slide), 0, BAR_AT[2]]} rotation-y={0.25} melt={0.08 * k01(f, melted, 30)} f={f} />}
      </Stage3D>
    </Freeze>
  );
};
export default Loop;
