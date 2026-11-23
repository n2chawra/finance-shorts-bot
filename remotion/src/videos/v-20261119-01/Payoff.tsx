// Payoff: "The very first one stood almost as tall as a man, weighed {fact2} pounds and cost about {fact3}."
// An old showroom floor under spotlights. The tall Radarange cabinet rolls into the light ("first",
// wide); a person's outline rises beside it, nearly as tall ("tall"); a height line draws from the
// floor to its top ("man"); it stands on a freight scale whose dial counts up the weight ("weighed",
// close on the dial); a price tag swings down from its handle, counting up the price ("cost", medium).
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Block, Camera3D, cue, direct, FigLabel3D, glow, mat, Stage3D, TECH } from "../../three/index";
import { Person, Radarange, RADARANGE_H, k01, WARM } from "./Parts";

type Params = { fig?: { weight?: string; price?: string } };
const SCALE_H = 0.12;

const Payoff: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const first = m.at("first", 6);
  const tall = m.at("tall", 30);
  const man = m.at("man", 50);
  const weighed = m.at("weighed", 70);
  const stood = m.at("stood", 18);
  const almost = m.at("almost", 26);
  const pounds = m.at("pounds", 100);
  const cost = m.at("cost", 120);
  const about = m.at("about", 130);
  const end = Math.max(m.end, cost + 30);
  const lands = m.at("lands", end - 20);
  const flash = m.pulse(lands + 4, 8);
  const tick = m.at("tick", lands - 26);
  const fig = (p.beat.params as Params).fig ?? {};
  const roll = cue(f, 0, Math.max(10, first + 20), Easing.out(Easing.cubic));
  const x = 0.5 * (1 - roll);
  const person = cue(f, tall - 2, 16, Easing.out(Easing.back(1.3)));
  const line = k01(f, man, 14);
  const swing = cue(f, cost - 2, 20, Easing.out(Easing.elastic(1)));
  const needle = -1.2 + 2.2 * k01(f, weighed, 22);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 1.0, 0], dir: [0.1, 0.25, 1], from: 7.6, to: 6.8, dur: Math.max(8, weighed), fov: 35 },
    { at: weighed, move: "push", look: [0.75, 0.55, 0.6], dir: [0.3, 0.3, 1], to: 3.4, dur: Math.max(8, cost - weighed) },
    { at: cost, move: "pullback", look: [0.1, 1.05, 0.2], dir: [0.2, 0.25, 1], to: 5.6, dur: Math.max(10, end - cost) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#1d1626", bottom: "#060509", glow: "rgba(255,184,74,0.14)" }} floor="reflect" bloom={1} dof={0} blur={1} shadowBox={4}>
        <Camera3D keys={keys} seed="v1901-payoff" />
        {/* spotlights from above */}
        {[-1.6, 0, 1.6].map((sx) => (
          <mesh key={sx} position={[sx, 3.2, -0.4]} material={glow(WARM, Math.round((0.08 + 0.12 * flash) * 100) / 100)} rotation-x={0.1}>
            <coneGeometry args={[0.9, 3.2, 32, 1, true]} />
          </mesh>
        ))}
        <spotLight position={[0, 4.5, 2]} angle={0.5} penumbra={0.6} intensity={30} color="#fff1d6" castShadow />
        {/* the freight scale and the cabinet on it */}
        <group position={[x, 0, 0]}>
          <Block size={[1.2, SCALE_H, 1.0]} radius={0.02} preset="brushed" color="#6d737e" position={[0, SCALE_H / 2, 0]} />
          <Radarange position={[0, SCALE_H - 0.03 * m.pulse(pounds + 3, 6), 0]} on={0.2 + 0.6 * k01(f, stood, 8)} plate={f * 0.05} />
          {/* the dial on its post */}
          <group position={[0.75, 0, 0.55]}>
            <mesh position={[0, 0.3, 0]} material={mat("brushed", "#555b66")}><cylinderGeometry args={[0.03, 0.03, 0.6, 8]} /></mesh>
            <mesh position={[0, 0.62, 0]} rotation-x={Math.PI / 2} material={mat("white", "#f0ece2")}><cylinderGeometry args={[0.2, 0.2, 0.04, 36]} /></mesh>
            <mesh position={[0, 0.62, 0.03]} rotation-z={-needle} material={glow("#ff4d3d", 1)}><boxGeometry args={[0.015, 0.17, 0.01]} /></mesh>
          </group>
          {/* the price tag swinging from the handle */}
          {swing > 0 && (
            <group position={[0.25, SCALE_H + RADARANGE_H - 0.1, 0.42]} rotation-z={(1 - swing) * 1.4 + 0.25 * Math.sin((f - tick) / 3) * m.pulse(tick + 6, 10)}>
              <mesh position={[0, -0.15, 0]} material={mat("white", "#e9e2cf")}><cylinderGeometry args={[0.004, 0.004, 0.3, 6]} /></mesh>
              <mesh position={[0, -0.38, 0]} material={mat("clay", "#f6edd2")}><boxGeometry args={[0.3, 0.18, 0.01]} /></mesh>
            </group>
          )}
        </group>
        {/* the cabinet's top edge, lit on "almost" */}
        {f >= almost && <mesh position={[x, SCALE_H + RADARANGE_H + 0.01, 0]} material={glow(TECH.cyan, Math.round((0.5 + 0.4 * m.pulse(almost + 4, 8)) * 10) / 10)}><boxGeometry args={[0.95, 0.02, 0.8]} /></mesh>}
        {/* the person beside it, at true height */}
        {person > 0 && <Person position={[-1.0, 0, 0.1]} scale={[1, person, 1]} />}
        {/* the height line from the floor to the cabinet's top */}
        {line > 0 && (
          <mesh position={[-0.55, (SCALE_H + RADARANGE_H) * line / 2, 0.45]} material={glow(TECH.cyan, 0.9)}>
            <boxGeometry args={[0.02, (SCALE_H + RADARANGE_H) * line, 0.02]} />
          </mesh>
        )}
        {line > 0.95 && (
          <mesh position={[-0.55, SCALE_H + RADARANGE_H, 0.45]} material={glow(TECH.cyan, 0.9)}><boxGeometry args={[0.3, 0.02, 0.02]} /></mesh>
        )}
        <FigLabel3D fig={fig.weight ?? ""} caption="pounds" at={[x + 0.75, 1.0, 0.6]} start={weighed} count={20} px={110} />
        <FigLabel3D fig={fig.price ?? ""} caption="to buy one" at={[x + 0.25, 2.2, 0.45]} start={about} count={20} px={Math.round(110 + 20 * flash)} />
      </Stage3D>
    </Freeze>
  );
};
export default Payoff;
