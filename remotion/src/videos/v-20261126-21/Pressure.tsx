// Pressure: "Air speeding over the top drops in pressure, the air below presses harder, and the wing is pushed up."
// The superjumbo cruising above the clouds, a slice of its left wing lifted out and glowing (wide).
// "top": fast air lines race over the slice; "drops": a blue low-pressure glow spreads over it, a label writes on
// (medium); "pressure": it pulses; "below": an amber glow fills under it; "presses": amber arrows press up on its
// underside; "harder": they grow; "pushed": a big arrow rises out of the wing (close); "up": the plane lifts a little.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Airfoil, Camera3D, CloudDeck, direct, glow, GlowLine, Label3D, Stage3D, TECH, type V3 } from "../../three/index";
import { AMBER, Arrow, CYAN, Haze, LOWBLUE, SuperJumbo, k01, q, wingAt } from "./Parts";

const SC = 0.9; // the lifted-out slice's chord

const Pressure: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const top = m.at("top", 14);
  const drops = m.at("drops", 26);
  const pressure = m.at("pressure", 34);
  const below = m.at("below", 50);
  const presses = m.at("presses", 58);
  const harder = m.at("harder", 66);
  const pushed = m.at("pushed", 84);
  const up = m.at("up", 96);
  const end = Math.max(m.end, up + 20);
  const lift = 0.25 * k01(f, up - 4, 16);
  const w = wingAt(0.55);
  const S: V3 = [w[0], w[1] + 0.75 + lift, w[2]]; // the slice floats over its place on the wing
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 0.3, 1.0], dir: [-0.55, 0.35, 1], from: 10.5, to: 9.6, dur: Math.max(8, drops), fov: 38 },
    { at: drops, move: "push", look: S, dir: [-0.15, 0.2, 1], from: 3.6, to: 3.2, dur: Math.max(8, pushed - drops) },
    { at: pushed, move: "push", look: [S[0], S[1] + 0.2, S[2]], dir: [-0.1, 0.15, 1], from: 2.6, to: 2.3, dur: Math.max(8, end - pushed) },
  ]);
  const race: V3[][] = [0.12, 0.2, 0.3].map((h) => Array.from({ length: 20 }, (_, j) => {
    const s = j / 19;
    return [S[0] + 0.9 - s * 1.8, S[1] + h + 0.05 * Math.sin(s * Math.PI), S[2] + 0.12];
  }));
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#1d3a6e", bottom: "#6d8fb8", glow: "rgba(255,240,220,0.18)" }} floor={false} bloom={1} dof={0} blur={1} shadowBox={8}>
        <Camera3D keys={keys} seed="v2621-pressure" />
        <CloudDeck frame={f} y={-2.2} size={80} cover={0.62} color="#e9eef5" shade="#8fa3bf" />
        <group position={[0, lift, 0]}>
          <SuperJumbo gear={false} />
        </group>
        {/* the slice, joined to its place on the wing by two glowing guides */}
        <GlowLine points={[[w[0] + 0.3, w[1] + lift, w[2]], [S[0] + 0.3, S[1] - 0.05, S[2]]]} color={CYAN} width={2} opacity={0.6} k={k01(f, 0, 8)} dashed dash={0.05} gap={0.05} />
        <GlowLine points={[[w[0] - 0.3, w[1] + lift, w[2]], [S[0] - 0.3, S[1] - 0.05, S[2]]]} color={CYAN} width={2} opacity={0.6} k={k01(f, 0, 8)} dashed dash={0.05} gap={0.05} />
        <Airfoil chord={SC} span={0.24} aoa={0.08} thick={0.13} position={S} color="#eef2f7" />
        {race.map((pts, i) => (
          <GlowLine key={i} points={pts} color="#ffffff" width={4} k={k01(f, top, 10)} dashed dash={0.12} gap={0.08} flow={f * 0.09} />
        ))}
        <Haze position={[S[0], S[1] + 0.22, S[2]]} size={[0.7, 0.22, 0.25]} color={LOWBLUE} k={k01(f, drops, 12) * (1 + 0.4 * m.pulse(pressure + 2, 10))} />
        <Haze position={[S[0], S[1] - 0.2, S[2]]} size={[0.7, 0.2, 0.25]} color={AMBER} k={k01(f, below, 12)} />
        {[-0.25, 0, 0.25].map((dx, i) => (
          <group key={i} position={[S[0] + dx, S[1] - 0.5, S[2] + 0.13]}>
            <Arrow k={k01(f, presses + i * 2, 10) * (0.6 + 0.4 * k01(f, harder, 10))} len={0.42} color={AMBER} thick={0.025} />
          </group>
        ))}
        <group position={[S[0], S[1] + 0.1, S[2] + 0.13]}>
          <Arrow k={k01(f, pushed, 10)} len={1.0} color={AMBER} thick={0.045} />
        </group>
        {f >= pushed && <mesh position={[S[0], S[1], S[2]]} material={glow(AMBER, q(0.5 * m.pulse(pushed + 2, 10)))}><sphereGeometry args={[0.5, 16, 12]} /></mesh>}
        <pointLight position={[3, 6, 5]} intensity={40} color="#fff4e6" distance={30} />
        <Label3D at={[S[0], S[1] + 0.3, S[2]]} offset={[-0.4, 0.5, 0]} text="lower pressure" start={drops + 4} px={50} color="#9cc7ff" align="center" />
        <Label3D at={[S[0], S[1] - 0.3, S[2]]} offset={[0.7, -0.1, 0]} text="higher pressure" start={below + 4} px={50} color={TECH.amber} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Pressure;
