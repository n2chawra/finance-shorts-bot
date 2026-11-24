// Loop: "Curves or triangles: which would you pick? NVIDIA learned the hard way."
// Back at the light table, the smooth dome and the triangle dome side by side (medium): "curves" the
// smooth one glows amber; "triangles" the mesh glows cyan; "which" both turn; "would"/"bet" a balance tips
// toward the triangles. "NVIDIA": cut to the dark studio, the real card swinging in under the spotlight
// and the old wordmark (the opening shot); "learned"/"answer"/"hard"/"way": it settles into frame 0.
import React from "react";
import { AbsoluteFill, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Stage3D } from "../../three/index";
import { Balance, LightTable, OldLogo, RealCard, SmoothDome, TriDome, k01 } from "./Parts";
import { StudioCard } from "./Hook";

const Loop: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const curves = m.at("curves", 2);
  const tri = m.at("triangles", 12);
  const which = m.at("which", 22);
  const would = m.at("would", 28);
  const bet = m.at("pick", 38);
  const nvidia = m.at("nvidia", 46);
  const learned = m.at("learned", 54);
  const answer = m.at("hard", 62) - 6;
  const hard = m.at("hard", 70);
  const way = m.at("way", 76);
  const end = Math.max(m.end, way + 16);
  const studio = f >= nvidia;
  const tip = k01(f, would, 10) * 0.4 + k01(f, bet, 10) * 0.6;
  const keys = studio
    ? direct({}, [{ at: nvidia, move: "push", look: [0, 1.6, 0], dir: [0.1, 0.25, 1], from: 11, to: 10, dur: Math.max(10, end - nvidia), fov: 35 }])
    : direct({}, [
        { at: 0, move: "push", look: [0, 1.6, 0], dir: [0.2, 0.45, 1], from: 12.5, to: 11.8, dur: Math.max(8, which), fov: 35 },
        { at: which, move: "orbit", center: [0, 1.6, 0], radius: 11.5, height: 6, from: 0.12, to: -0.12, dur: Math.max(8, nvidia - which) },
      ]);
  // the card comes back as at frame 0 of the hook: swinging in, settling
  const s = f - nvidia;
  const swing = 1 - k01(s, -6, 26);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#141a2e", bottom: "#04050a", glow: "rgba(255,230,190,0.10)" }} floor={studio ? "reflect" : false} bloom={1.1} dof={0} blur={1}
        overlay={studio ? (
          <AbsoluteFill>
            <OldLogo x={540} y={190} w={640} k={1} />
            <RealCard x={540} y={440} w={960} turn={-22 * swing + m.wave(90, 6)} tilt={8} k={0.75 + 0.25 * k01(s, -10, 14)} glowK={0.3 * m.pulse(hard + 3, 8)} />
          </AbsoluteFill>
        ) : undefined}>
        <Camera3D keys={keys} seed="v2521-loop" />
        {!studio && (
          <group>
            <LightTable w={8} />
            <SmoothDome r={0.9} rise={1} lit={0.3 + 0.7 * k01(f, curves, 8)} grid={0.2} position={[-1.05, 0, 0]} rotation-y={f >= which ? (f - which) * 0.02 : 0} />
            <TriDome r={0.9} detail={0.7} lit={0.2 + 0.8 * k01(f, tri, 8)} position={[1.05, 0, 0]} rotation-y={f >= which ? -(f - which) * 0.02 : 0} />
            <Balance position={[0, 0, -1.3]} size={1.7} show={k01(f, would - 4, 10)} tip={tip} />
            <pointLight position={[0, 3.5, 3]} intensity={9} color="#e8f2ff" distance={10} />
          </group>
        )}
        {studio && <StudioCard f={f} spot={m.pulse(learned + 4, 10) + 0.4 * m.pulse(answer + 3, 8)} shelf={0} flick={0} dim={0} />}
      </Stage3D>
    </Freeze>
  );
};
export default Loop;
