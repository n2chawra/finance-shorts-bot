// Key: "Turn the key, and the solenoid, an electromagnet on its back, snaps its plunger in."
// Close on an ignition slot in a dark dashboard, the key already in it. "Turn": the key turns; "key": a
// glowing current runs off along a wire; "solenoid": cut to the solenoid on the starter's back, cut open
// (medium), its label writing on; "electromagnet": the copper coil glows; "snaps": close, the plunger
// slams into the coil with a flash; "plunger": its label writes on.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Block, Camera3D, direct, glow, Label3D, mat, Stage3D, TECH } from "../../three/index";
import { BACK, Starter, k01, q } from "./Parts";

const Dash: React.FC<{ turn: number; current: number }> = ({ turn, current }) => (
  <group>
    <Block size={[6, 3, 0.5]} preset="blackPlastic" color="#16181e" position={[0, 0, -0.25]} radius={0.2} />
    {/* the instrument dials above the key */}
    {[-0.95, 0.95].map((x) => (
      <group key={x} position={[x, 1.25, 0.02]}>
        <mesh material={glow(TECH.cyan, q(0.35 + 0.6 * turn))}>
          <torusGeometry args={[0.62, 0.035, 8, 48]} />
        </mesh>
        <mesh position={[0, 0, 0.02]} rotation-z={0.9 - 2.2 * turn * (x > 0 ? 0.6 : 1)} material={glow(TECH.amber, 0.95)}>
          <boxGeometry args={[0.04, 0.95, 0.02]} />
        </mesh>
      </group>
    ))}
    {/* the ignition barrel */}
    <mesh rotation-x={Math.PI / 2} position={[0, 0, 0.06]} material={mat("brushed", "#b9bfca")}>
      <cylinderGeometry args={[0.42, 0.46, 0.12, 40]} />
    </mesh>
    {["OFF", "ON", "START"].map((t, i) => (
      <mesh key={t} position={[Math.cos(2.2 - i * 0.7) * 0.62, Math.sin(2.2 - i * 0.7) * 0.62, 0.05]} material={glow(i === 2 && turn > 0.8 ? TECH.amber : "#5a6070", 0.9)}>
        <sphereGeometry args={[0.05, 10, 8]} />
      </mesh>
    ))}
    {/* the steering wheel's rim, left */}
    <mesh position={[-2.3, 0.2, 0.6]} material={mat("rubber", "#2a2c33")}>
      <torusGeometry args={[1.5, 0.14, 16, 64]} />
    </mesh>
    {/* the key: a rounded head with a ring hole, a notched blade in the barrel */}
    <group position={[0, 0, 0.12]} rotation-z={-turn * 1.4}>
      <Block size={[0.14, 0.5, 0.05]} preset="aluminium" position={[0, 0.1, 0.03]} />
      {[0, 1, 2].map((i) => <Block key={i} size={[0.06, 0.08, 0.05]} preset="aluminium" position={[0.08, 0.05 + i * 0.12, 0.03]} />)}
      <mesh position={[0, 0.75, 0.1]} rotation-x={Math.PI / 2} material={mat("brushed", "#9aa1ad")}>
        <cylinderGeometry args={[0.42, 0.42, 0.14, 36]} />
      </mesh>
      <mesh position={[0, 0.95, 0.18]} material={mat("brushed", "#c9ced6")}>
        <torusGeometry args={[0.1, 0.03, 8, 24]} />
      </mesh>
    </group>
    {/* the wire off to the starter */}
    {Array.from({ length: 8 }, (_, i) => (
      <mesh key={i} position={[0.6 + i * 0.32, -0.55 - i * 0.05, 0.05]} material={current * 8 > i ? glow(TECH.amber, q(0.5 + 0.5 * current)) : mat("rubber", "#26282f")}>
        <boxGeometry args={[0.3, 0.06, 0.06]} />
      </mesh>
    ))}
  </group>
);

const Key: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const turn = m.at("turn", 2);
  const key = m.at("key", 8);
  const sol = m.at("solenoid", 22);
  const em = m.at("electromagnet", 40);
  const snaps = m.at("snaps", 58);
  const plunger = m.at("plunger", 70);
  const end = Math.max(m.end, plunger + 16);
  const inside = f >= sol;
  const keys = inside
    ? direct({}, [
        { at: sol, move: "push", look: [1.45, 0.5, 0], dir: [0.3, 0.35, 0.89], from: 3.6, to: 3.2, dur: Math.max(10, snaps - sol), fov: 40 },
        { at: snaps, move: "push", look: [1.2, 0.5, 0], dir: [0.25, 0.3, 0.92], to: 2.2, dur: Math.max(10, end - snaps) },
      ])
    : direct({}, [{ at: 0, move: "push", look: [-0.3, 0.4, 0], dir: [0.15, 0.1, 0.98], from: 5.0, to: 4.4, dur: Math.max(10, sol), fov: 40 }]);
  const engage = 0.15 * k01(f, em, 10) + 0.85 * k01(f, snaps, 5);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={BACK} floor={false} bloom={1} dof={0} blur={1} shadowBox={6} fog={{ color: "#05070f", near: 10, far: 30 }}>
        <Camera3D keys={keys} seed={inside ? "v2821-key-b" : "v2821-key-a"} />
        {!inside && <Dash turn={k01(f, turn, 8)} current={k01(f, key, 14)} />}
        {!inside && <Label3D at={[0, 0.9, 0.3]} offset={[-0.7, -0.45, 0.3]} text="ignition key" start={-20} px={58} color={TECH.white} align="center" />}
        {inside && (
          <group>
            <Starter engage={engage} coil={k01(f, em, 8)} see={1} spin={0} />
            <Label3D at={[1.3, 0.68, 0]} offset={[-0.3, 0.8, 0.2]} text="solenoid" sub={f >= em ? "an electromagnet" : undefined} start={sol + 2} end={plunger - 2} px={58} color={TECH.white} align="center" />
            <Label3D at={[0.8, 0.5, 0]} offset={[-0.4, 0.6, 0.3]} text="plunger" start={plunger} px={58} color={TECH.amber} align="center" />
            {f >= snaps && f < snaps + 10 && (
              <mesh position={[0.85, 0.5, 0]} material={glow(TECH.white, q(1 - (f - snaps) / 10))}>
                <sphereGeometry args={[0.12, 12, 10]} />
              </mesh>
            )}
          </group>
        )}
      </Stage3D>
    </Freeze>
  );
};
export default Key;
