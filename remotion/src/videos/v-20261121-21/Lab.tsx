// Lab: "In {fact1}, John Bardeen and Walter Brattain built it by hand."
// Bell Labs on a winter evening: a bench under a desk lamp, a shelf of instruments (wide). "In": the
// year writes onto the wall calendar; "John": the Bell Labs sign
// lights; "Bardeen" / "Brattain": a name plate slides out for each (medium); "built": tweezers, a razor
// and a roll of gold foil roll onto the bench; "hand": close on the tweezers by the empty stand.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion, SourceLine } from "../../flat/kit";
import { Camera3D, direct, FigLabel3D, Label3D, mat, Stage3D, TECH } from "../../three/index";
import { Bench, Calendar, Plate, Tools, k01 } from "./Parts";

type Params = { fig?: { year?: string } };

const LabBeat: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const inW = m.at("in", 2);
  const john = m.at("john", 26);
  const walter = m.at("walter", 46);
  const lab = Math.max(m.at("hand", 90) + 16, 100);
  const bardeen = m.at("bardeen", 30);
  const brattain = m.at("brattain", 50);
  const built = m.at("built", 70);
  const hand = m.at("hand", 90);
  const end = Math.max(m.end, lab + 20);
  const year = (p.beat.params as Params).fig?.year ?? "";
  const keys = direct({}, [
    { at: 0, move: "push", look: [0, 0.9, -0.3], dir: [0.1, 0.3, 1], from: 6.4, to: 5.6, dur: Math.max(8, bardeen), fov: 35 },
    { at: bardeen, move: "push", look: [0.2, 0.3, 0.3], dir: [0.15, 0.45, 1], to: 3.4, dur: Math.max(8, hand - bardeen) },
    { at: hand, move: "push", look: [0.2, 0.08, 0.35], dir: [0.3, 0.6, 1], to: 1.9, dur: Math.max(8, lab - hand) },
    { at: lab, move: "pullback", look: [0, 0.7, -0.2], dir: [-0.2, 0.35, 1], to: 4.6, dur: Math.max(10, end - lab) },
  ]);
  const slide1 = k01(f, bardeen - 2, 10);
  const slide2 = k01(f, brattain - 2, 10);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#14203a", bottom: "#05070c", glow: "rgba(255,184,74,0.12)" }} floor={false} bloom={1} dof={0} blur={1} shadowBox={4}
        overlay={<SourceLine p={p} />}>
        <Camera3D keys={keys} seed="v2101-lab" />
        <Bench lamp={0.4 + 0.3 * k01(f, 0, 12) + 0.3 * k01(f, walter, 8)} f={f} />
        <Calendar position={[-1.25, 1.0, -1.1]} flip={k01(f, inW, 12)} />
        <FigLabel3D fig={year} at={[-1.25, 1.0, -1.0]} start={inW + 4} count={0} px={Math.round(96 + 14 * m.pulse(inW + 8, 8))} />
        <Plate position={[0.3, 1.2, -1.1]} w={1.6} h={0.36} lit={0.2 + 0.8 * k01(f, john, 8)} />
        <Label3D at={[0.3, 1.2, -1.08]} offset={[0, 0, 0.05]} text="Bell Labs" start={john} px={56} color={TECH.white} align="center" />
        {/* two name plates sliding out on the bench */}
        <group position={[-0.6 - 0.8 * (1 - slide1), 0.06, 0.55]} rotation-x={-0.6}>
          <mesh material={mat("glossy", "#1b222e")}><boxGeometry args={[0.7, 0.14, 0.03]} /></mesh>
        </group>
        <group position={[0.95 + 0.8 * (1 - slide2), 0.06, 0.55]} rotation-x={-0.6}>
          <mesh material={mat("glossy", "#1b222e")}><boxGeometry args={[0.7, 0.14, 0.03]} /></mesh>
        </group>
        <Label3D at={[-0.6, 0.12, 0.55]} offset={[-0.3, 0.55, 0]} text="John Bardeen" start={bardeen + 4} px={50} color={TECH.white} align="center" />
        <Label3D at={[0.95, 0.12, 0.55]} offset={[0.3, 0.75, 0]} text="Walter Brattain" start={brattain + 4} px={50} color={TECH.white} align="center" />
        {/* the empty stand where the device will be, and the tools */}
        <mesh position={[0.2, 0.08, 0.05]} material={mat("brushed", "#8f96a3")} castShadow><boxGeometry args={[0.5, 0.16, 0.5]} /></mesh>
        <Tools position={[0.1, 0, 0.3]} roll={k01(f, built, 16)} />
      </Stage3D>
    </Freeze>
  );
};
export default LabBeat;
