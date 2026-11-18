// Water: "Those waves shake the water in food, and that shaking is heat. So he tried popcorn, and it popped."
// Inside a kernel among water molecules (close): waves sweep through and the molecules flip back and
// forth with them ("shake"); a label names one: water ("water"); they glow from blue to orange as they
// shake faster ("heat", medium); the camera pulls back: they sit inside a kernel on the bench beside the
// tube ("popcorn", wide); the kernel bursts into popcorn and the others pop around it ("popped").
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Label3D, Stage3D, TECH, rnd } from "../../three/index";
import { Kernel, Magnetron, Water, WaveRings, k01 } from "./Parts";

const GRID = 4;

const WaterBeat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const shake = m.at("shake", 10);
  const water = m.at("water", 30);
  const food = m.at("food", 44);
  const heat = m.at("heat", 60);
  const tried = m.at("tried", 90);
  const pop = m.at("popcorn", 110);
  const popped = m.at("popped", 140);
  const end = Math.max(m.end, popped + 24);
  const hk = k01(f, heat - 4, 20);
  const shrink = 0.25 * k01(f, tried, 12) + 0.75 * k01(f, pop - 2, 22);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 1.6, 0], dir: [0, 0.25, 1], from: 4.4, to: 3.8, dur: Math.max(8, heat), fov: 35 },
    { at: heat, move: "pullback", look: [0, 1.6, 0], dir: [0.1, 0.3, 1], to: 5.0, dur: Math.max(8, tried - heat) },
    { at: tried, move: "pullback", look: [0, 1.2, 0], dir: [0.12, 0.4, 1], to: 5.6, dur: Math.max(8, pop - tried) },
    { at: pop, move: "pullback", look: [0, 0.4, 0], dir: [0.15, 0.5, 1], to: 4.2, dur: 26 },
    { at: pop + 26, move: "push", look: [0, 0.35, 0], dir: [0.15, 0.5, 1], to: 3.6, dur: Math.max(10, end - pop - 26) },
  ]);
  const speed = 0.25 + 0.15 * k01(f, food, 10) + 0.5 * hk;
  const amp = (0.25 + 0.6 * hk) * k01(f, shake, 10);
  const pk = (i: number) => k01(f, popped + i * 5, 10);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#1b1020", bottom: "#06050a", glow: "rgba(255,140,60,0.12)" }} floor="reflect" bloom={1.1} dof={0} blur={1} shadowBox={3}>
        <Camera3D keys={keys} seed="v1901-water" />
        {/* the molecules, shrinking into the kernel on "popcorn" */}
        {shrink < 0.98 && (
          <group position={[0, 1.6 - 1.25 * shrink, 0]} scale={1 - 0.95 * shrink}>
            {Array.from({ length: GRID * GRID }, (_, i) => {
              const x = (i % GRID) - (GRID - 1) / 2, y = Math.floor(i / GRID) - (GRID - 1) / 2;
              const ph = rnd("wph", i) * 6;
              return (
                <Water key={i} position={[x * 0.75, y * 0.75, (rnd("wz", i) - 0.5) * 0.6]}
                  rotation-z={Math.sin(f * speed + ph) * amp * Math.PI} heat={Math.max(0, hk - rnd("wh", i) * 0.2)} />
              );
            })}
            <WaveRings f={f} start={shake - 6} every={9} reach={3} color="#ffd7a0" stop={pop} />
          </group>
        )}
        {/* the kernels on the bench, and the tube behind them */}
        {shrink > 0.02 && (
          <group scale={shrink}>
            <Kernel position={[0, 0.3, 0]} pop={pk(0)} />
            <Kernel position={[-0.7, 0.2, 0.3]} pop={pk(1)} />
            <Kernel position={[0.75, 0.2, 0.25]} pop={pk(2)} />
            <Kernel position={[-0.35, 0.18, 0.8]} pop={pk(3)} />
            <Kernel position={[0.4, 0.18, 0.8]} pop={pk(4)} />
            <Magnetron scale={0.6} position={[1.7, 0, -1.1]} heat={1} />
            <WaveRings f={f} start={pop} every={8} reach={2} position={[1.7, 0.9, -1.1]} rotation-y={-0.8} />
          </group>
        )}
        <Label3D at={[0.38, 1.6 + 0.38, 0]} offset={[0.5, 0.9, 0]} text="water" sub="in the food" start={water} end={pop} px={54} color={TECH.cyan} align="center" />
        <Label3D at={[0, 0.5, 0]} offset={[-0.4, 1.0, 0]} text="popcorn kernel" start={pop + 18} px={50} color={TECH.white} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default WaterBeat;
