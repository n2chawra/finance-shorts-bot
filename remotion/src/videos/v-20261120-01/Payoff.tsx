// Payoff: "Its newer estimate for that same low lake? Just {fact4}."
// The dam at the low lake. The camera glides over the water, the white band towering above it ("newer",
// wide); the old figure on the powerhouse's roof sign greys and is struck through ("estimate"); the
// waterline glows and the camera dives to the powerhouse ("same", medium); the outlets thin ("low"); the
// new figure slams onto the sign in red and windows go dark ("Just", close); the last ones flicker out.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Block, Camera3D, direct, FigLabel3D, glow, Stage3D } from "../../three/index";
import { DamScene, LOW, k01 } from "./Parts";

type Params = { fig?: { old?: string; new?: string } };
const q = (x: number) => Math.round(x * 20) / 20;

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const newer = m.at("newer", 6);
  const est = m.at("estimate", 18);
  const same = m.at("same", 30);
  const low = m.at("low", 40);
  const just = m.at("just", 50);
  const tail = m.at("tail", 64);
  const end = Math.max(m.end, just + 40);
  const fig = (p.beat.params as Params).fig ?? {};
  const strike = k01(f, est, 10);
  const dark = k01(f, just, 6);
  const shake = 0.05 * m.pulse(just + 2, 8) * Math.sin(f * 2.3);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 1.4, -7], dir: [0.1, 0.55, 1], from: 13.5, to: 12.5, dur: Math.max(8, same), fov: 40 },
    { at: same, move: "push", look: [0.2, 1.9, 2.0], dir: [0.12, 0.3, 1], to: 7.2, dur: Math.max(8, just - same) },
    { at: just, move: "push", look: [0.2, 1.9, 2.0], dir: [0.12, 0.3, 1], to: 6.2, dur: Math.max(12, end - just) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={dark > 0.5 ? { top: "#1c0a10", bottom: "#050206", glow: "rgba(255,60,60,0.16)" } : { top: "#0b1430", bottom: "#04060c", glow: "rgba(90,160,255,0.12)" }}
        floor={false} bloom={1.1} dof={0} blur={1} shadowBox={8} fog={{ color: "#070b18", near: 18, far: 42 }}>
        <Camera3D keys={keys} seed="v2001-payoff" />
        <group position={[shake, 0, 0]}>
          <DamScene f={f} level={LOW} lights={0.55 - 0.35 * dark - 0.2 * k01(f, tail, 8)} outlets={0.6 - 0.45 * k01(f, low, 10)} />
          {/* the sign on the powerhouse roof */}
          <Block size={[2.6, 1.5, 0.12]} radius={0.04} preset="blackPlastic" position={[0.2, 1.75, 1.9]} />
          <mesh position={[0.2, 1.75, 1.97]} material={glow(dark > 0.5 ? "#5a0f12" : "#3a2a10", q(0.5 + 0.4 * m.pulse(just + 2, 10)))}><planeGeometry args={[2.5, 1.4]} /></mesh>
          {/* the waterline against the white band */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 2.72, LOW + 0.01, -12.5]} rotation-y={-s * Math.PI / 2} material={glow("#bfeaff", q(0.2 + 1.0 * m.pulse(same + 4, 12)))}>
              <planeGeometry args={[22, 0.05]} />
            </mesh>
          ))}
        </group>
        <FigLabel3D fig={fig.old ?? ""} caption="old estimate" at={[0.2, 3.0, 2.1]} start={0} count={0} px={90} color={strike > 0.5 ? "#9aa0aa" : "#ffb340"} end={just + 20} />
        {strike > 0.02 && f < just + 20 && (
          <mesh position={[0.2, 3.06, 2.4]} material={glow("#ff3b30", 1.3)}><boxGeometry args={[1.0 * strike, 0.05, 0.01]} /></mesh>
        )}
        <FigLabel3D fig={fig.new ?? ""} caption="megawatts" at={[0.2, 1.75, 2.1]} start={just} count={0} px={Math.round(140 + 30 * m.pulse(just + 2, 10))} color="#ff4d4d" />
      </Stage3D>
    </Freeze>
  );
};
export default Payoff;
