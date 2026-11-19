// Peak: "Historically, it made up to {fact1} megawatts. So how does water make power?"
// The powerhouse roof at the dam's foot. Wide over the roof ("Historically"); the generator domes light
// one by one ("generators"); the sign on the transformer deck lights ("reached") and counts up ("up");
// all flash ("megawatts"); the camera rises up the dam ("So", "falling"); white water bursts from the
// outlets ("water"); sparks race up the cable to the rim and along the power line ("electricity").
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion, SourceLine } from "../../flat/kit";
import { Block, Camera3D, direct, FigLabel3D, glow, Stage3D } from "../../three/index";
import { DamScene, PowerLine, WARM, k01 } from "./Parts";

type Params = { fig?: { peak?: string } };
const q = (x: number) => Math.round(x * 20) / 20;

const Peak: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const gens = m.at("made", 14);
  const reached = m.at("up", 26);
  const up = m.at("up", 42);
  const mid = m.at("mid", 56);
  const mw = m.at("megawatts", 70);
  const so = m.at("so", 80);
    const water = m.at("water", 104);
  const elec = m.at("power", 116);
  const end = Math.max(m.end, elec + 24);
  const fig = (p.beat.params as Params).fig ?? {};
  const flash = m.pulse(mw + 2, 8);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 0.9, 2.0], dir: [0.25, 0.9, 1], from: 9.5, to: 8, dur: Math.max(8, reached), fov: 40 },
    { at: reached, move: "push", look: [0.9, 1.6, 2.6], dir: [0.15, 0.25, 1], to: 5.2, dur: Math.max(8, so - reached) },
    { at: so, move: "pullback", look: [0.4, 2.6, 0.5], dir: [0.15, 0.35, 1], to: 11.5, dur: Math.max(12, elec - so) },
    { at: elec, move: "push", look: [1.6, 3.6, 0.5], dir: [0.15, 0.35, 1], to: 10.5, dur: Math.max(10, end - elec) },
  ]);
  const cable = k01(f, elec, 14);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#0b1430", bottom: "#04060c", glow: "rgba(255,196,107,0.10)" }} floor={false} bloom={1} dof={0} blur={1} shadowBox={8}
        fog={{ color: "#070b18", near: 16, far: 40 }} overlay={<SourceLine p={p} />}>
        <Camera3D keys={keys} seed="v2001-peak" />
        <DamScene f={f} outlets={0.25 + 1.0 * k01(f, water - 2, 10)} lights={1} />
        {/* generator domes on the roof, lit in order */}
        {Array.from({ length: 8 }, (_, i) => {
          const on = k01(f, gens + i * 3, 6);
          return (
            <mesh key={i} position={[-1.95 + i * 0.56, 1.02, 1.9]} material={glow(WARM, q(0.15 + 1.1 * on + 0.6 * flash))}>
              <sphereGeometry args={[0.16, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
          );
        })}
        {/* the transformer deck and its sign */}
        <Block size={[1.2, 0.5, 0.6]} radius={0.03} preset="brushed" color="#596270" position={[0.9, 1.2 + 0.02 * m.pulse(mid + 2, 6), 2.6]} />
        {f >= mid && Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} position={[0.5 + 0.16 * i, 1.5 + 0.1 * Math.sin(f / 2 + i * 2), 2.92]} material={glow("#bfe9ff", q(1.4 * (0.5 + 0.5 * Math.sin(f / 1.5 + i))))}>
            <sphereGeometry args={[0.03, 6, 4]} />
          </mesh>
        ))}
        <FigLabel3D fig={fig.peak ?? ""} caption="megawatts at most" at={[0.9, 1.95, 2.7]} start={up} count={22} px={Math.round(120 + 16 * flash)} />
        {/* the cable up the canyon wall and the line along the rim */}
        <mesh position={[2.72, 3.6, 2.6]} material={glow("#ffe08a", q(0.1 + 1.2 * cable))}><boxGeometry args={[0.04, 5.6 * Math.max(0.02, cable), 0.04]} /></mesh>
        <PowerLine a={[3.6, 6.5, 2.6]} b={[3.6, 6.5, -8]} n={4} k={k01(f, elec + 8, 16)} f={f} h={1.6} />
      </Stage3D>
    </Freeze>
  );
};
export default Peak;
