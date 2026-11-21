// Switch: "Why does it matter? The same trick is a switch: a small signal turns a big current on or off."
// A dark bench, the transistor wired to a bulb and a toggle (medium). "why": the camera swings round to
// the dark bulb; "matter": its filament glints; "same": the contacts glow; "trick": the bulb flickers;
// "switch": close on the toggle, it clicks; "small": a small pulse runs to the contact; "big": the big
// current runs to the bulb; "on": it blazes; "off": the pulse stops and the bulb goes dark (wide).
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Block, Camera3D, cue, direct, Label3D, mat, SignalPath, Stage3D, TECH } from "../../three/index";
import { Bulb, Transistor, k01 } from "./Parts";

const BULB: [number, number, number] = [1.05, 0, -0.1];
const TOG: [number, number, number] = [-0.95, 0, 0.3];

const Switch: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const why = m.at("why", 2);
  const matter = m.at("matter", 12);
  const same = m.at("same", 22);
  const trick = m.at("trick", 30);
  const sw = m.at("switch", 40);
  const small = m.at("small", 55);
  const big = m.at("big", 70);
  const on = m.at("on", 85);
  const off = m.at("off", 95);
  const end = Math.max(m.end, off + 20);
  const keys = direct({}, [
    { at: 0, move: "orbit", center: [0.3, 0.4, 0], radius: 2.4, height: 1.0, from: -0.6, to: 0.1, dur: Math.max(10, sw) },
    { at: sw, move: "push", look: [TOG[0], 0.15, TOG[2]], dir: [-0.2, 0.5, 1], to: 1.4, dur: Math.max(8, big - sw) },
    { at: big, move: "push", look: [BULB[0], 0.45, BULB[2]], dir: [0.3, 0.3, 1], to: 1.8, dur: Math.max(8, off - big) },
    { at: off, move: "pullback", look: [0.1, 0.45, 0], dir: [0.1, 0.35, 1], to: 3.0, dur: Math.max(10, end - off) },
  ]);
  const flick = f >= trick && f < trick + 14 ? (Math.floor(f / 3) % 2) * 0.4 : 0;
  const lit = Math.max(flick, k01(f, on, 4) * (1 - k01(f, off, 4)));
  const click = cue(f, sw, 6, Easing.out(Easing.back(2))) * (1 - cue(f, off, 6));
  const pulseOn = f >= small && f < off;
  return (
    <Freeze frame={f}>
      <Stage3D backdrop="void" floor="reflect" bloom={1.2} dof={0} blur={1} shadowBox={3}>
        <Camera3D keys={keys} seed="v2101-switch" />
        <spotLight position={[0, 3, 2]} angle={0.6} penumbra={0.7} intensity={14 + 10 * k01(f, why, 10)} color="#cfe2ff" castShadow />
        <Transistor scale={1.0} glowL={0.2 + 0.8 * Math.max(k01(f, same, 6) * (1 - k01(f, sw, 10)), pulseOn ? 1 : 0)} glowR={lit} />
        <Bulb position={BULB} scale={1.5} on={lit + 0.15 * m.pulse(matter + 3, 8)} />
        {/* the toggle in the signal wire */}
        <group position={TOG} scale={1.6}>
          <Block size={[0.4, 0.1, 0.3]} radius={0.02} preset="blackPlastic" color="#2a2e36" position={[0, 0.05, 0]} />
          <mesh position={[0, 0.15, 0]} rotation-z={0.5 - 1.0 * click} material={mat("brushed")}><cylinderGeometry args={[0.02, 0.02, 0.22, 8]} /></mesh>
        </group>
        <SignalPath points={[[TOG[0], 0.12, TOG[2]], [-0.8, 0.3, 0.2], [-0.45, 0.45, 0.05]]} start={small} draw={6} pulses={2} speed={1.2} color={TECH.cyan} radius={0.008} end={off} />
        <SignalPath points={[[0.4, 0.4, -0.1], [0.9, 0.3, -0.1], [BULB[0], 0.15, BULB[2]]]} start={big} draw={8} pulses={5} speed={2} color={TECH.amber} radius={0.016} end={off} />
        <Label3D at={[BULB[0], 0.9, BULB[2]]} offset={[0, 0.4, 0]} text={f >= off ? "off" : "on"} start={on} px={64} color={TECH.amber} align="center" />
        <Label3D at={[TOG[0], 0.3, TOG[2]]} offset={[-0.1, 0.45, 0]} text="small signal" start={small} end={big + 10} px={50} color={TECH.cyan} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Switch;
