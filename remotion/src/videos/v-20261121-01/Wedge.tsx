// Wedge: "Brattain wrapped gold foil around a plastic wedge and slit the gold at its tip with a razor."
// Close on the bench: a clear plastic triangle on a small stand, point down (medium). "wrapped": a gold
// strip lifts off the roll; "gold": the foil wraps up both lower faces from the point; "plastic": the
// clear wedge catches the lamp, a label writes on (close); "slit": a razor blade swings in over the
// tip; "tip": the camera dives to the point; "razor": the blade cuts and the gold parts into two strips.
import React from "react";
import { Easing, Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, cue, direct, glow, Label3D, mat, Stage3D, TECH } from "../../three/index";
import { Bench, Wedge, k01 } from "./Parts";

const W_AT: [number, number, number] = [0, 0.55, 0.2];

const WedgeBeat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const wrapped = m.at("wrapped", 4);
  const gold = m.at("gold", 14);
  const plastic = m.at("plastic", 40);
  const slit = m.at("slit", 60);
  const tip = m.at("tip", 80);
  const razor = m.at("razor", 100);
  const around = m.at("around", 24);
  const end = Math.max(m.end, razor + 20);
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 0.75, 0.2], dir: [0.3, 0.25, 1], from: 3.2, to: 2.7, dur: Math.max(8, plastic), fov: 35 },
    { at: plastic, move: "push", look: [0, 0.7, 0.2], dir: [-0.25, 0.2, 1], to: 1.9, dur: Math.max(8, tip - plastic) },
    { at: tip, move: "dive", look: [0, 0.57, 0.2], dir: [0.15, 0.15, 1], to: 0.75, dur: 18 },
    { at: tip + 18, move: "push", look: [0, 0.57, 0.2], dir: [0.15, 0.15, 1], to: 0.65, dur: Math.max(10, end - tip - 18) },
  ]);
  const swing = cue(f, slit - 2, 16, Easing.out(Easing.cubic));
  const cutK = k01(f, razor, 8);
  const bx = 0.6 * (1 - swing) - 0.12 * cutK;
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#141d33", bottom: "#05060b", glow: "rgba(255,196,90,0.14)" }} floor={false} bloom={1.1} dof={0} blur={1} shadowBox={3}
       >
        <Camera3D keys={keys} seed="v2101-wedge" />
        <Bench lamp={1} f={f} />
        {/* the stand holding the wedge point down */}
        <mesh position={[0, 0.2, 0.2]} material={mat("brushed", "#7b828d")}><boxGeometry args={[0.6, 0.06, 0.4]} /></mesh>
        <mesh position={[-0.27, 0.6, 0.2]} material={mat("brushed", "#7b828d")}><boxGeometry args={[0.04, 0.8, 0.04]} /></mesh>
        <mesh position={[0.27, 0.6, 0.2]} material={mat("brushed", "#7b828d")}><boxGeometry args={[0.04, 0.8, 0.04]} /></mesh>
        <mesh position={[0, 1.0, 0.2]} material={mat("brushed", "#7b828d")}><boxGeometry args={[0.6, 0.04, 0.04]} /></mesh>
        <Wedge position={W_AT} wrap={0.05 + 0.95 * k01(f, gold, 22)} slit={cutK} lit={0.15 + 0.3 * m.pulse(around + 3, 8) + 0.3 * m.pulse(plastic + 3, 10) + 0.5 * m.pulse(razor + 4, 10)} rotation-y={0.25} />
        {/* the gold strip peeling off its roll on "wrapped" */}
        {f >= wrapped && f < gold + 10 && (
          <mesh position={[-0.9 + 0.5 * k01(f, wrapped, 12), 0.3 + 0.2 * k01(f, wrapped, 12), 0.25]} rotation-z={0.6 * k01(f, wrapped, 12)} material={mat("gold")}>
            <boxGeometry args={[0.5, 0.01, 0.09]} />
          </mesh>
        )}
        {/* the razor blade */}
        {swing > 0 && (
          <group position={[bx, 0.585, 0.3]} rotation-z={-0.2}>
            <mesh material={mat("brushed", "#e2e6ee")}><boxGeometry args={[0.3, 0.12, 0.006]} /></mesh>
            <mesh position={[-0.15, 0, 0]} material={glow(TECH.cyan, 0.6)}><boxGeometry args={[0.004, 0.12, 0.008]} /></mesh>
          </group>
        )}
        {cutK > 0.1 && cutK < 0.95 && <pointLight position={[0, 0.57, 0.35]} intensity={6} distance={1} color="#fff6d8" />}
        <Label3D at={[0.15, 0.85, 0.2]} offset={[0.45, 0.35, 0]} text="plastic wedge" start={plastic} end={tip} px={52} color={TECH.white} />
        <Label3D at={[0.1, 0.62, 0.2]} offset={[-0.35, 0.3, 0]} text="gold foil" start={gold + 6} end={plastic} px={52} color={TECH.amber} />
        <Label3D at={[0, 0.56, 0.2]} offset={[0.18, -0.16, 0]} text="two contacts" start={razor + 8} px={48} color={TECH.amber} />
      </Stage3D>
    </Freeze>
  );
};
export default WedgeBeat;
