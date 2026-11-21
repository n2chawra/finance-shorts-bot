// Brakes: "He wound on the hand brakes. Too few of them. Did anyone check?"
// Close on the first tank car's end platform: the hand brake wheel turns ("wound"), its wheel glowing
// amber as the shoes clamp ("hand"); pull back high over the whole train on "few": only the first cars'
// brakes glow, the rest dark; HELD? types over the dark cars ("check").
import React from "react";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Focus, Label3D } from "../../three/index";
import { AMBER, CAR_LEN, Consist, Line, MONO, Shot3D, Trees, vehX } from "./World";
import { GRADE } from "./Hill";

const Brakes: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const wound = m.at("set", 4), hand = m.at("hand", 16), few = m.at("few", 40), check = m.at("check", 70);
  const wide = f >= few;
  const wheel = vehX(1) + CAR_LEN / 2 - 0.12;
  const turn = m.lerp([wound, few], [0, 9]);
  const glowK = m.lerp([hand, hand + 14], [0, 1]);
  const keys = wide
    ? direct({}, [
        { at: 0, move: "hold", pos: [3, 5.2, 8], look: [-14, 0.4, 0], fov: 44 },
        { at: few, move: "cut", pos: [3, 5.2, 8], look: [-14, 0.4, 0], fov: 44 },
        { at: few + 1, move: "push", look: [-15, 0.4, 0], dir: [0.62, 0.36, 0.7], from: 20, to: 18, dur: Math.max(10, m.end - few) },
      ])
    : direct({}, [
        { at: 0, move: "push", look: [wheel, 0.95, 0.18], dir: [0.75, 0.25, 0.6], from: 1.3, to: 1.0, dur: Math.max(10, few), fov: 42 },
      ]);
  const brakes: Record<number, number> = { 1: glowK, 2: wide ? glowK : 0 };
  return (
    <Shot3D f={f}
      overlay={wide && f >= check ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 600, textAlign: "center" }}>
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 72, letterSpacing: 6, color: AMBER, background: "rgba(8,10,14,0.74)", padding: "10px 26px" }}>
            {"HELD?".slice(0, Math.max(0, Math.floor((f - check) * 0.8)))}
          </span>
        </div>
      ) : null}>
      <Camera3D keys={keys} seed="lm-brakes" drift={wide ? 0.01 : 0.004} />
      <Focus at={wide ? [-12, 0.6, 0] : [wheel, 0.95, 0.18]} range={wide ? 10 : 0.5} />
      <group rotation-z={GRADE}>
        <Line length={90} x={-15} />
        <Trees from={-60} to={30} seed="hill-trees" />
        <Consist cars={12} travelled={0} loco={{ lamp: 1, head: 0.35 }} brakes={brakes} turn={{ 1: turn }} hot={0} />
        {!wide ? <pointLight position={[wheel + 0.6, 1.4, 0.8]} intensity={1.4} distance={3} color="#ffd2a0" /> : null}
        {wide ? <Label3D at={[vehX(1), 1.25, 0]} offset={[0.2, 1.1, 0.6]} text="HAND BRAKES SET" start={few + 6} px={50} color={AMBER} /> : null}
      </group>
    </Shot3D>
  );
};
export default Brakes;
