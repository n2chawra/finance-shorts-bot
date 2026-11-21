// Proof: "On December sixteenth, a weak signal came out up to {fact2} times stronger."
// The lab's instrument shelf: an oscilloscope warming up beside a desk calendar (wide). "December":
// the calendar page flips; "weak": close on the scope, a small wiggle crawls across the top trace;
// "signal": a pulse runs down the wire into the wedge beside it; "came": a tall wave bursts out on the
// lower trace; "stronger": the camera eases back (medium) and the gain counts up on the scope's plate.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, FigLabel3D, SignalPath, Stage3D, TECH } from "../../three/index";
import { Bench, Calendar, Scope, Transistor, k01 } from "./Parts";

type Params = { fig?: { gain?: string } };
const SC: [number, number, number] = [-0.2, 0.48, -0.2];

const Proof: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const dec = m.at("december", 4);
  const weak = m.at("weak", 30);
  const signal = m.at("signal", 42);
  const came = m.at("came", 54);
  const stronger = m.at("stronger", 80);
  const out = m.at("out", 62);
  const up = m.at("up", 70);
  const sixteenth = m.at("sixteenth", 14);
  const end = Math.max(m.end, stronger + 20);
  const gain = (p.beat.params as Params).fig?.gain ?? "";
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 0.6, -0.2], dir: [0.15, 0.3, 1], from: 4.8, to: 4.1, dur: Math.max(8, weak), fov: 35 },
    { at: weak, move: "push", look: [SC[0], SC[1] + 0.1, SC[2]], dir: [0.1, 0.1, 1], to: 1.7, dur: Math.max(8, came - weak) },
    { at: came, move: "push", look: [SC[0], SC[1], SC[2]], dir: [0.15, 0.12, 1], to: 1.55, dur: Math.max(8, stronger - came) },
    { at: stronger, move: "pullback", look: [0.1, 0.7, -0.2], dir: [0.2, 0.25, 1], to: 2.9, dur: Math.max(10, end - stronger) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#122a24", bottom: "#04080a", glow: "rgba(124,242,166,0.10)" }} floor={false} bloom={1.1} dof={0} blur={1} shadowBox={3}>
        <Camera3D keys={keys} seed="v2101-proof" />
        <Bench lamp={0.7} f={f} />
        <Calendar position={[-1.5, 0.42, -0.3]} rotation-x={-0.25} scale={0.8} flip={k01(f, dec, 14)} />
        <Scope position={SC} on={0.4 + 0.6 * k01(f, sixteenth, 10)} inAmp={k01(f, weak, 8)} outAmp={k01(f, came, 6) * (0.55 + 0.45 * k01(f, out, 8))} phase={-f * 0.3} />
        <Transistor position={[1.0, 0, 0.1]} scale={0.55} glowL={0.3 + 0.7 * m.pulse(signal + 8, 10)} glowR={0.3 + 0.7 * k01(f, came, 6) + 0.6 * m.pulse(out + 3, 8)} />
        <SignalPath points={[[0.2, 0.55, 0.05], [0.5, 0.45, 0.15], [0.9, 0.35, 0.15]]} start={signal} draw={10} pulses={3} speed={1.4} color={TECH.cyan} radius={0.008} />
        <SignalPath points={[[1.3, 0.3, -0.1], [0.9, 0.2, -0.3], [0.2, 0.2, -0.35]]} start={came} draw={8} pulses={4} speed={1.8} color={TECH.amber} radius={0.012} />
        <FigLabel3D fig={gain} caption="times stronger" at={[SC[0] + 0.05, SC[1] + 0.75, SC[2] + 0.3]} start={up} count={Math.max(12, stronger - up)} px={Math.round(120 + 16 * m.pulse(stronger + 14, 8))} />
      </Stage3D>
    </Freeze>
  );
};
export default Proof;
