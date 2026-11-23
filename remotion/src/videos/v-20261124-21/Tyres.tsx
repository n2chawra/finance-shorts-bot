// Tyres: "Under each car, fat tyres roll on two flat running tracks. They carry the weight and drive the train."
// The metro car stands on its track; on "Under" its body fades to glass over the lit bogies (medium);
// "car": the bogie frames glow cyan; "fat": the camera pushes in on the front bogie's four black tyres
// (close); "roll": they start turning, the track sliding under them; "flat": the two running tracks light up
// amber with a label; "running": a glow runs along them; "carry": weight arrows press down onto each tyre
// (medium); "weight": they pulse; "drive": the traction motor glows and the tyres spin faster (close);
// "train": the bogie surges forward.
import React from "react";
import { Freeze } from "remotion";
import type { SceneProps } from "../../scenes/kit";
import { motion } from "../../flat/kit";
import { Camera3D, direct, Label3D, Stage3D, TECH } from "../../three/index";
import { AXLES, BOGIES, DownArrow, MetroCar, TYRE_R, TYRE_Z, Track, k01 } from "./Parts";

const Tyres: React.FC<SceneProps> = (p) => {
  const m = motion(p);
  const f = m.t;
  const under = m.at("under", 2);
  const car = m.at("car", 14);
  const fat = m.at("fat", 26);
  const roll = m.at("roll", 40);
  const flat = m.at("flat", 56);
  const running = m.at("running", 66);
  const carry = m.at("carry", 110);
  const weight = m.at("weight", 126);
  const drive = m.at("drive", 150);
  const train = m.at("train", 170);
  const end = Math.max(m.end, train + 24);
  const bx = BOGIES[1]!;
  // distance the track has slid: rolls from "roll", faster from "drive"
  const sp = (a: number, v: number) => (f > a ? (f - a) * v : 0);
  const dist = sp(roll, 0.05) + sp(drive, 0.07) + sp(train, 0.05);
  const keys = direct({}, [
    { at: 0, move: "push", look: [bx - 0.6, 1.0, 0], dir: [0.45, 0.3, 1], from: 8.2, to: 7.0, dur: Math.max(8, fat), fov: 35 },
    { at: fat, move: "push", look: [bx, 0.35, 0.3], dir: [0.5, 0.4, 1], to: 3.6, dur: Math.max(8, carry - fat) },
    { at: carry, move: "pullback", look: [bx, 0.6, 0], dir: [0.4, 0.45, 1], to: 5.2, dur: Math.max(8, drive - carry) },
    { at: drive, move: "push", look: [bx, 0.4, 0.2], dir: [0.6, 0.3, 1], to: 3.0, dur: Math.max(10, end - drive) },
  ]);
  const see = k01(f, under, 12);
  const surge = k01(f, train, 14) * 0.25 - 0.25 * k01(f, train + 14, 20);
  return (
    <Freeze frame={f}>
      <Stage3D backdrop={{ top: "#101a33", bottom: "#04050b", glow: "rgba(56,225,255,0.10)" }} floor={false} bloom={1.1} dof={0} blur={1} shadowBox={5}>
        <Camera3D keys={keys} seed="v2421-tyres" />
        <Track length={30} offset={-dist} runLit={k01(f, flat, 8)} sweep={k01(f, running, 26)} />
        <group position={[surge, 0, 0]}>
          <MetroCar see={see} spin={dist / TYRE_R} cab
            bogie={{ frameLit: k01(f, car, 8) * (1 - 0.6 * k01(f, carry, 10)), motorLit: k01(f, drive, 8), steelDim: 1 }} />
          {AXLES.map((ax) => [1, -1].map((s) => (
            <DownArrow key={`${ax}${s}`} position={[bx + ax, TYRE_R * 2 + 0.05, s * TYRE_Z]} k={k01(f, carry, 10)} len={0.5 + 0.12 * m.pulse(weight + 3, 8)} />
          )))}
        </group>
        <pointLight position={[bx + 2, 1.6, 3]} intensity={12} color="#dfe8ff" distance={10} />
        <Label3D at={[bx - 1.6, 0.0, TYRE_Z]} offset={[-0.2, 0.9, 0.4]} text="running track" start={flat + 3} end={carry} px={54} color={TECH.amber} align="center" />
        <Label3D at={[bx, 0.25, 0]} offset={[0.2, 1.1, 0.6]} text="motor" start={drive + 4} px={52} color={TECH.amber} align="center" />
      </Stage3D>
    </Freeze>
  );
};
export default Tyres;
