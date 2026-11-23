// Checked: "Over {fact5} buildings, railways and pipes were checked for movement. And at Tottenham Court
// Road, the Northern line was already there."
// The street above the line at night (wide): sensor dots light on the buildings ("buildings"), the rail
// lines on the street ("railways") and the pipes under it ("pipes"); a monitoring screen over the street
// counts up the figure ("checked", medium) and its needle trembles, then holds ("movement"). Cut down
// into the ground under Tottenham Court Road ("Tottenham", close on the platform tunnels); the Northern
// line's tunnel glows, a train sliding through ("Northern"); the new machine arrives just above ("already").
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Block, Camera3D, direct, FigLabel3D, glow, Label3D, mat, rnd, Stage3D, TECH } from "../../three/index";
import { Ground, Street, SURFACE, k01, q } from "./Parts";
import { NEW_Y, Station } from "./Station";
import { BACK } from "./Hook";

type Params = { fig?: { assets?: string } };

const Checked: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const buildings = m.at("buildings", 14);
  const railways = m.at("rails", 24);
  const pipes = m.at("pipes", 34);
  const checked = m.at("checked", 44);
  const movement = m.at("movement", 56);
  const tott = m.at("tottenham", 76);
  const northern = m.at("northern", 96);
  const already = m.at("already", 112);
  const end = Math.max(m.end, already + 20);
  const fig = (p.beat.params as Params).fig ?? {};
  const under = f >= tott;
  const sensors = k01(f, buildings, 10);
  const needle = 0.5 * Math.sin(f * 1.3) * (1 - k01(f, movement + 8, 10)) * k01(f, checked, 6);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, SURFACE + 1.4, 0], dir: [0.2, 0.3, 1], from: 13, to: 12, dur: Math.max(8, checked), fov: 42 },
    { at: checked, move: "push", look: [1.2, SURFACE + 3.0, 0.6], dir: [0.15, 0.15, 1], to: 8.5, dur: Math.max(8, tott - checked) },
    { at: tott, move: "push", look: [0, 0.6, 0], dir: [0.2, 0.15, 1], from: 8.5, to: 7.6, dur: Math.max(8, already - tott) },
    { at: already, move: "pullback", look: [0, 1.0, 0], dir: [0.3, 0.2, 1], to: 8.6, dur: Math.max(12, end - already) },
  ]);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor={false} bloom={1} dof={0} blur={1} shadowBox={10} fog={{ color: "#05070f", near: 14, far: 38 }}>
        <Camera3D keys={keys} seed="v2221-checked" />
        {!under && (
          <group>
            <Ground />
            <Street lamps={1} />
            {/* sensors on the buildings */}
            {sensors > 0.02 && Array.from({ length: 18 }, (_, i) => (
              <mesh key={i} position={[-8 + i * 0.95 + 0.3 * rnd("sx", i), SURFACE + 0.6 + 1.6 * rnd("sy", i), -0.62]}
                material={glow(TECH.lime, q(sensors * (0.6 + 0.6 * m.pulse(buildings + 2 + (i % 6) * 3, 10))))}>
                <sphereGeometry args={[0.08, 10, 8]} />
              </mesh>
            ))}
            {/* rail lines in the street */}
            {[0.35, 0.6].map((z, i) => (
              <mesh key={i} position={[0, SURFACE + 0.11, z]} material={glow(TECH.cyan, q(0.05 + 1.2 * k01(f, railways, 8)))}><boxGeometry args={[30, 0.03, 0.04]} /></mesh>
            ))}
            {/* pipes under the street */}
            {[SURFACE - 0.35, SURFACE - 0.7].map((y, i) => (
              <group key={i}>
                <mesh position={[0, y, -0.9 + i * 0.3]} rotation-z={Math.PI / 2} material={mat("brushed", i ? "#6d7a86" : "#8a6a4a")}><cylinderGeometry args={[0.12, 0.12, 30, 14]} /></mesh>
                <mesh position={[0, y + 0.13, -0.9 + i * 0.3]} material={glow(TECH.amber, q(0.05 + 1.0 * k01(f, pipes + i * 3, 8)))}><boxGeometry args={[30, 0.02, 0.02]} /></mesh>
              </group>
            ))}
            {/* the monitoring screen over the street */}
            <group position={[1.2, SURFACE + 3.0, 0.6]} scale={0.6 + 0.4 * k01(f, checked - 6, 10)}>
              <Block size={[3.6, 2.3, 0.14]} radius={0.06} preset="blackPlastic" />
              <mesh position={[0, 0, 0.08]} material={glow("#0d2333", 1)}><planeGeometry args={[3.4, 2.1]} /></mesh>
              <mesh position={[1.25, -0.6, 0.1]} rotation-z={needle} material={glow(TECH.lime, 1.3)}><boxGeometry args={[0.04, 0.6, 0.01]} /></mesh>
            </group>
            <FigLabel3D fig={fig.assets ?? ""} caption="checked for movement" at={[1.0, SURFACE + 3.25, 0.8]} start={checked} count={18} px={100} color={TECH.amber} plate={false} />
          </group>
        )}
        {under && (
          <>
            <Station f={f} front={-5 + 4.6 * k01(f, already, 16)} northern={0.2 + 0.9 * k01(f, northern, 8)} spin={f * 0.05} />
            <Label3D at={[0, -0.4, 0.4]} offset={[0.2, -1.1, 0.4]} text="Northern line" start={northern} px={58} color={TECH.amber} align="center" />
            <Label3D at={[-1.2, NEW_Y + 1.0, 0]} offset={[-0.4, 0.9, 0.3]} text="Tottenham Court Road" start={tott + 2} end={already + 10} px={50} color={TECH.white} align="center" />
          </>
        )}
      </Stage3D>
    </Freeze>
  );
};
export default Checked;
