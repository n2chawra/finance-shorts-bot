// Parts: "Everything had to fit in one hand: a radio, an antenna, and a battery to power them."
// Above the bench, the prototype in a column of light: its shell lifts away ("Everything"); a hand's
// outline traces round the grip ("hand"); the radio boards slide out and glow ("radio", close); the
// antenna rises ("antenna"); the battery pack drops out, the biggest block ("battery"); power lines
// light from the battery up into the boards ("power", wide).
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, glow, Label3D, Stage3D, TECH } from "../../three/index";
import { BACK, Bench, HS, Handset, Insides, k01, q } from "./Models";

const Parts: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const every = m.at("everything", 2);
  const fit = m.at("fit", 10);
  const hand = m.at("hand", 18);
  const radio = m.at("radio", 30);
  const ant = m.at("antenna", 40);
  const bat = m.at("battery", 52);
  const power = m.at("power", 66);
  const end = Math.max(m.end, power + 20);
  const lift = k01(f, every, 14);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 3.6, 0], dir: [0.5, 0.18, 1], from: 13, to: 11.5, dur: Math.max(8, radio), fov: 40 },
    { at: radio, move: "push", look: [-1.4, 4.4, 0], dir: [0.3, 0.1, 1], to: 8, dur: Math.max(8, power - radio) },
    { at: power, move: "pullback", look: [-0.6, 3.6, 0], dir: [0.45, 0.25, 1], to: 13.5, dur: Math.max(12, end - power) },
  ]);
  const handK = k01(f, hand, 14);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor={false} bloom={1} dof={0} blur={1} shadowBox={8}>
        <Camera3D keys={keys} seed="v2321-parts" />
        {/* the workbench, behind and below: the prototype floats over it */}
        <Bench f={f} scale={4} position={[0, -3.1, -3.5]} lamp={2} />
        <group rotation-y={0.25 + 0.05 * Math.sin(f * 0.04)} position={[0, 0.2 + 1.4 * lift, 0]}>
          <Insides apart={lift} radio={k01(f, radio, 14)} antenna={k01(f, ant, 14)} battery={k01(f, bat, 12)} power={k01(f, power, 16)} />
          {/* the shell lifts up and fades */}
          <group position={[0, 2.5 * lift, -2 * lift]}><Handset shell={1 - lift} keys={0.3} /></group>
          {/* a hand's outline round the grip */}
          {handK > 0 && (
            <mesh position={[0, HS.h * 0.35, 0]} rotation-x={Math.PI / 2} material={glow(TECH.amber, q(0.9 * (1 - 0.5 * k01(f, radio, 12))))}>
              <torusGeometry args={[1.25, 0.05, 8, 48, Math.PI * 2 * handK]} />
            </mesh>
          )}
        </group>
        <Label3D at={[-2.1, 4.8, 0]} offset={[-0.2, 1.6, 0]} text="radio" start={radio} px={58} color={TECH.lime} align="center" />
        <Label3D at={[0.25, 8.4, -0.3]} offset={[1.0, 0.6, 0]} text="antenna" start={ant} px={58} color={TECH.cyan} align="left" />
        <Label3D at={[0.5, 1.4, 0.6]} offset={[1.4, 1.0, 0]} text="battery" start={bat} px={58} color={TECH.amber} align="left" />
      </Stage3D>
    </Freeze>
  );
};
export default Parts;
