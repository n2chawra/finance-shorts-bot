// Press: "Two gold contacts, almost touching, pressed by a spring onto germanium. So how does that do
// anything?"
// The test stand (close on the tip): the two gold strips glow ("two"); the hairline gap flashes
// ("almost") and a bracket marks it ("touching"); pull back to medium: a bent wire spring flexes
// ("spring") and pushes the wedge down onto a grey crystal ("pressed", a thud); the germanium lights
// where the gold meets it and its label writes on ("germanium", close); a question mark pulses
// between the contacts ("how").
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, direct, FigLabel3D, glow, Label3D, Stage3D, TECH } from "../../three/index";
import { Transistor, TIP, k01 } from "./Parts";

const PressBeat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const two = m.at("two", 2);
  const almost = m.at("almost", 18);
  const touching = m.at("touching", 28);
  const spring = m.at("spring", 50);
  const pressed = m.at("pressed", 40);
  const germ = m.at("germanium", 70);
  const how = m.at("how", 100);
  const onto = m.at("onto", 60);
  const anything = m.at("anything", 120);
  const end = Math.max(m.end, how + 20);
  const down = cue(f, Math.max(pressed, spring) - 2, 12, Easing.in(Easing.quad));
  const lift = 0.35 * (1 - down);
  const tipY = TIP[1] + lift;
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, tipY + 0.05, 0], dir: [0.2, 0.2, 1], from: 1.2, to: 0.95, dur: Math.max(8, spring), fov: 35 },
    { at: spring, move: "pullback", look: [0.15, 0.55, 0], dir: [0.35, 0.35, 1], to: 2.9, dur: 16 },
    { at: germ, move: "push", look: [0.05, TIP[1] + 0.1, 0], dir: [0.3, 0.45, 1], to: 2.0, dur: Math.max(8, how - germ) },
    { at: how, move: "push", look: [0.05, TIP[1] + 0.15, 0], dir: [0.2, 0.3, 1], to: 1.7, dur: Math.max(10, end - how) },
  ]);
  const gapFlash = m.pulse(almost + 3, 10);
  const bracket = k01(f, touching, 8);
  const lit = 0.4 + 0.6 * m.pulse(two + 4, 12);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#111a30", bottom: "#04050a", glow: "rgba(56,225,255,0.10)" }} floor="reflect" bloom={1.1} dof={0} blur={1} shadowBox={2}
       >
        <Camera3D keys={keys} seed="v2101-press" />
        <spotLight position={[1.5, 3, 2]} angle={0.5} penumbra={0.7} intensity={25} color="#fff1d6" castShadow />
        <Transistor lift={lift} glowL={lit} glowR={lit} slabLit={k01(f, germ, 10) * (0.6 + 0.4 * Math.sin(f / 4))} spring={0.4 + 0.6 * down} />
        {/* the hairline gap at the tip */}
        {f >= almost && f < spring && (
          <mesh position={[0, tipY + 0.03, 0.06]} material={glow(TECH.cyan, Math.round((0.4 + 0.6 * gapFlash) * 10) / 10)}>
            <boxGeometry args={[0.006, 0.07, 0.01]} />
          </mesh>
        )}
        {bracket > 0 && f < spring && (
          <group position={[0, tipY - 0.03, 0.09]} scale={[bracket, 1, 1]}>
            <mesh material={glow(TECH.cyan, 0.9)}><boxGeometry args={[0.1, 0.004, 0.004]} /></mesh>
            {[-0.05, 0.05].map((x) => <mesh key={x} position={[x, 0.01, 0]} material={glow(TECH.cyan, 0.9)}><boxGeometry args={[0.004, 0.024, 0.004]} /></mesh>)}
          </group>
        )}
        {f >= onto && <pointLight position={[0, TIP[1] + 0.03, 0.1]} intensity={8 * m.pulse(onto + 3, 8)} distance={0.8} color="#fff1c8" />}
        <Label3D at={[-0.04, tipY + 0.05, 0.05]} offset={[-0.22, 0.14, 0]} text="contact" start={two + 2} end={spring} px={48} color={TECH.amber} />
        <Label3D at={[0.04, tipY + 0.05, 0.05]} offset={[0.22, 0.14, 0]} text="contact" start={two + 6} end={spring} px={48} color={TECH.amber} />
        <Label3D at={[0.62, 1.0, 0]} offset={[0.3, 0.3, 0]} text="spring" start={spring + 4} end={germ} px={50} color={TECH.white} />
        <Label3D at={[-0.2, 0.22, 0.2]} offset={[-0.3, -0.2, 0.2]} text="germanium" start={germ} px={52} color={TECH.amber} />
        <FigLabel3D fig="?" at={[0, TIP[1] + 0.3, 0.05]} start={how} count={0} plate={false} px={Math.round(150 + 30 * m.pulse(how + 6, 10) + 50 * k01(f, anything, 8))} />
      </Stage3D>
    </Freeze>
  );
};
export default PressBeat;
