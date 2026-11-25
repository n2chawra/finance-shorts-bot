// Angle: "It meets the air tilted up a little, and it turns the whole stream of air downward behind it."
// Back in the wind tunnel (medium). "meets": the streamlines run flat into the level wing slice; "tilted": it tilts
// nose-up on its mount, an angle arc draws on; "little": the arc glows; "turns": the lines bend, up ahead of the
// wing and down behind it (wide); "whole": the far lines bend too and brighten; "stream": the flow glows; "downward":
// a big amber arrow points down out of the back edge; "behind": close on the air pouring off the back edge.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, foilSurface, GlowLine, Label3D, Stage3D, TECH, type V3 } from "../../three/index";
import { Flow, tunnelLines } from "./Bust";
import { AMBER, Arrow, CHORD, TunnelSection, k01 } from "./Parts";

const Angle: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const tilted = m.at("tilted", 14);
  const little = m.at("little", 26);
  const turns = m.at("turns", 44);
  const whole = m.at("whole", 56);
  const stream = m.at("stream", 64);
  const downward = m.at("downward", 80);
  const behind = m.at("behind", 92);
  const end = Math.max(m.end, behind + 20);
  const aoa = 0.2 * k01(f, tilted - 2, 16);
  const bend = k01(f, turns, 16);
  const lines = tunnelLines(Math.round(aoa * 100) / 100, Math.round(bend * 2.2 * 20) / 20);
  const le = foilSurface(0, true, aoa, { chord: CHORD });
  const te = foilSurface(1, true, aoa, { chord: CHORD });
  const arc: V3[] = Array.from({ length: 13 }, (_, i) => {
    const a = (i / 12) * aoa;
    return [te[0] - 2.2 * Math.cos(a), te[1] + 2.2 * Math.sin(a), 0.85];
  });
  const keys = direct({}, [
    { at: 0, move: "push", look: [-0.2, 0.2, 0], dir: [0.1, 0.1, 1], from: 6.0, to: 5.4, dur: Math.max(8, turns), fov: 38 },
    { at: turns, move: "pullback", look: [0.6, 0, 0], dir: [0.1, 0.1, 1], from: 8.0, to: 9.4, dur: Math.max(8, behind - turns) },
    { at: behind, move: "push", look: [te[0] + 0.9, te[1] - 0.4, 0.5], dir: [0.15, 0.05, 1], from: 4.0, to: 3.4, dur: Math.max(8, end - behind) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#0c1424", bottom: "#030409", glow: "rgba(255,179,64,0.08)" }} floor={false} bloom={1.2} dof={0} blur={1} shadowBox={5}>
        <Camera3D keys={keys} seed="v2621-angle" />
        <TunnelSection f={f} aoa={aoa} lit={k01(f, stream, 10)} />
        <Flow lines={lines} f={f} bright={0.55 + 0.35 * k01(f, whole, 10) + 0.15 * m.pulse(stream + 2, 10)} />
        {/* the level reference and the tilt */}
        <GlowLine points={[[te[0] - 2.4, te[1], 0.85], [te[0] + 0.2, te[1], 0.85]]} color="#c9d3e6" width={3} k={k01(f, tilted, 10)} opacity={0.7} dashed dash={0.1} gap={0.08} />
        <GlowLine points={arc} color={AMBER} width={k01(f, little, 6) > 0.5 ? 8 : 5} k={k01(f, tilted + 4, 12)} />
        <group position={[te[0] + 0.5, te[1] - 0.1, 0.9]} rotation-z={-Math.PI * 0.82}>
          <Arrow k={k01(f, downward, 10)} len={1.1} color={AMBER} thick={0.055} />
        </group>
        <Label3D at={[le[0], le[1], 0.85]} offset={[-0.3, 0.7, 0]} text="tilted up" start={tilted + 6} px={54} color={TECH.amber} align="center" />
        <Label3D at={[te[0] + 1.4, te[1] - 1.0, 0.9]} offset={[0.2, -0.5, 0]} text="air turned down" start={downward + 4} px={54} color={TECH.amber} align="center" />
        <Label3D at={[-3, 1.6, 0.8]} offset={[0, 0.2, 0]} text="illustration" start={2} end={turns} px={46} color="#c9d3e6" align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Angle;
