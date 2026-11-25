// Payoff: "At its heaviest take-off, that push holds up {fact1} tonnes, all hanging on air thrown down by its two wings."
// 1) The superjumbo climbing out at dusk, seen from the side (wide). "heaviest": its gear tucks up; "take-off": a
//    line of light runs nose to tail along the fuselage; "push": air lines stream down behind the wings; "holds":
//    the figure writes onto the fuselage side; "tonnes": it lands and pulses amber (medium); "hanging": the plane
//    rides on the glowing downwash.
// 2) "thrown": cut to the hook's opening shot along the left wing on the runway, air lines pouring down off it;
//    "down": they glow; "wings": the camera settles on the first frame of the video (the loop).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, CloudDeck, direct, FigLabel3D, glow, GlowLine, Stage3D, TECH, type V3 } from "../../three/index";
import { WING_DIR, WING_LOOK, WingAir } from "./Hook";
import { CYAN, DUSK, GEAR_H, JET_L, Runway, SuperJumbo, k01, q, wingAt } from "./Parts";

type Params = { fig?: { weight?: string } };

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const heaviest = m.at("heaviest", 6);
  const takeoff = m.at("take-off", 16);
  const push = m.at("push", 28);
  const holds = m.at("holds", 36);
  const tonnes = m.at("tonnes", 66);
  const hanging = m.at("hanging", 78);
  const thrown = m.at("thrown", 100);
  const down = m.at("down", 110);
  const wings = m.at("wings", 124);
  const end = Math.max(m.end, wings + 16);
  const weight = (p.beat.params as Params).fig?.weight ?? "";
  const loop = f >= thrown;
  const rideY = 0.06 * Math.sin(f * 0.08) * k01(f, hanging, 10);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0.3, 0.4, 0.4], dir: [0.8, 0.25, 1], from: 9.0, to: 8.2, dur: Math.max(8, tonnes), fov: 38 },
    { at: tonnes, move: "push", look: [0.5, 0.6, 0.4], dir: [0.7, 0.2, 1], from: 6.6, to: 6.2, dur: Math.max(8, thrown - tonnes) },
    { at: thrown, move: "push", look: WING_LOOK, dir: WING_DIR, from: 4.8, to: 4.4, dur: Math.max(8, wings - thrown), fov: 38 },
    { at: wings, move: "push", look: WING_LOOK, dir: WING_DIR, from: 4.4, to: 4.35, dur: Math.max(8, end - wings), fov: 38 },
  ]);
  const strip = k01(f, takeoff, 18);
  const falls: V3[][] = [0.3, 0.5, 0.7].map((u, i) => {
    const a = wingAt(u);
    return Array.from({ length: 12 }, (_, j) => [a[0] - 0.5 - 0.12 * j, a[1] - 0.18 * j, a[2] + 0.02 * i]);
  });
  return (
    <Freeze frame={f}>
      {!loop && (
        <Stage3D backdrop={DUSK} floor={false} bloom={1.1} dof={0} blur={1} shadowBox={8}>
          <Camera3D keys={keys} seed="v2621-payoff" />
          <CloudDeck frame={f} y={-2.6} size={80} cover={0.7} color="#f6d3b0" shade="#5b4a63" />
          <group position={[0, rideY, 0]} rotation-z={0.12}>
            <SuperJumbo gear={f < heaviest + 10} />
            <mesh position={[0.2, 0.05, (JET_L * 0.115) / 2 + 0.01]} material={glow(TECH.amber, q(0.85 * (1 - k01(f, holds, 10) * 0.6)))}>
              <boxGeometry args={[JET_L * 0.75 * strip + 0.001, 0.03, 0.01]} />
            </mesh>
            {falls.map((pts, i) => (
              <GlowLine key={i} points={pts} color={CYAN} width={4} k={k01(f, push, 12)} opacity={0.6 + 0.4 * k01(f, hanging, 10)} dashed dash={0.16} gap={0.1} flow={-f * 0.07} />
            ))}
          </group>
          <FigLabel3D fig={weight} caption="TONNES" at={[0.6, 1.5, 0.6]} start={holds} count={Math.max(12, tonnes - holds)} px={150}
            color={Math.round(m.pulse(tonnes + 2, 10) * 10) > 4 ? "#ffffff" : TECH.amber} />
          <pointLight position={[-4, 3, 6]} intensity={30} color="#ffc48a" distance={30} />
        </Stage3D>
      )}
      {loop && (
        <Stage3D backdrop={DUSK} floor={false} bloom={1.1} dof={0} blur={1} shadowBox={8}>
          <Camera3D keys={keys} seed="v2621-payoff" />
          <Runway offset={f * 0.22} />
          <group position={[0, GEAR_H, 0]}>
            <SuperJumbo />
            <WingAir f={f} k={1} down={0.35 + 0.4 * k01(f, thrown, 10) * (1 - k01(f, wings, 14))} color={k01(f, down, 6) > 0.5 && f < wings ? "#9ff0ff" : CYAN} />
          </group>
          <pointLight position={[-6, 4, 6]} intensity={30} color="#ffc48a" distance={30} />
          <pointLight position={[4, 3, -4]} intensity={10} color="#9fb8ff" distance={20} />
        </Stage3D>
      )}
    </Freeze>
  );
};
export default Payoff;
